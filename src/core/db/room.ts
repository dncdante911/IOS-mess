/**
 * Рантайм для сгенерированных Room-DAO (gen/daos.ts) поверх expo-sqlite + SQLCipher.
 *
 * Аналог Android AppDatabase + DatabaseKeyManager:
 *   • файл worldmates_messenger.db, шифрование SQLCipher (AES-256)
 *   • ключ — 32 случайных байта в Keychain (не синхронизируется, только это устройство)
 *   • схема создаётся из Room-сущностей (CREATE … IF NOT EXISTS); версия хранится
 *     в PRAGMA user_version — при изменении схемы добавлять миграцию в MIGRATIONS
 *
 * LiveQuery — замена Flow<…> из Room: подписка получает новый результат при
 * любой записи в таблицы, из которых читает запрос.
 */
import * as SQLite from 'expo-sqlite';
import * as SecureStore from 'expo-secure-store';
import { secureRandomBytes } from '../../crypto/e2ee/primitives';

export interface EntityMeta {
  table: string;
  pk: string[];
  columns: string[];
  bools: string[];
  ddl: string[];
}

type Mode = 'all' | 'first' | 'scalar' | 'run';

const DB_NAME = 'worldmates_messenger.db';
const DB_KEY_NAME = 'wm_db_key_v1';
/** Room version = 12 на Android; у нас своя нумерация схемы. */
const SCHEMA_VERSION = 1;

/** Миграции: from → SQL. Добавлять при изменении сущностей на Android. */
const MIGRATIONS: Record<number, string[]> = {};

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;
/** Глубина room.transaction(): внутри неё insert/update/delete не открывают свою транзакцию (SQLite не умеет вложенные). */
let txDepth = 0;

async function inTx(db: SQLite.SQLiteDatabase, fn: () => Promise<void>): Promise<void> {
  if (txDepth > 0) return fn();
  txDepth++;
  try {
    await db.withTransactionAsync(fn);
  } finally {
    txDepth--;
  }
}
let entityList: EntityMeta[] = [];
const boolCols = new Map<string, Set<string>>();

async function getDbKey(): Promise<string> {
  const opts = { keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY };
  let key = await SecureStore.getItemAsync(DB_KEY_NAME, opts);
  if (!key) {
    key = Array.from(secureRandomBytes(32), (b) => b.toString(16).padStart(2, '0')).join('');
    await SecureStore.setItemAsync(DB_KEY_NAME, key, opts);
  }
  return key;
}

async function open(): Promise<SQLite.SQLiteDatabase> {
  const db = await SQLite.openDatabaseAsync(DB_NAME);
  // SQLCipher: ключ ПЕРВОЙ командой. Raw-ключ в hex — без PBKDF2 на каждом открытии.
  const key = await getDbKey();
  await db.execAsync(`PRAGMA key = "x'${key}'";`);
  await db.execAsync('PRAGMA journal_mode = WAL;');

  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  let version = row?.user_version ?? 0;
  if (version === 0) {
    for (const e of entityList) for (const sql of e.ddl) await db.execAsync(sql);
    version = SCHEMA_VERSION;
  } else {
    while (version < SCHEMA_VERSION) {
      for (const sql of MIGRATIONS[version] ?? []) await db.execAsync(sql);
      version++;
    }
    // Новые таблицы, добавленные без миграции, — создаются идемпотентно
    for (const e of entityList) for (const sql of e.ddl) await db.execAsync(sql);
  }
  await db.execAsync(`PRAGMA user_version = ${SCHEMA_VERSION}`);
  return db;
}

// ─── Live-запросы ─────────────────────────────────────────────────────────────
type Invalidator = () => void;
const tableWatchers = new Map<string, Set<Invalidator>>();

function notify(tables: string[]): void {
  const fired = new Set<Invalidator>();
  for (const t of tables) for (const w of tableWatchers.get(t) ?? []) fired.add(w);
  fired.forEach((w) => w());
}

export class LiveQuery<T> {
  constructor(
    private readonly run: () => Promise<T>,
    private readonly tables: string[],
  ) {}

  /** Подписка (аналог Flow.collect). Возвращает функцию отписки. */
  subscribe(cb: (value: T) => void): () => void {
    let alive = true;
    const refresh = () => {
      this.run().then((v) => alive && cb(v)).catch(() => {});
    };
    for (const t of this.tables) {
      if (!tableWatchers.has(t)) tableWatchers.set(t, new Set());
      tableWatchers.get(t)!.add(refresh);
    }
    refresh();
    return () => {
      alive = false;
      for (const t of this.tables) tableWatchers.get(t)?.delete(refresh);
    };
  }

  /** Однократное значение (аналог Flow.first()). */
  first(): Promise<T> {
    return this.run();
  }
}

// ─── Привязка параметров ──────────────────────────────────────────────────────
function toSql(v: unknown): SQLite.SQLiteBindValue {
  if (v === undefined || v === null) return null;
  if (typeof v === 'boolean') return v ? 1 : 0;
  if (typeof v === 'number' || typeof v === 'string') return v;
  if (v instanceof Uint8Array) return v;
  return JSON.stringify(v);
}

/** :param → значение; для IN (:list) список раскрывается в (?, ?, …). */
function bind(sql: string, args: Record<string, unknown>): { sql: string; params: SQLite.SQLiteBindValue[] } {
  const params: SQLite.SQLiteBindValue[] = [];
  const out = sql.replace(/:(\w+)/g, (_, name: string) => {
    const v = args[name];
    if (Array.isArray(v)) {
      if (v.length === 0) return 'NULL';
      v.forEach((x) => params.push(toSql(x)));
      return v.map(() => '?').join(', ');
    }
    params.push(toSql(v));
    return '?';
  });
  return { sql: out, params };
}

function fromRow<T>(meta: EntityMeta | null, row: Record<string, unknown>): T {
  if (!meta) return row as T;
  const bools = boolCols.get(meta.table);
  if (bools) for (const b of bools) if (b in row) row[b] = row[b] === 1 || row[b] === true;
  return row as T;
}

async function exec(sql: string, args: Record<string, unknown>, mode: Mode, meta: EntityMeta | null): Promise<unknown> {
  const db = await room.db();
  const b = bind(sql, args);
  switch (mode) {
    case 'all': {
      const rows = await db.getAllAsync<Record<string, unknown>>(b.sql, b.params);
      return meta ? rows.map((r) => fromRow(meta, r)) : rows.map((r) => Object.values(r)[0]);
    }
    case 'first': {
      const row = await db.getFirstAsync<Record<string, unknown>>(b.sql, b.params);
      return row ? fromRow(meta, row) : null;
    }
    case 'scalar': {
      const row = await db.getFirstAsync<Record<string, unknown>>(b.sql, b.params);
      return row ? Object.values(row)[0] ?? null : null;
    }
    default:
      await db.runAsync(b.sql, b.params);
      return undefined;
  }
}

export const room = {
  /** Регистрация сущностей — вызывается один раз из core/db/index.ts. */
  init(entities: EntityMeta[]): void {
    entityList = entities;
    for (const e of entities) boolCols.set(e.table, new Set(e.bools));
  },

  db(): Promise<SQLite.SQLiteDatabase> {
    dbPromise ??= open().catch((e) => {
      dbPromise = null;
      throw e;
    });
    return dbPromise;
  },

  query(sql: string, args: Record<string, unknown>, mode: Mode, meta: EntityMeta | null, _tables: string[]) {
    return exec(sql, args, mode, meta);
  },

  async write(sql: string, args: Record<string, unknown>, _mode: Mode, meta: EntityMeta | null, tables: string[]) {
    await exec(sql, args, 'run', meta);
    notify(tables);
  },

  live<T>(sql: string, args: Record<string, unknown>, mode: Mode, meta: EntityMeta | null, tables: string[]): LiveQuery<T> {
    return new LiveQuery<T>(() => exec(sql, args, mode, meta) as Promise<T>, tables);
  },

  async insert(meta: EntityMeta, rows: object[], strategy: 'REPLACE' | 'IGNORE' | 'ABORT'): Promise<number> {
    if (!rows.length) return 0;
    const db = await room.db();
    const verb = strategy === 'REPLACE' ? 'INSERT OR REPLACE' : strategy === 'IGNORE' ? 'INSERT OR IGNORE' : 'INSERT';
    const sql = `${verb} INTO ${meta.table} (${meta.columns.join(', ')}) VALUES (${meta.columns.map(() => '?').join(', ')})`;
    let lastId = 0;
    await inTx(db, async () => {
      for (const r of rows) {
        const res = await db.runAsync(sql, meta.columns.map((c) => toSql((r as Record<string, unknown>)[c])));
        lastId = res.lastInsertRowId;
      }
    });
    notify([meta.table]);
    return lastId;
  },

  async update(meta: EntityMeta, rows: object[]): Promise<void> {
    const db = await room.db();
    const setCols = meta.columns.filter((c) => !meta.pk.includes(c));
    const sql = `UPDATE ${meta.table} SET ${setCols.map((c) => `${c} = ?`).join(', ')} WHERE ${meta.pk.map((c) => `${c} = ?`).join(' AND ')}`;
    await inTx(db, async () => {
      for (const r of rows) {
        const o = r as Record<string, unknown>;
        await db.runAsync(sql, [...setCols.map((c) => toSql(o[c])), ...meta.pk.map((c) => toSql(o[c]))]);
      }
    });
    notify([meta.table]);
  },

  async delete(meta: EntityMeta, rows: object[]): Promise<void> {
    const db = await room.db();
    const sql = `DELETE FROM ${meta.table} WHERE ${meta.pk.map((c) => `${c} = ?`).join(' AND ')}`;
    await inTx(db, async () => {
      for (const r of rows) await db.runAsync(sql, meta.pk.map((c) => toSql((r as Record<string, unknown>)[c])));
    });
    notify([meta.table]);
  },

  /** Аналог @Transaction: несколько DAO-вызовов атомарно. */
  async transaction(fn: () => Promise<void>): Promise<void> {
    const db = await room.db();
    await inTx(db, fn);
  },

  /** Полное удаление БД (выход со стиранием данных). */
  async destroy(): Promise<void> {
    if (dbPromise) {
      const db = await dbPromise;
      await db.closeAsync();
      dbPromise = null;
    }
    await SQLite.deleteDatabaseAsync(DB_NAME);
    await SecureStore.deleteItemAsync(DB_KEY_NAME);
  },
};
