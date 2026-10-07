// АВТОГЕНЕРАЦИЯ: scripts/gen-android-api.mjs из Kotlin-моделей Android. Руками не править.
/* eslint-disable */

/** enum ui/channels/ChannelAdminPanelActivity.kt */
export type AdminPage = 'HOME' | 'INFO' | 'SETTINGS' | 'FORMATTING' | 'SUBGROUPS' | 'STATS' | 'ADMINS' | 'MEMBERS' | 'BANNED';
export const AdminPage = { HOME: 'HOME' as const, INFO: 'INFO' as const, SETTINGS: 'SETTINGS' as const, FORMATTING: 'FORMATTING' as const, SUBGROUPS: 'SUBGROUPS' as const, STATS: 'STATS' as const, ADMINS: 'ADMINS' as const, MEMBERS: 'MEMBERS' as const, BANNED: 'BANNED' as const };

/** enum ui/theme/ChatAnimatedBackground.kt */
export type AnimatedBgVariant = 'NONE' | 'AURORA' | 'OCEAN_WAVES' | 'COSMIC' | 'SUNSET_FLOW' | 'NEON_PULSE' | 'FOREST_MIST' | 'FIRE_EMBERS' | 'STARDUST' | 'BOKEH_LIGHTS' | 'GRADIENT_CYCLE' | 'GENTLE_RAIN';
export const AnimatedBgVariant = { NONE: 'NONE' as const, AURORA: 'AURORA' as const, OCEAN_WAVES: 'OCEAN_WAVES' as const, COSMIC: 'COSMIC' as const, SUNSET_FLOW: 'SUNSET_FLOW' as const, NEON_PULSE: 'NEON_PULSE' as const, FOREST_MIST: 'FOREST_MIST' as const, FIRE_EMBERS: 'FIRE_EMBERS' as const, STARDUST: 'STARDUST' as const, BOKEH_LIGHTS: 'BOKEH_LIGHTS' as const, GRADIENT_CYCLE: 'GRADIENT_CYCLE' as const, GENTLE_RAIN: 'GENTLE_RAIN' as const };

/** enum ui/preferences/AppModePreferences.kt */
export type AppMode = 'FULL' | 'LITE';
export const AppMode = { FULL: 'FULL' as const, LITE: 'LITE' as const };

/** enum utils/VoiceRecorder.kt */
export type AudioQuality = 'COMPRESSED' | 'STANDARD' | 'HIGH';
export const AudioQuality = { COMPRESSED: 'COMPRESSED' as const, STANDARD: 'STANDARD' as const, HIGH: 'HIGH' as const };

/** enum data/model/CloudBackupSettings.kt */
export type BackupFrequency = 'NEVER' | 'DAILY' | 'WEEKLY' | 'MONTHLY';
export const BackupFrequency = { NEVER: 'NEVER' as const, DAILY: 'DAILY' as const, WEEKLY: 'WEEKLY' as const, MONTHLY: 'MONTHLY' as const };

/** enum data/model/CloudBackupSettings.kt */
export type BackupProvider = 'LOCAL_SERVER';
export const BackupProvider = { LOCAL_SERVER: 'LOCAL_SERVER' as const };

/** enum utils/security/BiometricAuthManager.kt */
export type BiometricAvailability = 'AVAILABLE' | 'NO_HARDWARE' | 'HARDWARE_UNAVAILABLE' | 'NONE_ENROLLED' | 'SECURITY_UPDATE_REQUIRED' | 'UNSUPPORTED' | 'UNKNOWN';
export const BiometricAvailability = { AVAILABLE: 'AVAILABLE' as const, NO_HARDWARE: 'NO_HARDWARE' as const, HARDWARE_UNAVAILABLE: 'HARDWARE_UNAVAILABLE' as const, NONE_ENROLLED: 'NONE_ENROLLED' as const, SECURITY_UPDATE_REQUIRED: 'SECURITY_UPDATE_REQUIRED' as const, UNSUPPORTED: 'UNSUPPORTED' as const, UNKNOWN: 'UNKNOWN' as const };

/** enum utils/security/BiometricAuthManager.kt */
export type BiometricType = 'FACE_OR_FINGERPRINT' | 'PIN_PATTERN_PASSWORD' | 'NONE';
export const BiometricType = { FACE_OR_FINGERPRINT: 'FACE_OR_FINGERPRINT' as const, PIN_PATTERN_PASSWORD: 'PIN_PATTERN_PASSWORD' as const, NONE: 'NONE' as const };

/** enum network/WebRTCManager.kt */
export type BitrateAdaptDirection = 'UPGRADE' | 'DOWNGRADE' | 'STABLE';
export const BitrateAdaptDirection = { UPGRADE: 'UPGRADE' as const, DOWNGRADE: 'DOWNGRADE' as const, STABLE: 'STABLE' as const };

/** enum ui/settings/BlockedUsersViewModel.kt */
export type BlockByIdState = 'IDLE' | 'LOADING' | 'SUCCESS' | 'ALREADY_BLOCKED' | 'NOT_FOUND' | 'ERROR' | 'RATE_LIMITED';
export const BlockByIdState = { IDLE: 'IDLE' as const, LOADING: 'LOADING' as const, SUCCESS: 'SUCCESS' as const, ALREADY_BLOCKED: 'ALREADY_BLOCKED' as const, NOT_FOUND: 'NOT_FOUND' as const, ERROR: 'ERROR' as const, RATE_LIMITED: 'RATE_LIMITED' as const };

/** enum data/model/BlockedUser.kt */
export type BlockStatus = 'BLOCKED' | 'UNBLOCKED' | 'ALREADY_BLOCKED' | 'ALREADY_UNBLOCKED' | 'INVALID' | 'ERROR';
export const BlockStatus = { BLOCKED: 'BLOCKED' as const, UNBLOCKED: 'UNBLOCKED' as const, ALREADY_BLOCKED: 'ALREADY_BLOCKED' as const, ALREADY_UNBLOCKED: 'ALREADY_UNBLOCKED' as const, INVALID: 'INVALID' as const, ERROR: 'ERROR' as const };

/** enum data/model/Bot.kt */
export type BotButtonType = 'CALLBACK' | 'URL' | 'WEB_APP';
export const BotButtonType = { CALLBACK: 'CALLBACK' as const, URL: 'URL' as const, WEB_APP: 'WEB_APP' as const };

/** enum ui/chats/BottomNavBar.kt */
export type BottomNavTab = 'CHATS' | 'CONTACTS' | 'FOLDERS' | 'SETTINGS' | 'PROFILE';
export const BottomNavTab = { CHATS: 'CHATS' as const, CONTACTS: 'CONTACTS' as const, FOLDERS: 'FOLDERS' as const, SETTINGS: 'SETTINGS' as const, PROFILE: 'PROFILE' as const };

/** enum ui/channels/premium/design/PremiumPresets.kt */
export type BubbleShape = 'ROUNDED' | 'PILL' | 'SHARP' | 'GLASS' | 'TELEGRAM';
export const BubbleShape = { ROUNDED: 'ROUNDED' as const, PILL: 'PILL' as const, SHARP: 'SHARP' as const, GLASS: 'GLASS' as const, TELEGRAM: 'TELEGRAM' as const };

/** enum ui/preferences/BubbleStyle.kt */
export type BubbleStyle = 'STANDARD' | 'COMIC' | 'TELEGRAM' | 'MINIMAL' | 'MODERN' | 'RETRO' | 'GLASS' | 'NEON' | 'GRADIENT' | 'NEUMORPHISM' | 'SOFT' | 'OUTLINED' | 'PULSE' | 'SHIMMER' | 'WAVE' | 'BOLD' | 'NOTE' | 'FOLDED' | 'GUM' | 'IOS_PILL';
export const BubbleStyle = { STANDARD: 'STANDARD' as const, COMIC: 'COMIC' as const, TELEGRAM: 'TELEGRAM' as const, MINIMAL: 'MINIMAL' as const, MODERN: 'MODERN' as const, RETRO: 'RETRO' as const, GLASS: 'GLASS' as const, NEON: 'NEON' as const, GRADIENT: 'GRADIENT' as const, NEUMORPHISM: 'NEUMORPHISM' as const, SOFT: 'SOFT' as const, OUTLINED: 'OUTLINED' as const, PULSE: 'PULSE' as const, SHIMMER: 'SHIMMER' as const, WAVE: 'WAVE' as const, BOLD: 'BOLD' as const, NOTE: 'NOTE' as const, FOLDED: 'FOLDED' as const, GUM: 'GUM' as const, IOS_PILL: 'IOS_PILL' as const };

/** enum ui/calls/CallBackgroundManager.kt */
export type CallBackground = 'DEFAULT' | 'SUNSET' | 'OCEAN' | 'AURORA' | 'STARFIELD' | 'NEON_CITY' | 'GRADIENT_SHIFT' | 'CRYSTAL';
export const CallBackground = { DEFAULT: 'DEFAULT' as const, SUNSET: 'SUNSET' as const, OCEAN: 'OCEAN' as const, AURORA: 'AURORA' as const, STARFIELD: 'STARFIELD' as const, NEON_CITY: 'NEON_CITY' as const, GRADIENT_SHIFT: 'GRADIENT_SHIFT' as const, CRYSTAL: 'CRYSTAL' as const };

/** enum ui/calls/CallTransferManager.kt */
export type CallTransferState = 'IDLE' | 'INITIATING' | 'PENDING' | 'COMPLETED' | 'FAILED';
export const CallTransferState = { IDLE: 'IDLE' as const, INITIATING: 'INITIATING' as const, PENDING: 'PENDING' as const, COMPLETED: 'COMPLETED' as const, FAILED: 'FAILED' as const };

/** enum ui/preferences/UIStylePreferences.kt */
export type ChannelViewStyle = 'CLASSIC' | 'PREMIUM';
export const ChannelViewStyle = { CLASSIC: 'CLASSIC' as const, PREMIUM: 'PREMIUM' as const };

/** enum services/MessageNotificationService.kt */
export type ChatType = 'PRIVATE' | 'GROUP' | 'CHANNEL';
export const ChatType = { PRIVATE: 'PRIVATE' as const, GROUP: 'GROUP' as const, CHANNEL: 'CHANNEL' as const };

/** enum network/NetworkQualityMonitor.kt */
export type ConnectionQuality = 'EXCELLENT' | 'GOOD' | 'POOR' | 'OFFLINE';
export const ConnectionQuality = { EXCELLENT: 'EXCELLENT' as const, GOOD: 'GOOD' as const, POOR: 'POOR' as const, OFFLINE: 'OFFLINE' as const };

/** enum ui/strapi/StrapiContentViewModel.kt */
export type ContentTab = 'ALL' | 'STICKERS' | 'GIFS' | 'EMOJIS';
export const ContentTab = { ALL: 'ALL' as const, STICKERS: 'STICKERS' as const, GIFS: 'GIFS' as const, EMOJIS: 'EMOJIS' as const };

/** enum ui/chats/ChatOrganizationManager.kt */
export type ContentType = 'ALL' | 'CHATS' | 'CHANNELS' | 'GROUPS';
export const ContentType = { ALL: 'ALL' as const, CHATS: 'CHATS' as const, CHANNELS: 'CHANNELS' as const, GROUPS: 'GROUPS' as const };

/** enum ui/groups/CreateGroupDialog.kt */
export type CreateGroupStep = 'GROUP_INFO' | 'SELECT_MEMBERS';
export const CreateGroupStep = { GROUP_INFO: 'GROUP_INFO' as const, SELECT_MEMBERS: 'SELECT_MEMBERS' as const };

/** enum ui/editor/PhotoEditorScreen.kt */
export type CropDragHandle = 'TOP_LEFT' | 'TOP_RIGHT' | 'BOTTOM_LEFT' | 'BOTTOM_RIGHT' | 'LEFT_EDGE' | 'RIGHT_EDGE' | 'TOP_EDGE' | 'BOTTOM_EDGE' | 'MOVE';
export const CropDragHandle = { TOP_LEFT: 'TOP_LEFT' as const, TOP_RIGHT: 'TOP_RIGHT' as const, BOTTOM_LEFT: 'BOTTOM_LEFT' as const, BOTTOM_RIGHT: 'BOTTOM_RIGHT' as const, LEFT_EDGE: 'LEFT_EDGE' as const, RIGHT_EDGE: 'RIGHT_EDGE' as const, TOP_EDGE: 'TOP_EDGE' as const, BOTTOM_EDGE: 'BOTTOM_EDGE' as const, MOVE: 'MOVE' as const };

/** enum ui/chats/DrawerHeaderStyle.kt */
export type DrawerHeaderDecor = 'NONE' | 'BUBBLES' | 'WAVES' | 'STARS' | 'GRID' | 'GLOW';
export const DrawerHeaderDecor = { NONE: 'NONE' as const, BUBBLES: 'BUBBLES' as const, WAVES: 'WAVES' as const, STARS: 'STARS' as const, GRID: 'GRID' as const, GLOW: 'GLOW' as const };

/** enum ui/editor/PhotoEditorScreen.kt */
export type EditorTool = 'DRAW' | 'FILTER' | 'ADJUST' | 'ROTATE' | 'TEXT' | 'STICKER' | 'CROP';
export const EditorTool = { DRAW: 'DRAW' as const, FILTER: 'FILTER' as const, ADJUST: 'ADJUST' as const, ROTATE: 'ROTATE' as const, TEXT: 'TEXT' as const, STICKER: 'STICKER' as const, CROP: 'CROP' as const };

/** enum ui/settings/CustomStatusScreen.kt */
export type EmojiCategory = 'SMILEYS' | 'PEOPLE' | 'NATURE' | 'FOOD' | 'TRAVEL' | 'ACTIVITIES' | 'OBJECTS' | 'SYMBOLS';
export const EmojiCategory = { SMILEYS: 'SMILEYS' as const, PEOPLE: 'PEOPLE' as const, NATURE: 'NATURE' as const, FOOD: 'FOOD' as const, TRAVEL: 'TRAVEL' as const, ACTIVITIES: 'ACTIVITIES' as const, OBJECTS: 'OBJECTS' as const, SYMBOLS: 'SYMBOLS' as const };

/** enum ui/fonts/FontStyle.kt */
export type FontStyle = 'NORMAL' | 'STRIKETHROUGH' | 'UNDERLINE' | 'DOUBLE_UNDERLINE' | 'OVERLINE' | 'DOUBLE_OVERLINE' | 'WAVY' | 'SLASH' | 'TILDE_OVERLAY' | 'DOTTED' | 'DIAERESIS' | 'RING_ABOVE' | 'DOT_BELOW' | 'RING_BELOW' | 'GRAVE' | 'ACUTE' | 'CIRCUMFLEX' | 'MACRON' | 'BREVE' | 'CARON' | 'ARROW_ABOVE' | 'OVERLINE_UNDERLINE' | 'WAVY_STRIKETHROUGH' | 'DIAERESIS_OVERLINE' | 'DOTTED_STRIKETHROUGH' | 'DOUBLE_UNDERLINE_OVERLINE' | 'DIAERESIS_STRIKETHROUGH' | 'OVERLINE_STRIKETHROUGH_UNDERLINE' | 'DOTTED_UNDERLINE' | 'GRAVE_UNDERLINE' | 'DIAERESIS_UNDERLINE' | 'MACRON_UNDERLINE' | 'CARON_STRIKETHROUGH' | 'ACUTE_OVERLINE';
export const FontStyle = { NORMAL: 'NORMAL' as const, STRIKETHROUGH: 'STRIKETHROUGH' as const, UNDERLINE: 'UNDERLINE' as const, DOUBLE_UNDERLINE: 'DOUBLE_UNDERLINE' as const, OVERLINE: 'OVERLINE' as const, DOUBLE_OVERLINE: 'DOUBLE_OVERLINE' as const, WAVY: 'WAVY' as const, SLASH: 'SLASH' as const, TILDE_OVERLAY: 'TILDE_OVERLAY' as const, DOTTED: 'DOTTED' as const, DIAERESIS: 'DIAERESIS' as const, RING_ABOVE: 'RING_ABOVE' as const, DOT_BELOW: 'DOT_BELOW' as const, RING_BELOW: 'RING_BELOW' as const, GRAVE: 'GRAVE' as const, ACUTE: 'ACUTE' as const, CIRCUMFLEX: 'CIRCUMFLEX' as const, MACRON: 'MACRON' as const, BREVE: 'BREVE' as const, CARON: 'CARON' as const, ARROW_ABOVE: 'ARROW_ABOVE' as const, OVERLINE_UNDERLINE: 'OVERLINE_UNDERLINE' as const, WAVY_STRIKETHROUGH: 'WAVY_STRIKETHROUGH' as const, DIAERESIS_OVERLINE: 'DIAERESIS_OVERLINE' as const, DOTTED_STRIKETHROUGH: 'DOTTED_STRIKETHROUGH' as const, DOUBLE_UNDERLINE_OVERLINE: 'DOUBLE_UNDERLINE_OVERLINE' as const, DIAERESIS_STRIKETHROUGH: 'DIAERESIS_STRIKETHROUGH' as const, OVERLINE_STRIKETHROUGH_UNDERLINE: 'OVERLINE_STRIKETHROUGH_UNDERLINE' as const, DOTTED_UNDERLINE: 'DOTTED_UNDERLINE' as const, GRAVE_UNDERLINE: 'GRAVE_UNDERLINE' as const, DIAERESIS_UNDERLINE: 'DIAERESIS_UNDERLINE' as const, MACRON_UNDERLINE: 'MACRON_UNDERLINE' as const, CARON_STRIKETHROUGH: 'CARON_STRIKETHROUGH' as const, ACUTE_OVERLINE: 'ACUTE_OVERLINE' as const };

/** enum ui/theme/VisualEffects.kt */
export type FontVariant = 'DEFAULT' | 'ROBOTO' | 'OPEN_SANS' | 'LATO' | 'MONTSERRAT' | 'POPPINS' | 'COMFORTAA' | 'PACIFICO' | 'PLAYFAIR' | 'RALEWAY' | 'UBUNTU' | 'FIRA_CODE' | 'SATISFY' | 'SHADOWS_INTO_LIGHT' | 'CREEPSTER' | 'SPECIAL_ELITE' | 'ARCHITECTS_DAUGHTER' | 'CAVEAT';
export const FontVariant = { DEFAULT: 'DEFAULT' as const, ROBOTO: 'ROBOTO' as const, OPEN_SANS: 'OPEN_SANS' as const, LATO: 'LATO' as const, MONTSERRAT: 'MONTSERRAT' as const, POPPINS: 'POPPINS' as const, COMFORTAA: 'COMFORTAA' as const, PACIFICO: 'PACIFICO' as const, PLAYFAIR: 'PLAYFAIR' as const, RALEWAY: 'RALEWAY' as const, UBUNTU: 'UBUNTU' as const, FIRA_CODE: 'FIRA_CODE' as const, SATISFY: 'SATISFY' as const, SHADOWS_INTO_LIGHT: 'SHADOWS_INTO_LIGHT' as const, CREEPSTER: 'CREEPSTER' as const, SPECIAL_ELITE: 'SPECIAL_ELITE' as const, ARCHITECTS_DAUGHTER: 'ARCHITECTS_DAUGHTER' as const, CAVEAT: 'CAVEAT' as const };

/** enum ui/components/GifPicker.kt */
export type GifPickerMode = 'TRENDING' | 'SEARCH';
export const GifPickerMode = { TRENDING: 'TRENDING' as const, SEARCH: 'SEARCH' as const };

/** enum ui/groups/ModernGroupDetailsComponents.kt */
export type GroupTab = 'MEMBERS' | 'MEDIA' | 'SETTINGS';
export const GroupTab = { MEMBERS: 'MEMBERS' as const, MEDIA: 'MEDIA' as const, SETTINGS: 'SETTINGS' as const };

/** enum ui/messages/MessagesScreen.kt */
export type InputMode = 'TEXT' | 'VOICE' | 'VIDEO' | 'EMOJI' | 'STICKER' | 'GIF';
export const InputMode = { TEXT: 'TEXT' as const, VOICE: 'VOICE' as const, VIDEO: 'VIDEO' as const, EMOJI: 'EMOJI' as const, STICKER: 'STICKER' as const, GIF: 'GIF' as const };

/** enum services/NotificationPriorityManager.kt */
export type Level = 'SILENT' | 'NORMAL' | 'PRIORITY';
export const Level = { SILENT: 'SILENT' as const, NORMAL: 'NORMAL' as const, PRIORITY: 'PRIORITY' as const };

/** enum ui/lite/LiteMainScreen.kt */
export type LiteFilter = 'ALL' | 'UNREAD' | 'GROUPS';
export const LiteFilter = { ALL: 'ALL' as const, UNREAD: 'UNREAD' as const, GROUPS: 'GROUPS' as const };

/** enum ui/lite/LiteMainScreen.kt */
export type LiteTab = 'CHATS' | 'CALLS';
export const LiteTab = { CHATS: 'CHATS' as const, CALLS: 'CALLS' as const };

/** enum network/MediaLoadingManager.kt */
export type LoadingState = 'IDLE' | 'LOADING_THUMB' | 'THUMB_LOADED' | 'LOADING_FULL' | 'FULL_LOADED' | 'ERROR';
export const LoadingState = { IDLE: 'IDLE' as const, LOADING_THUMB: 'LOADING_THUMB' as const, THUMB_LOADED: 'THUMB_LOADED' as const, LOADING_FULL: 'LOADING_FULL' as const, FULL_LOADED: 'FULL_LOADED' as const, ERROR: 'ERROR' as const };

/** enum ui/components/LocationPicker.kt */
export type LocationPickerMode = 'PICK' | 'LIVE';
export const LocationPickerMode = { PICK: 'PICK' as const, LIVE: 'LIVE' as const };

/** enum data/model/MediaAutoDeleteSettings.kt */
export type MediaAutoDeleteOption = 'NEVER' | 'ONE_DAY' | 'THREE_DAYS' | 'ONE_WEEK' | 'TWO_WEEKS' | 'ONE_MONTH';
export const MediaAutoDeleteOption = { NEVER: 'NEVER' as const, ONE_DAY: 'ONE_DAY' as const, THREE_DAYS: 'THREE_DAYS' as const, ONE_WEEK: 'ONE_WEEK' as const, TWO_WEEKS: 'TWO_WEEKS' as const, ONE_MONTH: 'ONE_MONTH' as const };

/** enum data/StorageManager.kt */
export type MediaCategory = 'PHOTO' | 'VIDEO' | 'VOICE' | 'OTHER';
export const MediaCategory = { PHOTO: 'PHOTO' as const, VIDEO: 'VIDEO' as const, VOICE: 'VOICE' as const, OTHER: 'OTHER' as const };

/** enum ui/search/MediaSearchScreen.kt */
export type MediaFilter = 'ALL' | 'PHOTO' | 'VIDEO' | 'AUDIO' | 'FILE';
export const MediaFilter = { ALL: 'ALL' as const, PHOTO: 'PHOTO' as const, VIDEO: 'VIDEO' as const, AUDIO: 'AUDIO' as const, FILE: 'FILE' as const };

/** enum network/NetworkQualityMonitor.kt */
export type MediaLoadMode = 'FULL' | 'THUMBNAILS' | 'NONE';
export const MediaLoadMode = { FULL: 'FULL' as const, THUMBNAILS: 'THUMBNAILS' as const, NONE: 'NONE' as const };

/** enum ui/components/UnifiedMediaPicker.kt */
export type MediaPickerTab = 'EMOJI' | 'GIF' | 'STICKERS';
export const MediaPickerTab = { EMOJI: 'EMOJI' as const, GIF: 'GIF' as const, STICKERS: 'STICKERS' as const };

/** enum ui/theme/VisualEffects.kt */
export type MessageAnimationStyle = 'NONE' | 'FADE' | 'SLIDE' | 'SCALE' | 'BOUNCE' | 'WAVE';
export const MessageAnimationStyle = { NONE: 'NONE' as const, FADE: 'FADE' as const, SLIDE: 'SLIDE' as const, SCALE: 'SCALE' as const, BOUNCE: 'BOUNCE' as const, WAVE: 'WAVE' as const };

/** enum ui/theme/VisualEffects.kt */
export type MessageBubbleStyle = 'MODERN' | 'GLASS' | 'GRADIENT' | 'NEON' | 'SHADOW' | 'FLAT' | 'ROUNDED' | 'MINIMAL' | 'RETRO' | 'NEUMORPHISM' | 'COMIC' | 'FUTURISTIC';
export const MessageBubbleStyle = { MODERN: 'MODERN' as const, GLASS: 'GLASS' as const, GRADIENT: 'GRADIENT' as const, NEON: 'NEON' as const, SHADOW: 'SHADOW' as const, FLAT: 'FLAT' as const, ROUNDED: 'ROUNDED' as const, MINIMAL: 'MINIMAL' as const, RETRO: 'RETRO' as const, NEUMORPHISM: 'NEUMORPHISM' as const, COMIC: 'COMIC' as const, FUTURISTIC: 'FUTURISTIC' as const };

/** enum data/PerformanceManager.kt */
export type Mode = 'AUTO' | 'ENABLED' | 'DISABLED';
export const Mode = { AUTO: 'AUTO' as const, ENABLED: 'ENABLED' as const, DISABLED: 'DISABLED' as const };

/** enum ui/search/GlobalSearchViewModel.kt */
export type MsgTypeFilter = 'ALL' | 'TEXT' | 'MEDIA' | 'STICKER';
export const MsgTypeFilter = { ALL: 'ALL' as const, TEXT: 'TEXT' as const, MEDIA: 'MEDIA' as const, STICKER: 'STICKER' as const };

/** enum network/NetworkTypeDetector.kt */
export type NetworkType = 'MOBILE' | 'WIFI' | 'ROAMING' | 'OTHER';
export const NetworkType = { MOBILE: 'MOBILE' as const, WIFI: 'WIFI' as const, ROAMING: 'ROAMING' as const, OTHER: 'OTHER' as const };

/** enum ui/premium/PremiumViewModel.kt */
export type PaymentProvider = 'WAYFORPAY' | 'LIQPAY' | 'MONOBANK';
export const PaymentProvider = { WAYFORPAY: 'WAYFORPAY' as const, LIQPAY: 'LIQPAY' as const, MONOBANK: 'MONOBANK' as const };

/** enum ui/editor/PhotoEditorScreen.kt */
export type PhotoFilter = 'NONE' | 'GRAYSCALE' | 'SEPIA' | 'WARM' | 'COOL' | 'VIVID' | 'INVERT' | 'BLUR' | 'SHARPEN';
export const PhotoFilter = { NONE: 'NONE' as const, GRAYSCALE: 'GRAYSCALE' as const, SEPIA: 'SEPIA' as const, WARM: 'WARM' as const, COOL: 'COOL' as const, VIVID: 'VIVID' as const, INVERT: 'INVERT' as const, BLUR: 'BLUR' as const, SHARPEN: 'SHARPEN' as const };

/** enum ui/settings/security/PINScreen.kt */
export type PINSetupStep = 'CREATE' | 'CONFIRM';
export const PINSetupStep = { CREATE: 'CREATE' as const, CONFIRM: 'CONFIRM' as const };

/** enum ui/theme/ThemeSettingsScreen.kt */
export type PresetBackground = 'MIDNIGHT' | 'SUNSET' | 'PEACH' | 'FIRE' | 'SAND_DUNES' | 'SPRING' | 'WINTER' | 'LAVENDER' | 'COTTON_CANDY' | 'MORNING_MIST' | 'AURORA' | 'COSMIC' | 'MINT_SKY' | 'ARCTIC_BLUE' | 'DEEP_PLUM';
export const PresetBackground = { MIDNIGHT: 'MIDNIGHT' as const, SUNSET: 'SUNSET' as const, PEACH: 'PEACH' as const, FIRE: 'FIRE' as const, SAND_DUNES: 'SAND_DUNES' as const, SPRING: 'SPRING' as const, WINTER: 'WINTER' as const, LAVENDER: 'LAVENDER' as const, COTTON_CANDY: 'COTTON_CANDY' as const, MORNING_MIST: 'MORNING_MIST' as const, AURORA: 'AURORA' as const, COSMIC: 'COSMIC' as const, MINT_SKY: 'MINT_SKY' as const, ARCTIC_BLUE: 'ARCTIC_BLUE' as const, DEEP_PLUM: 'DEEP_PLUM' as const };

/** enum ui/settings/PrivacySettingsScreen.kt */
export type PrivacyType = 'FOLLOW' | 'FRIEND' | 'POST' | 'MESSAGE' | 'BIRTH' | 'VISIT';
export const PrivacyType = { FOLLOW: 'FOLLOW' as const, FRIEND: 'FRIEND' as const, POST: 'POST' as const, MESSAGE: 'MESSAGE' as const, BIRTH: 'BIRTH' as const, VISIT: 'VISIT' as const };

/** enum utils/VideoCompressor.kt */
export type Quality = 'VIDEO_MESSAGE' | 'COMPRESSED' | 'HIGH_QUALITY';
export const Quality = { VIDEO_MESSAGE: 'VIDEO_MESSAGE' as const, COMPRESSED: 'COMPRESSED' as const, HIGH_QUALITY: 'HIGH_QUALITY' as const };

/** enum ui/login/QuickRegisterActivity.kt */
export type QuickRegStep = 'ENTER_CONTACT' | 'ENTER_CODE';
export const QuickRegStep = { ENTER_CONTACT: 'ENTER_CONTACT' as const, ENTER_CODE: 'ENTER_CODE' as const };

/** enum ui/bots/BotAnimations.kt */
export type QuizAnswerType = 'CORRECT' | 'WRONG' | 'NONE';
export const QuizAnswerType = { CORRECT: 'CORRECT' as const, WRONG: 'WRONG' as const, NONE: 'NONE' as const };

/** enum ui/bots/RandBotAnimations.kt */
export type RandBotAnimType = 'DICE' | 'COIN' | 'SLOTS' | 'MAGIC8' | 'RANDOM' | 'NONE';
export const RandBotAnimType = { DICE: 'DICE' as const, COIN: 'COIN' as const, SLOTS: 'SLOTS' as const, MAGIC8: 'MAGIC8' as const, RANDOM: 'RANDOM' as const, NONE: 'NONE' as const };

/** enum ui/login/ForgotPasswordActivity.kt */
export type RecoveryMode = 'CHOOSE' | 'FORGOT_PASSWORD' | 'FORGOT_EMAIL';
export const RecoveryMode = { CHOOSE: 'CHOOSE' as const, FORGOT_PASSWORD: 'FORGOT_PASSWORD' as const, FORGOT_EMAIL: 'FORGOT_EMAIL' as const };

/** enum network/TokenRefreshInterceptor.kt */
export type RefreshResult = 'SUCCESS' | 'INVALID' | 'TRANSIENT';
export const RefreshResult = { SUCCESS: 'SUCCESS' as const, INVALID: 'INVALID' as const, TRANSIENT: 'TRANSIENT' as const };

/** enum ui/login/ForgotPasswordActivity.kt */
export type ResetStep = 'ENTER_CONTACT' | 'ENTER_CODE' | 'NEW_PASSWORD' | 'SHOW_TEMP_PASSWORD';
export const ResetStep = { ENTER_CONTACT: 'ENTER_CONTACT' as const, ENTER_CODE: 'ENTER_CODE' as const, NEW_PASSWORD: 'NEW_PASSWORD' as const, SHOW_TEMP_PASSWORD: 'SHOW_TEMP_PASSWORD' as const };

/** enum ui/search/MediaSearchScreen.kt */
export type SortOption = 'DATE_DESC' | 'DATE_ASC' | 'SIZE_DESC' | 'SIZE_ASC' | 'NAME_ASC' | 'NAME_DESC';
export const SortOption = { DATE_DESC: 'DATE_DESC' as const, DATE_ASC: 'DATE_ASC' as const, SIZE_DESC: 'SIZE_DESC' as const, SIZE_ASC: 'SIZE_ASC' as const, NAME_ASC: 'NAME_ASC' as const, NAME_DESC: 'NAME_DESC' as const };

/** enum ui/components/StickerPicker.kt */
export type StickerPickerView = 'CATALOG' | 'PACK' | 'ANIMATED_EMOJI';
export const StickerPickerView = { CATALOG: 'CATALOG' as const, PACK: 'PACK' as const, ANIMATED_EMOJI: 'ANIMATED_EMOJI' as const };

/** enum network/StoryReactionType.kt */
export type StoryReactionType = 'LIKE' | 'LOVE' | 'HAHA' | 'WOW' | 'SAD' | 'ANGRY';
export const StoryReactionType = { LIKE: 'LIKE' as const, LOVE: 'LOVE' as const, HAHA: 'HAHA' as const, WOW: 'WOW' as const, SAD: 'SAD' as const, ANGRY: 'ANGRY' as const };

/** enum ui/video/StreamingVideoPlayer.kt */
export type StreamType = 'HLS' | 'DASH' | 'PROGRESSIVE';
export const StreamType = { HLS: 'HLS' as const, DASH: 'DASH' as const, PROGRESSIVE: 'PROGRESSIVE' as const };

/** enum ui/theme/ThemeSettingsScreen.kt */
export type ThemeCategory = 'APP_MODE' | 'PACKS' | 'MAIN_UI' | 'CHANNELS' | 'CALL_FRAMES' | 'VIDEO_MSG_FRAMES' | 'SOUNDS';
export const ThemeCategory = { APP_MODE: 'APP_MODE' as const, PACKS: 'PACKS' as const, MAIN_UI: 'MAIN_UI' as const, CHANNELS: 'CHANNELS' as const, CALL_FRAMES: 'CALL_FRAMES' as const, VIDEO_MSG_FRAMES: 'VIDEO_MSG_FRAMES' as const, SOUNDS: 'SOUNDS' as const };

/** enum ui/theme/ThemeVariant.kt */
export type ThemeVariant = 'CLASSIC' | 'OCEAN' | 'PURPLE' | 'MONOCHROME' | 'NORD' | 'DRACULA' | 'MATERIAL_YOU' | 'STRANGER_THINGS' | 'LORD_OF_THE_RINGS' | 'TERMINATOR' | 'SUPERNATURAL' | 'MARVEL' | 'CYBERPUNK' | 'INTERSTELLAR' | 'HARRY_POTTER' | 'DUNE' | 'DEMON_SLAYER' | 'INDIGO_NIGHT' | 'COBALT_DENIM' | 'FOREST_TRAIL' | 'SAGE' | 'TERRACOTTA' | 'PLUM_WINE' | 'STORM_SLATE' | 'COPPER' | 'CORAL_BLUSH' | 'LILAC_MIST' | 'OLIVE_GROVE' | 'TURQUOISE_BAY' | 'SANDSTONE' | 'MIDNIGHT_NAVY' | 'BLUSH_GARDEN' | 'MOSS_STONE' | 'ESPRESSO' | 'STEEL_TEAL' | 'WHEAT_FIELD' | 'SAPPHIRE_DEPTH' | 'EMERALD_VEIL' | 'GARNET_EMBER' | 'ONYX_GOLD' | 'AMETHYST_DUSK' | 'TOPAZ_GLOW' | 'OPAL_FROST' | 'OBSIDIAN_ROSE' | 'PLATINUM_MIST' | 'CELESTITE' | 'HARBOR_MIST' | 'WILD_BERRY' | 'BASIL' | 'CINNAMON';
export const ThemeVariant = { CLASSIC: 'CLASSIC' as const, OCEAN: 'OCEAN' as const, PURPLE: 'PURPLE' as const, MONOCHROME: 'MONOCHROME' as const, NORD: 'NORD' as const, DRACULA: 'DRACULA' as const, MATERIAL_YOU: 'MATERIAL_YOU' as const, STRANGER_THINGS: 'STRANGER_THINGS' as const, LORD_OF_THE_RINGS: 'LORD_OF_THE_RINGS' as const, TERMINATOR: 'TERMINATOR' as const, SUPERNATURAL: 'SUPERNATURAL' as const, MARVEL: 'MARVEL' as const, CYBERPUNK: 'CYBERPUNK' as const, INTERSTELLAR: 'INTERSTELLAR' as const, HARRY_POTTER: 'HARRY_POTTER' as const, DUNE: 'DUNE' as const, DEMON_SLAYER: 'DEMON_SLAYER' as const, INDIGO_NIGHT: 'INDIGO_NIGHT' as const, COBALT_DENIM: 'COBALT_DENIM' as const, FOREST_TRAIL: 'FOREST_TRAIL' as const, SAGE: 'SAGE' as const, TERRACOTTA: 'TERRACOTTA' as const, PLUM_WINE: 'PLUM_WINE' as const, STORM_SLATE: 'STORM_SLATE' as const, COPPER: 'COPPER' as const, CORAL_BLUSH: 'CORAL_BLUSH' as const, LILAC_MIST: 'LILAC_MIST' as const, OLIVE_GROVE: 'OLIVE_GROVE' as const, TURQUOISE_BAY: 'TURQUOISE_BAY' as const, SANDSTONE: 'SANDSTONE' as const, MIDNIGHT_NAVY: 'MIDNIGHT_NAVY' as const, BLUSH_GARDEN: 'BLUSH_GARDEN' as const, MOSS_STONE: 'MOSS_STONE' as const, ESPRESSO: 'ESPRESSO' as const, STEEL_TEAL: 'STEEL_TEAL' as const, WHEAT_FIELD: 'WHEAT_FIELD' as const, SAPPHIRE_DEPTH: 'SAPPHIRE_DEPTH' as const, EMERALD_VEIL: 'EMERALD_VEIL' as const, GARNET_EMBER: 'GARNET_EMBER' as const, ONYX_GOLD: 'ONYX_GOLD' as const, AMETHYST_DUSK: 'AMETHYST_DUSK' as const, TOPAZ_GLOW: 'TOPAZ_GLOW' as const, OPAL_FROST: 'OPAL_FROST' as const, OBSIDIAN_ROSE: 'OBSIDIAN_ROSE' as const, PLATINUM_MIST: 'PLATINUM_MIST' as const, CELESTITE: 'CELESTITE' as const, HARBOR_MIST: 'HARBOR_MIST' as const, WILD_BERRY: 'WILD_BERRY' as const, BASIL: 'BASIL' as const, CINNAMON: 'CINNAMON' as const };

/** enum ui/settings/security/TwoFactorAuthScreen.kt */
export type TwoFAStep = 'MAIN' | 'SETUP' | 'RECOVERY_CODES' | 'DISABLE';
export const TwoFAStep = { MAIN: 'MAIN' as const, SETUP: 'SETUP' as const, RECOVERY_CODES: 'RECOVERY_CODES' as const, DISABLE: 'DISABLE' as const };

/** enum ui/preferences/UIStylePreferences.kt */
export type UIStyle = 'WORLDMATES' | 'TELEGRAM';
export const UIStyle = { WORLDMATES: 'WORLDMATES' as const, TELEGRAM: 'TELEGRAM' as const };

/** enum ui/calls/VideoFilterManager.kt */
export type VideoFilterType = 'NONE' | 'BEAUTY' | 'WARM' | 'COOL' | 'BW' | 'VINTAGE' | 'VIVID' | 'SEPIA';
export const VideoFilterType = { NONE: 'NONE' as const, BEAUTY: 'BEAUTY' as const, WARM: 'WARM' as const, COOL: 'COOL' as const, BW: 'BW' as const, VINTAGE: 'VINTAGE' as const, VIVID: 'VIVID' as const, SEPIA: 'SEPIA' as const };

/** enum ui/messages/VideoMessageComponents.kt */
export type VideoMessageFrameStyle = 'CIRCLE' | 'ROUNDED' | 'NEON' | 'GRADIENT' | 'MINIMAL' | 'RAINBOW';
export const VideoMessageFrameStyle = { CIRCLE: 'CIRCLE' as const, ROUNDED: 'ROUNDED' as const, NEON: 'NEON' as const, GRADIENT: 'GRADIENT' as const, MINIMAL: 'MINIMAL' as const, RAINBOW: 'RAINBOW' as const };

/** enum network/WebRTCManager.kt */
export type VideoQualityEnum = 'LOW' | 'MEDIUM' | 'HIGH' | 'FULL_HD' | 'QHD';
export const VideoQualityEnum = { LOW: 'LOW' as const, MEDIUM: 'MEDIUM' as const, HIGH: 'HIGH' as const, FULL_HD: 'FULL_HD' as const, QHD: 'QHD' as const };

/** enum ui/messages/VideoQualitySheet.kt */
export type VideoSendOption = 'VIDEO_MESSAGE' | 'COMPRESSED' | 'HIGH_QUALITY' | 'ORIGINAL';
export const VideoSendOption = { VIDEO_MESSAGE: 'VIDEO_MESSAGE' as const, COMPRESSED: 'COMPRESSED' as const, HIGH_QUALITY: 'HIGH_QUALITY' as const, ORIGINAL: 'ORIGINAL' as const };

/** enum ui/calls/VirtualBackgroundManager.kt */
export type VirtualBgMode = 'NONE' | 'BLUR_LIGHT' | 'BLUR_STRONG' | 'COLOR_OFFICE' | 'COLOR_NATURE' | 'COLOR_GRADIENT' | 'CUSTOM_IMAGE';
export const VirtualBgMode = { NONE: 'NONE' as const, BLUR_LIGHT: 'BLUR_LIGHT' as const, BLUR_STRONG: 'BLUR_STRONG' as const, COLOR_OFFICE: 'COLOR_OFFICE' as const, COLOR_NATURE: 'COLOR_NATURE' as const, COLOR_GRADIENT: 'COLOR_GRADIENT' as const, CUSTOM_IMAGE: 'CUSTOM_IMAGE' as const };

/** enum ui/bots/BotAnimations.kt */
export type WeatherCondition = 'CLEAR' | 'CLOUDY' | 'PARTLY_CLOUDY' | 'RAIN' | 'SNOW' | 'STORM' | 'FOG' | 'NONE';
export const WeatherCondition = { CLEAR: 'CLEAR' as const, CLOUDY: 'CLOUDY' as const, PARTLY_CLOUDY: 'PARTLY_CLOUDY' as const, RAIN: 'RAIN' as const, SNOW: 'SNOW' as const, STORM: 'STORM' as const, FOG: 'FOG' as const, NONE: 'NONE' as const };

/** data/local/entity/AccountEntity.kt */
export interface AccountEntity {
  userId: number;
  accessToken: string;
  username: string | null;
  avatar: string | null;
  isPro: number;
  addedAt: number;
  isActive: boolean;
}

/** data/model/Channel.kt */
export interface ActiveMember {
  userId: number;
  username: string | null;
  name: string | null;
  avatarUrl: string | null;
  commentCount: number;
  reactionCount: number;
  score: number;
}

/** data/model/Channel.kt */
export interface ActiveMembersResponse {
  apiStatus: number;
  members: Array<ActiveMember> | null;
  total: number;
  periodDays: number;
  errorMessage: string | null;
}

/** network/NodeAdsApi.kt */
export interface AdCampaign {
  id: number;
  channelId: number;
  ownerUserId: number;
  title: string;
  pitch: string;
  mediaUrl: string | null;
  ctaLabel: string | null;
  placement: string;
  pricing: string;
  bidStars: number;
  budgetStars: number;
  spentStars: number;
  targetLangs: string | null;
  status: string;
  moderationNote: string | null;
  channelName: string | null;
  channelTitle: string | null;
  channelAvatar: string | null;
}

/** network/NodeAdsApi.kt */
export interface AdCampaignResponse {
  apiStatus: number;
  campaign: AdCampaign | null;
  minBudgetStars: number;
  errorMessage: string | null;
}

/** network/NodeAdsApi.kt */
export interface AdCampaignsResponse {
  apiStatus: number;
  campaigns: Array<AdCampaign>;
}

/** network/NodeAdsApi.kt */
export interface AdChannel {
  channelId: number;
  name: string | null;
  title: string | null;
  avatar: string | null;
}

/** network/NodeAdsApi.kt */
export interface AdChannelsResponse {
  apiStatus: number;
  channels: Array<AdChannel>;
}

/** data/model/Channel.kt */
export interface AddChannelAdminRequest {
  channelId: number;
  userId: number | null;
  userSearch: string | null;
  role: string;
  permissions: ChannelAdminPermissions | null;
}

/** data/model/Channel.kt */
export interface AddCommentRequest {
  postId: number;
  text: string;
  replyToId: number | null;
}

/** data/model/Channel.kt */
export interface AddReactionRequest {
  targetId: number;
  targetType: string;
  emoji: string;
}

/** network/NodeAdsApi.kt */
export interface AdEventResponse {
  apiStatus: number;
  charged: number;
}

/** network/NodeCallApi.kt */
export interface AdhocInvitee {
  id: number;
  name: string;
  avatar: string;
}

/** network/NodeCallApi.kt */
export interface AdhocInviteResponse {
  apiStatus: number;
  roomName: string;
  callType: string;
  livekitUrl: string;
  token: string;
  maxParticipants: number;
  invitee: AdhocInvitee | null;
  errorMessage: string | null;
}

/** network/NodeCallApi.kt */
export interface AdhocJoinResponse {
  apiStatus: number;
  roomName: string;
  callType: string;
  livekitUrl: string;
  token: string;
  maxParticipants: number;
  errorMessage: string | null;
}

/** network/NodeCallApi.kt */
export interface AdhocLeaveResponse {
  apiStatus: number;
  ended: boolean;
  errorMessage: string | null;
}

/** data/model/AdminLog.kt */
export interface AdminLog {
  id: number;
  action: string;
  adminId: number;
  adminName: string;
  adminAvatar: string | null;
  targetUserId: number | null;
  targetUserName: string | null;
  details: Record<string, string> | null;
  createdAt: string;
}

/** data/model/Group.kt */
export interface AdminLogDto {
  id: number;
  action: string;
  adminId: number;
  adminName: string;
  adminAvatar: string | null;
  targetUserId: number | null;
  targetUserName: string | null;
  targetMessageId: number | null;
  details: Record<string, string> | null;
  createdAt: string;
}

/** data/model/AdminLog.kt */
export interface AdminLogsResponse {
  status: number;
  logs: Array<AdminLog>;
  total: number;
  page: number;
}

/** network/NodeAdsApi.kt */
export interface AdModerationResponse {
  apiStatus: number;
  campaigns: Array<AdCampaign>;
}

/** network/NodeAdsApi.kt */
export interface AdServeItem {
  campaignId: number;
  channelId: number;
  channelName: string | null;
  channelTitle: string | null;
  channelAvatar: string | null;
  title: string;
  pitch: string;
  mediaUrl: string | null;
  ctaLabel: string | null;
  placement: string;
}

/** network/NodeAdsApi.kt */
export interface AdServeResponse {
  apiStatus: number;
  ads: Array<AdServeItem>;
}

/** network/NodeAdsApi.kt */
export interface AdSettings {
  adsEnabled: number;
  commissionPct: number;
  cpmStars: number;
  cpcStars: number;
  freqCap: number;
  minBudget: number;
  autoApprove: number;
  autoMinSubs: number;
  autoVerified: number;
  bannedKeywords: string | null;
}

/** network/NodeAdsApi.kt */
export interface AdSettingsResponse {
  apiStatus: number;
  settings: AdSettings | null;
  errorMessage: string | null;
}

/** network/NodeAdsApi.kt */
export interface AdStatsDaily {
  day: string;
  impressions: number;
  clicks: number;
  subscribes: number;
  spendStars: number;
}

/** network/NodeAdsApi.kt */
export interface AdStatsResponse {
  apiStatus: number;
  campaign: AdCampaign | null;
  totals: AdStatsTotals | null;
  series: Array<AdStatsDaily>;
}

/** network/NodeAdsApi.kt */
export interface AdStatsTotals {
  impressions: number;
  clicks: number;
  subscribes: number;
  spendStars: number;
  ctr: number;
}

/** network/NodeAdsApi.kt */
export interface AdStatusResponse {
  apiStatus: number;
  status: string | null;
  errorMessage: string | null;
}

/** network/NodeAdsApi.kt */
export interface AdTopupResponse {
  apiStatus: number;
  balance: number;
  starsBalance: number;
  errorMessage: string | null;
}

/** network/NodeAdsApi.kt */
export interface AdWallet {
  balance: number;
  totalTopup: number;
  totalSpent: number;
  totalEarned: number;
}

/** network/NodeAdsApi.kt */
export interface AdWalletResponse {
  apiStatus: number;
  wallet: AdWallet | null;
  starsBalance: number;
  transactions: Array<AdWalletTxn>;
  isAdmin: boolean;
  errorMessage: string | null;
}

/** network/NodeAdsApi.kt */
export interface AdWalletTxn {
  id: number;
  kind: string;
  amount: number;
  balanceAfter: number;
  note: string | null;
  createdAt: string | null;
}

/** data/model/AiSummaryModels.kt */
export interface AiSummaryRequest {
  messages: Array<AiSummaryTurn>;
  lang: string | null;
  provider: string | null;
}

/** data/model/AiSummaryModels.kt */
export interface AiSummaryResponse {
  apiStatus: number;
  summary: string | null;
  provider: string | null;
  errorMessage: string | null;
}

/** network/NodeChannelApi.kt */
export interface AiSummaryResponse__NodeChannelApi {
  apiStatus: number;
  summary: string | null;
  provider: string | null;
  errorMessage: string | null;
}

/** data/model/AiSummaryModels.kt */
export interface AiSummaryTurn {
  sender: string;
  text: string;
}

/** data/model/AppUpdateModels.kt */
export interface AppUpdateInfo {
  latestVersion: string;
  versionCode: number;
  apkUrl: string;
  changelog: Array<string>;
  changelogStructured: Array<VersionChangelog>;
  changelogI18n: Record<string, Array<string>> | null;
  changelogStructuredI18n: Record<string, Array<VersionChangelog>> | null;
  isMandatory: boolean;
  publishedAt: string | null;
  minimumSupportedVersion: string | null;
}

/** data/model/AppUpdateModels.kt */
export interface AppUpdateResponse {
  success: boolean;
  data: AppUpdateInfo | null;
  message: string | null;
}

/** data/model/Group.kt */
export interface AuthResponse {
  _apiStatus: any | null;
  accessToken: string | null;
  userId: number | null;
  username: string | null;
  avatar: string | null;
  errorCode: number | null;
  errorMessage: string | null;
  errors: ErrorsObject | null;
  successType: string | null;
  message: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
}

/** data/model/BackupModels.kt */
export interface BackupFileInfo {
  filename: string | null;
  url: string | null;
  size: number;
  sizeMb: number;
  createdAt: number;
  provider: string | null;
}

/** data/model/BackupModels.kt */
export interface BackupManifest {
  version: string;
  createdAt: number;
  userId: number;
  appVersion: string;
  encryption: string;
  totalSize: number;
  totalMessages: number;
  totalGroups: number;
}

/** data/model/BackupModels.kt */
export interface BackupProgress {
  isRunning: boolean;
  progress: number;
  currentStep: string;
  totalSteps: number;
  currentStepNumber: number;
  error: string | null;
}

/** data/model/CloudBackupSettings.kt */
export interface BackupStatistics {
  totalMessages: number;
  messagesSent: number;
  messagesReceived: number;
  mediaFilesCount: number;
  mediaSizeBytes: number;
  mediaSizeMb: number;
  groupsCount: number;
  channelsCount: number;
  totalStorageBytes: number;
  totalStorageMb: number;
  totalStorageGb: number;
  lastBackupTime: number | null;
  backupFrequency: string;
  serverName: string;
  backupProvider: string;
}

/** data/model/CloudBackupSettings.kt */
export interface BackupStatisticsResponse {
  apiStatus: number;
  statistics: BackupStatistics;
  errors: Record<string, string> | null;
}

/** data/model/BlockedUser.kt */
export interface BlockActionResponse {
  apiStatus: number;
  blockStatus: string;
  message: string | null;
  errorCode: number | null;
  errorMessage: string | null;
}

/** network/NodeProfileApi.kt */
export interface BlockByIdentifierResponse {
  apiStatus: number;
  blockStatus: string | null;
  message: string | null;
  errorMessage: string | null;
}

/** data/model/BlockedUser.kt */
export interface BlockedUser {
  userId: number;
  username: string;
  firstName: string | null;
  lastName: string | null;
  name: string | null;
  avatar: string | null;
  about: string | null;
  verified: number;
  isVerified: boolean;
  isPro: boolean;
  lastSeen: number | null;
  lastSeenTimeText: string | null;
  gender: string | null;
  genderText: string | null;
}

/** network/NodeBlogApi.kt */
export interface BlogAuthor {
  userId: number;
  username: string;
  name: string;
  avatar: string | null;
}

/** network/NodeBlogApi.kt */
export interface BlogCategory {
  id: number;
  name: string;
}

/** network/NodeBlogApi.kt */
export interface BlogPost {
  id: number;
  title: string;
  description: string;
  thumbnail: string | null;
  webUrl: string;
  categoryId: number;
  categoryName: string;
  author: BlogAuthor;
  posted: number;
  views: number;
}

/** network/NodeBlogApi.kt */
export interface BlogPostDetail {
  id: number;
  title: string;
  description: string;
  thumbnail: string | null;
  webUrl: string;
  categoryId: number;
  categoryName: string;
  author: BlogAuthor;
  posted: number;
  views: number;
  contentMarkup: string;
  contentPlain: string;
  tags: Array<string> | null;
}

/** data/model/Bot.kt */
export interface Bot {
  botId: string;
  username: string;
  displayName: string;
  avatar: string | null;
  description: string | null;
  about: string | null;
  botType: string;
  status: string;
  isPublic: number;
  isInline: number;
  canJoinGroups: number;
  supportsCommands: number;
  category: string | null;
  tags: string | null;
  totalUsers: number;
  activeUsers24h: number;
  messagesSent: number;
  messagesReceived: number;
  commandsCount: number;
  commands: Array<BotCommand> | null;
  webhookUrl: string | null;
  webhookEnabled: number;
  webAppUrl: string | null;
  linkedUserId: number | null;
  createdAt: string | null;
  lastActiveAt: string | null;
  botToken: string | null;
}

/** data/model/Bot.kt */
export interface BotBroadcastItem {
  messageId: number;
  topic: string;
  text: string | null;
  media: BotMedia | null;
  replyMarkup: BotReplyMarkup | null;
  alertPriority: string;
  alertType: string;
  alertId: string | null;
  date: number;
}

/** data/model/Bot.kt */
export interface BotBroadcastsResponse {
  apiStatus: number;
  broadcasts: Array<BotBroadcastItem> | null;
  errorMessage: string | null;
}

/** data/model/Bot.kt */
export interface BotCallbackQuery {
  id: string;
  from: BotUpdateUser;
  data: string;
  message: BotUpdateMessage | null;
}

/** data/model/Bot.kt */
export interface BotCategory {
  category: string;
  count: number;
}

/** data/model/Bot.kt */
export interface BotCommand {
  command: string;
  description: string;
  usageHint: string | null;
  scope: string;
}

/** data/model/Bot.kt */
export interface BotCommandsResponse {
  apiStatus: number;
  commands: Array<BotCommand> | null;
  errorCode: number | null;
  errorMessage: string | null;
}

/** data/model/Bot.kt */
export interface BotGenericResponse {
  apiStatus: number;
  message: string | null;
  errorCode: number | null;
  errorMessage: string | null;
}

/** data/model/Bot.kt */
export interface BotInfoResponse {
  apiStatus: number;
  bot: Bot | null;
  commands: Array<BotCommand> | null;
  errorCode: number | null;
  errorMessage: string | null;
}

/** data/model/Bot.kt */
export interface BotInlineButton {
  text: string;
  callbackData: string | null;
  url: string | null;
  webApp: WebAppInfo | null;
}

/** data/model/Bot.kt */
export interface BotKeyboardButton {
  text: string;
  requestContact: boolean;
  requestLocation: boolean;
}

/** data/model/Bot.kt */
export interface BotListResponse {
  apiStatus: number;
  bots: Array<Bot> | null;
  count: number;
  errorCode: number | null;
  errorMessage: string | null;
}

/** data/model/Bot.kt */
export interface BotMedia {
  type: string;
  url: string;
}

/** data/model/Bot.kt */
export interface BotMessage {
  messageId: number;
  realMessageId: number | null;
  chatId: string;
  text: string | null;
  date: number;
  media: BotMedia | null;
  replyMarkup: BotReplyMarkup | null;
}

/** data/model/Bot.kt */
export interface BotMessageEntity {
  type: string;
  offset: number;
  length: number;
  url: string | null;
}

/** data/model/Bot.kt */
export interface BotPoll {
  pollId: number;
  messageId: number | null;
  question: string;
  options: Array<string>;
  type: string;
  isAnonymous: number;
  totalVoters: number;
  isClosed: boolean;
}

/** data/model/Bot.kt */
export interface BotPollResponse {
  apiStatus: number;
  poll: BotPoll | null;
  results: Array<BotPollResult> | null;
  errorCode: number | null;
  errorMessage: string | null;
}

/** data/model/Bot.kt */
export interface BotPollResult {
  optionText: string;
  voterCount: number;
  optionIndex: number;
}

/** data/model/Bot.kt */
export interface BotReplyMarkup {
  inlineKeyboard: Array<Array<BotInlineButton>> | null;
  keyboard: Array<Array<BotKeyboardButton>> | null;
  resizeKeyboard: boolean;
  oneTimeKeyboard: boolean;
}

/** data/model/Bot.kt */
export interface BotSearchResponse {
  apiStatus: number;
  bots: Array<Bot> | null;
  categories: Array<BotCategory> | null;
  total: number;
  errorCode: number | null;
  errorMessage: string | null;
}

/** network/BotRepository.kt */
export interface BotSearchResult {
  bots: Array<Bot>;
  categories: Array<BotCategory>;
  total: number;
}

/** data/model/Bot.kt */
export interface BotSendMessageResponse {
  apiStatus: number;
  messageId: number | null;
  realMessageId: number | null;
  chatId: string | null;
  text: string | null;
  date: number;
  errorCode: number | null;
  errorMessage: string | null;
}

/** data/model/Bot.kt */
export interface BotSubscription {
  topicKey: string;
  mutedUntil: string | null;
  lastAlertId: string | null;
}

/** data/model/Bot.kt */
export interface BotSubscriptionsResponse {
  apiStatus: number;
  subscriptions: Array<BotSubscription> | null;
  topics: Array<BotTopic> | null;
  errorMessage: string | null;
}

/** network/BotRepository.kt */
export interface BotSubscriptionsResult {
  subscriptions: Array<BotSubscription>;
  topics: Array<BotTopic>;
}

/** data/model/Bot.kt */
export interface BotTokenResponse {
  apiStatus: number;
  botToken: string | null;
  message: string | null;
  errorCode: number | null;
  errorMessage: string | null;
}

/** data/model/Bot.kt */
export interface BotTopic {
  topicKey: string;
  title: string | null;
  description: string | null;
  isDefault: number;
  subscribersCount: number;
}

/** data/model/Bot.kt */
export interface BotUpdate {
  updateId: number;
  message: BotUpdateMessage | null;
  command: BotUpdateCommand | null;
  callbackQuery: BotCallbackQuery | null;
  webAppData: BotWebAppData | null;
}

/** data/model/Bot.kt */
export interface BotUpdateChat {
  id: string;
  type: string;
}

/** data/model/Bot.kt */
export interface BotUpdateCommand {
  name: string;
  args: string | null;
}

/** data/model/Bot.kt */
export interface BotUpdateMessage {
  messageId: number;
  from: BotUpdateUser;
  chat: BotUpdateChat;
  date: number;
  text: string | null;
  media: BotMedia | null;
  entities: Array<BotMessageEntity> | null;
}

/** data/model/Bot.kt */
export interface BotUpdatesResponse {
  apiStatus: number;
  updates: Array<BotUpdate> | null;
  errorCode: number | null;
  errorMessage: string | null;
}

/** data/model/Bot.kt */
export interface BotUpdateUser {
  id: number;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  avatar: string | null;
}

/** data/model/Bot.kt */
export interface BotWebAppData {
  data: string;
  queryId: string | null;
}

/** data/model/Bot.kt */
export interface BotWebhookInfoResponse {
  apiStatus: number;
  url: string | null;
  hasCustomCertificate: boolean;
  pendingUpdateCount: number;
  maxConnections: number;
  allowedUpdates: Array<string> | null;
  lastErrorDate: number | null;
  lastErrorMessage: string | null;
  errorCode: number | null;
  errorMessage: string | null;
}

/** data/model/BusinessModels.kt */
export interface BusinessActionResponse {
  apiStatus: number;
  errorMessage: string | null;
}

/** data/model/BusinessModels.kt */
export interface BusinessApiKey {
  apiKey: string;
  label: string;
  lastUsedAt: string | null;
}

/** data/model/BusinessModels.kt */
export interface BusinessApiKeyResponse {
  apiStatus: number;
  apiKey: BusinessApiKey | null;
  errorMessage: string | null;
}

/** data/model/BusinessModels.kt */
export interface BusinessAvatarResponse {
  apiStatus: number;
  avatarUrl: string | null;
  relativePath: string | null;
  errorMessage: string | null;
}

/** data/model/BusinessDirectory.kt */
export interface BusinessCategoriesResponse {
  status: number;
  categories: Array<string>;
}

/** data/model/BusinessDirectory.kt */
export interface BusinessDirectoryDetail {
  apiStatus: number;
  userId: number;
  username: string;
  avatar: string | null;
  businessName: string;
  category: string;
  description: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  isVerified: boolean;
  lat: number | null;
  lng: number | null;
  distance: number | null;
  ratingAvg: number | null;
  ratingCount: number;
  myRating: number | null;
  myReview: string | null;
  hours: Array<BusinessHour>;
  errorMessage: string | null;
}

/** data/model/BusinessDirectory.kt */
export interface BusinessDirectoryItem {
  userId: number;
  username: string;
  avatar: string | null;
  businessName: string;
  category: string;
  description: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  isVerified: boolean;
  lat: number | null;
  lng: number | null;
  distance: number | null;
  ratingAvg: number | null;
  ratingCount: number;
  myRating: number | null;
  myReview: string | null;
}

/** data/model/BusinessDirectory.kt */
export interface BusinessDirectoryResponse {
  status: number;
  businesses: Array<BusinessDirectoryItem>;
  total: number;
  page: number;
}

/** data/model/BusinessModels.kt */
export interface BusinessDocumentUploadResponse {
  apiStatus: number;
  documentName: string | null;
  errorMessage: string | null;
}

/** data/model/BusinessModels.kt */
export interface BusinessHour {
  id: number;
  userId: number;
  weekday: number;
  isOpen: number;
  openTime: string;
  closeTime: string;
}

/** data/model/BusinessModels.kt */
export interface BusinessHourRequest {
  weekday: number;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

/** data/model/BusinessModels.kt */
export interface BusinessHoursResponse {
  apiStatus: number;
  hours: Array<BusinessHour> | null;
  errorMessage: string | null;
}

/** data/model/BusinessModels.kt */
export interface BusinessLink {
  id: number;
  userId: number;
  title: string;
  prefilledText: string | null;
  slug: string;
  views: number;
  url: string;
  createdAt: number;
}

/** data/model/BusinessModels.kt */
export interface BusinessLinksResponse {
  apiStatus: number;
  links: Array<BusinessLink> | null;
  link: BusinessLink | null;
  errorMessage: string | null;
}

/** data/model/BusinessModels.kt */
export interface BusinessProfile {
  id: number;
  userId: number;
  businessName: string | null;
  category: string | null;
  description: string | null;
  address: string | null;
  lat: number | null;
  lng: number | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  avatarUrl: string | null;
  webhookUrl: string | null;
  autoReplyEnabled: number;
  autoReplyText: string | null;
  autoReplyMode: string;
  greetingEnabled: number;
  greetingText: string | null;
  awayEnabled: number;
  awayText: string | null;
  badgeEnabled: number;
  verificationStatus: string;
  verificationNote: string | null;
  verificationDocPath: string | null;
  verificationDocName: string | null;
  createdAt: number;
  updatedAt: number;
}

/** data/model/BusinessModels.kt */
export interface BusinessProfileResponse {
  apiStatus: number;
  profile: BusinessProfile | null;
  hours: Array<BusinessHour> | null;
  errorMessage: string | null;
}

/** data/model/BusinessModels.kt */
export interface BusinessQuickRepliesResponse {
  apiStatus: number;
  quickReplies: Array<BusinessQuickReply> | null;
  quickReply: BusinessQuickReply | null;
  errorMessage: string | null;
}

/** data/model/BusinessModels.kt */
export interface BusinessQuickReply {
  id: number;
  userId: number;
  shortcut: string;
  text: string;
  mediaUrl: string | null;
  createdAt: number;
  updatedAt: number;
}

/** data/model/BusinessDirectory.kt */
export interface BusinessReview {
  userId: number;
  name: string;
  avatar: string | null;
  rating: number;
  review: string;
  updatedAt: number;
}

/** data/model/BusinessDirectory.kt */
export interface BusinessReviewsResponse {
  apiStatus: number;
  reviews: Array<BusinessReview>;
  errorMessage: string | null;
}

/** data/model/BusinessModels.kt */
export interface BusinessStatDay {
  date: string;
  profileViews: number;
  messagesReceived: number;
  linkClicks: number;
}

/** data/model/BusinessModels.kt */
export interface BusinessStatsResponse {
  apiStatus: number;
  days: number;
  totals: BusinessStatTotals;
  daily: Array<BusinessStatDay>;
  errorMessage: string | null;
}

/** data/model/BusinessModels.kt */
export interface BusinessStatTotals {
  profileViews: number;
  messagesReceived: number;
  linkClicks: number;
}

/** data/model/BusinessModels.kt */
export interface BusinessVerificationResponse {
  apiStatus: number;
  verificationStatus: string;
  message: string | null;
  errorMessage: string | null;
}

/** data/local/entity/CachedChannel.kt */
export interface CachedChannel {
  id: number;
  name: string;
  avatarUrl: string | null;
  subscribersCount: number;
  isSubscribed: boolean;
  unreadCount: number;
  cachedAt: number;
}

/** data/local/entity/CachedChannelPost.kt */
export interface CachedChannelPost {
  id: number;
  channelId: number;
  createdTime: number;
  postJson: string;
  cachedAt: number;
}

/** data/local/entity/CachedChat.kt */
export interface CachedChat {
  id: number;
  ownerId: number;
  userId: number;
  username: string | null;
  avatarUrl: string | null;
  lastMessageText: string | null;
  lastMessageTime: number;
  unreadCount: number;
  isMuted: boolean;
  isOnline: boolean;
  isBot: boolean;
  isPro: number;
  pinnedMessageId: number | null;
  cachedAt: number;
}

/** data/local/entity/CachedMessage.kt */
export interface CachedMessage {
  id: number;
  ownerId: number;
  chatId: number;
  chatType: string;
  fromId: number;
  toId: number;
  groupId: number | null;
  encryptedText: string | null;
  iv: string | null;
  tag: string | null;
  cipherVersion: number | null;
  decryptedText: string | null;
  timestamp: number;
  mediaUrl: string | null;
  mediaFileName: string | null;
  type: string;
  mediaType: string | null;
  mediaDuration: number | null;
  mediaSize: number | null;
  localMediaPath: string | null;
  thumbnailPath: string | null;
  mediaLoadingState: string;
  senderName: string | null;
  senderAvatar: string | null;
  isEdited: boolean;
  editedTime: number | null;
  isDeleted: boolean;
  replyToId: number | null;
  replyToText: string | null;
  isRead: boolean;
  readAt: number | null;
  isSynced: boolean;
  syncedAt: number;
  cachedAt: number;
  destroyAt: number | null;
  isSecret: boolean;
  clientMsgId: string | null;
  fullMessageJson: string | null;
}

/** data/model/CallHistory.kt */
export interface CallGroupData {
  groupId: number;
  groupName: string;
  avatar: string | null;
  maxParticipants: number;
}

/** data/model/CallHistory.kt */
export interface CallHistoryActionResponse {
  apiStatusRaw: any | null;
  message: string | null;
  errorMessage: string | null;
}

/** data/model/CallHistory.kt */
export interface CallHistoryItem {
  id: number;
  callCategory: string;
  callType: string;
  status: string;
  direction: string;
  createdAt: string;
  acceptedAt: string | null;
  endedAt: string | null;
  duration: number;
  timestamp: number;
  otherUser: CallUser | null;
  groupData: CallGroupData | null;
}

/** data/model/Group.kt */
export interface CallInitiateRequest {
  recipientId: number;
  callType: string;
  rtcOffer: string | null;
  initiatedAt: number;
}

/** network/LiveKitGroupCallManager.kt */
export interface CallParticipant {
  identity: string;
  name: string;
  isLocal: boolean;
  videoTrack: any | null;
  micMuted: boolean;
  speaking: boolean;
  isScreenSharing: boolean;
  handRaised: boolean;
}

/** data/model/Group.kt */
export interface CallResponse {
  apiStatus: number;
  callId: string | null;
  callToken: string | null;
  rtcSignal: string | null;
  peerConnectionData: string | null;
  errorCode: number | null;
  errorMessage: string | null;
}

/** data/model/CallHistory.kt */
export interface CallUser {
  userId: number;
  username: string;
  name: string;
  avatar: string | null;
  verified: number;
}

/** data/model/Channel.kt */
export interface Channel {
  id: number;
  name: string;
  username: string | null;
  avatarUrl: string;
  description: string | null;
  subscribersCount: number;
  postsCount: number;
  ownerId: number;
  isPrivate: boolean;
  isVerified: boolean;
  isAdmin: boolean;
  isMuted: boolean;
  isSubscribed: boolean;
  createdTime: number;
  settings: ChannelSettings | null;
  category: string | null;
  formattingPermissions: string | null;
  isPremiumActive: boolean;
  premiumCustomization: ChannelPremiumCustomization | null;
  emojiStatus: string | null;
  animatedAvatarUrl: string | null;
  channelLevel: number;
  channelLevelProgress: number;
  discussionGroup: DiscussionGroupInfo | null;
  unreadCount: number;
  lastReadPostId: number;
}

/** data/model/Channel.kt */
export interface ChannelAdmin {
  userId: number;
  username: string;
  avatarUrl: string;
  role: string;
  addedTime: number;
  permissions: ChannelAdminPermissions | null;
}

/** data/model/Channel.kt */
export interface ChannelAdminPermissions {
  canPost: boolean;
  canEditPosts: boolean;
  canDeletePosts: boolean;
  canPinPosts: boolean;
  canEditInfo: boolean;
  canDeleteChannel: boolean;
  canAddAdmins: boolean;
  canRemoveAdmins: boolean;
  canBanUsers: boolean;
  canViewStatistics: boolean;
  canManageComments: boolean;
}

/** network/NodeChannelApi.kt */
export interface ChannelBackupPostItem {
  id: number;
  text: string;
  mediaUrl: string | null;
  mediaType: string | null;
  time: number;
  views: number;
  reactionsCount: number;
  commentsCount: number;
  isPinned: boolean;
}

/** network/NodeChannelApi.kt */
export interface ChannelBackupResponse {
  apiStatus: number;
  channelId: number;
  channelName: string;
  exportedAt: number;
  postsCount: number;
  posts: Array<ChannelBackupPostItem> | null;
  errorMessage: string | null;
}

/** data/model/Channel.kt */
export interface ChannelBannedMember {
  userId: number;
  username: string | null;
  name: string | null;
  avatarUrl: string | null;
  reason: string | null;
  banTime: number;
  expireTime: number;
  bannedBy: number;
}

/** data/model/Channel.kt */
export interface ChannelBannedMembersResponse {
  apiStatus: number;
  bannedMembers: Array<ChannelBannedMember> | null;
  errorCode: number | null;
  errorMessage: string | null;
}

/** data/model/Channel.kt */
export interface ChannelComment {
  id: number;
  userId: number;
  username: string | null;
  userName: string | null;
  userAvatar: string | null;
  text: string;
  sticker: string | null;
  time: number;
  editedTime: number | null;
  replyToCommentId: number | null;
  reactionsCount: number;
  writtenAsChannel: boolean;
  channelName: string | null;
  channelAvatar: string | null;
}

/** data/model/Channel.kt */
export interface ChannelCommentsResponse {
  apiStatus: number;
  comments: Array<ChannelComment> | null;
  totalCount: number | null;
  hasMore: boolean;
  errorCode: number | null;
  errorMessage: string | null;
}

/** data/model/Channel.kt */
export interface ChannelDetailResponse {
  apiStatus: number;
  channel: Channel | null;
  admins: Array<ChannelAdmin> | null;
  errorCode: number | null;
  errorMessage: string | null;
}

/** data/model/Channel.kt */
export interface ChannelGroupCreateResponse {
  apiStatus: number;
  groupId: number | null;
  groupName: string | null;
  errorMessage: string | null;
}

/** data/model/Channel.kt */
export interface ChannelGroupsResponse {
  apiStatus: number;
  groups: Array<ChannelSubGroupItem> | null;
  errorMessage: string | null;
}

/** data/model/Channel.kt */
export interface ChannelListResponse {
  apiStatus: number;
  _channels: Array<Channel> | null;
  _data: Array<Channel> | null;
  totalCount: number | null;
  errorCode: number | null;
  errorMessage: string | null;
}

/** ui/channels/ChannelPremiumViewModel.kt */
export interface ChannelPlanInfo {
  months: number;
  price_uah: number;
}

/** ui/channels/ChannelPremiumViewModel.kt */
export interface ChannelPlansInfo {
  monthly: ChannelPlanInfo | null;
  quarterly: ChannelPlanInfo | null;
  annual: ChannelPlanInfo | null;
}

/** data/model/Channel.kt */
export interface ChannelPost {
  id: number;
  authorId: number;
  authorUsername: string | null;
  authorName: string | null;
  authorAvatar: string | null;
  text: string;
  poll: Poll | null;
  giveaway: PostGiveawayRef | null;
  media: Array<PostMedia> | null;
  createdTime: number;
  isEdited: boolean;
  isPinned: boolean;
  isAd: boolean;
  forwardedFromName: string | null;
  forwardedFromAvatar: string | null;
  viewsCount: number;
  reactionsCount: number;
  commentsCount: number;
  reactions: Array<PostReaction> | null;
  inlineButtons: Array<Array<InlinePostButton>> | null;
  collectionTitle: string | null;
  isPaywall: boolean;
  paywallType: string | null;
  paywallPriceStars: number | null;
  hasAccess: boolean;
  alreadyPurchased: boolean;
}

/** data/model/Channel.kt */
export interface ChannelPostsResponse {
  apiStatus: number;
  posts: Array<ChannelPost> | null;
  totalCount: number | null;
  hasMore: boolean;
  hasMoreOlder: boolean;
  hasMoreNewer: boolean;
  errorCode: number | null;
  errorMessage: string | null;
}

/** data/model/ChannelPremiumCustomization.kt */
export interface ChannelPremiumCustomization {
  accentColorId: string | null;
  bannerPatternId: string | null;
  emojiPackId: string | null;
  fontWeight: string | null;
  postCornerRadius: number | null;
  avatarFrame: string | null;
  postsBackdropEnabled: boolean;
  backgroundType: string | null;
  backgroundImageUrl: string | null;
  backgroundGradientId: string | null;
  backgroundColorHex: string | null;
  bubbleStyleId: string | null;
  bubbleSenderColorHex: string | null;
  bubbleReceiverColorHex: string | null;
  fontFamily: string | null;
  customFontUrl: string | null;
  customFontName: string | null;
  stickerPackIds: string | null;
  customBubbleCss: string | null;
  customBackgroundCss: string | null;
}

/** network/NodeChannelApi.kt */
export interface ChannelPremiumCustomizationResponse {
  apiStatus: number;
  customization: ChannelPremiumCustomization | null;
  errorMessage: string | null;
}

/** ui/channels/ChannelPremiumViewModel.kt */
export interface ChannelPremiumStatus {
  api_status: number;
  is_active: number;
  plan: string | null;
  expires_at: string | null;
  days_left: number;
  started_at: string | null;
  base_price_uah: number;
  plans: ChannelPlansInfo | null;
  trial_available: number;
  trial_days: number;
  error_message: string | null;
}

/** data/model/ChannelReply.kt */
export interface ChannelReply {
  id: number;
  postId: number;
  channelId: number;
  channelName: string;
  channelAvatar: string;
  postText: string;
  originalCommentId: number;
  originalCommentText: string;
  senderUserId: number;
  senderUsername: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  time: number;
}

/** data/model/ChannelReply.kt */
export interface ChannelReplyInboxResponse {
  apiStatus: number;
  replies: Array<ChannelReply> | null;
  total: number;
  lastReadReplyId: number;
  errorMessage: string | null;
}

/** data/model/BusinessModels.kt */
export interface ChannelScheduledPost {
  id: number;
  channelId: number;
  authorId: number;
  text: string | null;
  mediaUrl: string | null;
  mediaType: string | null;
  scheduledAt: string;
  isPinned: number;
  status: string;
  authorName: string | null;
}

/** data/model/BusinessModels.kt */
export interface ChannelScheduledPostResponse {
  apiStatus: number;
  scheduledPost: ChannelScheduledPost | null;
  errorMessage: string | null;
}

/** data/model/BusinessModels.kt */
export interface ChannelScheduledPostsResponse {
  apiStatus: number;
  scheduledPosts: Array<ChannelScheduledPost>;
  errorMessage: string | null;
}

/** data/model/Channel.kt */
export interface ChannelSettings {
  allowComments: boolean;
  allowReactions: boolean;
  allowShares: boolean;
  showStatistics: boolean;
  showViewsCount: boolean;
  notifySubscribersNewPost: boolean;
  autoDeletePostsDays: number | null;
  signatureEnabled: boolean;
  commentsModeration: boolean;
  allowForwarding: boolean;
  slowModeSeconds: number | null;
  commentIdentity: string;
}

/** data/model/Channel.kt */
export interface ChannelStatistics {
  subscribersCount: number;
  newSubscribersToday: number;
  newSubscribersWeek: number;
  leftSubscribersWeek: number;
  growthRate: number;
  activeSubscribers24h: number;
  subscribersByDay: Array<number> | null;
  postsCount: number;
  postsToday: number;
  postsLastWeek: number;
  postsThisMonth: number;
  viewsTotal: number;
  viewsLastWeek: number;
  avgViewsPerPost: number;
  viewsByDay: Array<number> | null;
  reactionsTotal: number;
  commentsTotal: number;
  engagementRate: number;
  mediaPostsCount: number;
  textPostsCount: number;
  peakHours: Array<number> | null;
  hourlyViews: Array<number> | null;
  hourlyActivityUtc: Array<number> | null;
  activitySource: string | null;
  topPosts: Array<TopPostStatistic> | null;
}

/** data/model/Channel.kt */
export interface ChannelStatisticsResponse {
  apiStatus: number;
  statistics: ChannelStatistics | null;
  errorCode: number | null;
  errorMessage: string | null;
}

/** data/model/Story.kt */
export interface ChannelStoryData {
  groupId: number;
  groupName: string;
  avatar: string | null;
  ownerId: number;
}

/** data/model/Channel.kt */
export interface ChannelSubGroupItem {
  id: number;
  name: string;
  avatar: string | null;
  description: string | null;
  membersCount: number;
  isMember: boolean;
  createdTime: string | null;
}

/** data/model/Channel.kt */
export interface ChannelSubscriber {
  id: number | null;
  userId: number | null;
  username: string | null;
  name: string | null;
  avatarUrl: string | null;
  subscribedTime: number | null;
  isMuted: boolean;
  isBanned: boolean;
  role: string | null;
  lastSeen: string | null;
}

/** data/model/Channel.kt */
export interface ChannelSubscribersResponse {
  apiStatus: number;
  subscribers: Array<ChannelSubscriber> | null;
  totalCount: number | null;
  errorCode: number | null;
  errorMessage: string | null;
}

/** data/model/Group.kt */
export interface Chat {
  id: number;
  userId: number;
  username: string | null;
  avatarUrl: string | null;
  lastMessage: Message | null;
  unreadCount: number;
  chatType: string | null;
  isGroup: boolean;
  isPrivate: boolean;
  description: string | null;
  membersCount: number;
  isAdmin: boolean;
  isMuted: boolean;
  pinnedMessageId: number | null;
  lastActivity: number | null;
  isOnline: boolean;
  isBot: boolean;
  botDescription: string | null;
  isPro: number;
}

/** data/model/Group.kt */
export interface ChatListResponse {
  _apiStatus: any | null;
  chats: Array<Chat> | null;
  totalCount: number | null;
  errorCode: number | null;
  errorMessage: string | null;
  errors: ErrorsObject | null;
}

/** data/local/entity/ChatWallpaper.kt */
export interface ChatWallpaper {
  chatId: number;
  ownerId: number;
  chatType: string;
  backgroundImageUri: string | null;
  presetBackgroundId: string | null;
  updatedAt: number;
}

/** data/model/BlockedUser.kt */
export interface CheckBlockStatusResponse {
  apiStatus: number;
  isBlocked: boolean;
  blockedByMe: boolean;
  blockedMe: boolean;
  canMessage: boolean;
  canCall: boolean;
  errorCode: number | null;
  errorMessage: string | null;
}

/** data/model/CloudBackupSettings.kt */
export interface CloudBackupSettings {
  mobilePhotos: boolean;
  mobileVideos: boolean;
  mobileVideosLimit: number;
  mobileFiles: boolean;
  mobileFilesLimit: number;
  wifiPhotos: boolean;
  wifiVideos: boolean;
  wifiVideosLimit: number;
  wifiFiles: boolean;
  wifiFilesLimit: number;
  roamingPhotos: boolean;
  saveToGalleryPrivateChats: boolean;
  saveToGalleryGroups: boolean;
  saveToGalleryChannels: boolean;
  streamingEnabled: boolean;
  callDataSaver: boolean;
  cacheSizeLimit: number;
  cacheTimeLimit: number;
  backupEnabled: boolean;
  backupProvider: BackupProvider;
  autoBackupOnLogin: boolean;
  backupFrequency: BackupFrequency;
  lastBackupTime: number | null;
  compressPhotos: boolean;
  compressVideos: boolean;
  proxyEnabled: boolean;
  proxyType: string;
  proxyHost: string | null;
  proxyPort: number | null;
}

/** data/model/CloudBackupSettings.kt */
export interface CloudBackupSettingsResponse {
  apiStatus: number;
  settings: CloudBackupSettings;
  errors: Record<string, string> | null;
}

/** data/model/Channel.kt */
export interface CommentReaction {
  emoji: string;
  count: number;
  userReacted: boolean;
}

/** network/NetworkQualityMonitor.kt */
export interface ConnectionState {
  quality: ConnectionQuality;
  mediaLoadMode: MediaLoadMode;
  latencyMs: number;
  isMetered: boolean;
  bandwidthKbps: number;
}

/** data/model/Contact.kt */
export interface Contact {
  id: string;
  name: string;
  phoneNumber: string | null;
  email: string | null;
  photoUri: any | null;
  organization: string | null;
}

/** data/model/Bot.kt */
export interface CreateBotResponse {
  apiStatus: number;
  bot: Bot | null;
  message: string | null;
  errorCode: number | null;
  errorMessage: string | null;
}

/** data/model/BusinessModels.kt */
export interface CreateBusinessLinkRequest {
  title: string;
  prefilledText: string | null;
}

/** ui/channels/ChannelPremiumViewModel.kt */
export interface CreateChannelPaymentResponse {
  api_status: number;
  provider: string | null;
  invoice_url: string | null;
  data: string | null;
  signature: string | null;
  checkout_url: string | null;
  order_id: string | null;
  amount_uah: number | null;
  error_message: string | null;
}

/** data/model/Channel.kt */
export interface CreateChannelPostRequest {
  channelId: number;
  text: string;
  media: Array<PostMedia> | null;
  disableComments: boolean;
  notifySubscribers: boolean;
}

/** data/model/Channel.kt */
export interface CreateChannelRequest {
  name: string;
  username: string | null;
  description: string | null;
  avatarUrl: string | null;
  isPrivate: boolean;
  category: string | null;
}

/** data/model/Channel.kt */
export interface CreateChannelResponse {
  apiStatus: number;
  channelId: number | null;
  channel: Channel | null;
  errorCode: number | null;
  errorMessage: string | null;
}

/** data/model/Group.kt */
export interface CreateGroupRequest {
  name: string;
  description: string | null;
  avatarUrl: string | null;
  isPrivate: boolean;
  memberIds: Array<number>;
}

/** data/model/Group.kt */
export interface CreateGroupResponse {
  apiStatus: number;
  groupId: number | null;
  group: Group | null;
  errorCode: number | null;
  errorMessage: string | null;
}

/** data/model/Channel.kt */
export interface CreatePostResponse {
  apiStatus: number;
  postId: number | null;
  post: ChannelPost | null;
  errorCode: number | null;
  errorMessage: string | null;
  scheduled: boolean;
  publishAt: number | null;
}

/** data/model/BusinessModels.kt */
export interface CreateQuickReplyRequest {
  shortcut: string;
  text: string;
  mediaUrl: string | null;
}

/** data/model/BusinessModels.kt */
export interface CreateScheduledPostRequest {
  text: string | null;
  mediaUrl: string | null;
  mediaType: string | null;
  scheduledAt: string;
  isPinned: boolean;
}

/** data/model/Story.kt */
export interface CreateStoryCommentResponse {
  apiStatus: number;
  comment: StoryComment | null;
  errorCode: number | null;
  errorMessage: string | null;
}

/** data/model/Story.kt */
export interface CreateStoryResponse {
  apiStatus: number;
  storyId: number | null;
  errorCode: number | null;
  errorMessage: string | null;
}

/** network/NodeStarsApi.kt */
export interface CreatorEarningsResponse {
  apiStatus: number;
  totalEarned: number;
  totalSales: number;
  recentSales: Array<CreatorSaleItem>;
  byPack: Array<CreatorPackStat>;
  errorMessage: string | null;
}

/** network/NodeStarsApi.kt */
export interface CreatorPackStat {
  pack: string;
  earned: number;
  sales: number;
}

/** network/NodeStarsApi.kt */
export interface CreatorSaleItem {
  id: number;
  amount: number;
  pack: string;
  buyerName: string;
  buyerAvatar: string;
  createdAt: string;
}

/** data/model/CustomEmoji.kt */
export interface CustomEmoji {
  id: number;
  code: string;
  url: string;
  packId: number;
  name: string | null;
  keywords: Array<string> | null;
  createdAt: string | null;
}

/** network/NodeApi.kt */
export interface DeleteAccountResponse {
  apiStatus: number;
  message: string | null;
  errorMessage: string | null;
  purgeAt: number | null;
  gracePeriodDays: number | null;
}

/** data/model/Story.kt */
export interface DeleteStoryCommentResponse {
  apiStatus: number;
  message: string | null;
  errorCode: number | null;
  errorMessage: string | null;
}

/** data/model/Story.kt */
export interface DeleteStoryResponse {
  apiStatus: number;
  message: string | null;
  errorCode: number | null;
  errorMessage: string | null;
}

/** utils/signal/SignalModels.kt */
export interface DeviceBundleJson {
  deviceId: string;
  identityKey: string | null;
  identitySigningKey: string | null;
  signedPreKeyId: number | null;
  signedPreKey: string | null;
  signedPreKeySig: string | null;
  oneTimePreKeyId: number | null;
  oneTimePreKey: string | null;
}

/** utils/signal/SignalModels.kt */
export interface DeviceIdentityJson {
  deviceId: string;
  identityKey: string | null;
}

/** data/model/Channel.kt */
export interface DiscussionGroupInfo {
  id: number;
  name: string;
  avatar: string | null;
  memberCount: number;
}

/** network/NodeChannelApi.kt */
export interface DiscussionGroupResponse {
  apiStatus: number;
  discussionGroup: DiscussionGroupInfo | null;
  errorMessage: string | null;
}

/** data/local/entity/Draft.kt */
export interface Draft {
  chatId: number;
  ownerId: number;
  text: string;
  chatType: string;
  updatedAt: number;
  replyToMessageId: number | null;
}

/** data/model/CustomEmoji.kt */
export interface EmojiPack {
  id: number;
  name: string;
  description: string | null;
  iconUrl: string | null;
  author: string | null;
  emojis: Array<CustomEmoji> | null;
  isActive: boolean;
  createdAt: string | null;
  updatedAt: string | null;
}

/** data/model/CustomEmoji.kt */
export interface EmojiPackDetailResponse {
  apiStatus: number;
  pack: EmojiPack | null;
  emojis: Array<CustomEmoji> | null;
  errorCode: number | null;
  errorMessage: string | null;
}

/** data/model/CustomEmoji.kt */
export interface EmojiPacksResponse {
  apiStatus: number;
  packs: Array<EmojiPack> | null;
  errorCode: number | null;
  errorMessage: string | null;
}

/** network/MediaUploader.kt */
export interface Error {
  message: string;
  exception: any | null;
}

/** data/model/Group.kt */
export interface ErrorsObject {
  errorId: number | null;
  errorText: string | null;
}

/** data/model/BackupModels.kt */
export interface ExportDataResponse {
  apiStatus: number;
  message: string;
  errorMessage: string | null;
  backupFile: string;
  backupUrl: string;
  backupSize: number;
  exportData: UserBackup;
}

/** data/model/FluentEmojiEntry.kt */
export interface FluentEmojiEntry {
  glyph: string;
  codepoint: string;
  file: string;
  name: string | null;
  keywords: Array<string>;
  category: string | null;
  categoryFolder: string | null;
  hasNotoAnimated: boolean;
}

/** network/NodeApi.kt */
export interface FolderChatItem {
  chatType: string;
  chatId: number;
  addedAt: number;
}

/** data/model/BlockedUser.kt */
export interface GetBlockedUsersResponse {
  apiStatus: number;
  blockedUsers: Array<BlockedUser>;
  totalBlocked: number;
  errorCode: number | null;
  errorMessage: string | null;
}

/** data/model/CallHistory.kt */
export interface GetCallHistoryResponse {
  apiStatusRaw: any | null;
  calls: Array<CallHistoryItem> | null;
  total: number;
  offset: number;
  limit: number;
  errorMessage: string | null;
}

/** data/model/Story.kt */
export interface GetStoriesResponse {
  apiStatus: number;
  stories: Array<Story> | null;
  errorCode: number | null;
  errorMessage: string | null;
}

/** data/model/Story.kt */
export interface GetStoryAnalyticsResponse {
  apiStatus: number;
  storyId: number | null;
  uniqueViews: number;
  totalReactions: number;
  reactions: StoryReactions | null;
  totalComments: number;
  engagementRate: number;
  postedAt: number;
  expiresAt: number;
  errorCode: number | null;
  errorMessage: string | null;
}

/** data/model/Story.kt */
export interface GetStoryByIdResponse {
  apiStatus: number;
  story: Story | null;
  errorCode: number | null;
  errorMessage: string | null;
}

/** data/model/Story.kt */
export interface GetStoryCommentsResponse {
  apiStatus: number;
  comments: Array<StoryComment> | null;
  total: number;
  errorCode: number | null;
  errorMessage: string | null;
}

/** data/model/Story.kt */
export interface GetStoryViewsResponse {
  apiStatus: number;
  users: Array<StoryViewer> | null;
  errorCode: number | null;
  errorMessage: string | null;
}

/** data/model/User.kt */
export interface GetUserDataResponse {
  apiStatus: number;
  userData: User | null;
  errorCode: number | null;
  errorMessage: string | null;
}

/** network/NodeProfileApi.kt */
export interface GetUserMediaResponse {
  apiStatus: number;
  media: Array<UserMediaItem> | null;
  count: number | null;
  errorMessage: string | null;
}

/** data/model/UserRating.kt */
export interface GetUserRatingResponse {
  apiStatus: number;
  rating: UserRating | null;
  ratingsList: Array<RatingDetail> | null;
  ratingsCount: number | null;
  errorMessage: string | null;
}

/** data/repository/GiphyRepository.kt */
export interface GifItem {
  id: string;
  title: string;
  url: string;
  previewUrl: string;
  downsizedUrl: string;
  downsizedMediumUrl: string;
  downsizedLargeUrl: string;
  fixedWidthUrl: string;
  fixedHeightUrl: string;
  width: number;
  height: number;
}

/** network/NodeSubscriptionApi.kt */
export interface GiftPlan {
  months: number;
  stars: number;
  label: string;
}

/** data/repository/GiphyRepository.kt */
export interface GifUrls {
  original: string;
  downsized: string;
  downsizedMedium: string;
  downsizedLarge: string;
  preview: string;
  fixedWidth: string;
  fixedHeight: string;
}

/** data/repository/GiphyRepository.kt */
export interface GiphyGif {
  id: string;
  title: string | null;
  images: GiphyImages;
}

/** data/repository/GiphyRepository.kt */
export interface GiphyImages {
  original: GiphyImageVariant;
  downsized: GiphyImageVariant;
  downsized_medium: GiphyImageVariant | null;
  downsized_large: GiphyImageVariant | null;
  preview_gif: GiphyImageVariant | null;
  fixed_width: GiphyImageVariant;
  fixed_height: GiphyImageVariant;
}

/** data/repository/GiphyRepository.kt */
export interface GiphyImageVariant {
  url: string;
  width: string;
  height: string;
}

/** data/repository/GiphyRepository.kt */
export interface GiphyRandomResponse {
  data: GiphyGif;
}

/** data/repository/GiphyRepository.kt */
export interface GiphyResponse {
  data: Array<GiphyGif>;
  pagination: Pagination__GiphyRepository | null;
}

/** data/model/Channel.kt */
export interface GiveawayResponse {
  apiStatus: number;
  winners: Array<GiveawayWinner> | null;
  totalParticipants: number;
  periodDays: number;
  errorMessage: string | null;
}

/** data/model/Channel.kt */
export interface GiveawayWinner {
  place: number;
  userId: number;
  username: string | null;
  name: string | null;
  avatarUrl: string | null;
}

/** network/NodeApi.kt */
export interface GlobalSearchResult {
  id: number;
  chatType: string;
  chatId: number;
  fromId: number;
  groupId: number;
  textPreview: string;
  time: number;
  hasMedia: boolean;
  hasSticker: boolean;
}

/** data/model/Group.kt */
export interface Group {
  id: number;
  name: string;
  avatarUrl: string;
  description: string | null;
  membersCount: number;
  adminId: number;
  adminName: string;
  isPrivate: boolean;
  isAdmin: boolean;
  isModerator: boolean;
  isMember: boolean;
  isMuted: boolean;
  unreadCount: number;
  createdTime: number;
  updatedTime: number | null;
  members: Array<GroupMember> | null;
  pinnedMessageId: number | null;
  pinnedMessage: Message | null;
  pinnedMessages: Array<Message> | null;
  settings: GroupSettings | null;
}

/** data/model/Group.kt */
export interface GroupAdminLogsResponse {
  apiStatus: number;
  logs: Array<AdminLogDto> | null;
  total: number;
  page: number;
  errorMessage: string | null;
}

/** data/model/Group.kt */
export interface GroupAnonAdminResponse {
  apiStatus: number;
  anonymous: boolean;
  message: string | null;
  errorMessage: string | null;
}

/** data/model/Group.kt */
export interface GroupAvatarResponse {
  apiStatus: number;
  url: string | null;
  group: Group | null;
  errorMessage: string | null;
}

/** network/SharedApiModels.kt */
export interface GroupCustomizationData {
  groupId: number;
  bubbleStyle: string;
  presetBackground: string;
  accentColor: string;
  enabledByAdmin: boolean;
  updatedAt: number;
  updatedBy: number;
}

/** network/SharedApiModels.kt */
export interface GroupCustomizationResponse {
  apiStatus: number;
  customization: GroupCustomizationData | null;
  message: string | null;
  errorMessage: string | null;
}

/** data/model/Group.kt */
export interface GroupDetailResponse {
  _apiStatus: any | null;
  group: Group | null;
  members: Array<GroupMember> | null;
  errorCode: number | null;
  errorMessage: string | null;
}

/** network/NodeGroupApi.kt */
export interface GroupE2EEKeyResponse {
  apiStatus: number;
  keyB64: string | null;
  errorMessage: string | null;
}

/** network/NodeGroupApi.kt */
export interface GroupGiveawayResponse {
  apiStatus: number;
  winners: Array<GroupGiveawayWinner> | null;
  totalParticipants: number;
  periodDays: number;
  errorMessage: string | null;
}

/** network/NodeGroupApi.kt */
export interface GroupGiveawayWinner {
  place: number;
  userId: number;
  username: string | null;
  name: string | null;
  avatarUrl: string | null;
}

/** data/model/Group.kt */
export interface GroupJoinRequest {
  id: number;
  groupId: number;
  userId: number;
  username: string;
  userAvatar: string | null;
  message: string | null;
  status: string;
  createdTime: number;
  reviewedBy: number | null;
  reviewedTime: number | null;
}

/** data/model/Group.kt */
export interface GroupJoinRequestsResponse {
  apiStatus: number;
  requests: Array<GroupJoinRequest> | null;
  errorMessage: string | null;
}

/** data/model/Group.kt */
export interface GroupListResponse {
  _apiStatus: any | null;
  _groups: Array<Group> | null;
  _data: Array<Group> | null;
  totalCount: number | null;
  errorCode: number | null;
  errorMessage: string | null;
}

/** data/model/Group.kt */
export interface GroupMember {
  userId: number;
  username: string;
  avatarUrl: string;
  role: string;
  joinedTime: number;
  isMuted: boolean;
  isBlocked: boolean;
  permissions: Array<string> | null;
}

/** data/model/Group.kt */
export interface GroupMemberPermissions {
  canSendMessages: boolean;
  canSendMedia: boolean;
  canSendStickers: boolean;
  canSendGifs: boolean;
  canSendLinks: boolean;
  canSendPolls: boolean;
  canAddMembers: boolean;
  canPinMessages: boolean;
  canDeleteMessages: boolean;
  canEditGroupInfo: boolean;
  canManageSubgroups: boolean;
  isMutedUntil: number | null;
}

/** data/model/Group.kt */
export interface GroupMembersResponse {
  apiStatus: number;
  members: Array<GroupMember> | null;
  errorMessage: string | null;
}

/** data/model/Group.kt */
export interface GroupMessageListResponse {
  apiStatus: number;
  messages: Array<Message> | null;
  pinnedMessage: Message | null;
  count: number | null;
  errorMessage: string | null;
}

/** data/model/Group.kt */
export interface GroupMessageResponse {
  apiStatus: number;
  messageData: Message | null;
  messageId: number | null;
  errorMessage: string | null;
}

/** data/model/Group.kt */
export interface GroupPollData {
  id: number;
  question: string;
  pollType: string;
  isAnonymous: boolean;
  allowsMultipleAnswers: boolean;
  isClosed: boolean;
  totalVotes: number;
  createdBy: number;
  options: Array<GroupPollOption>;
}

/** data/model/Group.kt */
export interface GroupPollOption {
  id: number;
  text: string;
  voteCount: number;
  percent: number;
  isVoted: boolean;
}

/** data/model/Group.kt */
export interface GroupPollResponse {
  apiStatus: number;
  poll: GroupPollData | null;
  errorMessage: string | null;
}

/** data/model/Group.kt */
export interface GroupPreview {
  id: number;
  name: string;
  avatar: string;
  membersCount: number;
  isPrivate: boolean;
  isMember: boolean;
}

/** data/model/Group.kt */
export interface GroupPreviewResponse {
  apiStatus: number;
  group: GroupPreview | null;
  errorCode: number | null;
  errorMessage: string | null;
}

/** data/model/Group.kt */
export interface GroupQrResponse {
  apiStatus: number;
  inviteCode: string | null;
  joinUrl: string | null;
  errorMessage: string | null;
}

/** data/model/Group.kt */
export interface GroupSettings {
  allowMembersInvite: boolean;
  allowMembersPin: boolean;
  allowMembersDeleteMessages: boolean;
  allowVoiceCalls: boolean;
  allowVideoCalls: boolean;
  slowModeSeconds: number;
  historyVisibleForNewMembers: boolean;
  historyMessagesCount: number;
  allowMembersSendMedia: boolean;
  allowMembersSendStickers: boolean;
  allowMembersSendGifs: boolean;
  allowMembersSendLinks: boolean;
  allowMembersSendPolls: boolean;
  antiSpamEnabled: boolean;
  maxMessagesPerMinute: number;
  autoMuteSpammers: boolean;
  blockNewUsersMedia: boolean;
  newUserRestrictionHours: number;
}

/** data/model/Group.kt */
export interface GroupSimpleResponse {
  apiStatus: number;
  message: string | null;
  errorMessage: string | null;
}

/** data/model/Group.kt */
export interface GroupStatistics {
  groupId: number;
  membersCount: number;
  messagesCount: number;
  messagesToday: number;
  messagesThisWeek: number;
  messagesThisMonth: number;
  activeMembers24h: number;
  activeMembersWeek: number;
  mediaCount: number;
  linksCount: number;
  newMembersToday: number;
  newMembersWeek: number;
  leftMembersWeek: number;
  topContributors: Array<TopContributor> | null;
  peakHours: Array<number> | null;
  growthRate: number;
}

/** data/model/Group.kt */
export interface GroupStatisticsData {
  membersCount: number;
  messagesCount: number;
  messagesLastWeek: number;
  activeMembers24h: number;
  topSenders: Array<TopContributor> | null;
}

/** data/model/Group.kt */
export interface GroupStatisticsResponse {
  apiStatus: number;
  statistics: GroupStatisticsData | null;
  errorMessage: string | null;
}

/** data/model/Group.kt */
export interface GroupTopicData {
  id: number;
  name: string;
  description: string | null;
  color: string;
  icon: string | null;
  isPrivate: boolean;
  createdAt: number;
  createdBy: number;
  isPinned: boolean;
  isArchived: boolean;
  messageCount: number;
  moderators: Array<number>;
}

/** data/model/Group.kt */
export interface GroupTopicResponse {
  apiStatus: number;
  topic: GroupTopicData | null;
  errorMessage: string | null;
}

/** data/model/Group.kt */
export interface GroupTopicsResponse {
  apiStatus: number;
  topics: Array<GroupTopicData> | null;
  errorMessage: string | null;
}

/** data/model/UserPresenceStatus.kt */
export interface GroupTyping {
  names: Array<string>;
}

/** data/model/BackupModels.kt */
export interface ImportDataResponse {
  apiStatus: number;
  message: string;
  imported: ImportStats;
}

/** data/model/BackupModels.kt */
export interface ImportStats {
  messages: number;
  groups: number;
  channels: number;
  settings: boolean;
}

/** data/model/Channel.kt */
export interface InlinePostButton {
  text: string;
  url: string | null;
  callback: string | null;
}

/** network/NodeBotInlineApi.kt */
export interface InlineQueryResultDto {
  id: string;
  type: string;
  title: string;
  description: string;
  thumbUrl: string | null;
  inputMessageContent: InputMessageContentDto | null;
  url: string | null;
  hideUrl: boolean;
}

/** network/NodeBotInlineApi.kt */
export interface InlineResultsResponse {
  apiStatus: number;
  results: Array<InlineQueryResultDto> | null;
  nextOffset: string | null;
  switchPmText: string | null;
  switchPmParameter: string | null;
  errorMessage: string | null;
}

/** network/NodeBotInlineApi.kt */
export interface InputMessageContentDto {
  messageText: string | null;
  parseMode: string | null;
}

/** data/model/Group.kt */
export interface InvitationLink {
  id: number;
  groupId: number | null;
  channelId: number | null;
  link: string;
  createdBy: number;
  createdTime: number;
  expiresTime: number | null;
  maxUses: number | null;
  usesCount: number;
  isRevoked: boolean;
  requiresApproval: boolean;
}

/** network/NodeApi.kt */
export interface KeyBackupDownloadResponse {
  apiStatus: number;
  backup: KeyBackupPayload | null;
}

/** network/NodeApi.kt */
export interface KeyBackupPayload {
  encryptedPayload: string;
  salt: string;
  iv: string;
  updatedAt: number;
}

/** data/model/UserPresenceStatus.kt */
export interface LastSeen {
  timestamp: number;
}

/** data/model/User.kt */
export interface LinkPreviewData {
  url: string;
  title: string;
  description: string;
  image: string;
  hostname: string;
}

/** network/NodeApi.kt */
export interface LinkPreviewData__NodeApi {
  url: string;
  title: string | null;
  description: string | null;
  image: string | null;
  siteName: string | null;
}

/** data/model/User.kt */
export interface LinkPreviewResponse {
  apiStatus: number;
  url: string | null;
  title: string | null;
  description: string | null;
  image: string | null;
  hostname: string | null;
  errorMessage: string | null;
}

/** network/NodeApi.kt */
export interface LinkPreviewResponse__NodeApi {
  apiStatus: number;
  url: string;
  title: string | null;
  description: string | null;
  image: string | null;
  siteName: string | null;
  errorMessage: string | null;
}

/** data/model/BackupModels.kt */
export interface ListBackupsResponse {
  apiStatus: number;
  backups: Array<BackupFileInfo>;
  totalBackups: number;
}

/** network/LiveKitStreamManager.kt */
export interface LiveKitQuality {
  key: string;
  label: string;
  width: number;
  height: number;
  fps: number;
  defaultBitrateKbps: number;
  premium: boolean;
}

/** data/model/Channel.kt */
export interface LivestreamActiveInfo {
  streamId: number | null;
  roomName: string | null;
  title: string | null;
  description: string | null;
  quality: string | null;
  category: string | null;
  tags: string | null;
  viewerCount: number;
  hostUserId: number | null;
  hostName: string | null;
  hostAvatar: string | null;
  startedAt: string | null;
}

/** data/model/Channel.kt */
export interface LivestreamActiveResponse {
  apiStatus: number;
  active: boolean;
  stream: LivestreamActiveInfo | null;
}

/** data/model/Channel.kt */
export interface LivestreamJoinResponse {
  apiStatus: number;
  streamId: number | null;
  roomName: string | null;
  quality: string | null;
  livekitUrl: string | null;
  token: string | null;
  identity: string | null;
  hostUserId: number | null;
  title: string | null;
  description: string | null;
  category: string | null;
  hostName: string | null;
  hostAvatar: string | null;
  socialLinks: Array<StreamSocialLink> | null;
  isAdult: boolean;
  chatMode: string | null;
  following: boolean;
  followerCount: number;
  isHost: boolean;
  viewerCount: number;
  errorMessage: string | null;
}

/** data/model/Channel.kt */
export interface LivestreamSimpleResponse {
  apiStatus: number;
  errorMessage: string | null;
}

/** data/model/Channel.kt */
export interface LivestreamStartResponse {
  apiStatus: number;
  streamId: number | null;
  roomName: string | null;
  quality: string | null;
  isPremium: boolean;
  livekitUrl: string | null;
  token: string | null;
  identity: string | null;
  allowedQualities: Array<string> | null;
  targetBitrate: number | null;
  recording: boolean;
  reconnected: boolean | null;
  errorMessage: string | null;
}

/** data/model/Channel.kt */
export interface LivestreamTokenRefreshResponse {
  apiStatus: number;
  token: string | null;
  roomName: string | null;
  livekitUrl: string | null;
}

/** data/repository/LocationRepository.kt */
export interface LocationData {
  latLng: any;
  address: string;
  timestamp: number;
}

/** network/NodeApi.kt */
export interface LoginVerificationResendResponse {
  apiStatus: number;
  emailMasked: string | null;
  phoneMasked: string | null;
  message: string | null;
  errorId: string | null;
  errorMessage: string | null;
}

/** network/NodeApi.kt */
export interface LoginVerificationStatusResponse {
  apiStatus: number;
  status: string | null;
  errorMessage: string | null;
}

/** data/model/StrapiModels.kt */
export interface MediaAttributes {
  url: string;
  name: string | null;
  width: number | null;
  height: number | null;
  size: number | null;
  mime: string | null;
}

/** data/model/MediaAutoDeleteSettings.kt */
export interface MediaAutoDeleteSettingResponse {
  apiStatus: number;
  seconds: number;
  chatId: number;
  errorMessage: string | null;
}

/** data/model/Group.kt */
export interface MediaFile {
  id: string;
  url: string;
  type: string;
  mimeType: string;
  size: number;
  duration: number | null;
  width: number | null;
  height: number | null;
  thumbnail: string | null;
  createdTime: number;
}

/** data/model/StrapiModels.kt */
export interface MediaItem {
  id: number;
  attributes: MediaAttributes;
}

/** network/MediaLoadingManager.kt */
export interface MediaLoadProgress {
  messageId: number;
  state: LoadingState;
  progress: number;
  thumbnailPath: string | null;
  fullMediaPath: string | null;
  error: string | null;
}

/** data/model/Group.kt */
export interface MediaUploadResponse {
  apiStatus: number;
  mediaId: string | null;
  url: string | null;
  thumbnail: string | null;
  width: number | null;
  height: number | null;
  duration: number | null;
  size: number | null;
  errorCode: number | null;
  errorMessage: string | null;
}

/** data/model/StrapiModels.kt */
export interface MediaWrapper {
  data: Array<MediaItem> | null;
}

/** ui/channels/ChannelMemberSubscriptionViewModel.kt */
export interface MemberSubPlanInfo {
  months: number;
  price_stars: number | null;
  price_uah: number | null;
}

/** ui/channels/ChannelMemberSubscriptionViewModel.kt */
export interface MemberSubPlansInfo {
  monthly: MemberSubPlanInfo | null;
  quarterly: MemberSubPlanInfo | null;
  annual: MemberSubPlanInfo | null;
}

/** ui/channels/ChannelMemberSubscriptionViewModel.kt */
export interface MemberSubPricingResponse {
  api_status: number;
  enabled: boolean;
  base_price_stars: number | null;
  base_price_uah: number | null;
  error_message: string | null;
}

/** ui/channels/ChannelMemberSubscriptionViewModel.kt */
export interface MemberSubStatus {
  api_status: number;
  enabled: boolean;
  base_price_stars: number | null;
  base_price_uah: number | null;
  plans: MemberSubPlansInfo | null;
  my_subscription: MySubscriptionInfo | null;
  has_access: boolean;
  error_message: string | null;
}

/** ui/channels/ChannelMemberSubscriptionViewModel.kt */
export interface MemberSubSubscribeResponse {
  api_status: number;
  new_balance: number | null;
  stars_paid: number | null;
  expires_at: string | null;
  provider: string | null;
  invoice_url: string | null;
  checkout_url: string | null;
  data: string | null;
  signature: string | null;
  order_id: string | null;
  amount_uah: number | null;
  error_message: string | null;
}

/** data/model/Group.kt */
export interface Message {
  id: number;
  fromId: number;
  toId: number;
  groupId: number | null;
  encryptedText: string | null;
  timeStamp: number;
  mediaUrl: string | null;
  mediaFileName: string | null;
  type: string | null;
  mediaType: string | null;
  mediaDuration: number | null;
  mediaSize: number | null;
  senderName: string | null;
  senderAvatar: string | null;
  isEdited: boolean;
  editedTime: number | null;
  isDeleted: boolean;
  replyToId: number | null;
  replyToText: string | null;
  replyToName: string | null;
  isRead: boolean;
  readAt: number | null;
  iv: string | null;
  tag: string | null;
  cipherVersion: number | null;
  signalHeader: string | null;
  reactions: Array<MessageReaction> | null;
  typeTwo: string | null;
  stickers: string | null;
  albumId: number | null;
  lat: string | null;
  lng: string | null;
  contact: string | null;
  replyMarkup: BotReplyMarkup | null;
  botId: string | null;
  decryptedText: string | null;
  decryptedMediaUrl: string | null;
  isLocalPending: boolean;
}

/** data/model/MessageCountResponse.kt */
export interface MessageCountResponse {
  apiStatus: number;
  totalMessages: number;
  errorMessage: string | null;
}

/** data/model/Group.kt */
export interface MessageListResponse {
  _apiStatus: any | null;
  messages: Array<Message> | null;
  totalCount: number | null;
  errorCode: number | null;
  errorMessage: string | null;
}

/** data/model/MessageReaction.kt */
export interface MessageReaction {
  id: number | null;
  messageId: number;
  userId: number;
  reaction: string | null;
  createdAt: string | null;
}

/** data/model/StrapiModels.kt */
export interface Meta {
  pagination: Pagination;
}

/** network/NodeChannelApi.kt */
export interface ModActionResponse {
  apiStatus: number;
  errorCode: string | null;
  errorMessage: string | null;
  warningsCount: number;
  warnLimit: number;
  autoMuted: boolean;
  expireTime: number;
}

/** network/NodeChannelApi.kt */
export interface ModRestrictionItem {
  type: string;
  expireTime: number;
  reason: string | null;
}

/** network/NodeChannelApi.kt */
export interface ModUserStatusResponse {
  apiStatus: number;
  errorMessage: string | null;
  isProtected: boolean;
  restrictions: Array<ModRestrictionItem> | null;
  warnings: Array<ModWarningItem> | null;
  warningsRecent: number;
  warnLimit: number;
  warnWindowDays: number;
}

/** network/NodeChannelApi.kt */
export interface ModWarningItem {
  id: number;
  reason: string | null;
  createdAt: number;
}

/** data/model/Story.kt */
export interface MuteStoryResponse {
  apiStatus: number;
  message: string | null;
  errorCode: number | null;
  errorMessage: string | null;
}

/** data/model/UserRating.kt */
export interface MyRating {
  type: string | null;
  comment: string | null;
  createdAt: string | null;
}

/** ui/channels/ChannelMemberSubscriptionViewModel.kt */
export interface MySubscriptionInfo {
  is_active: boolean;
  plan: string | null;
  payment_method: string | null;
  auto_renew: boolean;
  started_at: string | null;
  expires_at: string | null;
}

/** ui/geo/GeoDiscoveryActivity.kt */
export interface NearbyUser {
  userId: number;
  username: string;
  displayName: string;
  avatar: string | null;
  distanceKm: number;
  lastSeen: string | null;
}

/** ui/geo/GeoDiscoveryActivity.kt */
export interface NearbyUsersResponse {
  apiStatus: number;
  users: Array<NearbyUser> | null;
  errorMessage: string | null;
}

/** network/NodeBlogApi.kt */
export interface NodeBlogCategoriesResponse {
  apiStatus: number;
  categories: Array<BlogCategory> | null;
  errorMessage: string | null;
}

/** network/NodeBlogApi.kt */
export interface NodeBlogPostDetailResponse {
  apiStatus: number;
  post: BlogPostDetail | null;
  errorMessage: string | null;
}

/** network/NodeBlogApi.kt */
export interface NodeBlogPostsResponse {
  apiStatus: number;
  posts: Array<BlogPost> | null;
  count: number | null;
  offset: number | null;
  errorMessage: string | null;
}

/** network/NodeApi.kt */
export interface NodeChatListResponse {
  apiStatus: number;
  data: Array<Chat> | null;
  errorMessage: string | null;
}

/** network/NodeApi.kt */
export interface NodeCountResponse {
  apiStatus: number;
  count: number;
  errorMessage: string | null;
}

/** network/NodeSubscriptionApi.kt */
export interface NodeCreatePaymentResponse {
  apiStatus: number;
  provider: string;
  paymentUrl: string;
  orderId: string;
  amountUah: number;
  months: number;
  errorMessage: string | null;
}

/** network/NodeApi.kt */
export interface NodeCustomStatusResponse {
  apiStatus: number;
  statusEmoji: string | null;
  statusText: string | null;
  errorMessage: string | null;
}

/** network/NodeApi.kt */
export interface NodeFolderItemResponse {
  apiStatus: number;
  folder: ServerFolder | null;
  errorMessage: string | null;
}

/** network/NodeApi.kt */
export interface NodeFolderListResponse {
  apiStatus: number;
  folders: Array<ServerFolder> | null;
  errorMessage: string | null;
}

/** network/NodeApi.kt */
export interface NodeFolderShareResponse {
  apiStatus: number;
  shareCode: string | null;
  shareUrl: string | null;
  errorMessage: string | null;
}

/** network/NodeProfileApi.kt */
export interface NodeFollowActionResponse {
  apiStatus: number;
  message: string | null;
  status: string | null;
  errorMessage: string | null;
}

/** network/NodeProfileApi.kt */
export interface NodeFollowListResponse {
  apiStatus: number;
  followers: Array<User> | null;
  following: Array<User> | null;
  blocked: Array<BlockedUser> | null;
  count: number | null;
  errorMessage: string | null;
}

/** network/NodeApi.kt */
export interface NodeForwardResponse {
  apiStatus: number;
  forwardedIds: Array<number> | null;
  errorMessage: string | null;
}

/** network/NodeSubscriptionApi.kt */
export interface NodeGiftPriceResponse {
  apiStatus: number;
  starsPerMonth: number;
  trialDays: number;
  plans: Array<GiftPlan>;
  errorMessage: string | null;
}

/** network/NodeSubscriptionApi.kt */
export interface NodeGiftResponse {
  apiStatus: number;
  months: number;
  starsSpent: number;
  newBalance: number;
  recipientProTime: number;
  starsPerMonth: number;
  errorMessage: string | null;
}

/** network/NodeApi.kt */
export interface NodeGlobalSearchResponse {
  apiStatus: number;
  query: string;
  total: number;
  results: Array<GlobalSearchResult>;
  errorMessage: string | null;
}

/** network/NodeApi.kt */
export interface NodeInstantViewResponse {
  apiStatus: number;
  url: string | null;
  title: string | null;
  description: string | null;
  siteName: string | null;
  image: string | null;
  contentHtml: string | null;
  readingTimeMin: number;
  errorMessage: string | null;
}

/** network/NodeApi.kt */
export interface NodeLoginResponse {
  apiStatus: number;
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
  userId: number | null;
  username: string | null;
  avatar: string | null;
  errorId: string | null;
  errorMessage: string | null;
  verificationRequired: boolean | null;
  verificationId: string | null;
  deliveryChannel: string | null;
  emailMasked: string | null;
  phoneMasked: string | null;
  pendingDeletion: boolean | null;
  purgeAt: number | null;
  daysLeft: number | null;
}

/** network/NodeApi.kt */
export interface NodeMessageListResponse {
  apiStatus: number;
  messages: Array<Message> | null;
  count: number | null;
  errorMessage: string | null;
}

/** network/NodeApi.kt */
export interface NodeMessageResponse {
  apiStatus: number;
  messageData: Message | null;
  messageId: number | null;
  text: string | null;
  errorMessage: string | null;
}

/** network/NodeApi.kt */
export interface NodeMuteStatusResponse {
  apiStatus: number;
  notify: string | null;
  callChat: string | null;
  archive: string | null;
  pin: string | null;
  errorMessage: string | null;
}

/** network/NodeApi.kt */
export interface NodeNoteResponse {
  apiStatus: number;
  note: NoteItem | null;
  errorMessage: string | null;
}

/** network/NodeApi.kt */
export interface NodeNotesListResponse {
  apiStatus: number;
  notes: Array<NoteItem>;
  total: number;
  errorMessage: string | null;
}

/** network/NodeApi.kt */
export interface NodeNotesStorageResponse {
  apiStatus: number;
  usedBytes: number;
  quotaBytes: number;
  errorMessage: string | null;
}

/** network/NodePacksApi.kt */
export interface NodePackItem {
  url: string;
  emoji: string | null;
}

/** network/NodePacksApi.kt */
export interface NodePackResponse {
  apiStatus: number;
  pack: NodePackSummary | null;
}

/** network/NodePacksApi.kt */
export interface NodePacksResponse {
  apiStatus: number;
  packs: Array<NodePackSummary>;
  total: number;
}

/** network/NodePacksApi.kt */
export interface NodePackSummary {
  slug: string;
  title: string;
  type: string;
  cover: string | null;
  itemCount: number;
  premium: boolean;
  starsPrice: number;
  owned: boolean;
  items: Array<NodePackItem>;
}

/** network/NodeApi.kt */
export interface NodePublicFontResponse {
  apiStatus: number;
  font: string | null;
  errorMessage: string | null;
}

/** network/NodeApi.kt */
export interface NodeReactResponse {
  apiStatus: number;
  action: string | null;
  reaction: string | null;
  errorMessage: string | null;
}

/** network/NodeRefundsApi.kt */
export interface NodeRefundDecision {
  eligible: boolean;
  refundType: string;
  refundAmount: number;
  adminFee: number;
  usagePercent: number;
  currency: string;
  decisionCode: string;
  message: string;
}

/** network/NodeRefundsApi.kt */
export interface NodeRefundEligibleResponse {
  apiStatus: number;
  items: Array<RefundEligibleItem>;
  errorMessage: string | null;
}

/** network/NodeRefundsApi.kt */
export interface NodeRefundListResponse {
  apiStatus: number;
  refunds: Array<RefundHistoryItem>;
  hasMore: boolean;
  errorMessage: string | null;
}

/** network/NodeRefundsApi.kt */
export interface NodeRefundPolicyResponse {
  apiStatus: number;
  policy: RefundPolicyDoc | null;
  errorMessage: string | null;
}

/** network/NodeRefundsApi.kt */
export interface NodeRefundPreviewResponse {
  apiStatus: number;
  decision: NodeRefundDecision;
  errorMessage: string | null;
}

/** network/NodeRefundsApi.kt */
export interface NodeRefundRequestResponse {
  apiStatus: number;
  refundId: number;
  status: string;
  eligible: boolean;
  refundType: string;
  refundAmount: number;
  adminFee: number;
  currency: string;
  usagePercent: number;
  message: string;
  errorMessage: string | null;
}

/** network/NodeApi.kt */
export interface NodeSavedListResponse {
  apiStatus: number;
  saved: Array<ServerSavedItem> | null;
  total: number;
  errorMessage: string | null;
}

/** network/NodeApi.kt */
export interface NodeSavedMessageResponse {
  apiStatus: number;
  saved: ServerSavedItem | null;
  created: boolean | null;
  errorMessage: string | null;
}

/** network/NodeApi.kt */
export interface NodeScheduledItemResponse {
  apiStatus: number;
  scheduled: ScheduledMessageItem | null;
  errorMessage: string | null;
}

/** network/NodeApi.kt */
export interface NodeScheduledListResponse {
  apiStatus: number;
  scheduled: Array<ScheduledMessageItem> | null;
  errorMessage: string | null;
}

/** network/NodeProfileApi.kt */
export interface NodeSearchUsersResponse {
  apiStatus: number;
  users: Array<SearchUser> | null;
  count: number | null;
  offset: number | null;
  errorMessage: string | null;
}

/** network/NodeApi.kt */
export interface NodeSessionItem {
  id: number;
  platform: string;
  deviceName: string | null;
  ip: string | null;
  time: number;
  isCurrent: boolean;
}

/** network/NodeApi.kt */
export interface NodeSessionsResponse {
  apiStatus: number;
  sessions: Array<NodeSessionItem>;
  errorMessage: string | null;
}

/** network/NodeApi.kt */
export interface NodeSimpleResponse {
  apiStatus: number;
  message: string | null;
  errorMessage: string | null;
}

/** network/NodeSubscriptionApi.kt */
export interface NodeSubscriptionStatusResponse {
  apiStatus: number;
  isPro: number;
  proType: number;
  proTime: number;
  daysLeft: number;
  errorMessage: string | null;
}

/** network/NodeApi.kt */
export interface NodeThemeProfileData {
  themeKey: string;
  bubbleStyle: string | null;
  backgroundId: string | null;
  font: string | null;
  updatedAt: number | null;
}

/** network/NodeApi.kt */
export interface NodeThemeProfileResponse {
  apiStatus: number;
  profile: NodeThemeProfileData | null;
  errorMessage: string | null;
}

/** network/NodeApi.kt */
export interface NodeThemeShareData {
  platform: string;
  themeKey: string;
  bubbleStyle: string | null;
  backgroundId: string | null;
  font: string | null;
}

/** network/NodeApi.kt */
export interface NodeThemeShareLookupResponse {
  apiStatus: number;
  profile: NodeThemeShareData | null;
  errorMessage: string | null;
}

/** network/NodeApi.kt */
export interface NodeThemeShareResponse {
  apiStatus: number;
  shareCode: string | null;
  errorMessage: string | null;
}

/** network/NodeApi.kt */
export interface NodeThreadBatchCountsResponse {
  apiStatus: number;
  counts: Record<string, number> | null;
  errorMessage: string | null;
}

/** network/NodeApi.kt */
export interface NodeThreadCountResponse {
  apiStatus: number;
  count: number;
  postId: number;
  errorMessage: string | null;
}

/** network/NodeApi.kt */
export interface NodeThreadListResponse {
  apiStatus: number;
  messages: Array<ThreadMessage> | null;
  total: number;
  offset: number;
  limit: number;
  errorMessage: string | null;
}

/** network/NodeApi.kt */
export interface NodeThreadMessageResponse {
  apiStatus: number;
  message: ThreadMessage | null;
  errorCode: string | null;
  errorMessage: string | null;
}

/** network/NodeTicketsApi.kt */
export interface NodeTicketCreateResponse {
  apiStatus: number;
  ticket: TicketRef | null;
  errorMessage: string | null;
}

/** network/NodeTicketsApi.kt */
export interface NodeTicketDetailResponse {
  apiStatus: number;
  ticket: TicketItem | null;
  messages: Array<TicketMessage>;
  errorMessage: string | null;
}

/** network/NodeTicketsApi.kt */
export interface NodeTicketListResponse {
  apiStatus: number;
  tickets: Array<TicketItem>;
  count: number;
  errorMessage: string | null;
}

/** network/NodeTicketsApi.kt */
export interface NodeTicketReplyResponse {
  apiStatus: number;
  errorMessage: string | null;
}

/** network/NodeSubscriptionApi.kt */
export interface NodeTrialResponse {
  apiStatus: number;
  alreadyUsed: boolean;
  trialDays: number;
  proTime: number;
  errorMessage: string | null;
}

/** network/NodeApi.kt */
export interface NodeUserSearchResponse {
  apiStatus: number;
  users: Array<UserSearchResult>;
  errorMessage: string | null;
}

/** network/NodeApi.kt */
export interface NodeUserStatusResponse {
  apiStatus: number;
  online: boolean;
  lastSeen: number;
  errorMessage: string | null;
}

/** network/NodeApi.kt */
export interface NoteItem {
  id: number;
  type: string;
  text: string | null;
  fileName: string | null;
  fileSize: number;
  mimeType: string | null;
  createdAt: number;
}

/** data/model/Channel.kt */
export interface ObsResponse {
  apiStatus: number;
  streamId: number | null;
  roomName: string | null;
  rtmpUrl: string | null;
  streamKey: string | null;
  errorMessage: string | null;
}

/** data/model/StrapiModels.kt */
export interface PackAttributes {
  namePack: string | null;
  type: string | null;
  slug: string | null;
  uploadGifs: MediaWrapper | null;
  cover: MediaWrapper | null;
  items: MediaWrapper | null;
  createdAt: string | null;
  updatedAt: string | null;
}

/** data/model/StrapiModels.kt */
export interface PackItem {
  id: number;
  attributes: PackAttributes;
}

/** data/model/StrapiModels.kt */
export interface Pagination {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
}

/** data/repository/GiphyRepository.kt */
export interface Pagination__GiphyRepository {
  total_count: number;
  count: number;
  offset: number;
}

/** network/SharedApiModels.kt */
export interface PasswordResetRequestResponse {
  apiStatus: number;
  message: string | null;
  errorMessage: string | null;
}

/** network/SharedApiModels.kt */
export interface PasswordResetResponse {
  apiStatus: number;
  message: string | null;
  errorMessage: string | null;
}

/** network/SharedApiModels.kt */
export interface Poll {
  id: number;
  question: string;
  pollType: string;
  isAnonymous: boolean;
  allowsMultipleAnswers: boolean;
  isClosed: boolean;
  totalVotes: number;
  createdBy: number;
  options: Array<PollOption>;
}

/** network/SharedApiModels.kt */
export interface PollOption {
  id: number;
  text: string;
  voteCount: number;
  percent: number;
  isVoted: boolean;
}

/** network/SharedApiModels.kt */
export interface PollResponse {
  apiStatus: number;
  poll: Poll | null;
  errorMessage: string | null;
}

/** network/NodeChannelApi.kt */
export interface PostAccessResponse {
  apiStatus: number;
  alreadyOwned: boolean;
  newBalance: number;
  starsPaid: number;
  errorMessage: string | null;
  errorCode: string | null;
}

/** network/NodeChannelApi.kt */
export interface PostAnalyticsResponse {
  apiStatus: number;
  postId: number;
  views: number;
  reactionsCount: number;
  commentsCount: number;
  subscribersCount: number;
  engagementRate: number;
  reachPct: number;
  publishedAt: number;
  errorMessage: string | null;
}

/** data/model/Channel.kt */
export interface PostGiveawayRef {
  id: number;
  prize: string | null;
  result: boolean;
}

/** data/model/Channel.kt */
export interface PostMedia {
  url: string;
  type: string;
  filename: string | null;
}

/** data/model/Channel.kt */
export interface PostReaction {
  emoji: string;
  count: number;
  userReacted: boolean;
  recentUsers: Array<ReactionUser> | null;
}

/** utils/signal/SignalModels.kt */
export interface PreKeyBundleResponse {
  apiStatus: number;
  userId: number | null;
  deviceId: string | null;
  identityKey: string | null;
  identitySigningKey: string | null;
  signedPreKeyId: number | null;
  signedPreKey: string | null;
  signedPreKeySig: string | null;
  oneTimePreKeyId: number | null;
  oneTimePreKey: string | null;
  remainingPreKeys: number | null;
  errorMessage: string | null;
}

/** utils/signal/SignalModels.kt */
export interface PreKeyBundlesResponse {
  apiStatus: number;
  userId: number | null;
  devices: Array<DeviceBundleJson> | null;
  errorMessage: string | null;
}

/** network/MediaUploader.kt */
export interface Progress {
  percent: number;
}

/** network/NodeGroupApi.kt */
export interface PublicGiveaway {
  id: number;
  groupId: number;
  prize: string;
  description: string | null;
  buttonText: string | null;
  mediaUrl: string | null;
  chatType: string;
  winnersCount: number;
  endsAt: number;
  maxParticipants: number | null;
  status: string;
  participantsCount: number;
  joined: boolean;
  isWinner: boolean;
  canManage: boolean;
  requiredChannels: Array<PublicGiveawayChannel>;
  winners: Array<GroupGiveawayWinner>;
  seedHash: string | null;
  seed: string | null;
}

/** network/NodeGroupApi.kt */
export interface PublicGiveawayChannel {
  id: number;
  username: string | null;
  name: string | null;
  avatarUrl: string | null;
  subscribed: boolean;
}

/** network/NodeGroupApi.kt */
export interface PublicGiveawayResponse {
  apiStatus: number;
  errorCode: string | null;
  errorMessage: string | null;
  giveaway: PublicGiveaway | null;
}

/** network/NodeChannelApi.kt */
export interface QrCodeResponse {
  apiStatus: number;
  qrCode: string | null;
  joinUrl: string | null;
  errorMessage: string | null;
}

/** network/SharedApiModels.kt */
export interface QuickRegisterResponse {
  apiStatus: number;
  userId: number | null;
  username: string | null;
  message: string | null;
  errorMessage: string | null;
}

/** network/SharedApiModels.kt */
export interface QuickVerifyResponse {
  apiStatus: number;
  accessToken: string | null;
  userId: number | null;
  username: string | null;
  avatar: string | null;
  errorMessage: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
}

/** data/model/BusinessDirectory.kt */
export interface RateBusinessRequest {
  rating: number;
  review: string;
}

/** data/model/BusinessDirectory.kt */
export interface RateBusinessResponse {
  apiStatus: number;
  ratingAvg: number | null;
  ratingCount: number;
  myRating: number | null;
  myReview: string | null;
  errorMessage: string | null;
}

/** data/model/UserRating.kt */
export interface RateUserResponse {
  apiStatus: number;
  message: string | null;
  action: string | null;
  ratingType: string | null;
  userRating: UserRating | null;
  errorMessage: string | null;
}

/** data/model/UserRating.kt */
export interface RatingDetail {
  id: number;
  raterId: number;
  raterUsername: string;
  raterName: string;
  raterAvatar: string | null;
  ratingType: string;
  comment: string | null;
  createdAt: string;
}

/** data/model/MessageReaction.kt */
export interface ReactionGroup {
  emoji: string;
  count: number;
  userIds: Array<number>;
  hasMyReaction: boolean;
}

/** data/model/Channel.kt */
export interface ReactionUser {
  userId: number;
  username: string;
  avatar: string;
}

/** data/model/Story.kt */
export interface ReactStoryResponse {
  apiStatus: number;
  message: string | null;
  errorCode: number | null;
  errorMessage: string | null;
}

/** network/NodeRefundsApi.kt */
export interface RefundEligibleItem {
  serviceType: string;
  refId: string;
  title: string;
  amount: number;
  currency: string;
  purchasedAt: number;
  preview: NodeRefundDecision;
}

/** network/NodeRefundsApi.kt */
export interface RefundHistoryItem {
  id: number;
  serviceType: string;
  refId: string;
  reasonCode: string;
  refundType: string;
  originalAmount: number;
  refundAmount: number;
  adminFee: number;
  currency: string;
  usagePercent: number;
  status: string;
  decisionCode: string;
  createdAt: number;
  processedAt: number;
}

/** network/NodeRefundsApi.kt */
export interface RefundPolicyDoc {
  premium: RefundPremiumPolicy | null;
  worldstars: Array<string>;
  stickerpacks: Array<string>;
  ads: Array<string>;
}

/** network/NodeRefundsApi.kt */
export interface RefundPremiumPolicy {
  monthly: Array<string>;
  annual: Array<string>;
}

/** data/model/Bot.kt */
export interface RssFeed {
  id: number;
  botId: string;
  chatId: string;
  feedUrl: string;
  feedName: string | null;
  feedLanguage: string;
  isActive: number;
  checkIntervalMinutes: number;
  maxItemsPerCheck: number;
  includeImage: number;
  includeDescription: number;
  itemsPosted: number;
  lastCheckAt: string | null;
}

/** data/model/Bot.kt */
export interface RssFeedListResponse {
  apiStatus: number;
  feeds: Array<RssFeed> | null;
  errorMessage: string | null;
}

/** data/model/Bot.kt */
export interface RssFeedResponse {
  apiStatus: number;
  feed: RssFeed | null;
  errorMessage: string | null;
}

/** data/SavedMessagesManager.kt */
export interface SavedMessageItem {
  messageId: number;
  chatType: string;
  chatId: number;
  chatName: string;
  senderName: string;
  text: string;
  mediaUrl: string | null;
  mediaType: string | null;
  savedAt: number;
  originalTime: number;
}

/** network/NodeApi.kt */
export interface SavedSearch {
  id: number;
  query: string;
  createdAt: number;
}

/** network/NodeApi.kt */
export interface SavedSearchesResponse {
  apiStatus: number;
  saved: Array<SavedSearch>;
  errorMessage: string | null;
}

/** network/NodeApi.kt */
export interface SavedSearchResponse {
  apiStatus: number;
  id: number | null;
  query: string | null;
  errorMessage: string | null;
}

/** network/NodeApi.kt */
export interface ScheduledMessageItem {
  id: number;
  chatId: number;
  chatType: string;
  text: string | null;
  mediaUrl: string | null;
  mediaType: string | null;
  scheduledAt: number;
  repeatType: string;
  isPinned: boolean;
  notifyMembers: boolean;
  status: string;
  createdAt: number;
}

/** data/model/Group.kt */
export interface ScheduledPost {
  id: number;
  groupId: number | null;
  channelId: number | null;
  authorId: number;
  text: string;
  mediaUrl: string | null;
  mediaType: string | null;
  scheduledTime: number;
  createdTime: number;
  status: string;
  repeatType: string | null;
  isPinned: boolean;
  notifyMembers: boolean;
}

/** network/NodeApi.kt */
export interface SearchSuggestion {
  type: string;
  id: number | null;
  query: string | null;
  user: UserSearchResult | null;
}

/** network/NodeApi.kt */
export interface SearchSuggestionsResponse {
  apiStatus: number;
  suggestions: Array<SearchSuggestion>;
  errorMessage: string | null;
}

/** network/SharedApiModels.kt */
export interface SearchUser {
  userId: number;
  username: string;
  name: string | null;
  avatarUrl: string;
  verified: number;
  lastSeen: number | null;
  lastSeenStatus: string | null;
  about: string | null;
}

/** network/SharedApiModels.kt */
export interface SendCodeResponse {
  actualStatus: number;
  errors: string | null;
  message: string | null;
}

/** data/model/Group.kt */
export interface SendMessageRequest {
  text: string;
  recipientId: number | null;
  groupId: number | null;
  mediaUrl: string | null;
  mediaType: string | null;
  replyToId: number | null;
  sendTime: number;
}

/** network/NodeApi.kt */
export interface ServerFolder {
  id: number;
  name: string;
  emoji: string;
  color: string;
  position: number;
  isShared: boolean;
  shareCode: string | null;
  memberCount: number;
  chats: Array<FolderChatItem> | null;
  createdAt: number;
}

/** network/NodeApi.kt */
export interface ServerSavedItem {
  id: number;
  messageId: number;
  chatType: string;
  chatId: number;
  chatName: string;
  senderName: string;
  text: string | null;
  mediaUrl: string | null;
  mediaType: string | null;
  savedAt: number;
  originalTime: number;
}

/** data/model/User.kt */
export interface SetEmojiStatusResponse {
  apiStatus: number;
  statusEmoji: string | null;
  statusText: string | null;
  statusExpiresAt: number | null;
  errorMessage: string | null;
}

/** network/NodeProfileApi.kt */
export interface ShowcaseActionResponse {
  apiStatus: number;
  errorCode: string | null;
  errorMessage: string | null;
}

/** network/NodeProfileApi.kt */
export interface ShowcaseChannelOption {
  id: number;
  name: string;
  username: string | null;
  avatarUrl: string;
  subscribersCount: number;
}

/** network/NodeProfileApi.kt */
export interface ShowcaseChannelsResponse {
  apiStatus: number;
  channels: Array<ShowcaseChannelOption> | null;
  personalChannelId: number;
  errorMessage: string | null;
}

/** network/NodeProfileApi.kt */
export interface ShowcasePost {
  id: number;
  text: string;
  isPoll: boolean;
  isGiveaway: boolean;
  isPaywall: boolean;
  mediaType: string | null;
  mediaThumb: string;
  mediaCount: number;
  createdTime: number;
  viewsCount: number;
  commentsCount: number;
  reactionsCount: number;
}

/** network/NodeProfileApi.kt */
export interface ShowcaseResponse {
  apiStatus: number;
  channel: Channel | null;
  channelPosts: Array<ShowcasePost> | null;
  highlights: Array<Story> | null;
  canEdit: boolean;
  errorMessage: string | null;
}

/** utils/signal/SenderKeyModels.kt */
export interface SignalGroupConfirmResponse {
  apiStatus: number;
  confirmed: number | null;
  message: string | null;
  errorMessage: string | null;
}

/** utils/signal/SenderKeyModels.kt */
export interface SignalGroupDistributeResponse {
  apiStatus: number;
  saved: number | null;
  message: string | null;
  errorMessage: string | null;
}

/** utils/signal/SenderKeyModels.kt */
export interface SignalGroupPendingItem {
  id: number;
  groupId: number;
  senderId: number;
  distribution: string;
  createdAt: string | null;
}

/** utils/signal/SenderKeyModels.kt */
export interface SignalGroupPendingResponse {
  apiStatus: number;
  distributions: Array<SignalGroupPendingItem> | null;
  count: number | null;
  errorMessage: string | null;
}

/** utils/signal/SignalModels.kt */
export interface SignalIdentitiesResponse {
  apiStatus: number;
  userId: number | null;
  devices: Array<DeviceIdentityJson> | null;
  errorMessage: string | null;
}

/** utils/signal/SignalModels.kt */
export interface SignalIdentityKeyResponse {
  apiStatus: number;
  userId: number | null;
  identityKey: string | null;
  errorMessage: string | null;
}

/** data/local/entity/SignalPlaintextCache.kt */
export interface SignalPlaintextCache {
  msgId: number;
  plaintext: string;
  cachedAt: number;
}

/** utils/signal/SignalModels.kt */
export interface SignalSimpleResponse {
  apiStatus: number;
  message: string | null;
  count: number | null;
  errorMessage: string | null;
}

/** network/NodeStarsApi.kt */
export interface StarsBalanceResponse {
  apiStatus: number;
  balance: number;
  totalPurchased: number;
  totalSent: number;
  totalReceived: number;
  recentTransactions: Array<StarsTransaction>;
  errorMessage: string | null;
}

/** network/NodeStarsApi.kt */
export interface StarsDonateResponse {
  apiStatus: number;
  newBalance: number;
  starsSent: number;
  errorMessage: string | null;
  errorCode: string | null;
}

/** network/NodeStarsApi.kt */
export interface StarsPack {
  id: number;
  stars: number;
  priceUah: number;
  isPopular: boolean;
  label: string;
}

/** network/NodeStarsApi.kt */
export interface StarsPacksResponse {
  apiStatus: number;
  packs: Array<StarsPack>;
  errorMessage: string | null;
}

/** network/NodeStarsApi.kt */
export interface StarsPurchaseResponse {
  apiStatus: number;
  provider: string;
  paymentUrl: string;
  orderId: string;
  pack: StarsPack | null;
  errorMessage: string | null;
}

/** network/NodeStarsApi.kt */
export interface StarsSendResponse {
  apiStatus: number;
  newBalance: number;
  errorMessage: string | null;
}

/** network/NodeStarsApi.kt */
export interface StarsTransaction {
  id: number;
  fromUserId: number | null;
  toUserId: number;
  amount: number;
  type: string;
  refType: string | null;
  refId: number | null;
  note: string | null;
  createdAt: string;
  otherUserName: string | null;
  otherUserAvatar: string | null;
}

/** network/NodeStarsApi.kt */
export interface StarsTransactionsResponse {
  apiStatus: number;
  transactions: Array<StarsTransaction>;
  limit: number;
  offset: number;
  errorMessage: string | null;
}

/** ui/channels/ChannelPremiumViewModel.kt */
export interface StartTrialResponse {
  api_status: number;
  expires_at: string | null;
  trial_days: number;
  error_message: string | null;
}

/** data/model/Sticker.kt */
export interface Sticker {
  id: number;
  packId: number;
  fileUrl: string;
  thumbnailUrl: string | null;
  emoji: string | null;
  keywords: Array<string> | null;
  width: number | null;
  height: number | null;
  fileSize: number | null;
  format: string | null;
}

/** network/NodeStickerProApi.kt */
export interface StickerBuyResponse {
  apiStatus: number;
  newBalance: number;
  alreadyOwned: boolean;
  errorMessage: string | null;
}

/** data/model/StickerSuggestionModels.kt */
export interface StickerEntry {
  pack: string;
  file: string;
  categories: Array<string>;
  words: Array<string>;
}

/** data/model/Sticker.kt */
export interface StickerPack {
  id: number;
  name: string;
  description: string | null;
  iconUrl: string | null;
  thumbnailUrl: string | null;
  author: string | null;
  stickers: Array<Sticker> | null;
  stickerCount: number | null;
  isActive: boolean;
  isAnimated: boolean;
  createdAt: string | null;
  updatedAt: string | null;
}

/** data/model/Sticker.kt */
export interface StickerPackDetailResponse {
  apiStatus: number;
  pack: StickerPack | null;
  stickers: Array<Sticker> | null;
  errorCode: number | null;
  errorMessage: string | null;
}

/** data/model/Sticker.kt */
export interface StickerPacksResponse {
  apiStatus: number;
  packs: Array<StickerPack> | null;
  errorCode: number | null;
  errorMessage: string | null;
}

/** network/NodeStickerProApi.kt */
export interface StickerProMetaResponse {
  apiStatus: number;
  packs: Array<StickerProPackMeta>;
  errorMessage: string | null;
}

/** network/NodeStickerProApi.kt */
export interface StickerProPackMeta {
  slug: string;
  isPro: boolean;
  starsPrice: number;
  isPurchased: boolean;
}

/** data/model/StickerSuggestionModels.kt */
export interface StickerRef {
  pack: string;
  file: string;
  categories: Array<string> | null;
}

/** data/repository/StickerSuggestionRepository.kt */
export interface StickerSuggestion {
  trigger: string;
  stickerRefs: Array<StickerRef>;
  emojis: Array<string>;
}

/** data/model/StickerSuggestionModels.kt */
export interface StickerSuggestionIndex {
  emoticons: Record<string, string>;
  categoryEmoji: Record<string, Array<string>>;
  wordIndex: Record<string, Array<StickerRef>>;
  categoryIndex: Record<string, Array<StickerRef>>;
  stickers: Array<StickerEntry>;
}

/** data/StorageManager.kt */
export interface StorageBreakdown {
  photosBytes: number;
  videosBytes: number;
  voiceBytes: number;
  filesBytes: number;
  imageCacheBytes: number;
  offlineDataBytes: number;
  tempBytes: number;
}

/** data/UserSession.kt */
export interface StoredTokens {
  refreshToken: string | null;
  tokenExpiresAt: number;
}

/** data/model/Story.kt */
export interface Story {
  id: number;
  userId: number;
  pageId: number | null;
  title: string | null;
  description: string | null;
  posted: number;
  expire: number;
  thumbnail: string;
  userData: StoryUser | null;
  channelData: ChannelStoryData | null;
  thumb: StoryMedia | null;
  images: Array<StoryMedia> | null;
  videos: Array<StoryMedia> | null;
  apiMediaItems: Array<StoryMedia> | null;
  isOwner: boolean;
  isViewed: number;
  viewCount: number;
  commentCount: number;
  reaction: StoryReactions | null;
  musicUrl: string | null;
  poll: StoryPoll | null;
}

/** data/model/Story.kt */
export interface StoryAnalytics {
  storyId: number;
  uniqueViews: number;
  totalReactions: number;
  reactions: StoryReactions;
  totalComments: number;
  engagementRate: number;
  postedAt: number;
  expiresAt: number;
}

/** data/model/Story.kt */
export interface StoryComment {
  id: number;
  storyId: number;
  userId: number;
  text: string;
  sticker: string | null;
  time: number;
  userData: StoryUser | null;
  offsetId: number | null;
  replyToCommentId: number | null;
  mentions: Array<StoryMention> | null;
}

/** data/model/Story.kt */
export interface StoryLimits {
  maxStories: number;
  maxVideoDuration: number;
  expireHours: number;
  canComment: boolean;
  canReact: boolean;
}

/** data/model/Story.kt */
export interface StoryMedia {
  id: number;
  storyId: number;
  type: string;
  filename: string;
  expire: number | null;
  duration: number;
}

/** data/model/Story.kt */
export interface StoryMention {
  userId: number;
  username: string;
  start: number;
  end: number;
}

/** data/model/Story.kt */
export interface StoryPoll {
  question: string;
  options: Array<StoryPollOption>;
  votedOptionId: number | null;
}

/** data/model/Story.kt */
export interface StoryPollOption {
  id: number;
  text: string;
  votes: number;
}

/** data/model/Story.kt */
export interface StoryReactions {
  like: number;
  love: number;
  haha: number;
  wow: number;
  sad: number;
  angry: number;
  isReacted: boolean;
  type: string | null;
}

/** data/model/Story.kt */
export interface StoryUser {
  userId: number;
  username: string;
  firstName: string | null;
  lastName: string | null;
  avatar: string | null;
  avatarOrg: string | null;
  isPro: number;
  verified: number;
}

/** data/model/Story.kt */
export interface StoryViewer {
  userId: number;
  username: string;
  firstName: string | null;
  lastName: string | null;
  avatar: string | null;
  time: number;
  offsetId: number | null;
}

/** data/model/StrapiModels.kt */
export interface StrapiContentItem {
  id: number;
  url: string;
  name: string | null;
  width: number | null;
  height: number | null;
}

/** data/model/StrapiModels.kt */
export interface StrapiContentPack {
  id: number;
  name: string;
  type: ContentType;
  slug: string;
  items: Array<StrapiContentItem>;
  coverUrl: string | null;
  isPro: boolean;
  starsPrice: number;
  isPurchased: boolean;
}

/** data/model/StrapiModels.kt */
export interface StrapiResponse {
  data: Array<PackItem> | null;
  meta: Meta | null;
}

/** data/model/Channel.kt */
export interface StreamSocialLink {
  label: string;
  url: string;
  icon: string;
}

/** data/model/Group.kt */
export interface Subgroup {
  id: number;
  parentGroupId: number;
  name: string;
  description: string | null;
  iconEmoji: string | null;
  color: string;
  membersCount: number;
  messagesCount: number;
  isPrivate: boolean;
  isClosed: boolean;
  createdBy: number;
  createdTime: number;
  lastMessageTime: number | null;
  pinnedMessageId: number | null;
  moderators: Array<number>;
}

/** network/SharedApiModels.kt */
export interface SubscribeChannelResponse {
  apiStatus: number;
  message: string | null;
  channel: Channel | null;
}

/** data/repository/ThemeProfileRepository.kt */
export interface Success {
  profile: NodeThemeShareData;
}

/** network/MediaUploader.kt */
export interface Success__MediaUploader {
  mediaId: string;
  url: string;
  thumbnail: string | null;
}

/** data/model/CloudBackupSettings.kt */
export interface SyncProgress {
  isRunning: boolean;
  currentItem: number;
  totalItems: number;
  currentChatName: string | null;
  bytesDownloaded: number;
  totalBytes: number;
}

/** data/model/Group.kt */
export interface SyncSessionResponse {
  apiStatus: number;
  message: string | null;
  userId: number | null;
  sessionId: number | null;
  platform: string | null;
  errorCode: number | null;
  errorMessage: string | null;
}

/** network/NodeApi.kt */
export interface TelegramStickerItem {
  fileUrl: string;
  thumbUrl: string | null;
  emoji: string;
  isAnimated: boolean;
  isVideo: boolean;
}

/** network/NodeApi.kt */
export interface TelegramStickerSetResponse {
  apiStatus: number;
  name: string;
  title: string;
  isAnimated: boolean;
  isVideo: boolean;
  stickers: Array<TelegramStickerItem>;
  errorMessage: string | null;
}

/** network/NodeApi.kt */
export interface ThreadAuthor {
  userId: number;
  name: string;
  username: string;
  avatar: string;
}

/** network/NodeApi.kt */
export interface ThreadMessage {
  id: number;
  postId: number;
  userId: number;
  text: string;
  sticker: string | null;
  time: number;
  replyToId: number | null;
  author: ThreadAuthor | null;
}

/** network/NodeTicketsApi.kt */
export interface TicketItem {
  id: number;
  subject: string;
  category: string;
  status: string;
  priority: string;
  createdAt: number;
  updatedAt: number;
  user: TicketUser | null;
}

/** network/NodeTicketsApi.kt */
export interface TicketMessage {
  id: number;
  senderType: string;
  senderId: number;
  message: string;
  createdAt: number;
  sender: TicketUser | null;
}

/** network/NodeTicketsApi.kt */
export interface TicketRef {
  id: number;
}

/** network/NodeTicketsApi.kt */
export interface TicketUser {
  userId: number;
  username: string | null;
  name: string | null;
  avatar: string | null;
}

/** network/NodeApi.kt */
export interface TokenRefreshResponse {
  apiStatus: number;
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
  userId: number | null;
  errorMessage: string | null;
}

/** data/model/Channel.kt */
export interface TopComment {
  id: number;
  postId: number;
  userId: number;
  username: string | null;
  name: string | null;
  avatarUrl: string | null;
  text: string;
  reactionCount: number;
  time: number;
}

/** data/model/Channel.kt */
export interface TopCommentsResponse {
  apiStatus: number;
  comments: Array<TopComment> | null;
  periodDays: number;
  errorMessage: string | null;
}

/** data/model/Group.kt */
export interface TopContributor {
  userId: number;
  username: string;
  name: string | null;
  avatar: string | null;
  messagesCount: number;
}

/** network/NodeGroupApi.kt */
export interface TopicActionResponse {
  apiStatus: number;
  topic: TopicDto | null;
  errorMessage: string | null;
}

/** network/NodeGroupApi.kt */
export interface TopicDto {
  id: number;
  name: string;
  description: string | null;
  color: string;
  icon: string | null;
  isPrivate: number;
  createdAt: string;
  messagesCount: number;
  moderators: Array<number>;
}

/** data/model/Channel.kt */
export interface TopPostStatistic {
  id: number;
  text: string;
  views: number;
  reactions: number;
  comments: number;
  publishedTime: number;
  hasMedia: boolean;
}

/** network/NodeApi.kt */
export interface TranslateResponse {
  apiStatus: number;
  translatedText: string | null;
  detectedLang: string | null;
  targetLang: string | null;
  errorMessage: string | null;
}

/** data/model/BusinessModels.kt */
export interface UpdateBusinessHoursRequest {
  hours: Array<BusinessHourRequest>;
}

/** data/model/BusinessModels.kt */
export interface UpdateBusinessProfileRequest {
  businessName: string | null;
  category: string | null;
  description: string | null;
  address: string | null;
  lat: number | null;
  lng: number | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  webhookUrl: string | null;
  autoReplyEnabled: boolean;
  autoReplyText: string | null;
  autoReplyMode: string;
  greetingEnabled: boolean;
  greetingText: string | null;
  awayEnabled: boolean;
  awayText: string | null;
  badgeEnabled: boolean;
}

/** data/model/Channel.kt */
export interface UpdateChannelPostRequest {
  postId: number;
  text: string;
  media: Array<PostMedia> | null;
}

/** data/model/Channel.kt */
export interface UpdateChannelSettingsRequest {
  channelId: number;
  settings: ChannelSettings;
}

/** data/model/CloudBackupSettings.kt */
export interface UpdateCloudBackupSettingsResponse {
  apiStatus: number;
  message: string;
  errors: Record<string, string> | null;
}

/** data/model/Story.kt */
export interface UpdateStoryResponse {
  apiStatus: number;
  message: string | null;
  errorCode: number | null;
  errorMessage: string | null;
}

/** data/model/User.kt */
export interface UpdateUserDataResponse {
  apiStatus: number;
  message: string | null;
  errorCode: number | null;
  errorMessage: string | null;
}

/** data/model/User.kt */
export interface User {
  userId: number;
  username: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  avatar: string | null;
  cover: string | null;
  about: string | null;
  birthday: string | null;
  gender: string | null;
  phoneNumber: string | null;
  website: string | null;
  working: string | null;
  workingLink: string | null;
  address: string | null;
  countryId: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  school: string | null;
  language: string | null;
  verified: number;
  lastSeen: number | null;
  lastSeenStatus: string | null;
  emailCode: string | null;
  isPro: number;
  proType: number;
  proExpiresAt: string | null;
  joined: string | null;
  timezone: string | null;
  referrer: number | null;
  relationshipId: number | null;
  followPrivacy: string | null;
  friendPrivacy: string | null;
  postPrivacy: string | null;
  messagePrivacy: string | null;
  confirmFollowers: string | null;
  showActivitiesPrivacy: string | null;
  birthPrivacy: string | null;
  visitPrivacy: string | null;
  emailNotification: string | null;
  eLiked: number | null;
  eWondered: number | null;
  eShared: number | null;
  eFollowed: number | null;
  eCommented: number | null;
  eVisited: number | null;
  eLikedPage: number | null;
  eMentioned: number | null;
  eJoinedGroup: number | null;
  eAccepted: number | null;
  eProfileWallPost: number | null;
  eSentGift: number | null;
  notificationSettings: string | null;
  status: string | null;
  active: string | null;
  admin: number | null;
  balance: string | null;
  wallet: string | null;
  followersCount: string | null;
  followingCount: string | null;
  likesCount: string | null;
  groupsCount: string | null;
  details: UserDetails | null;
  relationship: UserRelationship | null;
  profileAccent: string | null;
  profileBadge: string | null;
  profileHeaderStyle: string | null;
  statusEmoji: string | null;
  statusText: string | null;
  statusExpiresAt: number | null;
  verificationLevel: number;
  isFounder: number;
}

/** data/model/User.kt */
export interface UserAvatar {
  id: number;
  url: string;
  filePath: string;
  isAnimated: boolean;
  mimeType: string;
  position: number;
  createdAt: number;
}

/** data/model/User.kt */
export interface UserAvatarListResponse {
  apiStatus: number;
  avatars: Array<UserAvatar> | null;
  errorMessage: string | null;
}

/** data/model/User.kt */
export interface UserAvatarSimpleResponse {
  apiStatus: number;
  url: string | null;
  remainingCount: number | null;
  errorMessage: string | null;
}

/** data/model/User.kt */
export interface UserAvatarUploadResponse {
  apiStatus: number;
  avatar: UserAvatar | null;
  isMain: boolean;
  count: number;
  limit: number;
  errorMessage: string | null;
}

/** data/model/BackupModels.kt */
export interface UserBackup {
  manifest: BackupManifest;
  user: Record<string, any> | null;
  messages: Array<Record<string, any>>;
  contacts: Array<Record<string, any>>;
  groups: Array<Record<string, any>>;
  channels: Array<Record<string, any>>;
  settings: Record<string, any> | null;
  blockedUsers: Array<number>;
}

/** data/model/User.kt */
export interface UserDetails {
  postCount: number | null;
  albumCount: number | null;
  followingCount: number | null;
  followersCount: number | null;
  groupsCount: number | null;
  likesCount: number | null;
}

/** network/NodeProfileApi.kt */
export interface UserMediaItem {
  messageId: number;
  media: string;
  mediaFileName: string | null;
  time: number;
  senderId: number;
  recipientId: number;
  partnerId: number;
  userData: UserMediaPartner | null;
}

/** network/NodeProfileApi.kt */
export interface UserMediaPartner {
  userId: number;
  username: string;
  firstName: string | null;
  lastName: string | null;
  avatar: string | null;
}

/** data/model/User.kt */
export interface UserNotificationSettings {
  emailNotification: boolean;
  eLiked: boolean;
  eWondered: boolean;
  eShared: boolean;
  eFollowed: boolean;
  eCommented: boolean;
  eVisited: boolean;
  eLikedPage: boolean;
  eMentioned: boolean;
  eJoinedGroup: boolean;
  eAccepted: boolean;
  eProfileWallPost: boolean;
  eSentGift: boolean;
}

/** data/UserPreferencesRepository.kt */
export interface UserPreferences {
  accessToken: string;
  userId: number;
  username: string;
  userAvatar: string;
  userEmail: string;
  deviceId: string;
  fcmToken: string;
  lastLoginTime: number;
  isPremium: boolean;
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  previewEnabled: boolean;
  groupNotificationsEnabled: boolean;
  themeMode: string;
  language: string;
  notificationSoundId: string;
  messageSoundId: string;
}

/** data/model/User.kt */
export interface UserPrivacySettings {
  followPrivacy: string;
  friendPrivacy: string;
  postPrivacy: string;
  messagePrivacy: string;
  confirmFollowers: string;
  showActivitiesPrivacy: string;
  birthPrivacy: string;
  visitPrivacy: string;
}

/** data/model/UserRating.kt */
export interface UserRating {
  userId: number;
  username: string | null;
  name: string | null;
  avatar: string | null;
  likes: number;
  dislikes: number;
  score: number;
  trustLevel: string;
  trustLevelLabel: string;
  trustLevelEmoji: string;
  trustLevelColor: string;
  totalRatings: number;
  likePercentage: number;
  dislikePercentage: number;
  myRating: MyRating | null;
  karma: number;
  karmaLevel: string;
  canReplyToUsers: boolean;
  weeklyStars: number;
  nextStarsAt: number | null;
}

/** data/model/User.kt */
export interface UserRelationship {
  isFollowing: boolean;
  isFollowingMe: boolean;
  followPending: boolean;
  isBlocked: boolean;
  canFollow: boolean;
  canMessage: boolean;
}

/** data/model/Group.kt */
export interface UserResponse {
  apiStatus: number;
  userId: number | null;
  username: string | null;
  avatar: string | null;
  status: string | null;
  lastSeen: number | null;
  errorCode: number | null;
  errorMessage: string | null;
}

/** network/NodeApi.kt */
export interface UserSearchResult {
  userId: number;
  username: string;
  firstName: string;
  lastName: string;
  avatar: string;
  lastSeen: number;
  isVerified: boolean;
}

/** network/SharedApiModels.kt */
export interface VerifyCodeResponse {
  apiStatus: number;
  accessToken: string | null;
  userId: number | null;
  errors: string | null;
  message: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
}

/** data/model/AppUpdateModels.kt */
export interface VersionChangelog {
  version: string;
  date: string | null;
  added: Array<string>;
  changed: Array<string>;
  fixed: Array<string>;
  removed: Array<string>;
}

/** data/model/VideoQuality.kt */
export interface VideoQualitiesResponse {
  apiStatus: number;
  qualities: Array<VideoQuality>;
  errorMessage: string | null;
}

/** data/model/VideoQuality.kt */
export interface VideoQuality {
  tier: string;
  url: string;
  width: number;
  height: number;
  sizeBytes: number;
}

/** data/model/Group.kt */
export interface VoiceMessage {
  id: string;
  localPath: string | null;
  url: string | null;
  duration: number;
  size: number;
  createdTime: number;
}

/** network/NodeApi.kt */
export interface VoiceReaction {
  id: number;
  messageId: number;
  userId: number;
  audioUrl: string;
  durationMs: number;
  createdAt: string;
  user: VoiceReactionUser | null;
}

/** network/NodeApi.kt */
export interface VoiceReactionResponse {
  apiStatus: number;
  reaction: VoiceReaction | null;
  errorMessage: string | null;
}

/** network/NodeApi.kt */
export interface VoiceReactionsListResponse {
  apiStatus: number;
  reactions: Array<VoiceReaction>;
  errorMessage: string | null;
}

/** network/NodeApi.kt */
export interface VoiceReactionUser {
  id: number;
  username: string;
  name: string;
  avatar: string | null;
}

/** network/NodeGroupApi.kt */
export interface VoiceRoomInfo {
  id: number;
  roomName: string;
  callType: string;
  initiatedBy: number;
  maxParticipants: number;
  participantCount: number;
  participants: Array<VoiceRoomParticipant>;
}

/** network/NodeGroupApi.kt */
export interface VoiceRoomJoinResponse {
  apiStatus: number;
  roomId: number;
  roomName: string;
  participantCount: number;
  livekitUrl: string;
  token: string;
  callType: string;
  maxParticipants: number;
  errorMessage: string | null;
}

/** network/NodeGroupApi.kt */
export interface VoiceRoomLeaveResponse {
  apiStatus: number;
  ended: boolean;
  participantCount: number;
  errorMessage: string | null;
}

/** network/NodeGroupApi.kt */
export interface VoiceRoomParticipant {
  userId: number;
  name: string;
  avatar: string;
  joinedAt: string | null;
}

/** network/NodeGroupApi.kt */
export interface VoiceRoomResponse {
  apiStatus: number;
  room: VoiceRoomInfo | null;
  errorMessage: string | null;
}

/** network/NodeVoiceApi.kt */
export interface VoiceTranscriptResponse {
  apiStatus: number;
  transcript: string;
  language: string;
  errorMessage: string | null;
}

/** data/model/Story.kt */
export interface VoteStoryPollResponse {
  apiStatus: number;
  poll: StoryPoll | null;
  votedOptionId: number | null;
  message: string | null;
  errorCode: number | null;
  errorMessage: string | null;
}

/** data/model/Bot.kt */
export interface WebAppInfo {
  url: string;
}

/** data/model/Bot.kt */
export interface WebAppQueryResponse {
  apiStatus: number;
  ok: boolean;
  webhookDelivered: boolean;
  errorMessage: string | null;
}

/** data/model/Bot.kt */
export interface WebAppTokenResponse {
  apiStatus: number;
  initData: string | null;
  queryId: string | null;
  webAppUrl: string | null;
  errorMessage: string | null;
}

/** network/SharedApiModels.kt */
export interface XhrUploadResponse {
  status: number;
  imageUrl: string | null;
  imageSrc: string | null;
  videoUrl: string | null;
  videoSrc: string | null;
  audioUrl: string | null;
  audioSrc: string | null;
  fileUrl: string | null;
  fileSrc: string | null;
  error: string | null;
  length: number | null;
}
