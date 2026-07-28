import React, { useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Linking,
  Share,
  StyleSheet,
  Image,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import type { Message } from '../../api/types';
import { MESSAGE_TYPES } from '../../constants/api';
import { Avatar } from '../../components/common/Avatar';

// ─── Sandbox palette ────────────────────────────────────────────
const SB = {
  ownBubble: '#2B5F8E',
  ownText: '#FFFFFF',
  otherBubble: '#1E2A3A',
  otherText: '#E8EDF2',
  timeMuted: 'rgba(255,255,255,0.45)',
  replyBar: '#40A7E3',
  replyBg: 'rgba(64,167,227,0.12)',
  linkColor: '#7BC8F0',
  pendingTint: 'rgba(255,255,255,0.5)',
  tickRead: '#4CD964',
  tickSent: 'rgba(255,255,255,0.55)',
};

interface Props {
  message: Message;
  isOwn: boolean;
  prevMessage?: Message;
  nextMessage?: Message;
  onLongPress: (msg: Message) => void;
  onReply: (msg: Message) => void;
  onEdit?: (msg: Message) => void;
  onDelete?: (msg: Message) => void;
}

function formatTime(ts: string | number): string {
  let ms: number;
  if (typeof ts === 'number') {
    ms = ts > 1e12 ? ts : ts * 1000;
  } else {
    ms = new Date(ts).getTime();
  }
  const d = new Date(ms);
  if (isNaN(d.getTime())) return '';
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}

const URL_REGEX = /(https?:\/\/[^\s]+)/g;

const ReplyStrip: React.FC<{ message: Message }> = ({ message }) => {
  if (!message.replyToId) return null;
  return (
    <View style={styles.replyStrip}>
      <View style={styles.replyBar} />
      <View style={styles.replyBody}>
        <Text style={styles.replyAuthor} numberOfLines={1}>
          {message.replyToName ?? 'Сообщение'}
        </Text>
        <Text style={styles.replyText} numberOfLines={1}>
          {message.replyToText ?? '(Медиа)'}
        </Text>
      </View>
    </View>
  );
};

const LinkifiedText: React.FC<{ text: string; style: object }> = ({ text, style }) => {
  const parts = text.split(URL_REGEX);
  return (
    <Text style={style}>
      {parts.map((part, i) =>
        URL_REGEX.test(part) ? (
          <Text
            key={i}
            style={styles.link}
            onPress={() => Linking.openURL(part).catch(() => null)}
          >
            {part}
          </Text>
        ) : (
          part
        ),
      )}
    </Text>
  );
};

const TickIcon: React.FC<{ isSeen: boolean; isPending?: boolean }> = ({ isSeen, isPending }) => {
  if (isPending) return <Feather name="clock" size={11} color={SB.tickSent} />;
  return (
    <Feather
      name={isSeen ? 'check-circle' : 'check'}
      size={11}
      color={isSeen ? SB.tickRead : SB.tickSent}
    />
  );
};

const SandboxMessageBubble: React.FC<Props> = ({
  message,
  isOwn,
  prevMessage,
  nextMessage,
  onLongPress,
  onReply,
  onEdit,
  onDelete,
}) => {
  const sameAsPrev = prevMessage?.fromId === message.fromId;
  const sameAsNext = nextMessage?.fromId === message.fromId;
  const isFirst = !sameAsPrev;
  const isLast = !sameAsNext;

  // ── Border radius ──────────────────────────────────────────
  const bubbleRadius = isOwn
    ? {
        borderTopLeftRadius: 18,
        borderBottomLeftRadius: 18,
        borderTopRightRadius: isFirst ? 18 : 5,
        borderBottomRightRadius: 5,
      }
    : {
        borderTopRightRadius: 18,
        borderBottomRightRadius: 18,
        borderTopLeftRadius: isFirst ? 18 : 5,
        borderBottomLeftRadius: 5,
      };

  const handleLongPress = useCallback(() => {
    Alert.alert('Сообщение', undefined, [
      { text: 'Ответить', onPress: () => onReply(message) },
      ...(isOwn && onEdit ? [{ text: 'Изменить', onPress: () => onEdit(message) }] : []),
      {
        text: 'Поделиться',
        onPress: () => Share.share({ message: message.text }).catch(() => null),
      },
      ...(isOwn && onDelete
        ? [{ text: 'Удалить', style: 'destructive' as const, onPress: () => onDelete(message) }]
        : []),
      { text: 'Отмена', style: 'cancel' as const },
    ]);
  }, [message, isOwn, onReply, onEdit, onDelete]);

  if (message.isDeleted) {
    return (
      <View style={[styles.wrapper, isOwn ? styles.wrapperOwn : styles.wrapperOther, isLast && styles.lastInGroup]}>
        <View style={[styles.bubble, bubbleRadius, isOwn ? styles.ownBubble : styles.otherBubble, styles.deletedBubble]}>
          <Text style={styles.deletedText}>Сообщение удалено</Text>
        </View>
      </View>
    );
  }

  // ── Avatar spacer for other ────────────────────────────────
  const showAvatar = !isOwn && isLast;
  const avatarSlot = !isOwn ? (
    <View style={styles.avatarSlot}>
      {showAvatar ? (
        <Avatar
          uri={message.senderAvatar}
          name={message.senderName ?? 'U'}
          size={28}
        />
      ) : null}
    </View>
  ) : null;

  // ── Render content based on type ───────────────────────────
  let content: React.ReactNode;

  switch (message.type) {
    case MESSAGE_TYPES.IMAGE: {
      const mediaUrl = message.decryptedMediaUrl ?? message.mediaUrl;
      content = (
        <View>
          <ReplyStrip message={message} />
          {mediaUrl ? (
            <Image source={{ uri: mediaUrl }} style={styles.mediaImage} resizeMode="cover" />
          ) : (
            <View style={[styles.mediaImage, styles.mediaPlaceholder]}>
              <Feather name="image" size={28} color={SB.timeMuted} />
            </View>
          )}
          <Row message={message} isOwn={isOwn} />
        </View>
      );
      break;
    }
    case MESSAGE_TYPES.VOICE:
    case MESSAGE_TYPES.AUDIO: {
      const label =
        message.type === MESSAGE_TYPES.VOICE ? 'Голосовое' : 'Аудио';
      const dur = message.mediaDuration ? ` · ${Math.floor(message.mediaDuration / 60)}:${String(message.mediaDuration % 60).padStart(2, '0')}` : '';
      content = (
        <View>
          <ReplyStrip message={message} />
          <View style={styles.audioRow}>
            <View style={[styles.audioIcon, isOwn ? styles.audioIconOwn : styles.audioIconOther]}>
              <Feather name="mic" size={16} color={isOwn ? SB.ownText : SB.replyBar} />
            </View>
            <View style={styles.audioInfo}>
              <Text style={[styles.audioLabel, { color: isOwn ? SB.ownText : SB.otherText }]}>{label}{dur}</Text>
              <View style={styles.audioWave}>
                {Array.from({ length: 18 }).map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.audioBar,
                      {
                        height: 4 + Math.sin(i * 0.9) * 6 + (i % 3 === 0 ? 4 : 0),
                        backgroundColor: isOwn ? 'rgba(255,255,255,0.6)' : SB.replyBar + '99',
                      },
                    ]}
                  />
                ))}
              </View>
            </View>
          </View>
          <Row message={message} isOwn={isOwn} />
        </View>
      );
      break;
    }
    case MESSAGE_TYPES.FILE: {
      content = (
        <View>
          <ReplyStrip message={message} />
          <View style={styles.fileRow}>
            <View style={[styles.fileIcon, isOwn ? styles.fileIconOwn : styles.fileIconOther]}>
              <Feather name="file" size={18} color={isOwn ? SB.ownText : SB.replyBar} />
            </View>
            <Text
              style={[styles.fileLabel, { color: isOwn ? SB.ownText : SB.otherText }]}
              numberOfLines={2}
            >
              {message.fileName ?? 'Файл'}
            </Text>
          </View>
          <Row message={message} isOwn={isOwn} />
        </View>
      );
      break;
    }
    default: {
      const text = message.decryptedText ?? message.text ?? '';
      content = (
        <View>
          <ReplyStrip message={message} />
          <View style={styles.textContent}>
            <LinkifiedText
              text={text}
              style={[styles.msgText, { color: isOwn ? SB.ownText : SB.otherText }]}
            />
            <Row message={message} isOwn={isOwn} />
          </View>
        </View>
      );
    }
  }

  return (
    <View
      style={[
        styles.wrapper,
        isOwn ? styles.wrapperOwn : styles.wrapperOther,
        isLast ? styles.lastInGroup : styles.midInGroup,
      ]}
    >
      {avatarSlot}
      <TouchableOpacity
        onLongPress={handleLongPress}
        activeOpacity={0.85}
        style={[
          styles.bubble,
          bubbleRadius,
          isOwn ? styles.ownBubble : styles.otherBubble,
          message.isLocalPending && styles.pendingBubble,
        ]}
      >
        {content}
      </TouchableOpacity>
    </View>
  );
};

const Row: React.FC<{ message: Message; isOwn: boolean }> = ({ message, isOwn }) => (
  <View style={styles.metaRow}>
    {message.isEdited ? (
      <Text style={styles.editedLabel}>ред.</Text>
    ) : null}
    <Text style={styles.timeText}>{formatTime(message.createdAt)}</Text>
    {isOwn && (
      <TickIcon isSeen={message.isSeen} isPending={message.isLocalPending} />
    )}
  </View>
);

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 10,
  },
  wrapperOwn: {
    justifyContent: 'flex-end',
  },
  wrapperOther: {
    justifyContent: 'flex-start',
  },
  lastInGroup: {
    marginBottom: 6,
  },
  midInGroup: {
    marginBottom: 2,
  },
  avatarSlot: {
    width: 32,
    marginRight: 4,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  bubble: {
    maxWidth: '78%',
    padding: 10,
    paddingBottom: 6,
  },
  ownBubble: {
    backgroundColor: SB.ownBubble,
  },
  otherBubble: {
    backgroundColor: SB.otherBubble,
  },
  pendingBubble: {
    opacity: 0.7,
  },
  deletedBubble: {
    opacity: 0.55,
  },
  deletedText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
    fontStyle: 'italic',
  },
  replyStrip: {
    flexDirection: 'row',
    marginBottom: 5,
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: SB.replyBg,
  },
  replyBar: {
    width: 3,
    backgroundColor: SB.replyBar,
    borderRadius: 2,
    marginRight: 6,
  },
  replyBody: {
    flex: 1,
    paddingVertical: 3,
    paddingRight: 4,
  },
  replyAuthor: {
    fontSize: 11,
    fontWeight: '700',
    color: SB.replyBar,
    marginBottom: 1,
  },
  replyText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
  },
  textContent: {},
  msgText: {
    fontSize: 15,
    lineHeight: 20,
  },
  link: {
    color: SB.linkColor,
    textDecorationLine: 'underline',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 3,
    marginTop: 3,
  },
  timeText: {
    fontSize: 11,
    color: SB.timeMuted,
  },
  editedLabel: {
    fontSize: 11,
    color: SB.timeMuted,
    fontStyle: 'italic',
  },
  mediaImage: {
    width: 220,
    height: 160,
    borderRadius: 10,
    marginBottom: 4,
  },
  mediaPlaceholder: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  audioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingBottom: 2,
    minWidth: 160,
  },
  audioIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  audioIconOwn: { backgroundColor: 'rgba(255,255,255,0.2)' },
  audioIconOther: { backgroundColor: 'rgba(64,167,227,0.18)' },
  audioInfo: { flex: 1 },
  audioLabel: { fontSize: 12, fontWeight: '500', marginBottom: 4 },
  audioWave: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 1.5,
    height: 20,
  },
  audioBar: {
    width: 3,
    borderRadius: 2,
  },
  fileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minWidth: 140,
  },
  fileIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileIconOwn: { backgroundColor: 'rgba(255,255,255,0.2)' },
  fileIconOther: { backgroundColor: 'rgba(64,167,227,0.15)' },
  fileLabel: { fontSize: 13, flex: 1 },
});

export default SandboxMessageBubble;
