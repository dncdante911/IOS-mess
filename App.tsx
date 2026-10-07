import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';

import AppNavigator from './src/navigation/AppNavigator';
import './src/core/android';
import { WMApplication } from './src/core/app';
import { Provider as PaperProvider } from 'react-native-paper';
import { useWMTheme } from './src/theme';
import { WMToastHost } from './src/components/common/WMToast';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Аналог Android WMApplication.onCreate(): KV, язык, прокси, сессия,
        // мультиаккаунт, производительность, кеш, монитор сети, краш-репортер.
        await WMApplication.onCreate();

        // Pre-load fonts
        await Font.loadAsync({
          ...Ionicons.font,
          ...MaterialCommunityIcons.font,
          ...FontAwesome5.font,
        });

        // Allow time for auth state to hydrate from secure storage.
        // AppNavigator's auth store handles the actual token check;
        // a brief yield here prevents a flash of the wrong screen.
        await new Promise<void>((resolve) => setTimeout(resolve, 300));
      } catch (error) {
        // Log but don't crash — the app can still function without custom fonts
        console.warn('App preparation error:', error);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      // This tells the splash screen to hide immediately
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <StatusBar style="auto" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.root} onLayout={onLayoutRootView}>
      <SafeAreaProvider>
        <ThemedRoot />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

/**
 * WorldMatesThemedApp: тема Material 3 (react-native-paper) по выбранному
 * варианту + статус-бар по режиму, как на Android.
 */
function ThemedRoot() {
  const theme = useWMTheme();
  return (
    <PaperProvider theme={theme.paper}>
      <StatusBar style={theme.isDark ? 'light' : 'dark'} />
      <AppNavigator />
      {/* Хост фирменных уведомлений поверх любого экрана (как WorldMatesThemedApp) */}
      <WMToastHost />
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
});
