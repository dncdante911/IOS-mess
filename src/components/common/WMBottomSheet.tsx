/**
 * WMBottomSheet — аналог Material 3 ModalBottomSheet (Compose):
 * затемнение scrim 32%, выезд снизу, «ручка» 32×4, верхние углы 28,
 * закрытие тапом по фону, свайпом вниз и кнопкой «назад».
 * Содержимое прокручивается, если не помещается (до 90% высоты экрана).
 *
 * iOS: RN Modal — отдельный контроллер поверх корня, поэтому Paper-диалоги
 * (Portal) и тосты корня окажутся ПОД шторкой. Внутри — свой Portal.Host и
 * WMToastHost; вложенные шторки/диалоги рендерить внутри children.
 */
import React, { useEffect, useState } from 'react';
import { Dimensions, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { Easing, runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Portal } from 'react-native-paper';
import { WMToastHost } from './WMToast';
import { useWMTheme } from '../../theme/themeManager';
import { withAlpha } from '../../theme/wmTheme';

export function WMBottomSheet({
  visible,
  onDismiss,
  children,
  containerColor,
  scrollable = true,
  style,
}: {
  visible: boolean;
  onDismiss: () => void;
  children?: React.ReactNode;
  containerColor?: string;
  scrollable?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const theme = useWMTheme();
  const insets = useSafeAreaInsets();
  const screenH = Dimensions.get('window').height;
  const ty = useSharedValue(screenH);
  const scrim = useSharedValue(0);
  const [mounted, setMounted] = useState(visible);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      ty.value = withTiming(0, { duration: 260, easing: Easing.bezier(0.2, 0, 0, 1) });
      scrim.value = withTiming(1, { duration: 200 });
    } else if (mounted) {
      ty.value = withTiming(screenH, { duration: 200 }, (done) => {
        if (done) runOnJS(setMounted)(false);
      });
      scrim.value = withTiming(0, { duration: 200 });
    }
  }, [visible, mounted, screenH, ty, scrim]);

  const drag = Gesture.Pan()
    .onUpdate((e) => {
      ty.value = Math.max(0, e.translationY);
    })
    .onEnd((e) => {
      if (e.translationY > 120 || e.velocityY > 900) runOnJS(onDismiss)();
      else ty.value = withTiming(0, { duration: 180 });
    });

  const sheetStyle = useAnimatedStyle(() => ({ transform: [{ translateY: ty.value }] }));
  const scrimStyle = useAnimatedStyle(() => ({ opacity: scrim.value }));

  if (!mounted) return null;
  const Body = scrollable ? ScrollView : View;

  return (
    <Modal transparent visible animationType="none" onRequestClose={onDismiss} statusBarTranslucent>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Portal.Host>
          <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: withAlpha(theme.colorScheme.scrim, 0.32) }, scrimStyle]}>
            <Pressable style={StyleSheet.absoluteFill} onPress={onDismiss} />
          </Animated.View>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.kav} pointerEvents="box-none">
            <Animated.View
              style={[
                styles.sheet,
                { backgroundColor: containerColor ?? theme.colorScheme.surfaceContainerLow, maxHeight: screenH * 0.9, paddingBottom: insets.bottom },
                sheetStyle,
                style,
              ]}
            >
              <GestureDetector gesture={drag}>
                <View style={styles.handleArea}>
                  <View style={[styles.handle, { backgroundColor: withAlpha(theme.colorScheme.onSurfaceVariant, 0.4) }]} />
                </View>
              </GestureDetector>
              <Body bounces={false}>{children}</Body>
            </Animated.View>
          </KeyboardAvoidingView>
          <WMToastHost />
        </Portal.Host>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  kav: { flex: 1, justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, overflow: 'hidden' },
  handleArea: { alignItems: 'center', paddingVertical: 22 },
  handle: { width: 32, height: 4, borderRadius: 2 },
});
