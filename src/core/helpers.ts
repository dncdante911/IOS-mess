/**
 * Чистые хелперы из Windows utils/helpers.ts и components/CallBubble.tsx,
 * нужные ядру (api.ts). UI-части (React-компоненты) сюда не переносятся.
 */
import { t } from './i18nBridge';

// ─── Медиа-URL ────────────────────────────────────────────────────────────────
// Все медиа лежат в MinIO S3; сервер отдаёт либо абсолютный URL, либо путь
// относительно worldmates.club (upload/…), который проксируется на MinIO.
export function absMediaUrl(u: string | undefined | null): string {
  if (!u) return '';
  if (
    u.startsWith('http') ||
    u.startsWith('file:') ||
    u.startsWith('content:') ||
    u.startsWith('ph:') ||
    u.startsWith('data:')
  ) {
    return u;
  }
  return `https://worldmates.club/${u.replace(/^\//, '')}`;
}

// ─── Превью поста канала ──────────────────────────────────────────────────────
function markerField(json: string, field: string): string {
  try {
    const v = (JSON.parse(json) as Record<string, unknown>)[field];
    if (typeof v === 'string') return v;
  } catch {
    /* обрезанный payload — пробуем регуляркой */
  }
  const m = json.match(new RegExp(`"${field}"\\s*:\\s*"((?:[^"\\\\]|\\\\.)*)"`));
  if (!m) return '';
  try {
    return JSON.parse(`"${m[1]}"`) as string;
  } catch {
    return m[1];
  }
}

export function postPreviewText(text: string | null | undefined, hasMedia = false, max = 80): string {
  const raw = (text ?? '').trim();
  if (raw.startsWith('__poll__')) {
    const q = markerField(raw.slice('__poll__'.length), 'question');
    return `📊 ${q || t('post.preview.poll')}`.slice(0, max);
  }
  if (raw.startsWith('__giveaway__')) {
    const prize = markerField(raw.slice('__giveaway__'.length), 'prize');
    return `🎁 ${prize || t('giveaway.title')}`.slice(0, max);
  }
  if (raw) return raw.slice(0, max);
  return hasMedia ? `📸 ${t('post.preview.media')}` : '—';
}

// ─── Журнал звонков в чате ────────────────────────────────────────────────────
export interface CallLogPayload {
  callType: 'audio' | 'video';
  status: 'ended' | 'missed' | 'declined';
  duration: number;
}

export function parseCallLog(text: string): CallLogPayload | null {
  if (!text || text[0] !== '{') return null;
  try {
    const p = JSON.parse(text) as Record<string, unknown>;
    if (p.call_log !== true || typeof p.status !== 'string') return null;
    return {
      callType: p.callType === 'video' ? 'video' : 'audio',
      status: (['ended', 'missed', 'declined'].includes(String(p.status))
        ? p.status
        : 'ended') as CallLogPayload['status'],
      duration: Number(p.duration ?? 0),
    };
  } catch {
    return null;
  }
}

export function fmtCallDuration(secs: number): string {
  const s = Math.max(0, Math.floor(secs));
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  const two = (n: number) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${two(m % 60)}:${two(s % 60)}` : `${m}:${two(s % 60)}`;
}

export function callLogPreview(p: CallLogPayload, isOwn: boolean): string {
  if (p.status === 'missed') return p.callType === 'video' ? t('call.missedVideo') : t('call.missed');
  if (p.status === 'declined') return t('call.declined');
  const label = isOwn ? t('call.outgoingCall') : t('call.incomingCall');
  return p.duration > 0 ? `${label} · ${fmtCallDuration(p.duration)}` : label;
}
