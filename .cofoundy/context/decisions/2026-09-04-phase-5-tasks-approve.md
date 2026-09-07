# Decision: task graph APROBADO — 8 tareas, 5 olas, despachable. El approve es HIGH blast radius y le toca refute-pass

**Phase:** 5 (approve final)
**Date:** 2026-09-04
**Authority:** ceo-agent (tier-1 partner delegation, /cto cycle `chat-sim-rewrite`, worker `cto-d606f0`)
**Status:** approved

**Cadena de decisiones (ninguna contradice a la anterior):**
1. `2026-09-04-phase-5-tasks.md` — AMEND, 8 enmiendas (B-1..B-8)
2. `2026-09-04-phase-5-tasks-regate.md` — AMEND estrecho, 4 líneas (C-1..C-4)
3. **este archivo** — APPROVE

## Question

/cto aplicó C-1..C-4 en `19eedbf` y pidió el re-gate final del task graph de
`.cofoundy/tasks/T-001..T-008.md`.

## Gate de escalación — re-verificado por tercera vez

```
escalation_scope.py verify --substrate .cofoundy --json  → exit 0
verdict: apply · worker: cto-d606f0 · reason: match · problems: []
```

Corrí el comparador otra vez en vez de arrastrar el resultado de la corrida anterior: el sello se
auto-invalida si el crudo cambia, y entre medio hubo dos commits al substrato. Sigue siendo de este
worker.

**Thresholds contra esta decisión:**

| Threshold | ¿Dispara? |
|---|---|
| `production_main_deploy` [11] | No — Fase 5 no despliega. Sigue armado, sigue siendo del humano. |
| `budget_overrun` [2,5,11] | **No.** USD ≈0 medido contra 50. Horas: sin datos aún (cero olas cerradas); el instrumento ahora existe y tiene disparo — ver abajo. |
| `scope_expansion_request` [5,7,8] | No. C-1..C-4 sólo instrumentan; los dos roces del primer gate quedaron resueltos por reasignación (mi autoridad, cláusula `exempt`). |
| `security_finding_high` [8,11] | No. |
| `always_escalate` (5) | Ninguno. |

## Decision

**APPROVE.** Verifiqué el diff de `19eedbf` línea por línea. Las cuatro enmiendas aterrizaron
literales, y dos de ellas mejor redactadas que mi pedido: la viñeta de T-006 ahora **nombra en voz
alta** que el orden es propiedad del proceso y que por eso no se verifica (en vez de borrar la
tensión, la deja documentada), y T-002 #6 conserva el porqué de cada eje inline, así que la lane que
lo lea entiende **por qué** `wallpaper` salió y no lo va a volver a meter creyendo que ayuda.

Con eso el graph queda cerrado. Nada abierto de mi lado.

### Estado final de los instrumentos

Los cinco criterios de éxito del brief tienen sonda que puede ponerse roja — que era el hueco de
fondo del primer gate:

| # | Criterio | Sonda | Ola |
|---|---|---|---|
| 1 | PNG byte-idénticos | T-004 #1 + gemelo #2 (cambiar seed rompe) | 2 |
| 2 | diferencias **estructurales**, no color | T-002 #6, 4 ejes invertidos | **1** |
| 3 | Astro sin React | T-002 #7 (cero React en bundle) + #5 | 1 |
| 4 | N KB reemplazables | T-008 #1 (tipado contra `api.ts:229`) + #5 (N con comando) | 4-5 |
| 5 | el fork de `MobileComposer` pierde su razón | T-007 #2 (test mecánico) + #3 (checklist N/N) | 4 |

Y los cuatro detectores que podían pasar en verde con el bug presente están cerrados: T-003 #1
(aliasing y retorno constante), T-003 #3 (fold lineal sin checkpoints), T-006 #1 (sink no-op) y #4
(stub inalcanzable), T-002 #6 (hardcode de `timestamp` congelándose en los goldens).

### Lo que /cto debe vigilar en ejecución

- **`wall_clock_minutes` es obligatorio en cada `reports/{lane}.md`.** Sin el dato,
  `budget_overrun` vuelve a ser decorativo, que es de donde venimos. Disparos: **24 h duro** ⇒
  escala; **16 h al cierre de la ola 3** ⇒ reproyectás con 6 datos reales y **si la reproyección
  supera 24 h, escalás ahí**.
- **A-2 sigue vivo:** una lane que pida copia literal de `whatsimule` PARA y escala. No lo decide sola.
- **D-2 sigue vivo:** si aparece un deadline de la app de Fovente, va a la cola como pedido de
  re-secuencia, no como decisión de lane.
- **T-002 #6 corre en la ola 1, antes de que `capture/` congele goldens en la ola 2.** Ese orden es
  lo que compra el detector; si se corre después, el hallazgo llega tarde por diseño.

### Blast radius — el approve NO es final por sí solo

`blast_radius_thresholds.triggers.files_touched_gt: 25` **cruza**: las 8 tareas crean
`chat-sim/{core,adapters,element,react,capture,sound}/**` más stories y tests, muy por encima de 25
archivos. `task_graph_repos_gt: 1` **no** cruza (los seis `scope.write` viven todos en
`packages/ui`; T-008 *lee* inbox-ai, no escribe ahí). `deploy_any` no aplica en Fase 5.

⇒ **HIGH blast radius. Corré el refute-pass antes de despachar la ola 1.** Escribí las tres
decisiones para aguantar esa segunda opinión: cada veredicto nombra su fuente verificada en disco y
qué lo daría vuelta. Si el refuter disiente, eso **escala al humano** — no me revoca a mí ni me
confirma. `disagreement: escalate`.

## Rationale

El graph entra a ejecución con la partición por rol limpia (cero celdas de 2+ `W`), el orden de olas
derivado de R-1, los cinco criterios de éxito instrumentados, y los topes expresados en magnitudes
que el actor puede constatar leyendo lo que entregó. Las tres rondas de gate movieron el ciclo de
"tareas testables" a "tareas falsables **y** promesas medibles", que era la brecha real.

Lo que hizo el trabajo no fue rigor genérico: fue cruzar cada acceptance con la tabla de
capabilities y con lo que la propia tarea decía renderizar. Ahí aparecieron `timestamp` (el campo
que el detector no miraba) y `wallpaper` (el eje que no discrimina entre los canales del ciclo).
Ninguno de los dos se ve leyendo la acceptance sola.

## Alternatives considered

- **Tercer AMEND.** Rechazado: no queda nada material. Seguir puliendo sería fricción sin hallazgo,
  y el contrato de autonomía castiga parar cuando no hay riesgo descubierto.
- **Escalar por `budget_overrun` antes de despachar.** Rechazado por tercera vez y por la misma
  razón: sigue sin haber datos (cero olas cerradas). La diferencia contra el primer gate es que
  ahora el threshold **puede** dispararse — tiene campo obligatorio, sumador y dos umbrales con
  consecuencia. Escalar hoy sería escalar sobre una estimación teniendo el instrumento listo para
  medirlo.
- **Aprobar y saltar el refute-pass** porque el graph ya pasó tres rondas. Rechazado: el trigger es
  `files_touched_gt`, una condición sobre el tamaño del cambio, no sobre mi confianza. Que yo esté
  seguro no es el predicado.

## What would flip this

- **A `escalate`:** acumulado >24 h; reproyección de la ola 3 >24 h; gasto de terceros >USD 50;
  deadline de Fovente (D-2); pedido de copia literal de `whatsimule` (A-2); o **disenso del
  refute-pass**, que escala al humano por config (`disagreement: escalate`).
- **A `amend` en vuelo:** que una lane reporte que un acceptance no se puede satisfacer dentro de su
  `scope.write` — el modo de falla que ya cazamos dos veces (`ChannelId` en T-006, `src/types/**` en
  T-008 #4). Si aparece un tercero, es señal de que la matriz necesita otra pasada, no de que la
  lane tenga razón.

## Sources

- `19eedbf` — diff verificado línea por línea (5 archivos, +225/−6), no el resumen
- `6e709a3` — verificado en el re-gate anterior
- `tasks/T-001.md` … `T-008.md` — estado final
- `specs/file-ownership-matrix.md` (olas + telemetría B-7/C-4), `specs/adapter-interface-draft.md`
  (los 16 campos), `specs/architecture-v1.md` §9 §10 §12 §13
- `brief.yaml` — `definicion_de_exito` con `sonda:`/`se_pone_roja_si:` en los cinco
- `state/escalation-effective.yaml` — sello verificado por comparador, tercera corrida
- Decisiones previas: `2026-09-04-phase-2-arch.md`, `2026-09-04-phase-5-tasks.md`,
  `2026-09-04-phase-5-tasks-regate.md`

## Next action

/cto corre el **refute-pass** (obligatorio: `files_touched_gt: 25`). Si el refuter sostiene, despacha
la **ola 1 = `core` (T-001) + `skin` (T-002)** con tope de concurrencia 2. Si disiente, escala al
humano — no me sobrescribe. Al cierre de cada ola: sumar `wall_clock_minutes` y evaluar B-7/C-4.

## Refute-pass
**Triggered by:** blast-radius over threshold (n/a)
**Verdict:** REFUTE
**Refuter argument:** ChannelId y ChannelAdapter tenian DOS duenos contradictorios: api-contract.md los declara en core/types.ts [core] ola 1, y T-005 #3 los reclamaba para adapters/** [channel] ola 3. Las dos tareas de la ola 1 los necesitan, asi que T-002 #6 (el fixture de capabilities, sonda del criterio de exito #2) solo era satisfacible forkeando el tipo dentro de element/**, sin ninguna tarea que reconciliara la copia. El ciclo cuyo problema_real es 'tres implementaciones que comparten codigo copiado' iba a shipear una cuarta copia por diseno. Causa: la enmienda B-2(b) movio ChannelId razonando solo desde las celdas W de la matriz y nunca reconcilio api-contract.md.
**Disagreement handling:** escalated to human (esc-20c542b7ac6588) — approve held pending review
**Recorded:** 2026-09-04T14:09:50-05:00
