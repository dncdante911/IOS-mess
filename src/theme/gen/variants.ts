// АВТОГЕНЕРАЦИЯ: scripts/gen-android-theme.mjs из Android ui/theme. Руками не править.
/* eslint-disable */
import type { ThemePalette, ThemeVariantMeta } from '../types';

export const THEME_VARIANT_KEYS = ["CLASSIC","OCEAN","PURPLE","MONOCHROME","NORD","DRACULA","MATERIAL_YOU","STRANGER_THINGS","LORD_OF_THE_RINGS","TERMINATOR","SUPERNATURAL","MARVEL","CYBERPUNK","INTERSTELLAR","HARRY_POTTER","DUNE","DEMON_SLAYER","INDIGO_NIGHT","COBALT_DENIM","FOREST_TRAIL","SAGE","TERRACOTTA","PLUM_WINE","STORM_SLATE","COPPER","CORAL_BLUSH","LILAC_MIST","OLIVE_GROVE","TURQUOISE_BAY","SANDSTONE","MIDNIGHT_NAVY","BLUSH_GARDEN","MOSS_STONE","ESPRESSO","STEEL_TEAL","WHEAT_FIELD","SAPPHIRE_DEPTH","EMERALD_VEIL","GARNET_EMBER","ONYX_GOLD","AMETHYST_DUSK","TOPAZ_GLOW","OPAL_FROST","OBSIDIAN_ROSE","PLATINUM_MIST","CELESTITE","HARBOR_MIST","WILD_BERRY","BASIL","CINNAMON"] as const;
export type ThemeVariant = (typeof THEME_VARIANT_KEYS)[number];

/** enum class ThemeVariant (порядок = ordinal, как на Android) */
export const THEME_VARIANTS: Record<ThemeVariant, ThemeVariantMeta> = {
  "CLASSIC": {
    "key": "CLASSIC",
    "displayName": "Classic Blue",
    "emoji": "💙",
    "description": "Classic blue Messenger-style theme",
    "isPremium": false,
    "isSubscriptionOnly": false,
    "prefersDark": false,
    "nameKey": "theme_classic_name",
    "descKey": "theme_classic_desc",
    "ordinal": 0
  },
  "OCEAN": {
    "key": "OCEAN",
    "displayName": "Deep Ocean",
    "emoji": "🌊",
    "description": "Deep ocean shades of blue and teal",
    "isPremium": false,
    "isSubscriptionOnly": false,
    "prefersDark": true,
    "nameKey": "theme_ocean_name",
    "descKey": "theme_ocean_desc",
    "ordinal": 1
  },
  "PURPLE": {
    "key": "PURPLE",
    "displayName": "Violet Dream",
    "emoji": "💜",
    "description": "Rich purple tones with pleasant contrast",
    "isPremium": false,
    "isSubscriptionOnly": false,
    "prefersDark": true,
    "nameKey": "theme_purple_name",
    "descKey": "theme_purple_desc",
    "ordinal": 2
  },
  "MONOCHROME": {
    "key": "MONOCHROME",
    "displayName": "Dark Slate",
    "emoji": "🖤",
    "description": "Dark slate — soft contrast, easy reading",
    "isPremium": false,
    "isSubscriptionOnly": false,
    "prefersDark": true,
    "nameKey": "theme_monochrome_name",
    "descKey": "theme_monochrome_desc",
    "ordinal": 3
  },
  "NORD": {
    "key": "NORD",
    "displayName": "Nord Frost",
    "emoji": "❄️",
    "description": "Cold northern shades of the Nord palette",
    "isPremium": false,
    "isSubscriptionOnly": false,
    "prefersDark": false,
    "nameKey": "theme_nord_name",
    "descKey": "theme_nord_desc",
    "ordinal": 4
  },
  "DRACULA": {
    "key": "DRACULA",
    "displayName": "Dracula Night",
    "emoji": "🦇",
    "description": "Dark theme with vivid accents",
    "isPremium": false,
    "isSubscriptionOnly": false,
    "prefersDark": true,
    "nameKey": "theme_dracula_name",
    "descKey": "theme_dracula_desc",
    "ordinal": 5
  },
  "MATERIAL_YOU": {
    "key": "MATERIAL_YOU",
    "displayName": "Material You",
    "emoji": "🎨",
    "description": "Dynamic colors from wallpaper (Android 12+)",
    "isPremium": false,
    "isSubscriptionOnly": false,
    "prefersDark": true,
    "nameKey": "theme_material_you_name",
    "descKey": "theme_material_you_desc",
    "ordinal": 6
  },
  "STRANGER_THINGS": {
    "key": "STRANGER_THINGS",
    "displayName": "Crimson Static",
    "emoji": "🔴",
    "description": "80s neon glow in the dark — red static and retro vibes",
    "isPremium": true,
    "isSubscriptionOnly": false,
    "prefersDark": true,
    "nameKey": "theme_stranger_things_name",
    "descKey": "theme_stranger_things_desc",
    "ordinal": 7
  },
  "LORD_OF_THE_RINGS": {
    "key": "LORD_OF_THE_RINGS",
    "displayName": "Elder Gold",
    "emoji": "💍",
    "description": "Epic gold and dark magic of ancient kingdoms",
    "isPremium": true,
    "isSubscriptionOnly": false,
    "prefersDark": true,
    "nameKey": "theme_lotr_name",
    "descKey": "theme_lotr_desc",
    "ordinal": 8
  },
  "TERMINATOR": {
    "key": "TERMINATOR",
    "displayName": "Steel Protocol",
    "emoji": "⚙️",
    "description": "Steel machine, red gaze, dark future",
    "isPremium": true,
    "isSubscriptionOnly": false,
    "prefersDark": true,
    "nameKey": "theme_terminator_name",
    "descKey": "theme_terminator_desc",
    "ordinal": 9
  },
  "SUPERNATURAL": {
    "key": "SUPERNATURAL",
    "displayName": "Amber Hunt",
    "emoji": "🌙",
    "description": "Amber firelight burning in pitch darkness",
    "isPremium": true,
    "isSubscriptionOnly": false,
    "prefersDark": true,
    "nameKey": "theme_supernatural_name",
    "descKey": "theme_supernatural_desc",
    "ordinal": 10
  },
  "MARVEL": {
    "key": "MARVEL",
    "displayName": "Scarlet Legend",
    "emoji": "⭐",
    "description": "Red-and-gold heroic glow",
    "isPremium": true,
    "isSubscriptionOnly": false,
    "prefersDark": true,
    "nameKey": "theme_marvel_name",
    "descKey": "theme_marvel_desc",
    "ordinal": 11
  },
  "CYBERPUNK": {
    "key": "CYBERPUNK",
    "displayName": "Neon City",
    "emoji": "⚡",
    "description": "Neon-yellow glow of the night city",
    "isPremium": true,
    "isSubscriptionOnly": true,
    "prefersDark": true,
    "nameKey": "theme_cyberpunk_name",
    "descKey": "theme_cyberpunk_desc",
    "ordinal": 12
  },
  "INTERSTELLAR": {
    "key": "INTERSTELLAR",
    "displayName": "Cosmic Silence",
    "emoji": "🌌",
    "description": "Infinite cosmos, gold of stars and silence",
    "isPremium": true,
    "isSubscriptionOnly": true,
    "prefersDark": true,
    "nameKey": "theme_interstellar_name",
    "descKey": "theme_interstellar_desc",
    "ordinal": 13
  },
  "HARRY_POTTER": {
    "key": "HARRY_POTTER",
    "displayName": "Mystic Burgundy",
    "emoji": "🪄",
    "description": "Burgundy gold of a hidden magical world",
    "isPremium": true,
    "isSubscriptionOnly": true,
    "prefersDark": true,
    "nameKey": "theme_harry_potter_name",
    "descKey": "theme_harry_potter_desc",
    "ordinal": 14
  },
  "DUNE": {
    "key": "DUNE",
    "displayName": "Desert Spice",
    "emoji": "🏜️",
    "description": "Endless desert: sand, spice and power",
    "isPremium": true,
    "isSubscriptionOnly": true,
    "prefersDark": true,
    "nameKey": "theme_dune_name",
    "descKey": "theme_dune_desc",
    "ordinal": 15
  },
  "DEMON_SLAYER": {
    "key": "DEMON_SLAYER",
    "displayName": "Cherry Garden",
    "emoji": "🌸",
    "description": "Cherry blossoms and a spring garden",
    "isPremium": true,
    "isSubscriptionOnly": true,
    "prefersDark": false,
    "nameKey": "theme_demon_slayer_name",
    "descKey": "theme_demon_slayer_desc",
    "ordinal": 16
  },
  "INDIGO_NIGHT": {
    "key": "INDIGO_NIGHT",
    "displayName": "Indigo Night",
    "emoji": "🌃",
    "description": "Deep indigo blue, calm and focused",
    "isPremium": false,
    "isSubscriptionOnly": false,
    "prefersDark": true,
    "nameKey": "theme_indigo_night_name",
    "descKey": "theme_indigo_night_desc",
    "ordinal": 17
  },
  "COBALT_DENIM": {
    "key": "COBALT_DENIM",
    "displayName": "Cobalt Denim",
    "emoji": "🩵",
    "description": "Everyday denim blue, easy on the eyes",
    "isPremium": false,
    "isSubscriptionOnly": false,
    "prefersDark": false,
    "nameKey": "theme_cobalt_denim_name",
    "descKey": "theme_cobalt_denim_desc",
    "ordinal": 18
  },
  "FOREST_TRAIL": {
    "key": "FOREST_TRAIL",
    "displayName": "Forest Trail",
    "emoji": "🌲",
    "description": "Muted forest green, grounded and quiet",
    "isPremium": false,
    "isSubscriptionOnly": false,
    "prefersDark": true,
    "nameKey": "theme_forest_trail_name",
    "descKey": "theme_forest_trail_desc",
    "ordinal": 19
  },
  "SAGE": {
    "key": "SAGE",
    "displayName": "Sage",
    "emoji": "🌿",
    "description": "Soft sage green, gentle daylight tone",
    "isPremium": false,
    "isSubscriptionOnly": false,
    "prefersDark": false,
    "nameKey": "theme_sage_name",
    "descKey": "theme_sage_desc",
    "ordinal": 20
  },
  "TERRACOTTA": {
    "key": "TERRACOTTA",
    "displayName": "Terracotta",
    "emoji": "🏺",
    "description": "Warm clay red-orange, earthy and calm",
    "isPremium": false,
    "isSubscriptionOnly": false,
    "prefersDark": false,
    "nameKey": "theme_terracotta_name",
    "descKey": "theme_terracotta_desc",
    "ordinal": 21
  },
  "PLUM_WINE": {
    "key": "PLUM_WINE",
    "displayName": "Plum Wine",
    "emoji": "🍷",
    "description": "Deep plum wine, quiet elegance",
    "isPremium": false,
    "isSubscriptionOnly": false,
    "prefersDark": true,
    "nameKey": "theme_plum_wine_name",
    "descKey": "theme_plum_wine_desc",
    "ordinal": 22
  },
  "STORM_SLATE": {
    "key": "STORM_SLATE",
    "displayName": "Storm Slate",
    "emoji": "⛈️",
    "description": "Cool blue-grey, understated and steady",
    "isPremium": false,
    "isSubscriptionOnly": false,
    "prefersDark": true,
    "nameKey": "theme_storm_slate_name",
    "descKey": "theme_storm_slate_desc",
    "ordinal": 23
  },
  "COPPER": {
    "key": "COPPER",
    "displayName": "Copper",
    "emoji": "🔶",
    "description": "Warm brushed copper, soft metallic glow",
    "isPremium": false,
    "isSubscriptionOnly": false,
    "prefersDark": true,
    "nameKey": "theme_copper_name",
    "descKey": "theme_copper_desc",
    "ordinal": 24
  },
  "CORAL_BLUSH": {
    "key": "CORAL_BLUSH",
    "displayName": "Coral Blush",
    "emoji": "🐚",
    "description": "Gentle coral pink, warm and light",
    "isPremium": false,
    "isSubscriptionOnly": false,
    "prefersDark": false,
    "nameKey": "theme_coral_blush_name",
    "descKey": "theme_coral_blush_desc",
    "ordinal": 25
  },
  "LILAC_MIST": {
    "key": "LILAC_MIST",
    "displayName": "Lilac Mist",
    "emoji": "🪻",
    "description": "Soft lilac, airy and relaxed",
    "isPremium": false,
    "isSubscriptionOnly": false,
    "prefersDark": false,
    "nameKey": "theme_lilac_mist_name",
    "descKey": "theme_lilac_mist_desc",
    "ordinal": 26
  },
  "OLIVE_GROVE": {
    "key": "OLIVE_GROVE",
    "displayName": "Olive Grove",
    "emoji": "🫒",
    "description": "Muted olive green, warm and earthy",
    "isPremium": false,
    "isSubscriptionOnly": false,
    "prefersDark": true,
    "nameKey": "theme_olive_grove_name",
    "descKey": "theme_olive_grove_desc",
    "ordinal": 27
  },
  "TURQUOISE_BAY": {
    "key": "TURQUOISE_BAY",
    "displayName": "Turquoise Bay",
    "emoji": "🏝️",
    "description": "Calm turquoise, clear and breezy",
    "isPremium": false,
    "isSubscriptionOnly": false,
    "prefersDark": false,
    "nameKey": "theme_turquoise_bay_name",
    "descKey": "theme_turquoise_bay_desc",
    "ordinal": 28
  },
  "SANDSTONE": {
    "key": "SANDSTONE",
    "displayName": "Sandstone",
    "emoji": "🏜️",
    "description": "Warm beige sand, quiet and neutral",
    "isPremium": false,
    "isSubscriptionOnly": false,
    "prefersDark": false,
    "nameKey": "theme_sandstone_name",
    "descKey": "theme_sandstone_desc",
    "ordinal": 29
  },
  "MIDNIGHT_NAVY": {
    "key": "MIDNIGHT_NAVY",
    "displayName": "Midnight Navy",
    "emoji": "🌑",
    "description": "Classic deep navy, understated and sharp",
    "isPremium": false,
    "isSubscriptionOnly": false,
    "prefersDark": true,
    "nameKey": "theme_midnight_navy_name",
    "descKey": "theme_midnight_navy_desc",
    "ordinal": 30
  },
  "BLUSH_GARDEN": {
    "key": "BLUSH_GARDEN",
    "displayName": "Blush Garden",
    "emoji": "🌷",
    "description": "Soft pink blush, light and gentle",
    "isPremium": false,
    "isSubscriptionOnly": false,
    "prefersDark": false,
    "nameKey": "theme_blush_garden_name",
    "descKey": "theme_blush_garden_desc",
    "ordinal": 31
  },
  "MOSS_STONE": {
    "key": "MOSS_STONE",
    "displayName": "Moss Stone",
    "emoji": "🪨",
    "description": "Cool mossy green-grey, calm and natural",
    "isPremium": false,
    "isSubscriptionOnly": false,
    "prefersDark": true,
    "nameKey": "theme_moss_stone_name",
    "descKey": "theme_moss_stone_desc",
    "ordinal": 32
  },
  "ESPRESSO": {
    "key": "ESPRESSO",
    "displayName": "Espresso",
    "emoji": "☕",
    "description": "Warm dark roast brown, cosy and rich",
    "isPremium": false,
    "isSubscriptionOnly": false,
    "prefersDark": true,
    "nameKey": "theme_espresso_name",
    "descKey": "theme_espresso_desc",
    "ordinal": 33
  },
  "STEEL_TEAL": {
    "key": "STEEL_TEAL",
    "displayName": "Steel Teal",
    "emoji": "🔩",
    "description": "Cool steel teal, precise and modern",
    "isPremium": false,
    "isSubscriptionOnly": false,
    "prefersDark": true,
    "nameKey": "theme_steel_teal_name",
    "descKey": "theme_steel_teal_desc",
    "ordinal": 34
  },
  "WHEAT_FIELD": {
    "key": "WHEAT_FIELD",
    "displayName": "Wheat Field",
    "emoji": "🌾",
    "description": "Warm muted gold-beige, quiet daylight",
    "isPremium": false,
    "isSubscriptionOnly": false,
    "prefersDark": false,
    "nameKey": "theme_wheat_field_name",
    "descKey": "theme_wheat_field_desc",
    "ordinal": 35
  },
  "SAPPHIRE_DEPTH": {
    "key": "SAPPHIRE_DEPTH",
    "displayName": "Sapphire Depth",
    "emoji": "🔷",
    "description": "Deep sapphire blue with a quiet glow",
    "isPremium": true,
    "isSubscriptionOnly": false,
    "prefersDark": true,
    "nameKey": "theme_sapphire_depth_name",
    "descKey": "theme_sapphire_depth_desc",
    "ordinal": 36
  },
  "EMERALD_VEIL": {
    "key": "EMERALD_VEIL",
    "displayName": "Emerald Veil",
    "emoji": "💚",
    "description": "Rich emerald green, refined and calm",
    "isPremium": true,
    "isSubscriptionOnly": false,
    "prefersDark": true,
    "nameKey": "theme_emerald_veil_name",
    "descKey": "theme_emerald_veil_desc",
    "ordinal": 37
  },
  "GARNET_EMBER": {
    "key": "GARNET_EMBER",
    "displayName": "Garnet Ember",
    "emoji": "❤️",
    "description": "Deep garnet red, warm low glow",
    "isPremium": true,
    "isSubscriptionOnly": false,
    "prefersDark": true,
    "nameKey": "theme_garnet_ember_name",
    "descKey": "theme_garnet_ember_desc",
    "ordinal": 38
  },
  "ONYX_GOLD": {
    "key": "ONYX_GOLD",
    "displayName": "Onyx Gold",
    "emoji": "🖤",
    "description": "Black onyx with a thread of warm gold",
    "isPremium": true,
    "isSubscriptionOnly": false,
    "prefersDark": true,
    "nameKey": "theme_onyx_gold_name",
    "descKey": "theme_onyx_gold_desc",
    "ordinal": 39
  },
  "AMETHYST_DUSK": {
    "key": "AMETHYST_DUSK",
    "displayName": "Amethyst Dusk",
    "emoji": "💜",
    "description": "Twilight amethyst, soft and rich",
    "isPremium": true,
    "isSubscriptionOnly": false,
    "prefersDark": true,
    "nameKey": "theme_amethyst_dusk_name",
    "descKey": "theme_amethyst_dusk_desc",
    "ordinal": 40
  },
  "TOPAZ_GLOW": {
    "key": "TOPAZ_GLOW",
    "displayName": "Topaz Glow",
    "emoji": "🟡",
    "description": "Warm topaz amber, soft evening glow",
    "isPremium": true,
    "isSubscriptionOnly": true,
    "prefersDark": true,
    "nameKey": "theme_topaz_glow_name",
    "descKey": "theme_topaz_glow_desc",
    "ordinal": 41
  },
  "OPAL_FROST": {
    "key": "OPAL_FROST",
    "displayName": "Opal Frost",
    "emoji": "🤍",
    "description": "Pale opal blue-white, serene and clean",
    "isPremium": true,
    "isSubscriptionOnly": true,
    "prefersDark": false,
    "nameKey": "theme_opal_frost_name",
    "descKey": "theme_opal_frost_desc",
    "ordinal": 42
  },
  "OBSIDIAN_ROSE": {
    "key": "OBSIDIAN_ROSE",
    "displayName": "Obsidian Rose",
    "emoji": "🖤",
    "description": "Black obsidian with a rose undertone",
    "isPremium": true,
    "isSubscriptionOnly": true,
    "prefersDark": true,
    "nameKey": "theme_obsidian_rose_name",
    "descKey": "theme_obsidian_rose_desc",
    "ordinal": 43
  },
  "PLATINUM_MIST": {
    "key": "PLATINUM_MIST",
    "displayName": "Platinum Mist",
    "emoji": "⚪",
    "description": "Cool platinum grey, quiet and refined",
    "isPremium": true,
    "isSubscriptionOnly": true,
    "prefersDark": true,
    "nameKey": "theme_platinum_mist_name",
    "descKey": "theme_platinum_mist_desc",
    "ordinal": 44
  },
  "CELESTITE": {
    "key": "CELESTITE",
    "displayName": "Celestite",
    "emoji": "🔮",
    "description": "Soft celestial blue-lavender, dreamlike",
    "isPremium": true,
    "isSubscriptionOnly": true,
    "prefersDark": false,
    "nameKey": "theme_celestite_name",
    "descKey": "theme_celestite_desc",
    "ordinal": 45
  },
  "HARBOR_MIST": {
    "key": "HARBOR_MIST",
    "displayName": "Harbor Mist",
    "emoji": "⚓",
    "description": "Cool harbour fog, quiet blue-grey",
    "isPremium": false,
    "isSubscriptionOnly": false,
    "prefersDark": false,
    "nameKey": "theme_harbor_mist_name",
    "descKey": "theme_harbor_mist_desc",
    "ordinal": 46
  },
  "WILD_BERRY": {
    "key": "WILD_BERRY",
    "displayName": "Wild Berry",
    "emoji": "🫐",
    "description": "Rich berry magenta, deep and quiet",
    "isPremium": false,
    "isSubscriptionOnly": false,
    "prefersDark": true,
    "nameKey": "theme_wild_berry_name",
    "descKey": "theme_wild_berry_desc",
    "ordinal": 47
  },
  "BASIL": {
    "key": "BASIL",
    "displayName": "Basil",
    "emoji": "🌱",
    "description": "Fresh herb green, light and clean",
    "isPremium": false,
    "isSubscriptionOnly": false,
    "prefersDark": false,
    "nameKey": "theme_basil_name",
    "descKey": "theme_basil_desc",
    "ordinal": 48
  },
  "CINNAMON": {
    "key": "CINNAMON",
    "displayName": "Cinnamon",
    "emoji": "🥮",
    "description": "Warm spiced red-brown, cosy and dim",
    "isPremium": false,
    "isSubscriptionOnly": false,
    "prefersDark": true,
    "nameKey": "theme_cinnamon_name",
    "descKey": "theme_cinnamon_desc",
    "ordinal": 49
  }
};

/** ThemeVariant.getPalette() */
export const THEME_PALETTES: Record<ThemeVariant, ThemePalette> = {
  "CLASSIC": {
    "primary": "#1565C0",
    "primaryDark": "#003C8F",
    "primaryLight": "#5E92F3",
    "secondary": "#0288D1",
    "secondaryDark": "#005B96",
    "secondaryLight": "#4FC3F7",
    "messageBubbleOwn": "#1976D2",
    "messageBubbleOther": "#ECEFF1",
    "accent": "#6EB7D8",
    "backgroundGradient": {
      "type": "diagonal",
      "colors": [
        "#1565C0",
        "#1976D2",
        "#2196F3",
        "#42A5F5"
      ]
    }
  },
  "OCEAN": {
    "primary": "#00695C",
    "primaryDark": "#004D40",
    "primaryLight": "#4DB6AC",
    "secondary": "#0277BD",
    "secondaryDark": "#01579B",
    "secondaryLight": "#4FC3F7",
    "messageBubbleOwn": "#00796B",
    "messageBubbleOther": "#E0F2F1",
    "accent": "#1DE9B6",
    "backgroundGradient": {
      "type": "diagonal",
      "colors": [
        "#001A12",
        "#003D2E",
        "#005B4A",
        "#00796B"
      ]
    }
  },
  "PURPLE": {
    "primary": "#7B1FA2",
    "primaryDark": "#4A0072",
    "primaryLight": "#BA68C8",
    "secondary": "#8E24AA",
    "secondaryDark": "#5C006D",
    "secondaryLight": "#CE93D8",
    "messageBubbleOwn": "#7B1FA2",
    "messageBubbleOther": "#F3E5F5",
    "accent": "#C665D6",
    "backgroundGradient": {
      "type": "diagonal",
      "colors": [
        "#12002B",
        "#2A0050",
        "#4A0072",
        "#7B1FA2"
      ]
    }
  },
  "MONOCHROME": {
    "primary": "#455A64",
    "primaryDark": "#263238",
    "primaryLight": "#78909C",
    "secondary": "#546E7A",
    "secondaryDark": "#37474F",
    "secondaryLight": "#90A4AE",
    "messageBubbleOwn": "#37474F",
    "messageBubbleOther": "#ECEFF1",
    "accent": "#78909C",
    "backgroundGradient": {
      "type": "diagonal",
      "colors": [
        "#0F1417",
        "#1C262B",
        "#263238",
        "#37474F"
      ]
    }
  },
  "NORD": {
    "primary": "#5E81AC",
    "primaryDark": "#4C566A",
    "primaryLight": "#81A1C1",
    "secondary": "#88C0D0",
    "secondaryDark": "#8FBCBB",
    "secondaryLight": "#D8DEE9",
    "messageBubbleOwn": "#4C6F99",
    "messageBubbleOther": "#ECEFF4",
    "accent": "#88C0D0",
    "backgroundGradient": {
      "type": "vertical",
      "colors": [
        "#ECEFF4",
        "#D8DEE9",
        "#E5E9F0",
        "#D8DEE9"
      ]
    }
  },
  "DRACULA": {
    "primary": "#BD93F9",
    "primaryDark": "#9B6EE8",
    "primaryLight": "#D4B5FF",
    "secondary": "#FF79C6",
    "secondaryDark": "#FF5AC8",
    "secondaryLight": "#FFB3E5",
    "messageBubbleOwn": "#C6A6F2",
    "messageBubbleOther": "#44475A",
    "accent": "#71D98B",
    "backgroundGradient": {
      "type": "vertical",
      "colors": [
        "#1E1F29",
        "#282A36",
        "#373844",
        "#44475A"
      ]
    }
  },
  "MATERIAL_YOU": {
    "primary": "#6750A4",
    "primaryDark": "#4F378B",
    "primaryLight": "#9A82DB",
    "secondary": "#625B71",
    "secondaryDark": "#4A4458",
    "secondaryLight": "#938F99",
    "messageBubbleOwn": "#6750A4",
    "messageBubbleOther": "#E8DEF8",
    "accent": "#6750A4",
    "backgroundGradient": {
      "type": "vertical",
      "colors": [
        "#1C1B1F",
        "#2B2930",
        "#3A3740",
        "#49454F"
      ]
    }
  },
  "STRANGER_THINGS": {
    "primary": "#D32F2F",
    "primaryDark": "#7F0000",
    "primaryLight": "#EF5350",
    "secondary": "#FF6D00",
    "secondaryDark": "#BF360C",
    "secondaryLight": "#FF9100",
    "messageBubbleOwn": "#B71C1C",
    "messageBubbleOther": "#2C0F0F",
    "accent": "#CE4862",
    "backgroundGradient": {
      "type": "vertical",
      "colors": [
        "#060002",
        "#1A0008",
        "#3D0018",
        "#1A0008",
        "#060002"
      ]
    }
  },
  "LORD_OF_THE_RINGS": {
    "primary": "#B8860B",
    "primaryDark": "#6B4E0A",
    "primaryLight": "#DAA520",
    "secondary": "#8B7355",
    "secondaryDark": "#5C4A28",
    "secondaryLight": "#CDAA7D",
    "messageBubbleOwn": "#7A5C0E",
    "messageBubbleOther": "#2E1E0A",
    "accent": "#DAA520",
    "backgroundGradient": {
      "type": "vertical",
      "colors": [
        "#0C0902",
        "#1A1204",
        "#2A1E08",
        "#3A2B0A"
      ]
    }
  },
  "TERMINATOR": {
    "primary": "#B71C1C",
    "primaryDark": "#7F0000",
    "primaryLight": "#EF5350",
    "secondary": "#607D8B",
    "secondaryDark": "#37474F",
    "secondaryLight": "#90A4AE",
    "messageBubbleOwn": "#8B0000",
    "messageBubbleOther": "#1A1A1A",
    "accent": "#CE4862",
    "backgroundGradient": {
      "type": "vertical",
      "colors": [
        "#050505",
        "#0D0D0D",
        "#181818",
        "#1F1208"
      ]
    }
  },
  "SUPERNATURAL": {
    "primary": "#C8860A",
    "primaryDark": "#7A5100",
    "primaryLight": "#E6A820",
    "secondary": "#5D4037",
    "secondaryDark": "#3E2723",
    "secondaryLight": "#8D6E63",
    "messageBubbleOwn": "#8B5A00",
    "messageBubbleOther": "#2A1C10",
    "accent": "#C99936",
    "backgroundGradient": {
      "type": "vertical",
      "colors": [
        "#050301",
        "#0F0804",
        "#1E1406",
        "#2A1C08"
      ]
    }
  },
  "MARVEL": {
    "primary": "#C62828",
    "primaryDark": "#8B0000",
    "primaryLight": "#EF5350",
    "secondary": "#FFAB00",
    "secondaryDark": "#E65100",
    "secondaryLight": "#FFD54F",
    "messageBubbleOwn": "#8B0000",
    "messageBubbleOther": "#0A0A1A",
    "accent": "#D7C068",
    "backgroundGradient": {
      "type": "diagonal",
      "colors": [
        "#050510",
        "#0A0A20",
        "#100020",
        "#1A0010"
      ]
    }
  },
  "CYBERPUNK": {
    "primary": "#F5E642",
    "primaryDark": "#C0B000",
    "primaryLight": "#FFFF6B",
    "secondary": "#FF2D78",
    "secondaryDark": "#AA0040",
    "secondaryLight": "#FF80AB",
    "messageBubbleOwn": "#D8C43C",
    "messageBubbleOther": "#14002A",
    "accent": "#36BAC9",
    "backgroundGradient": {
      "type": "vertical",
      "colors": [
        "#02000F",
        "#08001A",
        "#10002A",
        "#0A0015"
      ]
    }
  },
  "INTERSTELLAR": {
    "primary": "#DAA520",
    "primaryDark": "#8B6914",
    "primaryLight": "#FFD700",
    "secondary": "#4A5568",
    "secondaryDark": "#2D3748",
    "secondaryLight": "#718096",
    "messageBubbleOwn": "#7A5E14",
    "messageBubbleOther": "#0C0C22",
    "accent": "#FFE066",
    "backgroundGradient": {
      "type": "vertical",
      "colors": [
        "#010106",
        "#02020C",
        "#040412",
        "#060618"
      ]
    }
  },
  "HARRY_POTTER": {
    "primary": "#A50000",
    "primaryDark": "#5B0000",
    "primaryLight": "#D32F2F",
    "secondary": "#B8860B",
    "secondaryDark": "#7A5B00",
    "secondaryLight": "#DAA520",
    "messageBubbleOwn": "#5B0000",
    "messageBubbleOther": "#120A00",
    "accent": "#C9B236",
    "backgroundGradient": {
      "type": "vertical",
      "colors": [
        "#050105",
        "#0D050D",
        "#180A18",
        "#220F22"
      ]
    }
  },
  "DUNE": {
    "primary": "#D4A017",
    "primaryDark": "#8B6914",
    "primaryLight": "#ECC44A",
    "secondary": "#8B4513",
    "secondaryDark": "#5C2E0A",
    "secondaryLight": "#CD853F",
    "messageBubbleOwn": "#7A5800",
    "messageBubbleOther": "#1A0E00",
    "accent": "#FFD18C",
    "backgroundGradient": {
      "type": "diagonal",
      "colors": [
        "#0F0800",
        "#1E1000",
        "#2E1A00",
        "#3A2200"
      ]
    }
  },
  "DEMON_SLAYER": {
    "primary": "#D81B60",
    "primaryDark": "#880E4F",
    "primaryLight": "#F48FB1",
    "secondary": "#00897B",
    "secondaryDark": "#004D40",
    "secondaryLight": "#4DB6AC",
    "messageBubbleOwn": "#D81B60",
    "messageBubbleOther": "#FFFFFF",
    "accent": "#85DEC9",
    "backgroundGradient": {
      "type": "vertical",
      "colors": [
        "#FCE4EC",
        "#F8BBD0",
        "#E8F5E9",
        "#B2EBF2"
      ]
    }
  },
  "INDIGO_NIGHT": {
    "primary": "#151B5B",
    "primaryDark": "#101442",
    "primaryLight": "#626AC6",
    "secondary": "#6530A6",
    "secondaryDark": "#3F1E67",
    "secondaryLight": "#AA89D2",
    "messageBubbleOwn": "#151B5B",
    "messageBubbleOther": "#10122B",
    "accent": "#8E56D2",
    "backgroundGradient": {
      "type": "vertical",
      "colors": [
        "#03040C",
        "#090A1B",
        "#10122D",
        "#101442"
      ]
    }
  },
  "COBALT_DENIM": {
    "primary": "#153A5B",
    "primaryDark": "#174063",
    "primaryLight": "#80ABD1",
    "secondary": "#2E2E9E",
    "secondaryDark": "#20206F",
    "secondaryLight": "#9F9FDB",
    "messageBubbleOwn": "#153A5B",
    "messageBubbleOther": "#EFF2F6",
    "accent": "#3131B9",
    "backgroundGradient": {
      "type": "diagonal",
      "colors": [
        "#EFF2F5",
        "#EEF3F6",
        "#DFDFEC",
        "#EFF2F6"
      ]
    }
  },
  "FOREST_TRAIL": {
    "primary": "#155B2F",
    "primaryDark": "#104222",
    "primaryLight": "#62C686",
    "secondary": "#30A69A",
    "secondaryDark": "#1E675F",
    "secondaryLight": "#89D2CB",
    "messageBubbleOwn": "#155B2F",
    "messageBubbleOther": "#102B1A",
    "accent": "#56D2C6",
    "backgroundGradient": {
      "type": "vertical",
      "colors": [
        "#030C07",
        "#091B0F",
        "#102D1B",
        "#104222"
      ]
    }
  },
  "SAGE": {
    "primary": "#235B15",
    "primaryDark": "#266317",
    "primaryLight": "#90D180",
    "secondary": "#2E9E53",
    "secondaryDark": "#206F3A",
    "secondaryLight": "#9FDBB3",
    "messageBubbleOwn": "#235B15",
    "messageBubbleOther": "#F0F6EF",
    "accent": "#31B95F",
    "backgroundGradient": {
      "type": "diagonal",
      "colors": [
        "#F1F5EF",
        "#F0F6EE",
        "#DFECE3",
        "#F0F6EF"
      ]
    }
  },
  "TERRACOTTA": {
    "primary": "#5B2815",
    "primaryDark": "#632B17",
    "primaryLight": "#D19580",
    "secondary": "#9E882E",
    "secondaryDark": "#6F5F20",
    "secondaryLight": "#DBCF9F",
    "messageBubbleOwn": "#5B2815",
    "messageBubbleOther": "#F6F1EF",
    "accent": "#B99E31",
    "backgroundGradient": {
      "type": "diagonal",
      "colors": [
        "#F5F1EF",
        "#F6F0EE",
        "#ECE9DF",
        "#F6F1EF"
      ]
    }
  },
  "PLUM_WINE": {
    "primary": "#5B1544",
    "primaryDark": "#421031",
    "primaryLight": "#C662A5",
    "secondary": "#A63040",
    "secondaryDark": "#671E28",
    "secondaryLight": "#D28992",
    "messageBubbleOwn": "#5B1544",
    "messageBubbleOther": "#2B1022",
    "accent": "#D25666",
    "backgroundGradient": {
      "type": "vertical",
      "colors": [
        "#0C0309",
        "#1B0915",
        "#2D1023",
        "#421031"
      ]
    }
  },
  "STORM_SLATE": {
    "primary": "#15445B",
    "primaryDark": "#103142",
    "primaryLight": "#62A5C6",
    "secondary": "#3040A6",
    "secondaryDark": "#1E2867",
    "secondaryLight": "#8992D2",
    "messageBubbleOwn": "#15445B",
    "messageBubbleOther": "#10222B",
    "accent": "#5666D2",
    "backgroundGradient": {
      "type": "vertical",
      "colors": [
        "#03090C",
        "#09151B",
        "#10232D",
        "#103142"
      ]
    }
  },
  "COPPER": {
    "primary": "#5B3115",
    "primaryDark": "#422410",
    "primaryLight": "#C68A62",
    "secondary": "#A69E30",
    "secondaryDark": "#67621E",
    "secondaryLight": "#D2CD89",
    "messageBubbleOwn": "#5B3115",
    "messageBubbleOther": "#2B1B10",
    "accent": "#D2CA56",
    "backgroundGradient": {
      "type": "vertical",
      "colors": [
        "#0C0703",
        "#1B1009",
        "#2D1C10",
        "#422410"
      ]
    }
  },
  "CORAL_BLUSH": {
    "primary": "#5B1F15",
    "primaryDark": "#632117",
    "primaryLight": "#D18A80",
    "secondary": "#9E792E",
    "secondaryDark": "#6F5420",
    "secondaryLight": "#DBC79F",
    "messageBubbleOwn": "#5B1F15",
    "messageBubbleOther": "#F6F0EF",
    "accent": "#B98C31",
    "backgroundGradient": {
      "type": "diagonal",
      "colors": [
        "#F5F0EF",
        "#F6EFEE",
        "#ECE8DF",
        "#F6F0EF"
      ]
    }
  },
  "LILAC_MIST": {
    "primary": "#36155B",
    "primaryDark": "#3B1763",
    "primaryLight": "#A680D1",
    "secondary": "#9E2E9E",
    "secondaryDark": "#6F206F",
    "secondaryLight": "#DB9FDB",
    "messageBubbleOwn": "#36155B",
    "messageBubbleOther": "#F2EFF6",
    "accent": "#B931B9",
    "backgroundGradient": {
      "type": "diagonal",
      "colors": [
        "#F2EFF5",
        "#F2EEF6",
        "#ECDFEC",
        "#F2EFF6"
      ]
    }
  },
  "OLIVE_GROVE": {
    "primary": "#4B5B15",
    "primaryDark": "#364210",
    "primaryLight": "#AFC662",
    "secondary": "#4CA630",
    "secondaryDark": "#2F671E",
    "secondaryLight": "#9AD289",
    "messageBubbleOwn": "#4B5B15",
    "messageBubbleOther": "#242B10",
    "accent": "#73D256",
    "backgroundGradient": {
      "type": "vertical",
      "colors": [
        "#0A0C03",
        "#171B09",
        "#262D10",
        "#364210"
      ]
    }
  },
  "TURQUOISE_BAY": {
    "primary": "#155B59",
    "primaryDark": "#176361",
    "primaryLight": "#80D1CE",
    "secondary": "#2E669E",
    "secondaryDark": "#20476F",
    "secondaryLight": "#9FBDDB",
    "messageBubbleOwn": "#155B59",
    "messageBubbleOther": "#EFF6F6",
    "accent": "#3175B9",
    "backgroundGradient": {
      "type": "diagonal",
      "colors": [
        "#EFF5F5",
        "#EEF6F6",
        "#DFE6EC",
        "#EFF6F5"
      ]
    }
  },
  "SANDSTONE": {
    "primary": "#5B3D15",
    "primaryDark": "#634217",
    "primaryLight": "#D1AE80",
    "secondary": "#939E2E",
    "secondaryDark": "#676F20",
    "secondaryLight": "#D5DB9F",
    "messageBubbleOwn": "#5B3D15",
    "messageBubbleOther": "#F6F3EF",
    "accent": "#ACB931",
    "backgroundGradient": {
      "type": "diagonal",
      "colors": [
        "#F5F3EF",
        "#F6F3EE",
        "#EBECDF",
        "#F6F3EF"
      ]
    }
  },
  "MIDNIGHT_NAVY": {
    "primary": "#152F5B",
    "primaryDark": "#102242",
    "primaryLight": "#6286C6",
    "secondary": "#4430A6",
    "secondaryDark": "#2A1E67",
    "secondaryLight": "#9589D2",
    "messageBubbleOwn": "#152F5B",
    "messageBubbleOther": "#101A2B",
    "accent": "#6A56D2",
    "backgroundGradient": {
      "type": "vertical",
      "colors": [
        "#03070C",
        "#090F1B",
        "#101B2D",
        "#102242"
      ]
    }
  },
  "BLUSH_GARDEN": {
    "primary": "#5B1531",
    "primaryDark": "#631736",
    "primaryLight": "#D180A0",
    "secondary": "#9E3D2E",
    "secondaryDark": "#6F2B20",
    "secondaryLight": "#DBA79F",
    "messageBubbleOwn": "#5B1531",
    "messageBubbleOther": "#F6EFF2",
    "accent": "#B94331",
    "backgroundGradient": {
      "type": "diagonal",
      "colors": [
        "#F5EFF2",
        "#F6EEF1",
        "#ECE1DF",
        "#F6EFF2"
      ]
    }
  },
  "MOSS_STONE": {
    "primary": "#155B41",
    "primaryDark": "#104230",
    "primaryLight": "#62C6A1",
    "secondary": "#3092A6",
    "secondaryDark": "#1E5B67",
    "secondaryLight": "#89C6D2",
    "messageBubbleOwn": "#155B41",
    "messageBubbleOther": "#102B21",
    "accent": "#56BDD2",
    "backgroundGradient": {
      "type": "vertical",
      "colors": [
        "#030C09",
        "#091B14",
        "#102D23",
        "#104230"
      ]
    }
  },
  "ESPRESSO": {
    "primary": "#5B3315",
    "primaryDark": "#422510",
    "primaryLight": "#C68D62",
    "secondary": "#A6A230",
    "secondaryDark": "#67641E",
    "secondaryLight": "#D2D089",
    "messageBubbleOwn": "#5B3315",
    "messageBubbleOther": "#2B1C10",
    "accent": "#D2CE56",
    "backgroundGradient": {
      "type": "vertical",
      "colors": [
        "#0C0703",
        "#1B1109",
        "#2D1D10",
        "#422510"
      ]
    }
  },
  "STEEL_TEAL": {
    "primary": "#154F5B",
    "primaryDark": "#103A42",
    "primaryLight": "#62B5C6",
    "secondary": "#3054A6",
    "secondaryDark": "#1E3467",
    "secondaryLight": "#899FD2",
    "messageBubbleOwn": "#154F5B",
    "messageBubbleOther": "#10262B",
    "accent": "#567BD2",
    "backgroundGradient": {
      "type": "vertical",
      "colors": [
        "#030A0C",
        "#09181B",
        "#10282D",
        "#103A42"
      ]
    }
  },
  "WHEAT_FIELD": {
    "primary": "#5B4815",
    "primaryDark": "#634F17",
    "primaryLight": "#D1BB80",
    "secondary": "#809E2E",
    "secondaryDark": "#5A6F20",
    "secondaryLight": "#CBDB9F",
    "messageBubbleOwn": "#5B4815",
    "messageBubbleOther": "#F6F4EF",
    "accent": "#95B931",
    "backgroundGradient": {
      "type": "diagonal",
      "colors": [
        "#F5F4EF",
        "#F6F4EE",
        "#E8ECDF",
        "#F6F4EF"
      ]
    }
  },
  "SAPPHIRE_DEPTH": {
    "primary": "#12265E",
    "primaryDark": "#0D1C45",
    "primaryLight": "#5B79CD",
    "secondary": "#5030A6",
    "secondaryDark": "#311E67",
    "secondaryLight": "#9C89D2",
    "messageBubbleOwn": "#12265E",
    "messageBubbleOther": "#10172B",
    "accent": "#7756D2",
    "backgroundGradient": {
      "type": "vertical",
      "colors": [
        "#03060C",
        "#090E1B",
        "#10182D",
        "#0D1C45"
      ]
    }
  },
  "EMERALD_VEIL": {
    "primary": "#135D3B",
    "primaryDark": "#0E442B",
    "primaryLight": "#5DCB98",
    "secondary": "#309EA6",
    "secondaryDark": "#1E6267",
    "secondaryLight": "#89CDD2",
    "messageBubbleOwn": "#135D3B",
    "messageBubbleOther": "#102B1E",
    "accent": "#56CAD2",
    "backgroundGradient": {
      "type": "vertical",
      "colors": [
        "#030C08",
        "#091B12",
        "#102D20",
        "#0E442B"
      ]
    }
  },
  "GARNET_EMBER": {
    "primary": "#5A161C",
    "primaryDark": "#411014",
    "primaryLight": "#C4646C",
    "secondary": "#A66530",
    "secondaryDark": "#673F1E",
    "secondaryLight": "#D2AA89",
    "messageBubbleOwn": "#5A161C",
    "messageBubbleOther": "#2B1012",
    "accent": "#D28E56",
    "backgroundGradient": {
      "type": "vertical",
      "colors": [
        "#0C0304",
        "#1B090A",
        "#2D1012",
        "#411014"
      ]
    }
  },
  "ONYX_GOLD": {
    "primary": "#574419",
    "primaryDark": "#3F3212",
    "primaryLight": "#BFA569",
    "secondary": "#A68330",
    "secondaryDark": "#67511E",
    "secondaryLight": "#D2BC89",
    "messageBubbleOwn": "#574419",
    "messageBubbleOther": "#2B2310",
    "accent": "#D2AD56",
    "backgroundGradient": {
      "type": "vertical",
      "colors": [
        "#0C0903",
        "#1B1509",
        "#2D2410",
        "#3F3212"
      ]
    }
  },
  "AMETHYST_DUSK": {
    "primary": "#44155B",
    "primaryDark": "#311042",
    "primaryLight": "#A562C6",
    "secondary": "#A6308E",
    "secondaryDark": "#671E58",
    "secondaryLight": "#D289C3",
    "messageBubbleOwn": "#44155B",
    "messageBubbleOther": "#22102B",
    "accent": "#D256B9",
    "backgroundGradient": {
      "type": "vertical",
      "colors": [
        "#09030C",
        "#15091B",
        "#23102D",
        "#311042"
      ]
    }
  },
  "TOPAZ_GLOW": {
    "primary": "#5A4116",
    "primaryDark": "#412F10",
    "primaryLight": "#C4A164",
    "secondary": "#92A630",
    "secondaryDark": "#5B671E",
    "secondaryLight": "#C6D289",
    "messageBubbleOwn": "#5A4116",
    "messageBubbleOther": "#2B2110",
    "accent": "#BDD256",
    "backgroundGradient": {
      "type": "vertical",
      "colors": [
        "#0C0903",
        "#1B1409",
        "#2D2310",
        "#412F10"
      ]
    }
  },
  "OPAL_FROST": {
    "primary": "#22434F",
    "primaryDark": "#254956",
    "primaryLight": "#8EB4C2",
    "secondary": "#3D4E8F",
    "secondaryDark": "#2B3664",
    "secondaryLight": "#A2ADD7",
    "messageBubbleOwn": "#22434F",
    "messageBubbleOther": "#EFF4F6",
    "accent": "#314CB9",
    "backgroundGradient": {
      "type": "diagonal",
      "colors": [
        "#EFF4F5",
        "#EEF4F6",
        "#DFE2EC",
        "#EFF4F6"
      ]
    }
  },
  "OBSIDIAN_ROSE": {
    "primary": "#57192A",
    "primaryDark": "#3F121E",
    "primaryLight": "#BF6980",
    "secondary": "#A65030",
    "secondaryDark": "#67311E",
    "secondaryLight": "#D29C89",
    "messageBubbleOwn": "#57192A",
    "messageBubbleOther": "#2B1017",
    "accent": "#D27756",
    "backgroundGradient": {
      "type": "vertical",
      "colors": [
        "#0C0306",
        "#1B090E",
        "#2D1018",
        "#3F121E"
      ]
    }
  },
  "PLATINUM_MIST": {
    "primary": "#273549",
    "primaryDark": "#1D2635",
    "primaryLight": "#748DB4",
    "secondary": "#544B8B",
    "secondaryDark": "#342E56",
    "secondaryLight": "#9B95C6",
    "messageBubbleOwn": "#273549",
    "messageBubbleOther": "#101B2B",
    "accent": "#6656D2",
    "backgroundGradient": {
      "type": "vertical",
      "colors": [
        "#03070C",
        "#09101B",
        "#101C2D",
        "#1D2635"
      ]
    }
  },
  "CELESTITE": {
    "primary": "#241F51",
    "primaryDark": "#272259",
    "primaryLight": "#938EC2",
    "secondary": "#723894",
    "secondaryDark": "#502768",
    "secondaryLight": "#C59FDB",
    "messageBubbleOwn": "#241F51",
    "messageBubbleOther": "#EFEFF6",
    "accent": "#8731B9",
    "backgroundGradient": {
      "type": "diagonal",
      "colors": [
        "#F0EFF5",
        "#EFEEF6",
        "#E7DFEC",
        "#F0EFF6"
      ]
    }
  },
  "HARBOR_MIST": {
    "primary": "#153E5B",
    "primaryDark": "#174463",
    "primaryLight": "#80AFD1",
    "secondary": "#2E349E",
    "secondaryDark": "#20246F",
    "secondaryLight": "#9FA2DB",
    "messageBubbleOwn": "#153E5B",
    "messageBubbleOther": "#EFF3F6",
    "accent": "#3138B9",
    "backgroundGradient": {
      "type": "diagonal",
      "colors": [
        "#EFF3F5",
        "#EEF3F6",
        "#DFE0EC",
        "#EFF3F6"
      ]
    }
  },
  "WILD_BERRY": {
    "primary": "#5B154F",
    "primaryDark": "#42103A",
    "primaryLight": "#C662B5",
    "secondary": "#A63054",
    "secondaryDark": "#671E34",
    "secondaryLight": "#D2899F",
    "messageBubbleOwn": "#5B154F",
    "messageBubbleOther": "#2B1026",
    "accent": "#D2567B",
    "backgroundGradient": {
      "type": "vertical",
      "colors": [
        "#0C030A",
        "#1B0918",
        "#2D1028",
        "#42103A"
      ]
    }
  },
  "BASIL": {
    "primary": "#155B21",
    "primaryDark": "#176324",
    "primaryLight": "#80D18D",
    "secondary": "#2E9E7C",
    "secondaryDark": "#206F57",
    "secondaryLight": "#9FDBC9",
    "messageBubbleOwn": "#155B21",
    "messageBubbleOther": "#EFF6F0",
    "accent": "#31B991",
    "backgroundGradient": {
      "type": "diagonal",
      "colors": [
        "#EFF5F0",
        "#EEF6F0",
        "#DFECE8",
        "#EFF6F0"
      ]
    }
  },
  "CINNAMON": {
    "primary": "#5B2D15",
    "primaryDark": "#422010",
    "primaryLight": "#C68362",
    "secondary": "#A69630",
    "secondaryDark": "#675D1E",
    "secondaryLight": "#D2C889",
    "messageBubbleOwn": "#5B2D15",
    "messageBubbleOther": "#2B1910",
    "accent": "#D2C156",
    "backgroundGradient": {
      "type": "vertical",
      "colors": [
        "#0C0603",
        "#1B0F09",
        "#2D1A10",
        "#422010"
      ]
    }
  }
};
