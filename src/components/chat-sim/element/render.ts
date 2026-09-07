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
  Json,
  MsgId,
  MsgReaction,
  QuoteStyle,
  ReceiptIconId,
  SenderKind,
  Tail,
} from '../core/types';
import { alertIcon, clockIcon, eyeIcon, tickIcon } from './icons';

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
  /** T-027 A/C/D: verbatim passthrough of `MsgState.media` (core/types.ts's `Json`, already
   * carried by `post`/fold — zero core changes needed). `Json` stays opaque to core by design;
   * `asServiceMedia`/`asCardMedia` below are element/'s OWN reading of a `{ kind: 'service' | 'card', ... }`
   * shape — a convention this file owns, not a core contract. */
  readonly media?: Json;
}

// ---------------------------------------------------------------------------
// service / card (T-027 C/D) — "no es vocabulario de Fovente": WhatsApp's e2e-encryption notice
// and Telegram's unread-divider are both a `service` message with a different variant/text;
// WhatsApp's contact/location cards and a generic AI-authored brief are both a `card`. Both ride
// the ordinary `post` event (by/text/media) — no new SimStep/Ev variant, so this stays inside
// element/**'s scope.write. `by` still participates in computeGroupFlags (a service/card message
// legitimately breaks a same-actor streak, same as it would in a real thread) but neither kind
// reads `flags`/`adapter.tail`/receipt/quote/reactions — those are per-bubble concerns and these
// two render centered/full-width, not as a directional bubble.
// ---------------------------------------------------------------------------

export type ServiceVariant = 'neutral' | 'warn' | 'success';

export interface ServiceMedia {
  readonly kind: 'service';
  readonly variant: ServiceVariant;
}

export interface CardMedia {
  readonly kind: 'card';
  readonly bullets: readonly string[];
  readonly action?: string;
}

function isJsonRecord(v: Json | undefined): v is { readonly [key: string]: Json } {
  return !!v && typeof v === 'object' && !Array.isArray(v);
}

export function asServiceMedia(media: Json | undefined): ServiceMedia | null {
  if (!isJsonRecord(media) || media.kind !== 'service') return null;
  const v = media.variant;
  const variant: ServiceVariant = v === 'warn' || v === 'success' ? v : 'neutral';
  return { kind: 'service', variant };
}

export function asCardMedia(media: Json | undefined): CardMedia | null {
  if (!isJsonRecord(media) || media.kind !== 'card') return null;
  const bullets = Array.isArray(media.bullets)
    ? media.bullets.filter((b): b is string => typeof b === 'string')
    : [];
  const action = typeof media.action === 'string' ? media.action : undefined;
  return { kind: 'card', bullets, action };
}

/** Centered pill, `data-variant`-styled (styles.css) — the SAME primitive `.cf-date-pill`
 * already is (team-lead: "ya renderizamos uno"), generalized past dates: WhatsApp's e2e notice,
 * Telegram's unread divider, Fovente's `stop`/`done`, all one shape with 3 tones. */
function populateServiceElement(li: HTMLLIElement, msg: RenderMessage, service: ServiceMedia): void {
  li.className = 'cf-msg cf-msg-service';
  delete li.dataset.dir;
  delete li.dataset.by;
  delete li.dataset.tail;
  delete li.dataset.grouped;
  li.dataset.variant = service.variant;
  li.setAttribute('aria-label', 'Mensaje del sistema');

  const pill = document.createElement('span');
  pill.className = 'cf-service-pill';
  pill.textContent = msg.text;
  li.appendChild(pill);
}

/** Full-width structured card (WhatsApp's contact/location cards, Fovente's `brief`). The
 * accent treatment keys off `adapter.quote` (color-bar / thin-bar / stacked-bubble) — the SAME
 * 16-field structural fact WhatsApp/Telegram already diverge on for quoted replies — instead of
 * a new field or a `channel ===` branch (acceptance #3: "estructura por adapter, no hardcodeada"). */
function populateCardElement(li: HTMLLIElement, msg: RenderMessage, adapter: ChannelAdapter, card: CardMedia): void {
  li.className = 'cf-msg cf-msg-card';
  delete li.dataset.dir;
  delete li.dataset.by;
  delete li.dataset.tail;
  delete li.dataset.grouped;
  li.dataset.quoteStyle = adapter.quote;
  li.setAttribute('aria-label', 'Tarjeta');

  const cardEl = document.createElement('span');
  cardEl.className = 'cf-card';

  const title = document.createElement('b');
  title.className = 'cf-card-title';
  title.textContent = msg.text;
  cardEl.appendChild(title);

  card.bullets.forEach((b) => {
    const bl = document.createElement('span');
    bl.className = 'cf-card-bullet';
    bl.textContent = b;
    cardEl.appendChild(bl);
  });

  if (card.action) {
    const act = document.createElement('span');
    act.className = 'cf-card-action';
    act.textContent = card.action;
    cardEl.appendChild(act);
  }

  li.appendChild(cardEl);
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
 * T-016 closed the last thing here that could vary per machine: a `kind: 'ticks'` state's glyph
 * is a `ReceiptIconId` (semantics — 'clock' | 'check' | 'double-check' | 'alert'), never a raw
 * Unicode character, so this is a plain lookup instead of a heuristic on glyph content. `Record`
 * makes the mapping exhaustive at the type level — adding a 5th `ReceiptIconId` without adding it
 * here is a compile error, not a silent fallthrough.
 */
const TICK_ICONS: Record<ReceiptIconId, (color: string) => SVGSVGElement> = {
  clock: clockIcon,
  check: (color) => tickIcon(1, color),
  'double-check': (color) => tickIcon(2, color),
  alert: alertIcon,
};

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
  const model = adapter.receipt;
  if (model.kind === 'none' || model.kind === 'metric') return null;
  if (model.scope === 'last-only' && !flags.tailHere) return null;

  if (model.kind === 'ticks') {
    const style = model.states[msg.receipt];
    return TICK_ICONS[style.glyph](style.color);
  }

  // kind === 'text': real content (e.g. iMessage's "Leído 9:41"), not a per-channel icon choice —
  // `glyph` stays a literal string here (types.ts:58-61), rendered as text on purpose.
  const style = model.states[msg.receipt];
  const el = document.createElement('span');
  el.className = 'cf-receipt-label';
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
    // Was CSS `content: '👁 '` (styles.css) — same cross-machine font-glyph problem as the
    // receipt icons above, fixed the same way: a drawn SVG instead of a character.
    views.appendChild(eyeIcon());
    views.appendChild(document.createTextNode(String(msg.views)));
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

  const service = asServiceMedia(msg.media);
  if (service) {
    populateServiceElement(li, msg, service);
    return;
  }
  const card = asCardMedia(msg.media);
  if (card) {
    populateCardElement(li, msg, adapter, card);
    return;
  }

  const dir = actorDir(msg.by);
  li.className = 'cf-msg';
  // T-024 §E: the sender today only lives in `data-dir` — invisible to screen readers.
  li.setAttribute('aria-label', dir === 'out' ? 'Mensaje enviado' : 'Mensaje recibido');
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
