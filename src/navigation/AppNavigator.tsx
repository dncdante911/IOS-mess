import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from './types';
import { AuthNavigator } from './AuthNavigator';
import { MainNavigator } from './MainNavigator';
import { useAuthStore } from '../store/authStore';
import { useChatStore } from '../store/chatStore';
import { useTheme } from '../theme';
import { useSandboxStore } from '../store/sandboxStore';

const RootStack = createNativeStackNavigator<RootStackParamList>();

function LoadingScreen() {
  const theme = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ActivityIndicator size="large" color={theme.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default function AppNavigator() {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const isLoading = useAuthStore((state) => state.isLoading);
  const loadStoredAuth = useAuthStore((state) => state.loadStoredAuth);

  const hydrateSandbox = useSandboxStore((s) => s._hydrate);

  useEffect(() => {
    loadStoredAuth();
    hydrateSandbox();
  }, [loadStoredAuth, hydrateSandbox]);

  /**
   * Подписка на события сокета после входа.
   *
   * ⚠️ Раньше initSocketListeners() была написана, но НЕ ВЫЗЫВАЛАСЬ ниоткуда —
   * ни одного места во всём проекте. Сокет подключался, сервер события слал,
   * но слушать их было некому: входящие сообщения, набор текста, статусы
   * онлайн и отметки о прочтении просто не доходили до стора. Со стороны это
   * выглядело как «с других устройств сообщения не приходят».
   *
   * Место выбрано здесь, а не в authStore, из-за циклического импорта:
   * chatStore уже импортирует authStore (нужен свой userId для маршрутизации
   * сообщений), и обратная зависимость замкнула бы круг.
   */
  useEffect(() => {
    if (!isLoggedIn) return;
    useChatStore.getState().initSocketListeners();
  }, [isLoggedIn]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {isLoggedIn ? (
          <RootStack.Screen name="Main" component={MainNavigator} />
        ) : (
          <RootStack.Screen name="Auth" component={AuthNavigator} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
