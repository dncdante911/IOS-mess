/**
 * Строки списков главного экрана — порты Android:
 *   ModernChatsUI.kt         — ModernChatCard, AnimatedUnreadBadge, ModernGroupCard (стиль WallyMates)
 *   TelegramStyleComponents  — TelegramChatItem, TelegramGroupItem (классический стиль)
 *   ChatsScreenModern.kt     — ChannelRepliesInboxItem
 */
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import type { M } from '../../../core/android';
import { UserSession } from '../../../core/session';
import { absMediaUrl } from '../../../core/helpers';
import { useTranslation } from '../../../i18n';
import { useWMTheme } from '../../../theme/themeManager';
import { withAlpha, WMSpacing, WMTypography } from '../../../theme/wmTheme';
import { luminance } from '../../../theme/color';
import { getLastMessagePreview } from '../../messages/messageHelpers';
import { formatGroupTime, formatMessageTime, formatTelegramTime, isRecentlyActive } from '../../../utils/chatTime';

const TELEGRAM_BLUE = '#3390EC';
// Spring.DampingRatioMediumBouncy + StiffnessLow
const PRESS_SPRING = { dampingRatio: 0.5, stiffness: 200 };

/** Нажатие с лёгким сжатием 0.98 (как graphicsLayer scale на Android). */
function usePressScale() {
  const s = useSharedValue(1);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));
  return {
    style,
    onPressIn: () => {
      s.value = withSpring(0.98, PRESS_SPRING);
    },
    onPressOut: () => {
      s.value = withSpring(1, PRESS_SPRING);
    },
  };
}

// ─── AnimatedUnreadBadge ──────────────────────────────────────────────────────
export function AnimatedUnreadBadge({ count, muted = false }: { count: number; muted?: boolean }) {
  const theme = useWMTheme();
  const badge = muted ? withAlpha(theme.colorScheme.onSurfaceVariant, 0.45) : theme.extended.unreadBadge;
  const text = muted ? theme.colorScheme.surface : luminance(theme.extended.unreadBadge) > 0.5 ? '#0B1220' : '#FFFFFF';
  return (
    <View style={[styles.badge, { backgroundColor: badge }]}>
      <Text style={{ color: text, fontSize: 11, fontWeight: '700', lineHeight: 14 }}>{count > 99 ? '99+' : String(count)}</Text>
    </View>
  );
}

// ─── ModernChatCard ───────────────────────────────────────────────────────────
export function ModernChatCard({
  chat,
  nickname = null,
  isOnline = false,
  isLocked = false,
  onPress,
  onLongPress,
}: {
  chat: M.Chat;
  nickname?: string | null;
  isOnline?: boolean;
  isLocked?: boolean;
  onPress: () => void;
  onLongPress?: () => void;
}) {
  const theme = useWMTheme();
  const { t } = useTranslation();
  const cs = theme.colorScheme;
  const press = usePressScale();
  const isPremium = chat.isPro > 0;
  const online = isOnline || chat.isOnline || (chat.lastActivity != null && isRecentlyActive(chat.lastActivity));
  const unread = chat.unreadCount > 0;
  const last = chat.lastMessage;
  const isOwnLast = !!last && last.fromId === UserSession.userId && last.fromId > 0;

  return (
    <Animated.View style={[{ marginHorizontal: WMSpacing.cardOuterH, marginVertical: WMSpacing.cardGapV }, press.style]}>
      <Pressable
        onPress={onPress}
        onLongPress={onLongPress}
        onPressIn={press.onPressIn}
        onPressOut={press.onPressOut}
        style={[
          styles.card,
          {
            backgroundColor: withAlpha(cs.surfaceVariant, 0.76),
            borderColor: withAlpha(cs.outline, 0.1),
          },
        ]}
      >
        <View>
          <View
            style={[
              styles.avatar56,
              { backgroundColor: cs.surfaceContainerHigh },
              isPremium && { shadowColor: '#34D399', shadowOpacity: 0.7, shadowRadius: 6, shadowOffset: { width: 0, height: 0 } },
            ]}
          >
            {isPremium && (
              // 2pt кольцо-градиент у PRO (Brush.linearGradient #34D399 → #6EE7B7)
              <LinearGradient colors={['#34D399', '#6EE7B7']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[StyleSheet.absoluteFill, { borderRadius: 28 }]} />
            )}
            <Image
              source={chat.avatarUrl ? { uri: absMediaUrl(chat.avatarUrl) } : undefined}
              style={isPremium ? styles.avatarInner52 : styles.avatarFull}
              contentFit="cover"
            />
          </View>
          {online && (
            <View style={[styles.online16, { backgroundColor: theme.extended.onlineGreen, borderColor: cs.surfaceVariant }]} />
          )}
        </View>
        <View style={{ width: 12 }} />
        <View style={{ flex: 1 }}>
          <View style={styles.row}>
            <Text numberOfLines={1} style={{ flexShrink: 1, fontSize: 17, fontWeight: '600', color: cs.onSurface }}>
              {nickname ?? chat.username ?? t('unknown')}
            </Text>
            {chat.isBot && <MaterialCommunityIcons name="robot" size={15} color={cs.primary} style={{ marginLeft: 4 }} />}
            {chat.isMuted && (
              <MaterialCommunityIcons name="volume-off" size={14} color={withAlpha(cs.onSurfaceVariant, 0.6)} style={{ marginLeft: 4 }} />
            )}
            <View style={{ flex: 1 }} />
            {last && (
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: unread && !chat.isMuted ? '600' : '400',
                  color: unread && !chat.isMuted ? theme.extended.unreadBadge : withAlpha(cs.onSurfaceVariant, 0.6),
                }}
              >
                {formatMessageTime(last.timeStamp)}
              </Text>
            )}
          </View>
          <View style={{ height: 4 }} />
          {nickname && chat.username ? (
            <Text style={{ fontSize: 12, fontWeight: '500', color: withAlpha(cs.primary, 0.7), marginBottom: 2 }}>@{chat.username}</Text>
          ) : null}
          <View style={styles.row}>
            {isOwnLast && (
              <MaterialCommunityIcons
                name={last!.isRead ? 'check-all' : 'check'}
                size={16}
                color={last!.isRead ? cs.primary : withAlpha(cs.onSurfaceVariant, 0.6)}
                style={{ marginRight: 4 }}
              />
            )}
            <Text
              numberOfLines={1}
              style={{ flex: 1, fontSize: 14, color: unread ? cs.onSurface : withAlpha(cs.onSurfaceVariant, 0.7) }}
            >
              {last ? getLastMessagePreview(last) : t('no_messages')}
            </Text>
            {isLocked && <MaterialCommunityIcons name="lock" size={14} color={withAlpha(cs.onSurfaceVariant, 0.6)} style={{ marginLeft: 6 }} />}
            {unread && (
              <View style={{ marginLeft: 8 }}>
                <AnimatedUnreadBadge count={chat.unreadCount} muted={chat.isMuted} />
              </View>
            )}
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

// ─── TelegramChatItem ─────────────────────────────────────────────────────────
export function TelegramChatItem({
  chat,
  nickname = null,
  isOnline = false,
  onPress,
  onLongPress,
}: {
  chat: M.Chat;
  nickname?: string | null;
  isOnline?: boolean;
  onPress: () => void;
  onLongPress?: () => void;
}) {
  const theme = useWMTheme();
  const cs = theme.colorScheme;
  const unread = chat.unreadCount > 0;
  return (
    <View>
      <Pressable
        onPress={onPress}
        onLongPress={onLongPress}
        style={({ pressed }) => [styles.tgRow, { backgroundColor: pressed ? withAlpha(cs.onSurface, 0.06) : withAlpha(cs.surface, 0.72) }]}
      >
        <View>
          <Image source={chat.avatarUrl ? { uri: absMediaUrl(chat.avatarUrl) } : undefined} style={styles.avatar52} contentFit="cover" />
          {isOnline && <View style={[styles.online14, { borderColor: cs.surface }]} />}
        </View>
        <View style={{ width: 12 }} />
        <View style={{ flex: 1 }}>
          <Text numberOfLines={1} style={[WMTypography.bodyLarge, { fontSize: 16, fontWeight: unread ? '700' : '500', color: cs.onSurface }]}>
            {nickname ?? chat.username ?? 'Unknown'}
          </Text>
          {nickname && chat.username ? (
            <Text numberOfLines={1} style={[WMTypography.bodySmall, { fontSize: 12, color: withAlpha(cs.onSurface, 0.5) }]}>
              @{chat.username}
            </Text>
          ) : null}
          <View style={{ height: 3 }} />
          {chat.lastMessage && (
            <Text
              numberOfLines={1}
              style={[
                WMTypography.bodyMedium,
                { fontSize: 14, fontWeight: unread ? '500' : '400', color: unread ? cs.onSurface : withAlpha(cs.onSurface, 0.6) },
              ]}
            >
              {getLastMessagePreview(chat.lastMessage)}
            </Text>
          )}
        </View>
        <View style={{ width: 8 }} />
        <View style={{ alignItems: 'flex-end', gap: 4 }}>
          {chat.lastMessage && (
            <Text style={[WMTypography.bodySmall, { fontSize: 13, color: unread ? TELEGRAM_BLUE : withAlpha(cs.onSurface, 0.5) }]}>
              {formatTelegramTime(chat.lastMessage.timeStamp)}
            </Text>
          )}
          {unread && (
            <View style={styles.tgBadge}>
              <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '700' }}>{chat.unreadCount > 99 ? '99+' : String(chat.unreadCount)}</Text>
            </View>
          )}
        </View>
      </Pressable>
      <View style={[styles.divider, { backgroundColor: withAlpha(cs.onSurface, 0.08) }]} />
    </View>
  );
}

// ─── Группы ───────────────────────────────────────────────────────────────────
export function ModernGroupCard({ group, onPress, onLongPress }: { group: M.Group; onPress: () => void; onLongPress?: () => void }) {
  const theme = useWMTheme();
  const { tp } = useTranslation();
  const cs = theme.colorScheme;
  const press = usePressScale();
  const initial = group.name.trim().charAt(0).toUpperCase() || '#';
  return (
    <Animated.View style={[{ marginHorizontal: WMSpacing.cardOuterH, marginVertical: WMSpacing.cardGapV }, press.style]}>
      <Pressable
        onPress={onPress}
        onLongPress={onLongPress}
        onPressIn={press.onPressIn}
        onPressOut={press.onPressOut}
        style={[styles.card, { backgroundColor: withAlpha(cs.surfaceVariant, 0.76), borderColor: withAlpha(cs.outline, 0.1) }]}
      >
        <View>
          {group.avatarUrl ? (
            <Image source={{ uri: absMediaUrl(group.avatarUrl) }} style={[styles.avatar56, { backgroundColor: cs.surfaceContainerHigh }]} contentFit="cover" />
          ) : (
            <LinearGradient colors={[cs.secondary, cs.tertiary]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.avatar56, styles.center]}>
              <Text style={[WMTypography.titleLarge, { fontWeight: '700', color: cs.onSecondary }]}>{initial}</Text>
            </LinearGradient>
          )}
          {(group.isPrivate || group.isAdmin) && (
            <View style={[styles.groupMark, { backgroundColor: group.isAdmin ? '#FFB300' : cs.secondary, borderColor: cs.surfaceVariant }]}>
              <MaterialCommunityIcons name={group.isAdmin ? 'star' : 'lock'} size={12} color="#FFFFFF" />
            </View>
          )}
        </View>
        <View style={{ width: 12 }} />
        <View style={{ flex: 1 }}>
          <View style={styles.row}>
            <Text numberOfLines={1} style={{ flex: 1, fontSize: 17, fontWeight: '600', color: cs.onSurface }}>
              {group.name}
            </Text>
            <Text style={{ fontSize: 12, color: withAlpha(cs.onSurfaceVariant, 0.6) }}>{formatGroupTime(group.updatedTime ?? group.createdTime)}</Text>
          </View>
          <View style={{ height: 4 }} />
          <View style={styles.row}>
            <MaterialCommunityIcons name="account-multiple" size={16} color={withAlpha(cs.primary, 0.7)} />
            <Text style={{ marginLeft: 4, fontSize: 13, fontWeight: '500', color: withAlpha(cs.onSurfaceVariant, 0.8) }}>
              {tp('group_members_plural', group.membersCount)}
            </Text>
          </View>
          {group.description?.trim() ? (
            <Text numberOfLines={1} style={{ marginTop: 2, fontSize: 13, color: withAlpha(cs.onSurfaceVariant, 0.7) }}>
              {group.description}
            </Text>
          ) : null}
        </View>
      </Pressable>
    </Animated.View>
  );
}

/** Склонение «участник/участника/участников» (getMembersCountText). */
function membersWord(count: number, t: (k: never) => string): string {
  if (count % 10 === 1 && count % 100 !== 11) return t('member_one' as never);
  if (count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 10 || count % 100 >= 20)) return t('member_few' as never);
  return t('members_many' as never);
}

export function TelegramGroupItem({ group, onPress, onLongPress }: { group: M.Group; onPress: () => void; onLongPress?: () => void }) {
  const theme = useWMTheme();
  const { t } = useTranslation();
  const cs = theme.colorScheme;
  return (
    <View>
      <Pressable
        onPress={onPress}
        onLongPress={onLongPress}
        style={({ pressed }) => [styles.tgRow, { backgroundColor: pressed ? withAlpha(cs.onSurface, 0.06) : withAlpha(cs.surface, 0.72) }]}
      >
        <Image source={group.avatarUrl ? { uri: absMediaUrl(group.avatarUrl) } : undefined} style={styles.avatar52} contentFit="cover" />
        <View style={{ width: 12 }} />
        <View style={{ flex: 1 }}>
          <Text numberOfLines={1} style={[WMTypography.bodyLarge, { fontSize: 16, fontWeight: '500', color: cs.onSurface }]}>
            {group.name}
          </Text>
          <View style={{ height: 3 }} />
          <Text numberOfLines={1} style={[WMTypography.bodyMedium, { fontSize: 14, color: withAlpha(cs.onSurface, 0.6) }]}>
            {`${group.membersCount} ${membersWord(group.membersCount, t as never)}`}
          </Text>
        </View>
        {group.isPrivate && (
          <MaterialCommunityIcons name="lock" size={20} color={withAlpha(cs.onSurface, 0.5)} accessibilityLabel={t('private_group_cd')} />
        )}
      </Pressable>
      <View style={[styles.divider, { backgroundColor: withAlpha(cs.onSurface, 0.08) }]} />
    </View>
  );
}

// ─── Ответы на комментарии в каналах ──────────────────────────────────────────
export function ChannelRepliesInboxItem({
  total,
  latestReply,
  uiStyle,
  onPress,
}: {
  total: number;
  latestReply: M.ChannelReply | null;
  uiStyle: 'WORLDMATES' | 'TELEGRAM';
  onPress: () => void;
}) {
  const theme = useWMTheme();
  const { t } = useTranslation();
  const cs = theme.colorScheme;
  const preview = latestReply ? `${latestReply.senderName.trim() || latestReply.senderUsername}: ${latestReply.text}` : null;
  if (uiStyle === 'TELEGRAM') {
    return (
      <View>
        <Pressable onPress={onPress} style={[styles.tgRow, { backgroundColor: withAlpha(cs.surface, 0.72) }]}>
          <View style={[styles.avatar52, styles.center, { backgroundColor: withAlpha(cs.primary, 0.15) }]}>
            <Text style={{ fontSize: 24 }}>💬</Text>
          </View>
          <View style={{ width: 12 }} />
          <View style={{ flex: 1 }}>
            <Text numberOfLines={1} style={[WMTypography.bodyLarge, { fontSize: 16, fontWeight: '500', color: cs.onSurface }]}>
              {t('channel_replies_title')}
            </Text>
            {preview && (
              <Text numberOfLines={1} style={[WMTypography.bodyMedium, { fontSize: 14, color: withAlpha(cs.onSurface, 0.6) }]}>
                {preview}
              </Text>
            )}
          </View>
          {total > 0 && (
            <View style={styles.tgBadge}>
              <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '700' }}>{total > 99 ? '99+' : String(total)}</Text>
            </View>
          )}
        </Pressable>
        <View style={[styles.divider, { backgroundColor: withAlpha(cs.onSurface, 0.08) }]} />
      </View>
    );
  }
  return (
    <Pressable onPress={onPress} style={[styles.repliesCard, { backgroundColor: withAlpha(cs.primaryContainer, 0.5) }]}>
      <View style={[styles.avatar52, styles.center, { backgroundColor: withAlpha(cs.primary, 0.2) }]}>
        <Text style={{ fontSize: 26 }}>💬</Text>
      </View>
      <View style={{ width: 12 }} />
      <View style={{ flex: 1 }}>
        <Text numberOfLines={1} style={{ fontSize: 17, fontWeight: '600', color: cs.onSurface }}>
          {t('channel_replies_title')}
        </Text>
        {preview && (
          <Text numberOfLines={1} style={{ marginTop: 2, fontSize: 14, color: withAlpha(cs.onSurface, 0.65) }}>
            {preview}
          </Text>
        )}
      </View>
      {total > 0 && <AnimatedUnreadBadge count={total} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  center: { alignItems: 'center', justifyContent: 'center' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 0.5,
    paddingHorizontal: WMSpacing.cardInnerH,
    paddingVertical: WMSpacing.cardInnerV,
  },
  avatar56: { width: 56, height: 56, borderRadius: 28, overflow: 'hidden' },
  avatarFull: { width: 56, height: 56, borderRadius: 28 },
  avatarInner52: { position: 'absolute', top: 2, left: 2, width: 52, height: 52, borderRadius: 26 },
  avatar52: { width: 52, height: 52, borderRadius: 26 },
  online16: { position: 'absolute', right: 0, bottom: 0, width: 16, height: 16, borderRadius: 8, borderWidth: 2.5 },
  online14: { position: 'absolute', right: 0, bottom: 0, width: 14, height: 14, borderRadius: 7, borderWidth: 2, backgroundColor: '#4CAF50' },
  badge: { minWidth: 22, minHeight: 22, borderRadius: 11, paddingHorizontal: 7, paddingVertical: 3, alignItems: 'center', justifyContent: 'center' },
  tgRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10 },
  tgBadge: { minWidth: 22, height: 22, borderRadius: 11, paddingHorizontal: 5, backgroundColor: TELEGRAM_BLUE, alignItems: 'center', justifyContent: 'center' },
  divider: { height: 0.5, marginLeft: 76 },
  groupMark: { position: 'absolute', right: 0, bottom: 0, width: 18, height: 18, borderRadius: 9, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  repliesCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
    marginVertical: 6,
    padding: 12,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
});
