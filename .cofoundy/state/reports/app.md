wall_clock_minutes: 45

# app — T-007 (react renderer + mobile-first composer)

## Delivered

`src/components/chat-sim/react/**` (own write cell, `src/index.ts` and `chat-sim/index.ts` both
untouched):

- `types.ts` — `<ChatSim script channel seed mode="demo"|"live" />` (api-contract.md). `mode`'s
  semantics weren't spec'd upstream, so this decides it explicitly: `demo` = playback-driven,
  visual-only composer, same contract as `<cf-chat-sim>`; `live` = frozen at the final step, a
  REAL operable composer a visitor can type into (element/chat-sim-element.ts's own docstring
  names this as react/'s job).
- `engine.ts` — state-derivation helpers. Originally duplicated `stateAtStep`/`draftIntervals`
  from element/'s private closures (flagged to team-lead as "probably belongs in core" before
  writing them); [core] promoted both to `core/seek.ts` / `core/draft-intervals.ts` mid-task
  (history.jsonl "promote-stateAtStep-draftIntervals", also fixed a real t0 double-counting bug
  in `compile()`) — refactored to import the promoted versions instead of keeping the copy. Also
  ships `fullSequence`/`visibleSequence`/`dateSeparators` — the functional twin of element's
  pre-render-and-hide DOM strategy, since React has no persistent DOM to pre-build against.
- `MessageThread.tsx` — header + log, JSX twin of `element/render.ts`'s DOM builders. Reuses
  `element/render.ts`'s pure helpers (`actorDir`, `actorSenderKind`, `computeGroupFlags`,
  `groupKeyOf`) rather than re-deriving grouping logic; imports `element/render` directly
  (never `element/index.ts`, whose barrel side-effect-registers `<cf-chat-sim>` and references
  the bare `HTMLElement` global — both fatal for a React tree that may render on the server).
- `DemoComposer.tsx` / `LiveComposer.tsx` / `useKeyboardInset.ts` — visual-only mirror of
  element's `.cf-composer`, and the real mobile-first composer (`visualViewport` + `100dvh` root
  + safe-area + ≥44px targets + ≥16px input font-size). Styled inline (`style={{}}`), not new
  `styles.css` rules — `app` only has `A` (ask) on that file; asking [skin] for four bespoke
  mobile rules for a component skin never renders was a bigger cross-lane dependency than
  warranted, and inline styles also can't trip the chat-sim Tailwind-ban scanner.
- `ChatSim.tsx` / `index.ts` — the component + this lane's own barrel.
- `MOBILE-CHECKLIST.md` — acceptance #3's table, one row per reason `MobileComposer.tsx`
  (inbox-ai, 13 KB) itself declares for existing, veredicto cubierto/no-cubierto/N-A per row.
  Finding worth flagging: NONE of the 7 declared reasons is "the keyboard" —
  `MobileComposer.tsx` never touches `visualViewport`/`dvh`/`interactive-widget` (grepped, zero
  hits, per team-lead). The fork exists for layout/interaction-budget reasons; `useKeyboardInset`
  answers a question that file never asked.

## Acceptance status

1. **Snapshot cruzado (element vs react, mismo DOM semántico)** — PASSED. Recursive canonical
   diff (tag/classes/attrs/direct-text/children) of `<cf-chat-sim>` vs `<MessageThread>` at 10
   (script, channel, step) combinations across whatsapp + telegram, plus a positive twin proving
   the comparator discriminates. `src/components/chat-sim/react/__tests__/snapshot-cross-check.test.tsx`
   (11/11 green).
   - **Real bug found in [skin]'s code, not fixed here (out of `react/**`'s write cell):**
     `element/chat-sim-element.ts`'s `connectedCallback()` wires the `channel` HTML attribute
     into `compile()`'s fold, but `#adapter` (what actually drives RENDERING) stays hard-defaulted
     to `WHATSAPP_REFERENCE_ADAPTER` regardless of `channel` — a `channel="telegram"` mount
     silently renders WhatsApp chrome unless a caller also sets the `.adapter` property by hand.
     Worked around in the test (sets `.adapter = getAdapter(channel)` explicitly, documented
     inline) so the cross-check is a genuine same-channel comparison. Flagged to team-lead for a
     follow-up task against [skin]; not filed as a new `.cofoundy/tasks/T-XXX.md` myself since
     that file isn't in this task's `scope.write`.
2. **Test mecánico — visualViewport 375×(alto−336)** — PASSED, with twin.
   `src/components/chat-sim/react/__tests__/mobile-viewport.test.tsx` (4/4): composer's measured
   keyboard inset tracks `innerHeight - visualViewport.height - offsetTop` exactly (336px for the
   simulated case), the log scrolls to bottom when that inset changes (last message stays
   visible), and a naive composer with no `useKeyboardInset` call proves both claims false for
   the un-fixed shape.
3. **Checklist derivada de MobileComposer.tsx** — PASSED, mechanically checked (not prose).
   `src/components/chat-sim/react/__tests__/mobile-checklist.test.ts` (12/12): 7 rows, one per
   declared reason, each grounded by a literal fingerprint captured from the real file (embedded
   in the test rather than read live from the sibling `inbox-ai` repo at runtime — `packages/ui`
   and `inbox-ai` are separate repos, and a CI job checking out only this one would never have
   that path). 4/7 covered; the 3 not covered (voice-note mic role-swap, busy/stop async state,
   `allowEmptySend` vocabulary parity with a desktop sibling) are real-messaging-composer
   capabilities a demo/live chat SIMULATOR has no reason to replicate — not regressions.

## Test coverage

`src/components/chat-sim/react/__tests__/` — 4 files, 31/31 green in isolation
(`npx vitest run src/components/chat-sim/react`, exits cleanly). Full `src/components/chat-sim`
suite: every file green except the 2 PRE-EXISTING unrelated `bundle-freshness` failures (verified
against the baseline before this task touched anything — same 2 failures, same files, not
introduced here). Note: the full-suite vitest PROCESS hangs on exit in this sandbox after every
test file has finished and printed (confirmed independent of `react/**` — the isolated `react/`
suite always exits cleanly; likely the esbuild persistent service child process spawned by the
two `bundle-freshness` tests not closing) — an environment quirk, not something `react/**` owns.
`npx tsc --noEmit` — clean for every `chat-sim/react` file (2 pre-existing, unrelated
`hero-shader` errors are the only output).

## Deviations / follow-ups for the CTO

- `chat-sim/index.ts` (the public `@cofoundy/ui/chat-sim` barrel) does NOT yet export `ChatSim` —
  that file is [core]'s write cell (`app` only has `A`). `react/index.ts`'s own header documents
  the two-line addition [core] needs: `export { ChatSim } from './react'` +
  `export type { ChatSimMode, ChatSimProps } from './react'`.
- `element/`'s adapter-wiring gap above (channel attribute doesn't drive the visual adapter) —
  worth a follow-up task against [skin].
- Not attempted (genuinely out of T-007's acceptance): appending visitor-sent `live` messages
  back into a `Timeline`/persisted `SimState` — `mode="live"`'s sends are local optimistic UI
  (`onLiveSend` callback + an in-memory list) by design; nothing in api-contract.md or
  architecture-v1.md asks for persistence, and none of the 3 acceptance lines depend on it.
