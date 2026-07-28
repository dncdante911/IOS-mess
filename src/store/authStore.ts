// ============================================================
// WorldMates Messenger — Auth Store
//
// Handles the full login / register / verify / forgot-password
// lifecycle using the Node.js auth API.
//
// States:
//   idle          — not authenticated, no pending action
//   authenticated — logged in, user + token available
//   verifying     — server returned success_type="verification"
//                   (VerificationRequired — must enter code)
// ============================================================

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { authApi } from '../api/authApi';
import { storageService } from '../services/storageService';
import { socketService } from '../services/socketService';
import { useThemeStore } from '../theme';
import { useI18nStore } from '../i18n';
import type { User } from '../api/types';

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

export interface VerificationContext {
  userId: string;
  verificationType: string;
  contactInfo: string;
  /** username used at registration — needed to resend code */
  username: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  error: string | null;

  /** Set when server requires verification before granting a session */
  verificationRequired: boolean;
  verificationContext: VerificationContext | null;

  /**
   * Проверка входа с НОВОГО УСТРОЙСТВА — не путать с verificationRequired выше:
   * та относится к подтверждению почты/телефона при РЕГИСТРАЦИИ. Здесь пароль
   * уже принят, но сервер не узнал устройство и ждёт 6-значный код.
   */
  deviceVerification: DeviceVerificationContext | null;

  // ── Actions ──────────────────────────────────────────────
  login: (usernameOrEmail: string, password: string) => Promise<void>;
  register: (
    username: string,
    email: string,
    password: string,
    gender?: string,
    inviteCode?: string,
  ) => Promise<void>;
  verifyCode: (code: string) => Promise<void>;
  resendVerificationCode: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (email: string, code: string, newPassword: string) => Promise<void>;
  logout: () => Promise<void>;
  loadStoredAuth: () => Promise<void>;
  clearError: () => void;
  setUser: (user: User) => void;
  cancelVerification: () => void;
  submitDeviceVerificationCode: (code: string) => Promise<void>;
  /** Возвращает уже локализованное сообщение сервера — для показа на экране. */
  resendDeviceVerificationEmail: () => Promise<string>;
  cancelDeviceVerification: () => void;
}

interface DeviceVerificationContext {
  verificationId: string;
  /** 'both' — код ушёл и на другое устройство, и на почту (обычный случай). */
  deliveryChannel: 'push' | 'email' | 'both';
  emailMasked: string;
}

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

async function persistAndConnect(
  user: User,
  accessToken: string,
  refreshToken: string,
  expiresAtMs: number,
): Promise<void> {
  await storageService.saveFullSession(accessToken, refreshToken, expiresAtMs, user.id, user);
  socketService.connect(accessToken);
  scheduleE2EERegistration(Number(user.id) || 0);
}

/**
 * Инициализация E2EE и публикация бандла ключей после входа.
 *
 * Вызывается при КАЖДОМ входе, а не только при первом: e2eeService сам решит,
 * нужна ли перерегистрация, и сверит наличие устройства с сервером. Полагаться
 * на локальный флаг «уже зарегистрирован» нельзя — именно так 27.07.2026
 * Android-устройство выпало из E2EE после потери строки в signal_keys.
 *
 * Ошибки не фатальны: без бандла нельзя лишь отправить сообщение, и попытка
 * повторится при следующей отправке.
 */
function scheduleE2EERegistration(myUserId: number): void {
  // Ленивый импорт: криптография не тянется в стартовый бандл.
  Promise.all([import('../crypto/e2ee/e2eeService'), import('../api/signalApi')])
    .then(([{ initE2EE }, { signalApi }]) => {
      const service = initE2EE(signalApi);
      return service.ensureRegistered(myUserId);
    })
    .catch((e) => {
      console.error('[Auth] инициализация E2EE не удалась:', e);
    });
}

// ─────────────────────────────────────────────────────────────
// STORE
// ─────────────────────────────────────────────────────────────

export const useAuthStore = create<AuthState>()(
  immer((set, get) => ({
    user: null,
    accessToken: null,
    isLoggedIn: false,
    isLoading: false,
    error: null,
    verificationRequired: false,
    verificationContext: null,
    deviceVerification: null,

    // ── Login ───────────────────────────────────────────────
    login: async (usernameOrEmail, password) => {
      set((s) => { s.isLoading = true; s.error = null; });
      try {
        const result = await authApi.login(usernameOrEmail, password);

        // Устройство сервер не знает: сессии ещё нет, нужен код.
        if (result.type === 'device_verification') {
          set((s) => {
            s.isLoading = false;
            s.deviceVerification = {
              verificationId: result.verificationId,
              deliveryChannel: result.deliveryChannel,
              emailMasked: result.emailMasked,
            };
          });
          return;
        }

        await persistAndConnect(result.user, result.accessToken, result.refreshToken, result.expiresAtMs);
        set((s) => {
          s.user = result.user;
          s.accessToken = result.accessToken;
          s.isLoggedIn = true;
          s.isLoading = false;
          s.verificationRequired = false;
          s.verificationContext = null;
          s.deviceVerification = null;
        });
      } catch (err: unknown) {
        const message = extractMessage(err, 'Login failed. Please try again.');
        set((s) => { s.error = message; s.isLoading = false; });
        throw err;
      }
    },

    // ── Код подтверждения входа с нового устройства ─────────────
    submitDeviceVerificationCode: async (code) => {
      const pending = get().deviceVerification;
      if (!pending) return;

      set((s) => { s.isLoading = true; s.error = null; });
      try {
        const result = await authApi.verifyLoginCode(pending.verificationId, code);
        await persistAndConnect(result.user, result.accessToken, result.refreshToken, result.expiresAtMs);
        set((s) => {
          s.user = result.user;
          s.accessToken = result.accessToken;
          s.isLoggedIn = true;
          s.isLoading = false;
          s.deviceVerification = null;
        });
      } catch (err: unknown) {
        // Ошибку показываем на экране кода — назад к логину не возвращаемся,
        // иначе пользователь потеряет уже отправленный код.
        set((s) => {
          s.error = extractMessage(err, 'Verification failed');
          s.isLoading = false;
        });
      }
    },

    resendDeviceVerificationEmail: async () => {
      const pending = get().deviceVerification;
      if (!pending) return '';
      try {
        const r = await authApi.resendLoginVerificationEmail(pending.verificationId);
        if (r.ok && r.emailMasked) {
          set((s) => {
            if (s.deviceVerification) s.deviceVerification.emailMasked = r.emailMasked;
          });
        }
        if (!r.ok) set((s) => { s.error = r.message; });
        // Сервер отдаёт уже локализованный текст — и про успех, и про лимиты.
        return r.message;
      } catch (err: unknown) {
        const message = extractMessage(err, 'Could not send the email');
        set((s) => { s.error = message; });
        return message;
      }
    },

    cancelDeviceVerification: () =>
      set((s) => {
        s.deviceVerification = null;
        s.error = null;
      }),

    // ── Register ────────────────────────────────────────────
    register: async (username, email, password, gender = '', inviteCode = '') => {
      set((s) => { s.isLoading = true; s.error = null; });
      try {
        const result = await authApi.register(username, email, password, gender, inviteCode);

        if (result.type === 'verification') {
          set((s) => {
            s.isLoading = false;
            s.verificationRequired = true;
            s.verificationContext = {
              userId: result.userId,
              verificationType: result.verificationType,
              contactInfo: result.contactInfo,
              username,
            };
          });
          return;
        }

        await persistAndConnect(result.user, result.accessToken, result.refreshToken, result.expiresAtMs);
        set((s) => {
          s.user = result.user;
          s.accessToken = result.accessToken;
          s.isLoggedIn = true;
          s.isLoading = false;
          s.verificationRequired = false;
          s.verificationContext = null;
        });
      } catch (err: unknown) {
        const message = extractMessage(err, 'Registration failed. Please try again.');
        set((s) => { s.error = message; s.isLoading = false; });
        throw err;
      }
    },

    // ── Verify code (after registration / phone verification) ─
    verifyCode: async (code) => {
      const ctx = get().verificationContext;
      if (!ctx) throw new Error('No verification context');

      set((s) => { s.isLoading = true; s.error = null; });
      try {
        const result = await authApi.verifyCode(ctx.verificationType, ctx.contactInfo, code);
        await persistAndConnect(result.user, result.accessToken, result.refreshToken, result.expiresAtMs);
        set((s) => {
          s.user = result.user;
          s.accessToken = result.accessToken;
          s.isLoggedIn = true;
          s.isLoading = false;
          s.verificationRequired = false;
          s.verificationContext = null;
        });
      } catch (err: unknown) {
        const message = extractMessage(err, 'Verification failed. Please check the code.');
        set((s) => { s.error = message; s.isLoading = false; });
        throw err;
      }
    },

    // ── Resend verification code ─────────────────────────────
    resendVerificationCode: async () => {
      const ctx = get().verificationContext;
      if (!ctx) return;
      set((s) => { s.isLoading = true; s.error = null; });
      try {
        await authApi.sendVerificationCode(ctx.verificationType, ctx.contactInfo, ctx.username);
        set((s) => { s.isLoading = false; });
      } catch (err: unknown) {
        const message = extractMessage(err, 'Failed to resend code.');
        set((s) => { s.error = message; s.isLoading = false; });
        throw err;
      }
    },

    // ── Request password reset ───────────────────────────────
    requestPasswordReset: async (email) => {
      set((s) => { s.isLoading = true; s.error = null; });
      try {
        await authApi.requestPasswordReset(email);
        set((s) => { s.isLoading = false; });
      } catch (err: unknown) {
        const message = extractMessage(err, 'Failed to send reset code.');
        set((s) => { s.error = message; s.isLoading = false; });
        throw err;
      }
    },

    // ── Reset password ───────────────────────────────────────
    resetPassword: async (email, code, newPassword) => {
      set((s) => { s.isLoading = true; s.error = null; });
      try {
        await authApi.resetPassword(email, code, newPassword);
        set((s) => { s.isLoading = false; });
      } catch (err: unknown) {
        const message = extractMessage(err, 'Failed to reset password.');
        set((s) => { s.error = message; s.isLoading = false; });
        throw err;
      }
    },

    // ── Logout ───────────────────────────────────────────────
    logout: async () => {
      set((s) => { s.isLoading = true; });
      socketService.disconnect();
      await storageService.clearAll();
      // ⚠️ Ключи E2EE здесь НАМЕРЕННО не стираются.
      //
      // Android при выходе вызывает SignalKeyStore.wipeForLogout() и удаляет
      // identity-ключ безвозвратно — вместе с доступом ко всей истории. Ровно
      // такой сценарий 27.07.2026 и оставил владельца без переписки: устройство
      // разлогинилось, ключ исчез, восстановить его неоткуда, потому что
      // приватная половина на сервер никогда не попадает.
      //
      // Здесь выход = выход из сессии, а не уничтожение ключей: при повторном
      // входе тем же аккаунтом история читается дальше. Стереть ключи можно
      // только явным действием пользователя — wipeAllE2EEKeys() из
      // crypto/e2ee/e2eeStore.ts (пункт «удалить ключи» в настройках
      // безопасности; экран пока не сделан).
      //
      // Компромисс осознанный: на общем устройстве чужой человек, знающий
      // пароль, увидит старую переписку. Обсудить, когда появится ПИН на вход.
      set((s) => {
        s.user = null;
        s.accessToken = null;
        s.isLoggedIn = false;
        s.isLoading = false;
        s.error = null;
        s.verificationRequired = false;
        s.verificationContext = null;
      });
    },

    // ── Restore session on app launch ────────────────────────
    loadStoredAuth: async () => {
      set((s) => { s.isLoading = true; });
      try {
        const token = await storageService.getToken();
        const user = await storageService.getUser();

        if (!token || !user) {
          set((s) => { s.isLoading = false; });
          return;
        }

        await useThemeStore.getState()._hydrate();
        await useI18nStore.getState()._hydrate();
        socketService.connect(token);
        // При восстановлении сессии E2EE инициализируется так же, как при
        // входе: сервер мог потерять наш бандл, пока приложение было закрыто.
        scheduleE2EERegistration(Number(user.id) || 0);

        set((s) => {
          s.user = user;
          s.accessToken = token;
          s.isLoggedIn = true;
          s.isLoading = false;
        });
      } catch {
        await storageService.clearAll();
        set((s) => {
          s.user = null;
          s.accessToken = null;
          s.isLoggedIn = false;
          s.isLoading = false;
        });
      }
    },

    clearError: () => set((s) => { s.error = null; }),
    setUser: (user) => set((s) => { s.user = user; }),
    cancelVerification: () =>
      set((s) => {
        s.verificationRequired = false;
        s.verificationContext = null;
        s.error = null;
      }),
  })),
);

// ─────────────────────────────────────────────────────────────
// UTILITY
// ─────────────────────────────────────────────────────────────

function extractMessage(err: unknown, fallback: string): string {
  if (err instanceof Error) return err.message || fallback;
  if (typeof err === 'object' && err !== null) {
    const e = err as Record<string, unknown>;
    const nested = (e['response'] as Record<string, unknown> | undefined);
    const data = nested?.['data'] as Record<string, unknown> | undefined;
    return String(data?.['message'] ?? data?.['error'] ?? fallback);
  }
  return fallback;
}
