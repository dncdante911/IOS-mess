// АВТОГЕНЕРАЦИЯ: копия windows-messenger/src/channelTheme.ts (scripts/port-windows-api.mjs). Руками не править.
// Channel premium customization — shared theme helpers.
// Server (channel-premium.js PRESETS) is the source of truth for valid values;
// this module maps them to concrete CSS for the client.

export interface ChannelCustomization {
  accent_color_id?:        string | null;
  banner_pattern_id?:      string | null;
  emoji_pack_id?:          string | null;
  font_weight?:            string | null;
  post_corner_radius?:     number | null;
  avatar_frame?:           string | null;
  posts_backdrop_enabled?: boolean;
  background_id?:          string | null;
  background_image_url?:   string | null;
  bubble_style?:           string | null;
  font_family?:            string | null;
  logo_style?:             string | null;
  // Custom fields — stored server-side, injected client-side
  custom_font_url?:        string | null;
  custom_font_name?:       string | null;
  custom_bubble_css?:      string | null;
  custom_background_css?:  string | null;
}

// Accent palettes → [primary, secondary] used for --accent / --accent-2.
export const ACCENT_PALETTES: Record<string, [string, string]> = {
  gold:        ['#d4af37', '#f0d77b'],
  rose_gold:   ['#e6a4b4', '#f4c9d2'],
  emerald:     ['#2ecc71', '#6fe0a0'],
  sapphire:    ['#2b6cb0', '#5aa0e0'],
  amethyst:    ['#9b59b6', '#c08fd6'],
  crimson:     ['#e74c3c', '#f08a80'],
  ocean:       ['#1ca9c9', '#6fd6e6'],
  sunset:      ['#ff7e5f', '#feb47b'],
  graphite:    ['#6b7280', '#9aa3af'],
  // Extended palette
  coral:       ['#ff6b6b', '#ff9f9f'],
  teal:        ['#20b2aa', '#5de8e0'],
  violet:      ['#7c3aed', '#a78bfa'],
  mint:        ['#34d399', '#6ee7b7'],
  peach:       ['#f97316', '#fdba74'],
  steel:       ['#64748b', '#94a3b8'],
  copper:      ['#b45309', '#d97706'],
  jade:        ['#059669', '#34d399'],
  ruby:        ['#be123c', '#fb7185'],
  cobalt:      ['#1d4ed8', '#60a5fa'],
  khaki:       ['#a16207', '#d4a017'],
  aurora:      ['#8b5cf6', '#06b6d4'],
  neon_green:  ['#39ff14', '#7fff6a'],
  neon_blue:   ['#00f5ff', '#7af5ff'],
  neon_pink:   ['#ff007f', '#ff6ec7'],
  silver:      ['#9ca3af', '#d1d5db'],
};

// Font family presets. key → { stack: CSS font-family value, gf?: Google Fonts URL, label }
export interface FontDef { stack: string; gf?: string; label: string; }
export const FONT_FAMILIES: Record<string, FontDef> = {
  // System / no-download
  system:      { stack: 'inherit',                                                    label: 'System' },
  rounded:     { stack: '"Nunito", "Segoe UI", system-ui, sans-serif',
                 gf: 'https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&display=swap', label: 'Rounded' },
  serif:       { stack: '"Georgia", "Times New Roman", serif',                        label: 'Classic Serif' },
  mono:        { stack: '"JetBrains Mono", "Cascadia Code", Consolas, monospace',
                 gf: 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap', label: 'JetBrains Mono' },
  display:     { stack: '"Russo One", Montserrat, system-ui, sans-serif',
                 gf: 'https://fonts.googleapis.com/css2?family=Russo+One&display=swap', label: 'Russo One' },
  // Google Fonts — sans-serif
  inter:       { stack: '"Inter", system-ui, sans-serif',
                 gf: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap', label: 'Inter' },
  roboto:      { stack: '"Roboto", system-ui, sans-serif',
                 gf: 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap', label: 'Roboto' },
  poppins:     { stack: '"Poppins", system-ui, sans-serif',
                 gf: 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap', label: 'Poppins' },
  lato:        { stack: '"Lato", system-ui, sans-serif',
                 gf: 'https://fonts.googleapis.com/css2?family=Lato:wght@400;700&display=swap', label: 'Lato' },
  opensans:    { stack: '"Open Sans", system-ui, sans-serif',
                 gf: 'https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700&display=swap', label: 'Open Sans' },
  raleway:     { stack: '"Raleway", system-ui, sans-serif',
                 gf: 'https://fonts.googleapis.com/css2?family=Raleway:wght@400;600;700&display=swap', label: 'Raleway' },
  nunito:      { stack: '"Nunito", system-ui, sans-serif',
                 gf: 'https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&display=swap', label: 'Nunito' },
  ubuntu:      { stack: '"Ubuntu", system-ui, sans-serif',
                 gf: 'https://fonts.googleapis.com/css2?family=Ubuntu:wght@400;500;700&display=swap', label: 'Ubuntu' },
  montserrat:  { stack: '"Montserrat", system-ui, sans-serif',
                 gf: 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap', label: 'Montserrat' },
  oswald:      { stack: '"Oswald", system-ui, sans-serif',
                 gf: 'https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600&display=swap', label: 'Oswald' },
  josefinsans: { stack: '"Josefin Sans", system-ui, sans-serif',
                 gf: 'https://fonts.googleapis.com/css2?family=Josefin+Sans:wght@400;600;700&display=swap', label: 'Josefin Sans' },
  comfortaa:   { stack: '"Comfortaa", system-ui, sans-serif',
                 gf: 'https://fonts.googleapis.com/css2?family=Comfortaa:wght@400;600;700&display=swap', label: 'Comfortaa' },
  quicksand:   { stack: '"Quicksand", system-ui, sans-serif',
                 gf: 'https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600;700&display=swap', label: 'Quicksand' },
  exo2:        { stack: '"Exo 2", system-ui, sans-serif',
                 gf: 'https://fonts.googleapis.com/css2?family=Exo+2:wght@400;500;600;700&display=swap', label: 'Exo 2' },
  // Google Fonts — serif
  playfair:    { stack: '"Playfair Display", Georgia, serif',
                 gf: 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&display=swap', label: 'Playfair Display' },
  merriweather:{ stack: '"Merriweather", Georgia, serif',
                 gf: 'https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&display=swap', label: 'Merriweather' },
  crimsontext: { stack: '"Crimson Text", Georgia, serif',
                 gf: 'https://fonts.googleapis.com/css2?family=Crimson+Text:wght@400;600&display=swap', label: 'Crimson Text' },
  // Google Fonts — display / handwriting
  dancingscript:{ stack: '"Dancing Script", cursive',
                  gf: 'https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;700&display=swap', label: 'Dancing Script' },
  pacifico:    { stack: '"Pacifico", cursive',
                 gf: 'https://fonts.googleapis.com/css2?family=Pacifico&display=swap', label: 'Pacifico' },
  righteous:   { stack: '"Righteous", system-ui, sans-serif',
                 gf: 'https://fonts.googleapis.com/css2?family=Righteous&display=swap', label: 'Righteous' },
  // Google Fonts — monospace
  sourcecode:  { stack: '"Source Code Pro", Consolas, monospace',
                 gf: 'https://fonts.googleapis.com/css2?family=Source+Code+Pro:wght@400;500&display=swap', label: 'Source Code Pro' },
  firacode:    { stack: '"Fira Code", Consolas, monospace',
                 gf: 'https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500&display=swap', label: 'Fira Code' },
  spacemono:   { stack: '"Space Mono", Consolas, monospace',
                 gf: 'https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap', label: 'Space Mono' },
  // Placeholder for fully custom font URL
  custom:      { stack: 'inherit', label: 'Custom URL' },
};

// All non-image CSS backgrounds (rendered via .cv-bg-<id> classes in CSS).
export const CSS_BACKGROUNDS = [
  'solid_dark', 'solid_light', 'solid_slate', 'solid_charcoal',
  'gradient_aurora', 'gradient_dusk', 'gradient_ocean', 'gradient_ember', 'gradient_forest',
  'gradient_twilight', 'gradient_sunset', 'gradient_rose', 'gradient_space', 'gradient_peach',
  'gradient_mint', 'gradient_lavender', 'gradient_steel', 'gradient_gold',
  'pattern_carbon', 'pattern_topo', 'pattern_dots', 'pattern_grid',
  'anim_aurora', 'anim_nebula', 'anim_ocean', 'anim_sunset', 'anim_forest', 'anim_galaxy', 'anim_rose',
];

export function isAnimatedBg(id?: string | null): boolean {
  return !!id && id.startsWith('anim_');
}
export function isCanvasBg(id?: string | null): boolean {
  return !!id && id.startsWith('canvas_');
}
export function getCanvasBg(c?: ChannelCustomization | null): string | null {
  if (!c || c.background_image_url) return null;
  return isCanvasBg(c.background_id) ? (c.background_id as string) : null;
}

export interface ChannelTheme {
  className: string;
  style: React.CSSProperties;
  isCustom: boolean;
  // Custom CSS/font for client-side injection
  customBubbleCss?: string;
  customBackgroundCss?: string;
  customFontUrl?: string;
  customFontName?: string;
}

function resolveUrl(url: string): string {
  if (/^https?:\/\//i.test(url)) return url;
  return `https://worldmates.club/${url.replace(/^\//, '')}`;
}

export function buildChannelTheme(c?: ChannelCustomization | null): ChannelTheme {
  if (!c) return { className: '', style: {}, isCustom: false };

  const classes: string[] = ['cv-themed'];
  const style: Record<string, string> = {};
  let isCustom = false;

  // Accent palette
  if (c.accent_color_id && ACCENT_PALETTES[c.accent_color_id]) {
    const [a, a2] = ACCENT_PALETTES[c.accent_color_id];
    style['--accent']   = a;
    style['--accent-2'] = a2;
    isCustom = true;
  }

  // Corner radius
  if (typeof c.post_corner_radius === 'number') {
    style['--cv-radius'] = `${c.post_corner_radius}px`;
    isCustom = true;
  }

  // Font family — custom URL takes priority over preset
  if (c.font_family === 'custom' && c.custom_font_name) {
    style['--cv-font'] = `"${c.custom_font_name}", sans-serif`;
    classes.push('cv-has-font');
    isCustom = true;
  } else if (c.font_family && FONT_FAMILIES[c.font_family] && c.font_family !== 'system') {
    style['--cv-font'] = FONT_FAMILIES[c.font_family].stack;
    classes.push('cv-has-font');
    isCustom = true;
  }

  // Bubble style
  if (c.bubble_style && c.bubble_style !== 'default') {
    classes.push(`cv-bubble-${c.bubble_style}`);
    isCustom = true;
  }

  // Banner pattern (header)
  if (c.banner_pattern_id && c.banner_pattern_id !== 'none') {
    classes.push(`cv-pattern-${c.banner_pattern_id}`);
    isCustom = true;
  }

  // Logo style
  if (c.logo_style && c.logo_style !== 'default') {
    classes.push(`cv-logo-${c.logo_style}`);
    isCustom = true;
  }

  // Avatar frame
  if (c.avatar_frame && c.avatar_frame !== 'none') {
    classes.push(`cv-frame-${c.avatar_frame}`);
    isCustom = true;
  }

  // Posts backdrop
  if (c.posts_backdrop_enabled) {
    classes.push('cv-backdrop');
    isCustom = true;
  }

  // Background: custom image wins, then canvas, then CSS preset.
  // Custom background CSS is an additional override (applied via inline style injection).
  if (c.background_image_url) {
    style['--cv-bg-image'] = `url("${resolveUrl(c.background_image_url)}")`;
    classes.push('cv-has-bgimg');
    isCustom = true;
  } else if (c.background_id && isCanvasBg(c.background_id)) {
    classes.push('cv-has-canvasbg');
    isCustom = true;
  } else if (c.background_id && CSS_BACKGROUNDS.includes(c.background_id)) {
    classes.push('cv-has-cssbg', `cv-bg-${c.background_id}`);
    if (isAnimatedBg(c.background_id)) classes.push('cv-bg-animated');
    isCustom = true;
  }

  // Resolve Google Font URL for preset fonts
  let customFontUrl: string | undefined;
  if (c.font_family === 'custom' && c.custom_font_url) {
    customFontUrl = c.custom_font_url;
  } else if (c.font_family && FONT_FAMILIES[c.font_family]?.gf) {
    customFontUrl = FONT_FAMILIES[c.font_family].gf;
  }

  return {
    className: classes.join(' '),
    style: style as React.CSSProperties,
    isCustom,
    customBubbleCss:     c.custom_bubble_css     || undefined,
    customBackgroundCss: c.custom_background_css  || undefined,
    customFontUrl,
    customFontName:      c.custom_font_name       || undefined,
  };
}
