/**
 * Список групп — порт Android ui/groups/GroupsViewModel.kt (часть для главного
 * экрана: groupList / isLoading / error / fetchGroups). Остальное (участники,
 * админка, создание, аватар, сокет-события группы) — в фазе «Группы».
 */
import { create } from 'zustand';
import { NodeRetrofitClient, apiStatusOf, groupsOf, type M } from '../../core/android';
import { UserSession } from '../../core/session';
import { getTranslation } from '../../i18n';

interface GroupsState {
  groupList: M.Group[];
  isLoading: boolean;
  error: string | null;
}

// init { _isLoading.value = true } — до первой загрузки показываем индикатор
export const useGroupsStore = create<GroupsState>(() => ({ groupList: [], isLoading: true, error: null }));
const set = useGroupsStore.setState;

export const GroupsStore = {
  async fetchGroups(): Promise<void> {
    if (UserSession.accessToken == null) {
      set({ error: getTranslation('error_not_authorized') });
      return;
    }
    set({ isLoading: true });
    try {
      // Node.js: GET /api/node/group/list
      const r = await NodeRetrofitClient.groupApi.getGroups(100);
      const groups = groupsOf(r);
      if (apiStatusOf(r) === 200 && groups != null) set({ groupList: groups, error: null });
      else set({ error: r.errorMessage ?? getTranslation('error_load_groups') });
    } catch (e) {
      console.warn('[Groups] fetchGroups', e);
      set({ error: getTranslation('error_generic_msg', undefined, [e instanceof Error ? e.message : '']) });
    } finally {
      set({ isLoading: false });
    }
  },

  reset(): void {
    set({ groupList: [], isLoading: true, error: null });
  },
};
