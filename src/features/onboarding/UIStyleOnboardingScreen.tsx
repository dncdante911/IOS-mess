/**
 * Онбординг после первого входа — порт Android ui/onboarding/UIStyleOnboardingActivity.kt.
 *  Шаг 1 — режим приложения (полный / только общение).
 *  Шаг 2 — стиль списка чатов (только для полного режима; в Lite пропускается).
 * «Пропустить» — полный режим и стиль WallyMates по умолчанию.
 */
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from '../../i18n';
import { useWMTheme } from '../../theme/themeManager';
import { withAlpha } from '../../theme/wmTheme';
import { AppModePreferences, UIStylePreferences, useUIStyle, type AppMode, type UIStyle } from '../../preferences/uiStyle';
import { AppModeSelector } from '../themeSettings/sections';
import type { RootStackParamList } from '../../navigation/types';

const BRAND: [string, string] = ['#1565C0', '#6A1B9A'];

function GradientCTA({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.cta}>
      <LinearGradient colors={BRAND} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.ctaFill}>
        <Text style={{ fontSize: 16, fontWeight: '600', color: '#FFFFFF' }}>{label}</Text>
      </LinearGradient>
    </Pressable>
  );
}

function Header({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle: string }) {
  const cs = useWMTheme().colorScheme;
  return (
    <>
      <LinearGradient colors={BRAND} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.logo}>
        {icon}
      </LinearGradient>
      <View style={{ height: 20 }} />
      <Text style={[styles.title, { color: cs.onBackground }]}>{title}</Text>
      <View style={{ height: 8 }} />
      <Text style={[styles.subtitle, { color: withAlpha(cs.onBackground, 0.55) }]}>{subtitle}</Text>
      <View style={{ height: 36 }} />
    </>
  );
}

function StyleCard({
  isSelected,
  onPress,
  title,
  subtitle,
  preview,
}: {
  isSelected: boolean;
  onPress: () => void;
  title: string;
  subtitle: string;
  preview: React.ReactNode;
}) {
  const cs = useWMTheme().colorScheme;
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.styleCard,
        {
          backgroundColor: isSelected ? withAlpha(cs.primaryContainer, 0.35) : cs.surface,
          borderWidth: isSelected ? 2 : 1,
          borderColor: isSelected ? '#1565C0' : withAlpha('#000000', 0.08),
          shadowRadius: isSelected ? 6 : 1.5,
        },
      ]}
    >
      <View style={[styles.preview, { backgroundColor: cs.surfaceVariant }]}>{preview}</View>
      <View style={{ flex: 1, marginLeft: 16 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', color: cs.onSurface }}>{title}</Text>
        <Text style={{ fontSize: 13, lineHeight: 18, marginTop: 4, color: withAlpha(cs.onSurface, 0.6) }}>{subtitle}</Text>
      </View>
      <View style={[styles.radio, { backgroundColor: isSelected ? '#1565C0' : 'transparent', borderColor: isSelected ? '#1565C0' : withAlpha(cs.outline, 0.4) }]}>
        {isSelected && <MaterialCommunityIcons name="check" size={14} color="#FFFFFF" />}
      </View>
    </Pressable>
  );
}

/** Мини-превью карточного списка WallyMates. */
function WorldMatesPreview() {
  return (
    <View style={{ flex: 1, padding: 6, gap: 5 }}>
      {[0, 1, 2].map((i) => (
        <LinearGradient
          key={i}
          colors={[withAlpha('#1565C0', 0.6 - i * 0.12), withAlpha('#6A1B9A', 0.4 - i * 0.08)]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={{ height: 14, borderRadius: 4 }}
        />
      ))}
    </View>
  );
}

/** Мини-превью классического списка. */
function ClassicPreview() {
  const cs = useWMTheme().colorScheme;
  return (
    <View style={{ flex: 1, padding: 6, gap: 5 }}>
      {[0, 1, 2].map((i) => (
        <View key={i} style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: withAlpha(cs.onSurfaceVariant, 0.3 - i * 0.06) }} />
          <View style={{ flex: 1, height: 8, borderRadius: 3, marginLeft: 4, backgroundColor: withAlpha(cs.onSurfaceVariant, 0.18 - i * 0.04) }} />
        </View>
      ))}
    </View>
  );
}

export default function UIStyleOnboardingScreen() {
  const theme = useWMTheme();
  const { t } = useTranslation();
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [step, setStep] = useState(0);
  const [mode, setMode] = useState<AppMode>(useUIStyle.getState().appMode);
  const [style, setStyle] = useState<UIStyle>('WORLDMATES');
  const cs = theme.colorScheme;

  const done = () => nav.reset({ index: 0, routes: [{ name: 'Main' as never }] });

  const continueMode = (m: AppMode) => {
    AppModePreferences.setMode(m);
    if (m === 'LITE') {
      UIStylePreferences.markOnboardingSeen();
      done();
    } else {
      setStep(1);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: cs.background }}>
      <View style={styles.column}>
        {step === 0 ? (
          <>
            <Header icon={<Text style={{ fontSize: 30 }}>💬</Text>} title={t('app_mode_onboarding_title')} subtitle={t('app_mode_hint')} />
            <View style={{ alignSelf: 'stretch' }}>
              <AppModeSelector selected={mode} onSelect={setMode} />
            </View>
            <View style={{ flex: 1 }} />
            <GradientCTA label={t('action_continue')} onPress={() => continueMode(mode)} />
            <Pressable onPress={() => continueMode('FULL')} style={styles.skip}>
              <Text style={{ fontSize: 14, color: withAlpha(cs.onBackground, 0.45) }}>{t('action_skip')}</Text>
            </Pressable>
          </>
        ) : (
          <>
            <Header
              icon={<MaterialCommunityIcons name="star" size={32} color="#FFFFFF" />}
              title={t('ui_style_onboarding_title')}
              subtitle={t('ui_style_onboarding_subtitle')}
            />
            <StyleCard
              isSelected={style === 'WORLDMATES'}
              onPress={() => setStyle('WORLDMATES')}
              title="WallyMates"
              subtitle={t('ui_style_modern_subtitle')}
              preview={<WorldMatesPreview />}
            />
            <View style={{ height: 16 }} />
            <StyleCard
              isSelected={style === 'TELEGRAM'}
              onPress={() => setStyle('TELEGRAM')}
              title={t('ui_style_classic_title')}
              subtitle={t('ui_style_classic_subtitle')}
              preview={<ClassicPreview />}
            />
            <View style={{ flex: 1 }} />
            <GradientCTA
              label={t('action_continue')}
              onPress={() => {
                UIStylePreferences.setStyle(style);
                UIStylePreferences.markOnboardingSeen();
                done();
              }}
            />
            <Pressable
              onPress={() => {
                UIStylePreferences.markOnboardingSeen();
                done();
              }}
              style={styles.skip}
            >
              <Text style={{ fontSize: 14, color: withAlpha(cs.onBackground, 0.45) }}>{t('action_skip')}</Text>
            </Pressable>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  column: { flex: 1, paddingHorizontal: 24, paddingTop: 40, paddingBottom: 24, alignItems: 'center' },
  logo: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 26, fontWeight: '700', textAlign: 'center', lineHeight: 32 },
  subtitle: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  cta: { alignSelf: 'stretch', height: 52, borderRadius: 14, overflow: 'hidden' },
  ctaFill: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  skip: { marginTop: 12, padding: 8 },
  styleCard: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
  },
  preview: { width: 72, height: 72, borderRadius: 10, overflow: 'hidden' },
  radio: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, alignItems: 'center', justifyContent: 'center', marginLeft: 12 },
});
