// tickToStep(tl, t) — the Tick→data-step conversion, computed on the Node side so `captureFrame`
// can jump straight to an exact instant instead of driving `play()` and waiting for the rAF
// playhead to arrive there (T-004 delta from the team-lead: "para posicionar en un t exacto, usa
// seek del core, no esperes a que la reproducción llegue sola").
//
// `data-step` (element/chat-sim-element.ts) is an exact FRAME COUNT, not a Tick — this mirrors
// that file's own `play()` conversion (`while (step < tl.frames.length && tl.frames[step].t <= t)
// step++`) exactly, so a step computed here and one arrived at by letting playback run to the same
// Tick agree by construction. Implemented as a binary search for O(log n) instead of O(n) — same
// shape as core/seek.ts's `upperBound`, but deliberately over `Timeline.frames` (each `Frame.t` is
// a plain `number`), NOT `Timeline.keys`.
//
// BUG FOUND WHILE BUILDING THIS (flagged to [core], not fixed here — core/** is core's W cell,
// capture only has R): `Timeline.keys` is declared `Int32Array` (core/types.ts), but `compile()`
// fills it straight from real epoch-ms Ticks (core/compile.ts: `Int32Array.from(frames.map(f =>
// f.t))`). Any realistic wall-clock `t0` — exactly what demo/index.html, chat-sim-element.ts's own
// default, and this task's contract all use (`Date.UTC(2026, 0, 1, ...)` territory, ~1.767e12) —
// is past Int32's ~2.147e9 ceiling (~24.8 days since epoch) and silently wraps via ToInt32. Two
// consequences, verified directly (not inferred): (1) `keys[i]` no longer equals `frames[i].t` for
// any script whose `t0` is a real date, and (2) core/seek.ts's OWN exported `seek()` — not just a
// helper this file could have avoided — does its binary search over that same corrupted array, so
// `seek(tl, t)` is wrong today for any Timeline built with a realistic `t0`. `core`'s own tests
// evidently pass with small `t0` values (e.g. 0), which never crosses the Int32 boundary and hides
// this. Filed as a task against [core]; this function only had to stop trusting `tl.keys` to route
// around it inside capture/**'s own scope.

import type { Tick, Timeline } from '../core/types';

export function tickToStep(tl: Timeline, t: Tick): number {
  const frames = tl.frames;
  let lo = 0;
  let hi = frames.length;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (frames[mid].t <= t) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}
