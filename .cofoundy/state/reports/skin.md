wall_clock_minutes: 55

# skin — T-002 (stylesheet scoped + element + layout WhatsApp)

## Delivered

- `src/components/chat-sim/element/render.ts` — pure, adapter-driven DOM builder. No `channel ===`
  branch anywhere; every structural choice (tail placement, timestamp placement, receipt glyph,
  reaction placement, quote style) reads a `ChannelAdapter` field.
- `src/components/chat-sim/element/chat-sim-element.ts` — `<cf-chat-sim>`. Pre-renders the full
  thread from the FINAL state at `connectedCallback` (node identity per `MsgId`, built once);
  `data-step` (root attribute) is the one reveal knob, read by both manual scrubbing and the
  internal `play()` (which just writes the same attribute from `core`'s real `createPlayhead`).
- `src/components/chat-sim/element/fixtures.ts` — `WHATSAPP_REFERENCE_ADAPTER` (literal reading of
  adapter-interface-draft.md's WhatsApp column, typed against `core/types.ts`) +
  `CAPS_FIXTURE_INVERTED_ADAPTER` (T-002 #6/B-5's 4-axis flip). Explicitly NOT `adapters/**` —
  disclaimer comment in the file explains why and what it's superseded by (T-005).
- `src/components/chat-sim/element/render.test.ts` (9 tests) + `chat-sim-element.test.ts` (6
  tests) — caps-fixture probe (#6) + its positive twin + a "hardcoded render wouldn't change"
  sanity check on the probe itself, plus an end-to-end smoke test through the REAL
  compile→fold→seek pipeline (not render.ts in isolation).
- `src/components/chat-sim/element/scripts/assert-no-react.mjs` — acceptance #7/B-6: bundles the
  real `element/index.ts` via esbuild, asserts `react`/`react-dom` absent from the module graph;
  bundles a throwaway `import 'react'` via esbuild stdin (no `react/` to point at until wave 4)
  and asserts THAT graph DOES contain it — the positive twin, automated, not just a one-off. Also
  ran the literal manual version the acceptance text describes (added a real `import React` to
  `element/index.ts`, watched the assert go red, reverted) — both are documented in the file.
- `src/components/chat-sim/styles.css` — all tokens under `.cf-chat-sim` (grepped: zero `:root`).
  Bubble/tail/stamp+`--pad`/ticks/wallpaper per architecture-v1.md §12, continuity with
  ChatDemo.astro's visual language (radius, drop-shadow tail via `clip-path`, the pad-reservation
  timestamp trick).
- `demo/index.html` + `demo/chat-sim.bundle.js` — R-1: opens via `open`, no dev server, no
  `type="module"` (file:// CORS). Plays a real 8-step script (post/draft/flag — T-001's wave-1
  events) through the real `compile()`. Visually verified via headless screenshot (see Deviations).

## Acceptance status

1. `demo/index.html` opens and plays a real script — **pass**, screenshot-verified (see below).
2. All tokens under `.cf-chat-sim`, zero new `:root` — **pass**, `grep '^:root' styles.css` empty.
3. Zero Tailwind utility classes; the instrument rejects them — **pass**, via a static-scan vitest
   test (`element/__tests__/no-tailwind.test.ts`), per the team-lead's resolution of E-001 (no
   ESLint infra in the repo, `core` hit the same gap for T-001's own purity lint and set the
   pattern in `core/__tests__/purity.test.ts` — this test copies that shape, not its content).
   Scans `chat-sim/**/*.{ts,tsx,html}` + `demo/**/*.html` for `class`/`className`/`classList.add`
   tokens matching a Tailwind-utility shape. Positive twin included (automated), AND ran the
   literal manual version the acceptance text describes: added `classList.add('flex',
   'items-center')` to `chat-sim-element.ts`, watched the test go red naming the file and the
   token, reverted (`git diff --stat` confirms clean).
4. `git diff --exit-code src/index.ts src/styles/index.css` vs merge-base — **pass**, verified,
   exit 0.
5. Renders identical served as plain HTML, no host Tailwind — **pass** by construction: the demo
   page links only `styles.css`, no framework CSS, no Tailwind anywhere in the page.
6. Caps fixture (4-axis flip: tail/receiptGlyph/timestamp/reactions) — **pass**, `render.test.ts`,
   4 dedicated assertions (one per axis) + the round-trip positive twin + a sanity check that the
   probe itself isn't vacuous. Also verified live in the browser (swapped `el.adapter` at runtime,
   screenshot shows the single-tick glyph and inline-plain timestamp).
7. Zero React in `element/`'s bundle — **pass**, `assert-no-react.mjs`, both automated and the
   literal manual demonstration.
8. `wall_clock_minutes` — this line.

## Deviations / flags for the CTO

- **Two bugs found in `core/**` (T-001, not mine to fix — `R` only on that cell), disclosed +
  worked around defensively, not silently patched:**
  1. `core/fold.ts`'s `draft` case and `core/compile.ts`'s `stepToEv()` both drop `SimStep.draft.by`
     — `Ev`'s `draft` variant only carries `{idx, chars}`. `state.draft.by` is always `''` today.
  2. `core/fold.ts`'s `post` case spreads `...state` without clearing `draft` — once a draft fires
     it never resolves, even after the `post` it was standing in for. Visible live in the demo (the
     "…" bubble stays up after the reply lands) — disclosed on the demo page itself so it doesn't
     read as a `skin` defect. `element/` renders `SimState.draft` faithfully either way; I did not
     paper over #2 in this layer.
- **`demo/index.html` + `demo/chat-sim.bundle.js` are not covered by ANY scope.write glob** (mine
  is `element/**` + `styles.css`; `demo/**` isn't in file-ownership-matrix.md at all, for any
  lane). The task file's own prose ("Más `demo/index.html`") and architecture-v1.md §9 ("`core/` +
  `element/` + adapter WhatsApp | ✅ página demo estática") both commission it, and R-1 names this
  exact path as the artifact opened. Proceeded rather than blocking on a scope gap the task itself
  authorizes — flagging so the CTO can add `demo/**` to the matrix (currently `[skin] A/W` is my
  best guess, since it's the only lane that needs to write there before wave 4).
- **`demo/chat-sim.bundle.js` is a committed build artifact**, produced by hand-invoking esbuild
  (`npx esbuild src/components/chat-sim/element/index.ts --bundle --format=iife
  --global-name=CfChatSim --outfile=demo/chat-sim.bundle.js --target=es2020` — command is also in
  the HTML file's closing comment). No `vite.config.chat-sim.ts` was created (that file is
  `[core]`'s per the matrix) — this sidesteps that cell rather than writing to it. Whoever touches
  `element/**` next needs to remember to re-run this command; there's no watch/CI wiring for it yet.
- **Found and fixed one real bug in my own first draft, caught by browser verification, not by
  the unit tests**: `render.ts`'s `populateMessageElement()` appended new DOM without clearing
  prior children, so every step-change during playback (~60/s via `createPlayhead`'s rAF) stacked
  another `.cf-bubble` as a flex sibling inside the same cached `<li>` — rendered as horizontally
  repeated bubbles. `render.test.ts`'s unit tests never caught it because they only ever call
  `populateMessageElement`/`buildMessageElement` ONCE per node; only the live demo (screenshot,
  then `getBoundingClientRect` to rule out a tool artifact, then disabling the stylesheet to see
  raw duplicated text) exposed it. Fixed with `li.replaceChildren()` at the top of
  `populateMessageElement`; added a regression test (`render.test.ts`, "repopulating the SAME
  `<li>`… does not stack duplicate content") so it can't come back silently.
- Locally: `node_modules` didn't exist in this worktree (no lockfile install run here) — symlinked
  it from the primary checkout (`packages/ui/node_modules`) after confirming `package.json` is
  byte-identical to `main`. Not committed (gitignored); flagging so a future lane doesn't wonder
  where it came from if they inspect the worktree.

## Design decisions not spelled out in the frozen contract (applied, not escalated — low risk, in
my own scope, reversible)

- `by: ActorId` doubles as the WhatsApp/Telegram/iMessage group key verbatim
  (`'in' | 'out:ai' | 'out:human:<id>'`), per adapter-interface-draft.md's own groupKey row and
  `inbox-ai/frontend/src/lib/messageGrouping.ts:25`. No separate cast/actor registry — the id
  already carries direction + sender kind (`actorDir`/`actorSenderKind` in `render.ts`).
- Time labels are formatted by `element/` (not `core/`) via `Intl.DateTimeFormat`, reading
  `Timeline.t0` directly as the epoch (architecture-v1.md §1 defines `t0` as "epoch virtual — dato
  del guion, no del reloj" — no fabricated field, no module augmentation of `core/types.ts`).
- `data-step` is an exact FRAME COUNT (not a raw `Tick`) — matches architecture-v1.md §13 #2's "N
  frames applied" replacing "N accumulated classes" 1:1. Implemented as element/'s own small fold
  (`stateAtStep`, using the exported `initialState`/`applyEvent`) rather than reusing `seek(tl,t)`
  by Tick, since two frames can share a jitter-adjusted tick and a Tick-keyed step would be
  ambiguous; a frame-count isn't.
