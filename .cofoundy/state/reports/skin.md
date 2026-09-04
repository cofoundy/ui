wall_clock_minutes: 195

# skin — T-002 + T-006 (stylesheet/element/layout, then sound packs + iMessage token)

# T-006 — sound packs + token iMessage

## Delivered

- `sound/types.ts` — declarative schema (`Wave`, `CueLayer`, `Cue`, `CuePack`), reading
  `ChannelId`/`SoundId` from `core/types.ts` (read-only). Corrects the four prior-art defects
  named in `research-findings/03-capabilities-y-fracturas-de-canal.md` §4: per-channel taxonomy
  (not a global union), `wave` includes `noise`, envelope/attack are per-layer, cancellation is a
  first-class operation (below).
- `sound/synth.ts` — pure-JS, deterministic PCM renderer (`renderLayer`/`renderCue`/`renderPack`).
  Zero Web Audio API surface — this is math over `Float32Array`, so it runs in plain Node with no
  browser polyfill. Noise + jitter draw from core's own exported positional PRNG (`rand`), never
  `Math.random` — same inputs always render the same buffer. Also `pcmDigest` (reuses core's
  `digestOf` rather than writing a second hash — quantizes to Int16, packs one sample per UTF-16
  code unit).
- `sound/packs.ts` — the actual cue-pack DATA: 3 cues per channel (WhatsApp: sine-only, bright,
  two-tone "ding"; Telegram: every cue carries a filtered-noise layer — texture, per finding 03
  §4, not pitch). Well under the ≤6/≤3 cap by choice, not by struggle.
- `sound/audio-sink.ts` — `AudioSink`: schedule-and-cancel per architecture-v1.md §1 class 5.
  Depends on `AudioContextLike`, a minimal structural subset of the real `AudioContext` (typed via
  `lib.dom.d.ts`, which this tsconfig already includes) — so it's unit-testable under plain
  vitest/jsdom (no Web Audio polyfill exists in this repo, and jsdom doesn't implement one) while
  a real `new AudioContext()` satisfies it with zero adapter code. One buffer per scheduled cue
  (layers are already mixed down by `renderCue`) feeding a shared master gain that controls ONLY
  global mute — the prior-art defect ("un solo GainNode para todas las capas") doesn't recur
  because there's nothing per-layer left to starve by the time audio reaches the sink.
- `sound/audition.html` + `audition-entry.ts` + `audition.bundle.js` — the "story de audición."
  **Not** a Storybook story: `src/stories/chat-sim/**` is `[qa]`'s exclusive write cell
  (file-ownership-matrix.md) — a real `.stories.tsx` there is T-008's job. This lives inside
  `sound/**` instead, same "commit the bundle, no build step to open" contract as T-002's
  `demo/index.html`. Verified live in headless Chrome: buttons for all 6 cues + a mute toggle +
  `cancelAll()`, zero console errors, per-channel PCM digests displayed on the page.
- `styles.css` — added `--channel-imessage` (architecture-v1.md §12 point 2, §9 iteration 3):
  incondicional, outside the audio scope cap — it's here because `styles.css` is `[skin]`'s cell,
  not because it's sound-related.
- `sound/__tests__/` (16 tests): `audio-sink.test.ts` (acceptance #1 + #4, via a hand-written
  `FakeAudioContext` that records start/stop so cancellation is actually observable),
  `synth.test.ts` (acceptance #3: per-channel digest difference + determinism positive twin + a
  single-field-mutation sensitivity check), `no-samples.test.ts` (acceptance #2: static scan for
  audio-asset files/`fetch()`, same pattern as `core/__tests__/purity.test.ts`), and a
  `bundle-freshness.test.ts` for `audition.bundle.js` (same gate team-lead asked for on T-002's
  demo bundle — applied here too rather than leaving a second ungated artifact).

## Acceptance status

1. Seek-during-a-scheduled-cue cancels it, sink UNMUTED — **pass**. `FakeAudioContext` tracks
   live nodes; `liveNodeCount` goes `0 → >0 → 0` across schedule/cancelAll. Also verified mute
   state doesn't affect the bookkeeping (a muted sink cancels identically — the acceptance text's
   own point about why "run unmuted" matters).
2. Zero third-party samples — **pass**, static scan (no audio file extensions, no `fetch()`/audio
   import in `sound/**`) + everything actually is synthesized in `synth.ts`.
3. Audition story + per-channel PCM digest differs — **pass**. WhatsApp/Telegram packs digest to
   different values; same pack twice digests identically (determinism); a single mutated field
   (gain) changes the digest (probe sensitivity, not just difference-by-luck).
4. Degenerate case (`packs = {}`, sink doesn't throw) reachable by subtraction — **pass**. `CuePack`
   is `Partial<Record<ChannelId, ...>>`; a missing channel key is `undefined`, handled by `?? []`
   at the call site, never a thrown error. Sink itself never throws when constructed and
   `cancelAll()`ed with nothing scheduled.
8. `wall_clock_minutes` — top of file (shared across T-002 and T-006 per the report's per-lane,
   not per-task, scope).

## Deviations / scope notes

- **`element/**` integration (wiring `AudioSink` to the real `Timeline`/playhead so `cue` events
  actually fire) is explicitly NOT in T-006's scope.write.** The task's own Alcance is "schema +
  cue packs as data + AudioSink to the class-5 policy + one story" — not end-to-end wiring. Also:
  there is currently no way to even AUTHOR a `cue` in a `SimScript` (the `Ev.cue` variant exists
  in `core/types.ts`, but no `SimStep` produces one, and I didn't check whether `core`'s
  in-flight T-003 work adds one — that's their file, not mine to read mid-edit for a scope
  decision). `AudioSink.schedule()`/`cancelAll()` are tested directly against their own API, not
  through a compiled `Timeline` — this is consistent with T-002's caps-fixture precedent (test the
  layer that's actually owned, not the integration that isn't built yet).
- **`--channel-imessage` landed in `styles.css`, not a new file** — there's no dedicated
  "iMessage tokens" location in the matrix; `styles.css` is the only cell I own that a CSS custom
  property could live in.
- **Concurrent worktree activity**, noted so nobody reads it as damage from this commit: at the
  time of this commit, `core`'s T-003 work is uncommitted in the shared worktree
  (`core/compile.ts`, `core/seek.ts`, `core/playhead.ts`, `core/draft-intervals.ts`,
  `core/__tests__/queries.test.ts`, `chat-sim/index.ts`), and `src/components/chat-sim/react/`
  (T-007, `[app]`'s cell) already exists. Running the FULL `chat-sim/` suite right now shows 3
  failures outside this commit's scope: 2 in `core/__tests__/queries.test.ts` (core's own WIP,
  not committed) and 1 in `element/__tests__/bundle-freshness.test.ts` (T-002's demo bundle is
  transitively stale because `core/**` changed underneath it — team-lead's own coordination
  decision is that regenerating it is my job, done as the LAST step before merge with a clean
  tree, not now). `sound/**`'s own 16 tests are all green in isolation and in the full run.

## Iteration 4 — bottom anchor, date separator, and a pushback on blue receipts

## Iteration 4 — bottom anchor, date separator, and a pushback on blue receipts

Team-lead's iteration-3 review (post the typing fix) measured two more real gaps and proposed one
improvement. Two shipped, one pushed back on with code evidence.

1. **🔴 Thread anchored at the top** (measured: 216px of 522px log height empty at the bottom,
   41%). Fixed with ChatDemo.astro's own documented technique (`global.css:358-361`), not
   `justify-content: flex-end` — that repo's own comment explains why: combined with `overflow-y`,
   flex-end pushes overflowing content OUT of the scrollable area. `margin-top: auto` on the
   first VISIBLE child has no such failure mode. Generalized to a hidden-toggle-based model (the
   original only ever had one always-visible first child): `#applyBottomAnchor()` moves a
   `.cf-anchor-top` class to whichever `<li>` (message, typing row, or date separator) is
   currently first-and-unhidden, every reconcile. Re-measured: 12px left at the bottom now (was
   216px).
2. **🟡 No date separator.** Added: `draftIntervals()`'s sibling, a walk over `finalState.order`
   computing a day-key per message (`Intl.DateTimeFormat('en-CA', {timeZone})`, used ONLY as a
   comparison key, never shown) and inserting one pill `<li>` before the first message of each
   day, hidden until that message reveals. **Deliberately never "HOY"/"AYER"**: those read
   real-world wall-clock "now" at VIEW time, which would make the same `(script, seed, channel,
   locale, tz)` render different text depending on which day you open the page — breaking
   architecture-v1.md §1 invariant 2 (byte-identical PNGs across runs), which T-004 depends on.
   Always shows the actual formatted date instead.
3. **Pushed back, with code citations, on "make the last read message's ✓✓ blue":** the claim
   "la máquina de entrega ya soporta read" isn't true of the FOLD today. `core/types.ts`'s
   `SimStep` union is `post | draft | flag` only — there is no way to AUTHOR a receipt transition
   in a script; the `receipt` `Ev` variant exists but nothing in `compile.ts` can produce one from
   a `SimStep`. And `core/fold.ts`'s `applyEvent` switch has no `receipt` case (falls through
   `default: return state` — the file's own header comment says so: "receipt... T-003's fold
   extension"), and `post`'s case hardcodes `receipt: 'queued'` unconditionally. So today, EVERY
   message's receipt is `'queued'` regardless of what the script says — there's no script data I
   could add that the pipeline would honor. render.ts already supports the blue color (`.cf-receipt[data-read='true']`) and always has — this becomes a one-line demo-script change the
   moment T-003 lands the receipt-authoring step type + the fold case, not before.

Re-verified after: 55/55 chat-sim tests green (12 new: 3 bottom-anchor, 3 date-separator, from
iteration 3's 49), typecheck clean, fresh screenshot confirms both fixes (12px empty at bottom,
was 216px; "1 de enero" pill centered above the first message).

## Iteration 3 — typing-indicator root cause + bundle-freshness gate (operator + team-lead)

## Iteration 3 — typing-indicator root cause + bundle-freshness gate (operator + team-lead)

**Operator symptom:** typing animation stops repeating during playback, wrong position, doesn't
read as WhatsApp.

**Team-lead's root-cause diagnosis, confirmed correct:** `#reconcile` was re-populating/re-moving
DOM nodes on every `data-step` change — and `play()`'s `onFrame` callback writes that attribute on
EVERY rAF tick (~60/s), not just at script-step boundaries. Most ticks land on a step value
identical to the last one applied, so every visible node (messages AND the typing indicator) was
being torn down and rebuilt dozens of times per script step. For messages this was invisible
(content was byte-identical each time) except for the CSS cost; for the typing indicator's
`infinite` dot animation, tearing the node's content down via `appendChild`/reinsertion on every
one of those redundant passes reset the animation loop every time — it never got past its first
fraction of a cycle. This is also, per team-lead, the same underlying category as iteration 1's
duplicate-bubble bug (`li.replaceChildren()` there treated the symptom of unnecessary rebuilds,
not the cause).

**Fix, two parts:**
1. `#applyStep` now guards on `step === #lastStep` and returns immediately — `#reconcile` only
   ever runs when the step actually changed. (The `adapter` setter resets `#lastStep = null`
   first, since an adapter swap DOES need a fresh reconcile even at the same step.)
2. Typing indicators are no longer a single reused/`appendChild`-moved node. `draftIntervals()`
   walks the compiled timeline ONCE (forward fold, generic — asks "when was `state.draft`
   non-null", not "next post clears it", so it keeps working however core/fold.ts's clearing rule
   evolves) and returns one `[appearStep, vanishStep)` window per draft occurrence, each with the
   `MsgId` it follows. `connectedCallback` builds ONE stable `<li>` per window, at its real
   position in the flow (`insertBefore` the message that comes after it — built once, never
   moved again). `#reconcile` only ever flips `.hidden` on these nodes now — no `innerHTML`, no
   `appendChild`, matching what messages already did post-iteration-1.
3. Position + shape: it's a real `.cf-bubble`-shaped element with `data-dir` (left for inbound,
   right for outbound, same rule as `.cf-msg`) — not a floating pill at the end of the log.
   Numbers (5px dots, 3px gap, 1.2s cycle, .18s stagger) match
   `products/fovente-landingpage/src/styles/global.css:444-451` — adapted to `.cf-` tokens, not
   copied literally.

**Verification (team-lead's exact ask):** a test asserting the typing `<li>` is the SAME node
reference across two different `data-step` values while its window stays open — using a
dedicated script with a `flag` between the `draft` and the resolving `post` so the window spans
2 distinct steps (a 1-step-wide window would make the assertion pass vacuously via the guard
alone). Also verified LIVE in headless Chrome, past the point of just trusting the test: sampled
`Element.getAnimations()[0].currentTime` and computed `opacity` over ~1.3s of real playback —
`currentTime` advances continuously and `opacity` cycles 0.3→1.0→0.3 on schedule, confirming the
animation genuinely loops now (first attempt at this measurement raced the demo's own autoplay
and gave a false "frozen" reading — redone after autoplay settled, see below for the gotcha).

**Bundle-freshness gate (team-lead, second ask):** `demo/chat-sim.bundle.js` is committed (R-1
requires zero build step to open the demo) but nothing rebuilds it automatically, and the regen
command only lived in an HTML comment. Added `element/__tests__/bundle-freshness.test.ts`:
shells out to the esbuild CLI (not the JS API — that breaks under this suite's jsdom + `setup.ts`,
which mocks `window`) to rebuild `element/index.ts` to a temp file, byte-compares against the
committed file, fails with the exact regen command in the error message. Positive twin: truncate
the fresh build, assert the comparison catches it. Manually demonstrated both directions: appended
a stray line to the committed bundle, watched the test fail with the regen command, restored,
watched it pass again.

**Gotcha worth recording:** my first attempt to verify the animation loop live raced the demo
page's own `requestAnimationFrame(play)` autoplay — I set `data-step` manually via eval, but the
page's autoplay was still running in the background and immediately overwrote it, so I was
sampling a `hidden`/`display:none` node the whole time (which correctly shows a frozen
`getComputedStyle` and zero `getAnimations()` — that's not a bug, `display:none` elements have no
active animations). Redid it after autoplay settled to completion (`data-step` stopped moving) —
then the manual set stuck and the real measurement was possible.

49/49 chat-sim tests green (up from 44 — added the same-node-reference test, a guard-scenario
test, and the 2 bundle-freshness tests), typecheck clean.

## Iteration 2 — visual review (team-lead, DOM-measured, not eyeballed)

7 findings, all addressed:

1. **No left/right geometry** (measured: 17px apart in a 380px log). Root cause: `.cf-bubble`'s
   `max-width: 86%` alone lets a long message fill nearly the whole row from EITHER direction —
   capping isn't the same as reserving a gutter. Fix: `.cf-msg[data-dir]` now reserves 15% padding
   on the OPPOSITE side (`.cf-bubble` max-width relaxed to 100%, since the reserve does the real
   work) — direction is now legible regardless of content length.
2. **No header.** Added `.cf-head` (avatar-initial + name + status) to the element itself, per
   ChatDemo.astro's `.chat-head` — driven by `contact-name`/`contact-status` attributes, not
   hardcoded, so it's reusable outside this one demo script.
3. **No composer.** Added `.cf-composer` (visual-only — a real, operable one with mobile keyboard
   handling is `react/`'s T-007, not this wave's job) — closes the "reads as broken, not ended"
   gap.
4. **Tail not visible.** Investigated via computed style + a 4×-zoomed crop of the actual pixels —
   the tail IS rendering correctly (7×11px `::after`, correct clip-path, correct offset); it was
   just too small to read at the review's screenshot scale. No code change; confirmed with a crop
   saved during this session.
5. **Stamp placement inconsistent between short/long messages.** Real bug, not a design tension:
   `--cf-cs-pad` was a STATIC 44px fallback, but a stamp WITH a receipt glyph measures ~50px and
   one without measures ~31px (measured live) — one static reservation either under- or
   over-reserves depending on content. Fixed by adopting ChatDemo.astro's own mechanism exactly
   (`global.css`'s `measure()`: `stamp.offsetWidth + 10`, JS-computed): `#measurePad()` now sets
   `--cf-cs-pad` per message, per step, right after each reveal.
6. **Wallpaper read as a generic dot grid.** Replaced the polka-dot radial-gradient with a
   hand-authored inline SVG doodle pattern (a scatter of small line-glyphs), still zero external
   assets, tiled via `background-image: url("data:image/svg+xml,...")`.
7. **Arbitrary bubble width.** Resolved as a side effect of #1's fix — width now tracks content
   up to the reserved-gutter cap consistently in both directions, instead of both directions
   independently chasing an 86%-of-container ceiling.

Re-verified after: 44/44 chat-sim tests green, typecheck clean, fresh headless screenshot
(pre- and post-fix, both saved during session) confirms all 7 visually.

Also picked up mid-review: `core` fixed both draft-related bugs flagged below in iteration 1
(`draft.by` now populated, `post` now clears `draft`) — verified live, updated
`chat-sim-element.test.ts` to assert the corrected behavior, removed the now-stale disclosure
paragraph from the demo page.

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

- **Two bugs found in `core/**` (T-001, not mine to fix — `R` only on that cell) — both now FIXED
  by `core`, verified live during iteration 2:**
  1. `core/fold.ts`'s `draft` case dropped `SimStep.draft.by` (`state.draft.by` was always `''`) —
     `Ev`'s `draft` variant now carries `by: ActorId`.
  2. `core/fold.ts`'s `post` case didn't clear `draft` on landing — `post` now sets `draft: null`.
  Originally disclosed on the demo page itself so it wouldn't read as a `skin` defect; that
  disclosure paragraph is removed now that it's resolved.
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
