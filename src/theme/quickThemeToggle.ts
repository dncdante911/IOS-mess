/**
 * QuickThemeToggle — порт Android ui/theme/QuickThemeToggle.kt: переключатель
 * светлой/тёмной темы в один тап (боковое меню).
 *
 * У палитр prefersDark=false одно переключение флага ничего не меняло видимо,
 * поэтому «в тёмную» на светлой палитре переходит на тёмную палитру (последнюю
 * использованную, иначе Dark Slate) и запоминает светлую, которую «в светлую»
 * потом возвращает.
 */
import { kv } from '../core/platform/kv';
import { ThemeManager, useThemeState, type ThemeState } from './themeManager';
import { THEME_VARIANTS, type ThemeVariant } from './gen/variants';

const KEY_RESTORE_LIGHT = 'qtt_restore_light_variant';
const KEY_LAST_DARK = 'qtt_last_dark_variant';

const isVariant = (v: string | null): v is ThemeVariant => !!v && v in THEME_VARIANTS;

export const QuickThemeToggle = {
  /** То, что видит пользователь (как effectiveDark в WorldMatesThemedApp). */
  isEffectivelyDark(state: ThemeState = useThemeState.getState()): boolean {
    return state.isDark && THEME_VARIANTS[state.variant].prefersDark;
  },

  toggle(): void {
    const state = useThemeState.getState();
    ThemeManager.setSystemTheme(false);
    if (QuickThemeToggle.isEffectivelyDark(state)) {
      kv.setItem(KEY_LAST_DARK, state.variant);
      const restore = kv.getItem(KEY_RESTORE_LIGHT);
      if (isVariant(restore)) {
        ThemeManager.setThemeVariant(restore);
        kv.removeItem(KEY_RESTORE_LIGHT);
      }
      ThemeManager.setDarkTheme(false);
    } else {
      if (!THEME_VARIANTS[state.variant].prefersDark) {
        kv.setItem(KEY_RESTORE_LIGHT, state.variant);
        const last = kv.getItem(KEY_LAST_DARK);
        const target: ThemeVariant = isVariant(last) && THEME_VARIANTS[last].prefersDark ? last : 'MONOCHROME';
        ThemeManager.setThemeVariant(target);
      }
      ThemeManager.setDarkTheme(true);
    }
  },
};
