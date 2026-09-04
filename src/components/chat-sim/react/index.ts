// react/index.ts — [app]'s own barrel (file-ownership-matrix.md: `app` owns `react/**`).
//
// NOT wired into the public `@cofoundy/ui/chat-sim` subpath yet: `chat-sim/index.ts` is [core]'s
// write cell (file-ownership-matrix.md — `app` only has `A`, ask). For api-contract.md's
// `<ChatSim script channel seed mode="demo"|"live" />` to be reachable the way `compile`/`seek`/
// `getAdapter` already are, [core] needs to add, in `../index.ts`:
//   export { ChatSim } from './react';
//   export type { ChatSimMode, ChatSimProps } from './react';
// Flagged in T-007's termination report — not done here, since it's outside this file's write
// cell.

export { ChatSim } from './ChatSim';
export type { ChatSimMode, ChatSimProps } from './types';
