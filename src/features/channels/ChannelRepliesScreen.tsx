/**
 * «Ответы на мои комментарии» — порт Android ui/chats/ChannelRepliesActivity.kt:
 *  • входящие ответы с пагинацией по 30; markRead только при открытии/обновлении
 *  • подсветка непрочитанных (id > last_read_reply_id на момент открытия)
 *  • живые ответы по сокету (channel_reply_received) — сразу в начало + markRead
 *  • ответ прямо отсюда (sendThreadReply), локальное подтверждение «Ваш ответ»
 *  • KARMA_RESTRICTED → отдельная плашка про низкую репутацию
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Button, IconButton } from 'react-native-paper';
import { Image } from 'expo-image';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { NodeRetrofitClient, type M } from '../../core/android';
import { absMediaUrl } from '../../core/helpers';
import { useI18nStore, useTranslation } from '../../i18n';
import { useWMTheme } from '../../theme/themeManager';
import { WMCorners, WMSpacing, WMTypography, withAlpha } from '../../theme/wmTheme';
import { socketService } from '../../services/socketService';
import type { RootStackParamList } from '../../navigation/types';
import { parseChannelReply } from './channelReply';

const PAGE_SIZE = 30;
type SendError = { kind: 'karma' } | { kind: 'generic'; message: string | null };

// ─── «ViewModel» ─────────────────────────────────────────────────────────────

function useChannelReplies() {
  const [replies, setReplies] = useState<M.ChannelReply[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [myReplies, setMyReplies] = useState<Record<number, string>>({});
  const [unreadBelowId, setUnreadBelowId] = useState(0);
  const [sendError, setSendError] = useState<SendError | null>(null);
  const offset = useRef(0);
  const loading = useRef(false);

  const load = useCallback(async (reset = false) => {
    if (loading.current) return;
    loading.current = true;
    setIsLoading(true);
    if (reset) offset.current = 0;
    try {
      // markRead=reset: курсор прочтения двигает только открытие/обновление, не «ещё»
      const r = await NodeRetrofitClient.channelApi.getReplyInbox(PAGE_SIZE, offset.current, reset);
      if (r.apiStatus === 200) {
        const list = r.replies ?? [];
        setReplies((cur) => (reset ? list : [...cur, ...list]));
        offset.current += list.length;
        setHasMore(list.length === PAGE_SIZE);
        if (reset) setUnreadBelowId(r.lastReadReplyId);
      }
    } catch {
      /* как в Android — молча */
    }
    loading.current = false;
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void load(true);
    const off = socketService.on('channel_reply_received', (raw) => {
      const reply = parseChannelReply(raw);
      if (!reply) return;
      setReplies((cur) => (cur.some((r) => r.id === reply.id) ? cur : [reply, ...cur]));
      // экран открыт — живой ответ уже прочитан
      void NodeRetrofitClient.channelApi.getReplyInbox(1, 0, true).catch(() => {});
    });
    return off;
  }, [load]);

  const sendReply = useCallback(async (reply: M.ChannelReply, text: string, onSent: () => void) => {
    try {
      const r = await NodeRetrofitClient.channelApi.sendThreadReply(reply.postId, reply.originalCommentId, text);
      if (r.apiStatus === 200) {
        setSendError(null);
        setMyReplies((m) => ({ ...m, [reply.id]: text }));
        onSent();
      } else if (r.errorCode === 'KARMA_RESTRICTED') setSendError({ kind: 'karma' });
      else setSendError({ kind: 'generic', message: r.errorMessage });
    } catch (e) {
      setSendError({ kind: 'generic', message: e instanceof Error ? e.message : null });
    }
  }, []);

  return { replies, isLoading, hasMore, myReplies, unreadBelowId, sendError, load, sendReply, clearSendError: () => setSendError(null) };
}

// ─── Экран ───────────────────────────────────────────────────────────────────

export function ChannelRepliesScreen() {
  const { t } = useTranslation();
  const cs = useWMTheme().colorScheme;
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const vm = useChannelReplies();
  const [target, setTarget] = useState<M.ChannelReply | null>(null);
  const [text, setText] = useState('');

  const openChannel = (channelId: number) => navigation.navigate('ChannelDetails', { channelId: String(channelId) });
  const dismissComposer = () => {
    setTarget(null);
    setText('');
    vm.clearSendError();
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: cs.background }}>
      <View style={styles.bar}>
        <IconButton icon="arrow-left" onPress={() => navigation.goBack()} accessibilityLabel={t('back')} />
        <Text style={[WMTypography.titleLarge, { fontWeight: '700', color: cs.onSurface }]}>{t('channel_replies_title')}</Text>
      </View>
      <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: withAlpha(cs.outlineVariant, 0.3) }} />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {vm.replies.length === 0 && !vm.isLoading ? (
          <EmptyState />
        ) : (
          <FlatList
            style={{ flex: 1 }}
            data={vm.replies}
            keyExtractor={(r) => String(r.id)}
            contentContainerStyle={{ padding: WMSpacing.lg, gap: WMSpacing.md }}
            onEndReachedThreshold={0.5}
            onEndReached={() => vm.hasMore && !vm.isLoading && vm.replies.length > 1 && void vm.load()}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <ReplyItem
                reply={item}
                isUnread={vm.unreadBelowId > 0 && item.id > vm.unreadBelowId}
                myReplyText={vm.myReplies[item.id] ?? null}
                onReply={() => setTarget(item)}
                onOpenChannel={() => openChannel(item.channelId)}
              />
            )}
            ListFooterComponent={vm.isLoading ? <ActivityIndicator style={{ padding: WMSpacing.xl }} color={cs.primary} /> : null}
          />
        )}

        {target && (
          <View>
            {vm.sendError && <SendErrorBanner error={vm.sendError} onDismiss={vm.clearSendError} />}
            <ReplyComposer
              target={target}
              text={text}
              onTextChange={(v) => {
                setText(v);
                vm.clearSendError();
              }}
              onSend={() => {
                const txt = text.trim();
                if (txt) void vm.sendReply(target, txt, () => {
                  setText('');
                  setTarget(null);
                });
              }}
              onDismiss={dismissComposer}
            />
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function EmptyState() {
  const { t } = useTranslation();
  const cs = useWMTheme().colorScheme;
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <View style={[styles.emptyIcon, { backgroundColor: withAlpha(cs.primaryContainer, 0.5) }]}>
        <MaterialCommunityIcons name="forum" size={34} color={cs.primary} />
      </View>
      <Text style={[WMTypography.bodyLarge, { marginTop: WMSpacing.xl, paddingHorizontal: WMSpacing.xxl, fontWeight: '500', textAlign: 'center', color: cs.onSurface }]}>
        {t('channel_replies_empty')}
      </Text>
    </View>
  );
}

function ReplyItem({
  reply,
  isUnread,
  myReplyText,
  onReply,
  onOpenChannel,
}: {
  reply: M.ChannelReply;
  isUnread: boolean;
  myReplyText: string | null;
  onReply: () => void;
  onOpenChannel: () => void;
}) {
  const { t } = useTranslation();
  const cs = useWMTheme().colorScheme;
  const chAvatar = reply.channelAvatar.trim() ? absMediaUrl(reply.channelAvatar) : '';
  const sAvatar = reply.senderAvatar.trim() ? absMediaUrl(reply.senderAvatar) : '';
  return (
    <View
      style={[
        WMCorners.card,
        { padding: WMSpacing.xl, backgroundColor: isUnread ? withAlpha(cs.primaryContainer, 0.28) : withAlpha(cs.surfaceVariant, 0.4) },
        isUnread && { borderWidth: 1, borderColor: withAlpha(cs.primary, 0.25), shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 2, shadowOffset: { width: 0, height: 1 } },
      ]}
    >
      <Pressable onPress={onOpenChannel} style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Image source={chAvatar ? { uri: chAvatar } : undefined} style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: withAlpha(cs.primary, 0.15) }} contentFit="cover" />
        <View style={{ width: WMSpacing.md }} />
        {isUnread && <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: cs.primary, marginRight: WMSpacing.sm }} />}
        <Text numberOfLines={1} style={[WMTypography.labelMedium, { flex: 1, fontWeight: '600', color: cs.primary }]}>
          {reply.channelName.trim() || t('channel_replies_unknown_channel')}
        </Text>
        <Text style={[WMTypography.labelSmall, { color: withAlpha(cs.onSurface, 0.45) }]}>{formatReplyTime(reply.time)}</Text>
      </Pressable>

      {reply.originalCommentText.trim() ? (
        <View style={[WMCorners.sm, styles.original, { backgroundColor: withAlpha(cs.surface, 0.7), borderColor: withAlpha(cs.primary, 0.35) }]}>
          <Text style={[WMTypography.labelSmall, { color: cs.primary, fontWeight: '500' }]}>{t('channel_replies_your_comment')}</Text>
          <Text numberOfLines={2} style={[WMTypography.bodySmall, { color: withAlpha(cs.onSurface, 0.7) }]}>
            {reply.originalCommentText}
          </Text>
        </View>
      ) : null}

      <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginTop: WMSpacing.lg }}>
        <Image
          source={sAvatar ? { uri: sAvatar } : undefined}
          style={{ width: 36, height: 36, borderRadius: 18, borderWidth: 1.5, borderColor: withAlpha(cs.outlineVariant, 0.5), backgroundColor: cs.secondaryContainer }}
          contentFit="cover"
        />
        <View style={{ flex: 1, marginLeft: WMSpacing.lg }}>
          <Text style={[WMTypography.labelMedium, { fontWeight: '600', color: cs.onSurface }]}>{reply.senderName.trim() || reply.senderUsername}</Text>
          <Text style={[WMTypography.bodyMedium, { marginTop: 2, color: cs.onSurface }]}>{reply.text}</Text>
        </View>
      </View>

      {myReplyText != null && (
        <View style={{ alignItems: 'flex-end', marginTop: WMSpacing.md }}>
          <View style={[styles.myReply, { backgroundColor: withAlpha(cs.primary, 0.14) }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <MaterialCommunityIcons name="check-circle" size={12} color={cs.primary} />
              <Text style={[WMTypography.labelSmall, { marginLeft: 4, fontWeight: '600', color: cs.primary }]}>{t('channel_replies_your_reply')}</Text>
            </View>
            <Text style={[WMTypography.bodySmall, { marginTop: 2, color: cs.onSurface }]}>{myReplyText}</Text>
          </View>
        </View>
      )}

      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: WMSpacing.md }}>
        <Button compact onPress={onOpenChannel} labelStyle={{ fontSize: 12 }}>
          {t('channel_replies_open_channel')}
        </Button>
        <View style={{ width: WMSpacing.sm }} />
        <Button compact onPress={onReply} labelStyle={{ fontSize: 12, fontWeight: '600' }} textColor={cs.primary}>
          {t('channel_replies_reply')}
        </Button>
      </View>
    </View>
  );
}

function SendErrorBanner({ error, onDismiss }: { error: SendError; onDismiss: () => void }) {
  const { t } = useTranslation();
  const cs = useWMTheme().colorScheme;
  return (
    <View style={[styles.errorBanner, { backgroundColor: cs.errorContainer }]}>
      <MaterialCommunityIcons name={error.kind === 'karma' ? 'block-helper' : 'alert-circle-outline'} size={18} color={cs.onErrorContainer} />
      <Text style={[WMTypography.bodySmall, { flex: 1, marginLeft: WMSpacing.lg, color: cs.onErrorContainer }]}>
        {error.kind === 'karma' ? t('channel_replies_karma_restricted') : error.message ?? t('error_send_failed')}
      </Text>
      <IconButton icon="close" size={16} iconColor={cs.onErrorContainer} onPress={onDismiss} style={{ margin: 0, width: 28, height: 28 }} accessibilityLabel={t('cancel')} />
    </View>
  );
}

function ReplyComposer({
  target,
  text,
  onTextChange,
  onSend,
  onDismiss,
}: {
  target: M.ChannelReply;
  text: string;
  onTextChange: (v: string) => void;
  onSend: () => void;
  onDismiss: () => void;
}) {
  const { t } = useTranslation();
  const cs = useWMTheme().colorScheme;
  const canSend = text.trim().length > 0;
  return (
    <View style={[styles.composer, { backgroundColor: cs.surface }]}>
      <View style={[styles.contextStrip, { backgroundColor: withAlpha(cs.primaryContainer, 0.35) }]}>
        <MaterialCommunityIcons name="reply" size={14} color={cs.primary} />
        <Text numberOfLines={1} style={[WMTypography.labelSmall, { flex: 1, marginLeft: WMSpacing.sm, fontWeight: '500', color: cs.primary }]}>
          {t('channel_replies_replying_to', [target.senderName.trim() || target.senderUsername])}
        </Text>
        <Button compact onPress={onDismiss} labelStyle={WMTypography.labelSmall}>
          {t('cancel')}
        </Button>
      </View>
      <View style={styles.inputRow}>
        <TextInput
          value={text}
          onChangeText={onTextChange}
          placeholder={t('channel_replies_type_hint')}
          placeholderTextColor={cs.onSurfaceVariant}
          multiline
          autoFocus
          style={[styles.input, { color: cs.onSurface, borderColor: cs.outlineVariant }]}
        />
        <Pressable
          onPress={onSend}
          disabled={!canSend}
          style={[styles.send, { backgroundColor: canSend ? cs.primary : withAlpha(cs.onSurface, 0.12) }]}
          accessibilityLabel={t('send')}
        >
          <MaterialCommunityIcons name="send" size={22} color={canSend ? cs.onPrimary : withAlpha(cs.onSurface, 0.4)} />
        </Pressable>
      </View>
    </View>
  );
}

/** formatReplyTime: < суток — HH:mm, < недели — «Пн HH:mm», иначе dd.MM.yy. */
function formatReplyTime(ts: number): string {
  if (ts <= 0) return '';
  const ms = ts > 1_000_000_000_000 ? ts : ts * 1000;
  const d = new Date(ms);
  const diff = Date.now() - ms;
  const lang = useI18nStore.getState().language;
  const hm = new Intl.DateTimeFormat(lang, { hour: '2-digit', minute: '2-digit', hour12: false }).format(d);
  if (diff < 86_400_000) return hm;
  if (diff < 7 * 86_400_000) return `${new Intl.DateTimeFormat(lang, { weekday: 'short' }).format(d)} ${hm}`;
  const p = (n: number) => String(n).padStart(2, '0');
  return `${p(d.getDate())}.${p(d.getMonth() + 1)}.${String(d.getFullYear()).slice(-2)}`;
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', alignItems: 'center', height: 64 },
  emptyIcon: { width: 76, height: 76, borderRadius: 38, alignItems: 'center', justifyContent: 'center' },
  original: { marginTop: WMSpacing.lg, borderWidth: 1, paddingHorizontal: WMSpacing.lg, paddingVertical: WMSpacing.md },
  myReply: { maxWidth: 280, borderTopLeftRadius: 14, borderTopRightRadius: 4, borderBottomLeftRadius: 14, borderBottomRightRadius: 14, paddingHorizontal: WMSpacing.lg, paddingVertical: WMSpacing.md },
  errorBanner: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: WMSpacing.xl, paddingVertical: WMSpacing.lg },
  composer: { shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 8, shadowOffset: { width: 0, height: -2 }, elevation: 8 },
  contextStrip: { flexDirection: 'row', alignItems: 'center', paddingLeft: WMSpacing.xl, paddingRight: WMSpacing.sm, paddingVertical: 2 },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: WMSpacing.lg, paddingVertical: WMSpacing.md },
  input: { flex: 1, minHeight: 46, maxHeight: 120, borderWidth: 1, borderRadius: 24, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12, fontSize: 14 },
  send: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center', marginLeft: WMSpacing.md },
});
