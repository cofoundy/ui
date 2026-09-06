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

## Hallazgo metodológico: TODOS los bugs serios vivieron en costuras entre lanes

Ninguno fue un error de implementación dentro de una tarea. Los cuatro fueron de integración, y en
los cuatro **el que encontró no era el dueño del código**:

| Bug | Lo encontró | Dueño | Por qué la lane dueña no podía verlo |
|---|---|---|---|
| `channel="telegram"` renderiza chrome de WhatsApp | `app` | `skin` | `skin` construyó contra un stub porque T-005 no existía; su fixture inyecta el adapter directo, así prueba el renderer y no el cableado |
| `Frame.t` absoluto ⇒ `t0` contado dos veces | `core` | `core` | apareció solo al escribir el cross-check de la **promoción**; todos los tests previos usaban `t0: 0`, donde absoluto y relativo son el mismo número |
| `Int32Array` desborda con `t0` real | `capture` | `core` | era **síntoma** del anterior; `capture` fue la primera en usar un `t0` realista de punta a punta |
| Ciclo de imports por el barrel | `core` | `app` | latente: `madge` pasaba mientras `react/**` no aterrizara en `index.ts`. Exportar `ChatSim` lo hizo visible |

**Lo que esto dice de la matriz de propiedad estricta:** su costo es fricción — la lane que
encuentra no puede arreglar, tiene que reportar y esperar. Ese costo **es** el beneficio: obliga a
que el hallazgo se verbalice y quede ruteado en vez de arreglarse en silencio dentro de un commit
ajeno. Los cuatro bugs se documentaron porque alguien tuvo que escribirlos para pedir el arreglo.

Con propiedad difusa, `app` habría cableado el adapter de `skin` de paso y nadie habría sabido que
la promesa multi-canal estuvo rota. La fricción es el instrumento.

**Corolario para el retro:** las acceptance por-tarea no cubren costuras por construcción. Los dos
instrumentos que sí las cubrieron fueron **cross-lane**: el snapshot cruzado `element` ↔ `react`
(T-007 #1) y el cross-check `stateAtStep` ↔ `seek` (promoción). Un ciclo futuro debería exigir al
menos un test cruzado por par de lanes que comparta contrato, no solo acceptance por tarea.

## Regla de arquitectura que faltó escribir

**Un módulo hoja importa de hojas, nunca del barrel.** Ya la habíamos adoptado un nivel más abajo
—`caps.ts` no importa nada y `registry.ts` vive aparte, copiado del Python de `inbox-ai`— pero no
la generalizamos, y el ciclo de imports entró por ahí. Va a `api-contract.md` para el próximo.

## Falla de orquestación del CTO: conté despachos, no residentes

Respeté el tope de concurrencia de 2-3 **agentes activos**, pero nunca conté los que ya habían
entregado. Al final había **10 teammates vivos**, cuatro terminados hacía 5 horas. La máquina llegó
a **200 MB libres de 24 GB** y Chrome dejó de poder responder llamadas de DevTools — lo que rompió
la verificación del entregable principal.

Liberarlos subió a 996 MB. El tope que apliqué medía lo fácil de contar (despachos simultáneos) en
vez de lo que importaba (memoria residente). **Es la misma clase de error que este ciclo cazó cinco
veces en otros: medir el proxy en vez del efecto.**

**Regla para el próximo:** el shutdown de una lane es parte de aceptar su tarea, no del cierre del
ciclo.

---

## 🔴 El error de método más caro del ciclo: capability de backend ≠ lenguaje visual

Descubierto por el **operador**, mirando una captura real de Telegram al lado de la nuestra.

Los adapters se especificaron desde `capabilities.py` de `inbox-ai`. Fue un gran hallazgo del recon
—evitó que inventáramos el modelo de canal— **pero ese archivo describe qué puede observar un BOT
por la Bot API, no cómo renderiza el CLIENTE.** Son dos dominios y los traté como uno.

| Lo que pusimos | Por qué | La realidad |
|---|---|---|
| `receiptGlyph: 'single-tick'` | la Bot API de Telegram no expone "delivered" | **Telegram muestra ✓✓ en su UI.** Verificado en captura real del operador |
| `counter: 'views'` en todo mensaje | el backend lo modela | es exclusivo de **canales broadcast**, no de chats 1:1 |
| paleta compartida | nadie lo especificó | `--channel-telegram` existe hace meses y `styles.css` **no lo consume ni una vez** (grep: 0) |

## Por qué NINGÚN instrumento del ciclo podía cazarlo

El fixture de capabilities invierte `tail`, `receiptGlyph`, `timestamp`, `reactions` y verifica que
el DOM cambie. **Verifica que el renderer OBEDEZCA al adapter — no que el adapter tenga RAZÓN.**

Un `receiptGlyph` incorrecto pasa el gemelo perfectamente: el DOM cambia, sólo que hacia el valor
equivocado. Es la diferencia entre *"el renderer obedece"* y *"el adapter describe la realidad"*.
Instrumenté lo primero y asumí lo segundo.

**Toda la batería de sondas del ciclo es de consistencia interna.** Ninguna compara contra el mundo.
Y el ciclo entero se vendía como "diferencias estructurales reales, no sólo color" — una afirmación
sobre el mundo, verificada sólo contra nosotros mismos.

**Regla para el próximo ciclo:** cuando una acceptance afirma fidelidad a un artefacto externo
(un canal, una marca, un formato), el gemelo tiene que ser una **referencia externa capturada**, no
otra rama de nuestro propio adapter. Un baseline visual contra una captura real, aunque sea manual
y de una sola vez.

**Y la advertencia general:** un modelo de dominio prestado de otra capa —por bueno que sea, y éste
lo era— trae las fronteras de ESA capa. `capabilities.py` es correcto para lo que hace. El error fue
mío al no preguntar de qué dominio hablaba antes de espejarlo.

## Patrón en MI comportamiento: cambio de contrato = productor asignado, consumidores olvidados

Tres veces, la misma forma:

| # | Contrato | Asigné | Olvidé | Lo encontró |
|---|---|---|---|---|
| E-002 | `receiptGlyph` → `ReceiptModel` | core (tipo), channel (valores) | `element/**`, `react/**` | `core`, con un typecheck de proyecto que su tarea no pedía |
| E-003 | `glyph` → `ReceiptIconId` | core (tipo), skin (`element/**`) | `adapters/**` | `core`, otra vez |

E-002 se resolvió con la frase *"la matriz necesita otra pasada"*. Hice la pasada — y repetí el
error en el ciclo siguiente, con la misma clase de contrato.

**El diagnóstico correcto no es "prestar más atención".** Es que escribo el task graph pensando en
**quién produce el cambio**, y el grafo de consumidores no está en ningún lado que yo lea al
escribirlo. La matriz de propiedad dice quién ESCRIBE cada path; no dice quién IMPORTA de quién.

**Regla mecánica para el próximo, que no depende de que me acuerde:** ante cualquier cambio de un
tipo exportado, correr `grep -rl "<símbolo>" src/` **antes** de escribir las tareas, y que cada
archivo del resultado tenga dueño asignado en el graph. Es un comando, no una virtud.

Nota: en ambos casos lo encontró `core` corriendo un typecheck de **proyecto** que su propia
acceptance no pedía. La lane hizo más de lo que le pedí, dos veces, y las dos veces eso tapó un
hueco mío.
