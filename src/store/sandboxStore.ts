/**
 * Sandbox UI v4 — экспериментальный интерфейс разработчика (порт Android
 * ui/preferences/SandboxPreferences.kt). Разблокируется 4 тапами по заголовку
 * экрана «Тема и оформление» за 3 секунды.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

interface SandboxState {
  isEnabled: boolean;
  devUnlocked: boolean;
  toggleSandbox: () => Promise<void>;
  setEnabled: (enabled: boolean) => Promise<void>;
  unlockDev: () => Promise<void>;
  _hydrate: () => Promise<void>;
}

const KEY_ENABLED = 'sandbox_ui_v4';
const KEY_DEV = 'sandbox_dev_unlocked';

export const useSandboxStore = create<SandboxState>((set, get) => ({
  isEnabled: false,
  devUnlocked: false,
  toggleSandbox: async () => get().setEnabled(!get().isEnabled),
  setEnabled: async (enabled) => {
    await AsyncStorage.setItem(KEY_ENABLED, enabled ? '1' : '0');
    set({ isEnabled: enabled });
  },
  unlockDev: async () => {
    if (get().devUnlocked) return;
    await AsyncStorage.setItem(KEY_DEV, '1');
    set({ devUnlocked: true });
  },
  _hydrate: async () => {
    const [[, enabled], [, dev]] = await AsyncStorage.multiGet([KEY_ENABLED, KEY_DEV]);
    set({ isEnabled: enabled === '1', devUnlocked: dev === '1' });
  },
}));
