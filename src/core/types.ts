// АВТОГЕНЕРАЦИЯ: копия windows-messenger/src/types.ts (scripts/port-windows-api.mjs). Руками не править.
// ─── Auth ─────────────────────────────────────────────────────────────────────

export type AuthResponse = {
  api_status:   string;
  access_token?: string;
  user_id?:     number;
  username?:    string;
  avatar?:      string;
  message?:     string;
  success_type?: string;           // "verification" | "registered"
  error_code?:  number;
  errors?:      { error_text?: string };
  // ── Login-verification (new-device challenge) ────────────────────────────
  // Set instead of access_token when the device hasn't been seen before —
  // the client must collect a 6-digit code via verifyLoginCode() before a
  // session is created. See src/screens/AuthScreen.tsx LoginView.
  verification_required?: boolean;
  verification_id?:       string;
  // 'both' = pushed to another active device AND mirrored to the account email
  // (the default whenever the account has an address — the server never relies
  // on push alone, since an unreachable device would otherwise lock the user out).
  delivery_channel?:      'push' | 'email' | 'both';
  email_masked?:          string;
  // Non-blank only when the account has a phone on file — lets the code-entry
  // screen offer a "call me" resend option. The call itself is only ever
  // placed on request via resendLoginVerificationEmail's channel param.
  phone_masked?:          string;
  // Populated on a failed verifyLoginCode() call ('denied' means the account
  // owner tapped "No" on their other device) OR on a login attempt with
  // correct credentials but a deactivated account ('9' = pending deletion,
  // see pending_deletion/purge_at/days_left below).
  error_id?: 'denied' | 'expired' | 'too_many_attempts' | 'wrong_code' | '9' | string;
  // Correct password, but the account is inside its 45-day delayed-deletion
  // window (routes/users/delete-account.js / wm_account_deletions) — offer a
  // restore instead of a generic login failure.
  pending_deletion?: boolean;
  purge_at?:          number; // unix seconds
  days_left?:          number;
};

// ─── User & profile ───────────────────────────────────────────────────────────

export type UserInfo = {
  user_id: number;
  name: string;
  username?: string;
  avatar?: string;
  cover?: string;
  about?: string;
  is_online?: boolean;
  last_seen?: string;        // formatted text
  last_seen_unix?: number;
  is_following?: boolean;
  following_count?: number;
  followers_count?: number;
  is_pro?: boolean;
  pro_color?: string;
};

// ─── Chat list ────────────────────────────────────────────────────────────────

export type ChatItem = {
  user_id: number;
  name: string;
  avatar?: string;
  last_message?: string;
  time?: string;
  time_unix?: number;
  is_online?: boolean;
  unread_count?: number;
  is_muted?: boolean;
  is_pinned?: boolean;
  is_archived?: boolean;
  chat_color?: string;        // hex color for chat accent
  is_bot?: boolean;           // true for bot chats — skip E2EE
  is_pro?: boolean;
  pro_color?: string;
};

// ─── Custom chat folders ───────────────────────────────────────────────────────

export type FolderDef = {
  id:         string;
  icon:       string;
  color?:     string;
  name:       string;
  desc?:      string;
  chatIds:    number[];
  groupIds:   number[];
  channelIds: number[];
};

export type ChatListResponse = {
  api_status: string;
  data?: ChatItem[];
};

// ─── Messages ─────────────────────────────────────────────────────────────────

export type MessageReaction = {
  emoji: string;
  count: number;
  user_ids: number[];
};

export type MessageItem = {
  id: number;
  from_id: number;
  to_id: number;
  text: string;
  type_two?: string;          // server subtype tag: 'call_log' | 'group_call' | 'contact' | 'giveaway' | …
  giveaway?: GiveawayRef;     // type_two = 'giveaway' — card reference parsed from the stickers column
  time_text?: string;
  time?: number;              // unix timestamp
  media?: string;             // URL to media file
  media_type?: 'image' | 'video' | 'video_note' | 'audio' | 'document' | 'file' | 'voice' | 'sticker' | 'gif';
  media_filename?: string;
  media_duration?: number;    // seconds (audio/video)
  sender_name?: string;       // display name for group messages
  group_id?: number;          // populated for group messages
  reply_to?: {
    id: number;
    from_id: number;
    text: string;
    media?: string;
  };
  reactions?: MessageReaction[];
  is_edited?: boolean;
  is_pinned?: boolean;
  is_deleted?: boolean;
  is_seen?: boolean;
  cipher_version?: number;    // 0=plain, 2=AES-256, 3=Signal
  // Signal decryption fields
  text_encrypted?: string;
  iv?: string;
  tag?: string;
  signal_header?: string;
  // Bot inline keyboard. bot_id is the bot's own string identifier (e.g.
  // "bot_weatherbot_001") — NOT the same as from_id (the bot's linked
  // Wo_Users numeric id). The backend's callback dispatch (ctx.botSockets,
  // wo_bots.bot_id) is keyed by this string, so button clicks need it, not
  // from_id.
  bot_id?: string;
  reply_markup?: {
    inline_keyboard: Array<Array<{
      text: string;
      callback_data?: string;
      url?: string;
    }>>;
  };
  // Client-side flags
  _decryptFailed?: boolean;
  _pending?: boolean;         // optimistic UI: not yet confirmed by server
  is_pro?: boolean;           // sender is Pro
};

export type MessagesResponse = {
  api_status: string;
  messages?: MessageItem[];
};

// ─── Groups ───────────────────────────────────────────────────────────────────

export type GroupMember = {
  user_id: number;
  name: string;
  avatar?: string;
  role: 'admin' | 'moderator' | 'member';
};

export type GroupItem = {
  id: number;
  group_name: string;
  avatar?: string;
  members_count?: number;
  description?: string;
  is_admin?: boolean;
  last_message?: string;
  time?: string;
  is_pinned?: boolean;
  is_muted?: boolean;
  slow_mode_seconds?: number;
};

// ─── Channels ─────────────────────────────────────────────────────────────────

export type ChannelItem = {
  id: number;
  name: string;
  username?: string;
  avatar_url?: string;
  cover?: string;
  subscribers_count?: number;
  description?: string;
  is_subscribed?: boolean;
  is_owner?: boolean;
  is_admin?: boolean;
  is_premium?: boolean;
  is_private?: boolean;
  last_post?: string;
  time?: string;
  unread_count?: number;
  // Raw resume-point cursor (not just the derived unread_count) — used to
  // anchor-fetch (around_post_id) and scroll straight to the first-unread
  // post on open, Telegram-style. See ChannelView.tsx.
  last_read_post_id?: number;
  // Per-channel feature toggles (comments/reactions/shares/forwarding/
  // signature/stats visibility). Populated by loadChannels() from the
  // server's `settings_json`; absent on channels loaded before this field
  // existed, so all gating reads must treat missing settings as "allowed".
  settings?: ChannelSettings;
};

export type PollOption = {
  id: number;
  text: string;
  vote_count: number;
  percent: number;
  is_voted: boolean;
};

export type ChannelPoll = {
  id: number;
  question: string;
  poll_type: string;
  is_anonymous: boolean;
  allows_multiple_answers: boolean;
  is_closed: boolean;
  total_votes: number;
  options: PollOption[];
};

// Inline button attached under a channel post (Telegram-style inline keyboard).
// url is either an external http(s) link or an internal "post:<id>" link that
// scrolls the feed to another post in the same channel.
export type PostButton = {
  label: string;
  url: string;
  icon?: string;
};

// ─── Giveaways (routes/groups/giveaways.js, Android 1.55.0) ─────────────────
// A giveaway card travels as a reference only: a channel post with a
// `giveaway` field, or a group message with type_two = 'giveaway' whose
// `stickers` column holds the same JSON. The live state (participants,
// winners, whether the viewer joined) is fetched with getGiveaway().
export type GiveawayRef = {
  id:     number;
  prize:  string;
  /** true = the "results" card published after the draw. */
  result: boolean;
};

export type GiveawayUser = {
  user_id:    number;
  username:   string | null;
  name:       string | null;
  avatar_url: string | null;
};

export type GiveawayWinner = GiveawayUser & { place: number };

export type GiveawayRequiredChannel = {
  id:         number;
  username:   string;
  name:       string;
  avatar_url: string | null;
  subscribed: boolean;
};

export type GiveawayStatus = 'active' | 'finished' | 'cancelled';

export type GiveawayState = {
  id:                 number;
  chat_type:          'group' | 'channel';
  chat_id:            number;
  chat:               { type: 'group' | 'channel'; id: number; name: string; username: string | null } | null;
  message_id:         number;
  prize:              string;
  description:        string | null;
  button_text:        string | null;
  media_url:          string | null;
  winners_count:      number;
  ends_at:            number;
  max_participants:   number | null;
  status:             GiveawayStatus;
  participants_count: number;
  joined:             boolean;
  is_winner:          boolean;
  can_manage:         boolean;
  required_channels:  GiveawayRequiredChannel[];
  winners:            GiveawayWinner[];
  seed_hash:          string;
  /** Revealed only after the draw, for public verification. */
  seed:               string | null;
  created_at:         number;
  finished_at:        number | null;
  creator:            GiveawayUser | null;
};

export type GiveawayTarget = {
  type:     'group' | 'channel';
  id:       number;
  name:     string;
  username: string | null;
};

export type ChannelPost = {
  id: number;
  channel_id: number;
  publisher_id: number;
  // Real posting admin's identity, shown instead of the channel's own name/
  // avatar when the channel's signature_enabled setting is on.
  author_name?: string;
  author_avatar?: string;
  text: string;
  media?: string;
  media_type?: string;
  media_items?: Array<{ url: string; type: string }>;
  buttons?: PostButton[][];
  poll?: ChannelPoll;
  giveaway?: GiveawayRef;
  reactions?: MessageReaction[];
  comments_count?: number;
  views_count?: number;
  time?: string;
  time_unix?: number;
  is_pinned?: boolean;
  is_edited?: boolean;
  edited_time?: number;
};

export type ChannelComment = {
  id: number;
  post_id?: number;
  user_id: number;
  username?: string;
  user_name?: string;
  user_avatar?: string;
  text: string;
  sticker?: string;
  media_url?: string;
  media_type?: 'image' | 'gif' | 'sticker' | 'voice' | 'audio' | 'video';
  time: number;
  edited_time?: number | null;
  reply_to_comment_id?: number | null;
  reactions_count?: number;
  reactions?: Array<{ emoji: string; count: number; user_ids?: number[] }>;
  written_as_channel?: boolean;
  channel_name?: string | null;
  channel_avatar?: string | null;
};

// ─── Stories ──────────────────────────────────────────────────────────────────

export type StoryReaction = {
  like:       number;
  love:       number;
  haha:       number;
  wow:        number;
  sad:        number;
  angry:      number;
  is_reacted: boolean;
  reacted_type?: string;
};

export type StoryComment = {
  id:           number;
  story_id:     number;
  user_id:      number;
  text:         string;
  time:         number;
  user_name?:   string;
  user_avatar?: string;
};

export type StoryItem = {
  id:            number;
  user_id:       number;
  user_name?:    string;
  user_avatar?:  string;
  page_id?:      number | null;   // channel story → channel id; personal → null
  page_name?:    string;
  page_avatar?:  string;
  file?:         string;
  thumbnail?:    string;
  file_type?:    'image' | 'video' | 'audio';
  caption?:      string;
  created_at?:   string;
  expire_time?:  number;
  is_seen?:      boolean;
  views_count?:  number;
  comment_count?: number;
  is_owner?:     boolean;
  reaction?:     StoryReaction;
  /** Unix seconds — drives "5 h ago" / "expires in" in the viewer. */
  posted?:       number;
  /** Pinned to the owner's profile showcase (survives the 24 h cleanup). */
  is_pinned?:    boolean;
};

/** One row of the owner's "who viewed" list (stories/get-views). */
export type StoryViewer = {
  user_id: number;
  name: string;
  username?: string;
  avatar?: string;
  view_time: number;
  reaction: string | null;
  offset_id: number;
};

export type StoryStats = {
  unique_views: number;
  total_reactions: number;
  reactions: Record<string, number>;
  total_comments: number;
  engagement_rate: number;
  posted_at: number;
  expires_at: number;
};

// ─── Calls ────────────────────────────────────────────────────────────────────

export type CallRecord = {
  id: number;
  from_id: number;
  to_id: number;
  call_type: 'audio' | 'video';
  duration?: number;
  status: 'answered' | 'missed' | 'declined' | 'busy';
  time?: string;
  time_unix?: number;
};

export type CallHistoryItem = {
  id: number;
  call_category: 'personal' | 'group';
  call_type: 'audio' | 'video';
  status: string;
  direction: 'incoming' | 'outgoing';
  created_at: string;
  accepted_at?: string;
  ended_at?: string;
  duration: number;
  timestamp: number;
  other_user?: { user_id: number; username: string; name: string; avatar: string };
  group_data?: { group_id: number; group_name: string; avatar: string };
};

export type PrivacySettings = {
  follow_privacy: string;
  friend_privacy: string;
  post_privacy: string;
  message_privacy: string;
  confirm_followers: string;
  show_activities_privacy: string;
  birth_privacy: string;
  visit_privacy: string;
  showlastseen: string;
};

export type CallState =
  | { phase: 'idle' }
  | { phase: 'outgoing';       peer: ChatItem; type: 'audio' | 'video'; roomName: string; peerDeviceId?: string }
  | { phase: 'incoming';       peer: ChatItem; type: 'audio' | 'video'; roomName: string; fromId: number; iceServers: RTCIceServer[]; sdpOffer: string; peerDeviceId?: string }
  | { phase: 'connecting';     peer: ChatItem; type: 'audio' | 'video'; roomName: string; duration: number; peerDeviceId?: string }
  | { phase: 'connected';      peer: ChatItem; type: 'audio' | 'video'; roomName: string; duration: number; reconnecting?: boolean; peerDeviceId?: string }
  | { phase: 'group_incoming'; groupId: number; groupName: string; type: 'audio' | 'video'; roomName: string; fromName: string; iceServers: RTCIceServer[] }
  | { phase: 'group_connected';groupId: number; groupName: string; type: 'audio' | 'video'; roomName: string; duration: number };

export type GroupCallPeer = {
  userId:      number;
  name:        string;
  avatar?:     string;
  pc:          RTCPeerConnection;
  stream?:     MediaStream;
  handRaised?: boolean;
  isSpeaker?:  boolean;
};

// ─── Channel replies inbox ────────────────────────────────────────────────────

export type ChannelReply = {
  id:                   number;
  post_id:              number;
  channel_id:           number;
  channel_name:         string;
  channel_avatar:       string;
  post_text:            string;
  original_comment_id:  number;
  original_comment_text:string;
  sender_user_id:       number;
  sender_username:      string;
  sender_name:          string;
  sender_avatar:        string;
  text:                 string;
  time:                 number;
};

// ─── Socket / real-time events ────────────────────────────────────────────────

export type TypingEvent = {
  // The legacy socket path emits sender_id/recipient_id; the newer
  // /api/node/chat/typing REST endpoint emits from_id/to_id for the same
  // event names ('typing'/'typing_done') — accept either shape.
  sender_id?: number;
  recipient_id?: number;
  from_id?: number;
  to_id?: number;
};

export type UserActionEvent = {
  user_id: number;
  recipient_id: number;
  action: 'recording' | 'recording_video' | 'listening' | 'viewing' | 'choosing_sticker';
};

export type UserPresenceEvent = {
  user_id: number;
  is_online: boolean;
  last_seen?: string;
};

/** Initial online snapshot sent once right after 'join' — see JoinController.js/emitUserStatus. */
export type PresenceSnapshotEvent = {
  online_user_ids: number[];
};

// Matches the ACTUAL backend payload (verified against every emit('lastseen', ...)
// site: messages.js, chats-list.js, SeenMessagesController.js,
// IsChatOnController.js, events.js) — user_id is the READER (the peer who
// just read OUR messages), not a sender/recipient pair, and there is no
// per-message cutoff id. 'seen' is a human-readable string on several paths
// ("5 minutes ago"), not reliably a timestamp — don't rely on its type.
export type MessageSeenEvent = {
  can_seen: number;
  user_id?: number;
  seen?: string | number;
  message_id?: number;
  time?: string;
};

export type MessageReactionEvent = {
  message_id: number;
  user_id: number;
  reaction: string;
  action: 'added' | 'removed' | 'updated';
};

// Matches the actual backend payload (routes/private-chats/actions.js
// pinMessage/unpinMessage): message_id (not msg_id), pin is the string
// 'yes'|'no' (not a pinned boolean), plus chat_id/chat_type.
export type MessagePinnedEvent = {
  message_id: number;
  chat_id: number;
  chat_type?: 'user' | 'group';
  pin: 'yes' | 'no';
};

// ── Edit / delete / history-cleared (2026-07-20 — previously unhandled on
// Windows entirely; see routes/private-chats/actions.js + messages.js and
// routes/groups/messages.js for the emit sites this mirrors) ─────────────────

export type MessageEditedEvent = {
  message_id: number;
  group_id?: number;
  text: string;
  iv: string | null;
  tag: string | null;
  cipher_version: number;
  time: number;
  edited: number;
};

export type MessageDeletedEvent = {
  message_id: number;
  delete_type: 'everyone' | 'just_me';
};

export type GroupMessageDeletedEvent = {
  message_id: number;
  group_id: number;
};

export type GroupMessagePinnedEvent = {
  group_id: number;
  message_id: number;
  pinned_message: MessageItem;
};

export type GroupMessageUnpinnedEvent = {
  group_id: number;
  message_id: number;
};

export type PrivateHistoryClearedEvent = {
  from_id: number;
  recipient_id: number;
};

export type ConversationDeletedEvent = {
  from_id: number;
  recipient_id: number;
  delete_type: 'me' | 'all';
};

export type GroupHistoryClearedEvent = {
  group_id: number;
};

// ─── Channel posts response ───────────────────────────────────────────────────

export type ChannelPostsResponse = {
  api_status: string;
  posts?: ChannelPost[];
  data?: ChannelPost[];
  has_more_older?: boolean;
  has_more_newer?: boolean;
};

// ─── Generic list response ────────────────────────────────────────────────────

export type GenericListResponse<T> = {
  api_status: string;
  data?: T[];
  stories?: T[];
  message?: string;
};

/** One available quality rendition of a sent video file (see wo_video_qualities). */
export type VideoQuality = {
  tier: string;       // 'original' | 'mobile_hq'
  url: string;
  width: number;
  height: number;
  size_bytes: number;
};

export type MediaUploadResponse = {
  api_status?: string;
  status?:     number;
  // Kotlin XhrUploadResponse fields
  image?: string;    image_src?: string;
  video?: string;    video_src?: string;
  audio?: string;    audio_src?: string;
  file?:  string;    file_src?:  string;
  // Generic fallbacks
  filename?: string;
  media?: string;
  url?: string;
  message?: string;
  error?: string;
};

// ─── Node.js API response wrappers ────────────────────────────────────────────

export type NodeApiStatus = { api_status: number; message?: string; error_message?: string };

export type NodeChatsResponse = NodeApiStatus & { data?: ChatItem[] };
export type NodeMessagesResponse = NodeApiStatus & { messages?: MessageItem[] };
export type NodeSendResponse = NodeApiStatus & { message_data?: MessageItem };
export type NodeUserResponse = NodeApiStatus & { data?: UserInfo };
export type NodeGroupsResponse = NodeApiStatus & { data?: GroupItem[] };
export type NodeChannelsResponse = NodeApiStatus & { data?: ChannelItem[] };
export type NodeStoriesResponse = NodeApiStatus & { stories?: StoryItem[]; data?: StoryItem[] };

export type SignalBundleResponse = NodeApiStatus & {
  identity_key?:       string;
  signed_prekey_id?:   number;
  signed_prekey?:      string;
  signed_prekey_sig?:  string;
  one_time_prekey_id?: number;
  one_time_prekey?:    string;
  remaining_prekeys?:  number;
};

// ─── Session ──────────────────────────────────────────────────────────────────

export type Session = {
  token:    string;
  userId:   number;
  username: string;
};

// ─── Blog / News (read-only, powers the "News" section + profile web feed) ────

export type BlogCategory = {
  id: number;
  name: string;
};

export type BlogAuthor = {
  user_id: number;
  username: string;
  name: string;
  avatar?: string;
};

export type BlogPost = {
  id: number;
  title: string;
  description: string;
  thumbnail?: string;
  web_url: string;
  category_id: number;
  category_name: string;
  author: BlogAuthor;
  posted: number;
  views: number;
};

export type BlogPostDetail = BlogPost & {
  content_html?: string;
  content_markup: string;
  content_plain: string;
  tags: string[];
};

// ─── Profile showcase «Витрина» (routes/users/showcase.js) ─────────────────────

export type ShowcaseChannelOption = {
  id: number;
  name: string;
  username?: string;
  avatar_url?: string;
  subscribers_count: number;
};

export type ShowcaseChannel = ShowcaseChannelOption & {
  description?: string;
  posts_count: number;
  is_subscribed: boolean;
  is_verified: boolean;
  /** Server formatChannel() object — enough to open the channel via normaliseChannelItem. */
  raw: Record<string, unknown>;
};

export type ShowcasePost = {
  id: number;
  text: string;
  is_poll: boolean;
  is_giveaway: boolean;
  /** Locked for this viewer — text hidden by the server. */
  is_paywall: boolean;
  media_type: 'image' | 'video' | null;
  media_thumb: string;
  media_count: number;
  created_time: number;
  views_count: number;
  comments_count: number;
  reactions_count: number;
};

export type ProfileShowcase = {
  channel: ShowcaseChannel | null;
  channel_posts: ShowcasePost[];
  highlights: StoryItem[];
  /** Viewer is the profile owner. */
  can_edit: boolean;
};

// ─── UI state ─────────────────────────────────────────────────────────────────

export type ActiveSection = 'chats' | 'groups' | 'channels' | 'stories' | 'calls' | 'settings' | 'archived' | 'bots' | 'nearby' | 'news' | 'discover';

export type ReplyTarget = {
  id:      number;
  from_id: number;
  text:    string;
  media?:  string;
};

export type Sticker = {
  id: number;
  pack_id: number;
  file_url: string;
  thumbnail_url?: string;
  emoji?: string;
  format?: string;
};

export type StickerPack = {
  id: number;
  name: string;
  icon_url?: string;
  author?: string;
  is_active: boolean;
  sticker_count?: number;
  stickers?: Sticker[];
};

export type GifItem = {
  id: string;
  title: string;
  url: string;
  previewUrl: string;
};

export type BotItem = {
  bot_id_str: string;    // server string id e.g. "wallybot_bot"
  user_id: number;       // linked_user_id (numeric) for opening chat, 0 until resolved
  username: string;
  display_name: string;
  avatar?: string;
  description?: string;
  web_app_url?: string;
  emoji?: string;        // emoji icon for built-in bots
  category?: string;     // category slug for filtering
  is_builtin?: boolean;  // true for the 15 built-in server bots
};

// ─── Batch 5: Channel admin panel ─────────────────────────────────────────────

export type ChannelStatistics = {
  // Subscribers
  subscribers_count:     number;
  new_subscribers_today: number;
  new_subscribers_week:  number;
  left_subscribers_week: number;
  growth_rate:           number;   // % change this week
  active_subscribers_24h: number;
  subscribers_by_day?:   number[]; // 7 values

  // Posts
  posts_count:       number;
  posts_today:       number;
  posts_last_week:   number;
  posts_this_month:  number;

  // Views
  views_total:        number;
  views_last_week:    number;
  avg_views_per_post: number;
  views_by_day?:      number[]; // 7 values

  // Engagement
  reactions_total: number;
  comments_total:  number;
  engagement_rate: number; // %

  // Content breakdown
  media_posts_count: number;
  text_posts_count:  number;

  // Activity
  peak_hours?:    number[]; // active hour indices 0-23
  hourly_views?:  number[]; // views per hour [0..23]
  /** Audience activity per UTC hour (24 values) — shift to local time for "best time to post". */
  hourly_activity_utc?: number[];
  /** 'comments' = subscriber comments over 30 days; 'posts' = fallback by publish times. */
  activity_source?: 'comments' | 'posts';

  // Top content
  top_posts?: TopPostStat[];
};

export type TopPostStat = {
  id:             number;
  text:           string;
  views:          number;
  reactions:      number;
  comments:       number;
  published_time: number;
  has_media:      boolean;
};

export type ChannelAdmin = {
  user_id:    number;
  username:   string;
  avatar?:    string;
  role:       'owner' | 'admin' | 'moderator' | 'moderator_news' | 'moderator_users' | 'editor';
  added_time: number;
  permissions?: {
    can_post:            boolean;
    can_edit_posts:      boolean;
    can_delete_posts:    boolean;
    can_edit_info:       boolean;
    can_ban_users:       boolean;
    can_add_admins:      boolean;
    can_view_statistics: boolean;
    can_manage_comments: boolean;
  };
};

export type ChannelSettings = {
  allow_comments:               boolean;
  allow_reactions:              boolean;
  allow_shares:                 boolean;
  allow_forwarding:             boolean;
  show_statistics:              boolean;
  show_views_count:             boolean;
  notify_subscribers_new_post:  boolean;
  signature_enabled:            boolean;
  comments_moderation:          boolean;
  comment_identity:             'user' | 'channel' | 'user_with_signature';
  slow_mode_seconds?:           number;
  auto_delete_posts_days?:      number;
  /** Who may use rich formatting in comments — Android GroupFormattingPermissions (camelCase keys). */
  formatting_permissions?:      ChannelFormattingPermissions;
};

export type ChannelFormattingPermissions = {
  membersCanUseMentions?: boolean; membersCanUseHashtags?: boolean; membersCanUseBold?: boolean;
  membersCanUseItalic?: boolean; membersCanUseCode?: boolean; membersCanUseStrikethrough?: boolean;
  membersCanUseUnderline?: boolean; membersCanUseSpoilers?: boolean; membersCanUseQuotes?: boolean;
  membersCanUseLinks?: boolean; adminsOnly?: string[];
};

export type ChannelSubscriber = {
  user_id?:        number;
  username?:       string;
  name?:           string;
  avatar?:         string;
  subscribed_time?: number;
  is_muted:        boolean;
  is_banned:       boolean;
  role?:           string;
};

export type ChannelBannedMember = {
  user_id:       number;
  username?:     string;
  name?:         string;
  avatar?:       string;
  reason?:       string;
  banned_until?: number; // unix ts; null/0 = permanent
  banned_time?:  number;
};

export type ActiveMember = {
  user_id:        number;
  username?:      string;
  name?:          string;
  avatar_url?:    string;
  comment_count:  number;
  reaction_count: number;
  score:          number;
};

// ─── Batch 5: Group admin panel ───────────────────────────────────────────────

export type GroupMemberFull = {
  user_id:     number;
  username:    string;
  avatar?:     string;
  role:        'owner' | 'admin' | 'moderator' | 'member';
  joined_time: number;
  is_muted:    boolean;
  is_blocked:  boolean;
  permissions?: string[];
};

export type GroupSettings = {
  allow_members_invite:          boolean;
  allow_members_pin:             boolean;
  allow_members_delete_messages: boolean;
  allow_voice_calls:             boolean;
  allow_video_calls:             boolean;
  slow_mode_seconds:             number;
  history_visible_for_new_members: boolean;
  allow_members_send_media:      boolean;
  allow_members_send_stickers:   boolean;
  allow_members_send_gifs:       boolean;
  allow_members_send_links:      boolean;
  allow_members_send_polls:      boolean;
  anti_spam_enabled:             boolean;
  max_messages_per_minute:       number;
  auto_mute_spammers:            boolean;
  block_new_users_media:         boolean;
};

export type GroupStatistics = {
  group_id:            number;
  members_count:       number;
  messages_count:      number;
  messages_today:      number;
  messages_this_week:  number;
  messages_this_month: number;
  active_members_24h:  number;
  active_members_week: number;
  media_count:         number;
  links_count:         number;
  new_members_today:   number;
  new_members_week:    number;
  left_members_week:   number;
  top_contributors?:   TopContributor[];
  peak_hours?:         number[];
  growth_rate:         number;
};

export type TopContributor = {
  user_id:       number;
  username:      string;
  name?:         string;
  avatar?:       string;
  messages_count: number;
};

export type GroupJoinRequest = {
  id:           number;
  group_id:     number;
  user_id:      number;
  username:     string;
  user_avatar?: string;
  message?:     string;
  status:       'pending' | 'approved' | 'rejected';
  created_time: number;
};

export type AdminLogEntry = {
  id?:              number;
  admin_id?:        number;
  admin_name:       string;
  admin_avatar?:    string;
  action:           string;
  target_user_name?: string;
  details?:         string;
  created_at:       string;
};

// ─── User Rating / Karma ───────────────────────────────────────────────────────

export type UserRating = {
  user_id:            number;
  username:           string;
  name:               string;
  avatar:             string;
  likes:              number;
  dislikes:           number;
  score:              number;
  trust_level:        'verified' | 'trusted' | 'untrusted' | 'neutral';
  trust_level_label:  string;
  trust_level_emoji:  string;
  trust_level_color:  string;
  total_ratings:      number;
  like_percentage:    number;
  dislike_percentage: number;
  /** counted=false → an old vote between people who never talked; kept but not counted */
  my_rating:          { type: 'like' | 'dislike'; comment: string | null; created_at: string; counted?: boolean } | null;
  // ── Karma reputation (likes − dislikes) ──
  karma?:              number;
  karma_level?:        'ok' | 'warn' | 'restricted';
  can_reply_to_users?: boolean;
  weekly_stars?:       number;
  next_stars_at?:      number | null;
};

// ─── Stars Wallet (Batch 32) ──────────────────────────────────────────────────

export type StarPackItem = {
  id: number;
  stars: number;
  price_uah: number;
  is_popular: boolean;
  label: string;
};

export type StarsTxItem = {
  id: number;
  type: 'received' | 'sent' | 'purchase';
  amount: number;
  from_id?: number;
  to_id?: number;
  from_name?: string;
  to_name?: string;
  comment?: string;
  created_at: number;  // unix timestamp
};

// ─── Pro Subscription (Batch 32) ─────────────────────────────────────────────

export type SubscriptionStatus = {
  is_pro: boolean;
  plan?: 'month' | '3month' | 'year' | 'trial';
  expires_at?: number;  // unix timestamp
  trial_used?: boolean;
};

// ─── Saved Messages ──────────────────────────────────────────────────────────

export type SavedMessageItem = {
  id?: number;
  message_id: number;
  chat_type: 'chat' | 'group' | 'channel';
  chat_id: number;
  chat_name: string;
  sender_name: string;
  text: string;
  media_url?: string;
  media_type?: string;
  saved_at: number;
  original_time: number;
};

// ─── Notes ───────────────────────────────────────────────────────────────────

export type NoteItem = {
  id: number;
  type: 'text' | 'image' | 'video' | 'audio' | 'file';
  text?: string;
  file_name?: string;
  file_size: number;
  mime_type?: string;
  url?: string;
  created_at: number;
};

export type NotesStorageInfo = {
  used_bytes: number;
  quota_bytes: number;
};

// ─── Notification Settings ───────────────────────────────────────────────────

export type NotificationSettings = {
  email_notification: number;
  e_liked: number;
  e_commented: number;
  e_followed: number;
  e_mentioned: number;
  e_joined_group: number;
  e_accepted: number;
  e_profile_wall_post: number;
  e_shared: number;
  e_visited: number;
};

// ─── User Profile ────────────────────────────────────────────────────────────

export type UserProfile = {
  id: number;
  username: string;
  first_name?: string;
  last_name?: string;
  about?: string;
  avatar?: string;
  email?: string;
  birthday?: string;
  website?: string;
  city?: string;
  gender?: string;
  working?: string;
  school?: string;
  phone?: string;
  facebook?: string;
  twitter?: string;
  instagram?: string;
  linkedin?: string;
  youtube?: string;
  status_emoji?: string;
  status_text?: string;
};

// ─── Media Gallery ───────────────────────────────────────────────────────────

export type MediaItem = {
  url: string;
  type: 'image' | 'video' | 'gif' | 'music' | 'voice';
  thumb?: string;
  caption?: string;
  date?: string;
  sender?: string;
  filename?: string;
};

// ─── Scheduled Messages ──────────────────────────────────────────────────────

export type ScheduledMessage = {
  id: number;
  recipient_id: number;
  text: string;
  media?: string;
  media_type?: string;
  send_at: number;
  created_at: number;
};

// ─── Group Polls ─────────────────────────────────────────────────────────────

export type GroupPollOption = {
  id: number;
  text: string;
  vote_count: number;
  percent: number;
};

export type GroupPoll = {
  id: number;
  question: string;
  options: GroupPollOption[];
  is_anonymous: boolean;
  is_quiz: boolean;
  is_closed: boolean;
  total_votes: number;
  user_voted?: number[];
};

// ─── Quick Replies & Auto-Reply ──────────────────────────────────────────────

export type QuickReply = {
  id: string;
  shortcut: string;
  text: string;
};

export type AutoReplyConfig = {
  enabled: boolean;
  message: string;
  offlineOnly: boolean;
};

// ─── Chat Font ───────────────────────────────────────────────────────────────

export type ChatFont =
  | 'default' | 'exo2' | 'russo' | 'righteous' | 'orbitron' | 'inter' | 'nunito' | 'montserrat' | 'raleway' | 'ubuntu' | 'opensans' | 'roboto' | 'comfortaa' | 'jost' | 'ptsans'
  // 2026-08-21 — 10 new built-in fonts (see fontCatalog.ts)
  | 'poppins' | 'lato' | 'playfair' | 'merriweather' | 'oswald' | 'quicksand' | 'josefin' | 'dancing' | 'pacifico' | 'spacemono'
  // custom:<cdn-url> — user-uploaded fonts (see fontCatalog.ts). The `& {}`
  // keeps literal-type autocomplete instead of collapsing the union to `string`.
  | (string & {});

// ─── Scheduled Channel Posts ─────────────────────────────────────────────────

export type ScheduledPost = {
  id: string;
  channelId: number;
  text: string;
  scheduledAt: number;
  repeat: string;
};

// ─── Nearby Users ────────────────────────────────────────────────────────────

export type NearbyUser = {
  user_id: number;
  username: string;
  avatar?: string;
  distance?: number;
};
