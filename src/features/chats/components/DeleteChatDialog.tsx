/**
 * Диалог удаления чата — порт Android ui/chats/DeleteChatDialog.kt:
 *  1. Удалить только у меня
 *  2. Удалить и очистить у обоих
 *  3. Удалить и заблокировать
 */
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Button, Dialog, Divider, Portal } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { M } from '../../../core/android';
import { useTranslation } from '../../../i18n';
import { useWMTheme } from '../../../theme/themeManager';
import { WMTypography } from '../../../theme/wmTheme';

function DeleteOption({ icon, title, description, tint, onPress }: { icon: string; title: string; description: string; tint: string; onPress: () => void }) {
  const cs = useWMTheme().colorScheme;
  return (
    <Pressable onPress={onPress} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 4 }}>
      <MaterialCommunityIcons name={icon as never} size={24} color={tint} accessibilityLabel={title} />
      <View style={{ flex: 1, marginLeft: 14 }}>
        <Text style={[WMTypography.bodyLarge, { color: tint, fontWeight: '500' }]}>{title}</Text>
        <Text style={[WMTypography.bodySmall, { color: cs.onSurfaceVariant }]}>{description}</Text>
      </View>
    </Pressable>
  );
}

export function DeleteChatDialog({
  chat,
  visible,
  onDismiss,
  onDeleteForMe,
  onDeleteForEveryone,
  onDeleteAndBlock,
}: {
  chat: M.Chat | null;
  visible: boolean;
  onDismiss: () => void;
  onDeleteForMe: () => void;
  onDeleteForEveryone: () => void;
  onDeleteAndBlock: () => void;
}) {
  const { t } = useTranslation();
  const cs = useWMTheme().colorScheme;
  return (
    <Portal>
      <Dialog visible={visible && !!chat} onDismiss={onDismiss}>
        <Dialog.Title>
          <Text style={[WMTypography.titleLarge, { color: cs.onSurface }]}>{t('delete_chat_title')}</Text>
          {'\n'}
          <Text style={[WMTypography.bodyMedium, { color: cs.primary, fontWeight: '500' }]}>{chat?.username ?? ''}</Text>
        </Dialog.Title>
        <Dialog.Content>
          <Text style={[WMTypography.bodySmall, { color: cs.onSurfaceVariant, marginBottom: 12 }]}>{t('delete_chat_subtitle')}</Text>
          <DeleteOption
            icon="delete"
            title={t('delete_for_me_only')}
            description={t('delete_for_me_only_desc')}
            tint={cs.onSurface}
            onPress={() => {
              onDeleteForMe();
              onDismiss();
            }}
          />
          <Divider style={{ marginVertical: 4 }} />
          <DeleteOption
            icon="delete-forever"
            title={t('delete_clear_both')}
            description={t('delete_clear_both_desc')}
            tint="#E65100"
            onPress={() => {
              onDeleteForEveryone();
              onDismiss();
            }}
          />
          <Divider style={{ marginVertical: 4 }} />
          <DeleteOption
            icon="block-helper"
            title={t('delete_and_block')}
            description={t('delete_and_block_desc')}
            tint="#D32F2F"
            onPress={() => {
              onDeleteAndBlock();
              onDismiss();
            }}
          />
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onDismiss}>{t('cancel')}</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}
