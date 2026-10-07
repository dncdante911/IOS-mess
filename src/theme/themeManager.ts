/**
 * ThemeManager — порт Android ui/theme/ThemeManager.kt + ThemeRepository.kt +
 * data/repository/ThemeProfileRepository.kt.
 *
 * Состояние (ThemeState): вариант, тёмный режим, «как в системе», динамические
 * цвета, своя картинка фона, пресет фона. Хранится локально (kv).
 *
 * Синхронизация между устройствами — /api/node/theme/profile. Бэкенд знает
 * платформы только 'android' | 'windows'; iOS использует профиль 'android',
 * потому что набор тем, стилей пузырей, фонов и шрифтов у iOS — тот же, что
 * у Android (ключи совпадают). Тема с Android-телефона подтягивается на iPhone
 * и наоборот.
 */
import { useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { create } from 'zustand';
import { kv } from '../core/platform/kv';
import { NodeRetrofitClient } from '../core/android';
import { UserSession } from '../core/session';
import { THEME_VARIANTS, type ThemeVariant } from './gen/variants';
import { buildWMTheme, effectiveDark, type WMTheme } from './wmTheme';
import { UIStylePreferences, bubbleStyleFromName, useUIStyle } from '../preferences/uiStyle';

export const THEME_PROFILE_PLATFORM = 'android';

export interface ThemeState {
  variant: ThemeVariant;
  isDark: boolean;
  useDynamicColor: boolean;
  useSystemTheme: boolean;
  backgroundImageUri: string | null;
  presetBackgroundId: string | null;
}

const KEY = 'theme_preferences';
const DEFAULTS: ThemeState = {
  variant: 'CLASSIC',
  isDark: false,
  useDynamicColor: false,
  useSystemTheme: false,
  backgroundImageUri: null,
  presetBackgroundId: null,
};

export const useThemeState = create<ThemeState>(() => ({ ...DEFAULTS }));

function persist(patch: Partial<ThemeState>): void {
  useThemeState.setState(patch);
  kv.setJson(KEY, useThemeState.getState());
  scheduleSync();
}

function isVariant(v: unknown): v is ThemeVariant {
  return typeof v === 'string' && v in THEME_VARIANTS;
}

// ─── ThemeViewModel ───────────────────────────────────────────────────────────
export const ThemeManager = {
  init(): void {
    const saved = kv.getJson<Partial<ThemeState>>(KEY, {});
    useThemeState.setState({
      ...DEFAULTS,
      ...saved,
      variant: isVariant(saved.variant) ? saved.variant : 'CLASSIC',
    });
  },
  get state(): ThemeState {
    return useThemeState.getState();
  },
  setThemeVariant: (variant: ThemeVariant) => persist({ variant }),
  /** Ручное переключение отключает «как в системе» (как Android). */
  toggleDarkTheme: () => persist({ isDark: !useThemeState.getState().isDark, useSystemTheme: false }),
  setDarkTheme: (isDark: boolean) => persist({ isDark }),
  toggleDynamicColor: () => persist({ useDynamicColor: !useThemeState.getState().useDynamicColor }),
  setDynamicColor: (useDynamicColor: boolean) => persist({ useDynamicColor }),
  toggleSystemTheme: () => persist({ useSystemTheme: !useThemeState.getState().useSystemTheme }),
  setSystemTheme: (useSystemTheme: boolean) => persist({ useSystemTheme }),
  setBackgroundImageUri: (backgroundImageUri: string | null) => persist({ backgroundImageUri }),
  setPresetBackgroundId: (presetBackgroundId: string | null) => persist({ presetBackgroundId }),
  resetToDefaults: () => persist({ ...DEFAULTS }),
  /** Динамические цвета из обоев на iOS недоступны. */
  isDynamicColorAvailable: () => false,
};

/**
 * rememberThemeState() + WorldMatesTheme: итоговая тема с учётом системного
 * режима и prefersDark варианта.
 */
export function useWMTheme(): WMTheme {
  const state = useThemeState();
  const system = useColorScheme();
  const dark = state.useSystemTheme ? system === 'dark' : state.isDark;
  const eff = effectiveDark(state.variant, dark);
  return useMemo(() => buildWMTheme(state.variant, eff), [state.variant, eff]);
}

/** Статический доступ вне компонентов (системный режим не учитывается). */
export function currentWMTheme(): WMTheme {
  const s = useThemeState.getState();
  return buildWMTheme(s.variant, effectiveDark(s.variant, s.isDark));
}

// ─── ThemeProfileRepository: синхронизация ────────────────────────────────────
let syncTimer: ReturnType<typeof setTimeout> | null = null;

function snapshot() {
  const t = useThemeState.getState();
  const u = useUIStyle.getState();
  return { themeKey: t.variant, bubbleStyle: u.bubbleStyle, backgroundId: t.presetBackgroundId, font: u.chatFont };
}

/** Любое изменение темы/пузырей/фона/шрифта → фоновая отправка (с дебаунсом). */
export function scheduleSync(): void {
  if (!UserSession.isLoggedIn) return;
  if (syncTimer) clearTimeout(syncTimer);
  syncTimer = setTimeout(() => void ThemeProfileRepository.syncCurrentTheme(), 1500);
}

export type ImportThemeResult =
  | { kind: 'success'; themeKey: string; bubbleStyle: string | null; backgroundId: string | null; font: string | null }
  | { kind: 'notFound' }
  | { kind: 'wrongPlatform' }
  | { kind: 'networkError' };

export const ThemeProfileRepository = {
  async syncCurrentTheme(): Promise<void> {
    const s = snapshot();
    try {
      await NodeRetrofitClient.api.putThemeProfile(THEME_PROFILE_PLATFORM, s.themeKey, s.bubbleStyle, s.backgroundId, s.font);
    } catch {
      /* фоновая синхронизация не должна давать ошибок пользователю */
    }
  },

  /** Один раз на аккаунт на устройстве (первый вход на новом телефоне). */
  async pullProfileOnceIfNeeded(): Promise<void> {
    const uid = UserSession.userId;
    if (uid <= 0) return;
    const flag = `theme_pulled_${uid}`;
    if (kv.getItem(flag) === 'true') return;
    try {
      const r = await NodeRetrofitClient.api.getThemeProfile(THEME_PROFILE_PLATFORM);
      kv.setItem(flag, 'true'); // «проверили, ничего нет» — тоже считается
      const p = r.apiStatus === 200 ? r.profile : null;
      if (!p) return;
      if (isVariant(p.themeKey)) useThemeState.setState({ variant: p.themeKey });
      if (p.backgroundId) useThemeState.setState({ presetBackgroundId: p.backgroundId });
      kv.setJson(KEY, useThemeState.getState());
      if (p.bubbleStyle) UIStylePreferences.setBubbleStyle(bubbleStyleFromName(p.bubbleStyle));
      if (p.font) UIStylePreferences.setChatFont(p.font);
    } catch {
      /* реальная ошибка — флаг не ставим, повторим при следующем запуске */
    }
  },

  /** Сохранить текущую тему и получить короткий код для обмена. */
  async shareCurrentTheme(): Promise<string | null> {
    const s = snapshot();
    try {
      const r = await NodeRetrofitClient.api.shareThemeProfile(THEME_PROFILE_PLATFORM, s.themeKey, s.bubbleStyle, s.backgroundId, s.font);
      return r.apiStatus === 200 ? r.shareCode : null;
    } catch {
      return null;
    }
  },

  async importByCode(code: string): Promise<ImportThemeResult> {
    try {
      const r = await NodeRetrofitClient.api.getSharedThemeProfile(code.trim());
      if (r.apiStatus !== 200 || !r.profile) return { kind: 'notFound' };
      const p = r.profile;
      if (p.platform !== THEME_PROFILE_PLATFORM) return { kind: 'wrongPlatform' };
      return { kind: 'success', themeKey: p.themeKey, bubbleStyle: p.bubbleStyle, backgroundId: p.backgroundId, font: p.font };
    } catch {
      return { kind: 'networkError' };
    }
  },

  /** Применить импортированный профиль. */
  apply(p: { themeKey: string; bubbleStyle: string | null; backgroundId: string | null; font: string | null }): void {
    if (isVariant(p.themeKey)) ThemeManager.setThemeVariant(p.themeKey);
    if (p.backgroundId) ThemeManager.setPresetBackgroundId(p.backgroundId);
    if (p.bubbleStyle) UIStylePreferences.setBubbleStyle(bubbleStyleFromName(p.bubbleStyle));
    if (p.font) UIStylePreferences.setChatFont(p.font);
  },

  /** «Фирменный» шрифт отправителя — для его сообщений у других (SenderFontCache). */
  async getPublicFont(userId: number): Promise<string | null> {
    try {
      const r = await NodeRetrofitClient.api.getPublicFont(userId);
      return r.apiStatus === 200 ? r.font : null;
    } catch {
      return null;
    }
  },
};

// Смена пузырей/шрифта тоже синхронизируется (как LaunchedEffect на Android)
useUIStyle.subscribe((s, prev) => {
  if (s.bubbleStyle !== prev.bubbleStyle || s.chatFont !== prev.chatFont) scheduleSync();
});
