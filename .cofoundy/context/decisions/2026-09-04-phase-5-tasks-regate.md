# Decision: re-gate Fase 5 — AMEND estrecho. El tope de T-006 esconde una magnitud de proceso (texto mío), y el fixture de T-002 deja fuera `timestamp`, que es justo el campo del que dependen los goldens

**Phase:** 5 (re-gate)
**Date:** 2026-09-04
**Authority:** ceo-agent (tier-1 partner delegation, /cto cycle `chat-sim-rewrite`, worker `cto-d606f0`)
**Status:** amended
**Extiende (no contradice):** `2026-09-04-phase-5-tasks.md` — mismas 8 enmiendas, dos de ellas incompletas

## Question

/cto aplicó las 8 enmiendas en `6e709a3` y pidió re-gate, con dos juicios puntuales: (1) si la cota
por alcance de T-006 es de verdad constatable leyendo el entregable o quedó otra magnitud
auto-medida disfrazada, y (2) si el fixture de caps de T-002 #6 alcanza para cazar el hardcode, o
hay una cuarta propiedad que lo sobrevive.

## Gate de escalación — re-verificado

```
escalation_scope.py verify --substrate .cofoundy --json  → exit 0
verdict: apply · worker: cto-d606f0 · reason: match · problems: []
```

Ningún threshold nuevo aplica. `budget_overrun` sigue sin datos (cero olas cerradas, cero reportes
de lane) y su instrumento acaba de existir (B-7). `scope_expansion_request`: las enmiendas
**contraen** o instrumentan; ninguna agrega deliverable. `always_escalate`: ninguno.

## Decision

**AMEND estrecho — tres líneas, no un re-gate del graph.** Verifiqué las 8 enmiendas contra el
commit, archivo por archivo. **Seis aterrizaron completas y bien.** Dos —justo las dos sobre las
que pediste juicio— tienen un hueco cada una, y hay una tercera cosa menor que quedó abierta. Todo
lo demás queda **aprobado**; no re-abro nada de lo que ya está bien.

**Nota sobre T-003 #1: cambiaste mi gemelo y quedó mejor.** Pedí retener `s1`, hacer `seek(t2)` y
afirmar que `s1` no mutó. Escribiste otra cosa: *«seek a `t` y a `t+1` en frames distintos ⇒ estados
distintos»*. Lo verifiqué contra el bug que me preocupaba y **cubre más**: si `seek` devuelve el Map
interno vivo, `s1` y `s2` son el mismo objeto y salen deep-equal ⇒ rojo; si devuelve una constante,
también rojo. Caza aliasing **y** retorno constante con un solo test más simple. Lo adopto tal cual.

---

### Q1 — ¿La cota de T-006 es constatable? **Dos de tres cláusulas sí. La tercera es una magnitud de
proceso disfrazada de cota de alcance — y el texto es mío.**

| Cláusula | ¿Se constata leyendo el entregable? |
|---|---|
| «≤6 cues por canal» | ✅ Sí — `Object.keys(pack).length`. Se cuenta. |
| «≤3 capas por cue» | ✅ Sí — `cue.layers.length`. Se cuenta. |
| **«Orden obligatorio: el `AudioSink` primero. Los cues se agregan después, de a uno.»** | ❌ **No.** |

**El orden de entrega es una propiedad del PROCESO, no del artefacto.** Leyendo el entregable final
no se puede distinguir un sink escrito primero de uno escrito último: **el estado final es idéntico
en ambos casos**. Sólo sería visible en el historial de commits, y las lanes no commitean (agent
floor). O sea: es exactamente lo que preguntaste — otra magnitud auto-medida, con ropa de cota de
alcance. Y la escribí yo, en B-2 («Orden de entrega OBLIGATORIO»), mientras en el mismo párrafo
sancionaba los topes auto-medidos. Me lo como.

**Y no es cosmético: esa cláusula carga toda la garantía del "stub por resta".** El punto de
sink-primero era que si el trabajo se corta, ya tenés el sink y el stub se alcanza restando cues. Si
la lane autora los cues primero y el sink al final y se queda corta, el resultado es **cues sin sink
— nada funciona**, y el caso degenerado no se alcanza por resta sino que no se alcanza. La garantía
depende hoy de una cláusula que nadie puede verificar.

**El arreglo es convertir el orden en un invariante del artefacto**, que sí se puede poner rojo:
un test del caso degenerado con `packs = {}`. Si el sink quedó soldado a un pack concreto, se pone
rojo. Eso hace verificable la propiedad que el orden sólo prometía. → **C-1**.

**Residuo menor, sin acción:** *«Si no entra, entregá menos cues»* quedó circular — «no entra»
perdió referente cuando el tiempo dejó de ser la magnitud, y entregar menos de 6 ya está permitido.
Es inocuo: con la cota de alcance el trabajo está **acotado por construcción** (≤6 × ≤3 es un job de
autoría finito), así que no hace falta regla de parada. La frase sobra pero no miente.

---

### Q2 — ¿El fixture alcanza? **No. Hay una cuarta propiedad, y encima el tercer eje que elegiste es
el más débil de los 16.**

**(a) `wallpaper` es el eje equivocado, por dos razones independientes.**

Cambiaste el `reactions:'own-row'` que nombré por `wallpaper:'none'`. En la tabla de
`adapter-interface-draft.md`, **`wallpaper` es `pattern` en WhatsApp y `pattern` en Telegram** —
idéntico en los dos únicos canales que este ciclo implementa. `none` es iMessage, que está en
`mvp_scope.excluye`. O sea que el fixture invierte un campo en el que **ningún adapter real del
ciclo difiere**: prueba una rama que la realidad no ejercita.

Peor: `wallpaper` es un fondo. Es, de los 16 campos, el más cercano a *«sólo color»* — que es
exactamente lo que el criterio de éxito #2 **descalifica** (*«diferencias estructurales reales, no
sólo color»*). Y `brief.yaml` ahora cita este fixture como la `sonda` de ese criterio. Quedó una
sonda parcialmente apoyada en el eje que el criterio excluye, presentada como prueba de diferencia
estructural. `reactions` (`overlay-below` vs `own-row`) sí es reestructuración de DOM real —
un hijo superpuesto a la burbuja contra una fila hermana. Su salida debilitó el test justo en el eje
que importa.

**(b) La cuarta propiedad que sobrevive: `timestamp`. Y es la peor posible.**

Esta es la respuesta directa a tu pregunta, y lo que la hace fuerte es que el campo está en el
**`## Alcance` de la propia T-002**: *«burbuja, colita en la primera de la racha, `.stamp`/`--pad`,
ticks, wallpaper»*. Eso es `tail`, **`timestamp`**, `receiptGlyph`, `wallpaper`. El fixture invierte
tres de los cuatro y **deja `timestamp` sin tocar**.

Según la tabla: WhatsApp `inside-pad` · Telegram `inside-plain` · iMessage `gutter`. `inside-pad` es
**la firma de WhatsApp**: el sello va dentro de la burbuja y reserva `--pad` para que el texto lo
esquive. Con un solo canal existiendo en la ola 1, hardcodear `inside-pad` es el movimiento natural
—y el fixture actual no se entera.

**Y la consecuencia es exactamente la que el fixture existe para evitar:** `--pad` es lo que mide el
settle gate de T-004 (*«medición de `--pad` estable»*). Un `inside-pad` hardcodeado se **congela en
los goldens de la ola 2**, y el `inside-plain` de Telegram lo descubre en la ola 3 — invalidando los
goldens. El detector se adelantó dos olas para prevenir precisamente eso, y el hueco lo deja pasar.

**Arreglo:** invertir **cuatro ejes estructurales** — `tail`, `receiptGlyph`, `timestamp`,
`reactions` — y sacar `wallpaper`. → **C-2**.

---

### Tercer hueco (no lo preguntaste): el umbral de 16 h quedó sin consecuencia

B-7 aterrizó, y la telemetría es correcta. Pero mi «disparo temprano ⇒ escalar» quedó como *«aviso
temprano — el CTO reproyecta»*, y **la reproyección no dice qué pasa si da mal.** Es un umbral que
termina en una acción sin salida.

**Acepto tu debilitamiento del disparo, y de hecho es mejor que mi versión.** Escalar a las 16 h
sería escalar antes de que el predicado se cumpla — el mismo *«no sé» ≠ «excede»* con el que decliné
escalar en el gate anterior. Y a las 16 h ya tenés **6 datos reales** de wall-clock, así que la
reproyección está fundada, no adivinada. Eso es superior a mi corte aritmético.

Lo único que falta es cerrar el circuito: *si la reproyección fundada supera 24 h, se escala ahí
mismo, sin esperar a cruzarlas.* Sin esa frase, el 16 h es un mirador sin puerta. → **C-3**.

---

## Amendments

| # | Archivo | Línea exacta | Cambio |
|---|---|---|---|
| **C-1** | `tasks/T-006.md` | `## Alcance`, la viñeta **«Orden obligatorio: el `AudioSink` primero. Los cues se agregan después, de a uno.»** + `## Acceptance` (ítem nuevo #4) | Reemplazar la viñeta por: *«**El sink no depende de ningún pack.** El orden de escritura no es verificable leyendo el entregable, así que se exige como invariante del artefacto, no como disciplina.»* Y añadir **Acceptance #4**: *«**Test del caso degenerado:** instanciar el `AudioSink` con `packs = {}` ⇒ no lanza, la story de audición degrada a "sin cues" y el resto del componente sigue funcionando. **Esta es la prueba de que el stub se alcanza por resta.** Un sink soldado a un pack concreto DEBE ponerlo rojo.»* |
| **C-2** | `tasks/T-002.md` | `## Acceptance` #6, la lista **`(tail:'last', receiptGlyph:'single-tick', wallpaper:'none')`** | Reemplazar por **cuatro ejes estructurales**: **`tail:'last'`, `receiptGlyph:'single-tick'`, `timestamp:'inside-plain'`, `reactions:'own-row'`** — y **sacar `wallpaper`**. Añadir la razón inline: *«`wallpaper` sale porque es `pattern` en WhatsApp Y en Telegram (no discrimina entre los dos canales del ciclo) y porque es fondo — el eje que el criterio de éxito #2 descalifica. `timestamp` entra porque es el cuarto campo del Alcance de esta tarea y el único sin invertir: `inside-pad` es la firma de WhatsApp, es de donde sale `--pad`, y `--pad` es lo que mide el settle gate de T-004. Hardcodearlo se congela en los goldens de la ola 2 y explota en la ola 3.»* |
| **C-2b** | `brief.yaml` | `definicion_de_exito`, criterio #2, campo `se_pone_roja_si` (hoy: *«…al invertir tail/receiptGlyph/wallpaper»*) | Sincronizar con C-2: *«el DOM no cambia al invertir tail/receiptGlyph/timestamp/reactions ⇒ hay hardcode»*. La lista de campos aparece en dos archivos; si sólo se corrige la tarea, el brief queda citando una sonda que ya no existe. |
| **C-3** | `specs/file-ownership-matrix.md` | §Telemetría de presupuesto, fila **«16 h acumuladas al cierre de la ola 3»** | Cerrar el circuito: *«aviso temprano — el CTO reproyecta con los 6 datos reales de wall-clock. **Si la reproyección supera 24 h, escala ahí mismo, sin esperar a cruzarlas.** Reproyectar sin consecuencia declarada deja el umbral en mirador sin puerta.»* |

---

## Lo que queda APROBADO sin cambios

Para que no se re-abra lo que ya está bien: **T-003 (los tres ítems, con la mejora de #1 adoptada),
T-005 (`ChannelId` recibido, grep degradado a señal secundaria), T-007 (test mecánico de
`visualViewport` + checklist de N filas), T-008 (escape hatch borrado, tipado contra
`api.ts:229`, #4 como solicitud por `A`, N con comando), T-002 #7 (cero React en el bundle),
`brief.yaml` (`sound/` nombrado con su cota + los 5 criterios con `sonda:`/`se_pone_roja_si:`), y
la telemetría de B-7 salvo la fila que cierra C-3.**

El `brief.yaml` con `sonda:` y `se_pone_roja_si:` por criterio es más de lo que pedí y es el
artefacto más durable del ciclo: la próxima vez que alguien agregue un criterio de éxito, la forma
del archivo le exige nombrar cómo se pone rojo. Eso convierte un hallazgo puntual en una restricción
estructural.

**Observación sin acción:** T-008 #5 calcula N sólo sobre `MessageBubble.tsx`, mientras B-4 decía
`MessageBubble` + `MobileComposer`. No lo corrijo: `MobileComposer` quedó cubierto por la checklist
de T-007 #3, así que no hay hueco — hay dos instrumentos para las dos mitades del fork, y sumarlo en
ambos lados lo contaría doble.

## Rationale

Las dos cosas que pediste juzgar fallaban por la **misma** razón, que es la razón por la que existe
la Falsifiable Instrument Gate: un instrumento que no puede ponerse rojo para la falla que nombra.
El tope de T-006 nombra un orden que nadie puede verificar; el fixture de T-002 nombra un detector
de hardcode que no mira el campo que más probablemente se hardcodea. Ninguna de las dos es un error
de criterio del CTO — la primera es texto mío, y la segunda es una sustitución razonable
(`wallpaper` parece un eje tan bueno como `reactions`) que sólo se cae al cruzarla con la tabla de
capabilities y ver que no discrimina entre los dos canales del ciclo.

Amendo en vez de aprobar-con-nota porque las dos sondas son de **ola 1** y su costo de corrección
es asimétrico: tres líneas hoy, contra re-congelar todos los goldens de la ola 2 si el hardcode de
`timestamp` sobrevive hasta la ola 3. Es el mismo cálculo que justificó adelantar el detector.

## What would flip this

- **A `approve`:** aplicar C-1, C-2, C-2b y C-3. Son tres archivos y cuatro líneas; no tocan
  arquitectura, alcance ni la matriz de propiedad.
- **A `escalate`:** que el acumulado cruce 24 h, o que la reproyección de la ola 3 supere 24 h
  (C-3); un deadline de Fovente (D-2); o una lane pidiendo copia literal de `whatsimule` (A-2).
- **C-2 se relaja** si al escribir el fixture resulta que `reactions` no es observable en el DOM de
  la ola 1 (el layout de WhatsApp podría no renderizar reacciones todavía). En ese caso `timestamp`
  solo ya cierra el hueco real, y `reactions` puede diferirse a T-005 — pero `wallpaper` sale igual.

## Sources

- `6e709a3` — diff verificado archivo por archivo (9 archivos, +482/−17), no el resumen
- `tasks/T-002.md` … `T-008.md` — releídos post-enmienda, íntegros
- `specs/adapter-interface-draft.md` — la tabla de 16 campos: `wallpaper` = `pattern`/`pattern`,
  `timestamp` = `inside-pad`/`inside-plain`, `reactions` = `overlay-below`/`own-row`
- `specs/architecture-v1.md` §12 (goldens y costo de reestilar), y T-004 `## Alcance` (`--pad` en el settle gate)
- `brief.yaml` — `definicion_de_exito` con `sonda:`/`se_pone_roja_si:`; `mvp_scope.excluye` (iMessage)
- `specs/file-ownership-matrix.md` §Telemetría de presupuesto (B-7)
- Decisión previa: `context/decisions/2026-09-04-phase-5-tasks.md` (B-1..B-8) — extendida, no contradicha
- `state/escalation-effective.yaml` — sello re-verificado por comparador (exit 0, `apply`, `cto-d606f0`)

## Next action

/cto aplica C-1 (`T-006.md`), C-2 (`T-002.md`), C-2b (`brief.yaml`) y C-3
(`file-ownership-matrix.md`), y re-gatea. Con eso el graph queda aprobable: son cuatro líneas y no
hay nada más abierto de mi lado. **El approve cruza `blast_radius_thresholds.files_touched_gt: 25`
⇒ refute-pass antes de despachar la ola 1.**
