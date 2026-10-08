/**
 * Ленивый доступ к E2EE-сервису (аналог E2EEService.getInstance на Android).
 *
 * getE2EE() бросает, пока сервис не инициализирован, а authStore
 * инициализирует его асинхронно после входа — экраны (список чатов при
 * старте) могли бы обратиться раньше. Здесь — единая точка: при первом
 * обращении сервис создаётся под текущий аккаунт.
 */
import { getE2EE, initE2EE, type E2EEService } from '../../crypto/e2ee/e2eeService';
import { getCachedDecryptedMessage, setE2EEAccount } from '../../crypto/e2ee/e2eeStore';
import { UserSession } from '../session';
import { getTranslation } from '../../i18n';
import type { M } from '../android';

let initPromise: Promise<E2EEService> | null = null;

export function e2ee(): Promise<E2EEService> {
  try {
    return Promise.resolve(getE2EE());
  } catch {
    initPromise ??= (async () => {
      const { signalApi } = await import('../../api/signalApi');
      await setE2EEAccount(UserSession.userId);
      return initE2EE(signalApi);
    })().finally(() => {
      initPromise = null;
    });
    return initPromise;
  }
}

export const E2EE_CIPHER_VERSION = 6;

/**
 * Расшифровка v6 для сгенерированной модели Message (как E2EEService.decrypt
 * в Android). Кеш открытого текста проверяется первым. null — не удалось.
 */
export async function decryptV6(msg: M.Message): Promise<string | null> {
  try {
    const cached = await getCachedDecryptedMessage(msg.id);
    if (cached !== null) return cached;
  } catch {
    /* кеш недоступен — пробуем расшифровать */
  }
  if (msg.cipherVersion !== E2EE_CIPHER_VERSION || !msg.encryptedText || !msg.iv || !msg.tag || !msg.signalHeader) return null;
  try {
    const svc = await e2ee();
    return await svc.decryptMessage(msg.fromId, msg.encryptedText, msg.iv, msg.tag, msg.signalHeader, msg.id, UserSession.userId);
  } catch {
    return null;
  }
}

/** ChatsViewModel.e2eePreviewText: превью E2EE-сообщения (cv 3/6) в списке чатов. */
export async function e2eePreviewText(msg: M.Message): Promise<string> {
  return (await decryptV6(msg)) ?? getTranslation('last_message_e2ee');
}
