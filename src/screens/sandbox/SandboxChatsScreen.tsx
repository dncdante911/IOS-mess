// ─────────────────────────────────────────────────────────────────────────────
// Sandbox UI v4 — Chat List Screen
// Developer-only experimental interface. Enabled via 4-tap unlock in Settings.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TouchableHighlight,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  TextInput,
  Animated,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { format, isToday, isYesterday, isThisWeek } from 'date-fns';

import { Avatar } from '../../components/common/Avatar';
import { useChatStore } from '../../store/chatStore';
import { usePresenceStore } from '../../services/presenceService';
import { NewChatModal } from '../chats/NewChatModal';
import type { UserSearchResult } from '../../api/chatApi';
import { useTranslation, type TranslationKeys } from '../../i18n';
import type { Chat, Message } from '../../api/types';
import type { RootStackParamList, MainTabParamList } from '../../navigation/types';
import { MESSAGE_TYPES } from '../../constants/api';

// ─── Sandbox palette ────────────────────────────────────────────────────────
const SB = {
  bg: '#0B1523',
  surface: '#121E30',
  surfaceActive: '#182740',
  inputBg: '#162034',
  primary: '#40A7E3',
  primaryDim: 'rgba(64,167,227,0.14)',
  primaryText: '#7BCCED',
  text: '#EEF2F7',
  textSub: '#8A9BB0',
  textMuted: '#4E5E72',
  badgeBg: 'rgba(64,167,227,0.22)',
  badgeText: '#7BCCED',
  badgeMutedBg: 'rgba(255,255,255,0.08)',
  badgeMutedText: '#6B7C90',
  online: '#4CD964',
  divider: 'rgba(255,255,255,0.05)',
  navBg: 'rgba(11,21,35,0.94)',
  navBorder: 'rgba(255,255,255,0.08)',
  tabActive: '#40A7E3',
  tabInactive: '#4E5E72',
  fabBg: '#40A7E3',
};

const FLOAT_NAV_HEIGHT = 64;

type SBNavProp = CompositeNavigationProp<
  NativeStackNavigationProp<RootStackParamList>,
  BottomTabNavigationProp<MainTabParamList>
>;

const CHAT_TABS = ['Все', 'Личные', 'Группы', 'Каналы', 'Боты'] as const;
type ChatTab = (typeof CHAT_TABS)[number];

const NAV_TABS = [
  { key: 'Chats', icon: 'message-circle', label: 'Чаты' },
  { key: 'Calls', icon: 'phone', label: 'Звонки' },
  { key: 'Stories', icon: 'aperture', label: 'Истории' },
  { key: 'Settings', icon: 'settings', label: 'Профиль' },
] as const;

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatChatTime(ts: string | number | undefined, t: (k: TranslationKeys) => string): string {
  if (!ts) return '';
  const date = typeof ts === 'number' ? new Date(ts) : new Date(ts);
  if (isNaN(date.getTime())) return '';
  if (isToday(date)) return format(date, 'HH:mm');
  if (isYesterday(date)) return t('yesterday');   // было захардкожено «Вчера»
  if (isThisWeek(date)) return format(date, 'EEE');
  return format(date, 'dd.MM.yy');
}

function messagePreview(msg: Message | undefined, t: (k: TranslationKeys) => string): string {
  if (!msg) return '';
  if (msg.isDeleted) return t('message_deleted');
  switch (msg.type) {
    case MESSAGE_TYPES.IMAGE: return '📷 Фото';
    case MESSAGE_TYPES.VIDEO: return '🎥 Видео';
    case MESSAGE_TYPES.VOICE: return '🎤 Голосовое';
    case MESSAGE_TYPES.AUDIO: return '🎵 Аудио';
    case MESSAGE_TYPES.FILE: return '📎 Файл';
    case MESSAGE_TYPES.LOCATION: return '📍 Геолокация';
    default: return msg.decryptedText ?? msg.text ?? '';
  }
}

// ─── Chat item ──────────────────────────────────────────────────────────────

interface ChatItemProps {
  chat: Chat;
  isOnline: boolean;
  onPress: () => void;
  onLongPress: () => void;
}

const SandboxChatItem: React.FC<ChatItemProps> = ({ chat, isOnline, onPress, onLongPress }) => {
  const { t } = useTranslation();
  const preview = messagePreview(chat.lastMessage, t);
  const timeStr = formatChatTime(chat.lastMessage?.createdAt ?? chat.updatedAt, t);
  const hasUnread = chat.unreadCount > 0;
  const count = chat.unreadCount > 99 ? '99+' : String(chat.unreadCount);

  return (
    <TouchableHighlight
      onPress={onPress}
      onLongPress={onLongPress}
      underlayColor={SB.surfaceActive}
      style={styles.chatItem}
    >
      <View style={styles.chatItemInner}>
        {/* Avatar */}
        <View style={styles.avatarWrap}>
          <Avatar
            uri={chat.avatar}
            name={chat.name}
            size={54}
            showOnline
            isOnline={isOnline || !!chat.isOnline}
          />
          {chat.isPinned && (
            <View style={styles.pinDot}>
              <Feather name="bookmark" size={7} color={SB.primary} />
            </View>
          )}
        </View>

        {/* Content */}
        <View style={styles.chatContent}>
          <View style={styles.chatTopRow}>
            <View style={styles.nameRow}>
              <Text style={styles.chatName} numberOfLines={1}>{chat.name}</Text>
              {chat.isMuted && (
                <Feather name="bell-off" size={11} color={SB.textMuted} style={styles.muteIcon} />
              )}
            </View>
            <Text style={[styles.chatTime, hasUnread && !chat.isMuted && styles.chatTimeActive]}>
              {timeStr}
            </Text>
          </View>

          <View style={styles.chatBottomRow}>
            <Text style={styles.chatPreview} numberOfLines={1}>{preview}</Text>
            {hasUnread ? (
              <View style={[styles.badge, chat.isMuted && styles.badgeMuted]}>
                <Text style={[styles.badgeText, chat.isMuted && styles.badgeTextMuted]}>
                  {count}
                </Text>
              </View>
            ) : null}
          </View>
        </View>
      </View>
    </TouchableHighlight>
  );
};

// ─── Main screen ─────────────────────────────────────────────────────────────

export function SandboxChatsScreen() {
  const navigation = useNavigation<SBNavProp>();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState<ChatTab>('Все');
  const [searchText, setSearchText] = useState('');
  const [showNewChat, setShowNewChat] = useState(false);

  const chats = useChatStore((s) => s.chats);
  const isLoadingChats = useChatStore((s) => s.isLoadingChats);
  const onlineUsers = usePresenceStore((s) => s.onlineUsers);
  const loadChats = useChatStore((s) => s.loadChats);
  const archiveChat = useChatStore((s) => s.archiveChat);
  const muteChat = useChatStore((s) => s.muteChat);
  const pinChat = useChatStore((s) => s.pinChat);
  const deleteConversation = useChatStore((s) => s.deleteConversation);

  // Scroll fade for header
  const scrollY = useRef(new Animated.Value(0)).current;
  const headerShadowOpacity = scrollY.interpolate({
    inputRange: [0, 40],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  useEffect(() => {
    loadChats();
  }, [loadChats]);

  const filteredChats = useCallback(() => {
    let list = chats;
    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          (c.lastMessage?.text ?? '').toLowerCase().includes(q),
      );
    }
    if (activeTab === 'Личные') return list.filter((c) => c.type === 'personal' || c.type === 'user');
    if (activeTab === 'Группы') return list.filter((c) => c.type === 'group');
    if (activeTab === 'Каналы') return list.filter((c) => c.type === 'channel');
    if (activeTab === 'Боты') return list.filter((c) => !!c.isBot);
    return list;
  }, [chats, searchText, activeTab]);

  const openChat = useCallback(
    (chat: Chat) => {
      navigation.navigate('Messages', {
        chatId: chat.id,
        chatType: chat.type,
        chatName: chat.name,
        chatAvatar: chat.avatar,
        userId: chat.userId ?? chat.id,
      });
    },
    [navigation],
  );

  const openUserChat = useCallback(
    (user: UserSearchResult) => {
      navigation.navigate('Messages', {
        chatId: user.id,
        chatType: 'user',
        chatName: user.name,
        chatAvatar: user.avatar,
        userId: user.id,
      });
    },
    [navigation],
  );

  const showChatActions = useCallback(
    (chat: Chat) => {
      const userId = chat.userId ?? chat.id;
      Alert.alert(chat.name, undefined, [
        { text: chat.isArchived ? t('unarchive') : t('archive'), onPress: () => archiveChat(userId, !chat.isArchived) },
        { text: chat.isMuted ? t('unmute') : t('mute'), onPress: () => muteChat(userId, !chat.isMuted) },
        { text: chat.isPinned ? t('unpin') : t('pin'), onPress: () => pinChat(userId, !chat.isPinned) },
        {
          text: t('delete'),
          style: 'destructive',
          onPress: () =>
            Alert.alert(t('delete_chat'), t('delete_chat_confirm'), [
              { text: t('cancel'), style: 'cancel' },
              { text: t('delete'), style: 'destructive', onPress: () => deleteConversation(userId) },
            ]),
        },
        { text: t('cancel'), style: 'cancel' },
      ]);
    },
    [archiveChat, muteChat, pinChat, deleteConversation, t],
  );

  const keyExtractor = useCallback((item: Chat) => item.id, []);

  const renderItem = useCallback(
    ({ item }: { item: Chat }) => (
      <SandboxChatItem
        chat={item}
        isOnline={onlineUsers.has(item.userId ?? '')}
        onPress={() => openChat(item)}
        onLongPress={() => showChatActions(item)}
      />
    ),
    [onlineUsers, openChat, showChatActions],
  );

  const data = filteredChats();
  const bottomPad = insets.bottom + FLOAT_NAV_HEIGHT + 12;

  return (
    <View style={[styles.root, { backgroundColor: SB.bg }]}>
      <StatusBar barStyle="light-content" backgroundColor={SB.bg} />
      <SafeAreaView style={styles.safeArea} edges={['top']}>

        {/* ── Header ─────────────────────────────────────────── */}
        <Animated.View style={[styles.header, { shadowOpacity: headerShadowOpacity }]}>
          <Text style={styles.headerTitle}>WorldMates</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('GlobalSearch')}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Feather name="edit-2" size={20} color={SB.textSub} />
          </TouchableOpacity>
        </Animated.View>

        {/* ── Search bar ─────────────────────────────────────── */}
        <View style={styles.searchRow}>
          <View style={styles.searchBar}>
            <Feather name="search" size={15} color={SB.textMuted} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Поиск чатов"
              placeholderTextColor={SB.textMuted}
              value={searchText}
              onChangeText={setSearchText}
              returnKeyType="search"
              clearButtonMode="while-editing"
            />
          </View>
        </View>

        {/* ── Filter tabs ─────────────────────────────────────── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsBar}
        >
          {CHAT_TABS.map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ── Chat list ──────────────────────────────────────── */}
        <Animated.FlatList
          data={data}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          ListEmptyComponent={
            isLoadingChats ? null : (
              <View style={styles.emptyContainer}>
                <Feather name="message-circle" size={52} color={SB.textMuted} />
                <Text style={styles.emptyTitle}>
                  {searchText ? 'Ничего не найдено' : 'Нет чатов'}
                </Text>
                <Text style={styles.emptySub}>
                  {searchText ? 'Попробуйте другой запрос' : 'Начните новый разговор'}
                </Text>
              </View>
            )
          }
          refreshControl={
            <RefreshControl
              refreshing={isLoadingChats}
              onRefresh={loadChats}
              tintColor={SB.primary}
              colors={[SB.primary]}
            />
          }
          contentContainerStyle={[
            styles.listContent,
            data.length === 0 && styles.listEmpty,
            { paddingBottom: bottomPad },
          ]}
          showsVerticalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true },
          )}
          scrollEventThrottle={16}
        />

        {isLoadingChats && data.length === 0 && (
          <View style={[StyleSheet.absoluteFill, styles.loadingOverlay]}>
            <ActivityIndicator size="large" color={SB.primary} />
          </View>
        )}

      </SafeAreaView>

      {/* ── Floating nav bar ───────────────────────────────────── */}
      <View style={[styles.floatNavContainer, { bottom: insets.bottom + 12 }]}>
        <View style={styles.floatNav}>
          {NAV_TABS.map((tab) => {
            const isActive = tab.key === 'Chats';
            return (
              <TouchableOpacity
                key={tab.key}
                style={styles.navTabBtn}
                onPress={() => {
                  if (tab.key !== 'Chats') {
                    navigation.navigate(tab.key as keyof MainTabParamList);
                  }
                }}
                activeOpacity={0.7}
              >
                <View style={isActive ? styles.navIconActive : undefined}>
                  <Feather
                    name={tab.icon as React.ComponentProps<typeof Feather>['name']}
                    size={22}
                    color={isActive ? SB.tabActive : SB.tabInactive}
                  />
                </View>
                <Text style={[styles.navTabLabel, { color: isActive ? SB.tabActive : SB.tabInactive }]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* ── FAB ────────────────────────────────────────────────── */}
      <TouchableOpacity
        style={[styles.fab, { bottom: insets.bottom + FLOAT_NAV_HEIGHT + 24 }]}
        onPress={() => setShowNewChat(true)}
        activeOpacity={0.85}
      >
        <Feather name="edit-2" size={20} color="#FFFFFF" />
      </TouchableOpacity>

      <NewChatModal
        visible={showNewChat}
        onClose={() => setShowNewChat(false)}
        onSelectUser={openUserChat}
      />
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: SB.text,
    letterSpacing: -0.4,
  },
  searchRow: {
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SB.inputBg,
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 42,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: SB.text,
    paddingVertical: 0,
  },
  tabsBar: {
    paddingHorizontal: 14,
    paddingBottom: 10,
    gap: 6,
  },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  tabActive: {
    backgroundColor: SB.primaryDim,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '500',
    color: SB.textMuted,
  },
  tabTextActive: {
    color: SB.primary,
    fontWeight: '600',
  },
  chatItem: {
    backgroundColor: SB.bg,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  chatItemInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrap: {
    position: 'relative',
    marginRight: 12,
  },
  pinDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: SB.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: SB.bg,
  },
  chatContent: {
    flex: 1,
    justifyContent: 'center',
  },
  chatTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  chatName: {
    fontSize: 15,
    fontWeight: '600',
    color: SB.text,
    flexShrink: 1,
  },
  muteIcon: {
    marginLeft: 4,
  },
  chatTime: {
    fontSize: 12,
    color: SB.textMuted,
    flexShrink: 0,
  },
  chatTimeActive: {
    color: SB.primaryText,
  },
  chatBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chatPreview: {
    fontSize: 13,
    color: SB.textSub,
    flex: 1,
    marginRight: 6,
  },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 6,
    backgroundColor: SB.badgeBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeMuted: {
    backgroundColor: SB.badgeMutedBg,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: SB.badgeText,
  },
  badgeTextMuted: {
    color: SB.badgeMutedText,
  },
  listContent: {
    paddingTop: 4,
  },
  listEmpty: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    gap: 10,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: SB.textSub,
  },
  emptySub: {
    fontSize: 14,
    color: SB.textMuted,
    textAlign: 'center',
  },
  loadingOverlay: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: SB.bg,
  },
  // ── Floating nav ──────────────────────────────────────────
  floatNavContainer: {
    position: 'absolute',
    left: 16,
    right: 16,
  },
  floatNav: {
    flexDirection: 'row',
    height: FLOAT_NAV_HEIGHT,
    backgroundColor: SB.navBg,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: SB.navBorder,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.35,
        shadowRadius: 16,
      },
      android: {
        elevation: 16,
      },
    }),
  },
  navTabBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingVertical: 8,
  },
  navIconActive: {
    width: 36,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(64,167,227,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTabLabel: {
    fontSize: 10,
    fontWeight: '500',
  },
  fab: {
    position: 'absolute',
    right: 20,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: SB.fabBg,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: SB.fabBg,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
      },
      android: { elevation: 8 },
    }),
  },
});
