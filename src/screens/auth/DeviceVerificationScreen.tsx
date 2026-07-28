import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

import { useAuthStore } from '../../store/authStore';
import { useTranslation } from '../../i18n';
import { useTheme } from '../../theme';
import { LanguageSwitcher } from '../../components/common/LanguageSwitcher';

/**
 * Ввод 6-значного кода при входе с нового устройства.
 *
 * Показывается вместо формы логина, когда пароль уже принят, но сервер не узнал
 * устройство. Порт `ui/login/LoginCodeScreen.kt` с Android.
 *
 * Сессии на этом этапе ещё НЕТ — токен выдаётся только после верного кода,
 * поэтому экран живёт в auth-навигаторе и управляется состоянием стора, а не
 * отдельным маршрутом с параметрами.
 */
export function DeviceVerificationScreen() {
  const theme = useTheme();
  const { t } = useTranslation();

  const pending = useAuthStore((s) => s.deviceVerification);
  const isLoading = useAuthStore((s) => s.isLoading);
  const error = useAuthStore((s) => s.error);
  const submit = useAuthStore((s) => s.submitDeviceVerificationCode);
  const resend = useAuthStore((s) => s.resendDeviceVerificationEmail);
  const cancel = useAuthStore((s) => s.cancelDeviceVerification);

  const [code, setCode] = useState('');
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

  if (!pending) return null;

  const subtitle = (() => {
    if (pending.deliveryChannel === 'both' && pending.emailMasked) {
      return t('login_verify_sent_both').replace('{email}', pending.emailMasked);
    }
    if (pending.deliveryChannel === 'push') return t('login_verify_sent_device');
    if (pending.emailMasked) {
      return t('login_verify_sent_email_addr').replace('{email}', pending.emailMasked);
    }
    return t('login_verify_sent_email');
  })();

  const handleResend = async () => {
    setResending(true);
    setResendMessage('');
    // Сервер возвращает уже локализованный текст и для успеха, и для лимитов
    // (60 с между отправками, максимум 3 раза) — показываем как есть.
    const message = await resend();
    setResendMessage(message);
    setResending(false);
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.content}>
          <View style={[styles.iconCircle, { backgroundColor: theme.surface }]}>
            <Feather name="lock" size={30} color={theme.primary} />
          </View>

          <Text style={[styles.title, { color: theme.text }]}>{t('login_verify_title')}</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{subtitle}</Text>

          <TextInput
            style={[
              styles.codeInput,
              {
                backgroundColor: theme.inputBackground,
                color: theme.text,
                borderColor: theme.divider,
              },
            ]}
            value={code}
            onChangeText={(v) => setCode(v.replace(/\D/g, '').slice(0, 6))}
            placeholder="______"
            placeholderTextColor={theme.textTertiary}
            keyboardType="number-pad"
            textContentType="oneTimeCode"   // iOS сам подставит код из SMS/почты
            autoFocus
            editable={!isLoading}
            maxLength={6}
          />

          {error ? <Text style={[styles.error, { color: theme.error }]}>{error}</Text> : null}
          {resendMessage ? (
            <Text style={[styles.info, { color: theme.success }]}>{resendMessage}</Text>
          ) : null}

          <TouchableOpacity
            style={[
              styles.submitButton,
              { backgroundColor: theme.primary, opacity: code.length === 6 && !isLoading ? 1 : 0.5 },
            ]}
            onPress={() => submit(code)}
            disabled={code.length !== 6 || isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.submitText}>{t('verify')}</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={handleResend} disabled={resending} style={styles.linkButton}>
            <Text style={[styles.linkText, { color: theme.primary }]}>
              {resending ? t('loading') : t('login_verify_resend_email')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={cancel} style={styles.linkButton}>
            <Text style={[styles.linkText, { color: theme.textSecondary }]}>
              {t('login_verify_back')}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.languageRow}>
          <LanguageSwitcher variant="compact" />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: 28 },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: { fontSize: 22, fontWeight: '700', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 14, textAlign: 'center', lineHeight: 20, marginBottom: 28 },
  codeInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 14,
    fontSize: 26,
    letterSpacing: 10,
    textAlign: 'center',
    fontWeight: '600',
  },
  error: { fontSize: 13, textAlign: 'center', marginTop: 12 },
  info: { fontSize: 13, textAlign: 'center', marginTop: 12 },
  submitButton: {
    marginTop: 22,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
  },
  submitText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  linkButton: { alignSelf: 'center', paddingVertical: 10 },
  linkText: { fontSize: 14, fontWeight: '500' },
  languageRow: { alignItems: 'center', paddingBottom: 16 },
});

export default DeviceVerificationScreen;
