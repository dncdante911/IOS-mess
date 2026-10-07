/**
 * Расшифровка секретов в рантайме — порт Android security/SecretsProvider.kt.
 *
 * Шифрует app.config.js при сборке (AES-256-GCM, ключ = SHA-256(passphrase)),
 * формат: base64( iv[12] || ciphertext || tag[16] ) — тот же, что у Android.
 */
import Constants from 'expo-constants';
import { gcm } from '@noble/ciphers/aes';
import { sha256 } from '@noble/hashes/sha256';
import { b64Decode, utf8Bytes, utf8String } from '../crypto/e2ee/primitives';

const BUNDLE_ID = 'com.worldmates.messenger';

// ДОЛЖНО совпадать байт-в-байт с passphrase() в app.config.js
function passphrase(): string {
  let s = 'wm7';
  s += '_Obf$';
  s += 'K3y_';
  s += '2026#';
  s += BUNDLE_ID;
  return s;
}

let keyCache: Uint8Array | null = null;
function key(): Uint8Array {
  if (!keyCache) keyCache = sha256(utf8Bytes(passphrase()));
  return keyCache;
}

function decrypt(encoded: string | undefined): string {
  if (!encoded) return '';
  try {
    const blob = b64Decode(encoded);
    if (blob.length <= 12) return '';
    const iv = blob.slice(0, 12);
    const ct = blob.slice(12);
    return utf8String(gcm(key(), iv).decrypt(ct));
  } catch {
    return '';
  }
}

type SecretName =
  | 'serverKey'
  | 'siteEncryptKey'
  | 'strapiApiToken'
  | 'giphyApiKey'
  | 'mapsApiKey'
  | 'crashSecret';

const cache = new Map<SecretName, string>();

function get(name: SecretName): string {
  const hit = cache.get(name);
  if (hit !== undefined) return hit;
  const extra = (Constants.expoConfig?.extra ?? {}) as { s?: Record<string, string> };
  const value = decrypt(extra.s?.[name]);
  cache.set(name, value);
  return value;
}

export const SecretsProvider = {
  get serverKey() { return get('serverKey'); },
  get siteEncryptKey() { return get('siteEncryptKey'); },
  get strapiToken() { return get('strapiApiToken'); },
  get giphyApiKey() { return get('giphyApiKey'); },
  get mapsApiKey() { return get('mapsApiKey'); },
  get crashSecret() { return get('crashSecret'); },
};
