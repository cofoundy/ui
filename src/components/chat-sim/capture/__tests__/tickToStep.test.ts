import { describe, expect, it } from 'vitest';
import { compile } from '../../index';
import type { SimScript } from '../../core/types';
import { tickToStep } from '../tickToStep';

const SCRIPT: SimScript = [
  { k: 'post', by: 'in', text: 'a', delayMs: 500 },
  { k: 'draft', by: 'out:ai', chars: 10, delayMs: 300 },
  { k: 'post', by: 'out:ai', text: 'b', delayMs: 400 },
  { k: 'post', by: 'in', text: 'c', delayMs: 900 },
];

function compileFixture(seed: number) {
  return compile(SCRIPT, { seed, channel: 'whatsapp', locale: 'es-PE', tz: 'America/Lima', t0: 0 });
}

/** The reference semantics: element/chat-sim-element.ts's own `play()` conversion
 * (`while (step < frames.length && frames[step].t <= t) step++`). tickToStep must agree with this
 * exactly — that's the whole point of computing a step Node-side instead of letting playback
 * arrive at it. */
function linearReference(tl: ReturnType<typeof compileFixture>, t: number): number {
  let step = 0;
  while (step < tl.frames.length && tl.frames[step].t <= t) step++;
  return step;
}

describe('tickToStep', () => {
  const tl = compileFixture(1);

  it('agrees with the linear reference implementation at every frame boundary and between them', () => {
    const candidateTicks = [
      tl.t0 - 1,
      ...tl.frames.map((f) => f.t),
      ...tl.frames.map((f) => f.t - 1),
      ...tl.frames.map((f) => f.t + 1),
      tl.duration + 1000,
    ];
    for (const t of candidateTicks) {
      expect(tickToStep(tl, t)).toBe(linearReference(tl, t));
    }
  });

  it('is 0 before the first frame and frames.length at/after the last', () => {
    expect(tickToStep(tl, tl.t0 - 1)).toBe(0);
    expect(tickToStep(tl, tl.duration)).toBe(tl.frames.length);
    expect(tickToStep(tl, tl.duration + 1)).toBe(tl.frames.length);
  });

  it('agrees with the reference across many random ticks and seeds (positive twin: a broken '
    + 'binary search would disagree at some boundary, not fail everywhere)', () => {
    for (const seed of [1, 2, 3, 99]) {
      const t = compileFixture(seed);
      for (let i = 0; i < 200; i++) {
        const tick = t.t0 + Math.floor(Math.random() * (t.duration - t.t0 + 20)) - 10;
        expect(tickToStep(t, tick)).toBe(linearReference(t, tick));
      }
    }
  });
});
