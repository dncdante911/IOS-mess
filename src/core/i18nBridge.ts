/**
 * Мост между ключами i18n Windows-кода и ключами Android (strings.xml).
 * Перенесённое Windows-ядро вызывает tr('karma.replyBlocked') и т.п. —
 * здесь это сводится к Android-ключам, чтобы текст был 1:1 как на Android.
 */
import { translate, useI18nStore, type Language } from '../i18n';

const WIN_TO_ANDROID: Record<string, string> = {
  'karma.replyBlocked': 'channel_replies_karma_restricted',
  'gw.err.generic': 'unknown_error',
  'call.missed': 'call_log_missed',
  'call.missedVideo': 'call_log_missed_video',
  'call.declined': 'call_log_declined',
  'call.outgoingCall': 'call_log_outgoing',
  'call.incomingCall': 'call_log_incoming',
  'post.preview.poll': 'poll_label',
  'post.preview.media': 'media_label',
  'giveaway.title': 'giveaway_title',
};

export function getLang(): Language {
  return useI18nStore.getState().language;
}

export function t(key: string, params?: Record<string, string | number> | Array<string | number>): string {
  return translate(getLang(), WIN_TO_ANDROID[key] ?? key, params);
}
