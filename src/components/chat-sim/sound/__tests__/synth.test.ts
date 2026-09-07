// T-006 acceptance #3: "Story de audición reproduce ambos canales. Digest PCM del buffer
// renderizado por canal => distinto. 'Suenan distinto' es prosa; el digest es la sonda."

import { describe, expect, it } from 'vitest';
import { pcmDigest, renderPack } from '../synth';
import { DEFAULT_CUE_PACK } from '../packs';
import type { Cue } from '../types';

describe('renderPack + pcmDigest — per-channel distinctness (T-006 #3)', () => {
  it('WhatsApp and Telegram packs digest to DIFFERENT values', () => {
    const wa = pcmDigest(renderPack(DEFAULT_CUE_PACK.whatsapp!));
    const tg = pcmDigest(renderPack(DEFAULT_CUE_PACK.telegram!));
    expect(wa).not.toBe(tg);
  });

  it('positive twin: the SAME pack rendered twice digests identically (determinism, not luck)', () => {
    const a = pcmDigest(renderPack(DEFAULT_CUE_PACK.whatsapp!));
    const b = pcmDigest(renderPack(DEFAULT_CUE_PACK.whatsapp!));
    expect(a).toBe(b);
  });

  it('a single-field mutation (gain) DOES change the digest — the probe is sensitive, not just different-by-luck', () => {
    const base: Cue = DEFAULT_CUE_PACK.whatsapp![0];
    const mutated: Cue = { ...base, gain: base.gain * 0.5 };
    expect(pcmDigest(renderPack([mutated]))).not.toBe(pcmDigest(renderPack([base])));
  });
});

describe('cue-pack scope cap (T-006 Alcance, A-1 — verifiable by reading the delivered data)', () => {
  it('every channel has at most 6 cues', () => {
    for (const cues of Object.values(DEFAULT_CUE_PACK)) {
      expect(cues!.length).toBeLessThanOrEqual(6);
    }
  });

  it('every cue has at most 3 layers', () => {
    for (const cues of Object.values(DEFAULT_CUE_PACK)) {
      for (const cue of cues!) {
        expect(cue.layers.length).toBeLessThanOrEqual(3);
      }
    }
  });
});
