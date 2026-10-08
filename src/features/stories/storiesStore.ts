/**
 * Истории — порт Android ui/stories/StoryViewModel.kt + data/repository/StoryRepository.kt
 * (часть для главного экрана): ленты пользовательских историй и историй
 * подписанных каналов; истёкшие и дубли отбрасываются. Создание, просмотр,
 * комментарии, аналитика — в фазе «Истории».
 */
import { create } from 'zustand';
import { NodeRetrofitClient, StoryX, type M } from '../../core/android';
import { UserSession } from '../../core/session';
import { getTranslation } from '../../i18n';

interface StoriesState {
  stories: M.Story[];
  channelStories: M.Story[];
  isLoading: boolean;
  error: string | null;
}

export const useStoriesStore = create<StoriesState>(() => ({ stories: [], channelStories: [], isLoading: false, error: null }));
const set = useStoriesStore.setState;

/** filter { !isExpired() }.distinctBy { id } */
function activeUnique(list: M.Story[]): M.Story[] {
  const seen = new Set<number>();
  return list.filter((s) => !StoryX.isExpired(s) && !seen.has(s.id) && (seen.add(s.id), true));
}

export const StoriesStore = {
  async loadStories(limit = 35): Promise<void> {
    if (UserSession.accessToken == null) {
      set({ error: getTranslation('error_not_authorized') });
      return;
    }
    set({ isLoading: true });
    try {
      const r = await NodeRetrofitClient.storiesApi.getStories(limit);
      if (r.apiStatus === 200 && r.stories != null) set({ stories: activeUnique(r.stories) });
      else set({ error: r.errorMessage ?? getTranslation('error_load_stories') });
    } catch (e) {
      console.warn('[Stories] loadStories', e);
      set({ error: e instanceof Error ? e.message : String(e) });
    } finally {
      set({ isLoading: false });
    }
  },

  async loadChannelStories(limit = 30): Promise<void> {
    if (UserSession.accessToken == null) return;
    try {
      const r = await NodeRetrofitClient.storiesApi.getSubscribedChannelStories(limit);
      if (r.apiStatus === 200 && r.stories != null) set({ channelStories: activeUnique(r.stories) });
      else console.warn('[Stories] channel stories', r.errorMessage ?? getTranslation('error_load_channel_stories'));
    } catch (e) {
      console.warn('[Stories] loadChannelStories', e);
    }
  },

  reset(): void {
    set({ stories: [], channelStories: [], isLoading: false, error: null });
  },
};
