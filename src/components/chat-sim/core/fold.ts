// The fold reducer (architecture-v1.md §1: `estado(t) = fold(eventos ≤ t)`).
// T-001: post / draft / flag. T-003 (this pass, same owner): edit/delete/react/pin/unpin/
// receipt/read/views — all mutate a message that already exists (no id to assign, only to
// look up; see types.ts's SimStep comment). A target that isn't found (bad script, or a seek
// window that starts after the mutating frame but somehow missed the post — shouldn't happen
// with a well-formed compile, but fold must stay total) is a no-op, never a throw: pure
// functions of (state, ev) don't get to fail.
//
// `overlay`/`cue` stay no-ops here — `cue` by design ("EMITIDO, no aplicado por el reducer",
// architecture-v1.md §1 clase 5): AudioSink subscribes to the frame stream directly, it never
// lives in SimState. `overlay` has a SimState slot (`overlays`) but no task has claimed populating
// it yet — left as a future extension, not attempted here.

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
    case 'edit': {
      const msg = state.msgs.get(ev.id);
      if (!msg) return state;
      const msgs = new Map(state.msgs);
      msgs.set(ev.id, { ...msg, v: ev.v });
      return { ...state, msgs };
    }
    case 'delete': {
      const msg = state.msgs.get(ev.id);
      if (!msg) return state;
      const msgs = new Map(state.msgs);
      msgs.set(ev.id, { ...msg, deleted: ev.scope });
      return { ...state, msgs };
    }
    case 'react': {
      const msg = state.msgs.get(ev.id);
      if (!msg) return state;
      const reactions = ev.remove
        ? msg.reactions.filter((r) => !(r.by === ev.by && r.emoji === ev.emoji))
        : [...msg.reactions, { emoji: ev.emoji, by: ev.by }];
      const msgs = new Map(state.msgs);
      msgs.set(ev.id, { ...msg, reactions });
      return { ...state, msgs };
    }
    case 'pin':
      return state.msgs.has(ev.id) ? { ...state, pinned: ev.id } : state;
    case 'unpin':
      return state.pinned === ev.id ? { ...state, pinned: null } : state;
    case 'receipt': {
      const msg = state.msgs.get(ev.id);
      if (!msg) return state;
      const msgs = new Map(state.msgs);
      msgs.set(ev.id, { ...msg, receipt: ev.to });
      return { ...state, msgs };
    }
    case 'read': {
      const uptoIdx = state.order.indexOf(ev.upTo);
      if (uptoIdx === -1) return state;
      const msgs = new Map(state.msgs);
      for (let i = 0; i <= uptoIdx; i++) {
        const msg = msgs.get(state.order[i]);
        if (msg && msg.receipt !== 'read' && msg.receipt !== 'failed') {
          msgs.set(msg.id, { ...msg, receipt: 'read' });
        }
      }
      return { ...state, msgs };
    }
    case 'views': {
      const msg = state.msgs.get(ev.id);
      if (!msg) return state;
      const msgs = new Map(state.msgs);
      msgs.set(ev.id, { ...msg, views: ev.n });
      return { ...state, msgs };
    }
    default:
      return state; // overlay / cue — see file header
  }
}
