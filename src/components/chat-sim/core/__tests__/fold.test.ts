// Regression tests for two bugs skin found live in the demo (T-001 reactivation):
//   1. A `post` must clear any pending `draft` — otherwise the "typing…" bubble never goes away.
//   2. A `draft` event must carry the actor's identity (`by: ActorId`) — otherwise a group chat
//      can't tell who is typing, and element/'s `data-drafting` attribute renders 'undefined'.
// Each comes with a negative twin: without the fix, the assertion the fix depends on doesn't
// hold, so a reduced implementation cannot pass both halves.

import { describe, expect, it } from 'vitest';
import { applyEvent, initialState } from '../fold';
import type { Ev } from '../types';

describe('applyEvent — draft lifecycle (bug #1)', () => {
  it('a post clears a pending draft', () => {
    const drafting = applyEvent(initialState(), { k: 'draft', by: 'out:ai', chars: 5 });
    expect(drafting.draft).toEqual({ by: 'out:ai', chars: 5 });

    const posted = applyEvent(drafting, {
      k: 'post',
      id: 'm0',
      step: { k: 'post', by: 'out:ai', text: 'hola' },
    });
    expect(posted.draft).toBeNull();
  });

  it('twin: without a following post, the draft stays alive', () => {
    const drafting = applyEvent(initialState(), { k: 'draft', by: 'out:ai', chars: 5 });
    // an unrelated event (flag) must NOT clear the draft — only `post` does
    const stillDrafting = applyEvent(drafting, { k: 'flag', key: 'ai-badge', value: true });
    expect(stillDrafting.draft).toEqual({ by: 'out:ai', chars: 5 });
  });
});

describe('applyEvent — draft actor identity (bug #2)', () => {
  it('preserves the ActorId carried on the draft event, verbatim', () => {
    const state = applyEvent(initialState(), { k: 'draft', by: 'out:human:42', chars: 7 });
    expect(state.draft?.by).toBe('out:human:42');
  });

  it('twin: two different actors drafting produce two distinguishable `by` values', () => {
    const evA: Ev = { k: 'draft', by: 'in', chars: 2 };
    const evB: Ev = { k: 'draft', by: 'out:ai', chars: 2 };
    const stateA = applyEvent(initialState(), evA).draft;
    const stateB = applyEvent(initialState(), evB).draft;
    expect(stateA?.by).not.toBe(stateB?.by);
  });
});
