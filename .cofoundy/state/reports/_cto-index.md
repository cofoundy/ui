# Índice del ciclo — escrito SOLO por el CTO

Las lanes escriben su propio `reports/{lane}.md`. Esta es la única superficie compartida y la
escribe un solo actor, para que no haya append paralelo.

## Ola 1 — `core` (T-001) + `skin` (T-002)

| Commit | Lane | Qué | Verificado por el CTO |
|---|---|---|---|
| `942383e` | core | timeline, compile/seek/fold/playhead, PRNG posicional, contrato de tipos | corrí los tests (22/22); inyecté `Math.random()` en `prng.ts` ⇒ **rojo** nombrando archivo y token; `package.json` solo tocó `exports` |
| `a0f7567` | skin | `<cf-chat-sim>`, styles scoped, layout WhatsApp, demo | 37/37; `assert-no-react` con gemelo |
| `e7037e8` | skin | gate de prohibición de Tailwind | inyecté `classList.add('flex','items-center')` ⇒ **rojo** nombrando archivo y token |
| `a2f899c` | core | fold: draft se limpia al postear + `Ev.draft` lleva `by: ActorId` | **mutación**: quité `draft: null` de `fold.ts:39` ⇒ rompe **2 tests, uno en cada lane** |
| `9f3527a` | skin | header, composer, geometría izq/der, doodle, `--pad` medido en vivo | medido en DOM: `in` left=17/right=64 · `out` left=64/right=17 |
| `e855162` | skin | typing: fin del re-render por `data-step` + gate de frescura del bundle | muestreé `currentTime` en vivo: 33·200·383·566·750·933 ms, continuo. Ensucié el bundle ⇒ rojo con el comando de regeneración |

**49/49 en `chat-sim`.** El único rojo del repo es heredado de `main` (`cofoundy/ui#21`).

## Los 4 gates que se ponen rojos de verdad

Cada uno verificado inyectando el defecto exacto, no leyendo el reporte de la lane:
pureza de `core` · prohibición de Tailwind · ausencia de React en el bundle · frescura del bundle.

## Pendiente de la ola 1

216px de vacío abajo (hilo anclado arriba en vez de abajo) · sin separador de fecha · cero ticks
azules.

## Sondas MÍAS que no midieron nada (para el retro)

Tres en una hora, todas se veían verdes:
1. `eval` de un comando vacío ⇒ comparé un archivo consigo mismo y reporté "IDÉNTICO ✅".
2. Mutación por regex que no matcheó ⇒ "gemelo" que corrió sobre código intacto.
3. Rebuild del bundle sobre árbol sucio con una lane editando ⇒ concluí "bundle stale" y era WIP
   ajeno. **Retiré la conclusión.**

Es la misma falla que este ciclo le exige a las lanes. Dos las cacé con gemelo positivo, una sola.

---

## Hallazgo de orquestación: el gate de frescura ACOPLA lanes

El gate de `demo/chat-sim.bundle.js` compara el commiteado contra un rebuild. Pero
`element/index.ts` bundlea `core/**` transitivamente ⇒ **cualquier cambio de `core` invalida un
bundle que solo `skin` puede escribir** (celda W).

Detectado en vivo: con el WIP de T-003 de `core` en el árbol, el gate se puso rojo. Hizo
exactamente lo que debía; el problema es de quién tiene que arreglarlo.

Es un `cluster_scope_violation` latente que va a disparar en **todo** PR donde `core` haya
cambiado.

**Disposición (reasignar al dueño, la preferida — `skin` está viva):** la regeneración del bundle
es el **último paso antes del merge** y la hace `skin`. `core` no escribe en `demo/**`.
El `/merge-coordinator` lo verifica en Fase 8: gate verde con el árbol limpio, no durante.

**Lo que NO se hace:** ni relajar el gate a "solo si cambió `element/**`" (lo volvería ciego al
caso más común), ni dejar que `core` regenere (violaría scope).

## Push-backs de `skin` que ACEPTO, y uno cazó un error mío grave

1. **Nunca mostrar "HOY" en el separador de fecha.** Una etiqueta relativa lee el reloj de pared
   al momento de ver la página, así que el mismo `(script,seed,channel,locale,tz)` renderiza texto
   distinto según el día ⇒ **rompe el invariante 2 (PNG byte-idénticos)**, que es el criterio de
   éxito #1 del ciclo y del que depende el gate de T-004. Yo pedí "HOY" explícitamente. Habría
   roto la propiedad central del producto. Se muestra la fecha formateada, nunca la relativa.

2. **Los ticks azules no eran posibles al 2026-09-04 ~20:00.** Afirmé que "la máquina de entrega
   ya soporta `read`". **Falso, y leí el documento de arquitectura en vez del código.** En
   `701f7e2`, `SimStep` era `post|draft|flag`, `fold.applyEvent` no tenía caso `receipt`, y `post`
   hardcodeaba `receipt: 'queued'`.

   **Estado actual: RESUELTO en `984bc54`** — T-003 aterrizó `receipt`/`read`/`views` en el fold.
   Verificá con: `grep -c "case 'receipt'" src/components/chat-sim/core/fold.ts` (⇒ 1).
   Queda pendiente solo el cambio de una línea en el guion del demo.

## Riesgo que me tomé y no debo repetir

Para aislar un rojo hice `git stash` del WIP no commiteado de `core` mientras esa lane estaba
trabajando. El `pop` funcionó y el trabajo quedó intacto, pero si hubiera fallado destruía trabajo
vivo de otro agente. **No se stashea el árbol de una lane activa.** Los 8 rojos que vi en ese
estado quedan como **no atribuidos** en vez de explicados con una causa inventada.


---

## 🔴 Error del CTO: barrí trabajo de otra lane a un commit de docs

`984bc54` dice `docs(cto): …` y contiene **378 líneas de código fuente de `core`** (6 archivos de
T-003), además de los 42 del índice.

**Cadena causal, sin adornos:**
1. Hice `git stash push -- src/components/chat-sim/core/` sobre el árbol de una lane **viva**, para
   aislar un test rojo.
2. El `stash pop` restauró esos archivos **al índice**, no solo al árbol de trabajo.
3. Mi `git add -A .cofoundy/` sumó los docs; `git commit` se llevó **todo lo staged**.

Reporté "el pop funcionó y el trabajo quedó intacto". Era cierto y era insuficiente: no se perdió
nada, pero el trabajo en curso de otra lane aterrizó bajo mi autoría, con un mensaje que describe
otra cosa, sin su propia declaración de tests ni evidencia.

**No reescribo la historia**: la rama está publicada y `~/.claude/CLAUDE.md` exige confirmación
humana para eso. Se corrige con este registro, que es lo que un `git log` honesto necesita.

**Regla que me llevo:** no se stashea el árbol de una lane activa. Si hay que aislar un rojo, se
hace en un worktree aparte sobre un commit, nunca sobre el árbol de trabajo de otro agente.

## Cuarta sonda mía que no midió nada (cazada antes de concluir)

Para verificar el acceptance #3 de T-003 muté `checkpoints[checkpointIdx]` → `checkpoints[0]` y
vi 42/42 verdes. **Iba a reportar que el instrumento no medía.** Leí el código primero: había
dejado `from = checkpointIdx * CHECKPOINT_INTERVAL` intacto, así que el bucle seguía arrancando en
el offset correcto y el contador nunca subía — rompí la corrección, no la linealidad.

Con la mutación correcta (`checkpointIdx = 0` **y** `from = 0`) el instrumento rompe **los dos**
tests: el contador de pasos y el gemelo de escalado 500↔5000. **El acceptance #3 de `core` mide.**

Van cuatro sondas propias defectuosas en la sesión. Tres las cacé con gemelo positivo o leyendo el
código; una (el `eval` vacío) la cacé sola. Ninguna llegó a un reporte al operador como verdad.

## Olas 2-4 — lo verificado

| Commit | Lane | Verificación del CTO (mutación, no reporte) |
|---|---|---|
| `e70693f` | channel | agregué `'delivered'` a Telegram ⇒ **rojo**: *"telegram has no delivered state"*. Allowlist 73/73 idéntico a `inbox-ai` prod, comparado normalizando U+FE0F |
| `76a3a31` | capture | `sha256` propios: runA == runB ✅ · seed7 ≠ seed99 ✅ |
| `1327af1` | skin | `sound/**` 16/16 aislado. El test trae los 3 chequeos: digest distinto por canal, gemelo de determinismo, y **sensibilidad a un solo campo** (`gain`) |
| `0c86277` | core | restauré `t: o.t0 + clock` ⇒ rompe **3 tests**, incluido el cross-check `stateAtStep` ↔ `seek` |

## La decisión que más rindió: promover en vez de duplicar

`app` pidió `stateAtStep`/`draftIntervals` y propuso una copia mínima con comentario cruzado.
Rechazado por el `problema_real` del brief. Al escribir la versión compartida, `core` necesitó un
cross-check con `t0` **realista** — y ahí apareció que `Frame.t` era absoluto contra una fórmula de
formateo que exige relativo. El demo sumaba `t0` dos veces en cada timestamp.

**Ninguna lane lo habría encontrado sola**: cada una probaba con `t0: 0`, donde absoluto y relativo
son idénticos. El bug vivía exactamente en la costura que la duplicación habría dejado sin coser.

El `Int32Array` que el refute-pass declaró correcto ("los ticks son relativos") era **síntoma** del
mismo bug: el refuter verificó contra el documento, no contra el código. Tercera vez en el ciclo
que pasa — me pasó a mí con la máquina de entrega, y al refuter acá.
