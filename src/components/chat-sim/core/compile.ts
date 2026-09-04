// compile(script, opts): Timeline — architecture-v1.md §1 / api-contract.md.
// Pure by lint (invariant 4): no Math.random, Date, fetch, window, document in this file.

import { digestOf } from './digest';
import { applyEvent, initialState } from './fold';
import { rand } from './prng';
import type { CompileOptions, Ev, Frame, SimScript, SimState, Tick } from './types';

const JITTER_MS_MAX = 400; // deterministic per-step jitter window, positionally drawn
export const CHECKPOINT_INTERVAL = 64; // architecture-v1.md §1: snapshot cada K=64 frames

// `by: ActorId` is the currency every consumer already uses (element/'s group-key model, T-002)
// — the draft event carries it verbatim, same as post/react do. No index/registry indirection.
// edit/delete/react/pin/unpin/receipt/read/views (T-003) target an already-assigned MsgId —
// the SimStep variant is structurally identical to its Ev counterpart, so this is a passthrough.
function stepToEv(step: SimScript[number], id: string): Ev {
  switch (step.k) {
    case 'post':
      return { k: 'post', id, step };
    case 'draft':
      return { k: 'draft', by: step.by, chars: step.chars };
    case 'flag':
      return { k: 'flag', key: step.key, value: step.value };
    case 'edit':
      return { k: 'edit', id: step.id, v: step.v };
    case 'delete':
      return { k: 'delete', id: step.id, scope: step.scope };
    case 'react':
      return { k: 'react', id: step.id, emoji: step.emoji, by: step.by, remove: step.remove };
    case 'pin':
    case 'unpin':
      return { k: step.k, id: step.id };
    case 'receipt':
      return { k: 'receipt', id: step.id, to: step.to };
    case 'read':
      return { k: 'read', upTo: step.upTo };
    case 'views':
      return { k: 'views', id: step.id, n: step.n };
  }
}

export function compile(script: SimScript, o: CompileOptions): import('./types').Timeline {
  const frames: Frame[] = [];
  let clock: Tick = o.t0;
  let nextMsgId = 0;

  script.forEach((step, stepIdx) => {
    const jitter = Math.floor(rand(o.seed, stepIdx, 0) * JITTER_MS_MAX);
    clock += (step.delayMs ?? 0) + jitter;

    const id = step.k === 'post' ? `m${nextMsgId++}` : '';
    frames.push({ t: clock, ev: stepToEv(step, id) });
  });

  const keys = Int32Array.from(frames.map((f) => f.t));
  const duration: Tick = frames.length > 0 ? frames[frames.length - 1].t : o.t0;
  const digest = digestOf(
    JSON.stringify({ script, seed: o.seed, channel: o.channel, locale: o.locale, tz: o.tz }),
  );

  // checkpoints[k] = state after exactly k*CHECKPOINT_INTERVAL frames applied (checkpoints[0] is
  // the initial/empty state). seek() reads checkpoints[i >> 6] and folds only the remainder
  // (< CHECKPOINT_INTERVAL frames) — O(log n + 64) instead of O(n).
  const checkpoints: SimState[] = [initialState()];
  let state = checkpoints[0];
  for (let idx = 0; idx < frames.length; idx++) {
    state = applyEvent(state, frames[idx].ev);
    if ((idx + 1) % CHECKPOINT_INTERVAL === 0) checkpoints.push(state);
  }

  return {
    t0: o.t0,
    frames,
    keys,
    checkpoints,
    duration,
    digest,
  };
}
