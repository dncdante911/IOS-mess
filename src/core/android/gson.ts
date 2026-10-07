/**
 * Мини-Gson: превращает JSON ответа в объект с полями Kotlin-модели и обратно.
 *
 * Схема (gen/schema.ts) генерируется из data class Android. Правила повторяют
 * Gson + Kotlin:
 *   • JSON-имя поля — из @SerializedName (плюс alternate), иначе имя свойства
 *   • если у data class у ВСЕХ параметров есть дефолты, Gson создаёт объект через
 *     no-arg конструктор → отсутствующие поля получают Kotlin-дефолт; иначе
 *     объект создаётся без конструктора → примитивы 0/false, остальное null
 *   • "12" в Int-поле → 12; число в String-поле → "12"
 *   • enum: JSON-значение → имя константы; неизвестное → null
 */
import { MODEL_SCHEMA, ENUM_SCHEMA } from './gen/schema';

export type TypeDesc =
  | { k: 'int' | 'num' | 'str' | 'bool' | 'raw' | 'void'; n?: 1 }
  | { k: 'list' | 'map'; of: TypeDesc; n?: 1 }
  | { k: 'obj'; c: string; n?: 1 }
  | { k: 'enum'; e: string; n?: 1 };

export type DefaultDesc =
  | { v: unknown; enumRef?: string }
  | { now: 'ms' | 's' }
  | { ctor: string };

export interface FieldSchema {
  /** имя свойства Kotlin */
  p: string;
  /** имя в JSON */
  j: string;
  alt?: string[];
  t: TypeDesc;
  d?: DefaultDesc;
  /** @JsonAdapter — имя кастомного адаптера */
  ad?: string;
}

export interface ModelSchema {
  /** все параметры с дефолтами (Gson вызывает no-arg конструктор) */
  a: 0 | 1;
  f: FieldSchema[];
}

type Adapter = { read: (json: unknown) => unknown; write?: (value: unknown) => unknown };
const adapters: Record<string, Adapter> = {};

/** Регистрация ручного адаптера (аналог @JsonAdapter / registerTypeAdapter). */
export function registerJsonAdapter(name: string, adapter: Adapter): void {
  adapters[name] = adapter;
}

function zeroOf(t: TypeDesc): unknown {
  // Int? / Boolean? — в JVM это boxed-тип, Gson оставляет null
  if (t.n) return null;
  switch (t.k) {
    case 'int':
    case 'num':
      return 0;
    case 'bool':
      return false;
    default:
      return null;
  }
}

function defaultOf(d: DefaultDesc): unknown {
  if ('v' in d) return Array.isArray(d.v) ? [...d.v] : d.v && typeof d.v === 'object' ? { ...(d.v as object) } : d.v;
  if ('now' in d) return d.now === 'ms' ? Date.now() : Math.floor(Date.now() / 1000);
  if ('ctor' in d) return MODEL_SCHEMA[d.ctor] ? decodeModel(d.ctor, {}) : null;
  return null;
}

function toNumber(v: unknown, int: boolean): number | null {
  if (typeof v === 'number') return int ? Math.trunc(v) : v;
  if (typeof v === 'string' && v.trim() !== '' && !Number.isNaN(Number(v))) {
    const n = Number(v);
    return int ? Math.trunc(n) : n;
  }
  if (typeof v === 'boolean') return v ? 1 : 0;
  return null;
}

export function decodeValue(t: TypeDesc, v: unknown): unknown {
  if (v === undefined || v === null) return null;
  switch (t.k) {
    case 'int':
      return toNumber(v, true);
    case 'num':
      return toNumber(v, false);
    case 'str':
      if (typeof v === 'string') return v;
      if (typeof v === 'number' || typeof v === 'boolean') return String(v);
      return JSON.stringify(v);
    case 'bool':
      if (typeof v === 'boolean') return v;
      if (typeof v === 'string') return v === 'true' || v === '1';
      if (typeof v === 'number') return v !== 0;
      return null;
    case 'list':
      if (!Array.isArray(v)) return null;
      return v.map((x) => decodeValue(t.of, x));
    case 'map': {
      if (typeof v !== 'object' || Array.isArray(v)) return null;
      const out: Record<string, unknown> = {};
      for (const [k, x] of Object.entries(v as Record<string, unknown>)) out[k] = decodeValue(t.of, x);
      return out;
    }
    case 'obj':
      if (typeof v !== 'object' || Array.isArray(v)) return null;
      return decodeModel(t.c, v as Record<string, unknown>);
    case 'enum': {
      if (enumAdapters[t.e]) return enumAdapters[t.e](v);
      const map = ENUM_SCHEMA[t.e];
      const key = String(v);
      return map?.[key] ?? null;
    }
    default:
      return v;
  }
}

const enumAdapters: Record<string, (json: unknown) => string | null> = {};

/** Аналог GsonBuilder.registerTypeAdapter(SomeEnum::class.java, …) — для enum. */
export function registerEnumAdapter(name: string, read: (json: unknown) => string | null): void {
  enumAdapters[name] = read;
}

export function decodeModel<T = any>(name: string, json: Record<string, unknown>): T {
  const s = MODEL_SCHEMA[name];
  if (!s) return json as T;
  const out: Record<string, unknown> = {};
  for (const f of s.f) {
    let raw: unknown = json[f.j];
    if (raw === undefined && f.alt) {
      for (const a of f.alt) {
        if (json[a] !== undefined) {
          raw = json[a];
          break;
        }
      }
    }
    if (raw === undefined) {
      out[f.p] = s.a && f.d ? defaultOf(f.d) : zeroOf(f.t);
      continue;
    }
    if (f.ad && adapters[f.ad]) {
      out[f.p] = adapters[f.ad].read(raw);
      continue;
    }
    const v = decodeValue(f.t, raw);
    // Gson кладёт null из JSON даже в non-null поле; примитивы без значения → 0/false
    out[f.p] = v === null && (f.t.k === 'int' || f.t.k === 'num' || f.t.k === 'bool') ? zeroOf(f.t) : v;
  }
  return out as T;
}

export function encodeValue(t: TypeDesc, v: unknown): unknown {
  if (v === undefined || v === null) return undefined;
  switch (t.k) {
    case 'list':
      return Array.isArray(v) ? v.map((x) => encodeValue(t.of, x)) : v;
    case 'map': {
      const out: Record<string, unknown> = {};
      for (const [k, x] of Object.entries(v as Record<string, unknown>)) out[k] = encodeValue(t.of, x);
      return out;
    }
    case 'obj':
      return encodeModel(t.c, v as Record<string, unknown>);
    case 'enum': {
      const map = ENUM_SCHEMA[t.e];
      const json = map ? Object.keys(map).find((k) => map[k] === v) : undefined;
      return json ?? v;
    }
    default:
      return v;
  }
}

/** Kotlin-объект → JSON (как Gson.toJson: null-поля опускаются). */
export function encodeModel(name: string, obj: Record<string, unknown>): Record<string, unknown> {
  const s = MODEL_SCHEMA[name];
  if (!s) return obj;
  const out: Record<string, unknown> = {};
  for (const f of s.f) {
    const v = obj[f.p];
    if (v === undefined || v === null) continue;
    out[f.j] = f.ad && adapters[f.ad]?.write ? adapters[f.ad].write!(v) : encodeValue(f.t, v);
  }
  return out;
}

/**
 * Создание модели с Kotlin-дефолтами — аналог вызова конструктора
 * `Foo(a = 1)` в Kotlin: `newModel<Foo>('Foo', { a: 1 })`.
 */
export function newModel<T = any>(name: string, fields: Partial<T> = {}): T {
  const s = MODEL_SCHEMA[name];
  const out: Record<string, unknown> = {};
  if (s) for (const f of s.f) out[f.p] = f.d ? defaultOf(f.d) : zeroOf(f.t);
  return { ...out, ...(fields as object) } as T;
}
