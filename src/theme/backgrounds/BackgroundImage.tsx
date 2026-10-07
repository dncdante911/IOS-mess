/**
 * Фоны — порт Android ui/theme/BackgroundImage.kt + градиент темы.
 *
 * BackgroundImage (фон чата) — приоритет как на Android:
 *   1) своя картинка пользователя (cover) + чёрный оверлей 30%
 *   2) пресет PresetBackground: вертикальный градиент + чёрный оверлей 8%
 *   3) DefaultChatBackground (Telegram-подобный)
 *
 * ThemeGradientBackground — palette.backgroundGradient варианта темы
 * (Brush.verticalGradient или linearGradient из левого верхнего угла в правый нижний).
 *
 * BackgroundContainer — картинка (оверлей 30%) или переданный градиент + контент.
 */
import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { presetBackgroundFromId } from '../gen/presetBackgrounds';
import { useThemeState, useWMTheme } from '../themeManager';
import { DefaultChatBackground } from './DefaultChatBackground';
import type { GradientSpec } from '../types';

export function GradientFill({ spec, style }: { spec: GradientSpec; style?: StyleProp<ViewStyle> }) {
  const colors = spec.colors.length >= 2 ? spec.colors : [spec.colors[0] ?? '#000000', spec.colors[0] ?? '#000000'];
  return (
    <LinearGradient
      colors={colors as [string, string, ...string[]]}
      start={spec.type === 'vertical' ? { x: 0.5, y: 0 } : { x: 0, y: 0 }}
      end={spec.type === 'vertical' ? { x: 0.5, y: 1 } : { x: 1, y: 1 }}
      style={[StyleSheet.absoluteFill, style]}
      pointerEvents="none"
    />
  );
}

export function BackgroundImage({
  backgroundImageUri,
  presetBackgroundId,
  style,
}: {
  backgroundImageUri: string | null | undefined;
  presetBackgroundId: string | null | undefined;
  style?: StyleProp<ViewStyle>;
}) {
  const theme = useWMTheme();
  if (backgroundImageUri) {
    return (
      <View style={[StyleSheet.absoluteFill, style]} pointerEvents="none">
        <Image source={{ uri: backgroundImageUri }} style={StyleSheet.absoluteFill} contentFit="cover" />
        <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.3)' }]} />
      </View>
    );
  }
  if (presetBackgroundId) {
    const preset = presetBackgroundFromId(presetBackgroundId);
    if (!preset) {
      return <View style={[StyleSheet.absoluteFill, { backgroundColor: theme.colorScheme.background }, style]} pointerEvents="none" />;
    }
    return (
      <View style={[StyleSheet.absoluteFill, style]} pointerEvents="none">
        <GradientFill spec={{ type: 'vertical', colors: preset.colors }} />
        <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.08)' }]} />
      </View>
    );
  }
  return <DefaultChatBackground style={style} />;
}

/** Фон чата из текущих настроек темы (обои/пресет/по умолчанию). */
export function ThemedChatBackground({ style }: { style?: StyleProp<ViewStyle> }) {
  const s = useThemeState();
  return <BackgroundImage backgroundImageUri={s.backgroundImageUri} presetBackgroundId={s.presetBackgroundId} style={style} />;
}

/** palette.backgroundGradient текущей темы. */
export function ThemeGradientBackground({ style }: { style?: StyleProp<ViewStyle> }) {
  const theme = useWMTheme();
  return <GradientFill spec={theme.extended.backgroundGradient} style={style} />;
}

export function BackgroundContainer({
  backgroundImageUri,
  defaultGradient,
  style,
  children,
}: {
  backgroundImageUri: string | null | undefined;
  defaultGradient: GradientSpec;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}) {
  return (
    <View style={[{ flex: 1 }, style]}>
      {backgroundImageUri ? (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <Image source={{ uri: backgroundImageUri }} style={StyleSheet.absoluteFill} contentFit="cover" />
          <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.3)' }]} />
        </View>
      ) : (
        <GradientFill spec={defaultGradient} />
      )}
      {children}
    </View>
  );
}
