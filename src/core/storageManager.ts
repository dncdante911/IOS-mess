/**
 * StorageManager — порт Android data/StorageManager.kt: разбивка занятого места
 * и очистка для экрана «Данные и память».
 *
 * Каталоги (внутри cacheDirectory, как cacheDir на Android):
 *   media_cache/             — скачанные медиа (+ thumbnails/)
 *   decrypted_media/         — расшифрованные E2EE-вложения
 *   exports/                 — экспорт чатов
 * БД — documentDirectory/SQLite/worldmates_messenger.db (+ -wal, -shm).
 *
 * clearMediaCache() — безопасно (файлы перекачаются с MinIO);
 * clearOfflineData() — офлайн-просмотр не работает до следующей синхронизации.
 */
import * as FileSystem from 'expo-file-system';
import { Image } from 'expo-image';
import { AppDatabase } from './db';

export interface StorageBreakdown {
  photosBytes: number;
  videosBytes: number;
  voiceBytes: number;
  filesBytes: number;
  imageCacheBytes: number;
  offlineDataBytes: number;
  tempBytes: number;
}

export function mediaCacheTotal(b: StorageBreakdown): number {
  return b.photosBytes + b.videosBytes + b.voiceBytes + b.filesBytes + b.imageCacheBytes + b.tempBytes;
}
export function grandTotal(b: StorageBreakdown): number {
  return mediaCacheTotal(b) + b.offlineDataBytes;
}

const CACHE = FileSystem.cacheDirectory ?? '';
export const MEDIA_CACHE_DIR = `${CACHE}media_cache/`;
export const THUMBNAILS_DIR = `${MEDIA_CACHE_DIR}thumbnails/`;
export const DECRYPTED_MEDIA_DIR = `${CACHE}decrypted_media/`;
export const EXPORTS_DIR = `${CACHE}exports/`;
const DB_FILE = `${FileSystem.documentDirectory ?? ''}SQLite/worldmates_messenger.db`;

type Category = 'PHOTO' | 'VIDEO' | 'VOICE' | 'OTHER';
function categoryOf(name: string): Category {
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  if (['jpg', 'jpeg', 'png', 'webp', 'heic', 'gif'].includes(ext)) return 'PHOTO';
  if (['mp4', 'mov', 'mkv', 'webm', '3gp', 'avi'].includes(ext)) return 'VIDEO';
  if (['m4a', 'aac', 'ogg', 'opus', 'amr', 'mp3'].includes(ext)) return 'VOICE';
  return 'OTHER';
}

async function fileSize(uri: string): Promise<number> {
  try {
    const info = await FileSystem.getInfoAsync(uri);
    return info.exists && !info.isDirectory ? (info.size ?? 0) : 0;
  } catch {
    return 0;
  }
}

/** Файлы каталога (не рекурсивно): [имя, размер]. */
async function listFiles(dir: string): Promise<Array<[string, number]>> {
  try {
    const names = await FileSystem.readDirectoryAsync(dir);
    const out: Array<[string, number]> = [];
    for (const n of names) {
      const info = await FileSystem.getInfoAsync(dir + n);
      if (info.exists && !info.isDirectory) out.push([n, info.size ?? 0]);
    }
    return out;
  } catch {
    return [];
  }
}

async function emptyDir(dir: string): Promise<void> {
  try {
    await FileSystem.deleteAsync(dir, { idempotent: true });
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
  } catch {
    /* каталога нет — нечего чистить */
  }
}

/** Создать рабочие каталоги (вызывается при старте). */
export async function ensureStorageDirs(): Promise<void> {
  for (const d of [MEDIA_CACHE_DIR, THUMBNAILS_DIR, DECRYPTED_MEDIA_DIR, EXPORTS_DIR]) {
    await FileSystem.makeDirectoryAsync(d, { intermediates: true }).catch(() => {});
  }
}

export const StorageManager = {
  async getBreakdown(): Promise<StorageBreakdown> {
    let photos = 0;
    let videos = 0;
    let voice = 0;
    let files = 0;
    for (const [name, size] of await listFiles(MEDIA_CACHE_DIR)) {
      switch (categoryOf(name)) {
        case 'PHOTO': photos += size; break;
        case 'VIDEO': videos += size; break;
        case 'VOICE': voice += size; break;
        default: files += size;
      }
    }
    // превью — всегда jpg, считаются как «Фото»
    for (const [, size] of await listFiles(THUMBNAILS_DIR)) photos += size;

    // Дисковый кеш expo-image (аналог Coil diskCache) лежит в Library/Caches/
    // — точного размера API не даёт; считаем каталог, если он доступен.
    let imageCache = 0;
    for (const [, size] of await listFiles(`${CACHE}com.hackemist.SDImageCache/default/`)) imageCache += size;

    const offline =
      (await fileSize(DB_FILE)) + (await fileSize(`${DB_FILE}-wal`)) + (await fileSize(`${DB_FILE}-shm`));

    let temp = 0;
    for (const [, size] of await listFiles(DECRYPTED_MEDIA_DIR)) temp += size;
    for (const [, size] of await listFiles(EXPORTS_DIR)) temp += size;

    return {
      photosBytes: photos,
      videosBytes: videos,
      voiceBytes: voice,
      filesBytes: files,
      imageCacheBytes: imageCache,
      offlineDataBytes: offline,
      tempBytes: temp,
    };
  },

  /** Скачанные медиа + кеш картинок + временные файлы. История остаётся. */
  async clearMediaCache(): Promise<void> {
    await emptyDir(MEDIA_CACHE_DIR);
    await FileSystem.makeDirectoryAsync(THUMBNAILS_DIR, { intermediates: true }).catch(() => {});
    await Image.clearDiskCache().catch(() => false);
    await Image.clearMemoryCache().catch(() => false);
    await emptyDir(DECRYPTED_MEDIA_DIR);
    await emptyDir(EXPORTS_DIR);
    await AppDatabase.messageDao().clearLocalMediaPaths();
  },

  /** Офлайн-кеш БД (сообщения, чаты, каналы, посты). Черновики не трогает. */
  async clearOfflineData(): Promise<void> {
    await AppDatabase.messageDao().clearAllCache();
    await AppDatabase.chatListDao().clearAll();
    await AppDatabase.channelDao().clearChannels();
    await AppDatabase.channelDao().clearChannelPosts();
  },

  async deleteDrafts(): Promise<void> {
    await AppDatabase.draftDao().deleteAll();
  },
};
