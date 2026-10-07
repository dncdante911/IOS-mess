/**
 * SoundLibrary — порт Android services/SoundLibrary.kt + звуки звонка из
 * Windows utils/callSounds.ts.
 *
 *  • NOTIFICATION_SOUNDS — звук уведомления (9 вариантов, оригинальный синтез)
 *  • MESSAGE_SOUNDS — короткий звук в ОТКРЫТОМ чате на отправку/получение (8)
 *  • рингтон входящего и гудок исходящего звонка (Android берёт системный
 *    рингтон — на iOS он приложению недоступен без CallKit, поэтому те же
 *    тоны, что в Windows, отрендерены в assets/sounds/call_*.wav)
 *
 * Выбор хранится по строковому id ("pop", "bubble"…) в UserPreferences —
 * как на Android.
 */
import { Audio, type AVPlaybackSource } from 'expo-av';
import { UserPreferencesRepository } from '../core/prefs';

export interface SoundOption {
  id: string;
  nameKey: string;
  source: AVPlaybackSource;
  /** имя файла в бандле — для звука push-уведомления iOS */
  file: string;
}

/* eslint-disable @typescript-eslint/no-require-imports */
export const NOTIFICATION_SOUNDS: SoundOption[] = [
  { id: 'pop', nameKey: 'sound_notif_pop', file: 'notif_pop.wav', source: require('../../assets/sounds/notif_pop.wav') },
  { id: 'chime', nameKey: 'sound_notif_chime', file: 'notif_chime.wav', source: require('../../assets/sounds/notif_chime.wav') },
  { id: 'marimba', nameKey: 'sound_notif_marimba', file: 'notif_marimba.wav', source: require('../../assets/sounds/notif_marimba.wav') },
  { id: 'bell', nameKey: 'sound_notif_bell', file: 'notif_bell.wav', source: require('../../assets/sounds/notif_bell.wav') },
  { id: 'telegram', nameKey: 'sound_notif_telegram', file: 'notif_telegram.wav', source: require('../../assets/sounds/notif_telegram.wav') },
  { id: 'xylophone', nameKey: 'sound_notif_xylophone', file: 'notif_xylophone.wav', source: require('../../assets/sounds/notif_xylophone.wav') },
  { id: 'harp', nameKey: 'sound_notif_harp', file: 'notif_harp.wav', source: require('../../assets/sounds/notif_harp.wav') },
  { id: 'glass', nameKey: 'sound_notif_glass', file: 'notif_glass.wav', source: require('../../assets/sounds/notif_glass.wav') },
  { id: 'wood', nameKey: 'sound_notif_wood', file: 'notif_wood.wav', source: require('../../assets/sounds/notif_wood.wav') },
];

export const MESSAGE_SOUNDS: SoundOption[] = [
  { id: 'tick', nameKey: 'sound_msg_tick', file: 'msg_tick.wav', source: require('../../assets/sounds/msg_tick.wav') },
  { id: 'bubble', nameKey: 'sound_msg_bubble', file: 'msg_bubble.wav', source: require('../../assets/sounds/msg_bubble.wav') },
  { id: 'whisper', nameKey: 'sound_msg_whisper', file: 'msg_whisper.wav', source: require('../../assets/sounds/msg_whisper.wav') },
  { id: 'droplet', nameKey: 'sound_msg_droplet', file: 'msg_droplet.wav', source: require('../../assets/sounds/msg_droplet.wav') },
  { id: 'soft_pop', nameKey: 'sound_msg_soft_pop', file: 'msg_soft_pop.wav', source: require('../../assets/sounds/msg_soft_pop.wav') },
  { id: 'click', nameKey: 'sound_msg_click', file: 'msg_click.wav', source: require('../../assets/sounds/msg_click.wav') },
  { id: 'swoosh', nameKey: 'sound_msg_swoosh', file: 'msg_swoosh.wav', source: require('../../assets/sounds/msg_swoosh.wav') },
  { id: 'petal', nameKey: 'sound_msg_petal', file: 'msg_petal.wav', source: require('../../assets/sounds/msg_petal.wav') },
];

const RINGTONE: AVPlaybackSource = require('../../assets/sounds/call_ringtone.wav');
const RINGBACK: AVPlaybackSource = require('../../assets/sounds/call_ringback.wav');
/* eslint-enable @typescript-eslint/no-require-imports */

export function notificationSound(id: string): SoundOption {
  return NOTIFICATION_SOUNDS.find((s) => s.id === id) ?? NOTIFICATION_SOUNDS[0];
}
export function messageSound(id: string): SoundOption {
  return MESSAGE_SOUNDS.find((s) => s.id === id) ?? MESSAGE_SOUNDS[1]; // "bubble" — дефолт
}

// ─── Короткие звуки: кеш загруженных (аналог SoundPool) ──────────────────────
const cache = new Map<string, Audio.Sound>();
let modeSet = false;

async function ensureMode(): Promise<void> {
  if (modeSet) return;
  modeSet = true;
  // Звуки сообщений — как «эффекты»: не прерывают музыку и не звучат в беззвучном режиме
  await Audio.setAudioModeAsync({ playsInSilentModeIOS: false, staysActiveInBackground: false }).catch(() => {});
}

async function play(key: string, source: AVPlaybackSource, volume: number): Promise<void> {
  try {
    await ensureMode();
    let s = cache.get(key);
    if (!s) {
      s = (await Audio.Sound.createAsync(source, { volume })).sound;
      cache.set(key, s);
    }
    await s.setVolumeAsync(volume);
    await s.replayAsync();
  } catch {
    // проигрывание звука не должно ронять отправку/получение сообщения
  }
}

export const SoundLibrary = {
  /** Звук в открытом чате (тише — громкость 0.8, как на Android). */
  playMessageSound(id?: string): void {
    const opt = messageSound(id ?? UserPreferencesRepository.value.messageSoundId);
    if (!UserPreferencesRepository.value.soundEnabled) return;
    void play(`m:${opt.id}`, opt.source, 0.8);
  },
  /** Звук уведомления внутри приложения (когда чат не открыт). */
  playNotificationSound(id?: string): void {
    const opt = notificationSound(id ?? UserPreferencesRepository.value.notificationSoundId);
    if (!UserPreferencesRepository.value.soundEnabled) return;
    void play(`n:${opt.id}`, opt.source, 1);
  },
  /** Предпрослушивание в настройках — полная громкость. */
  preview(id: string, isNotification: boolean): void {
    const opt = isNotification ? notificationSound(id) : messageSound(id);
    void play(`${isNotification ? 'n' : 'm'}:${opt.id}`, opt.source, 1);
  },
};

// ─── Звонок: зацикленный рингтон / гудок ──────────────────────────────────────
let loop: Audio.Sound | null = null;

async function startLoop(source: AVPlaybackSource, volume: number): Promise<void> {
  await stopCallSounds();
  try {
    // Рингтон должен звучать и в беззвучном режиме, как звонок на Android
    await Audio.setAudioModeAsync({ playsInSilentModeIOS: true, staysActiveInBackground: true });
    modeSet = false;
    loop = (await Audio.Sound.createAsync(source, { isLooping: true, volume, shouldPlay: true })).sound;
  } catch {
    loop = null;
  }
}

/** Входящий звонок — двойной «ring-ring». */
export function startRingtone(): Promise<void> {
  return startLoop(RINGTONE, 1);
}
/** Исходящий — гудок «ожидание ответа». */
export function startRingback(): Promise<void> {
  return startLoop(RINGBACK, 1);
}
export async function stopCallSounds(): Promise<void> {
  const s = loop;
  loop = null;
  if (s) {
    await s.stopAsync().catch(() => {});
    await s.unloadAsync().catch(() => {});
  }
}
