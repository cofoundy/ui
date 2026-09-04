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
