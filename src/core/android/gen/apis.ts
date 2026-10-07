// АВТОГЕНЕРАЦИЯ: scripts/gen-android-api.mjs из Retrofit-интерфейсов Android. Руками не править.
/* eslint-disable */
import { retrofitCall, type RetrofitResponse, type RawResponseBody, type RequestBodyLike, type MultipartPart, type CallParam } from '../retrofit';
import type * as M from './models';

/** data/repository/GiphyRepository.kt */
export const GiphyApi = {
  getTrending(apiKey: string, limit: number = 25, offset: number = 0, rating: string = "g"): Promise<RetrofitResponse<M.GiphyResponse>> {
    return retrofitCall({"base":"giphy","http":"GET","path":"gifs/trending","response":true,"ret":{"k":"obj","c":"GiphyResponse"}}, [{ ...{"kind":"Query","name":"api_key","arg":"apiKey"}, value: apiKey }, { ...{"kind":"Query","name":"limit","arg":"limit"}, value: limit }, { ...{"kind":"Query","name":"offset","arg":"offset"}, value: offset }, { ...{"kind":"Query","name":"rating","arg":"rating"}, value: rating }] as CallParam[]);
  },
  searchGifs(apiKey: string, query: string, limit: number = 25, offset: number = 0, rating: string = "g"): Promise<RetrofitResponse<M.GiphyResponse>> {
    return retrofitCall({"base":"giphy","http":"GET","path":"gifs/search","response":true,"ret":{"k":"obj","c":"GiphyResponse"}}, [{ ...{"kind":"Query","name":"api_key","arg":"apiKey"}, value: apiKey }, { ...{"kind":"Query","name":"q","arg":"query"}, value: query }, { ...{"kind":"Query","name":"limit","arg":"limit"}, value: limit }, { ...{"kind":"Query","name":"offset","arg":"offset"}, value: offset }, { ...{"kind":"Query","name":"rating","arg":"rating"}, value: rating }] as CallParam[]);
  },
  getRandomGif(apiKey: string, tag: string | null = null, rating: string = "g"): Promise<RetrofitResponse<M.GiphyRandomResponse>> {
    return retrofitCall({"base":"giphy","http":"GET","path":"gifs/random","response":true,"ret":{"k":"obj","c":"GiphyRandomResponse"}}, [{ ...{"kind":"Query","name":"api_key","arg":"apiKey"}, value: apiKey }, { ...{"kind":"Query","name":"tag","arg":"tag"}, value: tag }, { ...{"kind":"Query","name":"rating","arg":"rating"}, value: rating }] as CallParam[]);
  },
};

/** network/CallHistoryApiService.kt */
export const CallHistoryApiService = {
  getCallHistory(accessToken: string, type: string = "get_history", filter: string = "all", limit: number = 50, offset: number = 0): Promise<M.GetCallHistoryResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"/api/v2/call_history.php","form":true,"ret":{"k":"obj","c":"GetCallHistoryResponse"}}, [{ ...{"kind":"Query","name":"access_token","arg":"accessToken"}, value: accessToken }, { ...{"kind":"Field","name":"type","arg":"type"}, value: type }, { ...{"kind":"Field","name":"filter","arg":"filter"}, value: filter }, { ...{"kind":"Field","name":"limit","arg":"limit"}, value: limit }, { ...{"kind":"Field","name":"offset","arg":"offset"}, value: offset }] as CallParam[]);
  },
  deleteCall(accessToken: string, type: string = "delete_call", callId: number): Promise<M.CallHistoryActionResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"/api/v2/call_history.php","form":true,"ret":{"k":"obj","c":"CallHistoryActionResponse"}}, [{ ...{"kind":"Query","name":"access_token","arg":"accessToken"}, value: accessToken }, { ...{"kind":"Field","name":"type","arg":"type"}, value: type }, { ...{"kind":"Field","name":"call_id","arg":"callId"}, value: callId }] as CallParam[]);
  },
  clearHistory(accessToken: string, type: string = "clear_history"): Promise<M.CallHistoryActionResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"/api/v2/call_history.php","form":true,"ret":{"k":"obj","c":"CallHistoryActionResponse"}}, [{ ...{"kind":"Query","name":"access_token","arg":"accessToken"}, value: accessToken }, { ...{"kind":"Field","name":"type","arg":"type"}, value: type }] as CallParam[]);
  },
};

/** network/NodeAdsApi.kt */
export const NodeAdsApi = {
  getWallet(): Promise<M.AdWalletResponse> {
    return retrofitCall({"base":"node","http":"GET","path":"api/node/ads/wallet","ret":{"k":"obj","c":"AdWalletResponse"}}, [] as CallParam[]);
  },
  topup(amount: number): Promise<M.AdTopupResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/ads/wallet/topup","form":true,"ret":{"k":"obj","c":"AdTopupResponse"}}, [{ ...{"kind":"Field","name":"amount","arg":"amount"}, value: amount }] as CallParam[]);
  },
  getChannels(): Promise<M.AdChannelsResponse> {
    return retrofitCall({"base":"node","http":"GET","path":"api/node/ads/channels","ret":{"k":"obj","c":"AdChannelsResponse"}}, [] as CallParam[]);
  },
  getCampaigns(channelId: number | null = null): Promise<M.AdCampaignsResponse> {
    return retrofitCall({"base":"node","http":"GET","path":"api/node/ads/campaigns","ret":{"k":"obj","c":"AdCampaignsResponse"}}, [{ ...{"kind":"Query","name":"channel_id","arg":"channelId"}, value: channelId }] as CallParam[]);
  },
  createCampaign(channelId: number, title: string, pitch: string, ctaLabel: string | null = null, placement: string = "channel_feed", pricing: string = "cpc", bidStars: number | null = null, budgetStars: number, targetLangs: Array<string> = []): Promise<M.AdCampaignResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/ads/campaigns","form":true,"ret":{"k":"obj","c":"AdCampaignResponse"}}, [{ ...{"kind":"Field","name":"channel_id","arg":"channelId"}, value: channelId }, { ...{"kind":"Field","name":"title","arg":"title"}, value: title }, { ...{"kind":"Field","name":"pitch","arg":"pitch"}, value: pitch }, { ...{"kind":"Field","name":"cta_label","arg":"ctaLabel"}, value: ctaLabel }, { ...{"kind":"Field","name":"placement","arg":"placement"}, value: placement }, { ...{"kind":"Field","name":"pricing","arg":"pricing"}, value: pricing }, { ...{"kind":"Field","name":"bid_stars","arg":"bidStars"}, value: bidStars }, { ...{"kind":"Field","name":"budget_stars","arg":"budgetStars"}, value: budgetStars }, { ...{"kind":"Field","name":"target_langs[]","arg":"targetLangs"}, value: targetLangs }] as CallParam[]);
  },
  updateCampaign(id: number, title: string | null = null, pitch: string | null = null, ctaLabel: string | null = null, bidStars: number | null = null, budgetStars: number | null = null, targetLangs: Array<string> | null = null): Promise<M.AdCampaignResponse> {
    return retrofitCall({"base":"node","http":"PUT","path":"api/node/ads/campaigns/{id}","form":true,"ret":{"k":"obj","c":"AdCampaignResponse"}}, [{ ...{"kind":"Path","name":"id","arg":"id","encoded":false}, value: id }, { ...{"kind":"Field","name":"title","arg":"title"}, value: title }, { ...{"kind":"Field","name":"pitch","arg":"pitch"}, value: pitch }, { ...{"kind":"Field","name":"cta_label","arg":"ctaLabel"}, value: ctaLabel }, { ...{"kind":"Field","name":"bid_stars","arg":"bidStars"}, value: bidStars }, { ...{"kind":"Field","name":"budget_stars","arg":"budgetStars"}, value: budgetStars }, { ...{"kind":"Field","name":"target_langs[]","arg":"targetLangs"}, value: targetLangs }] as CallParam[]);
  },
  campaignAction(id: number, action: string): Promise<M.AdStatusResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/ads/campaigns/{id}/status","form":true,"ret":{"k":"obj","c":"AdStatusResponse"}}, [{ ...{"kind":"Path","name":"id","arg":"id","encoded":false}, value: id }, { ...{"kind":"Field","name":"action","arg":"action"}, value: action }] as CallParam[]);
  },
  getCampaignStats(id: number, days: number = 14): Promise<M.AdStatsResponse> {
    return retrofitCall({"base":"node","http":"GET","path":"api/node/ads/campaigns/{id}/stats","ret":{"k":"obj","c":"AdStatsResponse"}}, [{ ...{"kind":"Path","name":"id","arg":"id","encoded":false}, value: id }, { ...{"kind":"Query","name":"days","arg":"days"}, value: days }] as CallParam[]);
  },
  serve(placement: string, channelId: number | null = null, lang: string | null = null, limit: number = 1, preview: number = 1): Promise<M.AdServeResponse> {
    return retrofitCall({"base":"node","http":"GET","path":"api/node/ads/serve","ret":{"k":"obj","c":"AdServeResponse"}}, [{ ...{"kind":"Query","name":"placement","arg":"placement"}, value: placement }, { ...{"kind":"Query","name":"channel_id","arg":"channelId"}, value: channelId }, { ...{"kind":"Query","name":"lang","arg":"lang"}, value: lang }, { ...{"kind":"Query","name":"limit","arg":"limit"}, value: limit }, { ...{"kind":"Query","name":"preview","arg":"preview"}, value: preview }] as CallParam[]);
  },
  trackEvent(campaignId: number, kind: string): Promise<M.AdEventResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/ads/event","form":true,"ret":{"k":"obj","c":"AdEventResponse"}}, [{ ...{"kind":"Field","name":"campaign_id","arg":"campaignId"}, value: campaignId }, { ...{"kind":"Field","name":"kind","arg":"kind"}, value: kind }] as CallParam[]);
  },
  getSettings(): Promise<M.AdSettingsResponse> {
    return retrofitCall({"base":"node","http":"GET","path":"api/node/ads/admin/settings","ret":{"k":"obj","c":"AdSettingsResponse"}}, [] as CallParam[]);
  },
  saveSettings(adsEnabled: number | null = null, commissionPct: number | null = null, cpmStars: number | null = null, cpcStars: number | null = null, freqCap: number | null = null, minBudget: number | null = null, autoApprove: number | null = null, autoMinSubs: number | null = null, autoVerified: number | null = null, bannedKeywords: string | null = null): Promise<M.AdSettingsResponse> {
    return retrofitCall({"base":"node","http":"PUT","path":"api/node/ads/admin/settings","form":true,"ret":{"k":"obj","c":"AdSettingsResponse"}}, [{ ...{"kind":"Field","name":"ads_enabled","arg":"adsEnabled"}, value: adsEnabled }, { ...{"kind":"Field","name":"platform_commission_pct","arg":"commissionPct"}, value: commissionPct }, { ...{"kind":"Field","name":"cpm_stars","arg":"cpmStars"}, value: cpmStars }, { ...{"kind":"Field","name":"cpc_stars","arg":"cpcStars"}, value: cpcStars }, { ...{"kind":"Field","name":"freq_cap_per_day","arg":"freqCap"}, value: freqCap }, { ...{"kind":"Field","name":"min_budget_stars","arg":"minBudget"}, value: minBudget }, { ...{"kind":"Field","name":"auto_approve","arg":"autoApprove"}, value: autoApprove }, { ...{"kind":"Field","name":"auto_approve_min_subs","arg":"autoMinSubs"}, value: autoMinSubs }, { ...{"kind":"Field","name":"auto_approve_verified","arg":"autoVerified"}, value: autoVerified }, { ...{"kind":"Field","name":"banned_keywords","arg":"bannedKeywords"}, value: bannedKeywords }] as CallParam[]);
  },
  getModeration(): Promise<M.AdModerationResponse> {
    return retrofitCall({"base":"node","http":"GET","path":"api/node/ads/admin/moderation","ret":{"k":"obj","c":"AdModerationResponse"}}, [] as CallParam[]);
  },
  moderate(id: number, action: string, note: string | null = null): Promise<M.AdStatusResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/ads/admin/moderation/{id}","form":true,"ret":{"k":"obj","c":"AdStatusResponse"}}, [{ ...{"kind":"Path","name":"id","arg":"id","encoded":false}, value: id }, { ...{"kind":"Field","name":"action","arg":"action"}, value: action }, { ...{"kind":"Field","name":"note","arg":"note"}, value: note }] as CallParam[]);
  },
};

/** network/NodeApi.kt */
export const NodeApi = {
  getMessages(recipientId: number, limit: number = 30, beforeMessageId: number = 0, afterMessageId: number = 0, messageId: number = 0, isBusinessChat: number = 0): Promise<M.NodeMessageListResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/chat/get","form":true,"ret":{"k":"obj","c":"NodeMessageListResponse"}}, [{ ...{"kind":"Field","name":"recipient_id","arg":"recipientId"}, value: recipientId }, { ...{"kind":"Field","name":"limit","arg":"limit"}, value: limit }, { ...{"kind":"Field","name":"before_message_id","arg":"beforeMessageId"}, value: beforeMessageId }, { ...{"kind":"Field","name":"after_message_id","arg":"afterMessageId"}, value: afterMessageId }, { ...{"kind":"Field","name":"message_id","arg":"messageId"}, value: messageId }, { ...{"kind":"Field","name":"is_business_chat","arg":"isBusinessChat"}, value: isBusinessChat }] as CallParam[]);
  },
  sendMessage(recipientId: number, text: string, replyId: number | null = null, replyToText: string | null = null, replyToName: string | null = null, storyId: number | null = null, stickers: string | null = null, lat: string | null = null, lng: string | null = null, contact: string | null = null, iv: string | null = null, tag: string | null = null, signalHeader: string | null = null, cipherVersion: number | null = null, isBusinessChat: number = 0, clientMsgId: string | null = null, forwardedChannelId: number | null = null, forwardedPostId: number | null = null): Promise<M.NodeMessageResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/chat/send","form":true,"ret":{"k":"obj","c":"NodeMessageResponse"}}, [{ ...{"kind":"Field","name":"recipient_id","arg":"recipientId"}, value: recipientId }, { ...{"kind":"Field","name":"text","arg":"text"}, value: text }, { ...{"kind":"Field","name":"reply_id","arg":"replyId"}, value: replyId }, { ...{"kind":"Field","name":"reply_to_text","arg":"replyToText"}, value: replyToText }, { ...{"kind":"Field","name":"reply_to_name","arg":"replyToName"}, value: replyToName }, { ...{"kind":"Field","name":"story_id","arg":"storyId"}, value: storyId }, { ...{"kind":"Field","name":"stickers","arg":"stickers"}, value: stickers }, { ...{"kind":"Field","name":"lat","arg":"lat"}, value: lat }, { ...{"kind":"Field","name":"lng","arg":"lng"}, value: lng }, { ...{"kind":"Field","name":"contact","arg":"contact"}, value: contact }, { ...{"kind":"Field","name":"iv","arg":"iv"}, value: iv }, { ...{"kind":"Field","name":"tag","arg":"tag"}, value: tag }, { ...{"kind":"Field","name":"signal_header","arg":"signalHeader"}, value: signalHeader }, { ...{"kind":"Field","name":"cipher_version","arg":"cipherVersion"}, value: cipherVersion }, { ...{"kind":"Field","name":"is_business_chat","arg":"isBusinessChat"}, value: isBusinessChat }, { ...{"kind":"Field","name":"client_msg_id","arg":"clientMsgId"}, value: clientMsgId }, { ...{"kind":"Field","name":"forwarded_channel_id","arg":"forwardedChannelId"}, value: forwardedChannelId }, { ...{"kind":"Field","name":"forwarded_post_id","arg":"forwardedPostId"}, value: forwardedPostId }] as CallParam[]);
  },
  aiSummary(request: M.AiSummaryRequest): Promise<M.AiSummaryResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/ai/summary","ret":{"k":"obj","c":"AiSummaryResponse"}}, [{ ...{"kind":"Body","name":null,"arg":"request","schema":"AiSummaryRequest"}, value: request }] as CallParam[]);
  },
  sendMediaMessage(recipientId: number = 0, groupId: number = 0, mediaUrl: string, mediaType: string, mediaFileName: string = "", messageHashId: string = "", replyId: number = 0, caption: string = "", forwardedChannelId: number | null = null, forwardedPostId: number | null = null): Promise<M.NodeMessageResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/chat/send-media","form":true,"ret":{"k":"obj","c":"NodeMessageResponse"}}, [{ ...{"kind":"Field","name":"recipient_id","arg":"recipientId"}, value: recipientId }, { ...{"kind":"Field","name":"group_id","arg":"groupId"}, value: groupId }, { ...{"kind":"Field","name":"media_url","arg":"mediaUrl"}, value: mediaUrl }, { ...{"kind":"Field","name":"media_type","arg":"mediaType"}, value: mediaType }, { ...{"kind":"Field","name":"media_file_name","arg":"mediaFileName"}, value: mediaFileName }, { ...{"kind":"Field","name":"message_hash_id","arg":"messageHashId"}, value: messageHashId }, { ...{"kind":"Field","name":"reply_id","arg":"replyId"}, value: replyId }, { ...{"kind":"Field","name":"caption","arg":"caption"}, value: caption }, { ...{"kind":"Field","name":"forwarded_channel_id","arg":"forwardedChannelId"}, value: forwardedChannelId }, { ...{"kind":"Field","name":"forwarded_post_id","arg":"forwardedPostId"}, value: forwardedPostId }] as CallParam[]);
  },
  uploadChatMedia(type: RequestBodyLike, file: MultipartPart, quality: RequestBodyLike | null = null): Promise<M.XhrUploadResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/chat/upload","multipart":true,"ret":{"k":"obj","c":"XhrUploadResponse"}}, [{ ...{"kind":"Part","name":"type","arg":"type"}, value: type }, { ...{"kind":"Part","name":null,"arg":"file"}, value: file }, { ...{"kind":"Part","name":"quality","arg":"quality"}, value: quality }] as CallParam[]);
  },
  notifyMediaMessage(recipientId: number, messageId: number = 0): Promise<M.NodeSimpleResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/chat/notify-media","form":true,"ret":{"k":"obj","c":"NodeSimpleResponse"}}, [{ ...{"kind":"Field","name":"recipient_id","arg":"recipientId"}, value: recipientId }, { ...{"kind":"Field","name":"message_id","arg":"messageId"}, value: messageId }] as CallParam[]);
  },
  loadMore(recipientId: number, beforeMessageId: number, limit: number = 15, isBusinessChat: number = 0): Promise<M.NodeMessageListResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/chat/loadmore","form":true,"ret":{"k":"obj","c":"NodeMessageListResponse"}}, [{ ...{"kind":"Field","name":"recipient_id","arg":"recipientId"}, value: recipientId }, { ...{"kind":"Field","name":"before_message_id","arg":"beforeMessageId"}, value: beforeMessageId }, { ...{"kind":"Field","name":"limit","arg":"limit"}, value: limit }, { ...{"kind":"Field","name":"is_business_chat","arg":"isBusinessChat"}, value: isBusinessChat }] as CallParam[]);
  },
  editMessage(messageId: number, text: string, iv: string | null = null, tag: string | null = null, cipherVersion: number | null = null, signalHeader: string | null = null): Promise<M.NodeSimpleResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/chat/edit","form":true,"ret":{"k":"obj","c":"NodeSimpleResponse"}}, [{ ...{"kind":"Field","name":"message_id","arg":"messageId"}, value: messageId }, { ...{"kind":"Field","name":"text","arg":"text"}, value: text }, { ...{"kind":"Field","name":"iv","arg":"iv"}, value: iv }, { ...{"kind":"Field","name":"tag","arg":"tag"}, value: tag }, { ...{"kind":"Field","name":"cipher_version","arg":"cipherVersion"}, value: cipherVersion }, { ...{"kind":"Field","name":"signal_header","arg":"signalHeader"}, value: signalHeader }] as CallParam[]);
  },
  searchMessages(recipientId: number, query: string, limit: number = 50, offset: number = 0): Promise<M.NodeMessageListResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/chat/search","form":true,"ret":{"k":"obj","c":"NodeMessageListResponse"}}, [{ ...{"kind":"Field","name":"recipient_id","arg":"recipientId"}, value: recipientId }, { ...{"kind":"Field","name":"query","arg":"query"}, value: query }, { ...{"kind":"Field","name":"limit","arg":"limit"}, value: limit }, { ...{"kind":"Field","name":"offset","arg":"offset"}, value: offset }] as CallParam[]);
  },
  markSeen(recipientId: number): Promise<M.NodeSimpleResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/chat/seen","form":true,"ret":{"k":"obj","c":"NodeSimpleResponse"}}, [{ ...{"kind":"Field","name":"recipient_id","arg":"recipientId"}, value: recipientId }] as CallParam[]);
  },
  sendTyping(recipientId: number, typing: string): Promise<M.NodeSimpleResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/chat/typing","form":true,"ret":{"k":"obj","c":"NodeSimpleResponse"}}, [{ ...{"kind":"Field","name":"recipient_id","arg":"recipientId"}, value: recipientId }, { ...{"kind":"Field","name":"typing","arg":"typing"}, value: typing }] as CallParam[]);
  },
  sendUserAction(recipientId: number, action: string): Promise<M.NodeSimpleResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/chat/user-action","form":true,"ret":{"k":"obj","c":"NodeSimpleResponse"}}, [{ ...{"kind":"Field","name":"recipient_id","arg":"recipientId"}, value: recipientId }, { ...{"kind":"Field","name":"action","arg":"action"}, value: action }] as CallParam[]);
  },
  getUserStatus(userId: number): Promise<M.NodeUserStatusResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/user/status","form":true,"ret":{"k":"obj","c":"NodeUserStatusResponse"}}, [{ ...{"kind":"Field","name":"user_id","arg":"userId"}, value: userId }] as CallParam[]);
  },
  getMyCustomStatus(): Promise<M.NodeCustomStatusResponse> {
    return retrofitCall({"base":"node","http":"GET","path":"api/node/users/me/status","ret":{"k":"obj","c":"NodeCustomStatusResponse"}}, [] as CallParam[]);
  },
  updateCustomStatus(statusEmoji: string | null, statusText: string | null): Promise<M.NodeCustomStatusResponse> {
    return retrofitCall({"base":"node","http":"PUT","path":"api/node/users/me/status","form":true,"ret":{"k":"obj","c":"NodeCustomStatusResponse"}}, [{ ...{"kind":"Field","name":"status_emoji","arg":"statusEmoji"}, value: statusEmoji }, { ...{"kind":"Field","name":"status_text","arg":"statusText"}, value: statusText }] as CallParam[]);
  },
  getThemeProfile(platform: string): Promise<M.NodeThemeProfileResponse> {
    return retrofitCall({"base":"node","http":"GET","path":"api/node/theme/profile","ret":{"k":"obj","c":"NodeThemeProfileResponse"}}, [{ ...{"kind":"Query","name":"platform","arg":"platform"}, value: platform }] as CallParam[]);
  },
  putThemeProfile(platform: string, themeKey: string, bubbleStyle: string | null = null, backgroundId: string | null = null, font: string | null = null): Promise<M.NodeSimpleResponse> {
    return retrofitCall({"base":"node","http":"PUT","path":"api/node/theme/profile","form":true,"ret":{"k":"obj","c":"NodeSimpleResponse"}}, [{ ...{"kind":"Field","name":"platform","arg":"platform"}, value: platform }, { ...{"kind":"Field","name":"theme_key","arg":"themeKey"}, value: themeKey }, { ...{"kind":"Field","name":"bubble_style","arg":"bubbleStyle"}, value: bubbleStyle }, { ...{"kind":"Field","name":"background_id","arg":"backgroundId"}, value: backgroundId }, { ...{"kind":"Field","name":"font","arg":"font"}, value: font }] as CallParam[]);
  },
  shareThemeProfile(platform: string, themeKey: string, bubbleStyle: string | null = null, backgroundId: string | null = null, font: string | null = null): Promise<M.NodeThemeShareResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/theme/profile/share","form":true,"ret":{"k":"obj","c":"NodeThemeShareResponse"}}, [{ ...{"kind":"Field","name":"platform","arg":"platform"}, value: platform }, { ...{"kind":"Field","name":"theme_key","arg":"themeKey"}, value: themeKey }, { ...{"kind":"Field","name":"bubble_style","arg":"bubbleStyle"}, value: bubbleStyle }, { ...{"kind":"Field","name":"background_id","arg":"backgroundId"}, value: backgroundId }, { ...{"kind":"Field","name":"font","arg":"font"}, value: font }] as CallParam[]);
  },
  getSharedThemeProfile(code: string): Promise<M.NodeThemeShareLookupResponse> {
    return retrofitCall({"base":"node","http":"GET","path":"api/node/theme/share/{code}","ret":{"k":"obj","c":"NodeThemeShareLookupResponse"}}, [{ ...{"kind":"Path","name":"code","arg":"code","encoded":false}, value: code }] as CallParam[]);
  },
  getPublicFont(userId: number): Promise<M.NodePublicFontResponse> {
    return retrofitCall({"base":"node","http":"GET","path":"api/node/theme/public-font/{userId}","ret":{"k":"obj","c":"NodePublicFontResponse"}}, [{ ...{"kind":"Path","name":"userId","arg":"userId","encoded":false}, value: userId }] as CallParam[]);
  },
  getUserAvatars(userId: number): Promise<M.UserAvatarListResponse> {
    return retrofitCall({"base":"node","http":"GET","path":"api/node/user/avatars/{userId}","ret":{"k":"obj","c":"UserAvatarListResponse"}}, [{ ...{"kind":"Path","name":"userId","arg":"userId","encoded":false}, value: userId }] as CallParam[]);
  },
  uploadAvatar(avatar: MultipartPart, setAsMain?: RequestBodyLike): Promise<M.UserAvatarUploadResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/user/avatars/upload","multipart":true,"ret":{"k":"obj","c":"UserAvatarUploadResponse"}}, [{ ...{"kind":"Part","name":null,"arg":"avatar"}, value: avatar }, { ...{"kind":"Part","name":"set_as_main","arg":"setAsMain"}, value: setAsMain }] as CallParam[]);
  },
  setMainAvatar(avatarId: number): Promise<M.UserAvatarSimpleResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/user/avatars/{id}/set-main","ret":{"k":"obj","c":"UserAvatarSimpleResponse"}}, [{ ...{"kind":"Path","name":"id","arg":"avatarId","encoded":false}, value: avatarId }] as CallParam[]);
  },
  reorderAvatars(ids: Array<number>): Promise<M.UserAvatarSimpleResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/user/avatars/reorder","form":true,"ret":{"k":"obj","c":"UserAvatarSimpleResponse"}}, [{ ...{"kind":"Field","name":"ids[]","arg":"ids"}, value: ids }] as CallParam[]);
  },
  deleteAvatar(avatarId: number): Promise<M.UserAvatarSimpleResponse> {
    return retrofitCall({"base":"node","http":"DELETE","path":"api/node/user/avatars/{id}","ret":{"k":"obj","c":"UserAvatarSimpleResponse"}}, [{ ...{"kind":"Path","name":"id","arg":"avatarId","encoded":false}, value: avatarId }] as CallParam[]);
  },
  deleteMessage(messageId: number, deleteType: string = "just_me"): Promise<M.NodeSimpleResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/chat/delete","form":true,"ret":{"k":"obj","c":"NodeSimpleResponse"}}, [{ ...{"kind":"Field","name":"message_id","arg":"messageId"}, value: messageId }, { ...{"kind":"Field","name":"delete_type","arg":"deleteType"}, value: deleteType }] as CallParam[]);
  },
  reactToMessage(messageId: number, reaction: string): Promise<M.NodeReactResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/chat/react","form":true,"ret":{"k":"obj","c":"NodeReactResponse"}}, [{ ...{"kind":"Field","name":"message_id","arg":"messageId"}, value: messageId }, { ...{"kind":"Field","name":"reaction","arg":"reaction"}, value: reaction }] as CallParam[]);
  },
  pinMessage(messageId: number, chatId: number, pin: string = "yes"): Promise<M.NodeSimpleResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/chat/pin","form":true,"ret":{"k":"obj","c":"NodeSimpleResponse"}}, [{ ...{"kind":"Field","name":"message_id","arg":"messageId"}, value: messageId }, { ...{"kind":"Field","name":"chat_id","arg":"chatId"}, value: chatId }, { ...{"kind":"Field","name":"pin","arg":"pin"}, value: pin }] as CallParam[]);
  },
  getPinnedMessages(chatId: number): Promise<M.NodeMessageListResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/chat/pinned","form":true,"ret":{"k":"obj","c":"NodeMessageListResponse"}}, [{ ...{"kind":"Field","name":"chat_id","arg":"chatId"}, value: chatId }] as CallParam[]);
  },
  forwardMessage(messageId: number, recipientIds: string): Promise<M.NodeForwardResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/chat/forward","form":true,"ret":{"k":"obj","c":"NodeForwardResponse"}}, [{ ...{"kind":"Field","name":"message_id","arg":"messageId"}, value: messageId }, { ...{"kind":"Field","name":"recipient_ids","arg":"recipientIds"}, value: recipientIds }] as CallParam[]);
  },
  getChats(limit: number = 30, offset: number = 0, showArchived: string = "false", showHidden: string = "false"): Promise<M.NodeChatListResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/chat/chats","form":true,"ret":{"k":"obj","c":"NodeChatListResponse"}}, [{ ...{"kind":"Field","name":"limit","arg":"limit"}, value: limit }, { ...{"kind":"Field","name":"offset","arg":"offset"}, value: offset }, { ...{"kind":"Field","name":"show_archived","arg":"showArchived"}, value: showArchived }, { ...{"kind":"Field","name":"show_hidden","arg":"showHidden"}, value: showHidden }] as CallParam[]);
  },
  getBusinessChats(limit: number = 30, offset: number = 0): Promise<M.NodeChatListResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/chat/business-chats","form":true,"ret":{"k":"obj","c":"NodeChatListResponse"}}, [{ ...{"kind":"Field","name":"limit","arg":"limit"}, value: limit }, { ...{"kind":"Field","name":"offset","arg":"offset"}, value: offset }] as CallParam[]);
  },
  getBusinessInbox(limit: number = 50, offset: number = 0): Promise<M.NodeChatListResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/chat/business-inbox","form":true,"ret":{"k":"obj","c":"NodeChatListResponse"}}, [{ ...{"kind":"Field","name":"limit","arg":"limit"}, value: limit }, { ...{"kind":"Field","name":"offset","arg":"offset"}, value: offset }] as CallParam[]);
  },
  deleteConversation(userId: number, deleteType: string = "me"): Promise<M.NodeSimpleResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/chat/delete-conversation","form":true,"ret":{"k":"obj","c":"NodeSimpleResponse"}}, [{ ...{"kind":"Field","name":"user_id","arg":"userId"}, value: userId }, { ...{"kind":"Field","name":"delete_type","arg":"deleteType"}, value: deleteType }] as CallParam[]);
  },
  archiveChat(chatId: number, archive: string): Promise<M.NodeSimpleResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/chat/archive","form":true,"ret":{"k":"obj","c":"NodeSimpleResponse"}}, [{ ...{"kind":"Field","name":"chat_id","arg":"chatId"}, value: chatId }, { ...{"kind":"Field","name":"archive","arg":"archive"}, value: archive }] as CallParam[]);
  },
  muteChat(chatId: number, notify: string, callChat: string = "yes"): Promise<M.NodeSimpleResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/chat/mute","form":true,"ret":{"k":"obj","c":"NodeSimpleResponse"}}, [{ ...{"kind":"Field","name":"chat_id","arg":"chatId"}, value: chatId }, { ...{"kind":"Field","name":"notify","arg":"notify"}, value: notify }, { ...{"kind":"Field","name":"call_chat","arg":"callChat"}, value: callChat }] as CallParam[]);
  },
  pinChat(chatId: number, pin: string): Promise<M.NodeSimpleResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/chat/pin-chat","form":true,"ret":{"k":"obj","c":"NodeSimpleResponse"}}, [{ ...{"kind":"Field","name":"chat_id","arg":"chatId"}, value: chatId }, { ...{"kind":"Field","name":"pin","arg":"pin"}, value: pin }] as CallParam[]);
  },
  changeChatColor(userId: number, color: string): Promise<M.NodeSimpleResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/chat/color","form":true,"ret":{"k":"obj","c":"NodeSimpleResponse"}}, [{ ...{"kind":"Field","name":"user_id","arg":"userId"}, value: userId }, { ...{"kind":"Field","name":"color","arg":"color"}, value: color }] as CallParam[]);
  },
  readChat(recipientId: number): Promise<M.NodeSimpleResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/chat/read","form":true,"ret":{"k":"obj","c":"NodeSimpleResponse"}}, [{ ...{"kind":"Field","name":"recipient_id","arg":"recipientId"}, value: recipientId }] as CallParam[]);
  },
  clearHistory(recipientId: number, clearType: string = "just_me"): Promise<M.NodeSimpleResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/chat/clear-history","form":true,"ret":{"k":"obj","c":"NodeSimpleResponse"}}, [{ ...{"kind":"Field","name":"recipient_id","arg":"recipientId"}, value: recipientId }, { ...{"kind":"Field","name":"clear_type","arg":"clearType"}, value: clearType }] as CallParam[]);
  },
  hideChat(chatId: number, hidden: string): Promise<M.NodeSimpleResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/chat/hide","form":true,"ret":{"k":"obj","c":"NodeSimpleResponse"}}, [{ ...{"kind":"Field","name":"chat_id","arg":"chatId"}, value: chatId }, { ...{"kind":"Field","name":"hidden","arg":"hidden"}, value: hidden }] as CallParam[]);
  },
  getHiddenChatsCount(): Promise<M.NodeCountResponse> {
    return retrofitCall({"base":"node","http":"GET","path":"api/node/chat/hidden/count","ret":{"k":"obj","c":"NodeCountResponse"}}, [] as CallParam[]);
  },
  getMuteStatus(chatId: number): Promise<M.NodeMuteStatusResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/chat/mute-status","form":true,"ret":{"k":"obj","c":"NodeMuteStatusResponse"}}, [{ ...{"kind":"Field","name":"chat_id","arg":"chatId"}, value: chatId }] as CallParam[]);
  },
  getMediaAutoDeleteSetting(chatId: number): Promise<M.MediaAutoDeleteSettingResponse> {
    return retrofitCall({"base":"node","http":"GET","path":"api/node/chat/media-auto-delete-setting","ret":{"k":"obj","c":"MediaAutoDeleteSettingResponse"}}, [{ ...{"kind":"Query","name":"chat_id","arg":"chatId"}, value: chatId }] as CallParam[]);
  },
  setMediaAutoDeleteSetting(chatId: number, seconds: number): Promise<M.MediaAutoDeleteSettingResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/chat/media-auto-delete-setting","form":true,"ret":{"k":"obj","c":"MediaAutoDeleteSettingResponse"}}, [{ ...{"kind":"Field","name":"chat_id","arg":"chatId"}, value: chatId }, { ...{"kind":"Field","name":"seconds","arg":"seconds"}, value: seconds }] as CallParam[]);
  },
  getVideoQualities(originalUrl: string): Promise<M.VideoQualitiesResponse> {
    return retrofitCall({"base":"node","http":"GET","path":"api/node/chat/video-qualities","ret":{"k":"obj","c":"VideoQualitiesResponse"}}, [{ ...{"kind":"Query","name":"url","arg":"originalUrl"}, value: originalUrl }] as CallParam[]);
  },
  favMessage(messageId: number, chatId: number, fav: string): Promise<M.NodeSimpleResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/chat/fav","form":true,"ret":{"k":"obj","c":"NodeSimpleResponse"}}, [{ ...{"kind":"Field","name":"message_id","arg":"messageId"}, value: messageId }, { ...{"kind":"Field","name":"chat_id","arg":"chatId"}, value: chatId }, { ...{"kind":"Field","name":"fav","arg":"fav"}, value: fav }] as CallParam[]);
  },
  getFavMessages(chatId: number, limit: number = 50, offset: number = 0): Promise<M.NodeMessageListResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/chat/fav-list","form":true,"ret":{"k":"obj","c":"NodeMessageListResponse"}}, [{ ...{"kind":"Field","name":"chat_id","arg":"chatId"}, value: chatId }, { ...{"kind":"Field","name":"limit","arg":"limit"}, value: limit }, { ...{"kind":"Field","name":"offset","arg":"offset"}, value: offset }] as CallParam[]);
  },
  saveMessage(messageId: number, chatType: string, chatId: number, chatName: string, senderName: string, text: string | null = null, mediaUrl: string | null = null, mediaType: string | null = null, originalTime: number = 0): Promise<M.NodeSavedMessageResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/chat/saved/save","form":true,"ret":{"k":"obj","c":"NodeSavedMessageResponse"}}, [{ ...{"kind":"Field","name":"message_id","arg":"messageId"}, value: messageId }, { ...{"kind":"Field","name":"chat_type","arg":"chatType"}, value: chatType }, { ...{"kind":"Field","name":"chat_id","arg":"chatId"}, value: chatId }, { ...{"kind":"Field","name":"chat_name","arg":"chatName"}, value: chatName }, { ...{"kind":"Field","name":"sender_name","arg":"senderName"}, value: senderName }, { ...{"kind":"Field","name":"text","arg":"text"}, value: text }, { ...{"kind":"Field","name":"media_url","arg":"mediaUrl"}, value: mediaUrl }, { ...{"kind":"Field","name":"media_type","arg":"mediaType"}, value: mediaType }, { ...{"kind":"Field","name":"original_time","arg":"originalTime"}, value: originalTime }] as CallParam[]);
  },
  unsaveMessage(messageId: number, chatType: string): Promise<M.NodeSimpleResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/chat/saved/unsave","form":true,"ret":{"k":"obj","c":"NodeSimpleResponse"}}, [{ ...{"kind":"Field","name":"message_id","arg":"messageId"}, value: messageId }, { ...{"kind":"Field","name":"chat_type","arg":"chatType"}, value: chatType }] as CallParam[]);
  },
  listSaved(limit: number = 200, offset: number = 0): Promise<M.NodeSavedListResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/chat/saved/list","form":true,"ret":{"k":"obj","c":"NodeSavedListResponse"}}, [{ ...{"kind":"Field","name":"limit","arg":"limit"}, value: limit }, { ...{"kind":"Field","name":"offset","arg":"offset"}, value: offset }] as CallParam[]);
  },
  clearSaved(): Promise<M.NodeSimpleResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/chat/saved/clear","ret":{"k":"obj","c":"NodeSimpleResponse"}}, [] as CallParam[]);
  },
  globalSearch(query: string, limit: number = 50, offset: number = 0, dateFrom: number | null = null, dateTo: number | null = null, fromId: number | null = null, msgType: string | null = null): Promise<M.NodeGlobalSearchResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/search/global","form":true,"ret":{"k":"obj","c":"NodeGlobalSearchResponse"}}, [{ ...{"kind":"Field","name":"query","arg":"query"}, value: query }, { ...{"kind":"Field","name":"limit","arg":"limit"}, value: limit }, { ...{"kind":"Field","name":"offset","arg":"offset"}, value: offset }, { ...{"kind":"Field","name":"date_from","arg":"dateFrom"}, value: dateFrom }, { ...{"kind":"Field","name":"date_to","arg":"dateTo"}, value: dateTo }, { ...{"kind":"Field","name":"from_id","arg":"fromId"}, value: fromId }, { ...{"kind":"Field","name":"msg_type","arg":"msgType"}, value: msgType }] as CallParam[]);
  },
  searchUsers(query: string, limit: number = 30): Promise<M.NodeUserSearchResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/search/users","form":true,"ret":{"k":"obj","c":"NodeUserSearchResponse"}}, [{ ...{"kind":"Field","name":"query","arg":"query"}, value: query }, { ...{"kind":"Field","name":"limit","arg":"limit"}, value: limit }] as CallParam[]);
  },
  getSearchSuggestions(query: string): Promise<M.SearchSuggestionsResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/search/suggestions","form":true,"ret":{"k":"obj","c":"SearchSuggestionsResponse"}}, [{ ...{"kind":"Field","name":"query","arg":"query"}, value: query }] as CallParam[]);
  },
  listSavedSearches(): Promise<M.SavedSearchesResponse> {
    return retrofitCall({"base":"node","http":"GET","path":"api/node/search/saved","ret":{"k":"obj","c":"SavedSearchesResponse"}}, [] as CallParam[]);
  },
  saveSearch(query: string): Promise<M.SavedSearchResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/search/saved","form":true,"ret":{"k":"obj","c":"SavedSearchResponse"}}, [{ ...{"kind":"Field","name":"query","arg":"query"}, value: query }] as CallParam[]);
  },
  deleteSavedSearch(id: number): Promise<M.SavedSearchResponse> {
    return retrofitCall({"base":"node","http":"DELETE","path":"api/node/search/saved/{id}","ret":{"k":"obj","c":"SavedSearchResponse"}}, [{ ...{"kind":"Path","name":"id","arg":"id","encoded":false}, value: id }] as CallParam[]);
  },
  saveRecentSearch(query: string): Promise<M.SavedSearchResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/search/recent","form":true,"ret":{"k":"obj","c":"SavedSearchResponse"}}, [{ ...{"kind":"Field","name":"query","arg":"query"}, value: query }] as CallParam[]);
  },
  clearRecentSearches(): Promise<M.SavedSearchResponse> {
    return retrofitCall({"base":"node","http":"DELETE","path":"api/node/search/recent","ret":{"k":"obj","c":"SavedSearchResponse"}}, [] as CallParam[]);
  },
  listNotes(limit: number = 50, offset: number = 0): Promise<M.NodeNotesListResponse> {
    return retrofitCall({"base":"node","http":"GET","path":"api/node/notes","ret":{"k":"obj","c":"NodeNotesListResponse"}}, [{ ...{"kind":"Query","name":"limit","arg":"limit"}, value: limit }, { ...{"kind":"Query","name":"offset","arg":"offset"}, value: offset }] as CallParam[]);
  },
  createNote(text: string): Promise<M.NodeNoteResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/notes/create","form":true,"ret":{"k":"obj","c":"NodeNoteResponse"}}, [{ ...{"kind":"Field","name":"text","arg":"text"}, value: text }] as CallParam[]);
  },
  deleteNote(id: number): Promise<M.NodeSimpleResponse> {
    return retrofitCall({"base":"node","http":"DELETE","path":"api/node/notes/{id}","ret":{"k":"obj","c":"NodeSimpleResponse"}}, [{ ...{"kind":"Path","name":"id","arg":"id","encoded":false}, value: id }] as CallParam[]);
  },
  getNotesStorage(): Promise<M.NodeNotesStorageResponse> {
    return retrofitCall({"base":"node","http":"GET","path":"api/node/notes/storage","ret":{"k":"obj","c":"NodeNotesStorageResponse"}}, [] as CallParam[]);
  },
  updateTwoFactor(type: string = "", secret: string = "", code: string = "", factorMethod: string = ""): Promise<M.NodeSimpleResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/user/2fa","form":true,"ret":{"k":"obj","c":"NodeSimpleResponse"}}, [{ ...{"kind":"Field","name":"type","arg":"type"}, value: type }, { ...{"kind":"Field","name":"secret","arg":"secret"}, value: secret }, { ...{"kind":"Field","name":"code","arg":"code"}, value: code }, { ...{"kind":"Field","name":"factor_method","arg":"factorMethod"}, value: factorMethod }] as CallParam[]);
  },
  restoreAccount(login: string, password: string): Promise<M.NodeSimpleResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/user/account/restore","form":true,"ret":{"k":"obj","c":"NodeSimpleResponse"}}, [{ ...{"kind":"Field","name":"login","arg":"login"}, value: login }, { ...{"kind":"Field","name":"password","arg":"password"}, value: password }] as CallParam[]);
  },
  reportUser(userId: number, text: string): Promise<M.NodeSimpleResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/user/report","form":true,"ret":{"k":"obj","c":"NodeSimpleResponse"}}, [{ ...{"kind":"Field","name":"user_id","arg":"userId"}, value: userId }, { ...{"kind":"Field","name":"text","arg":"text"}, value: text }] as CallParam[]);
  },
  submitReport(targetType: string, targetId: number = 0, scopeId: number = 0, reportedUserId: number = 0, reasonCode: string, reasonText: string = "", reportedText: string = "", platform: string = "android"): Promise<M.NodeSimpleResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/report","form":true,"ret":{"k":"obj","c":"NodeSimpleResponse"}}, [{ ...{"kind":"Field","name":"target_type","arg":"targetType"}, value: targetType }, { ...{"kind":"Field","name":"target_id","arg":"targetId"}, value: targetId }, { ...{"kind":"Field","name":"scope_id","arg":"scopeId"}, value: scopeId }, { ...{"kind":"Field","name":"reported_user_id","arg":"reportedUserId"}, value: reportedUserId }, { ...{"kind":"Field","name":"reason_code","arg":"reasonCode"}, value: reasonCode }, { ...{"kind":"Field","name":"reason_text","arg":"reasonText"}, value: reasonText }, { ...{"kind":"Field","name":"reported_text","arg":"reportedText"}, value: reportedText }, { ...{"kind":"Field","name":"platform","arg":"platform"}, value: platform }] as CallParam[]);
  },
  getSessions(): Promise<M.NodeSessionsResponse> {
    return retrofitCall({"base":"node","http":"GET","path":"api/node/sessions","ret":{"k":"obj","c":"NodeSessionsResponse"}}, [] as CallParam[]);
  },
  deleteSession(sessionId: number): Promise<M.NodeSimpleResponse> {
    return retrofitCall({"base":"node","http":"DELETE","path":"api/node/sessions/{id}","ret":{"k":"obj","c":"NodeSimpleResponse"}}, [{ ...{"kind":"Path","name":"id","arg":"sessionId","encoded":false}, value: sessionId }] as CallParam[]);
  },
  deleteAllOtherSessions(): Promise<M.NodeSimpleResponse> {
    return retrofitCall({"base":"node","http":"DELETE","path":"api/node/sessions","ret":{"k":"obj","c":"NodeSimpleResponse"}}, [] as CallParam[]);
  },
  registerSignalKeys(identityKey: string, signedPreKeyId: number, signedPreKey: string, signedPreKeySig: string, prekeys: string, deviceId: string | null = null, identitySigningKey: string | null = null): Promise<M.SignalSimpleResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/signal/register","form":true,"ret":{"k":"obj","c":"SignalSimpleResponse"}}, [{ ...{"kind":"Field","name":"identity_key","arg":"identityKey"}, value: identityKey }, { ...{"kind":"Field","name":"signed_prekey_id","arg":"signedPreKeyId"}, value: signedPreKeyId }, { ...{"kind":"Field","name":"signed_prekey","arg":"signedPreKey"}, value: signedPreKey }, { ...{"kind":"Field","name":"signed_prekey_sig","arg":"signedPreKeySig"}, value: signedPreKeySig }, { ...{"kind":"Field","name":"prekeys","arg":"prekeys"}, value: prekeys }, { ...{"kind":"Field","name":"device_id","arg":"deviceId"}, value: deviceId }, { ...{"kind":"Field","name":"identity_signing_key","arg":"identitySigningKey"}, value: identitySigningKey }] as CallParam[]);
  },
  getSignalBundle(userId: number, noOpk: string | null = null, deviceId: string | null = null): Promise<M.PreKeyBundleResponse> {
    return retrofitCall({"base":"node","http":"GET","path":"api/node/signal/bundle/{userId}","ret":{"k":"obj","c":"PreKeyBundleResponse"}}, [{ ...{"kind":"Path","name":"userId","arg":"userId","encoded":false}, value: userId }, { ...{"kind":"Query","name":"no_opk","arg":"noOpk"}, value: noOpk }, { ...{"kind":"Query","name":"device_id","arg":"deviceId"}, value: deviceId }] as CallParam[]);
  },
  getSignalBundles(userId: number, noOpk: string | null = null): Promise<M.PreKeyBundlesResponse> {
    return retrofitCall({"base":"node","http":"GET","path":"api/node/signal/bundles/{userId}","ret":{"k":"obj","c":"PreKeyBundlesResponse"}}, [{ ...{"kind":"Path","name":"userId","arg":"userId","encoded":false}, value: userId }, { ...{"kind":"Query","name":"no_opk","arg":"noOpk"}, value: noOpk }] as CallParam[]);
  },
  getSignalIdentityKey(userId: number, deviceId: string | null = null): Promise<M.SignalIdentityKeyResponse> {
    return retrofitCall({"base":"node","http":"GET","path":"api/node/signal/identity/{userId}","ret":{"k":"obj","c":"SignalIdentityKeyResponse"}}, [{ ...{"kind":"Path","name":"userId","arg":"userId","encoded":false}, value: userId }, { ...{"kind":"Query","name":"device_id","arg":"deviceId"}, value: deviceId }] as CallParam[]);
  },
  getSignalIdentities(userId: number): Promise<M.SignalIdentitiesResponse> {
    return retrofitCall({"base":"node","http":"GET","path":"api/node/signal/identities/{userId}","ret":{"k":"obj","c":"SignalIdentitiesResponse"}}, [{ ...{"kind":"Path","name":"userId","arg":"userId","encoded":false}, value: userId }] as CallParam[]);
  },
  replenishSignalPreKeys(prekeys: string, deviceId: string | null = null): Promise<M.SignalSimpleResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/signal/replenish","form":true,"ret":{"k":"obj","c":"SignalSimpleResponse"}}, [{ ...{"kind":"Field","name":"prekeys","arg":"prekeys"}, value: prekeys }, { ...{"kind":"Field","name":"device_id","arg":"deviceId"}, value: deviceId }] as CallParam[]);
  },
  getSignalPreKeyCount(): Promise<M.SignalSimpleResponse> {
    return retrofitCall({"base":"node","http":"GET","path":"api/node/signal/prekey-count","ret":{"k":"obj","c":"SignalSimpleResponse"}}, [] as CallParam[]);
  },
  uploadKeyBackup(encryptedPayload: string, salt: string, iv: string): Promise<M.NodeSimpleResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/signal/key-backup","form":true,"ret":{"k":"obj","c":"NodeSimpleResponse"}}, [{ ...{"kind":"Field","name":"encrypted_payload","arg":"encryptedPayload"}, value: encryptedPayload }, { ...{"kind":"Field","name":"salt","arg":"salt"}, value: salt }, { ...{"kind":"Field","name":"iv","arg":"iv"}, value: iv }] as CallParam[]);
  },
  downloadKeyBackup(): Promise<M.KeyBackupDownloadResponse> {
    return retrofitCall({"base":"node","http":"GET","path":"api/node/signal/key-backup","ret":{"k":"obj","c":"KeyBackupDownloadResponse"}}, [] as CallParam[]);
  },
  deleteKeyBackup(): Promise<M.NodeSimpleResponse> {
    return retrofitCall({"base":"node","http":"DELETE","path":"api/node/signal/key-backup","ret":{"k":"obj","c":"NodeSimpleResponse"}}, [] as CallParam[]);
  },
  distributeGroupSenderKey(groupId: number, distributions: string): Promise<M.SignalGroupDistributeResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/signal/group/distribute","form":true,"ret":{"k":"obj","c":"SignalGroupDistributeResponse"}}, [{ ...{"kind":"Field","name":"group_id","arg":"groupId"}, value: groupId }, { ...{"kind":"Field","name":"distributions","arg":"distributions"}, value: distributions }] as CallParam[]);
  },
  getGroupPendingDistributions(groupId: number = 0): Promise<M.SignalGroupPendingResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/signal/group/pending-distributions","form":true,"ret":{"k":"obj","c":"SignalGroupPendingResponse"}}, [{ ...{"kind":"Field","name":"group_id","arg":"groupId"}, value: groupId }] as CallParam[]);
  },
  confirmGroupDistributionDelivery(distributionIds: string): Promise<M.SignalGroupConfirmResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/signal/group/confirm-delivery","form":true,"ret":{"k":"obj","c":"SignalGroupConfirmResponse"}}, [{ ...{"kind":"Field","name":"distribution_ids","arg":"distributionIds"}, value: distributionIds }] as CallParam[]);
  },
  invalidateGroupSenderKey(groupId: number, senderId: number): Promise<M.SignalSimpleResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/signal/group/invalidate-sender-key","form":true,"ret":{"k":"obj","c":"SignalSimpleResponse"}}, [{ ...{"kind":"Field","name":"group_id","arg":"groupId"}, value: groupId }, { ...{"kind":"Field","name":"sender_id","arg":"senderId"}, value: senderId }] as CallParam[]);
  },
  getScheduledMessages(chatId: number, chatType: string = "group", status: string = "pending"): Promise<M.NodeScheduledListResponse> {
    return retrofitCall({"base":"node","http":"GET","path":"api/node/scheduled/list","ret":{"k":"obj","c":"NodeScheduledListResponse"}}, [{ ...{"kind":"Query","name":"chat_id","arg":"chatId"}, value: chatId }, { ...{"kind":"Query","name":"chat_type","arg":"chatType"}, value: chatType }, { ...{"kind":"Query","name":"status","arg":"status"}, value: status }] as CallParam[]);
  },
  createScheduledMessage(chatId: number, chatType: string, text: string = "", scheduledAt: number, repeatType: string = "none", isPinned: boolean = false, notifyMembers: boolean = true): Promise<M.NodeScheduledItemResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/scheduled/create","form":true,"ret":{"k":"obj","c":"NodeScheduledItemResponse"}}, [{ ...{"kind":"Field","name":"chat_id","arg":"chatId"}, value: chatId }, { ...{"kind":"Field","name":"chat_type","arg":"chatType"}, value: chatType }, { ...{"kind":"Field","name":"text","arg":"text"}, value: text }, { ...{"kind":"Field","name":"scheduled_at","arg":"scheduledAt"}, value: scheduledAt }, { ...{"kind":"Field","name":"repeat_type","arg":"repeatType"}, value: repeatType }, { ...{"kind":"Field","name":"is_pinned","arg":"isPinned"}, value: isPinned }, { ...{"kind":"Field","name":"notify_members","arg":"notifyMembers"}, value: notifyMembers }] as CallParam[]);
  },
  updateScheduledMessage(id: number, text: string | null = null, scheduledAt: number | null = null, repeatType: string | null = null): Promise<M.NodeScheduledItemResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/scheduled/update/{id}","form":true,"ret":{"k":"obj","c":"NodeScheduledItemResponse"}}, [{ ...{"kind":"Path","name":"id","arg":"id","encoded":false}, value: id }, { ...{"kind":"Field","name":"text","arg":"text"}, value: text }, { ...{"kind":"Field","name":"scheduled_at","arg":"scheduledAt"}, value: scheduledAt }, { ...{"kind":"Field","name":"repeat_type","arg":"repeatType"}, value: repeatType }] as CallParam[]);
  },
  deleteScheduledMessage(id: number): Promise<M.NodeSimpleResponse> {
    return retrofitCall({"base":"node","http":"DELETE","path":"api/node/scheduled/{id}","ret":{"k":"obj","c":"NodeSimpleResponse"}}, [{ ...{"kind":"Path","name":"id","arg":"id","encoded":false}, value: id }] as CallParam[]);
  },
  sendScheduledNow(id: number): Promise<M.NodeSimpleResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/scheduled/{id}/send-now","ret":{"k":"obj","c":"NodeSimpleResponse"}}, [{ ...{"kind":"Path","name":"id","arg":"id","encoded":false}, value: id }] as CallParam[]);
  },
  getThreadMessages(postId: number, limit: number = 50, offset: number = 0): Promise<M.NodeThreadListResponse> {
    return retrofitCall({"base":"node","http":"GET","path":"api/node/channel/post/{postId}/thread","ret":{"k":"obj","c":"NodeThreadListResponse"}}, [{ ...{"kind":"Path","name":"postId","arg":"postId","encoded":false}, value: postId }, { ...{"kind":"Query","name":"limit","arg":"limit"}, value: limit }, { ...{"kind":"Query","name":"offset","arg":"offset"}, value: offset }] as CallParam[]);
  },
  sendThreadMessage(postId: number, text: string, replyToId: number | null = null, sticker: string | null = null): Promise<M.NodeThreadMessageResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/channel/post/{postId}/thread/send","form":true,"ret":{"k":"obj","c":"NodeThreadMessageResponse"}}, [{ ...{"kind":"Path","name":"postId","arg":"postId","encoded":false}, value: postId }, { ...{"kind":"Field","name":"text","arg":"text"}, value: text }, { ...{"kind":"Field","name":"reply_to_id","arg":"replyToId"}, value: replyToId }, { ...{"kind":"Field","name":"sticker","arg":"sticker"}, value: sticker }] as CallParam[]);
  },
  deleteThreadMessage(postId: number, msgId: number): Promise<M.NodeSimpleResponse> {
    return retrofitCall({"base":"node","http":"DELETE","path":"api/node/channel/post/{postId}/thread/{msgId}","ret":{"k":"obj","c":"NodeSimpleResponse"}}, [{ ...{"kind":"Path","name":"postId","arg":"postId","encoded":false}, value: postId }, { ...{"kind":"Path","name":"msgId","arg":"msgId","encoded":false}, value: msgId }] as CallParam[]);
  },
  getThreadCount(postId: number): Promise<M.NodeThreadCountResponse> {
    return retrofitCall({"base":"node","http":"GET","path":"api/node/channel/post/{postId}/thread/count","ret":{"k":"obj","c":"NodeThreadCountResponse"}}, [{ ...{"kind":"Path","name":"postId","arg":"postId","encoded":false}, value: postId }] as CallParam[]);
  },
  getThreadBatchCounts(postIds: Array<number>): Promise<M.NodeThreadBatchCountsResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/channel/threads/counts","form":true,"ret":{"k":"obj","c":"NodeThreadBatchCountsResponse"}}, [{ ...{"kind":"Field","name":"post_ids[]","arg":"postIds"}, value: postIds }] as CallParam[]);
  },
  getFolders(): Promise<M.NodeFolderListResponse> {
    return retrofitCall({"base":"node","http":"GET","path":"api/node/folders/list","ret":{"k":"obj","c":"NodeFolderListResponse"}}, [] as CallParam[]);
  },
  createFolder(name: string, emoji: string = "📁", color: string = "#2196F3"): Promise<M.NodeFolderItemResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/folders/create","form":true,"ret":{"k":"obj","c":"NodeFolderItemResponse"}}, [{ ...{"kind":"Field","name":"name","arg":"name"}, value: name }, { ...{"kind":"Field","name":"emoji","arg":"emoji"}, value: emoji }, { ...{"kind":"Field","name":"color","arg":"color"}, value: color }] as CallParam[]);
  },
  updateFolder(id: number, name: string | null = null, emoji: string | null = null, color: string | null = null): Promise<M.NodeFolderItemResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/folders/update/{id}","form":true,"ret":{"k":"obj","c":"NodeFolderItemResponse"}}, [{ ...{"kind":"Path","name":"id","arg":"id","encoded":false}, value: id }, { ...{"kind":"Field","name":"name","arg":"name"}, value: name }, { ...{"kind":"Field","name":"emoji","arg":"emoji"}, value: emoji }, { ...{"kind":"Field","name":"color","arg":"color"}, value: color }] as CallParam[]);
  },
  deleteFolder(id: number): Promise<M.NodeSimpleResponse> {
    return retrofitCall({"base":"node","http":"DELETE","path":"api/node/folders/{id}","ret":{"k":"obj","c":"NodeSimpleResponse"}}, [{ ...{"kind":"Path","name":"id","arg":"id","encoded":false}, value: id }] as CallParam[]);
  },
  addChatToFolder(id: number, chatType: string, chatId: number): Promise<M.NodeSimpleResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/folders/{id}/add-chat","form":true,"ret":{"k":"obj","c":"NodeSimpleResponse"}}, [{ ...{"kind":"Path","name":"id","arg":"id","encoded":false}, value: id }, { ...{"kind":"Field","name":"chat_type","arg":"chatType"}, value: chatType }, { ...{"kind":"Field","name":"chat_id","arg":"chatId"}, value: chatId }] as CallParam[]);
  },
  removeChatFromFolder(id: number, chatType: string, chatId: number): Promise<M.NodeSimpleResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/folders/{id}/remove-chat","form":true,"ret":{"k":"obj","c":"NodeSimpleResponse"}}, [{ ...{"kind":"Path","name":"id","arg":"id","encoded":false}, value: id }, { ...{"kind":"Field","name":"chat_type","arg":"chatType"}, value: chatType }, { ...{"kind":"Field","name":"chat_id","arg":"chatId"}, value: chatId }] as CallParam[]);
  },
  reorderFolders(ids: Array<number>): Promise<M.NodeSimpleResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/folders/reorder","form":true,"ret":{"k":"obj","c":"NodeSimpleResponse"}}, [{ ...{"kind":"Field","name":"ids[]","arg":"ids"}, value: ids }] as CallParam[]);
  },
  shareFolder(id: number): Promise<M.NodeFolderShareResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/folders/{id}/share","ret":{"k":"obj","c":"NodeFolderShareResponse"}}, [{ ...{"kind":"Path","name":"id","arg":"id","encoded":false}, value: id }] as CallParam[]);
  },
  joinFolder(code: string): Promise<M.NodeFolderItemResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/folders/join/{code}","ret":{"k":"obj","c":"NodeFolderItemResponse"}}, [{ ...{"kind":"Path","name":"code","arg":"code","encoded":false}, value: code }] as CallParam[]);
  },
  leaveFolder(id: number): Promise<M.NodeSimpleResponse> {
    return retrofitCall({"base":"node","http":"DELETE","path":"api/node/folders/{id}/leave","ret":{"k":"obj","c":"NodeSimpleResponse"}}, [{ ...{"kind":"Path","name":"id","arg":"id","encoded":false}, value: id }] as CallParam[]);
  },
  login(username: string, password: string, deviceType: string = "phone", deviceFingerprint: string | null = null, deviceLabel: string | null = null): Promise<M.NodeLoginResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/auth/login","form":true,"ret":{"k":"obj","c":"NodeLoginResponse"}}, [{ ...{"kind":"Field","name":"username","arg":"username"}, value: username }, { ...{"kind":"Field","name":"password","arg":"password"}, value: password }, { ...{"kind":"Field","name":"device_type","arg":"deviceType"}, value: deviceType }, { ...{"kind":"Field","name":"device_fingerprint","arg":"deviceFingerprint"}, value: deviceFingerprint }, { ...{"kind":"Field","name":"device_label","arg":"deviceLabel"}, value: deviceLabel }] as CallParam[]);
  },
  verifyLoginCode(verificationId: string, code: string, deviceType: string = "phone"): Promise<M.NodeLoginResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/auth/verify-login-code","form":true,"ret":{"k":"obj","c":"NodeLoginResponse"}}, [{ ...{"kind":"Field","name":"verification_id","arg":"verificationId"}, value: verificationId }, { ...{"kind":"Field","name":"code","arg":"code"}, value: code }, { ...{"kind":"Field","name":"device_type","arg":"deviceType"}, value: deviceType }] as CallParam[]);
  },
  respondToLoginVerification(verificationId: string, approve: boolean): Promise<M.NodeSimpleResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/auth/login-verification-respond","form":true,"ret":{"k":"obj","c":"NodeSimpleResponse"}}, [{ ...{"kind":"Field","name":"verification_id","arg":"verificationId"}, value: verificationId }, { ...{"kind":"Field","name":"approve","arg":"approve"}, value: approve }] as CallParam[]);
  },
  resendLoginVerificationEmail(verificationId: string, channel: string = "email"): Promise<M.LoginVerificationResendResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/auth/login-verification-resend","form":true,"ret":{"k":"obj","c":"LoginVerificationResendResponse"}}, [{ ...{"kind":"Field","name":"verification_id","arg":"verificationId"}, value: verificationId }, { ...{"kind":"Field","name":"channel","arg":"channel"}, value: channel }] as CallParam[]);
  },
  getLoginVerificationStatus(verificationId: string): Promise<M.LoginVerificationStatusResponse> {
    return retrofitCall({"base":"node","http":"GET","path":"api/node/auth/login-verification-status/{id}","ret":{"k":"obj","c":"LoginVerificationStatusResponse"}}, [{ ...{"kind":"Path","name":"id","arg":"verificationId","encoded":false}, value: verificationId }] as CallParam[]);
  },
  requestPasswordReset(email: string | null = null, phoneNumber: string | null = null): Promise<M.PasswordResetRequestResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/auth/request-password-reset","form":true,"ret":{"k":"obj","c":"PasswordResetRequestResponse"}}, [{ ...{"kind":"Field","name":"email","arg":"email"}, value: email }, { ...{"kind":"Field","name":"phone_number","arg":"phoneNumber"}, value: phoneNumber }] as CallParam[]);
  },
  resetPassword(email: string | null = null, phoneNumber: string | null = null, code: string, newPassword: string): Promise<M.PasswordResetResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/auth/reset-password","form":true,"ret":{"k":"obj","c":"PasswordResetResponse"}}, [{ ...{"kind":"Field","name":"email","arg":"email"}, value: email }, { ...{"kind":"Field","name":"phone_number","arg":"phoneNumber"}, value: phoneNumber }, { ...{"kind":"Field","name":"code","arg":"code"}, value: code }, { ...{"kind":"Field","name":"new_password","arg":"newPassword"}, value: newPassword }] as CallParam[]);
  },
  quickRegister(email: string | null = null, phoneNumber: string | null = null, inviteCode: string | null = null): Promise<M.QuickRegisterResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/auth/quick-register","form":true,"ret":{"k":"obj","c":"QuickRegisterResponse"}}, [{ ...{"kind":"Field","name":"email","arg":"email"}, value: email }, { ...{"kind":"Field","name":"phone_number","arg":"phoneNumber"}, value: phoneNumber }, { ...{"kind":"Field","name":"invite_code","arg":"inviteCode"}, value: inviteCode }] as CallParam[]);
  },
  quickVerify(email: string | null = null, phoneNumber: string | null = null, code: string): Promise<M.QuickVerifyResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/auth/quick-verify","form":true,"ret":{"k":"obj","c":"QuickVerifyResponse"}}, [{ ...{"kind":"Field","name":"email","arg":"email"}, value: email }, { ...{"kind":"Field","name":"phone_number","arg":"phoneNumber"}, value: phoneNumber }, { ...{"kind":"Field","name":"code","arg":"code"}, value: code }] as CallParam[]);
  },
  register(username: string, email: string | null = null, phoneNumber: string | null = null, password: string, confirmPassword: string, gender: string = "male", deviceType: string = "phone", inviteCode: string | null = null): Promise<M.AuthResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/auth/register","form":true,"ret":{"k":"obj","c":"AuthResponse"}}, [{ ...{"kind":"Field","name":"username","arg":"username"}, value: username }, { ...{"kind":"Field","name":"email","arg":"email"}, value: email }, { ...{"kind":"Field","name":"phone_number","arg":"phoneNumber"}, value: phoneNumber }, { ...{"kind":"Field","name":"password","arg":"password"}, value: password }, { ...{"kind":"Field","name":"confirm_password","arg":"confirmPassword"}, value: confirmPassword }, { ...{"kind":"Field","name":"gender","arg":"gender"}, value: gender }, { ...{"kind":"Field","name":"device_type","arg":"deviceType"}, value: deviceType }, { ...{"kind":"Field","name":"invite_code","arg":"inviteCode"}, value: inviteCode }] as CallParam[]);
  },
  sendVerificationCode(verificationType: string, contactInfo: string, username: string | null = null): Promise<M.SendCodeResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/auth/send-code","form":true,"ret":{"k":"obj","c":"SendCodeResponse"}}, [{ ...{"kind":"Field","name":"verification_type","arg":"verificationType"}, value: verificationType }, { ...{"kind":"Field","name":"contact_info","arg":"contactInfo"}, value: contactInfo }, { ...{"kind":"Field","name":"username","arg":"username"}, value: username }] as CallParam[]);
  },
  verifyCode(verificationType: string, contactInfo: string, code: string, username: string | null = null): Promise<M.VerifyCodeResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/auth/verify-code","form":true,"ret":{"k":"obj","c":"VerifyCodeResponse"}}, [{ ...{"kind":"Field","name":"verification_type","arg":"verificationType"}, value: verificationType }, { ...{"kind":"Field","name":"contact_info","arg":"contactInfo"}, value: contactInfo }, { ...{"kind":"Field","name":"code","arg":"code"}, value: code }, { ...{"kind":"Field","name":"username","arg":"username"}, value: username }] as CallParam[]);
  },
  refreshToken(refreshToken: string): Promise<M.TokenRefreshResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/auth/refresh","form":true,"ret":{"k":"obj","c":"TokenRefreshResponse"}}, [{ ...{"kind":"Field","name":"refresh_token","arg":"refreshToken"}, value: refreshToken }] as CallParam[]);
  },
  getBackupSettings(): Promise<M.CloudBackupSettingsResponse> {
    return retrofitCall({"base":"node","http":"GET","path":"api/node/backup/settings","ret":{"k":"obj","c":"CloudBackupSettingsResponse"}}, [] as CallParam[]);
  },
  updateBackupSettings(mobilePhotos: string | null = null, mobileVideos: string | null = null, mobileFiles: string | null = null, mobileVideosLimit: number | null = null, mobileFilesLimit: number | null = null, wifiPhotos: string | null = null, wifiVideos: string | null = null, wifiFiles: string | null = null, wifiVideosLimit: number | null = null, wifiFilesLimit: number | null = null, roamingPhotos: string | null = null, saveToGalleryPrivateChats: string | null = null, saveToGalleryGroups: string | null = null, saveToGalleryChannels: string | null = null, streamingEnabled: string | null = null, cacheSizeLimit: number | null = null, backupEnabled: string | null = null, backupProvider: string | null = null, backupFrequency: string | null = null, markBackupComplete: string | null = null, proxyEnabled: string | null = null, proxyHost: string | null = null, proxyPort: number | null = null, proxyType: string | null = null, callDataSaver: string | null = null): Promise<M.UpdateCloudBackupSettingsResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/backup/settings","form":true,"ret":{"k":"obj","c":"UpdateCloudBackupSettingsResponse"}}, [{ ...{"kind":"Field","name":"mobile_photos","arg":"mobilePhotos"}, value: mobilePhotos }, { ...{"kind":"Field","name":"mobile_videos","arg":"mobileVideos"}, value: mobileVideos }, { ...{"kind":"Field","name":"mobile_files","arg":"mobileFiles"}, value: mobileFiles }, { ...{"kind":"Field","name":"mobile_videos_limit","arg":"mobileVideosLimit"}, value: mobileVideosLimit }, { ...{"kind":"Field","name":"mobile_files_limit","arg":"mobileFilesLimit"}, value: mobileFilesLimit }, { ...{"kind":"Field","name":"wifi_photos","arg":"wifiPhotos"}, value: wifiPhotos }, { ...{"kind":"Field","name":"wifi_videos","arg":"wifiVideos"}, value: wifiVideos }, { ...{"kind":"Field","name":"wifi_files","arg":"wifiFiles"}, value: wifiFiles }, { ...{"kind":"Field","name":"wifi_videos_limit","arg":"wifiVideosLimit"}, value: wifiVideosLimit }, { ...{"kind":"Field","name":"wifi_files_limit","arg":"wifiFilesLimit"}, value: wifiFilesLimit }, { ...{"kind":"Field","name":"roaming_photos","arg":"roamingPhotos"}, value: roamingPhotos }, { ...{"kind":"Field","name":"save_to_gallery_private_chats","arg":"saveToGalleryPrivateChats"}, value: saveToGalleryPrivateChats }, { ...{"kind":"Field","name":"save_to_gallery_groups","arg":"saveToGalleryGroups"}, value: saveToGalleryGroups }, { ...{"kind":"Field","name":"save_to_gallery_channels","arg":"saveToGalleryChannels"}, value: saveToGalleryChannels }, { ...{"kind":"Field","name":"streaming_enabled","arg":"streamingEnabled"}, value: streamingEnabled }, { ...{"kind":"Field","name":"cache_size_limit","arg":"cacheSizeLimit"}, value: cacheSizeLimit }, { ...{"kind":"Field","name":"backup_enabled","arg":"backupEnabled"}, value: backupEnabled }, { ...{"kind":"Field","name":"backup_provider","arg":"backupProvider"}, value: backupProvider }, { ...{"kind":"Field","name":"backup_frequency","arg":"backupFrequency"}, value: backupFrequency }, { ...{"kind":"Field","name":"mark_backup_complete","arg":"markBackupComplete"}, value: markBackupComplete }, { ...{"kind":"Field","name":"proxy_enabled","arg":"proxyEnabled"}, value: proxyEnabled }, { ...{"kind":"Field","name":"proxy_host","arg":"proxyHost"}, value: proxyHost }, { ...{"kind":"Field","name":"proxy_port","arg":"proxyPort"}, value: proxyPort }, { ...{"kind":"Field","name":"proxy_type","arg":"proxyType"}, value: proxyType }, { ...{"kind":"Field","name":"call_data_saver","arg":"callDataSaver"}, value: callDataSaver }] as CallParam[]);
  },
  getBackupStatistics(): Promise<M.BackupStatisticsResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/backup/statistics","ret":{"k":"obj","c":"BackupStatisticsResponse"}}, [] as CallParam[]);
  },
  exportUserData(): Promise<M.ExportDataResponse> {
    return retrofitCall({"base":"node","http":"GET","path":"api/node/backup/export","ret":{"k":"obj","c":"ExportDataResponse"}}, [] as CallParam[]);
  },
  listBackups(): Promise<M.ListBackupsResponse> {
    return retrofitCall({"base":"node","http":"GET","path":"api/node/backup/list","ret":{"k":"obj","c":"ListBackupsResponse"}}, [] as CallParam[]);
  },
  importUserData(backupData: string): Promise<M.ImportDataResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/backup/import","form":true,"ret":{"k":"obj","c":"ImportDataResponse"}}, [{ ...{"kind":"Field","name":"backup_data","arg":"backupData"}, value: backupData }] as CallParam[]);
  },
  deleteServerBackup(filename: string): Promise<M.NodeSimpleResponse> {
    return retrofitCall({"base":"node","http":"DELETE","path":"api/node/backup/{filename}","ret":{"k":"obj","c":"NodeSimpleResponse"}}, [{ ...{"kind":"Path","name":"filename","arg":"filename","encoded":false}, value: filename }] as CallParam[]);
  },
  getStickerPacks(): Promise<M.StickerPacksResponse> {
    return retrofitCall({"base":"node","http":"GET","path":"api/node/stickers","ret":{"k":"obj","c":"StickerPacksResponse"}}, [] as CallParam[]);
  },
  getStickerPack(packId: number): Promise<M.StickerPackDetailResponse> {
    return retrofitCall({"base":"node","http":"GET","path":"api/node/stickers/{packId}","ret":{"k":"obj","c":"StickerPackDetailResponse"}}, [{ ...{"kind":"Path","name":"packId","arg":"packId","encoded":false}, value: packId }] as CallParam[]);
  },
  activateStickerPack(packId: number): Promise<M.StickerPackDetailResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/stickers/{packId}/activate","form":true,"ret":{"k":"obj","c":"StickerPackDetailResponse"}}, [{ ...{"kind":"Path","name":"packId","arg":"packId","encoded":false}, value: packId }] as CallParam[]);
  },
  deactivateStickerPack(packId: number): Promise<M.StickerPackDetailResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/stickers/{packId}/deactivate","form":true,"ret":{"k":"obj","c":"StickerPackDetailResponse"}}, [{ ...{"kind":"Path","name":"packId","arg":"packId","encoded":false}, value: packId }] as CallParam[]);
  },
  getTelegramStickerSet(setName: string): Promise<M.TelegramStickerSetResponse> {
    return retrofitCall({"base":"node","http":"GET","path":"api/telegram/sticker-set/{setName}","ret":{"k":"obj","c":"TelegramStickerSetResponse"}}, [{ ...{"kind":"Path","name":"setName","arg":"setName","encoded":false}, value: setName }] as CallParam[]);
  },
  getEmojiPacks(): Promise<M.EmojiPacksResponse> {
    return retrofitCall({"base":"node","http":"GET","path":"api/node/emoji","ret":{"k":"obj","c":"EmojiPacksResponse"}}, [] as CallParam[]);
  },
  getEmojiPack(packId: number): Promise<M.EmojiPackDetailResponse> {
    return retrofitCall({"base":"node","http":"GET","path":"api/node/emoji/{packId}","ret":{"k":"obj","c":"EmojiPackDetailResponse"}}, [{ ...{"kind":"Path","name":"packId","arg":"packId","encoded":false}, value: packId }] as CallParam[]);
  },
  activateEmojiPack(packId: number): Promise<M.EmojiPackDetailResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/emoji/{packId}/activate","form":true,"ret":{"k":"obj","c":"EmojiPackDetailResponse"}}, [{ ...{"kind":"Path","name":"packId","arg":"packId","encoded":false}, value: packId }] as CallParam[]);
  },
  deactivateEmojiPack(packId: number): Promise<M.EmojiPackDetailResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/emoji/{packId}/deactivate","form":true,"ret":{"k":"obj","c":"EmojiPackDetailResponse"}}, [{ ...{"kind":"Path","name":"packId","arg":"packId","encoded":false}, value: packId }] as CallParam[]);
  },
  checkAppUpdate(): Promise<M.AppUpdateResponse> {
    return retrofitCall({"base":"node","http":"GET","path":"api/node/update/check","ret":{"k":"obj","c":"AppUpdateResponse"}}, [] as CallParam[]);
  },
  getChatMessageCount(recipientId: number): Promise<M.MessageCountResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/chat/count","form":true,"ret":{"k":"obj","c":"MessageCountResponse"}}, [{ ...{"kind":"Field","name":"recipient_id","arg":"recipientId"}, value: recipientId }] as CallParam[]);
  },
  downloadMedia(url: string): Promise<RawResponseBody> {
    return retrofitCall({"base":"node","http":"GET","path":null,"raw":true,"ret":{"k":"raw"}}, [{ ...{"kind":"Url","name":null,"arg":"url"}, value: url }] as CallParam[]);
  },
  exportPrivateChat(recipientId: number, format: string = "json", limit: number = 500): Promise<RawResponseBody> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/chat/export","form":true,"raw":true,"ret":{"k":"raw"}}, [{ ...{"kind":"Field","name":"recipient_id","arg":"recipientId"}, value: recipientId }, { ...{"kind":"Field","name":"format","arg":"format"}, value: format }, { ...{"kind":"Field","name":"limit","arg":"limit"}, value: limit }] as CallParam[]);
  },
  getInstantView(url: string): Promise<M.NodeInstantViewResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/instant-view","form":true,"ret":{"k":"obj","c":"NodeInstantViewResponse"}}, [{ ...{"kind":"Field","name":"url","arg":"url"}, value: url }] as CallParam[]);
  },
  registerFcmToken(fcmToken: string, platform: string = "android"): Promise<M.NodeSimpleResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/user/register-fcm-token","form":true,"ret":{"k":"obj","c":"NodeSimpleResponse"}}, [{ ...{"kind":"Field","name":"fcm_token","arg":"fcmToken"}, value: fcmToken }, { ...{"kind":"Field","name":"platform","arg":"platform"}, value: platform }] as CallParam[]);
  },
  unregisterFcmToken(fcmToken: string): Promise<M.NodeSimpleResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/user/unregister-fcm-token","form":true,"ret":{"k":"obj","c":"NodeSimpleResponse"}}, [{ ...{"kind":"Field","name":"fcm_token","arg":"fcmToken"}, value: fcmToken }] as CallParam[]);
  },
  sendCrashReport(report: string, filename: string, secret: string): Promise<M.NodeSimpleResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/crash-report","form":true,"ret":{"k":"obj","c":"NodeSimpleResponse"}}, [{ ...{"kind":"Field","name":"report","arg":"report"}, value: report }, { ...{"kind":"Field","name":"filename","arg":"filename"}, value: filename }, { ...{"kind":"Field","name":"secret","arg":"secret"}, value: secret }] as CallParam[]);
  },
  addVoiceReaction(messageId: RequestBodyLike, durationMs: RequestBodyLike, file: MultipartPart): Promise<M.VoiceReactionResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/message/voice-reaction/add","multipart":true,"ret":{"k":"obj","c":"VoiceReactionResponse"}}, [{ ...{"kind":"Part","name":"message_id","arg":"messageId"}, value: messageId }, { ...{"kind":"Part","name":"duration_ms","arg":"durationMs"}, value: durationMs }, { ...{"kind":"Part","name":null,"arg":"file"}, value: file }] as CallParam[]);
  },
  deleteVoiceReaction(reactionId: number): Promise<M.NodeSimpleResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/message/voice-reaction/delete","form":true,"ret":{"k":"obj","c":"NodeSimpleResponse"}}, [{ ...{"kind":"Field","name":"reaction_id","arg":"reactionId"}, value: reactionId }] as CallParam[]);
  },
  listVoiceReactions(messageId: number): Promise<M.VoiceReactionsListResponse> {
    return retrofitCall({"base":"node","http":"GET","path":"api/node/message/voice-reactions","ret":{"k":"obj","c":"VoiceReactionsListResponse"}}, [{ ...{"kind":"Query","name":"message_id","arg":"messageId"}, value: messageId }] as CallParam[]);
  },
  translateMessage(text: string, targetLang: string = "en"): Promise<M.TranslateResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/translate","form":true,"ret":{"k":"obj","c":"TranslateResponse"}}, [{ ...{"kind":"Field","name":"text","arg":"text"}, value: text }, { ...{"kind":"Field","name":"target_lang","arg":"targetLang"}, value: targetLang }] as CallParam[]);
  },
  getLinkPreview(url: string): Promise<M.LinkPreviewResponse__NodeApi> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/link-preview","form":true,"ret":{"k":"obj","c":"LinkPreviewResponse__NodeApi"}}, [{ ...{"kind":"Field","name":"url","arg":"url"}, value: url }] as CallParam[]);
  },
};

/** network/NodeBlogApi.kt */
export const NodeBlogApi = {
  getCategories(): Promise<M.NodeBlogCategoriesResponse> {
    return retrofitCall({"base":"node","http":"GET","path":"api/node/blog/categories","ret":{"k":"obj","c":"NodeBlogCategoriesResponse"}}, [] as CallParam[]);
  },
  getPosts(category: number | null = null, limit: number = 20, offset: number = 0): Promise<M.NodeBlogPostsResponse> {
    return retrofitCall({"base":"node","http":"GET","path":"api/node/blog/posts","ret":{"k":"obj","c":"NodeBlogPostsResponse"}}, [{ ...{"kind":"Query","name":"category","arg":"category"}, value: category }, { ...{"kind":"Query","name":"limit","arg":"limit"}, value: limit }, { ...{"kind":"Query","name":"offset","arg":"offset"}, value: offset }] as CallParam[]);
  },
  getPostDetail(id: number): Promise<M.NodeBlogPostDetailResponse> {
    return retrofitCall({"base":"node","http":"GET","path":"api/node/blog/posts/{id}","ret":{"k":"obj","c":"NodeBlogPostDetailResponse"}}, [{ ...{"kind":"Path","name":"id","arg":"id","encoded":false}, value: id }] as CallParam[]);
  },
};

/** network/NodeBotApi.kt */
export const NodeBotApi = {
  searchBots(q: string = "", limit: number = 30, offset: number = 0): Promise<M.BotSearchResponse> {
    return retrofitCall({"base":"node","http":"GET","path":"api/node/bots/search","ret":{"k":"obj","c":"BotSearchResponse"}}, [{ ...{"kind":"Query","name":"q","arg":"q"}, value: q }, { ...{"kind":"Query","name":"limit","arg":"limit"}, value: limit }, { ...{"kind":"Query","name":"offset","arg":"offset"}, value: offset }] as CallParam[]);
  },
  getMyBots(limit: number = 20, offset: number = 0): Promise<M.BotListResponse> {
    return retrofitCall({"base":"node","http":"GET","path":"api/node/bots","ret":{"k":"obj","c":"BotListResponse"}}, [{ ...{"kind":"Query","name":"limit","arg":"limit"}, value: limit }, { ...{"kind":"Query","name":"offset","arg":"offset"}, value: offset }] as CallParam[]);
  },
  getBotInfo(botId: string): Promise<M.BotInfoResponse> {
    return retrofitCall({"base":"node","http":"GET","path":"api/node/bots/{bot_id}","ret":{"k":"obj","c":"BotInfoResponse"}}, [{ ...{"kind":"Path","name":"bot_id","arg":"botId","encoded":false}, value: botId }] as CallParam[]);
  },
  createBot(username: string, displayName: string, description: string | null = null, about: string | null = null, category: string | null = "general", canJoinGroups: number = 1, isPublic: number = 1): Promise<M.CreateBotResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/bots","form":true,"ret":{"k":"obj","c":"CreateBotResponse"}}, [{ ...{"kind":"Field","name":"username","arg":"username"}, value: username }, { ...{"kind":"Field","name":"display_name","arg":"displayName"}, value: displayName }, { ...{"kind":"Field","name":"description","arg":"description"}, value: description }, { ...{"kind":"Field","name":"about","arg":"about"}, value: about }, { ...{"kind":"Field","name":"category","arg":"category"}, value: category }, { ...{"kind":"Field","name":"can_join_groups","arg":"canJoinGroups"}, value: canJoinGroups }, { ...{"kind":"Field","name":"is_public","arg":"isPublic"}, value: isPublic }] as CallParam[]);
  },
  updateBot(botId: string, displayName: string | null = null, description: string | null = null, about: string | null = null, category: string | null = null, isPublic: number | null = null, canJoinGroups: number | null = null, webAppUrl: string | null = null, clearWebApp: number | null = null): Promise<M.BotGenericResponse> {
    return retrofitCall({"base":"node","http":"PUT","path":"api/node/bots/{bot_id}","form":true,"ret":{"k":"obj","c":"BotGenericResponse"}}, [{ ...{"kind":"Path","name":"bot_id","arg":"botId","encoded":false}, value: botId }, { ...{"kind":"Field","name":"display_name","arg":"displayName"}, value: displayName }, { ...{"kind":"Field","name":"description","arg":"description"}, value: description }, { ...{"kind":"Field","name":"about","arg":"about"}, value: about }, { ...{"kind":"Field","name":"category","arg":"category"}, value: category }, { ...{"kind":"Field","name":"is_public","arg":"isPublic"}, value: isPublic }, { ...{"kind":"Field","name":"can_join_groups","arg":"canJoinGroups"}, value: canJoinGroups }, { ...{"kind":"Field","name":"web_app_url","arg":"webAppUrl"}, value: webAppUrl }, { ...{"kind":"Field","name":"clear_web_app","arg":"clearWebApp"}, value: clearWebApp }] as CallParam[]);
  },
  deleteBot(botId: string): Promise<M.BotGenericResponse> {
    return retrofitCall({"base":"node","http":"DELETE","path":"api/node/bots/{bot_id}","ret":{"k":"obj","c":"BotGenericResponse"}}, [{ ...{"kind":"Path","name":"bot_id","arg":"botId","encoded":false}, value: botId }] as CallParam[]);
  },
  regenerateBotToken(botId: string): Promise<M.BotTokenResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/bots/{bot_id}/regenerate-token","ret":{"k":"obj","c":"BotTokenResponse"}}, [{ ...{"kind":"Path","name":"bot_id","arg":"botId","encoded":false}, value: botId }] as CallParam[]);
  },
  getRssFeeds(botId: string): Promise<M.RssFeedListResponse> {
    return retrofitCall({"base":"node","http":"GET","path":"api/node/bots/{bot_id}/rss","ret":{"k":"obj","c":"RssFeedListResponse"}}, [{ ...{"kind":"Path","name":"bot_id","arg":"botId","encoded":false}, value: botId }] as CallParam[]);
  },
  addRssFeed(botId: string, feedUrl: string, chatId: string, feedName: string | null = null, intervalMinutes: number = 30, maxItems: number = 5, includeImage: number = 1, includeDesc: number = 1): Promise<M.RssFeedResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/bots/{bot_id}/rss","form":true,"ret":{"k":"obj","c":"RssFeedResponse"}}, [{ ...{"kind":"Path","name":"bot_id","arg":"botId","encoded":false}, value: botId }, { ...{"kind":"Field","name":"feed_url","arg":"feedUrl"}, value: feedUrl }, { ...{"kind":"Field","name":"chat_id","arg":"chatId"}, value: chatId }, { ...{"kind":"Field","name":"feed_name","arg":"feedName"}, value: feedName }, { ...{"kind":"Field","name":"check_interval_minutes","arg":"intervalMinutes"}, value: intervalMinutes }, { ...{"kind":"Field","name":"max_items_per_check","arg":"maxItems"}, value: maxItems }, { ...{"kind":"Field","name":"include_image","arg":"includeImage"}, value: includeImage }, { ...{"kind":"Field","name":"include_description","arg":"includeDesc"}, value: includeDesc }] as CallParam[]);
  },
  updateRssFeed(botId: string, feedId: number, isActive: number | null = null, intervalMinutes: number | null = null, maxItems: number | null = null): Promise<M.RssFeedResponse> {
    return retrofitCall({"base":"node","http":"PUT","path":"api/node/bots/{bot_id}/rss/{feed_id}","form":true,"ret":{"k":"obj","c":"RssFeedResponse"}}, [{ ...{"kind":"Path","name":"bot_id","arg":"botId","encoded":false}, value: botId }, { ...{"kind":"Path","name":"feed_id","arg":"feedId","encoded":false}, value: feedId }, { ...{"kind":"Field","name":"is_active","arg":"isActive"}, value: isActive }, { ...{"kind":"Field","name":"check_interval_minutes","arg":"intervalMinutes"}, value: intervalMinutes }, { ...{"kind":"Field","name":"max_items_per_check","arg":"maxItems"}, value: maxItems }] as CallParam[]);
  },
  deleteRssFeed(botId: string, feedId: number): Promise<M.BotGenericResponse> {
    return retrofitCall({"base":"node","http":"DELETE","path":"api/node/bots/{bot_id}/rss/{feed_id}","ret":{"k":"obj","c":"BotGenericResponse"}}, [{ ...{"kind":"Path","name":"bot_id","arg":"botId","encoded":false}, value: botId }, { ...{"kind":"Path","name":"feed_id","arg":"feedId","encoded":false}, value: feedId }] as CallParam[]);
  },
  createWebAppToken(botId: string, chatId: string | null = null): Promise<M.WebAppTokenResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/bot/createWebAppToken","form":true,"ret":{"k":"obj","c":"WebAppTokenResponse"}}, [{ ...{"kind":"Field","name":"bot_id","arg":"botId"}, value: botId }, { ...{"kind":"Field","name":"chat_id","arg":"chatId"}, value: chatId }] as CallParam[]);
  },
  answerWebAppQuery(queryId: string, botId: string, data: string): Promise<M.WebAppQueryResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/bot/answerWebAppQuery","form":true,"ret":{"k":"obj","c":"WebAppQueryResponse"}}, [{ ...{"kind":"Field","name":"query_id","arg":"queryId"}, value: queryId }, { ...{"kind":"Field","name":"bot_id","arg":"botId"}, value: botId }, { ...{"kind":"Field","name":"data","arg":"data"}, value: data }] as CallParam[]);
  },
  subscribeTopic(botId: string, topic: string, filters: string | null = null): Promise<M.BotGenericResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/bots/{bot_id}/subscribe","form":true,"ret":{"k":"obj","c":"BotGenericResponse"}}, [{ ...{"kind":"Path","name":"bot_id","arg":"botId","encoded":false}, value: botId }, { ...{"kind":"Field","name":"topic","arg":"topic"}, value: topic }, { ...{"kind":"Field","name":"filters","arg":"filters"}, value: filters }] as CallParam[]);
  },
  unsubscribeTopic(botId: string, topic: string | null = null): Promise<M.BotGenericResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/bots/{bot_id}/unsubscribe","form":true,"ret":{"k":"obj","c":"BotGenericResponse"}}, [{ ...{"kind":"Path","name":"bot_id","arg":"botId","encoded":false}, value: botId }, { ...{"kind":"Field","name":"topic","arg":"topic"}, value: topic }] as CallParam[]);
  },
  muteTopic(botId: string, minutes: number, topic: string | null = null): Promise<M.BotGenericResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/bots/{bot_id}/mute","form":true,"ret":{"k":"obj","c":"BotGenericResponse"}}, [{ ...{"kind":"Path","name":"bot_id","arg":"botId","encoded":false}, value: botId }, { ...{"kind":"Field","name":"minutes","arg":"minutes"}, value: minutes }, { ...{"kind":"Field","name":"topic","arg":"topic"}, value: topic }] as CallParam[]);
  },
  getSubscriptions(botId: string): Promise<M.BotSubscriptionsResponse> {
    return retrofitCall({"base":"node","http":"GET","path":"api/node/bots/{bot_id}/subscriptions","ret":{"k":"obj","c":"BotSubscriptionsResponse"}}, [{ ...{"kind":"Path","name":"bot_id","arg":"botId","encoded":false}, value: botId }] as CallParam[]);
  },
  getBroadcasts(botId: string, topic: string | null = null, sinceId: number = 0, limit: number = 20): Promise<M.BotBroadcastsResponse> {
    return retrofitCall({"base":"node","http":"GET","path":"api/node/bots/{bot_id}/broadcasts","ret":{"k":"obj","c":"BotBroadcastsResponse"}}, [{ ...{"kind":"Path","name":"bot_id","arg":"botId","encoded":false}, value: botId }, { ...{"kind":"Query","name":"topic","arg":"topic"}, value: topic }, { ...{"kind":"Query","name":"since_id","arg":"sinceId"}, value: sinceId }, { ...{"kind":"Query","name":"limit","arg":"limit"}, value: limit }] as CallParam[]);
  },
};

/** network/NodeBotInlineApi.kt */
export const NodeBotInlineApi = {
  getInlineResults(botUsername: string, query: string, offset: string = ""): Promise<M.InlineResultsResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/bot/getInlineResults","form":true,"ret":{"k":"obj","c":"InlineResultsResponse"}}, [{ ...{"kind":"Field","name":"bot_username","arg":"botUsername"}, value: botUsername }, { ...{"kind":"Field","name":"query","arg":"query"}, value: query }, { ...{"kind":"Field","name":"offset","arg":"offset"}, value: offset }] as CallParam[]);
  },
  chooseInlineResult(botUsername: string, resultId: string, query: string = ""): Promise<M.NodeSimpleResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/bot/chooseInlineResult","form":true,"ret":{"k":"obj","c":"NodeSimpleResponse"}}, [{ ...{"kind":"Field","name":"bot_username","arg":"botUsername"}, value: botUsername }, { ...{"kind":"Field","name":"result_id","arg":"resultId"}, value: resultId }, { ...{"kind":"Field","name":"query","arg":"query"}, value: query }] as CallParam[]);
  },
};

/** network/NodeBusinessApi.kt */
export const NodeBusinessApi = {
  getMyProfile(): Promise<M.BusinessProfileResponse> {
    return retrofitCall({"base":"node","http":"GET","path":"api/node/business/profile","ret":{"k":"obj","c":"BusinessProfileResponse"}}, [] as CallParam[]);
  },
  updateProfile(body: M.UpdateBusinessProfileRequest): Promise<M.BusinessProfileResponse> {
    return retrofitCall({"base":"node","http":"PUT","path":"api/node/business/profile","ret":{"k":"obj","c":"BusinessProfileResponse"}}, [{ ...{"kind":"Body","name":null,"arg":"body","schema":"UpdateBusinessProfileRequest"}, value: body }] as CallParam[]);
  },
  deleteProfile(): Promise<M.BusinessActionResponse> {
    return retrofitCall({"base":"node","http":"DELETE","path":"api/node/business/profile","ret":{"k":"obj","c":"BusinessActionResponse"}}, [] as CallParam[]);
  },
  uploadAvatar(avatar: MultipartPart): Promise<M.BusinessAvatarResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/business/avatar","multipart":true,"ret":{"k":"obj","c":"BusinessAvatarResponse"}}, [{ ...{"kind":"Part","name":null,"arg":"avatar"}, value: avatar }] as CallParam[]);
  },
  getHours(): Promise<M.BusinessHoursResponse> {
    return retrofitCall({"base":"node","http":"GET","path":"api/node/business/hours","ret":{"k":"obj","c":"BusinessHoursResponse"}}, [] as CallParam[]);
  },
  updateHours(body: M.UpdateBusinessHoursRequest): Promise<M.BusinessHoursResponse> {
    return retrofitCall({"base":"node","http":"PUT","path":"api/node/business/hours","ret":{"k":"obj","c":"BusinessHoursResponse"}}, [{ ...{"kind":"Body","name":null,"arg":"body","schema":"UpdateBusinessHoursRequest"}, value: body }] as CallParam[]);
  },
  getQuickReplies(): Promise<M.BusinessQuickRepliesResponse> {
    return retrofitCall({"base":"node","http":"GET","path":"api/node/business/quick-replies","ret":{"k":"obj","c":"BusinessQuickRepliesResponse"}}, [] as CallParam[]);
  },
  createQuickReply(body: M.CreateQuickReplyRequest): Promise<M.BusinessQuickRepliesResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/business/quick-replies","ret":{"k":"obj","c":"BusinessQuickRepliesResponse"}}, [{ ...{"kind":"Body","name":null,"arg":"body","schema":"CreateQuickReplyRequest"}, value: body }] as CallParam[]);
  },
  updateQuickReply(id: number, body: M.CreateQuickReplyRequest): Promise<M.BusinessQuickRepliesResponse> {
    return retrofitCall({"base":"node","http":"PUT","path":"api/node/business/quick-replies/{id}","ret":{"k":"obj","c":"BusinessQuickRepliesResponse"}}, [{ ...{"kind":"Path","name":"id","arg":"id","encoded":false}, value: id }, { ...{"kind":"Body","name":null,"arg":"body","schema":"CreateQuickReplyRequest"}, value: body }] as CallParam[]);
  },
  deleteQuickReply(id: number): Promise<M.BusinessActionResponse> {
    return retrofitCall({"base":"node","http":"DELETE","path":"api/node/business/quick-replies/{id}","ret":{"k":"obj","c":"BusinessActionResponse"}}, [{ ...{"kind":"Path","name":"id","arg":"id","encoded":false}, value: id }] as CallParam[]);
  },
  getLinks(): Promise<M.BusinessLinksResponse> {
    return retrofitCall({"base":"node","http":"GET","path":"api/node/business/links","ret":{"k":"obj","c":"BusinessLinksResponse"}}, [] as CallParam[]);
  },
  createLink(body: M.CreateBusinessLinkRequest): Promise<M.BusinessLinksResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/business/links","ret":{"k":"obj","c":"BusinessLinksResponse"}}, [{ ...{"kind":"Body","name":null,"arg":"body","schema":"CreateBusinessLinkRequest"}, value: body }] as CallParam[]);
  },
  updateLink(id: number, body: M.CreateBusinessLinkRequest): Promise<M.BusinessLinksResponse> {
    return retrofitCall({"base":"node","http":"PUT","path":"api/node/business/links/{id}","ret":{"k":"obj","c":"BusinessLinksResponse"}}, [{ ...{"kind":"Path","name":"id","arg":"id","encoded":false}, value: id }, { ...{"kind":"Body","name":null,"arg":"body","schema":"CreateBusinessLinkRequest"}, value: body }] as CallParam[]);
  },
  deleteLink(id: number): Promise<M.BusinessActionResponse> {
    return retrofitCall({"base":"node","http":"DELETE","path":"api/node/business/links/{id}","ret":{"k":"obj","c":"BusinessActionResponse"}}, [{ ...{"kind":"Path","name":"id","arg":"id","encoded":false}, value: id }] as CallParam[]);
  },
  getUserBusinessProfile(userId: number): Promise<M.BusinessProfileResponse> {
    return retrofitCall({"base":"node","http":"GET","path":"api/node/business/users/{userId}","ret":{"k":"obj","c":"BusinessProfileResponse"}}, [{ ...{"kind":"Path","name":"userId","arg":"userId","encoded":false}, value: userId }] as CallParam[]);
  },
  getStats(days: number = 30): Promise<M.BusinessStatsResponse> {
    return retrofitCall({"base":"node","http":"GET","path":"api/node/business/stats","ret":{"k":"obj","c":"BusinessStatsResponse"}}, [{ ...{"kind":"Query","name":"days","arg":"days"}, value: days }] as CallParam[]);
  },
  uploadVerificationDocument(file: MultipartPart): Promise<M.BusinessDocumentUploadResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/business/verification/document","multipart":true,"ret":{"k":"obj","c":"BusinessDocumentUploadResponse"}}, [{ ...{"kind":"Part","name":null,"arg":"file"}, value: file }] as CallParam[]);
  },
  requestVerification(): Promise<M.BusinessVerificationResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/business/request-verification","ret":{"k":"obj","c":"BusinessVerificationResponse"}}, [] as CallParam[]);
  },
  getApiKey(): Promise<M.BusinessApiKeyResponse> {
    return retrofitCall({"base":"node","http":"GET","path":"api/node/business/api-key","ret":{"k":"obj","c":"BusinessApiKeyResponse"}}, [] as CallParam[]);
  },
  generateApiKey(label: string = "My API Key"): Promise<M.BusinessApiKeyResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/business/api-key","form":true,"ret":{"k":"obj","c":"BusinessApiKeyResponse"}}, [{ ...{"kind":"Field","name":"label","arg":"label"}, value: label }] as CallParam[]);
  },
  revokeApiKey(): Promise<M.BusinessActionResponse> {
    return retrofitCall({"base":"node","http":"DELETE","path":"api/node/business/api-key","ret":{"k":"obj","c":"BusinessActionResponse"}}, [] as CallParam[]);
  },
};

/** network/NodeBusinessDirectoryApi.kt */
export const NodeBusinessDirectoryApi = {
  getBusinessDirectory(page: number = 1, limit: number = 20, category: string | null = null, search: string | null = null): Promise<M.BusinessDirectoryResponse> {
    return retrofitCall({"base":"node","http":"GET","path":"api/node/business-directory","ret":{"k":"obj","c":"BusinessDirectoryResponse"}}, [{ ...{"kind":"Query","name":"page","arg":"page"}, value: page }, { ...{"kind":"Query","name":"limit","arg":"limit"}, value: limit }, { ...{"kind":"Query","name":"category","arg":"category"}, value: category }, { ...{"kind":"Query","name":"search","arg":"search"}, value: search }] as CallParam[]);
  },
  getBusinessCategories(): Promise<M.BusinessCategoriesResponse> {
    return retrofitCall({"base":"node","http":"GET","path":"api/node/business-directory/categories","ret":{"k":"obj","c":"BusinessCategoriesResponse"}}, [] as CallParam[]);
  },
  getBusinessProfile(userId: number): Promise<M.BusinessDirectoryDetail> {
    return retrofitCall({"base":"node","http":"GET","path":"api/node/business-directory/{userId}","ret":{"k":"obj","c":"BusinessDirectoryDetail"}}, [{ ...{"kind":"Path","name":"userId","arg":"userId","encoded":false}, value: userId }] as CallParam[]);
  },
  rateBusiness(userId: number, body: M.RateBusinessRequest): Promise<M.RateBusinessResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/business-directory/{userId}/rate","ret":{"k":"obj","c":"RateBusinessResponse"}}, [{ ...{"kind":"Path","name":"userId","arg":"userId","encoded":false}, value: userId }, { ...{"kind":"Body","name":null,"arg":"body","schema":"RateBusinessRequest"}, value: body }] as CallParam[]);
  },
  unrateBusiness(userId: number): Promise<M.RateBusinessResponse> {
    return retrofitCall({"base":"node","http":"DELETE","path":"api/node/business-directory/{userId}/rate","ret":{"k":"obj","c":"RateBusinessResponse"}}, [{ ...{"kind":"Path","name":"userId","arg":"userId","encoded":false}, value: userId }] as CallParam[]);
  },
  getBusinessReviews(userId: number, limit: number = 20): Promise<M.BusinessReviewsResponse> {
    return retrofitCall({"base":"node","http":"GET","path":"api/node/business-directory/{userId}/reviews","ret":{"k":"obj","c":"BusinessReviewsResponse"}}, [{ ...{"kind":"Path","name":"userId","arg":"userId","encoded":false}, value: userId }, { ...{"kind":"Query","name":"limit","arg":"limit"}, value: limit }] as CallParam[]);
  },
};

/** network/NodeCallApi.kt */
export const NodeCallApi = {
  inviteToCall(peerId: number, inviteeId: number, callType: string = "audio"): Promise<M.AdhocInviteResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/call/adhoc/invite","form":true,"ret":{"k":"obj","c":"AdhocInviteResponse"}}, [{ ...{"kind":"Field","name":"peer_id","arg":"peerId"}, value: peerId }, { ...{"kind":"Field","name":"invitee_id","arg":"inviteeId"}, value: inviteeId }, { ...{"kind":"Field","name":"call_type","arg":"callType"}, value: callType }] as CallParam[]);
  },
  joinAdhocCall(roomName: string, callType: string = "audio"): Promise<M.AdhocJoinResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/call/adhoc/join","form":true,"ret":{"k":"obj","c":"AdhocJoinResponse"}}, [{ ...{"kind":"Field","name":"room_name","arg":"roomName"}, value: roomName }, { ...{"kind":"Field","name":"call_type","arg":"callType"}, value: callType }] as CallParam[]);
  },
  leaveAdhocCall(roomName: string): Promise<M.AdhocLeaveResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/call/adhoc/leave","form":true,"ret":{"k":"obj","c":"AdhocLeaveResponse"}}, [{ ...{"kind":"Field","name":"room_name","arg":"roomName"}, value: roomName }] as CallParam[]);
  },
};

/** network/NodeChannelApi.kt */
export const NodeChannelApi = {
  getChannels(type: string = "get_list", limit: number = 50, offset: number = 0, query: string | null = null): Promise<M.ChannelListResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/channel/list","form":true,"ret":{"k":"obj","c":"ChannelListResponse"}}, [{ ...{"kind":"Field","name":"type","arg":"type"}, value: type }, { ...{"kind":"Field","name":"limit","arg":"limit"}, value: limit }, { ...{"kind":"Field","name":"offset","arg":"offset"}, value: offset }, { ...{"kind":"Field","name":"query","arg":"query"}, value: query }] as CallParam[]);
  },
  markChannelRead(type: string = "mark_read", channelId: number, lastPostId: number): Promise<M.ChannelListResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/channel/list","form":true,"ret":{"k":"obj","c":"ChannelListResponse"}}, [{ ...{"kind":"Field","name":"type","arg":"type"}, value: type }, { ...{"kind":"Field","name":"channel_id","arg":"channelId"}, value: channelId }, { ...{"kind":"Field","name":"last_post_id","arg":"lastPostId"}, value: lastPostId }] as CallParam[]);
  },
  getChannelDetails(channelId: number): Promise<M.ChannelDetailResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/channel/details","form":true,"ret":{"k":"obj","c":"ChannelDetailResponse"}}, [{ ...{"kind":"Field","name":"channel_id","arg":"channelId"}, value: channelId }] as CallParam[]);
  },
  resolveChannelByUsername(username: string): Promise<M.ChannelDetailResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/channel/resolve","form":true,"ret":{"k":"obj","c":"ChannelDetailResponse"}}, [{ ...{"kind":"Field","name":"username","arg":"username"}, value: username }] as CallParam[]);
  },
  createChannel(name: string, username: string | null = null, description: string | null = null, avatarUrl: string | null = null, isPrivate: number = 0, category: string | null = null): Promise<M.CreateChannelResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/channel/create","form":true,"ret":{"k":"obj","c":"CreateChannelResponse"}}, [{ ...{"kind":"Field","name":"name","arg":"name"}, value: name }, { ...{"kind":"Field","name":"username","arg":"username"}, value: username }, { ...{"kind":"Field","name":"description","arg":"description"}, value: description }, { ...{"kind":"Field","name":"avatar_url","arg":"avatarUrl"}, value: avatarUrl }, { ...{"kind":"Field","name":"is_private","arg":"isPrivate"}, value: isPrivate }, { ...{"kind":"Field","name":"category","arg":"category"}, value: category }] as CallParam[]);
  },
  updateChannel(channelId: number, name: string | null = null, description: string | null = null, username: string | null = null, category: string | null = null): Promise<M.CreateChannelResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/channel/update","form":true,"ret":{"k":"obj","c":"CreateChannelResponse"}}, [{ ...{"kind":"Field","name":"channel_id","arg":"channelId"}, value: channelId }, { ...{"kind":"Field","name":"name","arg":"name"}, value: name }, { ...{"kind":"Field","name":"description","arg":"description"}, value: description }, { ...{"kind":"Field","name":"username","arg":"username"}, value: username }, { ...{"kind":"Field","name":"category","arg":"category"}, value: category }] as CallParam[]);
  },
  deleteChannel(channelId: number): Promise<M.CreateChannelResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/channel/delete","form":true,"ret":{"k":"obj","c":"CreateChannelResponse"}}, [{ ...{"kind":"Field","name":"channel_id","arg":"channelId"}, value: channelId }] as CallParam[]);
  },
  subscribeChannel(channelId: number): Promise<M.CreateChannelResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/channel/subscribe","form":true,"ret":{"k":"obj","c":"CreateChannelResponse"}}, [{ ...{"kind":"Field","name":"channel_id","arg":"channelId"}, value: channelId }] as CallParam[]);
  },
  unsubscribeChannel(channelId: number): Promise<M.CreateChannelResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/channel/unsubscribe","form":true,"ret":{"k":"obj","c":"CreateChannelResponse"}}, [{ ...{"kind":"Field","name":"channel_id","arg":"channelId"}, value: channelId }] as CallParam[]);
  },
  addChannelMember(channelId: number, userId: number): Promise<M.CreateChannelResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/channel/add-member","form":true,"ret":{"k":"obj","c":"CreateChannelResponse"}}, [{ ...{"kind":"Field","name":"channel_id","arg":"channelId"}, value: channelId }, { ...{"kind":"Field","name":"user_id","arg":"userId"}, value: userId }] as CallParam[]);
  },
  getRecommendedChannels(accessToken: string, type: string = "get_recommended"): Promise<M.ChannelListResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"/api/v2/channels.php","form":true,"ret":{"k":"obj","c":"ChannelListResponse"}}, [{ ...{"kind":"Query","name":"access_token","arg":"accessToken"}, value: accessToken }, { ...{"kind":"Field","name":"type","arg":"type"}, value: type }] as CallParam[]);
  },
  getChannelPosts(channelId: number, limit: number = 20, beforePostId: number | null = null, afterPostId: number | null = null, aroundPostId: number | null = null): Promise<M.ChannelPostsResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/channel/posts","form":true,"ret":{"k":"obj","c":"ChannelPostsResponse"}}, [{ ...{"kind":"Field","name":"channel_id","arg":"channelId"}, value: channelId }, { ...{"kind":"Field","name":"limit","arg":"limit"}, value: limit }, { ...{"kind":"Field","name":"before_post_id","arg":"beforePostId"}, value: beforePostId }, { ...{"kind":"Field","name":"after_post_id","arg":"afterPostId"}, value: afterPostId }, { ...{"kind":"Field","name":"around_post_id","arg":"aroundPostId"}, value: aroundPostId }] as CallParam[]);
  },
  searchChannelPosts(channelId: number, query: string, limit: number = 100): Promise<M.ChannelPostsResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/channel/posts/search","form":true,"ret":{"k":"obj","c":"ChannelPostsResponse"}}, [{ ...{"kind":"Field","name":"channel_id","arg":"channelId"}, value: channelId }, { ...{"kind":"Field","name":"query","arg":"query"}, value: query }, { ...{"kind":"Field","name":"limit","arg":"limit"}, value: limit }] as CallParam[]);
  },
  createChannelPost(channelId: number, text: string, mediaUrls: string | null = null, disableComments: number = 0, notifySubscribers: number = 1, paywallType: string | null = null, paywallPriceStars: number | null = null, silent: number = 0, publishAt: number | null = null): Promise<M.CreatePostResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/channel/create-post","form":true,"ret":{"k":"obj","c":"CreatePostResponse"}}, [{ ...{"kind":"Field","name":"channel_id","arg":"channelId"}, value: channelId }, { ...{"kind":"Field","name":"text","arg":"text"}, value: text }, { ...{"kind":"Field","name":"media_urls","arg":"mediaUrls"}, value: mediaUrls }, { ...{"kind":"Field","name":"disable_comments","arg":"disableComments"}, value: disableComments }, { ...{"kind":"Field","name":"notify_subscribers","arg":"notifySubscribers"}, value: notifySubscribers }, { ...{"kind":"Field","name":"paywall_type","arg":"paywallType"}, value: paywallType }, { ...{"kind":"Field","name":"paywall_price_stars","arg":"paywallPriceStars"}, value: paywallPriceStars }, { ...{"kind":"Field","name":"silent","arg":"silent"}, value: silent }, { ...{"kind":"Field","name":"publish_at","arg":"publishAt"}, value: publishAt }] as CallParam[]);
  },
  purchasePostAccess(postId: number): Promise<M.PostAccessResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/channel/purchase-post-access","form":true,"ret":{"k":"obj","c":"PostAccessResponse"}}, [{ ...{"kind":"Field","name":"post_id","arg":"postId"}, value: postId }] as CallParam[]);
  },
  updateChannelPost(postId: number, text: string, mediaUrls: string | null = null): Promise<M.CreatePostResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/channel/update-post","form":true,"ret":{"k":"obj","c":"CreatePostResponse"}}, [{ ...{"kind":"Field","name":"post_id","arg":"postId"}, value: postId }, { ...{"kind":"Field","name":"text","arg":"text"}, value: text }, { ...{"kind":"Field","name":"media_urls","arg":"mediaUrls"}, value: mediaUrls }] as CallParam[]);
  },
  deleteChannelPost(postId: number): Promise<M.CreatePostResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/channel/delete-post","form":true,"ret":{"k":"obj","c":"CreatePostResponse"}}, [{ ...{"kind":"Field","name":"post_id","arg":"postId"}, value: postId }] as CallParam[]);
  },
  pinChannelPost(postId: number): Promise<M.CreatePostResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/channel/pin-post","form":true,"ret":{"k":"obj","c":"CreatePostResponse"}}, [{ ...{"kind":"Field","name":"post_id","arg":"postId"}, value: postId }] as CallParam[]);
  },
  unpinChannelPost(postId: number): Promise<M.CreatePostResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/channel/unpin-post","form":true,"ret":{"k":"obj","c":"CreatePostResponse"}}, [{ ...{"kind":"Field","name":"post_id","arg":"postId"}, value: postId }] as CallParam[]);
  },
  getChannelComments(postId: number, limit: number = 50, offset: number = 0): Promise<M.ChannelCommentsResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/channel/comments","form":true,"ret":{"k":"obj","c":"ChannelCommentsResponse"}}, [{ ...{"kind":"Field","name":"post_id","arg":"postId"}, value: postId }, { ...{"kind":"Field","name":"limit","arg":"limit"}, value: limit }, { ...{"kind":"Field","name":"offset","arg":"offset"}, value: offset }] as CallParam[]);
  },
  addChannelComment(postId: number, text: string, replyToId: number | null = null, writeAs: string = "user", sticker: string | null = null): Promise<M.CreatePostResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/channel/add-comment","form":true,"ret":{"k":"obj","c":"CreatePostResponse"}}, [{ ...{"kind":"Field","name":"post_id","arg":"postId"}, value: postId }, { ...{"kind":"Field","name":"text","arg":"text"}, value: text }, { ...{"kind":"Field","name":"reply_to_id","arg":"replyToId"}, value: replyToId }, { ...{"kind":"Field","name":"write_as","arg":"writeAs"}, value: writeAs }, { ...{"kind":"Field","name":"sticker","arg":"sticker"}, value: sticker }] as CallParam[]);
  },
  deleteChannelComment(commentId: number): Promise<M.CreatePostResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/channel/delete-comment","form":true,"ret":{"k":"obj","c":"CreatePostResponse"}}, [{ ...{"kind":"Field","name":"comment_id","arg":"commentId"}, value: commentId }] as CallParam[]);
  },
  addPostReaction(postId: number, emoji: string): Promise<M.CreatePostResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/channel/post-reaction","form":true,"ret":{"k":"obj","c":"CreatePostResponse"}}, [{ ...{"kind":"Field","name":"post_id","arg":"postId"}, value: postId }, { ...{"kind":"Field","name":"reaction","arg":"emoji"}, value: emoji }] as CallParam[]);
  },
  removePostReaction(postId: number, emoji: string): Promise<M.CreatePostResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/channel/post-unreaction","form":true,"ret":{"k":"obj","c":"CreatePostResponse"}}, [{ ...{"kind":"Field","name":"post_id","arg":"postId"}, value: postId }, { ...{"kind":"Field","name":"reaction","arg":"emoji"}, value: emoji }] as CallParam[]);
  },
  addCommentReaction(commentId: number, reaction: string): Promise<M.CreatePostResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/channel/comment-reaction","form":true,"ret":{"k":"obj","c":"CreatePostResponse"}}, [{ ...{"kind":"Field","name":"comment_id","arg":"commentId"}, value: commentId }, { ...{"kind":"Field","name":"reaction","arg":"reaction"}, value: reaction }] as CallParam[]);
  },
  registerPostView(postId: number): Promise<M.CreatePostResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/channel/post-view","form":true,"ret":{"k":"obj","c":"CreatePostResponse"}}, [{ ...{"kind":"Field","name":"post_id","arg":"postId"}, value: postId }] as CallParam[]);
  },
  addChannelAdmin(channelId: number, userId: number | null = null, userSearch: string | null = null, role: string = "admin"): Promise<M.CreateChannelResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/channel/add-admin","form":true,"ret":{"k":"obj","c":"CreateChannelResponse"}}, [{ ...{"kind":"Field","name":"channel_id","arg":"channelId"}, value: channelId }, { ...{"kind":"Field","name":"user_id","arg":"userId"}, value: userId }, { ...{"kind":"Field","name":"user_search","arg":"userSearch"}, value: userSearch }, { ...{"kind":"Field","name":"role","arg":"role"}, value: role }] as CallParam[]);
  },
  removeChannelAdmin(channelId: number, userId: number): Promise<M.CreateChannelResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/channel/remove-admin","form":true,"ret":{"k":"obj","c":"CreateChannelResponse"}}, [{ ...{"kind":"Field","name":"channel_id","arg":"channelId"}, value: channelId }, { ...{"kind":"Field","name":"user_id","arg":"userId"}, value: userId }] as CallParam[]);
  },
  updateChannelSettings(channelId: number, settingsJson: string | null = null, formattingPermissions: string | null = null): Promise<M.CreateChannelResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/channel/settings","form":true,"ret":{"k":"obj","c":"CreateChannelResponse"}}, [{ ...{"kind":"Field","name":"channel_id","arg":"channelId"}, value: channelId }, { ...{"kind":"Field","name":"settings_json","arg":"settingsJson"}, value: settingsJson }, { ...{"kind":"Field","name":"formatting_permissions","arg":"formattingPermissions"}, value: formattingPermissions }] as CallParam[]);
  },
  getChannelStatistics(channelId: number): Promise<M.ChannelStatisticsResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/channel/statistics","form":true,"ret":{"k":"obj","c":"ChannelStatisticsResponse"}}, [{ ...{"kind":"Field","name":"channel_id","arg":"channelId"}, value: channelId }] as CallParam[]);
  },
  getActiveMembers(channelId: number, limit: number = 20, periodDays: number = 30): Promise<M.ActiveMembersResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/channel/active-members","form":true,"ret":{"k":"obj","c":"ActiveMembersResponse"}}, [{ ...{"kind":"Field","name":"channel_id","arg":"channelId"}, value: channelId }, { ...{"kind":"Field","name":"limit","arg":"limit"}, value: limit }, { ...{"kind":"Field","name":"period_days","arg":"periodDays"}, value: periodDays }] as CallParam[]);
  },
  getTopComments(channelId: number, limit: number = 10, periodDays: number = 30): Promise<M.TopCommentsResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/channel/top-comments","form":true,"ret":{"k":"obj","c":"TopCommentsResponse"}}, [{ ...{"kind":"Field","name":"channel_id","arg":"channelId"}, value: channelId }, { ...{"kind":"Field","name":"limit","arg":"limit"}, value: limit }, { ...{"kind":"Field","name":"period_days","arg":"periodDays"}, value: periodDays }] as CallParam[]);
  },
  runGiveaway(channelId: number, winnersCount: number = 1, minComments: number = 0, minReactions: number = 0, periodDays: number = 30): Promise<M.GiveawayResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/channel/giveaway","form":true,"ret":{"k":"obj","c":"GiveawayResponse"}}, [{ ...{"kind":"Field","name":"channel_id","arg":"channelId"}, value: channelId }, { ...{"kind":"Field","name":"winners_count","arg":"winnersCount"}, value: winnersCount }, { ...{"kind":"Field","name":"min_comments","arg":"minComments"}, value: minComments }, { ...{"kind":"Field","name":"min_reactions","arg":"minReactions"}, value: minReactions }, { ...{"kind":"Field","name":"period_days","arg":"periodDays"}, value: periodDays }] as CallParam[]);
  },
  getPostAnalytics(channelId: number, postId: number): Promise<M.PostAnalyticsResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/channel/post/analytics","form":true,"ret":{"k":"obj","c":"PostAnalyticsResponse"}}, [{ ...{"kind":"Field","name":"channel_id","arg":"channelId"}, value: channelId }, { ...{"kind":"Field","name":"post_id","arg":"postId"}, value: postId }] as CallParam[]);
  },
  exportChannel(channelId: number): Promise<M.ChannelBackupResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/channel/backup/export","form":true,"ret":{"k":"obj","c":"ChannelBackupResponse"}}, [{ ...{"kind":"Field","name":"channel_id","arg":"channelId"}, value: channelId }] as CallParam[]);
  },
  getChannelSubscribers(channelId: number, limit: number = 50, offset: number = 0): Promise<M.ChannelSubscribersResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/channel/subscribers","form":true,"ret":{"k":"obj","c":"ChannelSubscribersResponse"}}, [{ ...{"kind":"Field","name":"channel_id","arg":"channelId"}, value: channelId }, { ...{"kind":"Field","name":"limit","arg":"limit"}, value: limit }, { ...{"kind":"Field","name":"offset","arg":"offset"}, value: offset }] as CallParam[]);
  },
  muteChannel(channelId: number): Promise<M.CreateChannelResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/channel/mute","form":true,"ret":{"k":"obj","c":"CreateChannelResponse"}}, [{ ...{"kind":"Field","name":"channel_id","arg":"channelId"}, value: channelId }] as CallParam[]);
  },
  unmuteChannel(channelId: number): Promise<M.CreateChannelResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/channel/unmute","form":true,"ret":{"k":"obj","c":"CreateChannelResponse"}}, [{ ...{"kind":"Field","name":"channel_id","arg":"channelId"}, value: channelId }] as CallParam[]);
  },
  generateChannelQr(channelId: number): Promise<M.QrCodeResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/channel/qr-generate","form":true,"ret":{"k":"obj","c":"QrCodeResponse"}}, [{ ...{"kind":"Field","name":"channel_id","arg":"channelId"}, value: channelId }] as CallParam[]);
  },
  subscribeChannelByQr(qrCode: string): Promise<M.SubscribeChannelResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/channel/qr-subscribe","form":true,"ret":{"k":"obj","c":"SubscribeChannelResponse"}}, [{ ...{"kind":"Field","name":"qr_code","arg":"qrCode"}, value: qrCode }] as CallParam[]);
  },
  uploadChannelAvatar(channelId: RequestBodyLike, file: MultipartPart): Promise<M.MediaUploadResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/channel/upload-avatar","multipart":true,"ret":{"k":"obj","c":"MediaUploadResponse"}}, [{ ...{"kind":"Part","name":"channel_id","arg":"channelId"}, value: channelId }, { ...{"kind":"Part","name":null,"arg":"file"}, value: file }] as CallParam[]);
  },
  banChannelMember(channelId: number, userId: number, reason: string | null = null, durationSeconds: number = 0, banType: string = "channel"): Promise<M.CreateChannelResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/channel/ban-member","form":true,"ret":{"k":"obj","c":"CreateChannelResponse"}}, [{ ...{"kind":"Field","name":"channel_id","arg":"channelId"}, value: channelId }, { ...{"kind":"Field","name":"user_id","arg":"userId"}, value: userId }, { ...{"kind":"Field","name":"reason","arg":"reason"}, value: reason }, { ...{"kind":"Field","name":"duration_seconds","arg":"durationSeconds"}, value: durationSeconds }, { ...{"kind":"Field","name":"ban_type","arg":"banType"}, value: banType }] as CallParam[]);
  },
  modRestrict(channelId: number, userId: number, type: string, durationSeconds: number, reason: string = ""): Promise<M.ModActionResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/channel/moderation/restrict","form":true,"ret":{"k":"obj","c":"ModActionResponse"}}, [{ ...{"kind":"Field","name":"channel_id","arg":"channelId"}, value: channelId }, { ...{"kind":"Field","name":"user_id","arg":"userId"}, value: userId }, { ...{"kind":"Field","name":"type","arg":"type"}, value: type }, { ...{"kind":"Field","name":"duration_seconds","arg":"durationSeconds"}, value: durationSeconds }, { ...{"kind":"Field","name":"reason","arg":"reason"}, value: reason }] as CallParam[]);
  },
  modLift(channelId: number, userId: number, type: string): Promise<M.ModActionResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/channel/moderation/lift","form":true,"ret":{"k":"obj","c":"ModActionResponse"}}, [{ ...{"kind":"Field","name":"channel_id","arg":"channelId"}, value: channelId }, { ...{"kind":"Field","name":"user_id","arg":"userId"}, value: userId }, { ...{"kind":"Field","name":"type","arg":"type"}, value: type }] as CallParam[]);
  },
  modWarn(channelId: number, userId: number, reason: string = "", commentId: number | null = null): Promise<M.ModActionResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/channel/moderation/warn","form":true,"ret":{"k":"obj","c":"ModActionResponse"}}, [{ ...{"kind":"Field","name":"channel_id","arg":"channelId"}, value: channelId }, { ...{"kind":"Field","name":"user_id","arg":"userId"}, value: userId }, { ...{"kind":"Field","name":"reason","arg":"reason"}, value: reason }, { ...{"kind":"Field","name":"comment_id","arg":"commentId"}, value: commentId }] as CallParam[]);
  },
  modUserStatus(channelId: number, userId: number): Promise<M.ModUserStatusResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/channel/moderation/user","form":true,"ret":{"k":"obj","c":"ModUserStatusResponse"}}, [{ ...{"kind":"Field","name":"channel_id","arg":"channelId"}, value: channelId }, { ...{"kind":"Field","name":"user_id","arg":"userId"}, value: userId }] as CallParam[]);
  },
  unbanChannelMember(channelId: number, userId: number, banType: string | null = null): Promise<M.CreateChannelResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/channel/unban-member","form":true,"ret":{"k":"obj","c":"CreateChannelResponse"}}, [{ ...{"kind":"Field","name":"channel_id","arg":"channelId"}, value: channelId }, { ...{"kind":"Field","name":"user_id","arg":"userId"}, value: userId }, { ...{"kind":"Field","name":"ban_type","arg":"banType"}, value: banType }] as CallParam[]);
  },
  kickChannelMember(channelId: number, userId: number): Promise<M.CreateChannelResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/channel/kick-member","form":true,"ret":{"k":"obj","c":"CreateChannelResponse"}}, [{ ...{"kind":"Field","name":"channel_id","arg":"channelId"}, value: channelId }, { ...{"kind":"Field","name":"user_id","arg":"userId"}, value: userId }] as CallParam[]);
  },
  getChannelBannedMembers(channelId: number, limit: number = 50, offset: number = 0): Promise<M.ChannelBannedMembersResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/channel/banned-members","form":true,"ret":{"k":"obj","c":"ChannelBannedMembersResponse"}}, [{ ...{"kind":"Field","name":"channel_id","arg":"channelId"}, value: channelId }, { ...{"kind":"Field","name":"limit","arg":"limit"}, value: limit }, { ...{"kind":"Field","name":"offset","arg":"offset"}, value: offset }] as CallParam[]);
  },
  createChannelPoll(channelId: number, question: string, options: string, pollType: string = "regular", isAnonymous: number = 1, allowsMultiple: number = 0): Promise<M.PollResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/channel/poll/create","form":true,"ret":{"k":"obj","c":"PollResponse"}}, [{ ...{"kind":"Field","name":"channel_id","arg":"channelId"}, value: channelId }, { ...{"kind":"Field","name":"question","arg":"question"}, value: question }, { ...{"kind":"Field","name":"options","arg":"options"}, value: options }, { ...{"kind":"Field","name":"poll_type","arg":"pollType"}, value: pollType }, { ...{"kind":"Field","name":"is_anonymous","arg":"isAnonymous"}, value: isAnonymous }, { ...{"kind":"Field","name":"allows_multiple","arg":"allowsMultiple"}, value: allowsMultiple }] as CallParam[]);
  },
  voteChannelPoll(pollId: number, optionIds: string): Promise<M.PollResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/channel/poll/vote","form":true,"ret":{"k":"obj","c":"PollResponse"}}, [{ ...{"kind":"Field","name":"poll_id","arg":"pollId"}, value: pollId }, { ...{"kind":"Field","name":"option_ids","arg":"optionIds"}, value: optionIds }] as CallParam[]);
  },
  closeChannelPoll(pollId: number): Promise<M.PollResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/channel/poll/close","form":true,"ret":{"k":"obj","c":"PollResponse"}}, [{ ...{"kind":"Field","name":"poll_id","arg":"pollId"}, value: pollId }] as CallParam[]);
  },
  uploadMedia(mediaType: RequestBodyLike, file: MultipartPart, quality: RequestBodyLike | null = null): Promise<M.MediaUploadResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/media/upload","multipart":true,"ret":{"k":"obj","c":"MediaUploadResponse"}}, [{ ...{"kind":"Part","name":"media_type","arg":"mediaType"}, value: mediaType }, { ...{"kind":"Part","name":null,"arg":"file"}, value: file }, { ...{"kind":"Part","name":"quality","arg":"quality"}, value: quality }] as CallParam[]);
  },
  getChannelGroups(channelId: number): Promise<M.ChannelGroupsResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/channel/groups/list","form":true,"ret":{"k":"obj","c":"ChannelGroupsResponse"}}, [{ ...{"kind":"Field","name":"channel_id","arg":"channelId"}, value: channelId }] as CallParam[]);
  },
  createChannelGroup(channelId: number, groupName: string, description: string | null = null): Promise<M.ChannelGroupCreateResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/channel/groups/create","form":true,"ret":{"k":"obj","c":"ChannelGroupCreateResponse"}}, [{ ...{"kind":"Field","name":"channel_id","arg":"channelId"}, value: channelId }, { ...{"kind":"Field","name":"group_name","arg":"groupName"}, value: groupName }, { ...{"kind":"Field","name":"description","arg":"description"}, value: description }] as CallParam[]);
  },
  attachChannelGroup(channelId: number, groupId: number): Promise<M.ChannelGroupCreateResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/channel/groups/attach","form":true,"ret":{"k":"obj","c":"ChannelGroupCreateResponse"}}, [{ ...{"kind":"Field","name":"channel_id","arg":"channelId"}, value: channelId }, { ...{"kind":"Field","name":"group_id","arg":"groupId"}, value: groupId }] as CallParam[]);
  },
  detachChannelGroup(channelId: number, groupId: number): Promise<M.ChannelGroupCreateResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/channel/groups/detach","form":true,"ret":{"k":"obj","c":"ChannelGroupCreateResponse"}}, [{ ...{"kind":"Field","name":"channel_id","arg":"channelId"}, value: channelId }, { ...{"kind":"Field","name":"group_id","arg":"groupId"}, value: groupId }] as CallParam[]);
  },
  getReplyInbox(limit: number = 50, offset: number = 0, markRead: boolean = false): Promise<M.ChannelReplyInboxResponse> {
    return retrofitCall({"base":"node","http":"GET","path":"api/node/channel/reply-inbox","ret":{"k":"obj","c":"ChannelReplyInboxResponse"}}, [{ ...{"kind":"Query","name":"limit","arg":"limit"}, value: limit }, { ...{"kind":"Query","name":"offset","arg":"offset"}, value: offset }, { ...{"kind":"Query","name":"mark_read","arg":"markRead"}, value: markRead }] as CallParam[]);
  },
  sendThreadReply(postId: number, replyToId: number, text: string): Promise<M.NodeThreadMessageResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/channel/post/{postId}/thread/reply","form":true,"ret":{"k":"obj","c":"NodeThreadMessageResponse"}}, [{ ...{"kind":"Path","name":"postId","arg":"postId","encoded":false}, value: postId }, { ...{"kind":"Field","name":"reply_to_id","arg":"replyToId"}, value: replyToId }, { ...{"kind":"Field","name":"text","arg":"text"}, value: text }] as CallParam[]);
  },
  startLivestream(channelId: number, quality: string, title: string | null = null, description: string | null = null, enableRecording: boolean = true): Promise<RetrofitResponse<M.LivestreamStartResponse>> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/channels/{channel_id}/livestream/start","form":true,"response":true,"ret":{"k":"obj","c":"LivestreamStartResponse"}}, [{ ...{"kind":"Path","name":"channel_id","arg":"channelId","encoded":false}, value: channelId }, { ...{"kind":"Field","name":"quality","arg":"quality"}, value: quality }, { ...{"kind":"Field","name":"title","arg":"title"}, value: title }, { ...{"kind":"Field","name":"description","arg":"description"}, value: description }, { ...{"kind":"Field","name":"enable_recording","arg":"enableRecording"}, value: enableRecording }] as CallParam[]);
  },
  joinLivestream(channelId: number): Promise<RetrofitResponse<M.LivestreamJoinResponse>> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/channels/{channel_id}/livestream/join","response":true,"ret":{"k":"obj","c":"LivestreamJoinResponse"}}, [{ ...{"kind":"Path","name":"channel_id","arg":"channelId","encoded":false}, value: channelId }] as CallParam[]);
  },
  endLivestream(channelId: number): Promise<RetrofitResponse<M.LivestreamSimpleResponse>> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/channels/{channel_id}/livestream/end","response":true,"ret":{"k":"obj","c":"LivestreamSimpleResponse"}}, [{ ...{"kind":"Path","name":"channel_id","arg":"channelId","encoded":false}, value: channelId }] as CallParam[]);
  },
  leaveLivestream(channelId: number): Promise<RetrofitResponse<M.LivestreamSimpleResponse>> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/channels/{channel_id}/livestream/leave","response":true,"ret":{"k":"obj","c":"LivestreamSimpleResponse"}}, [{ ...{"kind":"Path","name":"channel_id","arg":"channelId","encoded":false}, value: channelId }] as CallParam[]);
  },
  updateLivestream(channelId: number, title: string | null = null, description: string | null = null, category: string | null = null, tags: string | null = null): Promise<RetrofitResponse<M.LivestreamSimpleResponse>> {
    return retrofitCall({"base":"node","http":"PUT","path":"api/node/channels/{channel_id}/livestream/update","form":true,"response":true,"ret":{"k":"obj","c":"LivestreamSimpleResponse"}}, [{ ...{"kind":"Path","name":"channel_id","arg":"channelId","encoded":false}, value: channelId }, { ...{"kind":"Field","name":"title","arg":"title"}, value: title }, { ...{"kind":"Field","name":"description","arg":"description"}, value: description }, { ...{"kind":"Field","name":"category","arg":"category"}, value: category }, { ...{"kind":"Field","name":"tags","arg":"tags"}, value: tags }] as CallParam[]);
  },
  getActiveLivestream(channelId: number): Promise<M.LivestreamActiveResponse> {
    return retrofitCall({"base":"node","http":"GET","path":"api/node/channels/{channel_id}/livestream/active","ret":{"k":"obj","c":"LivestreamActiveResponse"}}, [{ ...{"kind":"Path","name":"channel_id","arg":"channelId","encoded":false}, value: channelId }] as CallParam[]);
  },
  startLivestreamObs(channelId: number, quality: string | null = null, title: string | null = null, description: string | null = null): Promise<RetrofitResponse<M.ObsResponse>> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/channels/{channel_id}/livestream/obs","form":true,"response":true,"ret":{"k":"obj","c":"ObsResponse"}}, [{ ...{"kind":"Path","name":"channel_id","arg":"channelId","encoded":false}, value: channelId }, { ...{"kind":"Field","name":"quality","arg":"quality"}, value: quality }, { ...{"kind":"Field","name":"title","arg":"title"}, value: title }, { ...{"kind":"Field","name":"description","arg":"description"}, value: description }] as CallParam[]);
  },
  refreshLivestreamToken(channelId: number): Promise<RetrofitResponse<M.LivestreamTokenRefreshResponse>> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/channels/{channel_id}/livestream/refresh-token","response":true,"ret":{"k":"obj","c":"LivestreamTokenRefreshResponse"}}, [{ ...{"kind":"Path","name":"channel_id","arg":"channelId","encoded":false}, value: channelId }] as CallParam[]);
  },
  getChannelPremiumCustomization(channelId: number): Promise<RetrofitResponse<M.ChannelPremiumCustomizationResponse>> {
    return retrofitCall({"base":"node","http":"GET","path":"api/node/channels/{channel_id}/premium/customization","response":true,"ret":{"k":"obj","c":"ChannelPremiumCustomizationResponse"}}, [{ ...{"kind":"Path","name":"channel_id","arg":"channelId","encoded":false}, value: channelId }] as CallParam[]);
  },
  saveChannelPremiumCustomization(channelId: number, accentColorId: string | null = null, bannerPatternId: string | null = null, emojiPackId: string | null = null, fontWeight: string | null = null, postCornerRadius: number | null = null, avatarFrame: string | null = null, postsBackdropEnabled: number = 0, backgroundId: string | null = null, backgroundImageUrl: string | null = null, bubbleStyle: string | null = null, fontFamily: string | null = null, logoStyle: string | null = null, customFontUrl: string | null = null, customFontName: string | null = null, customBubbleCss: string | null = null, customBackgroundCss: string | null = null): Promise<RetrofitResponse<M.ChannelPremiumCustomizationResponse>> {
    return retrofitCall({"base":"node","http":"PUT","path":"api/node/channels/{channel_id}/premium/customization","form":true,"response":true,"ret":{"k":"obj","c":"ChannelPremiumCustomizationResponse"}}, [{ ...{"kind":"Path","name":"channel_id","arg":"channelId","encoded":false}, value: channelId }, { ...{"kind":"Field","name":"accent_color_id","arg":"accentColorId"}, value: accentColorId }, { ...{"kind":"Field","name":"banner_pattern_id","arg":"bannerPatternId"}, value: bannerPatternId }, { ...{"kind":"Field","name":"emoji_pack_id","arg":"emojiPackId"}, value: emojiPackId }, { ...{"kind":"Field","name":"font_weight","arg":"fontWeight"}, value: fontWeight }, { ...{"kind":"Field","name":"post_corner_radius","arg":"postCornerRadius"}, value: postCornerRadius }, { ...{"kind":"Field","name":"avatar_frame","arg":"avatarFrame"}, value: avatarFrame }, { ...{"kind":"Field","name":"posts_backdrop_enabled","arg":"postsBackdropEnabled"}, value: postsBackdropEnabled }, { ...{"kind":"Field","name":"background_id","arg":"backgroundId"}, value: backgroundId }, { ...{"kind":"Field","name":"background_image_url","arg":"backgroundImageUrl"}, value: backgroundImageUrl }, { ...{"kind":"Field","name":"bubble_style","arg":"bubbleStyle"}, value: bubbleStyle }, { ...{"kind":"Field","name":"font_family","arg":"fontFamily"}, value: fontFamily }, { ...{"kind":"Field","name":"logo_style","arg":"logoStyle"}, value: logoStyle }, { ...{"kind":"Field","name":"custom_font_url","arg":"customFontUrl"}, value: customFontUrl }, { ...{"kind":"Field","name":"custom_font_name","arg":"customFontName"}, value: customFontName }, { ...{"kind":"Field","name":"custom_bubble_css","arg":"customBubbleCss"}, value: customBubbleCss }, { ...{"kind":"Field","name":"custom_background_css","arg":"customBackgroundCss"}, value: customBackgroundCss }] as CallParam[]);
  },
  getDiscussionGroup(channelId: number): Promise<M.DiscussionGroupResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/channel/discussion/get","form":true,"ret":{"k":"obj","c":"DiscussionGroupResponse"}}, [{ ...{"kind":"Field","name":"channel_id","arg":"channelId"}, value: channelId }] as CallParam[]);
  },
  setDiscussionGroup(channelId: number, groupId: number | null): Promise<M.DiscussionGroupResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/channel/discussion/set","form":true,"ret":{"k":"obj","c":"DiscussionGroupResponse"}}, [{ ...{"kind":"Field","name":"channel_id","arg":"channelId"}, value: channelId }, { ...{"kind":"Field","name":"group_id","arg":"groupId"}, value: groupId }] as CallParam[]);
  },
};

/** network/NodeChannelScheduledApi.kt */
export const NodeChannelScheduledApi = {
  getScheduledPosts(channelId: number): Promise<M.ChannelScheduledPostsResponse> {
    return retrofitCall({"base":"node","http":"GET","path":"api/node/channels/{id}/posts/scheduled","ret":{"k":"obj","c":"ChannelScheduledPostsResponse"}}, [{ ...{"kind":"Path","name":"id","arg":"channelId","encoded":false}, value: channelId }] as CallParam[]);
  },
  createScheduledPost(channelId: number, body: M.CreateScheduledPostRequest): Promise<M.ChannelScheduledPostResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/channels/{id}/posts/scheduled","ret":{"k":"obj","c":"ChannelScheduledPostResponse"}}, [{ ...{"kind":"Path","name":"id","arg":"channelId","encoded":false}, value: channelId }, { ...{"kind":"Body","name":null,"arg":"body","schema":"CreateScheduledPostRequest"}, value: body }] as CallParam[]);
  },
  cancelScheduledPost(channelId: number, postId: number): Promise<M.BusinessActionResponse> {
    return retrofitCall({"base":"node","http":"DELETE","path":"api/node/channels/{id}/posts/scheduled/{postId}","ret":{"k":"obj","c":"BusinessActionResponse"}}, [{ ...{"kind":"Path","name":"id","arg":"channelId","encoded":false}, value: channelId }, { ...{"kind":"Path","name":"postId","arg":"postId","encoded":false}, value: postId }] as CallParam[]);
  },
};

/** network/NodeGroupApi.kt */
export const NodeGroupApi = {
  getGroups(limit: number = 50, offset: number = 0): Promise<M.GroupListResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/group/list","form":true,"ret":{"k":"obj","c":"GroupListResponse"}}, [{ ...{"kind":"Field","name":"limit","arg":"limit"}, value: limit }, { ...{"kind":"Field","name":"offset","arg":"offset"}, value: offset }] as CallParam[]);
  },
  getGroupDetails(groupId: number): Promise<M.GroupDetailResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/group/details","form":true,"ret":{"k":"obj","c":"GroupDetailResponse"}}, [{ ...{"kind":"Field","name":"group_id","arg":"groupId"}, value: groupId }] as CallParam[]);
  },
  previewGroup(groupId: number): Promise<M.GroupPreviewResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/group/preview","form":true,"ret":{"k":"obj","c":"GroupPreviewResponse"}}, [{ ...{"kind":"Field","name":"group_id","arg":"groupId"}, value: groupId }] as CallParam[]);
  },
  createGroup(name: string, description: string | null = null, isPrivate: number = 0, parts: string | null = null, userIds: string | null = null): Promise<M.CreateGroupResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/group/create","form":true,"ret":{"k":"obj","c":"CreateGroupResponse"}}, [{ ...{"kind":"Field","name":"group_name","arg":"name"}, value: name }, { ...{"kind":"Field","name":"description","arg":"description"}, value: description }, { ...{"kind":"Field","name":"is_private","arg":"isPrivate"}, value: isPrivate }, { ...{"kind":"Field","name":"parts","arg":"parts"}, value: parts }, { ...{"kind":"Field","name":"user_ids","arg":"userIds"}, value: userIds }] as CallParam[]);
  },
  updateGroup(groupId: number, name: string | null = null, description: string | null = null, isPrivate: number | null = null): Promise<M.CreateGroupResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/group/update","form":true,"ret":{"k":"obj","c":"CreateGroupResponse"}}, [{ ...{"kind":"Field","name":"group_id","arg":"groupId"}, value: groupId }, { ...{"kind":"Field","name":"group_name","arg":"name"}, value: name }, { ...{"kind":"Field","name":"description","arg":"description"}, value: description }, { ...{"kind":"Field","name":"is_private","arg":"isPrivate"}, value: isPrivate }] as CallParam[]);
  },
  deleteGroup(groupId: number): Promise<M.GroupSimpleResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/group/delete","form":true,"ret":{"k":"obj","c":"GroupSimpleResponse"}}, [{ ...{"kind":"Field","name":"group_id","arg":"groupId"}, value: groupId }] as CallParam[]);
  },
  leaveGroup(groupId: number): Promise<M.GroupSimpleResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/group/leave","form":true,"ret":{"k":"obj","c":"GroupSimpleResponse"}}, [{ ...{"kind":"Field","name":"group_id","arg":"groupId"}, value: groupId }] as CallParam[]);
  },
  searchGroups(query: string, limit: number = 30, offset: number = 0): Promise<M.GroupListResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/group/search","form":true,"ret":{"k":"obj","c":"GroupListResponse"}}, [{ ...{"kind":"Field","name":"query","arg":"query"}, value: query }, { ...{"kind":"Field","name":"limit","arg":"limit"}, value: limit }, { ...{"kind":"Field","name":"offset","arg":"offset"}, value: offset }] as CallParam[]);
  },
  getGroupMembers(groupId: number, limit: number = 100, offset: number = 0): Promise<M.GroupMembersResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/group/members","form":true,"ret":{"k":"obj","c":"GroupMembersResponse"}}, [{ ...{"kind":"Field","name":"group_id","arg":"groupId"}, value: groupId }, { ...{"kind":"Field","name":"limit","arg":"limit"}, value: limit }, { ...{"kind":"Field","name":"offset","arg":"offset"}, value: offset }] as CallParam[]);
  },
  addGroupMember(groupId: number, userId: number | null = null, parts: string | null = null): Promise<M.GroupSimpleResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/group/add-member","form":true,"ret":{"k":"obj","c":"GroupSimpleResponse"}}, [{ ...{"kind":"Field","name":"group_id","arg":"groupId"}, value: groupId }, { ...{"kind":"Field","name":"user_id","arg":"userId"}, value: userId }, { ...{"kind":"Field","name":"parts","arg":"parts"}, value: parts }] as CallParam[]);
  },
  removeGroupMember(groupId: number, userId: number): Promise<M.GroupSimpleResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/group/remove-member","form":true,"ret":{"k":"obj","c":"GroupSimpleResponse"}}, [{ ...{"kind":"Field","name":"group_id","arg":"groupId"}, value: groupId }, { ...{"kind":"Field","name":"user_id","arg":"userId"}, value: userId }] as CallParam[]);
  },
  setGroupRole(groupId: number, userId: number, role: string): Promise<M.GroupSimpleResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/group/set-role","form":true,"ret":{"k":"obj","c":"GroupSimpleResponse"}}, [{ ...{"kind":"Field","name":"group_id","arg":"groupId"}, value: groupId }, { ...{"kind":"Field","name":"user_id","arg":"userId"}, value: userId }, { ...{"kind":"Field","name":"role","arg":"role"}, value: role }] as CallParam[]);
  },
  joinGroup(groupId: number): Promise<M.GroupDetailResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/group/join","form":true,"ret":{"k":"obj","c":"GroupDetailResponse"}}, [{ ...{"kind":"Field","name":"group_id","arg":"groupId"}, value: groupId }] as CallParam[]);
  },
  requestJoinGroup(groupId: number): Promise<M.GroupSimpleResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/group/request-join","form":true,"ret":{"k":"obj","c":"GroupSimpleResponse"}}, [{ ...{"kind":"Field","name":"group_id","arg":"groupId"}, value: groupId }] as CallParam[]);
  },
  getJoinRequests(groupId: number): Promise<M.GroupJoinRequestsResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/group/join-requests","form":true,"ret":{"k":"obj","c":"GroupJoinRequestsResponse"}}, [{ ...{"kind":"Field","name":"group_id","arg":"groupId"}, value: groupId }] as CallParam[]);
  },
  approveJoinRequest(groupId: number, userId: number): Promise<M.GroupSimpleResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/group/approve-join","form":true,"ret":{"k":"obj","c":"GroupSimpleResponse"}}, [{ ...{"kind":"Field","name":"group_id","arg":"groupId"}, value: groupId }, { ...{"kind":"Field","name":"user_id","arg":"userId"}, value: userId }] as CallParam[]);
  },
  rejectJoinRequest(groupId: number, userId: number): Promise<M.GroupSimpleResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/group/reject-join","form":true,"ret":{"k":"obj","c":"GroupSimpleResponse"}}, [{ ...{"kind":"Field","name":"group_id","arg":"groupId"}, value: groupId }, { ...{"kind":"Field","name":"user_id","arg":"userId"}, value: userId }] as CallParam[]);
  },
  banGroupMember(groupId: number, userId: number, durationSeconds: number = 0): Promise<M.GroupSimpleResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/group/ban-member","form":true,"ret":{"k":"obj","c":"GroupSimpleResponse"}}, [{ ...{"kind":"Field","name":"group_id","arg":"groupId"}, value: groupId }, { ...{"kind":"Field","name":"user_id","arg":"userId"}, value: userId }, { ...{"kind":"Field","name":"duration_seconds","arg":"durationSeconds"}, value: durationSeconds }] as CallParam[]);
  },
  unbanGroupMember(groupId: number, userId: number): Promise<M.GroupSimpleResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/group/unban-member","form":true,"ret":{"k":"obj","c":"GroupSimpleResponse"}}, [{ ...{"kind":"Field","name":"group_id","arg":"groupId"}, value: groupId }, { ...{"kind":"Field","name":"user_id","arg":"userId"}, value: userId }] as CallParam[]);
  },
  muteGroupMember(groupId: number, userId: number): Promise<M.GroupSimpleResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/group/mute-member","form":true,"ret":{"k":"obj","c":"GroupSimpleResponse"}}, [{ ...{"kind":"Field","name":"group_id","arg":"groupId"}, value: groupId }, { ...{"kind":"Field","name":"user_id","arg":"userId"}, value: userId }] as CallParam[]);
  },
  unmuteGroupMember(groupId: number, userId: number): Promise<M.GroupSimpleResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/group/unmute-member","form":true,"ret":{"k":"obj","c":"GroupSimpleResponse"}}, [{ ...{"kind":"Field","name":"group_id","arg":"groupId"}, value: groupId }, { ...{"kind":"Field","name":"user_id","arg":"userId"}, value: userId }] as CallParam[]);
  },
  getGroupMessages(groupId: number, limit: number = 30, afterMessageId: number = 0, beforeMessageId: number = 0, topicId: number = 0): Promise<M.GroupMessageListResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/group/messages/get","form":true,"ret":{"k":"obj","c":"GroupMessageListResponse"}}, [{ ...{"kind":"Field","name":"group_id","arg":"groupId"}, value: groupId }, { ...{"kind":"Field","name":"limit","arg":"limit"}, value: limit }, { ...{"kind":"Field","name":"after_message_id","arg":"afterMessageId"}, value: afterMessageId }, { ...{"kind":"Field","name":"before_message_id","arg":"beforeMessageId"}, value: beforeMessageId }, { ...{"kind":"Field","name":"topic_id","arg":"topicId"}, value: topicId }] as CallParam[]);
  },
  sendGroupMessage(groupId: number, text: string, replyId: number = 0, replyToText: string | null = null, replyToName: string | null = null, stickers: string | null = null, topicId: number = 0, iv: string | null = null, tag: string | null = null, signalHeader: string | null = null, cipherVersion: number | null = null, orText: string | null = null, clientMsgId: string | null = null, forwardedChannelId: number | null = null, forwardedPostId: number | null = null): Promise<M.GroupMessageResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/group/messages/send","form":true,"ret":{"k":"obj","c":"GroupMessageResponse"}}, [{ ...{"kind":"Field","name":"group_id","arg":"groupId"}, value: groupId }, { ...{"kind":"Field","name":"text","arg":"text"}, value: text }, { ...{"kind":"Field","name":"reply_id","arg":"replyId"}, value: replyId }, { ...{"kind":"Field","name":"reply_to_text","arg":"replyToText"}, value: replyToText }, { ...{"kind":"Field","name":"reply_to_name","arg":"replyToName"}, value: replyToName }, { ...{"kind":"Field","name":"stickers","arg":"stickers"}, value: stickers }, { ...{"kind":"Field","name":"topic_id","arg":"topicId"}, value: topicId }, { ...{"kind":"Field","name":"iv","arg":"iv"}, value: iv }, { ...{"kind":"Field","name":"tag","arg":"tag"}, value: tag }, { ...{"kind":"Field","name":"signal_header","arg":"signalHeader"}, value: signalHeader }, { ...{"kind":"Field","name":"cipher_version","arg":"cipherVersion"}, value: cipherVersion }, { ...{"kind":"Field","name":"or_text","arg":"orText"}, value: orText }, { ...{"kind":"Field","name":"client_msg_id","arg":"clientMsgId"}, value: clientMsgId }, { ...{"kind":"Field","name":"forwarded_channel_id","arg":"forwardedChannelId"}, value: forwardedChannelId }, { ...{"kind":"Field","name":"forwarded_post_id","arg":"forwardedPostId"}, value: forwardedPostId }] as CallParam[]);
  },
  loadMoreGroupMessages(groupId: number, beforeMessageId: number, limit: number = 15, topicId: number = 0): Promise<M.GroupMessageListResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/group/messages/loadmore","form":true,"ret":{"k":"obj","c":"GroupMessageListResponse"}}, [{ ...{"kind":"Field","name":"group_id","arg":"groupId"}, value: groupId }, { ...{"kind":"Field","name":"before_message_id","arg":"beforeMessageId"}, value: beforeMessageId }, { ...{"kind":"Field","name":"limit","arg":"limit"}, value: limit }, { ...{"kind":"Field","name":"topic_id","arg":"topicId"}, value: topicId }] as CallParam[]);
  },
  editGroupMessage(messageId: number, text: string, iv: string | null = null, tag: string | null = null, cipherVersion: number | null = null, signalHeader: string | null = null): Promise<M.GroupSimpleResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/group/messages/edit","form":true,"ret":{"k":"obj","c":"GroupSimpleResponse"}}, [{ ...{"kind":"Field","name":"message_id","arg":"messageId"}, value: messageId }, { ...{"kind":"Field","name":"text","arg":"text"}, value: text }, { ...{"kind":"Field","name":"iv","arg":"iv"}, value: iv }, { ...{"kind":"Field","name":"tag","arg":"tag"}, value: tag }, { ...{"kind":"Field","name":"cipher_version","arg":"cipherVersion"}, value: cipherVersion }, { ...{"kind":"Field","name":"signal_header","arg":"signalHeader"}, value: signalHeader }] as CallParam[]);
  },
  deleteGroupMessage(messageId: number): Promise<M.GroupSimpleResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/group/messages/delete","form":true,"ret":{"k":"obj","c":"GroupSimpleResponse"}}, [{ ...{"kind":"Field","name":"message_id","arg":"messageId"}, value: messageId }] as CallParam[]);
  },
  clearGroupHistorySelf(groupId: number): Promise<M.GroupSimpleResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/group/messages/clear-self","form":true,"ret":{"k":"obj","c":"GroupSimpleResponse"}}, [{ ...{"kind":"Field","name":"group_id","arg":"groupId"}, value: groupId }] as CallParam[]);
  },
  clearGroupHistoryAdmin(groupId: number): Promise<M.GroupSimpleResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/group/messages/clear-all","form":true,"ret":{"k":"obj","c":"GroupSimpleResponse"}}, [{ ...{"kind":"Field","name":"group_id","arg":"groupId"}, value: groupId }] as CallParam[]);
  },
  pinGroupMessage(groupId: number, messageId: number): Promise<M.GroupMessageResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/group/messages/pin","form":true,"ret":{"k":"obj","c":"GroupMessageResponse"}}, [{ ...{"kind":"Field","name":"group_id","arg":"groupId"}, value: groupId }, { ...{"kind":"Field","name":"message_id","arg":"messageId"}, value: messageId }] as CallParam[]);
  },
  unpinGroupMessage(groupId: number, messageId: number | null = null): Promise<M.GroupSimpleResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/group/messages/unpin","form":true,"ret":{"k":"obj","c":"GroupSimpleResponse"}}, [{ ...{"kind":"Field","name":"group_id","arg":"groupId"}, value: groupId }, { ...{"kind":"Field","name":"message_id","arg":"messageId"}, value: messageId }] as CallParam[]);
  },
  searchGroupMessages(groupId: number, query: string, limit: number = 50, offset: number = 0): Promise<M.GroupMessageListResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/group/messages/search","form":true,"ret":{"k":"obj","c":"GroupMessageListResponse"}}, [{ ...{"kind":"Field","name":"group_id","arg":"groupId"}, value: groupId }, { ...{"kind":"Field","name":"query","arg":"query"}, value: query }, { ...{"kind":"Field","name":"limit","arg":"limit"}, value: limit }, { ...{"kind":"Field","name":"offset","arg":"offset"}, value: offset }] as CallParam[]);
  },
  markGroupMessagesSeen(groupId: number): Promise<M.GroupSimpleResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/group/messages/seen","form":true,"ret":{"k":"obj","c":"GroupSimpleResponse"}}, [{ ...{"kind":"Field","name":"group_id","arg":"groupId"}, value: groupId }] as CallParam[]);
  },
  sendGroupTyping(groupId: number, typing: boolean = true): Promise<M.GroupSimpleResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/group/messages/typing","form":true,"ret":{"k":"obj","c":"GroupSimpleResponse"}}, [{ ...{"kind":"Field","name":"group_id","arg":"groupId"}, value: groupId }, { ...{"kind":"Field","name":"typing","arg":"typing"}, value: typing }] as CallParam[]);
  },
  sendGroupUserAction(groupId: number, action: string): Promise<M.GroupSimpleResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/group/messages/user-action","form":true,"ret":{"k":"obj","c":"GroupSimpleResponse"}}, [{ ...{"kind":"Field","name":"group_id","arg":"groupId"}, value: groupId }, { ...{"kind":"Field","name":"action","arg":"action"}, value: action }] as CallParam[]);
  },
  getGroupCustomization(groupId: number): Promise<M.GroupCustomizationResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/group/customization/get","form":true,"ret":{"k":"obj","c":"GroupCustomizationResponse"}}, [{ ...{"kind":"Field","name":"group_id","arg":"groupId"}, value: groupId }] as CallParam[]);
  },
  updateGroupCustomization(groupId: number, bubbleStyle: string | null = null, presetBackground: string | null = null, accentColor: string | null = null, enabledByAdmin: string | null = null): Promise<M.GroupCustomizationResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/group/customization/update","form":true,"ret":{"k":"obj","c":"GroupCustomizationResponse"}}, [{ ...{"kind":"Field","name":"group_id","arg":"groupId"}, value: groupId }, { ...{"kind":"Field","name":"bubble_style","arg":"bubbleStyle"}, value: bubbleStyle }, { ...{"kind":"Field","name":"preset_background","arg":"presetBackground"}, value: presetBackground }, { ...{"kind":"Field","name":"accent_color","arg":"accentColor"}, value: accentColor }, { ...{"kind":"Field","name":"enabled_by_admin","arg":"enabledByAdmin"}, value: enabledByAdmin }] as CallParam[]);
  },
  resetGroupCustomization(groupId: number): Promise<M.GroupCustomizationResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/group/customization/reset","form":true,"ret":{"k":"obj","c":"GroupCustomizationResponse"}}, [{ ...{"kind":"Field","name":"group_id","arg":"groupId"}, value: groupId }] as CallParam[]);
  },
  uploadGroupAvatar(groupId: RequestBodyLike, avatar: MultipartPart): Promise<M.GroupAvatarResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/group/upload-avatar","multipart":true,"ret":{"k":"obj","c":"GroupAvatarResponse"}}, [{ ...{"kind":"Part","name":"group_id","arg":"groupId"}, value: groupId }, { ...{"kind":"Part","name":null,"arg":"avatar"}, value: avatar }] as CallParam[]);
  },
  updateGroupSettings(groupId: number, groupName: string | null = null, description: string | null = null, isPrivate: number | null = null, whoCanSendMessages: string | null = null, formattingPermissions: string | null = null, joinRequestsEnabled: boolean | null = null, settingsJson: string | null = null): Promise<M.GroupDetailResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/group/settings","form":true,"ret":{"k":"obj","c":"GroupDetailResponse"}}, [{ ...{"kind":"Field","name":"group_id","arg":"groupId"}, value: groupId }, { ...{"kind":"Field","name":"group_name","arg":"groupName"}, value: groupName }, { ...{"kind":"Field","name":"description","arg":"description"}, value: description }, { ...{"kind":"Field","name":"is_private","arg":"isPrivate"}, value: isPrivate }, { ...{"kind":"Field","name":"who_can_send_messages","arg":"whoCanSendMessages"}, value: whoCanSendMessages }, { ...{"kind":"Field","name":"formatting_permissions","arg":"formattingPermissions"}, value: formattingPermissions }, { ...{"kind":"Field","name":"join_requests_enabled","arg":"joinRequestsEnabled"}, value: joinRequestsEnabled }, { ...{"kind":"Field","name":"settings_json","arg":"settingsJson"}, value: settingsJson }] as CallParam[]);
  },
  muteGroup(groupId: number): Promise<M.GroupSimpleResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/group/mute","form":true,"ret":{"k":"obj","c":"GroupSimpleResponse"}}, [{ ...{"kind":"Field","name":"group_id","arg":"groupId"}, value: groupId }] as CallParam[]);
  },
  unmuteGroup(groupId: number): Promise<M.GroupSimpleResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/group/unmute","form":true,"ret":{"k":"obj","c":"GroupSimpleResponse"}}, [{ ...{"kind":"Field","name":"group_id","arg":"groupId"}, value: groupId }] as CallParam[]);
  },
  generateGroupQr(groupId: number): Promise<M.GroupQrResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/group/qr-generate","form":true,"ret":{"k":"obj","c":"GroupQrResponse"}}, [{ ...{"kind":"Field","name":"group_id","arg":"groupId"}, value: groupId }] as CallParam[]);
  },
  joinGroupByQr(inviteCode: string): Promise<M.GroupDetailResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/group/qr-join","form":true,"ret":{"k":"obj","c":"GroupDetailResponse"}}, [{ ...{"kind":"Field","name":"invite_code","arg":"inviteCode"}, value: inviteCode }] as CallParam[]);
  },
  getGroupStatistics(groupId: number): Promise<M.GroupStatisticsResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/group/statistics","form":true,"ret":{"k":"obj","c":"GroupStatisticsResponse"}}, [{ ...{"kind":"Field","name":"group_id","arg":"groupId"}, value: groupId }] as CallParam[]);
  },
  addGroupAdmin(groupId: number, userId: number, permGeneral: number | null = null, permPrivacy: number | null = null, permAvatar: number | null = null, permMembers: number | null = null, permAnalytics: number | null = null, permDeleteGroup: number | null = null): Promise<M.GroupSimpleResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/group/add-admin","form":true,"ret":{"k":"obj","c":"GroupSimpleResponse"}}, [{ ...{"kind":"Field","name":"group_id","arg":"groupId"}, value: groupId }, { ...{"kind":"Field","name":"user_id","arg":"userId"}, value: userId }, { ...{"kind":"Field","name":"perm_general","arg":"permGeneral"}, value: permGeneral }, { ...{"kind":"Field","name":"perm_privacy","arg":"permPrivacy"}, value: permPrivacy }, { ...{"kind":"Field","name":"perm_avatar","arg":"permAvatar"}, value: permAvatar }, { ...{"kind":"Field","name":"perm_members","arg":"permMembers"}, value: permMembers }, { ...{"kind":"Field","name":"perm_analytics","arg":"permAnalytics"}, value: permAnalytics }, { ...{"kind":"Field","name":"perm_delete_group","arg":"permDeleteGroup"}, value: permDeleteGroup }] as CallParam[]);
  },
  removeGroupAdmin(groupId: number, userId: number): Promise<M.GroupSimpleResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/group/remove-admin","form":true,"ret":{"k":"obj","c":"GroupSimpleResponse"}}, [{ ...{"kind":"Field","name":"group_id","arg":"groupId"}, value: groupId }, { ...{"kind":"Field","name":"user_id","arg":"userId"}, value: userId }] as CallParam[]);
  },
  exportGroupChat(groupId: number, format: string = "json", limit: number = 500): Promise<RawResponseBody> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/group/export","form":true,"raw":true,"ret":{"k":"raw"}}, [{ ...{"kind":"Field","name":"group_id","arg":"groupId"}, value: groupId }, { ...{"kind":"Field","name":"format","arg":"format"}, value: format }, { ...{"kind":"Field","name":"limit","arg":"limit"}, value: limit }] as CallParam[]);
  },
  listTopics(groupId: number): Promise<M.GroupTopicsResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/group/topics/list","form":true,"ret":{"k":"obj","c":"GroupTopicsResponse"}}, [{ ...{"kind":"Field","name":"group_id","arg":"groupId"}, value: groupId }] as CallParam[]);
  },
  createTopic(groupId: number, name: string, description: string | null = null, color: string | null = null, icon: string | null = null, isPrivate: number = 0): Promise<M.TopicActionResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/group/topics/create","form":true,"ret":{"k":"obj","c":"TopicActionResponse"}}, [{ ...{"kind":"Field","name":"group_id","arg":"groupId"}, value: groupId }, { ...{"kind":"Field","name":"name","arg":"name"}, value: name }, { ...{"kind":"Field","name":"description","arg":"description"}, value: description }, { ...{"kind":"Field","name":"color","arg":"color"}, value: color }, { ...{"kind":"Field","name":"icon","arg":"icon"}, value: icon }, { ...{"kind":"Field","name":"is_private","arg":"isPrivate"}, value: isPrivate }] as CallParam[]);
  },
  updateTopic(groupId: number, topicId: number, name: string | null = null, description: string | null = null, color: string | null = null, icon: string | null = null, isPinned: boolean | null = null, isArchived: boolean | null = null): Promise<M.TopicActionResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/group/topics/update","form":true,"ret":{"k":"obj","c":"TopicActionResponse"}}, [{ ...{"kind":"Field","name":"group_id","arg":"groupId"}, value: groupId }, { ...{"kind":"Field","name":"topic_id","arg":"topicId"}, value: topicId }, { ...{"kind":"Field","name":"name","arg":"name"}, value: name }, { ...{"kind":"Field","name":"description","arg":"description"}, value: description }, { ...{"kind":"Field","name":"color","arg":"color"}, value: color }, { ...{"kind":"Field","name":"icon","arg":"icon"}, value: icon }, { ...{"kind":"Field","name":"is_pinned","arg":"isPinned"}, value: isPinned }, { ...{"kind":"Field","name":"is_archived","arg":"isArchived"}, value: isArchived }] as CallParam[]);
  },
  deleteTopic(groupId: number, topicId: number): Promise<M.TopicActionResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/group/topics/delete","form":true,"ret":{"k":"obj","c":"TopicActionResponse"}}, [{ ...{"kind":"Field","name":"group_id","arg":"groupId"}, value: groupId }, { ...{"kind":"Field","name":"topic_id","arg":"topicId"}, value: topicId }] as CallParam[]);
  },
  setTopicModerators(groupId: number, topicId: number, moderatorIds: Array<number>): Promise<M.TopicActionResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/group/topics/moderators","form":true,"ret":{"k":"obj","c":"TopicActionResponse"}}, [{ ...{"kind":"Field","name":"group_id","arg":"groupId"}, value: groupId }, { ...{"kind":"Field","name":"topic_id","arg":"topicId"}, value: topicId }, { ...{"kind":"Field","name":"moderator_ids[]","arg":"moderatorIds"}, value: moderatorIds }] as CallParam[]);
  },
  setAnonymousAdmin(groupId: number, anonymous: string): Promise<M.GroupAnonAdminResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/group/admin/set-anonymous","form":true,"ret":{"k":"obj","c":"GroupAnonAdminResponse"}}, [{ ...{"kind":"Field","name":"group_id","arg":"groupId"}, value: groupId }, { ...{"kind":"Field","name":"anonymous","arg":"anonymous"}, value: anonymous }] as CallParam[]);
  },
  getAnonymousAdmin(groupId: number): Promise<M.GroupAnonAdminResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/group/admin/get-anonymous","form":true,"ret":{"k":"obj","c":"GroupAnonAdminResponse"}}, [{ ...{"kind":"Field","name":"group_id","arg":"groupId"}, value: groupId }] as CallParam[]);
  },
  getAdminLogs(groupId: number, page: number = 1, limit: number = 50): Promise<M.GroupAdminLogsResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/group/admin-logs","form":true,"ret":{"k":"obj","c":"GroupAdminLogsResponse"}}, [{ ...{"kind":"Field","name":"group_id","arg":"groupId"}, value: groupId }, { ...{"kind":"Field","name":"page","arg":"page"}, value: page }, { ...{"kind":"Field","name":"limit","arg":"limit"}, value: limit }] as CallParam[]);
  },
  createPoll(groupId: number, question: string, options: Array<string>, isAnonymous: string = "1", allowsMultiple: string = "0", pollType: string = "regular"): Promise<M.GroupPollResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/group/poll/create","form":true,"ret":{"k":"obj","c":"GroupPollResponse"}}, [{ ...{"kind":"Field","name":"group_id","arg":"groupId"}, value: groupId }, { ...{"kind":"Field","name":"question","arg":"question"}, value: question }, { ...{"kind":"Field","name":"options[]","arg":"options"}, value: options }, { ...{"kind":"Field","name":"is_anonymous","arg":"isAnonymous"}, value: isAnonymous }, { ...{"kind":"Field","name":"allows_multiple_answers","arg":"allowsMultiple"}, value: allowsMultiple }, { ...{"kind":"Field","name":"poll_type","arg":"pollType"}, value: pollType }] as CallParam[]);
  },
  getPoll(groupId: number, pollId: number): Promise<M.GroupPollResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/group/poll/get","form":true,"ret":{"k":"obj","c":"GroupPollResponse"}}, [{ ...{"kind":"Field","name":"group_id","arg":"groupId"}, value: groupId }, { ...{"kind":"Field","name":"poll_id","arg":"pollId"}, value: pollId }] as CallParam[]);
  },
  votePoll(groupId: number, pollId: number, optionIds: Array<number>): Promise<M.GroupPollResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/group/poll/vote","form":true,"ret":{"k":"obj","c":"GroupPollResponse"}}, [{ ...{"kind":"Field","name":"group_id","arg":"groupId"}, value: groupId }, { ...{"kind":"Field","name":"poll_id","arg":"pollId"}, value: pollId }, { ...{"kind":"Field","name":"option_ids[]","arg":"optionIds"}, value: optionIds }] as CallParam[]);
  },
  closePoll(groupId: number, pollId: number): Promise<M.GroupPollResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/group/poll/close","form":true,"ret":{"k":"obj","c":"GroupPollResponse"}}, [{ ...{"kind":"Field","name":"group_id","arg":"groupId"}, value: groupId }, { ...{"kind":"Field","name":"poll_id","arg":"pollId"}, value: pollId }] as CallParam[]);
  },
  getAiSummary(groupId: number, limit: number = 100, provider: string = "gemini"): Promise<M.AiSummaryResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/group/ai-summary","form":true,"ret":{"k":"obj","c":"AiSummaryResponse"}}, [{ ...{"kind":"Field","name":"group_id","arg":"groupId"}, value: groupId }, { ...{"kind":"Field","name":"limit","arg":"limit"}, value: limit }, { ...{"kind":"Field","name":"provider","arg":"provider"}, value: provider }] as CallParam[]);
  },
  getActiveVoiceRoom(groupId: number, callType: string = "audio"): Promise<M.VoiceRoomResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/group/voice-room/get","form":true,"ret":{"k":"obj","c":"VoiceRoomResponse"}}, [{ ...{"kind":"Field","name":"group_id","arg":"groupId"}, value: groupId }, { ...{"kind":"Field","name":"call_type","arg":"callType"}, value: callType }] as CallParam[]);
  },
  joinVoiceRoom(groupId: number, callType: string = "audio"): Promise<M.VoiceRoomJoinResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/group/voice-room/join","form":true,"ret":{"k":"obj","c":"VoiceRoomJoinResponse"}}, [{ ...{"kind":"Field","name":"group_id","arg":"groupId"}, value: groupId }, { ...{"kind":"Field","name":"call_type","arg":"callType"}, value: callType }] as CallParam[]);
  },
  leaveVoiceRoom(groupId: number, callType: string = "audio"): Promise<M.VoiceRoomLeaveResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/group/voice-room/leave","form":true,"ret":{"k":"obj","c":"VoiceRoomLeaveResponse"}}, [{ ...{"kind":"Field","name":"group_id","arg":"groupId"}, value: groupId }, { ...{"kind":"Field","name":"call_type","arg":"callType"}, value: callType }] as CallParam[]);
  },
  getGroupE2EEKey(groupId: number): Promise<M.GroupE2EEKeyResponse> {
    return retrofitCall({"base":"node","http":"GET","path":"api/node/group/e2ee/key","ret":{"k":"obj","c":"GroupE2EEKeyResponse"}}, [{ ...{"kind":"Query","name":"group_id","arg":"groupId"}, value: groupId }] as CallParam[]);
  },
  publishGroupE2EEKey(groupId: number, keyB64: string): Promise<M.GroupE2EEKeyResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/group/e2ee/key","form":true,"ret":{"k":"obj","c":"GroupE2EEKeyResponse"}}, [{ ...{"kind":"Field","name":"group_id","arg":"groupId"}, value: groupId }, { ...{"kind":"Field","name":"key_b64","arg":"keyB64"}, value: keyB64 }] as CallParam[]);
  },
  runGiveaway(groupId: number, winnersCount: number = 1, minMessages: number = 0, periodDays: number = 30): Promise<M.GroupGiveawayResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/group/giveaway/run","form":true,"ret":{"k":"obj","c":"GroupGiveawayResponse"}}, [{ ...{"kind":"Field","name":"group_id","arg":"groupId"}, value: groupId }, { ...{"kind":"Field","name":"winners_count","arg":"winnersCount"}, value: winnersCount }, { ...{"kind":"Field","name":"min_messages","arg":"minMessages"}, value: minMessages }, { ...{"kind":"Field","name":"period_days","arg":"periodDays"}, value: periodDays }] as CallParam[]);
  },
  createPublicGiveaway(chatType: string, chatId: number, prize: string, description: string | null, buttonText: string | null, mediaUrl: string | null, winnersCount: number, durationMinutes: number | null, endsAt: number | null, maxParticipants: number | null, requiredChannels: string | null): Promise<M.PublicGiveawayResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/giveaways/create","form":true,"ret":{"k":"obj","c":"PublicGiveawayResponse"}}, [{ ...{"kind":"Field","name":"chat_type","arg":"chatType"}, value: chatType }, { ...{"kind":"Field","name":"chat_id","arg":"chatId"}, value: chatId }, { ...{"kind":"Field","name":"prize","arg":"prize"}, value: prize }, { ...{"kind":"Field","name":"description","arg":"description"}, value: description }, { ...{"kind":"Field","name":"button_text","arg":"buttonText"}, value: buttonText }, { ...{"kind":"Field","name":"media_url","arg":"mediaUrl"}, value: mediaUrl }, { ...{"kind":"Field","name":"winners_count","arg":"winnersCount"}, value: winnersCount }, { ...{"kind":"Field","name":"duration_minutes","arg":"durationMinutes"}, value: durationMinutes }, { ...{"kind":"Field","name":"ends_at","arg":"endsAt"}, value: endsAt }, { ...{"kind":"Field","name":"max_participants","arg":"maxParticipants"}, value: maxParticipants }, { ...{"kind":"Field","name":"required_channels","arg":"requiredChannels"}, value: requiredChannels }] as CallParam[]);
  },
  getPublicGiveaway(giveawayId: number): Promise<M.PublicGiveawayResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/group/giveaways/get","form":true,"ret":{"k":"obj","c":"PublicGiveawayResponse"}}, [{ ...{"kind":"Field","name":"giveaway_id","arg":"giveawayId"}, value: giveawayId }] as CallParam[]);
  },
  joinPublicGiveaway(giveawayId: number): Promise<M.PublicGiveawayResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/group/giveaways/join","form":true,"ret":{"k":"obj","c":"PublicGiveawayResponse"}}, [{ ...{"kind":"Field","name":"giveaway_id","arg":"giveawayId"}, value: giveawayId }] as CallParam[]);
  },
  finishPublicGiveaway(giveawayId: number): Promise<M.PublicGiveawayResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/group/giveaways/finish","form":true,"ret":{"k":"obj","c":"PublicGiveawayResponse"}}, [{ ...{"kind":"Field","name":"giveaway_id","arg":"giveawayId"}, value: giveawayId }] as CallParam[]);
  },
  cancelPublicGiveaway(giveawayId: number): Promise<M.PublicGiveawayResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/group/giveaways/cancel","form":true,"ret":{"k":"obj","c":"PublicGiveawayResponse"}}, [{ ...{"kind":"Field","name":"giveaway_id","arg":"giveawayId"}, value: giveawayId }] as CallParam[]);
  },
};

/** network/NodePacksApi.kt */
export const NodePacksApi = {
  getPacks(type: string, page: number = 1, pageSize: number = 60, q: string | null = null): Promise<M.NodePacksResponse> {
    return retrofitCall({"base":"node","http":"GET","path":"api/node/packs","ret":{"k":"obj","c":"NodePacksResponse"}}, [{ ...{"kind":"Query","name":"type","arg":"type"}, value: type }, { ...{"kind":"Query","name":"page","arg":"page"}, value: page }, { ...{"kind":"Query","name":"pageSize","arg":"pageSize"}, value: pageSize }, { ...{"kind":"Query","name":"q","arg":"q"}, value: q }] as CallParam[]);
  },
  getPack(slug: string): Promise<M.NodePackResponse> {
    return retrofitCall({"base":"node","http":"GET","path":"api/node/packs/{slug}","ret":{"k":"obj","c":"NodePackResponse"}}, [{ ...{"kind":"Path","name":"slug","arg":"slug","encoded":false}, value: slug }] as CallParam[]);
  },
};

/** network/NodeProfileApi.kt */
export const NodeProfileApi = {
  getMyProfile(): Promise<M.GetUserDataResponse> {
    return retrofitCall({"base":"node","http":"GET","path":"api/node/users/me","ret":{"k":"obj","c":"GetUserDataResponse"}}, [] as CallParam[]);
  },
  updateMyProfile(firstName: string | null = null, lastName: string | null = null, about: string | null = null, birthday: string | null = null, gender: string | null = null, address: string | null = null, city: string | null = null, state: string | null = null, website: string | null = null, working: string | null = null, school: string | null = null, language: string | null = null, facebook: string | null = null, twitter: string | null = null, instagram: string | null = null, linkedin: string | null = null, youtube: string | null = null, username: string | null = null): Promise<M.UpdateUserDataResponse> {
    return retrofitCall({"base":"node","http":"PUT","path":"api/node/users/me","form":true,"ret":{"k":"obj","c":"UpdateUserDataResponse"}}, [{ ...{"kind":"Field","name":"first_name","arg":"firstName"}, value: firstName }, { ...{"kind":"Field","name":"last_name","arg":"lastName"}, value: lastName }, { ...{"kind":"Field","name":"about","arg":"about"}, value: about }, { ...{"kind":"Field","name":"birthday","arg":"birthday"}, value: birthday }, { ...{"kind":"Field","name":"gender","arg":"gender"}, value: gender }, { ...{"kind":"Field","name":"address","arg":"address"}, value: address }, { ...{"kind":"Field","name":"city","arg":"city"}, value: city }, { ...{"kind":"Field","name":"state","arg":"state"}, value: state }, { ...{"kind":"Field","name":"website","arg":"website"}, value: website }, { ...{"kind":"Field","name":"working","arg":"working"}, value: working }, { ...{"kind":"Field","name":"school","arg":"school"}, value: school }, { ...{"kind":"Field","name":"language","arg":"language"}, value: language }, { ...{"kind":"Field","name":"facebook","arg":"facebook"}, value: facebook }, { ...{"kind":"Field","name":"twitter","arg":"twitter"}, value: twitter }, { ...{"kind":"Field","name":"instagram","arg":"instagram"}, value: instagram }, { ...{"kind":"Field","name":"linkedin","arg":"linkedin"}, value: linkedin }, { ...{"kind":"Field","name":"youtube","arg":"youtube"}, value: youtube }, { ...{"kind":"Field","name":"username","arg":"username"}, value: username }] as CallParam[]);
  },
  changePassword(currentPassword: string, newPassword: string): Promise<M.UpdateUserDataResponse> {
    return retrofitCall({"base":"node","http":"PUT","path":"api/node/users/me/password","form":true,"ret":{"k":"obj","c":"UpdateUserDataResponse"}}, [{ ...{"kind":"Field","name":"current_password","arg":"currentPassword"}, value: currentPassword }, { ...{"kind":"Field","name":"new_password","arg":"newPassword"}, value: newPassword }] as CallParam[]);
  },
  updateNotifications(emailNotification: number | null = null, eLiked: number | null = null, eWondered: number | null = null, eShared: number | null = null, eFollowed: number | null = null, eCommented: number | null = null, eVisited: number | null = null, eLikedPage: number | null = null, eMentioned: number | null = null, eJoinedGroup: number | null = null, eAccepted: number | null = null, eProfileWallPost: number | null = null): Promise<M.UpdateUserDataResponse> {
    return retrofitCall({"base":"node","http":"PUT","path":"api/node/users/me/notifications","form":true,"ret":{"k":"obj","c":"UpdateUserDataResponse"}}, [{ ...{"kind":"Field","name":"email_notification","arg":"emailNotification"}, value: emailNotification }, { ...{"kind":"Field","name":"e_liked","arg":"eLiked"}, value: eLiked }, { ...{"kind":"Field","name":"e_wondered","arg":"eWondered"}, value: eWondered }, { ...{"kind":"Field","name":"e_shared","arg":"eShared"}, value: eShared }, { ...{"kind":"Field","name":"e_followed","arg":"eFollowed"}, value: eFollowed }, { ...{"kind":"Field","name":"e_commented","arg":"eCommented"}, value: eCommented }, { ...{"kind":"Field","name":"e_visited","arg":"eVisited"}, value: eVisited }, { ...{"kind":"Field","name":"e_liked_page","arg":"eLikedPage"}, value: eLikedPage }, { ...{"kind":"Field","name":"e_mentioned","arg":"eMentioned"}, value: eMentioned }, { ...{"kind":"Field","name":"e_joined_group","arg":"eJoinedGroup"}, value: eJoinedGroup }, { ...{"kind":"Field","name":"e_accepted","arg":"eAccepted"}, value: eAccepted }, { ...{"kind":"Field","name":"e_profile_wall_post","arg":"eProfileWallPost"}, value: eProfileWallPost }] as CallParam[]);
  },
  updateAppearance(profileAccent: string | null = null, profileBadge: string | null = null, profileHeaderStyle: string | null = null): Promise<M.UpdateUserDataResponse> {
    return retrofitCall({"base":"node","http":"PUT","path":"api/node/users/me/appearance","form":true,"ret":{"k":"obj","c":"UpdateUserDataResponse"}}, [{ ...{"kind":"Field","name":"profile_accent","arg":"profileAccent"}, value: profileAccent }, { ...{"kind":"Field","name":"profile_badge","arg":"profileBadge"}, value: profileBadge }, { ...{"kind":"Field","name":"profile_header_style","arg":"profileHeaderStyle"}, value: profileHeaderStyle }] as CallParam[]);
  },
  setEmojiStatus(emoji: string | null, text: string | null, expiresAt: number | null = null): Promise<M.SetEmojiStatusResponse> {
    return retrofitCall({"base":"node","http":"PUT","path":"api/node/users/me/status","form":true,"ret":{"k":"obj","c":"SetEmojiStatusResponse"}}, [{ ...{"kind":"Field","name":"status_emoji","arg":"emoji"}, value: emoji }, { ...{"kind":"Field","name":"status_text","arg":"text"}, value: text }, { ...{"kind":"Field","name":"status_expires_at","arg":"expiresAt"}, value: expiresAt }] as CallParam[]);
  },
  getLinkPreview(url: string): Promise<M.LinkPreviewResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/link-preview","form":true,"ret":{"k":"obj","c":"LinkPreviewResponse"}}, [{ ...{"kind":"Field","name":"url","arg":"url"}, value: url }] as CallParam[]);
  },
  updatePrivacy(followPrivacy: string | null = null, messagePrivacy: string | null = null, birthPrivacy: string | null = null, friendPrivacy: string | null = null, visitPrivacy: string | null = null, postPrivacy: string | null = null, showLastSeen: string | null = null, confirmFollowers: string | null = null, showActivitiesPrivacy: string | null = null, shareMyLocation: string | null = null): Promise<M.UpdateUserDataResponse> {
    return retrofitCall({"base":"node","http":"PUT","path":"api/node/users/me/privacy","form":true,"ret":{"k":"obj","c":"UpdateUserDataResponse"}}, [{ ...{"kind":"Field","name":"follow_privacy","arg":"followPrivacy"}, value: followPrivacy }, { ...{"kind":"Field","name":"message_privacy","arg":"messagePrivacy"}, value: messagePrivacy }, { ...{"kind":"Field","name":"birth_privacy","arg":"birthPrivacy"}, value: birthPrivacy }, { ...{"kind":"Field","name":"friend_privacy","arg":"friendPrivacy"}, value: friendPrivacy }, { ...{"kind":"Field","name":"visit_privacy","arg":"visitPrivacy"}, value: visitPrivacy }, { ...{"kind":"Field","name":"post_privacy","arg":"postPrivacy"}, value: postPrivacy }, { ...{"kind":"Field","name":"showlastseen","arg":"showLastSeen"}, value: showLastSeen }, { ...{"kind":"Field","name":"confirm_followers","arg":"confirmFollowers"}, value: confirmFollowers }, { ...{"kind":"Field","name":"show_activities_privacy","arg":"showActivitiesPrivacy"}, value: showActivitiesPrivacy }, { ...{"kind":"Field","name":"share_my_location","arg":"shareMyLocation"}, value: shareMyLocation }] as CallParam[]);
  },
  getUserProfile(userId: number): Promise<M.GetUserDataResponse> {
    return retrofitCall({"base":"node","http":"GET","path":"api/node/users/{id}","ret":{"k":"obj","c":"GetUserDataResponse"}}, [{ ...{"kind":"Path","name":"id","arg":"userId","encoded":false}, value: userId }] as CallParam[]);
  },
  searchUsers(query: string, limit: number = 20, offset: number = 0): Promise<M.NodeSearchUsersResponse> {
    return retrofitCall({"base":"node","http":"GET","path":"api/node/users/search","ret":{"k":"obj","c":"NodeSearchUsersResponse"}}, [{ ...{"kind":"Query","name":"q","arg":"query"}, value: query }, { ...{"kind":"Query","name":"limit","arg":"limit"}, value: limit }, { ...{"kind":"Query","name":"offset","arg":"offset"}, value: offset }] as CallParam[]);
  },
  getFollowers(userId: number, limit: number = 30, offset: number = 0): Promise<M.NodeFollowListResponse> {
    return retrofitCall({"base":"node","http":"GET","path":"api/node/users/{id}/followers","ret":{"k":"obj","c":"NodeFollowListResponse"}}, [{ ...{"kind":"Path","name":"id","arg":"userId","encoded":false}, value: userId }, { ...{"kind":"Query","name":"limit","arg":"limit"}, value: limit }, { ...{"kind":"Query","name":"offset","arg":"offset"}, value: offset }] as CallParam[]);
  },
  getFollowing(userId: number, limit: number = 30, offset: number = 0): Promise<M.NodeFollowListResponse> {
    return retrofitCall({"base":"node","http":"GET","path":"api/node/users/{id}/following","ret":{"k":"obj","c":"NodeFollowListResponse"}}, [{ ...{"kind":"Path","name":"id","arg":"userId","encoded":false}, value: userId }, { ...{"kind":"Query","name":"limit","arg":"limit"}, value: limit }, { ...{"kind":"Query","name":"offset","arg":"offset"}, value: offset }] as CallParam[]);
  },
  followUser(userId: number): Promise<M.NodeFollowActionResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/users/{id}/follow","ret":{"k":"obj","c":"NodeFollowActionResponse"}}, [{ ...{"kind":"Path","name":"id","arg":"userId","encoded":false}, value: userId }] as CallParam[]);
  },
  unfollowUser(userId: number): Promise<M.NodeFollowActionResponse> {
    return retrofitCall({"base":"node","http":"DELETE","path":"api/node/users/{id}/follow","ret":{"k":"obj","c":"NodeFollowActionResponse"}}, [{ ...{"kind":"Path","name":"id","arg":"userId","encoded":false}, value: userId }] as CallParam[]);
  },
  getBlockedUsers(): Promise<M.NodeFollowListResponse> {
    return retrofitCall({"base":"node","http":"GET","path":"api/node/users/me/blocked","ret":{"k":"obj","c":"NodeFollowListResponse"}}, [] as CallParam[]);
  },
  blockUser(userId: number): Promise<M.UpdateUserDataResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/users/{id}/block","ret":{"k":"obj","c":"UpdateUserDataResponse"}}, [{ ...{"kind":"Path","name":"id","arg":"userId","encoded":false}, value: userId }] as CallParam[]);
  },
  unblockUser(userId: number): Promise<M.UpdateUserDataResponse> {
    return retrofitCall({"base":"node","http":"DELETE","path":"api/node/users/{id}/block","ret":{"k":"obj","c":"UpdateUserDataResponse"}}, [{ ...{"kind":"Path","name":"id","arg":"userId","encoded":false}, value: userId }] as CallParam[]);
  },
  blockByIdentifier(phone: string | null = null, userId: number | null = null, action: string = "block"): Promise<M.BlockByIdentifierResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/users/block-by-identifier","form":true,"ret":{"k":"obj","c":"BlockByIdentifierResponse"}}, [{ ...{"kind":"Field","name":"phone","arg":"phone"}, value: phone }, { ...{"kind":"Field","name":"user_id","arg":"userId"}, value: userId }, { ...{"kind":"Field","name":"action","arg":"action"}, value: action }] as CallParam[]);
  },
  getMyMedia(limit: number = 60, offset: number = 0): Promise<M.GetUserMediaResponse> {
    return retrofitCall({"base":"node","http":"GET","path":"api/node/users/me/media","ret":{"k":"obj","c":"GetUserMediaResponse"}}, [{ ...{"kind":"Query","name":"limit","arg":"limit"}, value: limit }, { ...{"kind":"Query","name":"offset","arg":"offset"}, value: offset }] as CallParam[]);
  },
  getShowcase(userId: number): Promise<M.ShowcaseResponse> {
    return retrofitCall({"base":"node","http":"GET","path":"api/node/users/{id}/showcase","ret":{"k":"obj","c":"ShowcaseResponse"}}, [{ ...{"kind":"Path","name":"id","arg":"userId","encoded":false}, value: userId }] as CallParam[]);
  },
  getMyShowcaseChannels(): Promise<M.ShowcaseChannelsResponse> {
    return retrofitCall({"base":"node","http":"GET","path":"api/node/users/showcase/my-channels","ret":{"k":"obj","c":"ShowcaseChannelsResponse"}}, [] as CallParam[]);
  },
  setPersonalChannel(channelId: number): Promise<M.ShowcaseActionResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/users/showcase/channel","form":true,"ret":{"k":"obj","c":"ShowcaseActionResponse"}}, [{ ...{"kind":"Field","name":"channel_id","arg":"channelId"}, value: channelId }] as CallParam[]);
  },
  setStoryHighlight(storyId: number, pinned: number): Promise<M.ShowcaseActionResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/users/showcase/highlight","form":true,"ret":{"k":"obj","c":"ShowcaseActionResponse"}}, [{ ...{"kind":"Field","name":"story_id","arg":"storyId"}, value: storyId }, { ...{"kind":"Field","name":"pinned","arg":"pinned"}, value: pinned }] as CallParam[]);
  },
  getUserRating(userId: number, includeDetails: string = "0"): Promise<M.GetUserRatingResponse> {
    return retrofitCall({"base":"node","http":"GET","path":"api/node/users/{id}/rating","ret":{"k":"obj","c":"GetUserRatingResponse"}}, [{ ...{"kind":"Path","name":"id","arg":"userId","encoded":false}, value: userId }, { ...{"kind":"Query","name":"include_details","arg":"includeDetails"}, value: includeDetails }] as CallParam[]);
  },
  rateUser(userId: number, ratingType: string, comment: string | null = null): Promise<M.RateUserResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/users/{id}/rate","form":true,"ret":{"k":"obj","c":"RateUserResponse"}}, [{ ...{"kind":"Path","name":"id","arg":"userId","encoded":false}, value: userId }, { ...{"kind":"Field","name":"rating_type","arg":"ratingType"}, value: ratingType }, { ...{"kind":"Field","name":"comment","arg":"comment"}, value: comment }] as CallParam[]);
  },
};

/** network/NodeRefundsApi.kt */
export const NodeRefundsApi = {
  getPolicy(): Promise<M.NodeRefundPolicyResponse> {
    return retrofitCall({"base":"node","http":"GET","path":"api/node/refunds/policy","ret":{"k":"obj","c":"NodeRefundPolicyResponse"}}, [] as CallParam[]);
  },
  getEligible(): Promise<M.NodeRefundEligibleResponse> {
    return retrofitCall({"base":"node","http":"GET","path":"api/node/refunds/eligible","ret":{"k":"obj","c":"NodeRefundEligibleResponse"}}, [] as CallParam[]);
  },
  preview(serviceType: string, refId: string, reasonCode: string = "standard"): Promise<M.NodeRefundPreviewResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/refunds/preview","form":true,"ret":{"k":"obj","c":"NodeRefundPreviewResponse"}}, [{ ...{"kind":"Field","name":"service_type","arg":"serviceType"}, value: serviceType }, { ...{"kind":"Field","name":"ref_id","arg":"refId"}, value: refId }, { ...{"kind":"Field","name":"reason_code","arg":"reasonCode"}, value: reasonCode }] as CallParam[]);
  },
  request(serviceType: string, refId: string, reasonCode: string = "standard", reasonText: string | null = null): Promise<M.NodeRefundRequestResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/refunds/request","form":true,"ret":{"k":"obj","c":"NodeRefundRequestResponse"}}, [{ ...{"kind":"Field","name":"service_type","arg":"serviceType"}, value: serviceType }, { ...{"kind":"Field","name":"ref_id","arg":"refId"}, value: refId }, { ...{"kind":"Field","name":"reason_code","arg":"reasonCode"}, value: reasonCode }, { ...{"kind":"Field","name":"reason_text","arg":"reasonText"}, value: reasonText }] as CallParam[]);
  },
  getList(page: number = 0): Promise<M.NodeRefundListResponse> {
    return retrofitCall({"base":"node","http":"GET","path":"api/node/refunds/list","ret":{"k":"obj","c":"NodeRefundListResponse"}}, [{ ...{"kind":"Query","name":"page","arg":"page"}, value: page }] as CallParam[]);
  },
};

/** network/NodeStarsApi.kt */
export const NodeStarsApi = {
  getBalance(): Promise<M.StarsBalanceResponse> {
    return retrofitCall({"base":"node","http":"GET","path":"api/node/stars/balance","ret":{"k":"obj","c":"StarsBalanceResponse"}}, [] as CallParam[]);
  },
  getTransactions(limit: number = 20, offset: number = 0): Promise<M.StarsTransactionsResponse> {
    return retrofitCall({"base":"node","http":"GET","path":"api/node/stars/transactions","ret":{"k":"obj","c":"StarsTransactionsResponse"}}, [{ ...{"kind":"Query","name":"limit","arg":"limit"}, value: limit }, { ...{"kind":"Query","name":"offset","arg":"offset"}, value: offset }] as CallParam[]);
  },
  getPacks(): Promise<M.StarsPacksResponse> {
    return retrofitCall({"base":"node","http":"GET","path":"api/node/stars/packs","ret":{"k":"obj","c":"StarsPacksResponse"}}, [] as CallParam[]);
  },
  sendStars(toUserId: number, amount: number, note: string | null = null): Promise<M.StarsSendResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/stars/send","form":true,"ret":{"k":"obj","c":"StarsSendResponse"}}, [{ ...{"kind":"Field","name":"to_user_id","arg":"toUserId"}, value: toUserId }, { ...{"kind":"Field","name":"amount","arg":"amount"}, value: amount }, { ...{"kind":"Field","name":"note","arg":"note"}, value: note }] as CallParam[]);
  },
  purchase(packId: number, provider: string = "wayforpay"): Promise<M.StarsPurchaseResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/stars/purchase","form":true,"ret":{"k":"obj","c":"StarsPurchaseResponse"}}, [{ ...{"kind":"Field","name":"pack_id","arg":"packId"}, value: packId }, { ...{"kind":"Field","name":"provider","arg":"provider"}, value: provider }] as CallParam[]);
  },
  donateToChannel(channelId: number, amount: number, note: string | null = null): Promise<M.StarsDonateResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/stars/donate-to-channel","form":true,"ret":{"k":"obj","c":"StarsDonateResponse"}}, [{ ...{"kind":"Field","name":"channel_id","arg":"channelId"}, value: channelId }, { ...{"kind":"Field","name":"amount","arg":"amount"}, value: amount }, { ...{"kind":"Field","name":"note","arg":"note"}, value: note }] as CallParam[]);
  },
  getCreatorEarnings(): Promise<M.CreatorEarningsResponse> {
    return retrofitCall({"base":"node","http":"GET","path":"api/node/stars/creator-earnings","ret":{"k":"obj","c":"CreatorEarningsResponse"}}, [] as CallParam[]);
  },
};

/** network/NodeStickerProApi.kt */
export const NodeStickerProApi = {
  getStrapiMeta(): Promise<M.StickerProMetaResponse> {
    return retrofitCall({"base":"node","http":"GET","path":"api/node/stickers/strapi-meta","ret":{"k":"obj","c":"StickerProMetaResponse"}}, [] as CallParam[]);
  },
  buyPack(slug: string): Promise<M.StickerBuyResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/stickers/strapi-buy","form":true,"ret":{"k":"obj","c":"StickerBuyResponse"}}, [{ ...{"kind":"Field","name":"slug","arg":"slug"}, value: slug }] as CallParam[]);
  },
};

/** network/NodeStoriesApi.kt */
export const NodeStoriesApi = {
  createStory(file: MultipartPart, fileType: RequestBodyLike, storyTitle: RequestBodyLike | null = null, storyDescription: RequestBodyLike | null = null, videoDuration: RequestBodyLike | null = null, cover: MultipartPart | null = null, musicFile: MultipartPart | null = null): Promise<M.CreateStoryResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/stories/create","multipart":true,"ret":{"k":"obj","c":"CreateStoryResponse"}}, [{ ...{"kind":"Part","name":null,"arg":"file"}, value: file }, { ...{"kind":"Part","name":"file_type","arg":"fileType"}, value: fileType }, { ...{"kind":"Part","name":"story_title","arg":"storyTitle"}, value: storyTitle }, { ...{"kind":"Part","name":"story_description","arg":"storyDescription"}, value: storyDescription }, { ...{"kind":"Part","name":"video_duration","arg":"videoDuration"}, value: videoDuration }, { ...{"kind":"Part","name":null,"arg":"cover"}, value: cover }, { ...{"kind":"Part","name":null,"arg":"musicFile"}, value: musicFile }] as CallParam[]);
  },
  getStories(limit: number = 35): Promise<M.GetStoriesResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/stories/get","form":true,"ret":{"k":"obj","c":"GetStoriesResponse"}}, [{ ...{"kind":"Field","name":"limit","arg":"limit"}, value: limit }] as CallParam[]);
  },
  getUserStories(userId: number, limit: number = 35): Promise<M.GetStoriesResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/stories/get-user-stories","form":true,"ret":{"k":"obj","c":"GetStoriesResponse"}}, [{ ...{"kind":"Field","name":"user_id","arg":"userId"}, value: userId }, { ...{"kind":"Field","name":"limit","arg":"limit"}, value: limit }] as CallParam[]);
  },
  markStoryViewed(storyId: number): Promise<M.NodeSimpleResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/stories/mark-viewed","form":true,"ret":{"k":"obj","c":"NodeSimpleResponse"}}, [{ ...{"kind":"Field","name":"story_id","arg":"storyId"}, value: storyId }] as CallParam[]);
  },
  reactToStory(storyId: number, reaction: string): Promise<M.ReactStoryResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/stories/react","form":true,"ret":{"k":"obj","c":"ReactStoryResponse"}}, [{ ...{"kind":"Field","name":"story_id","arg":"storyId"}, value: storyId }, { ...{"kind":"Field","name":"reaction","arg":"reaction"}, value: reaction }] as CallParam[]);
  },
  getStoryComments(storyId: number, limit: number = 20, offset: number = 0): Promise<M.GetStoryCommentsResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/stories/get-comments","form":true,"ret":{"k":"obj","c":"GetStoryCommentsResponse"}}, [{ ...{"kind":"Field","name":"story_id","arg":"storyId"}, value: storyId }, { ...{"kind":"Field","name":"limit","arg":"limit"}, value: limit }, { ...{"kind":"Field","name":"offset","arg":"offset"}, value: offset }] as CallParam[]);
  },
  createStoryComment(storyId: number, text: string, replyToCommentId: number | null = null, sticker: string | null = null): Promise<M.CreateStoryCommentResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/stories/create-comment","form":true,"ret":{"k":"obj","c":"CreateStoryCommentResponse"}}, [{ ...{"kind":"Field","name":"story_id","arg":"storyId"}, value: storyId }, { ...{"kind":"Field","name":"text","arg":"text"}, value: text }, { ...{"kind":"Field","name":"reply_to_comment_id","arg":"replyToCommentId"}, value: replyToCommentId }, { ...{"kind":"Field","name":"sticker","arg":"sticker"}, value: sticker }] as CallParam[]);
  },
  markStoryViewedAnonymous(storyId: number): Promise<M.NodeSimpleResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/stories/mark-viewed-anonymous","form":true,"ret":{"k":"obj","c":"NodeSimpleResponse"}}, [{ ...{"kind":"Field","name":"story_id","arg":"storyId"}, value: storyId }] as CallParam[]);
  },
  getStoryById(storyId: number): Promise<M.GetStoryByIdResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/stories/get-by-id","form":true,"ret":{"k":"obj","c":"GetStoryByIdResponse"}}, [{ ...{"kind":"Field","name":"id","arg":"storyId"}, value: storyId }] as CallParam[]);
  },
  deleteStory(storyId: number): Promise<M.DeleteStoryResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/stories/delete","form":true,"ret":{"k":"obj","c":"DeleteStoryResponse"}}, [{ ...{"kind":"Field","name":"story_id","arg":"storyId"}, value: storyId }] as CallParam[]);
  },
  getStoryViews(storyId: number, limit: number = 20, offset: number = 0): Promise<M.GetStoryViewsResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/stories/get-views","form":true,"ret":{"k":"obj","c":"GetStoryViewsResponse"}}, [{ ...{"kind":"Field","name":"story_id","arg":"storyId"}, value: storyId }, { ...{"kind":"Field","name":"limit","arg":"limit"}, value: limit }, { ...{"kind":"Field","name":"offset","arg":"offset"}, value: offset }] as CallParam[]);
  },
  muteStory(userId: number): Promise<M.MuteStoryResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/stories/mute","form":true,"ret":{"k":"obj","c":"MuteStoryResponse"}}, [{ ...{"kind":"Field","name":"user_id","arg":"userId"}, value: userId }] as CallParam[]);
  },
  deleteStoryComment(commentId: number): Promise<M.DeleteStoryCommentResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/stories/delete-comment","form":true,"ret":{"k":"obj","c":"DeleteStoryCommentResponse"}}, [{ ...{"kind":"Field","name":"comment_id","arg":"commentId"}, value: commentId }] as CallParam[]);
  },
  createChannelStory(channelId: RequestBodyLike, file: MultipartPart, fileType: RequestBodyLike, storyTitle: RequestBodyLike | null = null, storyDescription: RequestBodyLike | null = null): Promise<M.CreateStoryResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/stories/create-channel","multipart":true,"ret":{"k":"obj","c":"CreateStoryResponse"}}, [{ ...{"kind":"Part","name":"channel_id","arg":"channelId"}, value: channelId }, { ...{"kind":"Part","name":null,"arg":"file"}, value: file }, { ...{"kind":"Part","name":"file_type","arg":"fileType"}, value: fileType }, { ...{"kind":"Part","name":"story_title","arg":"storyTitle"}, value: storyTitle }, { ...{"kind":"Part","name":"story_description","arg":"storyDescription"}, value: storyDescription }] as CallParam[]);
  },
  getSubscribedChannelStories(limit: number = 30): Promise<M.GetStoriesResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/stories/get-channel-subscribed","form":true,"ret":{"k":"obj","c":"GetStoriesResponse"}}, [{ ...{"kind":"Field","name":"limit","arg":"limit"}, value: limit }] as CallParam[]);
  },
  deleteChannelStory(storyId: number): Promise<M.DeleteStoryResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/stories/delete-channel","form":true,"ret":{"k":"obj","c":"DeleteStoryResponse"}}, [{ ...{"kind":"Field","name":"story_id","arg":"storyId"}, value: storyId }] as CallParam[]);
  },
  getMyStoriesArchive(limit: number = 50, offset: number = 0): Promise<M.GetStoriesResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/stories/get-archive","form":true,"ret":{"k":"obj","c":"GetStoriesResponse"}}, [{ ...{"kind":"Field","name":"limit","arg":"limit"}, value: limit }, { ...{"kind":"Field","name":"offset","arg":"offset"}, value: offset }] as CallParam[]);
  },
  updateStory(storyId: number, title: string | null = null, description: string | null = null): Promise<M.UpdateStoryResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/stories/update","form":true,"ret":{"k":"obj","c":"UpdateStoryResponse"}}, [{ ...{"kind":"Field","name":"story_id","arg":"storyId"}, value: storyId }, { ...{"kind":"Field","name":"title","arg":"title"}, value: title }, { ...{"kind":"Field","name":"description","arg":"description"}, value: description }] as CallParam[]);
  },
  voteStoryPoll(storyId: number, pollOptionId: number): Promise<M.VoteStoryPollResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/stories/vote-poll","form":true,"ret":{"k":"obj","c":"VoteStoryPollResponse"}}, [{ ...{"kind":"Field","name":"story_id","arg":"storyId"}, value: storyId }, { ...{"kind":"Field","name":"poll_option_id","arg":"pollOptionId"}, value: pollOptionId }] as CallParam[]);
  },
  getStoryAnalytics(storyId: number): Promise<M.GetStoryAnalyticsResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/stories/get-analytics","form":true,"ret":{"k":"obj","c":"GetStoryAnalyticsResponse"}}, [{ ...{"kind":"Field","name":"story_id","arg":"storyId"}, value: storyId }] as CallParam[]);
  },
};

/** network/NodeSubscriptionApi.kt */
export const NodeSubscriptionApi = {
  getStatus(): Promise<M.NodeSubscriptionStatusResponse> {
    return retrofitCall({"base":"node","http":"GET","path":"api/node/subscription/status","ret":{"k":"obj","c":"NodeSubscriptionStatusResponse"}}, [] as CallParam[]);
  },
  createPayment(months: number, provider: string): Promise<M.NodeCreatePaymentResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/subscription/create-payment","form":true,"ret":{"k":"obj","c":"NodeCreatePaymentResponse"}}, [{ ...{"kind":"Field","name":"months","arg":"months"}, value: months }, { ...{"kind":"Field","name":"provider","arg":"provider"}, value: provider }] as CallParam[]);
  },
  startTrial(): Promise<M.NodeTrialResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/subscription/start-trial","ret":{"k":"obj","c":"NodeTrialResponse"}}, [] as CallParam[]);
  },
  giftSubscription(toUserId: number, months: number): Promise<M.NodeGiftResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/subscription/gift","form":true,"ret":{"k":"obj","c":"NodeGiftResponse"}}, [{ ...{"kind":"Field","name":"to_user_id","arg":"toUserId"}, value: toUserId }, { ...{"kind":"Field","name":"months","arg":"months"}, value: months }] as CallParam[]);
  },
  getGiftPrice(): Promise<M.NodeGiftPriceResponse> {
    return retrofitCall({"base":"node","http":"GET","path":"api/node/subscription/gift-price","ret":{"k":"obj","c":"NodeGiftPriceResponse"}}, [] as CallParam[]);
  },
};

/** network/NodeTicketsApi.kt */
export const NodeTicketsApi = {
  createTicket(subject: string, message: string, category: string): Promise<M.NodeTicketCreateResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/tickets","form":true,"ret":{"k":"obj","c":"NodeTicketCreateResponse"}}, [{ ...{"kind":"Field","name":"subject","arg":"subject"}, value: subject }, { ...{"kind":"Field","name":"message","arg":"message"}, value: message }, { ...{"kind":"Field","name":"category","arg":"category"}, value: category }] as CallParam[]);
  },
  getTickets(): Promise<M.NodeTicketListResponse> {
    return retrofitCall({"base":"node","http":"GET","path":"api/node/tickets","ret":{"k":"obj","c":"NodeTicketListResponse"}}, [] as CallParam[]);
  },
  getTicket(id: number): Promise<M.NodeTicketDetailResponse> {
    return retrofitCall({"base":"node","http":"GET","path":"api/node/tickets/{id}","ret":{"k":"obj","c":"NodeTicketDetailResponse"}}, [{ ...{"kind":"Path","name":"id","arg":"id","encoded":false}, value: id }] as CallParam[]);
  },
  replyTicket(id: number, message: string): Promise<M.NodeTicketReplyResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/tickets/{id}/reply","form":true,"ret":{"k":"obj","c":"NodeTicketReplyResponse"}}, [{ ...{"kind":"Path","name":"id","arg":"id","encoded":false}, value: id }, { ...{"kind":"Field","name":"message","arg":"message"}, value: message }] as CallParam[]);
  },
};

/** network/NodeVoiceApi.kt */
export const NodeVoiceApi = {
  transcribe(url: string): Promise<M.VoiceTranscriptResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/voice/transcribe","form":true,"ret":{"k":"obj","c":"VoiceTranscriptResponse"}}, [{ ...{"kind":"Field","name":"url","arg":"url"}, value: url }] as CallParam[]);
  },
};

/** network/StrapiApiService.kt */
export const StrapiApiService = {
  getAllContent(): Promise<M.StrapiResponse> {
    return retrofitCall({"base":"strapi","http":"GET","path":"api/wm-packs?populate=*","ret":{"k":"obj","c":"StrapiResponse"}}, [] as CallParam[]);
  },
  getContentByType(type: string): Promise<M.StrapiResponse> {
    return retrofitCall({"base":"strapi","http":"GET","path":"api/wm-packs?populate=*","ret":{"k":"obj","c":"StrapiResponse"}}, [{ ...{"kind":"Query","name":"filters[type][$eq]","arg":"type"}, value: type }] as CallParam[]);
  },
  getPackBySlug(slug: string): Promise<M.StrapiResponse> {
    return retrofitCall({"base":"strapi","http":"GET","path":"api/wm-packs?populate=*","ret":{"k":"obj","c":"StrapiResponse"}}, [{ ...{"kind":"Query","name":"filters[slug][$eq]","arg":"slug"}, value: slug }] as CallParam[]);
  },
  getContentPaginated(page: number = 1, pageSize: number = 25): Promise<M.StrapiResponse> {
    return retrofitCall({"base":"strapi","http":"GET","path":"api/wm-packs?populate=*","ret":{"k":"obj","c":"StrapiResponse"}}, [{ ...{"kind":"Query","name":"pagination[page]","arg":"page"}, value: page }, { ...{"kind":"Query","name":"pagination[pageSize]","arg":"pageSize"}, value: pageSize }] as CallParam[]);
  },
  getCatalogLight(type: string = "sticker", page: number = 1, pageSize: number = 30, populateCover: boolean = true): Promise<M.StrapiResponse> {
    return retrofitCall({"base":"strapi","http":"GET","path":"api/wm-packs","ret":{"k":"obj","c":"StrapiResponse"}}, [{ ...{"kind":"Query","name":"filters[type][$containsi]","arg":"type"}, value: type }, { ...{"kind":"Query","name":"pagination[page]","arg":"page"}, value: page }, { ...{"kind":"Query","name":"pagination[pageSize]","arg":"pageSize"}, value: pageSize }, { ...{"kind":"Query","name":"populate[cover]","arg":"populateCover"}, value: populateCover }] as CallParam[]);
  },
  getPackWithItems(slug: string, populateCover: boolean = true, populateItems: boolean = true): Promise<M.StrapiResponse> {
    return retrofitCall({"base":"strapi","http":"GET","path":"api/wm-packs","ret":{"k":"obj","c":"StrapiResponse"}}, [{ ...{"kind":"Query","name":"filters[slug][$eq]","arg":"slug"}, value: slug }, { ...{"kind":"Query","name":"populate[cover]","arg":"populateCover"}, value: populateCover }, { ...{"kind":"Query","name":"populate[items]","arg":"populateItems"}, value: populateItems }] as CallParam[]);
  },
};

/** network/TokenRefreshInterceptor.kt */
export const RefreshApi = {
  refreshTokenSync(refreshToken: string): Promise<any> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/auth/refresh","form":true,"ret":{"k":"raw"}}, [{ ...{"kind":"Field","name":"refresh_token","arg":"refreshToken"}, value: refreshToken }] as CallParam[]);
  },
};

/** ui/channels/ChannelDetailsViewModel.kt */
export const RecordingsApi = {
  getChannelRecordings(channelId: number): Promise<RetrofitResponse<RawResponseBody>> {
    return retrofitCall({"base":"node","http":"GET","path":"api/node/recordings/channel/{channel_id}","response":true,"raw":true,"ret":{"k":"raw"}}, [{ ...{"kind":"Path","name":"channel_id","arg":"channelId","encoded":false}, value: channelId }] as CallParam[]);
  },
  deleteRecording(recordingId: number): Promise<RetrofitResponse<RawResponseBody>> {
    return retrofitCall({"base":"node","http":"DELETE","path":"api/node/recordings/{id}","response":true,"raw":true,"ret":{"k":"raw"}}, [{ ...{"kind":"Path","name":"id","arg":"recordingId","encoded":false}, value: recordingId }] as CallParam[]);
  },
  updateRecording(recordingId: number, title: string | null, description: string | null): Promise<RetrofitResponse<RawResponseBody>> {
    return retrofitCall({"base":"node","http":"PUT","path":"api/node/recordings/{id}","form":true,"response":true,"raw":true,"ret":{"k":"raw"}}, [{ ...{"kind":"Path","name":"id","arg":"recordingId","encoded":false}, value: recordingId }, { ...{"kind":"Field","name":"title","arg":"title"}, value: title }, { ...{"kind":"Field","name":"description","arg":"description"}, value: description }] as CallParam[]);
  },
};

/** ui/channels/ChannelMemberSubscriptionViewModel.kt */
export const ChannelMemberSubscriptionApi = {
  getStatus(channelId: number): Promise<M.MemberSubStatus> {
    return retrofitCall({"base":"node","http":"GET","path":"api/node/channels/{channel_id}/member-subscription/status","ret":{"k":"obj","c":"MemberSubStatus"}}, [{ ...{"kind":"Path","name":"channel_id","arg":"channelId","encoded":false}, value: channelId }] as CallParam[]);
  },
  setPricing(channelId: number, enabled: boolean, basePriceStars: number | null, basePriceUah: number | null): Promise<M.MemberSubPricingResponse> {
    return retrofitCall({"base":"node","http":"PUT","path":"api/node/channels/{channel_id}/member-subscription/pricing","form":true,"ret":{"k":"obj","c":"MemberSubPricingResponse"}}, [{ ...{"kind":"Path","name":"channel_id","arg":"channelId","encoded":false}, value: channelId }, { ...{"kind":"Field","name":"enabled","arg":"enabled"}, value: enabled }, { ...{"kind":"Field","name":"base_price_stars","arg":"basePriceStars"}, value: basePriceStars }, { ...{"kind":"Field","name":"base_price_uah","arg":"basePriceUah"}, value: basePriceUah }] as CallParam[]);
  },
  subscribe(channelId: number, plan: string, paymentMethod: string = "stars"): Promise<M.MemberSubSubscribeResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/channels/{channel_id}/member-subscription/subscribe","form":true,"ret":{"k":"obj","c":"MemberSubSubscribeResponse"}}, [{ ...{"kind":"Path","name":"channel_id","arg":"channelId","encoded":false}, value: channelId }, { ...{"kind":"Field","name":"plan","arg":"plan"}, value: plan }, { ...{"kind":"Field","name":"payment_method","arg":"paymentMethod"}, value: paymentMethod }] as CallParam[]);
  },
};

/** ui/channels/ChannelPremiumViewModel.kt */
export const ChannelPremiumApi = {
  getPremiumStatus(channelId: number): Promise<M.ChannelPremiumStatus> {
    return retrofitCall({"base":"node","http":"GET","path":"api/node/channels/{channel_id}/premium/status","ret":{"k":"obj","c":"ChannelPremiumStatus"}}, [{ ...{"kind":"Path","name":"channel_id","arg":"channelId","encoded":false}, value: channelId }] as CallParam[]);
  },
  createPayment(channelId: number, plan: string, provider: string): Promise<M.CreateChannelPaymentResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/channels/{channel_id}/premium/create-payment","form":true,"ret":{"k":"obj","c":"CreateChannelPaymentResponse"}}, [{ ...{"kind":"Path","name":"channel_id","arg":"channelId","encoded":false}, value: channelId }, { ...{"kind":"Field","name":"plan","arg":"plan"}, value: plan }, { ...{"kind":"Field","name":"provider","arg":"provider"}, value: provider }] as CallParam[]);
  },
  startTrial(channelId: number): Promise<M.StartTrialResponse> {
    return retrofitCall({"base":"node","http":"POST","path":"api/node/channels/{channel_id}/premium/start-trial","ret":{"k":"obj","c":"StartTrialResponse"}}, [{ ...{"kind":"Path","name":"channel_id","arg":"channelId","encoded":false}, value: channelId }] as CallParam[]);
  },
};

/** ui/geo/GeoDiscoveryActivity.kt */
export const GeoApi = {
  getNearbyUsers(accessToken: string, lat: number, lon: number, radiusKm: number = 10): Promise<M.NearbyUsersResponse> {
    return retrofitCall({"base":"node","http":"GET","path":"/api/node/users/nearby","ret":{"k":"obj","c":"NearbyUsersResponse"}}, [{ ...{"kind":"Query","name":"access_token","arg":"accessToken"}, value: accessToken }, { ...{"kind":"Query","name":"lat","arg":"lat"}, value: lat }, { ...{"kind":"Query","name":"lon","arg":"lon"}, value: lon }, { ...{"kind":"Query","name":"radius_km","arg":"radiusKm"}, value: radiusKm }] as CallParam[]);
  },
  updateLocation(accessToken: string, lat: number, lng: number, shareMyLocation: number = 1): Promise<RetrofitResponse<void>> {
    return retrofitCall({"base":"node","http":"POST","path":"/api/node/users/update-location","form":true,"response":true,"ret":{"k":"void"}}, [{ ...{"kind":"Field","name":"access_token","arg":"accessToken"}, value: accessToken }, { ...{"kind":"Field","name":"lat","arg":"lat"}, value: lat }, { ...{"kind":"Field","name":"lng","arg":"lng"}, value: lng }, { ...{"kind":"Field","name":"share_my_location","arg":"shareMyLocation"}, value: shareMyLocation }] as CallParam[]);
  },
};

/** network/NodeRetrofitClient.kt — те же имена свойств, что в Android. */
export const NodeRetrofitClient = {
  api: NodeApi,
  callHistoryApi: CallHistoryApiService,
  callApi: NodeCallApi,
  channelApi: NodeChannelApi,
  adsApi: NodeAdsApi,
  storiesApi: NodeStoriesApi,
  channelUploadApi: NodeChannelApi,
  groupApi: NodeGroupApi,
  groupUploadApi: NodeGroupApi,
  chatUploadApi: NodeApi,
  subscriptionApi: NodeSubscriptionApi,
  botApi: NodeBotApi,
  starsApi: NodeStarsApi,
  refundsApi: NodeRefundsApi,
  ticketsApi: NodeTicketsApi,
  channelScheduledApi: NodeChannelScheduledApi,
  profileApi: NodeProfileApi,
  blogApi: NodeBlogApi,
  businessApi: NodeBusinessApi,
  businessDirectoryApi: NodeBusinessDirectoryApi,
  stickerProApi: NodeStickerProApi,
  packsApi: NodePacksApi,
  voiceApi: NodeVoiceApi,
};
