#!/usr/bin/env node
/**
 * Синтез звуков звонка — те же тоны, что Windows utils/callSounds.ts (Web Audio):
 *   call_ringtone.wav — входящий: двойной «ring-ring» 660 Гц (треугольник) +
 *                       880 Гц (синус), 0.4 с ×2, цикл 2.2 с
 *   call_ringback.wav — исходящий гудок: 425 Гц синус 1 с, цикл 4 с
 * Один цикл в файле; плеер зацикливает. Огибающая как у blip():
 * подъём 20 мс → полка → экспоненциальный спад в последние 40 мс.
 *
 *   node scripts/synth-call-sounds.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const RATE = 44100;

function render(durationSec, blips) {
  const n = Math.round(durationSec * RATE);
  const buf = new Float64Array(n);
  for (const b of blips) {
    const start = Math.round(b.at * RATE);
    const len = Math.round(b.dur * RATE);
    for (let i = 0; i < len && start + i < n; i++) {
      const t = i / RATE;
      const phase = (b.freq * t) % 1;
      const wave = b.type === 'triangle' ? 1 - 4 * Math.abs(phase - 0.5) : Math.sin(2 * Math.PI * phase);
      let env;
      const holdEnd = Math.max(0.04, b.dur - 0.04);
      if (t < 0.02) env = 0.0001 + ((b.vol - 0.0001) * t) / 0.02;
      else if (t < holdEnd) env = b.vol;
      else env = b.vol * Math.pow(0.0001 / b.vol, (t - holdEnd) / (b.dur - holdEnd));
      buf[start + i] += wave * env;
    }
  }
  return buf;
}

function wav(samples) {
  const data = Buffer.alloc(samples.length * 2);
  samples.forEach((s, i) => data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, s)) * 32767), i * 2));
  const h = Buffer.alloc(44);
  h.write('RIFF', 0);
  h.writeUInt32LE(36 + data.length, 4);
  h.write('WAVE', 8);
  h.write('fmt ', 12);
  h.writeUInt32LE(16, 16);
  h.writeUInt16LE(1, 20); // PCM
  h.writeUInt16LE(1, 22); // моно
  h.writeUInt32LE(RATE, 24);
  h.writeUInt32LE(RATE * 2, 28);
  h.writeUInt16LE(2, 32);
  h.writeUInt16LE(16, 34);
  h.write('data', 36);
  h.writeUInt32LE(data.length, 40);
  return Buffer.concat([h, data]);
}

const ringtone = render(2.2, [
  { freq: 660, at: 0.0, dur: 0.4, vol: 0.2, type: 'triangle' },
  { freq: 880, at: 0.0, dur: 0.4, vol: 0.13, type: 'sine' },
  { freq: 660, at: 0.55, dur: 0.4, vol: 0.2, type: 'triangle' },
  { freq: 880, at: 0.55, dur: 0.4, vol: 0.13, type: 'sine' },
]);
const ringback = render(4.0, [{ freq: 425, at: 0, dur: 1.0, vol: 0.16, type: 'sine' }]);

const dir = path.join(ROOT, 'assets', 'sounds');
fs.writeFileSync(path.join(dir, 'call_ringtone.wav'), wav(ringtone));
fs.writeFileSync(path.join(dir, 'call_ringback.wav'), wav(ringback));
console.log('call_ringtone.wav, call_ringback.wav → assets/sounds');
