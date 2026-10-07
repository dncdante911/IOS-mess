/**
 * Общие компоненты — порты используемых на Android-экранах composable из
 * ui/components/CommonComponents.kt и ui/theme/ExpressiveComponents.kt.
 * (Неиспользуемые на Android — ShimmerEffect, WMSearchBar, GlassmorphicCard… —
 * не переносились.)
 */
import React, { useEffect } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSpring, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useWMTheme } from '../../theme/themeManager';
import { withAlpha, WMTypography } from '../../theme/wmTheme';
import { AndroidColors } from '../../theme/gen/colors';
import { luminance } from '../../theme/color';

// Spring.DampingRatioMediumBouncy = 0.5; StiffnessMedium = 1500; StiffnessHigh = 10000
const MEDIUM_BOUNCY = { dampingRatio: 0.5, stiffness: 1500 };

/** GradientButton — фирменная кнопка 56pt, горизонтальный градиент GradientStart→GradientEnd. */
export function GradientButton({
  text,
  onPress,
  enabled = true,
  isLoading = false,
  icon,
  style,
}: {
  text: string;
  onPress: () => void;
  enabled?: boolean;
  isLoading?: boolean;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const scale = useSharedValue(enabled ? 1 : 0.95);
  useEffect(() => {
    scale.value = withSpring(enabled ? 1 : 0.95, { dampingRatio: 0.5, stiffness: 1500 });
  }, [enabled, scale]);
  const anim = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const start = AndroidColors.GradientStart;
  const end = AndroidColors.GradientEnd;
  // Неактивная — тот же градиент, приглушённый (на Android так исправили «пустую белую плашку»)
  const colors: [string, string] = enabled ? [start, end] : [withAlpha(start, 0.32), withAlpha(end, 0.32)];
  return (
    <Animated.View
      style={[
        styles.gradientBtn,
        { shadowColor: AndroidColors.WMPrimary, shadowOpacity: 0.3, shadowRadius: enabled ? 8 : 2, shadowOffset: { width: 0, height: enabled ? 4 : 1 } },
        anim,
        style,
      ]}
    >
      <Pressable onPress={onPress} disabled={!enabled || isLoading} style={{ flex: 1 }}>
        <LinearGradient colors={colors} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={styles.gradientFill}>
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <View style={styles.rowCenter}>
              {icon ? <View style={{ marginRight: 8 }}>{icon}</View> : null}
              <Text style={{ color: enabled ? '#FFFFFF' : withAlpha('#FFFFFF', 0.7), fontSize: 16, fontWeight: '600' }}>{text}</Text>
            </View>
          )}
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

/** UnreadBadge — счётчик цветом темы (unreadBadge), текст тёмный на светлом фоне. */
export function UnreadBadge({ count, style }: { count: number; style?: StyleProp<ViewStyle> }) {
  const theme = useWMTheme();
  if (count <= 0) return null;
  const bg = theme.extended.unreadBadge;
  return (
    <View style={[styles.badge, { backgroundColor: bg }, style]}>
      <Text style={{ color: luminance(bg) > 0.5 ? '#0B1220' : '#FFFFFF', fontSize: 11, fontWeight: '700', textAlign: 'center' }}>
        {count > 99 ? '99+' : String(count)}
      </Text>
    </View>
  );
}

/** PulsingBadge — пульсирующий бейдж цвета error. */
export function PulsingBadge({ count, style }: { count: number; style?: StyleProp<ViewStyle> }) {
  const theme = useWMTheme();
  const s = useSharedValue(1);
  useEffect(() => {
    s.value = withRepeat(withTiming(1.1, { duration: 1000, easing: Easing.bezier(0.4, 0, 0.2, 1) }), -1, true);
  }, [s]);
  const anim = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));
  if (count <= 0) return null;
  return (
    <Animated.View style={[styles.m3Badge, { backgroundColor: theme.colorScheme.error }, anim, style]}>
      <Text style={[WMTypography.labelSmall, { color: '#FFFFFF' }]}>{count > 99 ? '99+' : String(count)}</Text>
    </Animated.View>
  );
}

/** TypingIndicator — три точки 8pt, подъём на 10pt, 600 мс, сдвиг 150 мс. */
export function TypingIndicator({ color, style }: { color?: string; style?: StyleProp<ViewStyle> }) {
  const c = color ?? AndroidColors.TypingIndicator;
  return (
    <View style={[styles.rowCenter, { gap: 4 }, style]}>
      {[0, 1, 2].map((i) => (
        <TypingDot key={i} index={i} color={c} />
      ))}
    </View>
  );
}

function TypingDot({ index, color }: { index: number; color: string }) {
  const y = useSharedValue(0);
  useEffect(() => {
    y.value = withDelay(index * 150, withRepeat(withTiming(-10, { duration: 600 }), -1, true));
  }, [index, y]);
  const anim = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));
  return <Animated.View style={[{ width: 8, height: 8, borderRadius: 4, backgroundColor: color }, anim]} />;
}

/** ChatGlassCard — непрозрачная карточка Telegram-стиля (surface, радиус 12). */
export function ChatGlassCard({
  onPress,
  enabled = true,
  style,
  children,
}: {
  onPress: () => void;
  enabled?: boolean;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}) {
  const theme = useWMTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={!enabled}
      style={({ pressed }) => [
        styles.glassCard,
        { backgroundColor: pressed ? theme.colorScheme.surfaceContainerHigh : theme.colorScheme.surface },
        style,
      ]}
    >
      {children}
    </Pressable>
  );
}

/** ExpressiveFAB — 56pt, градиент primary→tertiary, сжатие 0.92 при нажатии. */
export function ExpressiveFAB({
  onPress,
  colors,
  style,
  children,
}: {
  onPress: () => void;
  colors?: [string, string];
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}) {
  const theme = useWMTheme();
  const scale = useSharedValue(1);
  const elev = useSharedValue(8);
  const anim = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    shadowRadius: elev.value * 0.75,
    shadowOffset: { width: 0, height: elev.value * 0.45 },
  }));
  return (
    <Animated.View style={[styles.fab, anim, style]}>
      <Pressable
        onPress={onPress}
        onPressIn={() => {
          scale.value = withSpring(0.92, MEDIUM_BOUNCY);
          elev.value = withSpring(4, MEDIUM_BOUNCY);
        }}
        onPressOut={() => {
          scale.value = withSpring(1, MEDIUM_BOUNCY);
          elev.value = withSpring(8, MEDIUM_BOUNCY);
        }}
        style={{ flex: 1 }}
      >
        <LinearGradient
          colors={colors ?? [theme.colorScheme.primary, theme.colorScheme.tertiary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.fabFill]}
        >
          {children}
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

/** ExpressiveIconButton — 48pt, сжатие 0.9 при нажатии. */
export function ExpressiveIconButton({
  onPress,
  enabled = true,
  style,
  children,
}: {
  onPress: () => void;
  enabled?: boolean;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}) {
  const scale = useSharedValue(1);
  const anim = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <Animated.View style={[anim, style]}>
      <Pressable
        onPress={onPress}
        disabled={!enabled}
        onPressIn={() => (scale.value = withSpring(0.9, { dampingRatio: 0.5, stiffness: 10000 }))}
        onPressOut={() => (scale.value = withSpring(1, { dampingRatio: 0.5, stiffness: 10000 }))}
        style={[styles.iconBtn, { opacity: enabled ? 1 : 0.38 }]}
        hitSlop={4}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}

/** GlassTopAppBar — M3 TopAppBar на полупрозрачном surface (55%), при прокрутке — surfaceContainer 92%. */
export function GlassTopAppBar({
  title,
  navigationIcon,
  actions,
  scrolled = false,
  style,
}: {
  title: React.ReactNode;
  navigationIcon?: React.ReactNode;
  actions?: React.ReactNode;
  scrolled?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const theme = useWMTheme();
  const insets = useSafeAreaInsets();
  const cs = theme.colorScheme;
  return (
    <View
      style={[
        { paddingTop: insets.top, backgroundColor: scrolled ? withAlpha(cs.surfaceContainer, 0.92) : withAlpha(cs.surface, 0.55) },
        style,
      ]}
    >
      <View style={styles.appBar}>
        {navigationIcon ? <View style={styles.navIcon}>{navigationIcon}</View> : <View style={{ width: 16 }} />}
        <View style={{ flex: 1 }}>
          {typeof title === 'string' ? (
            <Text numberOfLines={1} style={[WMTypography.titleLarge, { color: cs.onSurface }]}>
              {title}
            </Text>
          ) : (
            title
          )}
        </View>
        {actions ? <View style={styles.rowCenter}>{actions}</View> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  rowCenter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  gradientBtn: { height: 56, borderRadius: 16 },
  gradientFill: { flex: 1, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  badge: { minWidth: 20, minHeight: 20, borderRadius: 10, paddingHorizontal: 6, paddingVertical: 2, alignItems: 'center', justifyContent: 'center' },
  m3Badge: { minWidth: 16, height: 16, borderRadius: 8, paddingHorizontal: 4, alignItems: 'center', justifyContent: 'center' },
  glassCard: {
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 1,
    shadowOffset: { width: 0, height: 0.5 },
  },
  fab: { width: 56, height: 56, borderRadius: 16, shadowColor: '#000', shadowOpacity: 0.25 },
  fabFill: { flex: 1, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  iconBtn: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  appBar: { height: 64, flexDirection: 'row', alignItems: 'center', paddingRight: 4 },
  navIcon: { width: 56, alignItems: 'center' },
});
