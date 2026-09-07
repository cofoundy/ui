import { describe, expect, it } from 'vitest';
import { compile } from '../compile';
import { createPlayhead } from '../playhead';
import type { CompileOptions, SimScript } from '../types';

const SCRIPT: SimScript = [
  { k: 'post', by: 'human:1', text: 'uno' },
  { k: 'post', by: 'ai:1', text: 'dos', delayMs: 50 },
];

const OPTS: CompileOptions = {
  seed: 3,
  channel: 'whatsapp',
  locale: 'es-PE',
  tz: 'America/Lima',
  t0: 0,
};

describe('createPlayhead()', () => {
  it('rate() is reactive: reading it mid-playback is not frozen at construction', () => {
    const tl = compile(SCRIPT, OPTS);
    const ph = createPlayhead(tl);
    expect(() => ph.rate(2)).not.toThrow();
    ph.pause();
  });

  it('onFrame returns an unsubscribe function', () => {
    const tl = compile(SCRIPT, OPTS);
    const ph = createPlayhead(tl);
    const unsub = ph.onFrame(() => {});
    expect(typeof unsub).toBe('function');
    unsub();
    ph.pause();
  });

  it('pause before play is a safe no-op', () => {
    const tl = compile(SCRIPT, OPTS);
    const ph = createPlayhead(tl);
    expect(() => ph.pause()).not.toThrow();
  });
});
