/**
 * Cert pinning — аналог OkHttp CertificatePinner в Android NodeRetrofitClient /
 * StrapiClient (TrustKit на iOS через react-native-ssl-public-key-pinning).
 * Действует на fetch/XMLHttpRequest/axios; WebSocket сокета не покрывается.
 *
 * Пины сверены с живыми сертификатами 2026-10-07 (openssl s_client):
 *   worldmates.club / :449   leaf gZuI9wdf…   ← YR2 nWN7PSep… ← Root YR fk6IOKit…
 *   cdn.worldmates.club      leaf UG2U6ZKK…   ← YR2 nWN7PSep… ← Root YR fk6IOKit…
 *
 * ⚠️ В Android листовые пины УСТАРЕЛИ (WLb9fS…/Weu6ei… — сертификаты уже
 * перевыпущены, промежуточный сменился YR1 → YR2). Android работает только
 * благодаря пину Root YR. Здесь основной якорь — тоже корень (Root YR, до 2032),
 * плюс текущий промежуточный и листы; ISRG Root X1 — запасной на случай
 * возврата Let's Encrypt к старой цепочке. Ротация листа (60–90 дней) пиннинг
 * не ломает, пока цепочка идёт через Root YR / ISRG X1.
 */
import {
  addSslPinningErrorListener,
  initializeSslPinning,
  isSslPinningAvailable,
} from 'react-native-ssl-public-key-pinning';

const ROOT_YR = 'fk6IOKit1ild5647BH06ujSIq5XbCgqlbYl6ANhhi88=';
const ISRG_ROOT_X1 = 'C5+lpZ7tcVwmwQIMcRtPbsQtWLABXhQzejna0wHFr8M=';
const LE_YR2 = 'nWN7PSep5XDQdge5zK24CnCRXHr3KvzhKEGxsdqCX9E=';
const LEAF_WORLDMATES = 'gZuI9wdfOitxy2Y+njoLH4RVOlbv8znRoZ2Uo9lE0X8=';
const LEAF_CDN = 'UG2U6ZKKoS1UFxGUNeABIy8hpIxDU5in9w8p1bdYkHQ=';

/** После этой даты пиннинг отключается сам (срок Root YR) — защита от «вечной» блокировки старых сборок. */
const EXPIRES = '2032-06-01';

export async function initCertPinning(onError?: (host: string) => void): Promise<void> {
  if (!isSslPinningAvailable()) return; // Expo Go / web — нативного модуля нет
  try {
    await initializeSslPinning({
      'worldmates.club': {
        includeSubdomains: false,
        publicKeyHashes: [ROOT_YR, ISRG_ROOT_X1, LE_YR2, LEAF_WORLDMATES],
        expirationDate: EXPIRES,
      },
      'cdn.worldmates.club': {
        includeSubdomains: false,
        publicKeyHashes: [ROOT_YR, ISRG_ROOT_X1, LE_YR2, LEAF_CDN],
        expirationDate: EXPIRES,
      },
    });
    addSslPinningErrorListener((e) => onError?.(e.serverHostname));
  } catch (e) {
    console.warn('[CertPinning] не инициализирован:', e);
  }
}
