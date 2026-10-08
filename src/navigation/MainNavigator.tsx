import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ChatsHome } from '../features/chats/ChatsHome';
import { ChannelRepliesScreen } from '../features/channels/ChannelRepliesScreen';
import { AuthNavigator } from './AuthNavigator';
import { CallsScreen } from '../screens/calls/CallsScreen';
import { StoriesScreen } from '../screens/stories/StoriesScreen';
import MessagesScreen from '../screens/messages/MessagesScreen';
import { GroupsScreen } from '../screens/groups/GroupsScreen';
import { ChannelDetailsScreen } from '../screens/channels/ChannelDetailsScreen';
import UserProfileScreen from '../screens/profile/UserProfileScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';
import ThemeSettingsScreen from '../features/themeSettings/ThemeSettingsScreen';
import UIStyleOnboardingScreen from '../features/onboarding/UIStyleOnboardingScreen';
import { UIStylePreferences } from '../preferences/uiStyle';
import { useTheme } from '../theme';
import { useTranslation, type TranslationKeys } from '../i18n';
import type { RootStackParamList } from './types';

function PlaceholderScreen({ title }: { title: string }) {
  const theme = useTheme();
  const { t } = useTranslation();
  return (
    <SafeAreaView style={[styles.placeholderRoot, { backgroundColor: theme.background }]} edges={['top']}>
      <View style={styles.placeholderInner}>
        <Feather name="clock" size={48} color={theme.divider} />
        <Text style={[styles.placeholderTitle, { color: theme.text }]}>{title}</Text>
        <Text style={[styles.placeholderSubtitle, { color: theme.textSecondary }]}>{t('coming_soon')}</Text>
      </View>
    </SafeAreaView>
  );
}

function GlobalSearchScreen() {
  const { t } = useTranslation();
  return <PlaceholderScreen title={t('search')} />;
}

function SavedMessagesScreen() {
  const { t } = useTranslation();
  return <PlaceholderScreen title={t('saved_messages')} />;
}

function NotesScreen() {
  const { t } = useTranslation();
  return <PlaceholderScreen title={t('notes')} />;
}

function GroupMessagesScreen() {
  const { t } = useTranslation();
  return <PlaceholderScreen title={t('groups')} />;
}

// Экраны следующих фаз — пока заглушки, чтобы переходы с портированных экранов работали
function PremiumScreen() {
  const { t } = useTranslation();
  return <PlaceholderScreen title={t('premium_title')} />;
}
function PremiumChannelsThemeScreen() {
  const { t } = useTranslation();
  return <PlaceholderScreen title={t('premium_channels_design_title')} />;
}
function CallFrameSettingsScreen() {
  const { t } = useTranslation();
  return <PlaceholderScreen title={t('theme_cat_calls')} />;
}
function VideoMessageFrameSettingsScreen() {
  const { t } = useTranslation();
  return <PlaceholderScreen title={t('theme_cat_video_msg')} />;
}

/** Заглушка с заголовком из параметров (экраны следующих фаз). */
function ComingSoonScreen({ route }: { route: { params: { title: string } } }) {
  return <PlaceholderScreen title={route.params.title} />;
}

/** Экраны бокового меню, которые портируются в своих фазах. */
function titled(key: TranslationKeys) {
  return function Titled() {
    const { t } = useTranslation();
    return <PlaceholderScreen title={t(key)} />;
  };
}
const NewsListScreen = titled('news_nav_label');
const RecommendedChannelsScreen = titled('recommended_channels_title');
const BotStoreScreen = titled('bot_store');
const GeoDiscoveryScreen = titled('geo_discovery_title');
const BusinessDirectoryScreen = titled('business_directory');
const StarsScreen = titled('stars_title');
const AdsScreen = titled('ads_title');
const RefundsScreen = titled('refunds_title');
const TicketsScreen = titled('ticket_screen_title');
const DraftsScreen = titled('drafts');

/** «Добавить аккаунт» — вход без сброса текущей сессии. */
function AddAccountScreen() {
  return <AuthNavigator initialRouteName="Login" />;
}

const Stack = createNativeStackNavigator<RootStackParamList>();

export function MainNavigator() {
  return (
    // Первый вход — онбординг выбора режима и стиля (UIStyleOnboardingActivity.afterAuthIntent)
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName={UIStylePreferences.hasSeenOnboarding() ? 'Main' : 'UIStyleOnboarding'}
    >
      <Stack.Screen name="UIStyleOnboarding" component={UIStyleOnboardingScreen} options={{ animation: 'fade' }} />
      <Stack.Screen name="Main" component={ChatsHome} />
      <Stack.Screen name="Settings" component={SettingsScreen as React.ComponentType} options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="CallHistory" component={CallsScreen as React.ComponentType} options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="Stories" component={StoriesScreen as React.ComponentType} options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="NewsList" component={NewsListScreen} options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="RecommendedChannels" component={RecommendedChannelsScreen} options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="BotStore" component={BotStoreScreen} options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="GeoDiscovery" component={GeoDiscoveryScreen} options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="BusinessDirectory" component={BusinessDirectoryScreen} options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="Stars" component={StarsScreen} options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="Ads" component={AdsScreen} options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="Refunds" component={RefundsScreen} options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="Tickets" component={TicketsScreen} options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="Drafts" component={DraftsScreen} options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="ChannelReplies" component={ChannelRepliesScreen} options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="AddAccount" component={AddAccountScreen} options={{ animation: 'slide_from_bottom' }} />
      <Stack.Screen name="ComingSoon" component={ComingSoonScreen as React.ComponentType} options={{ animation: 'slide_from_right' }} />
      <Stack.Screen
        name="Messages"
        component={MessagesScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="GroupMessages"
        component={GroupMessagesScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="Groups"
        component={GroupsScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="ChannelDetails"
        component={ChannelDetailsScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="UserProfile"
        component={UserProfileScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="GlobalSearch"
        component={GlobalSearchScreen}
        options={{ animation: 'fade' }}
      />
      <Stack.Screen
        name="SavedMessages"
        component={SavedMessagesScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen name="ThemeSettings" component={ThemeSettingsScreen} options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="Premium" component={PremiumScreen} options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="PremiumChannelsTheme" component={PremiumChannelsThemeScreen} options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="CallFrameSettings" component={CallFrameSettingsScreen} options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="VideoMessageFrameSettings" component={VideoMessageFrameSettingsScreen} options={{ animation: 'slide_from_right' }} />
      <Stack.Screen
        name="Notes"
        component={NotesScreen}
        options={{ animation: 'slide_from_right' }}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  placeholderRoot: { flex: 1 },
  placeholderInner: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  placeholderTitle: { fontSize: 20, fontWeight: '600' },
  placeholderSubtitle: { fontSize: 14 },
});
