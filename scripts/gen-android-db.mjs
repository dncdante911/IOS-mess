#!/usr/bin/env node
/**
 * Генератор локальной БД из Room-описаний Android.
 *
 *   node scripts/gen-android-db.mjs [путь к com/worldmates/messenger]
 *
 * Читает data/local/entity/*.kt и data/local/dao/*.kt и пишет
 * src/core/db/gen/{entities,daos}.ts:
 *   • CREATE TABLE/INDEX — те же таблицы, колонки, PK и индексы, что в Room
 *   • DAO — те же имена методов и параметров:
 *       @Query           → тот же SQL (:param → привязка)
 *       @Insert(REPLACE) → INSERT OR REPLACE; список → пакетом в транзакции
 *       @Update/@Delete  → по первичному ключу
 *       Flow<…>          → LiveQuery: subscribe(cb), перезапуск при изменении таблиц
 *       @Transaction-методы с телом — переносятся вручную (см. db/daosManual.ts)
 *
 * Булевы поля хранятся как INTEGER 0/1 (как Room) и возвращаются как boolean.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SRC = process.argv[2] ?? 'C:/projects/worldmates/app/src/main/java/com/worldmates/messenger';
const LOCAL = path.join(SRC, 'data', 'local');
const OUT = path.join(ROOT, 'src', 'core', 'db', 'gen');

const strip = (s) => s.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/^\s*\/\/.*$/gm, '').replace(/([^:"])\/\/[^\n"]*$/gm, '$1');

function matchParen(s, open) {
  let d = 0;
  for (let i = open; i < s.length; i++) {
    if (s[i] === '"') {
      if (s.startsWith('"""', i)) { i = s.indexOf('"""', i + 3) + 2; continue; }
      i++;
      while (s[i] !== '"') i += s[i] === '\\' ? 2 : 1;
      continue;
    }
    if (s[i] === '(') d++;
    else if (s[i] === ')' && --d === 0) return i;
  }
  return -1;
}

function splitTop(s) {
  const out = [];
  let d = 0;
  let cur = '';
  for (const c of s) {
    if ('(<['.includes(c)) d++;
    if (')>]'.includes(c)) d--;
    if (c === ',' && d === 0) { out.push(cur.trim()); cur = ''; } else cur += c;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

const SQLTYPE = { Long: 'INTEGER', Int: 'INTEGER', Short: 'INTEGER', Boolean: 'INTEGER', String: 'TEXT', Float: 'REAL', Double: 'REAL', ByteArray: 'BLOB' };
const TSTYPE = { Long: 'number', Int: 'number', Short: 'number', Boolean: 'boolean', String: 'string', Float: 'number', Double: 'number', ByteArray: 'Uint8Array' };

function tsDefault(expr) {
  if (expr === undefined) return undefined;
  const e = expr.trim();
  if (e === 'null' || e === 'true' || e === 'false') return e;
  if (/^-?\d+(\.\d+)?[LlFf]?$/.test(e)) return e.replace(/[LlFf]$/, '');
  if (/^"[^"$]*"$/.test(e)) return e;
  if (e === 'System.currentTimeMillis()') return 'Date.now()';
  return undefined;
}

// ─── Entities ─────────────────────────────────────────────────────────────────
const entities = {};
for (const f of fs.readdirSync(path.join(LOCAL, 'entity'))) {
  const src = strip(fs.readFileSync(path.join(LOCAL, 'entity', f), 'utf8'));
  const em = src.match(/@Entity\(([\s\S]*?)\)\s*data\s+class\s+(\w+)\s*\(/);
  if (!em) continue;
  const [, entArgs, cls] = em;
  const table = entArgs.match(/tableName\s*=\s*"(\w+)"/)?.[1] ?? cls;
  const pkList = entArgs.match(/primaryKeys\s*=\s*\[([^\]]*)\]/)?.[1];
  const indices = [...entArgs.matchAll(/Index\(\s*value\s*=\s*\[([^\]]*)\](?:\s*,\s*name\s*=\s*"(\w+)")?(?:\s*,\s*unique\s*=\s*(true))?/g)].map((m) => ({
    cols: [...m[1].matchAll(/"(\w+)"/g)].map((x) => x[1]),
    name: m[2],
    unique: !!m[3],
  }));
  const open = src.indexOf('(', em.index + em[0].length - 1);
  const close = matchParen(src, open);
  const cols = [];
  let pk = pkList ? [...pkList.matchAll(/"(\w+)"/g)].map((x) => x[1]) : [];
  for (const p of splitTop(src.slice(open + 1, close))) {
    const isPk = /@PrimaryKey/.test(p);
    const m = p.replace(/@\w+(\([^)]*\))?/g, '').trim().match(/^(?:val|var)\s+(\w+)\s*:\s*([\w.]+)(\?)?\s*(?:=\s*([\s\S]+))?$/);
    if (!m) { console.warn('колонка не разобрана', cls, p); continue; }
    const [, name, type, nullable, def] = m;
    const auto = /@PrimaryKey\(\s*autoGenerate\s*=\s*true/.test(p);
    cols.push({ name, kt: type, sql: SQLTYPE[type] ?? 'TEXT', ts: TSTYPE[type] ?? 'any', nullable: !!nullable, def: tsDefault(def), auto });
    if (isPk) pk = [name];
  }
  // константы companion object (CHAT_TYPE_USER и т.п.)
  const consts = [...src.matchAll(/const\s+val\s+([A-Z_]+)\s*=\s*("[^"]*"|-?\d+L?)/g)].map((m) => [m[1], m[2].replace(/L$/, '')]);
  entities[cls] = { cls, table, pk, cols, indices, consts };
}

let ent = `// АВТОГЕНЕРАЦИЯ: scripts/gen-android-db.mjs из Room-сущностей Android. Руками не править.
/* eslint-disable */
import type { EntityMeta } from '../room';
`;
for (const e of Object.values(entities)) {
  ent += `\n/** data/local/entity/${e.cls}.kt — таблица ${e.table} */\nexport interface ${e.cls} {\n`;
  for (const c of e.cols) ent += `  ${c.name}: ${c.ts}${c.nullable ? ' | null' : ''};\n`;
  ent += `}\n`;
  if (e.consts.length) ent += `export const ${e.cls}Consts = { ${e.consts.map(([k, v]) => `${k}: ${v}`).join(', ')} } as const;\n`;
  // фабрика с дефолтами Kotlin-конструктора
  const req = e.cols.filter((c) => c.def === undefined);
  ent += `export function new${e.cls}(f: ${req.length ? `Pick<${e.cls}, ${req.map((c) => `'${c.name}'`).join(' | ')}> & ` : ''}Partial<${e.cls}>): ${e.cls} {\n`;
  ent += `  return { ${e.cols.filter((c) => c.def !== undefined).map((c) => `${c.name}: ${c.def}`).join(', ')}${e.cols.some((c) => c.def !== undefined) ? ', ' : ''}...f } as ${e.cls};\n}\n`;
  const ddlCols = e.cols.map((c) => {
    let s = `${c.name} ${c.sql}`;
    if (!c.nullable) s += ' NOT NULL';
    if (e.pk.length === 1 && e.pk[0] === c.name) s += c.auto ? ' PRIMARY KEY AUTOINCREMENT' : ' PRIMARY KEY';
    return s;
  });
  if (e.pk.length > 1) ddlCols.push(`PRIMARY KEY (${e.pk.join(', ')})`);
  const ddl = [`CREATE TABLE IF NOT EXISTS ${e.table} (${ddlCols.join(', ')})`];
  for (const ix of e.indices) {
    ddl.push(`CREATE ${ix.unique ? 'UNIQUE ' : ''}INDEX IF NOT EXISTS ${ix.name ?? `index_${e.table}_${ix.cols.join('_')}`} ON ${e.table} (${ix.cols.join(', ')})`);
  }
  ent += `export const ${e.cls}Meta: EntityMeta = ${JSON.stringify({
    table: e.table,
    pk: e.pk,
    columns: e.cols.map((c) => c.name),
    bools: e.cols.filter((c) => c.kt === 'Boolean').map((c) => c.name),
    ddl,
  })};\n`;
}
ent += `\nexport const ALL_ENTITIES: EntityMeta[] = [${Object.keys(entities).map((c) => `${c}Meta`).join(', ')}];\n`;

// ─── DAOs ─────────────────────────────────────────────────────────────────────
let dao = `// АВТОГЕНЕРАЦИЯ: scripts/gen-android-db.mjs из Room-DAO Android. Руками не править.
/* eslint-disable */
import { room, LiveQuery } from '../room';
import * as E from './entities';
`;
const manual = [];
for (const f of fs.readdirSync(path.join(LOCAL, 'dao'))) {
  const src = strip(fs.readFileSync(path.join(LOCAL, 'dao', f), 'utf8'));
  const im = src.match(/interface\s+(\w+)\s*\{/);
  if (!im) continue;
  const daoName = im[1];
  dao += `\n/** data/local/dao/${f} */\nexport const ${daoName} = {\n`;
  const re = /((?:@\w+(?:\((?:[^()]|\([^)]*\))*\))?\s*)+)(?:suspend\s+)?fun\s+(\w+)\s*\(/g;
  let m;
  while ((m = re.exec(src))) {
    const anns = m[1];
    const name = m[2];
    const open = m.index + m[0].length - 1;
    const close = matchParen(src, open);
    const params = splitTop(src.slice(open + 1, close)).map((p) => {
      const pm = p.match(/^(\w+)\s*:\s*([\w.<>?]+?)(\?)?\s*(?:=\s*(.+))?$/);
      return pm ? { name: pm[1], type: pm[2], nullable: !!pm[3], def: pm[4] } : null;
    }).filter(Boolean);
    const rest = src.slice(close + 1);
    const ret = (rest.match(/^\s*:\s*([\w.<>?, ]+?)\s*(?:\{|\n|$)/)?.[1] ?? 'Unit').trim();
    const hasBody = /^\s*(?::\s*[\w.<>?, ]+)?\s*\{/.test(rest);
    re.lastIndex = close;

    const tsParam = (p) => {
      const base = p.type.replace(/^List<(\w+)>$/, '$1[]');
      let t = TSTYPE[base] ?? (entities[base] ? `E.${base}` : base.endsWith('[]') ? (entities[base.slice(0, -2)] ? `E.${base}` : `${TSTYPE[base.slice(0, -2)] ?? 'any'}[]`) : 'any');
      if (p.nullable) t += ' | null';
      const d = tsDefault(p.def);
      return `${p.name}: ${t}${d !== undefined ? ` = ${d}` : ''}`;
    };
    const sig = params.map(tsParam).join(', ');
    const argsObj = `{ ${params.map((p) => p.name).join(', ')} }`;

    if (hasBody && /@Transaction/.test(anns)) {
      manual.push(`${daoName}.${name}`);
      continue;
    }

    // Возвращаемый тип
    const flow = /^(kotlinx\.coroutines\.flow\.)?Flow</.test(ret);
    const inner = flow ? ret.replace(/^(kotlinx\.coroutines\.flow\.)?Flow<(.+)>$/, '$2') : ret;
    const listOf = inner.match(/^List<(\w+)>$/)?.[1];
    const single = inner.replace(/\?$/, '');
    const entityRet = listOf && entities[listOf] ? listOf : entities[single] ? single : null;
    const metaFor = (cls) => `E.${cls}Meta`;
    let mode;
    let tsRet;
    if (listOf) { mode = 'all'; tsRet = entities[listOf] ? `E.${listOf}[]` : `${TSTYPE[listOf] ?? 'any'}[]`; }
    else if (inner === 'Unit') { mode = 'run'; tsRet = 'void'; }
    else if (entities[single]) { mode = 'first'; tsRet = `E.${single} | null`; }
    else { mode = 'scalar'; tsRet = `${TSTYPE[single] ?? 'any'}${inner.endsWith('?') ? ' | null' : ''}`; }

    const q = anns.match(/@Query\(\s*(?:"""([\s\S]*?)"""|"((?:[^"\\]|\\.)*)")\s*\)/);
    if (q) {
      const sql = (q[1] ?? q[2]).replace(/\s+/g, ' ').trim();
      const tables = [...sql.matchAll(/\b(?:FROM|INTO|UPDATE|JOIN)\s+(\w+)/gi)].map((x) => x[1]);
      const meta = entityRet ? metaFor(entityRet) : 'null';
      const isWrite = /^\s*(UPDATE|DELETE|INSERT)/i.test(sql);
      if (flow) {
        dao += `  ${name}(${sig}): LiveQuery<${tsRet}> {\n    return room.live(${JSON.stringify(sql)}, ${argsObj}, ${JSON.stringify(mode)}, ${meta}, ${JSON.stringify(tables)});\n  },\n`;
      } else {
        dao += `  async ${name}(${sig}): Promise<${tsRet}> {\n    return room.${isWrite ? 'write' : 'query'}(${JSON.stringify(sql)}, ${argsObj}, ${JSON.stringify(isWrite ? 'run' : mode)}, ${meta}, ${JSON.stringify(tables)}) as Promise<${tsRet}>;\n  },\n`;
      }
      continue;
    }
    const p0 = params[0];
    const p0cls = p0?.type.replace(/^List<(\w+)>$/, '$1');
    if (/@Insert/.test(anns) && p0 && entities[p0cls]) {
      const isList = p0.type.startsWith('List<');
      const strategy = /REPLACE/.test(anns) ? 'REPLACE' : /IGNORE/.test(anns) ? 'IGNORE' : 'ABORT';
      dao += `  async ${name}(${sig}): Promise<${ret === 'Long' ? 'number' : 'void'}> {\n    return room.insert(${metaFor(p0cls)}, ${isList ? p0.name : `[${p0.name}]`}, ${JSON.stringify(strategy)}) as any;\n  },\n`;
      continue;
    }
    if (/@Update/.test(anns) && p0 && entities[p0cls]) {
      dao += `  async ${name}(${sig}): Promise<void> {\n    return room.update(${metaFor(p0cls)}, ${p0.type.startsWith('List<') ? p0.name : `[${p0.name}]`});\n  },\n`;
      continue;
    }
    if (/@Delete/.test(anns) && p0 && entities[p0cls]) {
      dao += `  async ${name}(${sig}): Promise<void> {\n    return room.delete(${metaFor(p0cls)}, ${p0.type.startsWith('List<') ? p0.name : `[${p0.name}]`});\n  },\n`;
      continue;
    }
    manual.push(`${daoName}.${name}`);
  }
  dao += `};\n`;
}

fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, 'entities.ts'), ent, 'utf8');
fs.writeFileSync(path.join(OUT, 'daos.ts'), dao, 'utf8');
console.log(`сущностей: ${Object.keys(entities).length}; вручную перенести: ${manual.join(', ') || '—'}`);
