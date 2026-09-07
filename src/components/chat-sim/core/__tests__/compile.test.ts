import { describe, expect, it } from 'vitest';
import { compile } from '../compile';
import type { CompileOptions, SimScript } from '../types';

const SCRIPT: SimScript = [
  { k: 'draft', by: 'human:1', chars: 12 },
  { k: 'post', by: 'human:1', text: 'hola' },
  { k: 'flag', key: 'wallpaper', value: 'default' },
  { k: 'post', by: 'ai:1', text: 'buenas' },
];

const BASE: CompileOptions = {
  seed: 42,
  channel: 'whatsapp',
  locale: 'es-PE',
  tz: 'America/Lima',
  t0: 0,
};

describe('compile()', () => {
  it('T-001 acceptance #4: duration === frames.at(-1).t, no separate estimator', () => {
    const tl = compile(SCRIPT, BASE);
    expect(tl.duration).toBe(tl.frames[tl.frames.length - 1].t);
  });

  it('T-001 acceptance #3: distinct tz => distinct digest (cross-machine determinism twin)', () => {
    const lima = compile(SCRIPT, { ...BASE, tz: 'America/Lima' });
    const utc = compile(SCRIPT, { ...BASE, tz: 'UTC' });
    expect(lima.digest).not.toBe(utc.digest);
  });

  it('T-001 acceptance #3 (positive twin): same tz => identical digest', () => {
    const a = compile(SCRIPT, { ...BASE, tz: 'America/Lima' });
    const b = compile(SCRIPT, { ...BASE, tz: 'America/Lima' });
    expect(a.digest).toBe(b.digest);
  });

  it('is deterministic end-to-end for identical inputs (frames, keys, duration)', () => {
    const a = compile(SCRIPT, BASE);
    const b = compile(SCRIPT, BASE);
    expect(a.frames).toEqual(b.frames);
    expect(Array.from(a.keys)).toEqual(Array.from(b.keys));
    expect(a.duration).toBe(b.duration);
  });

  it('a different seed changes the frame timing jitter (PRNG is wired, not stubbed)', () => {
    const a = compile(SCRIPT, { ...BASE, seed: 1 });
    const b = compile(SCRIPT, { ...BASE, seed: 2 });
    expect(Array.from(a.keys)).not.toEqual(Array.from(b.keys));
  });

  it('assigns stable, unique MsgIds to post events in script order', () => {
    const tl = compile(SCRIPT, BASE);
    const postIds = tl.frames
      .map((f) => f.ev)
      .filter((ev): ev is Extract<typeof ev, { k: 'post' }> => ev.k === 'post')
      .map((ev) => ev.id);
    expect(new Set(postIds).size).toBe(postIds.length);
    expect(postIds).toEqual(['m0', 'm1']);
  });

  it('keys is exactly frames.map(f => f.t) as an Int32Array', () => {
    const tl = compile(SCRIPT, BASE);
    expect(Array.from(tl.keys)).toEqual(tl.frames.map((f) => f.t));
  });

  it('regression: Frame.t is relative to t0, never t0-inclusive — architecture-v1.md §1 formats with fmt(t0 + f.t, ...)', () => {
    // Found via a promoted-function test using a realistic epoch t0: with t0 folded into
    // Frame.t, keys (an Int32Array) silently overflowed and every seek()/stateAtStep() query
    // returned garbage. Direct regression: the same script compiled at t0:0 and at a large real
    // epoch must produce IDENTICAL frame ticks, duration, and keys — only Timeline.t0 differs.
    const atZero = compile(SCRIPT, { ...BASE, t0: 0 });
    const atRealEpoch = compile(SCRIPT, { ...BASE, t0: 1_700_000_000_000 });
    expect(atRealEpoch.frames.map((f) => f.t)).toEqual(atZero.frames.map((f) => f.t));
    expect(atRealEpoch.duration).toBe(atZero.duration);
    expect(Array.from(atRealEpoch.keys)).toEqual(Array.from(atZero.keys));
    expect(atRealEpoch.t0).toBe(1_700_000_000_000); // t0 itself is still carried, just not folded in
  });

  it('draft events carry the actor id verbatim, not lost/blanked (bug #2)', () => {
    const script: SimScript = [
      { k: 'draft', by: 'in', chars: 3 },
      { k: 'post', by: 'in', text: 'hola' },
      { k: 'draft', by: 'out:ai', chars: 5 },
    ];
    const tl = compile(script, BASE);
    const drafts = tl.frames
      .map((f) => f.ev)
      .filter((ev): ev is Extract<typeof ev, { k: 'draft' }> => ev.k === 'draft');

    expect(drafts).toHaveLength(2);
    expect(drafts[0].by).toBe('in');
    expect(drafts[1].by).toBe('out:ai');
  });
});
