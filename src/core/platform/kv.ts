/**
 * Синхронное key-value хранилище — замена localStorage из Windows-кода.
 *
 * Windows-ядро (api.ts, serverFailover, e2ee…) читает localStorage синхронно.
 * В RN синхронного хранилища без нативного модуля нет, поэтому: при старте
 * приложения все ключи с префиксом загружаются из AsyncStorage в память
 * (hydrateKv()), дальше чтение — из памяти, запись — в память + асинхронно
 * на диск (write-through).
 *
 * Для СЕКРЕТОВ (токены, ключи E2EE) это хранилище НЕ использовать —
 * только services/storageService / crypto/e2ee/e2eeStore (Keychain).
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const PREFIX = 'wmkv:';
const mem = new Map<string, string>();
let hydrated = false;

export async function hydrateKv(): Promise<void> {
  if (hydrated) return;
  try {
    const keys = (await AsyncStorage.getAllKeys()).filter((k) => k.startsWith(PREFIX));
    const pairs = await AsyncStorage.multiGet(keys);
    for (const [k, v] of pairs) if (v !== null) mem.set(k.slice(PREFIX.length), v);
  } catch {
    /* пустое хранилище — работаем с чистой памятью */
  }
  hydrated = true;
}

export const kv = {
  getItem(key: string): string | null {
    return mem.has(key) ? (mem.get(key) as string) : null;
  },
  setItem(key: string, value: string): void {
    mem.set(key, value);
    AsyncStorage.setItem(PREFIX + key, value).catch(() => {});
  },
  removeItem(key: string): void {
    mem.delete(key);
    AsyncStorage.removeItem(PREFIX + key).catch(() => {});
  },
  keys(): string[] {
    return Array.from(mem.keys());
  },
  getJson<T>(key: string, fallback: T): T {
    const raw = kv.getItem(key);
    if (raw === null) return fallback;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  },
  setJson(key: string, value: unknown): void {
    kv.setItem(key, JSON.stringify(value));
  },
};

/** localStorage-совместимый объект — для дословно перенесённого Windows-кода. */
export const localStorage = kv;
