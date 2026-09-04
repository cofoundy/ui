wall_clock_minutes: 15

# T-001 — core: timeline mínima + playhead

## Entregado
- `src/components/chat-sim/core/types.ts` — capa de tipos del contrato: `Tick`, `MsgId`,
  `ActorId`, `SoundId`, `Json`, `ChannelId`, `DeliveryState`, `ChannelAdapter` (16 campos, cero
  opcionales), `Diagnostic`, `SimStep`/`SimScript`, `Ev`, `Frame`, `MsgState`, `Draft`, `Overlay`,
  `SimState`, `Timeline`, `CompileOptions`. Cero imports — hoja del árbol de módulos.
- `core/prng.ts` — `rand(seed, stepIdx, slot)` posicional (xmur3 → sfc32).
- `core/digest.ts` — `digestOf(input)` hash determinista, cero deps.
- `core/fold.ts` — `initialState()` / `applyEvent()`. Implementa `post`/`draft`/`flag` (alcance de
  esta tarea); `edit`/`delete`/`react`/`pin`/`receipt`/`read`/`views`/`overlay`/`cue` caen a
  no-op (T-003, mismo dueño).
- `core/compile.ts` — `compile(script, opts): Timeline`. `tz` obligatorio (fix §13), entra al
  digest. `duration` medida (`frames.at(-1).t`), sin estimador paralelo.
- `core/seek.ts` — `seek(tl, t): SimState`, puro, binary search sobre `keys`.
- `core/playhead.ts` — `createPlayhead(tl)`: `play/pause/rate/onFrame` sobre rAF.
- `core/__tests__/*.test.ts` (6 archivos, 22 tests) — cubren los 6 criterios de acceptance.
- `src/components/chat-sim/index.ts` — barrel del subpath (`@cofoundy/ui/chat-sim`).
- `package.json` — solo `exports["./chat-sim"]` agregado.

## Acceptance (falsable) — status
1. `npx vitest run chat-sim/core` → **verde**, 6 files / 22 tests. (Nota: el repo usa `npm`, no
   `pnpm` — sin `pnpm-lock.yaml` ni `pnpm-workspace.yaml` en todo `~/cofoundy`; corrí el mismo
   comando vía `npx vitest`, resultado idéntico.) **passed**
2. `seek(tl,t)` dos veces mismo `t` ⇒ deep-equal — `seek.test.ts`. **passed**
3. Digest cross-machine: distinto `tz` ⇒ digest distinto; mismo `tz` ⇒ digest idéntico —
   `compile.test.ts`. **passed**
4. `duration === frames.at(-1).t` — `compile.test.ts`. **passed**
5. `ChannelAdapter`/`Diagnostic` exportados desde `core/types.ts`, consumibles sin tocar
   `adapters/**` — `exports.test.ts` (typecheck) + `npx madge --circular src/components/chat-sim`
   → "No circular dependency found!" (15 files procesados). **passed**
6. Lint de purity activo — ver Desviación abajo. Demostrado en rojo (commit temporal con
   `Math.random()` en `compile.ts`, test falló) y revertido (`git diff` limpio, test vuelve a
   verde). **passed**

## Desviación de spec (documentada, con rationale)
**Invariante 4 (purity) implementado como test vitest estático, no ESLint.** El repo no tiene
ESLint instalado ni configurado en ningún lado (`npm run lint` referencia un binario ausente,
cero `eslint.config.*`/`.eslintrc*`). Agregar `eslint` como devDependency toca
`package.json.devDependencies`, y `T-001.scope.write` restringe `package.json` a **solo el campo
`exports`**. Resolví con `core/__tests__/purity.test.ts`: escanea `core/**/*.ts` (comentarios
stripeados) contra los globals bloqueados, corre con el mismo comando que ya gatea el criterio
#1, y quedó demostrado en rojo/verde. Filé `E-001` (`non_blocking`) documentando el trade-off —
`file-ownership-matrix.md` da a `core` la W exclusiva sobre "eslint rules del ciclo (invariantes
4 y 5)", e invariante 5 (Tailwind ban) es acceptance criterion de T-002 (skin, misma ola 1) — va
a pegar contra la misma restricción cuando skin lo necesite.

## Otras notas
- `npm install` en el worktree corrigió un drift preexistente en `package-lock.json` (version
  `0.4.0` → `0.6.1`, ya desincronizado de `package.json` antes de esta tarea) — revertido
  (`git checkout -- package-lock.json`) por estar fuera de `scope.write`; no comiteado.
- `typecheck` (`npx tsc --noEmit`): 0 errores en `chat-sim/**`. Los 2 errores preexistentes que
  arroja son de `hero-shader/*.tsx`, no tocados por esta tarea.
- Commit `942383e` en `cto/chat-sim-rewrite`, pusheado a `origin`. Worktree compartido con
  `skin` (`element/**` apareció sin commitear durante la tarea, no tocado — `git add` explícito
  por paths, nunca `-A`).

---

wall_clock_minutes: 20

# T-001 reactivación — fold.ts: draft no se limpiaba + perdía el actor

Dos bugs que `skin` encontró en vivo en el demo (ver mensaje del team-lead). Fix en
`core/fold.ts` + `core/compile.ts` + `core/types.ts`:
1. `post` ahora limpia `draft: null` — la burbuja de "escribiendo…" ya no queda colgada.
2. `Ev.draft` pasó de `{idx:number, chars}` (mi primer intento, equivocado — un registro de
   actores por índice que nadie más necesitaba) a `{by:ActorId, chars}` — enmienda al contrato
   (`api-contract.md`), ya anotada por el CTO con verificación de mutación propia.

Verificado en rojo (git-stash del fix ⇒ 5 aserciones fallan) y en verde (27/27 en `core`).
Commit `a2f899c`, pusheado. Efecto colateral en el test de `skin` (`data-drafting` value)
flagueado directo a `skin` — no tocado, `element/**` no es mi scope.

---

wall_clock_minutes: 25

# T-003 — core: fold completo + checkpoints + seek O(log n + 64)

## Entregado
- `core/fold.ts` — `applyEvent` gana `edit`/`delete`/`react`/`pin`/`unpin`/`receipt`/`read`/
  `views`. Todos no-op sobre un id desconocido (fold total, nunca throws). `overlay`/`cue`
  siguen no-op — `cue` por diseño (arch §1: "emitido, no aplicado por el reducer"), `overlay`
  sin dueño asignado todavía (no es de esta tarea).
- `core/types.ts` — `SimStep` gana las 8 variantes correspondientes, estructuralmente
  idénticas a su `Ev` (+ `delayMs`): referencian un `MsgId` ya asignado por `post`, no asignan
  uno nuevo.
- `core/compile.ts` — `checkpoints[]` cada `CHECKPOINT_INTERVAL=64` frames (`checkpoints[k]` =
  estado tras exactamente `64k` frames).
- `core/seek.ts` — reemplaza el fold-desde-cero de T-001 por `checkpoints[i>>6]` + fold del
  remanente (<64 frames). `seekFoldSteps()` nueva (hook de verificación, no firma pública) para
  contar pasos de fold reales en vez de medir reloj.
- 3 archivos de test nuevos/ampliados: `fold-extended.test.ts` (10 tests), `seek.test.ts`
  (+5 tests), `fold.test.ts` intacto.

## Acceptance (falsable) — status
1. Seek adelante/atrás mismo `t` ⇒ deep-equal (ya cubierto T-001) + **gemelo anti-aliasing**:
   dos `t` en frames distintos ⇒ estados distintos — `seek.test.ts`. **passed**
2. `react` sobre mensaje posteado se refleja tras `seek` posterior + **gemelo negativo**: `seek`
   a un `t` anterior al `react` ⇒ la reacción no está — `seek.test.ts`. **passed**
3. **Contador de pasos de fold** (no reloj): `seekFoldSteps` ≤ `CHECKPOINT_INTERVAL` (64) para
   guiones de 10/500/5000 pasos. Escalado 500 vs 5000: mismo orden de pasos (no lineal) —
   `seek.test.ts`. **passed**. Verifiqué el instrumento en rojo: reemplacé `seek.ts` por un fold
   lineal sin checkpoints → 500 y 5000 pasos respectivamente (el fallo exacto que la task
   advertía); restaurado y confirmado verde.

## Notas
- `npx vitest run chat-sim/core`: 8 files / 42 tests, verde. Suite completa del repo: 572/574 —
  los 2 rojos son heredados (`ChatInput` de `main`, no relacionado) y el gate de frescura del
  bundle de `demo/chat-sim.bundle.js` (esperado: mi cambio en `core/**` invalida un bundle que
  bundlea `core/**` transitivamente; el CTO ya dispuso que `skin` lo regenera como último paso
  antes del merge — no es mi scope.write, no lo toqué).
- `tsc --noEmit`: 0 errores en `chat-sim/**` (los 2 que arroja son preexistentes de
  `hero-shader/*.tsx`, no tocados).
- Mis cambios quedaron co-commiteados con un commit de documentación del CTO (`984bc54`) — el
  CTO stasheó mi WIP no commiteado para aislar un rojo propio (riesgo que documentó en
  `_cto-index.md`) y el pop los reincorporó junto con su commit. Confirmé `git diff HEAD --
  core/` vacío: nada se perdió ni se mezcló mal. Pusheado.

---

wall_clock_minutes: 20

# Promoción — stateAtStep/draftIntervals a core + bugfix t0

Pedido directo del team-lead (desbloquea `app`, T-007). Entregado:
- `core/seek.ts`: `stateAtStep(tl,n)` promovido desde `element/chat-sim-element.ts`, ahora
  usando la misma máquina de checkpoints que `seek()` (`foldFromCheckpoint` compartido) — gana
  el mismo bound O(log n + 64), no solo un copy-paste.
- `core/draft-intervals.ts` (nuevo): `draftIntervals(tl)` + tipo `DraftInterval`, promovido
  igual. Sin el campo `li: HTMLLIElement` de la copia de `skin` — eso es bookkeeping de DOM,
  queda local a `element/` cuando `skin` cambie a consumir esto (no lo toqué, fuera de mi scope).
- `index.ts`: exporta ambos + `DraftInterval`.

## Bug real encontrado (no buscado, apareció al escribir el test de acceptance #3)
`compile.ts` calculaba `Frame.t = t0 + offset` (absoluto). `architecture-v1.md §1` formatea con
`fmt(t0 + f.t, ...)` — fórmula que solo es válida si `f.t` EXCLUYE `t0`. `element/`'s
`formatTime` ya asumía esto último correctamente ⇒ el timestamp mostrado en el demo suma `t0`
DOS veces. También explica por qué `keys` es `Int32Array`: un epoch real (~1.7e12) desborda
Int32; solo offsets relativos chicos entraban. Todos los tests previos usaban `t0:0`
(absoluto==relativo, oculta el bug). Encontrado al escribir un test con epoch real para
acceptance #3 (`stateAtStep` vs `seek` debían coincidir y no coincidían — Int32Array desbordado
daba `keys` corruptos). Fix: `clock` arranca en `0` en `compile()`, `virtualT` arranca en `0` en
`createPlayhead()`. Verificado en rojo (revertí compile.ts, corrí compile.test.ts, ticks
volvieron a `~1.7e12+offset`) y en verde. Test de regresión directo agregado.

## Acceptance — status
1. Ambas exportadas desde `core/`, consumibles sin importar `element/**` — `queries.test.ts`
   importa desde `../../index` y `../seek`/`../draft-intervals` directamente. **passed**
2. Lint de pureza sigue verde — `purity.test.ts` escanea todo `core/**/*.ts`, cero cambios
   necesarios. **passed**
3. `stateAtStep(tl,n)` coincide con `seek(tl,t)` en el `t` de ese frame, para cada `n` del
   guion + gemelo de sensibilidad (no ambos triviales) + clamping — `queries.test.ts`.
   **passed**

50/50 en `core`. Repo completo: 626/629 — los 3 rojos son los 2 gates de frescura de bundle
(esperados: mi cambio en `core/**` invalida bundles que `skin`/`capture` bundlean
transitivamente; ya dispuesto por el CTO que ellos regeneran al mergear) + `ChatInput`
(heredado de `main`, no relacionado). `tsc --noEmit`: 0 errores en `core/**`. Commit `0c86277`,
pusheado.

---

wall_clock_minutes: 10

# Export de ChatSim en el barrel público

Pedido de dos líneas del team-lead. `index.ts` gana `export { ChatSim } from './react'` +
`export type { ChatSimMode, ChatSimProps } from './react'`. Test nuevo
(`chatsim-barrel-export.test.ts`) importa SOLO del barrel público y falla si `ChatSim` no está —
verificado en rojo (quité las dos líneas, el test falló) y verde.

## Hallazgo bloqueante (NO arreglado acá — fuera de mi scope.write)
Al correr `madge --circular` de rutina encontré un ciclo real que MI cambio cierra (no lo crea
por sí solo, lo revela):
`index.ts → react/index.ts → ChatSim.tsx → MessageThread.tsx → engine.ts → ../index`

`react/engine.ts` importa `draftIntervals`/`stateAtStep` desde `'../index'` (el barrel) en vez
de directo desde `'../core/seek'` + `'../core/draft-intervals'` (donde realmente viven), y
además los re-exporta. Cualquier export nuevo de `react/**` que aterrice en `index.ts` cierra
este mismo ciclo — no es específico de `ChatSim`. `react/**` es celda `W` de `app`, no la toco.
Flagueado directo al team-lead (mensaje, no task file — es un fix de una línea, más rápido
rutearlo a `app` en el momento).

52/52 en `core` con el export puesto. `tsc --noEmit`: 0 errores en `core/**`. Commit `089989f`,
pusheado.
