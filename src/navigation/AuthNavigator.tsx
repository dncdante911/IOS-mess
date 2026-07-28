import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { AuthStackParamList } from './types';
import { SplashScreen } from '../screens/auth/SplashScreen';
import { LanguageSelectionScreen } from '../screens/auth/LanguageSelectionScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { ForgotPasswordScreen } from '../screens/auth/ForgotPasswordScreen';
import { VerificationScreen } from '../screens/auth/VerificationScreen';
import { DeviceVerificationScreen } from '../screens/auth/DeviceVerificationScreen';
import { useAuthStore } from '../store/authStore';

const AuthStack = createNativeStackNavigator<AuthStackParamList>();

export function AuthNavigator() {
  const deviceVerification = useAuthStore((s) => s.deviceVerification);

  // Экран кода перекрывает весь auth-стек, пока проверка не завершена.
  // Сделано состоянием, а не маршрутом: сессии на этом этапе ещё нет, и уйти
  // «назад» с экрана свайпом или системной кнопкой не должно быть возможно —
  // иначе пользователь потеряет уже отправленный код и получит новый только
  // после повторного ввода пароля.
  if (deviceVerification) return <DeviceVerificationScreen />;

  return (
    <AuthStack.Navigator
      initialRouteName="Splash"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <AuthStack.Screen
        name="Splash"
        component={SplashScreen}
        options={{ animation: 'none' }}
      />
      <AuthStack.Screen
        name="LanguageSelection"
        component={LanguageSelectionScreen}
      />
      <AuthStack.Screen
        name="Login"
        component={LoginScreen}
      />
      <AuthStack.Screen
        name="Register"
        component={RegisterScreen}
      />
      <AuthStack.Screen
        name="ForgotPassword"
        component={ForgotPasswordScreen}
      />
      <AuthStack.Screen
        name="Verification"
        component={VerificationScreen}
      />
    </AuthStack.Navigator>
  );
}
