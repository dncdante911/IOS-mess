/**
 * StyledBubble — порт Android ui/messages/BubbleStyles.kt: 20 стилей пузыря
 * (BubbleStyle), те же формы, отступы, тени, рамки, градиенты и анимации.
 *
 * Перевод единиц:
 *   • .dp → pt один в один
 *   • px из GenericShape/Brush (COMIC, GUM endY) → pt / PixelRatio
 *   • Compose elevation → тень iOS (shadow*), spotColor → shadowColor
 *
 * Пузырь — контейнер: текст, медиа и время рисует вызывающий (как content
 * у Composable).
 */
import React, { useEffect, useState } from 'react';
import { PixelRatio, StyleSheet, View, type LayoutChangeEvent, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withSpring, withTiming } from 'react-native-reanimated';
import { Canvas, Path, RadialGradient, Rect, Skia, vec } from '@shopify/react-native-skia';
import { useWMTheme } from '../../theme/themeManager';
import { withAlpha } from '../../theme/wmTheme';
import { luminance } from '../../theme/color';
import type { BubbleStyle } from '../../preferences/uiStyle';

export interface StyledBubbleProps {
  bubbleStyle: BubbleStyle;
  isOwn: boolean;
  bgColor: string;
  isFirstInGroup?: boolean;
  isLastInGroup?: boolean;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}

type Radii = [tl: number, tr: number, br: number, bl: number];
const r = ([tl, tr, br, bl]: Radii): ViewStyle => ({
  borderTopLeftRadius: tl,
  borderTopRightRadius: tr,
  borderBottomRightRadius: br,
  borderBottomLeftRadius: bl,
});

/** Compose elevation → тень iOS. */
function elevation(dp: number, color = '#000000', opacity = 0.22): ViewStyle {
  return {
    shadowColor: color,
    shadowOpacity: dp > 0 ? opacity : 0,
    shadowRadius: dp * 0.75,
    shadowOffset: { width: 0, height: dp * 0.45 },
  };
}

const PAD = (h: number, v: number): ViewStyle => ({ paddingHorizontal: h, paddingVertical: v });

/** bubbleShape(): 18 крупный, 6 — рядом с соседним, 4 — «хвост» у последнего. */
function groupedRadii(isOwn: boolean, first: boolean, last: boolean): Radii {
  const L = 18;
  const G = 6;
  const T = 4;
  return isOwn ? [L, first ? L : G, last ? T : G, L] : [first ? L : G, L, L, last ? T : G];
}

function useIsDarkBg(): boolean {
  return luminance(useWMTheme().colorScheme.background) < 0.5;
}

/** Слой поверх фона (градиент-блик), обрезанный формой родителя. */
function Overlay({ colors, endY }: { colors: [string, string]; endY?: number }) {
  return (
    <LinearGradient
      colors={colors}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      locations={endY !== undefined ? undefined : [0, 1]}
      style={endY !== undefined ? [styles.overlayTop, { height: endY }] : StyleSheet.absoluteFill}
      pointerEvents="none"
    />
  );
}

/** Фон произвольной формы (COMIC, FOLDED) на Skia за содержимым. */
function PathBackground({
  build,
  color,
  children,
  style,
  contentStyle,
}: {
  build: (w: number, h: number) => ReturnType<typeof Skia.Path.Make>;
  color: string;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
}) {
  const [size, setSize] = useState({ w: 0, h: 0 });
  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width !== size.w || height !== size.h) setSize({ w: width, h: height });
  };
  return (
    <View style={style} onLayout={onLayout}>
      {size.w > 0 && (
        <Canvas style={StyleSheet.absoluteFill} pointerEvents="none">
          <Path path={build(size.w, size.h)} color={color} />
        </Canvas>
      )}
      <View style={contentStyle}>{children}</View>
    </View>
  );
}

// ─── Стили ────────────────────────────────────────────────────────────────────

function Standard({ isOwn, bgColor, isFirstInGroup = true, isLastInGroup = true, style, children }: StyledBubbleProps) {
  const radii = r(groupedRadii(isOwn, isFirstInGroup, isLastInGroup));
  return (
    <View style={[radii, elevation(isOwn ? 3 : 1), { backgroundColor: bgColor }, style]}>
      <View style={[radii, styles.clip]}>
        {isOwn && <Overlay colors={[withAlpha('#FFFFFF', 0.1), 'transparent']} />}
        <View style={PAD(12, 6)}>{children}</View>
      </View>
    </View>
  );
}

function Comic({ isOwn, bgColor, style, children }: StyledBubbleProps) {
  const px = PixelRatio.get();
  const tailH = 15 / px;
  const cr = 40 / px;
  const build = (w: number, h: number) => {
    const p = Skia.Path.Make();
    const b = h - tailH;
    p.moveTo(cr, 0);
    p.lineTo(w - cr, 0);
    p.quadTo(w, 0, w, cr);
    p.lineTo(w, b - cr);
    p.quadTo(w, b, w - cr, b);
    if (isOwn) {
      p.lineTo(w - 40 / px, b);
      p.lineTo(w - 10 / px, h);
      p.lineTo(w - 50 / px, b);
    } else {
      p.lineTo(50 / px, b);
      p.lineTo(10 / px, h);
      p.lineTo(40 / px, b);
    }
    p.lineTo(cr, b);
    p.quadTo(0, b, 0, b - cr);
    p.lineTo(0, cr);
    p.quadTo(0, 0, cr, 0);
    p.close();
    return p;
  };
  return (
    <View style={[elevation(isOwn ? 5 : 2, bgColor, isOwn ? 0.5 : 0.15), style]}>
      <PathBackground build={build} color={bgColor} contentStyle={[PAD(12, 6), { paddingBottom: 6 + tailH }]}>
        {children}
      </PathBackground>
    </View>
  );
}

function Minimal({ isOwn, bgColor, style, children }: StyledBubbleProps) {
  const theme = useWMTheme();
  return (
    <View style={[styles.row, style]}>
      {!isOwn && (
        <View
          style={{
            width: 3,
            alignSelf: 'stretch',
            borderTopLeftRadius: 22,
            borderBottomLeftRadius: 22,
            backgroundColor: withAlpha(theme.colorScheme.primary, 0.55),
          }}
        />
      )}
      <View style={[isOwn ? { borderRadius: 22 } : r([0, 22, 22, 0]), { backgroundColor: bgColor }, PAD(14, 6)]}>{children}</View>
    </View>
  );
}

function Modern({ isOwn, style, children }: StyledBubbleProps) {
  const theme = useWMTheme();
  const cs = theme.colorScheme;
  const dark = useIsDarkBg();
  const colors: [string, string] = isOwn ? [cs.primary, withAlpha(cs.tertiary, 0.88)] : [cs.surfaceVariant, cs.surface];
  return (
    <View style={[{ borderRadius: 18 }, elevation(isOwn ? 4 : 2, isOwn ? cs.primary : '#000000', isOwn ? 0.4 : 0.08), style]}>
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          { borderRadius: 18, borderWidth: 0.5, borderColor: withAlpha('#FFFFFF', dark ? 0.1 : 0.55) },
          PAD(14, 6),
        ]}
      >
        {children}
      </LinearGradient>
    </View>
  );
}

function Retro({ isOwn, style, children }: StyledBubbleProps) {
  const dark = useIsDarkBg();
  const bg = isOwn ? (dark ? '#8B6914' : '#FFE082') : dark ? '#4A3680' : '#B39DDB';
  const border = isOwn ? (dark ? '#C47F00' : '#FF6F00') : dark ? '#7E57C2' : '#5E35B1';
  return <View style={[{ borderRadius: 8, backgroundColor: bg, borderWidth: 2, borderColor: border }, PAD(12, 5), style]}>{children}</View>;
}

function Glass({ isOwn, bgColor, style, children }: StyledBubbleProps) {
  const dark = useIsDarkBg();
  const glass = isOwn ? withAlpha(bgColor, dark ? 0.65 : 0.55) : dark ? withAlpha('#2A2F3A', 0.7) : withAlpha('#FFFFFF', 0.45);
  return (
    <View
      style={[
        { borderRadius: 20, backgroundColor: glass, borderWidth: 0.5, borderColor: withAlpha('#FFFFFF', dark ? 0.1 : 0.4) },
        elevation(4),
        PAD(14, 6),
        style,
      ]}
    >
      {children}
    </View>
  );
}

function Neon({ isOwn, style, children }: StyledBubbleProps) {
  const neon = isOwn ? '#00FF88' : '#00BFFF';
  return (
    <View
      style={[
        { borderRadius: 16, backgroundColor: '#1A1A2E', borderWidth: 1.5, borderColor: withAlpha(neon, 0.8) },
        { shadowColor: neon, shadowOpacity: 0.6, shadowRadius: 10, shadowOffset: { width: 0, height: 0 } },
        PAD(12, 6),
        style,
      ]}
    >
      {children}
    </View>
  );
}

function Gradient({ isOwn, style, children }: StyledBubbleProps) {
  const cs = useWMTheme().colorScheme;
  const [size, setSize] = useState({ w: 0, h: 0 });
  const colors = isOwn ? [cs.tertiary, withAlpha(cs.primary, 0.85)] : [cs.surface, withAlpha(cs.surfaceVariant, 0.9)];
  return (
    <View
      style={[{ borderRadius: 24 }, elevation(isOwn ? 5 : 2, isOwn ? cs.tertiary : '#000000', isOwn ? 0.5 : 0.07), style]}
      onLayout={(e) => setSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}
    >
      <View style={[{ borderRadius: 24 }, styles.clip]}>
        {size.w > 0 && (
          // Brush.radialGradient без параметров: центр — середина, радиус — половина большей стороны
          <Canvas style={StyleSheet.absoluteFill} pointerEvents="none">
            <Rect x={0} y={0} width={size.w} height={size.h}>
              <RadialGradient c={vec(size.w / 2, size.h / 2)} r={Math.max(size.w, size.h) / 2} colors={colors} />
            </Rect>
          </Canvas>
        )}
        <View style={PAD(14, 7)}>{children}</View>
      </View>
    </View>
  );
}

function Neumorphism({ isOwn, style, children }: StyledBubbleProps) {
  const cs = useWMTheme().colorScheme;
  const dark = useIsDarkBg();
  const surface = isOwn ? cs.primaryContainer : cs.surfaceVariant;
  return (
    <View
      style={[
        { borderRadius: 22, backgroundColor: surface },
        elevation(isOwn ? 10 : 5, isOwn ? cs.primary : '#000000', isOwn ? (dark ? 0.4 : 0.28) : dark ? 0.3 : 0.12),
        style,
      ]}
    >
      <View style={[{ borderRadius: 22 }, styles.clip]}>
        <Overlay colors={[withAlpha('#FFFFFF', dark ? 0.22 : 0.55), 'transparent']} />
        <Overlay colors={['transparent', withAlpha('#000000', dark ? 0.28 : 0.1)]} />
        <View style={PAD(14, 6)}>{children}</View>
      </View>
    </View>
  );
}

function Soft({ isOwn, style, children }: StyledBubbleProps) {
  const cs = useWMTheme().colorScheme;
  const bg = isOwn ? withAlpha(cs.primary, 0.15) : withAlpha(cs.surfaceVariant, 0.7);
  return <View style={[{ borderRadius: 24, backgroundColor: bg }, PAD(12, 6), style]}>{children}</View>;
}

function Outlined({ isOwn, style, children }: StyledBubbleProps) {
  const cs = useWMTheme().colorScheme;
  const border = isOwn ? withAlpha(cs.primary, 0.7) : withAlpha(cs.onSurface, 0.3);
  return <View style={[{ borderRadius: 18, borderWidth: 1.5, borderColor: border }, PAD(12, 6), style]}>{children}</View>;
}

/** 💫 PULSE — пружинное появление 0.9→1 + затухающее свечение 550 мс (один раз). */
function Pulse(props: StyledBubbleProps) {
  const { isOwn, bgColor, isFirstInGroup = true, isLastInGroup = true, style, children } = props;
  const scale = useSharedValue(0.9);
  const glow = useSharedValue(0.55);
  useEffect(() => {
    // Spring.DampingRatioMediumBouncy = 0.5, StiffnessLow = 200
    scale.value = withSpring(1, { dampingRatio: 0.5, stiffness: 200 });
    glow.value = withTiming(0, { duration: 550 });
  }, [scale, glow]);
  const anim = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    shadowRadius: Math.max(isOwn ? 2.25 : 0.75, glow.value * 14),
    shadowOpacity: Math.max(0.22, glow.value),
  }));
  const radii = r(groupedRadii(isOwn, isFirstInGroup, isLastInGroup));
  return (
    <Animated.View style={[radii, { backgroundColor: bgColor, shadowColor: bgColor, shadowOffset: { width: 0, height: 1 } }, anim, style]}>
      <View style={PAD(12, 6)}>{children}</View>
    </Animated.View>
  );
}

/** ✨ SHIMMER — одна диагональная полоса блика через 80 мс, 700 мс, затем исчезает. */
function Shimmer(props: StyledBubbleProps) {
  const { isOwn, bgColor, isFirstInGroup = true, isLastInGroup = true, style, children } = props;
  const [w, setW] = useState(0);
  const [done, setDone] = useState(false);
  const sweep = useSharedValue(0);
  useEffect(() => {
    // FastOutSlowInEasing = cubic-bezier(0.4, 0, 0.2, 1)
    sweep.value = withDelay(80, withTiming(1, { duration: 700, easing: Easing.bezier(0.4, 0, 0.2, 1) }));
    const t = setTimeout(() => setDone(true), 820);
    return () => clearTimeout(t);
  }, [sweep]);
  const anim = useAnimatedStyle(() => ({ transform: [{ translateX: sweep.value * w * 2.2 - w }] }));
  const radii = r(groupedRadii(isOwn, isFirstInGroup, isLastInGroup));
  return (
    <View style={[radii, elevation(isOwn ? 3 : 1), { backgroundColor: bgColor }, style]} onLayout={(e) => setW(e.nativeEvent.layout.width)}>
      <View style={[radii, styles.clip]}>
        <View style={PAD(12, 6)}>{children}</View>
        {!done && w > 0 && (
          <Animated.View style={[StyleSheet.absoluteFill, anim]} pointerEvents="none">
            <LinearGradient
              colors={['transparent', withAlpha('#FFFFFF', 0.28), 'transparent']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>
        )}
      </View>
    </View>
  );
}

function Wave({ isOwn, bgColor, style, children }: StyledBubbleProps) {
  const radii = isOwn ? r([22, 8, 22, 22]) : r([8, 22, 22, 22]);
  return <View style={[radii, { backgroundColor: bgColor }, PAD(12, 6), style]}>{children}</View>;
}

function Bold({ isOwn, bgColor, style, children }: StyledBubbleProps) {
  const cs = useWMTheme().colorScheme;
  const radii = isOwn ? r([14, 14, 4, 14]) : r([14, 14, 14, 4]);
  return (
    <View style={[radii, { backgroundColor: bgColor, borderWidth: 2.5, borderColor: isOwn ? cs.primary : cs.outline }, PAD(12, 6), style]}>
      {children}
    </View>
  );
}

function Note({ isOwn, bgColor, style, children }: StyledBubbleProps) {
  const radii = isOwn ? r([2, 16, 16, 2]) : r([16, 2, 2, 16]);
  return (
    <View style={[radii, { backgroundColor: bgColor, transform: [{ rotate: isOwn ? '-0.7deg' : '0.7deg' }] }, elevation(3), PAD(12, 6), style]}>
      {children}
    </View>
  );
}

function Folded({ isOwn, bgColor, style, children }: StyledBubbleProps) {
  const build = (w: number, h: number) => {
    const fold = Math.min(w, h) * 0.18;
    const p = Skia.Path.Make();
    if (isOwn) {
      p.moveTo(0, 0);
      p.lineTo(w - fold, 0);
      p.lineTo(w, fold);
      p.lineTo(w, h);
      p.lineTo(0, h);
    } else {
      p.moveTo(fold, 0);
      p.lineTo(w, 0);
      p.lineTo(w, h);
      p.lineTo(0, h);
      p.lineTo(0, fold);
    }
    p.close();
    return p;
  };
  return (
    <PathBackground build={build} color={bgColor} style={style} contentStyle={PAD(12, 8)}>
      {children}
    </PathBackground>
  );
}

function Gum({ isOwn, bgColor, style, children }: StyledBubbleProps) {
  const radii = isOwn ? r([999, 999, 6, 999]) : r([999, 999, 999, 6]);
  return (
    <View style={[radii, { backgroundColor: bgColor }, styles.clip, style]}>
      {/* Brush.verticalGradient(endY = 40f px) */}
      <Overlay colors={[withAlpha('#FFFFFF', 0.2), 'transparent']} endY={40 / PixelRatio.get()} />
      <View style={PAD(18, 10)}>{children}</View>
    </View>
  );
}

function IosPill({ isOwn, bgColor, style, children }: StyledBubbleProps) {
  const radii = isOwn ? r([22, 22, 6, 22]) : r([22, 22, 22, 6]);
  return <View style={[radii, { backgroundColor: bgColor }, PAD(16, 10), style]}>{children}</View>;
}

/** Фабрика StyledBubble(): TELEGRAM рисуется как STANDARD — так на Android. */
export function StyledBubble(props: StyledBubbleProps) {
  switch (props.bubbleStyle) {
    case 'STANDARD':
    case 'TELEGRAM':
      return <Standard {...props} />;
    case 'COMIC':
      return <Comic {...props} />;
    case 'MINIMAL':
      return <Minimal {...props} />;
    case 'MODERN':
      return <Modern {...props} />;
    case 'RETRO':
      return <Retro {...props} />;
    case 'GLASS':
      return <Glass {...props} />;
    case 'NEON':
      return <Neon {...props} />;
    case 'GRADIENT':
      return <Gradient {...props} />;
    case 'NEUMORPHISM':
      return <Neumorphism {...props} />;
    case 'SOFT':
      return <Soft {...props} />;
    case 'OUTLINED':
      return <Outlined {...props} />;
    case 'PULSE':
      return <Pulse {...props} />;
    case 'SHIMMER':
      return <Shimmer {...props} />;
    case 'WAVE':
      return <Wave {...props} />;
    case 'BOLD':
      return <Bold {...props} />;
    case 'NOTE':
      return <Note {...props} />;
    case 'FOLDED':
      return <Folded {...props} />;
    case 'GUM':
      return <Gum {...props} />;
    case 'IOS_PILL':
      return <IosPill {...props} />;
    default:
      return <Standard {...props} />;
  }
}

const styles = StyleSheet.create({
  clip: { overflow: 'hidden' },
  row: { flexDirection: 'row' },
  overlayTop: { position: 'absolute', top: 0, left: 0, right: 0 },
});
