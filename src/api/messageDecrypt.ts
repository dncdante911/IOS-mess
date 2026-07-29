/**
 * Расшифровка сообщений — ЕДИНСТВЕННОЕ место в приложении.
 *
 * ⚠️ ЛЮБОЕ сообщение, пришедшее с сервера, обязано пройти через эти функции
 * перед показом. Пропустить этот шаг — не «мелкая недоработка»: у сообщений с
 * E2EE поле `text` ПУСТОЕ намеренно (normaliseMessage не пускает шифротекст в
 * интерфейс), а открытый текст появляется только в `decryptedText`. Забытая
 * расшифровка выглядит не как ошибка, а как «сообщения не приходят» и
 * «история не сохраняется» — пузыри просто пустые.
 *
 * Именно так и было: chatStore расшифровывал, а MessagesScreen — собственная
 * реализация со своим стейтом и своими подписками — нет. Поэтому весь экран
 * переписки оставался пустым, хотя данные приходили.
 *
 * Держать это в одном модуле, а не копировать по экранам.
 */

import { getE2EE } from '../crypto/e2ee/e2eeService';
import { CIPHER_VERSION_E2EE, ENCRYPTED_CIPHER_VERSIONS } from '../constants/api';
import { getTranslation, useI18nStore } from '../i18n';
import type { Message } from './types';

/** Плейсхолдер на языке пользователя — модуль живёт вне React. */
function encryptedPlaceholder(): string {
  return getTranslation('encrypted_message', useI18nStore.getState().language);
}

/**
 * Возвращает сообщение с заполненным `decryptedText`.
 * Никогда не отдаёт сырой шифротекст: при любом сбое подставляет плейсхолдер.
 *
 * Версии, отличные от 6:
 *   3 — Double Ratchet, на iOS не поддерживается принципиально
 *   4 — групповой GSK, устарел
 *   5 — Sender Key v5 (группы); появится вместе с групповыми чатами.
 *       В ЛИЧНЫХ чатах cv=5 означает другое — шифрование серверным
 *       мастер-ключом, и текст там приходит уже расшифрованным, поэтому
 *       такие сообщения сюда просто не попадают.
 */
export async function decryptMessage(msg: Message): Promise<Message> {
  const cv = msg.cipherVersion;

  // Не зашифровано — показываем как есть.
  if (!cv || !ENCRYPTED_CIPHER_VERSIONS.includes(cv)) return msg;

  // Уже известен текст: своё отправленное сообщение либо ранее расшифрованное.
  if (msg.decryptedText) return msg;

  if (cv !== CIPHER_VERSION_E2EE || !msg.text || !msg.signalHeader) {
    return { ...msg, decryptedText: encryptedPlaceholder() };
  }

  try {
    const plain = await getE2EE().decryptMessage(
      Number(msg.fromId),
      msg.text,
      msg.iv ?? '',
      msg.tag ?? '',
      msg.signalHeader,
      msg.id,
    );
    return { ...msg, decryptedText: plain ?? encryptedPlaceholder() };
  } catch (e) {
    console.error('[decrypt] сообщение', msg.id, 'расшифровать не удалось', e);
    return { ...msg, decryptedText: encryptedPlaceholder() };
  }
}

/**
 * Пакетная расшифровка. Порядок сохраняется.
 *
 * Параллельно, а не последовательно: операция локальная (X3DH + AES-GCM),
 * сеть не задействована, а история грузится страницами по 30–50 сообщений.
 */
export async function decryptMessages(msgs: Message[]): Promise<Message[]> {
  return Promise.all(msgs.map(decryptMessage));
}
