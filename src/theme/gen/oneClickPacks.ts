// АВТОГЕНЕРАЦИЯ: scripts/gen-android-theme.mjs из Android ui/theme. Руками не править.
/* eslint-disable */
import type { ThemeVariant } from './variants';
import type { BubbleStyle, UIStyle } from '../../preferences/uiStyle';

export interface OneClickInterfacePack {
  nameKey: string;
  descKey: string;
  emoji: string;
  themeVariant: ThemeVariant;
  presetBackgroundId: string;
  quickReaction: string;
  bubbleStyle: BubbleStyle;
  uiStyle: UIStyle;
  isDarkTheme: boolean;
  isPremium: boolean;
  chatFont: string | null;
}

/** val oneClickPacks (ThemeOneClickPacks.kt) */
export const ONE_CLICK_PACKS: OneClickInterfacePack[] = [
  {
    "nameKey": "pack_classic_name",
    "descKey": "pack_classic_desc",
    "emoji": "💙",
    "themeVariant": "CLASSIC",
    "presetBackgroundId": "midnight",
    "quickReaction": "👍",
    "bubbleStyle": "TELEGRAM",
    "uiStyle": "TELEGRAM",
    "isDarkTheme": false,
    "isPremium": false,
    "chatFont": null
  },
  {
    "nameKey": "pack_nord_name",
    "descKey": "pack_nord_desc",
    "emoji": "❄️",
    "themeVariant": "NORD",
    "presetBackgroundId": "winter",
    "quickReaction": "💯",
    "bubbleStyle": "NEUMORPHISM",
    "uiStyle": "TELEGRAM",
    "isDarkTheme": true,
    "isPremium": false,
    "chatFont": null
  },
  {
    "nameKey": "pack_night_focus_name",
    "descKey": "pack_night_focus_desc",
    "emoji": "🌙",
    "themeVariant": "OCEAN",
    "presetBackgroundId": "aurora",
    "quickReaction": "❤️",
    "bubbleStyle": "GLASS",
    "uiStyle": "WORLDMATES",
    "isDarkTheme": true,
    "isPremium": false,
    "chatFont": null
  },
  {
    "nameKey": "pack_neon_creator_name",
    "descKey": "pack_neon_creator_desc",
    "emoji": "⚡",
    "themeVariant": "DRACULA",
    "presetBackgroundId": "cosmic",
    "quickReaction": "🔥",
    "bubbleStyle": "NEON",
    "uiStyle": "WORLDMATES",
    "isDarkTheme": true,
    "isPremium": false,
    "chatFont": null
  },
  {
    "nameKey": "pack_violet_name",
    "descKey": "pack_violet_desc",
    "emoji": "💜",
    "themeVariant": "PURPLE",
    "presetBackgroundId": "lavender",
    "quickReaction": "✨",
    "bubbleStyle": "MODERN",
    "uiStyle": "WORLDMATES",
    "isDarkTheme": false,
    "isPremium": false,
    "chatFont": null
  },
  {
    "nameKey": "pack_business_name",
    "descKey": "pack_business_desc",
    "emoji": "💼",
    "themeVariant": "MONOCHROME",
    "presetBackgroundId": "morning_mist",
    "quickReaction": "👍",
    "bubbleStyle": "MINIMAL",
    "uiStyle": "TELEGRAM",
    "isDarkTheme": false,
    "isPremium": false,
    "chatFont": null
  },
  {
    "nameKey": "pack_spring_name",
    "descKey": "pack_spring_desc",
    "emoji": "🌸",
    "themeVariant": "MATERIAL_YOU",
    "presetBackgroundId": "spring",
    "quickReaction": "😊",
    "bubbleStyle": "SOFT",
    "uiStyle": "WORLDMATES",
    "isDarkTheme": false,
    "isPremium": false,
    "chatFont": null
  },
  {
    "nameKey": "pack_stranger_name",
    "descKey": "pack_stranger_desc",
    "emoji": "🔴",
    "themeVariant": "STRANGER_THINGS",
    "presetBackgroundId": "deep_plum",
    "quickReaction": "😱",
    "bubbleStyle": "NEON",
    "uiStyle": "WORLDMATES",
    "isDarkTheme": true,
    "isPremium": true,
    "chatFont": null
  },
  {
    "nameKey": "pack_lotr_name",
    "descKey": "pack_lotr_desc",
    "emoji": "💍",
    "themeVariant": "LORD_OF_THE_RINGS",
    "presetBackgroundId": "sand_dunes",
    "quickReaction": "🧙",
    "bubbleStyle": "OUTLINED",
    "uiStyle": "WORLDMATES",
    "isDarkTheme": true,
    "isPremium": true,
    "chatFont": null
  },
  {
    "nameKey": "pack_deep_focus_name",
    "descKey": "pack_deep_focus_desc",
    "emoji": "🌌",
    "themeVariant": "INDIGO_NIGHT",
    "presetBackgroundId": "cosmic",
    "quickReaction": "🌌",
    "bubbleStyle": "MODERN",
    "uiStyle": "WORLDMATES",
    "isDarkTheme": true,
    "isPremium": false,
    "chatFont": null
  },
  {
    "nameKey": "pack_everyday_blue_name",
    "descKey": "pack_everyday_blue_desc",
    "emoji": "🩵",
    "themeVariant": "COBALT_DENIM",
    "presetBackgroundId": "morning_mist",
    "quickReaction": "👍",
    "bubbleStyle": "STANDARD",
    "uiStyle": "WORLDMATES",
    "isDarkTheme": false,
    "isPremium": false,
    "chatFont": null
  },
  {
    "nameKey": "pack_forest_calm_name",
    "descKey": "pack_forest_calm_desc",
    "emoji": "🌲",
    "themeVariant": "FOREST_TRAIL",
    "presetBackgroundId": "midnight",
    "quickReaction": "🌲",
    "bubbleStyle": "SOFT",
    "uiStyle": "WORLDMATES",
    "isDarkTheme": true,
    "isPremium": false,
    "chatFont": null
  },
  {
    "nameKey": "pack_fresh_sage_name",
    "descKey": "pack_fresh_sage_desc",
    "emoji": "🌿",
    "themeVariant": "SAGE",
    "presetBackgroundId": "spring",
    "quickReaction": "😊",
    "bubbleStyle": "TELEGRAM",
    "uiStyle": "WORLDMATES",
    "isDarkTheme": false,
    "isPremium": false,
    "chatFont": null
  },
  {
    "nameKey": "pack_warm_clay_name",
    "descKey": "pack_warm_clay_desc",
    "emoji": "🏺",
    "themeVariant": "TERRACOTTA",
    "presetBackgroundId": "sunset",
    "quickReaction": "🧡",
    "bubbleStyle": "GRADIENT",
    "uiStyle": "WORLDMATES",
    "isDarkTheme": false,
    "isPremium": false,
    "chatFont": null
  },
  {
    "nameKey": "pack_wine_evening_name",
    "descKey": "pack_wine_evening_desc",
    "emoji": "🍷",
    "themeVariant": "PLUM_WINE",
    "presetBackgroundId": "deep_plum",
    "quickReaction": "🍷",
    "bubbleStyle": "MODERN",
    "uiStyle": "WORLDMATES",
    "isDarkTheme": true,
    "isPremium": false,
    "chatFont": null
  },
  {
    "nameKey": "pack_copper_glow_name",
    "descKey": "pack_copper_glow_desc",
    "emoji": "🔶",
    "themeVariant": "COPPER",
    "presetBackgroundId": "fire",
    "quickReaction": "🔥",
    "bubbleStyle": "NEUMORPHISM",
    "uiStyle": "WORLDMATES",
    "isDarkTheme": true,
    "isPremium": false,
    "chatFont": null
  },
  {
    "nameKey": "pack_soft_coral_name",
    "descKey": "pack_soft_coral_desc",
    "emoji": "🐚",
    "themeVariant": "CORAL_BLUSH",
    "presetBackgroundId": "peach",
    "quickReaction": "🐚",
    "bubbleStyle": "SOFT",
    "uiStyle": "WORLDMATES",
    "isDarkTheme": false,
    "isPremium": false,
    "chatFont": null
  },
  {
    "nameKey": "pack_lilac_air_name",
    "descKey": "pack_lilac_air_desc",
    "emoji": "🪻",
    "themeVariant": "LILAC_MIST",
    "presetBackgroundId": "lavender",
    "quickReaction": "✨",
    "bubbleStyle": "GLASS",
    "uiStyle": "WORLDMATES",
    "isDarkTheme": false,
    "isPremium": false,
    "chatFont": null
  },
  {
    "nameKey": "pack_bay_breeze_name",
    "descKey": "pack_bay_breeze_desc",
    "emoji": "🏝️",
    "themeVariant": "TURQUOISE_BAY",
    "presetBackgroundId": "mint_sky",
    "quickReaction": "🏝️",
    "bubbleStyle": "STANDARD",
    "uiStyle": "WORLDMATES",
    "isDarkTheme": false,
    "isPremium": false,
    "chatFont": null
  },
  {
    "nameKey": "pack_night_navy_name",
    "descKey": "pack_night_navy_desc",
    "emoji": "🌑",
    "themeVariant": "MIDNIGHT_NAVY",
    "presetBackgroundId": "cosmic",
    "quickReaction": "🌑",
    "bubbleStyle": "GRADIENT",
    "uiStyle": "WORLDMATES",
    "isDarkTheme": true,
    "isPremium": false,
    "chatFont": null
  },
  {
    "nameKey": "pack_morning_roast_name",
    "descKey": "pack_morning_roast_desc",
    "emoji": "☕",
    "themeVariant": "ESPRESSO",
    "presetBackgroundId": "sand_dunes",
    "quickReaction": "☕",
    "bubbleStyle": "NEUMORPHISM",
    "uiStyle": "WORLDMATES",
    "isDarkTheme": true,
    "isPremium": false,
    "chatFont": null
  },
  {
    "nameKey": "pack_sapphire_focus_name",
    "descKey": "pack_sapphire_focus_desc",
    "emoji": "🔷",
    "themeVariant": "SAPPHIRE_DEPTH",
    "presetBackgroundId": "cosmic",
    "quickReaction": "🔷",
    "bubbleStyle": "MODERN",
    "uiStyle": "WORLDMATES",
    "isDarkTheme": true,
    "isPremium": true,
    "chatFont": null
  },
  {
    "nameKey": "pack_emerald_calm_name",
    "descKey": "pack_emerald_calm_desc",
    "emoji": "💚",
    "themeVariant": "EMERALD_VEIL",
    "presetBackgroundId": "aurora",
    "quickReaction": "💚",
    "bubbleStyle": "GRADIENT",
    "uiStyle": "WORLDMATES",
    "isDarkTheme": true,
    "isPremium": true,
    "chatFont": null
  },
  {
    "nameKey": "pack_garnet_fire_name",
    "descKey": "pack_garnet_fire_desc",
    "emoji": "❤️",
    "themeVariant": "GARNET_EMBER",
    "presetBackgroundId": "deep_plum",
    "quickReaction": "❤️",
    "bubbleStyle": "NEON",
    "uiStyle": "WORLDMATES",
    "isDarkTheme": true,
    "isPremium": true,
    "chatFont": null
  },
  {
    "nameKey": "pack_amethyst_night_name",
    "descKey": "pack_amethyst_night_desc",
    "emoji": "💜",
    "themeVariant": "AMETHYST_DUSK",
    "presetBackgroundId": "cosmic",
    "quickReaction": "💜",
    "bubbleStyle": "GLASS",
    "uiStyle": "WORLDMATES",
    "isDarkTheme": true,
    "isPremium": true,
    "chatFont": null
  },
  {
    "nameKey": "pack_topaz_evening_name",
    "descKey": "pack_topaz_evening_desc",
    "emoji": "🟡",
    "themeVariant": "TOPAZ_GLOW",
    "presetBackgroundId": "fire",
    "quickReaction": "🟡",
    "bubbleStyle": "NEUMORPHISM",
    "uiStyle": "WORLDMATES",
    "isDarkTheme": true,
    "isPremium": true,
    "chatFont": null
  },
  {
    "nameKey": "pack_celestial_soft_name",
    "descKey": "pack_celestial_soft_desc",
    "emoji": "🔮",
    "themeVariant": "CELESTITE",
    "presetBackgroundId": "cotton_candy",
    "quickReaction": "🔮",
    "bubbleStyle": "SOFT",
    "uiStyle": "WORLDMATES",
    "isDarkTheme": false,
    "isPremium": true,
    "chatFont": null
  }
];
