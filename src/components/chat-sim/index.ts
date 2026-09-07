// chat-sim — subpath barrel (@cofoundy/ui/chat-sim). Owned by [core] per file-ownership-matrix.md.
// src/index.ts (the main barrel) is never touched — api-contract.md §"Árbol": the cycle exports
// only via this subpath.
//
// T-022 §C: `export * from './core/types'` widened the public surface silently — any name added
// to core/types.ts leaked through the barrel with no review at this file. Named exports below are
// the exact same surface, made a deliberate list: adding a new type to core/types.ts no longer
// republishes it here for free.

export type {
  ActorId,
  Album,
  AvatarSide,
  BubbleTransport,
  ChannelAdapter,
  Chrome,
  CompileOptions,
  Counter,
  DeliveryState,
  Diagnostic,
  Draft,
  DraftStepData,
  Ev,
  FlagStepData,
  Frame,
  GroupKeyStrategy,
  Json,
  Keyboard,
  LabelReceiptModel,
  LabelReceiptStateStyle,
  MsgId,
  MsgReaction,
  MsgState,
  Overlay,
  PostStepData,
  QuoteStyle,
  ReactionConstraint,
  ReactionStyle,
  ReceiptIconId,
  ReceiptKind,
  ReceiptModel,
  ReceiptPlacement,
  ReceiptScope,
  SenderKind,
  SimScript,
  SimState,
  SimStep,
  SoundId,
  Tail,
  Tick,
  TickReceiptStateStyle,
  TicksReceiptModel,
  Timeline,
  TimestampPlacement,
  Wallpaper,
  ChannelId,
} from './core/types';
export { compile } from './core/compile';
export { seek, stateAtStep } from './core/seek';
export { initialState, applyEvent } from './core/fold';
export { draftIntervals } from './core/draft-intervals';
export type { DraftInterval } from './core/draft-intervals';
export { createPlayhead } from './core/playhead';
export type { Playhead } from './core/playhead';
export { digestOf } from './core/digest';
export { getAdapter } from './adapters/registry';
export { validateScript } from './adapters/validate';
export { ChatSim } from './react';
export type { ChatSimMode, ChatSimProps } from './react';

// `rand` (core/prng.ts) is deliberately NOT re-exported here (T-022 §C): it's the raw PRNG
// stream — every real consumer inside chat-sim/ imports it directly from './core/prng' (never
// through this barrel), and exposing it publicly would invite an outside consumer to depend on
// draw order/positional semantics that are an implementation detail of compile(), not a contract.
