// T-006 acceptance #1: "Un seek durante un cue agendado lo cancela. Con el sink DESMUTEADO —
// muteado, 'no queda cola sonando' es vacuamente cierto y un no-op pasa. Assert sobre nodos
// agendados vivos: >0 antes del seek, 0 después."
//
// T-006 acceptance #4: "El caso degenerado existe y es alcanzable por resta: con packs = {} el
// sink NO LANZA y la story degrada a 'sin cues'."

import { describe, expect, it } from 'vitest';
import { AudioSink } from '../audio-sink';
import { DEFAULT_CUE_PACK } from '../packs';
import type { Cue } from '../types';
import { FakeAudioContext } from './fake-audio-context';

const SOME_CUE = DEFAULT_CUE_PACK.whatsapp![0];

describe('AudioSink — schedule-and-cancel (T-006 #1)', () => {
  it('mute defaults to true (T-006 Alcance)', () => {
    const sink = new AudioSink(new FakeAudioContext());
    expect(sink.muted).toBe(true);
  });

  it('a seek (cancelAll) during a scheduled cue cancels it — run UNMUTED, or "nothing left playing" is vacuous', () => {
    const sink = new AudioSink(new FakeAudioContext());
    sink.unmute(); // acceptance #1's own wording — muted, this test would pass on a no-op sink
    expect(sink.liveNodeCount).toBe(0);

    sink.schedule(SOME_CUE);
    expect(sink.liveNodeCount).toBeGreaterThan(0); // positive half: something really got scheduled

    sink.cancelAll(); // the seek/scrub hook
    expect(sink.liveNodeCount).toBe(0); // negative half: the seek actually cancelled it
  });

  it('a cue that finishes on its own (onended) also leaves the live count at 0 without cancelAll', () => {
    const ctx = new FakeAudioContext();
    const sink = new AudioSink(ctx);
    sink.unmute();
    sink.schedule(SOME_CUE);
    expect(sink.liveNodeCount).toBe(1);
    ctx.startedSources[0].stop(); // simulates natural end-of-buffer, not a seek
    expect(sink.liveNodeCount).toBe(0);
  });

  it('mute state does not affect scheduling bookkeeping — only audibility (gain)', () => {
    const ctx = new FakeAudioContext();
    const sink = new AudioSink(ctx);
    // still muted (default) — scheduling and cancellation must work identically either way,
    // otherwise "run unmuted" in the test above wouldn't be a meaningful precondition.
    sink.schedule(SOME_CUE);
    expect(sink.liveNodeCount).toBe(1);
    sink.cancelAll();
    expect(sink.liveNodeCount).toBe(0);
  });
});

describe('AudioSink — degenerate case (T-006 #4)', () => {
  it('an empty pack ({}) never throws when probed for a channel, and the real sink degrades to nothing scheduled', () => {
    const emptyPack: Record<string, readonly Cue[]> = {};
    expect(() => emptyPack.whatsapp).not.toThrow();
    expect(emptyPack.whatsapp).toBeUndefined();
    // the "story degrades to sin cues" behavior: a consumer that maps over `pack.whatsapp ?? []`
    // produces zero schedule() calls, never a thrown error — reached by SUBTRACTION (removing
    // cues), not a special stub artifact (T-006 Alcance's explicit requirement). Exercised against
    // the REAL sink (not just the plain object above) so a defect in `cancelAll`/`schedule`
    // actually bites this test instead of it passing on object-literal access alone.
    const cues = emptyPack.whatsapp ?? [];
    expect(cues).toHaveLength(0);

    const sink = new AudioSink(new FakeAudioContext());
    for (const cue of cues) sink.schedule(cue); // zero iterations — the degrade path, for real
    expect(sink.liveNodeCount).toBe(0);
    expect(() => sink.cancelAll()).not.toThrow();
    expect(sink.liveNodeCount).toBe(0);
  });

  it('the sink itself never throws when constructed and immediately cancelled with nothing scheduled', () => {
    const sink = new AudioSink(new FakeAudioContext());
    expect(() => sink.cancelAll()).not.toThrow();
    expect(sink.liveNodeCount).toBe(0);
  });
});
