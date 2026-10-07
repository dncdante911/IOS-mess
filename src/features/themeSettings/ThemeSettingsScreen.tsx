/**
 * «Тема и оформление» — порт Android ui/theme/ThemeSettingsScreen.kt
 * (хаб из 7 категорий + подэкраны).
 *
 * Категории: Режим приложения · Готовые паки · Основной UI · Каналы ·
 * Звонки (рамки) · Видеосообщения (рамки) · Звуки.
 * 4 тапа по заголовку за 3 с — разблокировка Sandbox UI (как Android).
 * PRO-элементы без подписки ведут на экран Premium.
 */
import React, { useEffect, useRef, useState } from 'react';
import { BackHandler, Pressable, ScrollView, Text, View } from 'react-native';
import { Appbar, Button, Switch } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { useTranslation } from '../../i18n';
import { useWMTheme, ThemeManager } from '../../theme/themeManager';
import { WMTypography } from '../../theme/wmTheme';
import { WMToast } from '../../components/common/WMToast';
import { useSandboxStore } from '../../store/sandboxStore';
import type { RootStackParamList } from '../../navigation/types';
import {
  AnimatedBackgroundPickerRow,
  BackgroundCustomImageRow,
  BackgroundPresetsRows,
  BubbleStylesRow,
  ChannelViewStyleSelector,
  ChatFontSection,
  OneClickInterfacePacksSection,
  PremiumChannelsDesignTile,
  QuickReactionRow,
  ThemeAppModeContent,
  ThemeCategoryTile,
  ThemeModeSectionCard,
  ThemeSectionHeader,
  ThemeShareImportSection,
  ThemeSoundsContent,
  ThemeVariantsRows,
  UIStyleToggleRow,
} from './sections';

type Category = 'APP_MODE' | 'PACKS' | 'MAIN_UI' | 'CHANNELS' | 'CALL_FRAMES' | 'VIDEO_MSG_FRAMES' | 'SOUNDS';
type Nav = NativeStackNavigationProp<RootStackParamList>;

const TITLE_KEY: Record<Category, string> = {
  APP_MODE: 'app_mode_title',
  PACKS: 'one_click_themes',
  MAIN_UI: 'theme_cat_main_ui',
  CHANNELS: 'theme_cat_channels',
  CALL_FRAMES: 'theme_cat_calls',
  VIDEO_MSG_FRAMES: 'theme_cat_video_msg',
  SOUNDS: 'theme_cat_sounds',
};

export default function ThemeSettingsScreen() {
  const theme = useWMTheme();
  const { t } = useTranslation();
  const nav = useNavigation<Nav>();
  const [category, setCategory] = useState<Category | null>(null);
  const { devUnlocked, isEnabled: sandboxEnabled, unlockDev, toggleSandbox } = useSandboxStore();
  const taps = useRef({ count: 0, last: 0 });
  const cs = theme.colorScheme;

  const openPremium = () => nav.navigate('Premium' as never);

  // Системный «назад» внутри подменю — в хаб (BackHandler на Android; на iOS — жест/кнопка)
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (category) {
        setCategory(null);
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [category]);

  const onTitleTap = () => {
    const now = Date.now();
    if (now - taps.current.last > 3000) taps.current.count = 0;
    taps.current.last = now;
    taps.current.count++;
    if (taps.current.count >= 4 && !devUnlocked) {
      void unlockDev();
      WMToast.show('🧪 Режим розробника розблоковано');
      taps.current.count = 0;
    }
  };

  const pickBackground = async () => {
    const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 1 });
    if (!r.canceled && r.assets[0]) ThemeManager.setBackgroundImageUri(r.assets[0].uri);
  };

  const title = category ? t(TITLE_KEY[category] as never) : t('themes_title');

  return (
    <View style={{ flex: 1, backgroundColor: cs.surfaceContainer }}>
      <Appbar.Header style={{ backgroundColor: cs.surface }}>
        <Appbar.BackAction onPress={() => (category ? setCategory(null) : nav.goBack())} color={cs.onSurface} />
        <Pressable onPress={onTitleTap} style={{ flex: 1 }}>
          <Text style={[WMTypography.titleLarge, { fontWeight: '600', color: cs.onSurface }]}>{title}</Text>
        </Pressable>
      </Appbar.Header>

      {category === null && (
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
          <Text style={[WMTypography.labelLarge, { fontWeight: '600', color: cs.onSurfaceVariant, marginHorizontal: 20, marginTop: 20, marginBottom: 10 }]}>
            {t('theme_cat_section_title')}
          </Text>
          <ThemeCategoryTile emoji="💬" accentColor="#25D366" title={t('app_mode_title')} subtitle={t('app_mode_tile_desc')} onPress={() => setCategory('APP_MODE')} />
          <ThemeCategoryTile emoji="✨" accentColor="#FF6D00" title={t('one_click_themes')} subtitle={t('one_click_theme_desc')} onPress={() => setCategory('PACKS')} />
          <ThemeCategoryTile emoji="🎨" accentColor="#7C4DFF" title={t('theme_cat_main_ui')} subtitle={t('theme_cat_main_ui_desc')} onPress={() => setCategory('MAIN_UI')} />
          <ThemeCategoryTile emoji="📺" accentColor="#D81B60" title={t('theme_cat_channels')} subtitle={t('theme_cat_channels_desc')} onPress={() => setCategory('CHANNELS')} />
          {/* Рамки звонков/видеосообщений открываются отдельными экранами (как Activity на Android) */}
          <ThemeCategoryTile emoji="📞" accentColor="#1E88E5" title={t('theme_cat_calls')} subtitle={t('theme_cat_calls_desc')} onPress={() => nav.navigate('CallFrameSettings' as never)} />
          <ThemeCategoryTile emoji="🎥" accentColor="#00897B" title={t('theme_cat_video_msg')} subtitle={t('theme_cat_video_msg_desc')} onPress={() => nav.navigate('VideoMessageFrameSettings' as never)} />
          <ThemeCategoryTile emoji="🔔" accentColor="#FFA000" title={t('theme_cat_sounds')} subtitle={t('theme_cat_sounds_desc')} onPress={() => setCategory('SOUNDS')} />
          {devUnlocked && (
            <>
              <Text style={[WMTypography.labelLarge, { fontWeight: '600', color: '#40A7E3', marginHorizontal: 20, marginTop: 28, marginBottom: 10 }]}>🧪 Sandbox UI</Text>
              <ThemeCategoryTile
                emoji="🧪"
                accentColor="#40A7E3"
                title="Sandbox UI v4"
                subtitle="Тестовий інтерфейс (тільки для розробника)"
                right={<Switch value={sandboxEnabled} onValueChange={() => void toggleSandbox()} color="#40A7E3" />}
              />
            </>
          )}
        </ScrollView>
      )}

      {category === 'APP_MODE' && <ThemeAppModeContent />}
      {category === 'PACKS' && <OneClickInterfacePacksSection onLocked={openPremium} />}
      {category === 'SOUNDS' && <ThemeSoundsContent />}

      {category === 'MAIN_UI' && (
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
          <ThemeSectionHeader emoji="🎨" title={t('select_theme')} accentColor="#7C4DFF" style={{ marginHorizontal: 16, marginTop: 16, marginBottom: 12 }} />
          <ThemeVariantsRows onLocked={openPremium} />
          <Button
            mode="outlined"
            icon="refresh"
            style={{ marginHorizontal: 16, marginVertical: 8 }}
            onPress={() => {
              ThemeManager.resetToDefaults();
              WMToast.show(t('theme_reset_done'));
            }}
          >
            {t('theme_reset_to_default')}
          </Button>
          <ThemeShareImportSection />

          <ThemeSectionHeader emoji="🌙" title={t('appearance_section')} accentColor="#1976D2" style={{ marginHorizontal: 16, marginTop: 28, marginBottom: 12 }} />
          <ThemeModeSectionCard />

          <ThemeSectionHeader emoji="🖼️" title={t('bg_section_title')} subtitle={t('bg_section_desc')} accentColor="#00897B" style={{ marginHorizontal: 16, marginTop: 28, marginBottom: 12 }} />
          <BackgroundPresetsRows />
          <BackgroundCustomImageRow onPick={pickBackground} />

          <ThemeSectionHeader
            emoji="✨"
            title={t('animated_bg_section_title')}
            subtitle={t('animated_bg_section_desc')}
            accentColor="#8E24AA"
            style={{ marginHorizontal: 16, marginTop: 20, marginBottom: 12 }}
          />
          <AnimatedBackgroundPickerRow onLocked={openPremium} />

          <ThemeSectionHeader emoji="💬" title={t('bubble_style_title')} subtitle={t('bubble_style_desc')} accentColor="#0097A7" style={{ marginHorizontal: 16, marginTop: 28, marginBottom: 12 }} />
          <BubbleStylesRow />

          <ThemeSectionHeader emoji="🔤" title={t('font_title')} subtitle={t('font_hint')} accentColor="#AB47BC" style={{ marginHorizontal: 16, marginTop: 28, marginBottom: 12 }} />
          <ChatFontSection />

          <ThemeSectionHeader emoji="🎛️" title={t('interface_style')} subtitle={t('interface_style_desc')} accentColor="#2E7D32" style={{ marginHorizontal: 16, marginTop: 28, marginBottom: 12 }} />
          <UIStyleToggleRow />

          <ThemeSectionHeader emoji="❤️" title={t('quick_reaction_title')} subtitle={t('quick_reaction_desc')} accentColor="#F4511E" style={{ marginHorizontal: 16, marginTop: 28, marginBottom: 12 }} />
          <QuickReactionRow />
        </ScrollView>
      )}

      {category === 'CHANNELS' && (
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
          <ThemeSectionHeader emoji="📺" title={t('channel_view_style_title')} subtitle={t('channel_view_style_desc')} accentColor="#D81B60" style={{ marginHorizontal: 16, marginTop: 16, marginBottom: 12 }} />
          <ChannelViewStyleSelector />
          <ThemeSectionHeader
            emoji="👑"
            title={t('premium_channels_design_title')}
            subtitle={t('premium_channels_design_desc')}
            accentColor="#C8A24B"
            style={{ marginHorizontal: 16, marginTop: 28, marginBottom: 12 }}
          />
          <PremiumChannelsDesignTile onOpen={() => nav.navigate('PremiumChannelsTheme' as never)} onLocked={openPremium} />
        </ScrollView>
      )}

    </View>
  );
}
