#!/usr/bin/env node
/**
 * Генератор TS-зеркала сетевого слоя Android.
 *
 *   node scripts/gen-android-api.mjs [путь к com/worldmates/messenger]
 *
 * Читает Kotlin-исходники Android и создаёт src/core/android/gen/:
 *   models.ts   — интерфейсы всех data class (имена полей как в Kotlin, camelCase)
 *   schema.ts   — схема (де)сериализации: JSON-имя из @SerializedName, тип, дефолт
 *   apis.ts     — все Retrofit-интерфейсы: те же имена методов и порядок
 *                 параметров, те же дефолты; + объект NodeRetrofitClient с теми же
 *                 свойствами (api, groupApi, channelApi, …)
 *
 * Зачем: экран, перенесённый с Android, пишется почти построчно —
 *   Kotlin: val r = NodeRetrofitClient.groupApi.getGroups(limit = 50)
 *   TS:     const r = await NodeRetrofitClient.groupApi.getGroups(50)
 * и поля ответа называются так же (r.apiStatus, r.groups), а не snake_case.
 *
 * Поведение повторяет Retrofit + Gson:
 *   • @Field/@Query с null не отправляются; List в @Field — повтор ключа
 *   • если у data class ВСЕ параметры имеют дефолты, отсутствующие в JSON поля
 *     получают Kotlin-дефолт (Gson использует no-arg конструктор); иначе — null/0
 *   • числа из строк ("12") парсятся, числа в String-поле — в строку
 *   • enum — имя константы (с учётом @SerializedName на константах), неизвестное → null
 *   • не-2xx в suspend-методе → HttpException; для Response<T> — объект ответа
 *
 * Перезапускать после изменения сетевого слоя Android. Файлы в gen/ руками не править.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SRC = process.argv[2] ?? 'C:/projects/worldmates/app/src/main/java/com/worldmates/messenger';
const OUT = path.join(ROOT, 'src', 'core', 'android', 'gen');

const warnings = [];
const warn = (m) => warnings.push(m);

// ─── Чтение исходников ────────────────────────────────────────────────────────
function walk(dir) {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p));
    else if (e.name.endsWith('.kt')) out.push(p);
  }
  return out;
}

/** Убирает комментарии, не трогая строковые литералы. */
function stripComments(src) {
  let out = '';
  let i = 0;
  const n = src.length;
  while (i < n) {
    const c = src[i];
    const c2 = src[i + 1];
    if (c === '"' && src.startsWith('"""', i)) {
      const end = src.indexOf('"""', i + 3);
      const j = end < 0 ? n : end + 3;
      out += src.slice(i, j);
      i = j;
    } else if (c === '"') {
      let j = i + 1;
      while (j < n && src[j] !== '"' && src[j] !== '\n') j += src[j] === '\\' ? 2 : 1;
      out += src.slice(i, j + 1);
      i = j + 1;
    } else if (c === "'" ) {
      let j = i + 1;
      while (j < n && src[j] !== "'" && src[j] !== '\n') j += src[j] === '\\' ? 2 : 1;
      out += src.slice(i, j + 1);
      i = j + 1;
    } else if (c === '/' && c2 === '/') {
      while (i < n && src[i] !== '\n') i++;
    } else if (c === '/' && c2 === '*') {
      let depth = 1;
      i += 2;
      while (i < n && depth > 0) {
        if (src[i] === '/' && src[i + 1] === '*') { depth++; i += 2; }
        else if (src[i] === '*' && src[i + 1] === '/') { depth--; i += 2; }
        else i++;
      }
      out += ' ';
    } else {
      out += c;
      i++;
    }
  }
  return out;
}

/** Индекс закрывающей скобки для открывающей в позиции `open`. Учитывает строки. */
function matchBracket(s, open) {
  const pairs = { '(': ')', '{': '}', '[': ']', '<': '>' };
  const oc = s[open];
  const cc = pairs[oc];
  let depth = 0;
  for (let i = open; i < s.length; i++) {
    const c = s[i];
    if (c === '"') {
      if (s.startsWith('"""', i)) { i = s.indexOf('"""', i + 3) + 2; continue; }
      i++;
      while (i < s.length && s[i] !== '"') i += s[i] === '\\' ? 2 : 1;
      continue;
    }
    if (oc === '<' && c === '-' && s[i + 1] === '>') { i++; continue; }
    if (c === oc) depth++;
    else if (c === cc) { depth--; if (depth === 0) return i; }
  }
  return -1;
}

/** Делит по запятым верхнего уровня. */
function splitTop(s) {
  const parts = [];
  let depth = 0;
  let cur = '';
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === '"') {
      let j = i + 1;
      while (j < s.length && s[j] !== '"') j += s[j] === '\\' ? 2 : 1;
      cur += s.slice(i, j + 1);
      i = j;
      continue;
    }
    if (c === '-' && s[i + 1] === '>') { cur += '->'; i++; continue; }
    if ('([{<'.includes(c)) depth++;
    else if (')]}>'.includes(c)) depth--;
    if (c === ',' && depth === 0) { parts.push(cur); cur = ''; continue; }
    cur += c;
  }
  if (cur.trim()) parts.push(cur);
  return parts.map((p) => p.trim()).filter(Boolean);
}

/** Снимает аннотации с начала строки параметра, возвращая их список. */
function takeAnnotations(s) {
  const anns = [];
  let rest = s.trim();
  while (rest.startsWith('@')) {
    const m = rest.match(/^@([A-Za-z_][\w.:]*)/);
    if (!m) break;
    let end = m[0].length;
    let args = null;
    let k = end;
    while (rest[k] === ' ') k++;
    if (rest[k] === '(') {
      const close = matchBracket(rest, k);
      args = rest.slice(k + 1, close);
      end = close + 1;
    }
    // @retrofit2.http.Query → Query, @field:SerializedName → SerializedName
    anns.push({ name: m[1].replace(/^(field|param|get):/, '').split('.').pop(), args });
    rest = rest.slice(end).trim();
  }
  return { anns, rest };
}

function annArg(ann) {
  if (!ann || ann.args == null) return null;
  const m = ann.args.match(/^\s*(?:value\s*=\s*)?"((?:[^"\\]|\\.)*)"/);
  return m ? m[1].replace(/\\\$/g, '$') : null;
}

// ─── Kotlin-константы (Constants.kt и пр.) ────────────────────────────────────
const constants = {};

// ─── Типы ─────────────────────────────────────────────────────────────────────
const PRIM = {
  Int: 'int', Long: 'int', Short: 'int', Byte: 'int',
  Float: 'num', Double: 'num', Number: 'num',
  String: 'str', CharSequence: 'str', Char: 'str',
  Boolean: 'bool',
};
const LISTS = new Set(['List', 'MutableList', 'ArrayList', 'Array', 'Set', 'MutableSet', 'HashSet', 'Collection', 'Iterable']);
const MAPS = new Set(['Map', 'MutableMap', 'HashMap', 'LinkedHashMap']);
const RAW = new Set(['Any', 'JsonElement', 'JsonObject', 'JsonArray', 'JsonPrimitive', 'com.google.gson.JsonElement', 'com.google.gson.JsonObject', 'com.google.gson.JsonArray', 'Object']);

/** Разбор строки типа Kotlin в дескриптор. */
function parseType(t) {
  t = t.trim();
  let nullable = false;
  if (t.endsWith('?')) { nullable = true; t = t.slice(0, -1).trim(); }
  if (t.startsWith('(') && t.includes('->')) return { k: 'raw', nullable };
  const g = t.indexOf('<');
  let base = g >= 0 ? t.slice(0, g) : t;
  const args = g >= 0 ? splitTop(t.slice(g + 1, matchBracket(t, g))) : [];
  base = base.replace(/^(kotlin\.collections\.|kotlin\.|java\.util\.)/, '');
  const simple = base.split('.').pop();
  if (PRIM[simple]) return { k: PRIM[simple], nullable };
  if (/Array$/.test(simple) && PRIM[simple.replace(/Array$/, '')]) return { k: 'list', of: { k: PRIM[simple.replace(/Array$/, '')] }, nullable };
  if (LISTS.has(simple)) return { k: 'list', of: args[0] ? parseType(args[0]) : { k: 'raw' }, nullable };
  if (MAPS.has(simple)) return { k: 'map', of: args[1] ? parseType(args[1]) : { k: 'raw' }, nullable };
  if (RAW.has(base) || RAW.has(simple)) return { k: 'raw', nullable };
  if (simple === 'Unit') return { k: 'void', nullable };
  return { k: 'ref', name: simple, qual: base, args: args.map(parseType), nullable };
}

// ─── Модели: data class + enum ────────────────────────────────────────────────
const classes = new Map(); // simple name → [{ name, file, params, allDefaults, typeParams }]
const enums = new Map(); // simple name → { constants: [{ name, json }] }

function parseDefault(expr, file) {
  if (expr == null) return undefined;
  const e = expr.trim();
  if (e === 'null') return { v: null };
  if (e === 'true' || e === 'false') return { v: e === 'true' };
  const num = e.match(/^(-?)(0x[0-9a-fA-F_]+|\d[\d_]*(?:\.\d+)?(?:[eE][+-]?\d+)?)[LlFfDd]?$/);
  if (num) return { v: Number(num[1] + num[2].replace(/_/g, '')) };
  const str = e.match(/^"((?:[^"\\$]|\\.)*)"$/);
  if (str) return { v: JSON.parse(`"${str[1].replace(/\\\$/g, '$')}"`) };
  if (/^(emptyList|listOf|mutableListOf|arrayListOf|emptyArray|arrayOf|emptySet|setOf|mutableSetOf)\(\s*\)$/.test(e)) return { v: [] };
  if (/^(emptyMap|mapOf|mutableMapOf|hashMapOf)\(\s*\)$/.test(e)) return { v: {} };
  const lst = e.match(/^(listOf|arrayOf|setOf|mutableListOf)\((.+)\)$/s);
  if (lst) {
    const items = splitTop(lst[2]).map((x) => parseDefault(x, file));
    if (items.every((x) => x && 'v' in x)) return { v: items.map((x) => x.v) };
  }
  if (/^[\d\s*+\-/().]+[Ll]?$/.test(e.replace(/(\d)[LlFf]\b/g, '$1')) && /\d/.test(e)) {
    try {
      // только цифры и арифметика — безопасно вычислить
      return { v: Function(`"use strict"; return (${e.replace(/(\d)[LlFf]\b/g, '$1')});`)() };
    } catch { /* не выражение */ }
  }
  if (/^System\.currentTimeMillis\(\)$/.test(e)) return { now: 'ms' };
  if (/^\(?System\.currentTimeMillis\(\)\s*\/\s*1000L?\)?$/.test(e)) return { now: 's' };
  const ctor = e.match(/^([A-Z][\w.]*)\(\s*\)$/);
  if (ctor) return { ctor: ctor[1].split('.').pop() };
  const cref = e.match(/^(?:com\.worldmates\.messenger\.data\.)?Constants\.([A-Z0-9_]+)$/);
  if (cref && cref[1] in constants) return { v: constants[cref[1]] };
  const enumRef = e.match(/^([A-Z]\w*(?:\.[A-Z]\w*)*)\.([A-Z][A-Z0-9_]*)$/);
  if (enumRef) return { v: enumRef[2], enumRef: enumRef[1].split('.').pop() };
  warn(`дефолт не распознан (${path.basename(file)}): ${e.slice(0, 80)}`);
  return undefined;
}

function parseParams(paramSrc, file) {
  const params = [];
  for (const raw of splitTop(paramSrc)) {
    const { anns, rest } = takeAnnotations(raw);
    const m = rest.match(/^(?:(?:private|public|internal|protected|override|open)\s+)*(?:(val|var)\s+)?([A-Za-z_]\w*)\s*:\s*([\s\S]+)$/);
    if (!m) { warn(`параметр не разобран (${path.basename(file)}): ${raw.slice(0, 80)}`); continue; }
    const [, valVar, name, typeAndDefault] = m;
    const parts = splitTopEq(typeAndDefault);
    params.push({ anns, isProp: !!valVar, name, typeSrc: parts[0].trim(), defSrc: parts[1]?.trim() });
  }
  return params;
}

/** Делит "Type = default" по первому '=' верхнего уровня. */
function splitTopEq(s) {
  let depth = 0;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === '"') { let j = i + 1; while (j < s.length && s[j] !== '"') j += s[j] === '\\' ? 2 : 1; i = j; continue; }
    if (c === '-' && s[i + 1] === '>') { i++; continue; }
    if ('([{<'.includes(c)) depth++;
    else if (')]}>'.includes(c)) depth--;
    else if (c === '=' && depth === 0 && s[i + 1] !== '=' && s[i - 1] !== '!' && s[i - 1] !== '<' && s[i - 1] !== '>') {
      return [s.slice(0, i), s.slice(i + 1)];
    }
  }
  return [s];
}

function scanModels(src, file) {
  // data class
  const re = /\bdata\s+class\s+([A-Z]\w*)\s*(<[^>(]*>)?\s*(?:@\w+\s*)?(?:(?:private|internal|public)\s+)?(?:constructor\s*)?\(/g;
  let m;
  while ((m = re.exec(src))) {
    const open = m.index + m[0].length - 1;
    const close = matchBracket(src, open);
    if (close < 0) continue;
    const params = parseParams(src.slice(open + 1, close), file).filter((p) => p.isProp);
    const typeParams = m[2] ? splitTop(m[2].slice(1, -1)).map((x) => x.split(':')[0].trim()) : [];
    const def = {
      name: m[1],
      file,
      typeParams,
      allDefaults: params.every((p) => p.defSrc !== undefined),
      params,
    };
    if (!classes.has(def.name)) classes.set(def.name, []);
    classes.get(def.name).push(def);
  }
  // enum class
  const ere = /\benum\s+class\s+([A-Z]\w*)\s*(\([^)]*\))?\s*(?::\s*[\w.<>, ]+)?\s*\{/g;
  while ((m = ere.exec(src))) {
    const open = m.index + m[0].length - 1;
    const close = matchBracket(src, open);
    let body = src.slice(open + 1, close);
    const semi = topLevelSemicolon(body);
    if (semi >= 0) body = body.slice(0, semi);
    const constantsList = [];
    for (const item of splitTop(body)) {
      const { anns, rest } = takeAnnotations(item);
      const cm = rest.match(/^([A-Z][A-Z0-9_]*)\b/);
      if (!cm) continue;
      const sn = anns.find((a) => a.name === 'SerializedName');
      constantsList.push({ name: cm[1], json: annArg(sn) ?? cm[1] });
    }
    if (constantsList.length) enums.set(m[1], { constants: constantsList, file });
  }
}

function topLevelSemicolon(s) {
  let depth = 0;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === '"') { let j = i + 1; while (j < s.length && s[j] !== '"') j += s[j] === '\\' ? 2 : 1; i = j; continue; }
    if ('([{'.includes(c)) depth++;
    else if (')]}'.includes(c)) depth--;
    else if (c === ';' && depth === 0) return i;
  }
  return -1;
}

// ─── Retrofit-интерфейсы ──────────────────────────────────────────────────────
const HTTP = new Set(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']);
const apis = []; // { name, file, methods }

function scanApis(src, file) {
  const re = /\binterface\s+([A-Z]\w*)\s*\{/g;
  let m;
  while ((m = re.exec(src))) {
    const open = m.index + m[0].length - 1;
    const close = matchBracket(src, open);
    const body = src.slice(open + 1, close);
    if (!/@(GET|POST|PUT|DELETE|PATCH)\b/.test(body)) continue;
    const methods = [];
    const fre = /((?:@[\w.]+(?:\([^)]*\))?\s*)+)(?:suspend\s+)?fun\s+([a-zA-Z_]\w*)\s*\(/g;
    let f;
    while ((f = fre.exec(body))) {
      const { anns } = takeAnnotations(f[1]);
      const httpAnn = anns.find((a) => HTTP.has(a.name));
      if (!httpAnn) continue;
      const pOpen = f.index + f[0].length - 1;
      const pClose = matchBracket(body, pOpen);
      const after = body.slice(pClose + 1).match(/^\s*:\s*([\w.<>?, ]+?)(?=\s*(?:\n|$|@|fun\b|suspend\b|\}))/);
      const retSrc = after ? after[1].trim() : 'Unit';
      let pathExpr = httpAnn.args?.trim() ?? '';
      let urlPath = null;
      const lit = pathExpr.match(/^"((?:[^"\\]|\\.)*)"$/);
      if (lit) urlPath = lit[1].replace(/\\\$/g, '$');
      else if (pathExpr) {
        const cm = pathExpr.match(/(?:Constants\.)?([A-Z0-9_]+)$/);
        if (cm && cm[1] in constants) urlPath = constants[cm[1]];
        else warn(`путь не разрешён ${m[1]}.${f[2]}: ${pathExpr}`);
      }
      methods.push({
        name: f[2],
        http: httpAnn.name,
        path: urlPath,
        formUrlEncoded: anns.some((a) => a.name === 'FormUrlEncoded'),
        multipart: anns.some((a) => a.name === 'Multipart'),
        headers: anns.filter((a) => a.name === 'Headers').map((a) => a.args),
        params: parseParams(body.slice(pOpen + 1, pClose), file),
        retSrc,
      });
      fre.lastIndex = pClose;
    }
    apis.push({ name: m[1], file, methods });
  }
}

// ─── Проход по исходникам ─────────────────────────────────────────────────────
const files = walk(SRC);
const sources = files.map((f) => ({ file: f, src: stripComments(fs.readFileSync(f, 'utf8')) }));
for (const { src } of sources) {
  for (const cm of src.matchAll(/const\s+val\s+([A-Z0-9_]+)\s*(?::\s*\w+)?\s*=\s*("(?:[^"\\$]|\\.)*"|-?\d[\d_]*(?:\.\d+)?[LlFf]?)\s*$/gm)) {
    const v = cm[2].startsWith('"') ? JSON.parse(cm[2]) : Number(cm[2].replace(/[_LlFf]/g, ''));
    if (!(cm[1] in constants)) constants[cm[1]] = v;
  }
}
for (const { file, src } of sources) {
  scanModels(src, file);
  scanApis(src, file);
}

// ─── Отбор моделей ────────────────────────────────────────────────────────────
// Берём data class из data/** и network/** плюс всё, что достижимо из сигнатур
// API (модели, объявленные во ViewModel рядом с Retrofit-интерфейсом). Классы
// UI-состояния и Compose-стилей (PremiumShapes, Success/Error и т.п.) — не модели.
{
  const isDataFile = (f) => /[\\/](data|network)[\\/]/.test(path.relative(SRC, f).replace(/^/, path.sep));
  const keep = new Set();
  const queue = [];
  const enqueue = (d) => { if (d && !keep.has(d)) { keep.add(d); queue.push(d); } };
  for (const defs of classes.values()) for (const d of defs) if (isDataFile(d.file)) enqueue(d);
  const refsOf = (t, out = []) => {
    if (!t) return out;
    if (t.k === 'list' || t.k === 'map') refsOf(t.of, out);
    if (t.k === 'ref') { out.push(t.name); (t.args ?? []).forEach((a) => refsOf(a, out)); }
    return out;
  };
  for (const api of apis) {
    for (const meth of api.methods) {
      for (const n of refsOf(parseType(meth.retSrc))) enqueue(resolveClass(n, api.file));
      for (const p of meth.params) for (const n of refsOf(parseType(p.typeSrc))) enqueue(resolveClass(n, api.file));
    }
  }
  while (queue.length) {
    const d = queue.pop();
    for (const p of d.params) for (const n of refsOf(parseType(p.typeSrc))) enqueue(resolveClass(n, d.file));
  }
  for (const [name, defs] of [...classes]) {
    const kept = defs.filter((d) => keep.has(d));
    if (kept.length) classes.set(name, kept);
    else classes.delete(name);
  }
}

// Разрешение коллизий имён: первое определение — каноническое, остальные с суффиксом.
const modelList = [];
const tsName = new Map(); // def → TS-имя
for (const [name, defs] of classes) {
  defs.forEach((d, i) => {
    const n = i === 0 ? name : `${name}__${path.basename(d.file, '.kt')}`;
    tsName.set(d, n);
    modelList.push(d);
    if (i > 0) warn(`коллизия имени модели ${name}: ${path.relative(SRC, defs[0].file)} vs ${path.relative(SRC, d.file)}`);
  });
}
function resolveClass(name, fromFile) {
  const defs = classes.get(name);
  if (!defs) return null;
  return defs.find((d) => d.file === fromFile) ?? defs[0];
}

// ─── Генерация: схема ─────────────────────────────────────────────────────────
function typeToSchema(t, fromFile, typeParams = []) {
  if (!t) return { k: 'raw' };
  const base = { ...t };
  if (t.k === 'list' || t.k === 'map') return { k: t.k, of: typeToSchema(t.of, fromFile, typeParams), n: t.nullable ? 1 : undefined };
  if (t.k === 'ref') {
    if (typeParams.includes(t.name)) return { k: 'raw', n: t.nullable ? 1 : undefined };
    const def = resolveClass(t.name, fromFile);
    if (def) return { k: 'obj', c: tsName.get(def), n: t.nullable ? 1 : undefined };
    if (enums.has(t.name)) return { k: 'enum', e: t.name, n: t.nullable ? 1 : undefined };
    if (t.name === 'Response') return typeToSchema(t.args[0], fromFile, typeParams);
    return { k: 'raw', n: t.nullable ? 1 : undefined };
  }
  return { k: base.k, n: t.nullable ? 1 : undefined };
}

const schema = {};
for (const d of modelList) {
  schema[tsName.get(d)] = {
    a: d.allDefaults ? 1 : 0,
    f: d.params.map((p) => {
      const sn = p.anns.find((a) => a.name === 'SerializedName');
      const json = annArg(sn) ?? p.name;
      const alt = sn?.args?.match(/alternate\s*=\s*\[([^\]]*)\]/);
      const adapter = p.anns.find((a) => a.name === 'JsonAdapter');
      const entry = {
        p: p.name,
        j: json,
        t: typeToSchema(parseType(p.typeSrc), d.file, d.typeParams),
      };
      if (alt) entry.alt = [...alt[1].matchAll(/"([^"]+)"/g)].map((x) => x[1]);
      if (adapter) entry.ad = adapter.args.replace(/::class.*$/, '').split('.').pop();
      // Дефолт храним всегда: при декодировании он применяется только если
      // a=1 (как Gson), а newModel() использует его как конструктор Kotlin.
      const dv = parseDefault(p.defSrc, d.file);
      if (dv !== undefined) entry.d = dv;
      return entry;
    }),
  };
}
const enumSchema = {};
for (const [name, e] of enums) enumSchema[name] = Object.fromEntries(e.constants.map((c) => [c.json, c.name]));

// ─── Генерация: TS-типы ───────────────────────────────────────────────────────
const enumTs = (name) => (classes.has(name) ? `${name}Enum` : name);

function tsType(t, fromFile, typeParams = [], pfx = '') {
  if (!t) return 'any';
  let s;
  switch (t.k) {
    case 'int': case 'num': s = 'number'; break;
    case 'str': s = 'string'; break;
    case 'bool': s = 'boolean'; break;
    case 'raw': s = 'any'; break;
    case 'void': s = 'void'; break;
    case 'list': s = `Array<${tsType(t.of, fromFile, typeParams, pfx)}>`; break;
    case 'map': s = `Record<string, ${tsType(t.of, fromFile, typeParams, pfx)}>`; break;
    case 'ref': {
      if (typeParams.includes(t.name)) { s = t.name; break; }
      if (t.name === 'Response') { s = `RetrofitResponse<${tsType(t.args[0], fromFile, typeParams, pfx)}>`; break; }
      if (t.name === 'ResponseBody') { s = 'RawResponseBody'; break; }
      if (t.name === 'RequestBody') { s = 'RequestBodyLike'; break; }
      if (t.qual === 'MultipartBody.Part' || t.name === 'Part') { s = 'MultipartPart'; break; }
      const def = resolveClass(t.name, fromFile);
      if (def) {
        const n = tsName.get(def);
        const args = def.typeParams.length ? `<${def.typeParams.map((_, i) => (t.args[i] ? tsType(t.args[i], fromFile, typeParams, pfx) : 'any')).join(', ')}>` : '';
        s = pfx + n + args;
        break;
      }
      if (enums.has(t.name)) { s = pfx + enumTs(t.name); break; }
      s = 'any';
      break;
    }
    default: s = 'any';
  }
  return t.nullable ? `${s} | null` : s;
}

let models = `// АВТОГЕНЕРАЦИЯ: scripts/gen-android-api.mjs из Kotlin-моделей Android. Руками не править.
/* eslint-disable */
`;
for (const [name, e] of [...enums].sort((a, b) => a[0].localeCompare(b[0]))) {
  models += `\n/** enum ${path.relative(SRC, e.file).replace(/\\/g, '/')} */\nexport type ${enumTs(name)} = ${e.constants.map((c) => `'${c.name}'`).join(' | ')};\n`;
  models += `export const ${enumTs(name)} = { ${e.constants.map((c) => `${c.name}: '${c.name}' as const`).join(', ')} };\n`;
}
for (const d of [...modelList].sort((a, b) => tsName.get(a).localeCompare(tsName.get(b)))) {
  const tp = d.typeParams.length ? `<${d.typeParams.map((x) => `${x} = any`).join(', ')}>` : '';
  models += `\n/** ${path.relative(SRC, d.file).replace(/\\/g, '/')} */\nexport interface ${tsName.get(d)}${tp} {\n`;
  for (const p of d.params) {
    const t = parseType(p.typeSrc);
    models += `  ${p.name}: ${tsType(t, d.file, d.typeParams)};\n`;
  }
  models += '}\n';
}

// ─── Генерация: API ───────────────────────────────────────────────────────────
function defaultTs(defSrc, file) {
  if (defSrc === undefined) return undefined;
  const d = parseDefault(defSrc, file);
  if (!d) return undefined;
  if ('v' in d) return JSON.stringify(d.v);
  if (d.now === 'ms') return 'Date.now()';
  if (d.now === 's') return 'Math.floor(Date.now() / 1000)';
  return undefined;
}

function baseFor(apiName) {
  if (apiName === 'StrapiApiService') return 'strapi';
  if (apiName === 'GiphyApi') return 'giphy';
  return 'node';
}

let apisTs = `// АВТОГЕНЕРАЦИЯ: scripts/gen-android-api.mjs из Retrofit-интерфейсов Android. Руками не править.
/* eslint-disable */
import { retrofitCall, type RetrofitResponse, type RawResponseBody, type RequestBodyLike, type MultipartPart, type CallParam } from '../retrofit';
import type * as M from './models';
`;

const apiIndex = [];
for (const api of apis) {
  apisTs += `\n/** ${path.relative(SRC, api.file).replace(/\\/g, '/')} */\nexport const ${api.name} = {\n`;
  for (const meth of api.methods) {
    const sigParts = [];
    const specParams = [];
    for (const p of meth.params) {
      const ann = p.anns.find((a) => ['Field', 'Query', 'Path', 'Part', 'Body', 'Url', 'Header', 'FieldMap', 'QueryMap', 'PartMap', 'HeaderMap'].includes(a.name));
      if (!ann) { warn(`параметр без аннотации ${api.name}.${meth.name}: ${p.name}`); continue; }
      const t = parseType(p.typeSrc);
      const ts = tsType(t, api.file, [], 'M.');
      const def = defaultTs(p.defSrc, api.file);
      const optional = p.defSrc !== undefined;
      sigParts.push(`${p.name}${optional && def === undefined ? '?' : ''}: ${ts}${def !== undefined ? ` = ${def}` : ''}`);
      const sp = { kind: ann.name, name: annArg(ann), arg: p.name };
      if (ann.name === 'Path') sp.encoded = /encoded\s*=\s*true/.test(ann.args ?? '');
      if (ann.name === 'Body') {
        const st = typeToSchema(t, api.file);
        if (st.k === 'obj') sp.schema = st.c;
      }
      specParams.push(sp);
    }
    // Kotlin допускает параметр с дефолтом перед обязательным — в TS тогда тип с undefined
    let seenRequired = false;
    for (let i = sigParts.length - 1; i >= 0; i--) {
      const hasDefault = sigParts[i].includes(' = ') || /^\w+\?:/.test(sigParts[i]);
      if (!hasDefault) seenRequired = true;
      else if (seenRequired && /^\w+\?:/.test(sigParts[i])) sigParts[i] = sigParts[i].replace(/^(\w+)\?:\s*(.*)$/, '$1: $2 | undefined');
    }
    const ret = parseType(meth.retSrc);
    const isResponse = ret.k === 'ref' && ret.name === 'Response';
    const inner = isResponse ? ret.args[0] : ret;
    const retSchema = typeToSchema(inner, api.file);
    const retTs = tsType(ret, api.file, [], 'M.');
    const spec = {
      base: baseFor(api.name),
      http: meth.http,
      path: meth.path,
      form: meth.formUrlEncoded || undefined,
      multipart: meth.multipart || undefined,
      response: isResponse || undefined,
      raw: (inner.k === 'ref' && inner.name === 'ResponseBody') || undefined,
      ret: retSchema,
      headers: meth.headers.length ? meth.headers : undefined,
    };
    apisTs += `  ${meth.name}(${sigParts.join(', ')}): Promise<${retTs}> {\n`;
    apisTs += `    return retrofitCall(${JSON.stringify(spec)}, [${specParams.map((sp) => `{ ...${JSON.stringify(sp)}, value: ${sp.arg} }`).join(', ')}] as CallParam[]);\n`;
    apisTs += `  },\n`;
    apiIndex.push(`${api.name}.${meth.name} ${meth.http} ${meth.path ?? '(Url)'}`);
  }
  apisTs += `};\n`;
}

// NodeRetrofitClient: те же свойства, что в Android
const nrc = fs.readFileSync(path.join(SRC, 'network', 'NodeRetrofitClient.kt'), 'utf8');
const props = [...nrc.matchAll(/val\s+(\w+)\s*:\s*(\w+)\s*=\s*\w+\.create\((\w+)::class\.java\)/g)];
apisTs += `\n/** network/NodeRetrofitClient.kt — те же имена свойств, что в Android. */\nexport const NodeRetrofitClient = {\n`;
for (const [, prop, type] of props) {
  if (apis.some((a) => a.name === type)) apisTs += `  ${prop}: ${type},\n`;
}
apisTs += `};\n`;

// ─── Constants.kt → Constants.ts (те же имена) ────────────────────────────────
let constantsTs = `// АВТОГЕНЕРАЦИЯ: scripts/gen-android-api.mjs из data/Constants.kt. Руками не править.\n/* eslint-disable */\n`;
{
  const csrc = stripComments(fs.readFileSync(path.join(SRC, 'data', 'Constants.kt'), 'utf8'));
  const entries = [];
  for (const m of csrc.matchAll(/(?:const\s+)?val\s+([A-Z][A-Z0-9_]*)\s*(?::\s*\w+)?\s*=\s*([^\n]+)/g)) {
    const expr = m[2].trim().replace(/,$/, '');
    const d = parseDefault(expr, 'Constants.kt');
    if (d && 'v' in d) entries.push(`  ${m[1]}: ${JSON.stringify(d.v)},`);
    else if (/SecretsProvider/.test(expr)) entries.push(`  // ${m[1]} — секрет, см. security/secretsProvider.ts`);
    else entries.push(`  // ${m[1]} = ${expr.slice(0, 100)}  (не литерал — перенести вручную)`);
  }
  constantsTs += `export const Constants = {\n${entries.join('\n')}\n} as const;\n`;
}

// ─── Запись ───────────────────────────────────────────────────────────────────
fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, 'Constants.ts'), constantsTs, 'utf8');
fs.writeFileSync(path.join(OUT, 'models.ts'), models, 'utf8');
fs.writeFileSync(
  path.join(OUT, 'schema.ts'),
  `// АВТОГЕНЕРАЦИЯ: scripts/gen-android-api.mjs. Руками не править.\n/* eslint-disable */\nimport type { ModelSchema } from '../gson';\n\nexport const MODEL_SCHEMA: Record<string, ModelSchema> = ${JSON.stringify(schema)};\n\nexport const ENUM_SCHEMA: Record<string, Record<string, string>> = ${JSON.stringify(enumSchema)};\n`,
  'utf8',
);
fs.writeFileSync(path.join(OUT, 'apis.ts'), apisTs, 'utf8');
fs.writeFileSync(path.join(OUT, 'API_INDEX.txt'), apiIndex.join('\n') + '\n', 'utf8');
fs.writeFileSync(path.join(OUT, 'WARNINGS.txt'), warnings.join('\n') + '\n', 'utf8');

console.log(`модели: ${modelList.length}, enum: ${enums.size}, API-интерфейсов: ${apis.length}, методов: ${apiIndex.length}, предупреждений: ${warnings.length}`);
