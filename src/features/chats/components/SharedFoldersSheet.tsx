/**
 * Совместные папки — порт Android ui/chats/SharedFolderUI.kt:
 *  • SharedFoldersSheet — список серверных папок (создать / вступить по ссылке)
 *  • карточка папки с меню: поделиться / изменить / выйти / удалить
 *  • шторка создания/редактирования (имя ≤100, эмодзи-сетка 60, палитра 10)
 *  • диалог вступления (код или полная ссылка …/folder/join/CODE)
 *  • шторка результата шаринга (ссылка + копирование)
 * Вложенные шторки/диалоги рендерятся ВНУТРИ родительской шторки (iOS Modal).
 */
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ActivityIndicator, Button, Card, Dialog, Divider, IconButton, Menu, Portal, TextInput } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import type { M } from '../../../core/android';
import { useTranslation } from '../../../i18n';
import { useWMTheme } from '../../../theme/themeManager';
import { WMTypography, withAlpha } from '../../../theme/wmTheme';
import { parseAndroidColor } from '../../../theme/color';
import { WMBottomSheet } from '../../../components/common/WMBottomSheet';
import { WMToast } from '../../../components/common/WMToast';
import { ServerFolderStore, useServerFolders } from '../serverFolderStore';

const folderColor = (hex: string) => parseAndroidColor(hex) ?? '#2196F3';

/** https://worldmates.club/folder/join/ABCD1234 → ABCD1234; иначе — как есть. */
export function extractJoinCode(input: string): string {
  const m = /\/folder\/join\/([a-zA-Z0-9]+)/.exec(input);
  return m ? m[1] : input.trim();
}

export function SharedFoldersSheet({ visible, onDismiss }: { visible: boolean; onDismiss: () => void }) {
  const { t } = useTranslation();
  const cs = useWMTheme().colorScheme;
  const folders = useServerFolders((s) => s.folders);
  const isLoading = useServerFolders((s) => s.isLoading);
  const shareUrl = useServerFolders((s) => s.shareUrl);

  const [createOpen, setCreateOpen] = useState(false);
  const [editFolder, setEditFolder] = useState<M.ServerFolder | null>(null);
  const [joinOpen, setJoinOpen] = useState(false);
  const [shareFolder, setShareFolder] = useState<M.ServerFolder | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<M.ServerFolder | null>(null);

  useEffect(() => {
    if (visible) void ServerFolderStore.loadFolders();
  }, [visible]);

  // Ссылка пришла → в буфер + показать шторку результата
  useEffect(() => {
    if (!shareUrl) return;
    void Clipboard.setStringAsync(shareUrl);
    WMToast.show(t('folder_link_copied'));
    setShareFolder(folders.find((f) => f.shareCode != null && shareUrl.includes(f.shareCode)) ?? null);
    ServerFolderStore.clearShareUrl();
  }, [shareUrl, folders, t]);

  return (
    <WMBottomSheet visible={visible} onDismiss={onDismiss}>
      <View style={styles.header}>
        <Text style={[WMTypography.titleMedium, { flex: 1, fontWeight: '700', color: cs.onSurface }]}>{t('folder_share')}</Text>
        <IconButton icon="account-plus" onPress={() => setJoinOpen(true)} accessibilityLabel={t('folder_join')} />
        <IconButton icon="plus" onPress={() => setCreateOpen(true)} accessibilityLabel={t('folder_create')} />
      </View>
      <Divider />

      {isLoading && folders.length === 0 ? (
        <View style={{ padding: 32, alignItems: 'center' }}>
          <ActivityIndicator />
          <Text style={{ marginTop: 8, color: cs.onSurface }}>{t('folder_syncing')}</Text>
        </View>
      ) : folders.length === 0 ? (
        <View style={{ paddingVertical: 40, paddingHorizontal: 24, alignItems: 'center' }}>
          <MaterialCommunityIcons name="folder-account" size={56} color={withAlpha(cs.onSurfaceVariant, 0.4)} />
          <Text style={[WMTypography.bodyMedium, { color: cs.onSurfaceVariant, marginTop: 12, textAlign: 'center' }]}>{t('folder_share_hint')}</Text>
          <Button mode="contained-tonal" icon="plus" style={{ marginTop: 16 }} onPress={() => setCreateOpen(true)}>
            {t('folder_create')}
          </Button>
        </View>
      ) : (
        <View style={{ paddingHorizontal: 16, paddingVertical: 8, gap: 8 }}>
          {folders.map((f) => (
            <ServerFolderCard
              key={f.id}
              folder={f}
              onShare={() => void ServerFolderStore.shareFolder(f.id, undefined, (e) => WMToast.show(e))}
              onEdit={() => setEditFolder(f)}
              onDelete={() => setDeleteTarget(f)}
              onLeave={() => void ServerFolderStore.leaveFolder(f.id, undefined, (e) => WMToast.show(e))}
            />
          ))}
        </View>
      )}
      <View style={{ height: 8 }} />

      {/* ── вложенные ── */}
      <FolderEditSheet
        visible={createOpen}
        onDismiss={() => setCreateOpen(false)}
        onSave={(name, emoji, color) => {
          void ServerFolderStore.createFolder(name, emoji, color, undefined, (e) => WMToast.show(e));
          setCreateOpen(false);
        }}
      />
      <FolderEditSheet
        visible={editFolder != null}
        existing={editFolder}
        onDismiss={() => setEditFolder(null)}
        onSave={(name, emoji, color) => {
          if (editFolder) void ServerFolderStore.updateFolder(editFolder.id, name, emoji, color, undefined, (e) => WMToast.show(e));
          setEditFolder(null);
        }}
      />
      <JoinFolderDialog
        visible={joinOpen}
        onDismiss={() => setJoinOpen(false)}
        onJoin={(code) =>
          void ServerFolderStore.joinFolder(
            code,
            (f) => {
              setJoinOpen(false);
              WMToast.show(t('folder_joined', [f.name]));
            },
            (e) => WMToast.show(e),
          )
        }
      />
      <FolderShareResultSheet folder={shareFolder} onDismiss={() => setShareFolder(null)} />
      <Portal>
        <Dialog visible={deleteTarget != null} onDismiss={() => setDeleteTarget(null)}>
          <Dialog.Title>{t('folder_delete_confirm', [deleteTarget?.name ?? ''])}</Dialog.Title>
          <Dialog.Actions>
            <Button onPress={() => setDeleteTarget(null)}>{t('cancel')}</Button>
            <Button
              textColor={cs.error}
              onPress={() => {
                if (deleteTarget) void ServerFolderStore.deleteFolder(deleteTarget.id, undefined, (e) => WMToast.show(e));
                setDeleteTarget(null);
              }}
            >
              {t('delete_action')}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </WMBottomSheet>
  );
}

function ServerFolderCard({
  folder,
  onShare,
  onEdit,
  onDelete,
  onLeave,
}: {
  folder: M.ServerFolder;
  onShare: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onLeave: () => void;
}) {
  const { t } = useTranslation();
  const cs = useWMTheme().colorScheme;
  const [menu, setMenu] = useState(false);
  const chatCount = folder.chats?.length ?? 0;
  const sub = t('cmp_folder_chats_count', [chatCount]) + (folder.memberCount > 0 ? ` · ${t('folder_members', [folder.memberCount])}` : '');
  const run = (fn: () => void) => () => {
    setMenu(false);
    fn();
  };

  return (
    <Card mode="contained" style={{ backgroundColor: cs.surfaceVariant }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 12 }}>
        <View style={[styles.emojiCircle, { backgroundColor: withAlpha(folderColor(folder.color), 0.2) }]}>
          <Text style={WMTypography.titleLarge}>{folder.emoji}</Text>
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text numberOfLines={1} style={[WMTypography.bodyLarge, { fontWeight: '500', color: cs.onSurface, flexShrink: 1 }]}>
              {folder.name}
            </Text>
            {folder.isShared && <SharedBadge />}
          </View>
          <Text style={[WMTypography.bodySmall, { color: cs.onSurfaceVariant }]}>{sub}</Text>
        </View>
        <Menu visible={menu} onDismiss={() => setMenu(false)} anchor={<IconButton icon="dots-vertical" onPress={() => setMenu(true)} />}>
          <Menu.Item leadingIcon="share-variant" title={t('folder_share')} onPress={run(onShare)} />
          <Menu.Item leadingIcon="pencil" title={t('folder_edit')} onPress={run(onEdit)} />
          <Menu.Item leadingIcon="exit-to-app" title={t('folder_leave')} onPress={run(onLeave)} />
          <Menu.Item leadingIcon={(p) => <MaterialCommunityIcons name="delete" size={p.size} color={cs.error} />} title={t('delete_action')} titleStyle={{ color: cs.error }} onPress={run(onDelete)} />
        </Menu>
      </View>
    </Card>
  );
}

export function SharedBadge() {
  const { t } = useTranslation();
  const cs = useWMTheme().colorScheme;
  return (
    <View style={[styles.badge, { backgroundColor: cs.primaryContainer }]}>
      <MaterialCommunityIcons name="account-multiple" size={10} color={cs.primary} />
      <Text style={[WMTypography.labelSmall, { color: cs.primary, marginLeft: 3 }]}>{t('folder_shared_badge')}</Text>
    </View>
  );
}

// ─── Создание / редактирование ───────────────────────────────────────────────

const EMOJI_GRID = [
  '📁', '📂', '💬', '👥', '📢', '⭐', '❤️', '🔥', '🏠', '💼',
  '🎮', '🎵', '📚', '🏋️', '✈️', '🍕', '💡', '🔔', '🎯', '🌟',
  '💙', '💚', '💜', '🧡', '❄️', '🌈', '🎉', '🤝', '🚀', '🏆',
  '🌙', '☀️', '⚡', '🎸', '🎨', '📱', '💻', '🔑', '🎓', '👾',
  '🐱', '🐶', '🦊', '🐻', '🐼', '🌸', '🍀', '🔮', '🎭', '🏖️',
  '🎪', '🧊', '🦋', '🌺', '🍃', '🎲', '🧩', '🎬', '📷', '🔧',
];
const COLOR_PALETTE = ['#4facf7', '#34c77b', '#a874f5', '#f5a623', '#ef4444', '#f56c9c', '#2dd4bf', '#5b8def', '#8b5cf6', '#ec4899'];

function FolderEditSheet({
  visible,
  existing = null,
  onDismiss,
  onSave,
}: {
  visible: boolean;
  existing?: M.ServerFolder | null;
  onDismiss: () => void;
  onSave: (name: string, emoji: string, color: string) => void;
}) {
  const { t } = useTranslation();
  const cs = useWMTheme().colorScheme;
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('📁');
  const [color, setColor] = useState('#4facf7');
  const [gridOpen, setGridOpen] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setName(existing?.name ?? '');
    setEmoji(existing?.emoji ?? '📁');
    setColor(existing?.color ?? '#4facf7');
    setGridOpen(false);
  }, [visible, existing]);

  const sel = folderColor(color);
  const ok = name.trim().length > 0;
  const rows: string[][] = [];
  for (let i = 0; i < EMOJI_GRID.length; i += 10) rows.push(EMOJI_GRID.slice(i, i + 10));

  return (
    <WMBottomSheet visible={visible} onDismiss={onDismiss} containerColor={cs.surface}>
      <View style={{ paddingHorizontal: 20 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={[styles.preview, { backgroundColor: withAlpha(sel, 0.15) }]}>
            <Text style={WMTypography.headlineMedium}>{emoji}</Text>
          </View>
          <Text style={[WMTypography.titleLarge, { marginLeft: 14, fontWeight: '700', color: cs.onSurface }]}>{t(existing ? 'folder_edit' : 'folder_create')}</Text>
        </View>

        <Text style={[WMTypography.labelLarge, { color: cs.onSurfaceVariant, marginTop: 20, marginBottom: 6 }]}>{t('folder_name_hint')}</Text>
        <TextInput mode="outlined" value={name} onChangeText={(v) => v.length <= 100 && setName(v)} maxLength={100} outlineStyle={{ borderRadius: 12 }} />
        <Text style={[WMTypography.labelSmall, { color: cs.onSurfaceVariant, marginTop: 4, marginLeft: 16 }]}>{`${name.length}/100`}</Text>

        <Pressable onPress={() => setGridOpen((v) => !v)} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 4, marginTop: 16 }}>
          <Text style={[WMTypography.labelLarge, { flex: 1, color: cs.onSurfaceVariant }]}>{t('folder_emoji_hint')}</Text>
          <View style={[styles.emojiBtn, { backgroundColor: cs.surfaceVariant }]}>
            <Text style={WMTypography.bodyLarge}>{emoji}</Text>
          </View>
        </Pressable>
        {gridOpen && (
          <View style={{ marginTop: 8 }}>
            {rows.map((row, i) => (
              <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-evenly', marginBottom: 2 }}>
                {row.map((e) => (
                  <Pressable key={e} onPress={() => setEmoji(e)} style={[styles.gridCell, { backgroundColor: e === emoji ? withAlpha(sel, 0.2) : 'transparent' }]}>
                    <Text style={{ fontSize: 20 }}>{e}</Text>
                  </Pressable>
                ))}
              </View>
            ))}
          </View>
        )}

        <Text style={[WMTypography.labelLarge, { color: cs.onSurfaceVariant, marginTop: 16, marginBottom: 8 }]}>{t('folder_color_label')}</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-evenly' }}>
          {COLOR_PALETTE.map((c) => {
            const selected = color === c;
            return (
              <Pressable
                key={c}
                onPress={() => setColor(c)}
                accessibilityState={{ selected }}
                style={[styles.colorDot, { backgroundColor: c }, selected && { borderWidth: 2.5, borderColor: cs.onSurface }]}
              >
                {selected && <MaterialCommunityIcons name="check" size={16} color="#FFFFFF" />}
              </Pressable>
            );
          })}
        </View>

        <View style={{ flexDirection: 'row', gap: 12, marginTop: 24, marginBottom: 16 }}>
          <Button mode="outlined" style={{ flex: 1, borderRadius: 12 }} onPress={onDismiss}>
            {t('cancel')}
          </Button>
          <Button mode="contained" disabled={!ok} buttonColor={sel} textColor="#FFFFFF" style={{ flex: 1, borderRadius: 12 }} onPress={() => ok && onSave(name.trim(), emoji, color)}>
            {t('save_action')}
          </Button>
        </View>
      </View>
    </WMBottomSheet>
  );
}

// ─── Вступление / результат шаринга ──────────────────────────────────────────

function JoinFolderDialog({ visible, onDismiss, onJoin }: { visible: boolean; onDismiss: () => void; onJoin: (code: string) => void }) {
  const { t } = useTranslation();
  const cs = useWMTheme().colorScheme;
  const [code, setCode] = useState('');
  useEffect(() => {
    if (visible) setCode('');
  }, [visible]);
  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss}>
        <Dialog.Title>{t('folder_join_title')}</Dialog.Title>
        <Dialog.Content style={{ gap: 8 }}>
          <Text style={[WMTypography.bodyMedium, { color: cs.onSurfaceVariant }]}>{t('folder_join_description')}</Text>
          <TextInput
            mode="outlined"
            label={t('folder_invite_link')}
            placeholder="https://…/folder/join/…"
            value={code}
            onChangeText={(v) => setCode(v.trim())}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onDismiss}>{t('cancel')}</Button>
          <Button
            disabled={!code}
            onPress={() => {
              const c = extractJoinCode(code);
              if (c) onJoin(c);
            }}
          >
            {t('folder_join')}
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}

function FolderShareResultSheet({ folder, onDismiss }: { folder: M.ServerFolder | null; onDismiss: () => void }) {
  const { t } = useTranslation();
  const cs = useWMTheme().colorScheme;
  const url = folder ? `worldmates.club/folder/join/${folder.shareCode ?? ''}` : '';
  return (
    <WMBottomSheet visible={folder != null} onDismiss={onDismiss}>
      {folder && (
        <View style={{ padding: 24, paddingTop: 0, alignItems: 'center', gap: 16 }}>
          <MaterialCommunityIcons name="folder-account" size={48} color={cs.primary} />
          <Text style={[WMTypography.titleLarge, { fontWeight: '700', color: cs.onSurface }]}>{folder.name}</Text>
          <Text style={[WMTypography.bodyMedium, { color: cs.onSurfaceVariant, textAlign: 'center' }]}>{t('folder_share_hint')}</Text>
          <Card mode="contained" style={{ alignSelf: 'stretch', backgroundColor: cs.surfaceVariant }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: 12 }}>
              <Text numberOfLines={1} style={[WMTypography.bodySmall, { flex: 1, color: cs.onSurface }]}>
                {url}
              </Text>
              <IconButton
                icon="content-copy"
                accessibilityLabel={t('folder_copy_link')}
                onPress={() => {
                  void Clipboard.setStringAsync(`https://${url}`);
                  WMToast.show(t('folder_link_copied'));
                }}
              />
            </View>
          </Card>
          {folder.memberCount > 0 && <Text style={[WMTypography.bodySmall, { color: cs.onSurfaceVariant }]}>{t('folder_members', [folder.memberCount])}</Text>}
        </View>
      )}
    </WMBottomSheet>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8 },
  emojiCircle: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  badge: { flexDirection: 'row', alignItems: 'center', borderRadius: 4, paddingHorizontal: 5, paddingVertical: 2, marginLeft: 6 },
  preview: { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  emojiBtn: { width: 36, height: 36, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  gridCell: { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  colorDot: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
});
