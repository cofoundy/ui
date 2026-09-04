// sound/synth.ts — pure-JS, deterministic PCM synthesis. No AudioContext, no Web Audio node of
// any kind: this is math over Float32Array, which is what makes it runnable in plain Node (the
// digest test, acceptance #3) with ZERO browser polyfill. audio-sink.ts feeds these buffers into
// a real AudioBufferSourceNode for live playback — one synthesis implementation, two consumers,
// so "what you hear" and "what you digest" can never quietly diverge.
//
// Determinism: noise and jitter draw from core's own positional PRNG (`rand`, exported from the
// chat-sim barrel, [core]'s — read-only) seeded from the cue id + layer index, never
// `Math.random`. Same (id, layer index, sample index) => same draw, always — exactly what makes
// "same pack twice => same digest" (T-006 acceptance #3's positive twin) hold.

// Direct file imports, not the '../index' barrel: it re-exports `ChatSim` from `./react`
// (T-007), which would pull React into audition.bundle.js even though nothing here uses it —
// element/chat-sim-element.ts hit this exact problem first (see its own comment).
import { digestOf } from '../core/digest';
import { rand } from '../core/prng';
import type { Cue, CueLayer, Wave } from './types';

export const SAMPLE_RATE = 44100;
const GAP_MS = 150; // silence between cues when concatenated for audition/digest

function seedFromId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return h >>> 0;
}

function waveformAt(wave: Wave, phase: number): number {
  switch (wave) {
    case 'sine':
      return Math.sin(phase);
    case 'square':
      return Math.sin(phase) >= 0 ? 1 : -1;
    case 'triangle':
      return (2 / Math.PI) * Math.asin(Math.sin(phase));
    case 'noise':
      return 0; // handled separately in renderLayer — noise has no periodic phase
  }
}

/** Linear attack, then sustain, then a short fixed release (8ms or less, never longer than what's
 * left) so a layer's cutoff doesn't click. Not part of the schema (architecture-v1.md §7 only
 * names attackMs) — an implementation floor, not a schema field. */
function envelopeAt(i: number, n: number, attackSamples: number): number {
  const releaseSamples = Math.min(attackSamples || Math.round(SAMPLE_RATE * 0.008), n - attackSamples, Math.round(SAMPLE_RATE * 0.008));
  if (attackSamples > 0 && i < attackSamples) return i / attackSamples;
  if (releaseSamples > 0 && i >= n - releaseSamples) return (n - i) / releaseSamples;
  return 1;
}

function sweptFreqAt(freq: CueLayer['freq'], t: number, durSec: number): number {
  if (typeof freq === 'number') return freq;
  const [from, to] = freq;
  return from + (to - from) * Math.min(1, t / durSec);
}

export function renderLayer(layer: CueLayer, cueId: string, layerIndex: number): Float32Array {
  const n = Math.max(1, Math.round((layer.durMs / 1000) * SAMPLE_RATE));
  const attackSamples = Math.round((layer.attackMs / 1000) * SAMPLE_RATE);
  const out = new Float32Array(n);
  const seed = seedFromId(cueId);
  const durSec = layer.durMs / 1000;

  if (layer.wave === 'noise') {
    // one-pole low-pass over white noise — `freq` is the cutoff, i.e. the TEXTURE control
    // (finding 03 §4: Telegram differs by texture, not pitch).
    const cutoff = typeof layer.freq === 'number' ? layer.freq : layer.freq[0];
    const alpha = Math.min(1, (2 * Math.PI * cutoff) / SAMPLE_RATE);
    let prev = 0;
    for (let i = 0; i < n; i++) {
      const white = rand(seed, layerIndex, i) * 2 - 1;
      prev += alpha * (white - prev);
      out[i] = prev * envelopeAt(i, n, attackSamples);
    }
    return out;
  }

  const jitter = layer.jitterHz ? (rand(seed, layerIndex, 0) * 2 - 1) * layer.jitterHz : 0;
  let phase = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    const f = sweptFreqAt(layer.freq, t, durSec) + jitter;
    phase += (2 * Math.PI * f) / SAMPLE_RATE;
    out[i] = waveformAt(layer.wave, phase) * envelopeAt(i, n, attackSamples);
  }
  return out;
}

/** Mixes every layer at its own `startMs` offset, scales by `cue.gain`, repeats `cue.repeat`
 * times (default 1). Soft-clips to [-1, 1] — layers overlapping is a feature (a real "ding" is
 * usually 2-3 stacked partials), not an error case to guard against. */
export function renderCue(cue: Cue): Float32Array {
  const rendered = cue.layers.map((layer, i) => ({
    buf: renderLayer(layer, cue.id, i),
    offset: Math.round((layer.startMs / 1000) * SAMPLE_RATE),
  }));
  const totalLen = rendered.reduce((max, r) => Math.max(max, r.offset + r.buf.length), 1);
  const mix = new Float32Array(totalLen);
  for (const r of rendered) {
    for (let i = 0; i < r.buf.length; i++) mix[r.offset + i] += r.buf[i];
  }
  for (let i = 0; i < mix.length; i++) mix[i] = Math.max(-1, Math.min(1, mix[i] * cue.gain));

  const times = cue.repeat && cue.repeat > 1 ? cue.repeat : 1;
  if (times === 1) return mix;
  const out = new Float32Array(mix.length * times);
  for (let r = 0; r < times; r++) out.set(mix, r * mix.length);
  return out;
}

/** Concatenates every cue in a pack (with a fixed silence gap between) into one buffer — what the
 * audition page plays back-to-back, and what acceptance #3's digest is computed over. */
export function renderPack(cues: readonly Cue[]): Float32Array {
  if (cues.length === 0) return new Float32Array(0);
  const gapSamples = Math.round((GAP_MS / 1000) * SAMPLE_RATE);
  const rendered = cues.map(renderCue);
  const totalLen = rendered.reduce((sum, b) => sum + b.length, 0) + gapSamples * (cues.length - 1);
  const out = new Float32Array(totalLen);
  let cursor = 0;
  rendered.forEach((buf, i) => {
    out.set(buf, cursor);
    cursor += buf.length + (i < rendered.length - 1 ? gapSamples : 0);
  });
  return out;
}

/** T-006 acceptance #3: "digest PCM del buffer renderizado por canal ⇒ distinto. 'Suenan
 * distinto' es prosa; el digest es la sonda." Quantizes to Int16 (16-bit PCM is the standard
 * "CD quality" resolution — plenty for "are these two buffers the same data") and packs each
 * sample into one UTF-16 code unit (offset to stay in the valid, non-surrogate range) before
 * handing the string to core's own `digestOf` — reuses the existing hash instead of writing a
 * second one, and avoids a decimal-string encoding that would be ~5x longer for no benefit. */
export function pcmDigest(buf: Float32Array): string {
  let s = '';
  for (let i = 0; i < buf.length; i++) {
    const clamped = Math.max(-1, Math.min(1, buf[i]));
    const int16 = Math.round(clamped * 32767) + 32768; // -> [0, 65535], safe single code unit
    s += String.fromCharCode(int16);
  }
  return digestOf(s);
}
