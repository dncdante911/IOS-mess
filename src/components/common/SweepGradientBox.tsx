/**
 * Аналог Compose `.background(Brush.sweepGradient(colors), shape)`:
 * скруглённый прямоугольник (или круг при radius ≥ size/2), залитый
 * угловым градиентом через Skia. Дети рисуются поверх по центру с отступом.
 * Как и в Compose, угол 0 — направление «на 3 часа», по часовой стрелке.
 */
import React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { Canvas, RoundedRect, SweepGradient, vec } from '@shopify/react-native-skia';

export function SweepGradientBox({
  size,
  radius,
  colors,
  padding = 0,
  children,
  style,
}: {
  size: number;
  radius: number;
  colors: string[];
  padding?: number;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[{ width: size, height: size }, style]}>
      <Canvas style={{ position: 'absolute', width: size, height: size }} pointerEvents="none">
        <RoundedRect x={0} y={0} width={size} height={size} r={Math.min(radius, size / 2)}>
          <SweepGradient c={vec(size / 2, size / 2)} colors={colors} />
        </RoundedRect>
      </Canvas>
      <View style={{ flex: 1, padding, alignItems: 'center', justifyContent: 'center' }}>{children}</View>
    </View>
  );
}
