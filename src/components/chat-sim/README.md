# chat-sim

A deterministic, seeded chat-conversation simulator. You write a script — posts, typing drafts,
reactions, read receipts — and `chat-sim` renders it as a WhatsApp or Telegram conversation, in
React or with no framework at all, and screenshots it to **byte-identical PNGs** run after run.

It is built for two jobs that usually get solved twice: the animated chat mock on a marketing
landing page, and the real message thread inside a product. Both read the same `SimState` out of
the same pure core.

Three properties are the point of the thing:

- **Deterministic.** `(script, seed, channel, locale, tz)` fully determines the output, down to the
  bytes of a screenshot. There is no `Math.random`, no `Date.now`, no network call anywhere in the
  core.
- **The timeline is a fold, not an append.** Messages get edited, deleted, pinned and reacted to
  after they are posted. That is a state machine over stable ids, not a list you push onto.
- **A channel is an adapter, not a theme.** WhatsApp and Telegram differ *structurally* — where the
  tail sits, whether reactions overlay the bubble, whether a "delivered" state exists at all — and
  those differences live in data, not in `if (channel === 'telegram')` branches scattered through a
  renderer.

---

## Install

```bash
npm install github:cofoundy/ui
```

Everything lives under the `chat-sim` subpath. The main `@cofoundy/ui` barrel deliberately does not
re-export it.

| Subpath | What it is |
| --- | --- |
| `@cofoundy/ui/chat-sim` | Core + adapters + the React component |
| `@cofoundy/ui/chat-sim/styles.css` | The stylesheet. Required by both renderers |
| `@cofoundy/ui/chat-sim/element` | Importing it registers the `<cf-chat-sim>` custom element |

React 18 or 19 is a peer dependency, and only for the React entry point. `@cofoundy/ui/chat-sim/element`
pulls in no framework at all — enforced by a check that bundles the element entry point and fails
if `react` or `react-dom` shows up anywhere in the resulting import graph
(`node src/components/chat-sim/element/scripts/assert-no-react.mjs`, which carries its own positive
twin: the same probe run against a deliberately React-importing bundle must come back positive).

---

## Quick start — React

```tsx
import { ChatSim } from '@cofoundy/ui/chat-sim';
import type { SimScript } from '@cofoundy/ui/chat-sim';
import '@cofoundy/ui/chat-sim/styles.css';

const script: SimScript = [
  { k: 'draft', by: 'in', chars: 12, delayMs: 400 },
  { k: 'post', by: 'in', text: '¿Tienen mesa para 4 hoy 8pm?', delayMs: 900 },
  { k: 'post', by: 'out:ai', text: 'Sí — te la reservo. ¿A nombre de quién?', delayMs: 1200 },
  { k: 'receipt', id: 'm1', to: 'delivered', delayMs: 300 },
  { k: 'receipt', id: 'm1', to: 'read', delayMs: 800 },
  { k: 'react', id: 'm1', emoji: '👍', by: 'in', delayMs: 500 },
];

export function Demo() {
  return (
    <ChatSim
      script={script}
      channel="whatsapp"
      seed={7}
      mode="demo"
      contactName="Reservas"
      contactStatus="en línea"
    />
  );
}
```

`mode` picks between the two jobs:

- `mode="demo"` plays the script itself on an rAF playhead. The composer is visual only — nothing is
  listening for input. This is the landing-page mock.
- `mode="live"` renders the script's full history frozen at its last step, and swaps in a real
  `<textarea>` and send button with mobile keyboard handling (`visualViewport`, `100dvh`,
  safe-area insets, ≥44 px tap targets, ≥16 px input font). A message a visitor types folds onto the
  **same** `SimState` through the same reducer — there is no second state shape for live messages.

Optional props: `locale` (default `'es-PE'`), `tz` (default `'America/Lima'`), `t0`, `editedLabel`,
`className`, and — `live` only — `liveActorId`, `composerPlaceholder`, `onLiveSend`.

## Quick start — no framework

Importing the element subpath registers `<cf-chat-sim>` as a side effect; the tag *is* the API.

```html
<link rel="stylesheet" href="/path/to/@cofoundy/ui/src/components/chat-sim/styles.css" />

<cf-chat-sim
  channel="whatsapp"
  seed="7"
  t0="1789761600000"
  locale="es-PE"
  tz="America/Lima"
  contact-name="Reservas"
  contact-status="en línea"
>
  <script type="application/json">
    [
      { "k": "post", "by": "in", "text": "Hola! ¿Tienen mesa para el sábado a las 8pm?", "delayMs": 500 },
      { "k": "draft", "by": "out:ai", "chars": 18, "delayMs": 450 },
      { "k": "post", "by": "out:ai", "text": "¡Hola! Sí, tenemos disponibilidad. ¿Para cuántas personas?", "delayMs": 850 },
      { "k": "receipt", "id": "m1", "to": "read", "delayMs": 600 }
    ]
  </script>
</cf-chat-sim>
```

```js
import '@cofoundy/ui/chat-sim/element';

const el = document.querySelector('cf-chat-sim');
el.play();            // rAF playback
el.dataset.step = '3' // …or scrub by hand: data-step is the one public reveal knob
```

The script can also ride on a `script="[…]"` attribute; the inline `<script type="application/json">`
child wins when both are present. The element pre-renders the whole thread and reveals it by
toggling classes, so the conversation is in the DOM for crawlers with zero hydration, and **a frame
at step N is exactly N reveals applied** — never a re-instantiation.

Other attributes: `chrome`, `height`, `edited-label`, `reply-label`, `loop-pause-ms`, `badge-flag`,
`badge-on-label`, `badge-off-label`, `tag-icon`, `tag-label`. A runnable page using most of them is
in [`demo/index.html`](../../../demo/index.html).

---

## The script

A `SimScript` is a flat array of steps. `delayMs` is the gap *before* that step fires.

| Step | Shape |
| --- | --- |
| `post` | `{ k:'post', by, text?, media?, delayMs? }` |
| `draft` | `{ k:'draft', by, chars, delayMs? }` — the typing indicator |
| `edit` | `{ k:'edit', id, v, delayMs? }` |
| `delete` | `{ k:'delete', id, scope:'me'\|'all', delayMs? }` |
| `react` | `{ k:'react', id, emoji, by, remove?, delayMs? }` |
| `pin` / `unpin` | `{ k:'pin', id, delayMs? }` |
| `receipt` | `{ k:'receipt', id, to: DeliveryState, delayMs? }` |
| `read` | `{ k:'read', upTo: MsgId, delayMs? }` |
| `views` | `{ k:'views', id, n, delayMs? }` — Telegram channels |
| `flag` | `{ k:'flag', key, value, delayMs? }` — arbitrary UI state (a badge, a wallpaper) |

`post` steps get ids assigned in script order: `m0`, `m1`, `m2`… Every other step references one.
That is the whole id scheme — you write `id: 'm1'` the way you would write any stable identifier.

Under the hood the pipeline is three pure functions:

```ts
import { compile, seek, stateAtStep } from '@cofoundy/ui/chat-sim';

const timeline = compile(script, {
  seed: 7,
  channel: 'whatsapp',
  locale: 'es-PE',
  tz: 'America/Lima',            // required — it enters the digest
  t0: Date.UTC(2026, 0, 1, 9, 0, 0),
});

seek(timeline, 3200);            // SimState at virtual tick 3200
stateAtStep(timeline, 2);        // SimState after exactly 2 frames
timeline.digest;                 // hash(script, seed, channel, locale, tz)
```

`t0` is the conversation's epoch and it comes from the *script*, never from the clock. Timestamps
are formatted as `fmt(t0 + frame.t, locale, tz)`, which is why `tz` is mandatory rather than
inferred: two machines in two timezones must render the same pixels.

---

## Why the timeline is a fold, not an append

The obvious model for a chat is an append-only array plus a duration estimate. It breaks on the
first real requirement.

Telegram — and WhatsApp, and iMessage — **mutate messages that were already posted**: edit,
delete-for-everyone, pin, react, mark read. An append-only list cannot express "message 3 is now at
version 2 and carries a 👍", so every one of those becomes a special case bolted onto the side, and
the special cases do not compose.

So the model is:

```
state(t) = fold(events ≤ t)
```

over a table of messages keyed by stable `MsgId`. A mutation is just another event pointing at an
id. `applyEvent(state, ev)` is a pure, total reducer — an event targeting a message that does not
exist is a no-op, never a throw — with shallow copy-on-write on the map.

Two things fall out of this that are hard to retrofit:

**Scrubbing backwards costs exactly what scrubbing forwards costs.** There is no teardown and
re-instantiation, because the state at any tick is derived, not accumulated in place. `compile()`
snapshots the fold every 64 frames, so `seek()` binary-searches the tick index and then replays at
most 64 events from the nearest checkpoint:

```
i     = upperBound(keys, t)                         // O(log n)
state = fold(frames[checkpoint … i])                // ≤ 64 events
```

That bound is asserted directly by counting reducer calls, and there is a scaling twin in the suite:
seeking near the end of a 500-step script and a 5000-step script must cost the same number of fold
steps. A linear fold breaks both.

**There is no second model of time to drift against.** `Timeline.duration` is measured
(`frames.at(-1).t`), not estimated by a parallel function that can disagree with the renderer.
Playback is an rAF loop accumulating `dt · rate` — no `sleep`, no promises, so there is nothing
suspended to leak and nothing to cancel on a seek.

---

## Why the PRNG is positional

Timing jitter makes a scripted conversation feel typed rather than clocked. The lazy way to get it
is a seeded stream: one generator, drawn from as compilation walks the script.

That makes the whole script order-dependent. Add a step near the top, and every draw after it
shifts — so every message below moves, and a visual diff of a one-line script change is unreadable.

`chat-sim` draws **positionally** instead:

```ts
rand(seed, stepIdx, slot)   // = sfc32(hash(`${seed}:${stepIdx}:${slot}`))
```

The draw for step N does not depend on how many draws step N−1 made. Concretely: **editing step 3
does not move the jitter of step 40.** A script diff stays legible, a visual regression stays
attributable to the step that caused it, and compilation is reorderable and parallelizable because
no step's output depends on another's.

`rand` is deliberately *not* exported from the public barrel. Everything inside `chat-sim` imports
it directly from `core/prng`. Exposing it publicly would invite consumers to depend on draw order
and slot semantics, which are an implementation detail of `compile()`, not a contract.

---

## Channels are adapters

A `ChannelAdapter` is 17 fields of data describing how a channel behaves — **and it has zero
optional fields**. A slot that is not used gets an explicit value (`wallpaper: 'none'`), never a `?`.
An optional field is a deferred `if`, and the `if` always shows up in a renderer eventually.

```ts
import { getAdapter, validateScript } from '@cofoundy/ui/chat-sim';

getAdapter('whatsapp').deliveryStates;  // ['queued','sent','delivered','read','failed']
getAdapter('telegram').deliveryStates;  // ['queued','sent','read','failed']  ← no 'delivered'

getAdapter('whatsapp').tail;            // 'first'  — tail on the FIRST bubble of a run
getAdapter('telegram').tail;            // 'last'   — …and on the LAST one
getAdapter('whatsapp').reactions;       // 'overlay-below'  — overlapping the bubble
getAdapter('telegram').reactions;       // 'own-row'        — on a row of its own
```

The payoff is falsifiability. A script asking a channel for something it does not have does not
quietly render wrong — it fails to compile:

```ts
validateScript(script, 'whatsapp');
// []

validateScript(script, 'telegram');
// [{ code: 'unsupported-delivery-state',
//    msg: "'telegram' has no 'delivered' delivery state (has: queued → sent → read → failed)",
//    stepIdx: 3 }]
```

`validateScript` also rejects reaction emoji outside a channel's allowlist (Telegram publishes 73;
WhatsApp accepts any) and interactive message types a channel lacks (`buttons`, `list`).

### Adding a channel

1. **`core/types.ts`** — add the member to `ChannelId`.
2. **`adapters/<channel>.ts`** — export a `ChannelAdapter`. TypeScript will hold you to all 17
   fields with no escape hatch.
3. **`adapters/caps.ts`** — add the reaction allowlist entry. `REACTION_ALLOWLIST` is a *total*
   `Record<ChannelId, …>`, so step 1 makes this a compile error until you do; `null` means "any
   emoji accepted".
4. **`adapters/registry.ts`** — add it to the `ADAPTERS` map.

That is the whole procedure. **No renderer changes.** If you find yourself reaching for
`if (channel === 'yours')` in `element/` or `react/`, that is the signal that the adapter is missing
a field — add the field, not the branch. The interface was designed against three channels on paper
before it was written, and it was exactly that exercise that produced `bubbleTransport`
(iMessage mixes green SMS and blue iMessage bubbles in one thread, which breaks any
per-conversation model) and `senderKinds` (a binary human/bot flag cannot tell a forward from a
channel post, and that decides the tail).

`imessage` is a `ChannelId` with no adapter registered — `getAdapter('imessage')` throws by design,
rather than silently falling back to WhatsApp's look.

---

## Determinism

The guarantee: **the same `(script, seed, channel, locale, tz)` produces the same screenshot, byte
for byte, on any machine.** It is held up by four rules, each of which has a test that goes red when
it is broken.

1. `core/` contains no `Math.random`, `Date`, `fetch`, `window` or `document`. A test greps for
   them and names the offending file and token.
2. Randomness is the positional PRNG above, drawn at compile time.
3. `t0`, `locale` and `tz` are script data and all three enter the digest. `tz` is not optional —
   the same script in two timezones is a different render, and the digest says so.
4. Receipt glyphs are declared as semantic ids (`'clock'`, `'check'`, `'double-check'`, `'alert'`)
   and drawn as inline SVG. An earlier version baked literal characters like `'🕐'` into the
   adapter; those render through whatever emoji font the OS ships, so two machines produced two
   different pixel grids for the same state, and the byte-identical guarantee only ever held on the
   machine that was testing it.

The command that demonstrates it end to end — real headless Chrome, real screenshots, sha256 on
both sides:

```bash
npx vitest run src/components/chat-sim/capture/__tests__/determinism.test.ts
```

```
✓ two runs of the SAME (script,seed,channel,locale,tz) produce a byte-identical PNG
✓ gemelo positivo: changing ONLY the seed breaks the byte-compare
```

The second assertion matters as much as the first. A byte-compare that cannot be made to fail is
not evidence of anything, so the suite carries its own negative twin: change only the seed, and the
comparison **must** break. That twin is not a manual ritual performed once — it lives in the suite
as its own `it()` and re-proves itself on every run.

For the pure layer, with no browser involved:

```bash
npx vitest run src/components/chat-sim/core src/components/chat-sim/adapters
```

---

## Repo layout

```
core/       compile · fold · seek · playhead · prng      pure TS, no framework
adapters/   capabilities · registry · whatsapp · telegram
element/    <cf-chat-sim> custom element                 → static sites, zero framework
react/      <ChatSim>                                    → apps
capture/    headless CLI                                 → deterministic PNG/WebP
sound/      synthesized per-channel cue packs
```

The two renderers share no components — only the `SimState` the core emits. That is deliberate: it
is what lets the static-site path stay framework-free while the app path stays idiomatic React, and
a cross-DOM snapshot test compares the two so they cannot drift apart.

Sound is **synthesized** from declarative cue packs (oscillators, noise, per-layer envelopes), not
sampled. No recording from any real messaging app is bundled — those assets are copyrighted
regardless of how the surrounding code is licensed.

---

## Prior art

The engine was written from scratch after reading
[`rrortega/whatsimule`](https://github.com/rrortega/whatsimule) (MIT), an interactive WhatsApp
conversation simulator. We name it because we read it, not because we are required to: no code,
constants, or assets were copied, so MIT's attribution clause never attached here. The credit is
voluntary, and it is worth giving — it is a good demonstration of the problem, and reading it
saved us from discovering several requirements the hard way.

What we deliberately did **not** take, named as off-limits in the architecture spec *before*
implementation began: the nine-step contact-picker choreography, the `10→30→60→85→100` progress
ring, the cadence tables, and the five fictional contacts with their stock photos. The rule the
project ran under was that anyone who felt they needed a literal lift had to stop and escalate
rather than decide alone.

Where this design diverges:

- **Determinism is a contract, not a side effect.** Positional PRNG, script-supplied `t0`/`locale`/`tz`,
  a purity rule enforced over `core/`, and semantic icons instead of font glyphs — all so that a
  screenshot is reproducible across machines and CI can diff renders.
- **The timeline is a fold over stable ids** rather than an append-only list with a parallel duration
  estimator. That is what makes backwards scrubbing cost the same as forwards, and what makes
  edit/delete/pin/react ordinary rather than special-cased.
- **The channel is an adapter, not a skin.** The differences modeled are structural — delivery state
  machines, tail placement, reaction layout, timestamp placement, keyboard model — and a script that
  asks a channel for a state it does not have fails validation instead of rendering something
  plausible and wrong.

---

## License

MIT © 2026 Cofoundy SAC. See [`LICENSE`](../../../LICENSE).
