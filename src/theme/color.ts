/**
 * Цветовые утилиты Compose: Color.luminance() (относительная яркость W3C,
 * с линеаризацией sRGB — ровно как androidx.compose.ui.graphics.luminance()).
 */
function channel(c: number): number {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

export function luminance(hex: string): number {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/** Плотность Android-экрана, под которую рисовались px-значения Canvas (xxhdpi). */
export const ANDROID_REFERENCE_DENSITY = 3;

/**
 * android.graphics.Color.parseColor для строк с сервера: «#RRGGBB» → как есть,
 * «#AARRGGBB» → RN-формат «#RRGGBBAA». Иначе — null (вызывающий берёт fallback,
 * как catch в Kotlin).
 */
export function parseAndroidColor(s: string | null | undefined): string | null {
  if (!s) return null;
  const m = /^#([0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.exec(s.trim());
  if (!m) return null;
  const h = m[1];
  return h.length === 6 ? `#${h}` : `#${h.slice(2)}${h.slice(0, 2)}`;
}
