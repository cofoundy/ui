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
