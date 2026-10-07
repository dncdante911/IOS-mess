/**
 * ChatAnimatedBackground — порт Android ui/theme/ChatAnimatedBackground.kt:
 * 11 анимированных фонов чата + AnimatedBgPrefs.
 *
 * Отрисовка — Skia Picture, пересобираемая на UI-потоке каждый кадр
 * (useClock + useDerivedValue), как Compose Canvas с rememberInfiniteTransition.
 *
 * Перенос анимаций: tween(D, Linear/FastOutSlowIn) + RepeatMode.Reverse/Restart
 * пересчитываются как функции времени (rev/restart ниже). Значения, которые на
 * Android заданы в px (радиусы частиц, толщина линий, смещения 30f/20f…),
 * делятся на PixelRatio — тот же физический размер. Доли размеров (w*0.5…)
 * не меняются. «Случайные» позиции с seed (Random(42L)…) воспроизводятся
 * JavaRandom — совпадают с Android.
 *
 * В режиме производительности (PerformanceManager.active) — не рисуется.
 */
import React, { useMemo, useState } from 'react';
import { PixelRatio, StyleSheet, View, type LayoutChangeEvent, type StyleProp, type ViewStyle } from 'react-native';
import { create } from 'zustand';
import { useDerivedValue } from 'react-native-reanimated';
import { Canvas, Picture, Skia, TileMode, createPicture, useClock, type SkCanvas, type SkColor } from '@shopify/react-native-skia';
import { kv } from '../../core/platform/kv';
import { usePerformance } from '../../core/prefs';
import { JavaRandom } from './javaRandom';

export const ANIMATED_BG_VARIANTS = [
  'NONE',
  'AURORA',
  'OCEAN_WAVES',
  'COSMIC',
  'SUNSET_FLOW',
  'NEON_PULSE',
  'FOREST_MIST',
  'FIRE_EMBERS',
  'STARDUST',
  'BOKEH_LIGHTS',
  'GRADIENT_CYCLE',
  'GENTLE_RAIN',
] as const;
export type AnimatedBgVariant = (typeof ANIMATED_BG_VARIANTS)[number];

// ─── AnimatedBgPrefs ──────────────────────────────────────────────────────────
const KEY_VARIANT = 'animated_bg_variant';
export const useAnimatedBg = create<{ variant: AnimatedBgVariant }>(() => ({ variant: 'NONE' }));
export const AnimatedBgPrefs = {
  getVariant(): AnimatedBgVariant {
    const v = kv.getItem(KEY_VARIANT);
    return (ANIMATED_BG_VARIANTS as readonly string[]).includes(v ?? '') ? (v as AnimatedBgVariant) : 'NONE';
  },
  setVariant(variant: AnimatedBgVariant): void {
    kv.setItem(KEY_VARIANT, variant);
    useAnimatedBg.setState({ variant });
  },
  syncFromPrefs(): void {
    useAnimatedBg.setState({ variant: AnimatedBgPrefs.getVariant() });
  },
};

// ─── Время → значения анимаций (worklets) ─────────────────────────────────────
/** cubic-bezier(0.4, 0, 0.2, 1) — FastOutSlowInEasing */
function fastOutSlowIn(x: number): number {
  'worklet';
  const x1 = 0.4;
  const x2 = 0.2;
  const y1 = 0;
  const y2 = 1;
  let t = x;
  for (let i = 0; i < 6; i++) {
    const cx = 3 * x1 * t * (1 - t) * (1 - t) + 3 * x2 * t * t * (1 - t) + t * t * t - x;
    const d = 3 * x1 * (1 - t) * (1 - 3 * t) + 3 * x2 * t * (2 - 3 * t) + 3 * t * t;
    if (Math.abs(d) < 1e-6) break;
    t -= cx / d;
  }
  t = Math.min(1, Math.max(0, t));
  return 3 * y1 * t * (1 - t) * (1 - t) + 3 * y2 * t * t * (1 - t) + t * t * t;
}

/** infiniteRepeatable(tween(D), RepeatMode.Reverse): from→to→from */
function rev(ms: number, d: number, from: number, to: number, ease = false): number {
  'worklet';
  const p = (ms % (2 * d)) / d;
  let f = p <= 1 ? p : 2 - p;
  if (ease) f = fastOutSlowIn(f);
  return from + (to - from) * f;
}

/** infiniteRepeatable(tween(D), RepeatMode.Restart) */
function restart(ms: number, d: number, from: number, to: number): number {
  'worklet';
  return from + (to - from) * ((ms % d) / d);
}

function col(hex: string, alpha?: number): SkColor {
  'worklet';
  const c = Skia.Color(hex);
  if (alpha !== undefined) c[3] = Math.min(1, Math.max(0, alpha));
  return c;
}

function fill(canvas: SkCanvas, w: number, h: number, shaderOrColor: ReturnType<typeof Skia.Shader.MakeLinearGradient> | SkColor) {
  'worklet';
  const p = Skia.Paint();
  if (shaderOrColor instanceof Float32Array) p.setColor(shaderOrColor);
  else p.setShader(shaderOrColor);
  canvas.drawRect(Skia.XYWHRect(0, 0, w, h), p);
}

function linear(x0: number, y0: number, x1: number, y1: number, colors: SkColor[]) {
  'worklet';
  return Skia.Shader.MakeLinearGradient(Skia.Point(x0, y0), Skia.Point(x1, y1), colors, null, TileMode.Clamp);
}

function vertical(h: number, colors: SkColor[], startY = 0, endY = h) {
  'worklet';
  return linear(0, startY, 0, endY, colors);
}

function radial(cx: number, cy: number, r: number, colors: SkColor[]) {
  'worklet';
  return Skia.Shader.MakeRadialGradient(Skia.Point(cx, cy), Math.max(0.0001, r), colors, null, TileMode.Clamp);
}

function circle(canvas: SkCanvas, cx: number, cy: number, r: number, c: SkColor) {
  'worklet';
  const p = Skia.Paint();
  p.setColor(c);
  p.setAntiAlias(true);
  canvas.drawCircle(cx, cy, r, p);
}

function line(canvas: SkCanvas, x0: number, y0: number, x1: number, y1: number, c: SkColor, width: number, round = false) {
  'worklet';
  const p = Skia.Paint();
  p.setColor(c);
  p.setStrokeWidth(width);
  p.setAntiAlias(true);
  if (round) p.setStrokeCap(1); // StrokeCap.Round
  canvas.drawLine(x0, y0, x1, y1, p);
}

// ─── Стабильные данные частиц ─────────────────────────────────────────────────
function useParticles() {
  return useMemo(() => {
    const cosmicRng = new JavaRandom(42);
    const cosmic = Array.from({ length: 80 }, () => ({
      x: cosmicRng.nextFloat(),
      y: cosmicRng.nextFloat(),
      radius: cosmicRng.nextFloat() * 3 + 1,
      baseAlpha: cosmicRng.nextFloat() * 0.6 + 0.2,
    }));
    const neonRng = new JavaRandom(7);
    const neon = Array.from({ length: 30 }, () => [neonRng.nextFloat(), neonRng.nextFloat(), neonRng.nextFloat() * 2 * Math.PI]);
    const mistRng = new JavaRandom(13);
    const mist = Array.from({ length: 50 }, () => ({
      x: mistRng.nextFloat(),
      baseY: mistRng.nextFloat(),
      radius: mistRng.nextFloat() * 12 + 4,
      speed: mistRng.nextFloat() * 0.4 + 0.1,
      phase: mistRng.nextFloat(),
    }));
    const emberRng = new JavaRandom(99);
    const embers = Array.from({ length: 60 }, () => ({
      x: emberRng.nextFloat(),
      baseY: emberRng.nextFloat(),
      radius: emberRng.nextFloat() * 5 + 2,
      speed: emberRng.nextFloat() * 0.5 + 0.2,
      phase: emberRng.nextFloat(),
    }));
    // (0..100).random() на Android без seed — здесь тоже случайно
    const ri = (a: number, b: number) => a + Math.floor(Math.random() * (b - a + 1));
    const stardust = Array.from({ length: 60 }, () => [ri(0, 100) / 100, ri(0, 100) / 100, ri(3, 8) / 10]);
    const bokeh = Array.from({ length: 18 }, () => ({
      x: ri(5, 95) / 100,
      y: ri(5, 95) / 100,
      s: ri(3, 10) / 10,
      r: ri(20, 60),
      c: ri(0, 5),
    }));
    const rain = Array.from({ length: 80 }, () => [ri(0, 100) / 100, ri(0, 100) / 100, ri(4, 12) / 10]);
    return { cosmic, neon, mist, embers, stardust, bokeh, rain };
  }, []);
}

type Particles = ReturnType<typeof useParticles>;

// ─── Отрисовка кадра ──────────────────────────────────────────────────────────
function drawFrame(canvas: SkCanvas, v: AnimatedBgVariant, w: number, h: number, ms: number, px: number, P: Particles) {
  'worklet';
  switch (v) {
    case 'AURORA': {
      const o1 = rev(ms, 6000, 0, 1);
      const o2 = rev(ms, 8000, 1, 0);
      const a = rev(ms, 4000, 0.6, 1, true);
      fill(canvas, w, h, col('#0A1628'));
      fill(canvas, w, h, linear(0, h * (0.2 + 0.3 * o1), w, h * (0.5 + 0.3 * o1), [col('#057A5A00'), col('#00C9A7', a * 0.7), col('#57A5AA00')]));
      fill(canvas, w, h, linear(w * 0.2, h * (0.1 + 0.4 * o2), w * 0.8, h * (0.45 + 0.35 * o2), [col('#8B00FF00'), col('#7B2FFF', a * 0.5), col('#43006B00')]));
      const sx = w * o1;
      fill(canvas, w, h, linear(sx, 0, sx + w * 0.6, h * 0.6, [col('#00FFDD00'), col('#00E5CC', a * 0.4), col('#00AAAA00')]));
      break;
    }
    case 'OCEAN_WAVES': {
      const phase = restart(ms, 4000, 0, 2 * Math.PI);
      const a = rev(ms, 3000, 0.5, 0.9, true);
      fill(canvas, w, h, vertical(h, [col('#001B3A'), col('#003D6B'), col('#005C8A')]));
      const wc = [col('#0077B6', a * 0.6), col('#0096C7', a * 0.5), col('#00B4D8', a * 0.4), col('#48CAE4', a * 0.3)];
      for (let i = 0; i < wc.length; i++) {
        const waveH = h * (0.08 + i * 0.04);
        const vOff = h * (0.4 + i * 0.12);
        const shift = phase + i * (Math.PI / 2);
        const freq = 1.5 + i * 0.5;
        const path = Skia.Path.Make();
        const step = w / 100;
        for (let x = 0; x <= w; x += step) {
          const y = vOff + waveH * Math.sin((x / w) * freq * 2 * Math.PI + shift);
          if (x === 0) path.moveTo(x, y);
          else path.lineTo(x, y);
        }
        path.lineTo(w, h);
        path.lineTo(0, h);
        path.close();
        const p = Skia.Paint();
        p.setColor(wc[i]);
        p.setAntiAlias(true);
        canvas.drawPath(path, p);
      }
      break;
    }
    case 'COSMIC': {
      const swirl = restart(ms, 12000, 0, 2 * Math.PI);
      const neb = rev(ms, 5000, 0.3, 0.7, true);
      const pulse = rev(ms, 2000, 0.4, 1, true);
      fill(canvas, w, h, col('#06030F'));
      const blobs: Array<[number, number, number, string, number, string]> = [
        [w * 0.5 + w * 0.15 * Math.cos(swirl), h * 0.4 + h * 0.1 * Math.sin(swirl), w * 0.55, '#6A0DAD', neb * 0.5, '#3D007000'],
        [w * 0.3 + w * 0.1 * Math.sin(swirl + 1), h * 0.6 + h * 0.1 * Math.cos(swirl + 1), w * 0.45, '#1A0A5E', neb * 0.6, '#10003A00'],
        [w * 0.75 + w * 0.08 * Math.cos(swirl + 2), h * 0.25 + h * 0.08 * Math.sin(swirl + 2), w * 0.35, '#B0004E', neb * 0.35, '#60002500'],
      ];
      for (const [cx, cy, r, c, a, end] of blobs) {
        const p = Skia.Paint();
        p.setShader(radial(cx, cy, r, [col(c, a), col(end)]));
        canvas.drawCircle(cx, cy, r, p);
      }
      for (const s of P.cosmic) {
        const k = s.baseAlpha > 0.6 ? pulse : 1;
        circle(canvas, s.x * w, s.y * h, s.radius / px, col('#FFFFFF', s.baseAlpha * k));
      }
      break;
    }
    case 'SUNSET_FLOW': {
      const flow = restart(ms, 5000, 0, 1);
      const scale = rev(ms, 4000, 0.9, 1.1, true);
      const sx = w * (1 - flow);
      fill(
        canvas,
        w,
        h,
        linear(sx - w * 0.5, 0, sx + w * 1.5, h, ['#FF4500', '#FF6B35', '#FF8C42', '#FFB347', '#FF4081', '#E91E8C', '#FF1744', '#FF4500'].map((c) => col(c))),
      );
      fill(canvas, w, h, radial(w * 0.5, h * 0.3, w * 0.7 * scale, [col('#FFD700', 0.15 * scale), col('#FF8C0000')]));
      break;
    }
    case 'NEON_PULSE': {
      const pa = rev(ms, 1200, 0.3, 1, true);
      const lo = rev(ms, 3000, 0, 1);
      const pp = restart(ms, 2500, 0, 2 * Math.PI);
      fill(canvas, w, h, col('#050510'));
      for (let i = 0; i < 8; i++) {
        const y = h * (i / 8) + h * 0.05 * Math.sin(pp + i);
        const la = pa * (0.4 + 0.6 * ((i % 3) / 2));
        line(canvas, 0, y, w * (0.4 + 0.6 * lo), y, col('#00BFFF', la), (i % 2 === 0 ? 2 : 1) / px);
      }
      for (let i = 0; i < 6; i++) {
        const x = w * (i / 6) + w * 0.03 * Math.cos(pp + i * 0.7);
        const va = pa * (0.3 + 0.5 * (i % 2));
        line(canvas, x, 0, x, h * (0.3 + 0.5 * lo), col('#FF007F', va), (i % 3 === 0 ? 2 : 1) / px);
      }
      for (const [x, y, ph] of P.neon) {
        const a = (0.5 + 0.5 * Math.sin(pp + ph)) * pa;
        const c = ph < Math.PI ? '#00FFFF' : '#FF00FF';
        circle(canvas, x * w, y * h, 4 / px, col(c, a));
        circle(canvas, x * w, y * h, 10 / px, col(c, a * 0.3));
      }
      break;
    }
    case 'FOREST_MIST': {
      const drift = restart(ms, 6000, 0, 1);
      const ma = rev(ms, 4000, 0.4, 0.8, true);
      fill(canvas, w, h, vertical(h, [col('#0D2818'), col('#1A4731'), col('#0F3422')]));
      fill(canvas, w, h, vertical(h, [col('#AAFFDD00'), col('#AAFFDD', ma * 0.3), col('#88CCAA00')], h * 0.5, h));
      for (const p of P.mist) {
        const cy = (((p.baseY - drift * p.speed + p.phase) % 1) + 1) % 1;
        const rising = 1 - cy;
        const fade = Math.min(1, Math.max(0, cy * 2));
        const c = p.phase < 0.33 ? '#90EE90' : p.phase < 0.66 ? '#40E0D0' : '#FFFFFF';
        circle(canvas, p.x * w, rising * h, p.radius / px, col(c, ma * fade * 0.6));
      }
      break;
    }
    case 'FIRE_EMBERS': {
      const rise = restart(ms, 3000, 0, 1);
      const fl = rev(ms, 300, 0.7, 1, true);
      fill(canvas, w, h, vertical(h, [col('#0A0000'), col('#1A0500'), col('#2D0800')]));
      fill(canvas, w, h, vertical(h, [col('#FF450000'), col('#FF4500', fl * 0.5), col('#FF6B00', fl * 0.8)], h * 0.6, h));
      fill(canvas, w, h, radial(w * 0.5, h, w * 0.8, [col('#FF8C00', fl * 0.4), col('#FF450000')]));
      for (const e of P.embers) {
        const prog = (e.phase + rise * e.speed) % 1;
        const cy = h * (1 - prog);
        const a = Math.min(1, Math.max(0, 1 - prog)) * fl * 0.9;
        const r = e.radius / px;
        const drift = r * 3 * Math.sin(prog * 4 * Math.PI + e.phase * 2 * Math.PI);
        const cx = Math.min(w, Math.max(0, e.x * w + drift));
        const c = e.phase < 0.4 ? '#FF4500' : e.phase < 0.7 ? '#FF8C00' : '#FFD700';
        circle(canvas, cx, cy, r * 3, col(c, a * 0.3));
        circle(canvas, cx, cy, r, col(c, a));
      }
      break;
    }
    case 'STARDUST': {
      const t = restart(ms, 8000, 0, 1);
      fill(canvas, w, h, vertical(h, [col('#0A0A1F'), col('#0F0F35'), col('#151530')]));
      for (const [x, y, s] of P.stardust) {
        const ay = (y - t * s * 0.3 + 1) % 1;
        const a = Math.min(0.9, Math.max(0.1, 0.3 + Math.max(-1, Math.min(1, Math.sin(t * s * Math.PI * 2))) * 0.35 + 0.35));
        const r = (1.5 + s * 2) / px;
        circle(canvas, x * w, ay * h, r, col('#FFFFFF', a));
        if (s > 0.6) circle(canvas, x * w, ay * h, r * 2.5, col('#ADD8FF', a * 0.3));
      }
      break;
    }
    case 'BOKEH_LIGHTS': {
      const t = restart(ms, 12000, 0, 2 * Math.PI);
      const colors = ['#FF6B9D', '#6B9DFF', '#9DFF6B', '#FFD96B', '#6BFFD9', '#D96BFF'];
      fill(canvas, w, h, col('#0D0D1A'));
      for (const b of P.bokeh) {
        const ox = (Math.cos(t * b.s) * 30) / px;
        const oy = (Math.sin(t * b.s * 0.7) * 20) / px;
        const a = Math.min(0.25, Math.max(0.05, 0.12 + Math.max(-1, Math.min(1, Math.sin(t * b.s + b.x * Math.PI))) * 0.06 + 0.06));
        // радиус на Android — px * (w/400); w уже в pt → делим на плотность
        circle(canvas, b.x * w + ox, b.y * h + oy, (b.r * (w * px)) / 400 / px, col(colors[b.c], a));
      }
      break;
    }
    case 'GRADIENT_CYCLE': {
      const hue = restart(ms, 16000, 0, 360);
      const hsl = (hh: number, s: number, l: number) => {
        const c = (1 - Math.abs(2 * l - 1)) * s;
        const x = c * (1 - Math.abs(((hh * 6) % 2) - 1));
        const m = l - c / 2;
        let r = 0;
        let g = 0;
        let b = 0;
        if (hh < 1 / 6) [r, g, b] = [c, x, 0];
        else if (hh < 2 / 6) [r, g, b] = [x, c, 0];
        else if (hh < 3 / 6) [r, g, b] = [0, c, x];
        else if (hh < 4 / 6) [r, g, b] = [0, x, c];
        else if (hh < 5 / 6) [r, g, b] = [x, 0, c];
        else [r, g, b] = [c, 0, x];
        return Float32Array.of(r + m, g + m, b + m, 1);
      };
      fill(canvas, w, h, vertical(h, [hsl((hue % 360) / 360, 0.6, 0.28), hsl(((hue + 120) % 360) / 360, 0.55, 0.22), hsl(((hue + 240) % 360) / 360, 0.5, 0.18)]));
      break;
    }
    case 'GENTLE_RAIN': {
      const t = restart(ms, 2000, 0, 1);
      fill(canvas, w, h, vertical(h, [col('#1A2A3A'), col('#0F1F2F'), col('#0A1520')]));
      for (const [x, yo, s] of P.rain) {
        const y = (yo + t * s) % 1;
        const a = Math.min(0.4, Math.max(0.1, 0.15 + s * 0.2));
        const len = (8 + s * 12) / px;
        line(canvas, x * w, y * h, x * w - len * 0.15, y * h + len, col('#9EC8E8', a), 1 / px, true);
      }
      break;
    }
    default:
      break;
  }
}

function AnimatedCanvas({ variant, w, h }: { variant: AnimatedBgVariant; w: number; h: number }) {
  const clock = useClock();
  const particles = useParticles();
  const px = PixelRatio.get();
  const picture = useDerivedValue(() =>
    createPicture((canvas) => drawFrame(canvas, variant, w, h, clock.value, px, particles), Skia.XYWHRect(0, 0, w, h)),
  );
  return (
    <Canvas style={StyleSheet.absoluteFill}>
      <Picture picture={picture} />
    </Canvas>
  );
}

/** ChatAnimatedBackground(variant) — NONE и режим производительности не рисуют ничего. */
export function ChatAnimatedBackground({ variant, style }: { variant: AnimatedBgVariant; style?: StyleProp<ViewStyle> }) {
  const perf = usePerformance((s) => s.active);
  const [size, setSize] = useState({ w: 0, h: 0 });
  if (perf || variant === 'NONE') return null;
  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width !== size.w || height !== size.h) setSize({ w: width, h: height });
  };
  return (
    <View style={[StyleSheet.absoluteFill, style]} onLayout={onLayout} pointerEvents="none">
      {size.w > 0 && <AnimatedCanvas variant={variant} w={size.w} h={size.h} />}
    </View>
  );
}

/** Ключ строки названия варианта (AnimatedBackgroundSection.variantLabelRes). */
export const ANIMATED_BG_NAME_KEYS: Record<AnimatedBgVariant, string> = {
  NONE: 'animated_bg_none',
  AURORA: 'animated_bg_aurora',
  OCEAN_WAVES: 'animated_bg_ocean',
  COSMIC: 'animated_bg_cosmic',
  SUNSET_FLOW: 'animated_bg_sunset',
  NEON_PULSE: 'animated_bg_neon',
  FOREST_MIST: 'animated_bg_forest',
  FIRE_EMBERS: 'animated_bg_fire',
  STARDUST: 'animated_bg_stardust',
  BOKEH_LIGHTS: 'animated_bg_bokeh',
  GRADIENT_CYCLE: 'animated_bg_gradient_cycle',
  GENTLE_RAIN: 'animated_bg_gentle_rain',
};
