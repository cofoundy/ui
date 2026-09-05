// Pure DOM-building layer for <cf-chat-sim> (T-002 [skin], api-contract.md §"Árbol").
//
// Everything here is driven by a `ChannelAdapter` object (core/types.ts, T-001) — never by a
// `channel ===` branch. That is the property T-002 acceptance #6 (B-5) probes: swap the adapter,
// the DOM must change; swap it back, the DOM must match the reference render byte-for-byte.
//
// `by: ActorId` doubles as the group key (adapter-interface-draft.md §groupKey): scripts use
// exactly 'in' | 'out:ai' | 'out:human:<id>', the same three shapes inbox-ai's
// lib/messageGrouping.ts:25 groups by. No separate cast/registry — the id already carries
// direction + sender kind, so nothing here reinvents it.

import type {
  ActorId,
  ChannelAdapter,
  DeliveryState,
  MsgId,
  MsgReaction,
  QuoteStyle,
  SenderKind,
  Tail,
} from '../core/types';

export interface RenderMessage {
  readonly id: MsgId;
  readonly by: ActorId;
  readonly text: string;
  /** Pre-formatted by the caller (Intl, locale/tz-aware) — render.ts never touches Date. */
  readonly atLabel: string;
  readonly receipt: DeliveryState;
  readonly views: number;
  readonly reactions: readonly MsgReaction[];
  readonly editedLabel?: string; // e.g. "Editado" — set when v > 0; label text is caller's call (i18n)
  readonly quote?: { readonly author: string; readonly text: string };
}

export interface GroupFlags {
  readonly tailHere: boolean;
  readonly grouped: boolean; // true = same actor as previous visible message (tight spacing)
}

export function actorDir(by: ActorId): 'in' | 'out' {
  return by === 'in' ? 'in' : 'out';
}

export function actorSenderKind(by: ActorId): SenderKind {
  if (by === 'out:ai') return 'ai';
  if (by.startsWith('out:human:')) return 'human';
  return 'human';
}

/** `by` IS the group key (adapter-interface-draft.md) — nothing to derive. */
export function groupKeyOf(by: ActorId): string {
  return by;
}

/**
 * Streak-aware tail/grouping flags, keyed by `adapter.tail` ('first' of the racha for WhatsApp,
 * 'last' for Telegram/iMessage). No time window — pure actor adjacency, per groupKeyOf.
 */
export function computeGroupFlags(
  order: readonly RenderMessage[],
  tail: Tail,
): Map<MsgId, GroupFlags> {
  const out = new Map<MsgId, GroupFlags>();
  let prevKey: string | null = null;
  let streakStart = 0;

  const closeStreak = (from: number, to: number): void => {
    const tailIdx = tail === 'first' ? from : to;
    for (let i = from; i <= to; i++) {
      const m = order[i];
      out.set(m.id, { tailHere: i === tailIdx, grouped: i !== from });
    }
  };

  order.forEach((m, i) => {
    const key = groupKeyOf(m.by);
    if (key !== prevKey) {
      if (prevKey !== null) closeStreak(streakStart, i - 1);
      streakStart = i;
      prevKey = key;
    }
  });
  if (order.length > 0) closeStreak(streakStart, order.length - 1);

  return out;
}

/**
 * T-011 (core) replaced the flat `receiptGlyph` enum with `ReceiptModel` — glyph and color now
 * come from `adapter.receipt.states[state]`, a plain string pair, not a channel-fixed shape. The
 * hand-drawn tick SVG is worth keeping for visual fidelity (a real WhatsApp/Telegram screenshot
 * shows vector checkmarks, not a raw ✓ glyph rendered in the body font) — so this counts literal
 * '✓' characters in the STATE'S glyph string to decide how many ticks to draw, rather than
 * hardcoding a channel or an old enum value. A glyph with zero '✓' (a clock, a bang, empty) falls
 * through to plain text in `buildReceiptGlyph` below.
 */
function buildTickSvg(ticks: 1 | 2, color: string): SVGSVGElement {
  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '0 0 18 12');
  svg.setAttribute('width', '15');
  svg.setAttribute('height', '10');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '1.7');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  svg.classList.add('cf-receipt');
  svg.style.color = color;

  const p1 = document.createElementNS(NS, 'path');
  p1.setAttribute('d', ticks === 2 ? 'M1 6.7 4.1 9.8 10.2 2.4' : 'M4.5 6.7 7.6 9.8 13.7 2.4');
  svg.appendChild(p1);
  if (ticks === 2) {
    const p2 = document.createElementNS(NS, 'path');
    p2.setAttribute('d', 'M7.6 6.7 10.7 9.8 16.8 2.4');
    svg.appendChild(p2);
  }
  return svg;
}

/**
 * Builds the receipt indicator for one message, or `null` when there's nothing to show: `kind`
 * is 'none', or 'metric' (that's `adapter.counter === 'views'` + `msg.views`'s job — the
 * ReceiptModel's own `states` for a metric channel are a degenerate same-value placeholder per
 * core/__tests__/receipt-model.test.ts, not live data), or `scope: 'last-only'` and this message
 * isn't the streak's tail (`flags.tailHere` — adapter.tail already lands on the same message
 * 'last-only' means, for every channel that could plausibly use it: T-013 telegram-fidelity-fix.md
 * groups Telegram/iMessage tail as 'last').
 */
function buildReceiptGlyph(
  msg: RenderMessage,
  adapter: ChannelAdapter,
  flags: GroupFlags,
): HTMLElement | SVGSVGElement | null {
  const { kind, states, scope } = adapter.receipt;
  if (kind === 'none' || kind === 'metric') return null;
  if (scope === 'last-only' && !flags.tailHere) return null;

  const style = states[msg.receipt];
  const tickCount = (style.glyph.match(/✓/gu) ?? []).length;
  if (kind === 'ticks' && tickCount > 0) {
    return buildTickSvg(Math.min(tickCount, 2) as 1 | 2, style.color);
  }

  const el = document.createElement('span');
  el.className = kind === 'text' ? 'cf-receipt-label' : 'cf-receipt';
  el.style.color = style.color;
  el.textContent = style.glyph;
  return el;
}

/** Time + edited-label + views only. The receipt indicator is built separately by
 * `buildReceiptGlyph` and placed by the caller per `adapter.receipt.placement` — it isn't
 * necessarily "in the stamp" any more (T-011's `below-bubble` case). */
function buildStamp(msg: RenderMessage, adapter: ChannelAdapter): HTMLElement {
  const stamp = document.createElement('span');
  stamp.className = 'cf-stamp';

  if (msg.editedLabel) {
    const edited = document.createElement('em');
    edited.className = 'cf-edited';
    edited.textContent = msg.editedLabel;
    stamp.appendChild(edited);
  }

  const time = document.createElement('span');
  time.className = 'cf-time';
  time.textContent = msg.atLabel;
  stamp.appendChild(time);

  if (adapter.counter === 'views') {
    const views = document.createElement('span');
    views.className = 'cf-views';
    views.textContent = String(msg.views);
    stamp.appendChild(views);
  }

  return stamp;
}

function buildReactions(reactions: readonly MsgReaction[], style: ChannelAdapter['reactions']): HTMLElement {
  const el = document.createElement('span');
  el.className = 'cf-reactions';
  el.dataset.style = style;
  reactions.forEach((r) => {
    const pill = document.createElement('span');
    pill.className = 'cf-reaction';
    pill.textContent = r.emoji;
    el.appendChild(pill);
  });
  return el;
}

function buildQuote(quote: { author: string; text: string }, style: QuoteStyle): HTMLElement {
  const el = document.createElement('span');
  el.className = 'cf-quote';
  el.dataset.style = style;
  const author = document.createElement('b');
  author.className = 'cf-quote-author';
  author.textContent = quote.author;
  const text = document.createElement('span');
  text.className = 'cf-quote-text';
  text.textContent = quote.text;
  el.append(author, text);
  return el;
}

/** Populates an (empty) <li>. Structure is entirely a function of `adapter` — see file header. */
export function populateMessageElement(
  li: HTMLLIElement,
  msg: RenderMessage,
  adapter: ChannelAdapter,
  flags: GroupFlags,
): void {
  // Every call rebuilds from scratch — this runs on every step change during playback (~60/s),
  // and `li` is a cached, reused node (pre-render contract). Without this, repeated calls just
  // APPEND another .cf-bubble as a sibling each time, since element creation below never checks
  // for prior content — confirmed by screenshot: dozens of stacked bubbles inside one <li>.
  li.replaceChildren();

  const dir = actorDir(msg.by);
  li.className = 'cf-msg';
  li.dataset.dir = dir;
  li.dataset.by = msg.by;
  if (flags.tailHere) li.dataset.tail = '';
  else delete li.dataset.tail;
  if (flags.grouped) li.dataset.grouped = '';
  else delete li.dataset.grouped;

  const bubble = document.createElement('span');
  bubble.className = 'cf-bubble';

  if (msg.quote) bubble.appendChild(buildQuote(msg.quote, adapter.quote));

  const text = document.createElement('span');
  text.className = 'cf-text';
  text.textContent = msg.text;
  bubble.appendChild(text);

  const stamp = buildStamp(msg, adapter);
  const receiptEl = dir === 'out' ? buildReceiptGlyph(msg, adapter, flags) : null;
  if (receiptEl && adapter.receipt.placement === 'in-bubble') stamp.appendChild(receiptEl);

  if (adapter.timestamp === 'inside-pad') {
    const pad = document.createElement('span');
    pad.className = 'cf-pad';
    bubble.append(pad, stamp);
  } else if (adapter.timestamp === 'inside-plain') {
    bubble.appendChild(stamp);
  }
  // 'gutter': stamp is NOT appended to the bubble — it becomes a sibling below.

  // T-011 `below-bubble` (iMessage's real shape, not exercised by any adapter this cycle —
  // adapters/** stays WhatsApp/Telegram only, both `in-bubble`): its own sibling, independent of
  // where the TIMESTAMP stamp landed above — the two placements are orthogonal fields now.
  let belowBubbleReceipt: HTMLElement | null = null;
  if (receiptEl && adapter.receipt.placement === 'below-bubble') {
    belowBubbleReceipt = document.createElement('span');
    belowBubbleReceipt.className = 'cf-receipt-below';
    belowBubbleReceipt.appendChild(receiptEl);
  }

  if (msg.reactions.length > 0) {
    const reactionsEl = buildReactions(msg.reactions, adapter.reactions);
    if (adapter.reactions === 'own-row') {
      li.append(bubble);
      if (adapter.timestamp === 'gutter') li.appendChild(stamp);
      if (belowBubbleReceipt) li.appendChild(belowBubbleReceipt);
      li.appendChild(reactionsEl);
      return;
    }
    // overlay-below / overlay-edge: reaction pill anchors to the bubble itself.
    reactionsEl.dataset.style = adapter.reactions;
    bubble.appendChild(reactionsEl);
  }

  li.appendChild(bubble);
  if (adapter.timestamp === 'gutter') li.appendChild(stamp);
  if (belowBubbleReceipt) li.appendChild(belowBubbleReceipt);
}

export function buildMessageElement(
  msg: RenderMessage,
  adapter: ChannelAdapter,
  flags: GroupFlags,
): HTMLLIElement {
  const li = document.createElement('li');
  populateMessageElement(li, msg, adapter, flags);
  return li;
}
