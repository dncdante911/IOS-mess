import type { NavigatorScreenParams } from '@react-navigation/native';

export type AuthStackParamList = {
  Splash: undefined;
  LanguageSelection: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  Verification: { userId: string; email: string };
};

export type MainTabParamList = {
  Chats: undefined;
  Calls: undefined;
  Stories: undefined;
  Settings: undefined;
};

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
  Messages: {
    chatId: string;
    chatType: string;
    chatName: string;
    chatAvatar?: string;
    userId?: string;
  };
  GroupMessages: {
    groupId: string;
    groupName: string;
    groupAvatar?: string;
  };
  ChannelDetails: { channelId: string };
  Groups: undefined;
  UserProfile: { userId: string };
  GlobalSearch: undefined;
  SavedMessages: undefined;
  Notes: undefined;
  Drafts: undefined;
  ThemeSettings: undefined;
  UIStyleOnboarding: undefined;
  Premium: undefined;
  PremiumChannelsTheme: undefined;
  CallFrameSettings: undefined;
  VideoMessageFrameSettings: undefined;
  // Главный экран (порт ChatsActivity) и пункты бокового меню
  Settings: undefined;
  CallHistory: undefined;
  Stories: undefined;
  NewsList: undefined;
  RecommendedChannels: undefined;
  BotStore: undefined;
  GeoDiscovery: undefined;
  BusinessDirectory: undefined;
  Stars: undefined;
  Ads: undefined;
  Refunds: undefined;
  Tickets: undefined;
  ChannelReplies: undefined;
  AddAccount: undefined;
  /** Временная заглушка экрана следующей фазы */
  ComingSoon: { title: string };
};
