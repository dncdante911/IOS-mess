/**
 * Порт Android ui/messages/MessageHelpers.kt — тип медиа, превью последнего
 * сообщения в списке чатов, снятие разметки, время, аудио-метаданные.
 */
import type { M } from '../../core/android';
import { getTranslation } from '../../i18n';

const HEAL_PROBE_TEXT = '__signal_session_heal__';

/** formatTime(timestamp): секунды → "HH:mm" в локали устройства. */
export function formatTime(timestampSec: number): string {
  const d = new Date(timestampSec * 1000);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

/** Убирает тег темы Windows-клиента "📌__TOPIC__:<id>:" (в т.ч. сломанный "undefined"). */
const TOPIC_TAG_RE = /^📌?__TOPIC__:[^:]*:/u;
export function stripTopicTag(text: string | null | undefined): string | null {
  if (text == null) return null;
  const s = text.replace(TOPIC_TAG_RE, '').trim();
  return s || null;
}

const MEDIA_PATHS = [
  '/upload/photos/',
  '/media/photos/',
  '/upload/videos/',
  '/media/videos/',
  '/upload/sounds/',
  '/media/audios/',
  '/upload/files/',
  '/media/files/',
];

/**
 * detectMediaType: сначала type_two (сервер не портит его префиксом позиции),
 * затем gif/sticker, затем voice/audio (Windows шлёт голосовые в .webm —
 * по расширению их не отличить от видео), затем путь, расширение, тип.
 */
export function detectMediaType(url: string | null | undefined, messageType: string | null | undefined, typeTwo?: string | null): string {
  const tt = typeTwo?.toLowerCase();
  if (tt && ['voice', 'audio', 'video', 'video_note', 'image'].includes(tt)) return tt;

  const clean = messageType?.toLowerCase().replace(/^left_/, '').replace(/^right_/, '') || null;

  if (!url) {
    if (clean === 'gif' || clean === 'sticker') return 'sticker';
    if (clean && clean !== 'text') return clean;
    return 'text';
  }
  const u = url.toLowerCase();
  if (clean === 'gif' || clean === 'sticker') return 'sticker';
  if (clean === 'voice' || clean === 'audio') return clean;

  if (u.includes('/upload/photos/') || u.includes('/upload/images/') || u.includes('/media/photos/')) return 'image';
  if (u.includes('/upload/videos/') || u.includes('/media/videos/')) return 'video';
  if (u.includes('/upload/sounds/') || u.includes('/upload/audio/') || u.includes('/media/audios/') || u.includes('/media/sounds/')) return 'audio';
  if (u.includes('/upload/files/') || u.includes('/media/files/')) return 'file';

  const ends = (...exts: string[]) => exts.some((e) => u.endsWith(e));
  if (ends('.json', '.lottie', '.tgs', '.gif') || u.startsWith('lottie://') || u.includes('/stickers/')) return 'sticker';
  if (ends('.jpg', '.jpeg', '.png', '.webp', '.bmp')) return 'image';
  if (ends('.mp4', '.webm', '.mov', '.avi', '.mkv', '.3gp')) return 'video';
  if (ends('.mp3', '.wav', '.ogg', '.m4a', '.aac', '.opus')) return 'audio';
  if (ends('.pdf', '.doc', '.docx', '.xls', '.xlsx', '.zip', '.rar', '.txt')) return 'file';

  if (clean && clean !== 'text') return clean;
  return 'text';
}

const MEDIA_EXT_RE = /\.(jpg|jpeg|png|gif|webp|mp4|webm|mov|mp3|wav|ogg|pdf|doc|docx)$/;
const URL_RE = /(https?:\/\/[\w\-._~:/?#[\]@!$&'()*+,;=%]+)/;

function isMediaLink(lower: string): boolean {
  return MEDIA_PATHS.some((p) => lower.includes(p)) || MEDIA_EXT_RE.test(lower);
}

/** extractMediaUrlFromText */
export function extractMediaUrlFromText(text: string): string | null {
  const t = text.trim();
  if ((t.startsWith('http://') || t.startsWith('https://')) && isMediaLink(t.toLowerCase())) return t;
  const m = URL_RE.exec(t);
  if (!m) return null;
  return isMediaLink(m[1].toLowerCase()) ? m[1] : null;
}

/** isOnlyMediaUrl: текст — только ссылка на медиа (подпись не нужна). */
export function isOnlyMediaUrl(text: string): boolean {
  const t = text.trim();
  if (!t.startsWith('http://') && !t.startsWith('https://')) return false;
  const l = t.toLowerCase();
  const media =
    MEDIA_PATHS.some((p) => l.includes(p)) || ['.jpg', '.jpeg', '.png', '.gif', '.mp4', '.mp3', '.webm'].some((e) => l.endsWith(e));
  return media && !t.includes(' ') && !t.includes('\n');
}

export function isImageUrl(url: string): boolean {
  const l = url.toLowerCase();
  return ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'].some((e) => l.includes(e)) || l.includes('image') || l.includes('/img/') || l.includes('/images/');
}

/** formatAudioTime(millis) → "m:ss" */
export function formatAudioTime(millis: number): string {
  if (millis <= 0) return '0:00';
  const total = Math.floor(millis / 1000);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
}

// ─── stripMarkdownForPreview ──────────────────────────────────────────────────
let WORD_CHAR: RegExp;
try {
  WORD_CHAR = new RegExp('[\\p{L}\\p{N}*_]', 'u');
} catch {
  WORD_CHAR = /[A-Za-z0-9À-ɏЀ-ӿ*_]/;
}
const MD_LINK = /\[([^\]\n]{1,200})]\((https?:\/\/[^\s)]+)\)/g;
const MD_PAIRED = /(\*\*|__|~~|\|\||`)(.+?)\1/g;
// Одиночные * и _ — только на границах слов (my_helper_bot не трогаем).
// Lookbehind из Kotlin-версии заменён проверкой соседних символов в колбэке.
const MD_SINGLE = /([*_])([^\s*_\n](?:[^\n]*?[^\s*_\n])?)\1/g;

function stripSingles(s: string): string {
  return s.replace(MD_SINGLE, (match, _m: string, inner: string, offset: number, full: string) => {
    const before = offset > 0 ? full[offset - 1] : '';
    const after = full[offset + match.length] ?? '';
    if ((before && WORD_CHAR.test(before)) || (after && WORD_CHAR.test(after))) return match;
    return inner;
  });
}

/** Превью в списке чатов — плоский текст без Telegram-разметки ботов. */
export function stripMarkdownForPreview(text: string): string {
  let s = text.replace(MD_LINK, (_m, label: string) => label);
  for (let i = 0; i < 2; i++) {
    s = s.replace(MD_PAIRED, (_m, _d: string, inner: string) => inner);
    s = stripSingles(s);
  }
  return s.replace(/\s*\n+\s*/g, ' ').trim();
}

// ─── getLastMessagePreview ────────────────────────────────────────────────────
function tryJson(s: string | null | undefined): Record<string, unknown> | null {
  if (!s) return null;
  try {
    const v = JSON.parse(s);
    return v && typeof v === 'object' ? (v as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

/** Текст превью последнего сообщения (как в Android ChatsScreen). */
export function getLastMessagePreview(message: M.Message): string {
  if (message.typeTwo === 'call_log') {
    const meta = tryJson(message.decryptedText ?? message.encryptedText);
    const status = (meta?.status as string) ?? 'ended';
    const isVideo = meta?.callType === 'video';
    if (status === 'missed') return '📞 ' + getTranslation(isVideo ? 'call_log_missed_video' : 'call_log_missed');
    if (status === 'declined') return '📞 ' + getTranslation('call_log_declined');
    return getTranslation('msg_preview_call');
  }
  if (message.typeTwo === 'giveaway') {
    const meta = tryJson(message.stickers);
    const prize = typeof meta?.prize === 'string' ? meta.prize : '';
    const label = getTranslation(meta?.result === true ? 'gw_preview_results' : 'gw_chat_preview');
    return prize.trim() ? `${label}: ${prize}` : label;
  }

  const raw = message.decryptedText ?? message.encryptedText;
  if (raw === HEAL_PROBE_TEXT) return '';
  const text = stripTopicTag(raw);
  const mediaUrl = message.decryptedMediaUrl ?? message.mediaUrl;
  const sticker = message.stickers && (message.stickers.startsWith('http') || message.stickers.startsWith('lottie://')) ? message.stickers : null;
  const effective = mediaUrl ? mediaUrl : sticker ? sticker : text ? extractMediaUrlFromText(text) : null;
  const mediaType = sticker && effective === sticker ? 'sticker' : detectMediaType(effective, message.type, message.typeTwo);

  if (text && !isOnlyMediaUrl(text)) {
    const prefix: Record<string, string> = { image: '📷 ', video: '🎥 ', video_note: '🎥 ', audio: '🎵 ', voice: '🎙 ', file: '📎 ', sticker: '🎭 ' };
    const plain = stripMarkdownForPreview(text);
    const p = prefix[mediaType] ?? '';
    return p && effective ? p + plain : plain;
  }
  switch (mediaType) {
    case 'image':
      return getTranslation('msg_preview_photo');
    case 'video':
    case 'video_note':
      return getTranslation('msg_preview_video');
    case 'audio':
      return getTranslation('msg_preview_audio');
    case 'voice':
      return getTranslation('msg_preview_voice');
    case 'file':
      return getTranslation('msg_preview_file');
    case 'sticker':
      return getTranslation('msg_preview_sticker');
    case 'location':
      return getTranslation('msg_preview_location');
    case 'call':
      return getTranslation('msg_preview_call');
    default:
      return text ?? '';
  }
}

/** ChatsViewModel.convertMediaUrlToLabel: голая ссылка на медиа → «Фото/Видео/…». */
export function convertMediaUrlToLabel(text: string): string {
  if (!text.startsWith('http://') && !text.startsWith('https://')) return text;
  const l = text.toLowerCase();
  if (l.includes('/upload/photos/') || l.includes('/media/photos/') || /\.(jpg|jpeg|png|gif|webp|bmp)$/.test(l)) return getTranslation('media_label_image');
  if (l.includes('/upload/videos/') || l.includes('/media/videos/') || /\.(mp4|webm|mov|avi|mkv)$/.test(l)) return getTranslation('media_label_video');
  if (l.includes('/upload/sounds/') || l.includes('/media/audios/') || /\.(mp3|wav|ogg|m4a|aac)$/.test(l)) return getTranslation('media_label_audio');
  if (/\.gif$/.test(l)) return getTranslation('media_label_gif');
  if (l.includes('/upload/files/') || l.includes('/media/files/') || /\.(pdf|doc|docx|xls|xlsx|zip|rar)$/.test(l)) return getTranslation('media_label_file');
  return text;
}

// ─── Аудио ────────────────────────────────────────────────────────────────────
export interface AudioTrackInfo {
  title: string;
  artist: string;
  extension: string;
}

/** «Artist - Title.ext» из имени файла; хеши и encrypted_* → «Unknown Track». */
export function extractAudioTrackInfo(mediaUrl: string | null | undefined, originalFileName?: string | null): AudioTrackInfo {
  if (!mediaUrl) return { title: 'Unknown Track', artist: '', extension: '' };
  const rawName = originalFileName?.trim() ? originalFileName : (mediaUrl.split('/').pop() ?? '').split('?')[0];
  let name = rawName;
  try {
    name = decodeURIComponent(rawName.replace(/\+/g, ' '));
  } catch {
    /* оставить как есть */
  }
  const ext = name.includes('.') ? name.slice(name.lastIndexOf('.') + 1) : '';
  const base = ext ? name.slice(0, name.lastIndexOf('.')) : name;
  for (const sep of [' - ', ' — ', ' – ']) {
    const i = base.indexOf(sep);
    if (i > 0) {
      const artist = base.slice(0, i).trim();
      const title = base.slice(i + sep.length).trim();
      if (artist && title) return { title, artist, extension: ext };
    }
  }
  const hashy = /^[a-f0-9]{8,}[-_]?[a-f0-9]*$/.test(base) || /^encrypted_\w+_\d+_[a-f0-9]+$/.test(base);
  return !hashy && base.length > 2 ? { title: base.trim(), artist: '', extension: ext } : { title: 'Unknown Track', artist: '', extension: ext };
}
