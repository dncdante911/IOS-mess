/**
 * ErrorHandler + Result — порт Android utils/ErrorHandler.kt.
 * Превращает исключение сетевого слоя в понятное пользователю сообщение
 * (те же строки, что на Android).
 */
import { getTranslation } from '../i18n';
import { HttpException } from './android/retrofit';
import { ApiError, AuthError } from './api';

function isNetworkFailure(e: unknown): boolean {
  if (!(e instanceof Error)) return false;
  // RN fetch при отсутствии сети/обрыве бросает TypeError "Network request failed"
  return e instanceof TypeError || /Network request failed|network|Failed to fetch/i.test(e.message);
}

function httpMessage(code: number): string {
  switch (code) {
    case 400: return getTranslation('w4b_error_bad_request');
    case 401: return getTranslation('w4b_error_unauthorized');
    case 403: return getTranslation('w4b_error_forbidden');
    case 404: return getTranslation('w4b_error_not_found');
    case 413: return getTranslation('w4b_error_payload_too_large');
    case 500: return getTranslation('error_server');
    case 503: return getTranslation('w4b_error_service_unavailable');
    default: return getTranslation('w4b_error_http', undefined, [code]);
  }
}

export const ErrorHandler = {
  getErrorMessage(e: unknown): string {
    if (__DEV__) console.warn('[ErrorHandler]', e);
    if (e instanceof Error && e.name === 'AbortError') return getTranslation('w4b_error_timeout');
    if (e instanceof HttpException) return httpMessage(e.code());
    if (e instanceof AuthError) return httpMessage(401);
    if (e instanceof ApiError) return httpMessage(e.status);
    if (isNetworkFailure(e)) return getTranslation('error_no_internet');
    if (e instanceof Error && e.message) return e.message;
    return getTranslation('error_something_wrong');
  },
  logError(tag: string, message: string, e?: unknown): void {
    console.error(`[${tag}] ${message}`, e ?? '');
  },
};

/** sealed class Result<T> из Android. */
export type Result<T> =
  | { kind: 'success'; data: T }
  | { kind: 'error'; exception: unknown }
  | { kind: 'loading' };

export const Result = {
  success: <T,>(data: T): Result<T> => ({ kind: 'success', data }),
  error: <T = never,>(exception: unknown): Result<T> => ({ kind: 'error', exception }),
  loading: <T = never,>(): Result<T> => ({ kind: 'loading' }),
  getOrNull: <T,>(r: Result<T>): T | null => (r.kind === 'success' ? r.data : null),
  exceptionOrNull: <T,>(r: Result<T>): unknown => (r.kind === 'error' ? r.exception : null),
};

/** runCatching { … } → Result */
export async function runCatching<T>(fn: () => Promise<T>): Promise<Result<T>> {
  try {
    return Result.success(await fn());
  } catch (e) {
    return Result.error(e);
  }
}
