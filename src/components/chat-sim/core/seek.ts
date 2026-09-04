// seek(tl, t) — pure: same t twice must deep-equal. Binary search over `keys` for the upper
// bound (O(log n)), then resume the fold from the nearest checkpoint instead of t0 — at most
// CHECKPOINT_INTERVAL frames applied, regardless of how large the script is (architecture-v1.md
// §1: O(log n + 64)). checkpoints[k] = state after exactly k*CHECKPOINT_INTERVAL frames
// (compile.ts), so checkpoints[i >> 6] is always the closest snapshot at or before `i`.

import { CHECKPOINT_INTERVAL } from './compile';
import { applyEvent } from './fold';
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

interface SeekResult {
  readonly state: SimState;
  readonly foldSteps: number; // number of applyEvent() calls this seek actually performed
}

function seekTraced(tl: Timeline, t: Tick): SeekResult {
  const upto = upperBound(tl.keys, t);
  const checkpointIdx = Math.floor(upto / CHECKPOINT_INTERVAL);
  const from = checkpointIdx * CHECKPOINT_INTERVAL;
  let state = tl.checkpoints[checkpointIdx];
  let foldSteps = 0;
  for (let i = from; i < upto; i++) {
    state = applyEvent(state, tl.frames[i].ev);
    foldSteps++;
  }
  return { state, foldSteps };
}

export function seek(tl: Timeline, t: Tick): SimState {
  return seekTraced(tl, t).state;
}

/**
 * Fold-step count for the same seek — exists so T-003 acceptance #3 ("contador de pasos de
 * fold, no reloj") can assert the bound directly instead of inferring it from wall-clock time.
 * Not part of the public firma in api-contract.md; a verification hook, not a new capability.
 */
export function seekFoldSteps(tl: Timeline, t: Tick): number {
  return seekTraced(tl, t).foldSteps;
}
