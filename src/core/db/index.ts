/**
 * Локальная БД — зеркало Android AppDatabase (Room + SQLCipher).
 *
 *   import { AppDatabase } from '@/core/db';
 *   const msgs = await AppDatabase.messageDao().getRecentMessages(owner, chatId, 'user', 50);
 *
 * DAO и сущности — gen/ (scripts/gen-android-db.mjs). Методы с телом
 * (@Transaction) — ниже вручную, по Android-оригиналу.
 */
import { room } from './room';
import * as E from './gen/entities';
import * as D from './gen/daos';

room.init(E.ALL_ENTITIES);

/** data/local/dao/ChannelDao.kt → @Transaction replaceChannels */
const ChannelDao = {
  ...D.ChannelDao,
  async replaceChannels(channels: E.CachedChannel[]): Promise<void> {
    await room.transaction(async () => {
      await D.ChannelDao.clearChannels();
      await D.ChannelDao.insertChannels(channels);
    });
  },
};

/** data/local/dao/ChatListDao.kt → @Transaction replaceAll */
const ChatListDao = {
  ...D.ChatListDao,
  async replaceAll(ownerId: number, chats: E.CachedChat[]): Promise<void> {
    await room.transaction(async () => {
      await D.ChatListDao.clearAllForOwner(ownerId);
      await D.ChatListDao.insertChats(chats);
    });
  },
};

/** Те же имена аксессоров, что у Android AppDatabase. */
export const AppDatabase = {
  accountDao: () => D.AccountDao,
  draftDao: () => D.DraftDao,
  messageDao: () => D.MessageDao,
  signalPlaintextCacheDao: () => D.SignalPlaintextCacheDao,
  chatListDao: () => ChatListDao,
  channelDao: () => ChannelDao,
  chatWallpaperDao: () => D.ChatWallpaperDao,
  /** Удалить базу целиком вместе с ключом (выход со стиранием данных). */
  destroy: () => room.destroy(),
};

export * from './gen/entities';
export { LiveQuery } from './room';
