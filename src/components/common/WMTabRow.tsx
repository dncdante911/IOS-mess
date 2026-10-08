/**
 * WMTabRow — аналог Material 3 PrimaryTabRow / ScrollableTabRow (Compose):
 * равные вкладки (или прокручиваемые), индикатор 3dp со скруглённым верхом
 * под текстом, анимация пружиной WMMotion.defaultSpatial, нижний разделитель.
 */
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, type LayoutRectangle } from 'react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useWMTheme } from '../../theme/themeManager';
import { WMMotion, WMTypography } from '../../theme/wmTheme';

export interface WMTab {
  key: string;
  title: string;
  badge?: number;
}

export function WMTabRow({
  tabs,
  selectedIndex,
  onSelect,
  scrollable = false,
  containerColor,
}: {
  tabs: WMTab[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  scrollable?: boolean;
  containerColor?: string;
}) {
  const cs = useWMTheme().colorScheme;
  const [layouts, setLayouts] = useState<Record<number, { x: number; w: number }>>({});
  const sel = layouts[selectedIndex];

  const indicator = useAnimatedStyle(() => {
    if (!sel) return { opacity: 0 };
    // Индикатор — ширина текста (PrimaryTabRow), не меньше 24
    const w = Math.max(24, sel.w - 32);
    return {
      opacity: 1,
      width: withSpring(w, WMMotion.defaultSpatial),
      transform: [{ translateX: withSpring(sel.x + (sel.w - w) / 2, WMMotion.defaultSpatial) }],
    };
  }, [sel]);

  const onTabLayout = (i: number, l: LayoutRectangle) =>
    setLayouts((prev) => (prev[i]?.x === l.x && prev[i]?.w === l.width ? prev : { ...prev, [i]: { x: l.x, w: l.width } }));

  const items = tabs.map((tab, i) => {
    const selected = i === selectedIndex;
    return (
      <Pressable
        key={tab.key}
        onPress={() => onSelect(i)}
        onLayout={(e) => onTabLayout(i, e.nativeEvent.layout)}
        accessibilityRole="tab"
        accessibilityState={{ selected }}
        style={[styles.tab, !scrollable && { flex: 1 }]}
      >
        <Text numberOfLines={1} style={[WMTypography.titleSmall, { color: selected ? cs.primary : cs.onSurfaceVariant }]}>
          {tab.title}
        </Text>
        {tab.badge != null && tab.badge > 0 && (
          <View style={[styles.badge, { backgroundColor: cs.error }]}>
            <Text style={{ color: cs.onError, fontSize: 10, fontWeight: '700' }}>{tab.badge > 99 ? '99+' : tab.badge}</Text>
          </View>
        )}
      </Pressable>
    );
  });

  const body = (
    <View style={{ flexDirection: 'row' }}>
      {items}
      <Animated.View pointerEvents="none" style={[styles.indicator, { backgroundColor: cs.primary }, indicator]} />
    </View>
  );

  return (
    <View style={{ backgroundColor: containerColor ?? cs.surface }}>
      {scrollable ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 8 }}>
          {body}
        </ScrollView>
      ) : (
        body
      )}
      <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: cs.surfaceVariant }} />
    </View>
  );
}

const styles = StyleSheet.create({
  tab: { height: 48, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  indicator: { position: 'absolute', left: 0, bottom: 0, height: 3, borderTopLeftRadius: 3, borderTopRightRadius: 3 },
  badge: { minWidth: 16, height: 16, borderRadius: 8, paddingHorizontal: 4, marginLeft: 6, alignItems: 'center', justifyContent: 'center' },
});
