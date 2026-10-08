/**
 * Папки/теги/архив на главном экране — порт Android ui/chats/ChatOrganizationUI.kt:
 *  • ChatFolderTabs — горизонтальная полоса чипов-папок (Telegram-style):
 *    системные + кастомные + серверные (совместные) + «Архив» + «Скрытые» + «＋»
 *  • filterChatsByFolder, ChatTagsRow
 *  • CreateFolderDialog (лимит 10/50), ManageTagsDialog, MoveToChatFolderDialog
 */
import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, Card, Chip, Dialog, IconButton, Portal, TextInput } from 'react-native-paper';
import Animated, { interpolateColor, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import type { M } from '../../../core/android';
import { useTranslation, type TranslationKeys } from '../../../i18n';
import { useWMTheme } from '../../../theme/themeManager';
import { WMMotion, WMTypography, withAlpha } from '../../../theme/wmTheme';
import { luminance, parseAndroidColor } from '../../../theme/color';
import { ChatOrganizationManager, PRESET_TAGS, useChatOrganization, type ChatFolder, type ChatTag } from '../chatOrganization';
import { ServerFolderStore, useServerFolders } from '../serverFolderStore';

type T = (key: TranslationKeys, params?: Array<string | number> | Record<string, string | number>) => string;

const SYSTEM_FOLDER_KEYS: Record<string, TranslationKeys> = {
  all: 'folder_all',
  personal: 'folder_personal',
  channels: 'folder_channels',
  groups: 'folder_groups',
  unread: 'folder_unread',
};

/** Локализованное имя системной папки; кастомная — как сохранена. */
export function localizedFolderName(folder: ChatFolder, t: T): string {
  const key = SYSTEM_FOLDER_KEYS[folder.id];
  return key ? t(key) : folder.name;
}

/** Пресетный тег (укр./рус./англ. ключ) → ключ строки; 0 → кастомный. */
export function presetTagKey(tagName: string): TranslationKeys | null {
  switch (tagName) {
    case 'Робота': case 'Работа': case 'work': return 'tag_work';
    case "Сім'я": case 'Семья': case 'family': return 'tag_family';
    case 'Друзі': case 'Друзья': case 'friends': return 'tag_friends';
    case 'Важливе': case 'Важное': case 'important': return 'tag_important';
    case 'Покупки': case 'shopping': return 'tag_shopping';
    case 'Навчання': case 'Учёба': case 'study': return 'tag_study';
    case 'Проекти': case 'Проекты': case 'projects': return 'tag_projects';
    case 'Подорожі': case 'Путешествия': case 'travel': return 'tag_travel';
    default: return null;
  }
}

export function localizedTagName(tagName: string, t: T): string {
  const key = presetTagKey(tagName);
  return key ? t(key) : tagName;
}

// ─── Полоса папок ────────────────────────────────────────────────────────────

export function ChatFolderTabs({
  selectedFolderId,
  onFolderSelected,
  onAddFolder,
  hiddenChatsCount = 0,
  withServerFolders = true,
}: {
  selectedFolderId: string;
  onFolderSelected: (id: string) => void;
  onAddFolder: () => void;
  hiddenChatsCount?: number;
  withServerFolders?: boolean;
}) {
  const { t } = useTranslation();
  const cs = useWMTheme().colorScheme;
  const folders = useChatOrganization((s) => s.folders);
  const archivedCount = useChatOrganization((s) => s.archivedChatIds.length);
  const serverFolders = useServerFolders((s) => s.folders);

  useEffect(() => {
    if (withServerFolders) void ServerFolderStore.loadFolders();
  }, [withServerFolders]);

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsRow}>
      {folders.map((f) => (
        <FolderTabChip key={f.id} emoji={f.emoji} name={localizedFolderName(f, t)} selected={f.id === selectedFolderId} onPress={() => onFolderSelected(f.id)} />
      ))}
      {withServerFolders &&
        serverFolders.map((sf) => {
          const id = `server_${sf.id}`;
          return (
            <FolderTabChip
              key={id}
              emoji={sf.emoji}
              name={sf.name}
              selected={selectedFolderId === id}
              accentColor={parseAndroidColor(sf.color) ?? cs.primary}
              onPress={() => onFolderSelected(id)}
            />
          );
        })}
      {archivedCount > 0 && (
        <FolderTabChip emoji="📦" name={t('archive')} selected={selectedFolderId === 'archived'} badge={archivedCount} onPress={() => onFolderSelected('archived')} />
      )}
      {hiddenChatsCount > 0 && (
        <FolderTabChip emoji="🔒" name={t('hidden_chats_folder')} selected={selectedFolderId === 'hidden'} badge={hiddenChatsCount} onPress={() => onFolderSelected('hidden')} />
      )}
      <IconButton icon="plus" size={18} iconColor={cs.primary} style={{ width: 32, height: 32, margin: 0 }} onPress={onAddFolder} accessibilityLabel={t('add')} />
    </ScrollView>
  );
}

function FolderTabChip({
  emoji,
  name,
  selected,
  badge = 0,
  accentColor,
  onPress,
}: {
  emoji: string;
  name: string;
  selected: boolean;
  badge?: number;
  accentColor?: string;
  onPress: () => void;
}) {
  const cs = useWMTheme().colorScheme;
  const selectedBg = accentColor ?? cs.primary;
  const selectedFg = luminance(selectedBg) > 0.5 ? '#0B1220' : '#FFFFFF';
  const fg = selected ? selectedFg : cs.onSurfaceVariant;

  // animateColorAsState(WMMotion.defaultEffects) — пружина без отскока
  const progress = useSharedValue(selected ? 1 : 0);
  useEffect(() => {
    progress.value = withSpring(selected ? 1 : 0, WMMotion.defaultEffects);
  }, [selected, progress]);
  const bgStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(progress.value, [0, 1], [cs.surfaceContainerHigh, selectedBg]),
  }));

  return (
    <Pressable onPress={onPress} accessibilityRole="tab" accessibilityState={{ selected }}>
      <Animated.View style={[styles.chip, bgStyle]}>
        {emoji.trim() ? <Text style={{ fontSize: 14, marginRight: 6 }}>{emoji}</Text> : null}
        <Text numberOfLines={1} style={[WMTypography.labelLarge, { color: fg, fontWeight: selected ? '600' : '500' }]}>
          {name}
        </Text>
        {badge > 0 && (
          <View style={[styles.badge, { backgroundColor: selected ? withAlpha(fg, 0.22) : cs.primary }]}>
            <Text style={{ fontSize: 10, fontWeight: '700', color: selected ? fg : cs.onPrimary }}>{badge > 99 ? '99+' : String(badge)}</Text>
          </View>
        )}
      </Animated.View>
    </Pressable>
  );
}

// ─── Фильтрация ──────────────────────────────────────────────────────────────

/**
 * Фильтр чатов по папке. «hidden» обрабатывает экран (hiddenChats из стора) —
 * здесь пусто, чтобы не показать данные основного списка.
 */
export function filterChatsByFolder(chats: M.Chat[], folderId: string, archivedIds: readonly number[], folderMapping: Record<number, string>): M.Chat[] {
  if (folderId === 'hidden') return [];
  const archived = new Set(archivedIds);
  const pool = folderId === 'archived' ? chats.filter((c) => archived.has(c.userId)) : chats.filter((c) => !archived.has(c.userId));
  switch (folderId) {
    case 'all':
    case 'archived':
      return pool;
    case 'personal':
      return pool.filter((c) => !c.isGroup);
    case 'groups':
      return pool.filter((c) => c.isGroup);
    case 'unread':
      return pool.filter((c) => c.unreadCount > 0);
    default:
      return pool.filter((c) => folderMapping[c.userId] === folderId);
  }
}

// ─── Теги под именем чата ────────────────────────────────────────────────────

export function ChatTagsRow({ chatId }: { chatId: number }) {
  const cs = useWMTheme().colorScheme;
  const tags = useChatOrganization((s) => s.chatTags[chatId]);
  if (!tags || tags.length === 0) return null;
  return (
    <View style={{ flexDirection: 'row', gap: 4 }}>
      {tags.slice(0, 3).map((tag) => {
        const c = parseAndroidColor(tag.color) ?? cs.primary;
        return (
          <View key={tag.name} style={[styles.tag, { backgroundColor: withAlpha(c, 0.15), borderColor: withAlpha(c, 0.4) }]}>
            <Text style={{ fontSize: 9, color: c, fontWeight: '500' }}>{tag.name}</Text>
          </View>
        );
      })}
    </View>
  );
}

// ─── Диалоги ─────────────────────────────────────────────────────────────────

const FOLDER_EMOJIS = ['📁', '💼', '🏠', '🎮', '📚', '🛒', '✈️', '🎵', '⭐', '🔒', '💰', '🎯'];

export function CreateFolderDialog({ visible, onDismiss, onConfirm }: { visible: boolean; onDismiss: () => void; onConfirm: (name: string, emoji: string) => void }) {
  const { t } = useTranslation();
  const cs = useWMTheme().colorScheme;
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('📁');
  useChatOrganization((s) => s.folders); // перерисовка счётчика
  useEffect(() => {
    if (visible) {
      setName('');
      setEmoji('📁');
    }
  }, [visible]);

  const count = ChatOrganizationManager.getCustomFolderCount();
  const max = ChatOrganizationManager.getMaxCustomFolders();
  const canCreate = ChatOrganizationManager.canCreateFolder();
  const ok = name.trim().length > 0 && canCreate;

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss}>
        <Dialog.Title>{t('new_folder_dialog_title')}</Dialog.Title>
        <Dialog.Content>
          <Text style={{ fontSize: 12, fontWeight: '500', color: canCreate ? cs.onSurfaceVariant : cs.error }}>{t('folder_count_format', [count, max])}</Text>
          {!canCreate && <Text style={{ fontSize: 11, color: cs.error }}>{t('folder_limit_reached')}</Text>}
          <TextInput mode="outlined" label={t('folder_name')} value={name} onChangeText={setName} disabled={!canCreate} style={{ marginTop: 8 }} />
          <Text style={{ fontSize: 14, marginTop: 12, marginBottom: 8, color: cs.onSurface }}>{t('choose_icon_label')}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {FOLDER_EMOJIS.map((e) => (
              <Pressable
                key={e}
                onPress={() => setEmoji(e)}
                style={[styles.emojiCell, { backgroundColor: e === emoji ? cs.primaryContainer : cs.surfaceVariant }]}
                accessibilityState={{ selected: e === emoji }}
              >
                <Text style={{ fontSize: 20 }}>{e}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onDismiss}>{t('cancel')}</Button>
          <Button disabled={!ok} onPress={() => ok && onConfirm(name.trim(), emoji)}>
            {t('create')}
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}

export function ManageTagsDialog({ chatId, chatName, visible, onDismiss }: { chatId: number; chatName: string; visible: boolean; onDismiss: () => void }) {
  const { t } = useTranslation();
  const cs = useWMTheme().colorScheme;
  const current = useChatOrganization((s) => s.chatTags[chatId]) ?? [];
  const [custom, setCustom] = useState('');

  const rows: ChatTag[][] = [];
  for (let i = 0; i < PRESET_TAGS.length; i += 2) rows.push(PRESET_TAGS.slice(i, i + 2));

  const addCustom = () => {
    const n = custom.trim();
    if (!n) return;
    ChatOrganizationManager.addTagToChat(chatId, { name: n, color: '#2196F3' });
    setCustom('');
  };

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss}>
        <Dialog.Title>{`${t('tags')}: ${chatName}`}</Dialog.Title>
        <Dialog.ScrollArea style={{ paddingHorizontal: 24 }}>
          <ScrollView>
            <Text style={{ fontSize: 14, color: cs.onSurfaceVariant, marginTop: 8, marginBottom: 12 }}>{t('select_or_create_tags')}</Text>
            {rows.map((row, i) => (
              <View key={i} style={{ flexDirection: 'row', gap: 8, paddingVertical: 2 }}>
                {row.map((tag) => {
                  const selected = current.some((c) => c.name === tag.name);
                  return (
                    <Chip
                      key={tag.name}
                      mode="outlined"
                      selected={selected}
                      showSelectedOverlay
                      style={{ flex: 1 }}
                      textStyle={{ fontSize: 12 }}
                      onPress={() => (selected ? ChatOrganizationManager.removeTagFromChat(chatId, tag.name) : ChatOrganizationManager.addTagToChat(chatId, tag))}
                    >
                      {localizedTagName(tag.name, t)}
                    </Chip>
                  );
                })}
                {row.length === 1 && <View style={{ flex: 1 }} />}
              </View>
            ))}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12, marginBottom: 8 }}>
              <TextInput mode="outlined" dense label={t('custom_tag')} value={custom} onChangeText={setCustom} onSubmitEditing={addCustom} style={{ flex: 1 }} />
              <IconButton icon="plus" onPress={addCustom} accessibilityLabel={t('add')} />
            </View>
          </ScrollView>
        </Dialog.ScrollArea>
        <Dialog.Actions>
          <Button onPress={onDismiss}>{t('done')}</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}

export function MoveToChatFolderDialog({ chatId, chatName, visible, onDismiss }: { chatId: number; chatName: string; visible: boolean; onDismiss: () => void }) {
  const { t } = useTranslation();
  const cs = useWMTheme().colorScheme;
  const custom = useChatOrganization((s) => s.folders).filter((f) => f.isCustom);
  const currentFolder = useChatOrganization((s) => s.chatFolderMapping[chatId] ?? null);

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss}>
        <Dialog.Title>{t('move_chat_title_format', [chatName])}</Dialog.Title>
        <Dialog.Content>
          {custom.length === 0 ? (
            <Text style={{ fontSize: 14, color: cs.onSurfaceVariant }}>{t('no_custom_folders_message')}</Text>
          ) : (
            custom.map((f) => (
              <Card
                key={f.id}
                mode="contained"
                style={{ marginVertical: 4, borderRadius: 12, backgroundColor: cs.surfaceVariant }}
                onPress={() => {
                  ChatOrganizationManager.moveChatToFolder(chatId, f.id);
                  onDismiss();
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', padding: 12 }}>
                  <Text style={{ fontSize: 20 }}>{f.emoji}</Text>
                  <Text style={{ marginLeft: 12, fontWeight: '500', color: f.id === currentFolder ? cs.primary : cs.onSurface }}>{f.name}</Text>
                </View>
              </Card>
            ))
          )}
          {currentFolder != null && (
            <Button
              icon="close"
              style={{ alignSelf: 'flex-start', marginTop: 8 }}
              onPress={() => {
                ChatOrganizationManager.removeChatFromFolder(chatId);
                onDismiss();
              }}
            >
              {t('remove_from_folder')}
            </Button>
          )}
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onDismiss}>{t('close')}</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}

const styles = StyleSheet.create({
  tabsRow: { paddingHorizontal: 12, paddingVertical: 6, gap: 8, alignItems: 'center' },
  chip: { height: 34, borderRadius: 17, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  badge: { minWidth: 18, minHeight: 18, borderRadius: 9, paddingHorizontal: 5, marginLeft: 6, alignItems: 'center', justifyContent: 'center' },
  tag: { borderRadius: 4, borderWidth: 0.5, paddingHorizontal: 6, paddingVertical: 1 },
  emojiCell: { width: 40, height: 40, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
});
