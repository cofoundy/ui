// chat-sim — subpath barrel (@cofoundy/ui/chat-sim). Owned by [core] per file-ownership-matrix.md.
// src/index.ts (the main barrel) is never touched — api-contract.md §"Árbol": the cycle exports
// only via this subpath.

export * from './core/types';
export { compile } from './core/compile';
export { seek } from './core/seek';
export { initialState, applyEvent } from './core/fold';
export { createPlayhead } from './core/playhead';
export type { Playhead } from './core/playhead';
export { rand } from './core/prng';
export { digestOf } from './core/digest';
