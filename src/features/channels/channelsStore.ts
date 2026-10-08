/**
 * Каналы — порт Android ui/channels/ChannelsViewModel.kt (часть для главного
 * экрана): общий каталог (fetchChannels), подписки (fetchSubscribedChannels)
 * с офлайн-кешем cached_channels, подписка/отписка (402 → платная подписка).
 * Детали канала, админка, посты — в фазе «Каналы».
 */
import { create } from 'zustand';
import { NodeRetrofitClient, channelsOf, newModel, type M } from '../../core/android';
import { AppDatabase, newCachedChannel, type CachedChannel } from '../../core/db';
import { UserSession } from '../../core/session';
import { getTranslation } from '../../i18n';

interface ChannelsState {
  channelList: M.Channel[];
  subscribedChannels: M.Channel[];
  isLoading: boolean;
  error: string | null;
}

export const useChannelsStore = create<ChannelsState>(() => ({ channelList: [], subscribedChannels: [], isLoading: true, error: null }));
const set = useChannelsStore.setState;
const get = useChannelsStore.getState;

// ChannelDetailsViewModel.kt: Channel.toCachedChannel() / CachedChannel.toChannel()
const toCachedChannel = (c: M.Channel): CachedChannel =>
  newCachedChannel({ id: c.id, name: c.name, avatarUrl: c.avatarUrl, subscribersCount: c.subscribersCount, isSubscribed: c.isSubscribed, unreadCount: c.unreadCount });
const toChannel = (c: CachedChannel): M.Channel =>
  newModel<M.Channel>('Channel', { id: c.id, name: c.name, avatarUrl: c.avatarUrl ?? '', subscribersCount: c.subscribersCount, isSubscribed: c.isSubscribed, unreadCount: c.unreadCount });

const errWith = (e: unknown) => getTranslation('error_with_message', undefined, [e instanceof Error ? e.message : '']);

export const ChannelsStore = {
  /** init: кеш → каталог → подписки */
  start(): void {
    set({ isLoading: true });
    void ChannelsStore.loadCachedSubscribedChannels();
    void ChannelsStore.fetchChannels();
    void ChannelsStore.fetchSubscribedChannels();
  },

  async loadCachedSubscribedChannels(): Promise<void> {
    try {
      const cached = await AppDatabase.channelDao().getAllChannels();
      if (cached.length > 0 && get().subscribedChannels.length === 0) set({ subscribedChannels: cached.map(toChannel) });
    } catch (e) {
      console.warn('[Channels] loadCachedSubscribedChannels', e);
    }
  },

  async fetchChannels(): Promise<void> {
    if (UserSession.accessToken == null) {
      set({ error: getTranslation('error_not_authorized') });
      return;
    }
    set({ isLoading: true });
    try {
      const r = await NodeRetrofitClient.channelApi.getChannels('get_list', 100);
      const list = channelsOf(r);
      if (r.apiStatus === 200 && list != null) set({ channelList: list, error: null });
      else set({ error: r.errorMessage ?? getTranslation('error_load_channels') });
    } catch (e) {
      console.warn('[Channels] fetchChannels', e);
      set({ error: errWith(e) });
    } finally {
      set({ isLoading: false });
    }
  },

  async fetchSubscribedChannels(): Promise<void> {
    if (UserSession.accessToken == null) {
      set({ error: getTranslation('error_not_authorized') });
      return;
    }
    try {
      const r = await NodeRetrofitClient.channelApi.getChannels('get_subscribed', 100);
      const list = channelsOf(r);
      if (r.apiStatus === 200 && list != null) {
        set({ subscribedChannels: list });
        // write-through — полная замена, как и сам список
        try {
          await AppDatabase.channelDao().replaceChannels(list.map(toCachedChannel));
        } catch (e) {
          console.warn('[Channels] cache write-through failed', e);
        }
      } else console.warn('[Channels] fetchSubscribedChannels', r.errorMessage);
    } catch (e) {
      console.warn('[Channels] fetchSubscribedChannels', e);
    }
  },

  async subscribeChannel(channelId: number, onSuccess?: () => void, onError?: (m: string) => void, onPaymentRequired?: () => void): Promise<void> {
    if (UserSession.accessToken == null) {
      onError?.(getTranslation('error_not_authorized'));
      return;
    }
    try {
      const r = await NodeRetrofitClient.channelApi.subscribeChannel(channelId);
      if (r.apiStatus === 200) {
        set({ channelList: get().channelList.map((c) => (c.id === channelId ? { ...c, isSubscribed: true, subscribersCount: c.subscribersCount + 1 } : c)) });
        void ChannelsStore.fetchSubscribedChannels();
        onSuccess?.();
      } else if (r.apiStatus === 402 && onPaymentRequired) {
        onPaymentRequired();
      } else onError?.(r.errorMessage ?? getTranslation('error_subscribe_channel'));
    } catch (e) {
      onError?.(errWith(e));
    }
  },

  async unsubscribeChannel(channelId: number, onSuccess?: () => void, onError?: (m: string) => void): Promise<void> {
    if (UserSession.accessToken == null) {
      onError?.(getTranslation('error_not_authorized'));
      return;
    }
    try {
      const r = await NodeRetrofitClient.channelApi.unsubscribeChannel(channelId);
      if (r.apiStatus === 200) {
        set({
          channelList: get().channelList.map((c) => (c.id === channelId ? { ...c, isSubscribed: false, subscribersCount: Math.max(0, c.subscribersCount - 1) } : c)),
          subscribedChannels: get().subscribedChannels.filter((c) => c.id !== channelId),
        });
        onSuccess?.();
      } else onError?.(r.errorMessage ?? getTranslation('error_unsubscribe_channel'));
    } catch (e) {
      onError?.(errWith(e));
    }
  },

  reset(): void {
    set({ channelList: [], subscribedChannels: [], isLoading: true, error: null });
  },
};
