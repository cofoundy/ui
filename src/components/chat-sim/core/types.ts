// chat-sim — core type contract (api-contract.md § "Tipos núcleo — core/types.ts [core]")
// core/ is pure by lint (invariant 4, T-001 acceptance #6): no Math.random, Date, fetch, window,
// document. This file is types-only — it has zero runtime code and zero imports, so it cannot
// be the source of a cycle (adapters -> core is the only legal direction, api-contract.md §"Árbol").

export type Tick = number; // integer virtual ms since t0
export type MsgId = string; // stable, assigned in compile()
export type ActorId = string;
export type SoundId = string;

export type Json =
  | string
  | number
  | boolean
  | null
  | readonly Json[]
  | { readonly [key: string]: Json };

export type ChannelId = 'whatsapp' | 'telegram' | 'imessage';

export type DeliveryState = 'queued' | 'sent' | 'delivered' | 'read' | 'failed';

// ---------------------------------------------------------------------------
// ChannelAdapter — the 17 fields from adapter-interface-draft.md + T-029's `capabilities`.
// Cero opcionales: a slot that isn't used gets an explicit "none"/"—"-equivalent value, never `?`.
// Values (whatsapp.ts, telegram.ts, imessage.ts, registry.ts) are T-005 [channel].
// ---------------------------------------------------------------------------

export type Tail = 'first' | 'last';
export type Wallpaper = 'pattern' | 'none';
export type ReactionStyle = 'overlay-below' | 'own-row' | 'overlay-edge';

// ---------------------------------------------------------------------------
// Receipt model (T-011, telegram-fidelity-fix.md §F-1). Replaces the old
// `receiptGlyph: 'double-tick'|'single-tick'|'trailing-label'`, which assumed a glyph fixed per
// channel with the delivery state varying some other way. False on all 3 real channels: WhatsApp
// varies COLOR (glyph fixed), Telegram 1:1/group varies GLYPH (color fixed), Telegram broadcast
// channels have no ticks at all (a view METRIC instead), and iMessage uses TEXT placed below the
// bubble and only on the last message of a run — none of which the old flat enum could carry.
// ---------------------------------------------------------------------------

export type ReceiptKind = 'ticks' | 'metric' | 'text' | 'none';
export type ReceiptPlacement = 'in-bubble' | 'below-bubble';
export type ReceiptScope = 'every' | 'last-only';

// ---------------------------------------------------------------------------
// Receipt icon semantics (T-016 — operator, reading the render, asked why there were emoji).
// `glyph: string` let a `kind: 'ticks'` state bake a raw Unicode character ('🕐', '✓') straight
// into ReceiptStateStyle. An emoji/dingbat renders via the OS's own font (Apple Color Emoji,
// Segoe UI Emoji, Noto) — two machines give two different pixel grids for the SAME state, so the
// capture pipeline's byte-identical-PNG guarantee (capture/__tests__/determinism.test.ts) only
// ever held on the one machine it ran on. Same failure class as the `tz` gap that caught the
// earlier refute-pass: true locally, false crossing machines.
//
// `glyph: ReceiptIconId` closes that: the adapter declares WHICH icon (semantics), the renderer
// owns HOW it draws (pixels) — SVG, not a font glyph.
//
// Scoped to `kind: 'ticks'` only. `metric`/`text` states hold real content a 4-value tick enum
// can't express (a view-counter icon, a localized label like "Leído") and isn't this bug either
// way — that content isn't a per-channel glyph choice, it's the thing being displayed. They keep
// `glyph: string`.
// ---------------------------------------------------------------------------

export type ReceiptIconId = 'clock' | 'check' | 'double-check' | 'alert';

export interface TickReceiptStateStyle {
  readonly glyph: ReceiptIconId;
  readonly color: string;
}

export interface LabelReceiptStateStyle {
  readonly glyph: string; // literal content: a metric icon or a localized label — cero opcionales
  readonly color: string;
}

/** Cero opcionales: every DeliveryState gets an explicit style even when `kind` doesn't vary
 * by state (e.g. `metric`/`none`) — same convention as `allowlistSize: 0 when emoji === 'any'`. */
export interface TicksReceiptModel {
  readonly kind: 'ticks';
  readonly states: Readonly<Record<DeliveryState, TickReceiptStateStyle>>;
  readonly placement: ReceiptPlacement;
  readonly scope: ReceiptScope;
}

export interface LabelReceiptModel {
  readonly kind: 'metric' | 'text' | 'none';
  readonly states: Readonly<Record<DeliveryState, LabelReceiptStateStyle>>;
  readonly placement: ReceiptPlacement;
  readonly scope: ReceiptScope;
}

export type ReceiptModel = TicksReceiptModel | LabelReceiptModel;

// ---------------------------------------------------------------------------
// Chrome axis (T-016 — reencuadre de brief.yaml, operador 2026-09-06). Typed here only; no
// consumer wiring in core/. Fidelity: cada canal se ve como sí mismo (simulador, marketing) —
// clip/controles del composer se mueven de lado por canal. Consistent: cromo Cofoundy fijo, solo
// el mensaje cambia por canal — para la app, donde mover los controles entre canales es un bug de
// UX ("el cliente de Fovente no se confunde con los botones que estén cambiando"), no fidelidad.
// ---------------------------------------------------------------------------

export type Chrome = 'fidelity' | 'consistent';

export interface ReactionConstraint {
  readonly emoji: 'any' | 'allowlist';
  readonly allowlistSize: number; // 0 when emoji === 'any'
  readonly maxAgeDays: number; // 0 = sin límite
  readonly canTargetReaction: boolean;
  readonly canTargetOutbound: boolean;
  readonly maxPerMessage: number; // 0 = sin límite (WA/Telegram); 6 en iMessage tapbacks
}

// "actor puro, sin ventana temporal" — misma estrategia en los 3 canales hoy (adapter-interface-draft.md).
export type GroupKeyStrategy = 'actor';

export type Counter = 'views' | 'none';
export type TimestampPlacement = 'inside-pad' | 'inside-plain' | 'gutter';
export type QuoteStyle = 'color-bar' | 'thin-bar' | 'stacked-bubble';
export type BubbleTransport = 'per-conversation' | 'per-message';
export type SenderKind = 'human' | 'ai' | 'bot' | 'forwarded' | 'channel';
export type Keyboard = 'os-qwerty' | 'inline-in-message';
export type Album = 'grid-in-one-bubble' | 'separate';
export type AvatarSide = 'inbound' | 'none';

// ---------------------------------------------------------------------------
// Capability (T-029) — was a 17th field bolted on via `adapters/caps.ts`'s
// `ChannelAdapterWithCapabilities extends ChannelAdapter` shim (T-028). `channel` stopped short
// of forcing that in because it breaks `exports.test.ts`'s "exactly 16" guard — decision here is
// to grow the contract, not weaken the guard: `capabilities` describes what a channel can DO, same
// category as the other 16, not an anexo. Scoped to the two members script authoring needs today —
// `REACTION` stays out on purpose, it already has `reactions`/`reactionConstraint` above and
// folding it in here would be a second way to ask the same question.
//
// Key PRESENCE is the question, never a value's truthiness (`Partial`, not a total `Record`):
// every entry's value is `null` today ("supported, nothing to constrain yet"), so absent-from-set
// is how "unsupported" is spelled. Mirrors inbox-ai's `Capability` StrEnum + `registry.py`'s
// `Constraint | None` map. Use `hasCapability` (adapters/caps.ts) to ask, never `cap in set` or a
// value-truthiness check by hand.
// ---------------------------------------------------------------------------

export type Capability = 'buttons' | 'list';

export type CapabilitySet = Readonly<Partial<Record<Capability, null>>>;

/** The 17 fields, cero opcionales (adapter-interface-draft.md + T-029's `capabilities`). */
export interface ChannelAdapter {
  readonly tail: Tail;
  readonly wallpaper: Wallpaper;
  readonly reactions: ReactionStyle;
  readonly reactionConstraint: ReactionConstraint;
  readonly groupKey: GroupKeyStrategy;
  readonly deliveryStates: readonly DeliveryState[];
  readonly receipt: ReceiptModel;
  readonly counter: Counter;
  readonly timestamp: TimestampPlacement;
  readonly quote: QuoteStyle;
  readonly bubbleTransport: BubbleTransport;
  readonly senderKinds: readonly SenderKind[];
  readonly keyboard: Keyboard;
  readonly album: Album;
  readonly e2eNotice: boolean;
  readonly avatarSide: AvatarSide;
  readonly capabilities: CapabilitySet;
}

export interface Diagnostic {
  code: string;
  msg: string;
  stepIdx?: number;
}

// ---------------------------------------------------------------------------
// Script authoring — SimScript/SimStep. T-001 alcanza post/draft/flag; T-003 (mismo dueño,
// core/**) extiende el fold con edit/delete/react/pin/receipt/read/views sobre los MsgId ya
// asignados por post.
// ---------------------------------------------------------------------------

export interface PostStepData {
  readonly by: ActorId;
  readonly text?: string;
  readonly media?: Json;
  /** Displayed clock label, verbatim (e.g. `'20:15'`). OPTIONAL and inert when absent — the
   * label then derives from the message's tick, exactly as before.
   *
   * It exists because the printed hour was coupled to the ANIMATION tick, so at a hero's cadence
   * (~1s per step) a fourteen-step conversation printed the same minute fourteen times, while
   * `ChatDemo.astro` (the production hero this replaces) shows 20:14 → 20:15 → 20:17 → 20:19.
   * That span is the evidence that time passed, which is what the "respondió en 4 s" claim rests
   * on — so it is content, not chrome.
   *
   * A STRING from the script, never a clock read: `core/` bans `Date`/`Date.now` (invariants 4 and
   * 5) precisely so the same seed yields byte-identical PNGs, and a label sourced from wall time
   * would break that on the first capture. */
  readonly at?: string;
}

export interface DraftStepData {
  readonly by: ActorId;
  readonly chars: number;
}

export interface FlagStepData {
  readonly key: string;
  readonly value: Json;
}

// edit/delete/react/pin/unpin/receipt/read/views (T-003) target a MsgId directly — unlike
// `post`, they mutate a message that already exists, so there's no id to *assign*, only to
// *reference*. compile() assigns post ids deterministically in script order (`m0`, `m1`, ...),
// so a script author writes the target id the same way they'd write any other stable identifier
// — these SimStep variants are structurally identical to their Ev counterpart (+ delayMs).
export type SimStep =
  | ({ readonly k: 'post'; readonly delayMs?: number } & PostStepData)
  | ({ readonly k: 'draft'; readonly delayMs?: number } & DraftStepData)
  | ({ readonly k: 'flag'; readonly delayMs?: number } & FlagStepData)
  | { readonly k: 'edit'; readonly delayMs?: number; readonly id: MsgId; readonly v: number }
  | {
      readonly k: 'delete';
      readonly delayMs?: number;
      readonly id: MsgId;
      readonly scope: 'me' | 'all';
    }
  | {
      readonly k: 'react';
      readonly delayMs?: number;
      readonly id: MsgId;
      readonly emoji: string;
      readonly by: ActorId;
      readonly remove?: boolean;
    }
  | { readonly k: 'pin' | 'unpin'; readonly delayMs?: number; readonly id: MsgId }
  | {
      readonly k: 'receipt';
      readonly delayMs?: number;
      readonly id: MsgId;
      readonly to: DeliveryState;
    }
  | { readonly k: 'read'; readonly delayMs?: number; readonly upTo: MsgId }
  | { readonly k: 'views'; readonly delayMs?: number; readonly id: MsgId; readonly n: number };

export type SimScript = readonly SimStep[];

// ---------------------------------------------------------------------------
// Timeline — el modelo temporal (architecture-v1.md §1 / api-contract.md).
// ---------------------------------------------------------------------------

export type Ev =
  | { k: 'post'; id: MsgId; step: SimStep }
  | { k: 'edit'; id: MsgId; v: number }
  | { k: 'delete'; id: MsgId; scope: 'me' | 'all' }
  | { k: 'react'; id: MsgId; emoji: string; by: ActorId; remove?: boolean }
  | { k: 'pin' | 'unpin'; id: MsgId }
  | { k: 'receipt'; id: MsgId; to: DeliveryState }
  | { k: 'read'; upTo: MsgId }
  | { k: 'views'; id: MsgId; n: number }
  // `by` is the ActorId verbatim — element/ (T-002) already treats ActorId as the group key
  // ('in' | 'out:ai' | 'out:human:<id>', adapter-interface-draft.md §groupKey) with no separate
  // index/registry indirection, so the draft event carries the same currency as everything else.
  | { k: 'draft'; by: ActorId; chars: number }
  | { k: 'flag'; key: string; value: Json }
  | { k: 'overlay'; id: string; phase: string }
  | { k: 'cue'; sound: SoundId };

export interface Frame {
  readonly t: Tick;
  readonly ev: Ev;
}

export interface MsgReaction {
  readonly emoji: string;
  readonly by: ActorId;
}

export interface MsgState {
  readonly id: MsgId;
  readonly by: ActorId;
  readonly v: number; // edit version, 0 = original
  readonly text?: string;
  readonly media?: Json;
  readonly deleted: 'me' | 'all' | null;
  readonly reactions: readonly MsgReaction[];
  readonly receipt: DeliveryState;
  readonly views: number;
  /** The authored clock label, carried through the fold so a renderer can prefer it over the
   * tick-derived one. See `PostStepData.at`. */
  readonly at?: string;
}

export interface Draft {
  readonly by: ActorId;
  readonly chars: number;
}

export interface Overlay {
  readonly id: string;
  readonly phase: string;
}

export interface SimState {
  readonly msgs: ReadonlyMap<MsgId, MsgState>;
  readonly order: readonly MsgId[];
  readonly pinned: MsgId | null;
  readonly draft: Draft | null;
  readonly flags: Readonly<Record<string, Json>>;
  readonly overlays: readonly Overlay[];
  readonly scrollId: MsgId | null;
}

export interface Timeline {
  readonly t0: Tick;
  readonly frames: readonly Frame[];
  readonly keys: Int32Array; // frames.map(f => f.t) — binary search
  readonly checkpoints: readonly SimState[]; // snapshot cada K=64 frames — T-003
  readonly duration: Tick; // = frames.at(-1).t — se MIDE, no se estima
  readonly digest: string; // hash(script, seed, channel, locale, tz)
}

export interface CompileOptions {
  readonly seed: number;
  readonly channel: ChannelId;
  readonly locale: string;
  readonly tz: string; // OBLIGATORIO (§13) — entra al digest
  readonly t0: Tick;
}
