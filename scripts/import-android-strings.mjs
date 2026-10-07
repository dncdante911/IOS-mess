#!/usr/bin/env node
/**
 * Импорт строк локализации из Android в iOS.
 *
 *   node scripts/import-android-strings.mjs [путь к android app/src/main/res]
 *
 * По умолчанию берёт C:/projects/worldmates/app/src/main/res.
 * Пишет src/i18n/generated/{en,ru,uk}.ts — эти файлы НЕ правятся руками,
 * их перегенерирует этот скрипт после каждого обновления Android.
 *
 * Ключи остаются ТЕМИ ЖЕ, что в strings.xml — поэтому код, перенесённый с
 * Android, вызывает t('<тот же ключ>') и перевод совпадает 1:1.
 *
 * Преобразования:
 *   %1$s / %1$d / %2$.1f  → {1} / {2}     (позиционные)
 *   %s / %d (без номера)  → {1}, {2}, … по порядку
 *   %%                    → %
 *   \' \" \n \t \@ \?      → снятие экранирования Android
 *   &amp; &lt; &gt; &quot; &apos; → символы
 *   <xliff:g …>x</xliff:g> → x
 *   <plurals name="k">    → k_one / k_few / k_many / k_other (+ k_zero, k_two)
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const RES = process.argv[2] ?? 'C:/projects/worldmates/app/src/main/res';
const OUT_DIR = path.join(ROOT, 'src', 'i18n', 'generated');

const LOCALES = { en: 'values', ru: 'values-ru', uk: 'values-uk' };

function decodeEntities(s) {
  return s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&amp;/g, '&');
}

function convertValue(raw) {
  let s = raw.trim();
  // CDATA
  s = s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1');
  // xliff
  s = s.replace(/<xliff:g[^>]*>([\s\S]*?)<\/xliff:g>/g, '$1');
  // Целиком в кавычках — Android снимает их
  if (s.length >= 2 && s.startsWith('"') && s.endsWith('"')) s = s.slice(1, -1);
  s = decodeEntities(s);

  // Плейсхолдеры: сначала позиционные, потом последовательные
  let seq = 0;
  s = s.replace(/%%|%(\d+)\$[-#+ 0,(]*\d*(?:\.\d+)?[sdfxXc]|%[-#+ 0,(]*\d*(?:\.\d+)?[sdfxXc]/g, (m, pos) => {
    if (m === '%%') return '\u0000PCT\u0000';
    if (pos) return `{${pos}}`;
    seq += 1;
    return `{${seq}}`;
  });
  s = s.replace(/\u0000PCT\u0000/g, '%');

  // Экранирование Android
  s = s
    .replace(/\\n/g, '\n')
    .replace(/\\t/g, '\t')
    .replace(/\\'/g, "'")
    .replace(/\\"/g, '"')
    .replace(/\\@/g, '@')
    .replace(/\\\?/g, '?')
    .replace(/\\\\/g, '\\');
  return s;
}

function parseStringsXml(file) {
  const xml = fs.readFileSync(file, 'utf8').replace(/<!--[\s\S]*?-->/g, '');
  const out = {};

  const strRe = /<string\s+name="([^"]+)"([^>]*)>([\s\S]*?)<\/string>/g;
  let m;
  while ((m = strRe.exec(xml))) {
    const [, name, attrs, body] = m;
    if (/translatable="false"/.test(attrs) && file.includes(`${path.sep}values-`)) continue;
    out[name] = convertValue(body);
  }
  // <string name="x"/> — пустые
  const emptyRe = /<string\s+name="([^"]+)"[^>]*\/>/g;
  while ((m = emptyRe.exec(xml))) out[m[1]] = '';

  const plRe = /<plurals\s+name="([^"]+)"[^>]*>([\s\S]*?)<\/plurals>/g;
  while ((m = plRe.exec(xml))) {
    const [, name, body] = m;
    const itemRe = /<item\s+quantity="([a-z]+)"\s*>([\s\S]*?)<\/item>/g;
    let im;
    while ((im = itemRe.exec(body))) out[`${name}_${im[1]}`] = convertValue(im[2]);
  }
  return out;
}

function toTs(dict, locale) {
  const keys = Object.keys(dict).sort();
  const lines = keys.map((k) => `  ${JSON.stringify(k)}: ${JSON.stringify(dict[k])},`);
  return (
    `// АВТОГЕНЕРАЦИЯ: scripts/import-android-strings.mjs из Android res/${LOCALES[locale]}/strings.xml\n` +
    `// Руками НЕ править — правки делать в Android, затем перезапустить скрипт.\n` +
    `/* eslint-disable */\n` +
    `const ${locale} = {\n${lines.join('\n')}\n} as const;\n\nexport default ${locale};\n`
  );
}

fs.mkdirSync(OUT_DIR, { recursive: true });
const result = {};
for (const [locale, dir] of Object.entries(LOCALES)) {
  const file = path.join(RES, dir, 'strings.xml');
  result[locale] = parseStringsXml(file);
}

// Ключи, которых нет в en (база), но есть в переводах — тоже оставляем; а
// недостающие переводы просто падают на en в рантайме.
for (const locale of Object.keys(LOCALES)) {
  fs.writeFileSync(path.join(OUT_DIR, `${locale}.ts`), toTs(result[locale], locale), 'utf8');
}

const en = Object.keys(result.en);
for (const locale of ['ru', 'uk']) {
  const missing = en.filter((k) => !(k in result[locale]));
  console.log(`${locale}: ${Object.keys(result[locale]).length} ключей, без перевода: ${missing.length}`);
  if (missing.length) console.log('  напр.:', missing.slice(0, 10).join(', '));
}
console.log(`en: ${en.length} ключей → ${path.relative(ROOT, OUT_DIR)}`);
