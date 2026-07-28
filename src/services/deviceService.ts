/**
 * Идентификация устройства для проверки входа с нового устройства.
 *
 * Зачем это вообще: бэкенд (`services/login-verification.js`) начинает проверку
 * ТОЛЬКО если клиент прислал отпечаток:
 *
 *     if (!deviceFingerprint) return { trusted: true };
 *
 * iOS до сих пор его не слал — то есть вход с любого нового iPhone проходил без
 * кода подтверждения вовсе, и устройство не попадало в `wm_trusted_devices`.
 * Android и Windows отпечаток шлют, поэтому там защита работает.
 *
 * ⚠️ Отпечаток НЕ имеет отношения к E2EE. У шифрования свой идентификатор
 * (`e2ee_device_id` в crypto/e2ee/e2eeStore.ts), и путать их нельзя: этот
 * определяет «доверенное ли устройство», тот — кому адресован конверт
 * сообщения.
 */

import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';

import { randomUuid } from '../crypto/e2ee/primitives';

const KEY_DEVICE_FINGERPRINT = 'wm_device_fingerprint';

/**
 * Хранится в Keychain, а не в AsyncStorage, и переживает переустановку
 * приложения — как и на Android, где отпечаток дублируется в резервные prefs.
 * Смысл именно в долговечности: если отпечаток меняется при каждой установке,
 * пользователь будет получать код подтверждения после любого обновления.
 */
export async function getOrCreateDeviceFingerprint(): Promise<string> {
  try {
    const stored = await SecureStore.getItemAsync(KEY_DEVICE_FINGERPRINT, {
      keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
    });
    if (stored) return stored;
  } catch (e) {
    console.warn('[Device] не удалось прочитать отпечаток:', e);
  }

  const fresh = randomUuid();
  try {
    await SecureStore.setItemAsync(KEY_DEVICE_FINGERPRINT, fresh, {
      keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
    });
  } catch (e) {
    // Не смогли сохранить — вход всё равно состоится, просто на следующем
    // запуске отпечаток будет другим и код запросят повторно.
    console.warn('[Device] не удалось сохранить отпечаток:', e);
  }
  return fresh;
}

/**
 * Человекочитаемая подпись устройства для письма «вход с нового устройства»
 * и для списка активных сеансов.
 *
 * Формат повторяет Android (`DeviceInfo.getDeviceLabel()`):
 *   "<устройство> / <ОС версия> / v<версия приложения>"
 *   например: "iPhone / iOS 17.5 / v1.0.0"
 *
 * Точную модель (iPhone 15 Pro) даёт expo-device, но это нативный модуль, а
 * ради одной строки в письме тянуть его и вызывать лишнюю пересборку не стоит.
 * Появится expo-device по другой причине — заменить здесь на Device.modelName.
 */
export function getDeviceLabel(): string {
  const osName = Platform.OS === 'ios' ? 'iOS' : Platform.OS;
  const osVersion = String(Platform.Version ?? '');
  const appVersion = Constants.expoConfig?.version ?? '1.0.0';
  const deviceName = Platform.OS === 'ios' ? 'iPhone' : 'Device';
  return `${deviceName} / ${osName} ${osVersion} / v${appVersion}`;
}
