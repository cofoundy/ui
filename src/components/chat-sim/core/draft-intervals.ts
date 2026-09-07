// draftIntervals(tl) — one forward fold pass computing every `state.draft` active window,
// generically: it asks "when was `draft` non-null" rather than hardcoding "drafts end at the
// next post", so it keeps working however fold.ts's clearing rule evolves. Promoted from
// element/chat-sim-element.ts (T-002/T-006) to core/ so app/ (T-007) and element/ read the same
// implementation instead of a third copy — this cycle's stated problema_real is "tres
// implementaciones que comparten código copiado, no abstracción".
//
// Pure data only — no DOM/element-specific fields (e.g. element/'s own `li: HTMLLIElement`
// bookkeeping stays local to element/, layered on top of this).

import { applyEvent, initialState } from './fold';
import type { ActorId, MsgId, Timeline } from './types';

export interface DraftInterval {
  readonly by: ActorId;
  readonly appearStep: number;
  readonly vanishStep: number;
  /** The last posted MsgId strictly before this window opens, or `null` if the draft opens
   * before any message has posted. */
  readonly afterMsgId: MsgId | null;
}

export function draftIntervals(tl: Timeline): readonly DraftInterval[] {
  const out: DraftInterval[] = [];
  let state = initialState();
  let openSince: number | null = null;
  let openBy: ActorId = '';
  let openAfter: MsgId | null = null;
  let lastMsgId: MsgId | null = null;

  for (let i = 0; i < tl.frames.length; i++) {
    const ev = tl.frames[i].ev;
    const wasOpen = state.draft !== null;
    state = applyEvent(state, ev);
    const step = i + 1;
    if (!wasOpen && state.draft) {
      openSince = step;
      openBy = state.draft.by;
      openAfter = lastMsgId;
    } else if (wasOpen && !state.draft) {
      out.push({ by: openBy, appearStep: openSince as number, vanishStep: step, afterMsgId: openAfter });
      openSince = null;
    }
    if (ev.k === 'post') lastMsgId = ev.id;
  }
  if (openSince !== null) {
    out.push({ by: openBy, appearStep: openSince, vanishStep: tl.frames.length, afterMsgId: openAfter });
  }
  return out;
}
