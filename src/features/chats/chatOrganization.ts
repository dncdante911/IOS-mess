/**
 * ChatOrganizationManager — порт Android ui/chats/ChatOrganizationManager.kt.
 * Папки в стиле Telegram (для чатов, каналов и групп), локальный архив, теги.
 * Лимиты: Free — 10 своих папок, PRO — 50. Данные локальные, отдельно на
 * каждый аккаунт (ключи с userId), как SharedPreferences "chat_organization_<uid>".
 */
import { create } from 'zustand';
import { kv } from '../../core/platform/kv';
import { UserSession } from '../../core/session';
import { onAccountSwitched } from '../../core/accountManager';

export type FolderContentType = 'ALL' | 'CHATS' | 'CHANNELS' | 'GROUPS';

export interface ChatFolder {
  id: string;
  name: string;
  emoji: string;
  order: number;
  isCustom: boolean;
  contentType: FolderContentType;
}

export interface ChatTag {
  name: string;
  color: string;
}

export const PRESET_TAGS: ChatTag[] = [
  { name: 'Робота', color: '#FF5722' },
  { name: "Сім'я", color: '#E91E63' },
  { name: 'Друзі', color: '#2196F3' },
  { name: 'Важливе', color: '#FF9800' },
  { name: 'Покупки', color: '#4CAF50' },
  { name: 'Навчання', color: '#9C27B0' },
  { name: 'Проекти', color: '#607D8B' },
  { name: 'Подорожі', color: '#00BCD4' },
];

export const MAX_FOLDERS_FREE = 10;
export const MAX_FOLDERS_PRO = 50;

/** Стандартные папки (как на Android; подписи локализует UI по id). */
function defaultFolders(): ChatFolder[] {
  return [
    { id: 'all', name: 'Усі', emoji: '💬', order: 0, isCustom: false, contentType: 'ALL' },
    { id: 'personal', name: 'Особисті', emoji: '👤', order: 1, isCustom: false, contentType: 'CHATS' },
    { id: 'channels', name: 'Канали', emoji: '📢', order: 2, isCustom: false, contentType: 'CHANNELS' },
    { id: 'groups', name: 'Групи', emoji: '👥', order: 3, isCustom: false, contentType: 'GROUPS' },
  ];
}

interface OrgState {
  folders: ChatFolder[];
  archivedChatIds: number[];
  chatTags: Record<number, ChatTag[]>;
  chatFolderMapping: Record<number, string>;
  channelFolderMapping: Record<number, string>;
  groupFolderMapping: Record<number, string>;
}

export const useChatOrganization = create<OrgState>(() => ({
  folders: defaultFolders(),
  archivedChatIds: [],
  chatTags: {},
  chatFolderMapping: {},
  channelFolderMapping: {},
  groupFolderMapping: {},
}));

let uid = 0;
const key = (k: string) => `chat_organization_${uid}:${k}`;
const K = {
  folders: 'folders_v2',
  archived: 'archived_chat_ids',
  tags: 'chat_tags',
  chatMap: 'chat_folder_mapping',
  channelMap: 'channel_folder_mapping',
  groupMap: 'group_folder_mapping',
};

function save<Kk extends keyof OrgState>(field: Kk, storeKey: string) {
  kv.setJson(key(storeKey), useChatOrganization.getState()[field]);
}

export const ChatOrganizationManager = {
  init(userId: number = UserSession.userId): void {
    uid = userId;
    let folders = kv.getJson<ChatFolder[] | null>(key(K.folders), null);
    if (!folders) {
      folders = defaultFolders();
      kv.setJson(key(K.folders), folders);
    }
    useChatOrganization.setState({
      folders,
      archivedChatIds: kv.getJson<number[]>(key(K.archived), []),
      chatTags: kv.getJson<Record<number, ChatTag[]>>(key(K.tags), {}),
      chatFolderMapping: kv.getJson<Record<number, string>>(key(K.chatMap), {}),
      channelFolderMapping: kv.getJson<Record<number, string>>(key(K.channelMap), {}),
      groupFolderMapping: kv.getJson<Record<number, string>>(key(K.groupMap), {}),
    });
  },

  /** Переинициализация при переключении аккаунта. */
  reinitForAccount(userId: number): void {
    ChatOrganizationManager.init(userId);
  },

  getMaxCustomFolders: () => (UserSession.isPro > 0 ? MAX_FOLDERS_PRO : MAX_FOLDERS_FREE),
  getCustomFolderCount: () => useChatOrganization.getState().folders.filter((f) => f.isCustom).length,
  canCreateFolder: () => ChatOrganizationManager.getCustomFolderCount() < ChatOrganizationManager.getMaxCustomFolders(),
  /** Подсказка «X/Y папок. PRO: до 50» — free-пользователю на последнем шаге до лимита. */
  shouldShowFolderUpgradeHint(): boolean {
    if (UserSession.isProActive) return false;
    return ChatOrganizationManager.getCustomFolderCount() >= ChatOrganizationManager.getMaxCustomFolders() - 1;
  },

  // ── Папки ──
  addFolder(name: string, emoji: string): boolean {
    if (!ChatOrganizationManager.canCreateFolder()) return false;
    const s = useChatOrganization.getState();
    const folder: ChatFolder = { id: `custom_${Date.now()}`, name, emoji, order: s.folders.length, isCustom: true, contentType: 'ALL' };
    useChatOrganization.setState({ folders: [...s.folders, folder] });
    save('folders', K.folders);
    return true;
  },
  removeFolder(folderId: string): void {
    const s = useChatOrganization.getState();
    const drop = (m: Record<number, string>) => Object.fromEntries(Object.entries(m).filter(([, v]) => v !== folderId)) as Record<number, string>;
    useChatOrganization.setState({
      folders: s.folders.filter((f) => f.id !== folderId),
      chatFolderMapping: drop(s.chatFolderMapping),
      channelFolderMapping: drop(s.channelFolderMapping),
      groupFolderMapping: drop(s.groupFolderMapping),
    });
    save('folders', K.folders);
    save('chatFolderMapping', K.chatMap);
    save('channelFolderMapping', K.channelMap);
    save('groupFolderMapping', K.groupMap);
  },
  renameFolder(folderId: string, name: string, emoji: string): void {
    useChatOrganization.setState((s) => ({ folders: s.folders.map((f) => (f.id === folderId ? { ...f, name, emoji } : f)) }));
    save('folders', K.folders);
  },

  // ── Архив (локальный набор; сервер — источник правды в ChatsViewModel) ──
  archiveChat(chatId: number): void {
    useChatOrganization.setState((s) => ({ archivedChatIds: s.archivedChatIds.includes(chatId) ? s.archivedChatIds : [...s.archivedChatIds, chatId] }));
    save('archivedChatIds', K.archived);
  },
  unarchiveChat(chatId: number): void {
    useChatOrganization.setState((s) => ({ archivedChatIds: s.archivedChatIds.filter((id) => id !== chatId) }));
    save('archivedChatIds', K.archived);
  },
  isArchived: (chatId: number) => useChatOrganization.getState().archivedChatIds.includes(chatId),

  // ── Теги ──
  addTagToChat(chatId: number, tag: ChatTag): void {
    const s = useChatOrganization.getState();
    const tags = s.chatTags[chatId] ?? [];
    if (tags.some((t) => t.name === tag.name)) return;
    useChatOrganization.setState({ chatTags: { ...s.chatTags, [chatId]: [...tags, tag] } });
    save('chatTags', K.tags);
  },
  removeTagFromChat(chatId: number, tagName: string): void {
    const s = useChatOrganization.getState();
    const next = { ...s.chatTags };
    const tags = (next[chatId] ?? []).filter((t) => t.name !== tagName);
    if (tags.length) next[chatId] = tags;
    else delete next[chatId];
    useChatOrganization.setState({ chatTags: next });
    save('chatTags', K.tags);
  },
  getTagsForChat: (chatId: number) => useChatOrganization.getState().chatTags[chatId] ?? [],
  getAllUsedTags(): ChatTag[] {
    const seen = new Set<string>();
    return Object.values(useChatOrganization.getState().chatTags)
      .flat()
      .filter((t) => (seen.has(t.name) ? false : (seen.add(t.name), true)));
  },

  // ── Распределение по папкам ──
  moveChatToFolder(chatId: number, folderId: string): void {
    useChatOrganization.setState((s) => ({ chatFolderMapping: { ...s.chatFolderMapping, [chatId]: folderId } }));
    save('chatFolderMapping', K.chatMap);
  },
  removeChatFromFolder(chatId: number): void {
    useChatOrganization.setState((s) => {
      const m = { ...s.chatFolderMapping };
      delete m[chatId];
      return { chatFolderMapping: m };
    });
    save('chatFolderMapping', K.chatMap);
  },
  getChatFolder: (chatId: number) => useChatOrganization.getState().chatFolderMapping[chatId] ?? null,
  moveChannelToFolder(channelId: number, folderId: string): void {
    useChatOrganization.setState((s) => ({ channelFolderMapping: { ...s.channelFolderMapping, [channelId]: folderId } }));
    save('channelFolderMapping', K.channelMap);
  },
  removeChannelFromFolder(channelId: number): void {
    useChatOrganization.setState((s) => {
      const m = { ...s.channelFolderMapping };
      delete m[channelId];
      return { channelFolderMapping: m };
    });
    save('channelFolderMapping', K.channelMap);
  },
  moveGroupToFolder(groupId: number, folderId: string): void {
    useChatOrganization.setState((s) => ({ groupFolderMapping: { ...s.groupFolderMapping, [groupId]: folderId } }));
    save('groupFolderMapping', K.groupMap);
  },
  removeGroupFromFolder(groupId: number): void {
    useChatOrganization.setState((s) => {
      const m = { ...s.groupFolderMapping };
      delete m[groupId];
      return { groupFolderMapping: m };
    });
    save('groupFolderMapping', K.groupMap);
  },
};

// Android AccountManager.switchAccount → ChatOrganizationManager.reinitForAccount
onAccountSwitched((userId) => ChatOrganizationManager.reinitForAccount(userId));
