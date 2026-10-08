/**
 * Нижняя навигация — порт Android ui/chats/BottomNavBar.kt (AppBottomNavBar):
 * плавающая «стеклянная» таблетка M3 Expressive, 4 пункта
 * (Чаты · Контакты · Папки · Профиль), индикатор-pill 52×28 раскрывается
 * от центра пружиной, тактильный отклик при смене, аватар в «Профиле»
 * с запасной иконкой. NAV_BAR_HEIGHT — для отступа списков (LocalNavBarInset).
 */
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { UserSession, useSessionField } from '../../../core/session';
import { absMediaUrl } from '../../../core/helpers';
import { usePerformance } from '../../../core/prefs';
import { useTranslation } from '../../../i18n';
import { useWMTheme } from '../../../theme/themeManager';
import { WMMotion, WMTypography, withAlpha } from '../../../theme/wmTheme';

export type BottomNavTab = 'CHATS' | 'CONTACTS' | 'FOLDERS' | 'SETTINGS' | 'PROFILE';

/** Высота бара над контентом без системного отступа: 4+3+28+2+16+3+4 ≈ 60 + 6 снизу. */
export const NAV_BAR_HEIGHT = 66;

export function AppBottomNavBar({ selectedTab, onTabSelected }: { selectedTab: BottomNavTab; onTabSelected: (tab: BottomNavTab) => void }) {
  const { t } = useTranslation();
  const cs = useWMTheme().colorScheme;
  const insets = useSafeAreaInsets();
  const perfMode = usePerformance((s) => s.active);
  const avatar = useSessionField('avatar', () => UserSession.avatar);
  const avatarUrl = avatar && avatar.trim() ? absMediaUrl(avatar) : null;

  const select = (tab: BottomNavTab) => {
    if (tab !== selectedTab) void Haptics.selectionAsync();
    onTabSelected(tab);
  };

  return (
    <View style={{ paddingHorizontal: 24, paddingBottom: 6 + insets.bottom }} pointerEvents="box-none">
      <View
        style={[
          styles.glass,
          { backgroundColor: withAlpha(cs.surfaceContainer, perfMode ? 0.97 : 0.78), borderColor: withAlpha(cs.outlineVariant, 0.35) },
          !perfMode && styles.shadow,
        ]}
      >
        {/* светлый блик сверху */}
        <LinearGradient colors={['rgba(255,255,255,0.10)', 'transparent']} style={StyleSheet.absoluteFill} pointerEvents="none" />
        <View style={[StyleSheet.absoluteFill, styles.topEdge]} pointerEvents="none" />
        <View style={styles.row}>
          <NavItem label={t('chats')} selected={selectedTab === 'CHATS'} perfMode={perfMode} onPress={() => select('CHATS')} icon={(s) => (s ? 'chat' : 'chat-outline')} />
          <NavItem label={t('contacts')} selected={selectedTab === 'CONTACTS'} perfMode={perfMode} onPress={() => select('CONTACTS')} icon={(s) => (s ? 'contacts' : 'contacts-outline')} />
          <NavItem label={t('folders')} selected={selectedTab === 'FOLDERS'} perfMode={perfMode} onPress={() => select('FOLDERS')} icon={(s) => (s ? 'folder' : 'folder-open-outline')} />
          <NavItem
            label={t('profile')}
            selected={selectedTab === 'PROFILE'}
            perfMode={perfMode}
            onPress={() => select('PROFILE')}
            icon={(s) => (s ? 'account' : 'account-outline')}
            renderIcon={(s, tint, fallback) => <ProfileAvatarIcon url={avatarUrl} selected={s} tint={tint} fallback={fallback} />}
          />
        </View>
      </View>
    </View>
  );
}

function ProfileAvatarIcon({ url, selected, tint, fallback }: { url: string | null; selected: boolean; tint: string; fallback: string }) {
  const cs = useWMTheme().colorScheme;
  const [failed, setFailed] = useState<string | null>(null);
  if (url && failed !== url) {
    return (
      <Image
        source={{ uri: url }}
        onError={() => setFailed(url)}
        contentFit="cover"
        style={{ width: 24, height: 24, borderRadius: 12, borderWidth: selected ? 2 : 0, borderColor: cs.primary }}
      />
    );
  }
  return <MaterialCommunityIcons name={fallback as never} size={24} color={tint} />;
}

function NavItem({
  label,
  selected,
  perfMode,
  onPress,
  icon,
  renderIcon,
}: {
  label: string;
  selected: boolean;
  perfMode: boolean;
  onPress: () => void;
  icon: (selected: boolean) => string;
  renderIcon?: (selected: boolean, tint: string, fallback: string) => React.ReactNode;
}) {
  const cs = useWMTheme().colorScheme;
  const tint = selected ? cs.onSecondaryContainer : cs.onSurfaceVariant;
  const labelColor = selected ? cs.onSurface : cs.onSurfaceVariant;

  const indicator = useAnimatedStyle(
    () => ({
      width: withSpring(selected ? 52 : 0, perfMode ? WMMotion.fastEffects : WMMotion.fastSpatial),
      opacity: withSpring(selected ? 1 : 0, WMMotion.fastEffects),
    }),
    [selected, perfMode],
  );

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      style={({ pressed }) => [styles.item, pressed && { backgroundColor: withAlpha(cs.onSurface, 0.08) }]}
    >
      <View style={styles.iconBox}>
        <Animated.View style={[styles.indicator, { backgroundColor: cs.secondaryContainer }, indicator]} />
        {renderIcon ? renderIcon(selected, tint, icon(selected)) : <MaterialCommunityIcons name={icon(selected) as never} size={24} color={tint} />}
      </View>
      <Text numberOfLines={1} style={[WMTypography.labelSmall, { marginTop: 2, color: labelColor, fontWeight: selected ? '600' : '500' }]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  glass: { borderRadius: 26, borderWidth: 0.6, overflow: 'hidden' },
  shadow: { shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 6 },
  topEdge: { borderRadius: 26, borderTopWidth: 0.6, borderColor: 'rgba(255,255,255,0.45)' },
  row: { flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center', paddingHorizontal: 4, paddingVertical: 4 },
  item: { flex: 1, alignItems: 'center', borderRadius: 20, paddingVertical: 3 },
  iconBox: { width: 52, height: 28, alignItems: 'center', justifyContent: 'center' },
  indicator: { position: 'absolute', height: 28, borderRadius: 14 },
});
