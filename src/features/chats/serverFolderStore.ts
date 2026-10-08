/**
 * Совместные (серверные) папки чатов — порт Android ui/chats/ServerFolderViewModel.kt.
 * Работают рядом с локальным ChatOrganizationManager:
 *  • хранятся на сервере (wm_chat_folders), шарятся ссылкой (share_code)
 *  • все участники видят одинаковый набор чатов
 *  • лимит: 10 бесплатно / 50 PRO (проверяет сервер)
 */
import { create } from 'zustand';
import { NodeRetrofitClient, type M } from '../../core/android';
import { getTranslation } from '../../i18n';

type ErrCb = (msg: string) => void;

interface ServerFolderState {
  folders: M.ServerFolder[];
  isLoading: boolean;
  isSyncing: boolean;
  error: string | null;
  shareUrl: string | null;
}

const errText = (e: unknown) => (e instanceof Error && e.message ? e.message : getTranslation('error_something_wrong'));

export const useServerFolders = create<ServerFolderState>(() => ({
  folders: [],
  isLoading: false,
  isSyncing: false,
  error: null,
  shareUrl: null,
}));

const set = useServerFolders.setState;
const folders = () => useServerFolders.getState().folders;

export const ServerFolderStore = {
  async loadFolders(): Promise<void> {
    set({ isLoading: true, error: null });
    try {
      const r = await NodeRetrofitClient.api.getFolders();
      if (r.apiStatus === 200) set({ folders: r.folders ?? [] });
      else set({ error: r.errorMessage });
    } catch (e) {
      console.warn('[ServerFolders] loadFolders', e);
      set({ error: errText(e) });
    } finally {
      set({ isLoading: false });
    }
  },

  async createFolder(name: string, emoji = '📁', color = '#2196F3', onCreated?: (f: M.ServerFolder) => void, onError?: ErrCb): Promise<void> {
    try {
      const r = await NodeRetrofitClient.api.createFolder(name, emoji, color);
      if (r.apiStatus === 200 && r.folder) {
        set({ folders: [...folders(), r.folder] });
        onCreated?.(r.folder);
      } else onError?.(r.errorMessage ?? getTranslation('error_create_folder'));
    } catch (e) {
      onError?.(errText(e));
    }
  },

  async updateFolder(id: number, name: string | null, emoji: string | null, color: string | null, onUpdated?: () => void, onError?: ErrCb): Promise<void> {
    try {
      const r = await NodeRetrofitClient.api.updateFolder(id, name, emoji, color);
      if (r.apiStatus === 200 && r.folder) {
        const updated = r.folder;
        set({ folders: folders().map((f) => (f.id === id ? updated : f)) });
        onUpdated?.();
      } else onError?.(r.errorMessage ?? getTranslation('error_update_folder'));
    } catch (e) {
      onError?.(errText(e));
    }
  },

  async deleteFolder(id: number, onDeleted?: () => void, onError?: ErrCb): Promise<void> {
    try {
      const r = await NodeRetrofitClient.api.deleteFolder(id);
      if (r.apiStatus === 200) {
        set({ folders: folders().filter((f) => f.id !== id) });
        onDeleted?.();
      } else onError?.(r.errorMessage ?? getTranslation('error_delete_folder'));
    } catch (e) {
      onError?.(errText(e));
    }
  },

  async addChatToFolder(folderId: number, chatType: string, chatId: number, onDone?: () => void): Promise<void> {
    try {
      const r = await NodeRetrofitClient.api.addChatToFolder(folderId, chatType, chatId);
      if (r.apiStatus === 200) {
        const item: M.FolderChatItem = { chatType, chatId, addedAt: Math.floor(Date.now() / 1000) };
        set({ folders: folders().map((f) => (f.id === folderId ? { ...f, chats: [...(f.chats ?? []), item] } : f)) });
        onDone?.();
      }
    } catch (e) {
      console.warn('[ServerFolders] addChatToFolder', e);
    }
  },

  async removeChatFromFolder(folderId: number, chatType: string, chatId: number, onDone?: () => void): Promise<void> {
    try {
      const r = await NodeRetrofitClient.api.removeChatFromFolder(folderId, chatType, chatId);
      if (r.apiStatus === 200) {
        set({
          folders: folders().map((f) =>
            f.id === folderId ? { ...f, chats: f.chats ? f.chats.filter((c) => !(c.chatType === chatType && c.chatId === chatId)) : null } : f,
          ),
        });
        onDone?.();
      }
    } catch (e) {
      console.warn('[ServerFolders] removeChatFromFolder', e);
    }
  },

  async reorderFolders(ids: number[]): Promise<void> {
    try {
      await NodeRetrofitClient.api.reorderFolders(ids);
    } catch (e) {
      console.warn('[ServerFolders] reorder', e);
    }
  },

  async shareFolder(id: number, onShared?: (url: string) => void, onError?: ErrCb): Promise<void> {
    try {
      const r = await NodeRetrofitClient.api.shareFolder(id);
      if (r.apiStatus === 200 && r.shareUrl) {
        const url = r.shareUrl;
        set({ folders: folders().map((f) => (f.id === id ? { ...f, isShared: true, shareCode: r.shareCode } : f)), shareUrl: url });
        onShared?.(url);
      } else onError?.(r.errorMessage ?? getTranslation('error_share_folder'));
    } catch (e) {
      onError?.(errText(e));
    }
  },

  async joinFolder(code: string, onJoined?: (f: M.ServerFolder) => void, onError?: ErrCb): Promise<void> {
    try {
      const r = await NodeRetrofitClient.api.joinFolder(code);
      if (r.apiStatus === 200 && r.folder) {
        const joined = r.folder;
        if (!folders().some((f) => f.id === joined.id)) set({ folders: [...folders(), joined] });
        onJoined?.(joined);
      } else onError?.(r.errorMessage ?? getTranslation('error_join_folder'));
    } catch (e) {
      onError?.(errText(e));
    }
  },

  async leaveFolder(id: number, onLeft?: () => void, onError?: ErrCb): Promise<void> {
    try {
      const r = await NodeRetrofitClient.api.leaveFolder(id);
      if (r.apiStatus === 200) {
        set({ folders: folders().filter((f) => f.id !== id) });
        onLeft?.();
      } else onError?.(r.errorMessage ?? getTranslation('error_leave_folder'));
    } catch (e) {
      onError?.(errText(e));
    }
  },

  clearShareUrl: () => set({ shareUrl: null }),
  clearError: () => set({ error: null }),
  reset: () => set({ folders: [], isLoading: false, isSyncing: false, error: null, shareUrl: null }),
};
