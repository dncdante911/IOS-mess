// ============================================================
// WorldMates Messenger — Auth API (Node.js)
//
// Full port of Android NodeAuthRepository.kt.
// All requests use application/x-www-form-urlencoded (Retrofit
// @FormUrlEncoded @Field on Android).
//
// Endpoints:
//   POST api/node/auth/login
//   POST api/node/auth/register
//   POST api/node/auth/send-code
//   POST api/node/auth/verify-code
//   POST api/node/auth/request-password-reset
//   POST api/node/auth/reset-password
//   POST api/node/auth/refresh
// ============================================================

import { nodeApi } from './apiClient';
import { storageService } from '../services/storageService';
import { getOrCreateDeviceFingerprint, getDeviceLabel } from '../services/deviceService';
import type {
  User,
  NodeSendCodeResponseData,
  NodePasswordResetRequestData,
  NodePasswordResetData,
  NodeTokenRefreshData,
} from './types';

// Actual flat response the server returns for auth endpoints
// (mirrors Android NodeLoginResponse and Windows normaliseAuth)
interface NodeAuthFlat {
  api_status?: number | string;
  access_token?: string;
  refresh_token?: string;
  expires_at?: number;
  expires_in?: number;
  user_id?: number | string;
  username?: string;
  avatar?: string;
  // Registration verification flow
  success_type?: string;
  verification_type?: string;
  contact_info?: string;
  // Проверка входа с нового устройства (services/login-verification.js)
  verification_required?: boolean | string;
  verification_id?: string;
  delivery_channel?: 'push' | 'email' | 'both';
  /** Маскированный адрес, куда продублирован код: "ni*****@gmail.com" */
  email_masked?: string;
  // Error fields
  error_message?: string;
  message?: string;
  error?: string;
  messages?: string;
}

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

/**
 * Готовит тело запроса: обычный объект без undefined-полей.
 *
 * Раньше возвращал URLSearchParams — и это ломало вход. В React Native это
 * урезанный полифилл с внутренним массивом `_searchParams`, а `transformRequest`
 * в apiClient обходит тело через Object.entries(). В результате на сервер
 * уезжало одно поле `_searchParams=...`, а `username` и `password` терялись.
 * Ветка «нет учётных данных» в routes/auth.js ничего не логирует, поэтому в
 * pm2 стояла тишина и казалось, будто запрос вообще не доходит.
 *
 * Само кодирование делает toFormEncoded() в apiClient — там же и корректный
 * percent-encoding, которого полифилл RN не выполняет.
 */
function form(fields: Record<string, string | number | undefined>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(fields)) {
    if (v !== undefined) out[k] = String(v);
  }
  return out;
}

const FORM_HEADERS = { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } };

/** Build minimal User from flat auth response fields */
function mapAuthUser(flat: NodeAuthFlat): User {
  const userId = String(flat.user_id ?? '');
  const username = flat.username ?? '';
  return {
    id: userId,
    username,
    name: username || userId,
    avatar: flat.avatar ?? '',
    isPro: false,
    verificationLevel: 0,
    isVerified: false,
    isOnline: true,
    followersCount: 0,
    followingCount: 0,
  };
}

/** Extract error message from flat auth response */
function authError(flat: NodeAuthFlat, fallback: string): string {
  return flat.error_message ?? flat.message ?? flat.error ?? flat.messages ?? fallback;
}

/**
 * Compute absolute expiry timestamp (ms) from server response.
 * Server may send `expires_at` (Unix s) or `expires_in` (seconds from now).
 * Falls back to 24 h.
 */
function computeExpiresAtMs(raw: { expires_at?: number; expires_in?: number }): number {
  if (raw.expires_at) return raw.expires_at * 1000;
  if (raw.expires_in) return Date.now() + raw.expires_in * 1000;
  return Date.now() + 86_400_000; // 24 h fallback
}

// ─────────────────────────────────────────────────────────────
// RESULT TYPES (what the store consumes)
// ─────────────────────────────────────────────────────────────

/**
 * Итог входа: либо сессия готова, либо сервер ждёт код с нового устройства.
 * Размеченное объединение, а не «сессия с опциональными полями» — чтобы забыть
 * обработать вторую ветку было нельзя.
 */
export type LoginResult =
  | {
      type: 'session';
      user: User;
      accessToken: string;
      refreshToken: string;
      expiresAtMs: number;
    }
  | {
      type: 'device_verification';
      verificationId: string;
      deliveryChannel: 'push' | 'email' | 'both';
      emailMasked: string;
    };

export type RegisterResult =
  | { type: 'success'; user: User; accessToken: string; refreshToken: string; expiresAtMs: number }
  | { type: 'verification'; userId: string; verificationType: string; contactInfo: string };

export interface VerifyResult {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresAtMs: number;
}

export interface TokenRefreshResult {
  accessToken: string;
  refreshToken: string;
  expiresAtMs: number;
}

// ─────────────────────────────────────────────────────────────
// AUTH FUNCTIONS
// ─────────────────────────────────────────────────────────────

/**
 * Login with username/email and password.
 * Matches Android: POST api/node/auth/login (FormUrlEncoded)
 * Server returns FLAT response: { api_status, access_token, user_id, username, avatar, ... }
 */
export async function login(usernameOrEmail: string, password: string): Promise<LoginResult> {
  // Отпечаток включает на сервере проверку нового устройства. Без него бэкенд
  // отвечает `{ trusted: true }` и пропускает вход вообще без кода — именно так
  // iOS до сих пор и работал.
  const deviceFingerprint = await getOrCreateDeviceFingerprint();

  const res = await nodeApi.post<NodeAuthFlat>(
    'api/node/auth/login',
    form({
      username: usernameOrEmail,
      password,
      device_type: 'phone',
      device_fingerprint: deviceFingerprint,
      device_label: getDeviceLabel(),
    }),
    FORM_HEADERS,
  );

  const body = res.data;
  const status = Number(body.api_status ?? 0);

  // Пароль верный, но устройство незнакомо: сессии ещё нет, сервер ждёт код.
  if (body.verification_required === true || body.verification_required === 'true') {
    if (!body.verification_id) throw new Error(authError(body, 'Login failed'));
    return {
      type: 'device_verification',
      verificationId: body.verification_id,
      // 'both' — код ушёл и на другое устройство, и на почту (обычный случай);
      // 'push' — только на устройство; 'email' — только на почту.
      deliveryChannel:
        body.delivery_channel === 'push' || body.delivery_channel === 'both'
          ? body.delivery_channel
          : 'email',
      emailMasked: body.email_masked ?? '',
    };
  }

  if (!body.access_token || (status !== 0 && status !== 200)) {
    throw new Error(authError(body, 'Login failed'));
  }

  return {
    type: 'session',
    user: mapAuthUser(body),
    accessToken: body.access_token,
    refreshToken: body.refresh_token ?? '',
    expiresAtMs: computeExpiresAtMs(body),
  };
}

/**
 * Завершение входа кодом с нового устройства.
 * POST api/node/auth/verify-login-code → тот же плоский ответ, что и login().
 */
export async function verifyLoginCode(
  verificationId: string,
  code: string,
): Promise<Extract<LoginResult, { type: 'session' }>> {
  const res = await nodeApi.post<NodeAuthFlat>(
    'api/node/auth/verify-login-code',
    { verification_id: verificationId, code, device_type: 'phone' },
  );

  const body = res.data;
  if (!body.access_token) throw new Error(authError(body, 'Verification failed'));

  return {
    type: 'session',
    user: mapAuthUser(body),
    accessToken: body.access_token,
    refreshToken: body.refresh_token ?? '',
    expiresAtMs: computeExpiresAtMs(body),
  };
}

/**
 * «Не пришёл код? Отправить на почту.»
 * Повторно шлёт ТОТ ЖЕ код — сервер не генерирует новый, чтобы уже доставленный
 * на другое устройство не перестал работать. Ограничения на стороне сервера:
 * 60 секунд между отправками и максимум 3 раза на одну проверку.
 */
export async function resendLoginVerificationEmail(
  verificationId: string,
): Promise<{ ok: boolean; emailMasked: string; message: string }> {
  const res = await nodeApi.post<NodeAuthFlat>(
    'api/node/auth/login-verification-resend',
    { verification_id: verificationId },
  );

  const body = res.data;
  const ok = Number(body.api_status ?? 0) === 200;
  return {
    ok,
    emailMasked: body.email_masked ?? '',
    message: body.message ?? body.error_message ?? '',
  };
}

/**
 * Register a new account.
 * Matches Android: POST api/node/auth/register (FormUrlEncoded)
 * Server returns same flat structure as login.
 */
export async function register(
  username: string,
  email: string,
  password: string,
  gender: string = '',
  inviteCode: string = '',
): Promise<RegisterResult> {
  const res = await nodeApi.post<NodeAuthFlat>(
    'api/node/auth/register',
    { username, email, password, confirm_password: password, gender, device_type: 'phone', invite_code: inviteCode },
  );

  const body = res.data;

  // Server may require verification before granting a session
  if (body.success_type === 'verification' || !body.access_token) {
    if (body.user_id || body.success_type === 'verification') {
      return {
        type: 'verification',
        userId: String(body.user_id ?? ''),
        verificationType: body.verification_type ?? 'email',
        contactInfo: body.contact_info ?? email,
      };
    }
    throw new Error(authError(body, 'Registration failed'));
  }

  return {
    type: 'success',
    user: mapAuthUser(body),
    accessToken: body.access_token,
    refreshToken: body.refresh_token ?? '',
    expiresAtMs: computeExpiresAtMs(body),
  };
}

/**
 * Send a verification code to the user's email or phone.
 * Matches Android: POST api/node/auth/send-code
 * Fields: verification_type, contact_info, username
 */
export async function sendVerificationCode(
  verificationType: string,
  contactInfo: string,
  username: string,
): Promise<void> {
  const res = await nodeApi.post<{ data?: NodeSendCodeResponseData; error?: string; message?: string }>(
    'api/node/auth/send-code',
    { verification_type: verificationType, contact_info: contactInfo, username },
  );

  const body = res.data;
  if (body.error) throw new Error(body.error);
}

/**
 * Verify the code sent to the user's email or phone.
 * Matches Android: POST api/node/auth/verify-code
 * Server returns same flat structure as login.
 */
export async function verifyCode(
  verificationType: string,
  contactInfo: string,
  code: string,
): Promise<VerifyResult> {
  const res = await nodeApi.post<NodeAuthFlat>(
    'api/node/auth/verify-code',
    { verification_type: verificationType, contact_info: contactInfo, code },
  );

  const body = res.data;

  if (!body.access_token) {
    throw new Error(authError(body, 'Verification failed'));
  }

  return {
    user: mapAuthUser(body),
    accessToken: body.access_token,
    refreshToken: body.refresh_token ?? '',
    expiresAtMs: computeExpiresAtMs(body),
  };
}

/**
 * Request a password-reset code by email.
 * Matches Android: POST api/node/auth/request-password-reset
 * Fields: email
 */
export async function requestPasswordReset(email: string): Promise<void> {
  const res = await nodeApi.post<{ data?: NodePasswordResetRequestData; error?: string; message?: string }>(
    'api/node/auth/request-password-reset',
    { email },
  );

  const body = res.data;
  if (body.error) throw new Error(body.error);
}

/**
 * Reset password using the code from email.
 * Matches Android: POST api/node/auth/reset-password
 * Fields: email, code, new_password
 */
export async function resetPassword(email: string, code: string, newPassword: string): Promise<void> {
  const res = await nodeApi.post<{ data?: NodePasswordResetData; error?: string; message?: string }>(
    'api/node/auth/reset-password',
    { email, code, new_password: newPassword },
  );

  const body = res.data;
  if (body.error) throw new Error(body.error);
}

/**
 * Refresh the access token.
 * Called by apiClient.ts tryRefresh() — do NOT call directly from UI.
 * Matches Android: POST api/node/auth/refresh
 * Fields: refresh_token
 *
 * On success, saves new tokens to SecureStore automatically.
 */
export async function refreshTokens(refreshToken: string): Promise<TokenRefreshResult> {
  const res = await nodeApi.post<NodeAuthFlat>(
    'api/node/auth/refresh',
    { refresh_token: refreshToken },
  );

  const body = res.data;

  if (!body.access_token) {
    throw new Error(authError(body, 'Token refresh failed'));
  }

  const expiresAtMs = computeExpiresAtMs(body);

  await Promise.all([
    storageService.setToken(body.access_token),
    storageService.setRefreshToken(body.refresh_token ?? refreshToken),
    storageService.setTokenExpiresAt(expiresAtMs),
  ]);

  return { accessToken: body.access_token, refreshToken: body.refresh_token ?? refreshToken, expiresAtMs };
}

export const authApi = {
  login,
  verifyLoginCode,
  resendLoginVerificationEmail,
  register,
  sendVerificationCode,
  verifyCode,
  requestPasswordReset,
  resetPassword,
  refreshTokens,
};
