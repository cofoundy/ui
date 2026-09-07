// stateAtStep() and draftIntervals() — promoted from element/chat-sim-element.ts to core/ so
// app/ (T-007) can cross-check acceptance #1 without a third copy of the same fold logic.
// Deliberately imports from the PUBLIC barrel (../../index), not the internal module paths —
// acceptance #1 is "consumible sin importar de element/**", proven here by never touching
// element/ at all, and from '../seek'/'../draft-intervals' directly to also cover the internal
// module boundary.

import { describe, expect, it } from 'vitest';
import * as chatSim from '../../index';
import { draftIntervals } from '../draft-intervals';
import { compile } from '../compile';
import { seek, stateAtStep } from '../seek';
import type { CompileOptions, SimScript } from '../types';

const OPTS: CompileOptions = {
  seed: 11,
  channel: 'whatsapp',
  locale: 'es-PE',
  tz: 'America/Lima',
  t0: 1_700_000_000_000,
};

const SCRIPT: SimScript = [
  { k: 'post', by: 'in', text: 'uno', delayMs: 10 },
  { k: 'draft', by: 'out:ai', chars: 3, delayMs: 20 },
  { k: 'post', by: 'out:ai', text: 'dos', delayMs: 50 },
  { k: 'post', by: 'in', text: 'tres', delayMs: 30 },
];

describe('exported from the public barrel (acceptance #1)', () => {
  it('stateAtStep and draftIntervals are consumable without importing element/**', () => {
    expect(typeof chatSim.stateAtStep).toBe('function');
    expect(typeof chatSim.draftIntervals).toBe('function');
  });
});

describe('stateAtStep(tl, n) vs seek(tl, t) — two paths, same state (acceptance #3)', () => {
  it('coincide for every frame boundary in the script', () => {
    const tl = compile(SCRIPT, OPTS);
    for (let n = 0; n <= tl.frames.length; n++) {
      // Frame.t is relative to t0 (compile.ts), never t0-inclusive — "before all frames" is -1,
      // not tl.t0 - 1 (which would be *after* every frame once t0 is a large real epoch).
      const t = n === 0 ? -1 : tl.frames[n - 1].t;
      expect(stateAtStep(tl, n)).toEqual(seek(tl, t));
    }
  });

  it('twin: they must actually be sensitive to n/t — not both trivially equal by returning the same constant', () => {
    const tl = compile(SCRIPT, OPTS);
    expect(stateAtStep(tl, 0)).not.toEqual(stateAtStep(tl, tl.frames.length));
    expect(seek(tl, -1)).not.toEqual(seek(tl, tl.duration));
  });

  it('clamps out-of-range steps the same way seek clamps out-of-range ticks', () => {
    const tl = compile(SCRIPT, OPTS);
    expect(stateAtStep(tl, -5)).toEqual(stateAtStep(tl, 0));
    expect(stateAtStep(tl, tl.frames.length + 100)).toEqual(stateAtStep(tl, tl.frames.length));
  });
});

describe('draftIntervals()', () => {
  it('finds the one draft window in the script, with correct step bounds and anchor', () => {
    const tl = compile(SCRIPT, OPTS);
    const intervals = draftIntervals(tl);
    expect(intervals).toHaveLength(1);
    expect(intervals[0].by).toBe('out:ai');
    expect(intervals[0].appearStep).toBe(2); // opens after frame 1 (the post) applies
    expect(intervals[0].vanishStep).toBe(3); // closes when frame 2 (the post it stood in for) applies
    expect(intervals[0].afterMsgId).toBe('m0'); // last posted message before the draft opened
  });

  it('twin: a script with no draft events returns no intervals', () => {
    const noDraft: SimScript = [
      { k: 'post', by: 'in', text: 'uno' },
      { k: 'post', by: 'out:ai', text: 'dos' },
    ];
    expect(draftIntervals(compile(noDraft, OPTS))).toEqual([]);
  });

  it('a draft still open at the end of the script closes at frames.length', () => {
    const trailingDraft: SimScript = [
      { k: 'post', by: 'in', text: 'uno' },
      { k: 'draft', by: 'out:ai', chars: 5 },
    ];
    const tl = compile(trailingDraft, OPTS);
    const intervals = draftIntervals(tl);
    expect(intervals).toHaveLength(1);
    expect(intervals[0].vanishStep).toBe(tl.frames.length);
  });
});
