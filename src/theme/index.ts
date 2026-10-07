/**
 * Тема приложения.
 *
 * Новая система (порт Android ui/theme): useWMTheme() → { colorScheme (роли
 * Material 3), extended (пузыри, онлайн, бейджи…), palette, paper }.
 * Новые экраны пишутся на ней — имена ролей те же, что в Compose:
 *   MaterialTheme.colorScheme.surfaceContainerHigh → theme.colorScheme.surfaceContainerHigh
 *   WMColors.extendedColors.messageBubbleOwn      → theme.extended.messageBubbleOwn
 *
 * useTheme() — прежний плоский набор цветов для ранних экранов iOS; теперь
 * он ВЫЧИСЛЯЕТСЯ из новой системы, так что старые экраны тоже следуют
 * выбранной теме (50 вариантов, светлый/тёмный режим).
 */
import { useMemo } from 'react';
import { AndroidColors as C } from './gen/colors';
import { ThemeManager, currentWMTheme, useWMTheme } from './themeManager';
import type { WMTheme } from './wmTheme';
import type { ThemeVariant } from './gen/variants';

export interface ThemeColors {
  background: string;
  surface: string;
  surfaceElevated: string;
  inputBackground: string;
  tabBar: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  textInverse: string;
  primary: string;
  primaryDark: string;
  primaryLight: string;
  secondary: string;
  accent: string;
  messageBubbleOwn: string;
  messageBubbleOther: string;
  messageBubbleOwnText: string;
  messageBubbleOtherText: string;
  divider: string;
  border: string;
  badge: string;
  online: string;
  offline: string;
  error: string;
  success: string;
  warning: string;
  messageRead: string;
  messageDelivered: string;
  messageSent: string;
  overlay: string;
  white: string;
  black: string;
  transparent: string;
  isDark: boolean;
  variant: ThemeVariant;
}

/** Плоский набор цветов из новой темы. */
export function toLegacyColors(t: WMTheme): ThemeColors {
  const cs = t.colorScheme;
  const ex = t.extended;
  // В Compose текст пузыря подбирается по яркости фона (AdaptiveBubbleColor) —
  // здесь упрощённо: свой пузырь — onPrimary-подобный, чужой — onSurface.
  return {
    background: cs.background,
    surface: cs.surface,
    surfaceElevated: cs.surfaceContainerHigh,
    inputBackground: ex.searchBarBackground,
    tabBar: cs.surfaceContainer,
    text: cs.onSurface,
    textSecondary: cs.onSurfaceVariant,
    textTertiary: t.isDark ? C.TextTertiaryDark : C.TextTertiary,
    textInverse: cs.inverseOnSurface,
    primary: cs.primary,
    primaryDark: t.palette.primaryDark,
    primaryLight: t.palette.primaryLight,
    secondary: cs.secondary,
    accent: t.palette.accent,
    messageBubbleOwn: ex.messageBubbleOwn,
    messageBubbleOther: t.isDark ? ex.messageBubbleOtherDark : ex.messageBubbleOther,
    messageBubbleOwnText: '#FFFFFF',
    messageBubbleOtherText: cs.onSurface,
    divider: cs.outline,
    border: cs.outline,
    badge: ex.unreadBadge,
    online: ex.onlineGreen,
    offline: ex.offlineGray,
    error: cs.error,
    success: C.Success,
    warning: C.Warning,
    messageRead: C.MessageRead,
    messageDelivered: C.MessageDelivered,
    messageSent: C.MessageSent,
    overlay: C.Overlay,
    white: '#FFFFFF',
    black: '#000000',
    transparent: 'transparent',
    isDark: t.isDark,
    variant: t.variant,
  };
}

/** Прежний хук ранних экранов — теперь следует выбранной теме. */
export function useTheme(): ThemeColors {
  const t = useWMTheme();
  return useMemo(() => toLegacyColors(t), [t]);
}

/** Для класс-компонентов и кода вне React (без учёта системного режима). */
export const defaultTheme: ThemeColors = toLegacyColors(currentWMTheme());

/**
 * Совместимость: authStore/SplashScreen вызывают useThemeStore.getState()._hydrate().
 * Тема теперь загружается в WMApplication.onCreate() (ThemeManager.init).
 */
export const useThemeStore = {
  getState: () => ({
    _hydrate: async () => ThemeManager.init(),
  }),
};

export { useWMTheme, ThemeManager, currentWMTheme } from './themeManager';
export type { WMTheme } from './wmTheme';
export { WMTypography, WMTextStyles, WMShapes, WMSpacing, WMCorners, WMMotion, Shapes, lerpColor, withAlpha } from './wmTheme';
export { THEME_VARIANTS, THEME_PALETTES, THEME_VARIANT_KEYS, type ThemeVariant } from './gen/variants';
export { AndroidColors, GroupAvatarColors } from './gen/colors';
