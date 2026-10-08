/**
 * WMApplication — порт Android WMApplication.onCreate(): единая точка
 * инициализации синглтонов при старте + отслеживание переднего/фонового плана.
 *
 * Порядок как на Android: краш-репортер → язык → прокси → аккаунты →
 * производительность → кеш → (воркеры). Воркеры Android (SecretChatCleanup,
 * SubscriptionSync, MediaCacheCleanup, AppUpdate) на iOS не гарантированы в
 * фоне — они регистрируются как задачи «при выходе на передний план» через
 * onAppForeground() в своих фазах.
 */
import { AppState, type AppStateStatus } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { hydrateKv } from './platform/kv';
import { CrashReporter } from './crashReporter';
import { useI18nStore } from '../i18n';
import { ProxyConfigHolder, NetworkQualityMonitor } from './network';
import { UserSession } from './session';
import { AccountManager } from './accountManager';
import { PerformanceManager, CachePreferences, UserPreferencesRepository } from './prefs';
import { ensureStorageDirs } from './storageManager';
import { setE2EEAccount } from '../crypto/e2ee/e2eeStore';
import { socketService } from '../services/socketService';
import { initCertPinning } from './certPinning';
import { ThemeManager, ThemeProfileRepository } from '../theme/themeManager';
import { UIStylePreferences, useUIStyle } from '../preferences/uiStyle';
import { loadAppFonts, loadChatFont } from '../fonts/fonts';
import { AnimatedBgPrefs } from '../theme/backgrounds/ChatAnimatedBackground';
import { ChatOrganizationManager } from '../features/chats/chatOrganization';
import { ContactNicknameRepository } from '../features/chats/contactNicknames';
import { ChatLockManager } from '../features/chats/chatLock';

type Hook = () => void | Promise<void>;
const foregroundHooks: Hook[] = [];
const backgroundHooks: Hook[] = [];

/** Задача при каждом выходе на передний план (аналог периодических Worker'ов). */
export function onAppForeground(h: Hook): void {
  foregroundHooks.push(h);
}
/** Задача при уходе в фон (например, повторная блокировка App Lock). */
export function onAppBackground(h: Hook): void {
  backgroundHooks.push(h);
}

async function runHooks(hooks: Hook[]): Promise<void> {
  for (const h of hooks) {
    try {
      await h();
    } catch (e) {
      console.warn('[WMApplication] hook:', e);
    }
  }
}

let started = false;
let appState: AppStateStatus = AppState.currentState;

export const WMApplication = {
  /** Аналог MessageNotificationService.isAppInForeground */
  get isAppInForeground(): boolean {
    return appState === 'active';
  },

  async onCreate(): Promise<void> {
    if (started) return;
    started = true;

    // Краш-репортер первым — чтобы поймать любую ошибку старта
    CrashReporter.install();

    // Пиннинг сертификатов — до первого сетевого запроса
    await initCertPinning((host) => {
      void CrashReporter.report(new Error(`SSL pinning mismatch: ${host}`));
    });

    // Синхронное KV до любых модулей, читающих настройки
    await hydrateKv();
    UserPreferencesRepository.reload();

    // Язык — до первого сетевого запроса (Accept-Language)
    await useI18nStore.getState()._hydrate();

    // Прокси — синхронно, до сети
    ProxyConfigHolder.init();

    // Сессия и мультиаккаунт
    await UserSession.hydrate();
    await AccountManager.init().catch((e) => console.warn('[WMApplication] accounts:', e));
    if (UserSession.userId > 0) await setE2EEAccount(UserSession.userId);
    // Папки/архив/теги списка чатов — свои у каждого аккаунта
    ChatOrganizationManager.init();
    ContactNicknameRepository.reload();
    ChatLockManager.reload();

    // Тема и стиль интерфейса — до первого кадра (ThemeRepository/UIStylePreferences)
    ThemeManager.init();
    UIStylePreferences.init();
    AnimatedBgPrefs.syncFromPrefs();
    // Фирменные шрифты + выбранный шрифт чата (в фоне, не блокируя старт)
    void loadAppFonts();
    void loadChatFont(useUIStyle.getState().chatFont);
    // Профиль темы с сервера — один раз на аккаунт на устройстве
    if (UserSession.isLoggedIn) void ThemeProfileRepository.pullProfileOnceIfNeeded();

    PerformanceManager.init();
    CachePreferences.init();
    await ensureStorageDirs();

    NetworkQualityMonitor.startMonitoring();
    void CrashReporter.sendPendingReports();

    // Передний/фоновый план
    AppState.addEventListener('change', (next) => {
      const prev = appState;
      appState = next;
      if (next === 'active' && prev !== 'active') {
        // Токен мог истечь, пока приложение спало — обновить до переподключения
        void (async () => {
          if (UserSession.isLoggedIn && UserSession.isTokenExpiringSoon) await UserSession.refresh();
          socketService.forceReconnect();
          NetworkQualityMonitor.forceCheck();
          await runHooks(foregroundHooks);
        })();
      } else if (next !== 'active' && prev === 'active') {
        void runHooks(backgroundHooks);
      }
    });

    // Сеть появилась, а сокет лежит — переподключить сразу (Android: onAvailable)
    NetInfo.addEventListener((s) => {
      if (s.isConnected && UserSession.isLoggedIn && !socketService.isConnected()) {
        socketService.forceReconnect();
      }
    });
  },
};
