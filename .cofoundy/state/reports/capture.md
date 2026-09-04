wall_clock_minutes: 55

# capture — T-004 (PNG determinista + settle gate)

## Delivered

- `src/components/chat-sim/capture/tickToStep.ts` — Tick→`data-step` conversion (binary search over
  `Timeline.frames`), mirroring `chat-sim-element.ts`'s own `play()` semantics exactly, so a step
  computed here and one arrived at by letting playback run to the same Tick agree by construction.
  See its header for the real `core/**` bug found and routed around here (below, and T-009).
- `src/components/chat-sim/capture/settleScript.ts` — builds the browser-side JS the settle gate
  runs: builds `<cf-chat-sim>` from the recipe, jumps straight to the target step (no `play()`),
  waits `document.fonts.ready`, pins every `Animation` on the subtree to `currentTime=0` (springs
  AND the typing-dot `infinite` keyframe loop — `cf-static` alone only disables `.cf-msg`'s
  fade-in), then polls `--cf-cs-pad` across consecutive rAFs until two reads agree.
- `src/components/chat-sim/capture/agentBrowser.ts` — thin `agent-browser` CLI wrapper
  (argv-array `execFileSync`, no shell string ever built — message text can contain quotes/emoji).
- `src/components/chat-sim/capture/captureFrame.ts` — the public API (`captureFrame(tl, t, o)`,
  api-contract.md), extended `o` (see Deviations), isolated `--session` per call.
- `src/components/chat-sim/capture/cli.ts` + `scripts/capture-chat.mjs` — the actual CLI. `.mjs` is
  a thin bootstrap (locates `node_modules/.bin/tsx`, execs `cli.ts` — `tsx` is an existing
  devDependency, same pattern as this repo's own `gen:agents`/`verify:agents` scripts); `cli.ts`
  has the real arg parsing + `compile()` + `captureFrame()` call, typed and testable.
- `src/components/chat-sim/capture/capture.html` + `capture.bundle.js` — capture's OWN headless
  harness (NOT `demo/index.html` — that's `[skin]`'s `W` cell). Static, empty body; the element is
  built entirely by the injected settle script. `capture.bundle.js` is an esbuild artifact of
  `element/index.ts`, built the same way `demo/chat-sim.bundle.js` is, but owned here.
- `src/components/chat-sim/capture/__tests__/` — `tickToStep.test.ts` (pure, cross-checked against
  a naive linear reference across 4 seeds × 200 random ticks each), `bundle-freshness.test.ts`
  (same pattern as `element/__tests__/bundle-freshness.test.ts`, own artifact), `determinism.test.ts`
  (T-004 acceptance #1 + #2, real `agent-browser` + real headless Chrome, not mocked).

## Acceptance status

1. **Two runs, same `(script,seed,channel,locale,tz)` ⇒ byte-identical PNG** — pass.
   `determinism.test.ts`, plus a full CLI-driven end-to-end run outside the test (evidence below).
2. **Gemelo positivo: changing `seed` MUST break the byte-compare** — pass, and not by luck. See
   "How the positive twin is actually guaranteed" below — a naive version of this test (capture the
   final state, or an arbitrary mid-script step) was verified to falsely PASS with byte-identical
   PNGs for seed 7 vs seed 99, which is exactly the failure mode this acceptance line exists to
   catch. `t` is chosen so the two seeds are provably on opposite sides of a frame boundary.
3. **Runs in CI headless** — `agent-browser` defaults to headless (verified: no `--headed` flag
   used anywhere in this code); CI prerequisite noted below.

## How the positive twin is actually guaranteed

`compile()`'s jitter (`core/prng.ts`, positional) only perturbs FRAME TIMING — never message
content. A script whose only difference between two seeds is a timestamp label can render
byte-identical PNGs for TWO DIFFERENT SEEDS by coincidence whenever the jitter isn't large enough
to cross a displayed-minute boundary. **Measured directly**: seed 7 vs seed 99 against this task's
fixture, captured at the script's FINAL state (`--t` omitted, i.e. every message visible either
way) — byte-identical (see `reserva-final-runA/B.png` below; that pair also happens to double as
acceptance #1's own evidence). A step-count-only capture API can't do better than that by
construction — the frame count is the same at "everything happened" regardless of when each event
actually landed.

`captureFrame(tl, t, o)` takes a Tick, not a step, for exactly this reason (T-004 delta from the
team-lead: "usa seek del core... para posicionar en un t exacto"). `determinism.test.ts`
(`findDivergingTick`) compiles BOTH seeds first, finds a frame index where their arrival ticks
differ, and picks `t = min(a, b)` — the timeline whose frame lands exactly at `t` counts it; the
other's is strictly later, so NONE of its frames from that index on can count. The two capture
results are then structurally different DOMs (one has an extra message bubble), not merely
different by chance. Evidence below (`reserva-mid-seed7/99.png`) shows this same technique run
through the real CLI, outside the test.

## Real bug found + routed around (flagged, not fixed here — filed as `.cofoundy/tasks/T-009.md`
against `[core]`)

While building the positive twin, an initial version using `t = min(a,b) + 1` (later corrected —
see `determinism.test.ts`'s own comment) surfaced something else: `tickToStep` returned the SAME
value (`8`, i.e. "everything visible") for BOTH seeds regardless of `t`. Root cause, verified
directly: `Timeline.keys` is declared `Int32Array` (`core/types.ts`) but `compile()` fills it
straight from real epoch-ms Ticks. Any realistic `t0` — exactly what `demo/index.html`,
`chat-sim-element.ts`'s own default, and every recipe in this task use — exceeds Int32's ~2.147e9
ceiling and silently wraps. This corrupts `core/seek.ts`'s OWN exported `seek()`, not just
something this file could route around elsewhere: its binary search compares a wrapped `keys[i]`
against a raw, unwrapped query `t`, so the search degenerates to "always at the end" for any
Timeline built with a real calendar date. `core`'s own tests are green because they evidently use
small `t0` values (e.g. `0`), which never crosses the boundary. Worked around here — `tickToStep`
(this file's own, `capture/**`) binary-searches `Timeline.frames` directly instead of `Timeline.keys`
— but the underlying bug is `core`'s to fix (`core/**` is `core`'s `W` cell, `capture` only has
`R`). Full repro + acceptance criteria in `.cofoundy/tasks/T-009.md`.

## Deviations from spec (disclosed, with rationale)

- **`captureFrame`'s `o` param is wider than the contract table's `{width;dpr;out}`.** `Timeline`
  doesn't carry the raw `script`/`seed`/`channel`/`locale`/`tz` that produced it, and `element/`'s
  only public reconstruction path is declarative (`<cf-chat-sim script channel seed locale tz t0>`,
  which recompiles internally) — the browser side needs that recipe verbatim to reproduce the exact
  same `Timeline` the caller already has. `o` now also carries `CaptureRecipe`'s fields. Arity
  stays 3 params; only the 3rd widens. Full rationale in `captureFrame.ts`'s header.
- **Playwright not available** (worktree has no way to add devDependencies — `scope.write` excludes
  `package.json`). Used `agent-browser` (already in PATH, already used by `[skin]` for its own
  screenshot verification) via `child_process.execFileSync` with argv arrays, never shell strings.
- **CI prerequisite**: this drives the `agent-browser` binary, which must be on PATH with Chrome
  already fetched (`agent-browser install`) in whatever CI image runs these tests — same class of
  prerequisite as any headless-browser-based tool. Not something `capture/**` can provision itself.

## Flagged for the CTO

- **`.cofoundy/tasks/T-009.md` filed against `[core]`** — see above.
- **Pre-existing, unrelated**: `npx vitest run src/components/chat-sim` currently fails
  `element/__tests__/bundle-freshness.test.ts` — `demo/chat-sim.bundle.js` (skin's `W` cell) is
  stale relative to the CURRENT `element/index.ts` (verified: `git status` shows zero modification
  by this task to anything under `element/**` or `demo/**`; my OWN `capture.bundle.js`'s
  freshness test passes against that same current `element/index.ts`). Almost certainly went stale
  when `core`'s T-001-reactivation (draft `by`/clearing fix) landed after `[skin]`'s last bundle
  rebuild. Not mine to fix (`demo/**` is `[skin]`'s `W` cell) — flagging so it isn't mistaken for
  something T-004 introduced.
- **`src/components/chat-sim/sound/` is untracked** in this worktree, not authored by this task —
  noticed via `git status`, left untouched.

## Evidence (real captures, outside the test suite, via the actual CLI)

`.cofoundy/state/reports/capture-evidence/` (script: `capture/__tests__/fixtures/reserva.json`,
`t0=1767261600000`):

| File | seed | `--t` | sha256 |
|---|---|---|---|
| `reserva-final-runA.png` | 7 | (final) | `ea774bc5ba0cf11a36e8c7db80363ca4b77b2accc9559924dfbbf4f6557865af` |
| `reserva-final-runB.png` | 7 | (final) | `ea774bc5ba0cf11a36e8c7db80363ca4b77b2accc9559924dfbbf4f6557865af` (identical to A — acceptance #1) |
| `reserva-mid-seed7.png` | 7 | `1767261600859` | `b5bf43724e72e1415693229b2f4fd016a3c62ba603fbc4ebc97f8e6b2ecbf569` |
| `reserva-mid-seed99.png` | 99 | `1767261600859` | `f7f5a7f62a7b12318a643721c9c9b04688272458af6eff9e0840d3cb97a049ec` (differs from seed7 — acceptance #2) |

## Not done / out of scope

- Only `channel="whatsapp"` was exercised (the only channel `element/`'s fixture adapter renders
  today — real Telegram/iMessage adapters are T-005, blocked by T-003 which is done but T-005
  itself hasn't landed in this worktree). `captureFrame`'s `channel` param is plumbed through and
  will work once `getAdapter()` lands; nothing here assumes WhatsApp specifically.
- `capture/**`'s TypeScript typechecks clean (`npx tsc --noEmit` — the only errors in the repo are
  pre-existing `ShaderHero*` failures, unrelated, verified via `git status`/`grep`).
