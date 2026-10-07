/**
 * Адаптивный цвет ЧУЖОГО пузыря — порт Android ui/messages/AdaptiveBubbleColor.kt.
 *
 * Палитры задают messageBubbleOther светлой пастелью даже в тёмном режиме —
 * на тёмных обоях это давало резкие светлые плашки. Поэтому цвет
 * корректируется при отрисовке по ЭФФЕКТИВНОЙ яркости фона чата:
 *   фон = 70% фона темы + 30% обоев/пресета (как рисует MessagesScreen)
 * Исправляются только явные несовпадения, с сохранением оттенка палитры.
 * Свой пузырь не трогается (фирменный цвет намеренный).
 */
import { useEffect, useMemo, useState } from 'react';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { Skia, AlphaType, ColorType } from '@shopify/react-native-skia';
import { lerpColor } from './wmTheme';
import { luminance } from './color';
import { presetBackgroundFromId } from './gen/presetBackgrounds';
import { useThemeState, useWMTheme } from './themeManager';

/** WallpaperLuminance: средняя яркость картинки обоев (кеш по URI). */
const cache = new Map<string, number>();

async function wallpaperLuminance(uri: string): Promise<number | null> {
  const hit = cache.get(uri);
  if (hit !== undefined) return hit;
  try {
    // Уменьшаем до 16×16 и считаем среднюю яркость — как выборка 16×16 на Android
    const r = await manipulateAsync(uri, [{ resize: { width: 16, height: 16 } }], {
      format: SaveFormat.PNG,
      base64: true,
    });
    if (!r.base64) return null;
    const img = Skia.Image.MakeImageFromEncoded(Skia.Data.fromBase64(r.base64));
    if (!img) return null;
    const px = img.readPixels(0, 0, {
      width: img.width(),
      height: img.height(),
      colorType: ColorType.RGBA_8888,
      alphaType: AlphaType.Unpremul,
    });
    if (!px) return null;
    let sum = 0;
    let n = 0;
    for (let i = 0; i + 2 < px.length; i += 4) {
      const hex = '#' + [px[i], px[i + 1], px[i + 2]].map((v) => Number(v).toString(16).padStart(2, '0')).join('');
      sum += luminance(hex);
      n++;
    }
    if (!n) return null;
    const lum = sum / n;
    cache.set(uri, lum);
    return lum;
  } catch {
    return null;
  }
}

/** rememberEffectiveChatBackgroundLuminance() */
export function useEffectiveChatBackgroundLuminance(): number {
  const theme = useWMTheme();
  const s = useThemeState();
  const [wallLum, setWallLum] = useState<number | null>(null);

  useEffect(() => {
    let alive = true;
    setWallLum(null);
    if (s.backgroundImageUri) void wallpaperLuminance(s.backgroundImageUri).then((l) => alive && setWallLum(l));
    return () => {
      alive = false;
    };
  }, [s.backgroundImageUri]);

  return useMemo(() => {
    const themeLum = luminance(theme.colorScheme.background);
    const preset = presetBackgroundFromId(s.presetBackgroundId);
    const presetLum = preset?.colors.length ? preset.colors.map(luminance).reduce((a, b) => a + b, 0) / preset.colors.length : null;
    const overlay = wallLum ?? presetLum;
    return overlay !== null ? 0.7 * themeLum + 0.3 * overlay : themeLum;
  }, [theme.colorScheme.background, s.presetBackgroundId, wallLum]);
}

/** Чистая функция коррекции (для тестов и не-React кода). */
export function adaptOtherBubbleColor(base: string, effectiveLum: number): string {
  const baseLum = luminance(base);
  if (effectiveLum < 0.35 && baseLum > 0.55) return lerpColor(base, '#1C222C', 0.85);
  if (effectiveLum > 0.65 && baseLum < 0.3) return lerpColor(base, '#F3F5F8', 0.85);
  return base;
}

/** rememberAdaptiveOtherBubbleColor(base) */
export function useAdaptiveOtherBubbleColor(base: string): string {
  const lum = useEffectiveChatBackgroundLuminance();
  return useMemo(() => adaptOtherBubbleColor(base, lum), [base, lum]);
}
