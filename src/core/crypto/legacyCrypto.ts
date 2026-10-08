/**
 * Старые (не-E2EE) форматы текста сообщений — порт Android
 * utils/DecryptionUtility.kt + utils/EncryptionUtility.kt.
 *
 *   cipher_version 1 — AES-128-ECB (WoWonder): ключ = строка timestamp,
 *                      дополненная нулями до 16 байт (как PHP openssl_encrypt)
 *   cipher_version 2 — AES-256-GCM: ключ = строка timestamp, повторённая до 32 байт
 *   cipher_version 3/6 — E2EE (Signal / Static X3DH) — сюда не относится
 *   cipher_version 5 — текст уже расшифрован сервером, возвращается как есть
 */
import { ecb, gcm } from '@noble/ciphers/aes';
import { b64Decode, b64Encode, secureRandomBytes, utf8Bytes, utf8String } from '../../crypto/e2ee/primitives';
import { getTranslation } from '../../i18n';

export const CIPHER_VERSION_ECB = 1;
export const CIPHER_VERSION_GCM = 2;
export const CIPHER_VERSION_SIGNAL_DR = 3;
export const CIPHER_VERSION_SENDER_KEY_V5 = 5;
export const CIPHER_VERSION_STATIC_X3DH = 6;

function ecbKey(timestamp: number): Uint8Array {
  const ts = utf8Bytes(String(Math.trunc(timestamp)));
  const key = new Uint8Array(16);
  key.set(ts.subarray(0, 16));
  return key;
}

function gcmKey(timestamp: number): Uint8Array {
  const ts = utf8Bytes(String(Math.trunc(timestamp)));
  const key = new Uint8Array(32);
  let off = 0;
  while (off < 32) {
    const n = Math.min(ts.length, 32 - off);
    key.set(ts.subarray(0, n), off);
    off += n;
  }
  return key;
}

function decryptECB(text: string, timestamp: number): string | null {
  try {
    const bytes = b64Decode(text);
    if (bytes.length === 0 || bytes.length % 16 !== 0) return null;
    return utf8String(ecb(ecbKey(timestamp)).decrypt(bytes)).trim();
  } catch {
    return null;
  }
}

function decryptGCM(text: string, timestamp: number, iv: string, tag: string): string | null {
  try {
    const ct = b64Decode(text);
    const t = b64Decode(tag);
    const joined = new Uint8Array(ct.length + t.length);
    joined.set(ct);
    joined.set(t, ct.length);
    return utf8String(gcm(gcmKey(timestamp), b64Decode(iv)).decrypt(joined)).trim();
  } catch {
    return null;
  }
}

/** EncryptionUtility.encryptMessage — v2 GCM (используется для совместимых отправок). */
export function encryptMessageGCM(plaintext: string, timestamp: number): { encryptedText: string; iv: string; tag: string; cipherVersion: number } {
  const iv = secureRandomBytes(12);
  const out = gcm(gcmKey(timestamp), iv).encrypt(utf8Bytes(plaintext));
  return {
    encryptedText: b64Encode(out.subarray(0, out.length - 16)),
    iv: b64Encode(iv),
    tag: b64Encode(out.subarray(out.length - 16)),
    cipherVersion: CIPHER_VERSION_GCM,
  };
}

/** DecryptionUtility.decryptMessage — автоопределение версии. */
export function decryptLegacy(
  text: string,
  timestamp: number,
  iv?: string | null,
  tag?: string | null,
  cipherVersion?: number | null,
): string | null {
  const v = cipherVersion ?? (iv && tag ? CIPHER_VERSION_GCM : CIPHER_VERSION_ECB);
  switch (v) {
    case CIPHER_VERSION_GCM:
      return iv && tag ? decryptGCM(text, timestamp, iv, tag) : null;
    case CIPHER_VERSION_ECB:
      return decryptECB(text, timestamp);
    case CIPHER_VERSION_SENDER_KEY_V5:
      return text;
    default:
      return null; // 3/6 — E2EE, расшифровывает e2eeService
  }
}

const BASE64_RE = /^[A-Za-z0-9+/]+=*$/;
function isBase64(t: string): boolean {
  return BASE64_RE.test(t) && t.length % 4 === 0;
}

/**
 * DecryptionUtility.decryptMessageOrOriginal: расшифровать или вернуть исходный
 * текст (поддержка и зашифрованных, и открытых сообщений). Неудача на
 * base64-похожем тексте → заглушка error_decrypt_failed.
 */
export function decryptMessageOrOriginal(
  text: string | null | undefined,
  timestamp: number,
  iv?: string | null,
  tag?: string | null,
  cipherVersion?: number | null,
): string {
  if (!text) return '';
  if (cipherVersion === CIPHER_VERSION_SIGNAL_DR || cipherVersion === CIPHER_VERSION_STATIC_X3DH) {
    return getTranslation('last_message_e2ee');
  }
  if (cipherVersion === CIPHER_VERSION_SENDER_KEY_V5) return text;
  if (!isBase64(text)) return text;
  const d = decryptLegacy(text, timestamp, iv, tag, cipherVersion);
  return d ? d : getTranslation('error_decrypt_failed');
}

/** DecryptionUtility.decryptMediaUrl */
export function decryptMediaUrl(
  mediaUrl: string | null | undefined,
  timestamp: number,
  iv?: string | null,
  tag?: string | null,
  cipherVersion?: number | null,
): string | null | undefined {
  if (!mediaUrl) return mediaUrl;
  if (mediaUrl.startsWith('http://') || mediaUrl.startsWith('https://') || mediaUrl.startsWith('/')) return mediaUrl;
  if (!isBase64(mediaUrl)) return mediaUrl;
  return decryptLegacy(mediaUrl, timestamp, iv, tag, cipherVersion) || mediaUrl;
}
