/**
 * Секции экрана «Тема и оформление» — порт Android ui/theme/ThemeSettingsScreen.kt,
 * AnimatedBackgroundSection.kt, ThemeOneClickPacks.kt, ui/lite/AppModeSelector.kt.
 * Размеры, отступы, радиусы и анимации — как в Compose.
 */
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, ScrollView, StyleSheet, Text, View, type StyleProp, type TextStyle, type ViewStyle } from "react-native";
import { Button, Dialog, Portal, RadioButton, Switch, TextInput } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import * as Clipboard from 'expo-clipboard';
import * as DocumentPicker from 'expo-document-picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useTranslation } from '../../i18n';
import { useWMTheme, ThemeManager, ThemeProfileRepository, useThemeState } from '../../theme/themeManager';
import { withAlpha, WMTypography } from '../../theme/wmTheme';
import { THEME_PALETTES, THEME_VARIANTS, THEME_VARIANT_KEYS, type ThemeVariant } from '../../theme/gen/variants';
import { PRESET_BACKGROUNDS, type PresetBackground } from '../../theme/gen/presetBackgrounds';
import { ONE_CLICK_PACKS, type OneClickInterfacePack } from '../../theme/gen/oneClickPacks';
import { ChatAnimatedBackground, ANIMATED_BG_NAME_KEYS, ANIMATED_BG_VARIANTS, AnimatedBgPrefs, useAnimatedBg, type AnimatedBgVariant } from '../../theme/backgrounds/ChatAnimatedBackground';
import {
  AppModePreferences,
  BUBBLE_STYLES,
  UIStylePreferences,
  useUIStyle,
  type AppMode,
  type BubbleStyle,
  type ChannelViewStyle,
  type UIStyle,
} from '../../preferences/uiStyle';
import { CHAT_FONTS, useChatFontFamily } from '../../fonts/fonts';
import { WMToast } from '../../components/common/WMToast';
import { UserSession } from '../../core/session';
import { NodeRetrofitClient } from '../../core/android';
import { MESSAGE_SOUNDS, NOTIFICATION_SOUNDS, SoundLibrary } from '../../services/soundLibrary';
import { UserPreferencesRepository, useUserPreferences } from '../../core/prefs';

const MEDIUM_BOUNCY = { dampingRatio: 0.5, stiffness: 1500 };

/** Пружинное увеличение выбранной карточки (animateFloatAsState + spring). */
function useSelectScale(selected: boolean, to: number, stiffness = 1500) {
  const s = useSharedValue(selected ? to : 1);
  useEffect(() => {
    s.value = withSpring(selected ? to : 1, { dampingRatio: 0.5, stiffness });
  }, [selected, to, stiffness, s]);
  return useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));
}

// ─── ThemeSectionHeader ───────────────────────────────────────────────────────
export function ThemeSectionHeader({
  emoji,
  title,
  subtitle,
  accentColor,
  style,
}: {
  emoji: string;
  title: string;
  subtitle?: string;
  accentColor?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const theme = useWMTheme();
  const box = accentColor ?? theme.colorScheme.primary;
  return (
    <View style={[styles.row, { alignItems: subtitle ? 'flex-start' : 'center' }, style]}>
      <LinearGradient colors={[box, withAlpha(box, 0.65)]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.headerBox}>
        <Text style={{ fontSize: 20 }}>{emoji}</Text>
      </LinearGradient>
      <View style={{ width: 12 }} />
      <View style={{ flex: 1 }}>
        <Text style={[WMTypography.titleMedium, { fontWeight: '700', color: theme.colorScheme.onSurface }]}>{title}</Text>
        {subtitle ? <Text style={[WMTypography.bodySmall, { color: theme.colorScheme.onSurfaceVariant, marginTop: 2 }]}>{subtitle}</Text> : null}
      </View>
    </View>
  );
}

function SubHeader({ text, style }: { text: string; style?: StyleProp<TextStyle> }) {
  const theme = useWMTheme();
  return (
    <Text style={[WMTypography.labelMedium, { fontWeight: '600', color: theme.colorScheme.onSurfaceVariant, marginHorizontal: 16 }, style]}>{text}</Text>
  );
}

function SectionLabel({ text, style }: { text: string; style?: StyleProp<TextStyle> }) {
  const theme = useWMTheme();
  return <Text style={[WMTypography.labelLarge, { fontWeight: '600', color: theme.colorScheme.onSurfaceVariant, marginHorizontal: 16 }, style]}>{text}</Text>;
}

function HRow({ children }: { children: React.ReactNode }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 10, paddingVertical: 6 }}>
      {children}
    </ScrollView>
  );
}

// ─── ThemeCategoryTile ────────────────────────────────────────────────────────
export function ThemeCategoryTile({
  emoji,
  accentColor,
  title,
  subtitle,
  onPress,
  right,
}: {
  emoji: string;
  accentColor: string;
  title: string;
  subtitle: string;
  onPress?: () => void;
  right?: React.ReactNode;
}) {
  const theme = useWMTheme();
  return (
    <Pressable onPress={onPress} style={[styles.tile, { backgroundColor: theme.colorScheme.surfaceBright }]}>
      <View style={[styles.tileIcon, { backgroundColor: withAlpha(accentColor, 0.14) }]}>
        <Text style={{ fontSize: 22 }}>{emoji}</Text>
      </View>
      <View style={{ width: 14 }} />
      <View style={{ flex: 1 }}>
        <Text style={[WMTypography.titleMedium, { fontWeight: '600', color: theme.colorScheme.onSurface }]}>{title}</Text>
        <Text numberOfLines={2} style={[WMTypography.bodySmall, { color: theme.colorScheme.onSurfaceVariant }]}>
          {subtitle}
        </Text>
      </View>
      {right ?? <MaterialCommunityIcons name="chevron-right" size={24} color={theme.colorScheme.onSurfaceVariant} />}
    </Pressable>
  );
}

// ─── Выбор темы ───────────────────────────────────────────────────────────────
function ThemeVariantChip({ variant, isSelected, isLocked, onPress }: { variant: ThemeVariant; isSelected: boolean; isLocked: boolean; onPress: () => void }) {
  const theme = useWMTheme();
  const { t } = useTranslation();
  const meta = THEME_VARIANTS[variant];
  const p = THEME_PALETTES[variant];
  const anim = useSelectScale(isSelected, 1.05);
  const border = isSelected
    ? p.primary
    : meta.isSubscriptionOnly
      ? withAlpha('#FFD700', 0.6)
      : meta.isPremium
        ? withAlpha('#FFD700', 0.4)
        : 'transparent';
  const bg = isSelected ? withAlpha(p.primary, 0.12) : isLocked ? withAlpha(theme.colorScheme.surfaceVariant, 0.6) : theme.colorScheme.surfaceVariant;
  return (
    <Animated.View style={[{ width: 88 }, anim]}>
      <Pressable onPress={onPress} style={[styles.variantChip, { borderColor: border, backgroundColor: bg }]}>
        <Text style={{ fontSize: 28 }}>{meta.emoji}</Text>
        <Text
          numberOfLines={2}
          style={[WMTypography.labelSmall, { marginTop: 4, textAlign: 'center', lineHeight: 13, fontWeight: isSelected ? '700' : '400', color: isSelected ? p.primary : theme.colorScheme.onSurface }]}
        >
          {meta.nameKey ? t(meta.nameKey as never) : meta.displayName}
        </Text>
        <View style={[styles.row, { gap: 3, marginTop: 6 }]}>
          {[p.primary, p.secondary, p.accent].map((c, i) => (
            <View key={i} style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: c }} />
          ))}
        </View>
        {isSelected && <MaterialCommunityIcons name="check-circle" size={16} color={p.primary} style={{ marginTop: 5 }} />}
      </Pressable>
      {meta.isPremium && (
        <View style={[styles.proBadge, { backgroundColor: meta.isSubscriptionOnly ? '#FF6D00' : '#FFD700' }]}>
          <Text style={styles.proBadgeText}>
            {(isLocked ? '🔒 ' : '') + t(meta.isSubscriptionOnly ? 'theme_badge_exclusive' : 'theme_badge_pro')}
          </Text>
        </View>
      )}
    </Animated.View>
  );
}

/** ThemeVariantsLazyRow: бесплатные/PRO × светлые/тёмные; CYBERPUNK убран из выбора (как на Android). */
export function ThemeVariantsRows({ onLocked }: { onLocked: () => void }) {
  const { t } = useTranslation();
  const selected = useThemeState((s) => s.variant);
  const canUsePremium = UserSession.isProActive;
  // MATERIAL_YOU на Android доступен с 12+ (цвета обоев); на iOS обоев нет — тема
  // показывается как обычная палитра (как Android < 12, где её скрывают). Скрываем.
  const all = THEME_VARIANT_KEYS.filter((v) => v !== 'CYBERPUNK' && v !== 'MATERIAL_YOU');
  const free = all.filter((v) => !THEME_VARIANTS[v].isPremium);
  const premium = all.filter((v) => THEME_VARIANTS[v].isPremium);
  const row = (list: ThemeVariant[]) => (
    <HRow>
      {list.map((v) => {
        const locked = THEME_VARIANTS[v].isPremium && !canUsePremium;
        return (
          <ThemeVariantChip
            key={v}
            variant={v}
            isSelected={v === selected}
            isLocked={locked}
            onPress={() => (locked ? onLocked() : ThemeManager.setThemeVariant(v))}
          />
        );
      })}
    </HRow>
  );
  return (
    <View>
      <SectionLabel text={t('theme_section_free')} style={{ marginBottom: 8 }} />
      <SubHeader text={'☀️ ' + t('theme_group_light')} style={{ marginTop: 10, marginBottom: 6 }} />
      {row(free.filter((v) => !THEME_VARIANTS[v].prefersDark))}
      <SubHeader text={'🌙 ' + t('theme_group_dark')} style={{ marginTop: 10, marginBottom: 6 }} />
      {row(free.filter((v) => THEME_VARIANTS[v].prefersDark))}
      <SectionLabel text={t('theme_section_premium')} style={{ marginTop: 16, marginBottom: 8 }} />
      <SubHeader text={'☀️ ' + t('theme_group_light')} style={{ marginTop: 10, marginBottom: 6 }} />
      {row(premium.filter((v) => !THEME_VARIANTS[v].prefersDark))}
      <SubHeader text={'🌙 ' + t('theme_group_dark')} style={{ marginTop: 10, marginBottom: 6 }} />
      {row(premium.filter((v) => THEME_VARIANTS[v].prefersDark))}
    </View>
  );
}

// ─── Режим (тёмная/системная) ─────────────────────────────────────────────────
export function ThemeModeSectionCard() {
  const theme = useWMTheme();
  const { t } = useTranslation();
  const s = useThemeState();
  const cs = theme.colorScheme;
  return (
    <View style={[styles.card16, { backgroundColor: cs.surfaceBright, marginHorizontal: 16 }]}>
      <View style={[styles.row, { justifyContent: 'space-between' }]}>
        <View style={styles.row}>
          <MaterialCommunityIcons name={s.isDark ? 'weather-night' : 'white-balance-sunny'} size={24} color={cs.primary} />
          <Text style={[WMTypography.titleMedium, { fontWeight: '500', marginLeft: 12, color: cs.onSurface }]}>{t('dark_theme')}</Text>
        </View>
        <Switch value={s.isDark} onValueChange={() => ThemeManager.toggleDarkTheme()} disabled={s.useSystemTheme} />
      </View>
      <View style={{ height: 12 }} />
      <Pressable onPress={() => ThemeManager.toggleSystemTheme()} style={[styles.row, { justifyContent: 'space-between' }]}>
        <View style={{ flex: 1 }}>
          <Text style={[WMTypography.bodyMedium, { fontWeight: '500', color: cs.onSurface }]}>{t('follow_system_theme')}</Text>
          <Text style={[WMTypography.bodySmall, { color: cs.onSurfaceVariant }]}>{t('follow_system_theme_desc')}</Text>
        </View>
        <Switch value={s.useSystemTheme} onValueChange={() => ThemeManager.toggleSystemTheme()} />
      </Pressable>
    </View>
  );
}

// ─── Поделиться / импорт ──────────────────────────────────────────────────────
export function ThemeShareImportSection() {
  const theme = useWMTheme();
  const { t } = useTranslation();
  const [share, setShare] = useState<{ open: boolean; loading: boolean; code: string | null }>({ open: false, loading: false, code: null });
  const [imp, setImp] = useState<{ open: boolean; code: string; loading: boolean; error: string | null }>({ open: false, code: '', loading: false, error: null });

  const doShare = async () => {
    setShare({ open: true, loading: true, code: null });
    const code = await ThemeProfileRepository.shareCurrentTheme();
    setShare({ open: true, loading: false, code });
  };
  const doImport = async () => {
    setImp((s) => ({ ...s, loading: true, error: null }));
    const r = await ThemeProfileRepository.importByCode(imp.code);
    if (r.kind === 'success') {
      ThemeProfileRepository.apply(r);
      WMToast.show(t('theme_import_success'));
      setImp({ open: false, code: '', loading: false, error: null });
      return;
    }
    const key = r.kind === 'notFound' ? 'theme_import_error' : r.kind === 'wrongPlatform' ? 'theme_import_error_wrong_platform' : 'theme_import_error_network';
    setImp((s) => ({ ...s, loading: false, error: t(key) }));
  };

  return (
    <>
      <View style={[styles.row, { gap: 10, padding: 12, borderRadius: 16, backgroundColor: theme.colorScheme.surfaceBright, marginHorizontal: 16, marginVertical: 8 }]}>
        <Button mode="outlined" style={{ flex: 1 }} onPress={doShare}>
          {t('theme_share_button')}
        </Button>
        <Button mode="outlined" style={{ flex: 1 }} onPress={() => setImp({ open: true, code: '', loading: false, error: null })}>
          {t('theme_import_button')}
        </Button>
      </View>
      <Portal>
        <Dialog visible={share.open} onDismiss={() => setShare((s) => ({ ...s, open: false }))}>
          <Dialog.Title>{t('theme_share_title')}</Dialog.Title>
          <Dialog.Content>
            <Text style={[WMTypography.bodySmall, { color: theme.colorScheme.onSurfaceVariant, marginBottom: 12 }]}>{t('theme_share_desc')}</Text>
            {share.loading ? (
              <ActivityIndicator />
            ) : share.code ? (
              <Text selectable style={[WMTypography.headlineSmall, { fontWeight: '700', color: theme.colorScheme.onSurface }]}>
                {share.code}
              </Text>
            ) : (
              <Text style={{ color: theme.colorScheme.error }}>{t('theme_share_error')}</Text>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShare((s) => ({ ...s, open: false }))}>{t('close')}</Button>
            <Button
              disabled={!share.code}
              onPress={async () => {
                await Clipboard.setStringAsync(share.code ?? '');
                WMToast.show(t('theme_share_copied'));
                setShare((s) => ({ ...s, open: false }));
              }}
            >
              {t('theme_share_copy')}
            </Button>
          </Dialog.Actions>
        </Dialog>
        <Dialog visible={imp.open} onDismiss={() => setImp((s) => ({ ...s, open: false }))}>
          <Dialog.Title>{t('theme_import_title')}</Dialog.Title>
          <Dialog.Content>
            <Text style={[WMTypography.bodySmall, { color: theme.colorScheme.onSurfaceVariant, marginBottom: 12 }]}>{t('theme_import_hint')}</Text>
            <TextInput
              mode="outlined"
              value={imp.code}
              onChangeText={(code) => setImp((s) => ({ ...s, code, error: null }))}
              placeholder={t('theme_import_placeholder')}
              autoCapitalize="characters"
              autoCorrect={false}
            />
            {imp.loading && <ActivityIndicator style={{ marginTop: 8 }} />}
            {imp.error ? <Text style={[WMTypography.bodySmall, { color: theme.colorScheme.error, marginTop: 8 }]}>{imp.error}</Text> : null}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setImp((s) => ({ ...s, open: false }))}>{t('close')}</Button>
            <Button disabled={!imp.code.trim() || imp.loading} onPress={doImport}>
              {t('theme_import_apply')}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </>
  );
}

// ─── Фоны ─────────────────────────────────────────────────────────────────────
function BackgroundPresetChip({ preset, isSelected, onPress }: { preset: PresetBackground; isSelected: boolean; onPress: () => void }) {
  const { t } = useTranslation();
  const anim = useSelectScale(isSelected, 1.06);
  return (
    <Animated.View style={anim}>
      <Pressable onPress={onPress} style={[styles.presetChip, { borderColor: isSelected ? '#FFFFFF' : 'transparent' }]}>
        <LinearGradient colors={preset.colors as [string, string, ...string[]]} style={StyleSheet.absoluteFill} />
        {isSelected && <MaterialCommunityIcons name="check-circle" size={18} color="#FFFFFF" style={styles.presetCheck} />}
        <LinearGradient colors={['transparent', withAlpha('#000000', 0.65)]} style={styles.presetLabel}>
          <Text style={{ color: '#FFFFFF', fontSize: 9, fontWeight: '700', textAlign: 'center' }}>{t(preset.nameKey as never)}</Text>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

export function BackgroundPresetsRows() {
  const { t } = useTranslation();
  const current = useThemeState((s) => s.presetBackgroundId);
  const row = (list: PresetBackground[]) => (
    <HRow>
      {list.map((p) => (
        <BackgroundPresetChip key={p.id} preset={p} isSelected={p.id === current} onPress={() => ThemeManager.setPresetBackgroundId(p.id)} />
      ))}
    </HRow>
  );
  return (
    <View>
      <SubHeader text={'🌙 ' + t('theme_group_dark')} style={{ marginBottom: 6 }} />
      {row(PRESET_BACKGROUNDS.filter((p) => p.isDark))}
      <SubHeader text={'☀️ ' + t('theme_group_light')} style={{ marginTop: 10, marginBottom: 6 }} />
      {row(PRESET_BACKGROUNDS.filter((p) => !p.isDark))}
    </View>
  );
}

export function BackgroundCustomImageRow({ onPick }: { onPick: () => void }) {
  const theme = useWMTheme();
  const { t } = useTranslation();
  const uri = useThemeState((s) => s.backgroundImageUri);
  return (
    <View style={[styles.row, { gap: 12, marginHorizontal: 16, marginVertical: 10 }]}>
      {uri ? (
        <View style={styles.customThumb}>
          <Image source={{ uri }} style={StyleSheet.absoluteFill} contentFit="cover" />
          <Pressable
            accessibilityLabel={t('remove_background')}
            onPress={() => {
              ThemeManager.setBackgroundImageUri(null);
              ThemeManager.setPresetBackgroundId(null);
            }}
            style={[styles.removeBg, { backgroundColor: theme.colorScheme.errorContainer }]}
          >
            <MaterialCommunityIcons name="close" size={14} color={theme.colorScheme.onErrorContainer} />
          </Pressable>
        </View>
      ) : null}
      <Button mode="outlined" icon="image" style={{ flex: 1, borderRadius: 12 }} labelStyle={{ fontWeight: '600' }} onPress={onPick}>
        {uri ? t('bg_change') : t('bg_pick')}
      </Button>
    </View>
  );
}

// ─── Анимированный фон ────────────────────────────────────────────────────────
export function AnimatedBackgroundPickerRow({ onLocked }: { onLocked: () => void }) {
  const theme = useWMTheme();
  const { t } = useTranslation();
  const selected = useAnimatedBg((s) => s.variant);
  const canUse = UserSession.canUseAnimatedBackground;
  const cs = theme.colorScheme;

  useEffect(() => {
    // Потерял доступ — сбрасываем на NONE (как LaunchedEffect на Android)
    if (!canUse && selected !== 'NONE') AnimatedBgPrefs.setVariant('NONE');
  }, [canUse, selected]);

  const daysLeft = (() => {
    const reg = UserSession.registeredAt;
    if (!reg) return 5;
    const remaining = 5 * 86400000 - (Date.now() - reg);
    return Math.max(1, Math.floor(remaining / 86400000) + 1);
  })();

  return (
    <View>
      {!canUse ? (
        <Pressable onPress={onLocked} style={[styles.banner, { backgroundColor: withAlpha(cs.primaryContainer, 0.7) }]}>
          <MaterialCommunityIcons name="lock" size={18} color={cs.primary} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 13, fontWeight: '600', color: cs.onPrimaryContainer }}>{t('animated_bg_premium_title')}</Text>
            <Text style={{ fontSize: 11, color: withAlpha(cs.onPrimaryContainer, 0.8) }}>{t('animated_bg_premium_desc')}</Text>
          </View>
          <Text style={{ fontSize: 12, fontWeight: '700', color: cs.primary }}>{t('animated_bg_get_pro')}</Text>
        </Pressable>
      ) : UserSession.isNewUser ? (
        <View style={[styles.banner, { backgroundColor: withAlpha(cs.tertiaryContainer, 0.6) }]}>
          <Text style={{ fontSize: 18 }}>✨</Text>
          <Text style={{ flex: 1, fontSize: 12, color: cs.onTertiaryContainer }}>{t('animated_bg_trial_banner', [daysLeft])}</Text>
        </View>
      ) : null}
      <HRow>
        {ANIMATED_BG_VARIANTS.map((v) => {
          const locked = v !== 'NONE' && !canUse;
          const isSel = v === selected;
          return (
            <Pressable key={v} style={{ width: 80, alignItems: 'center' }} onPress={() => (locked ? onLocked() : AnimatedBgPrefs.setVariant(v))}>
              <View style={[styles.animCard, { borderWidth: isSel ? 2 : 1, borderColor: isSel ? cs.primary : cs.outlineVariant, backgroundColor: cs.surfaceVariant }]}>
                {v === 'NONE' ? (
                  <Text style={{ fontSize: 24, color: cs.onSurfaceVariant }}>✕</Text>
                ) : (
                  <ChatAnimatedBackground variant={v as AnimatedBgVariant} />
                )}
                {locked && (
                  <View style={[StyleSheet.absoluteFill, styles.center, { backgroundColor: withAlpha('#000000', 0.55) }]}>
                    <MaterialCommunityIcons name="lock" size={22} color="#FFFFFF" />
                    <Text style={{ fontSize: 10, fontWeight: '700', color: '#FFD700' }}>PRO</Text>
                  </View>
                )}
              </View>
              <Text
                numberOfLines={2}
                style={{
                  marginTop: 6,
                  fontSize: 11,
                  textAlign: 'center',
                  fontWeight: isSel ? '600' : '400',
                  color: isSel ? cs.primary : locked ? withAlpha(cs.onSurfaceVariant, 0.5) : cs.onSurfaceVariant,
                }}
              >
                {t(ANIMATED_BG_NAME_KEYS[v] as never)}
              </Text>
            </Pressable>
          );
        })}
      </HRow>
    </View>
  );
}

// ─── Стили пузырей ────────────────────────────────────────────────────────────
function BubbleStyleChip({ styleKey, icon, nameKey, isSelected }: { styleKey: BubbleStyle; icon: string; nameKey: string; isSelected: boolean }) {
  const theme = useWMTheme();
  const { t } = useTranslation();
  const anim = useSelectScale(isSelected, 1.05);
  const cs = theme.colorScheme;
  return (
    <Animated.View style={anim}>
      <Pressable
        onPress={() => UIStylePreferences.setBubbleStyle(styleKey)}
        style={[styles.bubbleChip, { borderColor: isSelected ? cs.primary : 'transparent', backgroundColor: isSelected ? cs.primaryContainer : cs.surfaceVariant }]}
      >
        <Text style={{ fontSize: 28 }}>{icon}</Text>
        <Text style={[WMTypography.labelSmall, { marginTop: 6, textAlign: 'center', fontWeight: isSelected ? '700' : '400', color: isSelected ? cs.onPrimaryContainer : cs.onSurface }]}>
          {t(nameKey as never)}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

export function BubbleStylesRow() {
  const current = useUIStyle((s) => s.bubbleStyle);
  return (
    <HRow>
      {BUBBLE_STYLES.map((b) => (
        <BubbleStyleChip key={b.key} styleKey={b.key} icon={b.icon} nameKey={b.nameKey} isSelected={b.key === current} />
      ))}
    </HRow>
  );
}

// ─── Шрифт чата ───────────────────────────────────────────────────────────────
function ChatFontChip({ fontKey, label, isSelected, onPress, onRemove }: { fontKey: string; label: string; isSelected: boolean; onPress: () => void; onRemove?: () => void }) {
  const theme = useWMTheme();
  const { t } = useTranslation();
  const family = useChatFontFamily(fontKey);
  const cs = theme.colorScheme;
  const fg = isSelected ? cs.onPrimaryContainer : cs.onSurface;
  return (
    <Pressable onPress={onPress} style={[styles.fontChip, { borderColor: isSelected ? cs.primary : 'transparent', backgroundColor: isSelected ? cs.primaryContainer : cs.surfaceVariant }]}>
      <Text style={{ fontFamily: family, fontSize: 22, color: fg }}>Aa</Text>
      <View style={[styles.row, { marginTop: 6 }]}>
        <Text numberOfLines={1} style={[WMTypography.labelSmall, { flexShrink: 1, textAlign: 'center', fontWeight: isSelected ? '700' : '400', color: fg }]}>
          {label}
        </Text>
        {onRemove && (
          <Pressable onPress={onRemove} hitSlop={8} accessibilityLabel={t('font_remove_custom')} style={{ marginLeft: 4 }}>
            <MaterialCommunityIcons name="close" size={12} color={fg} />
          </Pressable>
        )}
      </View>
    </Pressable>
  );
}

export function ChatFontSection() {
  const theme = useWMTheme();
  const { t } = useTranslation();
  const current = useUIStyle((s) => s.chatFont);
  const custom = useUIStyle((s) => s.customFonts);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cs = theme.colorScheme;

  const upload = async () => {
    const res = await DocumentPicker.getDocumentAsync({ type: '*/*', copyToCacheDirectory: true });
    if (res.canceled || !res.assets?.[0]) return;
    const a = res.assets[0];
    setUploading(true);
    setError(null);
    try {
      // Как Android: загрузка через chat/upload (type=file), файл уходит в MinIO
      const r = await NodeRetrofitClient.chatUploadApi.uploadChatMedia('file', {
        field: 'file',
        file: { uri: a.uri, name: a.name, type: 'application/octet-stream' },
      });
      if (r.fileUrl) {
        const label = a.name.replace(/\.[^.]+$/, '').slice(0, 40) || 'Font';
        UIStylePreferences.setChatFont(UIStylePreferences.addCustomFont(label, r.fileUrl));
      } else {
        setError(t('font_upload_failed'));
      }
    } catch {
      setError(t('font_upload_failed'));
    } finally {
      setUploading(false);
    }
  };

  return (
    <View>
      <HRow>
        {CHAT_FONTS.map((f) => (
          <ChatFontChip
            key={f.key}
            fontKey={f.key}
            label={f.key === 'default' ? t('font_default') : f.label}
            isSelected={f.key === current}
            onPress={() => UIStylePreferences.setChatFont(f.key)}
          />
        ))}
        {custom.map((cf) => (
          <ChatFontChip
            key={cf.id}
            fontKey={cf.id}
            label={'📁 ' + cf.label}
            isSelected={cf.id === current}
            onPress={() => UIStylePreferences.setChatFont(cf.id)}
            onRemove={() => UIStylePreferences.removeCustomFont(cf.id)}
          />
        ))}
        <Pressable disabled={uploading} onPress={upload} style={[styles.fontChip, { borderColor: cs.outline, backgroundColor: cs.surfaceVariant, justifyContent: 'center' }]}>
          {uploading ? (
            <ActivityIndicator size="small" />
          ) : (
            <>
              <MaterialCommunityIcons name="plus" size={22} color={cs.onSurface} />
              <Text numberOfLines={2} style={[WMTypography.labelSmall, { marginTop: 4, textAlign: 'center', color: cs.onSurface }]}>
                {t('font_upload_custom')}
              </Text>
            </>
          )}
        </Pressable>
      </HRow>
      {error ? <Text style={[WMTypography.bodySmall, { color: cs.error, marginHorizontal: 16, marginVertical: 6 }]}>{error}</Text> : null}
      <Text style={[WMTypography.bodySmall, { color: cs.onSurfaceVariant, marginHorizontal: 16, marginVertical: 6 }]}>{t('font_custom_hint')}</Text>
    </View>
  );
}

// ─── Строка выбора с радиокнопкой (StyleOptionRow / ChannelViewStyleCard / SoundOptionCard) ──
export function OptionRow({
  icon,
  label,
  description,
  isSelected,
  onPress,
  trailing,
}: {
  icon: string;
  label: string;
  description?: string;
  isSelected: boolean;
  onPress: () => void;
  trailing?: React.ReactNode;
}) {
  const theme = useWMTheme();
  const cs = theme.colorScheme;
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.optionRow,
        {
          backgroundColor: isSelected ? withAlpha(cs.primaryContainer, 0.45) : withAlpha(cs.surfaceVariant, 0.5),
          borderWidth: isSelected ? 1.5 : 1,
          borderColor: isSelected ? cs.primary : withAlpha(cs.outlineVariant, 0.4),
        },
      ]}
    >
      <View style={[styles.optionIcon, { backgroundColor: isSelected ? withAlpha(cs.primary, 0.12) : withAlpha(cs.onSurface, 0.06) }]}>
        <Text style={{ fontSize: 22 }}>{icon}</Text>
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={[WMTypography.bodyLarge, { fontWeight: isSelected ? '600' : '500', color: isSelected ? cs.primary : cs.onSurface }]}>{label}</Text>
        {description ? (
          <Text numberOfLines={2} style={[WMTypography.bodySmall, { color: cs.onSurfaceVariant }]}>
            {description}
          </Text>
        ) : null}
      </View>
      {trailing}
      <RadioButton.Android value="x" status={isSelected ? 'checked' : 'unchecked'} onPress={onPress} color={cs.primary} />
    </Pressable>
  );
}

export function UIStyleToggleRow() {
  const { t } = useTranslation();
  const current = useUIStyle((s) => s.style);
  const opts: Array<{ key: UIStyle; icon: string; label: string; desc: string }> = [
    { key: 'WORLDMATES', icon: '🪟', label: 'WallyMates', desc: t('interface_modern_desc') },
    { key: 'TELEGRAM', icon: '📋', label: t('frame_style_classic'), desc: t('interface_classic_desc') },
  ];
  return (
    <View style={{ gap: 8, marginHorizontal: 16 }}>
      {opts.map((o) => (
        <OptionRow key={o.key} icon={o.icon} label={o.label} description={o.desc} isSelected={o.key === current} onPress={() => UIStylePreferences.setStyle(o.key)} />
      ))}
    </View>
  );
}

// ─── Быстрая реакция ──────────────────────────────────────────────────────────
const POPULAR_EMOJIS = ['❤️', '👍', '👎', '😂', '😮', '😢', '🔥', '✨', '🎉', '💯', '👏', '🙏'];

function EmojiReactionCard({ emoji, isSelected }: { emoji: string; isSelected: boolean }) {
  const theme = useWMTheme();
  const anim = useSelectScale(isSelected, 1.2, 200);
  const cs = theme.colorScheme;
  return (
    <Animated.View style={anim}>
      <Pressable
        onPress={() => UIStylePreferences.setQuickReaction(emoji)}
        style={[
          styles.emojiCard,
          {
            backgroundColor: isSelected ? cs.primaryContainer : cs.surface,
            borderWidth: isSelected ? 2 : 0,
            borderColor: cs.primary,
            shadowRadius: isSelected ? 3 : 1.5,
          },
        ]}
      >
        <Text style={{ fontSize: 24 }}>{emoji}</Text>
      </Pressable>
    </Animated.View>
  );
}

export function QuickReactionRow() {
  const current = useUIStyle((s) => s.quickReaction);
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingVertical: 8 }}>
      {POPULAR_EMOJIS.map((e) => (
        <EmojiReactionCard key={e} emoji={e} isSelected={e === current} />
      ))}
    </ScrollView>
  );
}

// ─── Каналы ───────────────────────────────────────────────────────────────────
export function ChannelViewStyleSelector() {
  const { t } = useTranslation();
  const current = useUIStyle((s) => s.channelViewStyle);
  const opts: Array<{ key: ChannelViewStyle; emoji: string; title: string; desc: string }> = [
    { key: 'CLASSIC', emoji: '📺', title: t('channel_style_classic'), desc: t('channel_style_classic_desc') },
    { key: 'PREMIUM', emoji: '⭐', title: t('channel_style_premium'), desc: t('channel_style_premium_desc') },
  ];
  return (
    <View style={{ gap: 8, marginHorizontal: 16 }}>
      {opts.map((o) => (
        <OptionRow key={o.key} icon={o.emoji} label={o.title} description={o.desc} isSelected={current === o.key} onPress={() => UIStylePreferences.setChannelViewStyle(o.key)} />
      ))}
    </View>
  );
}

export function PremiumChannelsDesignTile({ onOpen, onLocked }: { onOpen: () => void; onLocked: () => void }) {
  const { t } = useTranslation();
  const can = UserSession.isProActive;
  const gold = '#C8A24B';
  return (
    <Pressable onPress={can ? onOpen : onLocked} style={[styles.premiumTile, { borderColor: withAlpha(gold, 0.55) }]}>
      <View style={[styles.premiumIcon, { backgroundColor: withAlpha(gold, 0.16), borderColor: withAlpha(gold, 0.7) }]}>
        <Text style={{ fontSize: 20 }}>👑</Text>
      </View>
      <View style={{ flex: 1, gap: 3, marginLeft: 14 }}>
        <Text style={[WMTypography.titleSmall, { fontWeight: '600', color: '#F2E7C8' }]}>{t('premium_channels_design_title')}</Text>
        <Text numberOfLines={2} style={[WMTypography.bodySmall, { color: withAlpha('#F2E7C8', 0.7) }]}>
          {can ? t('premium_channels_design_desc') : t('premium_channels_design_locked')}
        </Text>
      </View>
      <Text style={{ fontSize: 20, color: gold, fontWeight: '700', marginLeft: 12 }}>{can ? '›' : '🔒'}</Text>
    </Pressable>
  );
}

// ─── Звуки ────────────────────────────────────────────────────────────────────
const NOTIF_EMOJI: Record<string, string> = { pop: '🔊', chime: '🎐', marimba: '🎶', bell: '🔔', telegram: '✈️', xylophone: '🎼', harp: '🎵', glass: '🔷', wood: '🪵' };
const MSG_EMOJI: Record<string, string> = { tick: '⏱️', bubble: '🫧', whisper: '💬', droplet: '💧', soft_pop: '🔵', click: '•', swoosh: '🌬️', petal: '🌸' };

export function ThemeSoundsContent() {
  const theme = useWMTheme();
  const { t } = useTranslation();
  const notif = useUserPreferences((s) => s.notificationSoundId);
  const msg = useUserPreferences((s) => s.messageSoundId);
  const preview = (id: string, isNotif: boolean) => (
    <Pressable onPress={() => SoundLibrary.preview(id, isNotif)} hitSlop={8} accessibilityLabel={t('sound_preview_action')} style={{ padding: 8 }}>
      <MaterialCommunityIcons name="play" size={24} color={theme.colorScheme.onSurfaceVariant} />
    </Pressable>
  );
  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
      <ThemeSectionHeader emoji="🔔" title={t('notif_sound_choice')} subtitle={t('notif_sound_choice_desc')} accentColor="#FFA000" style={{ marginHorizontal: 16, marginTop: 16, marginBottom: 12 }} />
      {NOTIFICATION_SOUNDS.map((o) => (
        <View key={o.id} style={{ marginHorizontal: 16, marginVertical: 4 }}>
          <OptionRow
            icon={NOTIF_EMOJI[o.id] ?? '🔔'}
            label={t(o.nameKey as never)}
            isSelected={o.id === notif}
            onPress={() => UserPreferencesRepository.setNotificationSoundId(o.id)}
            trailing={preview(o.id, true)}
          />
        </View>
      ))}
      <ThemeSectionHeader emoji="💬" title={t('msg_sound_choice')} subtitle={t('msg_sound_choice_desc')} accentColor="#00897B" style={{ marginHorizontal: 16, marginTop: 28, marginBottom: 12 }} />
      {MESSAGE_SOUNDS.map((o) => (
        <View key={o.id} style={{ marginHorizontal: 16, marginVertical: 4 }}>
          <OptionRow
            icon={MSG_EMOJI[o.id] ?? '💬'}
            label={t(o.nameKey as never)}
            isSelected={o.id === msg}
            onPress={() => UserPreferencesRepository.setMessageSoundId(o.id)}
            trailing={preview(o.id, false)}
          />
        </View>
      ))}
    </ScrollView>
  );
}

// ─── Режим приложения ─────────────────────────────────────────────────────────
export function AppModeSelector({ selected, onSelect }: { selected: AppMode; onSelect: (m: AppMode) => void }) {
  const theme = useWMTheme();
  const { t } = useTranslation();
  const cs = theme.colorScheme;
  const card = (mode: AppMode, emoji: string, title: string, subtitle: string) => {
    const sel = selected === mode;
    return (
      <Pressable
        key={mode}
        onPress={() => onSelect(mode)}
        style={[
          styles.appModeCard,
          {
            backgroundColor: sel ? withAlpha(cs.primaryContainer, 0.35) : cs.surfaceBright,
            borderWidth: sel ? 2 : 1,
            borderColor: sel ? cs.primary : withAlpha(cs.outline, 0.2),
          },
        ]}
      >
        <View style={[styles.appModeIcon, { backgroundColor: withAlpha(cs.primary, 0.12) }]}>
          <Text style={{ fontSize: 24 }}>{emoji}</Text>
        </View>
        <View style={{ flex: 1, marginLeft: 14 }}>
          <Text style={[WMTypography.titleMedium, { fontWeight: '600', color: cs.onSurface }]}>{title}</Text>
          <Text style={[WMTypography.bodySmall, { color: cs.onSurfaceVariant, marginTop: 4 }]}>{subtitle}</Text>
        </View>
        <View style={[styles.check, { backgroundColor: sel ? cs.primary : 'transparent', borderColor: sel ? cs.primary : withAlpha(cs.outline, 0.4) }]}>
          {sel && <MaterialCommunityIcons name="check" size={14} color={cs.onPrimary} />}
        </View>
      </Pressable>
    );
  };
  return (
    <View style={{ gap: 12 }}>
      {card('FULL', '🌐', t('app_mode_full_title'), t('app_mode_full_desc'))}
      {card('LITE', '💬', t('app_mode_lite_title'), t('app_mode_lite_desc'))}
    </View>
  );
}

export function ThemeAppModeContent() {
  const theme = useWMTheme();
  const { t } = useTranslation();
  const mode = useUIStyle((s) => s.appMode);
  return (
    <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 20, paddingBottom: 40 }}>
      <Text style={[WMTypography.bodyMedium, { color: theme.colorScheme.onSurfaceVariant, marginHorizontal: 4, marginBottom: 16 }]}>{t('app_mode_hint')}</Text>
      <AppModeSelector
        selected={mode}
        onSelect={(m) => {
          if (m !== mode) {
            AppModePreferences.setMode(m);
            WMToast.show(t('app_mode_changed'));
          }
        }}
      />
    </ScrollView>
  );
}

// ─── Готовые паки ─────────────────────────────────────────────────────────────
export function applyPack(pack: OneClickInterfacePack): void {
  ThemeManager.setThemeVariant(pack.themeVariant);
  ThemeManager.setPresetBackgroundId(pack.presetBackgroundId);
  if (pack.isDarkTheme) ThemeManager.setDarkTheme(true);
  UIStylePreferences.setQuickReaction(pack.quickReaction);
  UIStylePreferences.setStyle(pack.uiStyle);
  UIStylePreferences.setBubbleStyle(pack.bubbleStyle);
  if (pack.chatFont) UIStylePreferences.setChatFont(pack.chatFont);
}

function OneClickPackCard({ pack, isLocked, onPress }: { pack: OneClickInterfacePack; isLocked: boolean; onPress: () => void }) {
  const theme = useWMTheme();
  const { t } = useTranslation();
  const cs = theme.colorScheme;
  const sub = THEME_VARIANTS[pack.themeVariant]?.isSubscriptionOnly ?? false;
  return (
    <Pressable onPress={onPress} style={[styles.packCard, { backgroundColor: isLocked ? withAlpha(cs.secondaryContainer, 0.6) : cs.secondaryContainer }]}>
      <Text style={{ fontSize: 26 }}>{isLocked ? '🔒' : pack.emoji}</Text>
      <View style={{ flex: 1, marginLeft: 12 }}>
        <View style={[styles.row, { gap: 6 }]}>
          <Text style={[WMTypography.titleSmall, { fontWeight: '700', color: cs.onSecondaryContainer }]}>{t(pack.nameKey as never)}</Text>
          {pack.isPremium && (
            <View style={{ backgroundColor: sub ? '#FF6D00' : '#FFD700', borderRadius: 5, paddingHorizontal: 5, paddingVertical: 2 }}>
              <Text style={{ fontSize: 9, fontWeight: '700', color: '#212121' }}>{t(sub ? 'theme_badge_exclusive' : 'theme_badge_pro')}</Text>
            </View>
          )}
        </View>
        <Text numberOfLines={2} style={{ fontSize: 12, color: withAlpha(cs.onSecondaryContainer, 0.7) }}>
          {t(pack.descKey as never)}
        </Text>
      </View>
    </Pressable>
  );
}

export function OneClickInterfacePacksSection({ onLocked }: { onLocked: () => void }) {
  const theme = useWMTheme();
  const { t } = useTranslation();
  const can = UserSession.isProActive;
  const free = ONE_CLICK_PACKS.filter((p) => !p.isPremium);
  const premium = ONE_CLICK_PACKS.filter((p) => p.isPremium);
  type Item = { kind: 'head' } | { kind: 'label'; text: string; top: number } | { kind: 'pack'; pack: OneClickInterfacePack; locked: boolean };
  const data: Item[] = [
    { kind: 'head' },
    { kind: 'label', text: t('theme_section_free'), top: 16 },
    ...free.map((pack) => ({ kind: 'pack' as const, pack, locked: false })),
    { kind: 'label', text: t('theme_section_premium'), top: 20 },
    ...premium.map((pack) => ({ kind: 'pack' as const, pack, locked: !can })),
  ];
  return (
    <FlatList
      data={data}
      keyExtractor={(_, i) => String(i)}
      contentContainerStyle={{ paddingBottom: 40 }}
      renderItem={({ item }) => {
        if (item.kind === 'head') {
          return (
            <View style={{ marginHorizontal: 16, marginTop: 16, marginBottom: 4 }}>
              <Text style={[WMTypography.titleMedium, { fontWeight: '600', color: theme.colorScheme.onSurface }]}>{t('one_click_themes')}</Text>
              <Text style={[WMTypography.bodySmall, { color: theme.colorScheme.onSurfaceVariant, marginTop: 6 }]}>{t('one_click_theme_desc')}</Text>
            </View>
          );
        }
        if (item.kind === 'label') return <SectionLabel text={item.text} style={{ marginTop: item.top, marginBottom: 8 }} />;
        return (
          <View style={{ marginHorizontal: 16, marginVertical: 4 }}>
            <OneClickPackCard pack={item.pack} isLocked={item.locked} onPress={() => (item.locked ? onLocked() : applyPack(item.pack))} />
          </View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  center: { alignItems: 'center', justifyContent: 'center' },
  headerBox: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  tile: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginVertical: 5, paddingHorizontal: 14, paddingVertical: 14, borderRadius: 18 },
  tileIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  variantChip: { borderRadius: 14, borderWidth: 2, padding: 10, alignItems: 'center' },
  proBadge: { position: 'absolute', top: 4, right: 4, borderRadius: 6, paddingHorizontal: 4, paddingVertical: 2 },
  proBadgeText: { fontSize: 8, fontWeight: '700', color: '#212121' },
  card16: { borderRadius: 16, padding: 16, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 2, shadowOffset: { width: 0, height: 1 } },
  presetChip: { width: 76, height: 110, borderRadius: 14, borderWidth: 2, overflow: 'hidden' },
  presetCheck: { position: 'absolute', top: 6, right: 6 },
  presetLabel: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingVertical: 5, alignItems: 'center' },
  customThumb: { width: 80, height: 80, borderRadius: 12, overflow: 'hidden' },
  removeBg: { position: 'absolute', top: 2, right: 2, width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  banner: { flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 16, marginBottom: 8, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
  animCard: { width: 70, height: 110, borderRadius: 12, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  bubbleChip: { width: 92, minHeight: 92, borderRadius: 14, borderWidth: 2, padding: 10, alignItems: 'center' },
  fontChip: { width: 96, minHeight: 84, borderRadius: 14, borderWidth: 2, padding: 10, alignItems: 'center' },
  optionRow: { flexDirection: 'row', alignItems: 'center', gap: 14, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12 },
  optionIcon: { width: 42, height: 42, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  emojiCard: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.18, shadowOffset: { width: 0, height: 1 } },
  premiumTile: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, paddingHorizontal: 16, paddingVertical: 14, borderRadius: 18, borderWidth: 1, backgroundColor: '#0E0E12' },
  premiumIcon: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  appModeCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 18, padding: 16 },
  appModeIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  check: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, alignItems: 'center', justifyContent: 'center', marginLeft: 12 },
  packCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, padding: 12 },
});
