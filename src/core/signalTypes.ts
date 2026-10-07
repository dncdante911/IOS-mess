/**
 * Типы Signal/X3DH-бандлов — из windows-messenger/src/signalService.ts.
 * Реализация шифрования на iOS — src/crypto/e2ee/* (v6 Static X3DH + AES-256-GCM).
 */
export interface PreKeyBundle {
  identity_key: string;
  identity_signing_key?: string;
  signed_prekey_id: number;
  signed_prekey: string;
  signed_prekey_sig: string;
  one_time_prekey_id?: number;
  one_time_prekey?: string;
  device_id?: string;
}

export interface NodeApiShim {
  registerSignalKeys(payload: {
    identity_key: string;
    signed_prekey_id: number;
    signed_prekey: string;
    signed_prekey_sig: string;
    prekeys: string;
    device_id?: string;
    identity_signing_key?: string;
  }): Promise<boolean>;

  /** noOpk=true для Static X3DH (cv=6): сервер НЕ расходует one-time pre-key. */
  getSignalBundle(userId: number, noOpk?: boolean): Promise<PreKeyBundle | null>;

  /** Все бандлы устройств пользователя — для multi-device fan-out (cv=6). */
  getSignalBundles(userId: number, noOpk?: boolean): Promise<PreKeyBundle[]>;

  replenishSignalPreKeys(prekeys: string, deviceId?: string): Promise<void>;

  /** Только identity key, OPK не расходует — для проверки устаревшей сессии. */
  getSignalIdentityKey(userId: number, deviceId?: string): Promise<string | null>;
}
