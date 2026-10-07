#!/usr/bin/env node
/**
 * Перенос API-слоя из Windows-клиента в iOS.
 *
 *   node scripts/port-windows-api.mjs [путь к windows-messenger/src]
 *
 * Берёт windows-messenger/src/{api,types,channelTheme}.ts и применяет
 * RN-адаптации (см. шапку src/core/api.ts). Каждая замена проверяется:
 * если в Windows-коде что-то поменялось и шаблон не нашёлся — скрипт падает,
 * а не тихо пишет полуперенесённый файл.
 *
 * Перезапускать после крупных изменений api.ts на Windows, чтобы iOS
 * не отставал. Ручные правки делать НЕ в src/core/api.ts, а здесь.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const WIN = process.argv[2] ?? 'C:/projects/windows-messenger/src';
const OUT = path.join(ROOT, 'src', 'core');

function replaceOnce(src, from, to, label) {
  const idx = typeof from === 'string' ? src.indexOf(from) : src.search(from);
  if (idx < 0) throw new Error(`[port] не найден шаблон: ${label}`);
  return src.replace(from, typeof to === 'string' ? () => to : to);
}

function replaceAll(src, from, to, label, min = 1) {
  const n = src.split(from).length - 1;
  if (n < min) throw new Error(`[port] не найдено (${n}<${min}): ${label}`);
  return src.split(from).join(to);
}

/** Заменяет всё от строки, начинающейся с `startPrefix`, до строки, начинающейся с `endPrefix` (не включая). */
function replaceBlock(src, startPrefix, endPrefix, replacement, label) {
  const lines = src.split('\n');
  const a = lines.findIndex((l) => l.startsWith(startPrefix));
  const b = lines.findIndex((l, i) => i > a && l.startsWith(endPrefix));
  if (a < 0 || b < 0) throw new Error(`[port] блок не найден: ${label} (${a}, ${b})`);
  lines.splice(a, b - a, ...replacement.split('\n'));
  return lines.join('\n');
}

const HEADER_IMPORTS = `import type { NodeApiShim, PreKeyBundle } from './signalTypes';
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
import { absMediaUrl, postPreviewText } from './helpers';`;

const NET_BLOCK = `function applyFailoverUrl(url: string): string {
  const active = serverFailover.nodeBaseUrl.replace(/\\/$/, '');
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

const REFRESH_SKIP = /\\/api\\/node\\/auth\\/(login|refresh|register|quick-register|quick-verify|verify-code|send-code|request-password-reset|reset-password)/;

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
  return new ApiError(status, detail ? \`HTTP \${status}: \${detail}\` : \`HTTP \${status}\`, code);
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

// Загрузка multipart/form-data. \`fieldName\` по умолчанию 'file' — совпадает с
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
  catch { throw new Error(\`Non-JSON response: \${text.slice(0, 200)}\`); }
}

// ─── Node.js API helpers (form-encoded, matching Kotlin @FormUrlEncoded) ──────

// URLSearchParams в React Native реализован не полностью (set/append падают) —
// из-за этого однажды сломался вход. Кодируем вручную.
function buildForm(data: Record<string, unknown>): string {
  const parts: string[] = [];
  const enc = (k: string, v: unknown) =>
    parts.push(\`\${encodeURIComponent(k)}=\${encodeURIComponent(String(v))}\`);
  for (const [k, v] of Object.entries(data)) {
    if (v === undefined || v === null) continue;
    if (Array.isArray(v)) {
      // \`key[]=1&key[]=2\` → req.body.key = ['1','2'] (qs на бэкенде)
      for (const item of v) enc(\`\${k}[]\`, item);
    } else {
      enc(k, v);
    }
  }
  return parts.join('&');
}
`;

// ─── api.ts ──────────────────────────────────────────────────────────────────
let api = fs.readFileSync(path.join(WIN, 'api.ts'), 'utf8').replace(/\r\n/g, '\n');

api = replaceBlock(api, "import type { NodeApiShim, PreKeyBundle } from './signalService';", 'export const NODE_BASE_URL', HEADER_IMPORTS + '\n', 'imports');
api = replaceOnce(
  api,
  /  window\.dispatchEvent\(new CustomEvent\('wm-toast', \{\n    detail: \{ text: 'TURN server unavailable[^\n]*\n  \}\)\);/,
  "  emitToast('TURN server unavailable — calls may fail behind NAT', 'warning');",
  'turn toast',
);
api = replaceOnce(
  api,
  "window.dispatchEvent(new CustomEvent('wm-toast', { detail: { text: msg, kind: 'error' } }));",
  "emitToast(msg, 'error');",
  'comment toast',
);
api = replaceBlock(api, 'function applyFailoverUrl', 'async function nodePost<T>', NET_BLOCK, 'net helpers');
api = replaceAll(api, 'file.size > LARGE_FILE_THRESHOLD', '(file.size ?? 0) > LARGE_FILE_THRESHOLD', 'large threshold');

// createStory: обложка видео — второй файл в той же форме
api = replaceOnce(
  api,
  /  if \(coverBlob && coverBlob\.size > 0\) \{[\s\S]*?\n  \}\n  await doUpload\(`\$\{NODE_BASE_URL\}\/api\/node\/stories\/create`, token, fields, file\);\n\}/,
  "  const extra = coverBlob ? [{ fieldName: 'cover', file: { ...coverBlob, name: 'cover.jpg', type: 'image/jpeg' } }] : [];\n" +
    "  await doUpload(`${NODE_BASE_URL}/api/node/stories/create`, token, fields, file, 'file', extra);\n}",
  'createStory cover',
);

// sendVoiceReaction: FormData с Blob → doUpload с полем 'audio'
api = replaceOnce(
  api,
  /export async function sendVoiceReaction\(token: string, msgId: number, blob: Blob\): Promise<void> \{[\s\S]*?\n\}\n/,
  'export async function sendVoiceReaction(token: string, msgId: number, blob: Blob): Promise<void> {\n' +
    '  // На iOS запись идёт в m4a (expo-audio); имя файла берётся из UploadFile.\n' +
    "  await doUpload(`${NODE_BASE_URL}/api/node/messages/${msgId}/voice-reaction`, token, {}, blob, 'audio');\n}\n",
  'sendVoiceReaction',
);

// GIPHY: Vite env → SecretsProvider (ключ зашифрован в бандле, как в Android)
api = replaceOnce(
  api,
  'const GIPHY_KEY = import.meta.env.VITE_GIPHY_API_KEY as string;',
  "import { SecretsProvider } from '../security/secretsProvider';\nconst GIPHY_KEY_GETTER = () => SecretsProvider.giphyApiKey;",
  'giphy key',
);
api = replaceAll(api, '${GIPHY_KEY}', '${GIPHY_KEY_GETTER()}', 'giphy key usage', 0);
if (/\bGIPHY_KEY\b(?!_GETTER)/.test(api)) {
  api = api.replace(/\bGIPHY_KEY\b(?!_GETTER)/g, 'GIPHY_KEY_GETTER()');
}

const codeOnly = api
  .split('\n')
  .filter((l) => !/^\s*(\/\/|\*|\/\*)/.test(l))
  .join('\n');
const leftovers = codeOnly.match(/window\.|document\.|localStorage|desktopApp|arrayBuffer\(/g);
if (leftovers) throw new Error(`[port] остались браузерные API: ${[...new Set(leftovers)].join(', ')}`);

fs.writeFileSync(path.join(OUT, 'api.ts'), api, 'utf8');

// ─── types.ts, channelTheme.ts — чистые типы/данные, копия как есть ──────────
for (const f of ['types.ts', 'channelTheme.ts']) {
  const src = fs.readFileSync(path.join(WIN, f), 'utf8').replace(/\r\n/g, '\n');
  const banner = `// АВТОГЕНЕРАЦИЯ: копия windows-messenger/src/${f} (scripts/port-windows-api.mjs). Руками не править.\n`;
  fs.writeFileSync(path.join(OUT, f), banner + src, 'utf8');
}

console.log(`[port] api.ts: ${api.split('\n').length} строк, ${(api.match(/^export async function/gm) ?? []).length} функций → src/core`);
