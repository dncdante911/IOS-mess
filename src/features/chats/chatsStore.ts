/**
 * Список личных чатов — порт Android ui/chats/ChatsViewModel.kt.
 *
 *  • первый кадр — из офлайн-кеша (cached_chats), затем через 2 с REST
 *  • пагинация по 50; превью последнего сообщения: E2EE v6 — расшифровка,
 *    v1/v2 — старые форматы, «голые» ссылки на медиа → «Фото/Видео/…»
 *  • скрытые чаты (сервер), архив (сервер + локальный набор), бизнес-входящие
 *  • удаление: только у себя / у обоих / с блокировкой — с чисткой офлайн-кеша
 *  • ответы на комментарии в каналах (бейдж), онлайн-статусы, удаление
 *    переписки собеседником — по сокету
 */
import { create } from 'zustand';
import { NodeRetrofitClient, type M } from '../../core/android';
import { AppDatabase, newCachedChat } from '../../core/db';
import { UserSession } from '../../core/session';
import { decryptMessageOrOriginal } from '../../core/crypto/legacyCrypto';
import { e2eePreviewText } from '../../core/crypto/e2eeAccess';
import { getTranslation } from '../../i18n';
import { socketService } from '../../services/socketService';
import { convertMediaUrlToLabel, getLastMessagePreview } from '../messages/messageHelpers';
import { ChatOrganizationManager } from './chatOrganization';
import { LiveChannelTracker } from '../channels/liveChannelTracker';
import { parseChannelReply } from '../channels/channelReply';

const PAGE_SIZE = 50;

interface ChatsState {
  chatList: M.Chat[];
  businessChatList: M.Chat[];
  hiddenChats: M.Chat[];
  archivedChats: M.Chat[];
  hiddenChatsCount: number;
  isLoading: boolean;
  isLoadingMore: boolean;
  isLoadingBusiness: boolean;
  hasMoreChats: boolean;
  error: string | null;
  needsRelogin: boolean;
  replyInboxTotal: number;
  latestChannelReply: M.ChannelReply | null;
}

export const useChatsStore = create<ChatsState>(() => ({
  chatList: [],
  businessChatList: [],
  hiddenChats: [],
  archivedChats: [],
  hiddenChatsCount: 0,
  isLoading: false,
  isLoadingMore: false,
  isLoadingBusiness: false,
  hasMoreChats: true,
  error: null,
  needsRelogin: false,
  replyInboxTotal: 0,
  latestChannelReply: null,
}));

const set = useChatsStore.setState;
const get = useChatsStore.getState;
let chatsOffset = 0;
let authErrorCount = 0;

/** Превью последнего сообщения (decryptedText уже отображаемый). */
async function withPreview(chat: M.Chat, strictLooksEncrypted = false): Promise<M.Chat> {
  const msg = chat.lastMessage;
  if (!msg) return chat;
  let text: string;
  if (msg.cipherVersion === 3 || msg.cipherVersion === 6) {
    text = await e2eePreviewText(msg);
  } else {
    const enc = msg.encryptedText ?? '';
    if (!enc) text = '';
    else {
      const result = decryptMessageOrOriginal(enc, msg.timeStamp, msg.iv, msg.tag, msg.cipherVersion);
      // Первая страница на Android дополнительно ловит «похоже на шифротекст»
      const looksEncrypted =
        result === enc && enc.length >= 12 && enc.length % 4 === 0 && /^[A-Za-z0-9+/=]+$/.test(enc);
      text = strictLooksEncrypted && looksEncrypted ? getTranslation('last_message_encrypted') : result;
    }
  }
  return { ...chat, lastMessage: { ...msg, decryptedText: convertMediaUrlToLabel(text) } };
}

async function cacheChats(chats: M.Chat[]): Promise<void> {
  try {
    const owner = UserSession.userId;
    const rows = chats.map((c) =>
      newCachedChat({
        id: c.id,
        ownerId: owner,
        userId: c.userId,
        username: c.username,
        avatarUrl: c.avatarUrl,
        lastMessageText: c.lastMessage ? getLastMessagePreview(c.lastMessage) : null,
        lastMessageTime: c.lastMessage?.timeStamp ?? 0,
        unreadCount: c.unreadCount,
        isMuted: c.isMuted,
        isOnline: c.isOnline,
        isBot: c.isBot,
        isPro: c.isPro,
        pinnedMessageId: c.pinnedMessageId,
      }),
    );
    await AppDatabase.chatListDao().replaceAll(owner, rows);
  } catch (e) {
    console.warn('[Chats] cacheChats:', e);
  }
}

/** CachedChat → Chat (только decryptedText последнего сообщения — уже готовое превью). */
function fromCache(c: Awaited<ReturnType<ReturnType<typeof AppDatabase.chatListDao>['getAllChats']>>[number]): M.Chat {
  return {
    id: c.id,
    userId: c.userId,
    username: c.username,
    avatarUrl: c.avatarUrl,
    lastMessage: {
      id: 0,
      fromId: 0,
      toId: 0,
      groupId: null,
      encryptedText: null,
      timeStamp: c.lastMessageTime,
      mediaUrl: null,
      mediaFileName: null,
      type: null,
      mediaType: null,
      mediaDuration: null,
      mediaSize: null,
      senderName: null,
      senderAvatar: null,
      isEdited: false,
      editedTime: null,
      isDeleted: false,
      replyToId: null,
      replyToText: null,
      replyToName: null,
      isRead: false,
      readAt: null,
      iv: null,
      tag: null,
      cipherVersion: null,
      signalHeader: null,
      reactions: null,
      typeTwo: null,
      stickers: null,
      albumId: null,
      lat: null,
      lng: null,
      contact: null,
      replyMarkup: null,
      botId: null,
      decryptedText: c.lastMessageText,
      decryptedMediaUrl: null,
      isLocalPending: false,
    },
    unreadCount: c.unreadCount,
    chatType: 'user',
    isGroup: false,
    isPrivate: false,
    description: null,
    membersCount: 0,
    isAdmin: false,
    isMuted: c.isMuted,
    pinnedMessageId: c.pinnedMessageId,
    lastActivity: null,
    isOnline: c.isOnline,
    isBot: c.isBot,
    botDescription: null,
    isPro: c.isPro,
  };
}

async function purgeLocalChatCache(userId: number): Promise<void> {
  try {
    await AppDatabase.messageDao().clearChatCache(UserSession.userId, userId, 'user');
    await AppDatabase.chatListDao().deleteChat(UserSession.userId, userId);
  } catch (e) {
    console.warn('[Chats] purgeLocalChatCache:', e);
  }
}

const dropChat = (userId: number) => set((s) => ({ chatList: s.chatList.filter((c) => c.userId !== userId) }));

export const ChatsViewModel = {
  /** init { cache → 2 c → fetch } + сокет. Вызывать при входе на главный экран. */
  async start(): Promise<void> {
    await ChatsViewModel.loadCachedChatsIntoList();
    setTimeout(() => {
      ChatsViewModel.fetchChats();
      ChatsViewModel.fetchHiddenChatsCount();
      ChatsViewModel.loadReplyInboxPreview();
    }, 2000);
    attachSocket();
  },

  async loadCachedChatsIntoList(): Promise<void> {
    try {
      const cached = await AppDatabase.chatListDao().getAllChats(UserSession.userId);
      if (cached.length && get().chatList.length === 0) set({ chatList: cached.map(fromCache) });
    } catch (e) {
      console.warn('[Chats] cache read:', e);
    }
  },

  async loadReplyInboxPreview(): Promise<void> {
    try {
      const r = await NodeRetrofitClient.channelApi.getReplyInbox(1);
      if (r.apiStatus === 200) set({ replyInboxTotal: r.total, latestChannelReply: r.replies?.[0] ?? null });
    } catch (e) {
      console.warn('[Chats] reply inbox:', e);
    }
  },

  /** Первая страница (сбрасывает пагинацию). */
  async fetchChats(): Promise<void> {
    if (!UserSession.accessToken) {
      set({ error: getTranslation('geo_not_authenticated') });
      return;
    }
    chatsOffset = 0;
    set({ hasMoreChats: true, isLoading: true, error: null });
    try {
      const r = await NodeRetrofitClient.api.getChats(PAGE_SIZE, 0);
      if (r.apiStatus === 200) {
        authErrorCount = 0;
        const data = r.data ?? [];
        if (data.length) {
          const chats = await Promise.all(data.filter((c) => !c.isGroup).map((c) => withPreview(c, true)));
          chatsOffset = chats.length;
          set({ chatList: chats, hasMoreChats: data.length >= PAGE_SIZE, error: null });
          void cacheChats(chats);
        } else {
          set({ chatList: [], hasMoreChats: false, error: null });
        }
      } else if (r.apiStatus === 401 || r.apiStatus === 403) {
        // Refresh решает, жива ли сессия; при живом токене это временный сбой — не разлогиниваем
        if (!UserSession.accessToken) {
          set({ needsRelogin: true, error: getTranslation('error_session_expired') });
        } else {
          authErrorCount++;
          set({ error: r.errorMessage ?? getTranslation('error_auth_retry') });
        }
      } else {
        authErrorCount = 0;
        set({ error: r.errorMessage ?? getTranslation('unknown_error') });
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : '';
      set({
        error: /Network request failed/i.test(msg)
          ? getTranslation('error_connect_server')
          : getTranslation('error_with_message', undefined, [msg]),
      });
    } finally {
      set({ isLoading: false });
    }
  },

  /** Следующая страница (бесконечная прокрутка). */
  async loadMoreChats(): Promise<void> {
    const s = get();
    if (s.isLoadingMore || !s.hasMoreChats || !UserSession.accessToken) return;
    set({ isLoadingMore: true });
    try {
      const r = await NodeRetrofitClient.api.getChats(PAGE_SIZE, chatsOffset);
      const data = r.data ?? [];
      if (r.apiStatus === 200 && data.length) {
        const fresh = await Promise.all(data.filter((c) => !c.isGroup).map((c) => withPreview(c)));
        const ids = new Set(get().chatList.map((c) => c.id));
        set({ chatList: [...get().chatList, ...fresh.filter((c) => !ids.has(c.id))], hasMoreChats: data.length >= PAGE_SIZE });
        chatsOffset += data.length;
      } else {
        set({ hasMoreChats: false });
      }
    } catch (e) {
      console.warn('[Chats] loadMore:', e);
    } finally {
      set({ isLoadingMore: false });
    }
  },

  // ── Архив ──
  async archiveChat(userId: number): Promise<void> {
    try {
      const r = await NodeRetrofitClient.api.archiveChat(userId, 'yes');
      if (r.apiStatus === 200) {
        ChatOrganizationManager.archiveChat(userId);
        dropChat(userId);
      }
    } catch {
      ChatOrganizationManager.archiveChat(userId);
      dropChat(userId);
    }
  },
  async unarchiveChat(userId: number): Promise<void> {
    try {
      const r = await NodeRetrofitClient.api.archiveChat(userId, 'no');
      if (r.apiStatus !== 200) return;
    } catch {
      /* fallback ниже — как на Android */
    }
    ChatOrganizationManager.unarchiveChat(userId);
    set((s) => ({ archivedChats: s.archivedChats.filter((c) => c.userId !== userId) }));
    void ChatsViewModel.fetchChats();
  },
  /** Сервер возвращает ТОЛЬКО архивные при show_archived=true. */
  async fetchArchivedChats(): Promise<void> {
    if (!UserSession.accessToken) return;
    try {
      const r = await NodeRetrofitClient.api.getChats(100, 0, 'true');
      if (r.apiStatus !== 200) return;
      const chats = await Promise.all((r.data ?? []).filter((c) => !c.isGroup).map((c) => withPreview(c)));
      set({ archivedChats: chats });
      // архивированные с другого устройства тоже показывают «Разархивировать»
      chats.forEach((c) => ChatOrganizationManager.archiveChat(c.userId));
    } catch (e) {
      console.warn('[Chats] archived:', e);
    }
  },

  /** Отключить/включить уведомления чата (свайп). */
  async muteChat(chatId: number, mute: boolean): Promise<void> {
    try {
      await NodeRetrofitClient.api.muteChat(chatId, mute ? 'no' : 'yes', mute ? 'no' : 'yes');
      set((s) => ({ chatList: s.chatList.map((c) => (c.id === chatId || c.userId === chatId ? { ...c, isMuted: mute } : c)) }));
    } catch (e) {
      console.warn('[Chats] mute:', e);
    }
  },

  // ── Скрытые ──
  async fetchHiddenChats(): Promise<void> {
    if (!UserSession.accessToken) return;
    try {
      const r = await NodeRetrofitClient.api.getChats(100, 0, 'false', 'true');
      if (r.apiStatus !== 200) return;
      const chats = await Promise.all((r.data ?? []).filter((c) => !c.isGroup).map((c) => withPreview(c)));
      set({ hiddenChats: chats, hiddenChatsCount: chats.length });
    } catch (e) {
      console.warn('[Chats] hidden:', e);
    }
  },
  async fetchHiddenChatsCount(): Promise<void> {
    if (!UserSession.accessToken) return;
    try {
      const r = await NodeRetrofitClient.api.getHiddenChatsCount();
      if (r.apiStatus === 200) set({ hiddenChatsCount: r.count });
    } catch (e) {
      console.warn('[Chats] hidden count:', e);
    }
  },
  async hideChat(userId: number): Promise<void> {
    try {
      const r = await NodeRetrofitClient.api.hideChat(userId, 'yes');
      if (r.apiStatus === 200) {
        dropChat(userId);
        set((s) => ({ hiddenChatsCount: s.hiddenChatsCount + 1 }));
      }
    } catch {
      dropChat(userId);
    }
  },
  async unhideChat(userId: number): Promise<void> {
    try {
      const r = await NodeRetrofitClient.api.hideChat(userId, 'no');
      if (r.apiStatus === 200) {
        set((s) => ({ hiddenChats: s.hiddenChats.filter((c) => c.userId !== userId), hiddenChatsCount: Math.max(0, s.hiddenChatsCount - 1) }));
        void ChatsViewModel.fetchChats();
      }
    } catch {
      set((s) => ({ hiddenChats: s.hiddenChats.filter((c) => c.userId !== userId) }));
      void ChatsViewModel.fetchChats();
    }
  },

  // ── Удаление (3 варианта) ──
  async deleteChatForMe(userId: number, onSuccess?: () => void): Promise<void> {
    try {
      const r = await NodeRetrofitClient.api.deleteConversation(userId, 'me');
      if (r.apiStatus === 200) {
        dropChat(userId);
        await purgeLocalChatCache(userId);
        onSuccess?.();
      }
    } catch (e) {
      console.warn('[Chats] deleteForMe:', e);
    }
  },
  /** 'all' сам чистит переписку у обеих сторон на бэкенде (без «призрака» у собеседника). */
  async deleteChatForEveryone(userId: number, onSuccess?: () => void): Promise<void> {
    try {
      const r = await NodeRetrofitClient.api.deleteConversation(userId, 'all');
      if (r.apiStatus === 200) {
        dropChat(userId);
        await purgeLocalChatCache(userId);
        onSuccess?.();
      }
    } catch (e) {
      console.warn('[Chats] deleteForEveryone:', e);
    }
  },
  async deleteChatAndBlock(userId: number, onSuccess?: () => void): Promise<void> {
    try {
      await NodeRetrofitClient.api.deleteConversation(userId, 'me');
      await NodeRetrofitClient.profileApi.blockUser(userId);
      dropChat(userId);
      await purgeLocalChatCache(userId);
      onSuccess?.();
    } catch (e) {
      console.warn('[Chats] deleteAndBlock:', e);
    }
  },

  // ── Бизнес ──
  async fetchBusinessChats(): Promise<void> {
    if (!UserSession.accessToken) return;
    set({ isLoadingBusiness: true });
    try {
      const r = await NodeRetrofitClient.api.getBusinessInbox(50, 0);
      if (r.apiStatus === 200) set({ businessChatList: r.data ?? [] });
    } catch (e) {
      console.warn('[Chats] business:', e);
    } finally {
      set({ isLoadingBusiness: false });
    }
  },

  /** Локально обнулить непрочитанные (после открытия чата). */
  markChatRead(userId: number): void {
    set((s) => ({ chatList: s.chatList.map((c) => (c.userId === userId ? { ...c, unreadCount: 0 } : c)) }));
  },

  clearError: () => set({ error: null }),
  reset: () => {
    chatsOffset = 0;
    set({ chatList: [], businessChatList: [], hiddenChats: [], archivedChats: [], hiddenChatsCount: 0, error: null, needsRelogin: false, replyInboxTotal: 0, latestChannelReply: null });
  },
};

// ─── Сокет ────────────────────────────────────────────────────────────────────
let detach: Array<() => void> = [];
let refetchTimer: ReturnType<typeof setTimeout> | null = null;

function scheduleRefetch(business: boolean): void {
  // Пачка сообщений подряд → один запрос
  if (refetchTimer) clearTimeout(refetchTimer);
  refetchTimer = setTimeout(() => {
    if (business) void ChatsViewModel.fetchBusinessChats();
    else void ChatsViewModel.fetchChats();
  }, 300);
}

function userIdOf(arg: unknown): number {
  if (typeof arg === 'number') return arg;
  if (typeof arg === 'string') return Number(arg) || 0;
  if (arg && typeof arg === 'object') return Number((arg as Record<string, unknown>).user_id) || 0;
  return 0;
}

function setOnline(userId: number, isOnline: boolean): void {
  if (userId <= 0) return;
  set((s) => ({ chatList: s.chatList.map((c) => (c.userId === userId ? { ...c, isOnline } : c)) }));
}

function attachSocket(): void {
  detach.forEach((d) => d());
  const onMsg = (data: unknown) => {
    const isBusiness = Number((data as Record<string, unknown> | null)?.is_business_chat ?? 0) === 1;
    scheduleRefetch(isBusiness);
  };
  detach = [
    socketService.on('private_message', onMsg),
    socketService.on('new_message', onMsg),
    socketService.on('on_user_loggedin', (a) => setOnline(userIdOf(a), true)),
    socketService.on('on_user_loggedoff', (a) => setOnline(userIdOf(a), false)),
    socketService.on('conversation_deleted', (raw) => {
      const d = (raw ?? {}) as Record<string, unknown>;
      const me = UserSession.userId;
      const from = Number(d.from_id) || 0;
      const to = Number(d.recipient_id) || 0;
      const other = from === me ? to : to === me ? from : 0;
      if (!other) return;
      dropChat(other);
      void purgeLocalChatCache(other);
    }),
    socketService.on('channel_reply_received', (raw) => {
      const reply = parseChannelReply(raw);
      if (!reply) return;
      set((s) => ({ latestChannelReply: reply, replyInboxTotal: s.replyInboxTotal + 1 }));
    }),
    socketService.on('channel:stream_started', (raw) => LiveChannelTracker.markLive(Number((raw as Record<string, unknown>)?.channelId) || 0)),
    socketService.on('channel:stream_ended', (raw) => LiveChannelTracker.markEnded(Number((raw as Record<string, unknown>)?.channelId) || 0)),
    socketService.onConnect(() => set({ error: null })),
  ];
}
