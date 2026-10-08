/**
 * Цвет «плашки» под иконкой пункта — порт Android settingsIconColor()
 * (ui/settings/SettingsActivity.kt). Android берёт имя ImageVector
 * («Outlined.SmartToy» → «smarttoy»); здесь передаётся то же имя иконки
 * Material (как в Android-коде), чтобы цвета совпадали 1:1.
 */

/** java.lang.String.hashCode() */
function javaHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return h;
}

export function settingsIconColor(androidIconName: string): string {
  const n = androidIconName.slice(androidIconName.lastIndexOf('.') + 1).toLowerCase();
  const has = (...k: string[]) => k.some((x) => n.includes(x));
  if (has('notification', 'bell', 'alarm')) return '#FF9500';
  if (has('lock', 'shield', 'security', 'fingerprint', 'key', 'privacy')) return '#34C759';
  if (has('palette', 'brush', 'color', 'emoji', 'style')) return '#FF2D55';
  if (has('block', 'delete', 'exittoapp', 'logout', 'report')) return '#FF3B30';
  if (has('language', 'translate', 'public')) return '#00C7BE';
  if (has('storage', 'cloud', 'data', 'backup', 'folder')) return '#5856D6';
  if (has('group', 'people', 'personadd', 'contacts')) return '#AF52DE';
  if (has('person', 'account', 'face', 'badge')) return '#007AFF';
  if (has('devices', 'phone', 'smartphone', 'systemupdate', 'update')) return '#32ADE6';
  if (has('business', 'work', 'store', 'payments', 'star', 'bolt', 'premium')) return '#FFB800';
  if (has('smarttoy', 'robot', 'bot', 'autoawesome')) return '#30B0C7';
  if (has('info', 'help', 'question')) return '#8E8E93';
  // пункты бокового меню
  if (has('call')) return '#34C759';
  if (has('search')) return '#007AFF';
  if (has('bookmark')) return '#FF9500';
  if (has('note', 'edit', 'draft')) return '#FFB800';
  if (has('article', 'news', 'feed')) return '#5856D6';
  if (has('place', 'location', 'map', 'near')) return '#FF6482';
  if (has('explore', 'recommend')) return '#00C7BE';
  if (has('campaign', 'ads')) return '#FF9500';
  if (has('receipt', 'refund')) return '#5856D6';
  if (has('supportagent', 'support')) return '#00C7BE';
  if (has('share', 'invite')) return '#34C759';
  if (has('settings')) return '#8E8E93';
  if (has('camera', 'photo')) return '#FF2D55';
  const palette = ['#007AFF', '#34C759', '#FF9500', '#AF52DE', '#5856D6', '#00C7BE'];
  return palette[(javaHash(n) & 0x7fffffff) % palette.length];
}
