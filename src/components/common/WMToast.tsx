/**
 * WMToast — порт Android ui/components/WMToast.kt: фирменное всплывающее
 * уведомление в цветах темы (inverseSurface, как M3 Snackbar) с пружинной
 * анимацией. Короткое 2.2 с, длинное (или > 80 символов) 3.8 с; тап — закрыть.
 *
 *   WMToast.show(t('saved'))            — как WMToast.show(context, text)
 *   WMToast.show(text, true)            — long = true
 * Сообщения ядра (emitToast из core/api, karma и т.д.) показываются тем же хостом.
 */
import React, { useEffect, useRef, useState } from 'react';
import { Keyboard, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { create } from 'zustand';
import { appEvents, APP_EVENT_TOAST, type ToastEvent } from '../../core/platform/events';
import { useWMTheme } from '../../theme/themeManager';
import { WMMotion, WMTypography } from '../../theme/wmTheme';

const SHORT_MS = 2200;
const LONG_MS = 3800;

interface ToastMessage {
  id: number;
  text: string;
  expiresAt: number;
}

const useToast = create<{ current: ToastMessage | null }>(() => ({ current: null }));
let seq = 0;

export const WMToast = {
  show(text: string | null | undefined, long = false): void {
    const msg = text?.trim();
    if (!msg) return;
    const duration = long || msg.length > 80 ? LONG_MS : SHORT_MS;
    useToast.setState({ current: { id: ++seq, text: msg, expiresAt: Date.now() + duration } });
  },
  dismiss(id: number): void {
    if (useToast.getState().current?.id === id) useToast.setState({ current: null });
  },
};

// Тосты из ядра (core/platform/events)
appEvents.on(APP_EVENT_TOAST, (e: ToastEvent) => WMToast.show(e.text, e.kind === 'error'));

/** Хост — один на приложение, поверх навигации (WorldMatesThemedApp). */
export function WMToastHost() {
  const theme = useWMTheme();
  const insets = useSafeAreaInsets();
  const message = useToast((s) => s.current);
  const [shown, setShown] = useState<ToastMessage | null>(null);
  const [kbHeight, setKbHeight] = useState(0);
  const translate = useSharedValue(40);
  const scale = useSharedValue(0.92);
  const opacity = useSharedValue(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const s1 = Keyboard.addListener('keyboardWillShow', (e) => setKbHeight(e.endCoordinates.height));
    const s2 = Keyboard.addListener('keyboardWillHide', () => setKbHeight(0));
    return () => {
      s1.remove();
      s2.remove();
    };
  }, []);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    const spatial = { dampingRatio: WMMotion.defaultSpatial.dampingRatio, stiffness: WMMotion.defaultSpatial.stiffness };
    const fast = { dampingRatio: WMMotion.fastEffects.dampingRatio, stiffness: WMMotion.fastEffects.stiffness };
    if (message) {
      setShown(message);
      translate.value = withSpring(0, spatial);
      scale.value = withSpring(1, { dampingRatio: WMMotion.fastSpatial.dampingRatio, stiffness: WMMotion.fastSpatial.stiffness });
      opacity.value = withSpring(1, fast);
      timer.current = setTimeout(() => WMToast.dismiss(message.id), Math.max(0, message.expiresAt - Date.now()));
    } else {
      translate.value = withSpring(30, fast);
      scale.value = withSpring(0.96, fast);
      opacity.value = withSpring(0, fast);
    }
  }, [message, translate, scale, opacity]);

  const anim = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translate.value }, { scale: scale.value }],
  }));

  const text = (message ?? shown)?.text ?? '';
  const display = message ?? shown;
  return (
    <View
      pointerEvents="box-none"
      style={[styles.host, { bottom: Math.max(insets.bottom, kbHeight) + 96, left: 24, right: 24 }]}
    >
      <Animated.View style={anim} pointerEvents={message ? 'auto' : 'none'}>
        <Pressable
          onPress={() => display && WMToast.dismiss(display.id)}
          style={[
            styles.surface,
            {
              backgroundColor: theme.colorScheme.inverseSurface,
              borderRadius: text.length > 40 ? 18 : 24,
            },
          ]}
        >
          <Text numberOfLines={4} style={[WMTypography.bodyMedium, styles.text, { color: theme.colorScheme.inverseOnSurface }]}>
            {text}
          </Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  host: { position: 'absolute', alignItems: 'center' },
  surface: {
    maxWidth: 480,
    paddingHorizontal: 18,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  text: { textAlign: 'center' },
});
