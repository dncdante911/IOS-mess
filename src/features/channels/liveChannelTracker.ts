/**
 * LiveChannelTracker — порт Android ui/channels/ChannelsViewModel.kt (object):
 * какие каналы сейчас в прямом эфире (channel:stream_started / _ended).
 */
import { create } from 'zustand';

export const useLiveChannels = create<{ ids: number[] }>(() => ({ ids: [] }));

export const LiveChannelTracker = {
  markLive(channelId: number): void {
    if (channelId <= 0) return;
    useLiveChannels.setState((s) => (s.ids.includes(channelId) ? s : { ids: [...s.ids, channelId] }));
  },
  markEnded(channelId: number): void {
    useLiveChannels.setState((s) => ({ ids: s.ids.filter((id) => id !== channelId) }));
  },
  isLive: (channelId: number) => useLiveChannels.getState().ids.includes(channelId),
};
