// react/engine.ts — state-derivation helpers for <ChatSim>, T-007 [app].
//
// `stateAtStep`/`draftIntervals` used to be a flagged duplication of element/'s private helpers
// here (see decision-log/history.jsonl "promote-stateAtStep-draftIntervals") — [core] promoted
// both into `core/seek.ts` / `core/draft-intervals.ts` and re-exports them from the `chat-sim`
// subpath barrel exactly because this file asked for it. Imported from `../index` below, same as
// element/chat-sim-element.ts does for `compile`/`seek`/etc. — one implementation, not two.
//
// `postedAtByMsgId` and the Intl-based formatters (`dayKeyOf`/`dayLabelOf`/`formatTime`) stay
// local: `postedAtByMsgId` is a 4-line lookup not worth promoting, and the formatters use
// `Intl`/`Date` — same as element/chat-sim-element.ts's own comment ("element/ is NOT core/, the
// no-Date lint doesn't apply here"), core/'s purity lint (invariant 4) would reject them.

import { draftIntervals, stateAtStep } from '../index';
import type { DraftInterval } from '../index';
import type { Frame, MsgId, Tick } from '../core/types';

export { draftIntervals, stateAtStep };
export type { DraftInterval };

/** First `post` frame per MsgId -> the Tick to format as that message's displayed time. */
export function postedAtByMsgId(frames: readonly Frame[]): Map<MsgId, Tick> {
  const out = new Map<MsgId, Tick>();
  for (const f of frames) if (f.ev.k === 'post') out.set(f.ev.id, f.t);
  return out;
}

/** Stable day-boundary comparison key — deliberately NOT locale-shown, same reasoning as
 * element/chat-sim-element.ts: reading real-world "today" at view time would make identical
 * (script,seed,channel,locale,tz) render different text depending on the calendar day you
 * open the page, breaking the byte-identical-capture determinism invariant (architecture-v1.md
 * §1 invariant 2 / T-004). */
export function dayKeyOf(t0Epoch: number, tick: Tick, tz: string): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: tz }).format(new Date(t0Epoch + tick));
}

export function dayLabelOf(t0Epoch: number, tick: Tick, locale: string, tz: string): string {
  return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long', timeZone: tz }).format(
    new Date(t0Epoch + tick),
  );
}

export function formatTime(t0Epoch: number, tick: Tick, locale: string, tz: string): string {
  return new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: tz,
  }).format(new Date(t0Epoch + tick));
}

// ---------------------------------------------------------------------------------------------
// Ordered-item assembly — the functional twin of element/chat-sim-element.ts's
// connectedCallback() (pre-render, fixed DOM order) + #reconcile() (hidden-toggling). React has
// no persistent DOM to pre-build, so instead of "build every node once, toggle hidden", this
// computes ONE full potential sequence (independent of `step`) and filters it down to what's
// CURRENTLY VISIBLE at a given step — same eventual on-screen result, functional strategy.
// "Same semantic DOM" (T-007 acceptance #1) is about what's rendered, not the mechanism.
// ---------------------------------------------------------------------------------------------

export interface DateSepEntry {
  readonly triggerId: MsgId;
  readonly dayLabel: string;
  readonly key: string;
}

/** One entry per calendar-day boundary crossed by the script, keyed to the first message of
 * that day (mirrors element/chat-sim-element.ts's date-separator pass over `finalState.order`). */
export function dateSeparators(
  finalOrder: readonly MsgId[],
  postedAt: ReadonlyMap<MsgId, Tick>,
  t0Epoch: number,
  locale: string,
  tz: string,
): DateSepEntry[] {
  const out: DateSepEntry[] = [];
  let lastDayKey: string | null = null;
  for (const id of finalOrder) {
    const tick = postedAt.get(id) ?? 0;
    const key = dayKeyOf(t0Epoch, tick, tz);
    if (key === lastDayKey) continue;
    lastDayKey = key;
    out.push({ triggerId: id, dayLabel: dayLabelOf(t0Epoch, tick, locale, tz), key });
  }
  return out;
}

export type SeqItem =
  | { readonly kind: 'sep'; readonly triggerId: MsgId; readonly dayLabel: string; readonly key: string }
  | { readonly kind: 'typing'; readonly by: string; readonly appearStep: number; readonly vanishStep: number }
  | { readonly kind: 'msg'; readonly id: MsgId };

/** The one full potential order — messages, date separators, typing rows — built once per
 * timeline (step-independent), exactly mirroring the insertion anchors
 * element/chat-sim-element.ts's connectedCallback computes (`insertBefore(sep, msgEl)`,
 * `insertBefore(typingLi, anchorMsgEl)`). Filtering this by current visibility (see
 * `visibleSequence`) reproduces the same on-screen order at any step. */
export function fullSequence(
  finalOrder: readonly MsgId[],
  seps: readonly DateSepEntry[],
  typing: readonly DraftInterval[],
): SeqItem[] {
  const END = Symbol('end');
  const before = new Map<MsgId | typeof END, SeqItem[]>();
  const push = (key: MsgId | typeof END, item: SeqItem): void => {
    const list = before.get(key);
    if (list) list.push(item);
    else before.set(key, [item]);
  };

  for (const sep of seps) {
    push(sep.triggerId, { kind: 'sep', triggerId: sep.triggerId, dayLabel: sep.dayLabel, key: sep.key });
  }
  for (const iv of typing) {
    const anchorIdx = iv.afterMsgId ? finalOrder.indexOf(iv.afterMsgId) + 1 : 0;
    const anchorKey: MsgId | typeof END = anchorIdx < finalOrder.length ? finalOrder[anchorIdx] : END;
    push(anchorKey, { kind: 'typing', by: iv.by, appearStep: iv.appearStep, vanishStep: iv.vanishStep });
  }

  const out: SeqItem[] = [];
  for (const id of finalOrder) {
    out.push(...(before.get(id) ?? []));
    out.push({ kind: 'msg', id });
  }
  out.push(...(before.get(END) ?? []));
  return out;
}

/** Filters `fullSequence()`'s output down to what's actually shown at `step` — a message shows
 * iff it's in the current step's (non-deleted) order; a separator shows iff its trigger message
 * does (never ahead of the message it introduces, same invariant as element/'s #reconcile); a
 * typing row shows iff `step` falls in its `[appearStep, vanishStep)` window. */
export function visibleSequence(
  seq: readonly SeqItem[],
  visibleIds: ReadonlySet<MsgId>,
  step: number,
): SeqItem[] {
  return seq.filter((item) => {
    switch (item.kind) {
      case 'msg':
        return visibleIds.has(item.id);
      case 'sep':
        return visibleIds.has(item.triggerId);
      case 'typing':
        return step >= item.appearStep && step < item.vanishStep;
    }
  });
}
