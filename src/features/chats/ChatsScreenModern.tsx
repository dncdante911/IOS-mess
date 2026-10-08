/**
 * Главный экран — порт Android ui/chats/ChatsScreenModern.kt:
 *  • боковое меню (SettingsDrawerContent), фон из настроек темы
 *  • GlassTopAppBar: заголовок по папке, меню, поиск; сворачивается при
 *    прокрутке вниз и возвращается при прокрутке вверх (enterAlways)
 *  • полоса папок (ChatFolderTabs) ↔ пейджер 4 вкладок (Чаты/Каналы/Группы/Бизнес),
 *    синхронизация в обе стороны (без двух одновременных анимаций пейджера)
 *  • автообновление активной вкладки каждые 6 с
 *  • FAB: на «Каналах» — создать канал, на «Группах» — создать группу
 *  • контекстное меню чата, удаление, теги, папки, скрытые/архив, блокировка
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, useWindowDimensions, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';
import { Snackbar } from 'react-native-paper';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { M } from '../../core/android';
import { newModel } from '../../core/android';
import { useTranslation } from '../../i18n';
import { useThemeState, useWMTheme } from '../../theme/themeManager';
import { withAlpha } from '../../theme/wmTheme';
import { BackgroundImage } from '../../theme/backgrounds/BackgroundImage';
import { useUIStyle } from '../../preferences/uiStyle';
import { ExpressiveFAB, ExpressiveIconButton, GlassTopAppBar } from '../../components/common/WMComponents';
import { WMModalDrawer } from '../../components/common/WMModalDrawer';
import { WMToast } from '../../components/common/WMToast';
import { PagerGestureContext } from '../../components/common/pagerGesture';
import { ChatsViewModel, useChatsStore } from './chatsStore';
import { ChatOrganizationManager, useChatOrganization } from './chatOrganization';
import { ChatLockManager, useLockedChats } from './chatLock';
import { useServerFolders } from './serverFolderStore';
import { GroupsStore, useGroupsStore } from '../groups/groupsStore';
import { ChannelsStore, useChannelsStore } from '../channels/channelsStore';
import { useLiveChannels } from '../channels/liveChannelTracker';
import { StoriesStore, useStoriesStore } from '../stories/storiesStore';
import { ChatFolderTabs, CreateFolderDialog, ManageTagsDialog, MoveToChatFolderDialog, filterChatsByFolder } from './components/ChatOrganizationUI';
import { BusinessChatListTab, ChannelListTabWithStories, ChatListTabWithStories, GroupListTab, type ListScrollHandler } from './components/ChatListTabs';
import { ContactContextMenu } from './components/ContactContextMenu';
import { DeleteChatDialog } from './components/DeleteChatDialog';
import { UnifiedSearchDialog } from './components/UnifiedSearchDialog';
import { SettingsDrawerContent, type DrawerDestination } from './drawer/SettingsDrawerContent';

const APP_BAR_H = 64;
const PAGES = 4; // Чаты, Каналы, Группы, Бизнес

export interface ChatsScreenModernProps {
  onChatPress: (chat: M.Chat) => void;
  /** «Профиль» в контекстном меню чата → UserProfile(user_id) */
  onOpenProfile: (userId: number) => void;
  onGroupPress: (group: M.Group) => void;
  onChannelPress: (channel: M.Channel) => void;
  onSettingsPress: () => void;
  onCreateChannelPress: () => void;
  onDrawerOpen: (dest: DrawerDestination) => void;
  onAddAccount: () => void;
  onAccountSwitched: () => void;
  onRepliesPress: () => void;
  onShowDrafts: () => void;
  onShowContactPicker: () => void;
  onCreateGroupPress: () => void;
  onGroupLongPress: (group: M.Group) => void;
  onCreateStoryPress: () => void;
  onCreateChannelStoryPress: (adminChannels: M.Channel[]) => void;
  onOpenUserStories: (userId: number) => void;
  onOpenChannelStory: (first: M.Story, pageId: number) => void;
  /** Нижний бар (AppBottomNavBar) и его высота над контентом */
  bottomBar?: React.ReactNode;
  bottomInset?: number;
}

export function ChatsScreenModern(props: ChatsScreenModernProps) {
  const { t } = useTranslation();
  const cs = useWMTheme().colorScheme;
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const uiStyle = useUIStyle((s) => s.style);
  const themeState = useThemeState();

  // ── Данные ──
  const chats = useChatsStore((s) => s.chatList);
  const isLoadingChats = useChatsStore((s) => s.isLoading);
  const isLoadingMore = useChatsStore((s) => s.isLoadingMore);
  const hasMoreChats = useChatsStore((s) => s.hasMoreChats);
  const hiddenChats = useChatsStore((s) => s.hiddenChats);
  const archivedChats = useChatsStore((s) => s.archivedChats);
  const hiddenChatsCount = useChatsStore((s) => s.hiddenChatsCount);
  const businessChats = useChatsStore((s) => s.businessChatList);
  const isLoadingBusiness = useChatsStore((s) => s.isLoadingBusiness);
  const replyInboxTotal = useChatsStore((s) => s.replyInboxTotal);
  const latestChannelReply = useChatsStore((s) => s.latestChannelReply);
  const groups = useGroupsStore((s) => s.groupList);
  const isLoadingGroups = useGroupsStore((s) => s.isLoading);
  const channels = useChannelsStore((s) => s.subscribedChannels);
  const isLoadingChannels = useChannelsStore((s) => s.isLoading);
  const liveIds = useLiveChannels((s) => s.ids);
  const liveChannelIds = useMemo(() => new Set(liveIds), [liveIds]);
  const stories = useStoriesStore((s) => s.stories);
  const isLoadingStories = useStoriesStore((s) => s.isLoading);
  const channelStories = useStoriesStore((s) => s.channelStories);
  const archivedIds = useChatOrganization((s) => s.archivedChatIds);
  const folderMapping = useChatOrganization((s) => s.chatFolderMapping);
  const chatFolders = useChatOrganization((s) => s.folders);
  const serverFolders = useServerFolders((s) => s.folders);
  useLockedChats((s) => s.ids); // перерисовка пункта меню «заблокировать»

  // ── Состояние экрана ──
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState('all');
  const [page, setPage] = useState(0);
  const [showSearch, setShowSearch] = useState(false);
  const [menuChat, setMenuChat] = useState<M.Chat | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<M.Chat | null>(null);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [tagTarget, setTagTarget] = useState<{ id: number; name: string } | null>(null);
  const [folderTarget, setFolderTarget] = useState<{ id: number; name: string } | null>(null);
  const [snack, setSnack] = useState<string | null>(null);
  const showSnack = (s: string) => setSnack(s);

  // ── Пейджер ──
  const pagerRef = useRef<ScrollView>(null);
  const dragging = useRef(false);
  const pageRef = useRef(0);
  pageRef.current = page;
  const pagerGesture = useMemo(() => Gesture.Native(), []);

  const targetPage = selectedFolderId === 'channels' ? 1 : selectedFolderId === 'groups' ? 2 : 0;

  // Папка → пейджер (только когда пейджер не листается пальцем — см. фикс 2026-09-16 в Android)
  useEffect(() => {
    if (dragging.current || pageRef.current === targetPage) return;
    pagerRef.current?.scrollTo({ x: targetPage * width, animated: true });
    setPage(targetPage);
  }, [targetPage, width]);

  // Пейджер → папка
  const onPageSettled = (p: number) => {
    setPage(p);
    setSelectedFolderId((cur) => {
      const next = p === 1 ? 'channels' : p === 2 ? 'groups' : cur === 'channels' || cur === 'groups' ? 'all' : cur;
      return next;
    });
  };

  // ── Автообновление каждые 6 с + подгрузка при смене вкладки ──
  useEffect(() => {
    if (page === 1) void StoriesStore.loadChannelStories();
    if (page === 3) void ChatsViewModel.fetchBusinessChats();
    const timer = setInterval(() => {
      switch (pageRef.current) {
        case 0:
          void ChatsViewModel.fetchChats();
          void StoriesStore.loadStories(); // новые истории (в т.ч. с других устройств)
          break;
        case 1:
          void ChannelsStore.fetchSubscribedChannels();
          void StoriesStore.loadChannelStories();
          break;
        case 2:
          void GroupsStore.fetchGroups();
          break;
        case 3:
          void ChatsViewModel.fetchBusinessChats();
          break;
      }
    }, 6000);
    return () => clearInterval(timer);
  }, [page]);

  // Скрытые/архив — загрузка при входе в папку
  useEffect(() => {
    if (selectedFolderId === 'hidden') void ChatsViewModel.fetchHiddenChats();
    else if (selectedFolderId === 'archived') void ChatsViewModel.fetchArchivedChats();
  }, [selectedFolderId]);

  // ── Фильтрация ──
  const filteredChats = useMemo(() => {
    if (selectedFolderId.startsWith('server_')) {
      const sfId = Number(selectedFolderId.slice(7));
      const sf = serverFolders.find((f) => f.id === sfId);
      const ids = new Set((sf?.chats ?? []).filter((c) => c.chatType === 'dm').map((c) => c.chatId));
      return chats.filter((c) => ids.has(c.userId));
    }
    return filterChatsByFolder(chats, selectedFolderId, archivedIds, folderMapping);
  }, [chats, selectedFolderId, archivedIds, folderMapping, serverFolders]);
  const chatsToShow = selectedFolderId === 'hidden' ? hiddenChats : selectedFolderId === 'archived' ? archivedChats : filteredChats;

  // ── Сворачиваемая шапка ──
  const [barOffset, setBarOffset] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const lastY = useRef<Record<number, number>>({});
  const makeOnScroll = useCallback(
    (p: number): ListScrollHandler =>
      (e: NativeSyntheticEvent<NativeScrollEvent>) => {
        const y = e.nativeEvent.contentOffset.y;
        const dy = y - (lastY.current[p] ?? 0);
        lastY.current[p] = y;
        setScrolled(y > 0);
        setBarOffset((cur) => (y <= 0 ? 0 : Math.min(APP_BAR_H, Math.max(0, cur + dy))));
      },
    [],
  );
  const scrollHandlers = useMemo(() => [0, 1, 2, 3].map(makeOnScroll), [makeOnScroll]);
  useEffect(() => setBarOffset(0), [page]);

  const title = (() => {
    switch (selectedFolderId) {
      case 'all': return t('chats_screen_title');
      case 'archived': return t('archive_folder_label');
      case 'hidden': return `🔒 ${t('hidden_chats')}`;
      case 'channels': return t('channels');
      case 'groups': return t('groups');
      case 'personal': return t('personal');
      case 'unread': return t('unread_label');
      default: {
        const f = chatFolders.find((x) => x.id === selectedFolderId);
        return f ? `${f.emoji} ${f.name}` : t('chats_screen_title');
      }
    }
  })();

  // ── Действия ──
  const chatName = (c: M.Chat) => c.username ?? t('chat_label');
  const inHidden = selectedFolderId === 'hidden';
  const inArchived = selectedFolderId === 'archived';
  const bottomInset = props.bottomInset ?? 0;

  const onMuteToggle = (c: M.Chat) => {
    const mute = !c.isMuted;
    void ChatsViewModel.muteChat(c.userId, mute);
    showSnack(t(mute ? 'mute_chat' : 'unmute_chat'));
  };
  const onArchiveSwipe = (c: M.Chat) => {
    if (inArchived) {
      void ChatsViewModel.unarchiveChat(c.userId);
      showSnack(t('chat_unarchived_toast'));
    } else {
      void ChatsViewModel.archiveChat(c.userId);
      showSnack(t('chat_archived_toast'));
    }
  };

  const drawer = (
    <SettingsDrawerContent
      onNavigateToFullSettings={() => {
        setDrawerOpen(false);
        props.onSettingsPress();
      }}
      onClose={() => setDrawerOpen(false)}
      onOpen={props.onDrawerOpen}
      onShowContactPicker={props.onShowContactPicker}
      onShowDrafts={props.onShowDrafts}
      onCreateStoryPress={props.onCreateStoryPress}
      // Раньше на Android не передавалось — «Новая группа» в меню ничего не делала
      onCreateGroup={props.onCreateGroupPress}
      onOpenUserStories={props.onOpenUserStories}
      onAddAccount={props.onAddAccount}
      onAccountSwitched={props.onAccountSwitched}
      stories={stories}
    />
  );

  return (
    <WMModalDrawer open={drawerOpen} onOpenChange={setDrawerOpen} drawerContent={drawer} containerColor={cs.surfaceContainerLow}>
      <View style={{ flex: 1, backgroundColor: cs.background }}>
        <BackgroundImage backgroundImageUri={themeState.backgroundImageUri} presetBackgroundId={themeState.presetBackgroundId} />

        {/* ── Шапка ── */}
        <View style={{ paddingTop: insets.top, backgroundColor: scrolled ? withAlpha(cs.surfaceContainer, 0.92) : withAlpha(cs.surface, 0.55) }}>
          <View style={{ height: APP_BAR_H - barOffset, overflow: 'hidden' }}>
            <View style={{ marginTop: -barOffset }}>
              <GlassTopAppBar
                style={{ paddingTop: 0, backgroundColor: 'transparent' }}
                title={
                  <Text numberOfLines={1} style={{ fontSize: 22, lineHeight: 28, fontWeight: '700', letterSpacing: -0.4, color: cs.onSurface }}>
                    {title}
                  </Text>
                }
                navigationIcon={
                  <ExpressiveIconButton onPress={() => setDrawerOpen(true)}>
                    <MaterialCommunityIcons name="menu" size={24} color={cs.onSurface} accessibilityLabel={t('menu')} />
                  </ExpressiveIconButton>
                }
                actions={
                  <ExpressiveIconButton onPress={() => setShowSearch(true)}>
                    <MaterialCommunityIcons name="magnify" size={24} color={cs.onSurface} accessibilityLabel={t('search')} />
                  </ExpressiveIconButton>
                }
              />
            </View>
          </View>
        </View>

        <ChatFolderTabs
          selectedFolderId={selectedFolderId}
          onFolderSelected={setSelectedFolderId}
          onAddFolder={() => setShowCreateFolder(true)}
          hiddenChatsCount={hiddenChatsCount}
        />

        {/* ── Пейджер ── */}
        <PagerGestureContext.Provider value={pagerGesture}>
          <GestureDetector gesture={pagerGesture}>
            <ScrollView
              ref={pagerRef}
              horizontal
              pagingEnabled
              bounces={false}
              showsHorizontalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              style={{ flex: 1 }}
              onScrollBeginDrag={() => (dragging.current = true)}
              onMomentumScrollEnd={(e) => {
                dragging.current = false;
                const p = Math.round(e.nativeEvent.contentOffset.x / width);
                onPageSettled(Math.max(0, Math.min(PAGES - 1, p)));
              }}
            >
              <View style={{ width }}>
                <ChatListTabWithStories
                  chats={chatsToShow}
                  stories={selectedFolderId === 'all' ? stories : []}
                  isLoading={isLoadingChats}
                  isLoadingStories={isLoadingStories}
                  uiStyle={uiStyle}
                  onRefresh={() => {
                    if (inHidden) void ChatsViewModel.fetchHiddenChats();
                    else if (inArchived) void ChatsViewModel.fetchArchivedChats();
                    else {
                      void ChatsViewModel.fetchChats();
                      void StoriesStore.loadStories();
                    }
                  }}
                  onChatPress={props.onChatPress}
                  onChatLongPress={setMenuChat}
                  onCreateStoryPress={props.onCreateStoryPress}
                  isLoadingMore={isLoadingMore}
                  hasMoreChats={hasMoreChats}
                  onLoadMore={() => void ChatsViewModel.loadMoreChats()}
                  replyInboxTotal={replyInboxTotal}
                  latestChannelReply={latestChannelReply}
                  onRepliesPress={props.onRepliesPress}
                  // В «Скрытых» свайпы выключены; в «Архиве» свайп влево возвращает из архива
                  onMuteToggle={inHidden ? undefined : onMuteToggle}
                  onArchiveSwipe={inHidden ? undefined : onArchiveSwipe}
                  swipeArchiveIsRestore={inArchived}
                  bottomInset={bottomInset}
                  onScroll={scrollHandlers[0]}
                />
              </View>
              <View style={{ width }}>
                <ChannelListTabWithStories
                  channels={channels}
                  stories={channelStories}
                  isLoading={isLoadingChannels}
                  onRefresh={() => {
                    void ChannelsStore.fetchSubscribedChannels();
                    void StoriesStore.loadChannelStories();
                  }}
                  onChannelPress={props.onChannelPress}
                  onCreateChannelStoryPress={() => {
                    const admin = channels.filter((c) => c.isAdmin);
                    if (admin.length > 0) props.onCreateChannelStoryPress(admin);
                  }}
                  onOpenChannelStory={props.onOpenChannelStory}
                  liveChannelIds={liveChannelIds}
                  bottomInset={bottomInset}
                  onScroll={scrollHandlers[1]}
                />
              </View>
              <View style={{ width }}>
                <GroupListTab
                  groups={groups}
                  isLoading={isLoadingGroups}
                  uiStyle={uiStyle}
                  onRefresh={() => void GroupsStore.fetchGroups()}
                  onGroupPress={props.onGroupPress}
                  onGroupLongPress={props.onGroupLongPress}
                  bottomInset={bottomInset}
                  onScroll={scrollHandlers[2]}
                />
              </View>
              <View style={{ width }}>
                <BusinessChatListTab
                  chats={businessChats}
                  isLoading={isLoadingBusiness}
                  onRefresh={() => void ChatsViewModel.fetchBusinessChats()}
                  onChatPress={props.onChatPress}
                  bottomInset={bottomInset}
                  onScroll={scrollHandlers[3]}
                />
              </View>
            </ScrollView>
          </GestureDetector>
        </PagerGestureContext.Provider>

        {/* ── FAB ── */}
        {(page === 1 || page === 2) && (
          <ExpressiveFAB
            onPress={page === 1 ? props.onCreateChannelPress : props.onCreateGroupPress}
            style={{ position: 'absolute', right: 16, bottom: bottomInset + 16 }}
          >
            <MaterialCommunityIcons name="plus" size={24} color={cs.onPrimary} accessibilityLabel={t(page === 1 ? 'create_channel' : 'create_group')} />
          </ExpressiveFAB>
        )}

        {/* ── Нижний бар поверх списков ── */}
        {props.bottomBar ? (
          <View style={styles.bottomBar} pointerEvents="box-none">
            {props.bottomBar}
          </View>
        ) : null}

        <Snackbar visible={snack != null} onDismiss={() => setSnack(null)} duration={Snackbar.DURATION_SHORT} wrapperStyle={{ bottom: bottomInset }}>
          {snack ?? ''}
        </Snackbar>
      </View>

      {/* ── Диалоги ── */}
      <UnifiedSearchDialog
        visible={showSearch}
        onDismiss={() => setShowSearch(false)}
        onUserClick={(u) => {
          setShowSearch(false);
          props.onChatPress(newModel<M.Chat>('Chat', { id: 0, userId: u.userId, username: u.username, avatarUrl: u.avatarUrl, lastMessage: null, unreadCount: 0 }));
        }}
        onChannelClick={(c) => {
          setShowSearch(false);
          props.onChannelPress(c);
        }}
      />

      <ContactContextMenu
        chat={menuChat}
        visible={menuChat != null}
        onDismiss={() => setMenuChat(null)}
        onViewProfile={(c) => props.onOpenProfile(c.userId)}
        onDelete={(c) => {
          setMenuChat(null);
          setDeleteTarget(c);
        }}
        isInHiddenFolder={inHidden}
        onArchive={(c) => {
          void ChatsViewModel.archiveChat(c.userId);
          showSnack(t('chat_archived_toast'));
        }}
        onUnarchive={(c) => {
          void ChatsViewModel.unarchiveChat(c.userId);
          showSnack(t('chat_unarchived_toast'));
        }}
        onHide={(c) => {
          if (inHidden) {
            void ChatsViewModel.unhideChat(c.userId);
            showSnack(t('chat_unhidden_toast'));
          } else {
            void ChatsViewModel.hideChat(c.userId);
            showSnack(t('chat_moved_to_hidden'));
          }
        }}
        onManageTags={(c) => setTagTarget({ id: c.userId, name: chatName(c) })}
        onMoveToFolder={(c) => setFolderTarget({ id: c.userId, name: chatName(c) })}
        onToggleLock={(c) => {
          ChatLockManager.toggle(c.userId);
          WMToast.show(t(ChatLockManager.isLocked(c.userId) ? 'chat_lock_locked_toast' : 'chat_lock_unlocked_toast'));
        }}
        isChatLocked={menuChat ? ChatLockManager.isLocked(menuChat.userId) : false}
      />

      <DeleteChatDialog
        chat={deleteTarget}
        visible={deleteTarget != null}
        onDismiss={() => setDeleteTarget(null)}
        onDeleteForMe={() => deleteTarget && void ChatsViewModel.deleteChatForMe(deleteTarget.userId, () => showSnack(t('chat_deleted_toast')))}
        onDeleteForEveryone={() => deleteTarget && void ChatsViewModel.deleteChatForEveryone(deleteTarget.userId, () => showSnack(t('chat_deleted_toast')))}
        onDeleteAndBlock={() => deleteTarget && void ChatsViewModel.deleteChatAndBlock(deleteTarget.userId, () => showSnack(t('chat_deleted_and_blocked_toast')))}
      />

      <CreateFolderDialog
        visible={showCreateFolder}
        onDismiss={() => setShowCreateFolder(false)}
        onConfirm={(name, emoji) => {
          ChatOrganizationManager.addFolder(name, emoji);
          setShowCreateFolder(false);
        }}
      />
      {tagTarget && <ManageTagsDialog chatId={tagTarget.id} chatName={tagTarget.name} visible onDismiss={() => setTagTarget(null)} />}
      {folderTarget && <MoveToChatFolderDialog chatId={folderTarget.id} chatName={folderTarget.name} visible onDismiss={() => setFolderTarget(null)} />}
    </WMModalDrawer>
  );
}

const styles = StyleSheet.create({
  bottomBar: { position: 'absolute', left: 0, right: 0, bottom: 0 },
});
