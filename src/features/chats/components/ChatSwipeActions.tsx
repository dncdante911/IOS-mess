/**
 * Свайпы по строке чата — порт Android ui/chats/ChatSwipeActions.kt.
 *   вправо → выключить/включить звук (оранжевый фон, иконка по текущему состоянию)
 *   влево  → архив (в папке «Архив» — вернуть из архива, зелёный фон)
 * Порог — 35% ширины. Строка всегда возвращается на место, действие
 * срабатывает с тактильным откликом; убирает строку стор (список обновляется).
 */
import React, { useContext, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { M } from '../../../core/android';
import { useTranslation } from '../../../i18n';
import { useWMTheme } from '../../../theme/themeManager';
import { withAlpha } from '../../../theme/wmTheme';
import { PagerGestureContext } from '../../../components/common/pagerGesture';

export function ChatSwipeActionsBox({
  chat,
  onMuteToggle,
  onArchive,
  archiveActionIsRestore = false,
  children,
}: {
  chat: M.Chat;
  onMuteToggle: (chat: M.Chat) => void;
  onArchive: (chat: M.Chat) => void;
  archiveActionIsRestore?: boolean;
  children: React.ReactNode;
}) {
  const theme = useWMTheme();
  const { t } = useTranslation();
  const [width, setWidth] = useState(0);
  const tx = useSharedValue(0);
  const pagerGesture = useContext(PagerGestureContext);

  const fire = (dir: 'right' | 'left') => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (dir === 'right') onMuteToggle(chat);
    else onArchive(chat);
  };

  const pan = Gesture.Pan()
    .activeOffsetX([-12, 12]) // не мешаем вертикальной прокрутке списка
    .failOffsetY([-10, 10])
    .onUpdate((e) => {
      tx.value = e.translationX;
    })
    .onEnd((e) => {
      const threshold = width * 0.35;
      if (threshold > 0 && e.translationX > threshold) runOnJS(fire)('right');
      else if (threshold > 0 && e.translationX < -threshold) runOnJS(fire)('left');
      tx.value = withSpring(0, { dampingRatio: 0.8, stiffness: 380 });
    });
  if (pagerGesture) pan.blocksExternalGesture(pagerGesture);

  const rowStyle = useAnimatedStyle(() => ({ transform: [{ translateX: tx.value }] }));
  const rightBg = useAnimatedStyle(() => ({ opacity: tx.value > 0 ? 1 : 0 }));
  const leftBg = useAnimatedStyle(() => ({ opacity: tx.value < 0 ? 1 : 0 }));

  const archiveColor = archiveActionIsRestore ? '#4CAF50' : theme.colorScheme.primary;

  return (
    <View onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      <Animated.View style={[StyleSheet.absoluteFill, styles.bg, { alignItems: 'flex-start', backgroundColor: withAlpha('#FF9800', 0.88) }, rightBg]}>
        <View style={styles.label}>
          <MaterialCommunityIcons name={chat.isMuted ? 'bell' : 'bell-off'} size={22} color="#FFFFFF" />
          <Text numberOfLines={1} style={styles.labelText}>
            {t(chat.isMuted ? 'unmute_chat' : 'mute_chat')}
          </Text>
        </View>
      </Animated.View>
      <Animated.View style={[StyleSheet.absoluteFill, styles.bg, { alignItems: 'flex-end', backgroundColor: withAlpha(archiveColor, 0.88) }, leftBg]}>
        <View style={styles.label}>
          <MaterialCommunityIcons name={archiveActionIsRestore ? 'archive-arrow-up' : 'archive'} size={22} color="#FFFFFF" />
          <Text numberOfLines={1} style={styles.labelText}>
            {t(archiveActionIsRestore ? 'unarchive' : 'archive_chat')}
          </Text>
        </View>
      </Animated.View>
      <GestureDetector gesture={pan}>
        <Animated.View style={rowStyle}>{children}</Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  bg: { justifyContent: 'center' },
  label: { paddingHorizontal: 24, alignItems: 'center' },
  labelText: { color: '#FFFFFF', fontSize: 10 },
});
