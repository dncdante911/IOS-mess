/**
 * Криптографические примитивы для E2EE v6 (Static X3DH + SESAME-lite).
 *
 * ⚠️ ЭТОТ ФАЙЛ ОПРЕДЕЛЯЕТ СОВМЕСТИМОСТЬ С ANDROID / WINDOWS / WEB.
 * Любое расхождение — хоть на один байт, хоть в порядке конкатенации DH —
 * означает, что сообщения с iPhone не прочитает никто, а входящие превратятся
 * в «🔒 Зашифроване повідомлення». Менять что-либо здесь можно только
 * одновременно на всех четырёх клиентах.
 *
 * Эталон, с которого сделан порт:
 *   windows-messenger/src/signal.ts   — x3dhAlice / x3dhBob / hkdf / b64
 *   worldmates (Android) utils/signal/DoubleRatchetManager.kt
 *
 * Отличие от Windows-версии: там примитивы построены на `crypto.subtle`
 * (WebCrypto), которого в React Native / Hermes НЕТ. Здесь всё то же самое
 * собрано на @noble/* — тех же библиотеках, что уже используются в
 * crypto/e2ee этого проекта. Выходные байты
 * идентичны: HKDF-SHA256 и AES-256-GCM — стандарты, а не реализации.
 */

import { x25519, ed25519 } from '@noble/curves/ed25519';
import { hkdf as nobleHkdf } from '@noble/hashes/hkdf';
import { sha256 } from '@noble/hashes/sha256';
import { gcm } from '@noble/ciphers/aes';
import { randomBytes } from '@noble/ciphers/webcrypto';

// ─── Константы протокола (ДОЛЖНЫ совпадать с Kotlin и Windows) ───────────────

/** Метка HKDF для X3DH. В Kotlin — "WorldMates_X3DH", менять нельзя. */
const INFO_X3DH = utf8Bytes('WorldMates_X3DH');

/** Соль HKDF — 32 нулевых байта (как в Kotlin и Windows). */
const ZERO_SALT = new Uint8Array(32);

/** Длина выводимого общего секрета. */
const SK_LENGTH = 32;

/** Размер nonce AES-GCM. 12 байт — как на всех платформах. */
export const IV_LENGTH = 12;

/** Размер тега аутентификации AES-GCM. */
export const TAG_LENGTH = 16;

// ─── Типы ────────────────────────────────────────────────────────────────────

export interface X25519KeyPair {
  privateKeyRaw: Uint8Array; // 32 байта — сырой скаляр
  publicKeyRaw: Uint8Array;  // 32 байта — u-координата Монтгомери
}

export interface Ed25519KeyPair {
  privateKeyRaw: Uint8Array;
  publicKeyRaw: Uint8Array;
}

// ─── Кодировки ───────────────────────────────────────────────────────────────
//
// Всё реализовано вручную и НЕ опирается ни на одну глобальную сущность.
//
// Почему не Buffer: его в React Native нет. Hermes не даёт глобальный Buffer,
// Metro его не полифилит, а пакет `buffer` в зависимостях проекта отсутствует
// (лежит только транзитивно и в бандл не попадает). Metro при этом собирает
// такой код молча — `Buffer` для него просто свободный идентификатор, — и
// падение случилось бы уже на устройстве, при первой же попытке отправить
// сообщение.
//
// Почему не TextEncoder/TextDecoder: их наличие в Hermes зависит от версии RN,
// и полагаться на это в криптографическом коде нельзя.
//
// Формат base64 — стандартный, С padding: побайтово совпадает с btoa() в
// Windows-клиенте и с Base64.NO_WRAP в Android. Любое расхождение здесь
// означало бы, что платформы перестают читать сообщения друг друга.

const B64_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

/** charCode → 6-битное значение. Строится один раз при загрузке модуля. */
const B64_LOOKUP: Int16Array = (() => {
  const table = new Int16Array(128).fill(-1);
  for (let i = 0; i < B64_ALPHABET.length; i++) {
    table[B64_ALPHABET.charCodeAt(i)] = i;
  }
  return table;
})();

export function b64Encode(bytes: Uint8Array): string {
  let out = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const b0 = bytes[i];
    const hasB1 = i + 1 < bytes.length;
    const hasB2 = i + 2 < bytes.length;
    const b1 = hasB1 ? bytes[i + 1] : 0;
    const b2 = hasB2 ? bytes[i + 2] : 0;

    out += B64_ALPHABET[b0 >> 2];
    out += B64_ALPHABET[((b0 & 0x03) << 4) | (b1 >> 4)];
    out += hasB1 ? B64_ALPHABET[((b1 & 0x0f) << 2) | (b2 >> 6)] : '=';
    out += hasB2 ? B64_ALPHABET[b2 & 0x3f] : '=';
  }
  return out;
}

export function b64Decode(s: string): Uint8Array {
  // Отбрасываем padding, переводы строк и прочий мусор: на входе бывает
  // base64 из чужих реализаций, где перенос строк допустим.
  let clean = '';
  for (let i = 0; i < s.length; i++) {
    const code = s.charCodeAt(i);
    if (code < 128 && B64_LOOKUP[code] >= 0) clean += s[i];
  }

  const out = new Uint8Array(Math.floor((clean.length * 3) / 4));
  let p = 0;
  for (let i = 0; i < clean.length; i += 4) {
    const c0 = B64_LOOKUP[clean.charCodeAt(i)];
    const c1 = i + 1 < clean.length ? B64_LOOKUP[clean.charCodeAt(i + 1)] : -1;
    const c2 = i + 2 < clean.length ? B64_LOOKUP[clean.charCodeAt(i + 2)] : -1;
    const c3 = i + 3 < clean.length ? B64_LOOKUP[clean.charCodeAt(i + 3)] : -1;

    if (c1 >= 0) out[p++] = (c0 << 2) | (c1 >> 4);
    if (c2 >= 0) out[p++] = ((c1 & 0x0f) << 4) | (c2 >> 2);
    if (c3 >= 0) out[p++] = ((c2 & 0x03) << 6) | c3;
  }
  return p === out.length ? out : out.slice(0, p);
}

/** UTF-8 кодирование с корректной обработкой суррогатных пар (эмодзи). */
export function utf8Bytes(s: string): Uint8Array {
  const out: number[] = [];
  for (let i = 0; i < s.length; i++) {
    let cp = s.charCodeAt(i);

    // Суррогатная пара → один кодпоинт (эмодзи и прочее вне BMP).
    if (cp >= 0xd800 && cp <= 0xdbff && i + 1 < s.length) {
      const low = s.charCodeAt(i + 1);
      if (low >= 0xdc00 && low <= 0xdfff) {
        cp = 0x10000 + ((cp - 0xd800) << 10) + (low - 0xdc00);
        i++;
      }
    }

    if (cp < 0x80) {
      out.push(cp);
    } else if (cp < 0x800) {
      out.push(0xc0 | (cp >> 6), 0x80 | (cp & 0x3f));
    } else if (cp < 0x10000) {
      out.push(0xe0 | (cp >> 12), 0x80 | ((cp >> 6) & 0x3f), 0x80 | (cp & 0x3f));
    } else {
      out.push(
        0xf0 | (cp >> 18),
        0x80 | ((cp >> 12) & 0x3f),
        0x80 | ((cp >> 6) & 0x3f),
        0x80 | (cp & 0x3f),
      );
    }
  }
  return new Uint8Array(out);
}

/** UTF-8 декодирование. Обратная операция к utf8Bytes. */
export function utf8String(bytes: Uint8Array): string {
  let out = '';
  let i = 0;
  while (i < bytes.length) {
    const b0 = bytes[i++];
    let cp: number;

    if (b0 < 0x80) {
      cp = b0;
    } else if ((b0 & 0xe0) === 0xc0) {
      cp = ((b0 & 0x1f) << 6) | (bytes[i++] & 0x3f);
    } else if ((b0 & 0xf0) === 0xe0) {
      cp = ((b0 & 0x0f) << 12) | ((bytes[i++] & 0x3f) << 6) | (bytes[i++] & 0x3f);
    } else {
      cp =
        ((b0 & 0x07) << 18) |
        ((bytes[i++] & 0x3f) << 12) |
        ((bytes[i++] & 0x3f) << 6) |
        (bytes[i++] & 0x3f);
    }

    if (cp > 0xffff) {
      // Обратно в суррогатную пару — иначе fromCharCode обрежет кодпоинт.
      cp -= 0x10000;
      out += String.fromCharCode(0xd800 + (cp >> 10), 0xdc00 + (cp & 0x3ff));
    } else {
      out += String.fromCharCode(cp);
    }
  }
  return out;
}

// ─── Случайность ─────────────────────────────────────────────────────────────

export function secureRandomBytes(n: number): Uint8Array {
  return randomBytes(n);
}

/**
 * UUID v4 из криптостойких байтов. Замена crypto.randomUUID(), которого в
 * Hermes нет. Формат важен: этот идентификатор уезжает на сервер как
 * device_id и попадает в конверт сообщения как ключ в объекте "devs".
 */
export function randomUuid(): string {
  const b = secureRandomBytes(16);
  b[6] = (b[6] & 0x0f) | 0x40; // версия 4
  b[8] = (b[8] & 0x3f) | 0x80; // вариант RFC 4122
  const hex = Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

// ─── Ключи ───────────────────────────────────────────────────────────────────

export function generateKeyPair(): X25519KeyPair {
  const privateKeyRaw = x25519.utils.randomPrivateKey();
  return { privateKeyRaw, publicKeyRaw: x25519.getPublicKey(privateKeyRaw) };
}

export function generateSigningKeyPair(): Ed25519KeyPair {
  const privateKeyRaw = ed25519.utils.randomPrivateKey();
  return { privateKeyRaw, publicKeyRaw: ed25519.getPublicKey(privateKeyRaw) };
}

export function signSpk(spkPublicKey: Uint8Array, signingPrivateKey: Uint8Array): Uint8Array {
  return ed25519.sign(spkPublicKey, signingPrivateKey);
}

export function verifySpkSignature(
  signature: Uint8Array,
  spkPublicKey: Uint8Array,
  signingPublicKey: Uint8Array,
): boolean {
  try {
    return ed25519.verify(signature, spkPublicKey, signingPublicKey);
  } catch {
    return false;
  }
}

// ─── DH и вывод ключей ───────────────────────────────────────────────────────

function dhRaw(privateKeyRaw: Uint8Array, publicKeyRaw: Uint8Array): Uint8Array {
  return x25519.getSharedSecret(privateKeyRaw, publicKeyRaw);
}

function concat(...arrays: Uint8Array[]): Uint8Array {
  const total = arrays.reduce((acc, a) => acc + a.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const a of arrays) {
    out.set(a, offset);
    offset += a.length;
  }
  return out;
}

function hkdfSha256(salt: Uint8Array, ikm: Uint8Array, info: Uint8Array, length: number): Uint8Array {
  return nobleHkdf(sha256, ikm, salt, info, length);
}

/**
 * X3DH со стороны отправителя (Alice).
 *
 * Порядок DH критичен и обязан совпадать с Kotlin/Windows:
 *   dh1 = DH(ikA.priv,  spkB.pub)
 *   dh2 = DH(ekA.priv,  ikB.pub)
 *   dh3 = DH(ekA.priv,  spkB.pub)
 *   SK  = HKDF-SHA256(salt = 32 нуля, ikm = dh1||dh2||dh3, info = "WorldMates_X3DH", 32)
 *
 * OPK в v6 не используется (одноразовые предключи выключены) — параметр
 * оставлен ради полного соответствия сигнатуре эталона.
 */
export function x3dhAlice(
  ikA: X25519KeyPair,
  ikBPub: Uint8Array,
  spkBPub: Uint8Array,
  opkBPub: Uint8Array | null,
  ekA: X25519KeyPair,
): { sk: Uint8Array; ad: Uint8Array } {
  const dh1 = dhRaw(ikA.privateKeyRaw, spkBPub);
  const dh2 = dhRaw(ekA.privateKeyRaw, ikBPub);
  const dh3 = dhRaw(ekA.privateKeyRaw, spkBPub);

  const dhInput = opkBPub
    ? concat(dh1, dh2, dh3, dhRaw(ekA.privateKeyRaw, opkBPub))
    : concat(dh1, dh2, dh3);

  return {
    sk: hkdfSha256(ZERO_SALT, dhInput, INFO_X3DH, SK_LENGTH),
    ad: concat(ikA.publicKeyRaw, ikBPub),
  };
}

/**
 * X3DH со стороны получателя (Bob). Зеркало x3dhAlice — те же три DH,
 * посчитанные со своей стороны, в том же порядке.
 *
 * Ключевое свойство, на котором держится восстановление истории: device_id
 * в вывод ключа НЕ входит. Секрет определяется только парой ключей, поэтому
 * смена идентификатора устройства сама по себе не делает сообщения
 * нечитаемыми — теряется лишь адресация конверта.
 */
export function x3dhBob(
  ikB: X25519KeyPair,
  spkB: X25519KeyPair,
  opkB: X25519KeyPair | null,
  ikAPub: Uint8Array,
  ekAPub: Uint8Array,
): { sk: Uint8Array; ad: Uint8Array } {
  const dh1 = dhRaw(spkB.privateKeyRaw, ikAPub);
  const dh2 = dhRaw(ikB.privateKeyRaw, ekAPub);
  const dh3 = dhRaw(spkB.privateKeyRaw, ekAPub);

  const dhInput = opkB
    ? concat(dh1, dh2, dh3, dhRaw(opkB.privateKeyRaw, ekAPub))
    : concat(dh1, dh2, dh3);

  return {
    sk: hkdfSha256(ZERO_SALT, dhInput, INFO_X3DH, SK_LENGTH),
    ad: concat(ikAPub, ikB.publicKeyRaw), // тот же порядок, что у Alice
  };
}

// ─── AES-256-GCM ─────────────────────────────────────────────────────────────
//
// @noble/ciphers возвращает ciphertext с приклеенным в конце 16-байтным тегом,
// а протокол хранит ct и tag РАЗДЕЛЬНО (отдельные поля конверта и отдельные
// колонки на сервере). Поэтому режем на выходе и склеиваем на входе.

export function aesGcmEncrypt(
  key: Uint8Array,
  plain: Uint8Array,
  iv: Uint8Array,
): { ciphertext: Uint8Array; tag: Uint8Array } {
  const combined = gcm(key, iv).encrypt(plain);
  return {
    ciphertext: combined.slice(0, combined.length - TAG_LENGTH),
    tag: combined.slice(combined.length - TAG_LENGTH),
  };
}

/** Бросает при неверном теге — вызывающий трактует это как BAD_DECRYPT. */
export function aesGcmDecrypt(
  key: Uint8Array,
  ciphertext: Uint8Array,
  iv: Uint8Array,
  tag: Uint8Array,
): Uint8Array {
  const combined = new Uint8Array(ciphertext.length + tag.length);
  combined.set(ciphertext);
  combined.set(tag, ciphertext.length);
  return gcm(key, iv).decrypt(combined);
}

// ─── Идентификатор слота ─────────────────────────────────────────────────────

/**
 * Слот хранения общего секрета для конкретного устройства отправителя.
 * SHA-256 от полного 32-байтного IK — чтобы два отправителя с совпадающими
 * первыми байтами ключа не столкнулись в одном слоте.
 *
 * Отличие от Windows: там результат — обычный base64, здесь он приводится к
 * base64url. Причина техническая: имя ключа в expo-secure-store допускает
 * только [A-Za-z0-9._-], а '+', '/' и '=' сломали бы запись. Значение
 * локальное, в эфир не уходит, поэтому на совместимость не влияет — важна
 * лишь детерминированность в пределах устройства.
 */
export function makeSlotId(ikB64: string): string {
  const digest = sha256(b64Decode(ikB64));
  return b64Encode(digest)
    .slice(0, 32)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}
