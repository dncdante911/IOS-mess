/**
 * Форматирование времени в списках — порт приватных функций Android:
 *   ModernChatsUI.formatMessageTime / formatGroupTime
 *   TelegramStyleComponents.formatTime
 * Локаль — язык приложения (Android: LanguageManager.applyLanguage делает его Locale.default).
 */
import { getTranslation, useI18nStore } from '../i18n';

const DAY = 24 * 60 * 60 * 1000;

function locale(): string {
  const l = useI18nStore.getState().language;
  return l === 'uk' ? 'uk-UA' : l === 'ru' ? 'ru-RU' : 'en-GB';
}

const hhmm = (d: Date) => `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
const ddmmyy = (d: Date) => `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getFullYear() % 100).padStart(2, '0')}`;

function weekday(d: Date, style: 'long' | 'short'): string {
  try {
    const s = new Intl.DateTimeFormat(locale(), { weekday: style }).format(d);
    // SimpleDateFormat("EEEE") в ru/uk даёт строчную; Intl тоже — оставляем как есть
    return s;
  } catch {
    return ddmmyy(d);
  }
}

/** Секунды или миллисекунды → миллисекунды (сервер иногда шлёт мс). */
function toMs(ts: number): number {
  return ts > 1_000_000_000_000 ? ts : ts * 1000;
}

/** ModernChatCard: сегодня — HH:mm, вчера — «Вчера», < 7 дней — день недели, иначе dd.MM.yy. */
export function formatMessageTime(timestampSec: number): string {
  const d = new Date(timestampSec * 1000);
  const diffDays = Math.trunc((Date.now() - d.getTime()) / DAY);
  if (diffDays === 0) return hhmm(d);
  if (diffDays === 1) return getTranslation('yesterday');
  if (diffDays < 7) return weekday(d, 'long');
  return ddmmyy(d);
}

/** ModernGroupCard (секунды или миллисекунды). */
export function formatGroupTime(timestamp: number): string {
  const d = new Date(toMs(timestamp));
  const diffDays = Math.trunc((Date.now() - d.getTime()) / DAY);
  if (diffDays === 0) return hhmm(d);
  if (diffDays === 1) return getTranslation('yesterday');
  if (diffDays < 7) return weekday(d, 'long');
  return ddmmyy(d);
}

/** TelegramChatItem: «только что», «N мин», HH:mm, «вчера», короткий день недели, dd.MM.yy. */
export function formatTelegramTime(timestamp: number): string {
  const ms = toMs(timestamp);
  const diff = Date.now() - ms;
  const d = new Date(ms);
  if (diff < 60_000) return getTranslation('time_just_now');
  if (diff < 3_600_000) return getTranslation('time_min_short', undefined, [Math.floor(diff / 60_000)]);
  if (diff < 86_400_000) return hhmm(d);
  if (diff < 172_800_000) return getTranslation('time_yesterday');
  if (diff < 604_800_000) return weekday(d, 'short');
  return ddmmyy(d);
}

/** ModernChatCard: был активен < 5 минут назад — считается онлайн. */
export function isRecentlyActive(lastActivitySec: number): boolean {
  return Date.now() / 1000 - lastActivitySec < 300;
}
