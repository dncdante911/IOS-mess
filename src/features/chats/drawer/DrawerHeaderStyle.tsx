/**
 * Фон шапки бокового меню — порт Android ui/chats/DrawerHeaderStyle.kt:
 * цвета темы (по умолчанию), один из 12 пресетов (градиент + декор) или своё
 * фото. Хранится локально, отдельно для каждого аккаунта.
 */
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { IconButton } from 'react-native-paper';
import { Canvas, Circle, Line, Path, RadialGradient, Rect, Skia, vec } from '@shopify/react-native-skia';
import { create } from 'zustand';
import { kv } from '../../../core/platform/kv';
import { useTranslation } from '../../../i18n';
import { useWMTheme } from '../../../theme/themeManager';
import { WMTypography, withAlpha } from '../../../theme/wmTheme';
import { JavaRandom } from '../../../theme/backgrounds/javaRandom';
import { WMBottomSheet } from '../../../components/common/WMBottomSheet';

export type DrawerHeaderDecor = 'NONE' | 'BUBBLES' | 'WAVES' | 'STARS' | 'GRID' | 'GLOW';

export interface DrawerHeaderPreset {
  id: string;
  colors: string[];
  decor: DrawerHeaderDecor;
  /** true → светлый фон, текст/иконки тёмные */
  lightBackground: boolean;
}

const p = (id: string, colors: string[], decor: DrawerHeaderDecor, lightBackground = false): DrawerHeaderPreset => ({ id, colors, decor, lightBackground });

export const DRAWER_HEADER_PRESETS: DrawerHeaderPreset[] = [
  p('aurora', ['#12C2E9', '#C471ED', '#F64F59'], 'WAVES'),
  p('sunset', ['#FF512F', '#F09819', '#FFC371'], 'BUBBLES'),
  p('ocean', ['#0F2027', '#203A43', '#2C5364'], 'WAVES'),
  p('forest', ['#134E5E', '#71B280'], 'BUBBLES'),
  p('galaxy', ['#0B0B2B', '#3A1C71', '#6A3093'], 'STARS'),
  p('rose_gold', ['#B76E79', '#E8C877', '#D4AF37'], 'GLOW'),
  p('neon', ['#00F5A0', '#00D9F5', '#7B2FF7'], 'GRID'),
  p('peach', ['#FFE5D9', '#FFCAD4', '#F4ACB7'], 'BUBBLES', true),
  p('mint', ['#D4FC79', '#96E6A1'], 'WAVES', true),
  p('carbon', ['#232526', '#414345'], 'GRID'),
  p('candy', ['#FC5C7D', '#6A82FB'], 'STARS'),
  p('sky', ['#E0EAFC', '#CFDEF3', '#A1C4FD'], 'GLOW', true),
];

export type DrawerHeaderStyle = { kind: 'theme' } | { kind: 'preset'; preset: DrawerHeaderPreset } | { kind: 'photo'; path: string };
const THEME: DrawerHeaderStyle = { kind: 'theme' };

// ─── Хранилище ───────────────────────────────────────────────────────────────

const key = (uid: number) => `drawer_header_style:style_${uid}`;
const photoPath = (uid: number) => `${FileSystem.documentDirectory}drawer_header_${uid}.jpg`;

const useHeaderCache = create<{ uid: number; style: DrawerHeaderStyle } | null>(() => null);

function load(uid: number): DrawerHeaderStyle {
  const raw = kv.getItem(key(uid));
  if (!raw) return THEME;
  if (raw.startsWith('preset:')) {
    const preset = DRAWER_HEADER_PRESETS.find((x) => x.id === raw.slice(7));
    return preset ? { kind: 'preset', preset } : THEME;
  }
  // Наличие файла проверяется при отрисовке (onError → тема), чтобы не делать IO синхронно
  if (raw.startsWith('photo:')) return { kind: 'photo', path: raw.slice(6) };
  return THEME;
}

export const DrawerHeaderStore = {
  current(uid: number): DrawerHeaderStyle {
    const c = useHeaderCache.getState();
    if (c && c.uid === uid) return c.style;
    const style = load(uid);
    useHeaderCache.setState({ uid, style }, true);
    return style;
  },

  set(uid: number, style: DrawerHeaderStyle): void {
    const raw = style.kind === 'theme' ? null : style.kind === 'preset' ? `preset:${style.preset.id}` : `photo:${style.path}`;
    if (raw == null) kv.removeItem(key(uid));
    else kv.setItem(key(uid), raw);
    if (style.kind !== 'photo') void FileSystem.deleteAsync(photoPath(uid), { idempotent: true }).catch(() => {});
    useHeaderCache.setState({ uid, style }, true);
  },

  /** Копирует выбранное фото в хранилище приложения (ссылки пикера временные). */
  async importPhoto(uid: number, uri: string): Promise<string | null> {
    try {
      const out = photoPath(uid);
      await FileSystem.deleteAsync(out, { idempotent: true });
      await FileSystem.copyAsync({ from: uri, to: out });
      return out;
    } catch {
      return null;
    }
  },
};

/** Реактивный стиль шапки для пользователя. */
export function useDrawerHeaderStyle(uid: number): DrawerHeaderStyle {
  const cached = useHeaderCache((s) => (s && s.uid === uid ? s.style : null));
  // без записи в стор во время рендера — кеш заполняется при set()/current()
  return cached ?? load(uid);
}

/** Цвет текста/иконок, читаемый на выбранном фоне. */
export function useDrawerHeaderContentColor(style: DrawerHeaderStyle): string {
  const cs = useWMTheme().colorScheme;
  if (style.kind === 'theme') return cs.onPrimary;
  if (style.kind === 'preset') return style.preset.lightBackground ? '#1C1B1F' : '#FFFFFF';
  return '#FFFFFF';
}

// ─── Фон ─────────────────────────────────────────────────────────────────────

/** Заполняет родителя выбранным фоном (absoluteFill). */
export function DrawerHeaderBackground({ style, perfMode, onPhotoMissing }: { style: DrawerHeaderStyle; perfMode: boolean; onPhotoMissing?: () => void }) {
  const cs = useWMTheme().colorScheme;
  const [size, setSize] = useState({ w: 0, h: 0 });
  const onLayout = (e: LayoutChangeEvent) => setSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height });

  if (style.kind === 'theme') {
    return (
      <View style={[StyleSheet.absoluteFill, { overflow: 'hidden' }]} pointerEvents="none">
        <LinearGradient colors={perfMode ? [cs.primary, cs.primary] : [cs.primary, cs.tertiary]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
        {!perfMode && (
          <>
            <View style={[styles.blob, { width: 140, height: 140, borderRadius: 70, right: -50, top: -60, backgroundColor: 'rgba(255,255,255,0.12)' }]} />
            <View style={[styles.blob, { width: 70, height: 70, borderRadius: 35, left: -24, bottom: -30, backgroundColor: 'rgba(255,255,255,0.08)' }]} />
          </>
        )}
      </View>
    );
  }
  if (style.kind === 'preset') {
    const pr = style.preset;
    return (
      <View style={StyleSheet.absoluteFill} onLayout={onLayout} pointerEvents="none">
        <LinearGradient colors={pr.colors as [string, string, ...string[]]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
        {!perfMode && size.w > 0 && <Decor decor={pr.decor} light={pr.lightBackground} w={size.w} h={size.h} />}
      </View>
    );
  }
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Image source={{ uri: style.path }} contentFit="cover" style={StyleSheet.absoluteFill} onError={onPhotoMissing} />
      {/* затемнение, чтобы имя/ID/кнопки читались на любом фото */}
      <LinearGradient colors={['rgba(0,0,0,0.15)', 'rgba(0,0,0,0.35)', 'rgba(0,0,0,0.65)']} style={StyleSheet.absoluteFill} />
    </View>
  );
}

function Decor({ decor, light, w, h }: { decor: DrawerHeaderDecor; light: boolean; w: number; h: number }) {
  const inkA = light ? 0.45 : 0.12;
  const ink = (mul = 1) => `rgba(255,255,255,${inkA * mul})`;
  let body: React.ReactNode = null;
  switch (decor) {
    case 'BUBBLES':
      body = (
        <>
          <Circle cx={w * 0.95} cy={h * 0.05} r={w * 0.28} color={ink()} />
          <Circle cx={w * 0.05} cy={h * 0.95} r={w * 0.12} color={ink(0.7)} />
          <Circle cx={w * 0.72} cy={h * 0.78} r={w * 0.06} color={ink(0.6)} />
        </>
      );
      break;
    case 'WAVES':
      body = [0, 1, 2].map((i) => {
        const y0 = h * (0.55 + i * 0.14);
        const path = Skia.Path.Make();
        path.moveTo(0, y0);
        path.cubicTo(w * 0.25, y0 - h * 0.12, w * 0.5, y0 + h * 0.12, w * 0.75, y0);
        path.cubicTo(w * 0.87, y0 - h * 0.06, w * 0.95, y0 - h * 0.04, w, y0 - h * 0.02);
        return <Path key={i} path={path} style="stroke" strokeWidth={2} color={ink(1 - i * 0.25)} />;
      });
      break;
    case 'STARS': {
      const rnd = new JavaRandom(7);
      const stars: React.ReactNode[] = [];
      for (let i = 0; i < 38; i++) {
        const r = 0.6 + rnd.nextFloat() * 1.6;
        const a = 0.25 + rnd.nextFloat() * 0.55;
        stars.push(<Circle key={i} cx={rnd.nextFloat() * w} cy={rnd.nextFloat() * h} r={r} color={`rgba(255,255,255,${a})`} />);
      }
      body = stars;
      break;
    }
    case 'GRID': {
      const lines: React.ReactNode[] = [];
      for (let x = 0, i = 0; x < w; x += 22, i++) lines.push(<Line key={i} p1={vec(x, 0)} p2={vec(x + h * 0.4, h)} strokeWidth={1} color={ink()} />);
      body = lines;
      break;
    }
    case 'GLOW':
      body = (
        <Rect x={0} y={0} width={w} height={h}>
          <RadialGradient c={vec(w * 0.85, h * 0.1)} r={w * 0.7} colors={['rgba(255,255,255,0.35)', 'rgba(255,255,255,0)']} />
        </Rect>
      );
      break;
    default:
      return null;
  }
  return <Canvas style={StyleSheet.absoluteFill}>{body}</Canvas>;
}

// ─── Кнопка и выбор ──────────────────────────────────────────────────────────

export function DrawerHeaderCustomizeButton({ tint, onPress }: { tint: string; onPress: () => void }) {
  const { t } = useTranslation();
  return <IconButton icon="palette-outline" iconColor={withAlpha(tint, 0.85)} onPress={onPress} accessibilityLabel={t('drawer_header_customize')} />;
}

export function DrawerHeaderPickerSheet({ visible, userId, current, onDismiss }: { visible: boolean; userId: number; current: DrawerHeaderStyle; onDismiss: () => void }) {
  const { t } = useTranslation();
  const cs = useWMTheme().colorScheme;

  const pickPhoto = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.9 });
    if (res.canceled || !res.assets?.[0]) return;
    const path = await DrawerHeaderStore.importPhoto(userId, res.assets[0].uri);
    if (path) DrawerHeaderStore.set(userId, { kind: 'photo', path });
  };

  const isPhoto = current.kind === 'photo';
  return (
    <WMBottomSheet visible={visible} onDismiss={onDismiss} containerColor={cs.surfaceContainerLow}>
      <View style={{ paddingHorizontal: 20, paddingBottom: 24 }}>
        <Text style={[WMTypography.titleLarge, { fontWeight: '700', color: cs.onSurface }]}>{t('drawer_header_title')}</Text>
        <Text style={[WMTypography.bodyMedium, { color: cs.onSurfaceVariant }]}>{t('drawer_header_subtitle')}</Text>
        <View style={styles.grid}>
          <HeaderTile selected={current.kind === 'theme'} onPress={() => DrawerHeaderStore.set(userId, THEME)}>
            <DrawerHeaderBackground style={THEME} perfMode={false} />
            <Text style={[WMTypography.labelLarge, { color: cs.onPrimary }]}>{t('drawer_header_theme')}</Text>
          </HeaderTile>
          <HeaderTile selected={isPhoto} onPress={() => void pickPhoto()}>
            {isPhoto ? <DrawerHeaderBackground style={current} perfMode={false} /> : <View style={[StyleSheet.absoluteFill, { backgroundColor: cs.surfaceContainerHigh }]} />}
            <MaterialCommunityIcons name="image-plus" size={24} color={isPhoto ? '#FFFFFF' : cs.primary} />
            <Text style={[WMTypography.labelMedium, { color: isPhoto ? '#FFFFFF' : cs.onSurface }]}>{t('drawer_header_photo')}</Text>
          </HeaderTile>
          {DRAWER_HEADER_PRESETS.map((pr) => (
            <HeaderTile key={pr.id} selected={current.kind === 'preset' && current.preset.id === pr.id} onPress={() => DrawerHeaderStore.set(userId, { kind: 'preset', preset: pr })}>
              <DrawerHeaderBackground style={{ kind: 'preset', preset: pr }} perfMode={false} />
            </HeaderTile>
          ))}
        </View>
      </View>
    </WMBottomSheet>
  );
}

function HeaderTile({ selected, onPress, children }: { selected: boolean; onPress: () => void; children: React.ReactNode }) {
  const cs = useWMTheme().colorScheme;
  return (
    <Pressable onPress={onPress} style={[styles.tile, { borderWidth: selected ? 3 : 1, borderColor: selected ? cs.primary : cs.outlineVariant }]} accessibilityState={{ selected }}>
      {children}
      {selected && (
        <View style={[styles.check, { backgroundColor: cs.primary }]}>
          <MaterialCommunityIcons name="check" size={14} color={cs.onPrimary} />
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  blob: { position: 'absolute' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 16 },
  // 3 колонки: (ширина − 2×10) / 3
  tile: { width: '31.5%', aspectRatio: 1.6, borderRadius: 18, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  check: { position: 'absolute', top: 6, right: 6, width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
});
