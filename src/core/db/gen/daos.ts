// АВТОГЕНЕРАЦИЯ: scripts/gen-android-db.mjs из Room-DAO Android. Руками не править.
/* eslint-disable */
import { room, LiveQuery } from '../room';
import * as E from './entities';

/** data/local/dao/AccountDao.kt */
export const AccountDao = {
  getAllAccountsFlow(): LiveQuery<E.AccountEntity[]> {
    return room.live("SELECT * FROM accounts ORDER BY addedAt ASC", {  }, "all", E.AccountEntityMeta, ["accounts"]);
  },
  async getAllAccounts(): Promise<E.AccountEntity[]> {
    return room.query("SELECT * FROM accounts ORDER BY addedAt ASC", {  }, "all", E.AccountEntityMeta, ["accounts"]) as Promise<E.AccountEntity[]>;
  },
  async getActiveAccount(): Promise<E.AccountEntity | null> {
    return room.query("SELECT * FROM accounts WHERE isActive = 1 LIMIT 1", {  }, "first", E.AccountEntityMeta, ["accounts"]) as Promise<E.AccountEntity | null>;
  },
  async getAccountCount(): Promise<number> {
    return room.query("SELECT COUNT(*) FROM accounts", {  }, "scalar", null, ["accounts"]) as Promise<number>;
  },
  async getAccountById(userId: number): Promise<E.AccountEntity | null> {
    return room.query("SELECT * FROM accounts WHERE userId = :userId LIMIT 1", { userId }, "first", E.AccountEntityMeta, ["accounts"]) as Promise<E.AccountEntity | null>;
  },
  async insertAccount(account: E.AccountEntity): Promise<void> {
    return room.insert(E.AccountEntityMeta, [account], "REPLACE") as any;
  },
  async deleteAccount(account: E.AccountEntity): Promise<void> {
    return room.delete(E.AccountEntityMeta, [account]);
  },
  async deleteAccountById(userId: number): Promise<void> {
    return room.write("DELETE FROM accounts WHERE userId = :userId", { userId }, "run", null, ["accounts"]) as Promise<void>;
  },
  async deleteAll(): Promise<void> {
    return room.write("DELETE FROM accounts", {  }, "run", null, ["accounts"]) as Promise<void>;
  },
  async clearAllActive(): Promise<void> {
    return room.write("UPDATE accounts SET isActive = 0", {  }, "run", null, ["accounts"]) as Promise<void>;
  },
  async setActiveAccount(userId: number): Promise<void> {
    return room.write("UPDATE accounts SET isActive = 1 WHERE userId = :userId", { userId }, "run", null, ["accounts"]) as Promise<void>;
  },
  async updateAccount(userId: number, token: string, username: string | null, avatar: string | null, isPro: number): Promise<void> {
    return room.write("UPDATE accounts SET accessToken = :token, username = :username, avatar = :avatar, isPro = :isPro WHERE userId = :userId", { userId, token, username, avatar, isPro }, "run", null, ["accounts"]) as Promise<void>;
  },
};

/** data/local/dao/ChannelDao.kt */
export const ChannelDao = {
  async getAllChannels(): Promise<E.CachedChannel[]> {
    return room.query("SELECT * FROM cached_channels ORDER BY id DESC", {  }, "all", E.CachedChannelMeta, ["cached_channels"]) as Promise<E.CachedChannel[]>;
  },
  async insertChannels(channels: E.CachedChannel[]): Promise<void> {
    return room.insert(E.CachedChannelMeta, channels, "REPLACE") as any;
  },
  async clearChannels(): Promise<void> {
    return room.write("DELETE FROM cached_channels", {  }, "run", null, ["cached_channels"]) as Promise<void>;
  },
  async clearChannelPosts(): Promise<void> {
    return room.write("DELETE FROM cached_channel_posts", {  }, "run", null, ["cached_channel_posts"]) as Promise<void>;
  },
  async getPostsForChannel(channelId: number, limit: number = 20): Promise<E.CachedChannelPost[]> {
    return room.query("SELECT * FROM cached_channel_posts WHERE channelId = :channelId ORDER BY createdTime DESC LIMIT :limit", { channelId, limit }, "all", E.CachedChannelPostMeta, ["cached_channel_posts"]) as Promise<E.CachedChannelPost[]>;
  },
  async insertPosts(posts: E.CachedChannelPost[]): Promise<void> {
    return room.insert(E.CachedChannelPostMeta, posts, "REPLACE") as any;
  },
};

/** data/local/dao/ChatListDao.kt */
export const ChatListDao = {
  async getAllChats(ownerId: number): Promise<E.CachedChat[]> {
    return room.query("SELECT * FROM cached_chats WHERE ownerId = :ownerId ORDER BY lastMessageTime DESC", { ownerId }, "all", E.CachedChatMeta, ["cached_chats"]) as Promise<E.CachedChat[]>;
  },
  async insertChats(chats: E.CachedChat[]): Promise<void> {
    return room.insert(E.CachedChatMeta, chats, "REPLACE") as any;
  },
  async clearAll(): Promise<void> {
    return room.write("DELETE FROM cached_chats", {  }, "run", null, ["cached_chats"]) as Promise<void>;
  },
  async clearAllForOwner(ownerId: number): Promise<void> {
    return room.write("DELETE FROM cached_chats WHERE ownerId = :ownerId", { ownerId }, "run", null, ["cached_chats"]) as Promise<void>;
  },
  async deleteChat(ownerId: number, userId: number): Promise<void> {
    return room.write("DELETE FROM cached_chats WHERE ownerId = :ownerId AND id = :userId", { ownerId, userId }, "run", null, ["cached_chats"]) as Promise<void>;
  },
};

/** data/local/dao/ChatWallpaperDao.kt */
export const ChatWallpaperDao = {
  async get(ownerId: number, chatId: number): Promise<E.ChatWallpaper | null> {
    return room.query("SELECT * FROM chat_wallpapers WHERE ownerId = :ownerId AND chatId = :chatId LIMIT 1", { ownerId, chatId }, "first", E.ChatWallpaperMeta, ["chat_wallpapers"]) as Promise<E.ChatWallpaper | null>;
  },
  getFlow(ownerId: number, chatId: number): LiveQuery<E.ChatWallpaper | null> {
    return room.live("SELECT * FROM chat_wallpapers WHERE ownerId = :ownerId AND chatId = :chatId LIMIT 1", { ownerId, chatId }, "first", E.ChatWallpaperMeta, ["chat_wallpapers"]);
  },
  async insertOrUpdate(wallpaper: E.ChatWallpaper): Promise<void> {
    return room.insert(E.ChatWallpaperMeta, [wallpaper], "REPLACE") as any;
  },
  async clear(ownerId: number, chatId: number): Promise<void> {
    return room.write("DELETE FROM chat_wallpapers WHERE ownerId = :ownerId AND chatId = :chatId", { ownerId, chatId }, "run", null, ["chat_wallpapers"]) as Promise<void>;
  },
  async deleteAll(): Promise<void> {
    return room.write("DELETE FROM chat_wallpapers", {  }, "run", null, ["chat_wallpapers"]) as Promise<void>;
  },
};

/** data/local/dao/DraftDao.kt */
export const DraftDao = {
  async getDraft(ownerId: number, chatId: number): Promise<E.Draft | null> {
    return room.query("SELECT * FROM drafts WHERE ownerId = :ownerId AND chatId = :chatId LIMIT 1", { ownerId, chatId }, "first", E.DraftMeta, ["drafts"]) as Promise<E.Draft | null>;
  },
  getDraftFlow(ownerId: number, chatId: number): LiveQuery<E.Draft | null> {
    return room.live("SELECT * FROM drafts WHERE ownerId = :ownerId AND chatId = :chatId LIMIT 1", { ownerId, chatId }, "first", E.DraftMeta, ["drafts"]);
  },
  getAllDrafts(ownerId: number): LiveQuery<E.Draft[]> {
    return room.live("SELECT * FROM drafts WHERE ownerId = :ownerId ORDER BY updatedAt DESC", { ownerId }, "all", E.DraftMeta, ["drafts"]);
  },
  async insertOrUpdate(draft: E.Draft): Promise<void> {
    return room.insert(E.DraftMeta, [draft], "REPLACE") as any;
  },
  async delete(ownerId: number, chatId: number): Promise<void> {
    return room.write("DELETE FROM drafts WHERE ownerId = :ownerId AND chatId = :chatId", { ownerId, chatId }, "run", null, ["drafts"]) as Promise<void>;
  },
  async deleteAll(): Promise<void> {
    return room.write("DELETE FROM drafts", {  }, "run", null, ["drafts"]) as Promise<void>;
  },
  async deleteOlderThan(timestamp: number): Promise<void> {
    return room.write("DELETE FROM drafts WHERE updatedAt < :timestamp", { timestamp }, "run", null, ["drafts"]) as Promise<void>;
  },
};

/** data/local/dao/MessageDao.kt */
export const MessageDao = {
  async insertMessage(message: E.CachedMessage): Promise<number> {
    return room.insert(E.CachedMessageMeta, [message], "REPLACE") as any;
  },
  async insertMessages(messages: E.CachedMessage[]): Promise<void> {
    return room.insert(E.CachedMessageMeta, messages, "REPLACE") as any;
  },
  getMessagesForChat(ownerId: number, chatId: number, chatType: string): LiveQuery<E.CachedMessage[]> {
    return room.live("SELECT * FROM cached_messages WHERE ownerId = :ownerId AND chatId = :chatId AND chatType = :chatType AND isDeleted = 0 ORDER BY timestamp ASC", { ownerId, chatId, chatType }, "all", E.CachedMessageMeta, ["cached_messages"]);
  },
  async getRecentMessages(ownerId: number, chatId: number, chatType: string, limit: number): Promise<E.CachedMessage[]> {
    return room.query("SELECT * FROM cached_messages WHERE ownerId = :ownerId AND chatId = :chatId AND chatType = :chatType AND isDeleted = 0 ORDER BY timestamp DESC LIMIT :limit", { ownerId, chatId, chatType, limit }, "all", E.CachedMessageMeta, ["cached_messages"]) as Promise<E.CachedMessage[]>;
  },
  async getMessageById(messageId: number): Promise<E.CachedMessage | null> {
    return room.query("SELECT * FROM cached_messages WHERE id = :messageId LIMIT 1", { messageId }, "first", E.CachedMessageMeta, ["cached_messages"]) as Promise<E.CachedMessage | null>;
  },
  async getMessageCount(ownerId: number, chatId: number, chatType: string): Promise<number> {
    return room.query("SELECT COUNT(*) FROM cached_messages WHERE ownerId = :ownerId AND chatId = :chatId AND chatType = :chatType AND isDeleted = 0", { ownerId, chatId, chatType }, "scalar", null, ["cached_messages"]) as Promise<number>;
  },
  async getUnsyncedMessageCount(ownerId: number): Promise<number> {
    return room.query("SELECT COUNT(*) FROM cached_messages WHERE ownerId = :ownerId AND isSynced = 0", { ownerId }, "scalar", null, ["cached_messages"]) as Promise<number>;
  },
  async getUnsyncedMessages(ownerId: number): Promise<E.CachedMessage[]> {
    return room.query("SELECT * FROM cached_messages WHERE ownerId = :ownerId AND isSynced = 0 ORDER BY timestamp ASC", { ownerId }, "all", E.CachedMessageMeta, ["cached_messages"]) as Promise<E.CachedMessage[]>;
  },
  async searchMessagesInChat(ownerId: number, chatId: number, chatType: string, query: string, limit: number = 100): Promise<E.CachedMessage[]> {
    return room.query("SELECT * FROM cached_messages WHERE ownerId = :ownerId AND chatId = :chatId AND chatType = :chatType AND isDeleted = 0 AND (decryptedText LIKE '%' || :query || '%' OR senderName LIKE '%' || :query || '%') ORDER BY timestamp DESC LIMIT :limit", { ownerId, chatId, chatType, query, limit }, "all", E.CachedMessageMeta, ["cached_messages"]) as Promise<E.CachedMessage[]>;
  },
  async searchAllMessages(ownerId: number, query: string, limit: number = 100): Promise<E.CachedMessage[]> {
    return room.query("SELECT * FROM cached_messages WHERE ownerId = :ownerId AND isDeleted = 0 AND (decryptedText LIKE '%' || :query || '%' OR senderName LIKE '%' || :query || '%') ORDER BY timestamp DESC LIMIT :limit", { ownerId, query, limit }, "all", E.CachedMessageMeta, ["cached_messages"]) as Promise<E.CachedMessage[]>;
  },
  async updateMessage(message: E.CachedMessage): Promise<void> {
    return room.update(E.CachedMessageMeta, [message]);
  },
  async markAsRead(messageId: number, readAt: number = Date.now()): Promise<void> {
    return room.write("UPDATE cached_messages SET isRead = 1, readAt = :readAt WHERE id = :messageId", { messageId, readAt }, "run", null, ["cached_messages"]) as Promise<void>;
  },
  async markChatAsRead(ownerId: number, chatId: number, chatType: string, readAt: number = Date.now()): Promise<void> {
    return room.write("UPDATE cached_messages SET isRead = 1, readAt = :readAt WHERE ownerId = :ownerId AND chatId = :chatId AND chatType = :chatType AND isRead = 0", { ownerId, chatId, chatType, readAt }, "run", null, ["cached_messages"]) as Promise<void>;
  },
  async updateSyncStatus(messageId: number, isSynced: boolean, syncedAt: number = Date.now()): Promise<void> {
    return room.write("UPDATE cached_messages SET isSynced = :isSynced, syncedAt = :syncedAt WHERE id = :messageId", { messageId, isSynced, syncedAt }, "run", null, ["cached_messages"]) as Promise<void>;
  },
  async updateDecryptedText(messageId: number, decryptedText: string): Promise<void> {
    return room.write("UPDATE cached_messages SET decryptedText = :decryptedText WHERE id = :messageId", { messageId, decryptedText }, "run", null, ["cached_messages"]) as Promise<void>;
  },
  async updateLocalMediaPath(messageId: number, localPath: string): Promise<void> {
    return room.write("UPDATE cached_messages SET localMediaPath = :localPath WHERE id = :messageId", { messageId, localPath }, "run", null, ["cached_messages"]) as Promise<void>;
  },
  async updateThumbnailPath(messageId: number, thumbnailPath: string): Promise<void> {
    return room.write("UPDATE cached_messages SET thumbnailPath = :thumbnailPath WHERE id = :messageId", { messageId, thumbnailPath }, "run", null, ["cached_messages"]) as Promise<void>;
  },
  async clearLocalMediaPaths(): Promise<void> {
    return room.write("UPDATE cached_messages SET localMediaPath = NULL, thumbnailPath = NULL WHERE localMediaPath IS NOT NULL OR thumbnailPath IS NOT NULL", {  }, "run", null, ["cached_messages"]) as Promise<void>;
  },
  async updateMediaLoadingState(messageId: number, state: string): Promise<void> {
    return room.write("UPDATE cached_messages SET mediaLoadingState = :state WHERE id = :messageId", { messageId, state }, "run", null, ["cached_messages"]) as Promise<void>;
  },
  async softDeleteMessage(messageId: number): Promise<void> {
    return room.write("UPDATE cached_messages SET isDeleted = 1 WHERE id = :messageId", { messageId }, "run", null, ["cached_messages"]) as Promise<void>;
  },
  async hardDeleteMessage(messageId: number): Promise<void> {
    return room.write("DELETE FROM cached_messages WHERE id = :messageId", { messageId }, "run", null, ["cached_messages"]) as Promise<void>;
  },
  async clearChatCache(ownerId: number, chatId: number, chatType: string): Promise<void> {
    return room.write("DELETE FROM cached_messages WHERE ownerId = :ownerId AND chatId = :chatId AND chatType = :chatType", { ownerId, chatId, chatType }, "run", null, ["cached_messages"]) as Promise<void>;
  },
  async deleteOldMessages(olderThan: number): Promise<void> {
    return room.write("DELETE FROM cached_messages WHERE cachedAt < :olderThan AND isSynced = 1", { olderThan }, "run", null, ["cached_messages"]) as Promise<void>;
  },
  async clearAllCache(): Promise<void> {
    return room.write("DELETE FROM cached_messages", {  }, "run", null, ["cached_messages"]) as Promise<void>;
  },
  async getDistinctUserChatIds(ownerId: number): Promise<number[]> {
    return room.query("SELECT DISTINCT chatId FROM cached_messages WHERE ownerId = :ownerId AND chatType = 'user' ORDER BY chatId ASC", { ownerId }, "all", null, ["cached_messages"]) as Promise<number[]>;
  },
  async getExpiredSecretMessageIds(nowMs: number): Promise<number[]> {
    return room.query("SELECT id FROM cached_messages WHERE isSecret = 1 AND destroyAt IS NOT NULL AND destroyAt <= :nowMs", { nowMs }, "all", null, ["cached_messages"]) as Promise<number[]>;
  },
  async deleteExpiredSecretMessages(nowMs: number): Promise<void> {
    return room.write("DELETE FROM cached_messages WHERE isSecret = 1 AND destroyAt IS NOT NULL AND destroyAt <= :nowMs", { nowMs }, "run", null, ["cached_messages"]) as Promise<void>;
  },
  getSecretMessagesForChat(ownerId: number, chatId: number, chatType: string): LiveQuery<E.CachedMessage[]> {
    return room.live("SELECT * FROM cached_messages WHERE ownerId = :ownerId AND chatId = :chatId AND chatType = :chatType AND isSecret = 1 AND isDeleted = 0 ORDER BY timestamp ASC", { ownerId, chatId, chatType }, "all", E.CachedMessageMeta, ["cached_messages"]);
  },
  async countExpiredSecretMessages(nowMs: number): Promise<number> {
    return room.query("SELECT COUNT(*) FROM cached_messages WHERE isSecret = 1 AND destroyAt IS NOT NULL AND destroyAt <= :nowMs", { nowMs }, "scalar", null, ["cached_messages"]) as Promise<number>;
  },
  async getCacheSize(): Promise<number> {
    return room.query("SELECT COUNT(*) FROM cached_messages", {  }, "scalar", null, ["cached_messages"]) as Promise<number>;
  },
  async getUnreadCount(ownerId: number, chatId: number, chatType: string): Promise<number> {
    return room.query("SELECT COUNT(*) FROM cached_messages WHERE ownerId = :ownerId AND chatId = :chatId AND chatType = :chatType AND isRead = 0 AND isDeleted = 0", { ownerId, chatId, chatType }, "scalar", null, ["cached_messages"]) as Promise<number>;
  },
  async getTotalUnreadCount(ownerId: number): Promise<number> {
    return room.query("SELECT COUNT(*) FROM cached_messages WHERE ownerId = :ownerId AND isRead = 0 AND isDeleted = 0", { ownerId }, "scalar", null, ["cached_messages"]) as Promise<number>;
  },
};

/** data/local/dao/SignalPlaintextCacheDao.kt */
export const SignalPlaintextCacheDao = {
  async put(entry: E.SignalPlaintextCache): Promise<void> {
    return room.insert(E.SignalPlaintextCacheMeta, [entry], "REPLACE") as any;
  },
  async get(msgId: number): Promise<string | null> {
    return room.query("SELECT plaintext FROM signal_plaintext_cache WHERE msgId = :msgId LIMIT 1", { msgId }, "scalar", null, ["signal_plaintext_cache"]) as Promise<string | null>;
  },
  async delete(msgId: number): Promise<void> {
    return room.write("DELETE FROM signal_plaintext_cache WHERE msgId = :msgId", { msgId }, "run", null, ["signal_plaintext_cache"]) as Promise<void>;
  },
  async deleteByIds(msgIds: number[]): Promise<void> {
    return room.write("DELETE FROM signal_plaintext_cache WHERE msgId IN (:msgIds)", { msgIds }, "run", null, ["signal_plaintext_cache"]) as Promise<void>;
  },
  async evictOlderThan(olderThanMs: number): Promise<void> {
    return room.write("DELETE FROM signal_plaintext_cache WHERE cachedAt < :olderThanMs", { olderThanMs }, "run", null, ["signal_plaintext_cache"]) as Promise<void>;
  },
  async clearAll(): Promise<void> {
    return room.write("DELETE FROM signal_plaintext_cache", {  }, "run", null, ["signal_plaintext_cache"]) as Promise<void>;
  },
};
