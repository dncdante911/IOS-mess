// АВТОГЕНЕРАЦИЯ: scripts/gen-android-db.mjs из Room-сущностей Android. Руками не править.
/* eslint-disable */
import type { EntityMeta } from '../room';

/** data/local/entity/AccountEntity.kt — таблица accounts */
export interface AccountEntity {
  userId: number;
  accessToken: string;
  username: string | null;
  avatar: string | null;
  isPro: number;
  addedAt: number;
  isActive: boolean;
}
export function newAccountEntity(f: Pick<AccountEntity, 'userId' | 'accessToken' | 'username' | 'avatar'> & Partial<AccountEntity>): AccountEntity {
  return { isPro: 0, addedAt: Date.now(), isActive: false, ...f } as AccountEntity;
}
export const AccountEntityMeta: EntityMeta = {"table":"accounts","pk":["userId"],"columns":["userId","accessToken","username","avatar","isPro","addedAt","isActive"],"bools":["isActive"],"ddl":["CREATE TABLE IF NOT EXISTS accounts (userId INTEGER NOT NULL PRIMARY KEY, accessToken TEXT NOT NULL, username TEXT, avatar TEXT, isPro INTEGER NOT NULL, addedAt INTEGER NOT NULL, isActive INTEGER NOT NULL)"]};

/** data/local/entity/CachedChannel.kt — таблица cached_channels */
export interface CachedChannel {
  id: number;
  name: string;
  avatarUrl: string | null;
  subscribersCount: number;
  isSubscribed: boolean;
  unreadCount: number;
  cachedAt: number;
}
export function newCachedChannel(f: Pick<CachedChannel, 'id'> & Partial<CachedChannel>): CachedChannel {
  return { name: "", avatarUrl: null, subscribersCount: 0, isSubscribed: true, unreadCount: 0, cachedAt: Date.now(), ...f } as CachedChannel;
}
export const CachedChannelMeta: EntityMeta = {"table":"cached_channels","pk":["id"],"columns":["id","name","avatarUrl","subscribersCount","isSubscribed","unreadCount","cachedAt"],"bools":["isSubscribed"],"ddl":["CREATE TABLE IF NOT EXISTS cached_channels (id INTEGER NOT NULL PRIMARY KEY, name TEXT NOT NULL, avatarUrl TEXT, subscribersCount INTEGER NOT NULL, isSubscribed INTEGER NOT NULL, unreadCount INTEGER NOT NULL, cachedAt INTEGER NOT NULL)"]};

/** data/local/entity/CachedChannelPost.kt — таблица cached_channel_posts */
export interface CachedChannelPost {
  id: number;
  channelId: number;
  createdTime: number;
  postJson: string;
  cachedAt: number;
}
export function newCachedChannelPost(f: Pick<CachedChannelPost, 'id' | 'channelId' | 'createdTime' | 'postJson'> & Partial<CachedChannelPost>): CachedChannelPost {
  return { cachedAt: Date.now(), ...f } as CachedChannelPost;
}
export const CachedChannelPostMeta: EntityMeta = {"table":"cached_channel_posts","pk":["id"],"columns":["id","channelId","createdTime","postJson","cachedAt"],"bools":[],"ddl":["CREATE TABLE IF NOT EXISTS cached_channel_posts (id INTEGER NOT NULL PRIMARY KEY, channelId INTEGER NOT NULL, createdTime INTEGER NOT NULL, postJson TEXT NOT NULL, cachedAt INTEGER NOT NULL)","CREATE INDEX IF NOT EXISTS idx_channel_post_time ON cached_channel_posts (channelId, createdTime)"]};

/** data/local/entity/CachedChat.kt — таблица cached_chats */
export interface CachedChat {
  id: number;
  ownerId: number;
  userId: number;
  username: string | null;
  avatarUrl: string | null;
  lastMessageText: string | null;
  lastMessageTime: number;
  unreadCount: number;
  isMuted: boolean;
  isOnline: boolean;
  isBot: boolean;
  isPro: number;
  pinnedMessageId: number | null;
  cachedAt: number;
}
export function newCachedChat(f: Pick<CachedChat, 'id'> & Partial<CachedChat>): CachedChat {
  return { ownerId: 0, userId: 0, username: null, avatarUrl: null, lastMessageText: null, lastMessageTime: 0, unreadCount: 0, isMuted: false, isOnline: false, isBot: false, isPro: 0, pinnedMessageId: null, cachedAt: Date.now(), ...f } as CachedChat;
}
export const CachedChatMeta: EntityMeta = {"table":"cached_chats","pk":["ownerId","id"],"columns":["id","ownerId","userId","username","avatarUrl","lastMessageText","lastMessageTime","unreadCount","isMuted","isOnline","isBot","isPro","pinnedMessageId","cachedAt"],"bools":["isMuted","isOnline","isBot"],"ddl":["CREATE TABLE IF NOT EXISTS cached_chats (id INTEGER NOT NULL, ownerId INTEGER NOT NULL, userId INTEGER NOT NULL, username TEXT, avatarUrl TEXT, lastMessageText TEXT, lastMessageTime INTEGER NOT NULL, unreadCount INTEGER NOT NULL, isMuted INTEGER NOT NULL, isOnline INTEGER NOT NULL, isBot INTEGER NOT NULL, isPro INTEGER NOT NULL, pinnedMessageId INTEGER, cachedAt INTEGER NOT NULL, PRIMARY KEY (ownerId, id))","CREATE INDEX IF NOT EXISTS idx_chat_last_time ON cached_chats (lastMessageTime)"]};

/** data/local/entity/CachedMessage.kt — таблица cached_messages */
export interface CachedMessage {
  id: number;
  ownerId: number;
  chatId: number;
  chatType: string;
  fromId: number;
  toId: number;
  groupId: number | null;
  encryptedText: string | null;
  iv: string | null;
  tag: string | null;
  cipherVersion: number | null;
  decryptedText: string | null;
  timestamp: number;
  mediaUrl: string | null;
  mediaFileName: string | null;
  type: string;
  mediaType: string | null;
  mediaDuration: number | null;
  mediaSize: number | null;
  localMediaPath: string | null;
  thumbnailPath: string | null;
  mediaLoadingState: string;
  senderName: string | null;
  senderAvatar: string | null;
  isEdited: boolean;
  editedTime: number | null;
  isDeleted: boolean;
  replyToId: number | null;
  replyToText: string | null;
  isRead: boolean;
  readAt: number | null;
  isSynced: boolean;
  syncedAt: number;
  cachedAt: number;
  destroyAt: number | null;
  isSecret: boolean;
  clientMsgId: string | null;
  fullMessageJson: string | null;
}
export const CachedMessageConsts = { CHAT_TYPE_USER: "user", CHAT_TYPE_GROUP: "group", TYPE_TEXT: "text", TYPE_IMAGE: "image", TYPE_VIDEO: "video", TYPE_AUDIO: "audio", TYPE_VOICE: "voice", TYPE_FILE: "file", TYPE_CALL: "call" } as const;
export function newCachedMessage(f: Pick<CachedMessage, 'id' | 'chatId' | 'chatType' | 'fromId' | 'toId' | 'encryptedText' | 'iv' | 'tag' | 'cipherVersion' | 'timestamp'> & Partial<CachedMessage>): CachedMessage {
  return { ownerId: 0, groupId: null, decryptedText: null, mediaUrl: null, mediaFileName: null, type: "text", mediaType: null, mediaDuration: null, mediaSize: null, localMediaPath: null, thumbnailPath: null, mediaLoadingState: "idle", senderName: null, senderAvatar: null, isEdited: false, editedTime: null, isDeleted: false, replyToId: null, replyToText: null, isRead: false, readAt: null, isSynced: true, syncedAt: Date.now(), cachedAt: Date.now(), destroyAt: null, isSecret: false, clientMsgId: null, fullMessageJson: null, ...f } as CachedMessage;
}
export const CachedMessageMeta: EntityMeta = {"table":"cached_messages","pk":["id"],"columns":["id","ownerId","chatId","chatType","fromId","toId","groupId","encryptedText","iv","tag","cipherVersion","decryptedText","timestamp","mediaUrl","mediaFileName","type","mediaType","mediaDuration","mediaSize","localMediaPath","thumbnailPath","mediaLoadingState","senderName","senderAvatar","isEdited","editedTime","isDeleted","replyToId","replyToText","isRead","readAt","isSynced","syncedAt","cachedAt","destroyAt","isSecret","clientMsgId","fullMessageJson"],"bools":["isEdited","isDeleted","isRead","isSynced","isSecret"],"ddl":["CREATE TABLE IF NOT EXISTS cached_messages (id INTEGER NOT NULL PRIMARY KEY, ownerId INTEGER NOT NULL, chatId INTEGER NOT NULL, chatType TEXT NOT NULL, fromId INTEGER NOT NULL, toId INTEGER NOT NULL, groupId INTEGER, encryptedText TEXT, iv TEXT, tag TEXT, cipherVersion INTEGER, decryptedText TEXT, timestamp INTEGER NOT NULL, mediaUrl TEXT, mediaFileName TEXT, type TEXT NOT NULL, mediaType TEXT, mediaDuration INTEGER, mediaSize INTEGER, localMediaPath TEXT, thumbnailPath TEXT, mediaLoadingState TEXT NOT NULL, senderName TEXT, senderAvatar TEXT, isEdited INTEGER NOT NULL, editedTime INTEGER, isDeleted INTEGER NOT NULL, replyToId INTEGER, replyToText TEXT, isRead INTEGER NOT NULL, readAt INTEGER, isSynced INTEGER NOT NULL, syncedAt INTEGER NOT NULL, cachedAt INTEGER NOT NULL, destroyAt INTEGER, isSecret INTEGER NOT NULL, clientMsgId TEXT, fullMessageJson TEXT)","CREATE INDEX IF NOT EXISTS idx_owner_chat_timestamp ON cached_messages (ownerId, chatId, timestamp)","CREATE INDEX IF NOT EXISTS idx_from_id ON cached_messages (fromId)","CREATE INDEX IF NOT EXISTS idx_to_id ON cached_messages (toId)","CREATE INDEX IF NOT EXISTS idx_is_synced ON cached_messages (isSynced)"]};

/** data/local/entity/ChatWallpaper.kt — таблица chat_wallpapers */
export interface ChatWallpaper {
  chatId: number;
  ownerId: number;
  chatType: string;
  backgroundImageUri: string | null;
  presetBackgroundId: string | null;
  updatedAt: number;
}
export function newChatWallpaper(f: Pick<ChatWallpaper, 'chatId' | 'chatType'> & Partial<ChatWallpaper>): ChatWallpaper {
  return { ownerId: 0, backgroundImageUri: null, presetBackgroundId: null, updatedAt: Date.now(), ...f } as ChatWallpaper;
}
export const ChatWallpaperMeta: EntityMeta = {"table":"chat_wallpapers","pk":["ownerId","chatId"],"columns":["chatId","ownerId","chatType","backgroundImageUri","presetBackgroundId","updatedAt"],"bools":[],"ddl":["CREATE TABLE IF NOT EXISTS chat_wallpapers (chatId INTEGER NOT NULL, ownerId INTEGER NOT NULL, chatType TEXT NOT NULL, backgroundImageUri TEXT, presetBackgroundId TEXT, updatedAt INTEGER NOT NULL, PRIMARY KEY (ownerId, chatId))"]};

/** data/local/entity/Draft.kt — таблица drafts */
export interface Draft {
  chatId: number;
  ownerId: number;
  text: string;
  chatType: string;
  updatedAt: number;
  replyToMessageId: number | null;
}
export const DraftConsts = { CHAT_TYPE_USER: "user", CHAT_TYPE_GROUP: "group" } as const;
export function newDraft(f: Pick<Draft, 'chatId' | 'text' | 'chatType'> & Partial<Draft>): Draft {
  return { ownerId: 0, updatedAt: Date.now(), replyToMessageId: null, ...f } as Draft;
}
export const DraftMeta: EntityMeta = {"table":"drafts","pk":["ownerId","chatId"],"columns":["chatId","ownerId","text","chatType","updatedAt","replyToMessageId"],"bools":[],"ddl":["CREATE TABLE IF NOT EXISTS drafts (chatId INTEGER NOT NULL, ownerId INTEGER NOT NULL, text TEXT NOT NULL, chatType TEXT NOT NULL, updatedAt INTEGER NOT NULL, replyToMessageId INTEGER, PRIMARY KEY (ownerId, chatId))"]};

/** data/local/entity/SignalPlaintextCache.kt — таблица signal_plaintext_cache */
export interface SignalPlaintextCache {
  msgId: number;
  plaintext: string;
  cachedAt: number;
}
export function newSignalPlaintextCache(f: Pick<SignalPlaintextCache, 'msgId' | 'plaintext'> & Partial<SignalPlaintextCache>): SignalPlaintextCache {
  return { cachedAt: Date.now(), ...f } as SignalPlaintextCache;
}
export const SignalPlaintextCacheMeta: EntityMeta = {"table":"signal_plaintext_cache","pk":["msgId"],"columns":["msgId","plaintext","cachedAt"],"bools":[],"ddl":["CREATE TABLE IF NOT EXISTS signal_plaintext_cache (msgId INTEGER NOT NULL PRIMARY KEY, plaintext TEXT NOT NULL, cachedAt INTEGER NOT NULL)","CREATE UNIQUE INDEX IF NOT EXISTS index_signal_plaintext_cache_msgId ON signal_plaintext_cache (msgId)"]};

export const ALL_ENTITIES: EntityMeta[] = [AccountEntityMeta, CachedChannelMeta, CachedChannelPostMeta, CachedChatMeta, CachedMessageMeta, ChatWallpaperMeta, DraftMeta, SignalPlaintextCacheMeta];
