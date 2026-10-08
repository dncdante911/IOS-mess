/**
 * Контекстное меню чата (долгое нажатие) — порт Android ui/chats/ChatContactMenu.kt:
 * профиль, псевдоним, архив/из архива, теги, папка, скрыть/показать,
 * блокировка чата, удаление. + RenameContactDialog (локальный псевдоним).
 */
import React, { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Button, Dialog, Divider, Portal, TextInput } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { M } from '../../../core/android';
import { useTranslation } from '../../../i18n';
import { useWMTheme } from '../../../theme/themeManager';
import { WMTypography } from '../../../theme/wmTheme';
import { WMBottomSheet } from '../../../components/common/WMBottomSheet';
import { ChatOrganizationManager } from '../chatOrganization';
import { ContactNicknameRepository, useNickname } from '../contactNicknames';

function MenuRow({ icon, title, tint, onPress }: { icon: string; title: string; tint?: string; onPress: () => void }) {
  const cs = useWMTheme().colorScheme;
  const color = tint ?? cs.onSurface;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 12 }, pressed && { opacity: 0.6 }]}>
      <MaterialCommunityIcons name={icon as never} size={24} color={color} accessibilityLabel={title} />
      <Text style={[WMTypography.bodyLarge, { marginLeft: 16, color }]}>{title}</Text>
    </Pressable>
  );
}

const Sep = () => <Divider style={{ marginVertical: 4, marginHorizontal: 24 }} />;

export function ContactContextMenu({
  chat,
  visible,
  onDismiss,
  onDelete,
  onViewProfile,
  onArchive,
  onUnarchive,
  onHide,
  isInHiddenFolder = false,
  onManageTags,
  onMoveToFolder,
  onToggleLock,
  isChatLocked = false,
}: {
  chat: M.Chat | null;
  visible: boolean;
  onDismiss: () => void;
  onDelete: (chat: M.Chat) => void;
  onViewProfile: (chat: M.Chat) => void;
  onArchive?: (chat: M.Chat) => void;
  onUnarchive?: (chat: M.Chat) => void;
  onHide?: (chat: M.Chat) => void;
  isInHiddenFolder?: boolean;
  onManageTags?: (chat: M.Chat) => void;
  onMoveToFolder?: (chat: M.Chat) => void;
  onToggleLock?: (chat: M.Chat) => void;
  isChatLocked?: boolean;
}) {
  const theme = useWMTheme();
  const { t } = useTranslation();
  const nickname = useNickname(chat?.userId ?? 0);
  const [renameOpen, setRenameOpen] = useState(false);

  if (!chat) return null;
  const isArchived = ChatOrganizationManager.isArchived(chat.userId);
  const act = (fn?: (c: M.Chat) => void) => () => {
    fn?.(chat);
    onDismiss();
  };

  return (
    <>
      <WMBottomSheet visible={visible && !renameOpen} onDismiss={onDismiss} containerColor={theme.colorScheme.surface}>
        <View style={{ paddingBottom: 16 }}>
          <Text style={[WMTypography.titleMedium, { color: theme.colorScheme.onSurface, marginHorizontal: 24, marginVertical: 8 }]}>{t('contact_actions_title')}</Text>
          <Divider style={{ marginVertical: 8 }} />
          <MenuRow icon="account" title={t('view_profile')} onPress={act(onViewProfile)} />
          <Sep />
          <MenuRow icon="pencil" title={nickname ? t('change_nickname') : t('add_nickname')} onPress={() => setRenameOpen(true)} />
          {(onArchive || onUnarchive) && (
            <>
              <Sep />
              {isArchived && onUnarchive ? (
                <MenuRow icon="archive-arrow-up" title={t('unarchive')} onPress={act(onUnarchive)} />
              ) : !isArchived && onArchive ? (
                <MenuRow icon="archive" title={t('archive_chat')} onPress={act(onArchive)} />
              ) : null}
            </>
          )}
          {onManageTags && (
            <>
              <Sep />
              <MenuRow icon="label" title={t('tags')} onPress={act(onManageTags)} />
            </>
          )}
          {onMoveToFolder && (
            <>
              <Sep />
              <MenuRow icon="folder" title={t('move_to_folder')} onPress={act(onMoveToFolder)} />
            </>
          )}
          {onHide && (
            <>
              <Sep />
              <MenuRow icon={isInHiddenFolder ? 'eye' : 'eye-off'} title={t(isInHiddenFolder ? 'show_chat_again' : 'hide_in_hidden')} onPress={act(onHide)} />
            </>
          )}
          {onToggleLock && (
            <>
              <Sep />
              <MenuRow icon={isChatLocked ? 'lock-open' : 'lock'} title={t(isChatLocked ? 'chat_lock_menu_unlock' : 'chat_lock_menu_lock')} onPress={act(onToggleLock)} />
            </>
          )}
          <Sep />
          <MenuRow icon="delete" title={t('delete_chat')} tint="#D32F2F" onPress={() => onDelete(chat)} />
        </View>
      </WMBottomSheet>
      <RenameContactDialog
        chat={chat}
        visible={renameOpen}
        onDismiss={() => {
          setRenameOpen(false);
          onDismiss();
        }}
      />
    </>
  );
}

/** Локальный псевдоним контакта. */
export function RenameContactDialog({ chat, visible, onDismiss }: { chat: M.Chat; visible: boolean; onDismiss: () => void }) {
  const { t } = useTranslation();
  const cs = useWMTheme().colorScheme;
  const existing = useNickname(chat.userId);
  const [value, setValue] = useState(existing ?? '');
  useEffect(() => {
    if (visible) setValue(existing ?? '');
  }, [visible, existing]);

  const save = (v: string | null) => {
    ContactNicknameRepository.setNickname(chat.userId, v && v.trim() ? v.trim() : null);
    onDismiss();
  };

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss}>
        <Dialog.Title>{t('rename_contact_title')}</Dialog.Title>
        <Dialog.Content>
          <Text style={[WMTypography.bodyMedium, { color: cs.onSurfaceVariant, marginBottom: 16 }]}>{t('set_nickname_instruction', [chat.username ?? ''])}</Text>
          <TextInput
            mode="outlined"
            label={t('nickname')}
            placeholder={chat.username ?? t('enter_nickname_placeholder')}
            value={value}
            onChangeText={setValue}
            autoFocus
          />
          {existing ? (
            <Button style={{ alignSelf: 'flex-start', marginTop: 8 }} onPress={() => save(null)}>
              {t('reset_to_original_name')}
            </Button>
          ) : null}
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onDismiss}>{t('cancel')}</Button>
          <Button mode="contained" onPress={() => save(value)}>
            {t('save')}
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}
