/**
 * Локальные настройки — порты Android:
 *   data/UserPreferencesRepository.kt (DataStore "worldmates_prefs")
 *   data/CachePreferences.kt          (лимиты медиа-кеша, «Данные и память»)
 *   data/PerformanceManager.kt        (режим производительности)
 *
 * Хранилище — core/platform/kv (синхронное, аналог SharedPreferences/DataStore).
 * Реактивность — zustand-сторы (аналог StateFlow/Flow).
 */
import { create } from 'zustand';
import * as Device from 'expo-device';
import { kv } from './platform/kv';

// ─── UserPreferencesRepository ────────────────────────────────────────────────
export interface UserPreferences {
  userEmail: string;
  deviceId: string;
  fcmToken: string;
  lastLoginTime: number;
  isPremium: boolean;
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  previewEnabled: boolean;
  groupNotificationsEnabled: boolean;
  /** "light" | "dark" | "system" */
  themeMode: string;
  language: string;
  /** id из SoundLibrary.NOTIFICATION_SOUNDS (дефолт "pop") */
  notificationSoundId: string;
  /** id из SoundLibrary.MESSAGE_SOUNDS (дефолт "bubble") */
  messageSoundId: string;
}

const PREFS_KEY = 'worldmates_prefs';
const DEFAULT_PREFS: UserPreferences = {
  userEmail: '',
  deviceId: '',
  fcmToken: '',
  lastLoginTime: 0,
  isPremium: false,
  notificationsEnabled: true,
  soundEnabled: true,
  vibrationEnabled: true,
  previewEnabled: true,
  groupNotificationsEnabled: true,
  themeMode: 'system',
  language: 'uk',
  notificationSoundId: 'pop',
  messageSoundId: 'bubble',
};

/** userPreferencesFlow → useUserPreferences(s => s.soundEnabled) */
export const useUserPreferences = create<UserPreferences>(() => ({
  ...DEFAULT_PREFS,
  ...kv.getJson<Partial<UserPreferences>>(PREFS_KEY, {}),
}));

function patchPrefs(p: Partial<UserPreferences>): void {
  useUserPreferences.setState(p);
  kv.setJson(PREFS_KEY, useUserPreferences.getState());
}

export const UserPreferencesRepository = {
  /** Перечитать после hydrateKv() (стор создаётся до гидратации). */
  reload(): void {
    useUserPreferences.setState({ ...DEFAULT_PREFS, ...kv.getJson<Partial<UserPreferences>>(PREFS_KEY, {}) });
  },
  get value(): UserPreferences {
    return useUserPreferences.getState();
  },
  saveUserSession(userEmail: string, deviceId: string, isPremium = false): void {
    patchPrefs({ userEmail, deviceId, isPremium, lastLoginTime: Date.now() });
  },
  saveFcmToken: (fcmToken: string) => patchPrefs({ fcmToken }),
  setNotificationsEnabled: (v: boolean) => patchPrefs({ notificationsEnabled: v }),
  setSoundEnabled: (v: boolean) => patchPrefs({ soundEnabled: v }),
  setVibrationEnabled: (v: boolean) => patchPrefs({ vibrationEnabled: v }),
  setPreviewEnabled: (v: boolean) => patchPrefs({ previewEnabled: v }),
  setGroupNotificationsEnabled: (v: boolean) => patchPrefs({ groupNotificationsEnabled: v }),
  setThemeMode: (v: string) => patchPrefs({ themeMode: v }),
  setLanguage: (v: string) => patchPrefs({ language: v }),
  setNotificationSoundId: (v: string) => patchPrefs({ notificationSoundId: v }),
  setMessageSoundId: (v: string) => patchPrefs({ messageSoundId: v }),
  clearUserSession(): void {
    useUserPreferences.setState({ ...DEFAULT_PREFS });
    kv.removeItem(PREFS_KEY);
  },
};

// ─── CachePreferences ─────────────────────────────────────────────────────────
// Локально на устройстве (не синхронизируется) — та же пара настроек, что
// cache_config.json в Windows-клиенте.
export const CACHE_DEFAULT_MAX_BYTES = 200 * 1024 * 1024;
/** 0 = хранить бессрочно (лимит размера всё равно действует) */
export const CACHE_DEFAULT_TTL_DAYS = 0;
const KEY_MAX_BYTES = 'cache_max_bytes';
const KEY_TTL_DAYS = 'cache_ttl_days';

export const useCachePreferences = create<{ maxBytes: number; ttlDays: number }>(() => ({
  maxBytes: CACHE_DEFAULT_MAX_BYTES,
  ttlDays: CACHE_DEFAULT_TTL_DAYS,
}));

export const CachePreferences = {
  init(): void {
    useCachePreferences.setState({
      maxBytes: Number(kv.getItem(KEY_MAX_BYTES) ?? CACHE_DEFAULT_MAX_BYTES),
      ttlDays: Number(kv.getItem(KEY_TTL_DAYS) ?? CACHE_DEFAULT_TTL_DAYS),
    });
  },
  setMaxBytes(bytes: number): void {
    useCachePreferences.setState({ maxBytes: bytes });
    kv.setItem(KEY_MAX_BYTES, String(bytes));
  },
  setTtlDays(days: number): void {
    useCachePreferences.setState({ ttlDays: days });
    kv.setItem(KEY_TTL_DAYS, String(days));
  },
  getMaxBytes: () => useCachePreferences.getState().maxBytes,
  getTtlDays: () => useCachePreferences.getState().ttlDays,
};

// ─── PerformanceManager ───────────────────────────────────────────────────────
export type PerformanceMode = 'AUTO' | 'ENABLED' | 'DISABLED';
const KEY_PERF_MODE = 'performance_mode';

export const usePerformance = create<{ mode: PerformanceMode; active: boolean }>(() => ({
  mode: 'AUTO',
  active: false,
}));

/**
 * Слабое устройство — те же пороги, что на Android (< 4 ГБ ОЗУ).
 * На iOS нет isLowRamDevice/memoryClass, поэтому только объём памяти и
 * год выпуска модели (iPhone 8/X и старше — < 3 ГБ).
 */
function detectLowEndDevice(): boolean {
  const total = Device.totalMemory;
  if (total && total / (1024 * 1024 * 1024) < 4) return true;
  if (Device.deviceYearClass && Device.deviceYearClass < 2018) return true;
  return false;
}

function resolveActive(mode: PerformanceMode): boolean {
  if (mode === 'ENABLED') return true;
  if (mode === 'DISABLED') return false;
  return detectLowEndDevice();
}

export const PerformanceManager = {
  init(): void {
    const raw = kv.getItem(KEY_PERF_MODE) as PerformanceMode | null;
    const mode: PerformanceMode = raw === 'ENABLED' || raw === 'DISABLED' ? raw : 'AUTO';
    usePerformance.setState({ mode, active: resolveActive(mode) });
  },
  getMode: () => usePerformance.getState().mode,
  setMode(mode: PerformanceMode): void {
    kv.setItem(KEY_PERF_MODE, mode);
    usePerformance.setState({ mode, active: resolveActive(mode) });
  },
  /** Упрощённые анимации/фоны, если true. */
  get active(): boolean {
    return usePerformance.getState().active;
  },
};
