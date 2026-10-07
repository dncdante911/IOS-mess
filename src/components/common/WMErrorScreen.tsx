/**
 * Экран и карточка ошибки с маскотом — порт Android ui/components/WMErrorScreen.kt.
 * Цвета экрана фиксированные (#F9F9F9, #1A1A1A, #757575), как на Android.
 */
import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { useTranslation } from '../../i18n';

const BrandTeal = '#4ECDC4';
const BrandMint = '#95E1A3';

export type WMErrorType = 'General' | 'NoInternet' | 'ServerError' | 'NotFound' | 'Empty' | 'AuthError';

const TYPES: Record<WMErrorType, { emoji: string; title: string; message: string; colors: [string, string] }> = {
  General: { emoji: '🐶', title: 'error_something_wrong', message: 'error_screen_general_msg', colors: ['#90CAF9', '#42A5F5'] },
  NoInternet: { emoji: '🐾', title: 'no_internet', message: 'error_screen_nointernet_msg', colors: ['#FFB74D', '#FF8A65'] },
  ServerError: { emoji: '😵', title: 'error_screen_server_title', message: 'error_screen_server_msg', colors: ['#EF5350', '#E53935'] },
  NotFound: { emoji: '🔍', title: 'nothing_found', message: 'error_screen_notfound_msg', colors: ['#90CAF9', '#42A5F5'] },
  Empty: { emoji: '💬', title: 'error_screen_empty_title', message: 'error_screen_empty_msg', colors: [BrandTeal, BrandMint] },
  AuthError: { emoji: '🔐', title: 'error_screen_auth_title', message: 'error_screen_auth_msg', colors: ['#90CAF9', '#42A5F5'] },
};

export function WMErrorScreen({
  type = 'General',
  title,
  message,
  onRetry,
}: {
  type?: WMErrorType;
  title?: string;
  message?: string;
  onRetry?: () => void;
}) {
  const { t } = useTranslation();
  const cfg = TYPES[type];
  // Маскот покачивается: −3…3, 1200 мс, EaseInOutSine
  const wobble = useSharedValue(-3);
  useEffect(() => {
    wobble.value = withRepeat(withTiming(3, { duration: 1200, easing: Easing.bezier(0.37, 0, 0.63, 1) }), -1, true);
  }, [wobble]);
  const anim = useAnimatedStyle(() => ({ transform: [{ translateX: wobble.value * 0.3 }, { translateY: wobble.value * 0.5 }] }));

  return (
    <View style={styles.screen}>
      <View style={styles.column}>
        <LinearGradient colors={cfg.colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.mascot}>
          <Animated.Text style={[{ fontSize: 64 }, anim]}>{cfg.emoji}</Animated.Text>
        </LinearGradient>
        <View style={{ height: 8 }} />
        <Text style={styles.title}>{title ?? t(cfg.title as never)}</Text>
        <Text style={styles.message}>{message ?? t(cfg.message as never)}</Text>
        <View style={{ height: 8 }} />
        {onRetry && (
          <Pressable onPress={onRetry} style={styles.retry}>
            <Text style={styles.retryText}>{t('retry')}</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

/** Компактная карточка ошибки для списков и чатов. */
export function WMErrorCard({ type = 'General', message, onRetry }: { type?: WMErrorType; message?: string; onRetry?: () => void }) {
  const { t } = useTranslation();
  const cfg = TYPES[type];
  return (
    <View style={styles.card}>
      <Text style={{ fontSize: 32 }}>{cfg.emoji}</Text>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 14, fontWeight: '500', color: '#1A1A1A' }}>{message ?? t(cfg.title as never)}</Text>
        {onRetry && (
          <Pressable onPress={onRetry} hitSlop={8}>
            <Text style={{ fontSize: 13, color: BrandTeal, marginTop: 4 }}>{t('retry')}</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F9F9F9', alignItems: 'center', justifyContent: 'center' },
  column: { alignItems: 'center', padding: 32, gap: 16, alignSelf: 'stretch' },
  mascot: { width: 120, height: 120, borderRadius: 36, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 20, fontWeight: '700', color: '#1A1A1A', textAlign: 'center' },
  message: { fontSize: 14, color: '#757575', textAlign: 'center', lineHeight: 20 },
  retry: { alignSelf: 'stretch', height: 48, borderRadius: 12, backgroundColor: BrandTeal, alignItems: 'center', justifyContent: 'center' },
  retryText: { fontSize: 15, fontWeight: '600', color: '#FFFFFF' },
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderRadius: 16, backgroundColor: '#FFF3F3', alignSelf: 'stretch' },
});
