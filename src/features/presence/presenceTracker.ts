/**
 * PresenceTracker — порт Android network/PresenceTracker.kt.
 * Общий набор «онлайн сейчас» (из сокет-событий открытого чата); список
 * чатов объединяет его с chat.isOnline.
 */
import { create } from 'zustand';

export const usePresence = create<{ onlineUsers: ReadonlySet<number> }>(() => ({ onlineUsers: new Set<number>() }));

export const PresenceTracker = {
  setOnline(userId: number): void {
    const cur = usePresence.getState().onlineUsers;
    if (!cur.has(userId)) usePresence.setState({ onlineUsers: new Set(cur).add(userId) });
  },
  setOffline(userId: number): void {
    const cur = usePresence.getState().onlineUsers;
    if (!cur.has(userId)) return;
    const next = new Set(cur);
    next.delete(userId);
    usePresence.setState({ onlineUsers: next });
  },
  isOnline: (userId: number) => usePresence.getState().onlineUsers.has(userId),
};
