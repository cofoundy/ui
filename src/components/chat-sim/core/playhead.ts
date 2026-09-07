// createPlayhead(tl) — architecture-v1.md §1: rAF accumulating dt*rate, pause stops the
// accumulation, rate is read every tick (reactive, never frozen at mount). No sleep, no
// promises => nothing to cancel.
//
// requestAnimationFrame/cancelAnimationFrame are bare DOM-lib globals, not `window.*` — the
// invariant-4 lint bans `window`/`document`/`fetch`/`Math.random`/`Date`, not the scheduler
// primitive this module exists to drive.

import { seek } from './seek';
import type { SimState, Tick, Timeline } from './types';

export interface Playhead {
  play(): void;
  pause(): void;
  rate(n: number): void;
  onFrame(cb: (state: SimState, t: Tick) => void): () => void;
}

export function createPlayhead(tl: Timeline): Playhead {
  let playing = false;
  let playRate = 1;
  // Frame.t (and Timeline.duration) is relative to t0, not t0-inclusive (compile.ts) — the
  // playhead's virtual clock starts at 0 for the same reason, and `emit()` calls `seek(tl, ·)`
  // with that same relative tick, matching what compile() actually produced.
  let virtualT: Tick = 0;
  let rafId: number | null = null;
  let lastWall: number | null = null;
  const listeners = new Set<(state: SimState, t: Tick) => void>();

  function emit(): void {
    const clamped = Math.min(virtualT, tl.duration);
    const state = seek(tl, clamped);
    listeners.forEach((cb) => cb(state, clamped));
  }

  function tick(wallNow: number): void {
    if (!playing) return;
    if (lastWall !== null) {
      virtualT += (wallNow - lastWall) * playRate;
    }
    lastWall = wallNow;
    emit();
    if (virtualT < tl.duration) {
      rafId = requestAnimationFrame(tick);
    } else {
      playing = false;
      rafId = null;
    }
  }

  return {
    play(): void {
      if (playing) return;
      playing = true;
      lastWall = null;
      rafId = requestAnimationFrame(tick);
    },
    pause(): void {
      playing = false;
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    },
    rate(n: number): void {
      playRate = n;
    },
    onFrame(cb: (state: SimState, t: Tick) => void): () => void {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
  };
}
