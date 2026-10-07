/**
 * WorldMates API client — Node.js REST API only (port 449).
 *
 * Mirrors the Kotlin/Android client exactly:
 *   - All POST requests are application/x-www-form-urlencoded  (@FormUrlEncoded)
 *   - Auth header: "access-token: <token>"
 *   - No PHP API, no Windows API fallbacks
 */

import type {
  AuthResponse,
  BlogCategory,
  BlogPost,
  BlogPostDetail,
  BotItem,
  CallHistoryItem,
  ChannelComment,
  ChannelItem,
  ChannelPoll,
  ChannelPost,
  ChannelPostsResponse,
  ChatItem,
  ChatListResponse,
  GenericListResponse,
  GifItem,
  GiveawayRef,
  GiveawayState,
  GiveawayTarget,
  GroupItem,
  MediaUploadResponse,
  MessageItem,
  MessageReaction,
  MessagesResponse,
  PollOption,
  PostButton,
  PrivacySettings,
  Sticker,
  StickerPack,
  StoryItem,
  UserRating,
  VideoQuality,
  ProfileShowcase,
  ShowcaseChannelOption,
} from './types';
import type { NodeApiShim, PreKeyBundle } from './signalTypes';
import { parseCallLog, callLogPreview } from './helpers';

// ─── RN-порт ──────────────────────────────────────────────────────────────────
// АВТОГЕНЕРАЦИЯ: scripts/port-windows-api.mjs из windows-messenger/src/api.ts.
// Руками не править — правки вносить в скрипт. Отличия от оригинала:
//   • Electron IPC (window.desktopApp) убран — только fetch
//   • File/Blob — это UploadFile { uri, name, type } (RN FormData стримит с диска)
//   • URLSearchParams в RN неполный → buildForm кодирует вручную
//   • window.dispatchEvent('wm-toast') → emitToast()
//   • 401 → одна попытка обновить токен через setTokenRefresher() и повтор
// Сигнатуры функций сохранены, чтобы перенос экранов с Windows шёл 1:1.
import type { File, Blob } from './platform/files';
import { appendFile } from './platform/files';
import { emitToast } from './platform/events';
import {
  getOrCreateDeviceFingerprint as getLoginDeviceId,
  getDeviceLabel as getDeviceLabelSync,
} from '../services/deviceService';

async function getDeviceLabel(): Promise<string> {
  return getDeviceLabelSync();
}

/** Конфиг ICE-сервера (структура как у WebRTC RTCIceServer). */
export interface RTCIceServer {
  urls: string | string[];
  username?: string;
  credential?: string;
}

// ─── Config ───────────────────────────────────────────────────────────────────

import { serverFailover } from './serverFailover';
import { getLang, t as tr } from './i18nBridge';
import { absMediaUrl, postPreviewText } from './helpers';

export const NODE_BASE_URL        = 'https://worldmates.club:449';
export const SOCKET_URL           = 'https://worldmates.club:449/';

/** Returns the Node.js base URL of the currently active server (follows failover). */
export function getActiveNodeBaseUrl(): string {
  return serverFailover.nodeBaseUrl.replace(/\/$/, ''); // strip trailing slash
}
export const REGISTER_PATH        = '';
export const WINDOWS_APP_BASE_URL = '';
// Fetched from server at runtime — never hardcode in source
export let SITE_ENCRYPT_KEY       = '';
export const SERVER_KEY           = '';

export async function fetchSiteEncryptKey(token: string): Promise<void> {
  try {
    const text = await doRequest(`${NODE_BASE_URL}/api/site-key`, {
      method: 'GET',
      headers: { 'access-token': token } as any,
    });
    const data = JSON.parse(text);
    if (data?.key) SITE_ENCRYPT_KEY = data.key;
  } catch { /* server may not support this endpoint yet — no-op */ }
}

export const TURN_FALLBACK: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
  { urls: 'stun:stun3.l.google.com:19302' },
];

/**
 * Fetch TURN/STUN ICE servers from the server, which mints time-limited
 * credentials. The coturn static-auth-secret is intentionally NOT embedded in
 * the client (a desktop app secret is trivially extractable). Falls back to
 * STUN-only (TURN_FALLBACK) if the server is unreachable.
 *
 * Name/signature preserved so existing callers (App.tsx) stay unchanged.
 */
export async function createTurnIceServers(userId: number, token: string): Promise<RTCIceServer[]> {
  try {
    // The server only mints TURN credentials for an authenticated session.
    const text = await doRequest(`${NODE_BASE_URL}/api/ice-servers/${userId}`, {
      method: 'GET',
      headers: { 'access-token': token } as any,
    });
    const payload = await parseJson<{ iceServers?: RTCIceServer[] } | RTCIceServer[]>(text);
    const servers = Array.isArray(payload) ? payload : (payload.iceServers ?? []);
    if (servers.length > 0) return servers;
    // Server returned empty — warn user that calls may fail behind NAT
    _warnNoTurn();
    return TURN_FALLBACK;
  } catch {
    _warnNoTurn();
    return TURN_FALLBACK;
  }
}

let _turnWarned = false;
function _warnNoTurn(): void {
  if (_turnWarned) return;
  _turnWarned = true;
  emitToast('TURN server unavailable — calls may fail behind NAT', 'warning');
}

// ─── HTTP helpers ─────────────────────────────────────────────────────────────

export class AuthError extends Error {
  constructor() { super('HTTP 401'); this.name = 'AuthError'; }
}

/**
 * Thrown for any non-2xx API response. Carries the backend's `error_code`
 * (when present) so callers can react to a SPECIFIC failure — e.g.
 * "KARMA_RESTRICTED" — instead of only having a human-readable message
 * string to (fragilely) pattern-match against.
 */
export class ApiError extends Error {
  status: number;
  code?: string;
  constructor(status: number, message: string, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

function applyFailoverUrl(url: string): string {
  const active = serverFailover.nodeBaseUrl.replace(/\/$/, '');
  if (active === NODE_BASE_URL) return url;
  return url.startsWith(NODE_BASE_URL) ? active + url.slice(NODE_BASE_URL.length) : url;
}

// ─── Обновление токена при 401 (порт Android TokenRefreshInterceptor) ────────
// Регистрирует authStore при старте. Возвращает новый access-token или null.
type TokenRefresher = () => Promise<string | null>;
let tokenRefresher: TokenRefresher | null = null;
let refreshInFlight: Promise<string | null> | null = null;

export function setTokenRefresher(fn: TokenRefresher | null): void {
  tokenRefresher = fn;
}

async function refreshTokenOnce(): Promise<string | null> {
  if (!tokenRefresher) return null;
  if (!refreshInFlight) {
    refreshInFlight = tokenRefresher().finally(() => {
      refreshInFlight = null;
    });
  }
  return refreshInFlight;
}

const REFRESH_SKIP = /\/api\/node\/auth\/(login|refresh|register|quick-register|quick-verify|verify-code|send-code|request-password-reset|reset-password)/;

function errorFromBody(status: number, text: string): ApiError {
  let detail = '';
  let code: string | undefined;
  try {
    const parsed = JSON.parse(text);
    detail = parsed?.error_message || '';
    code = parsed?.error_code || undefined;
  } catch {
    detail = text.slice(0, 200);
  }
  return new ApiError(status, detail ? `HTTP ${status}: ${detail}` : `HTTP ${status}`, code);
}

interface RnRequestInit {
  method?: string;
  headers?: Record<string, string>;
  body?: string | FormData;
}

async function doRequest(url: string, options: RnRequestInit, retried = false): Promise<string> {
  const finalUrl = applyFailoverUrl(url);
  const headers: Record<string, string> = { ...(options.headers ?? {}) };
  headers['Accept-Language'] = getLang();
  const res = await fetch(finalUrl, { method: options.method ?? 'GET', headers, body: options.body as any });
  const text = await res.text();

  if (res.status === 401) {
    if (!retried && headers['access-token'] && !REFRESH_SKIP.test(finalUrl)) {
      const fresh = await refreshTokenOnce();
      if (fresh) {
        return doRequest(url, { ...options, headers: { ...(options.headers ?? {}), 'access-token': fresh } }, true);
      }
    }
    throw new AuthError();
  }
  if (!res.ok) throw errorFromBody(res.status, text);
  return text;
}

// Загрузка multipart/form-data. `fieldName` по умолчанию 'file' — совпадает с
// multer-полем всех эндпоинтов, кроме channel/upload-avatar ('avatar').
// Файл уходит в MinIO S3 через бэкенд; RN стримит его с диска по uri.
async function doUpload(
  url: string,
  token: string,
  fields: Record<string, string>,
  file: File,
  fieldName: string = 'file',
  extraFiles: Array<{ fieldName: string; file: File }> = [],
): Promise<string> {
  const form = new FormData();
  for (const [k, v] of Object.entries(fields)) form.append(k, v);
  appendFile(form, fieldName, file);
  for (const extra of extraFiles) appendFile(form, extra.fieldName, extra.file);
  return doRequest(url, { method: 'POST', headers: { 'access-token': token }, body: form });
}

// На Windows большие файлы шли отдельным путём через main-процесс. В RN
// FormData и так стримит с диска — отдельная ветка не нужна.
const LARGE_FILE_THRESHOLD = 50 * 1024 * 1024; // 50 MB

async function doUploadLarge(
  url: string,
  token: string,
  fields: Record<string, string>,
  file: File,
): Promise<string> {
  return doUpload(url, token, fields, file);
}

async function parseJson<T>(text: string): Promise<T> {
  try { return JSON.parse(text) as T; }
  catch { throw new Error(`Non-JSON response: ${text.slice(0, 200)}`); }
}

// ─── Node.js API helpers (form-encoded, matching Kotlin @FormUrlEncoded) ──────

// URLSearchParams в React Native реализован не полностью (set/append падают) —
// из-за этого однажды сломался вход. Кодируем вручную.
function buildForm(data: Record<string, unknown>): string {
  const parts: string[] = [];
  const enc = (k: string, v: unknown) =>
    parts.push(`${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`);
  for (const [k, v] of Object.entries(data)) {
    if (v === undefined || v === null) continue;
    if (Array.isArray(v)) {
      // `key[]=1&key[]=2` → req.body.key = ['1','2'] (qs на бэкенде)
      for (const item of v) enc(`${k}[]`, item);
    } else {
      enc(k, v);
    }
  }
  return parts.join('&');
}

async function nodePost<T>(path: string, token: string, data: Record<string, unknown>): Promise<T> {
  const text = await doRequest(`${NODE_BASE_URL}${path}`, {
    method:  'POST',
    headers: { 'access-token': token, 'Content-Type': 'application/x-www-form-urlencoded' },
    body:    buildForm(data)
  });
  return parseJson<T>(text);
}

async function nodeGet<T>(path: string, token: string): Promise<T> {
  const text = await doRequest(`${NODE_BASE_URL}${path}`, {
    method:  'GET',
    headers: { 'access-token': token }
  });
  return parseJson<T>(text);
}

async function nodePut<T>(path: string, token: string, data: Record<string, unknown>): Promise<T> {
  const text = await doRequest(`${NODE_BASE_URL}${path}`, {
    method:  'PUT',
    headers: { 'access-token': token, 'Content-Type': 'application/x-www-form-urlencoded' },
    body:    buildForm(data)
  });
  return parseJson<T>(text);
}

/** JSON-body POST/GET helper — routes through Electron IPC. Use for endpoints that expect application/json. */
export async function nodeApiRequest<T = unknown>(
  path: string,
  token: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  jsonBody?: unknown,
): Promise<T> {
  const headers: Record<string, string> = { 'access-token': token };
  let body: string | undefined;
  if (jsonBody !== undefined) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(jsonBody);
  }
  const text = await doRequest(`${NODE_BASE_URL}${path}`, { method, headers, body });
  return parseJson<T>(text);
}

async function nodeDelete<T>(path: string, token: string): Promise<T> {
  const text = await doRequest(`${NODE_BASE_URL}${path}`, {
    method:  'DELETE',
    headers: { 'access-token': token }
  });
  return parseJson<T>(text);
}

// ─── Native Ads API (promoted channels) ───────────────────────────────────────
export type AdPlacement = 'channel_feed' | 'story';
export type AdPricing   = 'cpm' | 'cpc';
export type AdStatus    = 'draft' | 'pending' | 'active' | 'paused' | 'ended' | 'rejected';

export interface AdCampaign {
  id: number;
  channel_id: number;
  owner_user_id: number;
  title: string;
  pitch: string;
  media_url?: string | null;
  cta_label?: string | null;
  placement: AdPlacement;
  pricing: AdPricing;
  bid_stars: number;
  budget_stars: number;
  spent_stars: number;
  target_langs?: string | null;
  target_categories?: string | null;
  status: AdStatus;
  moderation_note?: string | null;
  start_at?: string | null;
  end_at?: string | null;
  created_at?: string;
  updated_at?: string;
}
export interface AdWallet { balance: number; total_topup: number; total_spent: number; total_earned: number; }
export interface AdWalletTxn { id: number; kind: string; amount: number; balance_after: number; campaign_id?: number | null; note?: string | null; created_at: string; }
export interface AdPromotableChannel { channel_id: number; name: string; title: string; avatar?: string; }
export interface AdStatsDaily { day: string; impressions: number; clicks: number; subscribes: number; spend_stars: number; }
export interface AdCampaignStats {
  campaign: AdCampaign;
  totals: { impressions: number; clicks: number; subscribes: number; spend_stars: number; ctr: number };
  series: AdStatsDaily[];
}
export interface AdServeItem {
  campaign_id: number; channel_id: number; channel_name: string; channel_title: string;
  channel_avatar?: string; title: string; pitch: string; media_url?: string | null;
  cta_label?: string | null; placement: AdPlacement;
}

export async function adGetWallet(token: string) {
  return nodeGet<{ api_status: number; wallet: AdWallet; stars_balance: number; transactions: AdWalletTxn[] }>('/api/node/ads/wallet', token);
}
export async function adTopupWallet(token: string, amount: number) {
  return nodePost<{ api_status: number; balance?: number; stars_balance?: number; error_message?: string }>('/api/node/ads/wallet/topup', token, { amount });
}
export async function adGetChannels(token: string) {
  return nodeGet<{ api_status: number; channels: AdPromotableChannel[] }>('/api/node/ads/channels', token);
}
export async function adGetCampaigns(token: string, channelId?: number) {
  const q = channelId ? `?channel_id=${channelId}` : '';
  return nodeGet<{ api_status: number; campaigns: AdCampaign[] }>(`/api/node/ads/campaigns${q}`, token);
}
export async function adCreateCampaign(token: string, data: Record<string, unknown>) {
  return nodePost<{ api_status: number; campaign?: AdCampaign; error_message?: string; min_budget_stars?: number }>('/api/node/ads/campaigns', token, data);
}
export async function adUpdateCampaign(token: string, id: number, data: Record<string, unknown>) {
  return nodePut<{ api_status: number; campaign?: AdCampaign; error_message?: string }>(`/api/node/ads/campaigns/${id}`, token, data);
}
export async function adCampaignAction(token: string, id: number, action: 'submit' | 'pause' | 'resume' | 'archive') {
  return nodePost<{ api_status: number; status?: AdStatus; error_message?: string }>(`/api/node/ads/campaigns/${id}/status`, token, { action });
}
export async function adGetCampaignStats(token: string, id: number, days = 14) {
  return nodeGet<{ api_status: number } & AdCampaignStats>(`/api/node/ads/campaigns/${id}/stats?days=${days}`, token);
}
export async function adServe(token: string, placement: AdPlacement, opts: { channelId?: number; lang?: string; limit?: number } = {}) {
  const p = new URLSearchParams({ placement });
  if (opts.channelId) p.set('channel_id', String(opts.channelId));
  if (opts.lang) p.set('lang', opts.lang);
  if (opts.limit) p.set('limit', String(opts.limit));
  // Always request preview; the server honours it only for super-admins so the
  // platform owner can QA ad rendering. Regular users get the normal gating.
  p.set('preview', '1');
  return nodeGet<{ api_status: number; ads: AdServeItem[] }>(`/api/node/ads/serve?${p.toString()}`, token);
}
export async function adTrackEvent(token: string, campaignId: number, kind: 'impression' | 'click' | 'subscribe') {
  return nodePost<{ api_status: number; charged: number }>('/api/node/ads/event', token, { campaign_id: campaignId, kind });
}

// ── Super-admin ──
export interface AdSettings {
  ads_enabled: number; platform_commission_pct: number; cpm_stars: number; cpc_stars: number;
  freq_cap_per_day: number; min_budget_stars: number; auto_approve: number;
  auto_approve_min_subs?: number; auto_approve_verified?: number; banned_keywords?: string | null;
}
export interface AdModerationItem extends AdCampaign {
  channel_name?: string; channel_title?: string; channel_avatar?: string;
}
export interface AdOverview {
  totals: { platform_stars: number; gross_stars: number; charges: number };
  counts: { active_campaigns: number; pending_campaigns: number };
  series: { day: string; platform_stars: number; gross_stars: number }[];
  top_campaigns: { id: number; title: string; channel_title: string; revenue: number }[];
}
export async function adAdminGetModeration(token: string) {
  return nodeGet<{ api_status: number; campaigns: AdModerationItem[] }>('/api/node/ads/admin/moderation', token);
}
export async function adAdminModerate(token: string, id: number, action: 'approve' | 'reject', note?: string) {
  return nodePost<{ api_status: number; status?: string; error_message?: string }>(`/api/node/ads/admin/moderation/${id}`, token, { action, note: note ?? '' });
}
export async function adAdminGetSettings(token: string) {
  return nodeGet<{ api_status: number; settings: AdSettings }>('/api/node/ads/admin/settings', token);
}
export async function adAdminSaveSettings(token: string, data: Record<string, unknown>) {
  return nodePut<{ api_status: number; settings?: AdSettings; error_message?: string }>('/api/node/ads/admin/settings', token, data);
}
export async function adAdminOverview(token: string, days = 14) {
  return nodeGet<{ api_status: number } & AdOverview>(`/api/node/ads/admin/overview?days=${days}`, token);
}

// ─── Normalizers ──────────────────────────────────────────────────────────────

function toStr(v: unknown, fb = ''): string {
  if (v == null) return fb;
  if (typeof v === 'string') return v;
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  if (typeof v === 'object') return String((v as Record<string, unknown>).text ?? fb);
  return fb;
}

function normaliseAuth(p: Record<string, unknown>): AuthResponse {
  return {
    api_status:   String(p.api_status ?? ''),
    access_token: p.access_token as string | undefined,
    user_id:      p.user_id ? Number(p.user_id) : undefined,
    username:     p.username as string | undefined,
    avatar:       p.avatar as string | undefined,
    message:      toStr(p.message ?? p.error_message ?? p.messages),
    success_type: p.success_type as string | undefined,
    error_code:   p.error_code ? Number(p.error_code) : undefined,
    errors:       p.errors ? { error_text: (p.errors as any)?.error_text } : undefined,
    verification_required: p.verification_required === true || p.verification_required === 'true' || undefined,
    verification_id:        p.verification_id as string | undefined,
    delivery_channel:        p.delivery_channel as AuthResponse['delivery_channel'],
    email_masked:            p.email_masked as string | undefined,
    phone_masked:            p.phone_masked as string | undefined,
    error_id:                p.error_id as AuthResponse['error_id'],
    pending_deletion:        p.pending_deletion === true,
    purge_at:                p.purge_at ? Number(p.purge_at) : undefined,
    days_left:                p.days_left !== undefined ? Number(p.days_left) : undefined,
  };
}

/**
 * Normalise a single raw message object.
 * For Signal (cipher_version=3) the server stores the ciphertext in the `text`
 * field, so we move it to `text_encrypted` and clear `text` so the UI doesn't
 * show the raw base64 blob.
 * Also handles alternate socket-event field names (sender_id, recipient_id, …).
 * Exported so App.tsx can normalise real-time socket events the same way.
 */
/**
 * Giveaway card reference: `{id, prize, result}`. Groups store it as JSON in
 * the message's `stickers` column (type_two = 'giveaway'); channel posts get
 * it as a ready object in the `giveaway` field. Accepts either shape.
 */
export function parseGiveawayRef(raw: unknown): GiveawayRef | undefined {
  let v: unknown = raw;
  if (typeof v === 'string') {
    const s = v.startsWith('__giveaway__') ? v.slice('__giveaway__'.length) : v;
    try { v = JSON.parse(s); } catch { return undefined; }
  }
  if (!v || typeof v !== 'object') return undefined;
  const o = v as Record<string, unknown>;
  const id = Number(o.id ?? o.giveaway_id ?? 0);
  if (!id) return undefined;
  return { id, prize: toStr(o.prize, ''), result: Boolean(o.result) };
}

export function normaliseMessage(m: Record<string, unknown>): MessageItem {
  // Giveaway cards reuse the `stickers` column for their JSON reference —
  // it must never reach the sticker/media pipeline as a URL.
  const giveaway = toStr(m.type_two, '') === 'giveaway' ? parseGiveawayRef(m.stickers) : undefined;
  if (giveaway) m = { ...m, stickers: undefined, media: undefined, media_type: undefined };
  // cipher_version may come as number or string; also check alternate field name
  const cipherV   = m.cipher_version
    ? Number(m.cipher_version)
    : m.encryption_version
      ? Number(m.encryption_version)
      : undefined;
  const rawText   = toStr(m.decrypted_text ?? m.text ?? m.or_text, '');
  // Treat as E2EE if cipher_version=3 (DR) or 6 (Static X3DH), or Signal-specific fields present
  const isSignal  = cipherV === 3 || cipherV === 6
    || (!cipherV && Boolean(m.iv && m.tag && m.signal_header))
    || Boolean(m.is_encrypted && m.iv && m.tag);
  // Group E2EE messages have cipher_version=4 or 5 (Sender Key)
  const isGroupE2EE = cipherV === 4 || cipherV === 5;
  // AES-256-GCM server-side encryption — client must decrypt, not display raw
  const isGCM = cipherV === 2;
  const effectiveCV = isSignal ? (cipherV === 6 ? 6 : 3) : cipherV;

  return {
    id:             Number(m.id ?? m.message_id),
    from_id:        Number(m.from_id ?? m.sender_id),
    to_id:          Number(m.to_id   ?? m.recipient_id ?? m.receiver_id),
    // Server message-subtype tag (e.g. 'call_log', 'group_call', 'contact').
    // Needed so the renderer can show call-log / system bubbles instead of text.
    type_two:       m.type_two ? toStr(m.type_two) : undefined,
    giveaway,
    // For Signal, Group E2EE, and GCM: rawText is ciphertext — hide it from display
    text:           (isSignal || isGroupE2EE || isGCM) ? '' : rawText,
    time_text:      toStr(m.time_text ?? m.time, ''),
    time:           m.time ? Number(m.time) : undefined,
    // `stickers` field is used by backend for sticker/gif URLs; `media` for uploaded files
    media:          m.media ? toStr(m.media) : (m.stickers ? toStr(m.stickers) : undefined),
    // Server may use `type` field (not `media_type`) for voice/image/video/audio messages.
    // `type` is prefixed with position, e.g. 'right_sticker', 'left_gif'.
    media_type:     (() => {
      // Animated emoji are Noto GIFs (fonts.gstatic.com/s/e/notoemoji/…) —
      // always a sticker, no matter which field or media_type the server used.
      const anyUrl = toStr(m.media ?? m.stickers, '').split('?')[0].toLowerCase();
      if (anyUrl.includes('notoemoji')) return 'sticker';
      // Sticker/animated-emoji/GIF messages travel in the `stickers` field —
      // never render them as full-size photos regardless of server media_type.
      if (!m.media && m.stickers) {
        const sUrl = toStr(m.stickers, '').split('?')[0].toLowerCase();
        return /\.gif$/.test(sUrl) ? 'gif' : 'sticker';
      }
      const mt = toStr(m.media_type, '').toLowerCase();
      if (mt) {
        // Normalise server aliases → canonical client types
        if (mt === 'photo') return 'image';
        if (mt === 'animation' || mt === 'animated_gif' || mt === 'animated') return 'gif';
        if (mt === 'sticker' || mt === 'gif' || mt === 'image' || mt === 'video' || mt === 'audio' || mt === 'voice' || mt === 'video_note') return mt as MessageItem['media_type'];
        // 'file'/'document' — fall through to URL-based inference below
        if (mt !== 'file' && mt !== 'document') return mt as MessageItem['media_type'];
      }
      // /chat/get and the send-media socket payload never set `media_type` —
      // they only expose the raw DB subtype via `type_two` (resolveType() in
      // messages.js has no 'video_note' branch, so the position-prefixed
      // `type` field collapses video notes to generic 'file'/'video'). Read
      // type_two directly so round video messages survive a reload.
      const tt = toStr(m.type_two, '').toLowerCase();
      if (tt === 'voice' || tt === 'audio' || tt === 'video' || tt === 'video_note' || tt === 'image') return tt as MessageItem['media_type'];
      const t = toStr(m.type, '').toLowerCase();
      if (t.includes('sticker')) return 'sticker';
      if (t.includes('gif'))     return 'gif';
      if (t.includes('photo') || t.includes('image')) return 'image';
      if (['video','audio','voice'].includes(t)) return t as MessageItem['media_type'];
      // Last resort: infer from the media URL extension
      const rawUrl = toStr(m.media ?? m.stickers, '');
      if (rawUrl) {
        const urlPath = rawUrl.split('?')[0].toLowerCase();
        if (/\.(jpg|jpeg|png|webp)$/.test(urlPath)) return 'image';
        if (/\.gif$/.test(urlPath)) return 'gif';
        if (/\.tgs(\.webp)?$/.test(urlPath)) return 'sticker';
        if (/\.(mp4|webm|mov|mkv|m4v|avi)$/.test(urlPath)) return 'video';
        if (/\.(mp3|ogg|m4a|aac|opus|flac|wav)$/.test(urlPath)) return 'audio';
      }
      return undefined;
    })(),
    // messages.js's buildMessage() returns camelCase `mediaFileName`; other
    // endpoints (send-media response, uploads) use snake_case `media_file_name`.
    media_filename: (m.media_file_name ?? m.mediaFileName) as string | undefined,
    reply_to:       m.reply as MessageItem['reply_to'],
    reactions:      m.reactions as MessageItem['reactions'],
    is_edited:      Boolean(m.is_edited),
    is_seen:        Boolean(m.is_read ?? m.seen ?? m.is_seen),
    cipher_version: effectiveCV,
    // Signal ciphertext: may be in 'text_encrypted' (old format) or 'text' (Kotlin)
    // GCM (cv=2): rawText holds the base64 ciphertext — store it for decryption
    text_encrypted: (isSignal || isGroupE2EE)
      ? (m.text_encrypted as string | undefined ?? rawText) || undefined
      : isGCM
        ? rawText || undefined
        : undefined,
    iv:             m.iv as string | undefined,
    tag:            m.tag as string | undefined,
    signal_header:  m.signal_header as string | undefined,
    bot_id:         m.bot_id ? toStr(m.bot_id) : undefined,
    reply_markup:   (() => {
      const rm = m.reply_markup;
      if (!rm) return undefined;
      if (typeof rm === 'string') {
        try { return JSON.parse(rm) as MessageItem['reply_markup']; } catch { return undefined; }
      }
      return rm as MessageItem['reply_markup'];
    })(),
  };
}

function normaliseMessages(payload: Record<string, unknown>): MessagesResponse {
  const arr = (payload.messages ?? []) as Record<string, unknown>[];
  return {
    api_status: String(payload.api_status ?? '200'),
    messages:   Array.isArray(arr) ? arr.map(normaliseMessage) : []
  };
}

/** Extract last-message preview from the chat list item's last_message (object or string). */
function lastMsgPreview(raw: unknown): string {
  if (!raw) return '';
  if (typeof raw === 'object') {
    const m  = raw as Record<string, unknown>;
    // 1:1 call-log — readable label instead of the raw JSON payload.
    if (m.type_two === 'call_log') {
      const log = parseCallLog(toStr(m.text, ''));
      if (log) return callLogPreview(log, m.position === 'right');
    }
    // Giveaway card — stickers holds {id,prize,result}, text is empty.
    if (m.type_two === 'giveaway') {
      const ref = parseGiveawayRef(m.stickers);
      return postPreviewText(ref ? '__giveaway__' + JSON.stringify(ref) : '__giveaway__');
    }
    const cv = m.cipher_version ? Number(m.cipher_version) : 0;
    // Signal/GCM encrypted — return empty; UI shows a translated placeholder
    if (cv === 3 || cv === 6 || cv === 2) return '';
    return toStr(m.decrypted_text ?? m.text, '');
  }
  // Raw string from server: if it looks like a base64 ciphertext return empty
  const s = toStr(raw, '');
  if (s.length > 30 && !/\s/.test(s) && /^[A-Za-z0-9+/=]+$/.test(s)) return '';
  return s;
}

function normaliseChatItem(m: Record<string, unknown>): ChatItem {
  const nameStr = toStr(
    m.name ?? m.username ?? `${m.first_name ?? ''} ${m.last_name ?? ''}`.trim(),
    'User'
  );
  return {
    user_id:      Number(m.user_id ?? m.id),
    name:         nameStr,
    avatar:       m.avatar as string | undefined,
    last_message: lastMsgPreview(m.last_message),
    time:         m.last_activity ? String(m.last_activity) : toStr(m.lastseen ?? m.time, ''),
    is_bot:       Boolean(m.is_bot ?? m.bot ?? false),
    // The chat list always sent these (message_count = unread, mute = the
    // per-chat Wo_Mute row) but they were never read: unread badges only
    // counted messages that arrived after launch, and pin/mute reset on restart.
    ...(m.message_count != null || m.unread_count != null ? { unread_count: Number(m.unread_count ?? m.message_count) || 0 } : {}),
    ...(m.is_online != null ? { is_online: Boolean(m.is_online) } : {}),
    ...(m.mute && typeof m.mute === 'object' ? {
      is_pinned: (m.mute as Record<string, unknown>).pin === 'yes',
      is_muted:  (m.mute as Record<string, unknown>).notify === 'no',
    } : {}),
  };
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export async function login(username: string, password: string): Promise<AuthResponse> {
  const [deviceFingerprint, deviceLabel] = await Promise.all([
    getLoginDeviceId(),
    getDeviceLabel(),
  ]);
  const resp = await nodePost<Record<string, unknown>>('/api/node/auth/login', '', {
    username, password, device_type: 'windows',
    device_fingerprint: deviceFingerprint,
    device_label:       deviceLabel,
  });
  return normaliseAuth(resp);
}

export async function loginByPhone(phone: string, password: string): Promise<AuthResponse> {
  return login(phone, password);
}

/**
 * Submit the 6-digit code shown to the account owner (via email or their other
 * active device) to finish logging in an untrusted device. On success the
 * response has the exact same shape as a successful login() call. On failure
 * `error_id` distinguishes 'denied' (owner tapped "No" elsewhere) from
 * 'expired' / 'too_many_attempts' / 'wrong_code'.
 */
export async function verifyLoginCode(verificationId: string, code: string): Promise<AuthResponse> {
  const resp = await nodePost<Record<string, unknown>>('/api/node/auth/verify-login-code', '', {
    verification_id: verificationId,
    code,
    device_type: 'windows',
  });
  return normaliseAuth(resp);
}

/**
 * "Didn't get the code? Call me / send it to my email." Re-sends the SAME
 * pending code via `channel` ('email' | 'voice_call' | 'sms') — never
 * generates a new one, so a code already delivered to another device stays
 * valid. No auth (this device has no session yet); the verification_id is
 * the capability. Server-side rate limits apply: a 60s cooldown and 3
 * resends per verification, SHARED across channels, both surfaced as
 * api_status 429 with a localized message. `channel` defaults to 'email' —
 * the pre-existing behavior for any caller that omits it.
 */
export async function resendLoginVerificationEmail(
  verificationId: string,
  channel: 'email' | 'voice_call' | 'sms' = 'email',
): Promise<{ ok: boolean; emailMasked: string; phoneMasked: string; message: string }> {
  const resp = await nodePost<Record<string, unknown>>('/api/node/auth/login-verification-resend', '', {
    verification_id: verificationId,
    channel,
  });
  const ok = String(resp.api_status ?? '') === '200';
  return {
    ok,
    emailMasked: (resp.email_masked as string) ?? '',
    phoneMasked: (resp.phone_masked as string) ?? '',
    message:     (resp.message as string) ?? (resp.error_message as string) ?? '',
  };
}

/**
 * Called from an ALREADY-authenticated device that received a
 * `login:verify_request` socket event, to acknowledge or reject someone else's
 * pending login attempt. NOTE: approve=true is acknowledgment only — it does
 * NOT log the new device in by itself; the new device only completes login by
 * the correct code being typed in on it directly. approve=false immediately
 * invalidates the code (the new device's next verify call fails with
 * error_id:'denied').
 */
export async function respondToLoginVerification(
  token: string,
  verificationId: string,
  approve: boolean,
): Promise<{ ok: boolean }> {
  try {
    const resp = await nodePost<Record<string, unknown>>('/api/node/auth/login-verification-respond', token, {
      verification_id: verificationId,
      approve,
    });
    return { ok: String(resp.api_status ?? '') === '200' };
  } catch {
    return { ok: false };
  }
}

/**
 * Optional polling helper for the code-entry screen — lets it proactively show
 * "denied by owner" / "expired" instead of waiting for the user to submit.
 * No auth required (the verification_id itself is the capability).
 */
export async function getLoginVerificationStatus(verificationId: string): Promise<{ status: string }> {
  const text = await doRequest(
    `${NODE_BASE_URL}/api/node/auth/login-verification-status/${encodeURIComponent(verificationId)}`,
    { method: 'GET' }
  );
  const data = await parseJson<{ status?: string }>(text);
  return { status: data.status ?? 'pending' };
}

export async function registerAccount(input: {
  username:        string;
  email?:          string;
  phoneNumber?:    string;
  password:        string;
  confirmPassword: string;
  gender:          string;
  inviteCode?:     string;
  backupEmail?:    string;
}): Promise<AuthResponse> {
  const resp = await nodePost<Record<string, unknown>>('/api/node/auth/register', '', {
    username:         input.username,
    email:            input.email            ?? '',
    phone_number:     input.phoneNumber      ?? '',
    password:         input.password,
    confirm_password: input.confirmPassword,
    gender:           input.gender,
    device_type:      'windows',
    ...(input.inviteCode  ? { invite_code:   input.inviteCode.toUpperCase() } : {}),
    ...(input.backupEmail ? { backup_email:  input.backupEmail }              : {}),
  });
  return normaliseAuth(resp);
}

export interface QuickRegisterResponse {
  api_status:    number;
  user_id?:      number;
  username?:     string;
  message?:      string;
  error_message?: string;
}

export interface QuickVerifyResponse {
  api_status:     number;
  access_token?:  string;
  user_id?:       number;
  username?:      string;
  avatar?:        string;
  error_message?: string;
}

export interface PasswordResetRequestResponse {
  api_status:     number;
  message?:       string;
  error_message?: string;
}

export interface PasswordResetResponse {
  api_status:     number;
  message?:       string;
  error_message?: string;
}

/** Send 6-digit OTP for quick registration — no password required. */
export async function quickRegister(input: {
  email?:       string;
  phoneNumber?: string;
  inviteCode?:  string;
}): Promise<QuickRegisterResponse> {
  return nodePost<QuickRegisterResponse>('/api/node/auth/quick-register', '', {
    ...(input.email       ? { email:        input.email }                          : {}),
    ...(input.phoneNumber ? { phone_number: input.phoneNumber }                    : {}),
    ...(input.inviteCode  ? { invite_code:  input.inviteCode.toUpperCase() }       : {}),
  });
}

/** Verify OTP from quickRegister and receive a session token. */
export async function quickVerify(input: {
  email?:       string;
  phoneNumber?: string;
  code:         string;
}): Promise<QuickVerifyResponse> {
  return nodePost<QuickVerifyResponse>('/api/node/auth/quick-verify', '', {
    ...(input.email       ? { email:        input.email }       : {}),
    ...(input.phoneNumber ? { phone_number: input.phoneNumber } : {}),
    code: input.code,
  });
}

/** Send 6-digit OTP to an email or phone for password reset. */
export async function requestPasswordReset(input: {
  email?:       string;
  phoneNumber?: string;
}): Promise<PasswordResetRequestResponse> {
  return nodePost<PasswordResetRequestResponse>('/api/node/auth/request-password-reset', '', {
    ...(input.email       ? { email:        input.email }       : {}),
    ...(input.phoneNumber ? { phone_number: input.phoneNumber } : {}),
  });
}

/** Verify OTP and set a new password. */
export async function resetPassword(input: {
  email?:       string;
  phoneNumber?: string;
  code:         string;
  newPassword:  string;
}): Promise<PasswordResetResponse> {
  return nodePost<PasswordResetResponse>('/api/node/auth/reset-password', '', {
    ...(input.email       ? { email:        input.email }       : {}),
    ...(input.phoneNumber ? { phone_number: input.phoneNumber } : {}),
    code:         input.code,
    new_password: input.newPassword,
  });
}

// ─── Chats ────────────────────────────────────────────────────────────────────

export async function loadChats(token: string, _userId?: number): Promise<ChatListResponse> {
  const resp = await nodePost<Record<string, unknown>>('/api/node/chat/chats', token, {
    limit: 80, offset: 0, show_archived: 'false'
  });
  const raw  = (resp.data ?? []) as Record<string, unknown>[];
  return {
    api_status: '200',
    data:       Array.isArray(raw) ? raw.map(normaliseChatItem) : []
  };
}

// ─── Messages ─────────────────────────────────────────────────────────────────

/**
 * Decrypt a list of Signal messages in ascending ID order.
 *
 * The server returns messages DESC (newest first).  Signal Double Ratchet
 * requires the X3DH initialisation message (oldest, carries "ik"/"ek" fields)
 * to be decrypted BEFORE the subsequent DR-only messages that depend on the
 * session it establishes.  Processing in DESC order means the X3DH message
 * runs last — after all DR messages have already failed.
 *
 * Mirrors Android MessagesViewModel.decryptAll() which explicitly sorts
 * ascending before decrypting.  Runs sequentially (not in parallel) so the
 * per-sender AsyncMutex in SignalService advances the ratchet in the correct
 * order rather than queuing all tasks simultaneously and racing.
 */
export async function decryptMessagesInOrder(
  messages:  MessageItem[],
  decryptFn: (msg: MessageItem) => Promise<MessageItem>
): Promise<MessageItem[]> {
  // Sort ascending by id — ensures X3DH message is processed first
  const ascending = [...messages].sort((a, b) => a.id - b.id);
  const decryptedById = new Map<number, MessageItem>();
  for (const msg of ascending) {
    decryptedById.set(msg.id, await decryptFn(msg));
  }
  // Restore original server order
  return messages.map(m => decryptedById.get(m.id) ?? m);
}

export async function loadMessages(token: string, recipientId: number, _userId?: number): Promise<MessagesResponse> {
  const resp = await nodePost<Record<string, unknown>>('/api/node/chat/get', token, {
    recipient_id: recipientId, limit: 100, before_message_id: 0
  });
  return normaliseMessages(resp);
}

export async function loadMoreMessages(token: string, recipientId: number, beforeId: number): Promise<MessagesResponse> {
  const resp = await nodePost<Record<string, unknown>>('/api/node/chat/loadmore', token, {
    recipient_id: recipientId, before_message_id: beforeId, limit: 60
  });
  return normaliseMessages(resp);
}

export async function sendMessage(
  token:          string,
  recipientId:    number,
  text:           string,
  _userId?:       number,
  signalPayload?: {
    ciphertext:    string; // base64 — goes in 'text' field (Kotlin convention)
    iv:            string;
    tag:           string;
    signalHeader:  string;
    cipher_version?: number;
  },
  replyToId?: number,
  /** Same idempotency token across every retry of one logical send — see offlineQueue.ts's QueuedMessage.clientMsgId. */
  clientMsgId?: string,
  /** Set both when this send is a "Forward" of a channel post — see forwardChannelPostToChat(). */
  forwardedChannelId?: number,
  forwardedPostId?: number
): Promise<{ id?: number }> {
  const body: Record<string, unknown> = {
    recipient_id: recipientId,
    text:         signalPayload ? signalPayload.ciphertext : text,
    ...(replyToId ? { reply_id: replyToId } : {}),
    ...(clientMsgId ? { client_msg_id: clientMsgId } : {}),
    ...(forwardedChannelId ? { forwarded_channel_id: forwardedChannelId, forwarded_post_id: forwardedPostId } : {})
  };

  if (signalPayload) {
    body.cipher_version = signalPayload.cipher_version ?? 3;
    body.iv             = signalPayload.iv;
    body.tag            = signalPayload.tag;
    body.signal_header  = signalPayload.signalHeader;
  }

  const resp    = await nodePost<Record<string, unknown>>('/api/node/chat/send', token, body);
  const msgData = resp.message_data as Record<string, unknown> | undefined;
  const rawId   = msgData?.id ?? msgData?.message_id ?? resp.id ?? resp.message_id;
  const id      = rawId ? Number(rawId) : undefined;
  return { id: id || undefined };
}

/**
 * For an E2EE message (cipher_version 3/6 on the original), `text` must
 * already be ciphertext, re-encrypted client-side with the SAME scheme —
 * see handleSend()'s edit branch. The server stores it as-is and rejects
 * (400) if encPayload is missing or its cipher_version doesn't match the
 * original message's (routes/private-chats/messages.js editMessage(), fixed
 * 2026-08-18 — used to silently re-encrypt with a server key, stripping
 * E2EE from the edit).
 */
export async function editMessage(
  token: string, messageId: number, text: string,
  encPayload?: { iv: string; tag: string; cipher_version: number; signal_header?: string }
): Promise<void> {
  await nodePost('/api/node/chat/edit', token, {
    message_id: messageId,
    text,
    ...(encPayload ? {
      iv: encPayload.iv,
      tag: encPayload.tag,
      cipher_version: encPayload.cipher_version,
      ...(encPayload.signal_header ? { signal_header: encPayload.signal_header } : {}),
    } : {}),
  });
}

export async function deleteMessage(token: string, messageId: number, type: 'for_me' | 'for_all' = 'for_all'): Promise<void> {
  // Kotlin: delete_type = "just_me" | "everyone"
  await nodePost('/api/node/chat/delete', token, {
    message_id:  messageId,
    delete_type: type === 'for_all' ? 'everyone' : 'just_me'
  });
}

export async function reactToMessage(token: string, messageId: number, emoji: string): Promise<void> {
  // Kotlin field: 'reaction' not 'emoji'
  await nodePost('/api/node/chat/react', token, { message_id: messageId, reaction: emoji });
}

export async function pinMessage(token: string, messageId: number, pin: boolean): Promise<void> {
  await nodePost('/api/node/chat/pin', token, {
    message_id: messageId,
    pin:        pin ? 'yes' : 'no'
  });
}

export async function markSeen(token: string, recipientId: number, _lastId?: number): Promise<void> {
  try { await nodePost('/api/node/chat/seen', token, { recipient_id: recipientId }); }
  catch { /* non-critical */ }
}

export async function searchMessages(token: string, recipientId: number, query: string): Promise<MessagesResponse> {
  const resp = await nodePost<Record<string, unknown>>('/api/node/chat/search', token, {
    recipient_id: recipientId, query, limit: 50, offset: 0
  });
  return normaliseMessages(resp);
}

// ─── Media ────────────────────────────────────────────────────────────────────

export async function uploadMedia(token: string, file: File): Promise<MediaUploadResponse> {
  // Detect type by MIME first, then fall back to extension (handles .mp3/.m4a with octet-stream MIME)
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  const AUDIO_EXTS = new Set(['mp3','ogg','m4a','aac','opus','flac','wav','webm']);
  const VIDEO_EXTS = new Set(['mp4','mov','mkv','m4v','avi','3gp']);
  const type = ext === 'tgs' ? 'sticker'
    : file.type.startsWith('image') ? 'image'
    : file.type.startsWith('video') ? 'video'
    : file.type.startsWith('audio') ? 'audio'
    : AUDIO_EXTS.has(ext) ? 'audio'
    : VIDEO_EXTS.has(ext) ? 'video'
    : 'file';
  // Route files > 50 MB through the streaming path so the renderer doesn't freeze
  const uploadFn = (file.size ?? 0) > LARGE_FILE_THRESHOLD ? doUploadLarge : doUpload;
  const text = await uploadFn(`${NODE_BASE_URL}/api/node/chat/upload`, token, { type }, file);
  return parseJson<MediaUploadResponse>(text);
}

/**
 * Lazy lookup of available quality renditions for a sent video file. Only call
 * this when the user actually opens the expanded/fullscreen player — not for
 * every message in the chat list. If the background 720p rendition isn't
 * ready yet, only 'original' comes back; re-opening the player later will
 * pick it up once it's done.
 */
export async function getVideoQualities(token: string, originalUrl: string): Promise<VideoQuality[]> {
  try {
    const resp = await nodeGet<{ api_status: number; qualities?: VideoQuality[] }>(
      `/api/node/chat/video-qualities?url=${encodeURIComponent(originalUrl)}`,
      token
    );
    return resp.qualities ?? [];
  } catch {
    return [];
  }
}

/** Video quality tiers the server's ffmpeg pass understands (see helpers/video-compressor.js TIERS). */
export type ChannelMediaQuality = 'video_message' | 'compressed' | 'high' | 'auto' | 'original';

/**
 * Channel-post media upload — dedicated endpoint (unlike uploadMedia/chat.upload) that
 * accepts a `quality` tier and applies it to the server-side background ffmpeg pass for
 * videos over 50 MB. Returns just { url } — no per-type *_src fields.
 */
export async function uploadChannelMedia(
  token: string, file: File, quality: ChannelMediaQuality = 'auto'
): Promise<{ url: string | null }> {
  const media_type = file.type.startsWith('image') ? 'image'
    : file.type.startsWith('video') ? 'video'
    : file.type.startsWith('audio') ? 'audio'
    : 'file';
  const uploadFn = (file.size ?? 0) > LARGE_FILE_THRESHOLD ? doUploadLarge : doUpload;
  const text = await uploadFn(`${NODE_BASE_URL}/api/node/media/upload`, token, { media_type, quality }, file);
  const resp = await parseJson<{ url?: string }>(text);
  return { url: resp.url ?? null };
}

export async function sendMessageWithMedia(
  token:       string,
  recipientId: number,
  text:        string,
  file:        File,
  _userId?:    number
): Promise<{ id?: number; media?: string; media_type?: string }> {
  // Step 1: upload the file
  const upload = await uploadMedia(token, file);
  // Prefer the full absolute URL (image/video/...) — the *_src fields are the
  // raw S3 object key in S3/MinIO storage mode (e.g. "photos/2026/07/x.jpg",
  // no "/media/" prefix), not a servable path, and produce a 404/broken image
  // if used directly. The Android client already reads the full-URL fields
  // (see MediaUploader.kt) — this matches that behavior.
  const mediaUrl = upload.image ?? upload.video ?? upload.audio ?? upload.file
    ?? upload.image_src ?? upload.video_src ?? upload.audio_src ?? upload.file_src ?? '';
  const mediaType = file.type.startsWith('image') ? 'image'
    : file.type.startsWith('video') ? 'video'
    : file.type.startsWith('audio') ? 'audio' : 'file';

  // Step 2: send media message
  const resp    = await nodePost<Record<string, unknown>>('/api/node/chat/send-media', token, {
    recipient_id:    recipientId,
    group_id:        0,
    media_url:       mediaUrl,
    media_type:      mediaType,
    media_file_name: file.name,
    caption:         text,
    message_hash_id: `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`
  });
  const msgData = resp.message_data as Record<string, unknown> | undefined;
  const rawId   = msgData?.id ?? msgData?.message_id ?? resp.id ?? resp.message_id;
  return { id: rawId ? Number(rawId) : undefined, media: mediaUrl, media_type: mediaType };
}

export async function sendVoiceMessage(token: string, recipientId: number, voiceFile: File): Promise<void> {
  const text   = await doUpload(`${NODE_BASE_URL}/api/node/chat/upload`, token, { type: 'voice' }, voiceFile);
  const upload = await parseJson<MediaUploadResponse>(text);
  // Server may store audio/webm as video — fall back through all URL fields.
  // Full-URL fields first (see sendMessageWithMedia for why *_src alone breaks under S3).
  const mediaUrl = upload.audio ?? upload.video ?? upload.file
    ?? upload.audio_src ?? upload.video_src ?? upload.file_src ?? '';
  await nodePost('/api/node/chat/send-media', token, {
    recipient_id:    recipientId,
    group_id:        0,
    media_url:       mediaUrl,
    media_type:      'voice',
    media_file_name: voiceFile.name,
    caption:         '',
    message_hash_id: `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
  });
}

export async function sendGroupVoiceMessage(token: string, groupId: number, voiceFile: File): Promise<void> {
  const text   = await doUpload(`${NODE_BASE_URL}/api/node/chat/upload`, token, { type: 'voice' }, voiceFile);
  const upload = await parseJson<MediaUploadResponse>(text);
  const mediaUrl = upload.audio ?? upload.video ?? upload.file
    ?? upload.audio_src ?? upload.video_src ?? upload.file_src ?? '';
  await nodePost('/api/node/chat/send-media', token, {
    recipient_id:    0,
    group_id:        groupId,
    media_url:       mediaUrl,
    media_type:      'voice',
    media_file_name: voiceFile.name,
    caption:         '',
    message_hash_id: `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
  });
}

export async function sendVideoNoteMessage(token: string, recipientId: number, videoFile: File): Promise<void> {
  const text   = await doUpload(`${NODE_BASE_URL}/api/node/chat/upload`, token, { type: 'video' }, videoFile);
  const upload = await parseJson<MediaUploadResponse>(text);
  const mediaUrl = upload.video ?? upload.file ?? upload.video_src ?? upload.file_src ?? '';
  await nodePost('/api/node/chat/send-media', token, {
    recipient_id:    recipientId,
    group_id:        0,
    media_url:       mediaUrl,
    media_type:      'video_note',
    media_file_name: videoFile.name,
    caption:         '',
    message_hash_id: `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
  });
}

export async function sendGroupVideoNoteMessage(token: string, groupId: number, videoFile: File): Promise<void> {
  const text   = await doUpload(`${NODE_BASE_URL}/api/node/chat/upload`, token, { type: 'video' }, videoFile);
  const upload = await parseJson<MediaUploadResponse>(text);
  const mediaUrl = upload.video ?? upload.file ?? upload.video_src ?? upload.file_src ?? '';
  await nodePost('/api/node/chat/send-media', token, {
    recipient_id:    0,
    group_id:        groupId,
    media_url:       mediaUrl,
    media_type:      'video_note',
    media_file_name: videoFile.name,
    caption:         '',
    message_hash_id: `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
  });
}

export async function sendGroupMediaMessageApi(
  token: string, groupId: number, mediaUrl: string, mediaType: string, mediaFileName: string, caption: string,
  forwardedChannelId?: number, forwardedPostId?: number
): Promise<void> {
  await nodePost('/api/node/chat/send-media', token, {
    recipient_id: 0,
    group_id: groupId,
    media_url: mediaUrl,
    media_type: mediaType,
    media_file_name: mediaFileName,
    caption,
    message_hash_id: `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    ...(forwardedChannelId ? { forwarded_channel_id: forwardedChannelId, forwarded_post_id: forwardedPostId } : {})
  });
}

/** Sends a private-chat media message from an already-hosted URL (no upload step) — used by forwardChannelPostToChat(). */
export async function sendChatMediaMessageApi(
  token: string, recipientId: number, mediaUrl: string, mediaType: string, mediaFileName: string, caption: string,
  forwardedChannelId?: number, forwardedPostId?: number
): Promise<void> {
  await nodePost('/api/node/chat/send-media', token, {
    recipient_id: recipientId,
    group_id: 0,
    media_url: mediaUrl,
    media_type: mediaType,
    media_file_name: mediaFileName,
    caption,
    message_hash_id: `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    ...(forwardedChannelId ? { forwarded_channel_id: forwardedChannelId, forwarded_post_id: forwardedPostId } : {})
  });
}

// ─── Inline bot query ─────────────────────────────────────────────────────────

export interface InlineBotResult {
  id:          string;
  type:        string;  // 'article' | 'photo' | 'gif' | 'sticker' | ...
  title:       string;
  description?: string;
  thumb_url?:  string;
  input_message_content?: { text: string };
}

export async function queryInlineBot(token: string, bot: string, q: string): Promise<InlineBotResult[]> {
  try {
    const res = await nodeGet<{ results?: InlineBotResult[] }>(
      `/api/node/bots/inline?bot=${encodeURIComponent(bot)}&q=${encodeURIComponent(q)}`, token
    );
    return Array.isArray(res.results) ? res.results : [];
  } catch {
    return [];
  }
}

// ─── Chat management ──────────────────────────────────────────────────────────

export async function muteChat(token: string, userId: number, mute: boolean): Promise<void> {
  await nodePost('/api/node/chat/mute', token, {
    chat_id:   userId,
    notify:    mute ? 'no' : 'yes',
    call_chat: 'yes'
  });
}

export async function pinChat(token: string, userId: number, pin: boolean): Promise<void> {
  await nodePost('/api/node/chat/pin-chat', token, { chat_id: userId, pin: pin ? 'yes' : 'no' });
}

/** routes/private-chats/chats-list.js readChats — marks the partner's messages as seen. */
export async function markChatRead(token: string, userId: number): Promise<void> {
  await nodePost('/api/node/chat/read', token, { recipient_id: userId });
}

export async function archiveChat(token: string, userId: number, archive: boolean): Promise<void> {
  await nodePost('/api/node/chat/archive', token, { chat_id: userId, archive: archive ? 'yes' : 'no' });
}

export async function clearHistory(token: string, userId: number, clearType: 'just_me' | 'everyone' = 'just_me'): Promise<void> {
  await nodePost('/api/node/chat/clear-history', token, { recipient_id: userId, clear_type: clearType });
}

export async function deleteConversation(token: string, userId: number, deleteType: 'me' | 'all' = 'me'): Promise<void> {
  await nodePost('/api/node/chat/delete-conversation', token, { user_id: userId, delete_type: deleteType });
}

export async function setChatColor(token: string, userId: number, color: string): Promise<void> {
  await nodePost('/api/node/chat/color', token, { user_id: userId, color });
}

// ─── Groups ───────────────────────────────────────────────────────────────────

export async function loadGroups(token: string): Promise<GenericListResponse<GroupItem>> {
  const resp = await nodePost<Record<string, unknown>>('/api/node/group/list', token, { limit: 50, offset: 0 });
  const raw  = (resp.groups ?? resp.data ?? []) as Record<string, unknown>[];
  const data: GroupItem[] = Array.isArray(raw) ? raw.map(g => ({
    id:                Number(g.id ?? g.group_id),
    group_name:        toStr(g.group_name ?? g.name, 'Group'),
    avatar:            g.avatar as string | undefined,
    members_count:     Number(g.members_count ?? 0),
    description:       toStr(g.description, ''),
    slow_mode_seconds: g.slow_mode_seconds ? Number(g.slow_mode_seconds) : undefined,
  })) : [];
  return { api_status: '200', data };
}

export async function createGroup(
  token: string,
  groupName: string,
  opts?: { description?: string; isPrivate?: boolean; memberIds?: number[] },
): Promise<number | null> {
  // Backend already returns group_id (routes/groups/management.js's create())
  // — this just needed to actually read and forward it, same class of bug as
  // createChannelFull once was.
  const r = await nodePost<Record<string, unknown>>('/api/node/group/create', token, {
    group_name: groupName,
    parts: '',
    description: opts?.description ?? '',
    is_private: opts?.isPrivate ?? false,
    member_ids: opts?.memberIds ?? [],
  });
  return r.group_id ? Number(r.group_id) : null;
}

/** Uploads a group avatar right after creation (group_id must already
 *  exist — see admin.js's uploadAvatar, moderation-gated like the channel
 *  equivalents). Best-effort — callers shouldn't fail group creation over it. */
export async function uploadGroupAvatarFile(token: string, groupId: number, file: File): Promise<string | null> {
  try {
    const text = await doUpload(`${NODE_BASE_URL}/api/node/group/upload-avatar`, token, { group_id: String(groupId) }, file);
    const resp = await parseJson<Record<string, unknown>>(text);
    return resp.avatar_url ? String(resp.avatar_url) : (resp.url ? String(resp.url) : null);
  } catch (e) {
    console.error('[group] uploadGroupAvatarFile error:', e);
    return null;
  }
}

export async function joinGroup(token: string, groupId: number): Promise<void> {
  await nodePost('/api/node/group/join', token, { group_id: groupId });
}

export async function subscribeChannel(
  token: string, channelId: number,
): Promise<{ api_status: number; error_message?: string }> {
  return nodePost('/api/node/channel/subscribe', token, { channel_id: channelId });
}

export async function unsubscribeChannel(token: string, channelId: number): Promise<void> {
  await nodePost('/api/node/channel/unsubscribe', token, { channel_id: channelId });
}

export async function deleteChannel(token: string, channelId: number): Promise<void> {
  await nodePost('/api/node/channel/delete', token, { channel_id: channelId });
}

export type UserSearchResult = {
  id: number;
  username: string;
  first_name?: string;
  last_name?: string;
  avatar?: string;
};

export async function searchUsers(token: string, query: string): Promise<UserSearchResult[]> {
  // Users type "@nick" to search by handle, but stored usernames never
  // contain "@" — strip it so the backend LIKE query can actually match.
  const cleaned = query.trim().replace(/^@+/, '');
  const params = new URLSearchParams({ q: cleaned, limit: '30', offset: '0' });
  const text = await doRequest(`${NODE_BASE_URL}/api/node/users/search?${params}`, {
    method: 'GET',
    headers: { 'access-token': token },
  });
  const payload = await parseJson<Record<string, unknown>>(text);
  const raw = (payload.users ?? payload.data ?? []) as Record<string, unknown>[];
  return Array.isArray(raw) ? raw.map(u => ({
    id:         Number(u.user_id ?? u.id ?? 0),
    username:   toStr(u.username, ''),
    first_name: toStr(u.first_name, ''),
    last_name:  toStr(u.last_name, ''),
    avatar:     toStr(u.avatar, ''),
  })) : [];
}

// ─── Blog / News + profile web feed (read-only) ────────────────────────────────

function assertOk(resp: Record<string, unknown>, fallback: string): void {
  const status = Number(resp.api_status ?? 200);
  if (status !== 200) {
    throw new Error(typeof resp.error_message === 'string' ? resp.error_message : fallback);
  }
}

export async function getBlogCategories(token: string): Promise<BlogCategory[]> {
  const resp = await nodeGet<Record<string, unknown>>('/api/node/blog/categories', token);
  assertOk(resp, 'Failed to load blog categories');
  const raw = (resp.categories ?? []) as BlogCategory[];
  return Array.isArray(raw) ? raw : [];
}

export async function getBlogPosts(
  token: string,
  categoryId?: number | null,
  limit = 20,
  offset = 0,
): Promise<{ posts: BlogPost[]; hasMore: boolean }> {
  const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
  if (categoryId) params.set('category', String(categoryId));
  const resp = await nodeGet<Record<string, unknown>>(`/api/node/blog/posts?${params}`, token);
  assertOk(resp, 'Failed to load blog posts');
  const posts = ((resp.posts ?? []) as BlogPost[]);
  return { posts: Array.isArray(posts) ? posts : [], hasMore: Array.isArray(posts) && posts.length >= limit };
}

export async function getBlogPostDetail(token: string, id: number): Promise<BlogPostDetail | null> {
  const resp = await nodeGet<Record<string, unknown>>(`/api/node/blog/posts/${id}`, token);
  assertOk(resp, 'Failed to load the article');
  return (resp.post as BlogPostDetail | undefined) ?? null;
}

export async function searchGroups(token: string, query: string): Promise<GenericListResponse<GroupItem>> {
  const resp = await nodePost<Record<string, unknown>>('/api/node/group/search', token, { query, limit: 30, offset: 0 });
  const raw  = (resp.groups ?? resp.data ?? []) as Record<string, unknown>[];
  const data: GroupItem[] = Array.isArray(raw) ? raw.map(g => ({
    id:            Number(g.id ?? g.group_id),
    group_name:    toStr(g.group_name ?? g.name, 'Group'),
    avatar:        g.avatar as string | undefined,
    members_count: Number(g.members_count ?? 0),
    description:   toStr(g.description, '')
  })) : [];
  return { api_status: '200', data };
}

export async function searchChannels(token: string, query: string): Promise<GenericListResponse<ChannelItem>> {
  const resp = await nodePost<Record<string, unknown>>('/api/node/channel/list', token, { type: 'search', query, limit: 50, offset: 0 });
  const raw  = (resp.channels ?? resp.data ?? []) as Record<string, unknown>[];
  const data: ChannelItem[] = Array.isArray(raw) ? raw.map(c => ({
    id:                Number(c.id ?? c.channel_id),
    name:              toStr(c.name, 'Channel'),
    username:          c.username as string | undefined,
    avatar_url:        (c.avatar_url ?? c.avatar) as string | undefined,
    subscribers_count: Number(c.subscribers_count ?? 0),
    description:       toStr(c.description, ''),
    is_subscribed:     Boolean(c.is_subscribed),
    is_owner:          Boolean(c.is_owner),
    is_admin:          Boolean(c.is_admin),
    is_premium:        Boolean(c.is_premium),
    is_private:        Boolean(c.is_private),
  })) : [];
  return { api_status: '200', data };
}

// TODO(offline): pure REST, no local cache — deliberately deferred (2026-07-14
// offline-mode plan). The offline SEND queue for groups already works (see
// offlineQueue.ts's groupId branch); only full offline history *browsing* is
// out of scope here, same as Android's fetchGroupMessages().
export async function loadGroupMessages(token: string, groupId: number, topicId?: number): Promise<MessagesResponse> {
  const resp = await nodePost<Record<string, unknown>>('/api/node/group/messages/get', token, {
    group_id: groupId, limit: 100, before_message_id: 0,
    ...(topicId ? { topic_id: topicId } : {}),
  });
  return normaliseGroupMessages(resp);
}

export async function loadMoreGroupMessages(token: string, groupId: number, beforeId: number, topicId?: number): Promise<MessagesResponse> {
  const resp = await nodePost<Record<string, unknown>>('/api/node/group/messages/loadmore', token, {
    group_id: groupId, before_message_id: beforeId, limit: 60,
    ...(topicId ? { topic_id: topicId } : {}),
  });
  return normaliseGroupMessages(resp);
}

export async function sendGroupMessage(
  token:    string,
  groupId:  number,
  text:     string,
  replyToId?: number,
  groupE2EEPayload?: {
    ciphertext: string;
    iv:         string;
    tag:        string;
    cipher_version?: number;
  },
  /** Same idempotency token across every retry of one logical send. */
  clientMsgId?: string,
  /** Posts into a subgroup/topic instead of the group's main timeline. */
  topicId?: number,
  /** Set both when this send is a "Forward" of a channel post — see forwardChannelPostToGroup(). */
  forwardedChannelId?: number,
  forwardedPostId?: number
): Promise<{ id?: number }> {
  const body: Record<string, unknown> = {
    group_id: groupId,
    text:     groupE2EEPayload ? groupE2EEPayload.ciphertext : text,
    ...(replyToId ? { reply_id: replyToId } : {}),
    ...(groupE2EEPayload ? {
      cipher_version: groupE2EEPayload.cipher_version ?? 4,
      iv:             groupE2EEPayload.iv,
      tag:            groupE2EEPayload.tag,
      or_text:        text.slice(0, 30) + (text.length > 30 ? '…' : ''),
    } : {}),
    ...(clientMsgId ? { client_msg_id: clientMsgId } : {}),
    ...(topicId ? { topic_id: topicId } : {}),
    ...(forwardedChannelId ? { forwarded_channel_id: forwardedChannelId, forwarded_post_id: forwardedPostId } : {})
  };
  const resp = await nodePost<Record<string, unknown>>('/api/node/group/messages/send', token, body);
  const msgData = resp.message_data as Record<string, unknown> | undefined;
  return { id: msgData ? Number(msgData.id) : undefined };
}

/** See editMessage() above — same E2EE-preserving contract, for group messages
 *  (cipher_version 3/4/5 on the original; routes/groups/messages.js editMessage()). */
export async function editGroupMessage(
  token: string, messageId: number, text: string,
  encPayload?: { iv: string; tag: string; cipher_version: number; signal_header?: string }
): Promise<void> {
  await nodePost('/api/node/group/messages/edit', token, {
    message_id: messageId,
    text,
    ...(encPayload ? {
      iv: encPayload.iv,
      tag: encPayload.tag,
      cipher_version: encPayload.cipher_version,
      ...(encPayload.signal_header ? { signal_header: encPayload.signal_header } : {}),
    } : {}),
  });
}

export async function deleteGroupMessage(token: string, messageId: number): Promise<void> {
  await nodePost('/api/node/group/messages/delete', token, {
    message_id: messageId, delete_type: 'everyone'
  });
}

export async function reactToGroupMessage(token: string, messageId: number, emoji: string): Promise<void> {
  await nodePost('/api/node/group/messages/react', token, { message_id: messageId, reaction: emoji }).catch(() => {});
}

export async function markGroupSeen(token: string, groupId: number): Promise<void> {
  try { await nodePost('/api/node/group/messages/seen', token, { group_id: groupId }); }
  catch { /* non-critical */ }
}

// ─── Group topics (subgroups) ────────────────────────────────────────────────
// Telegram-forum-style sub-threads within a group. Real server state (2026-07-12)
// — replaces the old localStorage-only, text-prefix-tagged fake that never left
// this device and garbled the message body for any other client.

export interface GroupTopic {
  id:           number;
  name:         string;
  description:  string | null;
  color:        string;
  icon:         string | null;
  isPrivate:    boolean;
  isPinned:     boolean;
  isArchived:   boolean;
  messageCount: number;
  createdBy:    number;
  createdAt:    number;
  moderators:   number[];
}

export function normaliseTopic(t: Record<string, unknown>): GroupTopic {
  return {
    id:           Number(t.id),
    name:         toStr(t.name, ''),
    description:  (t.description as string | undefined) ?? null,
    color:        toStr(t.color, '#0088CC'),
    icon:         (t.icon as string | undefined) ?? null,
    isPrivate:    Boolean(t.is_private),
    isPinned:     Boolean(t.is_pinned),
    isArchived:   Boolean(t.is_archived),
    messageCount: Number(t.message_count ?? 0),
    createdBy:    Number(t.created_by ?? 0),
    createdAt:    Number(t.created_at ?? 0),
    moderators:   Array.isArray(t.moderators) ? (t.moderators as unknown[]).map(Number) : [],
  };
}

export async function listGroupTopics(token: string, groupId: number): Promise<GroupTopic[]> {
  const resp = await nodePost<Record<string, unknown>>('/api/node/group/topics/list', token, { group_id: groupId });
  const raw = (resp.topics ?? []) as Record<string, unknown>[];
  return Array.isArray(raw) ? raw.map(normaliseTopic) : [];
}

export async function createGroupTopic(
  token: string, groupId: number, name: string,
  opts?: { description?: string; color?: string; icon?: string; isPrivate?: boolean }
): Promise<GroupTopic | null> {
  const resp = await nodePost<Record<string, unknown>>('/api/node/group/topics/create', token, {
    group_id: groupId,
    name,
    description: opts?.description,
    color:       opts?.color,
    icon:        opts?.icon,
    is_private:  opts?.isPrivate ? '1' : '0',
  });
  return resp.topic ? normaliseTopic(resp.topic as Record<string, unknown>) : null;
}

export async function updateGroupTopic(
  token: string, groupId: number, topicId: number,
  fields: Partial<{ name: string; description: string; color: string; icon: string; isPrivate: boolean; isPinned: boolean; isArchived: boolean }>
): Promise<GroupTopic | null> {
  const resp = await nodePost<Record<string, unknown>>('/api/node/group/topics/update', token, {
    group_id: groupId,
    topic_id: topicId,
    name:        fields.name,
    description: fields.description,
    color:       fields.color,
    icon:        fields.icon,
    is_private:  fields.isPrivate === undefined ? undefined : (fields.isPrivate ? '1' : '0'),
    is_pinned:   fields.isPinned,
    is_archived: fields.isArchived,
  });
  return resp.topic ? normaliseTopic(resp.topic as Record<string, unknown>) : null;
}

export async function deleteGroupTopic(token: string, groupId: number, topicId: number): Promise<void> {
  await nodePost('/api/node/group/topics/delete', token, { group_id: groupId, topic_id: topicId });
}

/** Group-admin only — replaces a topic's full moderator list. */
export async function setGroupTopicModerators(
  token: string, groupId: number, topicId: number, moderatorIds: number[]
): Promise<GroupTopic | null> {
  const resp = await nodePost<Record<string, unknown>>('/api/node/group/topics/moderators', token, {
    group_id: groupId, topic_id: topicId, moderator_ids: moderatorIds,
  });
  return resp.topic ? normaliseTopic(resp.topic as Record<string, unknown>) : null;
}

// ─── Channel sub-groups ───────────────────────────────────────────────────────
// Attaches up to 5 real groups to a private, premium channel — each is a full
// Wo_GroupChat group, so avatars/roles/ban/mute already come for free from the
// normal group infrastructure. Mirrors Android's ChannelGroupsManager.kt /
// ChannelSubGroupsDialog (which only exposes create + detach, not the backend's
// separate "attach an existing group" endpoint — matched here for parity).

export interface ChannelSubGroup {
  id:           number;
  name:         string;
  avatar:       string | null;
  description:  string | null;
  membersCount: number;
  isMember:     boolean;
  createdTime:  string;
}

function normaliseChannelSubGroup(g: Record<string, unknown>): ChannelSubGroup {
  return {
    id:           Number(g.id),
    name:         toStr(g.name, ''),
    avatar:       (g.avatar as string | undefined) ?? null,
    description:  (g.description as string | undefined) ?? null,
    membersCount: Number(g.members_count ?? 0),
    isMember:     Boolean(g.is_member),
    createdTime:  toStr(g.created_time, ''),
  };
}

export async function listChannelGroups(token: string, channelId: number): Promise<{ ok: boolean; groups: ChannelSubGroup[]; error?: string }> {
  const resp = await nodePost<Record<string, unknown>>('/api/node/channel/groups/list', token, { channel_id: channelId });
  const status = Number(resp.api_status ?? 0);
  const raw = (resp.groups ?? []) as Record<string, unknown>[];
  return {
    ok: status === 200,
    groups: Array.isArray(raw) ? raw.map(normaliseChannelSubGroup) : [],
    error: resp.error_message as string | undefined,
  };
}

export async function createChannelGroup(
  token: string, channelId: number, groupName: string, description?: string
): Promise<{ ok: boolean; groupId?: number; error?: string }> {
  const resp = await nodePost<Record<string, unknown>>('/api/node/channel/groups/create', token, {
    channel_id: channelId, group_name: groupName, description,
  });
  const status = Number(resp.api_status ?? 0);
  return { ok: status === 200, groupId: resp.group_id ? Number(resp.group_id) : undefined, error: resp.error_message as string | undefined };
}

export async function detachChannelGroup(token: string, channelId: number, groupId: number): Promise<void> {
  await nodePost('/api/node/channel/groups/detach', token, { channel_id: channelId, group_id: groupId });
}

function normaliseGroupMessage(m: Record<string, unknown>): MessageItem {
  const base = normaliseMessage(m);
  return {
    ...base,
    group_id:    m.group_id ? Number(m.group_id) : undefined,
    sender_name: m.sender_name ? toStr(m.sender_name) : m.user_data
      ? toStr((m.user_data as Record<string, unknown>).name ?? (m.user_data as Record<string, unknown>).username, '')
      : undefined,
  };
}

function normaliseGroupMessages(payload: Record<string, unknown>): MessagesResponse {
  const arr = (payload.messages ?? []) as Record<string, unknown>[];
  return {
    api_status: String(payload.api_status ?? '200'),
    messages: Array.isArray(arr) ? arr.map(normaliseGroupMessage) : []
  };
}

// ─── Channels ─────────────────────────────────────────────────────────────────

// Shared with resolveChannelByUsername below — was duplicated inline here
// only, so a single-channel fetch (deep links, "open by username") had no
// existing mapper to reuse.
function toChannelItem(c: Record<string, unknown>): ChannelItem {
  return {
    id:                Number(c.id ?? c.channel_id),
    name:              toStr(c.name, 'Channel'),
    username:          c.username as string | undefined,
    avatar_url:        (c.avatar_url ?? c.avatar) as string | undefined,
    subscribers_count: Number(c.subscribers_count ?? 0),
    description:       toStr(c.description, ''),
    is_subscribed:     Boolean(c.is_subscribed),
    is_owner:          Boolean(c.is_owner),
    is_admin:          Boolean(c.is_admin),
    is_premium:        Boolean(c.is_premium),
    is_private:        Boolean(c.is_private),
    last_post:         c.last_post as string | undefined,
    time:              c.time as string | undefined,
    unread_count:      Number(c.unread_count ?? 0),
    last_read_post_id: c.last_read_post_id != null ? Number(c.last_read_post_id) : undefined,
    settings:          (c.settings ?? undefined) as ChannelSettings | undefined,
  };
}

export async function loadChannels(token: string): Promise<GenericListResponse<ChannelItem>> {
  const resp = await nodePost<Record<string, unknown>>('/api/node/channel/list', token, {
    type: 'get_subscribed', limit: 50, offset: 0
  });
  const raw  = (resp.channels ?? resp.data ?? []) as Record<string, unknown>[];
  const data: ChannelItem[] = Array.isArray(raw) ? raw.map(toChannelItem) : [];
  return { api_status: '200', data };
}

/** Resolves a channel invite link's username slug to a full ChannelItem —
 *  used by deep-link handling (web URL parsing, Windows custom-protocol
 *  handler, Android App Links) to open a channel the user may not be
 *  subscribed to yet, which loadChannels() alone can't do (it only returns
 *  channels already subscribed). Backend: channel/resolve, added 2026-09-16
 *  specifically for this — see routes/channels/management.js. */
export async function resolveChannelByUsername(token: string, username: string): Promise<ChannelItem | null> {
  try {
    const resp = await nodePost<Record<string, unknown>>('/api/node/channel/resolve', token, { username });
    if (Number(resp.api_status) !== 200 || !resp.channel) return null;
    return toChannelItem(resp.channel as Record<string, unknown>);
  } catch (e) {
    console.error('[resolveChannelByUsername]', e);
    return null;
  }
}

/** Minimal, membership-agnostic group shape for an invite-link preview card. */
export interface GroupPreviewItem {
  id: number;
  name: string;
  avatar?: string;
  members_count: number;
  is_private: boolean;
  is_member: boolean;
}

/** Preview a group by id from its `https://worldmates.club/join/group/{id}` invite
 *  link WITHOUT joining it — works even for a private group / non-member (holding
 *  the link is the authorization). Backend: group/preview, added 2026-09-16
 *  alongside channel/resolve — see routes/groups/management.js#previewById. */
export async function previewGroup(token: string, groupId: number): Promise<GroupPreviewItem | null> {
  try {
    const resp = await nodePost<Record<string, unknown>>('/api/node/group/preview', token, { group_id: groupId });
    if (Number(resp.api_status) !== 200 || !resp.group) return null;
    const g = resp.group as Record<string, unknown>;
    return {
      id:            Number(g.id),
      name:          toStr(g.name, 'Group'),
      avatar:        g.avatar as string | undefined,
      members_count: Number(g.members_count ?? 0),
      is_private:    Boolean(g.is_private),
      is_member:     Boolean(g.is_member),
    };
  } catch (e) {
    console.error('[previewGroup]', e);
    return null;
  }
}

export async function markChannelRead(token: string, channelId: number, lastPostId: number): Promise<void> {
  if (!lastPostId) return;
  try { await nodePost('/api/node/channel/list', token, { type: 'mark_read', channel_id: channelId, last_post_id: lastPostId }); }
  catch (e) { console.warn('[markChannelRead] failed', channelId, e); }
}

export async function createChannel(token: string, name: string, description: string): Promise<void> {
  await nodePost('/api/node/channel/create', token, { name, description });
}

// Category-based "similar channels" recommendations for a given channel.
export async function loadSimilarChannels(token: string, channelId: number): Promise<ChannelItem[]> {
  const resp = await nodePost<Record<string, unknown>>('/api/node/channel/similar', token, {
    channel_id: channelId, limit: 100,
  });
  const raw = (resp.channels ?? resp.data ?? []) as Record<string, unknown>[];
  return Array.isArray(raw) ? raw.map(c => ({
    id:                Number(c.id ?? c.channel_id),
    name:              toStr(c.name, 'Channel'),
    username:          c.username as string | undefined,
    avatar_url:        (c.avatar_url ?? c.avatar) as string | undefined,
    subscribers_count: Number(c.subscribers_count ?? 0),
    description:       toStr(c.description, ''),
    is_subscribed:     Boolean(c.is_subscribed),
    is_owner:          Boolean(c.is_owner),
    is_admin:          Boolean(c.is_admin),
  })) : [];
}

// ─── Recommended / Discover channels ───────────────────────────────────────────
// Curated list shown on the "Discover" screen (RecommendedChannels.tsx) — distinct
// from loadSimilarChannels() above, which is category-based recommendations FROM
// an already-open channel. The endpoint path is kept in the legacy "*.php" shape
// by backend convention, same as loadCallHistory()'s '/api/v2/call_history.php'
// below: that is NOT the old PHP server (API_BASE_URL / worldmates.club:443,
// removed entirely 2026-08-19 — see the Call history comment for the full
// story). It is requested via nodePost() like every other endpoint in this file,
// i.e. NODE_BASE_URL (port 449) + 'access-token' header, form-encoded body.
export interface RecommendedChannel {
  id:                number;
  name:              string;
  username?:         string;
  avatar_url?:       string;
  cover_url?:        string;
  description:       string;
  subscribers_count: number;
  posts_count:       number;
  is_subscribed:     boolean;
  is_verified:       boolean;
  category?:         string;
}

export async function loadRecommendedChannels(token: string): Promise<RecommendedChannel[]> {
  const resp = await nodePost<Record<string, unknown>>('/api/v2/channels.php', token, { type: 'get_recommended' });
  const raw  = (resp.channels ?? resp.data ?? []) as Record<string, unknown>[];
  return Array.isArray(raw) ? raw.map(c => ({
    id:                Number(c.id ?? c.channel_id),
    name:              toStr(c.name, 'Channel'),
    username:          c.username as string | undefined,
    avatar_url:        (c.avatar_url ?? c.avatar) as string | undefined,
    cover_url:         (c.cover_url ?? c.cover) as string | undefined,
    description:       toStr(c.description, ''),
    subscribers_count: Number(c.subscribers_count ?? 0),
    posts_count:       Number(c.posts_count ?? 0),
    is_subscribed:     Boolean(c.is_subscribed),
    is_verified:       Boolean(c.is_verified),
    category:          c.category != null ? toStr(c.category) : undefined,
  })) : [];
}

export interface ChannelPollOption {
  id: number; text: string; vote_count: number; percent: number; is_voted: boolean;
}
export interface ChannelPollItem {
  id: number; question: string; poll_type?: string;
  is_anonymous: boolean; allows_multiple_answers?: boolean; is_closed: boolean;
  total_votes: number; created_time?: number; post_id?: number | null;
  options: ChannelPollOption[];
}

// All polls of a channel (not just the ones in already-loaded posts).
export async function loadChannelPolls(token: string, channelId: number): Promise<ChannelPollItem[]> {
  const resp = await nodePost<Record<string, unknown>>('/api/node/channel/poll/list', token, {
    channel_id: channelId, limit: 200,
  });
  const raw = (resp.polls ?? resp.data ?? []) as Record<string, unknown>[];
  return Array.isArray(raw) ? raw.map(p => ({
    id:            Number(p.id),
    question:      toStr(p.question, ''),
    poll_type:     p.poll_type as string | undefined,
    is_anonymous:  Boolean(p.is_anonymous),
    allows_multiple_answers: Boolean(p.allows_multiple_answers),
    is_closed:     Boolean(p.is_closed),
    total_votes:   Number(p.total_votes ?? 0),
    created_time:  Number(p.created_time ?? 0),
    post_id:       p.post_id != null ? Number(p.post_id) : null,
    options: Array.isArray(p.options) ? (p.options as Record<string, unknown>[]).map(o => ({
      id:         Number(o.id),
      text:       toStr(o.text, ''),
      vote_count: Number(o.vote_count ?? 0),
      percent:    Number(o.percent ?? 0),
      is_voted:   Boolean(o.is_voted),
    })) : [],
  })) : [];
}

function normalisePostMediaType(t: string): string {
  const s = t.toLowerCase();
  return s === 'photo' ? 'image' : s;
}

// Parse inline button rows coming from the server (or a socket payload).
// Tolerant of malformed data — anything that isn't {label, url} is dropped.
export function normalisePostButtons(raw: unknown): PostButton[][] | undefined {
  let parsed = raw;
  if (typeof raw === 'string') {
    try { parsed = JSON.parse(raw); } catch { return undefined; }
  }
  if (!Array.isArray(parsed)) return undefined;
  const rows: PostButton[][] = [];
  for (const rawRow of parsed) {
    if (!Array.isArray(rawRow)) continue;
    const row: PostButton[] = [];
    for (const b of rawRow) {
      if (!b || typeof b !== 'object') continue;
      const btn = b as Record<string, unknown>;
      const label = toStr(btn.label, '').trim();
      const url = toStr(btn.url, '').trim();
      if (!label || !url) continue;
      if (!/^https?:\/\//i.test(url) && !/^post:\d+$/.test(url)) continue;
      const icon = toStr(btn.icon, '').trim();
      row.push(icon ? { label, url, icon } : { label, url });
    }
    if (row.length) rows.push(row);
  }
  return rows.length ? rows : undefined;
}

function normaliseChannelPost(raw: Record<string, unknown>, channelId?: number): ChannelPost {
  // Server returns media as List<PostMedia> each with {url, type, filename}
  const rawMedia   = raw.media;
  const mediaList: Record<string, unknown>[] = Array.isArray(rawMedia) ? rawMedia : [];
  const mediaItems = mediaList.map(m => ({
    url:           toStr(m.url ?? m.file_url ?? m.filename, ''),
    type:          normalisePostMediaType(toStr(m.type, 'file')),
    thumbnail_url: m.thumbnail_url ? toStr(m.thumbnail_url, '') : undefined,
  })).filter(m => m.url.length > 0);

  const first     = mediaItems[0];
  const mediaUrl  = first?.url;
  const mediaType = first ? normalisePostMediaType(first.type) : undefined;

  // Poll normalization
  let poll: ChannelPoll | undefined;
  if (raw.poll && typeof raw.poll === 'object') {
    const p = raw.poll as Record<string, unknown>;
    const opts = (p.options ?? []) as Record<string, unknown>[];
    poll = {
      id:                      Number(p.id ?? 0),
      question:                toStr(p.question, ''),
      poll_type:               toStr(p.poll_type, 'regular'),
      is_anonymous:            Boolean(p.is_anonymous ?? true),
      allows_multiple_answers: Boolean(p.allows_multiple_answers),
      is_closed:               Boolean(p.is_closed),
      total_votes:             Number(p.total_votes ?? 0),
      options: Array.isArray(opts) ? opts.map(o => ({
        id:         Number(o.id ?? 0),
        text:       toStr(o.text, ''),
        vote_count: Number(o.vote_count ?? 0),
        percent:    Number(o.percent ?? 0),
        is_voted:   Boolean(o.is_voted),
      } as PollOption)) : [],
    };
  }

  return {
    id:             Number(raw.id ?? 0),
    // formatPost() on the server doesn't echo channel_id back on each post
    // (it's the same for every post in the page), so the caller's requested
    // channelId is the source of truth — raw.channel_id/page_id are fallbacks.
    channel_id:     Number(channelId ?? raw.channel_id ?? raw.page_id ?? 0),
    publisher_id:   Number(raw.author_id ?? raw.publisher_id ?? 0),
    author_name:    typeof raw.author_name === 'string' && raw.author_name ? raw.author_name : undefined,
    author_avatar:  typeof raw.author_avatar === 'string' && raw.author_avatar ? raw.author_avatar : undefined,
    text:           toStr(raw.text, ''),
    media:          mediaUrl && mediaUrl.length > 0 ? mediaUrl : undefined,
    media_type:     mediaType,
    media_items:    mediaItems.length > 0 ? mediaItems : undefined,
    buttons:        normalisePostButtons(raw.buttons),
    poll,
    giveaway:       parseGiveawayRef(raw.giveaway),
    reactions:      (raw.reactions as MessageReaction[] | undefined),
    comments_count: Number(raw.comments_count ?? 0),
    views_count:    Number(raw.views_count ?? raw.view_count ?? 0),
    time:           raw.created_time ? new Date(Number(raw.created_time) * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : toStr(raw.time, undefined),
    time_unix:      raw.created_time ? Number(raw.created_time) : undefined,
    is_pinned:      Boolean(raw.is_pinned),
    is_edited:      Boolean(raw.is_edited),
    edited_time:    raw.edited_time ? Number(raw.edited_time) : undefined,
  };
}

export async function voteChannelPoll(token: string, pollId: number, optionIds: number[]): Promise<ChannelPoll | null> {
  if (!optionIds.length) return null;
  const resp = await nodePost<Record<string, unknown>>('/api/node/channel/poll/vote', token, {
    poll_id:    pollId,
    option_ids: optionIds.join(','),
  });
  const p = resp.poll as Record<string, unknown> | undefined;
  if (!p) return null;
  return {
    id:                      Number(p.id ?? pollId),
    question:                toStr(p.question, ''),
    poll_type:               toStr(p.poll_type, 'regular'),
    is_anonymous:            Boolean(p.is_anonymous),
    allows_multiple_answers: Boolean(p.allows_multiple_answers),
    is_closed:               Boolean(p.is_closed),
    total_votes:             Number(p.total_votes ?? 0),
    options: Array.isArray(p.options) ? (p.options as Record<string, unknown>[]).map(o => ({
      id:         Number(o.id ?? 0),
      text:       toStr(o.text, ''),
      vote_count: Number(o.vote_count ?? 0),
      percent:    Number(o.percent ?? 0),
      is_voted:   Boolean(o.is_voted),
    })) : [],
  };
}

const WM_BASE = 'https://worldmates.club';
function resolveMediaUrl(url: unknown): string | undefined {
  if (!url || typeof url !== 'string' || !url.trim()) return undefined;
  if (/^https?:\/\//i.test(url)) return url;
  if (/^wm-cache:\/\//i.test(url)) return url;   // local media cache, pass through unchanged
  return `${WM_BASE}/${url.replace(/^\//, '')}`;
}

export async function loadChannelComments(token: string, postId: number, offset = 0): Promise<ChannelComment[]> {
  const resp = await nodePost<Record<string, unknown>>('/api/node/channel/comments', token, {
    post_id: postId, limit: 50, offset
  });
  const raw = (resp.comments ?? resp.data ?? []) as Record<string, unknown>[];
  if (!Array.isArray(raw)) return [];
  return raw.map(c => {
    // The backend stores media (stickers + voice) in the `sticker` column, so the
    // round-tripped URL comes back under `sticker`. Check the alternatives too.
    const rawUrl = c.sticker ?? c.stickers ?? c.sticker_url ?? c.media_url ?? c.media;
    const url    = resolveMediaUrl(rawUrl as string | undefined);

    if (!url) {
      return { ...c, sticker: undefined, media_url: undefined, media_type: undefined } as ChannelComment;
    }

    const p = url.split('?')[0].toLowerCase();

    // Voice/audio: explicit type, VOICE_ filename marker, or audio extension
    const explicitType = String(c.media_type ?? c.type ?? '').toLowerCase();
    const isVoice =
      explicitType.includes('voice') || explicitType.includes('audio') ||
      /\/voice_/i.test(url) ||
      /\.(mp3|ogg|opus|m4a|aac|flac|wav|weba)$/.test(p) ||
      (p.endsWith('.webm') && /\/voice_/i.test(url));

    if (isVoice) {
      return { ...c, sticker: undefined, media_url: url, media_type: 'voice' } as ChannelComment;
    }

    // Everything else is a sticker / animated emoji / gif — keep it in `sticker`
    // and let the renderer pick Lottie / gif / img based on the extension.
    return { ...c, sticker: url, media_url: undefined, media_type: 'sticker' } as ChannelComment;
  });
}

export async function addChannelComment(token: string, postId: number, text: string, replyToId?: number, sticker?: string): Promise<void> {
  const body: Record<string, unknown> = { post_id: postId, text, write_as: 'user' };
  if (replyToId) body.reply_to_id = replyToId;
  if (sticker) body.sticker = sticker;
  const r = await nodePost<Record<string, unknown>>('/api/node/channel/add-comment', token, body);
  // The server answers refusals (karma restriction, moderation, bans) with an
  // api_status in the body; every caller used to ignore it, so a blocked
  // comment silently vanished. Tell the user, then reject for the caller.
  if (r && r.api_status != null && Number(r.api_status) !== 200) {
    const msg = r.error_code === 'KARMA_RESTRICTED' ? tr('karma.replyBlocked') : toStr(r.error_message, tr('gw.err.generic'));
    emitToast(msg, 'error');
    throw new Error(msg);
  }
}

export async function sendChannelCommentVoice(token: string, postId: number, voiceFile: File, replyToId?: number): Promise<void> {
  const text   = await doUpload(`${NODE_BASE_URL}/api/node/chat/upload`, token, { type: 'voice' }, voiceFile);
  const upload = await parseJson<Record<string, string>>(text);
  const mediaUrl = upload.audio ?? upload.video ?? upload.file
    ?? upload.audio_src ?? upload.video_src ?? upload.file_src ?? '';
  if (!mediaUrl) return;
  // The backend comment table only persists `text` + `sticker`, so we ship the
  // voice URL through the sticker field; loadChannelComments detects it as voice
  // from the VOICE_ filename / audio extension and renders the audio player.
  await addChannelComment(token, postId, '', replyToId, mediaUrl);
}

// ─── Phase 2: pack catalogue (stickers / emoji / gifs from Strapi) ────────────

export type PackItem = { url: string; emoji?: string | null };
export type PackSummary = {
  slug: string; title: string; type: 'sticker' | 'emoji' | 'gif';
  cover?: string | null; item_count: number;
  premium: boolean; stars_price: number; owned: boolean;
  items: PackItem[];
};

/**
 * Transient network hiccups (one dropped request, a brief proxy blip) are normal
 * and expected — retrying once or twice almost always succeeds. Callers of
 * loadPackCatalog/loadPack latch a "loaded" flag on the first response and never
 * retry again for the rest of the app session, so a single failed attempt here
 * used to mean the sticker/W-GIF catalog stayed empty until the app restarted.
 */
async function withRetry<T>(fn: () => Promise<T>, times = 2, delayMs = 500): Promise<T> {
  let lastErr: unknown;
  for (let attempt = 0; attempt <= times; attempt++) {
    try { return await fn(); }
    catch (e) {
      lastErr = e;
      if (attempt < times) await new Promise(r => setTimeout(r, delayMs * (attempt + 1)));
    }
  }
  throw lastErr;
}

export async function loadPackCatalog(
  token: string, type: 'sticker' | 'emoji' | 'gif', page = 1, q = '', pageSize = 40,
): Promise<{ packs: PackSummary[]; total: number }> {
  try {
    const qs = `type=${type}&page=${page}&pageSize=${pageSize}${q ? `&q=${encodeURIComponent(q)}` : ''}`;
    const r = await withRetry(() => nodeGet<{ packs?: PackSummary[]; total?: number }>(`/api/node/packs?${qs}`, token));
    return { packs: r.packs ?? [], total: Number(r.total ?? (r.packs?.length ?? 0)) };
  } catch { return { packs: [], total: 0 }; }
}

export async function loadPack(token: string, slug: string): Promise<PackSummary | null> {
  try {
    const r = await withRetry(() => nodeGet<{ pack?: PackSummary }>(`/api/node/packs/${encodeURIComponent(slug)}`, token));
    return r.pack ?? null;
  } catch { return null; }
}

export async function buyPack(token: string, slug: string): Promise<{ ok: boolean; new_balance?: number; error?: string; required?: number; balance?: number }> {
  try {
    const r = await nodePost<Record<string, unknown>>(`/api/node/packs/${encodeURIComponent(slug)}/buy`, token, {});
    if (Number(r.api_status) !== 200) return { ok: false, error: String(r.error_message ?? 'failed'), required: Number(r.required ?? 0), balance: Number(r.balance ?? 0) };
    return { ok: true, new_balance: Number(r.new_balance ?? 0) };
  } catch { return { ok: false, error: 'network' }; }
}

export async function loadChannelPacks(token: string, channelId: number): Promise<PackSummary[]> {
  try {
    const r = await nodeGet<{ packs?: PackSummary[] }>(`/api/node/channels/${channelId}/packs`, token);
    return r.packs ?? [];
  } catch { return []; }
}

export interface TgStickerItem { file_url: string; thumb_url?: string; emoji: string; is_animated: boolean; is_video: boolean; }
export interface TgStickerSetResponse { api_status: number; error_message?: string; name?: string; title?: string; stickers?: TgStickerItem[]; }
export interface TgSharedPack { name: string; title: string; stickers: TgStickerItem[]; addedAt: number; }

export async function fetchTelegramStickerSet(token: string, setName: string): Promise<TgStickerSetResponse> {
  try {
    return await nodeGet<TgStickerSetResponse>(`/api/telegram/sticker-set/${encodeURIComponent(setName)}`, token);
  } catch { return { api_status: 500, error_message: 'network' }; }
}

export async function getSharedTgPacks(token: string): Promise<TgSharedPack[]> {
  try {
    const r = await nodeGet<{ packs?: TgSharedPack[] }>('/api/node/telegram/packs', token);
    return r.packs ?? [];
  } catch { return []; }
}

export async function addSharedTgPack(token: string, setName: string): Promise<{ ok: boolean; pack?: TgSharedPack; error?: string }> {
  try {
    const r = await nodePost<{ api_status: number; pack?: TgSharedPack; error_message?: string }>(
      '/api/node/telegram/packs', token, { set_name: setName }
    );
    if (r.api_status !== 200) return { ok: false, error: r.error_message ?? 'failed' };
    return { ok: true, pack: r.pack };
  } catch { return { ok: false, error: 'network' }; }
}

export async function removeSharedTgPack(token: string, name: string): Promise<void> {
  try {
    await fetch(`/api/node/telegram/packs/${encodeURIComponent(name)}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch {}
}

export async function addChannelPack(token: string, channelId: number, slug: string, type: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const r = await nodePost<Record<string, unknown>>(`/api/node/channels/${channelId}/packs`, token, { slug, type });
    if (Number(r.api_status) !== 200) return { ok: false, error: String(r.error_message ?? 'failed') };
    return { ok: true };
  } catch { return { ok: false, error: 'network' }; }
}

export async function removeChannelPack(token: string, channelId: number, slug: string): Promise<void> {
  await nodeDelete(`/api/node/channels/${channelId}/packs/${encodeURIComponent(slug)}`, token).catch(() => {});
}

/** Publish a new pack from image URLs (creator/bot). Returns the new slug. */
export async function publishPack(token: string, data: { title: string; type: string; premium: boolean; stars_price: number; items: string[]; cover?: string }): Promise<{ ok: boolean; slug?: string; error?: string }> {
  try {
    const r = await nodePost<Record<string, unknown>>('/api/node/packs/publish', token, data as Record<string, unknown>);
    if (Number(r.api_status) !== 200) return { ok: false, error: String(r.error_message ?? 'failed') };
    return { ok: true, slug: String(r.slug ?? '') };
  } catch { return { ok: false, error: 'network' }; }
}

export async function deleteChannelComment(token: string, commentId: number): Promise<void> {
  await nodePost('/api/node/channel/delete-comment', token, { comment_id: commentId });
}

export async function reactToChannelComment(token: string, commentId: number, emoji: string): Promise<void> {
  await nodePost('/api/node/channel/comment-reaction', token, { comment_id: commentId, reaction: emoji });
}

// NOTE: these used to send an `offset` field — the backend (routes/channels/
// posts.js) never reads req.body.offset at all, so "load more" silently
// refetched the same newest page every time instead of paging back through
// history. Replaced with the real id-cursor contract the server supports:
// before_post_id (older), after_post_id (newer), around_post_id (anchor).

export async function loadChannelPosts(
  token: string, channelId: number, opts?: { aroundPostId?: number }
): Promise<ChannelPostsResponse> {
  const body: Record<string, unknown> = { channel_id: channelId, limit: 30 };
  if (opts?.aroundPostId) body.around_post_id = opts.aroundPostId;
  const resp = await nodePost<Record<string, unknown>>('/api/node/channel/posts', token, body);
  const raw = (resp.posts ?? resp.data ?? []) as Record<string, unknown>[];
  return {
    api_status: String(resp.api_status ?? '200'),
    posts: Array.isArray(raw) ? raw.map(r => normaliseChannelPost(r, channelId)) : [],
    has_more_older: !!resp.has_more_older,
    has_more_newer: !!resp.has_more_newer,
  };
}

export async function loadMoreChannelPosts(token: string, channelId: number, beforePostId: number): Promise<ChannelPostsResponse> {
  const resp = await nodePost<Record<string, unknown>>('/api/node/channel/posts', token, {
    channel_id: channelId, limit: 30, before_post_id: beforePostId
  });
  const raw = (resp.posts ?? resp.data ?? []) as Record<string, unknown>[];
  return {
    api_status: String(resp.api_status ?? '200'),
    posts: Array.isArray(raw) ? raw.map(r => normaliseChannelPost(r, channelId)) : [],
    has_more_older: !!resp.has_more_older,
  };
}

/** Page forward toward the latest post — only needed when an aroundPostId
 * anchor fetch truncated the newer side (has_more_newer). */
export async function loadNewerChannelPosts(token: string, channelId: number, afterPostId: number): Promise<ChannelPostsResponse> {
  const resp = await nodePost<Record<string, unknown>>('/api/node/channel/posts', token, {
    channel_id: channelId, limit: 30, after_post_id: afterPostId
  });
  const raw = (resp.posts ?? resp.data ?? []) as Record<string, unknown>[];
  return {
    api_status: String(resp.api_status ?? '200'),
    posts: Array.isArray(raw) ? raw.map(r => normaliseChannelPost(r, channelId)) : [],
    has_more_newer: !!resp.has_more_newer,
  };
}

export interface CreateChannelPostOptions {
  text:             string;
  /** JSON array: [{url, type, thumbnail_url?}, ...] — albums are kept whole, also when scheduled. */
  mediaUrls?:       string;
  /** Unix seconds in the future → stored in wm_channel_scheduled_posts, published by the server. */
  publishAt?:       number;
  /** No push / socket notification to subscribers. */
  silent?:          boolean;
  disableComments?: boolean;
  /** Inline button rows. NOTE: routes/channels/posts.js does not store them yet. */
  buttons?:         PostButton[][];
  /** Repeat schedule. NOTE: scheduled-posts.js has no repeat support yet. */
  repeat?:          string;
}

export type CreateChannelPostResult =
  | { ok: true; scheduled: false; postId: number }
  | { ok: true; scheduled: true; scheduledId: number; publishAt: number }
  | { ok: false; error: string };

// Android 1.55.0 protocol (routes/channels/posts.js). The server reads
// `publish_at` — this client used to send `scheduled_at`, which the server
// never read, so every "scheduled" Windows post went out immediately.
export async function createChannelPost(
  token: string, channelId: number, opts: CreateChannelPostOptions,
): Promise<CreateChannelPostResult> {
  const body: Record<string, unknown> = { channel_id: channelId, text: opts.text };
  if (opts.mediaUrls) body.media_urls = opts.mediaUrls;
  const nowSec = Math.floor(Date.now() / 1000);
  if (opts.publishAt && opts.publishAt > nowSec + 50) body.publish_at = Math.floor(opts.publishAt);
  if (opts.silent) body.silent = 1;
  if (opts.disableComments) body.disable_comments = 1;
  if (opts.repeat && opts.repeat !== 'once') body.repeat = opts.repeat;
  if (opts.buttons && opts.buttons.length) body.buttons = JSON.stringify(opts.buttons);
  try {
    const r = await nodePost<Record<string, unknown>>('/api/node/channel/create-post', token, body);
    if (Number(r.api_status) !== 200) return { ok: false, error: toStr(r.error_message, 'failed') };
    if (r.scheduled) {
      return { ok: true, scheduled: true, scheduledId: Number(r.scheduled_id ?? 0), publishAt: Number(r.publish_at ?? body.publish_at ?? 0) };
    }
    return { ok: true, scheduled: false, postId: Number(r.post_id ?? 0) };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'network' };
  }
}

// ─── Channel Livestream ─────────────────────────────────────────────────────

export interface ActiveStreamInfo {
  id: number;
  roomName: string;
  title: string | null;
  hostUserId: number;
  hostName: string;
  hostAvatar: string | null;
  viewerCount: number;
  startedAt: number;
}

export async function getActiveChannelLivestream(token: string, channelId: number): Promise<ActiveStreamInfo | null> {
  try {
    const resp = await nodeGet<Record<string, unknown>>(`/api/node/channels/${channelId}/livestream/active`, token);
    if (!resp || resp.api_status === 404 || !resp.stream) return null;
    const s = resp.stream as Record<string, unknown>;
    return {
      id:          Number(s.id ?? 0),
      roomName:    String(s.room_name ?? ''),
      title:       s.title ? String(s.title) : null,
      hostUserId:  Number(s.host_user_id ?? 0),
      hostName:    String(s.host_name ?? ''),
      hostAvatar:  s.host_avatar ? String(s.host_avatar) : null,
      viewerCount: Number(s.viewer_count ?? 0),
      startedAt:   Number(s.started_at ?? 0),
    };
  } catch { return null; }
}

// LiveKit-backed livestream. The Node server returns a LiveKit room URL + a
// short-lived access token; the client connects with the livekit-client SDK.
// The legacy `ice_servers` / manual signaling fields are gone.

export interface StartLivestreamResult {
  streamId:         number;
  roomName:         string;
  quality:          string;
  isPremium:        boolean;
  livekitUrl:       string;
  token:            string;
  identity:         string;
  allowedQualities: string[];
  targetBitrate:    number;   // kbps — convert to bps before passing to LiveKit
  recording:        boolean;
  reconnected:      boolean;
}

export interface StreamSocialLink { label: string; url: string; icon?: string; }

export interface JoinLivestreamResult {
  streamId:    number;
  roomName:    string;
  quality:     string;
  livekitUrl:  string;
  token:       string;
  identity:    string;
  hostUserId:  number;
  hostName:    string;
  hostAvatar:  string;
  title:       string | null;
  description: string | null;
  category:    string | null;
  socialLinks: StreamSocialLink[];
  isAdult:     boolean;
  chatMode:    'all' | 'followers';
  following:      boolean;
  followerCount:  number;
  isHost:         boolean;
}

export interface ObsLivestreamResult {
  streamId:         number;
  roomName:         string;
  rtmpUrl:          string;
  streamKey:        string;
  ingressReachable: boolean;
}

export async function startChannelLivestream(
  token: string,
  channelId: number,
  opts?: {
    quality?:         string;
    title?:           string;
    description?:     string;
    category?:        string;
    tags?:            string;
    enableRecording?: boolean;
    socialLinks?:     StreamSocialLink[];
    isAdult?:         boolean;
    chatMode?:        'all' | 'followers';
    notifyOnStart?:   boolean;
  },
): Promise<StartLivestreamResult> {
  const body: Record<string, unknown> = {
    quality:          opts?.quality ?? 'auto',
    title:            opts?.title       ?? '',
    description:      opts?.description ?? '',
    category:         opts?.category    ?? '',
    tags:             opts?.tags        ?? '',
    enable_recording: opts?.enableRecording ?? true,
    social_links:     opts?.socialLinks ?? [],
    is_adult:         opts?.isAdult ?? false,
    chat_mode:        opts?.chatMode ?? 'all',
    notify_on_start:  opts?.notifyOnStart ?? true,
  };
  const resp = await nodePost<Record<string, unknown>>(`/api/node/channels/${channelId}/livestream/start`, token, body);
  return {
    streamId:         Number(resp.stream_id ?? 0),
    roomName:         String(resp.room_name ?? ''),
    quality:          String(resp.quality ?? ''),
    isPremium:        Boolean(resp.is_premium),
    livekitUrl:       String(resp.livekit_url ?? ''),
    token:            String(resp.token ?? ''),
    identity:         String(resp.identity ?? ''),
    allowedQualities: Array.isArray(resp.allowed_qualities) ? (resp.allowed_qualities as string[]) : [],
    targetBitrate:    Number(resp.target_bitrate ?? 0),
    recording:        Boolean(resp.recording),
    reconnected:      Boolean(resp.reconnected),
  };
}

export async function endChannelLivestream(token: string, channelId: number): Promise<void> {
  await nodePost(`/api/node/channels/${channelId}/livestream/end`, token, {});
}

export async function updateChannelLivestream(
  token: string,
  channelId: number,
  opts?: {
    title?:       string;
    description?: string;
    category?:    string;
    tags?:        string;
  },
): Promise<void> {
  const body: Record<string, unknown> = {};
  if (opts?.title       !== undefined) body.title       = opts.title;
  if (opts?.description !== undefined) body.description = opts.description;
  if (opts?.category    !== undefined) body.category    = opts.category;
  if (opts?.tags        !== undefined) body.tags        = opts.tags;
  await nodePut(`/api/node/channels/${channelId}/livestream/update`, token, body);
}

export async function joinChannelLivestream(token: string, channelId: number): Promise<JoinLivestreamResult> {
  const resp = await nodePost<Record<string, unknown>>(`/api/node/channels/${channelId}/livestream/join`, token, {});
  return {
    streamId:    Number(resp.stream_id ?? 0),
    roomName:    String(resp.room_name ?? ''),
    quality:     String(resp.quality ?? ''),
    livekitUrl:  String(resp.livekit_url ?? ''),
    token:       String(resp.token ?? ''),
    identity:    String(resp.identity ?? ''),
    hostUserId:  Number(resp.host_user_id ?? 0),
    hostName:    String(resp.host_name ?? ''),
    hostAvatar:  String(resp.host_avatar ?? ''),
    title:       resp.title ? String(resp.title) : null,
    description: resp.description ? String(resp.description) : null,
    category:    resp.category ? String(resp.category) : null,
    socialLinks: Array.isArray(resp.social_links) ? (resp.social_links as StreamSocialLink[]) : [],
    isAdult:     resp.is_adult === true,
    chatMode:    resp.chat_mode === 'followers' ? 'followers' : 'all',
    following:      resp.following === true,
    followerCount:  Number(resp.follower_count ?? 0),
    isHost:         resp.is_host === true,
  };
}

export async function leaveChannelLivestream(token: string, channelId: number): Promise<void> {
  await nodePost(`/api/node/channels/${channelId}/livestream/leave`, token, {}).catch(() => {});
}

export interface RefreshLivestreamTokenResult { token: string; roomName: string; livekitUrl: string; }
export async function refreshLivestreamToken(token: string, channelId: number): Promise<RefreshLivestreamTokenResult> {
  const resp = await nodePost<Record<string, unknown>>(`/api/node/channels/${channelId}/livestream/refresh-token`, token, {});
  return { token: String(resp.token ?? ''), roomName: String(resp.room_name ?? ''), livekitUrl: String(resp.livekit_url ?? '') };
}

// ── Group calls (LiveKit-backed) ─────────────────────────────────────────────

export type GroupCallType = 'audio' | 'video';

export type GroupCallParticipant = { user_id: number; name: string; avatar: string };

export type GroupCallInfo = {
  roomName: string;
  callType: GroupCallType;
  maxParticipants: number;
  participantCount: number;
  initiatedBy: number;
  participants: GroupCallParticipant[];
};

export type GroupCallJoinResult = {
  ok: boolean;
  full?: boolean;
  roomId: number;
  roomName: string;
  callType: GroupCallType;
  maxParticipants: number;
  participantCount: number;
  livekitUrl: string;
  token: string;
};

/** Active group call info (or null if none). */
export async function getGroupCall(token: string, groupId: number, callType: GroupCallType = 'audio'): Promise<GroupCallInfo | null> {
  const resp = await nodePost<Record<string, any>>('/api/node/group/voice-room/get', token, { group_id: groupId, call_type: callType });
  const room = resp?.room;
  if (!room) return null;
  return {
    roomName:         String(room.room_name ?? ''),
    callType:         room.call_type === 'video' ? 'video' : 'audio',
    maxParticipants:  Number(room.max_participants ?? 6),
    participantCount: Number(room.participant_count ?? 0),
    initiatedBy:      Number(room.initiated_by ?? 0),
    participants:     Array.isArray(room.participants) ? room.participants : [],
  };
}

/** Join or create the group call → LiveKit url + publisher token. */
export async function joinGroupCall(token: string, groupId: number, callType: GroupCallType = 'audio'): Promise<GroupCallJoinResult> {
  const resp = await nodePost<Record<string, any>>('/api/node/group/voice-room/join', token, { group_id: groupId, call_type: callType });
  const full = Number(resp?.api_status) === 409;
  return {
    ok:               Number(resp?.api_status) === 200,
    full,
    roomId:           Number(resp?.room_id ?? 0),
    roomName:         String(resp?.room_name ?? ''),
    callType:         resp?.call_type === 'video' ? 'video' : 'audio',
    maxParticipants:  Number(resp?.max_participants ?? 6),
    participantCount: Number(resp?.participant_count ?? 0),
    livekitUrl:       String(resp?.livekit_url ?? ''),
    token:            String(resp?.token ?? ''),
  };
}

export async function leaveGroupCall(token: string, groupId: number, callType: GroupCallType = 'audio'): Promise<void> {
  await nodePost('/api/node/group/voice-room/leave', token, { group_id: groupId, call_type: callType }).catch(() => {});
}

/** Request RTMP ingest credentials so the host can stream via OBS instead of the browser. */
export async function obsChannelLivestream(
  token: string,
  channelId: number,
  opts?: { quality?: string; title?: string; description?: string; enableRecording?: boolean },
): Promise<ObsLivestreamResult> {
  const body: Record<string, unknown> = {};
  if (opts?.quality          !== undefined) body.quality          = opts.quality;
  if (opts?.title            !== undefined) body.title            = opts.title;
  if (opts?.description      !== undefined) body.description      = opts.description;
  if (opts?.enableRecording  !== undefined) body.enable_recording = opts.enableRecording;
  const resp = await nodePost<Record<string, unknown>>(`/api/node/channels/${channelId}/livestream/obs`, token, body);
  return {
    streamId:         Number(resp.stream_id ?? 0),
    roomName:         String(resp.room_name ?? ''),
    rtmpUrl:          String(resp.rtmp_url ?? ''),
    streamKey:        String(resp.stream_key ?? ''),
    ingressReachable: resp.ingress_reachable !== false,
  };
}

// ─── Channel recordings ────────────────────────────────────────────────────────
//
// Mirrors the Android `RecordingsApi` surface: list, edit metadata, delete.
// Used by ChannelAdminPanel and channel detail screens.

export interface ChannelRecording {
  id:           number;
  roomName:     string;
  type:         string;
  uploaderId:   number;
  filename:     string;
  fileSize:     number;
  duration:     number;
  mimeType:     string;
  title:        string | null;
  description:  string | null;
  createdAt:    string;
}

function normalizeRecording(o: Record<string, unknown>): ChannelRecording {
  return {
    id:          Number(o.id          ?? 0),
    roomName:    String(o.room_name   ?? ''),
    type:        String(o.type        ?? ''),
    uploaderId:  Number(o.uploader_id ?? 0),
    filename:    String(o.filename    ?? ''),
    fileSize:    Number(o.file_size   ?? 0),
    duration:    Number(o.duration    ?? 0),
    mimeType:    String(o.mime_type   ?? ''),
    title:       (o.title       ?? null) as string | null,
    description: (o.description ?? null) as string | null,
    createdAt:   String(o.created_at  ?? ''),
  };
}

export async function listChannelRecordings(token: string, channelId: number): Promise<ChannelRecording[]> {
  const resp = await nodeGet<Record<string, unknown>>(`/api/node/recordings/channel/${channelId}`, token);
  const arr  = (resp.recordings ?? []) as Record<string, unknown>[];
  return Array.isArray(arr) ? arr.map(normalizeRecording) : [];
}

export async function updateChannelRecording(
  token: string,
  recordingId: number,
  title?: string,
  description?: string,
): Promise<void> {
  await nodePut(`/api/node/recordings/${recordingId}`, token, {
    title:       title       ?? '',
    description: description ?? '',
  });
}

export async function deleteChannelRecording(token: string, recordingId: number): Promise<void> {
  await nodeDelete(`/api/node/recordings/${recordingId}`, token);
}

/** Direct URL the <video> element can load — server streams the file with Range support. */
export function channelRecordingUrl(recordingId: number, token: string): string {
  const base = NODE_BASE_URL.replace(/\/$/, '');
  return `${base}/api/node/recordings/file/${recordingId}?access_token=${encodeURIComponent(token)}`;
}

export async function deleteChannelPost(token: string, postId: number): Promise<void> {
  await nodePost('/api/node/channel/delete-post', token, { post_id: postId });
}

export async function editChannelPost(
  token: string, postId: number, text: string,
  buttons?: PostButton[][]   // pass [] to clear existing buttons; undefined = leave as-is
): Promise<{ is_edited: boolean; edited_time?: number; buttons?: PostButton[][] }> {
  const body: Record<string, unknown> = { post_id: postId, text };
  if (buttons !== undefined) body.buttons = JSON.stringify(buttons);
  const resp = await nodePost<Record<string, unknown>>('/api/node/channel/update-post', token, body);
  const post = (resp.post ?? {}) as Record<string, unknown>;
  return {
    is_edited: Boolean(post.is_edited ?? true),
    edited_time: post.edited_time ? Number(post.edited_time) : undefined,
    buttons: normalisePostButtons(post.buttons),
  };
}

export async function muteChannelNotifications(token: string, channelId: number): Promise<void> {
  await nodePost('/api/node/channel/mute', token, { channel_id: channelId });
}

export async function unmuteChannelNotifications(token: string, channelId: number): Promise<void> {
  await nodePost('/api/node/channel/unmute', token, { channel_id: channelId });
}

export async function reactToChannelPost(token: string, postId: number, emoji: string): Promise<void> {
  await nodePost('/api/node/channel/post-reaction', token, { post_id: postId, reaction: emoji }).catch(() => {});
}

export async function markChannelPostViewed(token: string, postId: number): Promise<void> {
  try { await nodePost('/api/node/channel/post-view', token, { post_id: postId }); }
  catch { /* non-critical */ }
}

// ─── Stories ──────────────────────────────────────────────────────────────────

// Server stores story media as relative paths — prefix with site base
const SITE_BASE = NODE_BASE_URL.replace(':449', ''); // https://worldmates.club
function storyAbsUrl(path: string | undefined): string {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${SITE_BASE}/${path.replace(/^\//, '')}`;
}

export async function loadStories(token: string): Promise<GenericListResponse<StoryItem>> {
  const resp = await nodePost<Record<string, unknown>>('/api/node/stories/get', token, { limit: 35 });
  const raw  = (resp.stories ?? resp.data ?? []) as Record<string, unknown>[];
  const data: StoryItem[] = Array.isArray(raw) ? raw.map(normaliseStoryItem) : [];
  return { api_status: '200', data };
}

/** One server story (buildStoryResponse in routes/stories) → StoryItem. */
export function normaliseStoryItem(s: Record<string, unknown>): StoryItem {
    const ud      = (s.user_data    ?? {}) as Record<string, unknown>;
    const images  = (s.images       ?? []) as Record<string, unknown>[];
    const videos  = (s.videos       ?? []) as Record<string, unknown>[];
    const mItems  = (s.mediaItems   ?? []) as Record<string, unknown>[];
    const lc = (v: unknown) => toStr(v, '').toLowerCase();
    const vidItem = videos[0] ?? mItems.find(m => lc(m.type) === 'video');
    const imgItem = images[0] ?? mItems.find(m => lc(m.type) === 'image');
    const audItem = mItems.find(m => lc(m.type) === 'audio' || lc(m.type) === 'music');
    const fileType: 'image' | 'video' | 'audio' = vidItem ? 'video' : audItem ? 'audio' : 'image';
    // IMPORTANT: derive the playable file from the actual media item (what the
    // viewer loads), NOT from `thumbnail`. The server returns thumbnail='' for
    // videos without a cover, and `'' ?? x` keeps the empty string — which left
    // cross-platform stories (e.g. created on Android) with an empty `file`,
    // rendering a blank placeholder stub on Windows. Thumbnail is only a
    // last-resort fallback for legacy stories that carry no media item.
    const mediaFilename =
      fileType === 'video' ? toStr(vidItem?.filename, '')
      : fileType === 'audio' ? toStr(audItem?.filename ?? s.music_url, '')
      : toStr(imgItem?.filename, '');
    const rawFile = mediaFilename || toStr(s.thumbnail, '');
    const file    = storyAbsUrl(rawFile);
    const caption = toStr(s.description ?? s.title, '');
    const firstName = toStr(ud.first_name, '');
    const lastName  = toStr(ud.last_name, '');
    const username  = toStr(ud.username, '');
    const displayName = (firstName + ' ' + lastName).trim() || username || `User ${s.user_id}`;
    const pageData = (s.page_data ?? null) as Record<string, unknown> | null;
    return {
      id:          Number(s.id),
      user_id:     Number(s.user_id),
      user_name:   displayName,
      user_avatar: toStr(ud.avatar, undefined),
      page_id:     s.page_id ? Number(s.page_id) : null,
      page_name:   pageData ? toStr(pageData.name, undefined) : undefined,
      page_avatar: pageData ? toStr(pageData.avatar, undefined) : undefined,
      file,
      thumbnail:   storyAbsUrl(toStr(s.thumbnail, undefined)),
      file_type:   fileType,
      created_at:  s.posted ? new Date(Number(s.posted) * 1000).toLocaleDateString() : '',
      expire_time:   Number(s.expire ?? 0),
      is_seen:       Number(s.is_viewed ?? 0) === 1,
      views_count:   Number(s.view_count ?? 0),
      comment_count: Number(s.comment_count ?? 0),
      is_owner:      Boolean(s.is_owner),
      is_pinned:     Boolean(s.is_pinned),
      posted:        Number(s.posted ?? 0) || undefined,
      caption,
      reaction: (() => {
        const r = (s.reaction ?? {}) as Record<string, unknown>;
        return {
          like:         Number(r.like  ?? 0),
          love:         Number(r.love  ?? 0),
          haha:         Number(r.haha  ?? 0),
          wow:          Number(r.wow   ?? 0),
          sad:          Number(r.sad   ?? 0),
          angry:        Number(r.angry ?? 0),
          is_reacted:   Boolean(r.is_reacted),
          reacted_type: toStr(r.type, undefined),
        };
      })(),
    };
}

export async function markStorySeen(token: string, storyId: number): Promise<void> {
  try { await nodePost('/api/node/stories/mark-viewed', token, { story_id: storyId }); }
  catch { /* non-critical */ }
}

export async function createStory(
  token: string, file: File, fileType: 'image' | 'video' | 'audio',
  caption?: string, videoDuration?: number, coverBlob?: Blob | null
): Promise<void> {
  const fields: Record<string, string> = { file_type: fileType };
  const cap = (caption ?? '').trim();
  if (cap) {
    fields.story_title       = cap.slice(0, 100);
    fields.story_description  = cap.slice(0, 300);
  }
  if ((fileType === 'video' || fileType === 'audio') && videoDuration && videoDuration > 0) {
    fields.video_duration = String(Math.round(videoDuration));
  }
  const extra = coverBlob ? [{ fieldName: 'cover', file: { ...coverBlob, name: 'cover.jpg', type: 'image/jpeg' } }] : [];
  await doUpload(`${NODE_BASE_URL}/api/node/stories/create`, token, fields, file, 'file', extra);
}

export async function deleteStory(token: string, storyId: number): Promise<void> {
  await nodePost('/api/node/stories/delete', token, { story_id: storyId }).catch(() => {});
}

// ─── Profile showcase «Витрина» (routes/users/showcase.js) ────────────────────
// Personal channel + its latest posts + stories pinned to the profile.
// Replaces the old web-timeline feed, which pointed at the retired website.

export async function getUserShowcase(token: string, userId: number): Promise<ProfileShowcase | null> {
  try {
    const r = await nodeGet<Record<string, unknown>>(`/api/node/users/${userId}/showcase`, token);
    if (Number(r.api_status) !== 200) return null;
    const ch = r.channel as Record<string, unknown> | null;
    const posts = (Array.isArray(r.channel_posts) ? r.channel_posts : []) as Record<string, unknown>[];
    const hl = (Array.isArray(r.highlights) ? r.highlights : []) as Record<string, unknown>[];
    return {
      channel: ch ? {
        id:                Number(ch.id),
        name:              toStr(ch.name, ''),
        username:          toStr(ch.username, undefined),
        avatar_url:        toStr(ch.avatar_url, undefined),
        description:       toStr(ch.description, undefined),
        subscribers_count: Number(ch.subscribers_count ?? 0),
        posts_count:       Number(ch.posts_count ?? 0),
        is_subscribed:     Boolean(ch.is_subscribed),
        is_verified:       Boolean(ch.is_verified),
        raw:               ch,
      } : null,
      channel_posts: posts.map(p => ({
        id:              Number(p.id),
        text:            toStr(p.text, ''),
        is_poll:         Boolean(p.is_poll),
        is_giveaway:     Boolean(p.is_giveaway),
        is_paywall:      Boolean(p.is_paywall),
        media_type:      (p.media_type === 'video' || p.media_type === 'image') ? p.media_type : null,
        media_thumb:     absMediaUrl(toStr(p.media_thumb, '')),
        media_count:     Number(p.media_count ?? 0),
        created_time:    Number(p.created_time ?? 0),
        views_count:     Number(p.views_count ?? 0),
        comments_count:  Number(p.comments_count ?? 0),
        reactions_count: Number(p.reactions_count ?? 0),
      })),
      highlights: hl.map(normaliseStoryItem),
      can_edit: Boolean(r.can_edit),
    };
  } catch { return null; }
}

export async function getMyShowcaseChannels(token: string): Promise<{ channels: ShowcaseChannelOption[]; current: number }> {
  try {
    const r = await nodeGet<Record<string, unknown>>('/api/node/users/showcase/my-channels', token);
    const list = (Array.isArray(r.channels) ? r.channels : []) as Record<string, unknown>[];
    return {
      channels: list.map(c => ({
        id: Number(c.id), name: toStr(c.name, ''), username: toStr(c.username, undefined),
        avatar_url: toStr(c.avatar_url, undefined), subscribers_count: Number(c.subscribers_count ?? 0),
      })),
      current: Number(r.personal_channel_id ?? 0),
    };
  } catch { return { channels: [], current: 0 }; }
}

export async function setPersonalChannel(token: string, channelId: number): Promise<{ ok: boolean; error?: string }> {
  try {
    const r = await nodePost<Record<string, unknown>>('/api/node/users/showcase/channel', token, { channel_id: channelId });
    return Number(r.api_status) === 200 ? { ok: true } : { ok: false, error: toStr(r.error_message, 'failed') };
  } catch { return { ok: false, error: 'network' }; }
}

// ─── Channel moderation (routes/channels/moderation.js) ───────────────────────
// Warnings, comment mutes ('comments') and channel bans ('channel'); 0 s = forever.

export type ModUser = { user_id: number; name: string; username?: string; avatar?: string };
export type ModRestriction = { type: 'comments' | 'channel' | 'stream' | 'chat'; expire_time: number; reason: string; ban_time: number };
export type ModWarning = { id: number; reason: string; created_at: number; comment_id?: number | null; user?: ModUser; by?: ModUser };
export type ModUserStatus = {
  user: ModUser; protected: boolean; restrictions: ModRestriction[]; warnings: ModWarning[];
  warnings_recent: number; warn_limit: number; warn_window_days: number;
};
export type ModOverview = {
  role: string;
  restricted: Array<{ user: ModUser; type: ModRestriction['type']; reason: string; ban_time: number; expire_time: number; by: ModUser | null }>;
  warnings: ModWarning[];
  warn_limit: number; warn_window_days: number;
};
type ModResult<T = Record<string, unknown>> = ({ ok: true } & T) | { ok: false; error: string; code?: string };

async function modCall<T = Record<string, unknown>>(path: string, token: string, body: Record<string, unknown>): Promise<ModResult<T>> {
  try {
    const r = await nodePost<Record<string, unknown>>(`/api/node/channel/moderation/${path}`, token, body);
    if (Number(r.api_status) !== 200) return { ok: false, error: toStr(r.error_message, 'failed'), code: toStr(r.error_code, undefined) };
    return { ok: true, ...(r as unknown as T) };
  } catch { return { ok: false, error: 'network' }; }
}
export const modRestrict = (token: string, channelId: number, userId: number, type: 'comments' | 'channel', durationSeconds: number, reason?: string) =>
  modCall<{ expire_time: number }>('restrict', token, { channel_id: channelId, user_id: userId, type, duration_seconds: durationSeconds, reason: reason ?? '' });
export const modLift = (token: string, channelId: number, userId: number, type?: string) =>
  modCall('lift', token, { channel_id: channelId, user_id: userId, ...(type ? { type } : {}) });
export const modWarn = (token: string, channelId: number, userId: number, reason?: string, commentId?: number) =>
  modCall<{ warnings_count: number; warn_limit: number; auto_muted: boolean; expire_time: number }>('warn', token, { channel_id: channelId, user_id: userId, reason: reason ?? '', ...(commentId ? { comment_id: commentId } : {}) });
export const modRemoveWarning = (token: string, channelId: number, warningId: number) =>
  modCall('remove-warning', token, { channel_id: channelId, warning_id: warningId });
export const modUserStatus = (token: string, channelId: number, userId: number) =>
  modCall<ModUserStatus>('user', token, { channel_id: channelId, user_id: userId });
export const modOverview = (token: string, channelId: number) =>
  modCall<ModOverview>('overview', token, { channel_id: channelId });

/** My own stories that still exist (the server keeps the last 24 h + pinned ones). */
export async function getMyStoryArchive(token: string): Promise<StoryItem[]> {
  try {
    const r = await nodePost<Record<string, unknown>>('/api/node/stories/get-archive', token, { limit: 50 });
    const raw = (r.stories ?? []) as Record<string, unknown>[];
    return Array.isArray(raw) ? raw.map(normaliseStoryItem) : [];
  } catch { return []; }
}

/** Server formatChannel() object (showcase) → ChannelItem for setSelectedChannel. */
export function showcaseChannelToItem(raw: Record<string, unknown>): ChannelItem {
  return toChannelItem(raw);
}

export async function setStoryHighlight(token: string, storyId: number, pinned: boolean): Promise<{ ok: boolean; code?: string; error?: string }> {
  try {
    const r = await nodePost<Record<string, unknown>>('/api/node/users/showcase/highlight', token, { story_id: storyId, pinned: pinned ? 1 : 0 });
    return Number(r.api_status) === 200
      ? { ok: true }
      : { ok: false, code: toStr(r.error_code, undefined), error: toStr(r.error_message, 'failed') };
  } catch { return { ok: false, error: 'network' }; }
}

// ─── Channel Stories (Batch 33) ───────────────────────────────────────────────

export async function loadChannelStories(token: string, channelId: number): Promise<StoryItem[]> {
  try {
    const resp = await nodePost<Record<string, unknown>>(
      `/api/node/channel/${channelId}/stories`, token, { limit: 20 }
    );
    const raw = (resp.stories ?? resp.data ?? []) as Record<string, unknown>[];
    if (!Array.isArray(raw) || raw.length === 0) return [];
    return raw.map(s => {
      const ud      = (s.user_data    ?? {}) as Record<string, unknown>;
      const images  = (s.images       ?? []) as Record<string, unknown>[];
      const videos  = (s.videos       ?? []) as Record<string, unknown>[];
      const mItems  = (s.mediaItems   ?? []) as Record<string, unknown>[];
      const vidItem = videos[0] ?? mItems.find(m => m.type === 'video');
      const imgItem = images[0] ?? mItems.find(m => m.type === 'image');
      const rawFile = toStr(s.thumbnail ?? vidItem?.filename ?? imgItem?.filename, '');
      const file    = storyAbsUrl(rawFile);
      const fileType: 'image' | 'video' = vidItem ? 'video' : 'image';
      const firstName = toStr(ud.first_name, '');
      const lastName  = toStr(ud.last_name, '');
      const username  = toStr(ud.username, '');
      const displayName = (firstName + ' ' + lastName).trim() || username || `User ${s.user_id}`;
      return {
        id:           Number(s.id),
        user_id:      Number(s.user_id ?? channelId),
        user_name:    displayName,
        user_avatar:  toStr(ud.avatar, undefined),
        file,
        thumbnail:    storyAbsUrl(toStr(s.thumbnail, undefined)),
        file_type:    fileType,
        created_at:   s.posted ? new Date(Number(s.posted) * 1000).toLocaleDateString() : '',
        expire_time:  Number(s.expire ?? 0),
        is_seen:      Number(s.is_viewed ?? 0) === 1,
        views_count:  Number(s.view_count ?? 0),
        comment_count: Number(s.comment_count ?? 0),
        is_owner:     Boolean(s.is_owner),
        reaction: {
          like: 0, love: 0, haha: 0, wow: 0, sad: 0, angry: 0,
          is_reacted: false,
        },
      };
    });
  } catch { return []; }
}

export async function createChannelStory(
  token: string, channelId: number, file: File, fileType: 'image' | 'video',
  caption?: string, videoDuration?: number,
): Promise<void> {
  // Use the dedicated channel-story endpoint (checks admin rights and saves
  // page_id) — the general /stories/create ignores page_id, which is why
  // channel stories used to save as personal ones.
  const fields: Record<string, string> = { file_type: fileType, channel_id: String(channelId) };
  const cap = (caption ?? '').trim();
  if (cap) {
    fields.story_title       = cap.slice(0, 100);
    fields.story_description = cap.slice(0, 300);
  }
  if (fileType === 'video' && videoDuration && videoDuration > 0) {
    fields.video_duration = String(Math.round(videoDuration));
  }
  await doUpload(`${NODE_BASE_URL}/api/node/stories/create-channel`, token, fields, file);
}

/** One reaction per user (server toggles: same = remove, other = replace).
 * Returns the reaction now set (null = removed), or undefined on failure. */
export async function reactToStory(token: string, storyId: number, reaction: string): Promise<string | null | undefined> {
  try {
    const r = await nodePost<Record<string, unknown>>('/api/node/stories/react', token, { story_id: storyId, reaction });
    if (Number(r.api_status) !== 200) return undefined;
    return r.reaction ? String(r.reaction) : null;
  } catch { return undefined; }
}

/** Owner-only: totals + reactions breakdown. */
export async function getStoryStats(token: string, storyId: number): Promise<import('./types').StoryStats | null> {
  try {
    const r = await nodePost<Record<string, unknown>>('/api/node/stories/get-analytics', token, { story_id: storyId });
    if (Number(r.api_status) !== 200) return null;
    const rx = (r.reactions ?? {}) as Record<string, unknown>;
    return {
      unique_views:    Number(r.unique_views ?? 0),
      total_reactions: Number(r.total_reactions ?? 0),
      reactions:       Object.fromEntries(Object.entries(rx).map(([k, v]) => [k, Number(v) || 0])),
      total_comments:  Number(r.total_comments ?? 0),
      engagement_rate: Number(r.engagement_rate ?? 0),
      posted_at:       Number(r.posted_at ?? 0),
      expires_at:      Number(r.expires_at ?? 0),
    };
  } catch { return null; }
}

/** Owner-only: who viewed, newest first, with each viewer's reaction. Page with offsetId. */
export async function getStoryViewers(token: string, storyId: number, offsetId = 0): Promise<{ users: import('./types').StoryViewer[]; total: number }> {
  try {
    const r = await nodePost<Record<string, unknown>>('/api/node/stories/get-views', token, { story_id: storyId, limit: 30, offset: offsetId });
    const list = (Array.isArray(r.users) ? r.users : []) as Record<string, unknown>[];
    return {
      users: list.map(u => ({
        user_id:   Number(u.user_id),
        name:      toStr([u.first_name, u.last_name].filter(Boolean).join(' '), '') || toStr(u.username, ''),
        username:  toStr(u.username, undefined),
        avatar:    toStr(u.avatar, undefined),
        view_time: Number(u.view_time ?? 0),
        reaction:  u.reaction ? String(u.reaction) : null,
        offset_id: Number(u.offset_id ?? 0),
      })),
      total: Number(r.total ?? 0),
    };
  } catch { return { users: [], total: 0 }; }
}

/** Hide / show someone's stories (server toggles). */
export async function toggleMuteStoryUser(token: string, userId: number): Promise<'muted' | 'unmuted' | null> {
  try {
    const r = await nodePost<Record<string, unknown>>('/api/node/stories/mute', token, { user_id: userId });
    return r.action === 'muted' || r.action === 'unmuted' ? r.action : null;
  } catch { return null; }
}

export async function getStoryComments(token: string, storyId: number): Promise<import('./types').StoryComment[]> {
  try {
    const resp = await nodePost<Record<string, unknown>>('/api/node/stories/get-comments', token, { story_id: storyId, limit: 50 });
    const raw = (resp.comments ?? resp.data ?? []) as Record<string, unknown>[];
    return raw.map(c => {
      const ud = (c.user_data ?? {}) as Record<string, unknown>;
      return {
        id:          Number(c.id ?? 0),
        story_id:    Number(c.story_id ?? storyId),
        user_id:     Number(c.user_id ?? 0),
        text:        toStr(c.text, ''),
        time:        Number(c.time ?? 0),
        user_name:   toStr(ud.first_name ? `${ud.first_name} ${ud.last_name ?? ''}`.trim() : ud.username, undefined),
        user_avatar: toStr(ud.avatar, undefined),
      };
    });
  } catch { return []; }
}

export async function createStoryComment(token: string, storyId: number, text: string): Promise<import('./types').StoryComment | null> {
  try {
    const resp = await nodePost<Record<string, unknown>>('/api/node/stories/create-comment', token, { story_id: storyId, text });
    const c = (resp.comment as Record<string, unknown> | undefined) ?? resp;
    if (!c?.id) return null;
    return {
      id:       Number(c.id),
      story_id: Number(c.story_id ?? storyId),
      user_id:  Number(c.user_id ?? 0),
      text:     toStr(c.text, text),
      time:     Number(c.time ?? Math.floor(Date.now() / 1000)),
    };
  } catch { return null; }
}

export async function deleteStoryComment(token: string, commentId: number): Promise<void> {
  await nodePost('/api/node/stories/delete-comment', token, { comment_id: commentId }).catch(() => {});
}

// ─── Profile ──────────────────────────────────────────────────────────────────

export type UserProfile = {
  id:           number;
  username:     string;
  first_name?:  string;
  last_name?:   string;
  about?:       string;
  avatar?:      string;
  email?:       string;
  birthday?:    string;
  website?:     string;
  city?:        string;
  gender?:      string;
  working?:     string;
  school?:      string;
  phone?:       string;
  facebook?:    string;
  twitter?:     string;
  instagram?:   string;
  linkedin?:    string;
  youtube?:     string;
  status_emoji?: string;
  status_text?:  string;
};

export async function getMyProfile(token: string): Promise<UserProfile> {
  const resp = await nodeGet<Record<string, unknown>>('/api/node/users/me', token);
  const u = (resp.user_data ?? resp) as Record<string, unknown>;
  return {
    id:           Number(u.user_id ?? u.id ?? 0),
    username:     toStr(u.username, ''),
    first_name:   toStr(u.first_name, ''),
    last_name:    toStr(u.last_name, ''),
    about:        toStr(u.about, ''),
    avatar:       toStr(u.avatar, ''),
    email:        toStr(u.email, ''),
    birthday:     toStr(u.birthday, ''),
    website:      toStr(u.website, ''),
    city:         toStr(u.city, ''),
    gender:       toStr(u.gender, ''),
    working:      toStr(u.working, ''),
    school:       toStr(u.school, ''),
    phone:        toStr(u.phone_number ?? u.phone, ''),
    facebook:     toStr(u.facebook, ''),
    twitter:      toStr(u.twitter, ''),
    instagram:    toStr(u.instagram, ''),
    linkedin:     toStr(u.linkedin, ''),
    youtube:      toStr(u.youtube, ''),
    status_emoji: toStr(u.status_emoji, ''),
    status_text:  toStr(u.status_text, ''),
  };
}

export async function getUserProfile(token: string, userId: number): Promise<UserProfile> {
  const resp = await nodeGet<Record<string, unknown>>(`/api/node/users/${userId}`, token);
  const u = (resp.user_data ?? resp.user ?? resp) as Record<string, unknown>;
  return {
    id:           Number(u.user_id ?? u.id ?? userId),
    username:     toStr(u.username, ''),
    first_name:   toStr(u.first_name, ''),
    last_name:    toStr(u.last_name, ''),
    about:        toStr(u.about, ''),
    avatar:       toStr(u.avatar, ''),
    // Backend only includes email/phone_number when the viewer IS the target
    // user (self) — for anyone else these keys are simply absent from the
    // response, so this naturally comes back empty without a client-side check.
    email:        toStr(u.email, ''),
    phone:        toStr(u.phone_number ?? u.phone, ''),
    birthday:     toStr(u.birthday, ''),
    website:      toStr(u.website, ''),
    city:         toStr(u.city, ''),
    gender:       toStr(u.gender, ''),
    working:      toStr(u.working, ''),
    school:       toStr(u.school, ''),
    facebook:     toStr(u.facebook, ''),
    twitter:      toStr(u.twitter, ''),
    instagram:    toStr(u.instagram, ''),
    linkedin:     toStr(u.linkedin, ''),
    youtube:      toStr(u.youtube, ''),
    status_emoji: toStr(u.status_emoji, ''),
    status_text:  toStr(u.status_text, ''),
  };
}

export async function updateMyProfile(
  token: string,
  fields: {
    first_name?: string; last_name?: string; about?: string; username?: string;
    birthday?: string; website?: string; city?: string; gender?: string;
    working?: string; school?: string; phone_number?: string;
    facebook?: string; twitter?: string; instagram?: string;
    linkedin?: string; youtube?: string;
  }
): Promise<void> {
  await nodePut('/api/node/users/me', token, fields as Record<string, unknown>);
}

export async function setCustomStatus(token: string, emoji: string, text: string): Promise<void> {
  await nodePut('/api/node/users/me/status', token, {
    status_emoji: emoji || null,
    status_text:  text  || null,
  } as Record<string, unknown>).catch(() => {});
}

// ─── Theme profile: cross-device sync + sharing (2026-08-21) ────────────────
// Same backend table/route as Android — see nodejs/migrations/027_wm_theme_profiles.sql.
// Android and Windows each own a completely separate theme catalog, so every
// call here is scoped to platform: 'windows' and a code shared from Android
// is never something this client offers to apply (see importThemeByCode).

export interface ThemeProfilePayload {
  theme_key: string;
  bubble_style?: string | null;
  background_id?: string | null;
  font?: string | null;
}

export interface ThemeProfileData extends ThemeProfilePayload {
  updated_at?: number;
}

export interface SharedThemeProfile extends ThemeProfilePayload {
  platform: 'android' | 'windows';
}

/** Fire-and-forget: push current selection to the server (cross-device sync). */
export async function syncThemeProfile(token: string, payload: ThemeProfilePayload): Promise<void> {
  try {
    await nodePut('/api/node/theme/profile', token, { platform: 'windows', ...payload } as Record<string, unknown>);
  } catch { /* background sync — never surface as a user-facing error */ }
}

/** Pull my saved profile (call once per account per device — see MainAppContent.tsx). */
export async function getMyThemeProfile(token: string): Promise<ThemeProfileData | null> {
  const resp = await nodeGet<{ api_status: number; profile: ThemeProfileData | null }>(
    '/api/node/theme/profile?platform=windows', token
  );
  return resp.api_status === 200 ? resp.profile : null;
}

/** Save current theme + get a short share code for it. */
export async function shareThemeProfile(token: string, payload: ThemeProfilePayload): Promise<string | null> {
  const resp = await nodePost<{ api_status: number; share_code?: string }>(
    '/api/node/theme/profile/share', token, { platform: 'windows', ...payload } as Record<string, unknown>
  );
  return resp.api_status === 200 ? (resp.share_code ?? null) : null;
}

export type ImportThemeResult =
  | { ok: true; profile: SharedThemeProfile }
  | { ok: false; reason: 'not_found' | 'wrong_platform' | 'network' };

/**
 * Look up a friend's shared theme by code. Distinguishes WHY it failed
 * (2026-08-21 — was collapsing every failure into a single "not found",
 * which made a genuine bug indistinguishable from a mistyped code or an
 * Android-only code pasted here by mistake).
 */
export async function importThemeByCode(token: string, code: string): Promise<ImportThemeResult> {
  try {
    const resp = await nodeGet<{ api_status: number; profile: SharedThemeProfile | null }>(
      `/api/node/theme/share/${encodeURIComponent(code.trim())}`, token
    );
    if (resp.api_status !== 200 || !resp.profile) return { ok: false, reason: 'not_found' };
    if (resp.profile.platform !== 'windows') return { ok: false, reason: 'wrong_platform' };
    return { ok: true, profile: resp.profile };
  } catch {
    return { ok: false, reason: 'network' };
  }
}

/**
 * Public, read-only lookup of another user's chosen chat font (2026-08-21) —
 * "signature font" showing up on their bubbles for everyone, not just them.
 * Deliberately exposes ONLY font (not palette/background/bubble style —
 * those stay private) via a dedicated endpoint, not the auth-scoped
 * /theme/profile above. See senderFontCache.ts for the caching layer that
 * calls this per message sender, and nodejs/routes/theme-profile.js.
 */
export async function getPublicFont(token: string, userId: number): Promise<{ font: string | null } | null> {
  try {
    const resp = await nodeGet<{ api_status: number; font: string | null }>(
      `/api/node/theme/public-font/${userId}`, token
    );
    return resp.api_status === 200 ? { font: resp.font } : null;
  } catch {
    return null;
  }
}

export interface NotificationSettings {
  email_notification:  number;
  e_liked:             number;
  e_commented:         number;
  e_followed:          number;
  e_mentioned:         number;
  e_joined_group:      number;
  e_accepted:          number;
  e_profile_wall_post: number;
  e_shared:            number;
  e_visited:           number;
}

export async function loadNotificationSettings(token: string): Promise<NotificationSettings> {
  try {
    const resp = await nodeGet<Record<string, unknown>>('/api/node/users/me', token);
    const u = (resp.user_data ?? resp) as Record<string, unknown>;
    const g = (n: unknown) => (Number(n ?? 1));
    return {
      email_notification:  g(u.email_notification),
      e_liked:             g(u.e_liked),
      e_commented:         g(u.e_commented),
      e_followed:          g(u.e_followed),
      e_mentioned:         g(u.e_mentioned),
      e_joined_group:      g(u.e_joined_group),
      e_accepted:          g(u.e_accepted),
      e_profile_wall_post: g(u.e_profile_wall_post),
      e_shared:            g(u.e_shared),
      e_visited:           g(u.e_visited),
    };
  } catch {
    return { email_notification:1, e_liked:1, e_commented:1, e_followed:1, e_mentioned:1, e_joined_group:1, e_accepted:1, e_profile_wall_post:1, e_shared:1, e_visited:1 };
  }
}

export async function updateNotificationSettings(token: string, s: Partial<NotificationSettings>): Promise<void> {
  await nodePut('/api/node/users/me/notifications', token, s as Record<string, unknown>).catch(() => {});
}

export async function uploadAvatar(token: string, file: File): Promise<string> {
  const text   = await doUpload(`${NODE_BASE_URL}/api/node/user/avatars/upload`, token, {}, file);
  const resp   = await parseJson<Record<string, unknown>>(text);
  const avatar = resp.avatar_url ?? resp.image_src ?? resp.url ?? '';
  return toStr(avatar, '');
}

export async function setAvatarUrl(token: string, url: string): Promise<void> {
  await nodePut('/api/node/users/me', token, { avatar: url });
}

// ─── Archived chats ───────────────────────────────────────────────────────────

export async function loadArchivedChats(token: string): Promise<ChatListResponse> {
  const resp = await nodePost<Record<string, unknown>>('/api/node/chat/chats', token, {
    limit: 80, offset: 0, show_archived: 'true'
  });
  const raw = (resp.data ?? []) as Record<string, unknown>[];
  return {
    api_status: '200',
    data: Array.isArray(raw) ? raw.map(normaliseChatItem) : []
  };
}

// ─── Block / unblock users ────────────────────────────────────────────────────

export async function blockUser(token: string, userId: number): Promise<void> {
  await nodePost(`/api/node/users/${userId}/block`, token, {});
}

export async function unblockUser(token: string, userId: number): Promise<void> {
  await nodeDelete(`/api/node/users/${userId}/block`, token);
}

// Was DELETE '/api/node/account' with no password — that path doesn't exist
// (the real route is /api/node/user/account, requires a password field to
// confirm) and the caller in SettingsOverlay.tsx swallowed every failure and
// logged out locally regardless. Net effect: clicking "Delete account" on
// Windows never actually told the server anything — the account stayed
// completely untouched while the user believed it was gone. Fixed 2026-08-21
// alongside the server's move to delayed (45-day) deletion.
export type DeleteAccountResult = {
  ok: boolean;
  errorMessage?: string;
  purgeAt?: number;
  gracePeriodDays?: number;
};
export async function deleteAccount(token: string, password: string): Promise<DeleteAccountResult> {
  try {
    const text = await doRequest(`${NODE_BASE_URL}/api/node/user/account`, {
      method:  'DELETE',
      headers: { 'access-token': token, 'Content-Type': 'application/x-www-form-urlencoded' },
      body:    buildForm({ password }),
    });
    const r = await parseJson<Record<string, unknown>>(text);
    if (r?.api_status === 200) {
      return {
        ok: true,
        purgeAt:         r.purge_at ? Number(r.purge_at) : undefined,
        gracePeriodDays: r.grace_period_days ? Number(r.grace_period_days) : undefined,
      };
    }
    return { ok: false, errorMessage: String(r?.error_message ?? r?.message ?? '') };
  } catch (e) {
    return { ok: false, errorMessage: e instanceof Error ? e.message : String(e) };
  }
}

/** Cancels a pending account deletion within its 45-day window. Not
 *  token-authenticated (the account was logged out when deletion was
 *  requested) — verifies login+password itself, same as a login call. */
export async function restoreAccount(login: string, password: string): Promise<{ ok: boolean; errorMessage?: string }> {
  try {
    const resp = await nodePost<Record<string, unknown>>('/api/node/user/account/restore', '', { login, password });
    if (resp?.api_status === 200) return { ok: true };
    return { ok: false, errorMessage: String(resp?.error_message ?? resp?.message ?? '') };
  } catch (e) {
    return { ok: false, errorMessage: e instanceof Error ? e.message : String(e) };
  }
}

export async function loadBlockedUsers(token: string): Promise<UserProfile[]> {
  const resp = await nodeGet<Record<string, unknown>>('/api/node/users/me/blocked', token);
  const raw  = (resp.data ?? resp.users ?? []) as Record<string, unknown>[];
  return Array.isArray(raw) ? raw.map(u => ({
    id:       Number(u.user_id ?? u.id ?? 0),
    username: toStr(u.username, ''),
    first_name: toStr(u.first_name, ''),
    last_name:  toStr(u.last_name, ''),
    avatar:     toStr(u.avatar, ''),
  })) : [];
}

export async function initiateCall(token: string, userId: number, type: 'audio' | 'video'): Promise<void> {
  await nodePost('/api/node/calls/initiate', token, { user_id: userId, call_type: type });
}

export async function answerCall(token: string, userId: number, sdp: string): Promise<void> {
  await nodePost('/api/node/calls/answer', token, { user_id: userId, sdp });
}

export async function sendIceCandidate(token: string, userId: number, candidate: RTCIceCandidateInit): Promise<void> {
  await nodePost('/api/node/calls/ice-candidate', token, { user_id: userId, candidate: JSON.stringify(candidate) });
}

export async function endCall(token: string, userId: number): Promise<void> {
  await nodePost('/api/node/calls/end', token, { user_id: userId });
}

// ─── Signal Protocol API ──────────────────────────────────────────────────────

export async function registerSignalKeys(token: string, payload: {
  identity_key:          string;
  signed_prekey_id:      number;
  signed_prekey:         string;
  signed_prekey_sig:     string;
  prekeys:               string;
  device_id?:            string;
  identity_signing_key?: string;
}): Promise<boolean> {
  try {
    const resp = await nodePost<Record<string, unknown>>('/api/node/signal/register', token, payload);
    return (resp.api_status === 200 || resp.api_status === '200');
  } catch { return false; }
}

export async function getSignalBundle(token: string, userId: number, noOpk = false): Promise<PreKeyBundle | null> {
  try {
    const path = noOpk
      ? `/api/node/signal/bundle/${userId}?no_opk=1`
      : `/api/node/signal/bundle/${userId}`;
    const resp = await nodeGet<Record<string, unknown>>(path, token);
    if (!resp.identity_key || !resp.signed_prekey) return null;
    return {
      identity_key:         resp.identity_key as string,
      identity_signing_key: (resp.identity_signing_key as string | undefined) ?? undefined,
      signed_prekey_id:     Number(resp.signed_prekey_id),
      signed_prekey:        resp.signed_prekey as string,
      signed_prekey_sig:    (resp.signed_prekey_sig ?? '') as string,
      one_time_prekey_id:   resp.one_time_prekey_id !== undefined ? Number(resp.one_time_prekey_id) : undefined,
      one_time_prekey:      resp.one_time_prekey as string | undefined,
      device_id:            (resp.device_id as string | undefined) ?? 'legacy',
    };
  } catch { return null; }
}

/** Fetch the bundles of ALL of a user's devices (multi-device fan-out). */
export async function getSignalBundles(token: string, userId: number, noOpk = false): Promise<PreKeyBundle[]> {
  try {
    const path = noOpk
      ? `/api/node/signal/bundles/${userId}?no_opk=1`
      : `/api/node/signal/bundles/${userId}`;
    const resp = await nodeGet<Record<string, unknown>>(path, token);
    const devices = (resp.devices as Array<Record<string, unknown>> | undefined) ?? [];
    return devices
      .filter(d => d.identity_key && d.signed_prekey)
      .map(d => ({
        identity_key:         d.identity_key as string,
        identity_signing_key: (d.identity_signing_key as string | undefined) ?? undefined,
        signed_prekey_id:     Number(d.signed_prekey_id),
        signed_prekey:        d.signed_prekey as string,
        signed_prekey_sig:    (d.signed_prekey_sig ?? '') as string,
        one_time_prekey_id:   d.one_time_prekey_id !== undefined ? Number(d.one_time_prekey_id) : undefined,
        one_time_prekey:      d.one_time_prekey as string | undefined,
        device_id:            (d.device_id as string | undefined) ?? 'legacy',
      }));
  } catch (e) {
    console.error('[Signal] getSignalBundles failed for user', userId, e);
    return [];
  }
}

export async function replenishSignalPreKeys(token: string, prekeys: string, deviceId?: string): Promise<void> {
  try { await nodePost('/api/node/signal/replenish', token, { prekeys, device_id: deviceId }); }
  catch { /* non-critical */ }
}

export async function getSignalPreKeyCount(token: string): Promise<number> {
  try {
    const resp = await nodeGet<Record<string, unknown>>('/api/node/signal/prekey-count', token);
    return Number(resp.count ?? 0);
  } catch { return 0; }
}

export async function getSignalIdentityKey(token: string, userId: number, deviceId?: string): Promise<string | null> {
  try {
    const q = deviceId ? `?device_id=${encodeURIComponent(deviceId)}` : '';
    const resp = await nodeGet<Record<string, unknown>>(`/api/node/signal/identity/${userId}${q}`, token);
    return (resp.identity_key as string | undefined) ?? null;
  } catch { return null; }
}

// ─── NodeApiShim factory ──────────────────────────────────────────────────────

export function createNodeApiShim(token: string): NodeApiShim {
  return {
    registerSignalKeys:    (payload) => registerSignalKeys(token, payload),
    getSignalBundle:       (userId, noOpk)  => getSignalBundle(token, userId, noOpk),
    getSignalBundles:      (userId, noOpk)  => getSignalBundles(token, userId, noOpk),
    replenishSignalPreKeys:(prekeys, deviceId) => replenishSignalPreKeys(token, prekeys, deviceId),
    getSignalIdentityKey:  (userId, deviceId)  => getSignalIdentityKey(token, userId, deviceId)
  };
}

// ─── Call history ──────────────────────────────────────────────────────────────
// Fixed 2026-08-19: this whole section (+ updatePrivacySettings further down)
// used to go through a phpPost() helper hitting API_BASE_URL
// (worldmates.club:443, the legacy PHP server) — removed entirely now that
// nothing calls it. routes/calls.js on the Node backend (port 449) is what
// actually owns wo_calls ("Replaces PHP call_history.php endpoint" — same URL
// path, reimplemented on Node, NOT proxied from the PHP side). The Android
// client already called this correctly via NodeRetrofitClient/
// CallHistoryApiService; Windows never got the same switch, so call history
// silently loaded from the wrong server and came back empty (the try/catch
// below swallowed the mismatch instead of surfacing it) — every call anyone
// made was recorded fine, just not where this was looking for it.
//
// TODO(offline): pure REST, no local cache — deliberately deferred (2026-07-14
// offline-mode plan). Scope was limited to 1:1 chats + channels; call history
// offline reading is a separate future task, not started here.
export async function loadCallHistory(token: string, filter = 'all'): Promise<CallHistoryItem[]> {
  try {
    const resp = await nodePost<{ calls?: CallHistoryItem[] }>(
      '/api/v2/call_history.php', token,
      { type: 'get_history', filter, limit: '50', offset: '0' }
    );
    return resp.calls ?? [];
  } catch { return []; }
}

export async function deleteCallRecord(token: string, callId: number): Promise<void> {
  await nodePost('/api/v2/call_history.php', token, { type: 'delete_call', call_id: String(callId) });
}

export async function clearCallHistory(token: string): Promise<void> {
  await nodePost('/api/v2/call_history.php', token, { type: 'clear_history' });
}

// ─── Privacy settings ─────────────────────────────────────────────────────────

export async function loadPrivacySettings(token: string): Promise<PrivacySettings> {
  const resp = await nodeGet<Record<string, unknown>>('/api/node/users/me', token);
  const u = (resp.user_data ?? resp) as Record<string, unknown>;
  return {
    follow_privacy:          toStr(u.follow_privacy,          '0'),
    friend_privacy:          toStr(u.friend_privacy,          '0'),
    post_privacy:            toStr(u.post_privacy,            'everyone'),
    message_privacy:         toStr(u.message_privacy,         '0'),
    confirm_followers:       toStr(u.confirm_followers,       '0'),
    show_activities_privacy: toStr(u.show_activities_privacy, '1'),
    birth_privacy:           toStr(u.birth_privacy,           '0'),
    visit_privacy:           toStr(u.visit_privacy,           '0'),
    showlastseen:            toStr(u.showlastseen,            '1'),
  };
}

// Fixed 2026-08-19: was phpPost('/api/v2/index.php', ...) against the legacy
// PHP server — loadPrivacySettings() right above already reads via the Node
// backend (/api/node/users/me), but the write side never got the same
// migration. routes/users/profile.js's PUT /api/node/users/me/privacy covers
// the exact same field set (plus share_my_location).
export async function updatePrivacySettings(token: string, settings: Partial<PrivacySettings>): Promise<void> {
  await nodePut('/api/node/users/me/privacy', token, settings as Record<string, unknown>);
}

// ─── Stickers ─────────────────────────────────────────────────────────────────

export async function loadStickerPacks(token: string): Promise<StickerPack[]> {
  try {
    const resp = await nodeGet<{ packs?: StickerPack[] }>('/api/node/stickers', token);
    const packs = resp.packs ?? [];
    // Fetch stickers for each pack individually (list endpoint returns packs without items)
    return await Promise.all(packs.map(async p => {
      try {
        const detail = await nodeGet<{ stickers?: StickerPack['stickers'] }>(`/api/node/stickers/${p.id}`, token);
        return { ...p, stickers: detail.stickers ?? [] };
      } catch { return p; }
    }));
  } catch { return []; }
}

export async function sendStickerMessage(token: string, recipientId: number, url: string): Promise<void> {
  await nodePost('/api/node/chat/send', token, { recipient_id: recipientId, stickers: url, text: '' });
}

export async function sendGifMessage(token: string, recipientId: number, url: string): Promise<void> {
  await nodePost('/api/node/chat/send', token, { recipient_id: recipientId, stickers: url, text: '' });
}

export async function sendGroupStickerMessage(token: string, groupId: number, url: string, topicId?: number): Promise<{ id?: number }> {
  const resp = await nodePost<Record<string, unknown>>('/api/node/group/messages/send', token, {
    group_id: groupId, text: '', stickers: url,
    ...(topicId ? { topic_id: topicId } : {}),
  });
  const d = resp.message_data as Record<string, unknown> | undefined;
  return { id: d ? Number(d.id) : undefined };
}

export async function sendGroupGifMessage(token: string, groupId: number, url: string, topicId?: number): Promise<{ id?: number }> {
  const resp = await nodePost<Record<string, unknown>>('/api/node/group/messages/send', token, {
    group_id: groupId, text: '', stickers: url,
    ...(topicId ? { topic_id: topicId } : {}),
  });
  const d = resp.message_data as Record<string, unknown> | undefined;
  return { id: d ? Number(d.id) : undefined };
}

// ─── GIFs (GIPHY) ────────────────────────────────────────────────────────────

import { SecretsProvider } from '../security/secretsProvider';
const GIPHY_KEY_GETTER = () => SecretsProvider.giphyApiKey;

function normaliseGiphy(data: Record<string, unknown>[]): GifItem[] {
  return data.map(g => {
    const imgs = (g.images ?? {}) as Record<string, Record<string, string>>;
    return {
      id:         String(g.id ?? ''),
      title:      String(g.title ?? ''),
      url:        imgs.original?.url ?? '',
      previewUrl: imgs.fixed_width?.url ?? imgs.original?.url ?? '',
    };
  });
}

export async function loadTrendingGifs(limit = 20): Promise<GifItem[]> {
  try {
    const url  = `https://api.giphy.com/v1/gifs/trending?api_key=${GIPHY_KEY_GETTER()}&limit=${limit}&rating=g`;
    const res  = await fetch(url);
    const data = await res.json() as { data?: Record<string, unknown>[] };
    return normaliseGiphy(data.data ?? []);
  } catch { return []; }
}

export async function searchGifs(query: string, limit = 20): Promise<GifItem[]> {
  if (!query.trim()) return loadTrendingGifs(limit);
  try {
    const url  = `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_KEY_GETTER()}&q=${encodeURIComponent(query)}&limit=${limit}&rating=g`;
    const res  = await fetch(url);
    const data = await res.json() as { data?: Record<string, unknown>[] };
    return normaliseGiphy(data.data ?? []);
  } catch { return []; }
}

// ─── Bot search ───────────────────────────────────────────────────────────────

export async function searchBots(query: string, limit = 20): Promise<BotItem[]> {
  try {
    const text = await doRequest(`${NODE_BASE_URL}/api/node/bots/search?q=${encodeURIComponent(query)}&limit=${limit}&offset=0`, {
      method: 'GET', headers: {}
    });
    const resp = await parseJson<{ bots?: Record<string, unknown>[] }>(text);
    return (resp.bots ?? []).map(b => ({
      bot_id_str:   String(b.bot_id ?? ''),
      user_id:      Number(b.linked_user_id ?? 0),
      username:     String(b.username ?? ''),
      display_name: String(b.display_name ?? b.displayName ?? b.username ?? ''),
      avatar:       b.avatar ? String(b.avatar) : undefined,
      description:  b.description ? String(b.description) : undefined,
      web_app_url:  b.web_app_url ? String(b.web_app_url) : undefined,
    }));
  } catch { return []; }
}

export async function getBotLinkedUser(token: string, botIdStr: string): Promise<number> {
  try {
    const resp = await nodeGet<Record<string, unknown>>(`/api/node/bots/${encodeURIComponent(botIdStr)}`, token);
    // Server wraps bot data under resp.bot
    const bot = (resp.bot as Record<string, unknown> | undefined) ?? resp;
    return Number(bot.linked_user_id ?? bot.user_id ?? resp.linked_user_id ?? 0);
  } catch { return 0; }
}

// ─── Bot real-time broadcast / подписки на топики ──────────────────────────────

export interface BotTopic {
  topic_key:         string;
  title?:            string;
  description?:      string;
  is_default:        number;
  subscribers_count: number;
}

export interface BotSubscription {
  topic_key:      string;
  muted_until?:   string | null;
  last_alert_id?: string | null;
}

export interface BotBroadcastItem {
  message_id:     number;
  topic:          string;
  text?:          string;
  media?:         { type: string; url: string } | null;
  alert_priority: string;   // 'normal' | 'critical'
  alert_type:     string;   // 'alert'  | 'clear'
  alert_id?:      string;
  date:           number;
}

/** Подписаться на топик бота (например регион воздушной тревоги). */
export async function subscribeBotTopic(token: string, botIdStr: string, topic: string, filters?: string): Promise<boolean> {
  try {
    const r = await nodePost<{ api_status: number }>(
      `/api/node/bots/${encodeURIComponent(botIdStr)}/subscribe`, token,
      filters ? { topic, filters } : { topic });
    return r.api_status === 200;
  } catch { return false; }
}

/** Отписаться от топика (topic не задан → от всех топиков этого бота). */
export async function unsubscribeBotTopic(token: string, botIdStr: string, topic?: string): Promise<boolean> {
  try {
    const r = await nodePost<{ api_status: number }>(
      `/api/node/bots/${encodeURIComponent(botIdStr)}/unsubscribe`, token,
      topic ? { topic } : {});
    return r.api_status === 200;
  } catch { return false; }
}

/** Приглушить топик(и) на N минут (0 → снять приглушение). */
export async function muteBotTopic(token: string, botIdStr: string, minutes: number, topic?: string): Promise<boolean> {
  try {
    const r = await nodePost<{ api_status: number }>(
      `/api/node/bots/${encodeURIComponent(botIdStr)}/mute`, token,
      topic ? { minutes, topic } : { minutes });
    return r.api_status === 200;
  } catch { return false; }
}

/** Мои подписки на этого бота + доступные топики. */
export async function getBotSubscriptions(token: string, botIdStr: string): Promise<{ subscriptions: BotSubscription[]; topics: BotTopic[] }> {
  try {
    const r = await nodeGet<{ subscriptions?: BotSubscription[]; topics?: BotTopic[] }>(
      `/api/node/bots/${encodeURIComponent(botIdStr)}/subscriptions`, token);
    return { subscriptions: r.subscriptions ?? [], topics: r.topics ?? [] };
  } catch { return { subscriptions: [], topics: [] }; }
}

/** Дотяжка пропущенных рассылок (после переподключения). */
export async function getBotBroadcasts(token: string, botIdStr: string, opts: { topic?: string; sinceId?: number; limit?: number } = {}): Promise<BotBroadcastItem[]> {
  try {
    const qs = new URLSearchParams();
    if (opts.topic)   qs.set('topic', opts.topic);
    if (opts.sinceId) qs.set('since_id', String(opts.sinceId));
    qs.set('limit', String(opts.limit ?? 20));
    const r = await nodeGet<{ broadcasts?: BotBroadcastItem[] }>(
      `/api/node/bots/${encodeURIComponent(botIdStr)}/broadcasts?${qs.toString()}`, token);
    return r.broadcasts ?? [];
  } catch { return []; }
}

// ─── Saved Messages ───────────────────────────────────────────────────────────

export interface SavedMessageItem {
  id?:           number;
  message_id:    number;
  chat_type:     'chat' | 'group' | 'channel';
  chat_id:       number;
  chat_name:     string;
  sender_name:   string;
  text:          string;
  media_url?:    string;
  media_type?:   string;
  saved_at:      number;
  original_time: number;
}

export async function listSaved(token: string): Promise<SavedMessageItem[]> {
  try {
    const resp = await nodeGet<Record<string, unknown>>('/api/node/saved/list', token);
    const raw = (resp.saved ?? resp.items ?? []) as Record<string, unknown>[];
    return raw.map(s => ({
      id:            Number(s.id ?? 0)  || undefined,
      message_id:    Number(s.message_id ?? s.messageId ?? 0),
      chat_type:     String(s.chat_type ?? s.chatType ?? 'chat') as SavedMessageItem['chat_type'],
      chat_id:       Number(s.chat_id ?? s.chatId ?? 0),
      chat_name:     String(s.chat_name ?? s.chatName ?? ''),
      sender_name:   String(s.sender_name ?? s.senderName ?? ''),
      text:          String(s.text ?? ''),
      media_url:     s.media_url ? String(s.media_url) : undefined,
      media_type:    s.media_type ? String(s.media_type) : undefined,
      saved_at:      Number(s.saved_at ?? s.savedAt ?? 0),
      original_time: Number(s.original_time ?? s.originalTime ?? 0),
    }));
  } catch { return []; }
}

export async function saveMessage(
  token:        string,
  item: Omit<SavedMessageItem, 'id' | 'saved_at'>
): Promise<boolean> {
  try {
    await nodePost('/api/node/saved/save', token, {
      message_id:    item.message_id,
      chat_type:     item.chat_type,
      chat_id:       item.chat_id,
      chat_name:     item.chat_name,
      sender_name:   item.sender_name,
      text:          item.text,
      media_url:     item.media_url,
      media_type:    item.media_type,
      original_time: item.original_time,
    });
    return true;
  } catch { return false; }
}

export async function unsaveMessage(token: string, messageId: number, chatType: string): Promise<boolean> {
  try {
    await nodePost('/api/node/saved/unsave', token, { message_id: messageId, chat_type: chatType });
    return true;
  } catch { return false; }
}

export async function clearSaved(token: string): Promise<void> {
  await nodePost('/api/node/saved/clear', token, {}).catch(() => {});
}

// ─── Notes ────────────────────────────────────────────────────────────────────

export interface NoteItem {
  id:          number;
  type:        'text' | 'image' | 'video' | 'audio' | 'file';
  text?:       string;
  file_name?:  string;
  file_size:   number;
  mime_type?:  string;
  created_at:  number;
}

export interface NotesStorageInfo {
  used_bytes:  number;
  quota_bytes: number;
}

export async function listNotes(token: string, limit = 50, offset = 0): Promise<NoteItem[]> {
  try {
    const resp = await nodeGet<Record<string, unknown>>(
      `/api/node/notes?limit=${limit}&offset=${offset}`, token
    );
    const raw = (resp.notes ?? resp.items ?? []) as Record<string, unknown>[];
    return raw.map(n => ({
      id:         Number(n.id ?? 0),
      type:       (String(n.type ?? 'text')) as NoteItem['type'],
      text:       n.text ? String(n.text) : undefined,
      file_name:  n.file_name ?? n.fileName ? String(n.file_name ?? n.fileName) : undefined,
      file_size:  Number(n.file_size ?? n.fileSize ?? 0),
      mime_type:  n.mime_type ?? n.mimeType ? String(n.mime_type ?? n.mimeType) : undefined,
      created_at: Number(n.created_at ?? n.createdAt ?? 0),
    }));
  } catch { return []; }
}

export async function createNote(token: string, text: string): Promise<NoteItem | null> {
  try {
    const resp = await nodePost<Record<string, unknown>>('/api/node/notes/create', token, { text });
    const n = (resp.note as Record<string, unknown> | undefined) ?? resp;
    if (!n || !n.id) return null;
    return {
      id:         Number(n.id),
      type:       (String(n.type ?? 'text')) as NoteItem['type'],
      text:       n.text ? String(n.text) : undefined,
      file_name:  undefined,
      file_size:  0,
      mime_type:  undefined,
      created_at: Number(n.created_at ?? n.createdAt ?? Date.now() / 1000),
    };
  } catch { return null; }
}

export async function deleteNote(token: string, id: number): Promise<void> {
  await nodePost(`/api/node/notes/${id}/delete`, token, {}).catch(() => {});
}

export async function getNotesStorage(token: string): Promise<NotesStorageInfo> {
  try {
    const resp = await nodeGet<Record<string, unknown>>('/api/node/notes/storage', token);
    return {
      used_bytes:  Number(resp.used_bytes  ?? resp.usedBytes  ?? 0),
      quota_bytes: Number(resp.quota_bytes ?? resp.quotaBytes ?? 0),
    };
  } catch { return { used_bytes: 0, quota_bytes: 0 }; }
}

// ─── Scheduled Messages ────────────────────────────────────────────────────────

export interface ScheduledMessage {
  id:          number;
  recipient_id: number;
  text:        string;
  media?:      string;
  media_type?: string;
  send_at:     number;   // unix timestamp
  created_at:  number;
}

// The server's contract (routes/scheduled.js) is chat_id/chat_type, not
// recipient_id — and it answers under a "scheduled" key, not "messages"/
// "data"/"message". This client used to send/read the wrong field names
// entirely (found 2026-08-20, mirroring an analogous Android bug fixed the
// same week — MessagesViewModel.scheduleMessage() sent chat_type: "user"
// instead of "dm"): list() sent recipient_id so the server's `chat_id`
// required-field check always 400'd and the catch-all silently returned [];
// create() sent recipient_id/send_at (server wants chat_id/scheduled_at) so
// it also always 400'd, and the response was parsed from the wrong key even
// on paper; delete() POSTed to a path that doesn't exist (the route is
// `DELETE /scheduled/:id`, not `POST /scheduled/:id/delete`). Net effect:
// scheduling a message from Windows always silently failed end-to-end — the
// picker closed as if it worked, nothing was ever actually scheduled, and
// the list always rendered empty.
export async function listScheduledMessages(token: string, recipientId: number): Promise<ScheduledMessage[]> {
  try {
    const resp = await nodeGet<Record<string, unknown>>(
      `/api/node/scheduled/list?chat_id=${recipientId}&chat_type=dm`, token
    );
    const raw = (resp.scheduled ?? []) as Record<string, unknown>[];
    return raw.map(m => ({
      id:           Number(m.id ?? 0),
      recipient_id: Number(m.chat_id ?? recipientId),
      text:         String(m.text ?? ''),
      media:        m.media_url ? String(m.media_url) : undefined,
      media_type:   m.media_type ? String(m.media_type) : undefined,
      send_at:      Number(m.scheduled_at ?? 0),
      created_at:   Number(m.created_at ?? 0),
    }));
  } catch { return []; }
}

export async function createScheduledMessage(
  token: string,
  recipientId: number,
  text: string,
  sendAt: number
): Promise<ScheduledMessage | null> {
  try {
    const resp = await nodePost<Record<string, unknown>>('/api/node/scheduled/create', token, {
      chat_id:      recipientId,
      chat_type:    'dm',
      text,
      scheduled_at: sendAt,
    });
    const m = resp.scheduled as Record<string, unknown> | undefined;
    if (!m || !m.id) return null;
    return {
      id:           Number(m.id),
      recipient_id: Number(m.chat_id ?? recipientId),
      text:         String(m.text ?? text),
      send_at:      Number(m.scheduled_at ?? sendAt),
      created_at:   Number(m.created_at ?? Date.now() / 1000),
    };
  } catch { return null; }
}

export async function deleteScheduledMessage(token: string, id: number): Promise<void> {
  await nodeDelete(`/api/node/scheduled/${id}`, token).catch(() => {});
}

export async function sendScheduledNow(token: string, id: number): Promise<void> {
  await nodePost(`/api/node/scheduled/${id}/send-now`, token, {}).catch(() => {});
}

// ─── Batch 5: Channel admin API ────────────────────────────────────────────────

import type {
  ChannelStatistics, ChannelAdmin, ChannelSettings,
  ChannelSubscriber, ChannelBannedMember, ActiveMember,
  GroupMemberFull, GroupSettings, GroupStatistics,
  GroupJoinRequest, AdminLogEntry,
} from './types';

export async function getChannelStatistics(token: string, channelId: number): Promise<ChannelStatistics | null> {
  try {
    const r = await nodePost<Record<string, unknown>>('/api/node/channel/statistics', token, { channel_id: channelId });
    const s = (r.statistics ?? r) as Record<string, unknown>;
    return {
      subscribers_count:      Number(s.subscribers_count ?? 0),
      new_subscribers_today:  Number(s.new_subscribers_today ?? 0),
      new_subscribers_week:   Number(s.new_subscribers_week ?? 0),
      left_subscribers_week:  Number(s.left_subscribers_week ?? 0),
      growth_rate:            Number(s.growth_rate ?? 0),
      active_subscribers_24h: Number(s.active_subscribers_24h ?? 0),
      subscribers_by_day:     Array.isArray(s.subscribers_by_day) ? (s.subscribers_by_day as number[]) : undefined,
      posts_count:            Number(s.posts_count ?? 0),
      posts_today:            Number(s.posts_today ?? 0),
      posts_last_week:        Number(s.posts_last_week ?? 0),
      posts_this_month:       Number(s.posts_this_month ?? 0),
      views_total:            Number(s.views_total ?? 0),
      views_last_week:        Number(s.views_last_week ?? 0),
      avg_views_per_post:     Number(s.avg_views_per_post ?? 0),
      views_by_day:           Array.isArray(s.views_by_day) ? (s.views_by_day as number[]) : undefined,
      reactions_total:        Number(s.reactions_total ?? 0),
      comments_total:         Number(s.comments_total ?? 0),
      engagement_rate:        Number(s.engagement_rate ?? 0),
      media_posts_count:      Number(s.media_posts_count ?? 0),
      text_posts_count:       Number(s.text_posts_count ?? 0),
      peak_hours:             Array.isArray(s.peak_hours) ? (s.peak_hours as number[]) : undefined,
      hourly_views:           Array.isArray(s.hourly_views) ? (s.hourly_views as number[]) : undefined,
      hourly_activity_utc:    Array.isArray(s.hourly_activity_utc) && s.hourly_activity_utc.length === 24
        ? (s.hourly_activity_utc as unknown[]).map(v => Number(v) || 0) : undefined,
      activity_source:        s.activity_source === 'comments' || s.activity_source === 'posts' ? s.activity_source : undefined,
      top_posts:              Array.isArray(s.top_posts) ? (s.top_posts as Record<string, unknown>[]).map(p => ({
        id: Number(p.id ?? 0), text: String(p.text ?? ''),
        views: Number(p.views ?? 0), reactions: Number(p.reactions ?? 0),
        comments: Number(p.comments ?? 0), published_time: Number(p.published_time ?? 0),
        has_media: Boolean(p.has_media),
      })) : undefined,
    };
  } catch { return null; }
}

export async function loadChannelAdmins(token: string, channelId: number): Promise<ChannelAdmin[]> {
  try {
    const r = await nodePost<Record<string, unknown>>('/api/node/channel/admins', token, { channel_id: channelId });
    const list = (r.admins ?? r.data ?? []) as Record<string, unknown>[];
    return list.map(a => ({
      user_id: Number(a.user_id ?? 0), username: String(a.username ?? ''),
      avatar: a.avatar ? String(a.avatar) : undefined,
      role: (['owner','admin','moderator','moderator_news','moderator_users','editor'].includes(String(a.role)) ? a.role : 'admin') as ChannelAdmin['role'],
      added_time: Number(a.added_time ?? 0),
    }));
  } catch { return []; }
}

export async function addChannelAdmin(token: string, channelId: number, userId: number | undefined, userSearch?: string, role?: string): Promise<{ ok: boolean; error?: string }> {
  const body: Record<string, unknown> = { channel_id: channelId, role: role ?? 'admin' };
  if (userId) body.user_id = userId;
  if (userSearch) body.user_search = userSearch;
  try {
    const r = await nodePost<Record<string, unknown>>('/api/node/channel/add-admin', token, body);
    if (Number(r.api_status) !== 200) return { ok: false, error: String(r.error_message ?? 'failed') };
    return { ok: true };
  } catch {
    return { ok: false, error: 'network' };
  }
}

/** Admin-only: subscribes a specific user directly, no action needed on their
 *  end (unlike sharing the channel link). Confirmed against the backend
 *  2026-09-16 — routes/channels/subscriptions.js's addMember, mounted at
 *  POST /api/node/channel/add-member, already existed there with zero
 *  frontend caller anywhere in this codebase. */
export async function addChannelMember(token: string, channelId: number, userId: number): Promise<{ ok: boolean; error?: string }> {
  try {
    const r = await nodePost<Record<string, unknown>>('/api/node/channel/add-member', token, { channel_id: channelId, user_id: userId });
    if (Number(r.api_status) !== 200) return { ok: false, error: String(r.error_message ?? 'failed') };
    return { ok: true };
  } catch {
    return { ok: false, error: 'network' };
  }
}

export async function removeChannelAdmin(token: string, channelId: number, userId: number): Promise<void> {
  await nodePost('/api/node/channel/remove-admin', token, { channel_id: channelId, user_id: userId });
}

export async function loadChannelSubscribers(token: string, channelId: number, limit = 50, offset = 0): Promise<ChannelSubscriber[]> {
  try {
    const r = await nodePost<Record<string, unknown>>('/api/node/channel/subscribers', token, { channel_id: channelId, limit, offset });
    const list = (r.subscribers ?? r.data ?? []) as Record<string, unknown>[];
    return list.map(s => ({
      user_id: s.user_id ? Number(s.user_id) : undefined,
      username: s.username ? String(s.username) : undefined,
      name: s.name ? String(s.name) : undefined,
      avatar: s.avatar ? String(s.avatar) : undefined,
      subscribed_time: s.subscribed_time ? Number(s.subscribed_time) : undefined,
      is_muted: Boolean(s.is_muted), is_banned: Boolean(s.is_banned),
      role: s.role ? String(s.role) : undefined,
    }));
  } catch { return []; }
}

export async function loadChannelBanned(token: string, channelId: number, limit = 50, offset = 0): Promise<ChannelBannedMember[]> {
  try {
    const r = await nodePost<Record<string, unknown>>('/api/node/channel/banned', token, { channel_id: channelId, limit, offset });
    const list = (r.banned ?? r.data ?? []) as Record<string, unknown>[];
    return list.map(b => ({
      user_id: Number(b.user_id ?? 0), username: b.username ? String(b.username) : undefined,
      name: b.name ? String(b.name) : undefined, avatar: b.avatar ? String(b.avatar) : undefined,
      reason: b.reason ? String(b.reason) : undefined,
      banned_until: b.banned_until ? Number(b.banned_until) : undefined,
      banned_time: b.banned_time ? Number(b.banned_time) : undefined,
    }));
  } catch { return []; }
}

export async function banChannelMember(
  token: string, channelId: number, userId: number,
  reason?: string, durationSeconds?: number,
  banType: 'channel' | 'stream' | 'chat' = 'channel'
): Promise<void> {
  await nodePost('/api/node/channel/ban-member', token, {
    channel_id: channelId, user_id: userId, ban_type: banType,
    ...(reason ? { reason } : {}),
    ...(durationSeconds ? { duration_seconds: durationSeconds } : {}),
  });
}

export async function unbanChannelMember(
  token: string, channelId: number, userId: number,
  banType?: 'channel' | 'stream' | 'chat'
): Promise<void> {
  await nodePost('/api/node/channel/unban-member', token, {
    channel_id: channelId, user_id: userId,
    ...(banType ? { ban_type: banType } : {}),
  });
}

export async function kickChannelMember(token: string, channelId: number, userId: number): Promise<void> {
  await nodePost('/api/node/channel/kick-member', token, { channel_id: channelId, user_id: userId });
}

export async function updateChannelInfo(token: string, channelId: number, name: string, description: string, username?: string): Promise<void> {
  await nodePost('/api/node/channel/update', token, {
    channel_id: channelId, name, description,
    ...(username ? { username } : {}),
  });
}

export async function updateChannelSettings(token: string, channelId: number, settings: Partial<ChannelSettings>): Promise<void> {
  await nodePost('/api/node/channel/settings', token, { channel_id: channelId, settings_json: JSON.stringify(settings) });
}

// ── Channel discussion group (Telegram-style "linked chat") ─────────────────
// Backend: routes/channels/discussion.js — one group per channel, admin-only,
// stored in wm_channel_discussion. Creating the group itself reuses the
// existing group-create endpoint (createGroup, above); this just links it.
export interface DiscussionGroupInfo {
  id: number;
  name: string;
  avatar: string | null;
  member_count: number;
}

export async function getDiscussionGroup(token: string, channelId: number): Promise<DiscussionGroupInfo | null> {
  try {
    const r = await nodePost<{ discussion_group?: DiscussionGroupInfo | null }>('/api/node/channel/discussion/get', token, { channel_id: channelId });
    return r.discussion_group ?? null;
  } catch { return null; }
}

/** Pass groupId=null to unlink. */
export async function setDiscussionGroup(token: string, channelId: number, groupId: number | null): Promise<DiscussionGroupInfo | null> {
  const r = await nodePost<{ discussion_group?: DiscussionGroupInfo | null; error_message?: string }>('/api/node/channel/discussion/set', token, {
    channel_id: channelId, group_id: groupId ?? '',
  });
  return r.discussion_group ?? null;
}

export async function getChannelActiveMembers(token: string, channelId: number, periodDays = 30): Promise<ActiveMember[]> {
  try {
    const r = await nodePost<Record<string, unknown>>('/api/node/channel/active-members', token, { channel_id: channelId, period_days: periodDays });
    const list = (r.members ?? r.data ?? []) as Record<string, unknown>[];
    return list.map(m => ({
      user_id: Number(m.user_id ?? 0), username: m.username ? String(m.username) : undefined,
      name: m.name ? String(m.name) : undefined, avatar_url: m.avatar_url ? String(m.avatar_url) : undefined,
      comment_count: Number(m.comment_count ?? 0), reaction_count: Number(m.reaction_count ?? 0),
      score: Number(m.score ?? 0),
    }));
  } catch { return []; }
}

export interface CreateChannelExtra {
  category?: string;
  website?: string;
  facebook?: string;
  twitter?: string;
  instagram?: string;
  youtube?: string;
  vk?: string;
  linkedin?: string;
  phone?: string;
  company?: string;
  avatarColor?: string;
  emoji?: string;
}

// `extra` is a trailing optional param (not folded into the existing
// positional args) so the two pre-existing callers — Sidebar.tsx's modal
// flow and useHandlers.ts's older inline quick-create form — keep working
// unchanged; only the modal flow needs to pass it.
export async function createChannelFull(
  token: string, name: string, description: string, username?: string, isPrivate?: boolean,
  extra?: CreateChannelExtra,
): Promise<number | null> {
  try {
    const r = await nodePost<Record<string, unknown>>('/api/node/channel/create', token, {
      name,
      description,
      ...(username ? { username } : {}),
      is_private: isPrivate ? 1 : 0,
      ...(extra?.category ? { category: extra.category } : {}),
      ...(extra?.website ? { website: extra.website } : {}),
      ...(extra?.facebook ? { facebook: extra.facebook } : {}),
      ...(extra?.twitter ? { twitter: extra.twitter } : {}),
      ...(extra?.instagram ? { instagram: extra.instagram } : {}),
      ...(extra?.youtube ? { youtube: extra.youtube } : {}),
      ...(extra?.vk ? { vk: extra.vk } : {}),
      ...(extra?.linkedin ? { linkedin: extra.linkedin } : {}),
      ...(extra?.phone ? { phone: extra.phone } : {}),
      ...(extra?.company ? { company: extra.company } : {}),
      ...(extra?.avatarColor ? { avatar_color: extra.avatarColor } : {}),
      ...(extra?.emoji ? { emoji: extra.emoji } : {}),
    });
    return r.channel_id ? Number(r.channel_id) : (r.id ? Number(r.id) : null);
  } catch (e) {
    console.error('[channel] createChannelFull error:', e);
    return null;
  }
}

/** Uploads a channel cover image right after creation (channel_id must
 *  already exist — see admin.js's uploadCover, mirrors uploadAvatar's
 *  moderation-gated flow). Returns the resolved cover URL, or null on
 *  failure — best-effort, callers shouldn't fail channel creation over it. */
export async function uploadChannelCoverFile(token: string, channelId: number, file: File): Promise<string | null> {
  try {
    const text = await doUpload(`${NODE_BASE_URL}/api/node/channel/upload-cover`, token, { channel_id: String(channelId) }, file);
    const resp = await parseJson<Record<string, unknown>>(text);
    return resp.url ? String(resp.url) : null;
  } catch (e) {
    console.error('[channel] uploadChannelCoverFile error:', e);
    return null;
  }
}

/** Real gap, found 2026-09-16: there was no way at all to set/change a channel's
 *  round avatar_url after creation (channel/create only takes avatarColor/emoji
 *  for a generated placeholder — no real-photo upload anywhere).
 *  CONFIRMED against the actual backend (routes/channels/index.js) this same
 *  session: the route is real — POST /api/node/channel/upload-avatar — but
 *  deliberately expects the multipart field named 'avatar', not 'file' like
 *  every other upload in this app (that route's own comment: it was never
 *  given a Windows caller before now, so it was left as-is rather than risk
 *  changing a field name some other client might depend on). Passing
 *  'avatar' as doUpload's fieldName here — NOT the shared default — is not
 *  a mistake, it's this endpoint's actual contract. */
export async function uploadChannelAvatarFile(token: string, channelId: number, file: File): Promise<string | null> {
  try {
    const text = await doUpload(`${NODE_BASE_URL}/api/node/channel/upload-avatar`, token, { channel_id: String(channelId) }, file, 'avatar');
    const resp = await parseJson<Record<string, unknown>>(text);
    return resp.url ? String(resp.url) : null;
  } catch (e) {
    console.error('[channel] uploadChannelAvatarFile error:', e);
    return null;
  }
}

// ─── Batch 5: Group admin API ──────────────────────────────────────────────────

export async function loadGroupMembers(token: string, groupId: number, limit = 100): Promise<GroupMemberFull[]> {
  try {
    const r = await nodePost<Record<string, unknown>>('/api/node/group/members', token, { group_id: groupId, limit, offset: 0 });
    const list = (r.members ?? r.data ?? []) as Record<string, unknown>[];
    return list.map(m => ({
      user_id: Number(m.user_id ?? 0), username: String(m.username ?? ''),
      avatar: m.avatar ? String(m.avatar) : undefined,
      role: (['owner','admin','moderator','member'].includes(String(m.role)) ? m.role : 'member') as GroupMemberFull['role'],
      joined_time: Number(m.joined_time ?? 0),
      is_muted: Boolean(m.is_muted), is_blocked: Boolean(m.is_blocked),
      permissions: Array.isArray(m.permissions) ? (m.permissions as string[]) : undefined,
    }));
  } catch { return []; }
}

export async function setGroupMemberRole(token: string, groupId: number, userId: number, role: string): Promise<void> {
  await nodePost('/api/node/group/set-role', token, { group_id: groupId, user_id: userId, role });
}

export async function removeGroupMember(token: string, groupId: number, userId: number): Promise<void> {
  await nodePost('/api/node/group/remove-member', token, { group_id: groupId, user_id: userId });
}

export async function banGroupMember(token: string, groupId: number, userId: number, reason?: string): Promise<void> {
  await nodePost('/api/node/group/ban-member', token, { group_id: groupId, user_id: userId, ...(reason ? { reason } : {}) });
}

export async function unbanGroupMember(token: string, groupId: number, userId: number): Promise<void> {
  await nodePost('/api/node/group/unban-member', token, { group_id: groupId, user_id: userId });
}

export async function loadGroupJoinRequests(token: string, groupId: number): Promise<GroupJoinRequest[]> {
  try {
    const r = await nodePost<Record<string, unknown>>('/api/node/group/join-requests', token, { group_id: groupId });
    const list = (r.requests ?? r.data ?? []) as Record<string, unknown>[];
    return list.map(req => ({
      id: Number(req.id ?? 0), group_id: groupId, user_id: Number(req.user_id ?? 0),
      username: String(req.username ?? ''), user_avatar: req.user_avatar ? String(req.user_avatar) : undefined,
      message: req.message ? String(req.message) : undefined,
      status: (['pending','approved','rejected'].includes(String(req.status)) ? req.status : 'pending') as GroupJoinRequest['status'],
      created_time: Number(req.created_time ?? 0),
    }));
  } catch { return []; }
}

export async function approveGroupJoinRequest(token: string, groupId: number, requestId: number): Promise<void> {
  await nodePost('/api/node/group/approve-join', token, { group_id: groupId, request_id: requestId });
}

export async function rejectGroupJoinRequest(token: string, groupId: number, requestId: number): Promise<void> {
  await nodePost('/api/node/group/reject-join', token, { group_id: groupId, request_id: requestId });
}

export async function updateGroupSettings(token: string, groupId: number, settings: Partial<GroupSettings>): Promise<void> {
  await nodePost('/api/node/group/settings', token, { group_id: groupId, ...settings });
}

export async function updateGroupInfo(token: string, groupId: number, name: string, description: string, isPrivate: boolean): Promise<void> {
  await nodePost('/api/node/group/update', token, { group_id: groupId, group_name: name, description, is_private: isPrivate });
}

export async function getGroupStatistics(token: string, groupId: number): Promise<GroupStatistics | null> {
  try {
    const r = await nodePost<Record<string, unknown>>('/api/node/group/statistics', token, { group_id: groupId });
    const s = (r.statistics ?? r.data ?? r) as Record<string, unknown>;
    return {
      group_id:            Number(s.group_id ?? groupId),
      members_count:       Number(s.members_count ?? 0),
      messages_count:      Number(s.messages_count ?? 0),
      messages_today:      Number(s.messages_today ?? 0),
      messages_this_week:  Number(s.messages_this_week ?? 0),
      messages_this_month: Number(s.messages_this_month ?? 0),
      active_members_24h:  Number(s.active_members_24h ?? 0),
      active_members_week: Number(s.active_members_week ?? 0),
      media_count:         Number(s.media_count ?? 0),
      links_count:         Number(s.links_count ?? 0),
      new_members_today:   Number(s.new_members_today ?? 0),
      new_members_week:    Number(s.new_members_week ?? 0),
      left_members_week:   Number(s.left_members_week ?? 0),
      top_contributors:    Array.isArray(s.top_contributors) ? (s.top_contributors as Record<string, unknown>[]).map(c => ({
        user_id: Number(c.user_id ?? 0), username: String(c.username ?? ''),
        name: c.name ? String(c.name) : undefined, avatar: c.avatar ? String(c.avatar) : undefined,
        messages_count: Number(c.messages_count ?? 0),
      })) : undefined,
      peak_hours: Array.isArray(s.peak_hours) ? (s.peak_hours as number[]) : undefined,
      growth_rate: Number(s.growth_rate ?? 0),
    };
  } catch { return null; }
}

export async function loadGroupAdminLogs(token: string, groupId: number, page = 1): Promise<{ logs: AdminLogEntry[]; total: number }> {
  try {
    const r = await nodePost<Record<string, unknown>>('/api/node/group/admin-logs', token, { group_id: groupId, page, limit: 50 });
    const list = (r.logs ?? r.data ?? []) as Record<string, unknown>[];
    return {
      total: Number(r.total ?? list.length),
      logs: list.map(l => ({
        id: l.id ? Number(l.id) : undefined,
        admin_id: l.admin_id ? Number(l.admin_id) : undefined,
        admin_name: String(l.admin_name ?? l.adminName ?? ''),
        admin_avatar: l.admin_avatar ? String(l.admin_avatar) : undefined,
        action: String(l.action ?? ''),
        target_user_name: l.target_user_name ? String(l.target_user_name) : undefined,
        details: l.details ? String(l.details) : undefined,
        created_at: String(l.created_at ?? l.createdAt ?? ''),
      })),
    };
  } catch { return { logs: [], total: 0 }; }
}

// ─── Group giveaway ───────────────────────────────────────────────────────────
// routes/groups/giveaway.js — server-side Fisher-Yates over real group membership
// (optionally filtered by min_messages sent within period_days); admin/owner only.
// NOTE: the endpoint only returns the winner list — it does NOT itself post
// anything to the chat or emit a socket event, so GiveawayModal follows up with
// a normal sendGroupMessage() announcement (broadcast via the existing
// 'group_message' socket event every client already listens for).
export type GroupGiveawayWinner = {
  place:      number;
  user_id:    number;
  username:   string | null;
  name:       string | null;
  avatar_url: string | null;
};

export async function runGroupGiveaway(
  token: string, groupId: number, winnersCount: number, minMessages: number, periodDays: number
): Promise<{ ok: boolean; error?: string; winners: GroupGiveawayWinner[]; total_participants: number; period_days: number }> {
  try {
    const r = await nodePost<Record<string, unknown>>('/api/node/group/giveaway/run', token, {
      group_id: groupId, winners_count: winnersCount, min_messages: minMessages, period_days: periodDays,
    });
    if (Number(r.api_status) !== 200) {
      return { ok: false, error: String(r.error_message ?? 'failed'), winners: [], total_participants: 0, period_days: periodDays };
    }
    const list = Array.isArray(r.winners) ? (r.winners as Record<string, unknown>[]) : [];
    return {
      ok: true,
      winners: list.map(w => ({
        place:      Number(w.place ?? 0),
        user_id:    Number(w.user_id ?? 0),
        username:   w.username   != null ? String(w.username)   : null,
        name:       w.name       != null ? String(w.name)       : null,
        avatar_url: w.avatar_url != null ? String(w.avatar_url) : null,
      })),
      total_participants: Number(r.total_participants ?? 0),
      period_days:        Number(r.period_days ?? periodDays),
    };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'network', winners: [], total_participants: 0, period_days: periodDays };
  }
}

// ─── Giveaways (participatory, Android 1.55.0) ──────────────────────────────
// routes/groups/giveaways.js — one engine for groups and channels. The server
// publishes the card itself (group message type_two='giveaway' / channel post
// '__giveaway__'), runs the draw on time or on the participant cap, and emits
// 'giveaway_update' to the chat room. Fairness: SHA-256(seed) is public while
// it runs; the seed is revealed after the draw.

export type GiveawayErrorCode = 'not_found' | 'ended' | 'not_member' | 'not_subscribed' | 'full' | null;

export type GiveawayResult =
  | { ok: true; giveaway: GiveawayState }
  | { ok: false; error: string; code: GiveawayErrorCode; channelId: number | null };

export interface CreateGiveawayInput {
  chatType:          'group' | 'channel';
  chatId:            number;
  prize:             string;
  description?:      string;
  buttonText?:       string;
  /** http(s) URL uploaded beforehand via uploadMedia(). */
  mediaUrl?:         string;
  winners:           number;
  /** Either an exact end (unix seconds) or a duration. Server clamps to 5 min … 60 days. */
  endsAt?:           number;
  durationMinutes?:  number;
  /** Draw as soon as this many joined. */
  maxParticipants?:  number;
  /** Channel ids or @usernames the participant must be subscribed to (max 5). */
  requiredChannels?: Array<number | string>;
}

function normaliseGiveawayUser(u: unknown) {
  const o = (u && typeof u === 'object' ? u : {}) as Record<string, unknown>;
  return {
    user_id:    Number(o.user_id ?? 0),
    username:   o.username != null ? toStr(o.username, '') : null,
    name:       o.name != null ? toStr(o.name, '') : null,
    avatar_url: o.avatar_url != null ? toStr(o.avatar_url, '') : null,
  };
}

export function normaliseGiveaway(raw: Record<string, unknown>): GiveawayState {
  const chat = raw.chat && typeof raw.chat === 'object' ? raw.chat as Record<string, unknown> : null;
  const status = toStr(raw.status, 'active');
  return {
    id:                 Number(raw.id ?? 0),
    chat_type:          raw.chat_type === 'channel' ? 'channel' : 'group',
    chat_id:            Number(raw.chat_id ?? raw.group_id ?? 0),
    chat:               chat ? {
      type: chat.type === 'channel' ? 'channel' : 'group',
      id: Number(chat.id ?? 0), name: toStr(chat.name, ''),
      username: chat.username != null ? toStr(chat.username, '') : null,
    } : null,
    message_id:         Number(raw.message_id ?? 0),
    prize:              toStr(raw.prize, ''),
    description:        raw.description != null ? toStr(raw.description, '') : null,
    button_text:        raw.button_text ? toStr(raw.button_text, '') : null,
    media_url:          raw.media_url ? toStr(raw.media_url, '') : null,
    winners_count:      Number(raw.winners_count ?? 1),
    ends_at:            Number(raw.ends_at ?? 0),
    max_participants:   raw.max_participants != null ? Number(raw.max_participants) : null,
    status:             status === 'finished' || status === 'cancelled' ? status : 'active',
    participants_count: Number(raw.participants_count ?? 0),
    joined:             Boolean(raw.joined),
    is_winner:          Boolean(raw.is_winner),
    can_manage:         Boolean(raw.can_manage),
    required_channels:  Array.isArray(raw.required_channels) ? (raw.required_channels as Record<string, unknown>[]).map(c => ({
      id: Number(c.id ?? 0), username: toStr(c.username, ''), name: toStr(c.name, ''),
      avatar_url: c.avatar_url ? toStr(c.avatar_url, '') : null, subscribed: Boolean(c.subscribed),
    })) : [],
    winners:            Array.isArray(raw.winners) ? (raw.winners as Record<string, unknown>[]).map(w => ({
      ...normaliseGiveawayUser(w), place: Number(w.place ?? 0),
    })) : [],
    seed_hash:          toStr(raw.seed_hash, ''),
    seed:               raw.seed ? toStr(raw.seed, '') : null,
    created_at:         Number(raw.created_at ?? 0),
    finished_at:        raw.finished_at != null ? Number(raw.finished_at) : null,
    creator:            raw.creator ? normaliseGiveawayUser(raw.creator) : null,
  };
}

async function giveawayCall(name: string, token: string, body: Record<string, unknown>): Promise<GiveawayResult> {
  try {
    const r = await nodePost<Record<string, unknown>>(`/api/node/giveaways/${name}`, token, body);
    if (Number(r.api_status) === 200 && r.giveaway && typeof r.giveaway === 'object') {
      return { ok: true, giveaway: normaliseGiveaway(r.giveaway as Record<string, unknown>) };
    }
    const code = toStr(r.error_code, '') as GiveawayErrorCode;
    return {
      ok: false, error: toStr(r.error_message, 'failed'),
      code: code || null, channelId: r.channel_id != null ? Number(r.channel_id) : null,
    };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'network', code: null, channelId: null };
  }
}

export function createGiveaway(token: string, p: CreateGiveawayInput): Promise<GiveawayResult> {
  const body: Record<string, unknown> = {
    chat_type: p.chatType, chat_id: p.chatId, prize: p.prize.trim(),
    winners_count: Math.max(1, Math.min(1000, Math.floor(p.winners) || 1)),
  };
  if (p.description?.trim()) body.description = p.description.trim();
  if (p.buttonText?.trim())  body.button_text = p.buttonText.trim();
  if (p.mediaUrl)            body.media_url = p.mediaUrl;
  if (p.endsAt)              body.ends_at = Math.floor(p.endsAt);
  else if (p.durationMinutes) body.duration_minutes = Math.floor(p.durationMinutes);
  if (p.maxParticipants && p.maxParticipants > 0) body.max_participants = Math.floor(p.maxParticipants);
  if (p.requiredChannels?.length) body.required_channels = p.requiredChannels.join(',');
  return giveawayCall('create', token, body);
}

export const getGiveaway    = (token: string, id: number) => giveawayCall('get',    token, { giveaway_id: id });
export const joinGiveaway   = (token: string, id: number) => giveawayCall('join',   token, { giveaway_id: id });
export const finishGiveaway = (token: string, id: number) => giveawayCall('finish', token, { giveaway_id: id });
export const cancelGiveaway = (token: string, id: number) => giveawayCall('cancel', token, { giveaway_id: id });

async function giveawayList(name: string, token: string, body: Record<string, unknown>): Promise<GiveawayState[]> {
  try {
    const r = await nodePost<Record<string, unknown>>(`/api/node/giveaways/${name}`, token, body);
    return Array.isArray(r.giveaways) ? (r.giveaways as Record<string, unknown>[]).map(normaliseGiveaway) : [];
  } catch { return []; }
}

export const listChatGiveaways = (token: string, chatType: 'group' | 'channel', chatId: number) =>
  giveawayList('list', token, { chat_type: chatType, chat_id: chatId });
export const listMyGiveaways = (token: string) => giveawayList('mine', token, {});

/** Channels and groups the user administers — targets for a new giveaway. */
export async function listGiveawayTargets(token: string): Promise<{ channels: GiveawayTarget[]; groups: GiveawayTarget[] }> {
  const map = (arr: unknown, type: 'group' | 'channel'): GiveawayTarget[] => Array.isArray(arr)
    ? (arr as Record<string, unknown>[]).map(x => ({
        type, id: Number(x.id ?? 0), name: toStr(x.name, ''), username: x.username != null ? toStr(x.username, '') : null,
      }))
    : [];
  try {
    const r = await nodePost<Record<string, unknown>>('/api/node/giveaways/targets', token, {});
    return { channels: map(r.channels, 'channel'), groups: map(r.groups, 'group') };
  } catch { return { channels: [], groups: [] }; }
}

// ─── Anonymous admin ────────────────────────────────────────────────────────
// routes/groups/anonymous_admin.js — per-admin, per-group flag persisted on
// Wo_GroupAdmins.is_anonymous_admin.
// OPEN QUESTION / known backend gap (checked 2026-08-23): the flag is only ever
// written/read by these two endpoints. routes/groups/messages.js sendMessage()
// and buildMessage() never consult Wo_GroupAdmins.is_anonymous_admin, so turning
// this on does not yet change how a member's messages are displayed to others —
// on ANY client. Android's reference implementation (GroupsViewModel.kt
// setAnonymousAdmin/loadAnonymousAdmin) does exactly the same thing: it persists
// the flag server-side and does not attach it to message sends either. Treat
// this as "real settings persistence", not "real anonymized message rendering" —
// the latter needs a backend change (out of scope here, nodejs is read-only).
export async function getAnonymousAdmin(token: string, groupId: number): Promise<{ ok: boolean; anonymous: boolean; error?: string }> {
  try {
    const r = await nodePost<Record<string, unknown>>('/api/node/group/admin/get-anonymous', token, { group_id: groupId });
    if (Number(r.api_status) !== 200) return { ok: false, anonymous: false, error: String(r.error_message ?? 'failed') };
    return { ok: true, anonymous: r.anonymous === true };
  } catch (e) {
    return { ok: false, anonymous: false, error: e instanceof Error ? e.message : 'network' };
  }
}

export async function setAnonymousAdmin(token: string, groupId: number, anonymous: boolean): Promise<{ ok: boolean; anonymous: boolean; error?: string }> {
  try {
    const r = await nodePost<Record<string, unknown>>('/api/node/group/admin/set-anonymous', token, {
      group_id: groupId, anonymous: anonymous ? '1' : '0',
    });
    if (Number(r.api_status) !== 200) return { ok: false, anonymous: false, error: String(r.error_message ?? 'failed') };
    return { ok: true, anonymous: r.anonymous === true };
  } catch (e) {
    return { ok: false, anonymous: false, error: e instanceof Error ? e.message : 'network' };
  }
}

// ─── Media gallery ────────────────────────────────────────────────────────────

export type MediaGalleryItem = {
  url:      string;
  type:     'image' | 'video' | 'gif' | 'music' | 'voice';
  thumb?:   string;
  caption?: string;
  date?:    string;
  sender?:  string;
  filename?: string;
};

function classifyMedia(mt: string, mediaPath: string, filename?: string): MediaGalleryItem['type'] | null {
  const fn = (filename ?? mediaPath).toLowerCase();
  // Voice: explicit type, or VOICE_ filename prefix, or known voice exts
  const isVoiceExt = /\.(ogg|opus|webm|m4a)$/i.test(fn);
  const isVoicePrefix = /\/VOICE_/i.test(fn) || /^VOICE_/i.test(fn.split('/').pop() ?? '');
  if (mt === 'voice' || isVoicePrefix || (mt === 'audio' && isVoiceExt)) return 'voice';
  // Music: mp3/wav/flac/aac or generic audio type without voice signals
  if (/\.(mp3|wav|flac|aac|m4a)$/i.test(fn) || mt === 'audio') return 'music';
  // Video
  if (mt === 'video' || /\.(mp4|webm|mov|mkv|m4v|avi)$/i.test(fn)) return 'video';
  // GIF
  if (mt === 'gif' || /\.gif$/i.test(fn)) return 'gif';
  // Image
  if (['image', 'photo'].includes(mt) || /\.(jpg|jpeg|png|webp)$/i.test(fn)) return 'image';
  return null;
}

/** Load all media messages from a 1-on-1 chat (up to 4 pages × 40). */
export async function getChatMedia(token: string, recipientId: number): Promise<MediaGalleryItem[]> {
  const MEDIA_TYPES = new Set(['image', 'video', 'gif', 'photo']);
  const MEDIA_EXTS  = /\.(jpg|jpeg|png|gif|webp|mp4|webm|mov|mkv)$/i;
  const items: MediaGalleryItem[] = [];
  const seen = new Set<string>();

  let beforeId = 0;
  for (let page = 0; page < 4; page++) {
    const resp = await nodePost<Record<string, unknown>>(
      page === 0 ? '/api/node/chat/get' : '/api/node/chat/loadmore',
      token,
      { recipient_id: recipientId, limit: 40, before_message_id: beforeId }
    );
    const msgs = normaliseMessages(resp).messages ?? [];
    if (!msgs.length) break;
    const lastId = msgs[msgs.length - 1].id;
    if (page > 0 && lastId === beforeId) break; // no progress — server sent same page
    for (const m of msgs) {
      if (!m.media) continue;
      const url = resolveUrl(m.media);
      if (seen.has(url)) continue;
      const mt = (m.media_type ?? '').toLowerCase();
      const type = classifyMedia(mt, m.media, m.media_filename);
      if (!type) continue;
      seen.add(url);
      items.push({ url, type, filename: m.media_filename, caption: m.text || undefined, date: m.time ? String(m.time) : undefined });
    }
    beforeId = lastId;
    if (msgs.length < 40) break;
  }
  return items;
}

/** Load all media messages from a group. */
export async function getGroupMedia(token: string, groupId: number): Promise<MediaGalleryItem[]> {
  const items: MediaGalleryItem[] = [];
  const seen = new Set<string>();

  let beforeId = 0;
  for (let page = 0; page < 4; page++) {
    const resp = await nodePost<Record<string, unknown>>(
      page === 0 ? '/api/node/group/messages/get' : '/api/node/group/messages/loadmore',
      token,
      { group_id: groupId, limit: 40, before_message_id: beforeId }
    );
    const msgs = normaliseMessages(resp).messages ?? [];
    if (!msgs.length) break;
    const lastId = msgs[msgs.length - 1].id;
    if (page > 0 && lastId === beforeId) break;
    for (const m of msgs) {
      if (!m.media) continue;
      const url = resolveUrl(m.media);
      if (seen.has(url)) continue;
      const mt = (m.media_type ?? '').toLowerCase();
      const type = classifyMedia(mt, m.media, m.media_filename);
      if (!type) continue;
      seen.add(url);
      items.push({ url, type, filename: m.media_filename, caption: m.text || undefined, date: m.time ? String(m.time) : undefined });
    }
    beforeId = lastId;
    if (msgs.length < 40) break;
  }
  return items;
}

/** Load all media posts from a channel. */
export async function getChannelMedia(token: string, channelId: number): Promise<MediaGalleryItem[]> {
  const MEDIA_EXTS = /\.(jpg|jpeg|png|gif|webp|mp4|webm|mov|mkv|mp3|wav|flac|aac|ogg|opus)$/i;
  const VIDEO_RE   = /\.(mp4|webm|mov|mkv)$/i;
  const AUDIO_RE   = /\.(mp3|wav|flac|aac|ogg|opus)$/i;
  const items: MediaGalleryItem[] = [];

  let offset = 0;
  for (let page = 0; page < 4; page++) {
    const resp = await nodePost<Record<string, unknown>>('/api/node/channel/posts', token, {
      channel_id: channelId, limit: 40, offset
    });
    const raw = (resp.posts ?? resp.data ?? []) as Record<string, unknown>[];
    if (!raw.length) break;
    for (const p of raw) {
      const caption = p.text ? String(p.text).slice(0, 80) : undefined;
      const date    = p.created_at ? String(p.created_at) : undefined;

      // New format: media_items array (contains url + type per item)
      const mediaItems = Array.isArray(p.media_items) ? p.media_items as Record<string, unknown>[] : [];
      if (mediaItems.length > 0) {
        for (const mi of mediaItems) {
          const url = String(mi.url ?? '');
          if (!url) continue;
          const miType = String(mi.type ?? '');
          const isVideo = miType === 'video' || VIDEO_RE.test(url);
          const isAudio = miType === 'audio' || miType === 'voice' || AUDIO_RE.test(url);
          if (!isVideo && !isAudio && !MEDIA_EXTS.test(url)) continue;
          items.push({
            url:     resolveUrl(url),
            type:    isVideo ? 'video' : isAudio ? 'music' : 'image',
            thumb:   mi.thumbnail_url ? resolveUrl(String(mi.thumbnail_url)) : undefined,
            caption,
            date,
          });
        }
        continue; // post handled via media_items; skip legacy field
      }

      // Legacy format: single media URL in top-level field
      const mediaUrl = String(p.media ?? p.image_src ?? p.video_src ?? '');
      if (!mediaUrl || !MEDIA_EXTS.test(mediaUrl)) continue;
      const isVideo = VIDEO_RE.test(mediaUrl);
      items.push({
        url:     resolveUrl(mediaUrl),
        type:    isVideo ? 'video' : 'image',
        caption,
        date,
      });
    }
    offset += raw.length;
    if (raw.length < 40) break;
  }
  return items;
}

function resolveUrl(path: string): string {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  const base = (window as Window & { __API_BASE__?: string }).__API_BASE__ ?? SITE_BASE;
  return `${base}/${path.replace(/^\//, '')}`;
}

// ─── Group Polls ────────────────────────────────────────────────────────────

export type GroupPollOption = { id: number; text: string; vote_count: number; percent: number };
export type GroupPoll = {
  id:          number;
  question:    string;
  options:     GroupPollOption[];
  is_anonymous: boolean;
  is_quiz:     boolean;
  is_closed:   boolean;
  total_votes: number;
  user_voted?: number[];  // option ids the current user voted for
};

export async function createGroupPoll(
  token:        string,
  groupId:      number,
  question:     string,
  options:      string[],
  is_anonymous: boolean,
  is_quiz:      boolean,
): Promise<{ poll_id: number }> {
  return nodePost('/groups/polls/create', token, {
    group_id: groupId, question,
    options:  JSON.stringify(options),
    is_anonymous: is_anonymous ? 1 : 0,
    is_quiz:      is_quiz ? 1 : 0,
  });
}

export async function voteGroupPoll(token: string, pollId: number, optionId: number): Promise<void> {
  await nodePost('/groups/polls/vote', token, { poll_id: pollId, option_id: optionId });
}

export async function closeGroupPoll(token: string, pollId: number): Promise<void> {
  await nodePost('/groups/polls/close', token, { poll_id: pollId });
}

export async function getGroupPoll(token: string, pollId: number): Promise<GroupPoll> {
  return nodeGet(`/groups/polls/${pollId}`, token);
}

// ─── Session Management ─────────────────────────────────────────────────────

export type UserSession = {
  id:          number;
  device_name: string;
  platform:    string;
  ip:          string;
  last_active: string;
  is_current:  boolean;
};

export async function getActiveSessions(token: string): Promise<UserSession[]> {
  const r = await nodeGet<{ sessions?: UserSession[] }>('/user/sessions', token);
  return r.sessions ?? [];
}

export async function revokeSession(token: string, sessionId: number): Promise<void> {
  await nodePost('/user/sessions/revoke', token, { session_id: sessionId });
}

export async function revokeAllOtherSessions(token: string): Promise<void> {
  await nodePost('/user/sessions/revoke-all', token, {});
}

// ─── Voice transcription ────────────────────────────────────────────────────

export async function translateMessage(
  token: string,
  text: string,
  targetLang: string,
  sourceLang = 'auto',
): Promise<string> {
  try {
    const r = await nodePost<{ translated_text?: string; translation?: string; text?: string }>(
      '/api/node/chat/translate', token, { text, target_lang: targetLang, source_lang: sourceLang }
    );
    return r.translated_text ?? r.translation ?? r.text ?? '';
  } catch {
    return '';
  }
}

export async function transcribeVoice(token: string, audioUrl: string): Promise<string> {
  try {
    const r = await nodePost<{ text?: string; transcript?: string }>(
      '/api/node/voice/transcribe', token, { url: audioUrl }
    );
    return r.text ?? r.transcript ?? '';
  } catch {
    return '';
  }
}

// ─── User Rating / Karma ───────────────────────────────────────────────────────

export async function getUserRating(token: string, userId: number): Promise<UserRating | null> {
  try {
    const r = await nodeGet<{ api_status: number; rating?: UserRating }>(
      `/api/node/users/${userId}/rating`, token
    );
    return r.rating ?? null;
  } catch {
    return null;
  }
}

/** Server anti-abuse refusals (routes/users/karma-helper.js). */
export type RateUserErrorCode = 'KARMA_TOO_NEW' | 'KARMA_COOLDOWN' | 'KARMA_DAILY_LIMIT' | 'KARMA_NO_CONTACT';
export type RateUserResult =
  | { ok: true; rating: UserRating }
  | { ok: false; code?: RateUserErrorCode | string; error?: string };

export async function rateUser(
  token: string,
  userId: number,
  ratingType: 'like' | 'dislike',
  comment?: string,
): Promise<RateUserResult> {
  try {
    const body: Record<string, string> = { rating_type: ratingType };
    if (comment) body.comment = comment;
    const r = await nodePost<{ api_status: number; user_rating?: UserRating; error_code?: string; error_message?: string }>(
      `/api/node/users/${userId}/rate`, token, body
    );
    if (r.api_status === 200 && r.user_rating) return { ok: true, rating: r.user_rating };
    return { ok: false, code: r.error_code, error: r.error_message };
  } catch {
    return { ok: false };
  }
}

// ─── Follow / Followers / Following ──────────────────────────────────────────

export type FollowUser = {
  user_id: number;
  name:    string;
  avatar?: string;
  username?: string;
};

export async function loadFollowers(token: string, limit = 50, offset = 0): Promise<FollowUser[]> {
  try {
    const r = await nodePost<Record<string, unknown>>('/api/node/users/me/followers', token, { limit, offset });
    const list = (r.followers ?? r.data ?? []) as Record<string, unknown>[];
    return list.map(u => ({
      user_id:  Number(u.user_id ?? u.id ?? 0),
      name:     toStr(u.name ?? u.username, ''),
      avatar:   u.avatar ? String(u.avatar) : undefined,
      username: u.username ? String(u.username) : undefined,
    }));
  } catch { return []; }
}

export async function loadFollowing(token: string, limit = 50, offset = 0): Promise<FollowUser[]> {
  try {
    const r = await nodePost<Record<string, unknown>>('/api/node/users/me/following', token, { limit, offset });
    const list = (r.following ?? r.data ?? []) as Record<string, unknown>[];
    return list.map(u => ({
      user_id:  Number(u.user_id ?? u.id ?? 0),
      name:     toStr(u.name ?? u.username, ''),
      avatar:   u.avatar ? String(u.avatar) : undefined,
      username: u.username ? String(u.username) : undefined,
    }));
  } catch { return []; }
}

export async function unfollowUser(token: string, userId: number): Promise<void> {
  await nodePost('/api/node/users/' + userId + '/unfollow', token, {});
}

// ─── Geo Nearby People ────────────────────────────────────────────────────────

export interface NearbyUser {
  user_id:      number;
  username:     string;
  display_name: string;
  avatar?:      string;
  distance_km:  number;
  last_seen?:   string;
}

export async function loadNearbyUsers(
  token:     string,
  lat:       number,
  lon:       number,
  radiusKm:  number = 5,
  limit:     number = 50
): Promise<NearbyUser[]> {
  try {
    const r = await nodeGet<Record<string, unknown>>(
      `/api/node/users/nearby?lat=${lat}&lon=${lon}&radius_km=${radiusKm}&limit=${limit}`,
      token
    );
    const list = (r.users ?? r.data ?? []) as Record<string, unknown>[];
    return list.map(u => ({
      user_id:      Number(u.user_id ?? u.id ?? 0),
      username:     toStr(u.username, ''),
      display_name: toStr(u.display_name ?? u.name ?? u.username, ''),
      avatar:       u.avatar ? String(u.avatar) : undefined,
      distance_km:  Number(u.distance_km ?? 0),
      last_seen:    u.last_seen ? String(u.last_seen) : undefined,
    }));
  } catch { return []; }
}

// ─── Batch 32: WorldStars ─────────────────────────────────────────────────────

export async function getStarsBalance(token: string): Promise<{ balance: number }> {
  try {
    const r = await nodeGet<Record<string, unknown>>('/api/node/stars/balance', token);
    return { balance: Number(r.balance ?? 0) };
  } catch { return { balance: 0 }; }
}

export async function getStarsTransactions(token: string, page = 0): Promise<{ transactions: import('./types').StarsTxItem[]; has_more: boolean }> {
  try {
    const r = await nodeGet<Record<string, unknown>>(`/api/node/stars/transactions?page=${page}`, token);
    const list = (r.transactions ?? r.data ?? []) as Record<string, unknown>[];
    return {
      transactions: list.map(tx => ({
        id:         Number(tx.id ?? 0),
        type:       (tx.type as 'received' | 'sent' | 'purchase') ?? 'received',
        amount:     Number(tx.amount ?? 0),
        from_id:    tx.from_id ? Number(tx.from_id) : undefined,
        to_id:      tx.to_id   ? Number(tx.to_id)   : undefined,
        from_name:  tx.from_name  ? String(tx.from_name)  : undefined,
        to_name:    tx.to_name    ? String(tx.to_name)    : undefined,
        comment:    tx.comment    ? String(tx.comment)    : undefined,
        created_at: Number(tx.created_at ?? 0),
      })),
      has_more: Boolean(r.has_more),
    };
  } catch { return { transactions: [], has_more: false }; }
}

export async function sendStars(token: string, toUserId: number, amount: number, comment?: string): Promise<{ success: boolean; new_balance: number; error?: string }> {
  try {
    const r = await nodePost<Record<string, unknown>>('/api/node/stars/send', token, {
      to_user_id: toUserId, amount, ...(comment ? { comment } : {}),
    });
    // Server answers 200-OK HTTP with api_status 4xx for e.g. 'not enough stars' —
    // treating every reply as success showed 'sent' while nothing was sent.
    if (r.api_status != null && Number(r.api_status) !== 200) {
      return { success: false, new_balance: 0, error: toStr(r.error_message, 'failed') };
    }
    return { success: true, new_balance: Number(r.new_balance ?? 0) };
  } catch (e) { return { success: false, new_balance: 0, error: e instanceof Error ? e.message : 'network' }; }
}

export interface StarPackItem {
  id: number; stars: number; price_uah: number; is_popular: boolean; label: string;
}

export async function getStarsPacks(token: string): Promise<StarPackItem[]> {
  try {
    const r = await nodeGet<Record<string, unknown>>('/api/node/stars/packs', token);
    return (r.packs as StarPackItem[]) ?? [];
  } catch { return []; }
}

export async function purchaseStars(token: string, packId: number, provider = 'wayforpay'): Promise<{ payment_url: string; order_id: string } | null> {
  try {
    const r = await nodePost<Record<string, unknown>>('/api/node/stars/purchase', token, { pack_id: packId, provider });
    const url = (r.payment_url as string) ?? '';
    return url ? { payment_url: url, order_id: (r.order_id as string) ?? '' } : null;
  } catch { return null; }
}

export interface CreatorEarningItem { id: number; amount: number; pack: string; buyer_name: string; buyer_avatar: string; created_at: string; }
export interface CreatorPackStat   { pack: string; earned: number; sales: number; }

export async function getCreatorEarnings(token: string): Promise<{
  total_earned: number; total_sales: number;
  recent_sales: CreatorEarningItem[]; by_pack: CreatorPackStat[];
}> {
  try {
    const r = await nodeGet<Record<string, unknown>>('/api/node/stars/creator-earnings', token);
    return {
      total_earned:  Number(r.total_earned ?? 0),
      total_sales:   Number(r.total_sales  ?? 0),
      recent_sales:  (r.recent_sales as CreatorEarningItem[]) ?? [],
      by_pack:       (r.by_pack      as CreatorPackStat[])    ?? [],
    };
  } catch { return { total_earned: 0, total_sales: 0, recent_sales: [], by_pack: [] }; }
}

// ─── Channel premium customization (Phase 1) ──────────────────────────────────

import type { ChannelCustomization } from './channelTheme';

export interface ChannelPremiumPresets {
  accent_color_id:   string[];
  banner_pattern_id: string[];
  avatar_frame:      string[];
  font_weight:       string[];
  font_family:       string[];
  bubble_style:      string[];
  logo_style:        string[];
  background_id:     string[];
  corner_radius:     { min: number; max: number };
}
export interface ChannelBackground {
  id: string; type: 'none' | 'css' | 'image'; url?: string; thumb?: string;
}

/** Channel premium status incl. whether customization is unlocked. */
export async function getChannelPremiumStatus(token: string, channelId: number): Promise<{ is_active: number; customization_unlocked: number; days_left: number; plan: string | null; trial_available: number }> {
  try {
    const r = await nodeGet<Record<string, unknown>>(`/api/node/channels/${channelId}/premium/status`, token);
    return {
      is_active:              Number(r.is_active ?? 0),
      customization_unlocked: Number(r.customization_unlocked ?? 0),
      days_left:              Number(r.days_left ?? 0),
      plan:                   (r.plan as string) ?? null,
      trial_available:        Number(r.trial_available ?? 0),
    };
  } catch { return { is_active: 0, customization_unlocked: 0, days_left: 0, plan: null, trial_available: 0 }; }
}

export async function getChannelCustomization(token: string, channelId: number): Promise<ChannelCustomization | null> {
  try {
    const r = await nodeGet<Record<string, unknown>>(`/api/node/channels/${channelId}/premium/customization`, token);
    return (r.customization as ChannelCustomization) ?? null;
  } catch { return null; }
}

export async function getChannelPremiumPresets(token: string): Promise<{ presets: ChannelPremiumPresets | null; backgrounds: ChannelBackground[] }> {
  try {
    const r = await nodeGet<Record<string, unknown>>('/api/node/channels/premium/presets', token);
    return { presets: (r.presets as ChannelPremiumPresets) ?? null, backgrounds: (r.backgrounds as ChannelBackground[]) ?? [] };
  } catch { return { presets: null, backgrounds: [] }; }
}

/** Save channel appearance (owner + premium). Returns updated customization or null with error. */
export async function saveChannelCustomization(token: string, channelId: number, data: ChannelCustomization): Promise<{ ok: boolean; customization: ChannelCustomization | null; error?: string }> {
  try {
    const r = await nodePut<Record<string, unknown>>(`/api/node/channels/${channelId}/premium/customization`, token, data as Record<string, unknown>);
    if (Number(r.api_status) !== 200) return { ok: false, customization: null, error: String(r.error_message ?? 'failed') };
    return { ok: true, customization: (r.customization as ChannelCustomization) ?? null };
  } catch (e) { return { ok: false, customization: null, error: 'network' }; }
}

/** Upload a custom channel background image; returns absolute url or null. */
export async function uploadChannelBackground(token: string, file: File): Promise<string | null> {
  try {
    const up = await uploadMedia(token, file);
    return up.image ?? up.image_src ?? null;
  } catch { return null; }
}

/** Activate PRO for yourself by spending WorldStars (default 50⭐/month). */
export async function redeemProWithStars(token: string, months = 1): Promise<{ success: boolean; new_balance: number; pro_time: number; stars_spent: number; error?: string; required?: number; balance?: number }> {
  try {
    const r = await nodePost<Record<string, unknown>>('/api/node/subscription/redeem-stars', token, { months });
    if (Number(r.api_status) !== 200) {
      return { success: false, new_balance: Number(r.balance ?? 0), pro_time: 0, stars_spent: 0,
        error: String(r.error_message ?? 'failed'), required: Number(r.required ?? 0), balance: Number(r.balance ?? 0) };
    }
    return { success: true, new_balance: Number(r.new_balance ?? 0), pro_time: Number(r.pro_time ?? 0), stars_spent: Number(r.stars_spent ?? 0) };
  } catch {
    return { success: false, new_balance: 0, pro_time: 0, stars_spent: 0, error: 'network' };
  }
}

// ─── Batch 32: Pro Subscription ───────────────────────────────────────────────

export async function getSubscriptionStatus(token: string): Promise<import('./types').SubscriptionStatus> {
  try {
    const r = await nodeGet<Record<string, unknown>>('/api/node/subscription/status', token);
    return {
      is_pro:     Boolean(r.is_pro),
      plan:       r.plan as import('./types').SubscriptionStatus['plan'],
      expires_at: r.expires_at ? Number(r.expires_at) : undefined,
      trial_used: Boolean(r.trial_used),
    };
  } catch { return { is_pro: false }; }
}

export async function getSubscriptionPlans(token: string): Promise<{ plan: 'month' | '3month' | 'year'; price_uah: number }[]> {
  const r = await nodeGet<Record<string, unknown>>('/api/node/subscription/plans', token);
  const list = (r.plans ?? []) as { plan: string; price_uah: number }[];
  return list.map(p => ({ plan: p.plan as 'month' | '3month' | 'year', price_uah: Number(p.price_uah) }));
}

export async function createSubscription(token: string, plan: 'month' | '3month' | 'year', provider: 'wayforpay' | 'liqpay' | 'monobank'): Promise<{ checkout_url: string }> {
  // Бекенд (routes/subscription.js) очікує { months, provider } і повертає payment_url.
  const months = plan === 'year' ? 12 : plan === '3month' ? 3 : 1;
  const r = await nodePost<Record<string, unknown>>('/api/node/subscription/create-payment', token, { months, provider });
  return { checkout_url: String(r.payment_url ?? r.checkout_url ?? '') };
}

export async function startTrial(token: string): Promise<{ success: boolean; expires_at: number }> {
  try {
    const r = await nodePost<Record<string, unknown>>('/api/node/subscription/start-trial', token, {});
    // Бекенд повертає { api_status, already_used, trial_days, pro_time }
    const ok = Number(r.api_status) === 200 && r.already_used !== true;
    return { success: ok, expires_at: Number(r.pro_time ?? r.expires_at ?? 0) };
  } catch { return { success: false, expires_at: 0 }; }
}

// ─── Refunds ──────────────────────────────────────────────────────────────────
// All eligibility/amount decisions are made server-side (helpers/refund-policy.js).
// The client only displays the server's preview and submits requests.

export interface RefundDecision {
  eligible:     boolean;
  refundType:   'full' | 'prorated' | 'denied';
  refundAmount: number;
  adminFee:     number;
  usagePercent: number;
  currency:     'UAH' | 'STARS';
  decisionCode: string;
  message:      string;
}

export interface RefundPolicyDoc {
  premium?:      { monthly: string[]; annual: string[] };
  worldstars?:   string[];
  stickerpacks?: string[];
  ads?:          string[];
}

export interface RefundEligibleItem {
  service_type: 'premium' | 'worldstars' | 'stickerpack' | 'ads';
  ref_id:       string;
  title:        string;
  amount:       number;
  currency:     'UAH' | 'STARS';
  purchased_at: number;
  preview:      RefundDecision;
}

export interface RefundHistoryItem {
  id:              number;
  service_type:    string;
  ref_id:          string;
  reason_code:     string;
  refund_type:     string;
  original_amount: number;
  refund_amount:   number;
  admin_fee:       number;
  currency:        string;
  usage_percent:   number;
  status:          string;
  decision_code:   string;
  created_at:      number;
  processed_at:    number;
}

export async function getRefundPolicy(token: string): Promise<RefundPolicyDoc> {
  try {
    const r = await nodeGet<Record<string, unknown>>('/api/node/refunds/policy', token);
    return (r.policy ?? {}) as RefundPolicyDoc;
  } catch { return {}; }
}

export async function getRefundEligible(token: string): Promise<RefundEligibleItem[]> {
  try {
    const r = await nodeGet<Record<string, unknown>>('/api/node/refunds/eligible', token);
    const list = (r.items ?? []) as RefundEligibleItem[];
    return Array.isArray(list) ? list : [];
  } catch { return []; }
}

export async function getRefundHistory(token: string, page = 0): Promise<RefundHistoryItem[]> {
  try {
    const r = await nodeGet<Record<string, unknown>>(`/api/node/refunds/list?page=${page}`, token);
    const list = (r.refunds ?? []) as RefundHistoryItem[];
    return Array.isArray(list) ? list : [];
  } catch { return []; }
}

export async function requestRefund(
  token: string,
  serviceType: string,
  refId: string,
  reasonCode = 'standard',
  reasonText?: string,
): Promise<{ success: boolean; status?: string; message?: string; error?: string }> {
  try {
    const r = await nodePost<Record<string, unknown>>('/api/node/refunds/request', token, {
      service_type: serviceType,
      ref_id:       refId,
      reason_code:  reasonCode,
      ...(reasonText ? { reason_text: reasonText } : {}),
    });
    if (Number(r.api_status) !== 200) {
      return { success: false, error: String(r.error_message ?? 'failed') };
    }
    return { success: true, status: String(r.status ?? ''), message: String(r.message ?? '') };
  } catch {
    return { success: false, error: 'network' };
  }
}

// ─── Support tickets (Block 3) ─────────────────────────────────────────────

export interface TicketListItem {
  id:         number;
  subject:    string;
  category:   string;
  status:     string;
  priority:   string;
  created_at: number;
  updated_at: number;
}

export interface TicketMessageItem {
  id:          number;
  sender_type: 'user' | 'admin';
  sender_id:   number;
  message:     string;
  created_at:  number;
}

export async function getMyTickets(token: string): Promise<TicketListItem[]> {
  try {
    const r = await nodeGet<Record<string, unknown>>('/api/node/tickets', token);
    const list = (r.tickets ?? []) as TicketListItem[];
    return Array.isArray(list) ? list : [];
  } catch { return []; }
}

export async function getTicketDetail(
  token: string,
  id: number,
): Promise<{ ticket: TicketListItem | null; messages: TicketMessageItem[] }> {
  try {
    const r = await nodeGet<Record<string, unknown>>(`/api/node/tickets/${id}`, token);
    if (Number(r.api_status) !== 200) return { ticket: null, messages: [] };
    return {
      ticket:   (r.ticket ?? null) as TicketListItem | null,
      messages: Array.isArray(r.messages) ? (r.messages as TicketMessageItem[]) : [],
    };
  } catch { return { ticket: null, messages: [] }; }
}

export async function createTicket(
  token: string,
  subject: string,
  message: string,
  category: string,
): Promise<{ success: boolean; id?: number; error?: string }> {
  try {
    const r = await nodePost<Record<string, unknown>>('/api/node/tickets', token, { subject, message, category });
    if (Number(r.api_status) !== 200) return { success: false, error: String(r.error_message ?? 'failed') };
    const ticket = r.ticket as { id?: number } | undefined;
    return { success: true, id: ticket?.id };
  } catch { return { success: false, error: 'network' }; }
}

export async function replyTicket(
  token: string,
  id: number,
  message: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const r = await nodePost<Record<string, unknown>>(`/api/node/tickets/${id}/reply`, token, { message });
    if (Number(r.api_status) !== 200) return { success: false, error: String(r.error_message ?? 'failed') };
    return { success: true };
  } catch { return { success: false, error: 'network' }; }
}

// ─── Batch 34: Business Directory ─────────────────────────────────────────────

export interface BusinessListing {
  id: number;
  name: string;
  description?: string;
  category: string;
  avatar_url?: string;
  rating?: number;        // average, 1 decimal place
  rating_count?: number;
  my_rating?: number;     // the current user's own rating for this business, if any
  user_id: number;
  is_verified?: boolean;
  website?: string;
  phone?: string;
  email?: string;
  address?: string;
}

export interface BusinessHourRow { weekday: number; is_open: boolean; open_time: string; close_time: string }

export interface BusinessDetail extends BusinessListing {
  hours?: BusinessHourRow[];
  my_review?: string;
}

function mapBusinessRow(row: any): BusinessListing {
  return {
    id:            row.user_id,
    user_id:       row.user_id,
    name:          row.business_name || '',
    description:   row.description ?? undefined,
    category:      row.category || '',
    avatar_url:    row.avatar ? absMediaUrl(row.avatar) : undefined,
    rating:        row.rating_avg != null ? parseFloat(row.rating_avg) : undefined,
    rating_count:  row.rating_count != null ? parseInt(row.rating_count) : 0,
    my_rating:     row.my_rating != null ? parseInt(row.my_rating) : undefined,
    is_verified:   !!row.is_verified,
    website:       row.website ?? undefined,
    phone:         row.phone ?? undefined,
    email:         row.email ?? undefined,
    address:       row.address ?? undefined,
  };
}

// nodejs/routes/business-directory.js only ever registered GET
// /api/node/business-directory (no "/directory" suffix), returning
// { user_id, business_name, avatar, is_verified, ... } — this used to POST
// to a path/method that was never registered (/api/node/business/directory),
// so every search silently 404'd into an empty list via the catch below,
// and even a corrected call would have handed back field names
// (business_name, avatar, is_verified) the UI never reads (it reads name,
// avatar_url, rating, verified). Mapped to the shape BusinessDirectory.tsx
// actually expects instead of changing every read site.
export async function loadBusinessDirectory(token: string, query?: string, category?: string): Promise<BusinessListing[]> {
  try {
    const params = new URLSearchParams();
    if (query) params.set('search', query);
    if (category) params.set('category', category);
    params.set('limit', '60');
    const qs = params.toString();
    const r = await nodeGet<Record<string, unknown>>(`/api/node/business-directory${qs ? '?' + qs : ''}`, token);
    const rows = (r.businesses ?? []) as any[];
    return rows.map(mapBusinessRow);
  } catch { return []; }
}

/** Full detail for one business — used by the catalog's detail modal (includes hours, unlike the list). */
export async function loadBusinessDetail(token: string, userId: number): Promise<BusinessDetail | null> {
  try {
    const r = await nodeGet<Record<string, unknown>>(`/api/node/business-directory/${userId}`, token);
    if (r.api_status !== 200) return null;
    return {
      ...mapBusinessRow(r),
      hours: (r.hours as BusinessHourRow[] | undefined) ?? undefined,
      my_review: (r.my_review as string | null | undefined) ?? undefined,
    };
  } catch { return null; }
}

export interface BusinessReview {
  user_id: number;
  name: string;
  avatar?: string;
  rating: number;
  review: string;
  updated_at: number;
}

/** Written reviews for a business (star-only ratings are excluded — they're already folded into the average). */
export async function loadBusinessReviews(token: string, userId: number): Promise<BusinessReview[]> {
  try {
    const r = await nodeGet<Record<string, unknown>>(`/api/node/business-directory/${userId}/reviews`, token);
    if (r.api_status !== 200) return [];
    const rows = (r.reviews as Record<string, unknown>[] | undefined) ?? [];
    return rows.map(row => ({
      user_id:    row.user_id as number,
      name:       row.name as string,
      avatar:     row.avatar ? absMediaUrl(row.avatar as string) : undefined,
      rating:     row.rating as number,
      review:     row.review as string,
      updated_at: row.updated_at as number,
    }));
  } catch { return []; }
}

/** Submit/update your 1-5 rating for a business. Returns the new aggregate. */
// review is intentionally NOT `review || undefined` — an explicit empty
// string means "clear my review" and must reach the backend as such (it
// distinguishes "field omitted" from "field sent empty" to decide whether
// to touch the stored review at all — see the reviewProvided comment in
// routes/business-directory.js). Passing undefined here (never call this
// with an empty review you don't mean to set) leaves the existing text alone.
export async function rateBusinessDirectory(token: string, userId: number, rating: number, review?: string): Promise<{ ok: true; rating: number; count: number; mine: number; myReview?: string } | { ok: false; error?: string }> {
  try {
    const body: Record<string, unknown> = { rating };
    if (review !== undefined) body.review = review;
    const r = await nodePost<Record<string, unknown>>(`/api/node/business-directory/${userId}/rate`, token, body);
    if (r.api_status !== 200) return { ok: false, error: r.error_message as string | undefined };
    return {
      ok: true,
      rating: parseFloat(r.rating_avg as string) || 0,
      count: parseInt(r.rating_count as string) || 0,
      mine: parseInt(r.my_rating as string) || 0,
      myReview: (r.my_review as string | null | undefined) ?? undefined,
    };
  } catch (e) { return { ok: false, error: e instanceof Error ? e.message : String(e) }; }
}

/** Remove your own rating for a business. Returns the new aggregate. */
export async function unrateBusinessDirectory(token: string, userId: number): Promise<{ rating: number; count: number } | null> {
  try {
    const text = await doRequest(`${NODE_BASE_URL}/api/node/business-directory/${userId}/rate`, { method: 'DELETE', headers: { 'access-token': token } });
    const r = await parseJson<Record<string, unknown>>(text);
    if (r.api_status !== 200) return null;
    return { rating: parseFloat(r.rating_avg as string) || 0, count: parseInt(r.rating_count as string) || 0 };
  } catch { return null; }
}

// ─── Batch 34: Mutual Contacts ────────────────────────────────────────────────

export async function loadMutualContacts(token: string, userId: number): Promise<{ id: number; name: string; avatar?: string }[]> {
  try {
    const r = await nodeGet<Record<string, unknown>>(`/api/node/users/${userId}/mutual`, token);
    return ((r.users ?? []) as { id: number; name: string; avatar?: string }[]);
  } catch { return []; }
}

// ─── Server Folders ───────────────────────────────────────────────────────────

export interface ServerFolder {
  id: string;
  name: string;
  emoji: string;
  color: string;
  position?: number;
  is_shared?: boolean;
  share_code?: string;
  member_count?: number;
  created_at?: number;
  chats?: { chat_type: string; chat_id: number }[];
}

export async function loadServerFolders(token: string): Promise<ServerFolder[]> {
  try {
    const r = await nodeGet<Record<string, unknown>>('/api/node/folders', token);
    return Array.isArray(r.folders) ? r.folders as ServerFolder[] : [];
  } catch { return []; }
}

export async function saveServerFolder(
  token: string,
  draft: Partial<ServerFolder> & { name: string; emoji: string },
): Promise<ServerFolder | null> {
  try {
    const apiPath = draft.id
      ? `/api/node/folders/update/${draft.id}`
      : '/api/node/folders/create';
    const text = await doRequest(`${NODE_BASE_URL}${apiPath}`, {
      method: 'POST',
      headers: { 'access-token': token, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: buildForm({ name: draft.name, emoji: draft.emoji, color: draft.color ?? '#4d9de0' }),
    });
    const d = await parseJson<Record<string, unknown>>(text);
    if (d.api_status && d.api_status !== 200) return null;
    if (d.folder) return d.folder as ServerFolder;
    if (!d.folder && !d.id) return null;
    return { ...draft, id: String(d.id ?? draft.id ?? ''), share_code: String(d.share_code ?? '') } as ServerFolder;
  } catch (e) {
    console.error('[folders] saveServerFolder error:', e);
    return null;
  }
}

export async function syncFolderChats(
  token: string,
  folderId: string,
  chatIds: number[],
  groupIds: number[],
  channelIds: number[],
): Promise<boolean> {
  try {
    await doRequest(`${NODE_BASE_URL}/api/node/folders/${folderId}/sync-chats`, {
      method: 'POST',
      headers: { 'access-token': token, 'Content-Type': 'application/json' },
      body: JSON.stringify({ dm: chatIds, group: groupIds, channel: channelIds }),
    });
    return true;
  } catch (e) {
    console.error('[folders] syncFolderChats error:', e);
    return false;
  }
}

export async function deleteServerFolder(token: string, id: string): Promise<boolean> {
  try {
    await doRequest(`${NODE_BASE_URL}/api/node/folders/${id}`, {
      method: 'DELETE',
      headers: { 'access-token': token },
    });
    return true;
  } catch { return false; }
}

export async function addChannelToFolder(token: string, folderId: string, channelId: number): Promise<boolean> {
  try {
    await doRequest(`${NODE_BASE_URL}/api/node/folders/${folderId}/channels/add`, {
      method: 'POST',
      headers: { 'access-token': token, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: buildForm({ channel_id: String(channelId) }),
    });
    return true;
  } catch { return false; }
}

export async function reportChannel(token: string, channelId: number, reason: string): Promise<boolean> {
  try {
    await nodePost('/api/node/channel/report', token, { channel_id: channelId, reason });
    return true;
  } catch { return false; }
}

// ── Унифицированная жалоба на любую поверхность ─────────────────────────────
// Бэкенд сам разложит по таблице-направлению (см. docs/REPORTS_SYSTEM.md).
export type ReportTargetType =
  | 'user' | 'message' | 'channel' | 'channel_post' | 'channel_comment'
  | 'group' | 'group_message' | 'story';

export interface ReportPayload {
  target_type: ReportTargetType;
  target_id?: number;
  scope_id?: number;           // id канала/группы-контейнера
  reported_user_id?: number;   // нарушитель (отправитель/владелец)
  reason_code: string;         // код из канона
  reason_text?: string;        // свободный комментарий
  reported_text?: string;      // расшифрованная копия (для message/group_message)
}

export async function submitReport(token: string, payload: ReportPayload): Promise<boolean> {
  try {
    const raw: Record<string, unknown> = { ...payload, platform: 'windows' };
    const clean: Record<string, unknown> = {};
    for (const k of Object.keys(raw)) {
      const v = raw[k];
      if (v !== undefined && v !== null && v !== '') clean[k] = v;
    }
    const r = await nodePost<{ api_status?: number | string }>('/api/node/report', token, clean);
    return r?.api_status === 200 || r?.api_status === '200';
  } catch { return false; }
}

export async function pinChannelPost(token: string, channelId: number, postId: number, pin: boolean): Promise<void> {
  await nodePost('/api/node/channel/pin-post', token, { channel_id: channelId, post_id: postId, pin: pin ? 1 : 0 });
}

// ── Business Account API ─────────────────────────────────────────────────────
// Every call here was hitting the wrong HTTP method, the wrong path, or
// reading the wrong response field (see nodejs/routes/business.js for the
// actual contract) — 404s and shape mismatches were silently swallowed by
// the try/catch below, so profile save, verification requests, and API-key
// fetch/regenerate all quietly did nothing while the UI reported success.
export async function getBizProfile(token: string): Promise<Record<string, unknown> | null> {
  try { return (await nodeGet<any>('/api/node/business/profile', token))?.profile ?? null; }
  catch { return null; }
}
export async function saveBizProfile(token: string, data: Record<string, unknown>): Promise<Record<string, unknown> | null> {
  try { return (await nodePut<any>('/api/node/business/profile', token, data))?.profile ?? null; }
  catch { return null; }
}
/** Upload a verification document (photo ID / registration cert). Must be called before requestBizVerification. */
export async function uploadBizVerificationDoc(token: string, file: File): Promise<{ ok: boolean; error?: string }> {
  try {
    const text = await doUpload(`${NODE_BASE_URL}/api/node/business/verification/document`, token, {}, file);
    const r = await parseJson<any>(text);
    return r?.api_status === 200 ? { ok: true } : { ok: false, error: r?.error_message };
  } catch (e) { return { ok: false, error: e instanceof Error ? e.message : String(e) }; }
}
export async function requestBizVerification(token: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const r = await nodePost<any>('/api/node/business/request-verification', token, {});
    return r?.api_status === 200 ? { ok: true } : { ok: false, error: r?.error_message };
  } catch (e) { return { ok: false, error: e instanceof Error ? e.message : String(e) }; }
}
export async function getBizApiToken(token: string): Promise<string | null> {
  try { return (await nodeGet<any>('/api/node/business/api-key', token))?.api_key?.api_key ?? null; }
  catch { return null; }
}
export async function regenBizApiToken(token: string): Promise<string | null> {
  try { return (await nodePost<any>('/api/node/business/api-key', token, {}))?.api_key?.api_key ?? null; }
  catch { return null; }
}

// ── Business hours (per-weekday; 0=Sun … 6=Sat) ─────────────────────────────
export type BizHourRow = { weekday: number; is_open: boolean; open_time: string; close_time: string };
export async function getBizHours(token: string): Promise<BizHourRow[]> {
  try {
    const rows = (await nodeGet<any>('/api/node/business/hours', token))?.hours ?? [];
    return rows.map((r: any) => ({ weekday: r.weekday, is_open: !!r.is_open, open_time: r.open_time, close_time: r.close_time }));
  } catch { return []; }
}
export async function saveBizHoursApi(token: string, hours: BizHourRow[]): Promise<boolean> {
  // nodePut() form-urlencodes its body — arrays of plain values survive as
  // key[]=a&key[]=b, but an array of OBJECTS (this payload) would each
  // serialize to the literal string "[object Object]" and the backend would
  // silently skip every row. Needs a real JSON body, hence nodeApiRequest.
  try {
    const r = await nodeApiRequest<any>('/api/node/business/hours', token, 'PUT', {
      hours: hours.map(h => ({ ...h, is_open: h.is_open ? 1 : 0 })),
    });
    return r?.api_status === 200;
  } catch { return false; }
}

// ── Data & Storage settings (Android CloudBackupSettings — shared server-side
// source of truth, so a proxy/auto-download rule configured on one platform
// applies on the other too) ──────────────────────────────────────────────────
export type StorageSettings = {
  mobile_photos: boolean; mobile_videos: boolean; mobile_files: boolean;
  mobile_videos_limit: number; mobile_files_limit: number;
  wifi_photos: boolean; wifi_videos: boolean; wifi_files: boolean;
  wifi_videos_limit: number; wifi_files_limit: number;
  roaming_photos: boolean;
  save_to_gallery_private_chats: boolean; save_to_gallery_groups: boolean; save_to_gallery_channels: boolean;
  streaming_enabled: boolean;
  cache_size_limit: number;
  call_data_saver: boolean;
  proxy_enabled: boolean; proxy_type: string; proxy_host: string | null; proxy_port: number | null;
};

export async function getStorageSettings(token: string): Promise<StorageSettings | null> {
  try {
    const r = await nodeGet<any>('/api/node/backup/settings', token);
    return r?.api_status === 200 ? (r.settings as StorageSettings) : null;
  } catch { return null; }
}

export async function updateStorageSettings(token: string, patch: Partial<StorageSettings>): Promise<StorageSettings | null> {
  try {
    const body: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(patch)) {
      body[k] = typeof v === 'boolean' ? (v ? 'true' : 'false') : v;
    }
    const r = await nodePost<any>('/api/node/backup/settings', token, body);
    return r?.api_status === 200 ? (r.settings as StorageSettings) : null;
  } catch { return null; }
}

// ── Cloud Backup (server-hosted message/media backup) ──────────────────────
// Mirrors Android's CloudBackupManager.kt / CloudBackupSettingsScreen.kt.
// The server has ALWAYS stored a full JSON export on disk (routes/backup.js,
// BACKUP_DIR) — but until 2026-08-20 there was no route to fetch a listed
// backup's contents back, and /list answered with the wrong field names
// entirely (file_name instead of filename, no url, seconds instead of ms).
// That meant restoring anything beyond a backup still cached from the same
// app session silently failed on every client. Both sides fixed together —
// this Windows integration is the first client to use the corrected
// contract, and Android's existing code already matches it field-for-field.
export type CloudBackupInfo = {
  filename:   string;
  url:        string;
  size:       number;
  size_mb:    number;
  created_at: number; // ms
  provider:   string;
};

/** Creates a new server-side backup (messages + groups) and returns its info + the raw export JSON. */
export async function createCloudBackup(token: string): Promise<{ info: CloudBackupInfo; exportDataJson: string } | null> {
  try {
    const resp = await nodeGet<any>('/api/node/backup/export', token);
    if (resp?.api_status !== 200) return null;
    return {
      info: {
        filename:   resp.backup_file,
        url:        resp.backup_url,
        size:       resp.backup_size,
        size_mb:    resp.backup_size / 1024 / 1024,
        created_at: Date.now(),
        provider:   'local_server',
      },
      exportDataJson: JSON.stringify(resp.export_data),
    };
  } catch { return null; }
}

export async function listCloudBackups(token: string): Promise<CloudBackupInfo[]> {
  try {
    const resp = await nodeGet<any>('/api/node/backup/list', token);
    return (resp?.backups ?? []) as CloudBackupInfo[];
  } catch { return []; }
}

/** Downloads a previously-created backup's raw JSON content by its (relative) url. */
export async function downloadCloudBackup(token: string, url: string): Promise<string> {
  return doRequest(`${NODE_BASE_URL}${url}`, { method: 'GET', headers: { 'access-token': token } });
}

export async function importCloudBackup(token: string, backupJson: string): Promise<{ messages: number } | null> {
  try {
    const resp = await nodePost<any>('/api/node/backup/import', token, { backup_data: backupJson });
    if (resp?.api_status !== 200) return null;
    return { messages: resp.imported?.messages ?? 0 };
  } catch { return null; }
}

/** Deletes one server-side backup file by its filename (from CloudBackupInfo.filename). */
export async function deleteCloudBackup(token: string, filename: string): Promise<boolean> {
  try {
    const text = await doRequest(`${NODE_BASE_URL}/api/node/backup/${encodeURIComponent(filename)}`, {
      method: 'DELETE',
      headers: { 'access-token': token },
    });
    const r = await parseJson<Record<string, unknown>>(text);
    return r?.api_status === 200;
  } catch { return false; }
}

// ── E2EE key backup (server-hosted) ─────────────────────────────────────────
// The counterpart to the local .wmbak file (KeyBackupModal.tsx): same key
// material, same crypto construction (see keyBackupShared.ts), but stored
// encrypted on the server so it can be pulled down again after a restore on
// a fresh install — a local file can't help with that if it was never saved
// anywhere durable. Endpoints are shared with Android (routes/signal.js).
export async function uploadServerKeyBackup(
  token: string,
  blob: { salt: string; iv: string; ciphertext: string },
): Promise<boolean> {
  try {
    const resp = await nodePost<any>('/api/node/signal/key-backup', token, {
      encrypted_payload: blob.ciphertext,
      salt:              blob.salt,
      iv:                blob.iv,
    });
    return resp?.api_status === 200;
  } catch { return false; }
}

export async function downloadServerKeyBackup(token: string): Promise<{ salt: string; iv: string; ciphertext: string } | null> {
  try {
    const resp = await nodeGet<any>('/api/node/signal/key-backup', token);
    const b = resp?.backup;
    if (!b || !b.encrypted_payload) return null;
    return { salt: b.salt, iv: b.iv, ciphertext: b.encrypted_payload };
  } catch { return null; }
}

// ── Business quick replies ──────────────────────────────────────────────────
export type BizQuickReply = { id: number; shortcut: string; text: string; media_url?: string | null };
export async function getBizQuickReplies(token: string): Promise<BizQuickReply[]> {
  try { return (await nodeGet<any>('/api/node/business/quick-replies', token))?.quick_replies ?? []; }
  catch { return []; }
}
export async function addBizQuickReplyApi(token: string, shortcut: string, text: string): Promise<BizQuickReply | null> {
  try { return (await nodePost<any>('/api/node/business/quick-replies', token, { shortcut, text }))?.quick_reply ?? null; }
  catch { return null; }
}
export async function deleteBizQuickReplyApi(token: string, id: number): Promise<boolean> {
  try {
    const text = await doRequest(`${NODE_BASE_URL}/api/node/business/quick-replies/${id}`, { method: 'DELETE', headers: { 'access-token': token } });
    return (await parseJson<any>(text))?.api_status === 200;
  } catch { return false; }
}

// ── Business links (click-to-chat links, e.g. worldmates.club/biz/<slug>) ──
export type BizLink = { id: number; title: string; prefilled_text?: string | null; slug: string; url: string; views: number };
export async function getBizLinks(token: string): Promise<BizLink[]> {
  try { return (await nodeGet<any>('/api/node/business/links', token))?.links ?? []; }
  catch { return []; }
}
export async function addBizLinkApi(token: string, title: string, prefilledText?: string): Promise<BizLink | null> {
  try { return (await nodePost<any>('/api/node/business/links', token, { title, prefilled_text: prefilledText || undefined }))?.link ?? null; }
  catch { return null; }
}
export async function deleteBizLinkApi(token: string, id: number): Promise<boolean> {
  try {
    const text = await doRequest(`${NODE_BASE_URL}/api/node/business/links/${id}`, { method: 'DELETE', headers: { 'access-token': token } });
    return (await parseJson<any>(text))?.api_status === 200;
  } catch { return false; }
}

// ── Group Events API ─────────────────────────────────────────────────────────
export async function createGroupEvent(token: string, data: { group_id: number; title: string; description?: string; location?: string; starts_at: number }): Promise<Record<string, unknown> | null> {
  try { return (await nodePost<any>('/api/node/groups/events/create', token, data as any))?.event ?? null; }
  catch { return null; }
}
export async function rsvpGroupEvent(token: string, eventId: number, rsvp: string): Promise<Record<string, unknown> | null> {
  try { return await nodePost<any>('/api/node/groups/events/rsvp', token, { event_id: eventId, rsvp }); }
  catch { return null; }
}

// ── Post Analytics API ───────────────────────────────────────────────────────
export async function getPostStats(token: string, postId: number): Promise<{ views: number; reactions: number; comments: number; shares: number; clicks: number } | null> {
  try {
    const d = await nodeGet<any>(`/api/node/channel/post/${postId}/stats`, token);
    const s = (d?.stats ?? d) as Record<string, unknown>;
    return {
      views:     Number(s.views     ?? s.views_count     ?? 0),
      reactions: Number(s.reactions ?? s.reactions_count ?? 0),
      comments:  Number(s.comments  ?? s.comments_count  ?? 0),
      shares:    Number(s.shares    ?? s.shares_count    ?? 0),
      clicks:    Number(s.clicks    ?? s.link_clicks     ?? 0),
    };
  } catch { return null; }
}

// ── Group Message Seen API ───────────────────────────────────────────────────
export async function getGroupMessageSeenBy(token: string, groupId: number, msgId: number): Promise<{ user_id: number; name: string; avatar?: string; seen_at?: string }[]> {
  try {
    const d = await nodeGet<any>(`/api/node/groups/${groupId}/messages/${msgId}/seen`, token);
    return d?.users ?? d?.seen_by ?? d ?? [];
  } catch { return []; }
}

// ── Channel Reply Inbox ──────────────────────────────────────────────────────

export async function loadReplyInbox(
  token: string, limit = 30, offset = 0
): Promise<{ replies: import('./types').ChannelReply[]; total: number }> {
  const r = await nodeGet<{ api_status: number; replies?: import('./types').ChannelReply[]; total?: number }>(
    `/api/node/channel/reply-inbox?limit=${limit}&offset=${offset}`, token
  );
  return { replies: r.replies ?? [], total: r.total ?? 0 };
}

export async function sendThreadReply(
  token: string, postId: number, replyToId: number, text: string
): Promise<void> {
  await nodePost(`/api/node/channel/post/${postId}/thread/reply`, token, { reply_to_id: replyToId, text });
}

/** Full 1:1 exchange with one commenter on one post — powers the Replies
 *  panel's conversation view. Walks the reply chain server-side so it finds
 *  the whole thing even if it's buried past the post's general (paginated)
 *  comment list. */
export async function loadChannelConversation(
  token: string, postId: number, otherUserId: number, rootId: number
): Promise<import('./types').ChannelComment[]> {
  const r = await nodeGet<{ api_status: number; messages?: import('./types').ChannelComment[] }>(
    `/api/node/channel/post/${postId}/conversation?with=${otherUserId}&root=${rootId}`, token
  );
  return r.messages ?? [];
}

// ── Channel Poll Creation ────────────────────────────────────────────────────
export interface CreateChannelPollOptions {
  anonymous?: boolean;
  multiple?: boolean;
}

// routes/channels/polls.js reads is_anonymous / allows_multiple_answers.
// This used to send anonymous / multiple_choice,
// so both checkboxes were silently ignored (every poll anonymous, single-answer).
// allows_multiple_answers is only sent when true: the server tests truthiness,
// and a form-encoded '0' is a non-empty (truthy) string.
export async function createChannelPoll(
  token: string, channelId: number, question: string, options: string[],
  opts?: CreateChannelPollOptions,
): Promise<{ ok: boolean; error?: string }> {
  const body: Record<string, unknown> = {
    channel_id: channelId, question, options: JSON.stringify(options),
    is_anonymous: opts?.anonymous === false ? '0' : '1',
  };
  if (opts?.multiple) body.allows_multiple_answers = '1';
  try {
    const r = await nodePost<Record<string, unknown>>('/api/node/channel/poll/create', token, body);
    if (r.api_status != null && Number(r.api_status) !== 200) return { ok: false, error: toStr(r.error_message, 'failed') };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'network' };
  }
}

// ── Voice Reaction Upload ────────────────────────────────────────────────────
export async function sendVoiceReaction(token: string, msgId: number, blob: Blob): Promise<void> {
  // На iOS запись идёт в m4a (expo-audio); имя файла берётся из UploadFile.
  await doUpload(`${NODE_BASE_URL}/api/node/messages/${msgId}/voice-reaction`, token, {}, blob, 'audio');
}

// ── Channel Premium ───────────────────────────────────────────────────────────

export interface ChannelPremiumStatus {
  api_status: number;
  is_active: 0 | 1;
  plan: string | null;
  expires_at: string | null;
  days_left: number;
  started_at: string | null;
  base_price_uah: number;
  trial_available: 0 | 1;
  trial_days: number;
  plans: {
    monthly?: { months: number; price_uah: number };
    quarterly?: { months: number; price_uah: number };
    annual?: { months: number; price_uah: number };
  };
}

export interface ChannelPaymentResult {
  api_status: number;
  provider: string;
  invoice_url?: string;
  checkout_url?: string;
  order_id: string;
  amount_uah: number;
  error_message?: string;
}

export async function getChannelPremiumInfo(token: string, channelId: number): Promise<ChannelPremiumStatus> {
  return nodeGet<ChannelPremiumStatus>(`/api/node/channels/${channelId}/premium/status`, token);
}

export async function startChannelTrial(token: string, channelId: number): Promise<{ api_status: number; expires_at: string; trial_days: number; error_message?: string }> {
  return nodePost(`/api/node/channels/${channelId}/premium/start-trial`, token, {});
}

export async function createChannelPayment(token: string, channelId: number, plan: string, provider: string): Promise<ChannelPaymentResult> {
  return nodePost<ChannelPaymentResult>(`/api/node/channels/${channelId}/premium/create-payment`, token, { plan, provider });
}

// ── Channel Member Subscription (paid closed-channel access — distinct from
// Channel Premium above, which is the channel's own upgrade paid by the
// owner; this is a MEMBER paying the owner for access) ────────────────────

export interface MemberSubPlanInfo {
  months: number;
  price_stars: number | null;
  price_uah: number | null;
}

export interface MySubscriptionInfo {
  is_active: boolean;
  plan: string | null;
  payment_method: string | null;
  auto_renew: boolean;
  started_at: string | null;
  expires_at: string | null;
}

export interface MemberSubStatus {
  api_status: number;
  enabled: boolean;
  base_price_stars: number | null;
  base_price_uah: number | null;
  plans: {
    monthly?: MemberSubPlanInfo;
    quarterly?: MemberSubPlanInfo;
    annual?: MemberSubPlanInfo;
  };
  my_subscription: MySubscriptionInfo | null;
  has_access: boolean;
  error_message?: string;
}

export interface MemberSubActionResult {
  api_status: number;
  // Stars path — activation is immediate.
  new_balance?: number;
  stars_paid?: number;
  expires_at?: string;
  // Pricing-save response.
  enabled?: boolean;
  base_price_stars?: number | null;
  base_price_uah?: number | null;
  // Direct-money path — a checkout session was created; activation happens
  // later via webhook (see routes/channels/member-subscription.js). Exactly
  // one of invoice_url / checkout_url is populated depending on provider.
  provider?: string;
  invoice_url?: string;
  checkout_url?: string;
  data?: string;
  signature?: string;
  order_id?: string;
  amount_uah?: number;
  error_message?: string;
}

export async function getChannelMemberSubStatus(token: string, channelId: number): Promise<MemberSubStatus> {
  return nodeGet<MemberSubStatus>(`/api/node/channels/${channelId}/member-subscription/status`, token);
}

export async function setChannelMemberSubPricing(
  token: string, channelId: number,
  enabled: boolean, basePriceStars: number | null, basePriceUah: number | null,
): Promise<MemberSubActionResult> {
  return nodePut<MemberSubActionResult>(`/api/node/channels/${channelId}/member-subscription/pricing`, token, {
    enabled, base_price_stars: basePriceStars, base_price_uah: basePriceUah,
  });
}

export async function subscribeChannelMember(
  token: string, channelId: number, plan: string, paymentMethod = 'stars',
): Promise<MemberSubActionResult> {
  return nodePost<MemberSubActionResult>(`/api/node/channels/${channelId}/member-subscription/subscribe`, token, {
    plan, payment_method: paymentMethod,
  });
}
