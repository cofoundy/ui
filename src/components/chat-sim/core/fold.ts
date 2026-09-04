// The fold reducer (architecture-v1.md §1: `estado(t) = fold(eventos ≤ t)`).
// T-001 scope: post / draft / flag. edit/delete/react/pin/receipt/read/views/overlay/cue are
// T-003's fold extension (same owner, core/**) — they fall through as no-ops here so the switch
// stays exhaustive-by-design without blocking this task on work that isn't due yet.

import type { Draft, Ev, MsgState, SimState } from './types';

export function initialState(): SimState {
  return {
    msgs: new Map(),
    order: [],
    pinned: null,
    draft: null,
    flags: {},
    overlays: [],
    scrollId: null,
  };
}

export function applyEvent(state: SimState, ev: Ev): SimState {
  switch (ev.k) {
    case 'post': {
      const authored = ev.step;
      const msg: MsgState = {
        id: ev.id,
        by: authored.k === 'post' ? authored.by : '',
        v: 0,
        text: authored.k === 'post' ? authored.text : undefined,
        media: authored.k === 'post' ? authored.media : undefined,
        deleted: null,
        reactions: [],
        receipt: 'queued',
        views: 0,
      };
      const msgs = new Map(state.msgs); // copy-on-write shallow
      msgs.set(ev.id, msg);
      // A post supersedes any pending "typing…" indicator — without this the draft bubble
      // never clears once the message it was drafting actually lands.
      return { ...state, msgs, order: [...state.order, ev.id], scrollId: ev.id, draft: null };
    }
    case 'draft': {
      const draft: Draft = { by: ev.by, chars: ev.chars };
      return { ...state, draft };
    }
    case 'flag':
      return { ...state, flags: { ...state.flags, [ev.key]: ev.value } };
    default:
      return state;
  }
}
