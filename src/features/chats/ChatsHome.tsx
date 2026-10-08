/**
 * Корневой экран после входа — порт ChatsActivity.onCreate/setContent (Android):
 *  • запускает «ViewModel» главного экрана (чаты, группы, каналы, истории)
 *  • нижняя навигация: Чаты · Контакты · Папки (шторка совместных папок) · Профиль
 *  • needsRelogin → выход на экран входа
 *  • смена аккаунта (свичер или «Добавить аккаунт») → полный перезапуск
 *    данных экрана (Android: recreateForAccountSwitch)
 *
 * Облегчённый режим (AppMode.LITE → LiteMainScreen) зависит от экранов
 * истории звонков и создания группы — включается в фазе «Звонки».
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { M } from '../../core/android';
import { UserSession, useSessionField } from '../../core/session';
import { useTranslation } from '../../i18n';
import { useWMTheme } from '../../theme/themeManager';
import { WMTypography } from '../../theme/wmTheme';
import { useAuthStore } from '../../store/authStore';
import type { RootStackParamList } from '../../navigation/types';
import { ChatsViewModel, useChatsStore } from './chatsStore';
import { ServerFolderStore } from './serverFolderStore';
import { GroupsStore } from '../groups/groupsStore';
import { ChannelsStore } from '../channels/channelsStore';
import { StoriesStore } from '../stories/storiesStore';
import { ChatsScreenModern } from './ChatsScreenModern';
import { AppBottomNavBar, NAV_BAR_HEIGHT, type BottomNavTab } from './components/AppBottomNavBar';
import { SharedFoldersSheet } from './components/SharedFoldersSheet';
import type { DrawerDestination } from './drawer/SettingsDrawerContent';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Nav = NativeStackNavigationProp<RootStackParamList>;

/** init всех ViewModel главного экрана (как ViewModelProvider в onCreate). */
function startMainScreenData(): void {
  void ChatsViewModel.start();
  void GroupsStore.fetchGroups();
  ChannelsStore.start();
  void StoriesStore.loadStories();
}

/** ChatsActivity.onResume: обновление при возврате на экран / в приложение. */
function refreshOnResume(): void {
  void ChatsViewModel.fetchChats();
  void GroupsStore.fetchGroups();
  void ChatsViewModel.fetchBusinessChats();
  void ChannelsStore.fetchSubscribedChannels();
  void StoriesStore.loadStories();
  // бейдж «Ответы»: курсор прочтения уже сдвинут на экране ответов
  void ChatsViewModel.loadReplyInboxPreview();
}

function resetMainScreenData(): void {
  ChatsViewModel.reset();
  GroupsStore.reset();
  ChannelsStore.reset();
  StoriesStore.reset();
  ServerFolderStore.reset();
}

/** Пункты меню, у которых на iOS пока нет экрана (порт в своих фазах). */
const DRAWER_ROUTE: Record<DrawerDestination, keyof RootStackParamList> = {
  Profile: 'UserProfile',
  SavedMessages: 'SavedMessages',
  GlobalSearch: 'GlobalSearch',
  CallHistory: 'CallHistory',
  Notes: 'Notes',
  NewsList: 'NewsList',
  RecommendedChannels: 'RecommendedChannels',
  BotStore: 'BotStore',
  GeoDiscovery: 'GeoDiscovery',
  BusinessDirectory: 'BusinessDirectory',
  Stars: 'Stars',
  Premium: 'Premium',
  Ads: 'Ads',
  Refunds: 'Refunds',
  Tickets: 'Tickets',
};

export function ChatsHome() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const needsRelogin = useChatsStore((s) => s.needsRelogin);
  const logout = useAuthStore((s) => s.logout);
  const [tab, setTab] = useState<BottomNavTab>('CHATS');
  const [showFolders, setShowFolders] = useState(false);

  // ── Данные главного экрана ──
  useEffect(() => {
    startMainScreenData();
  }, []);

  // ── onResume ──
  useEffect(() => {
    // Только возврат на экран (после blur); первый показ уже загрузил данные выше
    let wasBlurred = false;
    const unsubBlur = navigation.addListener('blur', () => {
      wasBlurred = true;
    });
    const unsubFocus = navigation.addListener('focus', () => {
      if (!wasBlurred) return;
      wasBlurred = false;
      refreshOnResume();
    });
    const sub = AppState.addEventListener('change', (st) => {
      if (st === 'active' && navigation.isFocused()) refreshOnResume();
    });
    return () => {
      unsubBlur();
      unsubFocus();
      sub.remove();
    };
  }, [navigation]);

  // ── Перелогин ──
  useEffect(() => {
    if (needsRelogin) void logout();
  }, [needsRelogin, logout]);

  // ── Смена аккаунта (свичер / добавление) ──
  const uid = useSessionField('session', () => UserSession.userId);
  const prevUid = useRef(uid);
  useEffect(() => {
    if (prevUid.current === uid) return;
    prevUid.current = uid;
    resetMainScreenData();
    startMainScreenData();
    setTab('CHATS');
    navigation.popToTop();
  }, [uid, navigation]);

  // ── Навигация ──
  const openChat = useCallback(
    (chat: M.Chat) =>
      navigation.navigate('Messages', {
        chatId: String(chat.userId),
        chatType: 'user',
        chatName: chat.username ?? '',
        chatAvatar: chat.avatarUrl ?? undefined,
        userId: String(chat.userId),
      }),
    [navigation],
  );
  const openGroup = useCallback(
    (g: M.Group) => navigation.navigate('GroupMessages', { groupId: String(g.id), groupName: g.name, groupAvatar: g.avatarUrl || undefined }),
    [navigation],
  );
  const openChannel = useCallback((c: M.Channel) => navigation.navigate('ChannelDetails', { channelId: String(c.id) }), [navigation]);
  const openProfile = useCallback((userId: number) => navigation.navigate('UserProfile', { userId: String(userId) }), [navigation]);
  const openSettings = useCallback(() => navigation.navigate('Settings'), [navigation]);
  const soon = useCallback((title: string) => navigation.navigate('ComingSoon', { title }), [navigation]);
  const { t } = useTranslation();

  const onBottomTab = (next: BottomNavTab) => {
    switch (next) {
      case 'CONTACTS':
        setTab('CONTACTS');
        break;
      case 'FOLDERS':
        setShowFolders(true);
        break;
      case 'SETTINGS':
        openSettings();
        break;
      case 'PROFILE':
        openProfile(UserSession.userId);
        break;
      case 'CHATS':
        setTab('CHATS');
        break;
    }
  };

  const bottomBar = <AppBottomNavBar selectedTab={tab} onTabSelected={onBottomTab} />;
  const bottomInset = NAV_BAR_HEIGHT + insets.bottom;

  return (
    <View style={{ flex: 1 }}>
      {tab === 'CONTACTS' ? (
        <ContactsPlaceholder bottomBar={bottomBar} />
      ) : (
        <ChatsScreenModern
          onChatPress={openChat}
          onOpenProfile={openProfile}
          onGroupPress={openGroup}
          onChannelPress={openChannel}
          onSettingsPress={openSettings}
          onCreateChannelPress={() => soon(t('create_channel'))}
          onDrawerOpen={(d) => {
            const route = DRAWER_ROUTE[d];
            if (route === 'UserProfile') openProfile(UserSession.userId);
            else navigation.navigate(route as never);
          }}
          onAddAccount={() => navigation.navigate('AddAccount')}
          onAccountSwitched={() => {
            /* перезапуск — по смене userId выше */
          }}
          onRepliesPress={() => navigation.navigate('ChannelReplies')}
          onShowDrafts={() => navigation.navigate('Drafts')}
          onShowContactPicker={() => setTab('CONTACTS')}
          onCreateGroupPress={() => soon(t('create_group'))}
          onGroupLongPress={(g) => soon(g.name)}
          onCreateStoryPress={() => soon(t('create_story'))}
          onCreateChannelStoryPress={() => soon(t('create_story'))}
          onOpenUserStories={() => soon(t('stories'))}
          onOpenChannelStory={() => soon(t('stories'))}
          bottomBar={bottomBar}
          bottomInset={bottomInset}
        />
      )}
      <SharedFoldersSheet visible={showFolders} onDismiss={() => setShowFolders(false)} />
    </View>
  );
}

/** Вкладка «Контакты» — ContactPicker (порт в фазе «Контакты»). */
function ContactsPlaceholder({ bottomBar }: { bottomBar: React.ReactNode }) {
  const { t } = useTranslation();
  const cs = useWMTheme().colorScheme;
  return (
    <View style={{ flex: 1, backgroundColor: cs.background }}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 }}>
        <MaterialCommunityIcons name="contacts-outline" size={56} color={cs.outlineVariant} />
        <Text style={[WMTypography.titleMedium, { color: cs.onSurface }]}>{t('contacts')}</Text>
        <Text style={[WMTypography.bodyMedium, { color: cs.onSurfaceVariant }]}>{t('coming_soon')}</Text>
      </View>
      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0 }} pointerEvents="box-none">
        {bottomBar}
      </View>
    </View>
  );
}
