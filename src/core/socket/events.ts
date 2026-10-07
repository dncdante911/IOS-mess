/**
 * Каталог событий Socket.IO — все события, которые слушает и шлёт Android
 * (SocketManager, MessageNotificationService, CallsViewModel, CallTransferManager…).
 * Имя ключа = имя события в UPPER_SNAKE. В комментарии — где используется на Android.
 */

/** сервер → клиент */
export const SocketIn = {
  BOT_MESSAGE: "bot_message", // SocketManager.kt
  CALL_ACCEPTED_ELSEWHERE: "call:accepted_elsewhere", // MessageNotificationService.kt, CallsViewModel.kt
  CALL_ADHOC_INVITED: "call:adhoc_invited", // MessageNotificationService.kt
  CALL_ADHOC_MIGRATE: "call:adhoc_migrate", // CallsViewModel.kt
  CALL_ANSWER: "call:answer", // CallsViewModel.kt
  CALL_CHAT_MESSAGE: "call:chat_message", // CallsViewModel.kt
  CALL_ENDED: "call:ended", // CallsViewModel.kt
  CALL_ERROR: "call:error", // CallsViewModel.kt
  CALL_INCOMING: "call:incoming", // MessageNotificationService.kt, CallsViewModel.kt
  CALL_REACTION: "call:reaction", // CallsViewModel.kt
  CALL_RECORDING: "call:recording", // CallsViewModel.kt
  CALL_REJECTED: "call:rejected", // CallsViewModel.kt
  CALL_RENEGOTIATE: "call:renegotiate", // CallsViewModel.kt
  CALL_RENEGOTIATE_ANSWER: "call:renegotiate_answer", // CallsViewModel.kt
  CALL_TRANSFER_ACCEPTED: "call:transfer_accepted", // CallTransferManager.kt
  CALL_TRANSFER_INCOMING: "call:transfer_incoming", // CallTransferManager.kt
  CALL_TRANSFER_REJECTED: "call:transfer_rejected", // CallTransferManager.kt
  CALL_TRANSFER_TIMEOUT: "call:transfer_timeout", // CallTransferManager.kt
  CHANNEL_COMMENT_ADDED: "channel:comment_added", // SocketManager.kt, MessageNotificationService.kt
  CHANNEL_COMMENT_DELETED: "channel:comment_deleted", // MessageNotificationService.kt
  CHANNEL_POST_CREATED: "channel:post_created", // SocketManager.kt, MessageNotificationService.kt
  CHANNEL_POST_DELETED: "channel:post_deleted", // SocketManager.kt, MessageNotificationService.kt
  CHANNEL_POST_PINNED: "channel:post_pinned", // MessageNotificationService.kt
  CHANNEL_POST_REACTION: "channel:post_reaction", // MessageNotificationService.kt
  CHANNEL_POST_UPDATED: "channel:post_updated", // SocketManager.kt, MessageNotificationService.kt
  CHANNEL_STREAM_ENDED: "channel:stream_ended", // SocketManager.kt, MessageNotificationService.kt
  CHANNEL_STREAM_STARTED: "channel:stream_started", // SocketManager.kt, MessageNotificationService.kt
  CHANNEL_MESSAGE: "channel_message", // MessageNotificationService.kt
  CHANNEL_POLL_CLOSED: "channel_poll_closed", // MessageNotificationService.kt
  CHANNEL_POLL_UPDATED: "channel_poll_updated", // MessageNotificationService.kt
  CHANNEL_REPLY_RECEIVED: "channel_reply_received", // MessageNotificationService.kt, ChatsViewModel.kt
  CHAT_VIEWING: "chat_viewing", // SocketManager.kt
  CONVERSATION_DELETED: "conversation_deleted", // SocketManager.kt
  GROUP_MEMBER_JOINED: "group:member_joined", // SocketManager.kt
  GROUP_MEMBER_LEFT: "group:member_left", // SocketManager.kt
  GROUP_CALL_INCOMING: "group_call:incoming", // MessageNotificationService.kt
  GROUP_CALL_STARTED: "group_call_started", // MessageNotificationService.kt
  GROUP_HISTORY_CLEARED: "group_history_cleared", // SocketManager.kt
  GROUP_JOIN_APPROVED: "group_join_approved", // MessageNotificationService.kt
  GROUP_JOIN_REJECTED: "group_join_rejected", // MessageNotificationService.kt
  GROUP_JOIN_REQUEST: "group_join_request", // MessageNotificationService.kt
  GROUP_MEMBER_ADDED: "group_member_added", // MessageNotificationService.kt
  GROUP_MEMBER_BANNED: "group_member_banned", // MessageNotificationService.kt
  GROUP_MEMBER_MUTED: "group_member_muted", // MessageNotificationService.kt
  GROUP_MEMBER_REMOVED: "group_member_removed", // MessageNotificationService.kt
  GROUP_MEMBER_UNBANNED: "group_member_unbanned", // MessageNotificationService.kt
  GROUP_MEMBER_UNMUTED: "group_member_unmuted", // MessageNotificationService.kt
  GROUP_MESSAGE: "group_message", // SocketManager.kt, MessageNotificationService.kt
  GROUP_MESSAGE_DELETED: "group_message_deleted", // SocketManager.kt
  GROUP_MESSAGE_EDITED: "group_message_edited", // SocketManager.kt
  GROUP_ROLE_CHANGED: "group_role_changed", // MessageNotificationService.kt
  GROUP_TOPIC_CREATED: "group_topic_created", // MessageNotificationService.kt
  GROUP_TOPIC_DELETED: "group_topic_deleted", // MessageNotificationService.kt
  GROUP_TOPIC_UPDATED: "group_topic_updated", // MessageNotificationService.kt
  GROUP_TYPING: "group_typing", // SocketManager.kt
  GROUP_TYPING_DONE: "group_typing_done", // SocketManager.kt
  GROUP_USER_ACTION: "group_user_action", // SocketManager.kt
  ICE_CANDIDATE: "ice:candidate", // CallsViewModel.kt
  LASTSEEN: "lastseen", // SocketManager.kt
  LIVE_LOCATION_START: "live_location_start", // SocketManager.kt
  LIVE_LOCATION_STOP: "live_location_stop", // SocketManager.kt
  LIVE_LOCATION_UPDATE: "live_location_update", // SocketManager.kt
  LIVESTREAM_CHAT: "livestream:chat", // MessageNotificationService.kt
  LIVESTREAM_CHAT_ERROR: "livestream:chat:error", // MessageNotificationService.kt
  LOGIN_NEW_DEVICE_ALERT: "login:new_device_alert", // MessageNotificationService.kt
  LOGIN_VERIFY_REQUEST: "login:verify_request", // MessageNotificationService.kt
  MESSAGE_DELETED: "message_deleted", // SocketManager.kt
  MESSAGE_EDITED: "message_edited", // SocketManager.kt
  MESSAGE_PINNED: "message_pinned", // SocketManager.kt
  MESSAGE_REACTION: "message_reaction", // SocketManager.kt
  NEW_MESSAGE: "new_message", // SocketManager.kt, MessageNotificationService.kt
  ON_USER_LOGGEDIN: "on_user_loggedin", // SocketManager.kt
  ON_USER_LOGGEDOFF: "on_user_loggedoff", // SocketManager.kt
  PING_FOR_LASTSEEN: "ping_for_lastseen", // SocketManager.kt
  PRIVATE_HISTORY_CLEARED: "private_history_cleared", // SocketManager.kt
  PRIVATE_MESSAGE: "private_message", // SocketManager.kt, MessageNotificationService.kt
  RECORDING: "recording", // SocketManager.kt
  SIGNAL_GROUP_DISTRIBUTIONS_PENDING: "signal:group_distributions_pending", // SocketManager.kt
  SIGNAL_IDENTITY_CHANGED: "signal:identity_changed", // SocketManager.kt
  SIGNAL_SESSION_RESET_REQUEST: "signal:session_reset_request", // SocketManager.kt
  STARS_RECEIVED: "stars_received", // SocketManager.kt
  STORY_COMMENT_ADDED: "story:comment_added", // SocketManager.kt
  STORY_CREATED: "story:created", // SocketManager.kt
  STORY_DELETED: "story:deleted", // SocketManager.kt
  STREAM_VIEWER_COUNT: "stream:viewer_count", // SocketManager.kt, MessageNotificationService.kt
  TOKEN_EXPIRED: "token_expired", // SocketManager.kt
  TYPING: "typing", // SocketManager.kt
  TYPING_DONE: "typing_done", // SocketManager.kt
  USER_ACTION: "user_action", // SocketManager.kt
  USER_STATUS_CHANGE: "user_status_change", // SocketManager.kt
} as const;

/** клиент → сервер */
export const SocketOut = {
  BOT_CALLBACK_QUERY: "bot_callback_query", // SocketManager.kt
  CALL_ACCEPT: "call:accept", // CallsViewModel.kt
  CALL_CHAT_MESSAGE: "call:chat_message", // CallsViewModel.kt
  CALL_END: "call:end", // CallsViewModel.kt
  CALL_INITIATE: "call:initiate", // CallsViewModel.kt
  CALL_JOIN_ROOM: "call:join_room", // CallsViewModel.kt
  CALL_LEAVE_ROOM: "call:leave_room", // CallsViewModel.kt
  CALL_NOISE_CANCELLATION: "call:noise_cancellation", // CallsViewModel.kt
  CALL_REACTION: "call:reaction", // CallsViewModel.kt
  CALL_RECORDING: "call:recording", // CallsViewModel.kt
  CALL_REGISTER: "call:register", // MessageNotificationService.kt, CallsViewModel.kt
  CALL_REJECT: "call:reject", // CallsViewModel.kt
  CALL_RENEGOTIATE: "call:renegotiate", // CallsViewModel.kt
  CALL_RENEGOTIATE_ANSWER: "call:renegotiate_answer", // CallsViewModel.kt
  CALL_RINGING_ACK: "call:ringing_ack", // MessageNotificationService.kt, CallsViewModel.kt
  CALL_TRANSFER_ACCEPT: "call:transfer_accept", // CallTransferManager.kt
  CALL_TRANSFER_INITIATE: "call:transfer_initiate", // CallTransferManager.kt
  CALL_TRANSFER_REJECT: "call:transfer_reject", // CallTransferManager.kt
  CHANNEL_SUBSCRIBE: "channel:subscribe", // SocketManager.kt, MessageNotificationService.kt
  CHANNEL_TYPING: "channel:typing", // SocketManager.kt
  CHANNEL_UNSUBSCRIBE: "channel:unsubscribe", // SocketManager.kt
  CLOSE_CHAT: "close_chat", // SocketManager.kt
  ICE_CANDIDATE: "ice:candidate", // CallsViewModel.kt
  ICE_REQUEST: "ice:request", // SocketManager.kt
  IS_CHAT_ON: "is_chat_on", // SocketManager.kt
  JOIN: "join", // SocketManager.kt, MessageNotificationService.kt
  PRIVATE_MESSAGE: "private_message", // SocketManager.kt
  RECORDING: "recording", // SocketManager.kt
  STORY_SUBSCRIBE: "story:subscribe", // SocketManager.kt
  STORY_TYPING: "story:typing", // SocketManager.kt
  STORY_UNSUBSCRIBE: "story:unsubscribe", // SocketManager.kt
  STORY_VIEW: "story:view", // SocketManager.kt
  TYPING: "typing", // SocketManager.kt
} as const;

export type SocketInEvent = (typeof SocketIn)[keyof typeof SocketIn];
export type SocketOutEvent = (typeof SocketOut)[keyof typeof SocketOut];
