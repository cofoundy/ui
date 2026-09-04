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
// ChannelAdapter — the 16 fields from adapter-interface-draft.md. Cero opcionales:
// a slot that isn't used gets an explicit "none"/"—"-equivalent value, never `?`.
// Values (whatsapp.ts, telegram.ts, imessage.ts, registry.ts) are T-005 [channel].
// ---------------------------------------------------------------------------

export type Tail = 'first' | 'last';
export type Wallpaper = 'pattern' | 'none';
export type ReactionStyle = 'overlay-below' | 'own-row' | 'overlay-edge';

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

export type ReceiptGlyph = 'double-tick' | 'single-tick' | 'trailing-label';
export type Counter = 'views' | 'none';
export type TimestampPlacement = 'inside-pad' | 'inside-plain' | 'gutter';
export type QuoteStyle = 'color-bar' | 'thin-bar' | 'stacked-bubble';
export type BubbleTransport = 'per-conversation' | 'per-message';
export type SenderKind = 'human' | 'ai' | 'bot' | 'forwarded' | 'channel';
export type Keyboard = 'os-qwerty' | 'inline-in-message';
export type Album = 'grid-in-one-bubble' | 'separate';
export type AvatarSide = 'inbound' | 'none';

/** The 16 fields, cero opcionales (adapter-interface-draft.md). */
export interface ChannelAdapter {
  readonly tail: Tail;
  readonly wallpaper: Wallpaper;
  readonly reactions: ReactionStyle;
  readonly reactionConstraint: ReactionConstraint;
  readonly groupKey: GroupKeyStrategy;
  readonly deliveryStates: readonly DeliveryState[];
  readonly receiptGlyph: ReceiptGlyph;
  readonly counter: Counter;
  readonly timestamp: TimestampPlacement;
  readonly quote: QuoteStyle;
  readonly bubbleTransport: BubbleTransport;
  readonly senderKinds: readonly SenderKind[];
  readonly keyboard: Keyboard;
  readonly album: Album;
  readonly e2eNotice: boolean;
  readonly avatarSide: AvatarSide;
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
