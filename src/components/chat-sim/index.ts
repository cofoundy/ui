// chat-sim — subpath barrel (@cofoundy/ui/chat-sim). Owned by [core] per file-ownership-matrix.md.
// src/index.ts (the main barrel) is never touched — api-contract.md §"Árbol": the cycle exports
// only via this subpath.

export * from './core/types';
export { compile } from './core/compile';
export { seek, stateAtStep } from './core/seek';
export { initialState, applyEvent } from './core/fold';
export { draftIntervals } from './core/draft-intervals';
export type { DraftInterval } from './core/draft-intervals';
export { createPlayhead } from './core/playhead';
export type { Playhead } from './core/playhead';
export { rand } from './core/prng';
export { digestOf } from './core/digest';
export { ChatSim } from './react';
export type { ChatSimMode, ChatSimProps } from './react';
