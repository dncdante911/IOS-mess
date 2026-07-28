import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

interface SandboxState {
  isEnabled: boolean;
  toggleSandbox: () => Promise<void>;
  _hydrate: () => Promise<void>;
}

export const useSandboxStore = create<SandboxState>((set, get) => ({
  isEnabled: false,
  toggleSandbox: async () => {
    const next = !get().isEnabled;
    await AsyncStorage.setItem('sandbox_ui_v4', next ? '1' : '0');
    set({ isEnabled: next });
  },
  _hydrate: async () => {
    const stored = await AsyncStorage.getItem('sandbox_ui_v4');
    if (stored === '1') set({ isEnabled: true });
  },
}));
