/**
 * Вкладки главного экрана — порт из Android ui/chats/ChatsScreenModern.kt:
 *   ChatListTabWithStories, GroupListTab, ChannelListTabWithStories, BusinessChatListTab.
 * WMPullToRefreshBox → RefreshControl; LocalNavBarInset → bottomInset.
 */
import React, { useCallback } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';

/** Прокрутка списка → сворачивание шапки (enterAlwaysScrollBehavior). */
export type ListScrollHandler = (e: NativeSyntheticEvent<NativeScrollEvent>) => void;
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { M } from '../../../core/android';
import { useTranslation } from '../../../i18n';
import { useWMTheme } from '../../../theme/themeManager';
import { WMTypography, withAlpha } from '../../../theme/wmTheme';
import type { UIStyle } from '../../../preferences/uiStyle';
import { useUIStyle } from '../../../preferences/uiStyle';
import { WMToast } from '../../../components/common/WMToast';
import { useNickname } from '../contactNicknames';
import { usePresence } from '../../presence/presenceTracker';
import { ChannelsStore } from '../../channels/channelsStore';
import { ChannelCard, ChannelStoriesRow, PremiumChannelListItem, TelegramChannelItem } from '../../channels/components/ChannelRows';
import { ChannelRepliesInboxItem, ModernChatCard, ModernGroupCard, TelegramChatItem, TelegramGroupItem } from './ChatRows';
import { ChatSwipeActionsBox } from './ChatSwipeActions';
import { ChatTagsRow } from './ChatOrganizationUI';

function useRefresh(isLoading: boolean, onRefresh: () => void) {
  const cs = useWMTheme().colorScheme;
  return <RefreshControl refreshing={isLoading} onRefresh={onRefresh} tintColor={cs.primary} colors={[cs.primary]} />;
}

function EmptyText({ text }: { text: string }) {
  const cs = useWMTheme().colorScheme;
  return (
    <View style={styles.empty}>
      <Text style={[WMTypography.bodyLarge, { color: withAlpha(cs.onSurface, 0.6), textAlign: 'center' }]}>{text}</Text>
    </View>
  );
}

// ─── Чаты ────────────────────────────────────────────────────────────────────

function ChatRow({
  chat,
  uiStyle,
  onlineFromPresence,
  onChatPress,
  onChatLongPress,
  onMuteToggle,
  onArchiveSwipe,
  swipeArchiveIsRestore,
}: {
  chat: M.Chat;
  uiStyle: UIStyle;
  onlineFromPresence: boolean;
  onChatPress: (c: M.Chat) => void;
  onChatLongPress: (c: M.Chat) => void;
  onMuteToggle?: (c: M.Chat) => void;
  onArchiveSwipe?: (c: M.Chat) => void;
  swipeArchiveIsRestore: boolean;
}) {
  const nickname = useNickname(chat.userId);
  const isOnline = chat.isOnline || onlineFromPresence;
  const row = (
    <View>
      {uiStyle === 'WORLDMATES' ? (
        <ModernChatCard chat={chat} nickname={nickname} isOnline={isOnline} onPress={() => onChatPress(chat)} onLongPress={() => onChatLongPress(chat)} />
      ) : (
        <TelegramChatItem chat={chat} nickname={nickname} isOnline={isOnline} onPress={() => onChatPress(chat)} onLongPress={() => onChatLongPress(chat)} />
      )}
      <View style={{ paddingLeft: 76, paddingBottom: 2 }}>
        <ChatTagsRow chatId={chat.userId} />
      </View>
    </View>
  );
  if (onMuteToggle && onArchiveSwipe) {
    return (
      <ChatSwipeActionsBox chat={chat} onMuteToggle={onMuteToggle} onArchive={onArchiveSwipe} archiveActionIsRestore={swipeArchiveIsRestore}>
        {row}
      </ChatSwipeActionsBox>
    );
  }
  return row;
}

export function ChatListTabWithStories({
  chats,
  isLoading,
  uiStyle,
  onRefresh,
  onChatPress,
  onChatLongPress = () => {},
  isLoadingMore = false,
  hasMoreChats = false,
  onLoadMore = () => {},
  replyInboxTotal = 0,
  latestChannelReply = null,
  onRepliesPress = () => {},
  onMuteToggle,
  onArchiveSwipe,
  swipeArchiveIsRestore = false,
  bottomInset = 0,
  onScroll,
}: {
  chats: M.Chat[];
  /** В Android передаются, но строка историй в этой вкладке не рисуется (она в шторке меню). */
  stories?: M.Story[];
  isLoading: boolean;
  isLoadingStories?: boolean;
  uiStyle: UIStyle;
  onRefresh: () => void;
  onChatPress: (c: M.Chat) => void;
  onChatLongPress?: (c: M.Chat) => void;
  onCreateStoryPress?: () => void;
  isLoadingMore?: boolean;
  hasMoreChats?: boolean;
  onLoadMore?: () => void;
  replyInboxTotal?: number;
  latestChannelReply?: M.ChannelReply | null;
  onRepliesPress?: () => void;
  onMuteToggle?: (c: M.Chat) => void;
  onArchiveSwipe?: (c: M.Chat) => void;
  swipeArchiveIsRestore?: boolean;
  bottomInset?: number;
  onScroll?: ListScrollHandler;
}) {
  const { t } = useTranslation();
  const cs = useWMTheme().colorScheme;
  const online = usePresence((s) => s.onlineUsers);
  const refresh = useRefresh(isLoading, onRefresh);
  const showInbox = replyInboxTotal > 0 || latestChannelReply != null;

  // Бесконечная прокрутка: за 3 элемента до конца (как derivedStateOf в Android)
  const onEndReached = useCallback(() => {
    if (hasMoreChats && !isLoadingMore && !isLoading && chats.length > 1) onLoadMore();
  }, [hasMoreChats, isLoadingMore, isLoading, chats.length, onLoadMore]);

  const footer = isLoadingMore ? (
    <View style={styles.footerRow}>
      <ActivityIndicator size="small" color={cs.primary} />
      <Text style={[WMTypography.bodySmall, { color: withAlpha(cs.onSurface, 0.6), marginLeft: 8 }]}>{t('chats_loading_more')}</Text>
    </View>
  ) : !hasMoreChats && chats.length > 0 ? (
    <Text style={[WMTypography.bodySmall, { color: withAlpha(cs.onSurface, 0.38), textAlign: 'center', paddingVertical: 12 }]}>{t('chats_all_loaded')}</Text>
  ) : null;

  return (
    <FlatList
      data={chats}
      keyExtractor={(c) => String(c.userId)}
      refreshControl={refresh}
      onScroll={onScroll}
      scrollEventThrottle={16}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      contentContainerStyle={{ paddingBottom: bottomInset + 8 }}
      ListHeaderComponent={
        showInbox ? <ChannelRepliesInboxItem total={replyInboxTotal} latestReply={latestChannelReply} uiStyle={uiStyle} onPress={onRepliesPress} /> : null
      }
      ListFooterComponent={footer}
      renderItem={({ item }) => (
        <ChatRow
          chat={item}
          uiStyle={uiStyle}
          onlineFromPresence={online.has(item.userId)}
          onChatPress={onChatPress}
          onChatLongPress={onChatLongPress}
          onMuteToggle={onMuteToggle}
          onArchiveSwipe={onArchiveSwipe}
          swipeArchiveIsRestore={swipeArchiveIsRestore}
        />
      )}
    />
  );
}

// ─── Группы ──────────────────────────────────────────────────────────────────

export function GroupListTab({
  groups,
  isLoading,
  uiStyle,
  onRefresh,
  onGroupPress,
  onGroupLongPress,
  bottomInset = 0,
  onScroll,
}: {
  groups: M.Group[];
  isLoading: boolean;
  uiStyle: UIStyle;
  onRefresh: () => void;
  onGroupPress: (g: M.Group) => void;
  onGroupLongPress: (g: M.Group) => void;
  bottomInset?: number;
  onScroll?: ListScrollHandler;
}) {
  const { t } = useTranslation();
  const refresh = useRefresh(isLoading, onRefresh);
  return (
    <FlatList
      data={groups}
      keyExtractor={(g) => String(g.id)}
      refreshControl={refresh}
      onScroll={onScroll}
      scrollEventThrottle={16}
      contentContainerStyle={groups.length === 0 ? { flexGrow: 1 } : { paddingBottom: bottomInset + 8 }}
      ListEmptyComponent={isLoading ? null : <EmptyText text={t('no_groups')} />}
      renderItem={({ item }) =>
        uiStyle === 'TELEGRAM' ? (
          <TelegramGroupItem group={item} onPress={() => onGroupPress(item)} onLongPress={() => onGroupLongPress(item)} />
        ) : (
          <ModernGroupCard group={item} onPress={() => onGroupPress(item)} onLongPress={() => onGroupLongPress(item)} />
        )
      }
    />
  );
}

// ─── Каналы ──────────────────────────────────────────────────────────────────

/** Подписка/отписка с тостами — общий обработчик Android-вкладок каналов. */
function toggleSubscription(channel: M.Channel, isCurrentlySubscribed: boolean, t: ReturnType<typeof useTranslation>['t']) {
  const onError = (e: string) => WMToast.show(t('error_with_message', [e]));
  if (isCurrentlySubscribed) void ChannelsStore.unsubscribeChannel(channel.id, () => WMToast.show(t('unsubscribed_toast')), onError);
  else void ChannelsStore.subscribeChannel(channel.id, () => WMToast.show(t('subscribed_toast')), onError);
}

export function ChannelListTabWithStories({
  channels,
  stories,
  isLoading,
  onRefresh,
  onChannelPress,
  onCreateChannelStoryPress,
  onOpenChannelStory,
  liveChannelIds,
  bottomInset = 0,
  onScroll,
}: {
  channels: M.Channel[];
  stories: M.Story[];
  isLoading: boolean;
  onRefresh: () => void;
  onChannelPress: (c: M.Channel) => void;
  onCreateChannelStoryPress?: () => void;
  onOpenChannelStory?: (first: M.Story, pageId: number) => void;
  liveChannelIds: ReadonlySet<number>;
  bottomInset?: number;
  onScroll?: ListScrollHandler;
}) {
  const { t } = useTranslation();
  const cs = useWMTheme().colorScheme;
  const channelViewStyle = useUIStyle((s) => s.channelViewStyle);
  const refresh = useRefresh(isLoading, onRefresh);
  const adminChannelIds = channels.filter((c) => c.isAdmin).map((c) => c.id);

  if (channels.length === 0 && !isLoading) {
    // Премиальное пустое состояние (в Android строки здесь не локализованы — оставлено как есть)
    return (
      <FlatList
        data={[]}
        renderItem={null}
        refreshControl={refresh}
      onScroll={onScroll}
      scrollEventThrottle={16}
        contentContainerStyle={{ flexGrow: 1 }}
        ListEmptyComponent={
          <View style={[styles.empty, { padding: 48 }]}>
            <View style={[styles.emptyIcon, { backgroundColor: withAlpha(cs.primary, 0.1) }]}>
              <MaterialCommunityIcons name="bullhorn-outline" size={44} color={cs.primary} />
            </View>
            <Text style={[WMTypography.titleLarge, { marginTop: 24, fontWeight: '700', color: cs.onSurface }]}>No channels yet</Text>
            <Text style={[WMTypography.bodyMedium, { marginTop: 8, color: withAlpha(cs.onSurface, 0.6), textAlign: 'center' }]}>
              {'Subscribe to channels to see them here\nor create your own'}
            </Text>
          </View>
        }
      />
    );
  }

  return (
    <FlatList
      data={channels}
      keyExtractor={(c) => String(c.id)}
      refreshControl={refresh}
      onScroll={onScroll}
      scrollEventThrottle={16}
      contentContainerStyle={{ paddingBottom: bottomInset + 8 }}
      ListHeaderComponent={
        stories.length > 0 || adminChannelIds.length > 0 ? (
          <ChannelStoriesRow stories={stories} adminChannelIds={adminChannelIds} onCreatePress={onCreateChannelStoryPress} onOpenStory={onOpenChannelStory} />
        ) : null
      }
      renderItem={({ item }) =>
        channelViewStyle === 'PREMIUM' ? (
          <View style={{ paddingHorizontal: 12, paddingVertical: 4 }}>
            <PremiumChannelListItem channel={item} onPress={() => onChannelPress(item)} onSubscribeToggle={(sub) => toggleSubscription(item, sub, t)} />
          </View>
        ) : (
          <TelegramChannelItem channel={item} onPress={() => onChannelPress(item)} isLive={liveChannelIds.has(item.id)} />
        )
      }
    />
  );
}

/** ChannelListTab (без историй) — используется отдельными экранами каналов. */
export function ChannelListTab({
  channels,
  isLoading,
  uiStyle,
  onRefresh,
  onChannelPress,
  liveChannelIds,
  bottomInset = 0,
}: {
  channels: M.Channel[];
  isLoading: boolean;
  uiStyle: UIStyle;
  onRefresh: () => void;
  onChannelPress: (c: M.Channel) => void;
  liveChannelIds: ReadonlySet<number>;
  bottomInset?: number;
}) {
  const { t } = useTranslation();
  const channelViewStyle = useUIStyle((s) => s.channelViewStyle);
  const refresh = useRefresh(isLoading, onRefresh);
  return (
    <FlatList
      data={channels}
      keyExtractor={(c) => String(c.id)}
      refreshControl={refresh}
      contentContainerStyle={channels.length === 0 ? { flexGrow: 1 } : { paddingTop: 8, paddingBottom: bottomInset + 8 }}
      ListEmptyComponent={isLoading ? null : <ChannelsEmpty />}
      renderItem={({ item }) => {
        const live = liveChannelIds.has(item.id);
        if (channelViewStyle === 'PREMIUM')
          return (
            <View style={{ paddingHorizontal: 12, paddingVertical: 4 }}>
              <PremiumChannelListItem channel={item} isLive={live} onPress={() => onChannelPress(item)} onSubscribeToggle={(sub) => toggleSubscription(item, sub, t)} />
            </View>
          );
        if (uiStyle === 'TELEGRAM') return <TelegramChannelItem channel={item} isLive={live} onPress={() => onChannelPress(item)} />;
        return (
          <View style={{ paddingHorizontal: 16, paddingVertical: 4 }}>
            <ChannelCard channel={item} isLive={live} onPress={() => onChannelPress(item)} onSubscribeToggle={(sub) => toggleSubscription(item, sub, t)} />
          </View>
        );
      }}
    />
  );
}

function ChannelsEmpty() {
  const { t } = useTranslation();
  return (
    <View style={[styles.empty, { padding: 32 }]}>
      <MaterialCommunityIcons name="label" size={72} color="rgba(136,136,136,0.3)" />
      <Text style={[WMTypography.titleMedium, { marginTop: 16, color: '#888888' }]}>{t('no_channels')}</Text>
      <Text style={[WMTypography.bodyMedium, { marginTop: 8, color: 'rgba(136,136,136,0.7)', textAlign: 'center' }]}>{t('no_channels_subtitle')}</Text>
    </View>
  );
}

// ─── Бизнес ──────────────────────────────────────────────────────────────────

export function BusinessChatListTab({
  chats,
  isLoading,
  onRefresh,
  onChatPress,
  bottomInset = 0,
  onScroll,
}: {
  chats: M.Chat[];
  isLoading: boolean;
  onRefresh: () => void;
  onChatPress: (c: M.Chat) => void;
  bottomInset?: number;
  onScroll?: ListScrollHandler;
}) {
  const { t } = useTranslation();
  const cs = useWMTheme().colorScheme;
  const refresh = useRefresh(isLoading, onRefresh);
  return (
    <FlatList
      data={chats}
      keyExtractor={(c) => String(c.userId)}
      refreshControl={refresh}
      onScroll={onScroll}
      scrollEventThrottle={16}
      contentContainerStyle={chats.length === 0 ? { flexGrow: 1 } : { paddingBottom: bottomInset + 8 }}
      ListEmptyComponent={
        isLoading ? null : (
          <View style={styles.empty}>
            <MaterialCommunityIcons name="storefront" size={64} color={withAlpha(cs.onSurface, 0.3)} />
            <Text style={[WMTypography.bodyLarge, { marginTop: 12, color: withAlpha(cs.onSurface, 0.6), textAlign: 'center' }]}>{t('no_business_chats')}</Text>
          </View>
        )
      }
      renderItem={({ item }) => <ModernChatCard chat={item} onPress={() => onChatPress(item)} />}
    />
  );
}

const styles = StyleSheet.create({
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyIcon: { width: 88, height: 88, borderRadius: 44, alignItems: 'center', justifyContent: 'center' },
  footerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12 },
});
