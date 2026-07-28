/**
 * Хранилище ключевого материала E2EE v6.
 *
 * Соответствие эталонам:
 *   Windows — localStorage + Electron safeStorage (lsGetSecure / lsSetSecure)
 *   Android — EncryptedSharedPreferences поверх Android Keystore
 *   iOS     — expo-secure-store, то есть системный Keychain
 *
 * ⚠️ ДВА УРОКА, ОПЛАЧЕННЫХ ПОТЕРЕЙ ПЕРЕПИСКИ НА ANDROID 27.07.2026 —
 *    их нельзя повторить здесь:
 *
 * 1. Приватный identity-ключ невосстановим. Если он исчезнет, вся история
 *    станет нечитаемой навсегда: сервер хранит только публичные половины.
 *    Поэтому здесь НЕТ ни одной ветки, которая при ошибке чтения молча
 *    сгенерировала бы новый ключ. Ошибка чтения — это ошибка, а не повод
 *    начать с чистого листа.
 *
 * 2. `AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY` подобран намеренно:
 *      • THIS_DEVICE_ONLY — ключи не уезжают в iCloud Keychain и не всплывают
 *        на другом устройстве под тем же Apple ID (там своя пара ключей);
 *      • AFTER_FIRST_UNLOCK — чтобы фоновая расшифровка работала при
 *        заблокированном экране (пригодится, когда появится Notification
 *        Service Extension); WHEN_UNLOCKED сделал бы её невозможной.
 *
 * Индекс слотов (INDEX_KEY) нужен потому, что у Keychain нет операции
 * «перечислить ключи по префиксу» — в отличие от localStorage, по которому
 * Windows-версия просто итерируется. Без индекса clearAllSecretsFor() был бы
 * невозможен.
 */

import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SECURE_OPTIONS: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
};

// ─── Имена ключей (совпадают с Windows-версией) ──────────────────────────────

export const KEY_DEVICE_ID = 'e2ee_device_id';
export const KEY_IK = 'e2ee_ik';
export const KEY_SPK = 'e2ee_spk';
export const KEY_SIGN = 'e2ee_sign';
export const KEY_REGISTERED_DEV = 'e2ee_registered_dev';

export const KEY_SK = (uid: number, slot: string) => `e2ee_sk_${uid}_${slot}`;
export const KEY_EK = (uid: number, slot: string) => `e2ee_ek_${uid}_${slot}`;
export const KEY_RIK = (uid: number, slot: string) => `e2ee_rik_${uid}_${slot}`;
export const KEY_RSPK = (uid: number, slot: string) => `e2ee_rspk_${uid}_${slot}`;

/** Индекс всех созданных слотов, чтобы уметь чистить их пачкой. */
const INDEX_KEY = 'e2ee_slot_index';

// ─── Базовые операции ────────────────────────────────────────────────────────

export async function secureGet<T>(key: string): Promise<T | null> {
  try {
    const raw = await SecureStore.getItemAsync(key, SECURE_OPTIONS);
    if (raw == null) return null;
    return JSON.parse(raw) as T;
  } catch (e) {
    // Сознательно НЕ возвращаем null-как-«ключа нет»: вызывающий код обязан
    // отличать «ключа никогда не было» от «Keychain недоступен», иначе
    // получится тот самый сценарий с потерей идентичности.
    console.error('[E2EE/store] чтение не удалось:', key, e);
    throw e;
  }
}

export async function secureSet(key: string, value: unknown): Promise<void> {
  await SecureStore.setItemAsync(key, JSON.stringify(value), SECURE_OPTIONS);
}

export async function secureRemove(key: string): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(key, SECURE_OPTIONS);
  } catch {
    // Удаление несуществующего ключа — не ошибка.
  }
}

/**
 * Мягкое чтение: `null` и при отсутствии ключа, и при сбое чтения.
 * Годится ТОЛЬКО для кешируемых значений (общие секреты, remote-IK), которые
 * всегда можно вывести заново из заголовка сообщения. Для IK / SPK / SIGN
 * использовать нельзя — там нужен secureGet со всплывающей ошибкой.
 */
export async function secureGetSoft<T>(key: string): Promise<T | null> {
  try {
    return await secureGet<T>(key);
  } catch {
    return null;
  }
}

// ─── Индекс слотов ───────────────────────────────────────────────────────────

async function readIndex(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(INDEX_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

async function writeIndex(keys: string[]): Promise<void> {
  try {
    await AsyncStorage.setItem(INDEX_KEY, JSON.stringify(keys));
  } catch (e) {
    console.warn('[E2EE/store] не удалось обновить индекс слотов:', e);
  }
}

/** Регистрирует имена ключей слота, чтобы их можно было потом найти и удалить. */
export async function rememberSlotKeys(...keys: string[]): Promise<void> {
  const index = await readIndex();
  let changed = false;
  for (const k of keys) {
    if (!index.includes(k)) {
      index.push(k);
      changed = true;
    }
  }
  if (changed) await writeIndex(index);
}

/** Удаляет все слоты сессий с конкретным пользователем. */
export async function clearSlotsForUser(userId: number): Promise<void> {
  const index = await readIndex();
  const prefixes = [`e2ee_sk_${userId}_`, `e2ee_ek_${userId}_`, `e2ee_rik_${userId}_`, `e2ee_rspk_${userId}_`];
  const toRemove = index.filter((k) => prefixes.some((p) => k.startsWith(p)));
  await Promise.all(toRemove.map(secureRemove));
  await writeIndex(index.filter((k) => !toRemove.includes(k)));
}

/**
 * Полная очистка E2EE-состояния. Вызывать ТОЛЬКО при явном выходе из аккаунта.
 *
 * ⚠️ Это необратимо: вместе с ключами уходит доступ ко всей истории переписки
 * на этом устройстве. Ровно этот вызов на Android (wipeForLogout) и стирает
 * identity-ключ при выходе — здесь он так же обязан оставаться единственным
 * местом, откуда identity-ключ вообще может исчезнуть.
 */
export async function wipeAllE2EEKeys(): Promise<void> {
  const index = await readIndex();
  await Promise.all([
    ...index.map(secureRemove),
    secureRemove(KEY_DEVICE_ID),
    secureRemove(KEY_IK),
    secureRemove(KEY_SPK),
    secureRemove(KEY_SIGN),
    secureRemove(KEY_REGISTERED_DEV),
  ]);
  await writeIndex([]);
  console.warn('[E2EE/store] всё ключевое состояние удалено (выход из аккаунта)');
}
