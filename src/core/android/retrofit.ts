/**
 * Исполнитель вызовов для сгенерированных Retrofit-интерфейсов (gen/apis.ts).
 *
 * Повторяет поведение Android-клиентов:
 *   node   — NodeRetrofitClient: https://worldmates.club:449/, заголовки
 *            access-token + Accept-Language, failover, refresh при 401
 *   strapi — StrapiClient: https://cdn.worldmates.club/, Authorization: Bearer <token>
 *            (стикеры/эмодзи/GIF-паки; файлы Strapi лежат в MinIO S3)
 *   giphy  — GiphyRepository: https://api.giphy.com/v1/
 *
 * Retrofit-семантика:
 *   @Field/@Query со значением null не отправляются; List — повтор ключа
 *   @Path — подстановка с URL-кодированием (если не encoded=true)
 *   @Part("x") — текстовая часть; @Part без имени — MultipartPart { field, file }
 *   @Body — JSON через схему модели (Kotlin-имена → @SerializedName)
 *   suspend fun: T            — не-2xx бросает HttpException
 *   suspend fun: Response<T>  — возвращает объект ответа, не бросает
 */
import { serverFailover } from '../serverFailover';
import { getLang } from '../i18nBridge';
import { Session } from '../session';
import { SecretsProvider } from '../../security/secretsProvider';
import { appendFile, type UploadFile } from '../platform/files';
import { decodeValue, encodeModel, type TypeDesc } from './gson';

export const NODE_BASE_URL = 'https://worldmates.club:449/';
export const STRAPI_BASE_URL = 'https://cdn.worldmates.club/';
export const GIPHY_BASE_URL = 'https://api.giphy.com/v1/';

/** Constants.CONNECT/READ_TIMEOUT_SECONDS = 30; загрузки — MEDIA_UPLOAD_TIMEOUT. */
const DEFAULT_TIMEOUT_MS = 30_000;
const UPLOAD_TIMEOUT_MS = 10 * 60_000;

export interface CallSpec {
  base: 'node' | 'strapi' | 'giphy';
  http: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string | null;
  form?: boolean;
  multipart?: boolean;
  response?: boolean;
  raw?: boolean;
  ret: TypeDesc;
  headers?: string[];
}

export interface CallParam {
  kind: 'Field' | 'Query' | 'Path' | 'Part' | 'Body' | 'Url' | 'Header' | 'FieldMap' | 'QueryMap' | 'PartMap' | 'HeaderMap';
  name: string | null;
  arg: string;
  encoded?: boolean;
  schema?: string;
  value: unknown;
}

/** MultipartBody.Part из Android: имя поля + файл. */
export interface MultipartPart {
  field: string;
  file: UploadFile;
}

/** okhttp3.RequestBody: строка (текстовая часть) или файл. */
export type RequestBodyLike = string | number | boolean | UploadFile;

/** okhttp3.ResponseBody */
export interface RawResponseBody {
  string(): string;
  json<T = any>(): T;
  contentType: string | null;
}

/** retrofit2.Response<T> — свойства/методы с теми же именами, что в Kotlin. */
export interface RetrofitResponse<T> {
  isSuccessful: boolean;
  code(): number;
  message(): string;
  body(): T | null;
  errorBody(): RawResponseBody | null;
  headers(): Record<string, string>;
}

/** retrofit2.HttpException */
export class HttpException extends Error {
  private readonly _code: number;
  readonly response: RetrofitResponse<unknown>;
  constructor(code: number, message: string, response: RetrofitResponse<unknown>) {
    super(`HTTP ${code} ${message}`);
    this.name = 'HttpException';
    this._code = code;
    this.response = response;
  }
  code(): number {
    return this._code;
  }
}

function rawBody(text: string, contentType: string | null): RawResponseBody {
  return {
    string: () => text,
    json: <T,>() => JSON.parse(text) as T,
    contentType,
  };
}

function baseUrl(base: CallSpec['base']): string {
  if (base === 'strapi') return STRAPI_BASE_URL;
  if (base === 'giphy') return GIPHY_BASE_URL;
  return serverFailover.nodeBaseUrl.endsWith('/') ? serverFailover.nodeBaseUrl : `${serverFailover.nodeBaseUrl}/`;
}

function enc(v: unknown): string {
  return encodeURIComponent(String(v));
}

function isFile(v: unknown): v is UploadFile {
  return typeof v === 'object' && v !== null && 'uri' in v;
}

function buildRequest(spec: CallSpec, params: CallParam[]) {
  let path = spec.path ?? '';
  let url = '';
  const query: string[] = [];
  const fields: string[] = [];
  const headers: Record<string, string> = {};
  let form: FormData | null = null;
  let jsonBody: string | undefined;

  for (const p of params) {
    const v = p.value;
    switch (p.kind) {
      case 'Url':
        url = String(v);
        break;
      case 'Path':
        path = path.replace(`{${p.name}}`, p.encoded ? String(v) : enc(v));
        break;
      case 'Query':
        if (v === null || v === undefined) break;
        if (Array.isArray(v)) v.forEach((x) => query.push(`${enc(p.name)}=${enc(x)}`));
        else query.push(`${enc(p.name)}=${enc(v)}`);
        break;
      case 'QueryMap':
        for (const [k, x] of Object.entries((v ?? {}) as Record<string, unknown>)) {
          if (x !== null && x !== undefined) query.push(`${enc(k)}=${enc(x)}`);
        }
        break;
      case 'Field':
        if (v === null || v === undefined) break;
        if (Array.isArray(v)) v.forEach((x) => fields.push(`${enc(p.name)}=${enc(x)}`));
        else fields.push(`${enc(p.name)}=${enc(v)}`);
        break;
      case 'FieldMap':
        for (const [k, x] of Object.entries((v ?? {}) as Record<string, unknown>)) {
          if (x !== null && x !== undefined) fields.push(`${enc(k)}=${enc(x)}`);
        }
        break;
      case 'Part':
      case 'PartMap': {
        if (v === null || v === undefined) break;
        form ??= new FormData();
        if (p.kind === 'PartMap') {
          for (const [k, x] of Object.entries(v as Record<string, unknown>)) {
            if (isFile(x)) appendFile(form, k, x);
            else if (x !== null && x !== undefined) form.append(k, String(x));
          }
        } else if (p.name) {
          if (isFile(v)) appendFile(form, p.name, v);
          else form.append(p.name, String(v));
        } else {
          const part = v as MultipartPart;
          appendFile(form, part.field, part.file);
        }
        break;
      }
      case 'Body':
        if (v === null || v === undefined) break;
        jsonBody = JSON.stringify(p.schema ? encodeModel(p.schema, v as Record<string, unknown>) : v);
        headers['Content-Type'] = 'application/json; charset=UTF-8';
        break;
      case 'Header':
        if (v !== null && v !== undefined) headers[p.name ?? ''] = String(v);
        break;
      case 'HeaderMap':
        Object.assign(headers, v ?? {});
        break;
    }
  }

  for (const h of spec.headers ?? []) {
    const m = h.match(/"([^":]+):\s*([^"]*)"/);
    if (m) headers[m[1]] = m[2];
  }

  if (!url) {
    // Абсолютные пути (/api/v2/...) Retrofit резолвит от хоста, относительные — от baseUrl
    const b = baseUrl(spec.base);
    if (/^https?:\/\//.test(path)) url = path;
    // URL-полифил RN неполный (нет origin) — берём схему+хост регуляркой
    else if (path.startsWith('/')) url = (b.match(/^https?:\/\/[^/]+/)?.[0] ?? '') + path;
    else url = b + path;
  }
  if (query.length) url += (url.includes('?') ? '&' : '?') + query.join('&');

  let body: string | FormData | undefined;
  if (form) body = form;
  else if (jsonBody !== undefined) body = jsonBody;
  else if (spec.form || fields.length) {
    body = fields.join('&');
    headers['Content-Type'] = 'application/x-www-form-urlencoded';
  }

  return { url, headers, body, isUpload: !!form };
}

function authHeaders(spec: CallSpec, token: string | null): Record<string, string> {
  if (spec.base === 'node') {
    return { 'access-token': token ?? '', 'Accept-Language': getLang() };
  }
  if (spec.base === 'strapi') {
    const t = SecretsProvider.strapiToken;
    return t ? { Authorization: `Bearer ${t}` } : {};
  }
  return {};
}

async function fetchWithTimeout(url: string, init: RequestInit, ms: number): Promise<Response> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { ...init, signal: ctrl.signal });
  } finally {
    clearTimeout(timer);
  }
}

export async function retrofitCall<T = any>(spec: CallSpec, params: CallParam[]): Promise<T> {
  const req = buildRequest(spec, params);
  const timeout = req.isUpload ? UPLOAD_TIMEOUT_MS : DEFAULT_TIMEOUT_MS;

  // TokenRefreshInterceptor: проактивное обновление, если токен истекает < 60 с
  if (spec.base === 'node' && Session.isTokenExpiringSoon && !/\/api\/node\/auth\//.test(req.url)) {
    await Session.refresh();
  }

  let res = await fetchWithTimeout(
    req.url,
    { method: spec.http, headers: { ...authHeaders(spec, Session.accessToken), ...req.headers }, body: req.body as any },
    timeout,
  );

  // TokenRefreshInterceptor: 401 → обновить токен → повторить один раз
  if (res.status === 401 && spec.base === 'node' && !/\/api\/node\/auth\//.test(req.url)) {
    const fresh = await Session.refresh();
    if (fresh) {
      res = await fetchWithTimeout(
        req.url,
        { method: spec.http, headers: { ...authHeaders(spec, fresh), ...req.headers }, body: req.body as any },
        timeout,
      );
    }
  }

  const text = await res.text();
  const contentType = res.headers.get('content-type');
  const hdrs: Record<string, string> = {};
  res.headers.forEach((v: string, k: string) => {
    hdrs[k] = v;
  });

  const parseBody = (): T | null => {
    if (spec.raw) return rawBody(text, contentType) as unknown as T;
    if (spec.ret.k === 'void') return null;
    if (!text) return null;
    try {
      return decodeValue(spec.ret, JSON.parse(text)) as T;
    } catch {
      return null;
    }
  };

  const ok = res.status >= 200 && res.status < 300;
  const response: RetrofitResponse<T> = {
    isSuccessful: ok,
    code: () => res.status,
    message: () => res.statusText ?? '',
    body: () => (ok ? parseBody() : null),
    errorBody: () => (ok ? null : rawBody(text, contentType)),
    headers: () => hdrs,
  };

  if (spec.response) return response as unknown as T;
  if (!ok) throw new HttpException(res.status, res.statusText ?? '', response as RetrofitResponse<unknown>);
  return parseBody() as T;
}
