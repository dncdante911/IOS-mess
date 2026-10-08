/**
 * Вычисляемые свойства Kotlin-моделей (`val x get() = …`), которые генератор
 * не переносит (это код, а не поля JSON). Порт 1:1 — те же имена, что в Android,
 * только как функции от модели: Kotlin `resp.groups` → `groupsOf(resp)`.
 *
 * Источники: data/model/{Group,Channel,Story,CallHistory,Bot,BackupModels,
 * CloudBackupSettings}.kt, network/NodeProfileApi.kt.
 */
import type * as M from './gen/models';

const blank = (s: string | null | undefined): boolean => s == null || s.trim() === '';

/** Group.kt: `_apiStatus: Any?` → Number→int, String→toIntOrNull ?: 400, иначе 400. */
export function apiStatusOf(r: { _apiStatus: unknown }): number {
  return parseStatus(r._apiStatus, 400);
}

/** CallHistory.kt: `apiStatusRaw: Any?` → то же, но запасное значение 0. */
export function callApiStatusOf(r: { apiStatusRaw: unknown }): number {
  return parseStatus(r.apiStatusRaw, 0);
}

function parseStatus(v: unknown, fallback: number): number {
  if (typeof v === 'number') return Math.trunc(v);
  if (typeof v === 'string' && /^[+-]?\d+$/.test(v.trim())) return parseInt(v.trim(), 10);
  return fallback;
}

export const isCallResponseSuccess = (r: { apiStatusRaw: unknown }): boolean => callApiStatusOf(r) === 200;

// ─── Списки (`_x ?: _data`) ──────────────────────────────────────────────────

export const channelsOf = (r: M.ChannelListResponse): M.Channel[] | null => r._channels ?? r._data;
export const groupsOf = (r: M.GroupListResponse): M.Group[] | null => r._groups ?? r._data;

// ─── Story ───────────────────────────────────────────────────────────────────

export const StoryX = {
  mediaItems: (s: M.Story): M.StoryMedia[] => s.apiMediaItems ?? [...(s.images ?? []), ...(s.videos ?? [])],
  seen: (s: M.Story): boolean => s.isViewed === 1,
  viewsCount: (s: M.Story): number => s.viewCount,
  commentsCount: (s: M.Story): number => s.commentCount,
  reactions: (s: M.Story): M.StoryReactions =>
    s.reaction ?? { like: 0, love: 0, haha: 0, wow: 0, sad: 0, angry: 0, isReacted: false, type: null },
  time: (s: M.Story): number => s.posted,
  isChannelStory: (s: M.Story): boolean => s.pageId != null && s.pageId > 0,
  /** Story.isExpired(): истекла по серверному expire (unix-секунды). */
  isExpired: (s: M.Story): boolean => Math.floor(Date.now() / 1000) > s.expire,
};

/** StoryUser.getFullName() / StoryViewer.name / UserMediaPartner.displayName */
export function fullNameOf(u: { firstName: string | null; lastName: string | null; username: string }): string {
  if (!blank(u.firstName) && !blank(u.lastName)) return `${u.firstName} ${u.lastName}`;
  if (!blank(u.firstName)) return u.firstName as string;
  return u.username;
}

export const storyReactionsTotal = (r: M.StoryReactions): number => r.like + r.love + r.haha + r.wow + r.sad + r.angry;
export const storyPollTotalVotes = (p: M.StoryPoll): number => p.options.reduce((sum, o) => sum + o.votes, 0);

// ─── Звонки ──────────────────────────────────────────────────────────────────

export const CallHistoryX = {
  isVideoCall: (c: M.CallHistoryItem) => c.callType === 'video',
  isGroupCall: (c: M.CallHistoryItem) => c.callCategory === 'group',
  isIncoming: (c: M.CallHistoryItem) => c.direction === 'incoming',
  isOutgoing: (c: M.CallHistoryItem) => c.direction === 'outgoing',
  isMissed: (c: M.CallHistoryItem) => c.status === 'missed' || c.status === 'rejected',
  isConnected: (c: M.CallHistoryItem) => c.status === 'connected' || c.status === 'ended',
  avatarUrl: (c: M.CallHistoryItem): string | null => (c.callCategory === 'group' ? c.groupData?.avatar ?? null : c.otherUser?.avatar ?? null),
};

export const callUserDisplayName = (u: M.CallUser): string => (blank(u.name) ? u.username : u.name);
export const callUserIsVerified = (u: M.CallUser): boolean => u.verified === 1;

// ─── Боты ────────────────────────────────────────────────────────────────────

export const BotX = {
  isVerified: (b: M.Bot) => b.botType === 'verified',
  isSystem: (b: M.Bot) => b.botType === 'system',
  isActive: (b: M.Bot) => b.status === 'active',
  hasMiniApp: (b: M.Bot) => !blank(b.webAppUrl),
};

export function botButtonType(b: M.BotInlineButton): M.BotButtonType {
  if (b.webApp != null) return 'WEB_APP';
  if (b.url != null) return 'URL';
  return 'CALLBACK';
}

export const rssFeedIsEnabled = (f: M.RssFeed): boolean => f.isActive === 1;
export const rssFeedDisplayName = (f: M.RssFeed): string => f.feedName ?? f.feedUrl.replace(/^https:\/\//, '').replace(/^http:\/\//, '').slice(0, 40);
export const broadcastIsCritical = (b: M.BotBroadcastItem): boolean => b.alertPriority === 'critical';
export const broadcastIsClear = (b: M.BotBroadcastItem): boolean => b.alertType === 'clear';

// ─── Прочее ──────────────────────────────────────────────────────────────────

export const channelBanIsPermanent = (b: M.ChannelBannedMember): boolean => b.expireTime === 0;
export const backupProgressPercent = (p: M.BackupProgress): number => (p.totalSteps > 0 ? (p.currentStepNumber / p.totalSteps) * 100 : 0);
export const syncProgressPercent = (p: M.SyncProgress): number => (p.totalItems > 0 ? (p.currentItem / p.totalItems) * 100 : 0);
