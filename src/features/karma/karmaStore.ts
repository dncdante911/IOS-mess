/**
 * Карма — порт логики Android UserProfileViewModel (loadUserRating / rateUser)
 * + клиентское зеркало правил бэкенда routes/users/karma-helper.js.
 *
 * Сервер — источник правды (karma, karma_level, can_reply_to_users,
 * weekly_stars, next_stars_at приходят в UserRating). Константы ниже нужны
 * только для отображения (прогресс до следующего тира Stars, цвета уровней)
 * и должны совпадать с karma-helper.js.
 */
import { create } from 'zustand';
import { NodeRetrofitClient, type M } from '../../core/android';
import { emitToast } from '../../core/platform/events';
import { getTranslation } from '../../i18n';

// ─── Правила (зеркало karma-helper.js) ───────────────────────────────────────
export const KARMA_RESTRICT_THRESHOLD = -100;
export const KARMA_WARN_THRESHOLD = -50;

/** karma → Stars в неделю (тиры по убыванию). */
export const KARMA_STARS_TIERS: ReadonlyArray<{ min: number; stars: number }> = [
  { min: 2000, stars: 25 },
  { min: 1500, stars: 20 },
  { min: 1250, stars: 17 },
  { min: 1000, stars: 15 },
  { min: 850, stars: 12 },
  { min: 600, stars: 10 },
  { min: 450, stars: 7 },
  { min: 250, stars: 5 },
  { min: 100, stars: 3 },
];

export type KarmaLevel = 'ok' | 'warn' | 'restricted';

export function classifyKarma(karma: number): { level: KarmaLevel; canReplyToUsers: boolean } {
  if (karma <= KARMA_RESTRICT_THRESHOLD) return { level: 'restricted', canReplyToUsers: false };
  if (karma <= KARMA_WARN_THRESHOLD) return { level: 'warn', canReplyToUsers: true };
  return { level: 'ok', canReplyToUsers: true };
}

export function weeklyStarsFor(karma: number): number {
  return KARMA_STARS_TIERS.find((t) => karma >= t.min)?.stars ?? 0;
}

/**
 * Прогресс к следующему тиру Stars для карточки кармы: 0..1.
 * Ниже 100 — прогресс от 0 к первому тиру; после 2000 — 1.
 */
export function starsTierProgress(karma: number): { from: number; to: number | null; progress: number } {
  const asc = [...KARMA_STARS_TIERS].reverse();
  const next = asc.find((t) => t.min > karma);
  const prev = [...asc].reverse().find((t) => t.min <= karma);
  const from = prev?.min ?? 0;
  if (!next) return { from, to: null, progress: 1 };
  const span = next.min - from;
  return { from, to: next.min, progress: span > 0 ? Math.max(0, Math.min(1, (karma - from) / span)) : 0 };
}

// ─── Состояние (аналог RatingState) ──────────────────────────────────────────
export type RatingState =
  | { kind: 'loading' }
  | { kind: 'success'; rating: M.UserRating; details?: M.RatingDetail[] }
  | { kind: 'error'; message: string };

interface KarmaStore {
  /** userId → состояние; кэш, чтобы бейджи в списках не грузили повторно. */
  byUser: Record<number, RatingState>;
  /** userId, для которых сейчас идёт голосование (блокирует кнопки). */
  voting: Record<number, boolean>;
  loadUserRating: (userId: number, includeDetails?: boolean) => Promise<void>;
  /** 'like' | 'dislike'. Повтор того же голоса снимает его (toggle на сервере). */
  rateUser: (userId: number, ratingType: 'like' | 'dislike', comment?: string | null) => Promise<boolean>;
  get: (userId: number) => RatingState | undefined;
}

export const useKarmaStore = create<KarmaStore>((set, getState) => ({
  byUser: {},
  voting: {},

  get: (userId) => getState().byUser[userId],

  async loadUserRating(userId, includeDetails = false) {
    if (!getState().byUser[userId]) {
      set((s) => ({ byUser: { ...s.byUser, [userId]: { kind: 'loading' } } }));
    }
    try {
      const r = await NodeRetrofitClient.profileApi.getUserRating(userId, includeDetails ? '1' : '0');
      const state: RatingState =
        r.apiStatus === 200 && r.rating
          ? { kind: 'success', rating: r.rating, details: r.ratingsList ?? undefined }
          : { kind: 'error', message: r.errorMessage ?? getTranslation('unknown_error') };
      set((s) => ({ byUser: { ...s.byUser, [userId]: state } }));
    } catch (e) {
      set((s) => ({
        byUser: {
          ...s.byUser,
          [userId]: { kind: 'error', message: e instanceof Error ? e.message : getTranslation('unknown_error') },
        },
      }));
    }
  },

  async rateUser(userId, ratingType, comment = null) {
    if (getState().voting[userId]) return false;
    set((s) => ({ voting: { ...s.voting, [userId]: true } }));
    try {
      const r = await NodeRetrofitClient.profileApi.rateUser(userId, ratingType, comment);
      if (r.apiStatus === 200 && r.userRating) {
        const prev = getState().byUser[userId];
        set((s) => ({
          byUser: {
            ...s.byUser,
            [userId]: { kind: 'success', rating: r.userRating!, details: prev?.kind === 'success' ? prev.details : undefined },
          },
        }));
        return true;
      }
      // Отказы антиабуза (KARMA_NO_CONTACT, KARMA_TOO_NEW, KARMA_COOLDOWN,
      // KARMA_DAILY_LIMIT) приходят уже локализованными — показываем как есть.
      if (r.errorMessage) emitToast(r.errorMessage, 'error');
      return false;
    } catch {
      emitToast(getTranslation('unknown_error'), 'error');
      return false;
    } finally {
      set((s) => ({ voting: { ...s.voting, [userId]: false } }));
    }
  },
}));
