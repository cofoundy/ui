# Decision: task graph AMENDED — la Falsifiable Instrument Gate se aplicó a las tareas, no a la `definicion_de_exito`; tres de los cinco criterios del brief no tienen instrumento

**Phase:** 5
**Date:** 2026-09-04
**Authority:** ceo-agent (tier-1 partner delegation, /cto cycle `chat-sim-rewrite`, worker `cto-d606f0`)
**Status:** amended

## Question

/cto pidió resolver el gate de Fase 5 sobre las 8 tareas de `.cofoundy/tasks/T-001..T-008.md`,
con cinco juicios explícitos: (1) falsabilidad de las acceptance de T-003/T-006/T-007/T-008,
(2) si `budget_overrun` cruza su predicado, (3) si el tope de costo de T-006 es respetable sin
supervisión, (4) contradicciones con `brief.yaml:mvp_scope`, (5) el riesgo de secuencia de `skin`
construyendo en la ola 1 contra una interfaz especificada pero no implementada.

Lo ya verificado por el CTO (DAG acíclico, 8 tareas con `role`/`scope.write`/acceptance, matriz de
16 filas con cero celdas de 2+ `W`) lo tomé como dado y no lo repetí. Sí re-derivé todo lo que
cuelga de un juicio.

## Gate de escalación — verificado ANTES de decidir

```
escalation_scope.py verify --substrate .cofoundy --json  → exit 0
verdict: apply · worker: cto-d606f0 · reason: match · problems: []
source_sha256: f003adc6d5d6ff3e07d1fa7682cd5b15504712ce7ab003fc9e18a90ad866edb4
worker_source: .cofoundy/state/worker-id → cto-d606f0
```

Corrí el comparador; no me apoyé en leer el campo `verdict` del archivo. El sello es de ESTE
worker y el `source_sha256` coincide con el crudo de hoy. No leí
`.cofoundy/context/constraints/escalation-thresholds.yaml` directamente (orch#98).

**Thresholds evaluados contra esta decisión, uno por uno:**

| Threshold | `applies_to_phases` | ¿Dispara en Fase 5? |
|---|---|---|
| `production_main_deploy` | [11] | No — no es fase de deploy. Sigue armado y sigue siendo del humano. |
| `budget_overrun` | **[2, 5, 11]** | **No dispara hoy. Se vuelve medible con B-7.** Ver §Q2. |
| `scope_expansion_request` | **[5, 7, 8]** | **Roza dos veces, ambas resueltas en mi autoridad.** Ver §Q4. |
| `security_finding_high` | [8, 11] | No. Ninguna finding HIGH en el graph. B-2 (cero samples de terceros) *reduce* superficie. |
| `always_escalate` (5 ítems) | — | Ninguno. Nada legal, de pagos, de personas, ni de credenciales. |

**Blast radius — aviso adelantado para /cto.** Cuando estas enmiendas se apliquen y el graph vuelva
a gate, el `approve` va a cruzar `blast_radius_thresholds.triggers.files_touched_gt: 25`: las 8
tareas crean `chat-sim/{core,adapters,element,react,capture,sound}/**` más stories y tests, muy por
encima de 25 archivos. `task_graph_repos_gt: 1` **no** cruza (los seis `scope.write` viven todos en
`packages/ui`; T-008 *lee* inbox-ai, no escribe ahí). O sea que el approve final es HIGH blast
radius por tamaño y **le toca refute-pass**. Lo digo ahora para que no se descubra después.

## Decision

**AMEND.** El graph es bueno: la partición por rol es limpia, la matriz resuelve las cuatro
superficies que tentaban a colisionar, y las cuatro tareas que el CTO marcó con gemelo positivo
(T-001, T-002, T-004, T-005) tienen instrumentos de verdad. No lo rechazo ni lo escalo.

Pero el hallazgo central no es task-por-task. Es este: **la Falsifiable Instrument Gate se aplicó a
las tareas y nunca se pasó por la `definicion_de_exito` del brief.** De los cinco criterios de
éxito, uno está instrumentado de verdad, uno lo instrumentó A-4 a medias, y **tres no tienen
ninguna sonda que pueda ponerse roja**:

| # | Criterio de éxito del brief | Instrumento en el graph | Veredicto |
|---|---|---|---|
| 1 | dos corridas mismo guion+seed ⇒ PNG byte-idénticos | T-004 #1 + gemelo #2 | ✅ instrumentado |
| 2 | mismo guion en WA y TG con **diferencias estructurales reales, no sólo color** | — ninguno | ❌ **sin sonda** → B-5 |
| 3 | las dos landings Astro lo montan **sin agregar React** | — ninguno | ❌ **sin sonda** → B-6 |
| 4 | N KB del fork de inbox-ai reemplazables sin regresión | T-008 #1 (A-4) | ⚠️ **disoluble** → B-4 |
| 5 | el teclado móvil hace que el fork de `MobileComposer` **pierda su razón de ser** | T-007 #2 | ❌ **prosa** → B-3 |

A-4 existe exactamente porque el criterio #4 «se **afirma** en vez de medirse». Ese diagnóstico era
correcto y estaba incompleto: #2, #3 y #5 tienen la misma enfermedad y nadie los revisó. Un ciclo
que termina verde puede hoy no haber medido tres de sus cinco promesas.

Ocho enmiendas, nombradas por tarea y línea. Ninguna agrega alcance; seis agregan sondas, una
cambia un tope de tiempo por uno de alcance, y una hace explícito un pivot que hoy viaja en
silencio.

---

### Q1 — ¿Las acceptance de T-003, T-006, T-007, T-008 son falsables?

**No. Las cuatro tienen al menos un criterio que no puede ponerse rojo**, y en tres casos el
criterio pasa en verde **precisamente cuando ocurre el bug que dice vigilar**. Ese es el modo de
falla peor: no es una sonda ausente, es una sonda que certifica lo contrario de lo que mide.

**T-003 — las tres. La más grave es #3.**

1. *«Seek hacia atrás y hacia adelante al mismo `t` ⇒ estado deep-equal.»* El objeto entero de
   T-003 es el **copy-on-write shallow del Map**. Si el `seek` devuelve una referencia al Map
   interno vivo en vez de una copia, los dos handles **aliasan el mismo objeto** y el `deep-equal`
   es trivialmente cierto. El criterio pasa en verde exactamente cuando el copy-on-write no existe.
   Gemelo que falta: retener `s1 = seek(tl, t1)`, después `seek(tl, t2)` con `t2 > t1`, y afirmar
   que **`s1` NO cambió** — más `s1` ≠ `s2` en un campo nombrado. Eso es el detector de aliasing.
2. *«Un `react` sobre un mensaje ya posteado se refleja tras `seek` a `t` posterior.»* Una
   implementación que ignora `t` por completo y aplica todos los eventos siempre **también pasa**.
   Gemelo que falta: `seek` a un `t` **anterior** al `react` ⇒ la reacción está **ausente**. Sin la
   mitad negativa, el criterio no prueba que el playhead compuerte nada.
3. *«Benchmark: `seek` en guion de 500 pasos < 2 ms.»* Un barrido lineal de 500 pasos corre muy
   por debajo de 2 ms en cualquier máquina moderna. **Toda la maquinaria de checkpoints cada 64
   frames puede no existir y el benchmark sale verde.** Mide reloj de pared, no la propiedad
   algorítmica que la tarea entrega — y encima es flaky en CI. Gemelo que falta: **contar pasos de
   fold por `seek`** (determinista, independiente de máquina) y afirmar ≤ `64 + log2(n)`; más
   escalado 500 vs 5000 pasos con costo sublineal.

**T-006 — #1 y #3.**

1. *«Un `seek` durante un cue agendado lo cancela; no queda cola sonando.»* El `AudioSink` va
   **muteado por default**. Con el sink mudo no se agenda nada, así que «no queda cola sonando» es
   **vacuamente cierto** y un sink no-op pasa el test. Gemelo que falta: con el sink
   **desmuteado**, afirmar `scheduledNodes > 0` **antes** del seek y `=== 0` después. Sin la mitad
   positiva no se prueba que alguna vez hubo algo que cancelar.
3. *«Story de audición reproduce los cues de ambos canales y **suenan distinto**.»* «Suenan
   distinto» es juicio de oído humano. No existe instrumento que lo ponga rojo — y es justo el
   criterio que carga la queja explícita del operador sobre los sonidos. Gemelo que falta: los dos
   cue packs deben diferir **como datos** (deep-inequal sobre los objetos) y, mejor, el buffer PCM
   renderizado de cada pack debe dar **digests distintos**; con gemelo positivo, el mismo pack dos
   veces ⇒ digest idéntico. Es el patrón `tz` de T-001 aplicado al audio.

**T-007 — #2, y es el peor del graph porque es load-bearing.**

*«Criterio real: el fork `MobileComposer.tsx` (13 KB) de inbox-ai queda sin razón de ser.»*
«Queda sin razón de ser» no es medible por nada. Y la primera mitad («el composer queda visible con
el teclado abierto a 375px») tampoco tiene sonda automatizable tal cual: ni Storybook ni Chrome
headless disparan `visualViewport.resize` por un teclado que no existe. Este criterio **es** la
`definicion_de_exito` #5 del brief, o sea que el criterio de éxito #5 entra al ciclo sin
instrumento — la misma enfermedad que A-4 diagnosticó para el #4 y que nadie extendió. → B-3.

**T-008 — #1 y #4.** Ver §Q4 (#1, la redacción de A-4) y §Q4 (#4, un criterio que la lane tiene
**prohibido** satisfacer). Los criterios #2 y #3 sí se sostienen: «`MobileBaseline` presente» es
verificable por script contra los exports, y coverage ≥80% puede ponerse roja.

**T-005 #3 también falla**, aunque el CTO la listó entre las que ya tienen gemelo. Sus #1 y #2 son
buenos; el #3 es el que discuto en §Q5, y es el mismo defecto: un grep que no puede ponerse rojo
para la falla que nombra.

---

### Q2 — ¿`budget_overrun` cruza el predicado? **No dispara hoy. Y hoy es infireable — B-7 lo arregla.**

Decido con el predicado, no con la intuición. El predicado tiene dos mitades y hay que tratarlas
por separado.

**Mitad USD — medida, y limpia.** `usd_per_cycle: 50`. Recorrí las 8 tareas buscando superficie de
gasto de terceros: `capture/` usa Chrome headless (gratis), el audio es **sintetizado** sin samples
de terceros (T-006 #2), no hay créditos de API, no hay infra nueva, y la restricción del brief
prohíbe llamar servicios en runtime como hace el prior art (`api.microlink.io`). El graph no
introduce **ningún** gasto de terceros atribuible al ciclo. Proyección ≈ USD 0 contra un techo de
50. **No dispara, y esto sí es medición, no estimación.**

**Mitad horas — straddle otra vez, y por una razón que importa.** `agent_hours_per_cycle: 24`,
wall-clock acumulado entre lanes. Re-corrí la aritmética contra el graph real, que es **más chico**
que lo que asumí en Fase 2 (asumí ~5 iteraciones × 2-4 lanes = 10-20 despachos; el graph son **8
despachos** en 5 olas con tope 2):

```
8 despachos × 1,5-3 h de wall-clock por lane   = 12 - 24 h
+ orquestación, revisión de diff, refute-pass  =  3 -  5 h
                                          total = 15 - 29 h   contra un techo de 24
```

Sigue straddleando. **Y el graph no declara estimación por tarea** — ninguna de las 8 lleva una
cifra. O sea que en Fase 2 dije «no puedo medir, queda predicado para Fase 5» y en Fase 5 el
instrumento sigue sin existir.

**Por qué no escalo igual.** Tres razones, en orden de peso:

1. El `detect` del threshold dice: *«Projected spend exceeds `limits.*`, OR the brief declares a
   budget and the task graph's estimate exceeds it.»* `brief.yaml` **no declara presupuesto**, así
   que la segunda cláusula está inerte. La primera pide una proyección que exceda — y la mía no
   excede: straddlea. «No sé» no es «excede».
2. Mi propia decisión de Fase 2 fijó la condición de disparo como *«`budget_overrun` vuelve a
   aplicar ahí **con datos**»*. No hay datos todavía, hay una segunda estimación. Escalar ahora
   contradiría mi decisión previa sin escribir un SUPERSEDES, y no tengo hecho nuevo que lo
   justifique.
3. Escalar sobre un straddle es exactamente el anti-patrón que mi encargo prohíbe: *«Escalate
   because "I'm not sure" — pick a default, document what would flip you.»* El contrato de
   autonomía del operador es más filoso todavía: *«parar ante una pregunta desperdicia la ventana»*.

**Pero no lo dejo pasar en silencio, porque un tripwire que nunca puede dispararse es exactamente
el defecto que estoy sancionando en cuatro tareas.** Sería auto-refutatorio faltarle a T-003 por un
benchmark que no puede ponerse rojo y a la vez llevarme un threshold que no puede medirse. → **B-7**
convierte el predicado en instrumento con punto de disparo aritmético.

---

### Q3 — ¿El tope de costo de T-006 es respetable sin supervisión? **No. Necesita instrumento.**

*«Tope de costo (A-1): si excede ~0,5 d, revertí a stub y avisá.»* La enmienda es mía, así que este
juicio es contra mi propio texto. Falla por cuatro motivos, y el cuarto es estructural:

1. **«~0,5 d» no tiene referente para el actor.** ¿Días-ingeniero? ¿Wall-clock de agente? Una lane
   no experimenta «días» y no tiene reloj contra el cual comparar.
2. **«revertí a stub» nombra un artefacto que ya no existe.** A-1 **reemplazó** la fila de §10 que
   definía el stub. La lane tendría que reconstruir por adivinanza algo que la spec borró.
3. **«avisá» no nombra canal.** La lane escribe `.cofoundy/state/reports/skin.md`; el tope no lo dice.
4. **Un tope de tiempo auto-medido por el actor al que acota no es un instrumento.** La lane no
   puede saber que excedió hasta que ya excedió. Es un tope que sólo puede constatarse violado.

El arreglo correcto no es apretar el número: es **cambiar la magnitud**. El tiempo es inobservable
en el momento de autoría; el **alcance** es observable leyendo el dato entregado. → **B-2**.
Además el stub deja de ser un artefacto aparte: si se entrega **primero** el schema + `AudioSink`
muteado y **después** los cue packs, el stub es el caso degenerado del mismo deliverable (sink con
cero packs), al que se llega por **resta** y no reconstruyendo nada.

---

### Q4 — ¿Alguna tarea contradice `mvp_scope`? **Dos roces, ambos resueltos en mi autoridad. Y un
tercer problema que no es de scope sino de acceptance imposible.**

**(a) T-006 y el token de iMessage — no contradice, pero está en la lane equivocada.** El brief
`mvp_scope.incluye` pide *«Token y tipo de canal para iMessage»* y `excluye` *«iMessage como
adapter completo»*. T-006 entrega exactamente eso: `--channel-imessage` y el `ChannelId`, **NO** el
adapter. Correcto y fiel al brief. **Pero `ChannelId` es un tipo de canal y vive en
`adapters/**`, que es la celda `W` de `channel`** — y el `scope.write` de T-006 es
`[sound/**, styles.css]`. La tarea pide escribir fuera de su scope. `scope_expansion_request`
detecta esto (*«names a path owned by another role's W-cell»*), pero su cláusula `exempt` es
explícita: *«Reassignment to the owning lane… resolves this WITHOUT escalation»*. Reasigno. → B-2.
El token CSS `--channel-imessage` sí es de `skin` (§12 punto 2 lo pone bajo `.cf-chat-sim`) y se
queda en T-006.

**(b) El audio no está en `mvp_scope` — y ese pivot hoy viaja en silencio.** Esto sí lo miré con
cuidado porque me incrimina. `mvp_scope.incluye` lista core/, adapters/, react/, element/,
capture/, token iMessage, y MobileBaseline+teclado. **Sonido no aparece ni en `incluye` ni en
`excluye`.** Mi propia enmienda A-1 en Fase 2 metió cue packs + sink + story de audición al ciclo.
Formalmente, T-006 nombra un deliverable ausente de `mvp_scope`: es el `detect` de
`scope_expansion_request`, en una fase donde el threshold aplica.

No escalo, y la razón es de precedencia, no de conveniencia: el deliverable rastrea a una
**declaración explícita del operador** (*«los audios no son los que necesitamos»*), y la
instrucción del operador está por encima de la config del proyecto. El brief omitió codificar un
querer que el operador ya había expresado; responderlo no es expandir alcance contra el humano, es
alinearse con él. Además está acotado y su costo lo cierra B-2.

**Lo que sí es inaceptable es que quede tácito.** La regla del operador es literal: *«Nunca
absorbas en silencio un pivot de scope o visión — explicitalo.»* Un lector del `brief.yaml` hoy no
puede ver que el ciclo entrega audio. → **B-8** lo escribe en el brief con su cota. No pido permiso;
dejo el pivot visible con mi nombre encima.

**(c) T-008 y A-4 — la redacción NO alcanza para ser medible.** Dos huecos independientes:

- *«…se alimenta de la forma de mensaje REAL de inbox-ai **(o lleva adaptador documentado
  inline)**»*. **El paréntesis disuelve el criterio.** Cualquier story con un comentario que diga
  «este es el adaptador» lo satisface, sin que nada afirme que la forma **coincide** con la real.
  Un escape hatch redactado como alternativa equivalente convierte un criterio falsable en uno que
  no puede ponerse rojo — que es literalmente el defecto que A-4 existía para reparar.
- **A-4 aterrizó a medias.** Su segunda mitad decía *«Nombrar en §9 dónde se calcula N»*. Leí §9:
  la fila de la iteración 5 recoge la mitad de la story alimentada por la forma real, y **nunca
  nombra dónde se calcula N**. El número que el criterio de éxito #4 promete no tiene hogar en
  ninguna de las 8 tareas. → B-4.

**(d) T-008 #4 pide un write que la lane tiene PROHIBIDO.** *«deuda de los dos `Message` anotada
**en los archivos de tipos**»*. La matriz marca `src/types/**` con ⛔ para las seis lanes, `qa`
incluida (`A` = pide, nunca escribe), y dice explícitamente *«`qa` puede pedir la anotación de
deuda, que la aplica el CTO»*. O sea: **una acceptance que la lane no puede satisfacer sin violar
la matriz.** No es expansión de alcance, es un criterio mal asignado — y el modo de falla es feo,
porque la lane o se bloquea o pisa la celda prohibida. Reasignación al dueño ⇒ mi autoridad, sin
escalación. → B-4.

---

### Q5 — ¿`skin` en la ola 1 contra una interfaz no implementada? **Aceptable en principio.
Inaceptable como está instrumentado — invita al hardcode y lo detecta tarde.**

**El principio se sostiene.** `adapter-interface-draft.md` no es un boceto: son los **16 campos con
sus valores tabulados para los tres canales**. `skin` tiene todo lo que necesita para construir el
layout de WhatsApp sin la implementación. La regla dura de §"orden de construcción" (*«no se
construye nada que no sea abrible en la misma iteración»*) deriva de R-1 y es la que hace que la
ola 1 valga la pena. No invierto la secuencia.

**La instrumentación no se sostiene, por dos razones que se componen.**

1. **El detector es demasiado débil para la falla que nombra.** T-005 #3 es
   `grep -c "channel ===" element react ⇒ 0`. Eso caza igualdad estricta literal sobre `channel`, y
   **no** caza `channel ==`, `switch (channel)`, `channel.startsWith`, un lookup por clave
   literal, ni un `if (isWhatsApp)`. Peor: el hardcode **más probable** en la ola 1 no es una rama
   por canal en absoluto — es que `skin`, con un solo canal existiendo, dibuje el doble-tick y la
   colita-en-la-primera **directo, sin ninguna rama**. Ese código tiene **cero** ocurrencias de
   `channel ===` y pasa el grep impecable. El instrumento no puede ponerse rojo para su propia
   falla.
2. **Dispara dos olas tarde.** `skin` escribe el layout en la ola 1; el grep vive en T-005, ola 3.
   En el medio, la ola 2 es `capture/` (T-004), que **congela golden PNG byte-comparados** contra
   ese render. Si el hardcode se descubre en la ola 3, no sólo se reescribe el layout: se
   **invalidan todos los goldens** de la ola 2. Es exactamente el costo que §12 advierte
   (*«costo en la iteración 4: reestilar e invalidar todos los golden byte-comparados»*), sólo que
   llegando por la puerta de al lado.

**El arreglo es barato y cierra dos huecos de una.** La interfaz está especificada, así que **no
hace falta el adapter real de Telegram para probar que `skin` no hardcodeó**: alcanza un
**fixture de caps** que implemente los 16 campos con valores distintos en 3 observables (`tail:
last`, `receiptGlyph: single-tick`, `reactions: own-row`) y afirmar que el DOM **cambia**. Si
`skin` hardcodeó, el render con el fixture sale idéntico al de WhatsApp ⇒ **rojo**, en la ola 1,
antes de que existan goldens. Y ese mismo test es la sonda que le falta al criterio de éxito #2 del
brief («diferencias **estructurales** reales, no sólo color»), porque afirma diferencia en
estructura del DOM y no en color. → **B-5**.

---

## Amendments

| # | Tarea / archivo | Línea exacta | Cambio |
|---|---|---|---|
| **B-1** | `tasks/T-003.md` | Bloque `## Acceptance`, los tres ítems | Retitular **`## Acceptance (falsable)`** y agregar gemelo a cada uno. **#1** → añadir: *«Gemelo anti-aliasing: retener `s1 = seek(tl,t1)`, luego `seek(tl,t2)` con `t2>t1`; `s1` NO debe haber cambiado, y `s1` ≠ `s2` en un campo nombrado. Un `seek` que devuelve el Map interno vivo DEBE poner esto rojo.»* **#2** → añadir: *«Gemelo negativo: `seek` a un `t` ANTERIOR al `react` ⇒ la reacción está ausente.»* **#3** → **reemplazar el benchmark de 2 ms** por: *«Instrumentar contador de pasos de fold por `seek`; afirmar ≤ `64 + log2(n)`. Gemelo de escalado: 500 vs 5000 pasos ⇒ costo sublineal. Un fold lineal sin checkpoints DEBE ponerlo rojo.»* (El wall-clock se conserva sólo como señal informativa, nunca como criterio.) |
| **B-2** | `tasks/T-003.md` → n/a; **`tasks/T-006.md`** | `## Alcance`, la frase **«Tope de costo (A-1): si excede ~0,5 d, revertí a stub y avisá.»**; `scope.write`; `## Acceptance` #1 y #3 | (a) **Reemplazar el tope de tiempo por tope de alcance:** *«Cota dura, verificable leyendo el dato entregado: ≤6 cues por canal, ≤3 capas por cue, `wave` ∈ {sine, square, triangle, noise}. Orden de entrega OBLIGATORIO: (1) schema + `AudioSink` muteado, (2) cue packs. El "stub" es el caso degenerado de (1) con cero packs — se llega por resta, no se reconstruye. Si los packs no entran en la cota, PARÁ con (1) entregado y reportá en `.cofoundy/state/reports/skin.md`.»* (b) **Sacar `ChannelId` de T-006 y moverlo a T-005** (`adapters/**` es celda `W` de `channel`); T-006 conserva sólo el token CSS `--channel-imessage`. (c) **`--channel-imessage` + `ChannelId` son INCONDICIONALES y quedan FUERA de la cota** — son `mvp_scope.incluye` y no pueden caer como daño colateral del tope de audio. (d) **#1** → añadir: *«Gemelo positivo: con el sink DESMUTEADO, `scheduledNodes > 0` antes del seek y `=== 0` después. Un sink no-op DEBE poner esto rojo.»* (e) **#3** → reemplazar *«y suenan distinto»* por: *«los dos packs son deep-inequal como datos, y el digest del buffer PCM renderizado difiere entre canales. Gemelo positivo: el mismo pack dos veces ⇒ digest idéntico.»* |
| **B-3** | `tasks/T-007.md` | `## Acceptance` #2, la frase **«Criterio real: el fork `MobileComposer.tsx` (13 KB) de inbox-ai queda sin razón de ser.»** | Reemplazar por un instrumento en dos mitades, ambas rojas-capaces: *(i)* **Test mecánico:** simular `visualViewport` a altura de teclado (fake en jsdom o Playwright con viewport reducido) y afirmar que el bounding box del composer queda **dentro** del visual viewport; sin la resolución de `dvh`/`interactive-widget` DEBE fallar. *(ii)* **Checklist derivada del archivo real,** mismo patrón que A-4: enumerar los comportamientos de `products/cofoundy-platform/inbox-ai/frontend/src/components/conversation/MobileComposer.tsx` (verificado: 13 KB, existe) y afirmar cobertura ítem por ítem. **«Pierde su razón de ser» deja de ser prosa y pasa a ser una lista con casillas.** Esto instrumenta la `definicion_de_exito` #5. |
| **B-4** | `tasks/T-008.md` | `## Acceptance` #1 (el paréntesis) y #4 | (a) **Borrar el escape hatch** *«(o lleva adaptador documentado inline)»*. Reemplazar #1 por: *«La story de reemplazo se tipa contra la forma REAL: importar o transcribir literalmente `interface Message` de `products/cofoundy-platform/inbox-ai/frontend/src/lib/api.ts:229` (verificado) como fixture tipado; si la forma diverge, el typecheck DEBE fallar. Adaptador permitido sólo si el fixture de origen sigue siendo el tipo real.»* (b) **Cerrar la mitad huérfana de A-4:** añadir #5 → *«Calcular N y escribirlo: N = KB de `MessageBubble.tsx` + `MobileComposer.tsx` cubiertos por la story de reemplazo, registrado en `.cofoundy/state/reports/qa.md`. Sin N escrito, el criterio de éxito #4 sigue afirmándose.»* (c) **#4:** quitar de la acceptance de `qa` la anotación en `src/types/**` (celda ⛔ para las seis lanes) y reescribir: *«`COMPONENTS.md` actualizado; la deuda de los dos `Message` se **solicita** por `A` en `reports/qa.md` con el texto exacto propuesto para `src/types/message.ts:62` y `src/types/index.ts:28` — la aplica el CTO. La acceptance de qa se satisface con la solicitud, no con el write.»* |
| **B-5** | `tasks/T-002.md` (agrega) y `tasks/T-005.md` (refuerza) | T-002 `## Acceptance`, **ítem nuevo #6**; T-005 `## Acceptance` #3 | (a) **T-002 #6 (nuevo, ola 1):** *«Test de fixture de caps: renderizar el mismo guion con un fixture que implemente los 16 campos difiriendo de WhatsApp en `tail: last`, `receiptGlyph: single-tick`, `reactions: own-row`; el DOM debe cambiar en las tres. **Gemelo positivo:** con el fixture WhatsApp, el DOM vuelve al render de referencia. Un layout hardcodeado DEBE ponerlo rojo — en la ola 1, antes de que `capture/` congele goldens.»* (b) **T-005 #3:** el grep se conserva como red barata pero deja de ser el detector primario; añadir: *«El detector de hardcode es el test de fixture de caps de T-002 #6, extendido a los dos adapters reales. El grep no caza `switch`, `==`, lookups por clave literal, ni un render mono-canal sin ramas.»* **Esto instrumenta además la `definicion_de_exito` #2** (diferencias estructurales, no de color). |
| **B-6** | `tasks/T-002.md` | `## Acceptance`, **ítem nuevo #7** | *«El bundle construido de `element/` contiene **cero** React: afirmarlo sobre el grafo de imports del build (`react`/`react-dom` ausentes de las dependencias del bundle). Gemelo positivo: la misma sonda contra el bundle de `react/` DEBE dar positivo — un chequeo que nunca encuentra React no prueba nada.»* Instrumenta la `definicion_de_exito` #3 («las dos landings Astro lo montan sin agregar React»), que hoy no tiene ninguna sonda: `demo/index.html` abre igual aunque React venga empaquetado. |
| **B-7** | `specs/file-ownership-matrix.md` §Olas + protocolo de reportes de lane | Fila de «Reportes» de la tabla de verificación de colisión | Hacer **medible** el tripwire `budget_overrun`, hoy infireable: *(i)* cada `.cofoundy/state/reports/{lane}.md` **DEBE** abrir con el campo `wall_clock_minutes:` — un reporte sin él es reporte incompleto; *(ii)* el CTO suma el acumulado **al cierre de cada ola**; *(iii)* **disparo duro:** si el acumulado cruza **24 h** en cualquier momento, `budget_overrun` escala **de inmediato**, sin terminar la ola; *(iv)* **disparo temprano:** al cierre de la ola 3 (6 de 8 tareas), si el acumulado supera **16 h**, escalar ahí — la cola (T-007 react+mobile, T-008 stories+tests+coverage+docs) no baja plausiblemente de 8 h, y 24 − 8 = 16. La cifra es derivada, no elegida. |
| **B-8** | `brief.yaml` | `mvp_scope.incluye`, ítem nuevo al final | Añadir: *«`sound/`: schema declarativo + cue packs de WhatsApp y Telegram como datos + `AudioSink` muteado por default + story de audición. Acotado (≤6 cues/canal, ≤3 capas/cue). Autorizado por ceo-agent en Fase 2 (enmienda A-1) respondiendo a la queja explícita del operador sobre los sonidos; el brief lo había omitido. NO incluye ampliar la biblioteca de cues.»* Sin esto, el ciclo entrega un deliverable que el brief no nombra y el pivot queda tácito. |

---

## Rationale

**Por qué AMEND y no APPROVE.** Un `approve` limpio dejaría entrar un ciclo donde tres de los cinco
criterios de éxito del brief no tienen sonda que pueda ponerse roja (#2, #3, #5) y un cuarto tiene
una disoluble por un paréntesis (#4). El ciclo terminaría en verde sin haber medido lo que
prometió. Ese es precisamente el fallo que la Falsifiable Instrument Gate existe para prevenir, y
sería incoherente adoptarla para las tareas y no para las promesas.

**Por qué AMEND y no REJECT.** El graph no contradice el brief ni la arquitectura. La partición por
rol es correcta, la matriz resuelve las cuatro colisiones reales, el orden de olas deriva de R-1, y
cuatro de las ocho tareas ya traen instrumentos genuinos. Las ocho enmiendas agregan sondas y
reasignan dos celdas; ninguna reescribe una decisión de arquitectura ni cambia el alcance.

**Por qué AMEND y no ESCALATE.** Los dos roces de `scope_expansion_request` caen en su cláusula
`exempt` (reasignación a la lane dueña, que es mi autoridad explícita). `budget_overrun` straddlea
sin datos, y escalar sobre «no sé» es el anti-patrón que mi encargo prohíbe y que el contrato de
autonomía del operador castiga. Ninguno de los cinco `always_escalate` toca este gate.

**Sobre la coherencia con mi decisión previa.** No contradigo nada de la Fase 2. B-2 aprieta mi
propia A-1 cambiándole la magnitud del tope (tiempo → alcance) sin revertirla; B-4 completa la
mitad de A-4 que nunca aterrizó; B-8 hace visible el pivot que A-1 introdujo. Ninguna es un
SUPERSEDES: son la misma decisión, instrumentada.

**Un hallazgo que encontré y que NO uso como razón.** El graph carece de estimaciones por tarea, y
eso es lo que deja a `budget_overrun` sin instrumento. Es un defecto real y B-7 lo repara. Pero mi
veredicto no depende de él: aunque el graph trajera estimaciones, las ocho enmiendas seguirían
siendo necesarias, porque son sobre falsabilidad, no sobre presupuesto. Lo arreglo y lo separo del
veredicto a propósito.

## Alternatives considered

- **Approve limpio.** Rechazado: tres criterios de éxito del brief entran al ciclo sin sonda, y
  T-003 pasaría en verde con la maquinaria de checkpoints ausente.
- **Escalar por `budget_overrun`.** Rechazado: el brief no declara presupuesto (segunda cláusula del
  `detect` inerte), la mitad USD está medida en ≈0 contra 50, y la mitad horas straddlea sin datos.
  Mi Fase 2 fijó el disparo «con datos»; escalar sobre una segunda estimación contradiría eso sin
  hecho nuevo. B-7 hace que la próxima vez haya datos.
- **Escalar por `scope_expansion_request` (audio fuera de `mvp_scope`).** Rechazado: el deliverable
  rastrea a una declaración explícita del operador, que por precedencia está sobre la config del
  proyecto; está acotado por B-2 y explicitado por B-8. Escalarlo sería pedirle al humano que
  vuelva a contestar lo que ya dijo.
- **Invertir la secuencia para que `channel` (T-005) preceda a `skin` (T-002).** Rechazado: rompe
  R-1 (nada se construye que no sea abrible en la misma iteración) y retrasa la demo abrible dos
  olas, a cambio de un riesgo que un fixture de caps neutraliza en la ola 1 por mucho menos.
- **Dejar el tope de T-006 como está y confiar en el juicio de la lane.** Rechazado: un tope de
  tiempo auto-medido por el actor acotado sólo puede constatarse violado. B-2 lo vuelve verificable
  leyendo el dato entregado.
- **Anotar la deuda de `Message` desde `qa` y carvear la matriz.** Rechazado: `src/types/**` es ⛔
  por A-3 (la deuda se **aísla**, no se repara); abrirla a `qa` reintroduce el riesgo que A-3 cerró.
  La solicitud por `A` conserva el aislamiento y satisface la acceptance.

## What would flip this

- **A `escalate`:** que el acumulado de wall-clock cruce **24 h** en cualquier ola, o **16 h** al
  cierre de la ola 3 (B-7). También si aparece un deadline de la app de Fovente (D-2, registrado en
  Fase 2 como escalación inmediata), o si alguna lane reporta necesitar copia literal de
  `whatsimule` (A-2).
- **A `approve`:** que las ocho enmiendas se apliquen y el graph vuelva a gate. **Ojo: ese approve
  cruza `files_touched_gt: 25` ⇒ le toca refute-pass** antes de ejecutar.
- **A `reject`:** si al aplicar B-5 resultara que el fixture de caps no puede escribirse sin el
  adapter real, la premisa de la ola 1 («la interfaz especificada alcanza») sería falsa y habría que
  re-secuenciar de verdad, no instrumentar.
- **B-2 se relaja** si la cota de ≤6 cues/canal resulta insuficiente para que los dos canales suenen
  estructuralmente distintos: eso sería evidencia de que la cota, no el tiempo, era el límite
  equivocado.

## Sources

- `brief.yaml` — `mvp_scope.incluye`/`excluye`, `definicion_de_exito` (los cinco), `restricciones`,
  `decisiones_humanas_abiertas` D-1/D-2
- `tasks/T-001.md` … `T-008.md` — los ocho, íntegros
- `specs/file-ownership-matrix.md` — celdas ⛔ de `src/types/**`, tabla de olas, protocolo de reportes
- `specs/architecture-v1.md` §9 (orden de construcción, y la ausencia del cálculo de N), §10
  (recortes + tope de A-1), §11 (riesgos 1 y 4), §12 (contrato de estilado), §13 (correcciones del refute)
- `specs/adapter-interface-draft.md` — los 16 campos con valores por canal; la propiedad falsable del adapter
- `state/escalation-effective.yaml` — sello verificado por comparador (exit 0, `apply`, `cto-d606f0`)
- `state/escalation-queue.jsonl` — `esc-c1b8c98e0ecfa2` (refute de Fase 2), **resuelto**; sin ítems abiertos
- Decisión previa: `context/decisions/2026-09-04-phase-2-arch.md` (A-1..A-5, predicado de `budget_overrun`)
- `~/.claude/CLAUDE.md` — §contrato de autonomía («parar ante una pregunta desperdicia la ventana»;
  «nunca absorbas en silencio un pivot de scope»); precedencia operador > config de proyecto
- `packages/ui/CLAUDE.md` — contrato `MobileBaseline`, SSOT de `COMPONENTS.md`
- **Verificado en disco, no inferido:**
  `products/cofoundy-platform/inbox-ai/frontend/src/components/conversation/MobileComposer.tsx` (13 KB, existe) ·
  `…/frontend/src/lib/api.ts:229` (`interface Message`, la forma real para B-4) ·
  `…/frontend/src/lib/messageGrouping.ts:25` (`groupKey`, el que el adapter adopta)

## Next action

/cto aplica las ocho enmiendas sobre `tasks/T-002.md`, `T-003.md`, `T-006.md`, `T-007.md`,
`T-008.md`, `specs/file-ownership-matrix.md` y `brief.yaml`, y **re-gatea Fase 5**. El approve
posterior es HIGH blast radius por `files_touched_gt: 25` ⇒ **corre refute-pass antes de
despachar**. Al cierre de cada ola, sumar `wall_clock_minutes` de los reportes de lane y evaluar
B-7 (disparo duro 24 h · disparo temprano 16 h al cierre de la ola 3).
