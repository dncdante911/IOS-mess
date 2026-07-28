import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

import { useI18nStore, useTranslation, type Language } from '../../i18n';
import { useTheme } from '../../theme';

/**
 * Переключатель языка uk / ru / en.
 *
 * Вынесен в общий компонент намеренно: язык нужен И до входа (экран логина,
 * регистрации, восстановления пароля), И после (настройки). Без общего
 * компонента список языков неизбежно разъехался бы между экранами.
 *
 * Подписей на конкретном языке здесь нет: названия языков тоже берутся из
 * словарей (`language_uk` / `language_ru` / `language_en`), поэтому список
 * читается на том языке, который выбран сейчас.
 */

const LANGUAGES: Array<{ code: Language; labelKey: 'language_uk' | 'language_ru' | 'language_en'; short: string }> = [
  { code: 'uk', labelKey: 'language_uk', short: 'UA' },
  { code: 'ru', labelKey: 'language_ru', short: 'RU' },
  { code: 'en', labelKey: 'language_en', short: 'EN' },
];

interface Props {
  /** 'compact' — три коротких чипа (для экранов входа), 'list' — строки со всеми названиями (для настроек). */
  variant?: 'compact' | 'list';
}

export function LanguageSwitcher({ variant = 'compact' }: Props) {
  const theme = useTheme();
  const { t } = useTranslation();
  const language = useI18nStore((s) => s.language);
  const setLanguage = useI18nStore((s) => s.setLanguage);

  if (variant === 'list') {
    return (
      <View>
        {LANGUAGES.map(({ code, labelKey }) => {
          const active = code === language;
          return (
            <TouchableOpacity
              key={code}
              onPress={() => setLanguage(code)}
              style={[styles.row, { borderBottomColor: theme.divider }]}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
            >
              <Text style={[styles.rowLabel, { color: theme.text }]}>{t(labelKey)}</Text>
              {active && <Text style={{ color: theme.primary, fontSize: 16 }}>✓</Text>}
            </TouchableOpacity>
          );
        })}
      </View>
    );
  }

  return (
    <View style={styles.compactRow}>
      {LANGUAGES.map(({ code, short, labelKey }) => {
        const active = code === language;
        return (
          <TouchableOpacity
            key={code}
            onPress={() => setLanguage(code)}
            style={[
              styles.chip,
              {
                backgroundColor: active ? theme.primary : 'transparent',
                borderColor: active ? theme.primary : theme.divider,
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel={t(labelKey)}
            accessibilityState={{ selected: active }}
          >
            <Text
              style={[
                styles.chipText,
                { color: active ? '#FFFFFF' : theme.textSecondary },
              ]}
            >
              {short}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  compactRow: { flexDirection: 'row', gap: 8, justifyContent: 'center' },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    minWidth: 46,
    alignItems: 'center',
  },
  chipText: { fontSize: 13, fontWeight: '600' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowLabel: { fontSize: 16 },
});

export default LanguageSwitcher;
