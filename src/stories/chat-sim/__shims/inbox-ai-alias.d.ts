// Ambient shim for inbox-ai/frontend's `@/lib/auth` path alias.
//
// InboxAIReplacement.stories.tsx type-checks its fixtures against the REAL
// `Message` interface at `inbox-ai/frontend/src/lib/api.ts:229` via a plain
// cross-repo `import type`. That file's *own* top-level imports (`axios`,
// `@/lib/auth`) are pulled into this package's `tsc` program the moment
// anything imports from it — even a type-only import, since the checker
// still needs to parse the whole module to find the exported symbol.
//
// `axios` resolves fine (node module resolution walks up to inbox-ai's own
// node_modules). `@/lib/auth` does not: `@/*` is inbox-ai's OWN tsconfig
// alias, and packages/ui's tsconfig maps `@/*` to `./src/*` instead — there's
// no `src/lib/auth` here. That is a module-resolution collision on an
// import `Message` never touches, not a shape mismatch, so shimming it
// doesn't loosen the contract this file exists to enforce: `Message` itself
// is never redeclared here, only the unrelated helper its file happens to
// also import.
//
// Verified: removing this file reproduces `error TS2307: Cannot find module
// '@/lib/auth'` on the story; the `Message` fixtures themselves still fail
// to compile on a genuine shape mismatch with this shim present (see
// src/__tests__/chat-sim/inbox-message-adapter.test.ts's type-only negative
// case for how that's checked).
declare module '@/lib/auth' {
  export function getToken(): string | null;
  export function clearToken(): void;
  export function applySessionRefresh(...args: unknown[]): unknown;
}
