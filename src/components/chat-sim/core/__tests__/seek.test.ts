import { describe, expect, it } from 'vitest';
import { CHECKPOINT_INTERVAL, compile } from '../compile';
import { seek, seekFoldSteps } from '../seek';
import type { CompileOptions, SimScript, SimStep } from '../types';

const SCRIPT: SimScript = [
  { k: 'post', by: 'human:1', text: 'uno' },
  { k: 'post', by: 'human:1', text: 'dos' },
  { k: 'post', by: 'ai:1', text: 'tres' },
];

const OPTS: CompileOptions = {
  seed: 7,
  channel: 'whatsapp',
  locale: 'es-PE',
  tz: 'America/Lima',
  t0: 0,
};

describe('seek()', () => {
  it('T-001 acceptance #2: seek(tl, t) twice at the same t is deep-equal', () => {
    const tl = compile(SCRIPT, OPTS);
    const t = tl.frames[1].t;
    expect(seek(tl, t)).toEqual(seek(tl, t));
  });

  it('accumulates posted messages in order as t advances', () => {
    const tl = compile(SCRIPT, OPTS);
    const before = seek(tl, -1);
    expect(before.order).toEqual([]);

    const afterAll = seek(tl, tl.duration);
    expect(afterAll.order).toEqual(['m0', 'm1', 'm2']);
  });

  it('is a pure function of (tl, t) — never mutates the Timeline or its frames', () => {
    const tl = compile(SCRIPT, OPTS);
    const framesSnapshot = JSON.parse(JSON.stringify(tl.frames));
    seek(tl, tl.duration);
    seek(tl, 0);
    expect(JSON.parse(JSON.stringify(tl.frames))).toEqual(framesSnapshot);
  });

  it('T-003 acceptance #1 anti-aliasing twin: two t values landing on different frames give different states', () => {
    // "t and t+1" only means something if a frame boundary actually sits between them; jitter
    // makes literal +1ms unreliable, so anchor on two real, adjacent frame boundaries instead —
    // same property (a seek that always returns the same state would fail this either way).
    const tl = compile(SCRIPT, OPTS);
    const t = tl.frames[1].t;
    const tNextFrame = tl.frames[2].t;
    expect(tNextFrame).toBeGreaterThan(t);
    expect(seek(tl, t)).not.toEqual(seek(tl, tNextFrame));
  });

  it('T-003 acceptance #2: a react on an already-posted message shows up after seeking past it, and its negative twin (seek before the react) does not see it', () => {
    const script: SimScript = [
      { k: 'post', by: 'in', text: 'hola' },
      { k: 'react', id: 'm0', emoji: '👍', by: 'out:ai', delayMs: 100 },
    ];
    const tl = compile(script, OPTS);
    const reactFrameT = tl.frames[1].t;

    const after = seek(tl, reactFrameT);
    expect(after.msgs.get('m0')?.reactions).toEqual([{ emoji: '👍', by: 'out:ai' }]);

    // negative twin: seeking to a t STRICTLY BEFORE the react frame must not see it — otherwise
    // a fold that never removes/never distinguishes state would pass the line above too.
    const before = seek(tl, reactFrameT - 1);
    expect(before.msgs.get('m0')?.reactions).toEqual([]);
  });
});

describe('seek() — checkpointed fold cost (T-003 acceptance #3, contador de pasos, no reloj)', () => {
  function scriptOfSize(n: number): SimScript {
    const steps: SimStep[] = [];
    for (let i = 0; i < n; i++) {
      steps.push({ k: 'post', by: i % 2 === 0 ? 'in' : 'out:ai', text: `m${i}`, delayMs: 1 });
    }
    return steps;
  }

  it('never performs more than CHECKPOINT_INTERVAL fold steps for a single seek, regardless of script size', () => {
    for (const n of [10, 500, 5000]) {
      const tl = compile(scriptOfSize(n), OPTS);
      const steps = seekFoldSteps(tl, tl.duration);
      expect(steps).toBeLessThanOrEqual(CHECKPOINT_INTERVAL);
    }
  });

  it('scaling twin: seeking near the end of a 500-step and a 5000-step script costs the same fold steps — no linear growth', () => {
    const small = compile(scriptOfSize(500), OPTS);
    const large = compile(scriptOfSize(5000), OPTS);
    const smallSteps = seekFoldSteps(small, small.duration);
    const largeSteps = seekFoldSteps(large, large.duration);
    // A linear-fold-with-no-checkpoints implementation would make largeSteps ~10x smallSteps
    // (5000 vs 500 total events applied from scratch). With checkpoints, both are bounded by
    // the same small constant — that's the property under test, not a specific step count.
    expect(largeSteps).toBeLessThanOrEqual(CHECKPOINT_INTERVAL);
    expect(smallSteps).toBeLessThanOrEqual(CHECKPOINT_INTERVAL);
    expect(Math.abs(largeSteps - smallSteps)).toBeLessThan(CHECKPOINT_INTERVAL);
  });

  it('checkpoints array grows with n/CHECKPOINT_INTERVAL, not with n directly staying tiny', () => {
    const tl = compile(scriptOfSize(5000), OPTS);
    expect(tl.checkpoints.length).toBe(Math.floor(5000 / CHECKPOINT_INTERVAL) + 1);
  });
});
