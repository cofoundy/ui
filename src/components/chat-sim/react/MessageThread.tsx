// react/MessageThread.tsx — header + log, the React twin of element/render.ts's DOM builders.
//
// Reuses element/render.ts's PURE helpers (actorDir, actorSenderKind, computeGroupFlags,
// groupKeyOf) instead of re-deriving grouping logic — that IS layout-adjacent logic the
// team-lead flagged not to duplicate, and unlike stateAtStep/draftIntervals (engine.ts) it's
// actually exported. Everything else here (JSX markup) has to exist twice by construction: one
// side builds real DOM nodes with `document.createElement`, the other returns JSX — there's no
// shared building block below "attributes + children" for that gap. What's NOT duplicated is
// which classes/data-attributes/children shape those nodes: every className and data-* below is
// copied verbatim from element/render.ts and element/chat-sim-element.ts so the T-007 acceptance
// #1 cross-check (same DOM at the same step) holds by construction, not by coincidence.
//
// Imports `../element/render` directly (never `../element`/`index.ts` — see engine.ts's header
// comment: the barrel's side effect registers `<cf-chat-sim>` and touches the bare `HTMLElement`
// global, both fatal for a React tree that may render on the server).

import { useLayoutEffect, useMemo, useRef } from 'react';
import type { JSX, RefObject } from 'react';
import type { ChannelAdapter, DeliveryState, MsgReaction, MsgState, QuoteStyle, ReceiptIconId, Tick } from '../core/types';
import { actorDir, actorSenderKind, computeGroupFlags, groupKeyOf } from '../element/render';
import type { GroupFlags, RenderMessage } from '../element/render';
import {
  dateSeparators,
  formatTime,
  fullSequence,
  visibleSequence,
  type SeqItem,
} from './engine';

export { actorSenderKind, groupKeyOf }; // re-exported: consumers that need sender-kind/group-key
// derivation (e.g. a future avatar-by-actor feature) get it from ONE place, not two.

export interface MessageThreadProps {
  readonly finalOrder: readonly string[];
  readonly seq: readonly SeqItem[]; // fullSequence(...) — computed once by the caller (memoized)
  readonly visibleIds: ReadonlySet<string>;
  readonly step: number;
  readonly msgs: ReadonlyMap<string, MsgState>;
  readonly postedAt: ReadonlyMap<string, Tick>;
  readonly adapter: ChannelAdapter;
  readonly locale: string;
  readonly tz: string;
  readonly t0: Tick;
  readonly editedLabel: string;
  readonly contactName: string;
  readonly contactStatus: string;
  /** `mode="live"` only: visitor-sent messages, appended after the compiled thread. Participate
   * in the SAME grouping pass as the compiled messages (actor-adjacency doesn't stop at the
   * seed/live boundary — a visitor's second message right after their first should still tuck
   * in tight, same as any other streak). */
  readonly extraMessages?: readonly RenderMessage[];
  /** `mode="live"` only: forwarded to LiveComposer so it can scroll the log to bottom when the
   * keyboard inset changes (T-007 acceptance #2). */
  readonly logRef?: RefObject<HTMLOListElement | null>;
}

// receipt/**/T-011,T-015,T-016,T-019: glyph + color are adapter data (ReceiptModel.states[state]),
// not a fixed enum -> fixed-icon mapping — WhatsApp keeps one glyph and varies color, Telegram 1:1
// keeps one color and varies glyph, so the renderer stays a pure projection of that data instead
// of branching on channel. T-016 closed core/'s '✓'-in-a-string hack: a `kind:'ticks'` state's
// glyph is now a `ReceiptIconId` (semantics), never a raw Unicode character — so this is an
// exhaustive lookup, not a heuristic on glyph content. Mirrors element/icons.ts +
// element/render.ts's `TICK_ICONS` byte-for-byte (same viewBox/paths/circles, same `Record`
// shape) — [skin]'s T-017 landed the same fix on the DOM side while this task was in flight
// (E-003/E-004's "grep the consumers first" rule finally applied: `channel` caught both
// react/MessageThread.tsx and react/DemoComposer.tsx before a 5th hole opened). WhatsApp/Telegram
// both ship `kind:'ticks'`, so snapshot-cross-check.test.tsx exercises this path for real and any
// divergence from element/icons.ts's shapes fails it outright.
function TickSvg({ ticks, color }: { ticks: 1 | 2; color: string }) {
  return (
    <svg
      viewBox="0 0 18 12"
      width="15"
      height="10"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="cf-receipt"
      style={{ color }}
    >
      <path d={ticks === 2 ? 'M1 6.7 4.1 9.8 10.2 2.4' : 'M4.5 6.7 7.6 9.8 13.7 2.4'} />
      {ticks === 2 && <path d="M7.6 6.7 10.7 9.8 16.8 2.4" />}
    </svg>
  );
}

/** `queued` — mirrors element/icons.ts's `clockIcon` exactly (same viewBox/stroke-width/ring/hand). */
function ClockIcon({ color }: { color: string }) {
  return (
    <svg
      viewBox="0 0 14 14"
      width="12"
      height="12"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.3}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="cf-receipt"
      style={{ color }}
    >
      <circle cx={7} cy={7} r={5.8} />
      <path d="M7 3.8V7l2.6 1.5" />
    </svg>
  );
}

/** `failed` — mirrors element/icons.ts's `alertIcon` exactly (same viewBox/stroke-width/ring/dot). */
function AlertIcon({ color }: { color: string }) {
  return (
    <svg
      viewBox="0 0 14 14"
      width="12"
      height="12"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.3}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="cf-receipt"
      style={{ color }}
    >
      <circle cx={7} cy={7} r={5.8} />
      <path d="M7 4.2V8" />
      <circle cx={7} cy={10.4} r={0.75} fill="currentColor" stroke="none" />
    </svg>
  );
}

// `Record` makes the mapping exhaustive at the type level — adding a 5th `ReceiptIconId` without
// adding it here is a compile error, not a silent fallthrough (same reasoning as element/
// render.ts's `TICK_ICONS`).
const TICK_ICONS: Record<ReceiptIconId, (color: string) => JSX.Element> = {
  clock: (color) => <ClockIcon color={color} />,
  check: (color) => <TickSvg ticks={1} color={color} />,
  'double-check': (color) => <TickSvg ticks={2} color={color} />,
  alert: (color) => <AlertIcon color={color} />,
};

function ReceiptGlyph({
  adapter,
  state,
  flags,
}: {
  adapter: ChannelAdapter;
  state: DeliveryState;
  flags: GroupFlags;
}): JSX.Element | null {
  const model = adapter.receipt;
  if (model.kind === 'none' || model.kind === 'metric') return null; // metric: the views counter IS the receipt (adapter.counter)
  if (model.scope === 'last-only' && !flags.tailHere) return null;

  if (model.kind === 'ticks') {
    const style = model.states[state];
    return TICK_ICONS[style.glyph](style.color);
  }

  // kind === 'text': real content (e.g. iMessage's "Leído 9:41"), not a per-channel icon choice —
  // `glyph` stays a literal string here (core/types.ts's LabelReceiptStateStyle), rendered as text
  // on purpose.
  const style = model.states[state];
  return (
    <span className="cf-receipt-label" style={{ color: style.color }}>
      {style.glyph}
    </span>
  );
}

function Stamp({
  msg,
  adapter,
  inBubbleReceipt,
}: {
  msg: RenderMessage;
  adapter: ChannelAdapter;
  inBubbleReceipt: JSX.Element | null;
}) {
  return (
    <span className="cf-stamp">
      {msg.editedLabel && <em className="cf-edited">{msg.editedLabel}</em>}
      <span className="cf-time">{msg.atLabel}</span>
      {adapter.counter === 'views' && <span className="cf-views">{msg.views}</span>}
      {inBubbleReceipt}
    </span>
  );
}

function Reactions({ reactions, style }: { reactions: readonly MsgReaction[]; style: ChannelAdapter['reactions'] }) {
  return (
    <span className="cf-reactions" data-style={style}>
      {reactions.map((r, i) => (
        // Reaction identity is (emoji, by) per core/fold.ts's react/unreact toggle — not a stable
        // MsgId — so the composite is the correct React key, not an anti-pattern index fallback.
        <span key={`${r.by}:${r.emoji}:${i}`} className="cf-reaction">
          {r.emoji}
        </span>
      ))}
    </span>
  );
}

function Quote({ quote, style }: { quote: { author: string; text: string }; style: QuoteStyle }) {
  return (
    <span className="cf-quote" data-style={style}>
      <b className="cf-quote-author">{quote.author}</b>
      <span className="cf-quote-text">{quote.text}</span>
    </span>
  );
}

function MessageBubble({
  msg,
  adapter,
  flags,
  anchorTop,
}: {
  msg: RenderMessage;
  adapter: ChannelAdapter;
  flags: GroupFlags;
  anchorTop: boolean;
}) {
  const bubbleRef = useRef<HTMLSpanElement>(null);
  const dir = actorDir(msg.by);

  // Mirrors element/chat-sim-element.ts's #measurePad(): the stamp's real measured width sets
  // `--cf-cs-pad` (styles.css's static fallback overlaps/under-gaps depending on receipt glyph
  // width, e.g. 50px vs 31px — same comment, same fix). Re-measured on every render since
  // content driving stamp width (receipt glyph, views counter) can change between steps.
  // Reads via querySelector rather than a second ref so `.cf-stamp` stays the exact same node
  // shape element/render.ts builds — no measurement wrapper spliced into the DOM.
  useLayoutEffect(() => {
    if (adapter.timestamp !== 'inside-pad') return;
    const bubble = bubbleRef.current;
    const stamp = bubble?.querySelector<HTMLElement>('.cf-stamp');
    if (!bubble || !stamp) return;
    bubble.style.setProperty('--cf-cs-pad', `${stamp.offsetWidth + 10}px`);
  });

  const classNames = ['cf-msg', anchorTop ? 'cf-anchor-top' : ''].filter(Boolean).join(' ');
  const dataAttrs: Record<string, string> = { 'data-dir': dir, 'data-by': msg.by };
  if (flags.tailHere) dataAttrs['data-tail'] = '';
  if (flags.grouped) dataAttrs['data-grouped'] = '';

  // receipt is a projection of ReceiptModel (T-011/T-015), never a `dir ===` special-case beyond
  // "only outbound messages carry a delivery receipt" (true across all 4 §F-1 rows) — `kind`
  // and `scope` (via `flags.tailHere`) are ReceiptGlyph's job, mirroring buildReceiptGlyph's own
  // gate order. `placement` gates WHERE the result lands ('in-bubble', inside .cf-stamp, vs
  // 'below-bubble', a sibling of .cf-bubble — nobody ships 'below-bubble' yet, T-015 acceptance
  // #3 exists to prove the shape isn't a promise the renderer can't keep).
  const receiptNode = dir === 'out' ? <ReceiptGlyph adapter={adapter} state={msg.receipt} flags={flags} /> : null;
  const inBubbleReceipt = receiptNode && adapter.receipt.placement === 'in-bubble' ? receiptNode : null;
  const belowBubbleReceipt = receiptNode && adapter.receipt.placement === 'below-bubble' ? receiptNode : null;

  const stamp = <Stamp msg={msg} adapter={adapter} inBubbleReceipt={inBubbleReceipt} />;
  const reactionsEl = msg.reactions.length > 0 ? <Reactions reactions={msg.reactions} style={adapter.reactions} /> : null;
  // NOT `reactionsEl && cond` — `a && b` evaluates to `b` (a boolean) when `a` is truthy, never
  // to `a` itself, so `{reactionsInsideBubble}` rendered `{true}`/`{false}` (nothing) instead of
  // the element (T-010, found by [qa] via the public `<ChatSim>` barrel).
  const reactionsInsideBubble = reactionsEl && adapter.reactions !== 'own-row' ? reactionsEl : null;
  const reactionsOwnRow = reactionsEl && adapter.reactions === 'own-row' ? reactionsEl : null;

  return (
    <li className={classNames} {...dataAttrs}>
      <span className="cf-bubble" ref={bubbleRef}>
        {msg.quote && <Quote quote={msg.quote} style={adapter.quote} />}
        <span className="cf-text">{msg.text}</span>
        {adapter.timestamp === 'inside-pad' && (
          <>
            <span className="cf-pad" />
            {stamp}
          </>
        )}
        {adapter.timestamp === 'inside-plain' && stamp}
        {reactionsInsideBubble}
      </span>
      {adapter.timestamp === 'gutter' && stamp}
      {belowBubbleReceipt && <span className="cf-receipt-below">{belowBubbleReceipt}</span>}
      {reactionsOwnRow}
    </li>
  );
}

function TypingRow({ by, anchorTop }: { by: string; anchorTop: boolean }) {
  const dir = actorDir(by);
  const classNames = ['cf-typing-row', anchorTop ? 'cf-anchor-top' : ''].filter(Boolean).join(' ');
  return (
    <li className={classNames} data-dir={dir}>
      <span className="cf-bubble cf-typing">
        <i />
        <i />
        <i />
      </span>
    </li>
  );
}

function DateSep({ label, anchorTop }: { label: string; anchorTop: boolean }) {
  const classNames = ['cf-date-sep', anchorTop ? 'cf-anchor-top' : ''].filter(Boolean).join(' ');
  return (
    <li className={classNames}>
      <span className="cf-date-pill">{label}</span>
    </li>
  );
}

function toRenderMessage(msg: MsgState, atLabel: string, editedLabel: string): RenderMessage {
  return {
    id: msg.id,
    by: msg.by,
    text: msg.text ?? '',
    atLabel,
    receipt: msg.receipt,
    views: msg.views,
    reactions: msg.reactions,
    editedLabel: msg.v > 0 ? editedLabel : undefined,
  };
}

export function MessageThread(props: MessageThreadProps): JSX.Element {
  const { seq, visibleIds, step, msgs, postedAt, adapter, locale, tz, t0, editedLabel, contactName, contactStatus } = props;
  const extraMessages = props.extraMessages ?? EMPTY_RENDER_MESSAGES;

  const visible = useMemo(() => visibleSequence(seq, visibleIds, step), [seq, visibleIds, step]);

  const compiledMessages: RenderMessage[] = useMemo(
    () =>
      visible
        .filter((it): it is Extract<SeqItem, { kind: 'msg' }> => it.kind === 'msg')
        .map((it) => {
          const m = msgs.get(it.id)!;
          const tick = postedAt.get(it.id) ?? 0;
          return toRenderMessage(m, formatTime(t0, tick, locale, tz), editedLabel);
        }),
    [visible, msgs, postedAt, t0, locale, tz, editedLabel],
  );

  // One grouping pass across compiled + live messages together — actor-adjacency (the input to
  // computeGroupFlags) doesn't know or care where the seed script ends and a visitor's own
  // typing begins.
  const allMessages = useMemo(() => [...compiledMessages, ...extraMessages], [compiledMessages, extraMessages]);
  const flagsByMsgId = useMemo(() => computeGroupFlags(allMessages, adapter.tail), [allMessages, adapter.tail]);
  const rmById = useMemo(() => new Map(allMessages.map((rm) => [rm.id, rm])), [allMessages]);
  const firstItemKey =
    visible.length > 0 ? seqItemKey(visible[0]) : extraMessages.length > 0 ? `msg:${extraMessages[0].id}` : null;

  return (
    <>
      <header className="cf-head">
        <span className="cf-avatar">{contactName.charAt(0).toUpperCase()}</span>
        <span className="cf-who">
          <b>{contactName}</b>
          {contactStatus && <em>{contactStatus}</em>}
        </span>
      </header>
      <ol className="cf-log" ref={props.logRef}>
        {visible.map((item) => {
          const key = seqItemKey(item);
          const anchorTop = key === firstItemKey;
          if (item.kind === 'sep') return <DateSep key={key} label={item.dayLabel} anchorTop={anchorTop} />;
          if (item.kind === 'typing') return <TypingRow key={key} by={item.by} anchorTop={anchorTop} />;
          const rm = rmById.get(item.id)!;
          return <MessageBubble key={item.id} msg={rm} adapter={adapter} flags={flagsByMsgId.get(item.id)!} anchorTop={anchorTop} />;
        })}
        {extraMessages.map((rm) => (
          <MessageBubble
            key={rm.id}
            msg={rm}
            adapter={adapter}
            flags={flagsByMsgId.get(rm.id)!}
            anchorTop={`msg:${rm.id}` === firstItemKey}
          />
        ))}
      </ol>
    </>
  );
}

const EMPTY_RENDER_MESSAGES: readonly RenderMessage[] = [];

function seqItemKey(item: SeqItem): string {
  if (item.kind === 'msg') return `msg:${item.id}`;
  if (item.kind === 'sep') return `sep:${item.key}:${item.triggerId}`;
  return `typing:${item.by}:${item.appearStep}`;
}
