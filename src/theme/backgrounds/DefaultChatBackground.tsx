/**
 * DefaultChatBackground — порт Android ui/theme/DefaultChatBackground.kt.
 * Фон чата по умолчанию в духе Telegram: «mesh»-градиент из четырёх
 * радиальных пятен по углам + точечная гекс-текстура.
 *
 *   светлый: тёплый #F2ECE6 + голубой/лавандовый/мятный/персиковый + белое
 *            пятно в центре для читаемости
 *   тёмный:  Telegram Night #17212B + индиго/тил/navy/фиолет
 *
 * Значения Canvas на Android заданы в px (spacing 26, r 1.5); здесь они
 * пересчитаны в pt делением на PixelRatio — физически тот же рисунок.
 */
import React, { useMemo, useState } from 'react';
import { PixelRatio, StyleSheet, View, type LayoutChangeEvent, type StyleProp, type ViewStyle } from 'react-native';
import { Canvas, Points, RadialGradient, Rect, vec } from '@shopify/react-native-skia';
import { useWMTheme } from '../themeManager';
import { luminance } from '../color';

const LIGHT = { base: '#F2ECE6', tl: '#9EC9E8', tr: '#B8A0E8', bl: '#8ECFB0', br: '#E8B090', dot: '#30587030' };
const DARK = { base: '#17212B', tl: '#2A1F55', tr: '#0F3040', bl: '#152540', br: '#221535', dot: '#FFFFFF20' };
const TRANSPARENT = '#00000000';

export function DefaultChatBackground({ style }: { style?: StyleProp<ViewStyle> }) {
  const theme = useWMTheme();
  // Как на Android: тёмный — по фону САМОЙ темы, а не по системному режиму
  const isDark = luminance(theme.colorScheme.background) < 0.05;
  const [size, setSize] = useState({ w: 0, h: 0 });
  const c = isDark ? DARK : LIGHT;

  const dots = useMemo(() => {
    const { w, h } = size;
    if (!w || !h) return [];
    const px = PixelRatio.get();
    const spacingX = 26 / px;
    const spacingY = spacingX * 0.866;
    const cols = Math.floor(w / spacingX) + 2;
    const rows = Math.floor(h / spacingY) + 2;
    const out = [];
    for (let row = 0; row <= rows; row++) {
      const offsetX = row % 2 === 0 ? 0 : spacingX / 2;
      for (let col = 0; col <= cols; col++) out.push(vec(col * spacingX + offsetX, row * spacingY));
    }
    return out;
  }, [size]);

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width !== size.w || height !== size.h) setSize({ w: width, h: height });
  };

  const { w, h } = size;
  const blobR = Math.max(w, h) * 0.85;
  const dotR = 1.5 / PixelRatio.get();

  return (
    <View style={[StyleSheet.absoluteFill, style]} onLayout={onLayout} pointerEvents="none">
      {w > 0 && (
        <Canvas style={StyleSheet.absoluteFill}>
          <Rect x={0} y={0} width={w} height={h} color={c.base} />
          {(
            [
              [0, 0, c.tl],
              [w, 0, c.tr],
              [0, h, c.bl],
              [w, h, c.br],
            ] as const
          ).map(([x, y, col], i) => (
            <Rect key={i} x={0} y={0} width={w} height={h}>
              <RadialGradient c={vec(x, y)} r={blobR} colors={[col, TRANSPARENT]} />
            </Rect>
          ))}
          {!isDark && (
            <Rect x={0} y={0} width={w} height={h}>
              <RadialGradient c={vec(w / 2, h / 2)} r={Math.min(w, h) * 0.55} colors={['#FFFFFFA0', TRANSPARENT]} />
            </Rect>
          )}
          <Points points={dots} mode="points" color={c.dot} strokeWidth={dotR * 2} strokeCap="round" />
        </Canvas>
      )}
    </View>
  );
}
