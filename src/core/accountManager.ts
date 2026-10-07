/**
 * AccountManager — порт Android data/AccountManager.kt (мультиаккаунт).
 *
 * Лимиты: до 5 аккаунтов (Free), до 10 (PRO).
 * Аккаунты — таблица accounts (Room → core/db); токены каждого аккаунта
 * (включая refresh) — Keychain-запись UserSession.persistAccountTokensFor
 * (на Android — системный android.accounts.AccountManager).
 *
 * Перенесены все исправления Android:
 *   • 2026-07-12: refresh-токен аккаунта сохраняется при добавлении и читается
 *     при переключении (иначе выкидывало на вход после истечения access-токена)
 *   • 2026-07-12: при переключении сокет переподключается под новым аккаунтом
 *   • 2026-07-20: E2EE сбрасывается и переключается на ключи нового аккаунта
 *   • 2026-08-18: все кеши с ownerId — данные аккаунтов не смешиваются
 *   • syncActiveAccountToken: ротация токена обновляет запись свичера
 */
import { create } from 'zustand';
import { AppDatabase, newAccountEntity, type AccountEntity } from './db';
import { UserSession, onTokensUpdated } from './session';

export const MAX_ACCOUNTS_FREE = 5;
export const MAX_ACCOUNTS_PRO = 10;

interface AccountsState {
  accounts: AccountEntity[];
  activeAccount: AccountEntity | null;
}

/** Реактивное состояние для UI свичера (аналог StateFlow accounts/activeAccount). */
export const useAccountsStore = create<AccountsState>(() => ({ accounts: [], activeAccount: null }));

/** Хуки переключения аккаунта: сокет, папки чатов, E2EE и т.д. регистрируются сами. */
type SwitchHook = (userId: number) => Promise<void> | void;
const switchHooks: SwitchHook[] = [];
export function onAccountSwitched(h: SwitchHook): void {
  switchHooks.push(h);
}

async function loadAccounts(): Promise<void> {
  const list = await AppDatabase.accountDao().getAllAccounts();
  useAccountsStore.setState({
    accounts: list,
    activeAccount: list.find((a) => a.isActive) ?? list[0] ?? null,
  });
}

export const AccountManager = {
  async init(): Promise<void> {
    await loadAccounts();
    // Обновление со старой версии: сессия есть, а в свичере пусто
    if (useAccountsStore.getState().accounts.length === 0 && UserSession.isLoggedIn) {
      await AccountManager.saveCurrentSessionAsAccount();
    }
  },

  get accounts(): AccountEntity[] {
    return useAccountsStore.getState().accounts;
  },
  get activeAccount(): AccountEntity | null {
    return useAccountsStore.getState().activeAccount;
  },

  getMaxAccounts(): number {
    return UserSession.isPro > 0 ? MAX_ACCOUNTS_PRO : MAX_ACCOUNTS_FREE;
  },
  canAddAccount(): boolean {
    return AccountManager.accounts.length + 1 <= AccountManager.getMaxAccounts();
  },
  getAccountCount(): number {
    return AccountManager.accounts.length;
  },

  /** Сохранить текущую сессию как активный аккаунт (после входа). */
  async saveCurrentSessionAsAccount(): Promise<void> {
    const token = UserSession.accessToken;
    if (!token || !UserSession.isLoggedIn) return;
    await AppDatabase.accountDao().clearAllActive();
    await AppDatabase.accountDao().insertAccount(
      newAccountEntity({
        userId: UserSession.userId,
        accessToken: token,
        username: UserSession.username,
        avatar: UserSession.avatar,
        isPro: UserSession.isPro,
        isActive: true,
      }),
    );
    await loadAccounts();
  },

  /** Добавить/обновить аккаунт, не переключаясь на него. false — лимит. */
  async addOrUpdateAccount(
    userId: number,
    token: string,
    username: string | null,
    avatar: string | null,
    isPro: number,
    refreshToken: string | null = null,
    tokenExpiresAt = 0,
  ): Promise<boolean> {
    const exists = AccountManager.accounts.some((a) => a.userId === userId);
    if (!exists && AccountManager.accounts.length >= AccountManager.getMaxAccounts()) return false;
    await AppDatabase.accountDao().insertAccount(
      newAccountEntity({ userId, accessToken: token, username, avatar, isPro, isActive: false }),
    );
    if (refreshToken) {
      await UserSession.persistAccountTokensFor(userId, token, refreshToken, tokenExpiresAt, username);
    }
    await loadAccounts();
    return true;
  },

  /** Переключиться на аккаунт: сохранить текущий, загрузить выбранный. */
  async switchAccount(userId: number, onComplete?: () => void): Promise<void> {
    const dao = AppDatabase.accountDao();
    const current = UserSession.userId;
    if (current > 0 && UserSession.isLoggedIn) {
      await dao.updateAccount(current, UserSession.accessToken ?? '', UserSession.username, UserSession.avatar, UserSession.isPro);
    }
    await dao.clearAllActive();
    await dao.setActiveAccount(userId);
    const target = await dao.getAccountById(userId);
    if (!target) return;

    const stored = await UserSession.peekStoredTokens(userId);
    await UserSession.saveSession({
      // Запись Keychain свежее строки БД, если токен ротировался в фоне
      token: stored.accessToken ?? target.accessToken,
      id: target.userId,
      username: target.username,
      avatar: target.avatar,
      isPro: target.isPro,
      refreshToken: stored.refreshToken,
      tokenExpiresAt: stored.tokenExpiresAt,
    });

    // E2EE: ключи нового аккаунта + сброс кешей (Android E2EEService.resetForAccountSwitch)
    const [{ setE2EEAccount }, svc] = await Promise.all([
      import('../crypto/e2ee/e2eeStore'),
      import('../crypto/e2ee/e2eeService'),
    ]);
    await setE2EEAccount(userId);
    try {
      svc.getE2EE().resetForAccountSwitch();
    } catch {
      /* ещё не инициализирован */
    }

    // Сокет под новым токеном (Android MessageNotificationService.reloadSessionForAccountSwitch)
    const { socketService } = await import('../services/socketService');
    socketService.disconnect();
    socketService.connect(UserSession.accessToken ?? '', String(userId));

    for (const h of switchHooks) await h(userId);
    await loadAccounts();
    onComplete?.();
  },

  /** Удалить аккаунт из свичера; если активный — переключиться или выйти. */
  async removeAccount(userId: number): Promise<void> {
    const wasActive = AccountManager.activeAccount?.userId === userId;
    await AppDatabase.accountDao().deleteAccountById(userId);
    await UserSession.forgetAccountTokens(userId);
    await loadAccounts();
    if (wasActive) {
      const remaining = AccountManager.accounts.filter((a) => a.userId !== userId);
      if (remaining.length) {
        await AccountManager.switchAccount(remaining[0].userId);
      } else {
        await AccountManager.wipeAllLocalDataForLogout();
        await UserSession.clearSession();
      }
    }
  },

  /**
   * Полная очистка локальных данных при явном «Выйти» / «Удалить аккаунт»
   * (Android wipeAllLocalDataForLogout): кеш сообщений, расшифрованный
   * plaintext, черновики, кеш чатов/каналов, все аккаунты свичера.
   *
   * ⚠️ Отличие от Android — ОСОЗНАННОЕ: ключи E2EE здесь НЕ стираются.
   * На Android именно wipeForLogout() 27.07.2026 уничтожил identity-ключ и
   * всю историю владельца. Стереть ключи — только явным пунктом в настройках
   * безопасности (wipeAllE2EEKeys). Вызывать ДО UserSession.clearSession().
   */
  async wipeAllLocalDataForLogout(): Promise<void> {
    for (const h of logoutHooks) {
      try {
        await h();
      } catch {
        /* снятие push-токена и т.п. — не должно ломать выход (офлайн) */
      }
    }
    for (const a of AccountManager.accounts) await UserSession.forgetAccountTokens(a.userId);
    await AppDatabase.messageDao().clearAllCache();
    await AppDatabase.signalPlaintextCacheDao().clearAll();
    await AppDatabase.draftDao().deleteAll();
    await AppDatabase.chatListDao().clearAll();
    await AppDatabase.channelDao().clearChannels();
    await AppDatabase.channelDao().clearChannelPosts();
    await AppDatabase.chatWallpaperDao().deleteAll();
    await AppDatabase.accountDao().deleteAll();
    useAccountsStore.setState({ accounts: [], activeAccount: null });
  },

  /** Ротация токена активного аккаунта → запись свичера (иначе возврат на аккаунт с мёртвым токеном). */
  syncActiveAccountToken(userId: number, token: string): void {
    if (userId <= 0 || !token) return;
    void AppDatabase.accountDao()
      .updateAccount(userId, token, UserSession.username, UserSession.avatar, UserSession.isPro)
      .then(loadAccounts)
      .catch(() => {});
  },

  /** isPro текущего аккаунта (после синхронизации подписки). */
  refreshCurrentAccountProStatus(isPro: number): void {
    const uid = UserSession.userId;
    if (uid <= 0) return;
    void AppDatabase.accountDao()
      .updateAccount(uid, UserSession.accessToken ?? '', UserSession.username, UserSession.avatar, isPro)
      .then(loadAccounts)
      .catch(() => {});
  },
};

/** Хуки полного выхода (снятие push-токена с сервера и т.п.). */
const logoutHooks: Array<() => Promise<void> | void> = [];
export function onLogoutWipe(h: () => Promise<void> | void): void {
  logoutHooks.push(h);
}

onTokensUpdated((uid, token) => AccountManager.syncActiveAccountToken(uid, token));
