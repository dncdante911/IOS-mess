/**
 * UserSession — порт Android data/UserSession.kt.
 *
 * Синхронный фасад над сессией: интерсепторы и код, перенесённый с Android,
 * читают UserSession.accessToken / userId / isPro … без await. Значения
 * загружаются в память при старте (hydrate()) и пишутся сквозь на диск.
 *
 * Где лежит (аналоги Android):
 *   EncryptedSharedPreferences   → Keychain (токены, user_id) — ключи те же,
 *                                  что у services/storageService, чтобы старые
 *                                  установки не разлогинились
 *   plaintext backup prefs       → не нужен: Keychain не «портится» как ESP
 *   android.accounts.AccountManager (токены КАЖДОГО аккаунта свичера)
 *                                → Keychain-запись wm_acct_<uid>
 *   прочие поля профиля          → core/platform/kv
 *
 * Время истечения токена хранится в МИЛЛИСЕКУНДАХ (на Android — секунды);
 * isTokenExpiringSoon учитывает это.
 */
import { useSyncExternalStore } from 'react';
import * as SecureStore from 'expo-secure-store';
import { kv } from './platform/kv';
import { setTokenRefresher } from './api';

const SECURE = { keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY };

// Keychain — совпадают с services/storageService.ts
const KEY_ACCESS_TOKEN = 'wm_access_token';
const KEY_REFRESH_TOKEN = 'wm_refresh_token';
const KEY_TOKEN_EXPIRES_AT = 'wm_token_expires_at';
const KEY_USER_ID = 'wm_user_id';
const acctKey = (uid: number) => `wm_acct_${uid}`;

// KV — поля профиля (имена как в Android UserSession)
const KV = {
  username: 'us_username',
  avatar: 'us_avatar',
  isPro: 'us_is_pro',
  proType: 'us_pro_type',
  proExpiresAt: 'us_pro_expires_at',
  registeredAt: 'us_registered_at',
  statusEmoji: 'us_status_emoji',
  statusText: 'us_status_text',
  starsBalance: 'us_stars_balance',
} as const;

export interface StoredTokens {
  accessToken: string | null;
  refreshToken: string | null;
  tokenExpiresAt: number;
  username: string | null;
}

export type Field = 'accessToken' | 'avatar' | 'starsBalance' | 'statusEmoji' | 'statusText' | 'session';
type Listener = () => void;

const state = {
  accessToken: null as string | null,
  refreshToken: null as string | null,
  tokenExpiresAt: 0,
  userId: 0,
};
const listeners = new Map<Field, Set<Listener>>();
let refreshInFlight: Promise<string | null> | null = null;

function fire(...fields: Field[]): void {
  for (const f of fields) listeners.get(f)?.forEach((l) => l());
}

function sset(key: string, value: string | null): Promise<void> {
  return value === null
    ? SecureStore.deleteItemAsync(key, SECURE).catch(() => {})
    : SecureStore.setItemAsync(key, value, SECURE).catch(() => {});
}

async function sget(key: string): Promise<string | null> {
  try {
    // Старые записи storageService сохранены без keychainAccessible — читаем
    // сначала с опциями, затем без (иначе апгрейд разлогинил бы пользователя).
    return (await SecureStore.getItemAsync(key, SECURE)) ?? (await SecureStore.getItemAsync(key));
  } catch {
    return null;
  }
}

const num = (k: string, d = 0) => Number(kv.getItem(k) ?? d) || d;

export const UserSession = {
  // ── Загрузка ────────────────────────────────────────────────────────────────
  /** Вызвать при старте приложения после hydrateKv(). */
  async hydrate(): Promise<void> {
    const [at, rt, exp, uid] = await Promise.all([
      sget(KEY_ACCESS_TOKEN),
      sget(KEY_REFRESH_TOKEN),
      sget(KEY_TOKEN_EXPIRES_AT),
      sget(KEY_USER_ID),
    ]);
    state.accessToken = at;
    state.refreshToken = rt;
    state.tokenExpiresAt = Number(exp ?? 0) || 0;
    state.userId = Number(uid ?? 0) || 0;
    fire('session', 'accessToken');
  },

  // ── Поля сессии ─────────────────────────────────────────────────────────────
  get accessToken(): string | null {
    return state.accessToken;
  },
  get refreshToken(): string | null {
    return state.refreshToken;
  },
  get tokenExpiresAt(): number {
    return state.tokenExpiresAt;
  },
  get isTokenExpiringSoon(): boolean {
    if (!state.tokenExpiresAt) return false;
    return state.tokenExpiresAt - Date.now() < 60_000;
  },
  get userId(): number {
    return state.userId;
  },
  get isLoggedIn(): boolean {
    return !!state.accessToken && state.userId > 0;
  },

  get username(): string | null {
    return kv.getItem(KV.username);
  },
  set username(v: string | null) {
    v === null ? kv.removeItem(KV.username) : kv.setItem(KV.username, v);
  },
  get avatar(): string | null {
    return kv.getItem(KV.avatar);
  },
  set avatar(v: string | null) {
    v === null ? kv.removeItem(KV.avatar) : kv.setItem(KV.avatar, v);
    fire('avatar');
  },
  get isPro(): number {
    return num(KV.isPro);
  },
  get proType(): number {
    return num(KV.proType);
  },
  get proExpiresAt(): number {
    return num(KV.proExpiresAt);
  },
  get isProActive(): boolean {
    const exp = UserSession.proExpiresAt;
    return UserSession.isPro > 0 && (exp === 0 || exp > Date.now());
  },
  get registeredAt(): number {
    return num(KV.registeredAt);
  },
  /** Новый пользователь — первые 5 дней (Android: isNewUser). */
  get isNewUser(): boolean {
    const ts = UserSession.registeredAt;
    return ts > 0 && Date.now() - ts < 5 * 24 * 60 * 60 * 1000;
  },
  /** Анимированный фон: PRO или первые 5 дней. */
  get canUseAnimatedBackground(): boolean {
    return UserSession.isProActive || UserSession.isNewUser;
  },
  get statusEmoji(): string | null {
    return kv.getItem(KV.statusEmoji);
  },
  set statusEmoji(v: string | null) {
    v === null ? kv.removeItem(KV.statusEmoji) : kv.setItem(KV.statusEmoji, v);
    fire('statusEmoji');
  },
  get statusText(): string | null {
    return kv.getItem(KV.statusText);
  },
  set statusText(v: string | null) {
    v === null ? kv.removeItem(KV.statusText) : kv.setItem(KV.statusText, v);
    fire('statusText');
  },
  get starsBalance(): number {
    return num(KV.starsBalance);
  },
  set starsBalance(v: number) {
    kv.setItem(KV.starsBalance, String(v));
    fire('starsBalance');
  },

  /** Подписка на изменение поля (аналог StateFlow: avatarFlow, starsBalanceFlow…). */
  subscribe(field: Field, l: Listener): () => void {
    if (!listeners.has(field)) listeners.set(field, new Set());
    listeners.get(field)!.add(l);
    return () => listeners.get(field)?.delete(l);
  },

  // ── Запись ──────────────────────────────────────────────────────────────────
  /**
   * Полное сохранение после входа/регистрации/переключения аккаунта —
   * единственная точка, через которую проходят ВСЕ способы входа
   * (как на Android, где тут же регистрируется push-токен).
   */
  async saveSession(p: {
    token: string;
    id: number | string;
    username?: string | null;
    avatar?: string | null;
    isPro?: number;
    proType?: number;
    proExpiresAt?: number;
    refreshToken?: string | null;
    tokenExpiresAt?: number;
  }): Promise<void> {
    const id = Number(p.id) || 0;
    if (!kv.getItem(KV.registeredAt)) kv.setItem(KV.registeredAt, String(Date.now()));
    state.accessToken = p.token;
    state.refreshToken = p.refreshToken ?? null;
    state.tokenExpiresAt = p.tokenExpiresAt ?? 0;
    state.userId = id;
    await UserSession.persistAccountTokensFor(id, p.token, p.refreshToken ?? null, p.tokenExpiresAt ?? 0, p.username ?? null);
    await Promise.all([
      sset(KEY_ACCESS_TOKEN, p.token),
      sset(KEY_REFRESH_TOKEN, p.refreshToken ?? null),
      sset(KEY_TOKEN_EXPIRES_AT, String(p.tokenExpiresAt ?? 0)),
      sset(KEY_USER_ID, String(id)),
    ]);
    UserSession.username = p.username ?? null;
    UserSession.avatar = p.avatar ?? null;
    kv.setItem(KV.isPro, String(p.isPro ?? 0));
    kv.setItem(KV.proType, String(p.proType ?? 0));
    kv.setItem(KV.proExpiresAt, String(p.proExpiresAt ?? 0));
    fire('session', 'accessToken');
    for (const h of saveHooks) {
      try {
        h();
      } catch {
        /* хук (push-токен и т.п.) не должен ломать вход */
      }
    }
  },

  /** Ротация токенов (из refresh) — пишет и в запись аккаунта свичера. */
  async updateTokens(accessToken: string, refreshToken: string, expiresAt: number): Promise<void> {
    state.accessToken = accessToken;
    state.refreshToken = refreshToken;
    state.tokenExpiresAt = expiresAt;
    await Promise.all([
      sset(KEY_ACCESS_TOKEN, accessToken),
      sset(KEY_REFRESH_TOKEN, refreshToken),
      sset(KEY_TOKEN_EXPIRES_AT, String(expiresAt)),
      // Только запись ЭТОГО аккаунта (Android-баг 2026-07-12: refresh затирал токены всех аккаунтов)
      UserSession.persistAccountTokensFor(state.userId, accessToken, refreshToken, expiresAt, UserSession.username),
    ]);
    fire('accessToken');
    for (const h of tokenHooks) h(state.userId, accessToken);
  },

  updateProStatus(isPro: number, proType = 0, proExpiresAt = 0): void {
    kv.setItem(KV.isPro, String(isPro));
    kv.setItem(KV.proType, String(proType));
    kv.setItem(KV.proExpiresAt, String(proExpiresAt));
  },

  /** Токены конкретного аккаунта без переключения сессии (Android: peekStoredTokens). */
  async peekStoredTokens(uid: number): Promise<StoredTokens> {
    const raw = await sget(acctKey(uid));
    if (!raw) return { accessToken: null, refreshToken: null, tokenExpiresAt: 0, username: null };
    try {
      return JSON.parse(raw) as StoredTokens;
    } catch {
      return { accessToken: null, refreshToken: null, tokenExpiresAt: 0, username: null };
    }
  },

  /** Сохранить токены аккаунта (Android: persistAccountManagerTokensFor). */
  async persistAccountTokensFor(
    uid: number,
    accessToken: string,
    refreshToken: string | null,
    tokenExpiresAt: number,
    username: string | null,
  ): Promise<void> {
    if (uid <= 0) return;
    const prev = await UserSession.peekStoredTokens(uid);
    const v: StoredTokens = {
      accessToken,
      refreshToken: refreshToken ?? prev.refreshToken,
      tokenExpiresAt,
      username: username ?? prev.username,
    };
    await sset(acctKey(uid), JSON.stringify(v));
  },

  async forgetAccountTokens(uid: number): Promise<void> {
    await sset(acctKey(uid), null);
  },

  /**
   * Стирает активную сессию. Отпечаток устройства (deviceService) не трогается —
   * он идентифицирует устройство, а не аккаунт.
   */
  async clearSession(): Promise<void> {
    state.accessToken = null;
    state.refreshToken = null;
    state.tokenExpiresAt = 0;
    state.userId = 0;
    await Promise.all([
      sset(KEY_ACCESS_TOKEN, null),
      sset(KEY_REFRESH_TOKEN, null),
      sset(KEY_TOKEN_EXPIRES_AT, null),
      sset(KEY_USER_ID, null),
    ]);
    for (const k of Object.values(KV)) if (k !== KV.registeredAt) kv.removeItem(k);
    fire('session', 'accessToken', 'avatar', 'starsBalance', 'statusEmoji', 'statusText');
  },

  /**
   * Одно обновление токена на всех (axios, core/api, core/android).
   * null — сессия умерла: всё очищено, навигации отправлен AUTH_FAILURE_EVENT.
   */
  refresh(): Promise<string | null> {
    if (!refreshInFlight) {
      refreshInFlight = (async () => {
        try {
          const rt = state.refreshToken ?? (await sget(KEY_REFRESH_TOKEN));
          if (!rt) throw new Error('No refresh token');
          const { refreshTokens } = await import('../api/authApi');
          const res = await refreshTokens(rt);
          await UserSession.updateTokens(res.accessToken, res.refreshToken, res.expiresAtMs);
          return res.accessToken;
        } catch {
          const { storageService } = await import('../services/storageService');
          await storageService.clearAll();
          await UserSession.clearSession();
          const { authEventBus, AUTH_FAILURE_EVENT } = await import('../api/apiClient');
          authEventBus.emit(AUTH_FAILURE_EVENT);
          return null;
        } finally {
          refreshInFlight = null;
        }
      })();
    }
    return refreshInFlight;
  },

  // ── Совместимость с первой версией core/session ─────────────────────────────
  /** @deprecated используйте saveSession() */
  set(token: string | null, uid?: number | string): void {
    state.accessToken = token;
    if (uid !== undefined) state.userId = Number(uid) || 0;
    fire('accessToken');
  },
  /** @deprecated используйте clearSession() */
  clear(): void {
    void UserSession.clearSession();
  },
  onTokenChanged(l: (token: string | null) => void): () => void {
    return UserSession.subscribe('accessToken', () => l(state.accessToken));
  },
};

/** Хуки после saveSession (регистрация push-токена и т.п.). */
const saveHooks: Array<() => void> = [];
export function onSessionSaved(h: () => void): void {
  saveHooks.push(h);
}

/** Хуки после ротации токена (AccountManager.syncActiveAccountToken). */
const tokenHooks: Array<(uid: number, token: string) => void> = [];
export function onTokensUpdated(h: (uid: number, token: string) => void): void {
  tokenHooks.push(h);
}

/** Старое имя — используется в core/android/retrofit и др. */
export const Session = UserSession;

setTokenRefresher(() => UserSession.refresh());

/**
 * React-подписка на поле сессии — аналог `UserSession.avatarFlow.collectAsState()`.
 * read должен возвращать примитив/стабильную ссылку (useSyncExternalStore).
 */
export function useSessionField<T>(field: Field, read: () => T): T {
  return useSyncExternalStore((l) => UserSession.subscribe(field, l), read, read);
}
