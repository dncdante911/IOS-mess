/**
 * E2EE личных чатов — SESAME-lite + Static X3DH + AES-256-GCM, cipher_version = 6.
 *
 * Порт с windows-messenger/src/e2ee.ts (625 строк). Windows выбран эталоном, а
 * не Android: он тоже на TypeScript и на той же @noble/curves, поэтому риск
 * разойтись в криптографии минимален. Поведение сверено с Android
 * (utils/e2ee/E2EEService.kt).
 *
 * Формат сообщения (поле signal_header):
 *   {
 *     "v": 6,
 *     "devs": {
 *       "<deviceId>": { "ek": b64, "ik": b64, "ct": b64, "iv": b64, "tag": b64 },
 *       ...
 *     }
 *   }
 *
 * "ek" и "ik" присутствуют ВСЕГДА — поэтому любое устройство может вывести
 * общий секрет из самого сообщения, не имея сохранённой сессии.
 *
 * Self-sync: отправитель шифрует копию и для своих остальных устройств, иначе
 * отправленное не будет видно на других платформах.
 *
 * ─── ДВА ОТЛИЧИЯ ОТ ЭТАЛОНА, ДОБАВЛЕННЫЕ ОСОЗНАННО ───────────────────────────
 *
 * 1. verifyDeviceRegistered() — регистрация сверяется С СЕРВЕРОМ, а не по
 *    локальному флагу. Именно доверие локальному флагу 27.07.2026 выбросило
 *    Android-устройство из E2EE: строка в signal_keys пропала вместе с диском,
 *    флаг «зарегистрирован» остался, клиент молча не перерегистрировался, и
 *    отправители перестали шифровать для него — все входящие стали нечитаемыми.
 *
 * 2. tryDecryptFromAnySlot() — если конверта для нашего device_id нет,
 *    перебираются все записи конверта. device_id в вывод ключа не входит
 *    (см. primitives.x3dhBob), поэтому сообщение, адресованное прежнему
 *    device_id этого же устройства, всё ещё расшифровывается нашим IK.
 *    Арбитр — тег GCM: неподходящая запись не проходит аутентификацию.
 */

import {
  aesGcmDecrypt,
  aesGcmEncrypt,
  b64Decode,
  b64Encode,
  generateKeyPair,
  generateSigningKeyPair,
  IV_LENGTH,
  makeSlotId,
  randomUuid,
  secureRandomBytes,
  signSpk,
  utf8Bytes,
  utf8String,
  verifySpkSignature,
  x3dhAlice,
  x3dhBob,
  type Ed25519KeyPair,
  type X25519KeyPair,
} from './primitives';
import {
  clearSlotsForUser,
  KEY_DEVICE_ID,
  KEY_EK,
  KEY_IK,
  KEY_REGISTERED_DEV,
  KEY_RIK,
  KEY_RSPK,
  KEY_SIGN,
  KEY_SK,
  KEY_SPK,
  rememberSlotKeys,
  secureGet,
  secureGetSoft,
  secureRemove,
  secureSet,
} from './e2eeStore';

export const E2EE_CIPHER_VERSION = 6;

/** Больше 24 адресатов в конверте — это не реальный аккаунт, а мусор. */
const MAX_SLOT_SCAN = 24;

export interface E2EEPayload {
  ciphertext: string;
  iv: string;
  tag: string;
  signalHeader: string;
  cipher_version: number;
}

export interface DeviceBundle {
  device_id: string;
  identity_key: string;
  signed_prekey: string;
  identity_signing_key?: string | null;
  signed_prekey_sig?: string | null;
}

/** Минимум, который сервису нужен от сетевого слоя. */
export interface E2EENodeApi {
  registerSignalKeys(params: {
    identity_key: string;
    signed_prekey_id: number;
    signed_prekey: string;
    signed_prekey_sig: string;
    prekeys: string;
    device_id?: string;
    identity_signing_key?: string;
  }): Promise<boolean>;

  getSignalBundles(userId: number, noOpk?: boolean): Promise<DeviceBundle[]>;

  /** Список устройств СВОЕГО аккаунта — для сверки регистрации (см. п.1 выше). */
  getSignalIdentities(userId: number): Promise<Array<{ device_id: string; identity_key?: string | null }>>;
}

type StoredKeyPair = { priv: string; pub: string };
type EnvelopeEntry = Record<string, string>;

// ─── Мьютекс на собеседника ──────────────────────────────────────────────────

class AsyncMutex {
  private queue: Array<() => void> = [];
  private locked = false;

  async withLock<T>(fn: () => Promise<T>): Promise<T> {
    await this.acquire();
    try {
      return await fn();
    } finally {
      this.release();
    }
  }
  private acquire(): Promise<void> {
    if (!this.locked) {
      this.locked = true;
      return Promise.resolve();
    }
    return new Promise<void>((r) => this.queue.push(r));
  }
  private release(): void {
    const next = this.queue.shift();
    if (next) next();
    else this.locked = false;
  }
}

// ─── Сервис ──────────────────────────────────────────────────────────────────

export class E2EEService {
  private nodeApi: E2EENodeApi;
  private peerLocks = new Map<number, AsyncMutex>();
  private skCache = new Map<string, Uint8Array>();
  private ekCache = new Map<string, Uint8Array>();
  /** Слоты, оказавшиеся нашими вопреки несовпадению device_id (см. п.2). */
  private recoveredSlots = new Set<string>();
  /** Сверка регистрации с сервером выполняется один раз за запуск. */
  private serverRegistrationVerified = false;

  constructor(nodeApi: E2EENodeApi) {
    this.nodeApi = nodeApi;
  }

  private lockFor(userId: number): AsyncMutex {
    let m = this.peerLocks.get(userId);
    if (!m) {
      m = new AsyncMutex();
      this.peerLocks.set(userId, m);
    }
    return m;
  }

  private cacheKey(uid: number, slot: string): string {
    return `${uid}_${slot}`;
  }

  // ─── Идентификатор устройства ──────────────────────────────────────────────

  async getDeviceId(): Promise<string> {
    const stored = await secureGet<string>(KEY_DEVICE_ID);
    if (stored) return stored;
    const id = randomUuid();
    await secureSet(KEY_DEVICE_ID, id);
    console.info('[E2EE] создан device_id:', id);
    return id;
  }

  async getOwnIdentityKeyB64(): Promise<string> {
    const ik = await this.getOrCreateIK();
    return b64Encode(ik.publicKeyRaw);
  }

  // ─── Регистрация ключей ────────────────────────────────────────────────────

  async ensureRegistered(myUserId = 0): Promise<void> {
    const deviceId = await this.getDeviceId();
    const flagged = (await secureGetSoft<string>(KEY_REGISTERED_DEV)) === deviceId;

    if (flagged) {
      if (this.serverRegistrationVerified) return;
      this.serverRegistrationVerified = true;
      if (await this.serverHasOurDevice(myUserId, deviceId)) return;
      console.warn(
        '[E2EE] локально помечены как зарегистрированные, но сервер не знает устройство',
        deviceId,
        '— перерегистрируемся',
      );
    }

    try {
      const ik = await this.getOrCreateIK();
      const spk = await this.getOrCreateSPK();
      const signKp = await this.getOrCreateSigningKey();

      const ok = await this.nodeApi.registerSignalKeys({
        identity_key: b64Encode(ik.publicKeyRaw),
        signed_prekey_id: 1,
        signed_prekey: b64Encode(spk.publicKeyRaw),
        signed_prekey_sig: b64Encode(signSpk(spk.publicKeyRaw, signKp.privateKeyRaw)),
        prekeys: '[]',
        device_id: deviceId,
        identity_signing_key: b64Encode(signKp.publicKeyRaw),
      });

      if (ok) {
        await secureSet(KEY_REGISTERED_DEV, deviceId);
        this.serverRegistrationVerified = true;
        console.info('[E2EE] устройство зарегистрировано:', deviceId);
      } else {
        // Флаг не ставим — следующий запуск попробует снова.
        console.error('[E2EE] регистрация не удалась');
      }
    } catch (e) {
      console.error('[E2EE] ensureRegistered:', e);
    }
  }

  /**
   * Есть ли НАШЕ устройство в списке на сервере.
   *
   * При любом неопределённом исходе (нет userId, сеть недоступна,非-200)
   * возвращаем true. «Не смогли проверить» не должно приводить к
   * перерегистрации: при недоступности сервера иначе весь флот кинется
   * перезаливать бандлы разом, а реально пропавшая строка всё равно
   * обнаружится при следующем запуске.
   */
  private async serverHasOurDevice(myUserId: number, deviceId: string): Promise<boolean> {
    if (!myUserId || myUserId <= 0) return true;
    try {
      const devices = await this.nodeApi.getSignalIdentities(myUserId);
      const myIkB64 = await this.getOwnIdentityKeyB64();
      const found = devices.some(
        (d) => d.device_id === deviceId && (!d.identity_key || d.identity_key === myIkB64),
      );
      if (!found) {
        console.warn(
          '[E2EE] на сервере нет нашего устройства',
          deviceId,
          `(там ${devices.length} шт.)`,
        );
      }
      return found;
    } catch (e) {
      console.warn('[E2EE] сверка регистрации не удалась, считаем зарегистрированными:', e);
      return true;
    }
  }

  // ─── Шифрование ────────────────────────────────────────────────────────────

  async encryptForUser(
    recipientId: number,
    plaintext: string,
    myUserId = 0,
  ): Promise<E2EEPayload | null> {
    await this.ensureRegistered(myUserId);
    try {
      const recipientDevices = await this.fetchBundles(recipientId);
      if (recipientDevices.length === 0) {
        console.error('[E2EE] у пользователя', recipientId, 'нет бандлов устройств');
        return null;
      }

      const myDeviceId = await this.getDeviceId();

      const selfDevices =
        myUserId > 0 && myUserId !== recipientId
          ? (await this.fetchBundles(myUserId)).filter((d) => d.device_id !== myDeviceId)
          : [];

      const targets: Array<{ uid: number; dev: DeviceBundle }> = [
        ...recipientDevices.map((dev) => ({ uid: recipientId, dev })),
        ...selfDevices.map((dev) => ({ uid: myUserId, dev })),
      ];

      const myIk = await this.getOrCreateIK();
      const myIkB64 = b64Encode(myIk.publicKeyRaw);

      const devs: Record<string, EnvelopeEntry> = {};
      let primary: EnvelopeEntry | null = null;

      for (const { uid, dev } of targets) {
        const { device_id: devId, identity_key: ikB64, signed_prekey: spkB64 } = dev;
        if (!ikB64 || !spkB64) continue;

        // Подпись SPK проверяется, только если собеседник вообще опубликовал
        // ключ подписи. ЕСТЬ, но НЕВЕРНА — отказываемся от устройства
        // (возможна подмена ключа сервером). НЕТ вовсе — это клиент, ещё не
        // обновившийся до подписей; работаем, это переходный случай.
        // Так же сделано на Android и Windows — расхождений быть не должно.
        if (!this.isSpkSignatureValid(dev)) {
          if (dev.identity_signing_key) {
            console.error(
              '[E2EE] НЕВЕРНАЯ подпись SPK у uid',
              uid,
              'устройство',
              devId,
              '— сессия с ним не устанавливается',
            );
            continue;
          }
          console.warn('[E2EE] подпись SPK не проверяема (старый клиент), uid', uid, 'устройство', devId);
        }

        const entry = await this.lockFor(uid).withLock(async () => {
          const derived = await this.getOrDeriveAliceSK(uid, devId, ikB64, spkB64);
          if (!derived) return null;

          const iv = secureRandomBytes(IV_LENGTH);
          const { ciphertext, tag } = aesGcmEncrypt(derived.sk, utf8Bytes(plaintext), iv);

          return {
            ek: b64Encode(derived.ekPub),
            ik: myIkB64,
            ct: b64Encode(ciphertext),
            iv: b64Encode(iv),
            tag: b64Encode(tag),
          } as EnvelopeEntry;
        });

        if (!entry) continue;
        devs[devId] = entry;
        if (!primary && uid === recipientId) primary = entry;
      }

      if (Object.keys(devs).length === 0) {
        console.error('[E2EE] не удалось зашифровать ни для одного устройства', recipientId);
        return null;
      }

      const first = primary ?? Object.values(devs)[0];
      console.info(
        '[E2EE] зашифровано для',
        Object.keys(devs).length,
        'устройств (свои:',
        selfDevices.length,
        ')',
      );

      return {
        ciphertext: first.ct,
        iv: first.iv,
        tag: first.tag,
        signalHeader: JSON.stringify({ v: E2EE_CIPHER_VERSION, devs }),
        cipher_version: E2EE_CIPHER_VERSION,
      };
    } catch (e) {
      console.error('[E2EE] encryptForUser для', recipientId, e);
      return null;
    }
  }

  // ─── Расшифровка ───────────────────────────────────────────────────────────

  async decryptMessage(
    senderId: number,
    ciphertextB64: string,
    ivB64: string,
    tagB64: string,
    headerJson: string | null | undefined,
    msgId = 0,
  ): Promise<string | null> {
    return this.lockFor(senderId).withLock(() =>
      this.decryptInternal(senderId, ciphertextB64, ivB64, tagB64, headerJson, msgId, false),
    );
  }

  private async decryptInternal(
    senderId: number,
    outerCtB64: string,
    outerIvB64: string,
    outerTagB64: string,
    headerJson: string | null | undefined,
    msgId: number,
    retried: boolean,
  ): Promise<string | null> {
    try {
      const header = this.parseHeader(headerJson);
      const myDeviceId = await this.getDeviceId();
      const devs = header?.devs as Record<string, EnvelopeEntry> | undefined;
      const entry = devs?.[myDeviceId];

      if (!entry) {
        // Нашего device_id в конверте нет. Это ещё не значит, что сообщение
        // не для нас: ключ конверта — лишь адрес, а расшифровывает пара
        // ключей. Пробуем все записи, арбитром выступает тег GCM.
        const recovered = devs ? await this.tryDecryptFromAnySlot(senderId, devs, myDeviceId) : null;
        if (recovered !== null) return recovered;

        console.warn(
          '[E2EE] в конверте нет записи для нашего устройства',
          myDeviceId,
          'от',
          senderId,
          '— в конверте:',
          Object.keys(devs ?? {}),
        );
        return null;
      }

      const { ct: ctB64, iv: ivB64, tag: tagB64 } = entry;
      const ikB64 = entry.ik ?? null;
      const ekB64 = entry.ek ?? null;
      if (!ctB64 || !ivB64 || !tagB64) return null;

      const slotId = ikB64 ? makeSlotId(ikB64) : 'default';
      const sk = await this.getOrDeriveBobSK(senderId, slotId, ikB64, ekB64, retried);
      if (!sk) return null;

      try {
        return utf8String(aesGcmDecrypt(sk, b64Decode(ctB64), b64Decode(ivB64), b64Decode(tagB64)));
      } catch (e) {
        // Тег не сошёлся: скорее всего у нас устаревший общий секрет —
        // сбрасываем его и один раз пробуем вывести заново из заголовка.
        if (!retried && ikB64 && ekB64) {
          console.warn('[E2EE] BAD_DECRYPT от', senderId, 'слот', slotId, '— перевыводим ключ');
          await this.clearSKForSlot(senderId, slotId);
          return this.decryptInternal(
            senderId,
            outerCtB64,
            outerIvB64,
            outerTagB64,
            headerJson,
            msgId,
            true,
          );
        }
        console.error('[E2EE] расшифровка от', senderId, 'не удалась', e);
        return null;
      }
    } catch (e) {
      console.error('[E2EE] decryptInternal, отправитель', senderId, e);
      return null;
    }
  }

  /**
   * Перебор всех записей конверта, когда нашего device_id среди них нет.
   *
   * Работает, потому что общий секрет выводится из пары ключей, а device_id в
   * него не входит: запись, адресованная ПРЕЖНЕМУ идентификатору этого же
   * устройства, расшифруется текущим identity-ключом. Ничего не сохраняем в
   * хранилище секретов — чужой слот не должен попасть туда как сессия.
   *
   * Если identity-ключ действительно утрачен, ни одна запись не пройдёт
   * проверку тега, и метод просто вернёт null, потратив ≤24 попытки.
   */
  private async tryDecryptFromAnySlot(
    senderId: number,
    devs: Record<string, EnvelopeEntry>,
    myDeviceId: string,
  ): Promise<string | null> {
    const slots = Object.keys(devs);
    if (slots.length === 0 || slots.length > MAX_SLOT_SCAN) return null;

    const myIk = await this.getOrCreateIK();
    const mySpk = await this.getOrCreateSPK();

    // Слоты, уже доказавшие принадлежность нам, пробуем первыми.
    const ordered = slots.sort(
      (a, b) => Number(this.recoveredSlots.has(b)) - Number(this.recoveredSlots.has(a)),
    );

    for (const slot of ordered) {
      const entry = devs[slot];
      const { ct, iv, tag, ik, ek } = entry;
      if (!ct || !iv || !tag || !ik || !ek) continue;

      try {
        const { sk } = x3dhBob(myIk, mySpk, null, b64Decode(ik), b64Decode(ek));
        const plain = utf8String(aesGcmDecrypt(sk, b64Decode(ct), b64Decode(iv), b64Decode(tag)));

        if (!this.recoveredSlots.has(slot)) {
          this.recoveredSlots.add(slot);
          console.info(
            '[E2EE] восстановлен прежний слот устройства:',
            slot,
            'расшифровывает сообщения от',
            senderId,
            `(текущий device_id — ${myDeviceId})`,
          );
        }
        return plain;
      } catch {
        // Не наш слот — тег GCM отклонил. Идём дальше.
      }
    }
    return null;
  }

  // ─── Вывод общих секретов ──────────────────────────────────────────────────

  private async getOrDeriveAliceSK(
    uid: number,
    devId: string,
    ikBPubB64: string,
    spkBPubB64: string,
  ): Promise<{ sk: Uint8Array; ekPub: Uint8Array } | null> {
    const ck = this.cacheKey(uid, devId);
    const storedRik = await secureGetSoft<string>(KEY_RIK(uid, devId));
    const storedRspk = await secureGetSoft<string>(KEY_RSPK(uid, devId));

    if (storedRik === ikBPubB64 && storedRspk === spkBPubB64) {
      const cachedSk =
        this.skCache.get(ck) ??
        (await secureGetSoft<string>(KEY_SK(uid, devId)).then((b) => (b ? b64Decode(b) : null)));
      const cachedEk =
        this.ekCache.get(ck) ??
        (await secureGetSoft<string>(KEY_EK(uid, devId)).then((b) => (b ? b64Decode(b) : null)));
      if (cachedSk && cachedEk) return { sk: cachedSk, ekPub: cachedEk };
    } else if (storedRik || storedRspk) {
      console.info(
        '[E2EE]',
        storedRik !== ikBPubB64 ? 'IK' : 'SPK',
        'сменился у пользователя',
        uid,
        'устройство',
        devId,
        '— перевыводим ключ',
      );
    }

    const myIk = await this.getOrCreateIK();
    const ekA = generateKeyPair();
    const { sk } = x3dhAlice(myIk, b64Decode(ikBPubB64), b64Decode(spkBPubB64), null, ekA);

    this.skCache.set(ck, sk);
    this.ekCache.set(ck, ekA.publicKeyRaw);
    await secureSet(KEY_SK(uid, devId), b64Encode(sk));
    await secureSet(KEY_EK(uid, devId), b64Encode(ekA.publicKeyRaw));
    await secureSet(KEY_RIK(uid, devId), ikBPubB64);
    await secureSet(KEY_RSPK(uid, devId), spkBPubB64);
    await rememberSlotKeys(
      KEY_SK(uid, devId),
      KEY_EK(uid, devId),
      KEY_RIK(uid, devId),
      KEY_RSPK(uid, devId),
    );

    console.info('[E2EE] X3DH(Alice): новый ключ для', uid, 'устройство', devId);
    return { sk, ekPub: ekA.publicKeyRaw };
  }

  private async getOrDeriveBobSK(
    senderId: number,
    slotId: string,
    ikAPubB64: string | null,
    ekAPubB64: string | null,
    force: boolean,
  ): Promise<Uint8Array | null> {
    const ck = this.cacheKey(senderId, slotId);

    if (!force) {
      const storedRik = await secureGetSoft<string>(KEY_RIK(senderId, slotId));
      if (storedRik === ikAPubB64 || ikAPubB64 === null) {
        const cached =
          this.skCache.get(ck) ??
          (await secureGetSoft<string>(KEY_SK(senderId, slotId)).then((b) => (b ? b64Decode(b) : null)));
        if (cached) return cached;
      }
    }

    if (!ikAPubB64 || !ekAPubB64) {
      console.error('[E2EE] нечем вывести ключ для', senderId, 'слот', slotId, '— нет ik/ek в заголовке');
      return null;
    }

    const myIk = await this.getOrCreateIK();
    const mySpk = await this.getOrCreateSPK();
    const { sk } = x3dhBob(myIk, mySpk, null, b64Decode(ikAPubB64), b64Decode(ekAPubB64));

    this.skCache.set(ck, sk);
    await secureSet(KEY_SK(senderId, slotId), b64Encode(sk));
    await secureSet(KEY_RIK(senderId, slotId), ikAPubB64);
    await rememberSlotKeys(KEY_SK(senderId, slotId), KEY_RIK(senderId, slotId));

    console.info('[E2EE] X3DH(Bob): новый ключ от', senderId, 'слот', slotId);
    return sk;
  }

  private async clearSKForSlot(userId: number, slotId: string): Promise<void> {
    const ck = this.cacheKey(userId, slotId);
    this.skCache.delete(ck);
    this.ekCache.delete(ck);
    await secureRemove(KEY_SK(userId, slotId));
    await secureRemove(KEY_RIK(userId, slotId));
  }

  async clearAllSecretsFor(userId: number): Promise<void> {
    for (const k of [...this.skCache.keys()]) {
      if (k.startsWith(`${userId}_`)) {
        this.skCache.delete(k);
        this.ekCache.delete(k);
      }
    }
    await clearSlotsForUser(userId);
  }

  // ─── Бандлы и ключи ────────────────────────────────────────────────────────

  private async fetchBundles(userId: number): Promise<DeviceBundle[]> {
    try {
      const bundles = await this.nodeApi.getSignalBundles(userId, true);
      return bundles.filter((b) => !!b.device_id && !!b.identity_key && !!b.signed_prekey);
    } catch (e) {
      console.error('[E2EE] не удалось получить бандлы для', userId, e);
      return [];
    }
  }

  private isSpkSignatureValid(dev: DeviceBundle): boolean {
    if (!dev.identity_signing_key || !dev.signed_prekey_sig) return false;
    return verifySpkSignature(
      b64Decode(dev.signed_prekey_sig),
      b64Decode(dev.signed_prekey),
      b64Decode(dev.identity_signing_key),
    );
  }

  private async getOrCreateIK(): Promise<X25519KeyPair> {
    const stored = await secureGet<StoredKeyPair>(KEY_IK);
    if (stored) {
      return { privateKeyRaw: b64Decode(stored.priv), publicKeyRaw: b64Decode(stored.pub) };
    }
    const kp = generateKeyPair();
    await secureSet(KEY_IK, { priv: b64Encode(kp.privateKeyRaw), pub: b64Encode(kp.publicKeyRaw) });
    console.info('[E2EE] создан identity-ключ');
    return kp;
  }

  private async getOrCreateSPK(): Promise<X25519KeyPair> {
    const stored = await secureGet<StoredKeyPair>(KEY_SPK);
    if (stored) {
      return { privateKeyRaw: b64Decode(stored.priv), publicKeyRaw: b64Decode(stored.pub) };
    }
    const kp = generateKeyPair();
    await secureSet(KEY_SPK, { priv: b64Encode(kp.privateKeyRaw), pub: b64Encode(kp.publicKeyRaw) });
    return kp;
  }

  private async getOrCreateSigningKey(): Promise<Ed25519KeyPair> {
    const stored = await secureGet<StoredKeyPair>(KEY_SIGN);
    if (stored) {
      return { privateKeyRaw: b64Decode(stored.priv), publicKeyRaw: b64Decode(stored.pub) };
    }
    const kp = generateSigningKeyPair();
    await secureSet(KEY_SIGN, { priv: b64Encode(kp.privateKeyRaw), pub: b64Encode(kp.publicKeyRaw) });
    return kp;
  }

  private parseHeader(json: string | null | undefined): Record<string, unknown> | null {
    if (!json) return null;
    try {
      return JSON.parse(json) as Record<string, unknown>;
    } catch {
      return null;
    }
  }
}

// ─── Синглтон ────────────────────────────────────────────────────────────────

let instance: E2EEService | null = null;

export function initE2EE(nodeApi: E2EENodeApi): E2EEService {
  instance = new E2EEService(nodeApi);
  return instance;
}

export function getE2EE(): E2EEService {
  if (!instance) throw new Error('[E2EE] не инициализирован — сначала вызовите initE2EE()');
  return instance;
}
