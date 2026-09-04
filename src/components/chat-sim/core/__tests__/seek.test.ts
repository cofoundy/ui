import { describe, expect, it } from 'vitest';
import { compile } from '../compile';
import { seek } from '../seek';
import type { CompileOptions, SimScript } from '../types';

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
});
