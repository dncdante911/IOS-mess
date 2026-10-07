/**
 * Ядро дизайн-системы — порт Android ui/theme/Theme.kt, Typography.kt,
 * Shapes.kt, WMTokens.kt.
 *
 * Схема цветов строится ТЕМ ЖЕ алгоритмом, что createLightColorScheme /
 * createDarkColorScheme на Android: роли Material 3 + тональные поверхности
 * (нейтральная основа, слегка подкрашенная основным цветом темы), иначе
 * карточки/диалоги/шторки выглядели бы «фиолетовыми» baseline-M3.
 */
import { MD3DarkTheme, MD3LightTheme, configureFonts, type MD3Theme } from 'react-native-paper';
import type { TextStyle } from 'react-native';
import { AndroidColors as C } from './gen/colors';
import { THEME_PALETTES, THEME_VARIANTS, type ThemeVariant } from './gen/variants';
import type { ColorScheme, ExtendedColors, ThemePalette } from './types';

// ─── Цветовая математика (androidx.compose.ui.graphics.lerp) ──────────────────
function parse(hex: string): [number, number, number, number] {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const a = h.length >= 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1;
  return [r, g, b, a];
}

function toHex(r: number, g: number, b: number, a = 1): string {
  const c = (v: number) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0');
  return `#${c(r)}${c(g)}${c(b)}${a < 1 ? c(a * 255) : ''}`.toUpperCase();
}

/** Линейная интерполяция цвета a→b на долю t (0..1). */
export function lerpColor(a: string, b: string, t: number): string {
  const [r1, g1, b1, a1] = parse(a);
  const [r2, g2, b2, a2] = parse(b);
  return toHex(r1 + (r2 - r1) * t, g1 + (g2 - g1) * t, b1 + (b2 - b1) * t, a1 + (a2 - a1) * t);
}

/** Color.copy(alpha = x) */
export function withAlpha(hex: string, alpha: number): string {
  const [r, g, b] = parse(hex);
  return toHex(r, g, b, alpha);
}

const tone = lerpColor;
const WHITE = '#FFFFFF';
const BLACK = '#000000';

// ─── Theme.kt: createLightColorScheme ─────────────────────────────────────────
export function createLightColorScheme(p: ThemePalette): ColorScheme {
  const t = p.primary;
  return {
    surfaceTint: t,
    surfaceBright: WHITE,
    surfaceDim: tone('#DADDE2', t, 0.06),
    surfaceContainerLowest: WHITE,
    surfaceContainerLow: tone('#F7F8FA', t, 0.025),
    surfaceContainer: tone('#F1F3F6', t, 0.035),
    surfaceContainerHigh: tone('#EBEEF2', t, 0.045),
    surfaceContainerHighest: tone('#E5E8ED', t, 0.055),
    inverseSurface: '#1F2328',
    inverseOnSurface: '#F1F3F5',
    inversePrimary: p.primaryLight,
    scrim: BLACK,
    primary: p.primary,
    onPrimary: WHITE,
    primaryContainer: p.primaryLight,
    onPrimaryContainer: BLACK,
    secondary: p.secondary,
    onSecondary: WHITE,
    secondaryContainer: p.secondaryLight,
    onSecondaryContainer: BLACK,
    tertiary: p.accent,
    onTertiary: WHITE,
    tertiaryContainer: tone(WHITE, p.accent, 0.22),
    onTertiaryContainer: tone(C.TextPrimary, p.accent, 0.35),
    errorContainer: '#FFDAD6',
    onErrorContainer: '#410002',
    background: C.BackgroundLight,
    onBackground: C.TextPrimary,
    surface: C.SurfaceLight,
    onSurface: C.TextPrimary,
    surfaceVariant: C.CardBackground,
    onSurfaceVariant: C.TextSecondary,
    error: C.Error,
    onError: WHITE,
    outline: C.Divider,
    outlineVariant: withAlpha(C.Divider, 0.5),
  };
}

// ─── Theme.kt: createDarkColorScheme ──────────────────────────────────────────
export function createDarkColorScheme(p: ThemePalette): ColorScheme {
  const t = p.primaryLight;
  return {
    surfaceTint: t,
    surfaceDim: '#0B0F14',
    surfaceBright: tone('#2E3540', t, 0.05),
    surfaceContainerLowest: '#090C10',
    surfaceContainerLow: tone('#12171D', t, 0.03),
    surfaceContainer: tone('#171C23', t, 0.04),
    surfaceContainerHigh: tone('#1D232B', t, 0.05),
    surfaceContainerHighest: tone('#242B34', t, 0.06),
    inverseSurface: '#E6E8EB',
    inverseOnSurface: '#1F2328',
    inversePrimary: p.primary,
    scrim: BLACK,
    primary: p.primaryLight,
    onPrimary: BLACK,
    primaryContainer: p.primaryDark,
    onPrimaryContainer: WHITE,
    secondary: p.secondaryLight,
    onSecondary: BLACK,
    secondaryContainer: p.secondaryDark,
    onSecondaryContainer: WHITE,
    tertiary: p.accent,
    onTertiary: BLACK,
    tertiaryContainer: tone('#15191F', p.accent, 0.35),
    onTertiaryContainer: tone(WHITE, p.accent, 0.15),
    errorContainer: '#93000A',
    onErrorContainer: '#FFDAD6',
    background: C.BackgroundDark,
    onBackground: C.TextPrimaryDark,
    surface: C.SurfaceDark,
    onSurface: C.TextPrimaryDark,
    surfaceVariant: C.CardBackgroundDark,
    onSurfaceVariant: C.TextSecondaryDark,
    error: C.Error,
    onError: WHITE,
    outline: C.DividerDark,
    outlineVariant: withAlpha(C.DividerDark, 0.5),
  };
}

// ─── Theme.kt: createExtendedColors ───────────────────────────────────────────
export function createExtendedColors(p: ThemePalette, isDark: boolean): ExtendedColors {
  return {
    messageBubbleOwn: p.messageBubbleOwn,
    messageBubbleOther: p.messageBubbleOther,
    messageBubbleOwnDark: p.primaryDark,
    messageBubbleOtherDark: isDark ? '#2C2C2C' : '#E5E5EA',
    onlineGreen: C.OnlineGreen,
    awayYellow: C.AwayYellow,
    busyRed: C.BusyRed,
    offlineGray: C.OfflineGray,
    // Счётчик непрочитанного — акцентом темы, а не красным (как Telegram/Signal)
    unreadBadge: isDark ? p.primaryLight : p.primary,
    typingIndicator: p.primary,
    searchBarBackground: isDark ? C.SearchBarBackgroundDark : C.SearchBarBackground,
    backgroundGradient: p.backgroundGradient,
  };
}

// ─── Typography.kt: WMTypography (системный шрифт) ────────────────────────────
type TS = Pick<TextStyle, 'fontSize' | 'lineHeight' | 'letterSpacing' | 'fontWeight'>;
const ts = (fontSize: number, lineHeight: number, letterSpacing: number, fontWeight: TextStyle['fontWeight']): TS => ({
  fontSize,
  lineHeight,
  letterSpacing,
  fontWeight,
});
const BOLD = '700';
const SEMI = '600';
const MED = '500';
const REG = '400';

export const WMTypography = {
  displayLarge: ts(57, 64, -0.5, BOLD),
  displayMedium: ts(45, 52, -0.25, BOLD),
  displaySmall: ts(36, 44, 0, BOLD),
  headlineLarge: ts(32, 40, 0, SEMI),
  headlineMedium: ts(28, 36, 0, SEMI),
  headlineSmall: ts(24, 32, 0, SEMI),
  titleLarge: ts(22, 28, 0, SEMI),
  titleMedium: ts(16, 24, 0.1, SEMI),
  titleSmall: ts(14, 20, 0.05, MED),
  bodyLarge: ts(16, 24, 0.15, REG),
  bodyMedium: ts(14, 20, 0.1, REG),
  bodySmall: ts(12, 16, 0.2, REG),
  labelLarge: ts(14, 20, 0.1, MED),
  labelMedium: ts(12, 16, 0.3, MED),
  labelSmall: ts(11, 16, 0.3, MED),
} as const;
export type TypographyRole = keyof typeof WMTypography;

/** WMTextStyles */
export const WMTextStyles = {
  chatUsername: ts(16, 22, 0, SEMI),
  chatLastMessage: ts(14, 20, 0.1, REG),
  messageTime: ts(11, 14, 0.2, REG),
  messageText: ts(15, 22, 0.1, REG),
  unreadBadge: ts(11, 14, 0, BOLD),
  typingStatus: ts(12, 16, 0.2, REG),
  groupTitle: ts(18, 24, 0, BOLD),
  groupDescription: ts(13, 18, 0.1, REG),
  memberCount: ts(12, 16, 0.2, REG),
} as const;

// ─── Shapes.kt ────────────────────────────────────────────────────────────────
/** MaterialTheme.shapes */
export const Shapes = { extraSmall: 6, small: 14, medium: 18, large: 24, extraLarge: 32 } as const;

/** Углы: [topStart, topEnd, bottomEnd, bottomStart] → стиль RN */
export interface Corners {
  borderTopLeftRadius: number;
  borderTopRightRadius: number;
  borderBottomRightRadius: number;
  borderBottomLeftRadius: number;
}
const corners = (tl: number, tr: number, br: number, bl: number): Corners => ({
  borderTopLeftRadius: tl,
  borderTopRightRadius: tr,
  borderBottomRightRadius: br,
  borderBottomLeftRadius: bl,
});
const all = (r: number) => corners(r, r, r, r);
/** RoundedCornerShape(50) — «таблетка/круг»: большой радиус */
const PILL = 9999;

/** WMShapes */
export const WMShapes = {
  ownMessageBubble: corners(20, 20, 6, 20),
  otherMessageBubble: corners(20, 20, 20, 6),
  voiceMessage: all(24),
  mediaMessage: all(16),
  fileAttachment: all(16),
  avatar: all(PILL),
  groupAvatar: all(20),
  messageInput: all(26),
  button: all(14),
  roundButton: all(PILL),
  pillButton: all(28),
  chatCard: all(0),
  groupCard: all(20),
  dialog: all(32),
  bottomSheet: corners(32, 32, 0, 0),
  unreadBadge: all(14),
  typingIndicator: all(10),
  mediaPreview: all(12),
  reaction: all(18),
  emojiPanel: corners(20, 20, 0, 0),
  settingsCard: all(18),
  modalCard: all(24),
  searchBar: all(28),
  chip: all(12),
} as const;

// ─── WMTokens.kt ──────────────────────────────────────────────────────────────
/** WMSpacing */
export const WMSpacing = {
  xs: 2, sm: 4, md: 8, lg: 12, xl: 16, xxl: 24,
  cardOuterH: 12, cardGapV: 3, cardInnerH: 12, cardInnerV: 9,
  listItemH: 16, listItemV: 10,
  avatarGap: 12, avatarGapLg: 14,
} as const;

/** WMCorners */
export const WMCorners = {
  sm: all(8), md: all(12), card: all(16), avatar: all(16), avatarLg: all(18), lg: all(20),
  pill: all(PILL), searchBar: all(28), bottomSheet: corners(20, 20, 0, 0), badge: all(6), chip: all(8),
} as const;

/**
 * WMMotion — пружины Material 3 Expressive (значения 1:1 из androidx).
 * Формат reanimated withSpring: dampingRatio + stiffness (mass = 1).
 */
export const WMMotion = {
  fastSpatial: { dampingRatio: 0.6, stiffness: 800 },
  defaultSpatial: { dampingRatio: 0.8, stiffness: 380 },
  slowSpatial: { dampingRatio: 0.8, stiffness: 200 },
  fastEffects: { dampingRatio: 1, stiffness: 3800 },
  defaultEffects: { dampingRatio: 1, stiffness: 1600 },
  slowEffects: { dampingRatio: 1, stiffness: 800 },
} as const;

// ─── Сборка темы ──────────────────────────────────────────────────────────────
export interface WMTheme {
  variant: ThemeVariant;
  isDark: boolean;
  palette: ThemePalette;
  colorScheme: ColorScheme;
  extended: ExtendedColors;
  /** тема для react-native-paper (компоненты Material 3) */
  paper: MD3Theme;
}

/**
 * WorldMatesTheme(darkTheme, themeVariant).
 * MATERIAL_YOU: на iOS нет цветов из обоев — используется палитра варианта
 * (как Android < 12).
 */
export function buildWMTheme(variant: ThemeVariant, isDark: boolean): WMTheme {
  const palette = THEME_PALETTES[variant] ?? THEME_PALETTES.CLASSIC;
  const colorScheme = isDark ? createDarkColorScheme(palette) : createLightColorScheme(palette);
  const extended = createExtendedColors(palette, isDark);
  return { variant, isDark, palette, colorScheme, extended, paper: toPaperTheme(colorScheme, isDark) };
}

/** Темы с prefersDark=false всегда показываются светлыми (ThemeManager.kt). */
export function effectiveDark(variant: ThemeVariant, isDark: boolean): boolean {
  return isDark && (THEME_VARIANTS[variant]?.prefersDark ?? true);
}

function toPaperTheme(cs: ColorScheme, isDark: boolean): MD3Theme {
  const base = isDark ? MD3DarkTheme : MD3LightTheme;
  const fontConfig = Object.fromEntries(
    Object.entries(WMTypography).map(([k, v]) => [k, { ...v, fontFamily: 'System' }]),
  );
  return {
    ...base,
    dark: isDark,
    roundness: 4, // Paper умножает roundness на коэффициенты компонентов; формы задаём явно
    fonts: configureFonts({ config: fontConfig as never }),
    colors: {
      ...base.colors,
      primary: cs.primary,
      onPrimary: cs.onPrimary,
      primaryContainer: cs.primaryContainer,
      onPrimaryContainer: cs.onPrimaryContainer,
      secondary: cs.secondary,
      onSecondary: cs.onSecondary,
      secondaryContainer: cs.secondaryContainer,
      onSecondaryContainer: cs.onSecondaryContainer,
      tertiary: cs.tertiary,
      onTertiary: cs.onTertiary,
      tertiaryContainer: cs.tertiaryContainer,
      onTertiaryContainer: cs.onTertiaryContainer,
      error: cs.error,
      onError: cs.onError,
      errorContainer: cs.errorContainer,
      onErrorContainer: cs.onErrorContainer,
      background: cs.background,
      onBackground: cs.onBackground,
      surface: cs.surface,
      onSurface: cs.onSurface,
      surfaceVariant: cs.surfaceVariant,
      onSurfaceVariant: cs.onSurfaceVariant,
      outline: cs.outline,
      outlineVariant: cs.outlineVariant,
      inverseSurface: cs.inverseSurface,
      inverseOnSurface: cs.inverseOnSurface,
      inversePrimary: cs.inversePrimary,
      shadow: '#000000',
      scrim: cs.scrim,
      backdrop: withAlpha(cs.scrim, 0.4),
      surfaceDisabled: withAlpha(cs.onSurface, 0.12),
      onSurfaceDisabled: withAlpha(cs.onSurface, 0.38),
      // Compose M3 (BOM 2026) поднимает компоненты через surfaceContainer*-роли,
      // а не тональным наложением — сопоставляем уровни Paper с ними.
      elevation: {
        level0: 'transparent',
        level1: cs.surfaceContainerLow,
        level2: cs.surfaceContainer,
        level3: cs.surfaceContainerHigh,
        level4: cs.surfaceContainerHighest,
        level5: cs.surfaceContainerHighest,
      },
    },
  };
}
