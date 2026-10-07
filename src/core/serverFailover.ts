// Порт windows-messenger/src/serverFailover.ts (localStorage → core/platform/kv).
import { localStorage } from './platform/kv';

/**
 * ServerFailoverManager — single-server mode.
 *
 * Primary: worldmates.club:449 (IP 195.22.131.11)
 * Backup infrastructure is disabled until proper HA is set up.
 */

// ─── Server list ──────────────────────────────────────────────────────────────
const SERVER_ENDPOINTS: string[] = [
  'https://worldmates.club:449/',         // Primary — IP 195.22.131.11
];

// Persistence key — remembers which server worked last session
const PREFERRED_SERVER_KEY = 'wm_preferred_server';

const MAX_FAILURES_BEFORE_SWITCH = 5;
const HEALTH_CHECK_INTERVAL_MS   = 20_000;
const MIN_TIME_ON_BACKUP_MS      = 60_000;
const HEALTH_CHECK_TIMEOUT_MS    = 6_000;

type ServerChangedCallback = (newUrl: string) => void;

class ServerFailoverManagerClass {
  private currentIndex    = 0;
  private failureCount    = 0;
  private switchedAt: number | null = null;
  private healthTimer:   ReturnType<typeof setInterval> | null = null;
  private onChangedCb:   ServerChangedCallback | null = null;

  constructor() {
    // Clear any previously saved backup-server preference so the app
    // doesn't restore a non-existent server on startup.
    try {
      const saved = localStorage.getItem(PREFERRED_SERVER_KEY);
      if (saved) {
        const idx = SERVER_ENDPOINTS.indexOf(saved);
        if (idx >= 0) {
          this.currentIndex = idx;
          if (idx !== 0) {
            console.info(`[ServerFailover] Restored preferred server: ${saved}`);
            this.startHealthCheck();
          }
        } else {
          // Saved server no longer in list (e.g. old backup URL) — reset to primary.
          localStorage.setItem(PREFERRED_SERVER_KEY, SERVER_ENDPOINTS[0]);
        }
      }
    } catch { /* localStorage unavailable — ignore */ }
  }

  // ─── Public getters ────────────────────────────────────────────────────────

  get socketUrl():       string  { return SERVER_ENDPOINTS[this.currentIndex]; }
  get nodeBaseUrl():     string  { return SERVER_ENDPOINTS[this.currentIndex]; }
  get isPrimaryActive(): boolean { return this.currentIndex === 0; }

  // ─── Lifecycle ─────────────────────────────────────────────────────────────

  onServerChanged(cb: ServerChangedCallback): void {
    this.onChangedCb = cb;
  }

  /** Call on every successful Socket.IO connect. */
  onConnectionSuccess(): void {
    if (this.failureCount > 0) {
      console.info(`[ServerFailover] Connection restored on ${this.socketUrl}`);
    }
    this.failureCount = 0;
    this.persistPreference();
  }

  /** Call on every Socket.IO connect_error or network failure. */
  onConnectionFailure(): void {
    this.failureCount++;
    console.warn(`[ServerFailover] Failure #${this.failureCount}/${MAX_FAILURES_BEFORE_SWITCH} on ${this.socketUrl}`);
    if (this.failureCount >= MAX_FAILURES_BEFORE_SWITCH) {
      this.switchToNextServer();
    }
  }

  startHealthCheck(): void {
    this.stopHealthCheck();
    this.healthTimer = setInterval(() => this.checkPrimaryAndRevert(), HEALTH_CHECK_INTERVAL_MS);
  }

  stopHealthCheck(): void {
    if (this.healthTimer !== null) {
      clearInterval(this.healthTimer);
      this.healthTimer = null;
    }
  }

  reset(): void {
    this.stopHealthCheck();
    this.currentIndex = 0;
    this.failureCount = 0;
    this.switchedAt   = null;
    this.persistPreference();
  }

  // ─── Internal ──────────────────────────────────────────────────────────────

  private switchToNextServer(): void {
    const prev = this.socketUrl;
    this.currentIndex = (this.currentIndex + 1) % SERVER_ENDPOINTS.length;
    this.failureCount = 0;
    this.switchedAt   = Date.now();
    console.warn(`[ServerFailover] Switched: ${prev}  →  ${this.socketUrl}`);
    this.startHealthCheck();
    this.persistPreference();
    this.onChangedCb?.(this.socketUrl);
  }

  private switchToPrimary(): void {
    const prev = this.socketUrl;
    this.currentIndex = 0;
    this.failureCount = 0;
    this.switchedAt   = null;
    console.info(`[ServerFailover] Recovered — back to primary (was ${prev})`);
    this.stopHealthCheck();
    this.persistPreference();
    this.onChangedCb?.(this.socketUrl);
  }

  private async checkPrimaryAndRevert(): Promise<void> {
    if (this.isPrimaryActive) return;
    if (this.switchedAt && Date.now() - this.switchedAt < MIN_TIME_ON_BACKUP_MS) return;
    const alive = await this.checkHealth(SERVER_ENDPOINTS[0]);
    if (alive) this.switchToPrimary();
  }

  private async checkHealth(url: string): Promise<boolean> {
    const healthUrl = url.replace(/\/$/, '') + '/api/health';
    try {
      const controller = new AbortController();
      const tid = setTimeout(() => controller.abort(), HEALTH_CHECK_TIMEOUT_MS);
      const resp = await fetch(healthUrl, { signal: controller.signal });
      clearTimeout(tid);
      return resp.ok;
    } catch {
      return false;
    }
  }

  private persistPreference(): void {
    try {
      localStorage.setItem(PREFERRED_SERVER_KEY, SERVER_ENDPOINTS[this.currentIndex]);
    } catch { /* ignore */ }
  }
}

export const serverFailover = new ServerFailoverManagerClass();
