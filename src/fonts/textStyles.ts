/**
 * Декоративные стили текста — порт Android ui/fonts/FontStyle.kt +
 * FontStyleConverter.kt. 34 стиля на комбинируемых знаках Unicode: работают
 * для любого алфавита (кириллица, латиница, цифры), т.к. знак добавляется
 * после каждого непробельного символа. Порядок = ordinal Android.
 */

const M = (...cps: number[]) => cps.map((c) => String.fromCharCode(c)).join('');

/** key → комбинируемые знаки (FontStyleConverter.convert) */
const MARKS: Record<string, string> = {
  NORMAL: '',
  STRIKETHROUGH: M(0x0336),
  UNDERLINE: M(0x0332),
  DOUBLE_UNDERLINE: M(0x0333),
  OVERLINE: M(0x0305),
  DOUBLE_OVERLINE: M(0x033f),
  WAVY: M(0x0330),
  SLASH: M(0x0338),
  TILDE_OVERLAY: M(0x0334),
  DOTTED: M(0x0307),
  DIAERESIS: M(0x0308),
  RING_ABOVE: M(0x030a),
  DOT_BELOW: M(0x0323),
  RING_BELOW: M(0x0325),
  GRAVE: M(0x0300),
  ACUTE: M(0x0301),
  CIRCUMFLEX: M(0x0302),
  MACRON: M(0x0304),
  BREVE: M(0x0306),
  CARON: M(0x030c),
  ARROW_ABOVE: M(0x20d7),
  OVERLINE_UNDERLINE: M(0x0305, 0x0332),
  WAVY_STRIKETHROUGH: M(0x0334, 0x0336),
  DIAERESIS_OVERLINE: M(0x0308, 0x0305),
  DOTTED_STRIKETHROUGH: M(0x0307, 0x0336),
  DOUBLE_UNDERLINE_OVERLINE: M(0x0333, 0x0305),
  DIAERESIS_STRIKETHROUGH: M(0x0308, 0x0336),
  OVERLINE_STRIKETHROUGH_UNDERLINE: M(0x0305, 0x0336, 0x0332),
  DOTTED_UNDERLINE: M(0x0307, 0x0332),
  GRAVE_UNDERLINE: M(0x0300, 0x0332),
  DIAERESIS_UNDERLINE: M(0x0308, 0x0332),
  MACRON_UNDERLINE: M(0x0304, 0x0332),
  CARON_STRIKETHROUGH: M(0x030c, 0x0336),
  ACUTE_OVERLINE: M(0x0301, 0x0305),
};

/** Ключ строки названия (R.string.fs_*). У OVERLINE_STRIKETHROUGH_UNDERLINE — fs_full_frame. */
function nameKey(key: string): string {
  return key === 'OVERLINE_STRIKETHROUGH_UNDERLINE' ? 'fs_full_frame' : `fs_${key.toLowerCase()}`;
}

export type TextDecorStyle = keyof typeof MARKS;

export interface TextDecorEntry {
  key: TextDecorStyle;
  nameKey: string;
  /** превью: «П» со знаками (emoji в Android; у NORMAL — ✏️) */
  emoji: string;
  /** образец «Привіт» — одинаков во всех локалях, как на Android */
  sampleText: string;
}

/** Совпадает с FontStyleConverter.addMark: знак после каждого непробельного код-пойнта. */
export function convertTextStyle(text: string, style: TextDecorStyle): string {
  const marks = MARKS[style];
  if (!marks) return text;
  let out = '';
  for (const ch of text) {
    out += ch;
    if (!/\s/u.test(ch)) out += marks;
  }
  return out;
}

export const TEXT_DECOR_STYLES: TextDecorEntry[] = (Object.keys(MARKS) as TextDecorStyle[]).map((key) => ({
  key,
  nameKey: nameKey(key),
  emoji: key === 'NORMAL' ? '✏️' : convertTextStyle('П', key),
  sampleText: convertTextStyle('Привіт', key),
}));
