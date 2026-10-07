/**
 * Сеть — порты Android:
 *   network/NetworkQualityMonitor.kt — качество связи → режим загрузки медиа,
 *                                      размер пачки сообщений, сокет vs HTTP
 *   network/NetworkTypeDetector.kt   — тип сети для автозагрузки (Wi-Fi/моб./роуминг)
 *   network/ProxyConfigHolder.kt     — прокси из «Данные и память»
 *
 * Android берёт полосу из NetworkCapabilities.linkDownstreamBandwidthKbps; на
 * iOS такой метрики нет, поэтому качество определяется по типу сети,
 * cellularGeneration (2g/3g/4g/5g) и замеру задержки HEAD /api/health —
 * тем же пингом и с теми же порогами, что на Android.
 */
import NetInfo, { type NetInfoState, NetInfoStateType } from '@react-native-community/netinfo';
import { create } from 'zustand';
import { getTranslation } from '../i18n';
import { kv } from './platform/kv';

export type ConnectionQuality = 'EXCELLENT' | 'GOOD' | 'POOR' | 'OFFLINE';
export type MediaLoadMode = 'FULL' | 'THUMBNAILS' | 'NONE';

export interface ConnectionState {
  quality: ConnectionQuality;
  mediaLoadMode: MediaLoadMode;
  latencyMs: number;
  /** мобильный интернет (тарифицируется) */
  isMetered: boolean;
  bandwidthKbps: number;
}

const PING_URL = 'https://worldmates.club:449/api/health';
const PING_TIMEOUT_MS = 5000;
const ORDER: ConnectionQuality[] = ['EXCELLENT', 'GOOD', 'POOR', 'OFFLINE'];

export const useConnectionState = create<ConnectionState>(() => ({
  quality: 'OFFLINE',
  mediaLoadMode: 'NONE',
  latencyMs: Number.MAX_SAFE_INTEGER,
  isMetered: false,
  bandwidthKbps: 0,
}));

function computeMediaMode(q: ConnectionQuality, metered: boolean): MediaLoadMode {
  switch (q) {
    case 'EXCELLENT':
      return metered ? 'THUMBNAILS' : 'FULL';
    case 'GOOD':
      return 'THUMBNAILS';
    default:
      return 'NONE';
  }
}

/** Оценка полосы по поколению сотовой сети (на iOS нет linkDownstreamBandwidthKbps). */
function estimate(state: NetInfoState): { quality: ConnectionQuality; kbps: number; metered: boolean } {
  if (!state.isConnected) return { quality: 'OFFLINE', kbps: 0, metered: false };
  const metered = state.type === NetInfoStateType.cellular || !!state.details?.isConnectionExpensive;
  if (state.isInternetReachable === false) return { quality: 'POOR', kbps: 0, metered };
  if (state.type === NetInfoStateType.wifi || state.type === NetInfoStateType.ethernet) {
    return { quality: 'EXCELLENT', kbps: 10_000, metered };
  }
  if (state.type === NetInfoStateType.cellular) {
    const gen = state.details?.cellularGeneration;
    if (gen === '5g' || gen === '4g') return { quality: 'EXCELLENT', kbps: 10_000, metered };
    if (gen === '3g') return { quality: 'GOOD', kbps: 2_000, metered };
    return { quality: 'POOR', kbps: 200, metered };
  }
  return { quality: 'GOOD', kbps: 1_000, metered };
}

const pingHistory: number[] = [];
let unsubscribe: (() => void) | null = null;

async function measureLatency(): Promise<number> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), PING_TIMEOUT_MS);
  const t0 = Date.now();
  try {
    const res = await fetch(PING_URL, { method: 'HEAD', signal: ctrl.signal });
    if (!res.ok) throw new Error(String(res.status));
    return Date.now() - t0;
  } catch {
    return Number.MAX_SAFE_INTEGER;
  } finally {
    clearTimeout(timer);
  }
}

async function checkLatencyOnce(): Promise<void> {
  const latency = await measureLatency();
  pingHistory.push(latency);
  if (pingHistory.length > 5) pingHistory.shift();
  const avg = pingHistory.reduce((a, b) => a + b, 0) / pingHistory.length;
  const latencyQuality: ConnectionQuality = avg < 200 ? 'EXCELLENT' : avg < 500 ? 'GOOD' : avg < 2000 ? 'POOR' : 'OFFLINE';
  const cur = useConnectionState.getState();
  // берём худшее из «по типу сети» и «по пингу» — как Android
  const quality = ORDER.indexOf(latencyQuality) > ORDER.indexOf(cur.quality) ? latencyQuality : cur.quality;
  useConnectionState.setState({ quality, latencyMs: Math.round(avg), mediaLoadMode: computeMediaMode(quality, cur.isMetered) });
}

function apply(state: NetInfoState): void {
  const e = estimate(state);
  useConnectionState.setState({
    quality: e.quality,
    isMetered: e.metered,
    bandwidthKbps: e.kbps,
    mediaLoadMode: computeMediaMode(e.quality, e.metered),
    ...(e.quality === 'OFFLINE' ? { latencyMs: Number.MAX_SAFE_INTEGER } : {}),
  });
  if (e.quality !== 'OFFLINE') void checkLatencyOnce();
  else pingHistory.length = 0;
}

export const NetworkQualityMonitor = {
  startMonitoring(): void {
    unsubscribe?.();
    unsubscribe = NetInfo.addEventListener(apply);
    void NetInfo.fetch().then(apply);
  },
  stopMonitoring(): void {
    unsubscribe?.();
    unsubscribe = null;
  },
  forceCheck(): void {
    void NetInfo.refresh().then(apply);
  },
  get state(): ConnectionState {
    return useConnectionState.getState();
  },
  canUseSocketIO: () => ['EXCELLENT', 'GOOD'].includes(useConnectionState.getState().quality),
  canLoadMedia: () => useConnectionState.getState().mediaLoadMode !== 'NONE',
  canLoadFullMedia: () => useConnectionState.getState().mediaLoadMode === 'FULL',
  getRecommendedBatchSize(): number {
    switch (useConnectionState.getState().quality) {
      case 'EXCELLENT': return 50;
      case 'GOOD': return 30;
      case 'POOR': return 10;
      default: return 0;
    }
  },
  getQualityDescription(): string {
    const s = useConnectionState.getState();
    switch (s.quality) {
      case 'EXCELLENT': return getTranslation('w4b_net_quality_excellent', undefined, [s.latencyMs]);
      case 'GOOD': return getTranslation('w4b_net_quality_good', undefined, [s.latencyMs]);
      case 'POOR': return getTranslation('w4b_net_quality_poor', undefined, [s.latencyMs]);
      default: return getTranslation('w4b_net_quality_offline');
    }
  },
  getQualityEmoji(): string {
    return { EXCELLENT: '🟢', GOOD: '🟡', POOR: '🟠', OFFLINE: '🔴' }[useConnectionState.getState().quality];
  },
};

// ─── NetworkTypeDetector ──────────────────────────────────────────────────────
export type NetworkType = 'MOBILE' | 'WIFI' | 'ROAMING' | 'OTHER';

let lastState: NetInfoState | null = null;
NetInfo.addEventListener((s) => {
  lastState = s;
});

export const NetworkTypeDetector = {
  /**
   * Точечная проверка в момент решения об автозагрузке.
   * Роуминг iOS через публичный API не сообщает — значение ROAMING на iOS
   * не возникает (Android его различает).
   */
  current(): NetworkType {
    const s = lastState;
    if (!s || !s.isConnected) return 'OTHER';
    if (s.type === NetInfoStateType.wifi || s.type === NetInfoStateType.ethernet) return 'WIFI';
    if (s.type === NetInfoStateType.cellular) return 'MOBILE';
    return 'OTHER';
  },
};

// ─── ProxyConfigHolder ────────────────────────────────────────────────────────
// Загружается синхронно при старте (прокси нужен именно когда сеть
// заблокирована — ждать сетевой запрос настроек нельзя).
//
// ⚠️ 🍎 Применение прокси к запросам на iOS требует нативного модуля
// (URLSessionConfiguration.connectionProxyDictionary для сетевого стека RN и
// для socket.io). Здесь — хранение/синхронизация настроек, как на Android;
// нативная часть — в плане (фаза 9, «Данные и память → Прокси»).
const PROXY_KEY = 'wm_proxy_prefs';

export interface ProxyConfig {
  enabled: boolean;
  /** "http" | "socks5" */
  type: string;
  host: string | null;
  port: number | null;
}

export const useProxyConfig = create<ProxyConfig>(() => ({ enabled: false, type: 'http', host: null, port: null }));

export const ProxyConfigHolder = {
  init(): void {
    const v = kv.getJson<Partial<ProxyConfig>>(PROXY_KEY, {});
    useProxyConfig.setState({
      enabled: !!v.enabled,
      type: v.type ?? 'http',
      host: v.host ?? null,
      port: v.port && v.port > 0 ? v.port : null,
    });
  },
  update(enabled: boolean, type: string, host: string | null, port: number | null): void {
    const cfg = { enabled, type, host, port };
    useProxyConfig.setState(cfg);
    kv.setJson(PROXY_KEY, cfg);
  },
  get enabled(): boolean {
    return useProxyConfig.getState().enabled;
  },
  /** null — без прокси. */
  toProxy(): { type: 'http' | 'socks5'; host: string; port: number } | null {
    const c = useProxyConfig.getState();
    if (!c.enabled || !c.host?.trim() || !c.port) return null;
    return { type: c.type === 'socks5' ? 'socks5' : 'http', host: c.host, port: c.port };
  },
};
