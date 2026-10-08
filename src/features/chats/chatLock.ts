/**
 * ChatLockManager — порт Android utils/security/ChatLockManager.kt.
 * Набор «заблокированных» чатов (открываются через биометрию). Хранится
 * открыто: защита — сама биометрическая проверка, а не шифрование списка.
 */
import { create } from 'zustand';
import { kv } from '../../core/platform/kv';

const KEY = 'chat_lock_prefs:locked_chats';

export const useLockedChats = create<{ ids: number[] }>(() => ({ ids: kv.getJson<number[]>(KEY, []) }));

function save(ids: number[]): void {
  useLockedChats.setState({ ids });
  kv.setJson(KEY, ids);
}

export const ChatLockManager = {
  reload(): void {
    useLockedChats.setState({ ids: kv.getJson<number[]>(KEY, []) });
  },
  isLocked: (chatId: number) => useLockedChats.getState().ids.includes(chatId),
  lock(chatId: number): void {
    const ids = useLockedChats.getState().ids;
    if (!ids.includes(chatId)) save([...ids, chatId]);
  },
  unlock(chatId: number): void {
    save(useLockedChats.getState().ids.filter((id) => id !== chatId));
  },
  toggle(chatId: number): void {
    if (ChatLockManager.isLocked(chatId)) ChatLockManager.unlock(chatId);
    else ChatLockManager.lock(chatId);
  },
};
