// __tests__/chat-sim/playhead-live-cycle.test.ts — qa's own write cell
// (file-ownership-matrix.md: `src/__tests__/chat-sim/**` is `W` for qa).
//
// core/__tests__/playhead.test.ts (T-001/[core]'s own suite) covers construction,
// onFrame unsubscribe, and pause-before-play — it never calls `.play()` and lets a real
// requestAnimationFrame tick fire, so `tick()`/`emit()`'s bodies (playhead.ts lines 31-47) never
// execute. This drives the full play -> tick -> pause / play -> tick -> completion cycle through
// `createPlayhead`'s PUBLIC API (read-only on `core/**`, same as every other lane) with a
// deterministic rAF stub instead of a real one, so the test doesn't depend on wall-clock timing.

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { compile } from '../../components/chat-sim/core/compile';
import { createPlayhead } from '../../components/chat-sim/core/playhead';
import type { CompileOptions, SimScript } from '../../components/chat-sim/core/types';

const SCRIPT: SimScript = [
  { k: 'post', by: 'in', text: 'uno' },
  { k: 'post', by: 'out:ai', text: 'dos', delayMs: 100 },
];

const OPTS: CompileOptions = { seed: 3, channel: 'whatsapp', locale: 'es-PE', tz: 'America/Lima', t0: 0 };

/** Deterministic rAF stub: queues callbacks, `flush(dtMs)` invokes the pending one with a
 * caller-controlled wall time and returns whether another frame got (re)scheduled. */
function stubRaf() {
  let pending: ((t: number) => void) | null = null;
  let lastEverScheduled: ((t: number) => void) | null = null;
  let now = 0;
  let cancelled = false;
  vi.stubGlobal('requestAnimationFrame', (cb: (t: number) => void) => {
    pending = cb;
    lastEverScheduled = cb;
    cancelled = false;
    return 1;
  });
  vi.stubGlobal('cancelAnimationFrame', () => {
    cancelled = true;
    pending = null;
  });
  return {
    flush(dtMs: number): boolean {
      now += dtMs;
      const cb = pending;
      pending = null;
      if (!cb) return false;
      cb(now);
      return pending !== null; // true iff tick() rescheduled another frame
    },
    get isCancelled() {
      return cancelled;
    },
    /** The last-scheduled callback, kept even across a `cancelAnimationFrame` — real browsers
     * don't guarantee a frame already being dispatched observes a synchronous cancel either.
     * Exists only to drive the race in the "stale tick fires after pause" test below. */
    get lastScheduled() {
      return lastEverScheduled;
    },
  };
}

describe('createPlayhead() — full play/tick/pause/completion cycle', () => {
  let raf: ReturnType<typeof stubRaf>;

  beforeEach(() => {
    raf = stubRaf();
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('play() schedules a frame; the first tick establishes lastWall without advancing virtualT', () => {
    const tl = compile(SCRIPT, OPTS);
    const ph = createPlayhead(tl);
    const frames: number[] = [];
    ph.onFrame((_s, t) => frames.push(t));

    ph.play();
    raf.flush(16); // first tick: lastWall was null, so virtualT stays 0 (playhead.ts's own comment)
    expect(frames).toEqual([0]);
  });

  it('subsequent ticks accumulate wall-delta * rate() — reactive, not frozen at play()', () => {
    const tl = compile(SCRIPT, OPTS);
    const ph = createPlayhead(tl);
    const frames: number[] = [];
    ph.onFrame((_s, t) => frames.push(t));

    ph.play();
    raf.flush(0); // establishes lastWall
    raf.flush(50); // +50ms * rate 1
    ph.rate(2);
    raf.flush(50); // +50ms * rate 2 = +100
    expect(frames).toEqual([0, 50, 150]);
  });

  it('pause() mid-play cancels the scheduled frame and stops future accumulation', () => {
    const tl = compile(SCRIPT, OPTS);
    const ph = createPlayhead(tl);
    const frames: number[] = [];
    ph.onFrame((_s, t) => frames.push(t));

    ph.play();
    raf.flush(0);
    raf.flush(50);
    ph.pause();
    expect(raf.isCancelled).toBe(true);

    // `raf.flush()` itself can't hit tick()'s `if (!playing) return` — my own
    // `cancelAnimationFrame` stub clears `pending`, so `flush` sees nothing queued and never
    // calls `cb` at all. A real browser gives no such guarantee (a frame already being
    // dispatched can still run after a synchronous cancel) — invoking the STALE callback
    // directly (`raf.lastScheduled`, kept regardless of cancellation) reproduces that race.
    raf.lastScheduled?.(99999);
    expect(frames).toEqual([0, 50]); // no third frame — tick()'s early return held
  });

  it('play() while already playing is a no-op (does not reset lastWall or reschedule twice)', () => {
    const tl = compile(SCRIPT, OPTS);
    const ph = createPlayhead(tl);
    const frames: number[] = [];
    ph.onFrame((_s, t) => frames.push(t));

    ph.play();
    raf.flush(0);
    raf.flush(50);
    ph.play(); // already playing — `if (playing) return` — must NOT clear lastWall
    const scheduledAnother = raf.flush(25);
    expect(scheduledAnother).toBe(true);
    expect(frames).toEqual([0, 50, 75]); // 75, not 25 — proves lastWall survived the 2nd play()
  });

  it('reaching tl.duration stops the loop: no further frame is scheduled, playing flips false', () => {
    const tl = compile(SCRIPT, OPTS);
    const ph = createPlayhead(tl);
    const frames: number[] = [];
    ph.onFrame((_s, t) => frames.push(t));

    ph.play();
    raf.flush(0);
    const scheduledMore = raf.flush(tl.duration + 1000); // overshoot past the end, clamped by emit()
    expect(scheduledMore).toBe(false); // tick() took the `else` branch: playing=false, no reschedule
    expect(frames.at(-1)).toBe(tl.duration); // emit() clamps virtualT to tl.duration (Math.min)

    // play() again after natural completion re-arms scheduling (lastWall reset to null) but
    // does NOT reset virtualT — so the very next tick immediately re-completes (virtualT is
    // already >= tl.duration), a real quirk of this playhead, not a test mistake: "replay"
    // is `element/chat-sim-element.ts`'s job (it re-seeks to 0 itself before calling play()).
    ph.play();
    expect(raf.flush(0)).toBe(false);
    expect(frames.at(-1)).toBe(tl.duration);
  });
});
