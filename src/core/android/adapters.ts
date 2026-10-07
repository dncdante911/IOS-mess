/**
 * Ручные Gson-адаптеры Android, которые генератор перенести не может
 * (логика в коде, а не в аннотациях). Импортируется один раз при старте
 * (core/android/index.ts).
 */
import { decodeModel, registerEnumAdapter, registerJsonAdapter } from './gson';
import type { MessageReaction } from './gen/models';

/**
 * data/model/ReactionsListDeserializer.kt
 * Сервер отдаёт реакции СГРУППИРОВАННЫМИ ({emoji,count,user_ids}), а весь
 * Android-конвейер работает с ПЛОСКИМ списком ({user_id, reaction}). Принимаем
 * обе формы, на выходе — плоский список.
 */
registerJsonAdapter('ReactionsListDeserializer', {
  read(json) {
    if (!Array.isArray(json)) return [];
    const out: MessageReaction[] = [];
    const num = (v: unknown): number | null => {
      if (v === null || v === undefined) return null;
      const n = Number(v);
      return Number.isFinite(n) ? Math.trunc(n) : null;
    };
    const str = (v: unknown): string | null => (v === null || v === undefined ? null : String(v));
    for (const el of json) {
      if (!el || typeof el !== 'object' || Array.isArray(el)) continue;
      const o = el as Record<string, unknown>;
      const emoji = str(o.emoji) ?? str(o.reaction);
      if (Array.isArray(o.user_ids)) {
        if (!emoji || !emoji.trim()) continue;
        for (const idEl of o.user_ids) {
          const uid = num(idEl);
          if (uid === null) continue;
          out.push({ id: null, messageId: num(o.message_id) ?? 0, userId: uid, reaction: emoji, createdAt: null });
        }
      } else {
        out.push({
          id: num(o.id),
          messageId: num(o.message_id) ?? 0,
          userId: num(o.user_id) ?? 0,
          reaction: emoji,
          createdAt: str(o.created_at),
        });
      }
    }
    return out;
  },
});

/**
 * data/model/Group.kt → LastMessageDeserializer
 * PHP/Node иногда отдают пустой массив [] вместо null для last_message.
 */
registerJsonAdapter('LastMessageDeserializer', {
  read(json) {
    if (json === null || json === undefined) return null;
    if (Array.isArray(json)) return null;
    if (typeof json === 'object') return decodeModel('Message', json as Record<string, unknown>);
    return null;
  },
});

/**
 * network/NodeRetrofitClient.kt → registerTypeAdapter для enum бэкапа:
 * неизвестное значение откатывается на дефолт, а не превращается в null
 * (null ломал любой .copy() в «Данные и память»).
 */
// Единственный провайдер — личный сервер ("local"); всё прочее тоже откатывается на него.
registerEnumAdapter('BackupProvider', () => 'LOCAL_SERVER');
registerEnumAdapter('BackupFrequency', (v) => {
  const s = String(v).toLowerCase();
  const all = ['NEVER', 'DAILY', 'WEEKLY', 'MONTHLY'];
  return all.find((x) => x.toLowerCase() === s) ?? 'DAILY';
});
