// seek(tl, t) and stateAtStep(tl, step) — two paths to the same SimState, one keyed by Tick and
// one by frame count. Both pure: same input twice must deep-equal. Binary search / direct index
// resolves the target frame, then the fold resumes from the nearest checkpoint instead of t0 —
// at most CHECKPOINT_INTERVAL frames applied, regardless of how large the script is
// (architecture-v1.md §1: O(log n + 64)). checkpoints[k] = state after exactly
// k*CHECKPOINT_INTERVAL frames (compile.ts), so checkpoints[i >> 6] is always the closest
// snapshot at or before `i`.

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

interface FoldResult {
  readonly state: SimState;
  readonly foldSteps: number; // number of applyEvent() calls actually performed
}

// Shared by seek() (upto resolved by Tick via binary search) and stateAtStep() (upto given
// directly as a frame count) — both just need "fold from the nearest checkpoint up to frame
// index `upto`", they differ only in how `upto` is computed.
function foldFromCheckpoint(tl: Timeline, upto: number): FoldResult {
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

function seekTraced(tl: Timeline, t: Tick): FoldResult {
  return foldFromCheckpoint(tl, upperBound(tl.keys, t));
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

/**
 * Exact frame count applied — the integer step counts frames, NOT a raw Tick
 * (architecture-v1.md §13 #2: "N clases acumuladas" becomes "N frames applied"). Deliberately
 * keyed by frame count instead of going through seek(tl, t): seek resolves by Tick, and two
 * frames with equal jitter-adjusted ticks would make a Tick-keyed step ambiguous — frame count
 * is unambiguous by construction. Promoted from element/chat-sim-element.ts (T-002/T-006) to
 * core/ so app/ (T-007) and element/ read the same implementation instead of a third copy —
 * this cycle's stated problema_real is "tres implementaciones que comparten código copiado, no
 * abstracción".
 */
export function stateAtStep(tl: Timeline, step: number): SimState {
  const upto = Math.max(0, Math.min(step, tl.frames.length));
  return foldFromCheckpoint(tl, upto).state;
}
