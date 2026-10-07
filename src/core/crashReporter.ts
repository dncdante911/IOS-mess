/**
 * CrashReporter + CrashReportWorker — порт Android utils/CrashReporter.kt.
 *
 * Необработанная JS-ошибка → отчёт в файл documentDirectory/crash_reports/
 * (как filesDir на Android) → при следующем запуске/появлении сети отправка
 * на api/node/crash-report с CRASH_SECRET. Успешно отправленные файлы удаляются.
 *
 * Нативные падения (Objective-C/Swift) JS-обработчиком не ловятся — их видно
 * только в отчётах iOS; это ограничение платформы.
 */
import * as FileSystem from 'expo-file-system';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { NodeRetrofitClient } from './android';
import { SecretsProvider } from '../security/secretsProvider';
import { UserSession } from './session';

const CRASH_DIR = `${FileSystem.documentDirectory ?? ''}crash_reports/`;
/** 200 KB — ниже лимита тела Express */
const MAX_REPORT_BYTES = 200_000;

let installed = false;
let sending = false;

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

function stamp(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}_${pad(d.getHours())}-${pad(d.getMinutes())}-${pad(d.getSeconds())}`;
}

function describe(e: unknown, depth = 0): string {
  if (!(e instanceof Error)) return String(e);
  let s = `${e.name}: ${e.message}\n${e.stack ?? ''}`;
  const cause = (e as Error & { cause?: unknown }).cause;
  if (cause && depth < 5) s += `\n\n=== Caused by ===\n${describe(cause, depth + 1)}`;
  return s;
}

async function saveCrash(error: unknown, isFatal: boolean): Promise<void> {
  const now = new Date();
  const userId = UserSession.userId;
  let report =
    '=== WallyMates Crash Report ===\n' +
    `Time:        ${stamp(now)}\n` +
    `App Version: ${Constants.expoConfig?.version ?? '?'} (${Constants.expoConfig?.ios?.buildNumber ?? '?'})\n` +
    `iOS:         ${Platform.Version}\n` +
    `Device:      ${Device.manufacturer ?? 'Apple'} ${Device.modelName ?? ''}\n` +
    `Fatal:       ${isFatal}\n` +
    `User ID:     ${userId > 0 ? userId : 'not logged in'}\n\n` +
    '=== Stack Trace ===\n' +
    describe(error);
  if (report.length > MAX_REPORT_BYTES) {
    report = report.slice(0, MAX_REPORT_BYTES) + `\n\n[TRUNCATED — original size: ${report.length} chars]`;
  }
  await FileSystem.makeDirectoryAsync(CRASH_DIR, { intermediates: true }).catch(() => {});
  await FileSystem.writeAsStringAsync(`${CRASH_DIR}crash_${userId}_${stamp(now)}.log`, report);
}

export const CrashReporter = {
  /** Вызывать как можно раньше (App.tsx). */
  install(): void {
    if (installed) return;
    installed = true;
    const g = globalThis as unknown as {
      ErrorUtils?: {
        getGlobalHandler(): (e: unknown, isFatal?: boolean) => void;
        setGlobalHandler(h: (e: unknown, isFatal?: boolean) => void): void;
      };
    };
    const prev = g.ErrorUtils?.getGlobalHandler();
    g.ErrorUtils?.setGlobalHandler((e, isFatal) => {
      // Запись — fire-and-forget: при фатальной ошибке процесс может не дожить
      void saveCrash(e, !!isFatal).catch(() => {});
      prev?.(e, isFatal);
    });
    // Отправить, как только появится сеть (аналог WorkManager-ограничения CONNECTED)
    NetInfo.addEventListener((s) => {
      if (s.isConnected) void CrashReporter.sendPendingReports();
    });
  },

  /** Записать отчёт о перехваченной (не фатальной) ошибке. */
  report(e: unknown): Promise<void> {
    return saveCrash(e, false);
  },

  async sendPendingReports(): Promise<void> {
    if (sending) return;
    sending = true;
    try {
      let files: string[] = [];
      try {
        files = (await FileSystem.readDirectoryAsync(CRASH_DIR)).filter((f) => f.endsWith('.log'));
      } catch {
        return;
      }
      for (const name of files) {
        try {
          const content = await FileSystem.readAsStringAsync(CRASH_DIR + name);
          const r = await NodeRetrofitClient.api.sendCrashReport(content, name, SecretsProvider.crashSecret);
          if (r.apiStatus === 200) await FileSystem.deleteAsync(CRASH_DIR + name, { idempotent: true });
        } catch {
          /* повторим при следующем подключении */
        }
      }
    } finally {
      sending = false;
    }
  },
};
