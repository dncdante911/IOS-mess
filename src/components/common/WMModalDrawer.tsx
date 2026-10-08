/**
 * WMModalDrawer — аналог Material 3 ModalNavigationDrawer (Compose):
 * панель слева поверх контента (ширина 316, скругление справа 28), затемнение
 * scrim 32%, открытие свайпом от левого края (gesturesEnabled), закрытие
 * свайпом влево / тапом по затемнению. Пружина без отскока.
 */
import React, { useEffect } from 'react';
import { BackHandler, Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { interpolate, runOnJS, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useWMTheme } from '../../theme/themeManager';
import { withAlpha } from '../../theme/wmTheme';

const SPRING = { dampingRatio: 1, stiffness: 600 };
const EDGE = 20;

export function WMModalDrawer({
  open,
  onOpenChange,
  drawerContent,
  children,
  width = 316,
  gesturesEnabled = true,
  containerColor,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  drawerContent: React.ReactNode;
  children: React.ReactNode;
  width?: number;
  gesturesEnabled?: boolean;
  containerColor?: string;
}) {
  const cs = useWMTheme().colorScheme;
  const { width: screenW } = useWindowDimensions();
  const w = Math.min(width, screenW - 56);
  // 0 — закрыт, 1 — открыт
  const progress = useSharedValue(open ? 1 : 0);
  const start = useSharedValue(0);

  useEffect(() => {
    progress.value = withSpring(open ? 1 : 0, SPRING);
  }, [open, progress]);

  useEffect(() => {
    if (!open) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      onOpenChange(false);
      return true;
    });
    return () => sub.remove();
  }, [open, onOpenChange]);

  const settle = (velocityX: number) => {
    'worklet';
    const target = velocityX > 500 ? 1 : velocityX < -500 ? 0 : progress.value > 0.5 ? 1 : 0;
    progress.value = withSpring(target, SPRING);
    runOnJS(onOpenChange)(target === 1);
  };

  const edgePan = Gesture.Pan()
    .enabled(gesturesEnabled && !open)
    .activeOffsetX(10)
    .failOffsetY([-15, 15])
    .onUpdate((e) => {
      progress.value = Math.min(1, Math.max(0, e.translationX / w));
    })
    .onEnd((e) => settle(e.velocityX));

  const closePan = Gesture.Pan()
    .enabled(open)
    .activeOffsetX(-10)
    .failOffsetY([-15, 15])
    .onStart(() => {
      start.value = progress.value;
    })
    .onUpdate((e) => {
      progress.value = Math.min(1, Math.max(0, start.value + e.translationX / w));
    })
    .onEnd((e) => settle(e.velocityX));

  const panelStyle = useAnimatedStyle(() => ({ transform: [{ translateX: interpolate(progress.value, [0, 1], [-w - 8, 0]) }] }));
  const scrimStyle = useAnimatedStyle(() => ({ opacity: progress.value }));
  const overlayPointer = useAnimatedStyle(() => ({ display: progress.value > 0.001 ? 'flex' : 'none' }));

  return (
    <View style={{ flex: 1 }}>
      {children}

      {gesturesEnabled && !open && (
        <GestureDetector gesture={edgePan}>
          <View style={[styles.edge, { width: EDGE }]} />
        </GestureDetector>
      )}

      <Animated.View style={[StyleSheet.absoluteFill, overlayPointer]} pointerEvents={open ? 'auto' : 'box-none'}>
        <GestureDetector gesture={closePan}>
          <View style={StyleSheet.absoluteFill}>
            <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: withAlpha(cs.scrim, 0.32) }, scrimStyle]}>
              <Pressable style={StyleSheet.absoluteFill} onPress={() => onOpenChange(false)} accessibilityRole="button" />
            </Animated.View>
            <Animated.View
              style={[styles.panel, { width: w, backgroundColor: containerColor ?? cs.surfaceContainerLow }, panelStyle]}
            >
              {drawerContent}
            </Animated.View>
          </View>
        </GestureDetector>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  edge: { position: 'absolute', left: 0, top: 0, bottom: 0 },
  panel: { position: 'absolute', left: 0, top: 0, bottom: 0, borderTopRightRadius: 28, borderBottomRightRadius: 28, overflow: 'hidden' },
});
