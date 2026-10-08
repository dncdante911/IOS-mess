/**
 * Строки списка каналов — порт Android:
 *   ui/channels/ModernChannelComponents.kt — TelegramChannelItem, ChannelCard,
 *     ModernChannelAvatar, VerifiedBadge, StatChip, ModernSubscribeButton,
 *     ModernAdminBadge, formatCount
 *   ui/channels/PremiumChannelListUI.kt — PremiumChannelListItem
 *   ui/stories/ChannelStoriesSection.kt — ChannelStoriesRow, ChannelStoryCircle
 */
import React, { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withSpring, withTiming } from 'react-native-reanimated';
import type { M } from '../../../core/android';
import { absMediaUrl } from '../../../core/helpers';
import { useTranslation, useI18nStore } from '../../../i18n';
import { useWMTheme } from '../../../theme/themeManager';
import { WMCorners, WMSpacing, lerpColor, withAlpha } from '../../../theme/wmTheme';
import { SweepGradientBox } from '../../../components/common/SweepGradientBox';
import { UnreadBadge } from '../../../components/common/WMComponents';

// ─── formatCount ─────────────────────────────────────────────────────────────

/** String.format("%.1fK") — с десятичным разделителем текущего языка, как в Android. */
export function formatCount(count: number): string {
  const lang = useI18nStore.getState().language;
  const one = (v: number) => new Intl.NumberFormat(lang, { minimumFractionDigits: 1, maximumFractionDigits: 1, useGrouping: false }).format(v);
  if (count >= 1_000_000) return `${one(count / 1_000_000)}M`;
  if (count >= 1_000) return `${one(count / 1_000)}K`;
  return String(count);
}

// ─── Мелкие элементы ─────────────────────────────────────────────────────────

export function VerifiedBadge({ size = 20 }: { size?: number }) {
  return (
    <View style={[styles.verified, { width: size, height: size, borderRadius: size / 2 }]} accessibilityLabel="Verified">
      <MaterialCommunityIcons name="check" size={size * 0.65} color="#FFFFFF" />
    </View>
  );
}

/** Пульсирующая плашка LIVE (alpha 1 ↔ 0.4, 700 мс, линейно). */
export function LivePill({ text, fontSize, lineHeight, padV = 1 }: { text: string; fontSize: number; lineHeight: number; padV?: number }) {
  const cs = useWMTheme().colorScheme;
  const a = useSharedValue(1);
  useEffect(() => {
    a.value = withRepeat(withTiming(0.4, { duration: 700, easing: Easing.linear }), -1, true);
  }, [a]);
  const bg = useAnimatedStyle(() => ({ opacity: a.value }));
  return (
    <View style={{ borderRadius: 4, overflow: 'hidden' }}>
      <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: cs.error }, bg]} />
      <Text style={{ paddingHorizontal: 3, paddingVertical: padV, fontSize, lineHeight, fontWeight: '800', color: '#FFFFFF' }}>{text}</Text>
    </View>
  );
}

function StatChip({ icon, value, color }: { icon: string; value: string; color: string }) {
  return (
    <View style={[styles.statChip, { backgroundColor: withAlpha(color, 0.1) }]}>
      <MaterialCommunityIcons name={icon as never} size={12} color={color} />
      <Text style={{ fontSize: 11, fontWeight: '600', color, marginLeft: 4 }}>{value}</Text>
    </View>
  );
}

export function ModernSubscribeButton({ isSubscribed, onToggle, enabled = true }: { isSubscribed: boolean; onToggle: () => void; enabled?: boolean }) {
  const { t } = useTranslation();
  const cs = useWMTheme().colorScheme;
  const fg = isSubscribed ? cs.onPrimaryContainer : cs.onPrimary;
  return (
    <Pressable
      onPress={onToggle}
      disabled={!enabled}
      style={[
        styles.subscribe,
        { backgroundColor: isSubscribed ? cs.primaryContainer : cs.primary },
        !isSubscribed && styles.raised,
      ]}
    >
      <MaterialCommunityIcons name={isSubscribed ? 'bell-ring' : 'plus'} size={18} color={fg} />
      <Text style={{ fontSize: 13, fontWeight: '600', color: fg, marginLeft: 6 }}>{t(isSubscribed ? 'ch_joined' : 'ch_join')}</Text>
    </Pressable>
  );
}

export function ModernAdminBadge() {
  const { t } = useTranslation();
  const cs = useWMTheme().colorScheme;
  return (
    <View style={[styles.adminBadge, { backgroundColor: cs.errorContainer }]} accessibilityLabel={t('ch_admin_badge')}>
      <MaterialCommunityIcons name="shield" size={14} color={cs.error} />
      <Text style={{ fontSize: 11, fontWeight: '700', color: cs.error, letterSpacing: 0.5, marginLeft: 4 }}>{t('ch_admin_badge')}</Text>
    </View>
  );
}

/** Заглушка аватара: градиент primary → tertiary + буквы. */
function GradientInitials({ name, size, radius, letters, fontSize, letterSpacing = 0 }: { name: string; size: number; radius: number; letters: number; fontSize: number; letterSpacing?: number }) {
  const cs = useWMTheme().colorScheme;
  return (
    <LinearGradient colors={[cs.primary, cs.tertiary]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ width: size, height: size, borderRadius: radius, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize, fontWeight: '700', color: '#FFFFFF', letterSpacing }}>{name.slice(0, letters).toUpperCase()}</Text>
    </LinearGradient>
  );
}

export function ModernChannelAvatar({ avatarUrl, channelName, size = 56, isVerified = false, isLive = false }: { avatarUrl: string; channelName: string; size?: number; isVerified?: boolean; isLive?: boolean }) {
  const r = size / 3.5;
  const url = avatarUrl.trim() ? absMediaUrl(avatarUrl) : '';
  return (
    <View style={{ width: size, height: size }}>
      {url ? (
        <Image source={{ uri: url }} style={{ width: size, height: size, borderRadius: r }} contentFit="cover" accessibilityLabel={channelName} />
      ) : (
        <GradientInitials name={channelName} size={size} radius={r} letters={2} fontSize={size / 2.8} letterSpacing={1} />
      )}
      {isVerified && (
        <View style={{ position: 'absolute', right: -4, bottom: -4 }}>
          <VerifiedBadge size={size / 3.5} />
        </View>
      )}
      {isLive && (
        <View style={{ position: 'absolute', right: 0, top: 0 }}>
          <LivePill text="LIVE" fontSize={size / 7} lineHeight={size / 5.5} padV={1.5} />
        </View>
      )}
    </View>
  );
}

// ─── TelegramChannelItem ─────────────────────────────────────────────────────

const VERIFIED_RING = ['#0A84FF', '#5E5CE6', '#BF5AF2', '#0A84FF'];

export function TelegramChannelItem({ channel, onPress, isLive = false }: { channel: M.Channel; onPress: () => void; isLive?: boolean }) {
  const { t, tp } = useTranslation();
  const cs = useWMTheme().colorScheme;
  const url = channel.avatarUrl.trim() ? absMediaUrl(channel.avatarUrl) : '';
  const avatarInner = (size: number) =>
    url ? (
      <Image source={{ uri: url }} style={{ width: size, height: size, borderRadius: 16 }} contentFit="cover" accessibilityLabel={channel.name} />
    ) : (
      <GradientInitials name={channel.name} size={size} radius={16} letters={1} fontSize={18} />
    );

  // Сервер часто отдаёт категорию числовым id («11») — такую не показываем
  const cat = channel.category?.trim();
  const categoryText = cat && !/^[+-]?\d+$/.test(cat) ? cat : null;
  const desc = channel.description?.trim().replace(/\n/g, ' ');
  const descText = desc ? desc.slice(0, 80) : null;
  const dim = (a: number) => withAlpha(cs.onSurface, a);

  return (
    <View>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.tgRow,
          { backgroundColor: withAlpha(cs.surface, 0.82) },
          pressed && { backgroundColor: withAlpha(lerpColor(cs.surface, cs.primary, 0.08), 0.82) },
        ]}
      >
        <View style={{ width: 52, height: 52 }}>
          {channel.isVerified ? (
            <SweepGradientBox size={52} radius={18} colors={VERIFIED_RING} padding={2}>
              {avatarInner(48)}
            </SweepGradientBox>
          ) : (
            avatarInner(52)
          )}
          {channel.isVerified && (
            <View style={[styles.miniVerified, { backgroundColor: cs.surface }]}>
              <View style={[styles.miniVerifiedInner, { backgroundColor: cs.primary }]}>
                <MaterialCommunityIcons name="check" size={10} color={cs.onPrimary} />
              </View>
            </View>
          )}
          {isLive && (
            <View style={{ position: 'absolute', right: 0, top: 0 }}>
              <LivePill text={t('ch_live')} fontSize={7} lineHeight={9} />
            </View>
          )}
        </View>

        <View style={{ flex: 1, marginLeft: 14 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text numberOfLines={1} style={{ flexShrink: 1, fontSize: 15.5, lineHeight: 20, fontWeight: '600', color: cs.onSurface }}>
              {channel.name}
            </Text>
            {channel.isPrivate && <MaterialCommunityIcons name="lock" size={13} color={dim(0.35)} style={{ marginLeft: 4 }} />}
          </View>
          {(categoryText || descText) && (
            <Text
              numberOfLines={1}
              style={{
                marginTop: 2,
                marginBottom: 1,
                fontSize: 13,
                color: categoryText ? withAlpha(cs.primary, 0.7) : dim(0.6),
                fontWeight: categoryText ? '500' : '400',
              }}
            >
              {categoryText ?? descText}
            </Text>
          )}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: categoryText || descText ? 0 : 2 }}>
            <MaterialCommunityIcons name="account-multiple-outline" size={12} color={dim(0.4)} />
            <Text numberOfLines={1} style={{ fontSize: 12.5, color: dim(0.5), marginLeft: 4 }}>
              {tp('channel_subscribers_plural', channel.subscribersCount, [formatCount(channel.subscribersCount)])}
            </Text>
            {channel.postsCount > 0 && (
              <>
                <Text style={{ fontSize: 12.5, color: dim(0.3) }}> · </Text>
                <MaterialCommunityIcons name="text-box-outline" size={12} color={dim(0.4)} />
                <Text numberOfLines={1} style={{ fontSize: 12.5, color: dim(0.5), marginLeft: 4 }}>
                  {formatCount(channel.postsCount)}
                </Text>
              </>
            )}
          </View>
        </View>

        <View style={{ marginLeft: 8 }}>
          {channel.isAdmin ? (
            <View style={[styles.tgAdmin, { backgroundColor: withAlpha(cs.errorContainer, 0.55) }]} accessibilityLabel="Admin">
              <MaterialCommunityIcons name="shield" size={12} color={cs.error} />
            </View>
          ) : channel.isSubscribed ? (
            <View style={{ borderRadius: 8, backgroundColor: withAlpha(cs.primary, 0.08), padding: 5 }} accessibilityLabel="Subscribed">
              <MaterialCommunityIcons name="bell-ring" size={14} color={withAlpha(cs.primary, 0.6)} />
            </View>
          ) : (
            <MaterialCommunityIcons name="chevron-right" size={20} color={dim(0.2)} />
          )}
        </View>
      </Pressable>
      <View style={{ marginLeft: 82, height: 0.5, backgroundColor: dim(0.06) }} />
    </View>
  );
}

// ─── ChannelCard (стиль WallyMates) ──────────────────────────────────────────

export function ChannelCard({
  channel,
  onPress,
  onSubscribeToggle,
  isLive = false,
}: {
  channel: M.Channel;
  onPress: () => void;
  onSubscribeToggle?: (isCurrentlySubscribed: boolean) => void;
  isLive?: boolean;
}) {
  const { t } = useTranslation();
  const cs = useWMTheme().colorScheme;
  const scale = useSharedValue(1);
  // spring(DampingRatioMediumBouncy, StiffnessLow)
  const press = (v: number) => (scale.value = withSpring(v, { dampingRatio: 0.5, stiffness: 200 }));
  const scaleStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View style={scaleStyle}>
      <Pressable
        onPress={onPress}
        onPressIn={() => press(0.97)}
        onPressOut={() => press(1)}
        style={[styles.card, WMCorners.card, { backgroundColor: withAlpha(cs.surface, 0.5), borderColor: withAlpha(cs.outline, 0.18) }]}
      >
        <View style={[styles.glow, { shadowColor: cs.primary }]}>
          <ModernChannelAvatar avatarUrl={channel.avatarUrl} channelName={channel.name} size={60} isVerified={channel.isVerified} isLive={isLive} />
        </View>

        <View style={{ flex: 1, marginLeft: 14 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text numberOfLines={1} style={{ flexShrink: 1, fontSize: 17, fontWeight: '700', color: cs.onSurface, letterSpacing: 0.2 }}>
              {channel.name}
            </Text>
            {channel.isVerified && (
              <View style={{ marginLeft: 6 }}>
                <VerifiedBadge size={18} />
              </View>
            )}
          </View>
          {channel.description != null && (
            <Text numberOfLines={2} style={{ marginTop: 4, fontSize: 13, lineHeight: 18, color: withAlpha(cs.onSurface, 0.65) }}>
              {channel.description}
            </Text>
          )}
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
            <StatChip icon="account-multiple-outline" value={formatCount(channel.subscribersCount)} color={cs.primary} />
            {channel.postsCount > 0 && <StatChip icon="text-box-outline" value={formatCount(channel.postsCount)} color={cs.tertiary} />}
            {channel.isPrivate && <StatChip icon="lock" value={t('ch_private')} color={cs.secondary} />}
          </View>
        </View>

        <View style={{ marginLeft: 8, alignItems: 'flex-end', gap: 6 }}>
          {channel.isAdmin ? (
            <ModernAdminBadge />
          ) : onSubscribeToggle ? (
            <ModernSubscribeButton isSubscribed={channel.isSubscribed} onToggle={() => onSubscribeToggle(channel.isSubscribed)} />
          ) : null}
          {channel.isSubscribed && channel.unreadCount > 0 && <UnreadBadge count={channel.unreadCount} />}
        </View>
      </Pressable>
    </Animated.View>
  );
}

/**
 * PremiumChannelListItem — в Android это карточка «Obsidian Gold» из
 * ui/channels/premium/screens/PremiumChannelListCard.kt (дизайн-система премиум-
 * каналов). Порт этой системы — в фазе «Премиум-каналы»; до тех пор — ChannelCard.
 */
export function PremiumChannelListItem(props: {
  channel: M.Channel;
  onPress: () => void;
  onSubscribeToggle?: (isCurrentlySubscribed: boolean) => void;
  isLive?: boolean;
}) {
  return <ChannelCard {...props} />;
}

// ─── Истории каналов ─────────────────────────────────────────────────────────

const STORY_RING = ['#00BCD4', '#2196F3', '#673AB7', '#00BCD4'];

export function ChannelStoriesRow({
  stories,
  adminChannelIds = [],
  onCreatePress,
  onOpenStory,
  backgroundColor,
}: {
  stories: M.Story[];
  adminChannelIds?: number[];
  onCreatePress?: () => void;
  /** (первая история канала, pageId) → просмотрщик историй канала */
  onOpenStory?: (first: M.Story, pageId: number) => void;
  backgroundColor?: string;
}) {
  const { t } = useTranslation();
  const cs = useWMTheme().colorScheme;

  // Группировка по page_id (порядок первого появления, как groupBy в Kotlin)
  const groups = new Map<number, M.Story[]>();
  for (const s of stories) {
    if (s.pageId == null || s.pageId <= 0) continue;
    const g = groups.get(s.pageId);
    if (g) g.push(s);
    else groups.set(s.pageId, [s]);
  }
  if (groups.size === 0 && adminChannelIds.length === 0) return null;

  type Item = { kind: 'create' } | { kind: 'channel'; pageId: number; list: M.Story[] };
  const data: Item[] = [
    ...(adminChannelIds.length > 0 ? [{ kind: 'create' } as Item] : []),
    ...[...groups.entries()].map(([pageId, list]) => ({ kind: 'channel', pageId, list }) as Item),
  ];

  return (
    <FlatList
      horizontal
      data={data}
      keyExtractor={(it) => (it.kind === 'create' ? 'create' : `p${it.pageId}`)}
      showsHorizontalScrollIndicator={false}
      style={{ backgroundColor: backgroundColor ?? cs.surface, flexGrow: 0 }}
      contentContainerStyle={{ paddingHorizontal: 8, paddingVertical: 12, gap: 12 }}
      renderItem={({ item }) => {
        if (item.kind === 'create') {
          return (
            <Pressable onPress={onCreatePress} style={styles.storyCol}>
              <View style={[styles.storyCircle, { borderWidth: 2, borderColor: 'rgba(136,136,136,0.3)', backgroundColor: cs.surfaceVariant }]}>
                <MaterialCommunityIcons name="plus" size={28} color={cs.primary} accessibilityLabel={t('story_create_channel_story_cd')} />
              </View>
              <Text numberOfLines={1} style={[styles.storyLabel, { color: withAlpha(cs.onSurface, 0.7) }]}>
                {t('channel_story_label')}
              </Text>
            </Pressable>
          );
        }
        const first = item.list[0];
        return (
          <ChannelStoryCircle
            channelName={first.channelData?.groupName || t('channel_label')}
            avatarUrl={first.channelData?.avatar ?? null}
            hasUnviewed={item.list.some((s) => s.isViewed === 0)}
            onPress={() => onOpenStory?.(first, item.pageId)}
          />
        );
      }}
    />
  );
}

export function ChannelStoryCircle({ channelName, avatarUrl, hasUnviewed, onPress }: { channelName: string; avatarUrl: string | null; hasUnviewed: boolean; onPress: () => void }) {
  const cs = useWMTheme().colorScheme;
  const [failed, setFailed] = useState(false);
  const url = avatarUrl ? absMediaUrl(avatarUrl) : '';
  const inner = hasUnviewed ? 58 : 60;
  const avatar = (
    <Image
      source={url && !failed ? { uri: url } : undefined}
      onError={() => setFailed(true)}
      style={{ width: inner, height: inner, borderRadius: inner / 2, borderWidth: 3, borderColor: cs.surface, backgroundColor: cs.surfaceVariant }}
      contentFit="cover"
      accessibilityLabel={channelName}
    />
  );
  return (
    <Pressable onPress={onPress} style={styles.storyCol}>
      {hasUnviewed ? (
        <SweepGradientBox size={64} radius={32} colors={STORY_RING}>
          {avatar}
        </SweepGradientBox>
      ) : (
        <View style={[styles.storyCircle, { borderWidth: 2, borderColor: 'rgba(136,136,136,0.3)' }]}>{avatar}</View>
      )}
      <Text numberOfLines={1} style={[styles.storyLabel, { color: cs.onSurface }]}>
        {channelName}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  verified: { backgroundColor: '#0A84FF', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 2, shadowOffset: { width: 0, height: 1 }, elevation: 2 },
  statChip: { flexDirection: 'row', alignItems: 'center', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  subscribe: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8 },
  raised: { shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 4 },
  adminBadge: { flexDirection: 'row', alignItems: 'center', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6 },
  tgRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: WMSpacing.listItemH, paddingVertical: WMSpacing.listItemV },
  miniVerified: { position: 'absolute', right: 0, bottom: 0, width: 18, height: 18, borderRadius: 9, padding: 1.5 },
  miniVerifiedInner: { flex: 1, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  tgAdmin: { borderRadius: 8, paddingHorizontal: 6, paddingVertical: 4, marginLeft: 4 },
  card: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, borderWidth: 0.5 },
  glow: { borderRadius: 18, shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 8 },
  storyCol: { width: 72, alignItems: 'center' },
  storyCircle: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  storyLabel: { fontSize: 11, fontWeight: '500', marginTop: 4 },
});
