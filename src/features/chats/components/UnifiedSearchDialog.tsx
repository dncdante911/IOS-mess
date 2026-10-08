/**
 * Единый поиск (люди + каналы) — порт UnifiedSearchDialog из Android
 * ui/chats/ChatsScreenModern.kt. Полноэкранный диалог:
 *  • поле поиска с автофокусом, debounce 400 мс, от 2 символов
 *  • вкладки «Люди» / «Каналы» (usersOnly — только люди, облегчённый режим)
 *  • пустой запрос на вкладке каналов → общий каталог (get_list, 100)
 */
import React, { useEffect, useRef, useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { ActivityIndicator, IconButton, TextInput } from 'react-native-paper';
import { Image } from 'expo-image';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NodeRetrofitClient, channelsOf, type M } from '../../../core/android';
import { absMediaUrl } from '../../../core/helpers';
import { useTranslation } from '../../../i18n';
import { useWMTheme } from '../../../theme/themeManager';
import { WMTypography, withAlpha } from '../../../theme/wmTheme';
import { WMTabRow } from '../../../components/common/WMTabRow';
import { WMToastHost } from '../../../components/common/WMToast';

export function UnifiedSearchDialog({
  visible,
  onDismiss,
  onUserClick,
  onChannelClick,
  usersOnly = false,
}: {
  visible: boolean;
  onDismiss: () => void;
  onUserClick: (u: M.SearchUser) => void;
  onChannelClick?: (c: M.Channel) => void;
  usersOnly?: boolean;
}) {
  const { t } = useTranslation();
  const cs = useWMTheme().colorScheme;
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState(0);
  const [users, setUsers] = useState<M.SearchUser[]>([]);
  const [channels, setChannels] = useState<M.Channel[]>([]);
  const [browse, setBrowse] = useState<M.Channel[]>([]);
  const [searching, setSearching] = useState(false);
  const reqSeq = useRef(0);

  // Сброс при каждом открытии
  useEffect(() => {
    if (!visible) return;
    setQuery('');
    setTab(0);
    setUsers([]);
    setChannels([]);
  }, [visible]);

  // Общий каталог каналов
  useEffect(() => {
    if (!visible || usersOnly) return;
    let alive = true;
    NodeRetrofitClient.channelApi
      .getChannels('get_list', 100)
      .then((r) => {
        const list = channelsOf(r);
        if (!alive || r.apiStatus !== 200 || !list) return;
        setBrowse(list);
        setChannels((cur) => (cur.length === 0 ? list : cur));
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [visible, usersOnly]);

  // Поиск с debounce 400 мс; устаревшие ответы отбрасываются
  useEffect(() => {
    if (!visible) return;
    const q = query;
    const timer = setTimeout(() => {
      const seq = ++reqSeq.current;
      if (q.length < 2) {
        setUsers([]);
        setChannels(browse);
        setSearching(false);
        return;
      }
      setSearching(true);
      const pUsers = NodeRetrofitClient.profileApi
        .searchUsers(q, 20)
        .then((r) => seq === reqSeq.current && setUsers(r.users ?? []))
        .catch(() => {});
      const pChannels = usersOnly
        ? Promise.resolve()
        : NodeRetrofitClient.channelApi
            .getChannels('search', 30, 0, q)
            .then((r) => {
              const list = channelsOf(r);
              if (seq === reqSeq.current && r.apiStatus === 200 && list) setChannels(list);
            })
            .catch(() => {});
      void Promise.all([pUsers, pChannels]).finally(() => seq === reqSeq.current && setSearching(false));
    }, 400);
    return () => clearTimeout(timer);
  }, [query, visible, usersOnly, browse]);

  const sep = () => <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: withAlpha(cs.outlineVariant, 0.3) }} />;
  const center = (node: React.ReactNode) => <View style={styles.center}>{node}</View>;

  let content: React.ReactNode;
  if (searching) {
    content = center(<ActivityIndicator />);
  } else if (tab === 0 && query.length < 2) {
    content = center(
      <>
        <MaterialCommunityIcons name="magnify" size={64} color={cs.outlineVariant} />
        <Text style={{ marginTop: 12, color: cs.onSurfaceVariant }}>{t('search_hint')}</Text>
      </>,
    );
  } else if (tab === 0) {
    content =
      users.length === 0 ? (
        center(<Text style={{ color: cs.onSurfaceVariant }}>{t('search_no_users')}</Text>)
      ) : (
        <FlatList
          data={users}
          keyExtractor={(u) => String(u.userId)}
          keyboardShouldPersistTaps="handled"
          ItemSeparatorComponent={sep}
          renderItem={({ item }) => (
            <ResultRow
              title={item.name || item.username}
              subtitle={`@${item.username}`}
              avatar={item.avatarUrl}
              onPress={() => onUserClick(item)}
            />
          )}
        />
      );
  } else {
    content =
      channels.length === 0 ? (
        center(<Text style={{ color: cs.onSurfaceVariant }}>{t('search_no_results', [query])}</Text>)
      ) : (
        <FlatList
          data={channels}
          keyExtractor={(c) => String(c.id)}
          keyboardShouldPersistTaps="handled"
          ItemSeparatorComponent={sep}
          renderItem={({ item }) => (
            <ResultRow
              title={item.name}
              subtitle={item.username ? `@${item.username}` : null}
              avatar={item.avatarUrl}
              fallbackIcon="bullhorn-outline"
              onPress={() => onChannelClick?.(item)}
            />
          )}
        />
      );
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={onDismiss}>
      <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: cs.surface }}>
        <View style={styles.bar}>
          <IconButton icon="arrow-left" onPress={onDismiss} accessibilityLabel={t('back')} />
          <TextInput
            mode="flat"
            value={query}
            onChangeText={setQuery}
            placeholder={t('search_placeholder')}
            autoFocus
            returnKeyType="search"
            autoCorrect={false}
            style={{ flex: 1, backgroundColor: 'transparent' }}
            underlineColor="transparent"
            activeUnderlineColor="transparent"
            right={query ? <TextInput.Icon icon="close" onPress={() => setQuery('')} /> : undefined}
          />
        </View>
        {!usersOnly && (
          <WMTabRow
            tabs={[
              { key: 'users', title: t('search_tab_users') },
              { key: 'channels', title: t('channels') },
            ]}
            selectedIndex={tab}
            onSelect={setTab}
          />
        )}
        <View style={{ flex: 1 }}>{content}</View>
        <WMToastHost />
      </SafeAreaView>
    </Modal>
  );
}

function ResultRow({
  title,
  subtitle,
  avatar,
  fallbackIcon,
  onPress,
}: {
  title: string;
  subtitle: string | null;
  avatar: string;
  fallbackIcon?: string;
  onPress: () => void;
}) {
  const cs = useWMTheme().colorScheme;
  const url = absMediaUrl(avatar);
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.row, pressed && { backgroundColor: withAlpha(cs.onSurface, 0.08) }]}>
      {url || !fallbackIcon ? (
        <Image source={url ? { uri: url } : undefined} style={[styles.avatar, { backgroundColor: cs.surfaceVariant }]} contentFit="cover" accessibilityLabel={title} />
      ) : (
        <View style={[styles.avatar, { backgroundColor: cs.primaryContainer, alignItems: 'center', justifyContent: 'center' }]}>
          <MaterialCommunityIcons name={fallbackIcon as never} size={24} color={cs.onPrimaryContainer} />
        </View>
      )}
      <View style={{ flex: 1, marginLeft: 16 }}>
        <Text numberOfLines={1} style={[WMTypography.bodyLarge, { color: cs.onSurface }]}>
          {title}
        </Text>
        {subtitle ? (
          <Text numberOfLines={1} style={[WMTypography.bodyMedium, { color: cs.onSurfaceVariant }]}>
            {subtitle}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', alignItems: 'center', paddingRight: 8, height: 64 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, minHeight: 72 },
  avatar: { width: 44, height: 44, borderRadius: 22 },
});
