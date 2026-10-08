/**
 * Нативный жест горизонтального пейджера главного экрана. Строки со свайп-
 * действиями блокируют его (blocksExternalGesture), чтобы горизонтальный
 * свайп по строке не листал вкладки — как SwipeToDismissBox внутри
 * HorizontalPager в Compose.
 */
import { createContext } from 'react';
import type { NativeGesture } from 'react-native-gesture-handler';

export const PagerGestureContext = createContext<NativeGesture | null>(null);
