/**
 * Переключатель аккаунтов (Telegram-style) — порт Android ui/chats/AccountSwitcherDialog.kt.
 * Список аккаунтов (активный — галочка), удаление неактивных с подтверждением,
 * «Добавить аккаунт» с лимитом 5/10 и подсказкой про PRO.
 */
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, Dialog, Divider, IconButton, Portal } from 'react-native-paper';
import { Image } from 'expo-image';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AccountManager, MAX_ACCOUNTS_PRO, useAccountsStore } from '../../../core/accountManager';
import type { AccountEntity } from '../../../core/db';
import { UserSession } from '../../../core/session';
import { absMediaUrl } from '../../../core/helpers';
import { useTranslation } from '../../../i18n';
import { useWMTheme } from '../../../theme/themeManager';
import { WMTypography, withAlpha } from '../../../theme/wmTheme';

export function AccountSwitcherDialog({
  visible,
  onDismiss,
  onSwitchAccount,
  onAddAccount,
}: {
  visible: boolean;
  onDismiss: () => void;
  onSwitchAccount: (userId: number) => void;
  onAddAccount: () => void;
}) {
  const { t } = useTranslation();
  const cs = useWMTheme().colorScheme;
  const accounts = useAccountsStore((s) => s.accounts);
  const active = useAccountsStore((s) => s.activeAccount);
  const [toDelete, setToDelete] = useState<AccountEntity | null>(null);

  const max = AccountManager.getMaxAccounts();
  const canAdd = accounts.length < max;
  const subtype = t(UserSession.isPro > 0 ? 'multi_account_subtitle_pro' : 'multi_account_subtitle_free');
  const dim = (a: number) => withAlpha(cs.onSurface, a);

  return (
    <Portal>
      <Dialog visible={visible && !toDelete} onDismiss={onDismiss} style={{ borderRadius: 20, backgroundColor: cs.surface }}>
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={[WMTypography.titleLarge, { fontWeight: '700', color: cs.onSurface }]}>{t('multi_account_title')}</Text>
            <Text style={[WMTypography.bodySmall, { color: dim(0.6) }]}>{`${t('multi_account_subtitle', [accounts.length, max])} ${subtype}`}</Text>
          </View>
          <IconButton icon="close" onPress={onDismiss} accessibilityLabel={t('close')} />
        </View>
        <Divider />
        <ScrollView style={{ maxHeight: 400 }}>
          {accounts.map((acc) => {
            const isActive = acc.userId === active?.userId;
            return (
              <AccountItem
                key={acc.userId}
                account={acc}
                isActive={isActive}
                onSwitch={() => {
                  if (!isActive) onSwitchAccount(acc.userId);
                  onDismiss();
                }}
                onDelete={() => setToDelete(acc)}
              />
            );
          })}
        </ScrollView>
        <Divider />
        <Pressable disabled={!canAdd} onPress={onAddAccount} style={({ pressed }) => [styles.addRow, pressed && { backgroundColor: dim(0.06) }]}>
          <View style={[styles.addIcon, { backgroundColor: canAdd ? cs.primaryContainer : cs.surfaceVariant }]}>
            <MaterialCommunityIcons name="plus" size={24} color={canAdd ? cs.onPrimaryContainer : dim(0.38)} />
          </View>
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text style={[WMTypography.bodyLarge, { color: canAdd ? cs.onSurface : dim(0.38) }]}>{t('multi_account_add')}</Text>
            {!canAdd &&
              (!UserSession.isProActive ? (
                <Text style={[WMTypography.bodySmall, { color: '#B8860B' }]}>{t('premium_hint_accounts', [MAX_ACCOUNTS_PRO])}</Text>
              ) : (
                <Text style={[WMTypography.bodySmall, { color: dim(0.5) }]}>{t('multi_account_limit_reached', [max])}</Text>
              ))}
          </View>
        </Pressable>
      </Dialog>

      <Dialog visible={toDelete != null} onDismiss={() => setToDelete(null)}>
        <Dialog.Title>{t('multi_account_delete_title')}</Dialog.Title>
        <Dialog.Content>
          <Text style={{ color: cs.onSurfaceVariant }}>{t('multi_account_delete_message', [toDelete?.username ?? String(toDelete?.userId ?? '')])}</Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => setToDelete(null)}>{t('cancel')}</Button>
          <Button
            textColor={cs.error}
            onPress={() => {
              if (toDelete) void AccountManager.removeAccount(toDelete.userId);
              setToDelete(null);
            }}
          >
            {t('delete')}
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}

function AccountItem({ account, isActive, onSwitch, onDelete }: { account: AccountEntity; isActive: boolean; onSwitch: () => void; onDelete: () => void }) {
  const { t } = useTranslation();
  const cs = useWMTheme().colorScheme;
  const avatar = account.avatar ? absMediaUrl(account.avatar) : '';
  return (
    <Pressable onPress={onSwitch} style={({ pressed }) => [styles.item, pressed && { backgroundColor: withAlpha(cs.onSurface, 0.06) }]}>
      <View style={{ width: 48, height: 48 }}>
        {avatar ? (
          <Image source={{ uri: avatar }} style={styles.avatar} contentFit="cover" />
        ) : (
          <View style={[styles.avatar, { backgroundColor: cs.primaryContainer, alignItems: 'center', justifyContent: 'center' }]}>
            <MaterialCommunityIcons name="account" size={24} color={cs.onPrimaryContainer} />
          </View>
        )}
        {isActive && (
          <View style={[styles.activeDot, { backgroundColor: cs.primary }]}>
            <MaterialCommunityIcons name="check" size={10} color="#FFFFFF" />
          </View>
        )}
      </View>
      <View style={{ flex: 1, marginLeft: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text numberOfLines={1} style={[WMTypography.bodyLarge, { flexShrink: 1, color: cs.onSurface, fontWeight: isActive ? '600' : '400' }]}>
            {account.username ?? t('multi_account_fallback_name', [String(account.userId)])}
          </Text>
          {account.isPro > 0 && (
            <View style={[styles.pro, { backgroundColor: cs.tertiary }]}>
              <Text style={{ fontSize: 9, color: cs.onTertiary, fontWeight: '500' }}>{t('pro_badge')}</Text>
            </View>
          )}
        </View>
        <Text style={[WMTypography.bodySmall, { color: isActive ? cs.primary : withAlpha(cs.onSurface, 0.5) }]}>
          {t(isActive ? 'multi_account_active' : 'multi_account_tap_to_switch')}
        </Text>
      </View>
      {!isActive && <IconButton icon="delete" size={18} iconColor={withAlpha(cs.error, 0.7)} onPress={onDelete} accessibilityLabel={t('multi_account_delete_cd')} style={{ margin: 0 }} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingLeft: 20, paddingRight: 8, paddingTop: 8, paddingBottom: 8 },
  item: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 10 },
  avatar: { width: 48, height: 48, borderRadius: 24 },
  activeDot: { position: 'absolute', right: 0, bottom: 0, width: 16, height: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  pro: { marginLeft: 6, borderRadius: 4, paddingHorizontal: 4, paddingVertical: 1 },
  addRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  addIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
});
