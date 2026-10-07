/**
 * Глобальная шина событий приложения — замена window.dispatchEvent(CustomEvent)
 * из Windows-кода. UI подписывается (тосты, баннеры), ядро только публикует.
 */
import { EventEmitter } from 'eventemitter3';

export type ToastKind = 'info' | 'success' | 'warning' | 'error';
export interface ToastEvent {
  text: string;
  kind?: ToastKind;
}

export const appEvents = new EventEmitter();

export const APP_EVENT_TOAST = 'wm-toast';

export function emitToast(text: string, kind: ToastKind = 'info'): void {
  appEvents.emit(APP_EVENT_TOAST, { text, kind } satisfies ToastEvent);
}
