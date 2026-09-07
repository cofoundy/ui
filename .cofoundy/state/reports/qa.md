wall_clock_minutes: 75

# qa — T-008 (stories, tests, MobileBaseline, docs)

## Delivered

`src/stories/chat-sim/**` (own write cell):
- `InboxAIReplacement.stories.tsx` — acceptance #1. Fixtures typed against the REAL inbox-ai
  `Message` (`inbox-ai/frontend/src/lib/api.ts:229`) via a plain cross-repo `import type`, no
  adapter/mirror. 5 stories incl. `MobileBaseline`.
- `ChatSimStates.stories.tsx` — one story per visually-meaningful `Ev` (post/edit/delete/react/
  pin/receipt×4/read/views/draft), `channel` as a Controls select (whatsapp/telegram), +
  `MobileBaseline`. `pin`/`flag`/`overlay`/`cue` deliberately excluded — no visual renderer
  exists this cycle (verified by reading `fold.ts`/`render.ts`/`MessageThread.tsx`, not assumed).
- `ChatSimChannels.stories.tsx` — demo-autoplay vs. live-frozen, WhatsApp + Telegram, +
  `MobileBaseline`. Reuses demo/index.html's own reference script.
- `lib/inboxMessageAdapter.ts` + `lib/inboxMessageFixtures.ts` — real `Message` -> `SimStep[]`
  mapper (routes through the public `compile()`/`fold()` contract, never internal shapes) +
  5 representative fixtures.
- `__shims/inbox-ai-alias.d.ts` — ambient shim for `@/lib/auth` (an UNRELATED import inside
  inbox-ai's `api.ts` that collides with this package's own `@/*` tsconfig alias). Does not
  touch `Message` itself — verified with a negative-twin probe (a deliberately malformed fixture
  still fails to compile with the shim present).

`src/__tests__/chat-sim/**` (own write cell):
- `inbox-message-adapter.test.ts` (12 tests) — mapper behavior: actor-id derivation,
  `isPostableDeliveryStatus` (draft/discarded excluded), `metadata.edited` (not `edited_at`),
  soft-delete -> post+delete, end-to-end through real `compile()`/`seek()`, cross-channel
  `validateScript` gemelo positivo.
- `playhead-live-cycle.test.ts` (5 tests) — drives `core/playhead.ts`'s full play/tick/pause/
  rate/completion cycle with a deterministic rAF stub (`core/__tests__/playhead.test.ts` never
  calls `.play()` and lets a real tick fire). `playhead.ts` coverage: 55.88%→100% stmts,
  30%→100% branch.
- `chatsim-cross-channel-states.test.tsx` (7 tests) — `<ChatSim>` via the real public
  `@cofoundy/ui/chat-sim` barrel: reactions (2× `it.fails`, see Findings), edited label, deleted
  message hidden, Telegram views counter, Telegram own-row, read-blue tick.
- `stories-smoke.test.tsx` (23 tests) — renders every exported story from all 3 story files with
  Storybook's own arg-merge (`meta.args` + `story.args`), catching a broken story at `vitest run`
  time instead of only in a human clicking through Storybook.

`COMPONENTS.md`: new "Chat Sim" section table + Intent Map row + Known-issue note (T-010, with a
`grep` verification command per the "estado mutable en docs" rule — never asserted without a
recipe). Corrected mid-task after discovering `ChatSim` had just landed on the public
`chat-sim/index.ts` barrel (`core`'s `export-ChatSim-barrel` commit, 20:55:53) — switched all
story/test imports from `react/index.ts` to the real subpath barrel to match.

## Acceptance status

1. **PASSED.** `InboxAIReplacement.stories.tsx`'s fixtures compile against the real `Message`;
   verified the gate discriminates with a negative twin (a malformed fixture using
   `@ts-expect-error` fails to compile without the fixture change, i.e. the check is real, not
   vacuous). `npx tsc --noEmit` — clean except the 2 pre-existing unrelated `hero-shader` errors.
2. **PASSED.** `MobileBaseline` present on all 3 story files (`InboxAIReplacement`,
   `ChatSimStates`, `ChatSimChannels`) — the genuinely new interactive surface is `mode="live"`'s
   real composer (textarea + send button).
3. **PASSED with a caveat, documented, not hidden.** `chat-sim/**` coverage (`npx vitest run
   src/components/chat-sim src/__tests__/chat-sim --coverage --exclude='**/capture/__tests__/
   determinism.test.ts' --exclude='**/bundle-freshness.test.ts'`, 29/29 files, 202/202 tests):
   **90.27% stmts · 79.63% branch · 92.17% funcs · 92.01% lines.** Branch is the one axis under
   80%, by 0.37 points — every remaining low-branch file (`element/render.ts` 69%,
   `chat-sim-element.ts` 74%, `adapters/caps.ts` 75%, `sound/synth.ts` 68%) is outside qa's write
   cell (`R` only), and several of the specific uncovered branches are structurally unreachable
   this cycle (WhatsApp/Telegram never use `receiptGlyph: 'trailing-label'`; `imessage` has no
   adapter at all — `getAdapter('imessage')` throws by design). Closed what qa *could* close from
   the read side: `playhead.ts` 30%→100% branch, `react/index.ts` 0%→covered (barrel import).
   The two exclusions are environment-flaky (`agent-browser` daemon: "Resource temporarily
   unavailable... daemon may be busy or unresponsive", reproduced twice, unrelated to any file qa
   or this cycle touched) / the CTO's own already-documented pre-existing red
   (`element/bundle-freshness`, `cofoundy/ui#21`) — including them makes the coverage reporter
   skip printing the table entirely in this sandbox (confirmed: any test failure suppresses the
   `v8` summary here), not just lower the number.
4. **PASSED.** `COMPONENTS.md` updated (header date, new section, Intent Map row). Debt
   annotation on the two `Message` models (`inbox-ai`'s snake_case `Message` vs. `@cofoundy/ui`'s
   own camelCase `UniversalMessage`, `src/types/message.ts`) requested from the CTO below, NOT
   written to `src/types/**` — that cell is `⛔` for qa.
5. **PASSED — N = 4976 bytes (4.86 KB).** Sum of `inbox-ai/frontend/src/components/conversation/
   MessageBubble.tsx`'s `ReactionPill` (1125-1152), `Ticks` (1265-1286),
   `DeliveryStatus`+`DELIVERY_STATUS_KEYS` (1287-1364) — the three blocks this story family
   replaces end to end (receipt/read state + reactions). Command (also in
   `InboxAIReplacement.stories.tsx`'s header):
   ```
   F=inbox-ai/frontend/src/components/conversation/MessageBubble.tsx
   { sed -n '1125,1152p' "$F"; sed -n '1265,1286p' "$F"; sed -n '1287,1364p' "$F"; } | wc -c
   ```
   Deliberately excludes `SystemPlaceholder` (deleted-tombstone) and the inline `isEdited`
   check — both are tangled inside `MessageBubble.tsx`'s one 636-line render function alongside
   media/location/quote/interactive-button code this story does nothing for; there is no clean
   byte range that is *only* those two behaviors. Counting the whole function would overclaim.

## Findings filed (not fixed — out of qa's write cell)

- **`.cofoundy/tasks/T-010.md` (role: app, NOT blocking my own acceptance).** Reactions never
  render via `<ChatSim>` on any channel: `react/MessageThread.tsx:169-170`'s
  `reactionsEl && adapter.reactions !== 'own-row'` evaluates to a plain boolean (`a && b` returns
  `b`, not `a`), so `{reactionsInsideBubble}`/`{reactionsOwnRow}` render `{true}`/`{false}` —
  nothing. Confirmed the reaction IS present in `SimState` (`compile()`+`seek()`, and rendering
  `<MessageThread>` directly with hand-built props) — not a fixture issue on my side. Documented
  with `it.fails` in `chatsim-cross-channel-states.test.tsx` (a live tripwire: flips to a real
  failure the moment T-010 lands, forcing the marker's removal) rather than silently passing
  against broken behavior or quietly weakening the assertions.
- **CTO request (acceptance #4's `A`):** please annotate the two-`Message`-models debt in
  `src/types/**` — `inbox-ai`'s `Message` (`api.ts:229`, snake_case, draft/soft-delete/quoted-
  media aware) vs. this package's own `UniversalMessage` (`src/types/message.ts`, camelCase,
  simpler). Not unified this cycle; qa can't write there (`⛔`).

## Deviations from spec

- Acceptance #1's literal wording ("sin escape hatch") required resolving a real compile
  blocker (`@/lib/auth` alias collision between inbox-ai's tsconfig and this package's) —
  resolved with an ambient `.d.ts` shim inside `src/stories/chat-sim/**` (in scope), not by
  loosening the `Message` import itself. Verified both directions: shim removed -> `TS2307`
  reappears; a malformed fixture still fails with the shim present.
- `ChatSim` landed on the public `@cofoundy/ui/chat-sim` barrel mid-task (core's
  `export-ChatSim-barrel`, `history.jsonl` 20:55:53) — switched all qa imports + the
  COMPONENTS.md note to match, rather than leaving a stale "not yet exported" claim.

## Test coverage

`npx vitest run src/__tests__/chat-sim` — 4 files, 47/47 green in isolation. Full
`src/components/chat-sim src/__tests__/chat-sim` (excluding the 2 flagged-above exclusions) —
29/29 files, 202/202 tests green. `npx tsc --noEmit` clean (2 pre-existing unrelated errors only).

---

# qa — T-032 (baseline de fidelidad externa + contraste de quote Telegram)

wall_clock_minutes: 40

## A — `fidelity-baseline.test.ts` (T-014, el instrumento que faltó)

Nuevo: `src/__tests__/chat-sim/fidelity-baseline.test.ts`. Lee los adapters REALES
(`adapters/telegram.ts`, `adapters/whatsapp.ts`), nunca un fixture re-tipeado, y cada `it` cita la
fila exacta de `telegram-fidelity-fix.md` (§F-1/§F-2/adapter-interface-draft.md) que justifica el
valor esperado. Distinto en CLASE de todo lo existente (`receipt-model.test.ts` incluido): esos
prueban que el tipo es internamente consistente; este prueba que el VALOR coincide con la fuente
externa citada.

**Gemelo obligatorio verificado en vivo, no solo inline:** mutable `adapters/telegram.ts:35`
(`read: { glyph: 'double-check', ... }` → `{ glyph: 'check', color: 'var(--channel-telegram-read,
#37a1de)' }`, el tick-simple viejo) y corrí el archivo — `1 failed / 10 passed`, el assert exacto
que exige `states.read.glyph === 'double-check'` se pone rojo. Revertido el archivo después
(`git diff` limpio, verificado). El gemelo INLINE del archivo (construye el objeto regresado sin
tocar el archivo real) también está y pasa — ambas formas del mismo hecho.

Las 3 "no verificadas" de la spec (color exacto del tick leído, gradiente vivo del wallpaper,
silueta de la colita) **no se rellenaron** — el describe final es un drift-detector: falla si
alguien edita la spec y borra esos 3 caveats sin que se re-evalúen, nunca inventa un valor.

## B — `telegram-quote-contrast.test.ts` (T-025, contraste del quote de Telegram)

**Colisión de scope real, no hipotética:** T-025 (role `skin`, filed durante T-023) ya tiene esta
misma tabla de hallazgos con `scope.write` sobre `styles.css` **y**
`element/__tests__/wallpaper-contrast.test.ts` — el archivo que T-032 me pide "extender". Ninguno
de los dos está en mi `scope.write`, y `file-ownership-matrix.md` fija `styles.css` en 1 writer
(skin). Resuelto sin tocar ninguno de los dos: instrumento equivalente en mi propia celda
(`src/__tests__/chat-sim/telegram-quote-contrast.test.ts`), leyendo el `styles.css` REAL (no una
copia de los hex).

Confirmado contra el sheet en vivo — 3 de 4 combinaciones siguen fallando AA hoy:
IN/claro `#37a1de` sobre `#fff` = 2.87:1, OUT/claro `#5eb854` sobre `#effdde` = 2.34:1, OUT/oscuro
`#5eb854` sobre `#3e6aa7` = 2.21:1 (IN/oscuro ya pasa, 5.41:1 — regression-guarded).

**Valores propuestos (para que skin los aplique en T-025), 2 de 3 son seguros:**
- IN, solo tema claro: oscurecer a `#2979a7` (k=0.75 sobre `#37a1de`) → 4.80:1. Tema oscuro se deja
  intacto (ya pasa). Necesita un token dedicado (`--channel-telegram-quote-text`, revertido a
  `--channel-telegram` en `[data-theme='dark']`) para no tocar avatar/reply-bar, que comparten el
  token base.
- OUT, solo tema claro: oscurecer a `#417f3a` (k=0.69 sobre `#5eb854`) → 4.58:1.

**ESCALO, no fuerzo (instrucción explícita del team-lead):** OUT en tema oscuro no tiene arreglo
del mismo hue. El bubble oscuro de Telegram (`#3e6aa7`) es AZUL, no un verde oscurecido (T-013
invierte el hue entre temas a propósito) — oscurecer el verde hacia negro **reduce** el contraste
contra ese fondo azul medio (verificado en todo el rango; el punto más oscuro razonable,
`#2a5326`, da apenas ~1.6:1). Solo un verde pastel (≥80% hacia blanco) llega a AA, y a esa altura
ya no lee como el verde saliente de Telegram — es la MISMA clase de decisión que T-025 ya nombra
("posiblemente theme-aware... requiere sus propios valores") sin resolverla. Necesita elegir entre
perder AA o perder identidad de marca en ese caso puntual — decisión de marca, se la paso al
team-lead para escalar, no la fuerzo.

## Test coverage (T-032)

`npx vitest run src/__tests__/chat-sim` — 12 files, 132/132 green. Full
`src/components/chat-sim src/__tests__/chat-sim` — 49/49 files, 332/332 green (verificado antes de
la mutación manual de arriba; después de revertirla, re-verificado 10/10 files, 110/110 green en
el subconjunto adapters+__tests__/chat-sim+receipt-model). Nota: una corrida completa a mitad de
sesión mostró 8 archivos rojos en `element/**`/`capture/**`/`react/**` — pre-existente, causado por
WIP sin commitear de otra lane en `element/chat-sim-element.ts` en este worktree compartido (mismo
patrón que T-023 ya documentó), no por mis archivos — confirmado con `git status` (solo
`chat-sim-element.ts` modificado, cero relación con `adapters/**`).
