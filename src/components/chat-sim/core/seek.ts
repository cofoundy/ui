// seek(tl, t) — pure: same t twice must deep-equal. Binary search over `keys` for the upper
// bound, then fold from t0. T-003 adds checkpoints (architecture-v1.md §1) to bound the fold
// cost at O(log n + 64); T-001 only owns the purity property, not yet the perf bound.

import { applyEvent, initialState } from './fold';
import type { SimState, Tick, Timeline } from './types';

function upperBound(keys: Int32Array, t: Tick): number {
  let lo = 0;
  let hi = keys.length;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (keys[mid] <= t) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

export function seek(tl: Timeline, t: Tick): SimState {
  const upto = upperBound(tl.keys, t);
  let state = initialState();
  for (let i = 0; i < upto; i++) {
    state = applyEvent(state, tl.frames[i].ev);
  }
  return state;
}
