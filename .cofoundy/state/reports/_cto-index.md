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

2. **Los ticks azules todavía no son posibles.** Afirmé que "la máquina de entrega ya soporta
   `read`". **Falso, y leí el documento de arquitectura en vez del código.** En HEAD, `SimStep` es
   `post|draft|flag`, `fold.applyEvent` no tiene caso `receipt`, y `post` hardcodea
   `receipt: 'queued'`. `render.ts` ya sabe pintar azul (`.cf-receipt[data-read]`) — falta el dato,
   que llega con T-003. Es un cambio de una línea en el guion **después** de que T-003 aterrice.

## Riesgo que me tomé y no debo repetir

Para aislar un rojo hice `git stash` del WIP no commiteado de `core` mientras esa lane estaba
trabajando. El `pop` funcionó y el trabajo quedó intacto, pero si hubiera fallado destruía trabajo
vivo de otro agente. **No se stashea el árbol de una lane activa.** Los 8 rojos que vi en ese
estado quedan como **no atribuidos** en vez de explicados con una causa inventada.
