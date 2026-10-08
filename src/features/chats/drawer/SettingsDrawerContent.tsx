/**
 * Содержимое бокового меню — порт SettingsDrawerContent из Android
 * ui/chats/ChatsActivity.kt: шапка-карточка (аватар с кольцом историй / «+»,
 * имя + эмодзи-статус, ID, кнопка аккаунтов, 🎨 фон шапки), лента историй,
 * быстрые плитки, разделы меню, закреплённый низ (Настройки + тема).
 *
 * Карточка «Доступно обновление» в Android — про APK-автообновление; на iOS
 * (TestFlight/sideload) его нет, поэтому карточка не показывается.
 */
import React, { useEffect, useState } from 'react';
import { FlatList, Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { Button, IconButton } from 'react-native-paper';
import { Image } from 'expo-image';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming, cancelAnimation } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { M } from '../../../core/android';
import { StoryX, fullNameOf } from '../../../core/android';
import { UserSession, useSessionField } from '../../../core/session';
import { AccountManager, useAccountsStore } from '../../../core/accountManager';
import { absMediaUrl } from '../../../core/helpers';
import { usePerformance } from '../../../core/prefs';
import { useTranslation } from '../../../i18n';
import { useThemeState, useWMTheme } from '../../../theme/themeManager';
import { QuickThemeToggle } from '../../../theme/quickThemeToggle';
import { luminance } from '../../../theme/color';
import { WMTypography, withAlpha } from '../../../theme/wmTheme';
import { SweepGradientBox } from '../../../components/common/SweepGradientBox';
import { settingsIconColor } from '../../settings/settingsIconColor';
import { AccountSwitcherDialog } from '../components/AccountSwitcherDialog';
import {
  DrawerHeaderBackground,
  DrawerHeaderCustomizeButton,
  DrawerHeaderPickerSheet,
  DrawerHeaderStore,
  useDrawerHeaderContentColor,
  useDrawerHeaderStyle,
} from './DrawerHeaderStyle';

/** Куда ведут пункты меню (ChatsHome сопоставляет с маршрутами). */
export type DrawerDestination =
  | 'Profile'
  | 'SavedMessages'
  | 'GlobalSearch'
  | 'CallHistory'
  | 'Notes'
  | 'NewsList'
  | 'RecommendedChannels'
  | 'BotStore'
  | 'GeoDiscovery'
  | 'BusinessDirectory'
  | 'Stars'
  | 'Premium'
  | 'Ads'
  | 'Refunds'
  | 'Tickets';

const STORY_RING = ['#FF6B9D', '#C239E8', '#6C63FF', '#00D4FF', '#FF6B9D'];

export function SettingsDrawerContent({
  onNavigateToFullSettings,
  onClose,
  onOpen,
  onShowContactPicker = () => {},
  onShowDrafts = () => {},
  onCreateStoryPress = () => {},
  onCreateGroup = () => {},
  onOpenUserStories = () => {},
  onAddAccount,
  onAccountSwitched,
  stories = [],
}: {
  onNavigateToFullSettings: () => void;
  onClose: () => void;
  onOpen: (dest: DrawerDestination) => void;
  onShowContactPicker?: () => void;
  onShowDrafts?: () => void;
  onCreateStoryPress?: () => void;
  onCreateGroup?: () => void;
  /** просмотр историй пользователя (userId) */
  onOpenUserStories?: (userId: number) => void;
  onAddAccount: () => void;
  onAccountSwitched: () => void;
  stories?: M.Story[];
}) {
  const { t } = useTranslation();
  const cs = useWMTheme().colorScheme;
  const insets = useSafeAreaInsets();
  const perfMode = usePerformance((s) => s.active);
  const avatar = useSessionField('avatar', () => UserSession.avatar);
  const statusEmoji = useSessionField('statusEmoji', () => UserSession.statusEmoji);
  const starsBalance = useSessionField('starsBalance', () => UserSession.starsBalance);
  const accounts = useAccountsStore((s) => s.accounts);
  const themeState = useThemeState();
  const [showAccountSwitcher, setShowAccountSwitcher] = useState(false);
  const [showHeaderPicker, setShowHeaderPicker] = useState(false);

  const uid = UserSession.userId;
  const headerStyle = useDrawerHeaderStyle(uid);
  const onHeader = useDrawerHeaderContentColor(headerStyle);
  const ownStories = stories.filter((s) => s.userId === uid);
  const otherStories = stories.filter((s) => s.userId !== uid);
  const hasOwnStories = ownStories.length > 0;
  const otherAccounts = accounts.filter((a) => a.userId !== uid);
  const avatarUrl = avatar ? absMediaUrl(avatar) : '';

  const open = (d: DrawerDestination) => {
    onClose();
    onOpen(d);
  };

  // Группировка чужих историй по автору (порядок первого появления)
  const grouped = new Map<number, M.Story[]>();
  for (const s of otherStories) {
    const g = grouped.get(s.userId);
    if (g) g.push(s);
    else grouped.set(s.userId, [s]);
  }

  const isDark = QuickThemeToggle.isEffectivelyDark(themeState);

  return (
    <View style={{ flex: 1, backgroundColor: cs.surfaceContainerLow }}>
      {/* ── Шапка-карточка ── */}
      <Pressable onPress={() => open('Profile')} style={[styles.header, { marginTop: insets.top + 8 }]}>
        <DrawerHeaderBackground style={headerStyle} perfMode={perfMode} onPhotoMissing={() => DrawerHeaderStore.set(uid, { kind: 'theme' })} />
        <View style={{ paddingLeft: 18, paddingRight: 8, paddingTop: 12, paddingBottom: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
            <View style={styles.avatarBox}>
              {hasOwnStories ? (
                <SweepGradientBox size={68} radius={34} colors={STORY_RING} style={StyleSheet.absoluteFill} />
              ) : (
                <View style={[StyleSheet.absoluteFill, { borderRadius: 34, backgroundColor: withAlpha(onHeader, 0.25) }]} />
              )}
              <Image
                source={avatarUrl ? { uri: avatarUrl } : undefined}
                style={[styles.avatar, { backgroundColor: cs.primaryContainer }]}
                contentFit="cover"
                accessibilityLabel={t('drawer_open_profile')}
              />
              {!hasOwnStories && (
                <Pressable
                  onPress={() => {
                    onClose();
                    onCreateStoryPress();
                  }}
                  style={[styles.plusOuter, { backgroundColor: cs.surface }]}
                  accessibilityLabel={t('create_story')}
                >
                  <View style={[styles.plusInner, { backgroundColor: cs.primary }]}>
                    <MaterialCommunityIcons name="plus" size={14} color={cs.onPrimary} />
                  </View>
                </Pressable>
              )}
            </View>
            <View style={{ flex: 1 }} />
            <DrawerHeaderCustomizeButton tint={onHeader} onPress={() => setShowHeaderPicker(true)} />
            <IconButton icon="close" iconColor={withAlpha(onHeader, 0.85)} onPress={onClose} accessibilityLabel={t('close')} />
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12 }}>
            <Text numberOfLines={1} style={[WMTypography.titleLarge, { flexShrink: 1, fontWeight: '700', color: onHeader }]}>
              {UserSession.username ?? t('user_label')}
            </Text>
            {statusEmoji && statusEmoji.trim() ? <Text style={[WMTypography.titleMedium, { marginLeft: 6 }]}>{statusEmoji}</Text> : null}
          </View>
          <Text style={[WMTypography.bodySmall, { color: withAlpha(onHeader, 0.8) }]}>{`ID ${uid}`}</Text>
          <Pressable onPress={() => setShowAccountSwitcher(true)} style={[styles.accountsBtn, { backgroundColor: withAlpha(onHeader, 0.18), paddingLeft: otherAccounts.length === 0 ? 12 : 4 }]}>
            {otherAccounts.length === 0 ? (
              <MaterialCommunityIcons name="account-cog-outline" size={18} color={onHeader} style={{ marginRight: 6 }} />
            ) : (
              <View style={{ flexDirection: 'row', marginRight: Math.max(0, 6 - 6 * (Math.min(3, otherAccounts.length) - 1)) }}>
                {otherAccounts.slice(0, 3).map((acc, i) => (
                  <Image
                    key={acc.userId}
                    source={acc.avatar ? { uri: absMediaUrl(acc.avatar) } : undefined}
                    style={[styles.miniAvatar, { marginLeft: i === 0 ? 0 : -6, borderColor: cs.primary, backgroundColor: cs.primaryContainer }]}
                    contentFit="cover"
                    accessibilityLabel={acc.username ?? undefined}
                  />
                ))}
              </View>
            )}
            <Text style={[WMTypography.labelLarge, { color: onHeader }]}>{t('drawer_accounts')}</Text>
            <MaterialCommunityIcons name="chevron-down" size={18} color={onHeader} />
          </Pressable>
        </View>
      </Pressable>

      {/* ── Лента историй ── */}
      {(hasOwnStories || grouped.size > 0) && (
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ flexGrow: 0, marginTop: 12 }}
          contentContainerStyle={{ paddingHorizontal: 14, gap: 10 }}
          data={[...(hasOwnStories ? [{ uid, own: true }] : []), ...[...grouped.keys()].map((k) => ({ uid: k, own: false }))]}
          keyExtractor={(it) => String(it.uid)}
          renderItem={({ item }) => {
            const close = (userId: number) => () => {
              onClose();
              onOpenUserStories(userId);
            };
            if (item.own) return <DrawerStoryCircle avatarUrl={avatarUrl} name={t('my_story')} hasUnviewed={false} onPress={close(uid)} />;
            const list = grouped.get(item.uid) ?? [];
            const first = list[0];
            const u = first?.userData;
            return (
              <DrawerStoryCircle
                avatarUrl={u?.avatar ? absMediaUrl(u.avatar) : ''}
                name={u ? fullNameOf(u) : ''}
                hasUnviewed={list.some((s) => !StoryX.seen(s))}
                onPress={close(item.uid)}
              />
            );
          }}
        />
      )}

      {/* ── Меню ── */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingTop: 12, paddingBottom: 8 }}>
        <View style={{ flexDirection: 'row', paddingHorizontal: 12, gap: 8 }}>
          <QuickTile icon="account-group-outline" plate={settingsIconColor('Outlined.Group')} label={t('drawer_tile_group')} onPress={() => (onClose(), onCreateGroup())} />
          <QuickTile icon="camera-outline" plate={settingsIconColor('Outlined.CameraAlt')} label={t('drawer_tile_story')} onPress={() => (onClose(), onCreateStoryPress())} />
          <QuickTile icon="contacts-outline" plate={settingsIconColor('Outlined.Contacts')} label={t('contacts')} onPress={() => (onClose(), onShowContactPicker())} />
          <QuickTile icon="bookmark-outline" plate={settingsIconColor('Outlined.Bookmark')} label={t('drawer_tile_saved')} onPress={() => open('SavedMessages')} />
        </View>

        <SectionHeader title={t('drawer_section_tools')} />
        <DrawerMenuItem icon="magnify" plate={settingsIconColor('Outlined.Search')} title={t('global_search_title')} onPress={() => open('GlobalSearch')} />
        <DrawerMenuItem icon="phone-outline" plate={settingsIconColor('Outlined.Call')} title={t('calls')} onPress={() => open('CallHistory')} />
        <DrawerMenuItem icon="note-text-outline" plate={settingsIconColor('AutoMirrored.Outlined.Note')} title={t('notes_title')} onPress={() => open('Notes')} />
        <DrawerMenuItem icon="pencil-outline" plate={settingsIconColor('Outlined.Edit')} title={t('drafts')} onPress={() => (onClose(), onShowDrafts())} />

        <SectionHeader title={t('drawer_section_discover')} />
        <DrawerMenuItem icon="newspaper-variant-outline" plate={settingsIconColor('AutoMirrored.Outlined.Article')} title={t('news_nav_label')} onPress={() => open('NewsList')} />
        <DrawerMenuItem icon="compass-outline" plate={settingsIconColor('Outlined.Explore')} title={t('recommended_channels_title')} onPress={() => open('RecommendedChannels')} />
        <DrawerMenuItem icon="robot-outline" plate={settingsIconColor('Outlined.SmartToy')} title={t('bot_store')} onPress={() => open('BotStore')} />
        <DrawerMenuItem icon="map-marker-outline" plate={settingsIconColor('Outlined.Place')} title={t('geo_discovery_title')} onPress={() => open('GeoDiscovery')} />
        <DrawerMenuItem icon="storefront-outline" plate={settingsIconColor('Outlined.Storefront')} title={t('business_directory')} onPress={() => open('BusinessDirectory')} />

        <SectionHeader title={t('drawer_section_wallet')} />
        <DrawerMenuItem
          icon="creation"
          plate={settingsIconColor('Outlined.AutoAwesome')}
          title={t('stars_title')}
          onPress={() => open('Stars')}
          trailing={
            starsBalance > 0 ? (
              <View style={{ borderRadius: 999, backgroundColor: 'rgba(255,215,0,0.22)', paddingHorizontal: 9, paddingVertical: 3 }}>
                <Text style={[WMTypography.labelMedium, { fontWeight: '700', color: luminance(cs.surface) > 0.5 ? '#8A6200' : '#FFD54F' }]}>{t('stars_balance_fmt', [starsBalance])}</Text>
              </View>
            ) : null
          }
        />
        <DrawerMenuItem icon="star-outline" plate={settingsIconColor('Outlined.Star')} title={t('premium_title')} onPress={() => open('Premium')} />
        <DrawerMenuItem icon="bullhorn-outline" plate={settingsIconColor('Outlined.Campaign')} title={t('ads_title')} onPress={() => open('Ads')} />
        <DrawerMenuItem icon="receipt" plate={settingsIconColor('AutoMirrored.Outlined.ReceiptLong')} title={t('refunds_title')} onPress={() => open('Refunds')} />

        <SectionHeader title={t('drawer_section_help')} />
        <DrawerMenuItem icon="face-agent" plate={settingsIconColor('Outlined.SupportAgent')} title={t('ticket_screen_title')} onPress={() => open('Tickets')} />
        <DrawerMenuItem
          icon="share-variant-outline"
          plate={settingsIconColor('Outlined.Share')}
          title={t('invite_friends')}
          onPress={() => {
            onClose();
            void Share.share({ message: t('invite_friends_text') }, { dialogTitle: t('invite_friend_chooser_title') });
          }}
        />
      </ScrollView>

      {/* ── Закреплённый низ ── */}
      <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: withAlpha(cs.outlineVariant, 0.5) }} />
      <View style={[styles.bottom, { paddingBottom: 10 + insets.bottom }]}>
        <Button mode="contained-tonal" icon="cog-outline" onPress={onNavigateToFullSettings} style={{ flex: 1, borderRadius: 16 }} contentStyle={{ height: 48 }}>
          {t('settings')}
        </Button>
        <Pressable
          onPress={() => QuickThemeToggle.toggle()}
          style={[styles.themeBtn, { backgroundColor: cs.secondaryContainer }]}
          accessibilityLabel={t(isDark ? 'drawer_light_theme' : 'drawer_dark_theme')}
        >
          <MaterialCommunityIcons name={isDark ? 'white-balance-sunny' : 'weather-night'} size={24} color={cs.onSecondaryContainer} />
        </Pressable>
      </View>

      <DrawerHeaderPickerSheet visible={showHeaderPicker} userId={uid} current={headerStyle} onDismiss={() => setShowHeaderPicker(false)} />
      <AccountSwitcherDialog
        visible={showAccountSwitcher}
        onDismiss={() => setShowAccountSwitcher(false)}
        onSwitchAccount={(userId) => {
          setShowAccountSwitcher(false);
          void AccountManager.switchAccount(userId, onAccountSwitched);
        }}
        onAddAccount={() => {
          setShowAccountSwitcher(false);
          onAddAccount();
        }}
      />
    </View>
  );
}

function SectionHeader({ title }: { title: string }) {
  const cs = useWMTheme().colorScheme;
  return <Text style={[WMTypography.labelLarge, { fontWeight: '600', color: cs.primary, paddingHorizontal: 24, paddingTop: 18, paddingBottom: 4 }]}>{title}</Text>;
}

function QuickTile({ icon, plate, label, onPress }: { icon: string; plate: string; label: string; onPress: () => void }) {
  const cs = useWMTheme().colorScheme;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.tile, { backgroundColor: cs.surfaceBright }, pressed && { opacity: 0.7 }]}>
      <View style={[styles.tilePlate, { backgroundColor: plate }]}>
        <MaterialCommunityIcons name={icon as never} size={21} color="#FFFFFF" />
      </View>
      <Text numberOfLines={1} style={[WMTypography.labelMedium, { marginTop: 6, color: cs.onSurface }]}>
        {label}
      </Text>
    </Pressable>
  );
}

export function DrawerMenuItem({ icon, plate, title, onPress, trailing }: { icon: string; plate: string; title: string; onPress: () => void; trailing?: React.ReactNode }) {
  const cs = useWMTheme().colorScheme;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.menuItem, pressed && { backgroundColor: withAlpha(cs.onSurface, 0.08) }]}>
      <View style={[styles.menuPlate, { backgroundColor: plate }]}>
        <MaterialCommunityIcons name={icon as never} size={18} color="#FFFFFF" />
      </View>
      <Text numberOfLines={1} style={[WMTypography.bodyLarge, { flex: 1, marginLeft: 14, color: cs.onSurface }]}>
        {title}
      </Text>
      {trailing}
    </Pressable>
  );
}

export function DrawerStoryCircle({ avatarUrl, name, hasUnviewed, onPress }: { avatarUrl: string; name: string; hasUnviewed: boolean; onPress: () => void }) {
  const cs = useWMTheme().colorScheme;
  const perfMode = usePerformance((s) => s.active);
  const rot = useSharedValue(0);
  useEffect(() => {
    if (hasUnviewed && !perfMode) rot.value = withRepeat(withTiming(360, { duration: 3000, easing: Easing.linear }), -1, false);
    else {
      cancelAnimation(rot);
      rot.value = 0;
    }
  }, [hasUnviewed, perfMode, rot]);
  const ringStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${rot.value}deg` }] }));
  const inner = hasUnviewed ? 42 : 44;
  return (
    <Pressable onPress={onPress} style={{ width: 56, alignItems: 'center' }}>
      <View style={{ width: 48, height: 48, alignItems: 'center', justifyContent: 'center' }}>
        {hasUnviewed ? (
          <Animated.View style={[StyleSheet.absoluteFill, ringStyle]}>
            <SweepGradientBox size={48} radius={24} colors={STORY_RING} />
          </Animated.View>
        ) : (
          <View style={[StyleSheet.absoluteFill, { borderRadius: 24, borderWidth: 1.5, borderColor: withAlpha(cs.outlineVariant, 0.4) }]} />
        )}
        <Image
          source={avatarUrl ? { uri: avatarUrl } : undefined}
          style={{ width: inner, height: inner, borderRadius: inner / 2, borderWidth: 2, borderColor: cs.surface, backgroundColor: cs.surfaceVariant }}
          contentFit="cover"
          accessibilityLabel={name}
        />
      </View>
      <Text numberOfLines={1} style={{ fontSize: 9, marginTop: 2, color: cs.onSurfaceVariant, fontWeight: hasUnviewed ? '600' : '400' }}>
        {name}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: { marginHorizontal: 12, borderRadius: 28, overflow: 'hidden' },
  avatarBox: { width: 68, height: 68, alignItems: 'center', justifyContent: 'center' },
  avatar: { width: 60, height: 60, borderRadius: 30 },
  plusOuter: { position: 'absolute', right: 0, bottom: 0, width: 22, height: 22, borderRadius: 11, padding: 2 },
  plusInner: { flex: 1, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  accountsBtn: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', marginTop: 12, borderRadius: 999, paddingRight: 10, paddingVertical: 4 },
  miniAvatar: { width: 24, height: 24, borderRadius: 12, borderWidth: 1.5 },
  tile: { flex: 1, borderRadius: 20, paddingVertical: 12, paddingHorizontal: 4, alignItems: 'center' },
  tilePlate: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  menuItem: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 12, marginVertical: 1, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 10 },
  menuPlate: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  bottom: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingTop: 10 },
  themeBtn: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
});
