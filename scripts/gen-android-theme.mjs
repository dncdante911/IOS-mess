#!/usr/bin/env node
/**
 * Генератор тем из Android ui/theme.
 *
 *   node scripts/gen-android-theme.mjs [путь к com/worldmates/messenger]
 *
 * Читает:
 *   ui/theme/ThemeVariant.kt      — enum тем (флаги PRO/подписка/prefersDark),
 *                                   getPalette() (цвета + градиент фона)
 *   ui/theme/Colors.kt            — базовые цвета бренда (val X = Color(0x…))
 *   ui/theme/ThemeSettingsScreen.kt — localizedDisplayName/Description →
 *                                   ключи строк (R.string.theme_*)
 * Пишет src/theme/gen/{variants,colors}.ts. Руками не править.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SRC = process.argv[2] ?? 'C:/projects/worldmates/app/src/main/java/com/worldmates/messenger';
const THEME = path.join(SRC, 'ui', 'theme');
const OUT = path.join(ROOT, 'src', 'theme', 'gen');

const strip = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');

/** Color(0xAARRGGBB) / Color(0xRRGGBB) → '#RRGGBB' или '#RRGGBBAA' */
function color(hex) {
  const h = hex.replace(/^0x/i, '').toUpperCase();
  if (h.length === 6) return `#${h}`;
  const a = h.slice(0, 2);
  const rgb = h.slice(2);
  return a === 'FF' ? `#${rgb}` : `#${rgb}${a}`;
}

function matchParen(s, open) {
  let d = 0;
  for (let i = open; i < s.length; i++) {
    if (s[i] === '(') d++;
    else if (s[i] === ')' && --d === 0) return i;
  }
  return -1;
}

// ─── Colors.kt ────────────────────────────────────────────────────────────────
const colorsSrc = strip(fs.readFileSync(path.join(THEME, 'Colors.kt'), 'utf8'));
const baseColors = {};
for (const m of colorsSrc.matchAll(/val\s+(\w+)\s*=\s*Color\((0x[0-9A-Fa-f]+)\)/g)) baseColors[m[1]] = color(m[2]);
const lists = {};
for (const m of colorsSrc.matchAll(/val\s+(\w+)\s*=\s*listOf\(([\s\S]*?)\)\s*(?=val|$)/g)) {
  lists[m[1]] = [...m[2].matchAll(/Color\((0x[0-9A-Fa-f]+)\)/g)].map((x) => color(x[1]));
}

// ─── ThemeVariant enum ────────────────────────────────────────────────────────
const tvSrc = strip(fs.readFileSync(path.join(THEME, 'ThemeVariant.kt'), 'utf8'));
const enumStart = tvSrc.indexOf('enum class ThemeVariant');
const bodyOpen = tvSrc.indexOf('{', tvSrc.indexOf(')', enumStart));
const enumBody = tvSrc.slice(bodyOpen + 1, tvSrc.indexOf('companion object', bodyOpen));
const variants = [];
for (const m of enumBody.matchAll(/([A-Z][A-Z0-9_]+)\s*\(/g)) {
  const open = m.index + m[0].length - 1;
  const args = enumBody.slice(open + 1, matchParen(enumBody, open));
  const str = (k) => args.match(new RegExp(`${k}\\s*=\\s*"([^"]*)"`))?.[1];
  const bool = (k, d) => {
    const v = args.match(new RegExp(`${k}\\s*=\\s*(true|false)`))?.[1];
    return v ? v === 'true' : d;
  };
  variants.push({
    key: m[1],
    displayName: str('displayName'),
    emoji: str('emoji'),
    description: str('description'),
    isPremium: bool('isPremium', false),
    isSubscriptionOnly: bool('isSubscriptionOnly', false),
    prefersDark: bool('prefersDark', true),
  });
}

// ─── getPalette() ─────────────────────────────────────────────────────────────
const palStart = tvSrc.indexOf('fun ThemeVariant.getPalette()');
const palSrc = tvSrc.slice(palStart);
const palettes = {};
for (const m of palSrc.matchAll(/ThemeVariant\.([A-Z0-9_]+)\s*->\s*ThemePalette\(/g)) {
  const open = m.index + m[0].length - 1;
  const args = palSrc.slice(open + 1, matchParen(palSrc, open));
  const c = (k) => {
    const v = args.match(new RegExp(`\\b${k}\\s*=\\s*Color\\((0x[0-9A-Fa-f]+)\\)`))?.[1];
    if (!v) throw new Error(`${m[1]}: нет ${k}`);
    return color(v);
  };
  const g = args.match(/backgroundGradient\s*=\s*Brush\.(linearGradient|verticalGradient)\(/);
  if (!g) throw new Error(`${m[1]}: нет градиента`);
  const gOpen = args.indexOf('(', g.index + g[0].length - 1);
  const gArgs = args.slice(gOpen + 1, matchParen(args, gOpen));
  palettes[m[1]] = {
    primary: c('primary'),
    primaryDark: c('primaryDark'),
    primaryLight: c('primaryLight'),
    secondary: c('secondary'),
    secondaryDark: c('secondaryDark'),
    secondaryLight: c('secondaryLight'),
    messageBubbleOwn: c('messageBubbleOwn'),
    messageBubbleOther: c('messageBubbleOther'),
    accent: c('accent'),
    // linearGradient без start/end в Compose = из левого верхнего угла в правый нижний
    backgroundGradient: {
      type: g[1] === 'verticalGradient' ? 'vertical' : 'diagonal',
      colors: [...gArgs.matchAll(/Color\((0x[0-9A-Fa-f]+)\)/g)].map((x) => color(x[1])),
    },
  };
}

// ─── Локализованные названия ──────────────────────────────────────────────────
// Android-исходники в CRLF — без нормализации граница функции '\n}\n' не находится
const tsSrc = fs.readFileSync(path.join(THEME, 'ThemeSettingsScreen.kt'), 'utf8').replace(/\r\n/g, '\n');
function mapping(fn) {
  const start = tsSrc.indexOf(`fun ThemeVariant.${fn}()`);
  if (start < 0) return {};
  const body = tsSrc.slice(start, tsSrc.indexOf('\n}\n', start));
  return Object.fromEntries([...body.matchAll(/ThemeVariant\.([A-Z0-9_]+)\s*->\s*stringResource\(R\.string\.(\w+)\)/g)].map((x) => [x[1], x[2]]));
}
const nameKeys = mapping('localizedDisplayName');
const descKeys = mapping('localizedDescription');

// ─── PresetBackground (ThemeSettingsScreen.kt) — хранится по id ──────────────
const presets = [];
{
  const start = tsSrc.indexOf('enum class PresetBackground(');
  const open = tsSrc.indexOf('{', tsSrc.indexOf(')', start));
  const body = strip(tsSrc.slice(open + 1, tsSrc.indexOf('companion object', open)));
  for (const m of body.matchAll(/([A-Z][A-Z0-9_]+)\s*\(/g)) {
    const o = m.index + m[0].length - 1;
    const args = body.slice(o + 1, matchParen(body, o));
    presets.push({
      key: m[1],
      id: args.match(/id\s*=\s*"([^"]+)"/)[1],
      nameKey: args.match(/nameResId\s*=\s*R\.string\.(\w+)/)[1],
      colors: [...args.matchAll(/Color\((0x[0-9A-Fa-f]+)\)/g)].map((x) => color(x[1])),
      isDark: !/isDark\s*=\s*false/.test(args),
    });
  }
}

// ─── OneClickInterfacePack (ThemeOneClickPacks.kt) ───────────────────────────
const packs = [];
{
  const src = strip(fs.readFileSync(path.join(THEME, 'ThemeOneClickPacks.kt'), 'utf8'));
  const listStart = src.indexOf('val oneClickPacks = listOf(');
  const body = src.slice(listStart, matchParen(src, src.indexOf('(', listStart)) + 1);
  for (const m of body.matchAll(/OneClickInterfacePack\s*\(/g)) {
    const o = m.index + m[0].length - 1;
    const a = body.slice(o + 1, matchParen(body, o));
    const get = (k) => a.match(new RegExp(`${k}\\s*=\\s*([^,\\n]+)`))?.[1]?.trim();
    const presetKey = get('presetBackgroundId')?.match(/PresetBackground\.(\w+)\.id/)?.[1];
    const preset = presets.find((p) => p.key === presetKey);
    if (!preset) throw new Error(`пак: неизвестный пресет ${presetKey}`);
    packs.push({
      nameKey: get('nameResId').replace('R.string.', ''),
      descKey: get('descResId').replace('R.string.', ''),
      emoji: JSON.parse(get('emoji')),
      themeVariant: get('themeVariant').replace('ThemeVariant.', ''),
      presetBackgroundId: preset.id,
      quickReaction: JSON.parse(get('quickReaction')),
      bubbleStyle: get('bubbleStyle').replace('BubbleStyle.', ''),
      uiStyle: get('uiStyle').replace('UIStyle.', ''),
      isDarkTheme: get('isDarkTheme') === 'true',
      isPremium: get('isPremium') === 'true',
      chatFont: get('chatFont') ? JSON.parse(get('chatFont')) : null,
    });
  }
}

for (const v of variants) {
  if (!palettes[v.key]) throw new Error(`нет палитры для ${v.key}`);
  v.nameKey = nameKeys[v.key] ?? null;
  v.descKey = descKeys[v.key] ?? null;
}

// ─── Запись ───────────────────────────────────────────────────────────────────
fs.mkdirSync(OUT, { recursive: true });
const banner = '// АВТОГЕНЕРАЦИЯ: scripts/gen-android-theme.mjs из Android ui/theme. Руками не править.\n/* eslint-disable */\n';
fs.writeFileSync(
  path.join(OUT, 'colors.ts'),
  `${banner}\n/** ui/theme/Colors.kt */\nexport const AndroidColors = ${JSON.stringify(baseColors, null, 2)} as const;\n\nexport const GroupAvatarColors: readonly string[] = ${JSON.stringify(lists.GroupAvatarColors ?? [])};\nexport const ShimmerColorShades: readonly string[] = ${JSON.stringify(lists.ShimmerColorShades ?? [])};\n`,
  'utf8',
);
fs.writeFileSync(
  path.join(OUT, 'variants.ts'),
  `${banner}import type { ThemePalette, ThemeVariantMeta } from '../types';\n\n` +
    `export const THEME_VARIANT_KEYS = ${JSON.stringify(variants.map((v) => v.key))} as const;\n` +
    `export type ThemeVariant = (typeof THEME_VARIANT_KEYS)[number];\n\n` +
    `/** enum class ThemeVariant (порядок = ordinal, как на Android) */\n` +
    `export const THEME_VARIANTS: Record<ThemeVariant, ThemeVariantMeta> = ${JSON.stringify(Object.fromEntries(variants.map((v, i) => [v.key, { ...v, ordinal: i }])), null, 2)};\n\n` +
    `/** ThemeVariant.getPalette() */\n` +
    `export const THEME_PALETTES: Record<ThemeVariant, ThemePalette> = ${JSON.stringify(palettes, null, 2)};\n`,
  'utf8',
);
fs.writeFileSync(
  path.join(OUT, 'presetBackgrounds.ts'),
  `${banner}\nexport interface PresetBackground {\n  key: string;\n  /** хранится и синхронизируется по id */\n  id: string;\n  nameKey: string;\n  /** рисуется Brush.verticalGradient(colors) + чёрный оверлей 8% */\n  colors: string[];\n  isDark: boolean;\n}\n\n/** enum class PresetBackground (ThemeSettingsScreen.kt) */\nexport const PRESET_BACKGROUNDS: PresetBackground[] = ${JSON.stringify(presets, null, 2)};\n\nexport function presetBackgroundFromId(id: string | null | undefined): PresetBackground | null {\n  return PRESET_BACKGROUNDS.find((p) => p.id === id) ?? null;\n}\n`,
  'utf8',
);
fs.writeFileSync(
  path.join(OUT, 'oneClickPacks.ts'),
  `${banner}import type { ThemeVariant } from './variants';\nimport type { BubbleStyle, UIStyle } from '../../preferences/uiStyle';\n\nexport interface OneClickInterfacePack {\n  nameKey: string;\n  descKey: string;\n  emoji: string;\n  themeVariant: ThemeVariant;\n  presetBackgroundId: string;\n  quickReaction: string;\n  bubbleStyle: BubbleStyle;\n  uiStyle: UIStyle;\n  isDarkTheme: boolean;\n  isPremium: boolean;\n  chatFont: string | null;\n}\n\n/** val oneClickPacks (ThemeOneClickPacks.kt) */\nexport const ONE_CLICK_PACKS: OneClickInterfacePack[] = ${JSON.stringify(packs, null, 2)};\n`,
  'utf8',
);
console.log(`пресетов фона: ${presets.length}, паков: ${packs.length}`);
console.log(`тем: ${variants.length}, базовых цветов: ${Object.keys(baseColors).length}, без локализации названия: ${variants.filter((v) => !v.nameKey).map((v) => v.key).join(', ') || '—'}`);
