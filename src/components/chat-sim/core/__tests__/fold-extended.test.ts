// T-003 acceptance — edit/delete/react/pin/unpin/receipt/read/views over the fold reducer.
// Unit-level coverage; seek.test.ts (updated) covers the same events through the compile+seek
// pipeline for acceptance #1/#2.

import { describe, expect, it } from 'vitest';
import { applyEvent, initialState } from '../fold';
import type { Ev, MsgState, SimState } from '../types';

function withPostedMessage(id = 'm0'): SimState {
  const post: Ev = { k: 'post', id, step: { k: 'post', by: 'in', text: 'hola' } };
  return applyEvent(initialState(), post);
}

describe('applyEvent — edit', () => {
  it('bumps the message version', () => {
    const state = withPostedMessage();
    const edited = applyEvent(state, { k: 'edit', id: 'm0', v: 1 });
    expect((edited.msgs.get('m0') as MsgState).v).toBe(1);
  });

  it('is a no-op on an unknown id (fold stays total, never throws)', () => {
    const state = withPostedMessage();
    expect(() => applyEvent(state, { k: 'edit', id: 'ghost', v: 1 })).not.toThrow();
    expect(applyEvent(state, { k: 'edit', id: 'ghost', v: 1 })).toEqual(state);
  });
});

describe('applyEvent — delete', () => {
  it('marks the message deleted with the given scope', () => {
    const state = withPostedMessage();
    const deleted = applyEvent(state, { k: 'delete', id: 'm0', scope: 'all' });
    expect((deleted.msgs.get('m0') as MsgState).deleted).toBe('all');
  });
});

describe('applyEvent — react', () => {
  it('adds a reaction', () => {
    const state = withPostedMessage();
    const reacted = applyEvent(state, { k: 'react', id: 'm0', emoji: '👍', by: 'out:ai' });
    expect((reacted.msgs.get('m0') as MsgState).reactions).toEqual([
      { emoji: '👍', by: 'out:ai' },
    ]);
  });

  it('twin: remove:true takes the reaction back off', () => {
    const reacted = applyEvent(withPostedMessage(), {
      k: 'react',
      id: 'm0',
      emoji: '👍',
      by: 'out:ai',
    });
    const removed = applyEvent(reacted, {
      k: 'react',
      id: 'm0',
      emoji: '👍',
      by: 'out:ai',
      remove: true,
    });
    expect((removed.msgs.get('m0') as MsgState).reactions).toEqual([]);
  });
});

describe('applyEvent — pin/unpin', () => {
  it('pins an existing message', () => {
    const pinned = applyEvent(withPostedMessage(), { k: 'pin', id: 'm0' });
    expect(pinned.pinned).toBe('m0');
  });

  it('twin: unpin clears it, and only if it matches the currently pinned id', () => {
    const pinned = applyEvent(withPostedMessage(), { k: 'pin', id: 'm0' });
    const unpinnedOther = applyEvent(pinned, { k: 'unpin', id: 'other' });
    expect(unpinnedOther.pinned).toBe('m0'); // unrelated unpin does nothing
    const unpinned = applyEvent(pinned, { k: 'unpin', id: 'm0' });
    expect(unpinned.pinned).toBeNull();
  });
});

describe('applyEvent — receipt', () => {
  it('sets the delivery state', () => {
    const state = applyEvent(withPostedMessage(), { k: 'receipt', id: 'm0', to: 'delivered' });
    expect((state.msgs.get('m0') as MsgState).receipt).toBe('delivered');
  });
});

describe('applyEvent — read', () => {
  it('marks every message up to and including upTo as read', () => {
    let state = withPostedMessage('m0');
    state = applyEvent(state, {
      k: 'post',
      id: 'm1',
      step: { k: 'post', by: 'in', text: 'dos' },
    });
    state = applyEvent(state, {
      k: 'post',
      id: 'm2',
      step: { k: 'post', by: 'in', text: 'tres' },
    });
    const read = applyEvent(state, { k: 'read', upTo: 'm1' });
    expect((read.msgs.get('m0') as MsgState).receipt).toBe('read');
    expect((read.msgs.get('m1') as MsgState).receipt).toBe('read');
    expect((read.msgs.get('m2') as MsgState).receipt).toBe('queued'); // twin: not yet read
  });
});

describe('applyEvent — views', () => {
  it('sets the view counter', () => {
    const state = applyEvent(withPostedMessage(), { k: 'views', id: 'm0', n: 42 });
    expect((state.msgs.get('m0') as MsgState).views).toBe(42);
  });
});
