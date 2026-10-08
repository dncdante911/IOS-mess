/**
 * ContactNicknameRepository — порт Android data/ContactNicknameRepository.kt:
 * локальные псевдонимы контактов (DataStore "contact_nicknames", ключ nickname_<id>).
 */
import { create } from 'zustand';
import { kv } from '../../core/platform/kv';

const KEY = 'contact_nicknames';

export const useContactNicknames = create<Record<number, string>>(() => kv.getJson<Record<number, string>>(KEY, {}));

function persist(): void {
  kv.setJson(KEY, useContactNicknames.getState());
}

export const ContactNicknameRepository = {
  /** Перечитать после hydrateKv (стор создаётся раньше). */
  reload(): void {
    useContactNicknames.setState(kv.getJson<Record<number, string>>(KEY, {}), true);
  },
  setNickname(userId: number, nickname: string | null): void {
    const next = { ...useContactNicknames.getState() };
    if (!nickname || !nickname.trim()) delete next[userId];
    else next[userId] = nickname.trim();
    useContactNicknames.setState(next, true);
    persist();
  },
  getNickname: (userId: number): string | null => useContactNicknames.getState()[userId] ?? null,
  getAllNicknames: (): Record<number, string> => useContactNicknames.getState(),
  removeNickname(userId: number): void {
    ContactNicknameRepository.setNickname(userId, null);
  },
  clearAllNicknames(): void {
    useContactNicknames.setState({}, true);
    persist();
  },
};

/** nicknameRepository.getNickname(userId).collectAsState() */
export function useNickname(userId: number): string | null {
  return useContactNicknames((s) => s[userId] ?? null);
}
