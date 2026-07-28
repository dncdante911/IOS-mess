import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  ListRenderItemInfo,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { storageService } from '../../services/storageService';
import { useTranslation, useI18nStore, type Language } from '../../i18n';
import { useTheme } from '../../theme';

type LanguageNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'LanguageSelection'>;

/**
 * Пункт списка. Назван LanguageOption, а не Language: тип `Language` из i18n —
 * это код языка ('uk' | 'ru' | 'en'), и одноимённый локальный интерфейс
 * перекрывал импорт (TS2440).
 */
interface LanguageOption {
  code: Language;
  flag: string;
  name: string;
  nativeName: string;
}

/**
 * Ровно три языка — те, для которых есть словари в i18n/.
 *
 * Раньше список содержал ещё пять (de, es, fr, pl, pt), которых в переводах
 * нет: выбор немецкого молча подменялся английским. Показывать язык, который
 * не работает, хуже, чем не показывать его вовсе. Появятся словари — строка
 * добавляется сюда, и `code` тут же проверится компилятором.
 */
const LANGUAGES: LanguageOption[] = [
  { code: 'uk', flag: '🇺🇦', name: 'Ukrainian', nativeName: 'Українська' },
  { code: 'ru', flag: '🇷🇺', name: 'Russian', nativeName: 'Русский' },
  { code: 'en', flag: '🇬🇧', name: 'English', nativeName: 'English' },
];

export function LanguageSelectionScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigation = useNavigation<LanguageNavigationProp>();
  // Украинский по умолчанию — как язык по умолчанию всего приложения.
  const [selectedCode, setSelectedCode] = useState<Language>('uk');
  const [isSaving, setIsSaving] = useState(false);

  const handleContinue = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      // Приведение больше не нужно: selectedCode берётся из LANGUAGES, где
      // code уже типизирован как Language, а неподдерживаемых вариантов в
      // списке нет.
      await useI18nStore.getState().setLanguage(selectedCode);
      await storageService.setFirstLaunchDone();
      navigation.replace('Login');
    } catch {
      setIsSaving(false);
    }
  };

  const renderItem = ({ item }: ListRenderItemInfo<LanguageOption>) => {
    const isSelected = item.code === selectedCode;
    return (
      <TouchableOpacity
        style={[
          styles.languageItem,
          { backgroundColor: theme.surface },
          isSelected && { backgroundColor: theme.surfaceElevated, borderWidth: 1.5, borderColor: theme.primary },
        ]}
        onPress={() => setSelectedCode(item.code)}
        activeOpacity={0.7}
      >
        <Text style={styles.flag}>{item.flag}</Text>
        <View style={styles.languageTextContainer}>
          <Text style={[styles.languageName, { color: theme.text }]}>{item.name}</Text>
          {item.name !== item.nativeName && (
            <Text style={[styles.nativeName, { color: theme.textTertiary }]}>{item.nativeName}</Text>
          )}
        </View>
        {isSelected && (
          <View style={[styles.checkmark, { backgroundColor: theme.primary }]}>
            <Text style={[styles.checkmarkText, { color: theme.white }]}>✓</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.background} />
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>{t('language_selection_title')}</Text>
          <Text style={[styles.subtitle, { color: theme.textTertiary }]}>{t('language_selection_subtitle')}</Text>
        </View>

        <FlatList
          data={LANGUAGES}
          keyExtractor={(item) => item.code}
          renderItem={renderItem}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />

        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.continueButton,
              { backgroundColor: theme.primary, shadowColor: theme.primary },
              isSaving && styles.continueButtonDisabled,
            ]}
            onPress={handleContinue}
            activeOpacity={0.85}
            disabled={isSaving}
          >
            <Text style={[styles.continueButtonText, { color: theme.white }]}>{t('language_continue')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 14,
  },
  flag: {
    fontSize: 28,
    marginRight: 16,
  },
  languageTextContainer: {
    flex: 1,
  },
  languageName: {
    fontSize: 16,
    fontWeight: '600',
  },
  nativeName: {
    fontSize: 13,
    marginTop: 2,
  },
  checkmark: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    fontSize: 14,
    fontWeight: '700',
  },
  separator: {
    height: 8,
  },
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    paddingBottom: 32,
  },
  continueButton: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  continueButtonDisabled: {
    opacity: 0.6,
  },
  continueButtonText: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
