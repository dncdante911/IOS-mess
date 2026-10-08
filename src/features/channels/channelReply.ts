/**
 * Разбор сокет-события channel_reply_received → ChannelReply — общий для
 * счётчика на главном экране (ChatsViewModel) и экрана «Ответы»
 * (Android: parseChannelReply в ChannelRepliesActivity.kt). id ≤ 0 → null.
 */
import type { M } from '../../core/android';

export function parseChannelReply(raw: unknown): M.ChannelReply | null {
  const j = (raw ?? {}) as Record<string, unknown>;
  const num = (k: string) => Number(j[k]) || 0;
  const str = (k: string) => (j[k] == null ? '' : String(j[k]));
  const id = num('id');
  if (id <= 0) return null;
  return {
    id,
    postId: num('post_id'),
    channelId: num('channel_id'),
    channelName: str('channel_name'),
    channelAvatar: str('channel_avatar'),
    postText: str('post_text'),
    originalCommentId: num('original_comment_id'),
    originalCommentText: str('original_comment_text'),
    senderUserId: num('sender_user_id'),
    senderUsername: str('sender_username'),
    senderName: str('sender_name'),
    senderAvatar: str('sender_avatar'),
    text: str('text'),
    time: num('time'),
  };
}
