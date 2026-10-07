import { useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import ukHand from './uk';
import ruHand from './ru';
import enHand from './en';
import ukGen from './generated/uk';
import ruGen from './generated/ru';
import enGen from './generated/en';

export type Language = 'uk' | 'ru' | 'en';

// Строки Android (generated/*, 5 000+ ключей, те же имена, что в strings.xml)
// перекрывают ручные: эталон текста — Android. Ручные остаются для ключей,
// которых в Android нет (ранние экраны iOS).
const translations = {
  uk: { ...ukHand, ...ukGen },
  ru: { ...ruHand, ...ruGen },
  en: { ...enHand, ...enGen },
} as const;

export type TranslationKeys = keyof typeof enGen | keyof typeof ukHand;

/** Параметры: именованные {name} или позиционные {1},{2} (как %1$s в Android). */
export type TParams = Record<string, string | number> | Array<string | number>;

const LANGUAGE_KEY = 'wm_language';

interface I18nState {
  language: Language;
  /** Язык уже выбран на первом запуске (Android LanguageManager.isLanguageSelected) */
  isLanguageSelected: boolean;
  setLanguage: (lang: Language) => Promise<void>;
  _hydrate: () => Promise<void>;
}

const FIRST_LAUNCH_KEY = 'wm_language_selected';

// По умолчанию — украинский, как Android LanguageManager (LANG_UK).
export const useI18nStore = create<I18nState>((set) => ({
  language: 'uk',
  isLanguageSelected: false,
  setLanguage: async (lang: Language) => {
    await AsyncStorage.multiSet([
      [LANGUAGE_KEY, lang],
      [FIRST_LAUNCH_KEY, '1'],
    ]);
    set({ language: lang, isLanguageSelected: true });
  },
  _hydrate: async () => {
    const [[, stored], [, selected]] = await AsyncStorage.multiGet([LANGUAGE_KEY, FIRST_LAUNCH_KEY]);
    if (stored && (stored === 'uk' || stored === 'ru' || stored === 'en')) {
      // язык, сохранённый до появления флага, тоже считается выбранным
      set({ language: stored, isLanguageSelected: true });
    } else if (selected) {
      set({ isLanguageSelected: true });
    }
  },
}));

/** Порт Android utils/LanguageManager.kt */
export const LanguageManager = {
  LANG_UK: 'uk' as const,
  LANG_RU: 'ru' as const,
  LANG_EN: 'en' as const,
  SUPPORTED_LANGUAGES: ['uk', 'ru', 'en'] as Language[],
  get currentLanguage(): Language {
    return useI18nStore.getState().language;
  },
  get isLanguageSelected(): boolean {
    return useI18nStore.getState().isLanguageSelected;
  },
  setLanguage: (lang: Language) => useI18nStore.getState().setLanguage(lang),
  /** Самоназвание языка — одинаково во всех локалях. */
  getDisplayName(lang: string): string {
    return lang === 'ru' ? 'Русский' : lang === 'en' ? 'English' : 'Українська';
  },
  getFlag(lang: string): string {
    return lang === 'ru' ? '🇷🇺' : lang === 'en' ? '🇬🇧' : '🇺🇦';
  },
};

function lookup(language: Language, key: string): string | undefined {
  const dict = translations[language] as Record<string, string>;
  return dict[key] ?? (translations.en as Record<string, string>)[key];
}

function applyParams(str: string, params?: TParams): string {
  if (!params) return str;
  if (Array.isArray(params)) {
    return str.replace(/\{(\d+)\}/g, (m, n) => {
      const v = params[Number(n) - 1];
      return v === undefined ? m : String(v);
    });
  }
  return str.replace(/\{([A-Za-z0-9_]+)\}/g, (m, k) => (k in params ? String(params[k]) : m));
}

/**
 * Категория множественного числа по правилам CLDR для uk/ru/en.
 * Свой вариант, а не Intl.PluralRules: в Hermes Intl может быть урезан.
 */
export function pluralCategory(language: Language, n: number): 'one' | 'few' | 'many' | 'other' {
  const abs = Math.abs(n);
  if (!Number.isInteger(abs)) return 'other';
  if (language === 'en') return abs === 1 ? 'one' : 'other';
  const m10 = abs % 10;
  const m100 = abs % 100;
  if (m10 === 1 && m100 !== 11) return 'one';
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return 'few';
  return 'many';
}

export function translate(language: Language, key: string, params?: TParams): string {
  return applyParams(lookup(language, key) ?? key, params);
}

/** Аналог Android getQuantityString(R.plurals.key, count, ...args). */
export function translatePlural(
  language: Language,
  key: string,
  count: number,
  params?: TParams,
): string {
  const cat = pluralCategory(language, count);
  const str =
    lookup(language, `${key}_${cat}`) ??
    lookup(language, `${key}_other`) ??
    lookup(language, `${key}_many`) ??
    key;
  return applyParams(str, params ?? [count]);
}

// Hook: useTranslation
export function useTranslation() {
  const language = useI18nStore((s) => s.language);
  const setLanguage = useI18nStore((s) => s.setLanguage);

  const t = useCallback(
    (key: TranslationKeys, params?: TParams): string => translate(language, key, params),
    [language],
  );
  const tp = useCallback(
    (key: string, count: number, params?: TParams): string =>
      translatePlural(language, key, count, params),
    [language],
  );

  return { t, tp, language, setLanguage };
}

// Non-hook version (for use outside components, e.g. in stores/services)
export function getTranslation(key: TranslationKeys, language?: Language, params?: TParams): string {
  return translate(language ?? useI18nStore.getState().language, key, params);
}
