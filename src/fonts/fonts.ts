/**
 * Шрифты — порты Android ui/fonts:
 *   ChatFontCatalog.kt  — шрифт текста сообщений (25 вариантов, ключи как у
 *                         Windows fontCatalog.ts — 'dancing' = Dancing Script
 *                         на любой платформе)
 *   AppFonts.kt         — фирменные display-шрифты (Exo 2, Russo One,
 *                         Righteous, Orbitron)
 *   CustomFontLoader.kt — загруженный пользователем шрифт по URL CDN
 *   SenderFontCache.kt  — «твой шрифт видят и другие»: шрифт отправителя
 *                         из /api/node/theme/public-font
 *
 * Android качает шрифты через Google Play Services по запросу; на iOS такого
 * провайдера нет — TTF лежат в @expo-google-fonts (в бандл попадает только
 * нужное начертание: 400, у Exo 2 ещё 700, у Orbitron 700 — как в res/font).
 * Загружаются лениво при первом использовании.
 */
import { useEffect, useState } from 'react';
import * as Font from 'expo-font';
import { create } from 'zustand';
import { ThemeProfileRepository } from '../theme/themeManager';

export interface ChatFontEntry {
  key: string;
  /** '' для default — подпись берётся из строки font_default */
  label: string;
  /** имя семейства после загрузки (fontFamily в стилях RN) */
  family: string | null;
  source: number | null;
}

/* eslint-disable @typescript-eslint/no-require-imports */
const F = (family: string, source: number): Pick<ChatFontEntry, 'family' | 'source'> => ({ family, source });

/** ChatFontCatalog.ENTRIES — порядок как на Android. */
export const CHAT_FONTS: ChatFontEntry[] = [
  { key: 'default', label: '', family: null, source: null },
  { key: 'exo2', label: 'Exo 2', ...F('WM-Exo2', require('@expo-google-fonts/exo-2/400Regular/Exo2_400Regular.ttf')) },
  { key: 'russo', label: 'Russo One', ...F('WM-RussoOne', require('@expo-google-fonts/russo-one/400Regular/RussoOne_400Regular.ttf')) },
  { key: 'righteous', label: 'Righteous', ...F('WM-Righteous', require('@expo-google-fonts/righteous/400Regular/Righteous_400Regular.ttf')) },
  { key: 'orbitron', label: 'Orbitron', ...F('WM-Orbitron', require('@expo-google-fonts/orbitron/700Bold/Orbitron_700Bold.ttf')) },
  { key: 'inter', label: 'Inter', ...F('WM-Inter', require('@expo-google-fonts/inter/400Regular/Inter_400Regular.ttf')) },
  { key: 'nunito', label: 'Nunito', ...F('WM-Nunito', require('@expo-google-fonts/nunito/400Regular/Nunito_400Regular.ttf')) },
  { key: 'montserrat', label: 'Montserrat', ...F('WM-Montserrat', require('@expo-google-fonts/montserrat/400Regular/Montserrat_400Regular.ttf')) },
  { key: 'raleway', label: 'Raleway', ...F('WM-Raleway', require('@expo-google-fonts/raleway/400Regular/Raleway_400Regular.ttf')) },
  { key: 'ubuntu', label: 'Ubuntu', ...F('WM-Ubuntu', require('@expo-google-fonts/ubuntu/400Regular/Ubuntu_400Regular.ttf')) },
  { key: 'opensans', label: 'Open Sans', ...F('WM-OpenSans', require('@expo-google-fonts/open-sans/400Regular/OpenSans_400Regular.ttf')) },
  { key: 'roboto', label: 'Roboto', ...F('WM-Roboto', require('@expo-google-fonts/roboto/400Regular/Roboto_400Regular.ttf')) },
  { key: 'comfortaa', label: 'Comfortaa', ...F('WM-Comfortaa', require('@expo-google-fonts/comfortaa/400Regular/Comfortaa_400Regular.ttf')) },
  { key: 'jost', label: 'Jost', ...F('WM-Jost', require('@expo-google-fonts/jost/400Regular/Jost_400Regular.ttf')) },
  { key: 'ptsans', label: 'PT Sans', ...F('WM-PTSans', require('@expo-google-fonts/pt-sans/400Regular/PTSans_400Regular.ttf')) },
  { key: 'poppins', label: 'Poppins', ...F('WM-Poppins', require('@expo-google-fonts/poppins/400Regular/Poppins_400Regular.ttf')) },
  { key: 'lato', label: 'Lato', ...F('WM-Lato', require('@expo-google-fonts/lato/400Regular/Lato_400Regular.ttf')) },
  { key: 'playfair', label: 'Playfair Display', ...F('WM-Playfair', require('@expo-google-fonts/playfair-display/400Regular/PlayfairDisplay_400Regular.ttf')) },
  { key: 'merriweather', label: 'Merriweather', ...F('WM-Merriweather', require('@expo-google-fonts/merriweather/400Regular/Merriweather_400Regular.ttf')) },
  { key: 'oswald', label: 'Oswald', ...F('WM-Oswald', require('@expo-google-fonts/oswald/400Regular/Oswald_400Regular.ttf')) },
  { key: 'quicksand', label: 'Quicksand', ...F('WM-Quicksand', require('@expo-google-fonts/quicksand/400Regular/Quicksand_400Regular.ttf')) },
  { key: 'josefin', label: 'Josefin Sans', ...F('WM-JosefinSans', require('@expo-google-fonts/josefin-sans/400Regular/JosefinSans_400Regular.ttf')) },
  { key: 'dancing', label: 'Dancing Script', ...F('WM-DancingScript', require('@expo-google-fonts/dancing-script/400Regular/DancingScript_400Regular.ttf')) },
  { key: 'pacifico', label: 'Pacifico', ...F('WM-Pacifico', require('@expo-google-fonts/pacifico/400Regular/Pacifico_400Regular.ttf')) },
  { key: 'spacemono', label: 'Space Mono', ...F('WM-SpaceMono', require('@expo-google-fonts/space-mono/400Regular/SpaceMono_400Regular.ttf')) },
];

/** AppFonts — фирменные display-шрифты (Exo 2 400/700, Russo One, Righteous, Orbitron 700). */
const APP_FONT_SOURCES: Record<string, number> = {
  'WM-Exo2': require('@expo-google-fonts/exo-2/400Regular/Exo2_400Regular.ttf'),
  'WM-Exo2-Bold': require('@expo-google-fonts/exo-2/700Bold/Exo2_700Bold.ttf'),
  'WM-RussoOne': require('@expo-google-fonts/russo-one/400Regular/RussoOne_400Regular.ttf'),
  'WM-Righteous': require('@expo-google-fonts/righteous/400Regular/Righteous_400Regular.ttf'),
  'WM-Orbitron': require('@expo-google-fonts/orbitron/700Bold/Orbitron_700Bold.ttf'),
};
/* eslint-enable @typescript-eslint/no-require-imports */

/**
 * Имена семейств фирменных шрифтов. iOS не синтезирует жирное начертание
 * для кастомного шрифта по fontWeight, поэтому у Exo 2 отдельное семейство
 * для Bold (на Android — FontFamily с двумя Font).
 */
export const AppFonts = {
  Exo2: 'WM-Exo2',
  Exo2Bold: 'WM-Exo2-Bold',
  RussoOne: 'WM-RussoOne',
  Righteous: 'WM-Righteous',
  Orbitron: 'WM-Orbitron',
} as const;

/** Загрузить фирменные шрифты (небольшие — при старте, как lazy на Android). */
export async function loadAppFonts(): Promise<void> {
  try {
    await Font.loadAsync(APP_FONT_SOURCES);
  } catch (e) {
    console.warn('[Fonts] фирменные шрифты не загрузились — системный fallback:', e);
  }
}

// ─── Ленивая загрузка ─────────────────────────────────────────────────────────
const byKey = new Map(CHAT_FONTS.map((f) => [f.key, f]));
const loading = new Map<string, Promise<string | null>>();

export function chatFontLabel(key: string): string | null {
  return byKey.get(key)?.label ?? null;
}

/** Встроенный шрифт → имя семейства (null для default/неизвестного). */
export function loadBuiltinFont(key: string): Promise<string | null> {
  const e = byKey.get(key);
  if (!e?.family || e.source === null) return Promise.resolve(null);
  if (Font.isLoaded(e.family)) return Promise.resolve(e.family);
  let p = loading.get(key);
  if (!p) {
    p = Font.loadAsync({ [e.family]: e.source })
      .then(() => e.family)
      .catch(() => null);
    loading.set(key, p);
  }
  return p;
}

/**
 * CustomFontLoader: шрифт по URL CDN. expo-font скачивает и кеширует файл
 * сам; имя семейства — стабильный хеш URL. null при любой ошибке.
 */
export function loadCustomFont(url: string): Promise<string | null> {
  let h = 0;
  for (let i = 0; i < url.length; i++) h = (h * 31 + url.charCodeAt(i)) | 0;
  const family = `WM-Custom-${(h >>> 0).toString(36)}`;
  if (Font.isLoaded(family)) return Promise.resolve(family);
  let p = loading.get(family);
  if (!p) {
    p = Font.loadAsync({ [family]: { uri: url } })
      .then(() => family)
      .catch(() => {
        loading.delete(family);
        return null;
      });
    loading.set(family, p);
  }
  return p;
}

/** Ключ шрифта ('default' | встроенный | 'custom:<url>') → имя семейства. */
export function loadChatFont(key: string | null | undefined): Promise<string | null> {
  if (!key || key === 'default') return Promise.resolve(null);
  if (key.startsWith('custom:')) return loadCustomFont(key.slice('custom:'.length));
  return loadBuiltinFont(key);
}

/** rememberChatFontFamily(key): fontFamily для стиля или undefined (системный). */
export function useChatFontFamily(key: string | null | undefined): string | undefined {
  const [family, setFamily] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    void loadChatFont(key).then((f) => alive && setFamily(f));
    return () => {
      alive = false;
    };
  }, [key]);
  return family ?? undefined;
}

// ─── SenderFontCache ──────────────────────────────────────────────────────────
const useSenderFonts = create<Record<number, string | null>>(() => ({}));
const inFlight = new Set<number>();

/** rememberSenderFontKey(userId): ключ «фирменного» шрифта отправителя. */
export function useSenderFontKey(userId: number | null | undefined): string | null {
  const resolved = useSenderFonts((s) => (userId ? s[userId] : undefined));
  useEffect(() => {
    if (!userId || userId <= 0) return;
    if (userId in useSenderFonts.getState() || inFlight.has(userId)) return;
    inFlight.add(userId);
    void ThemeProfileRepository.getPublicFont(userId).then((font) => {
      useSenderFonts.setState({ [userId]: font });
      inFlight.delete(userId);
    });
  }, [userId]);
  return resolved ?? null;
}

/** rememberSenderFontFamily(senderUserId) */
export function useSenderFontFamily(userId: number | null | undefined): string | undefined {
  return useChatFontFamily(useSenderFontKey(userId));
}
