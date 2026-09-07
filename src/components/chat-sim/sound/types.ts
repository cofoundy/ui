// sound/ — declarative cue-pack schema (T-006, [skin], architecture-v1.md §7 / §10).
//
// Corrects the four soldered defects the prior art diagnosis names
// (.cofoundy/specs/research-findings/03-capabilities-y-fracturas-de-canal.md §4):
//   1. taxonomy was a single global union      -> CuePack is keyed PER CHANNEL
//   2. wave was soldered to sine               -> `Wave` includes 'noise' (texture, not pitch)
//   3. one GainNode for every layer            -> audio-sink.ts gives each LAYER its own gain node
//   4. no cancellation handle                  -> audio-sink.ts's AudioSink tracks + cancels nodes
//
// `ChannelId`/`SoundId` are core/types.ts's (T-001) — read, not forked.

import type { ChannelId, SoundId } from '../core/types';

export type Wave = 'sine' | 'square' | 'triangle' | 'noise';

export interface CueLayer {
  /** A fixed pitch (Hz), or a `[from, to]` linear sweep over the layer's duration. For `wave:
   * 'noise'`, this is the one-pole low-pass cutoff (Hz) that gives noise its TEXTURE — the
   * property finding 03 §4 names as what actually distinguishes Telegram from WhatsApp, not
   * frequency. Never optional: a slot that isn't meaningfully tunable still gets an explicit
   * value (adapter-interface-draft.md's "cero opcionales" convention, applied here to audio). */
  readonly freq: number | readonly [number, number];
  readonly startMs: number;
  readonly durMs: number;
  /** Random pitch detune amount (Hz), seeded per (cue, layer index) — omit for zero jitter. The
   * one genuinely optional field in the schema (architecture-v1.md §7 marks it `jitterHz?`). */
  readonly jitterHz?: number;
  readonly wave: Wave;
  /** Linear fade-in over this many ms at the start of the layer. */
  readonly attackMs: number;
}

export interface Cue {
  readonly id: SoundId;
  /** ≤3 (T-006's scope cap, verified by a test — see cap.test.ts, not the type). */
  readonly layers: readonly CueLayer[];
  /** 0..1 master gain for this cue, applied after all layers mix. */
  readonly gain: number;
  /** Times to repeat the whole cue back-to-back — omit or 1 for "once". */
  readonly repeat?: number;
}

/** ≤6 cues per channel (T-006's scope cap). `imessage` is intentionally absent — no iMessage
 * adapter or cue authoring is in this cycle's scope (only its ChannelId + CSS token are); an
 * empty/missing channel key is exactly the degenerate case acceptance #4 requires the sink to
 * survive, reached by resta rather than special-cased. */
export type CuePack = Readonly<Partial<Record<ChannelId, readonly Cue[]>>>;
