/**
 * Индикаторы загрузки — порты Android ui/components:
 *   WMLoadingIndicator.kt  — три прыгающие точки в фирменных цветах
 *                            (WMBouncingDots, WMLoadingIndicator, WMFullScreenLoading, WMInlineLoader)
 *   WMLoadingAnimation.kt  — «эквалайзер» из 4 полос цвета primary; в режиме
 *                            производительности — 3 мерцающие точки
 *   WMPullToRefreshIndicator.kt — «сигнальные» полосы при обновлении
 */
import React, { useEffect } from 'react';
import { RefreshControl, StyleSheet, Text, View, type RefreshControlProps, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useTranslation } from '../../i18n';
import { useWMTheme } from '../../theme/themeManager';
import { withAlpha } from '../../theme/wmTheme';
import { usePerformance } from '../../core/prefs';

const BrandTeal = '#4ECDC4';
const BrandMint = '#95E1A3';
const FAST_OUT_SLOW_IN = Easing.bezier(0.4, 0, 0.2, 1);
const EASE_IN_OUT = Easing.bezier(0.42, 0, 0.58, 1);

// ─── WMBouncingDots ───────────────────────────────────────────────────────────
/** keyframes 900 мс: 0 → −12 (180 мс, EaseInOut) → 0 (180 мс) → пауза; задержки 0/150/300. */
function Dot({ delay, size, color }: { delay: number; size: number; color: string }) {
  const y = useSharedValue(0);
  useEffect(() => {
    y.value = withRepeat(
      withSequence(
        withDelay(delay, withTiming(-12, { duration: 180, easing: EASE_IN_OUT })),
        withTiming(0, { duration: 180 }),
        withTiming(0, { duration: 900 - delay - 360 }),
      ),
      -1,
    );
  }, [delay, y]);
  const anim = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));
  return <Animated.View style={[{ width: size, height: size, borderRadius: size / 2, backgroundColor: color }, anim]} />;
}

export function WMBouncingDots({
  dotSize = 10,
  spacing = 7,
  color = BrandTeal,
  style,
}: {
  dotSize?: number;
  spacing?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.row, { gap: spacing }, style]}>
      <Dot delay={0} size={dotSize} color={BrandTeal} />
      <Dot delay={150} size={dotSize} color={color} />
      <Dot delay={300} size={dotSize} color={BrandMint} />
    </View>
  );
}

export type WMLoadingSize = 'Small' | 'Medium' | 'Large';
const DOT_SIZE: Record<WMLoadingSize, number> = { Small: 7, Medium: 10, Large: 14 };

export function WMLoadingIndicator({
  label,
  size = 'Medium',
  color = BrandTeal,
  style,
}: {
  label?: string;
  size?: WMLoadingSize;
  color?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const theme = useWMTheme();
  return (
    <View style={[styles.column, { gap: 12 }, style]}>
      <WMBouncingDots dotSize={DOT_SIZE[size]} color={color} />
      {label ? <Text style={{ fontSize: 14, fontWeight: '500', color: theme.colorScheme.onSurfaceVariant }}>{label}</Text> : null}
    </View>
  );
}

/** Полноэкранный лоадер с маскотом (фон темы — без белой вспышки в тёмной теме). */
export function WMFullScreenLoading({ message }: { message?: string }) {
  const theme = useWMTheme();
  const { t } = useTranslation();
  return (
    <View style={[styles.fill, { backgroundColor: theme.colorScheme.background }]}>
      <View style={[styles.column, { gap: 16 }]}>
        <LinearGradient colors={[BrandTeal, BrandMint]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.mascot}>
          <Text style={{ fontSize: 36 }}>🐶</Text>
        </LinearGradient>
        <WMBouncingDots dotSize={12} />
        <Text style={{ fontSize: 15, fontWeight: '500', color: theme.colorScheme.onSurfaceVariant }}>{message ?? t('loading')}</Text>
      </View>
    </View>
  );
}

/** Замена CircularProgressIndicator. */
export function WMInlineLoader({ color = BrandTeal, style }: { color?: string; style?: StyleProp<ViewStyle> }) {
  return <WMBouncingDots dotSize={8} spacing={5} color={color} style={style} />;
}

// ─── WMLoadingAnimation ───────────────────────────────────────────────────────
function Bar({ i, width }: { i: number; width: number }) {
  const theme = useWMTheme();
  const maxH = [20, 32, 26, 18][i];
  const h = useSharedValue(6);
  useEffect(() => {
    h.value = withDelay(i * 120, withRepeat(withTiming(maxH, { duration: 520, easing: FAST_OUT_SLOW_IN }), -1, true));
  }, [h, i, maxH]);
  const primary = theme.colorScheme.primary;
  const anim = useAnimatedStyle(() => ({ height: h.value, opacity: 0.85 + 0.15 * (h.value / maxH) }));
  return <Animated.View style={[{ width, borderRadius: width / 2, backgroundColor: primary }, anim]} />;
}

function FadeDot({ i }: { i: number }) {
  const theme = useWMTheme();
  const a = useSharedValue(0.25);
  useEffect(() => {
    a.value = withDelay(i * 200, withRepeat(withTiming(1, { duration: 600, easing: FAST_OUT_SLOW_IN }), -1, true));
  }, [a, i]);
  const anim = useAnimatedStyle(() => ({ opacity: a.value }));
  return <Animated.View style={[{ width: 8, height: 8, borderRadius: 4, backgroundColor: theme.colorScheme.primary }, anim]} />;
}

export function WMLoadingAnimation({ barWidth = 5, spacing = 6, style }: { barWidth?: number; spacing?: number; style?: StyleProp<ViewStyle> }) {
  const perf = usePerformance((s) => s.active);
  return (
    <View style={[styles.center, style]}>
      <View style={[styles.row, { gap: spacing }]}>
        {perf ? [0, 1, 2].map((i) => <FadeDot key={i} i={i} />) : [0, 1, 2, 3].map((i) => <Bar key={i} i={i} width={barWidth} />)}
      </View>
    </View>
  );
}

// ─── Pull-to-refresh ──────────────────────────────────────────────────────────
function SignalBar({ i }: { i: number }) {
  const theme = useWMTheme();
  const maxH = [10, 16, 12][i];
  const h = useSharedValue(4);
  useEffect(() => {
    h.value = withDelay(i * 160, withRepeat(withTiming(maxH, { duration: 480, easing: FAST_OUT_SLOW_IN }), -1, true));
  }, [h, i, maxH]);
  const anim = useAnimatedStyle(() => ({ height: h.value }));
  return <Animated.View style={[{ width: 4, borderRadius: 2, backgroundColor: theme.colorScheme.primary }, anim]} />;
}

/**
 * Плашка с «сигнальными» полосами во время обновления (WMPullToRefreshIndicator).
 * Нативный жест iOS «потянуть» даёт WMRefreshControl ниже.
 */
export function WMRefreshingPill({ visible }: { visible: boolean }) {
  const theme = useWMTheme();
  const perf = usePerformance((s) => s.active);
  if (!visible) return null;
  if (perf) {
    return <View style={[styles.perfLine, { backgroundColor: withAlpha(theme.colorScheme.primary, 0.7) }]} />;
  }
  return (
    <View style={styles.pillWrap} pointerEvents="none">
      <View style={[styles.pill, { backgroundColor: withAlpha(theme.colorScheme.surfaceVariant, 0.95) }]}>
        {[0, 1, 2].map((i) => (
          <SignalBar key={i} i={i} />
        ))}
      </View>
    </View>
  );
}

/** RefreshControl в цветах темы (спиннер скрыт за WMRefreshingPill). */
export function WMRefreshControl(props: RefreshControlProps) {
  const theme = useWMTheme();
  return <RefreshControl tintColor={theme.colorScheme.primary} colors={[theme.colorScheme.primary]} {...props} />;
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  column: { alignItems: 'center' },
  center: { alignItems: 'center', justifyContent: 'center' },
  fill: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  mascot: { width: 64, height: 64, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  pillWrap: { position: 'absolute', top: 10, left: 0, right: 0, alignItems: 'center', zIndex: 10 },
  pill: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 5,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  perfLine: { position: 'absolute', top: 4, left: 0, right: 0, height: 3, borderRadius: 2, zIndex: 10 },
});
