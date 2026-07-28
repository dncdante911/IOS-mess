// ─────────────────────────────────────────────────────────────────────────────
// Sandbox UI v4 — Messages Layout (visual-only layer)
// Receives all state as props from MessagesScreen logic.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';

import type { Message } from '../../api/types';
import { Avatar } from '../../components/common/Avatar';
import SandboxMessageBubble from './SandboxMessageBubble';
import TypingIndicator from '../messages/TypingIndicator';

// ─── Sandbox palette ────────────────────────────────────────────────────────
const SB = {
  headerBg: 'rgba(11,21,35,0.88)',
  headerBorder: 'rgba(255,255,255,0.07)',
  text: '#EEF2F7',
  textSub: '#8A9BB0',
  textMuted: '#4E5E72',
  primary: '#40A7E3',
  online: '#4CD964',
  inputBg: 'rgba(22,32,52,0.95)',
  inputBorder: 'rgba(64,167,227,0.18)',
  inputText: '#EEF2F7',
  sendBtn: '#40A7E3',
  iconColor: '#6B8CAE',
  replyBg: 'rgba(22,32,52,0.9)',
  replyBar: '#40A7E3',
  bgGrad: ['#0B1523', '#0E1C2F', '#0B1523'] as const,
};

interface Props {
  chatName: string;
  chatAvatar?: string;
  isOnline: boolean;
  isTyping: boolean;
  messages: Message[];
  isLoading: boolean;
  isLoadingMore: boolean;
  currentUserId: string;
  replyTo: Message | null;
  onBack: () => void;
  onVoiceCall: () => void;
  onVideoCall: () => void;
  onSend: (text: string) => void;
  onTyping: () => void;
  onTypingStop: () => void;
  onReply: (msg: Message) => void;
  onCancelReply: () => void;
  onEdit: (msg: Message) => void;
  onDelete: (msg: Message) => void;
  onLoadMore: () => void;
}

const TYPING_STOP_DELAY_MS = 1500;

export const SandboxMessagesLayout: React.FC<Props> = ({
  chatName,
  chatAvatar,
  isOnline,
  isTyping,
  messages,
  isLoading,
  isLoadingMore,
  currentUserId,
  replyTo,
  onBack,
  onVoiceCall,
  onVideoCall,
  onSend,
  onTyping,
  onTypingStop,
  onReply,
  onCancelReply,
  onEdit,
  onDelete,
  onLoadMore,
}) => {
  const [text, setText] = useState('');
  const flatListRef = useRef<FlatList<Message>>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleTextChange = useCallback(
    (val: string) => {
      setText(val);
      if (val.length > 0) {
        onTyping();
        if (typingTimer.current) clearTimeout(typingTimer.current);
        typingTimer.current = setTimeout(() => onTypingStop(), TYPING_STOP_DELAY_MS);
      } else {
        if (typingTimer.current) clearTimeout(typingTimer.current);
        onTypingStop();
      }
    },
    [onTyping, onTypingStop],
  );

  const handleSend = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setText('');
    if (typingTimer.current) clearTimeout(typingTimer.current);
    onSend(trimmed);
  }, [text, onSend]);

  const handleLongPress = useCallback((_msg: Message) => {}, []);

  const renderItem = useCallback(
    ({ item, index }: { item: Message; index: number }) => (
      <SandboxMessageBubble
        message={item}
        isOwn={item.fromId === currentUserId}
        prevMessage={messages[index + 1]}
        nextMessage={messages[index - 1]}
        onLongPress={handleLongPress}
        onReply={onReply}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    ),
    [currentUserId, messages, handleLongPress, onReply, onEdit, onDelete],
  );

  const keyExtractor = useCallback((item: Message) => item.id, []);

  const renderFooter = useCallback(
    () =>
      isLoadingMore ? (
        <ActivityIndicator size="small" color={SB.primary} style={styles.loadMoreSpinner} />
      ) : null,
    [isLoadingMore],
  );

  const hasText = text.trim().length > 0;

  return (
    <LinearGradient colors={SB.bgGrad} style={styles.root}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.kbAvoid}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={0}
        >
          {/* ── Header ──────────────────────────────────────── */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={onBack}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={styles.backBtn}
            >
              <Feather name="chevron-left" size={26} color={SB.text} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.headerCenter} activeOpacity={0.75}>
              <Avatar uri={chatAvatar} name={chatName} size={36} showOnline isOnline={isOnline} />
              <View style={styles.headerTextBlock}>
                <Text style={styles.headerName} numberOfLines={1}>{chatName}</Text>
                {isOnline ? (
                  <Text style={styles.headerOnline}>В сети</Text>
                ) : null}
              </View>
            </TouchableOpacity>

            <View style={styles.headerActions}>
              <TouchableOpacity
                onPress={onVoiceCall}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                style={styles.headerActionBtn}
              >
                <Feather name="phone" size={19} color={SB.iconColor} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={onVideoCall}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                style={styles.headerActionBtn}
              >
                <Feather name="video" size={19} color={SB.iconColor} />
              </TouchableOpacity>
            </View>
          </View>

          {/* ── Messages ────────────────────────────────────── */}
          {isLoading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color={SB.primary} />
            </View>
          ) : (
            <FlatList
              ref={flatListRef}
              data={messages}
              renderItem={renderItem}
              keyExtractor={keyExtractor}
              inverted
              contentContainerStyle={styles.listContent}
              ListFooterComponent={renderFooter}
              onEndReached={onLoadMore}
              onEndReachedThreshold={0.25}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="interactive"
              removeClippedSubviews
              maxToRenderPerBatch={20}
              windowSize={15}
            />
          )}

          {/* ── Typing ──────────────────────────────────────── */}
          <TypingIndicator userName={chatName} isVisible={isTyping} />

          {/* ── Reply preview ───────────────────────────────── */}
          {replyTo && (
            <View style={styles.replyPreview}>
              <View style={styles.replyPreviewBar} />
              <View style={styles.replyPreviewBody}>
                <Text style={styles.replyPreviewName} numberOfLines={1}>
                  {replyTo.senderName ?? 'Сообщение'}
                </Text>
                <Text style={styles.replyPreviewText} numberOfLines={1}>
                  {replyTo.text}
                </Text>
              </View>
              <TouchableOpacity onPress={onCancelReply} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Feather name="x" size={18} color={SB.textMuted} />
              </TouchableOpacity>
            </View>
          )}

          {/* ── Input bar ───────────────────────────────────── */}
          <View style={styles.inputRow}>
            <View style={styles.inputPill}>
              <TouchableOpacity style={styles.inputIconLeft} activeOpacity={0.7}>
                <Feather name="smile" size={20} color={SB.iconColor} />
              </TouchableOpacity>

              <TextInput
                style={styles.textInput}
                placeholder="Сообщение"
                placeholderTextColor={SB.textMuted}
                value={text}
                onChangeText={handleTextChange}
                multiline
                maxLength={4000}
                returnKeyType="default"
                keyboardAppearance="dark"
              />

              {!hasText && (
                <TouchableOpacity style={styles.inputIconRight} activeOpacity={0.7}>
                  <Feather name="paperclip" size={19} color={SB.iconColor} />
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity
              style={[styles.sendBtn, hasText && styles.sendBtnActive]}
              onPress={hasText ? handleSend : undefined}
              activeOpacity={0.85}
            >
              <Feather
                name={hasText ? 'send' : 'mic'}
                size={18}
                color="#FFFFFF"
              />
            </TouchableOpacity>
          </View>

        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  kbAvoid: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: SB.headerBg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: SB.headerBorder,
  },
  backBtn: {
    padding: 4,
    marginRight: 2,
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    overflow: 'hidden',
  },
  headerTextBlock: {
    flex: 1,
  },
  headerName: {
    fontSize: 16,
    fontWeight: '700',
    color: SB.text,
  },
  headerOnline: {
    fontSize: 12,
    color: SB.online,
    marginTop: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerActionBtn: {
    padding: 8,
  },
  loadingBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadMoreSpinner: {
    paddingVertical: 12,
  },
  listContent: {
    paddingVertical: 10,
    paddingTop: 14,
  },
  replyPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: SB.replyBg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(64,167,227,0.15)',
    gap: 8,
  },
  replyPreviewBar: {
    width: 3,
    height: 32,
    borderRadius: 2,
    backgroundColor: SB.replyBar,
  },
  replyPreviewBody: {
    flex: 1,
  },
  replyPreviewName: {
    fontSize: 12,
    fontWeight: '700',
    color: SB.primary,
    marginBottom: 2,
  },
  replyPreviewText: {
    fontSize: 12,
    color: SB.textSub,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 8,
    backgroundColor: 'rgba(11,21,35,0.7)',
  },
  inputPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: SB.inputBg,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: SB.inputBorder,
    minHeight: 44,
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  inputIconLeft: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: SB.inputText,
    paddingVertical: 6,
    maxHeight: 120,
    lineHeight: 20,
  },
  inputIconRight: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(64,167,227,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnActive: {
    backgroundColor: SB.sendBtn,
    ...Platform.select({
      ios: {
        shadowColor: SB.sendBtn,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.5,
        shadowRadius: 6,
      },
      android: { elevation: 6 },
    }),
  },
});
