/** Типы дизайн-системы — зеркало Android ui/theme. */

export interface GradientSpec {
  /** vertical — Brush.verticalGradient; diagonal — Brush.linearGradient без start/end */
  type: 'vertical' | 'diagonal';
  colors: string[];
}

/** data class ThemePalette */
export interface ThemePalette {
  primary: string;
  primaryDark: string;
  primaryLight: string;
  secondary: string;
  secondaryDark: string;
  secondaryLight: string;
  messageBubbleOwn: string;
  messageBubbleOther: string;
  accent: string;
  backgroundGradient: GradientSpec;
}

/** enum class ThemeVariant — поля конструктора */
export interface ThemeVariantMeta {
  key: string;
  ordinal: number;
  displayName: string;
  emoji: string;
  description: string;
  isPremium: boolean;
  isSubscriptionOnly: boolean;
  /** false — тема рассчитана на светлый режим и всегда показывается светлой */
  prefersDark: boolean;
  /** ключ строки localizedDisplayName() */
  nameKey: string | null;
  /** ключ строки localizedDescription() */
  descKey: string | null;
}

/** Material 3 ColorScheme — те же имена ролей, что в Compose. */
export interface ColorScheme {
  primary: string;
  onPrimary: string;
  primaryContainer: string;
  onPrimaryContainer: string;
  inversePrimary: string;
  secondary: string;
  onSecondary: string;
  secondaryContainer: string;
  onSecondaryContainer: string;
  tertiary: string;
  onTertiary: string;
  tertiaryContainer: string;
  onTertiaryContainer: string;
  background: string;
  onBackground: string;
  surface: string;
  onSurface: string;
  surfaceVariant: string;
  onSurfaceVariant: string;
  surfaceTint: string;
  inverseSurface: string;
  inverseOnSurface: string;
  error: string;
  onError: string;
  errorContainer: string;
  onErrorContainer: string;
  outline: string;
  outlineVariant: string;
  scrim: string;
  surfaceBright: string;
  surfaceDim: string;
  surfaceContainer: string;
  surfaceContainerHigh: string;
  surfaceContainerHighest: string;
  surfaceContainerLow: string;
  surfaceContainerLowest: string;
}

/** data class ExtendedColors (WMColors.extendedColors) */
export interface ExtendedColors {
  messageBubbleOwn: string;
  messageBubbleOther: string;
  messageBubbleOwnDark: string;
  messageBubbleOtherDark: string;
  onlineGreen: string;
  awayYellow: string;
  busyRed: string;
  offlineGray: string;
  unreadBadge: string;
  typingIndicator: string;
  searchBarBackground: string;
  backgroundGradient: GradientSpec;
}
