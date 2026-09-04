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

function receiptGlyphLabel(state: DeliveryState): string {
  switch (state) {
    case 'read':
      return 'Leído';
    case 'delivered':
      return 'Entregado';
    case 'sent':
      return 'Enviado';
    case 'failed':
      return 'Fallido';
    case 'queued':
    default:
      return 'En cola';
  }
}

function buildTickSvg(ticks: 1 | 2, read: boolean): SVGSVGElement {
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
  svg.dataset.read = String(read);

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

function buildStamp(msg: RenderMessage, adapter: ChannelAdapter, dir: 'in' | 'out'): HTMLElement {
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

  if (dir === 'out') {
    if (adapter.receiptGlyph === 'trailing-label') {
      const label = document.createElement('span');
      label.className = 'cf-receipt-label';
      label.textContent = receiptGlyphLabel(msg.receipt);
      stamp.appendChild(label);
    } else {
      const ticks = adapter.receiptGlyph === 'double-tick' ? 2 : 1;
      stamp.appendChild(buildTickSvg(ticks, msg.receipt === 'read'));
    }
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

  const stamp = buildStamp(msg, adapter, dir);

  if (adapter.timestamp === 'inside-pad') {
    const pad = document.createElement('span');
    pad.className = 'cf-pad';
    bubble.append(pad, stamp);
  } else if (adapter.timestamp === 'inside-plain') {
    bubble.appendChild(stamp);
  }
  // 'gutter': stamp is NOT appended to the bubble — it becomes a sibling below.

  if (msg.reactions.length > 0) {
    const reactionsEl = buildReactions(msg.reactions, adapter.reactions);
    if (adapter.reactions === 'own-row') {
      li.append(bubble);
      if (adapter.timestamp === 'gutter') li.appendChild(stamp);
      li.appendChild(reactionsEl);
      return;
    }
    // overlay-below / overlay-edge: reaction pill anchors to the bubble itself.
    reactionsEl.dataset.style = adapter.reactions;
    bubble.appendChild(reactionsEl);
  }

  li.appendChild(bubble);
  if (adapter.timestamp === 'gutter') li.appendChild(stamp);
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
