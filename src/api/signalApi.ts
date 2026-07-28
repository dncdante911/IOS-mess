/**
 * Сетевой слой E2EE — сервер предключей (X3DH pre-key server).
 *
 * Эндпоинты (эталон — network/NodeApi.kt на Android, routes/signal.js на бэке):
 *   POST api/node/signal/register          — залить свой бандл ключей
 *   GET  api/node/signal/bundles/{userId}  — бандлы ВСЕХ устройств пользователя
 *   GET  api/node/signal/identities/{userId} — только identity-ключи по устройствам
 *
 * Приватные ключи здесь не фигурируют вообще и на сервер не уходят никогда —
 * только публичные половины и подпись SPK.
 *
 * Реализует контракт E2EENodeApi из crypto/e2ee/e2eeService.ts.
 */

import { nodeApi } from './apiClient';
import type { DeviceBundle, E2EENodeApi } from '../crypto/e2ee/e2eeService';

const FORM_HEADERS = { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } };

/** Обычный объект, а НЕ URLSearchParams — см. пояснение в api/authApi.ts:form(). */
function form(fields: Record<string, string | number | undefined>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(fields)) {
    if (v !== undefined) out[k] = String(v);
  }
  return out;
}

interface RegisterResponse {
  api_status?: number | string;
  error_message?: string;
}

interface BundlesResponse {
  api_status?: number | string;
  user_id?: number;
  devices?: DeviceBundle[];
}

interface IdentitiesResponse {
  api_status?: number | string;
  user_id?: number;
  devices?: Array<{ device_id: string; identity_key?: string | null }>;
}

function isOk(status: number | string | undefined): boolean {
  const n = Number(status ?? 0);
  return n === 200 || n === 0;
}

/**
 * Публикует бандл этого устройства. Вызывается при каждом запуске, если
 * e2eeService не подтвердил регистрацию на сервере — операция идемпотентна:
 * сервер делает upsert по паре (user_id, device_id).
 */
async function registerSignalKeys(params: {
  identity_key: string;
  signed_prekey_id: number;
  signed_prekey: string;
  signed_prekey_sig: string;
  prekeys: string;
  device_id?: string;
  identity_signing_key?: string;
}): Promise<boolean> {
  try {
    const res = await nodeApi.post<RegisterResponse>(
      'api/node/signal/register',
      form(params),
      FORM_HEADERS,
    );
    if (!isOk(res.data?.api_status)) {
      console.error('[SignalApi] register отклонён:', res.data?.error_message ?? res.data?.api_status);
      return false;
    }
    return true;
  } catch (e) {
    console.error('[SignalApi] register:', e);
    return false;
  }
}

/**
 * Бандлы всех устройств пользователя — по одному конверту на устройство.
 *
 * `noOpk = true` (по умолчанию) обязателен для v6: одноразовые предключи в
 * этой версии протокола не используются, а без флага сервер израсходовал бы
 * OPK на каждый запрос и пул быстро опустел бы впустую.
 */
async function getSignalBundles(userId: number, noOpk = true): Promise<DeviceBundle[]> {
  try {
    const res = await nodeApi.get<BundlesResponse>(
      `api/node/signal/bundles/${userId}`,
      noOpk ? { params: { no_opk: '1' } } : undefined,
    );
    if (!isOk(res.data?.api_status)) return [];
    return res.data?.devices ?? [];
  } catch (e) {
    console.error('[SignalApi] getSignalBundles для', userId, e);
    return [];
  }
}

/**
 * Список устройств СВОЕГО аккаунта. Нужен ровно для одной проверки: убедиться,
 * что сервер всё ещё знает это устройство. Локальному флагу «зарегистрирован»
 * доверять нельзя — 27.07.2026 на Android именно из-за этого устройство
 * выпало из E2EE и все входящие стали нечитаемыми.
 */
async function getSignalIdentities(
  userId: number,
): Promise<Array<{ device_id: string; identity_key?: string | null }>> {
  try {
    const res = await nodeApi.get<IdentitiesResponse>(`api/node/signal/identities/${userId}`);
    if (!isOk(res.data?.api_status)) return [];
    return res.data?.devices ?? [];
  } catch (e) {
    console.error('[SignalApi] getSignalIdentities для', userId, e);
    return [];
  }
}

export const signalApi: E2EENodeApi = {
  registerSignalKeys,
  getSignalBundles,
  getSignalIdentities,
};
