// sound/audio-sink.ts — schedule-and-cancel Web Audio consumer (architecture-v1.md §1, class 5:
// "cue se emite, no aplicado por el reducer; el AudioSink es suscriptor con schedule-and-cancel
// (guarda los nodos agendados y los frena en cualquier seek). Scrub => mute").
//
// Corrects prior-art defect #3 (finding 03 §4, "un solo GainNode para todas las capas"): every
// layer is already mixed down by synth.ts's `renderCue` into ONE buffer per cue BEFORE it reaches
// here, so there is exactly one source node per SCHEDULED CUE, feeding a shared master gain that
// only ever controls global mute — no per-layer gain starvation, and nothing to leak across cues.
//
// Depends on `AudioContextLike`, a minimal structural subset of the real `AudioContext` (DOM lib
// types, available at compile time per tsconfig's `lib: ["dom", ...]`) — not the real thing, so
// this is testable under plain Node/vitest without any Web Audio polyfill. Real usage passes a
// genuine `new AudioContext()`, which satisfies the interface structurally with no adapter needed.

import { SAMPLE_RATE, renderCue } from './synth';
import type { Cue } from './types';

export interface AudioParamLike {
  value: number;
}

export interface AudioNodeLike {
  connect(destination: AudioNodeLike): AudioNodeLike | void;
}

export interface GainNodeLike extends AudioNodeLike {
  readonly gain: AudioParamLike;
}

export interface AudioBufferLike {
  copyToChannel?(source: Float32Array, channelNumber: number): void;
  getChannelData(channel: number): Float32Array;
}

export interface AudioBufferSourceNodeLike extends AudioNodeLike {
  buffer: AudioBufferLike | null;
  // `addEventListener`, not an `onended` property: the real DOM's `onended` setter type
  // (`(this: AudioScheduledSourceNode, ev: Event) => any`) doesn't structurally match a plain
  // `() => void` as a MUTABLE property (TS checks read+write compatibility for those), which
  // makes a real `AudioContext` fail to satisfy `AudioContextLike`. `addEventListener` is a
  // method, not a property, so normal (looser) method-parameter compatibility applies instead.
  addEventListener(type: 'ended', listener: () => void): void;
  start(when?: number): void;
  stop(when?: number): void;
}

export interface AudioContextLike {
  readonly currentTime: number;
  readonly destination: AudioNodeLike;
  createGain(): GainNodeLike;
  createBufferSource(): AudioBufferSourceNodeLike;
  createBuffer(numberOfChannels: number, length: number, sampleRate: number): AudioBufferLike;
}

export class AudioSink {
  readonly #ctx: AudioContextLike;
  readonly #master: GainNodeLike;
  #muted = true;
  readonly #live = new Set<AudioBufferSourceNodeLike>();

  constructor(ctx: AudioContextLike) {
    this.#ctx = ctx;
    this.#master = ctx.createGain();
    this.#master.gain.value = 0; // muted by default (T-006 Alcance)
    this.#master.connect(ctx.destination);
  }

  get muted(): boolean {
    return this.#muted;
  }

  mute(): void {
    this.#muted = true;
    this.#master.gain.value = 0;
  }

  unmute(): void {
    this.#muted = false;
    this.#master.gain.value = 1;
  }

  /** Currently-scheduled-and-not-yet-ended nodes — the number acceptance #1 asserts >0 before a
   * seek and 0 after. Mute state never affects this count: scheduling/cancellation is a
   * bookkeeping property, audibility is a gain value — conflating them is exactly what makes "no
   * queda cola sonando" vacuously true when muted (T-006 Acceptance #1's own wording). */
  get liveNodeCount(): number {
    return this.#live.size;
  }

  /** Renders `cue` (synth.ts — one mixed-down buffer, layers/gain/repeat already applied) and
   * schedules it at `when` (AudioContext-clock seconds; defaults to "now"). */
  schedule(cue: Cue, when?: number): void {
    const mix = renderCue(cue);
    const buffer = this.#ctx.createBuffer(1, Math.max(1, mix.length), SAMPLE_RATE);
    if (buffer.copyToChannel) buffer.copyToChannel(mix, 0);
    else buffer.getChannelData(0).set(mix);

    const src = this.#ctx.createBufferSource();
    src.buffer = buffer;
    src.connect(this.#master);
    this.#live.add(src);
    src.addEventListener('ended', () => {
      this.#live.delete(src);
    });
    src.start(when ?? this.#ctx.currentTime);
  }

  /** The seek/scrub hook (architecture-v1.md §1, class 5). Stops every currently-live node NOW —
   * not wired to any real Timeline/playhead here: `element/**` is outside T-006's scope.write, so
   * a future integration is what calls this on every seek. Tested directly (acceptance #1). */
  cancelAll(): void {
    for (const node of [...this.#live]) {
      node.stop(0);
      this.#live.delete(node);
    }
  }
}
