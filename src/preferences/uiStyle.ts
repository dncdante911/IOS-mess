/**
 * Настройки стиля интерфейса — порты Android ui/preferences:
 *   UIStylePreferences.kt  — стиль списка, пузырей, быстрая реакция, вид
 *                            каналов, шрифт чата, загруженные шрифты, онбординг
 *   BubbleStyle.kt         — 20 стилей пузырей (порядок = ordinal, как Android)
 *   AppModePreferences.kt  — полный / облегчённый (Lite) режим главного экрана
 */
import { create } from 'zustand';
import { kv } from '../core/platform/kv';

export type UIStyle = 'WORLDMATES' | 'TELEGRAM';
export type ChannelViewStyle = 'CLASSIC' | 'PREMIUM';
export type AppMode = 'FULL' | 'LITE';

/**
 * enum class BubbleStyle — порядок важен (на Android хранится ordinal).
 * Ключи названий — как на экране настроек (BubbleStyle.localizedDisplayName/Description).
 */
export const BUBBLE_STYLES = [
  { key: 'STANDARD', nameKey: 'bubble_standard', descKey: 'bubble_standard_desc', icon: '🗨️' },
  { key: 'COMIC', nameKey: 'bubble_comic', descKey: 'bubble_comic_desc', icon: '🗯️' },
  { key: 'TELEGRAM', nameKey: 'bubble_classic_name', descKey: 'bubble_classic_desc', icon: '▬' },
  { key: 'MINIMAL', nameKey: 'bubble_minimal', descKey: 'bubble_minimal_desc', icon: '⚪' },
  { key: 'MODERN', nameKey: 'bubble_modern', descKey: 'bubble_modern_desc', icon: '🪩' },
  { key: 'RETRO', nameKey: 'bubble_retro', descKey: 'bubble_retro_desc', icon: '🟧' },
  { key: 'GLASS', nameKey: 'bubble_glass', descKey: 'bubble_glass_desc', icon: '💠' },
  { key: 'NEON', nameKey: 'bubble_neon', descKey: 'bubble_neon_desc', icon: '🔵' },
  { key: 'GRADIENT', nameKey: 'bubble_gradient', descKey: 'bubble_gradient_desc', icon: '🎆' },
  { key: 'NEUMORPHISM', nameKey: 'bubble_neumorphism', descKey: 'bubble_neumorphism_desc', icon: '⬜' },
  { key: 'SOFT', nameKey: 'bubble_soft', descKey: 'bubble_soft_desc', icon: '🫧' },
  { key: 'OUTLINED', nameKey: 'bubble_outlined', descKey: 'bubble_outlined_desc', icon: '◻️' },
  { key: 'PULSE', nameKey: 'bubble_pulse', descKey: 'bubble_pulse_desc', icon: '💫' },
  { key: 'SHIMMER', nameKey: 'bubble_shimmer', descKey: 'bubble_shimmer_desc', icon: '✨' },
  { key: 'WAVE', nameKey: 'bs_wave_name', descKey: 'bs_wave_desc', icon: '🌊' },
  { key: 'BOLD', nameKey: 'bs_bold_name', descKey: 'bs_bold_desc', icon: '🔲' },
  { key: 'NOTE', nameKey: 'bs_note_name', descKey: 'bs_note_desc', icon: '📝' },
  { key: 'FOLDED', nameKey: 'bs_folded_name', descKey: 'bs_folded_desc', icon: '📄' },
  { key: 'GUM', nameKey: 'bs_gum_name', descKey: 'bs_gum_desc', icon: '🍬' },
  { key: 'IOS_PILL', nameKey: 'bs_ios_pill_name', descKey: 'bs_ios_pill_desc', icon: '💊' },
] as const;
export type BubbleStyle = (typeof BUBBLE_STYLES)[number]['key'];

export function bubbleStyleFromName(name: string | null | undefined): BubbleStyle {
  return (BUBBLE_STYLES.find((b) => b.key === name)?.key ?? 'STANDARD') as BubbleStyle;
}

/** Загруженный пользователем шрифт чата: id = "custom:<url>". */
export interface CustomChatFont {
  id: string;
  label: string;
  url: string;
}

interface UIStyleState {
  style: UIStyle;
  bubbleStyle: BubbleStyle;
  quickReaction: string;
  channelViewStyle: ChannelViewStyle;
  /** ключ из ChatFontCatalog или "custom:<url>" */
  chatFont: string;
  customFonts: CustomChatFont[];
  appMode: AppMode;
}

const K = {
  style: 'ui_style',
  bubble: 'bubble_style',
  reaction: 'quick_reaction',
  onboarding: 'ui_onboarding_seen',
  channelView: 'channel_view_style',
  chatFont: 'chat_font',
  customFonts: 'custom_chat_fonts',
  appMode: 'app_mode',
} as const;

const pick = <T extends string>(v: string | null, allowed: readonly T[], d: T): T =>
  (allowed as readonly string[]).includes(v ?? '') ? (v as T) : d;

export const useUIStyle = create<UIStyleState>(() => ({
  style: 'WORLDMATES',
  bubbleStyle: 'STANDARD',
  quickReaction: '❤️',
  channelViewStyle: 'CLASSIC',
  chatFont: 'default',
  customFonts: [],
  appMode: 'FULL',
}));

export const UIStylePreferences = {
  /** После hydrateKv() (WMApplication.onCreate). */
  init(): void {
    useUIStyle.setState({
      style: pick<UIStyle>(kv.getItem(K.style), ['WORLDMATES', 'TELEGRAM'], 'WORLDMATES'),
      bubbleStyle: bubbleStyleFromName(kv.getItem(K.bubble)),
      quickReaction: kv.getItem(K.reaction) ?? '❤️',
      channelViewStyle: pick<ChannelViewStyle>(kv.getItem(K.channelView), ['CLASSIC', 'PREMIUM'], 'CLASSIC'),
      chatFont: kv.getItem(K.chatFont) ?? 'default',
      customFonts: kv.getJson<CustomChatFont[]>(K.customFonts, []),
      appMode: pick<AppMode>(kv.getItem(K.appMode), ['FULL', 'LITE'], 'FULL'),
    });
  },
  setStyle(style: UIStyle): void {
    useUIStyle.setState({ style });
    kv.setItem(K.style, style);
  },
  getStyle: () => useUIStyle.getState().style,
  setBubbleStyle(bubbleStyle: BubbleStyle): void {
    useUIStyle.setState({ bubbleStyle });
    kv.setItem(K.bubble, bubbleStyle);
  },
  getBubbleStyle: () => useUIStyle.getState().bubbleStyle,
  setQuickReaction(emoji: string): void {
    useUIStyle.setState({ quickReaction: emoji });
    kv.setItem(K.reaction, emoji);
  },
  getQuickReaction: () => useUIStyle.getState().quickReaction,
  setChannelViewStyle(channelViewStyle: ChannelViewStyle): void {
    useUIStyle.setState({ channelViewStyle });
    kv.setItem(K.channelView, channelViewStyle);
  },
  getChannelViewStyle: () => useUIStyle.getState().channelViewStyle,
  hasSeenOnboarding: () => kv.getItem(K.onboarding) === 'true',
  markOnboardingSeen: () => kv.setItem(K.onboarding, 'true'),
  setChatFont(key: string): void {
    useUIStyle.setState({ chatFont: key });
    kv.setItem(K.chatFont, key);
  },
  getChatFont: () => useUIStyle.getState().chatFont,
  /** Зарегистрировать загруженный шрифт; возвращает id "custom:<url>". */
  addCustomFont(label: string, url: string): string {
    const id = `custom:${url}`;
    const cur = useUIStyle.getState().customFonts;
    if (!cur.some((f) => f.id === id)) {
      const next = [...cur, { id, label, url }];
      useUIStyle.setState({ customFonts: next });
      kv.setJson(K.customFonts, next);
    }
    return id;
  },
  removeCustomFont(id: string): void {
    const next = useUIStyle.getState().customFonts.filter((f) => f.id !== id);
    useUIStyle.setState({ customFonts: next });
    kv.setJson(K.customFonts, next);
    if (useUIStyle.getState().chatFont === id) UIStylePreferences.setChatFont('default');
  },
};

/** AppModePreferences.kt */
export const AppModePreferences = {
  setMode(appMode: AppMode): void {
    useUIStyle.setState({ appMode });
    kv.setItem(K.appMode, appMode);
  },
  isLite: () => useUIStyle.getState().appMode === 'LITE',
};
