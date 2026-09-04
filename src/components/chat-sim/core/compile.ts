// compile(script, opts): Timeline — architecture-v1.md §1 / api-contract.md.
// Pure by lint (invariant 4): no Math.random, Date, fetch, window, document in this file.

import { digestOf } from './digest';
import { rand } from './prng';
import type { CompileOptions, Ev, Frame, SimScript, Tick } from './types';

const JITTER_MS_MAX = 400; // deterministic per-step jitter window, positionally drawn

function stepToEv(step: SimScript[number], id: string, idx: number): Ev {
  switch (step.k) {
    case 'post':
      return { k: 'post', id, step };
    case 'draft':
      return { k: 'draft', idx, chars: step.chars };
    case 'flag':
      return { k: 'flag', key: step.key, value: step.value };
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
    frames.push({ t: clock, ev: stepToEv(step, id, stepIdx) });
  });

  const keys = Int32Array.from(frames.map((f) => f.t));
  const duration: Tick = frames.length > 0 ? frames[frames.length - 1].t : o.t0;
  const digest = digestOf(
    JSON.stringify({ script, seed: o.seed, channel: o.channel, locale: o.locale, tz: o.tz }),
  );

  return {
    t0: o.t0,
    frames,
    keys,
    checkpoints: [], // full checkpointing is T-003 (architecture-v1.md §1, "cada K=64 frames")
    duration,
    digest,
  };
}
