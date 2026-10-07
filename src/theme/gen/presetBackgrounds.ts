// АВТОГЕНЕРАЦИЯ: scripts/gen-android-theme.mjs из Android ui/theme. Руками не править.
/* eslint-disable */

export interface PresetBackground {
  key: string;
  /** хранится и синхронизируется по id */
  id: string;
  nameKey: string;
  /** рисуется Brush.verticalGradient(colors) + чёрный оверлей 8% */
  colors: string[];
  isDark: boolean;
}

/** enum class PresetBackground (ThemeSettingsScreen.kt) */
export const PRESET_BACKGROUNDS: PresetBackground[] = [
  {
    "key": "MIDNIGHT",
    "id": "midnight",
    "nameKey": "bg_midnight",
    "colors": [
      "#0A0E27",
      "#1A237E",
      "#0D2137"
    ],
    "isDark": true
  },
  {
    "key": "SUNSET",
    "id": "sunset",
    "nameKey": "bg_sunset",
    "colors": [
      "#FFB347",
      "#FF6B35",
      "#D44000",
      "#7B1FA2"
    ],
    "isDark": true
  },
  {
    "key": "PEACH",
    "id": "peach",
    "nameKey": "bg_peach",
    "colors": [
      "#FFF3E0",
      "#FFCC80",
      "#FF9A5C"
    ],
    "isDark": false
  },
  {
    "key": "FIRE",
    "id": "fire",
    "nameKey": "bg_fire",
    "colors": [
      "#7F0000",
      "#BF360C",
      "#FF6F00",
      "#FFD54F"
    ],
    "isDark": true
  },
  {
    "key": "SAND_DUNES",
    "id": "sand_dunes",
    "nameKey": "bg_sand_dunes",
    "colors": [
      "#FFF8DC",
      "#EDCB84",
      "#C8965C"
    ],
    "isDark": false
  },
  {
    "key": "SPRING",
    "id": "spring",
    "nameKey": "bg_spring",
    "colors": [
      "#FFF0F5",
      "#FFD6E8",
      "#FFC8C8",
      "#D4EDAA",
      "#8BC34A"
    ],
    "isDark": false
  },
  {
    "key": "WINTER",
    "id": "winter",
    "nameKey": "bg_winter",
    "colors": [
      "#F8FBFF",
      "#D6EAF8",
      "#85C1E9",
      "#2E86C1",
      "#1A5276"
    ],
    "isDark": false
  },
  {
    "key": "LAVENDER",
    "id": "lavender",
    "nameKey": "bg_lavender",
    "colors": [
      "#EDE7F6",
      "#D1C4E9",
      "#9575CD"
    ],
    "isDark": false
  },
  {
    "key": "COTTON_CANDY",
    "id": "cotton_candy",
    "nameKey": "bg_cotton_candy",
    "colors": [
      "#FFD6E0",
      "#FFAFCC",
      "#CDB4DB",
      "#A2D2FF"
    ],
    "isDark": false
  },
  {
    "key": "MORNING_MIST",
    "id": "morning_mist",
    "nameKey": "bg_morning_mist",
    "colors": [
      "#F5F7FA",
      "#DDE8F5",
      "#B0CCE9"
    ],
    "isDark": false
  },
  {
    "key": "AURORA",
    "id": "aurora",
    "nameKey": "bg_aurora",
    "colors": [
      "#0A1628",
      "#004D40",
      "#00BFA5",
      "#7B1FA2"
    ],
    "isDark": true
  },
  {
    "key": "COSMIC",
    "id": "cosmic",
    "nameKey": "bg_cosmic",
    "colors": [
      "#0D0221",
      "#2D1B69",
      "#6D3FC0",
      "#9C6EE8"
    ],
    "isDark": true
  },
  {
    "key": "MINT_SKY",
    "id": "mint_sky",
    "nameKey": "bg_mint_sky",
    "colors": [
      "#E0FFF4",
      "#80FFCC",
      "#00D4AA",
      "#0096C7"
    ],
    "isDark": false
  },
  {
    "key": "ARCTIC_BLUE",
    "id": "arctic_blue",
    "nameKey": "bg_arctic_blue",
    "colors": [
      "#F0FAFF",
      "#B8E8FF",
      "#56CCF2",
      "#2F80ED"
    ],
    "isDark": false
  },
  {
    "key": "DEEP_PLUM",
    "id": "deep_plum",
    "nameKey": "bg_deep_plum",
    "colors": [
      "#1A0025",
      "#3B0060",
      "#5C0080",
      "#2D0040"
    ],
    "isDark": true
  }
];

export function presetBackgroundFromId(id: string | null | undefined): PresetBackground | null {
  return PRESET_BACKGROUNDS.find((p) => p.id === id) ?? null;
}
