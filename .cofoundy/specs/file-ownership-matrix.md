# file-ownership-matrix.md — chat-sim

`W` = escribe · `R` = lee · `A` = pide al dueño (nunca escribe)
**Regla dura: ninguna celda con 2+ `W`.** Verificado abajo.

| Path / glob | core | channel | skin | capture | app | qa |
|---|---|---|---|---|---|---|
| `src/components/chat-sim/core/**` | **W** | R | R | R | R | R |
| `src/components/chat-sim/adapters/**` | R | **W** | R | R | R | R |
| `src/components/chat-sim/element/**` | R | R | **W** | R | R | R |
| `src/components/chat-sim/styles.css` | – | A | **W** | A | A | – |
| `src/components/chat-sim/react/**` | R | R | R | – | **W** | R |
| `src/components/chat-sim/capture/**` | R | – | R | **W** | – | R |
| `scripts/capture-chat.mjs` | – | – | – | **W** | – | R |
| `src/components/chat-sim/index.ts` | **W** | A | A | A | A | R |
| `package.json` (solo campo `exports`) | **W** | – | – | A | – | – |
| `src/stories/chat-sim/**` | – | – | – | – | – | **W** |
| `src/__tests__/chat-sim/**` | – | – | – | – | – | **W** |
| `COMPONENTS.md` | – | – | – | – | – | **W** |
| `eslint` rules del ciclo (invariantes 4 y 5) | **W** | – | A | – | – | R |
| `src/index.ts` (barrel principal) | ⛔ | ⛔ | ⛔ | ⛔ | ⛔ | ⛔ |
| `src/styles/index.css` (sheet global) | ⛔ | ⛔ | ⛔ | ⛔ | ⛔ | ⛔ |
| `src/types/**` | ⛔ | ⛔ | ⛔ | ⛔ | ⛔ | A |

⛔ = **prohibido a todas las lanes.** Los dos primeros por §12 (el aislamiento del ciclo depende de
no tocarlos). `src/types/**` porque la deuda de los dos `Message` se **aísla, no se repara** (A-3);
`qa` puede pedir la anotación de deuda, que la aplica el CTO.

## Verificación de colisión

Ninguna fila tiene dos `W`. Las cuatro superficies que tentaban a colisionar, resueltas:

| Superficie | Riesgo | Resolución |
|---|---|---|
| `styles.css` | 4 lanes quieren tokens | **`skin` es dueño único**; las demás piden por `A`. Un token nuevo es un pedido, no un append paralelo |
| `index.ts` (barrel del subpath) | todas exportan algo | **`core` es dueño único**; el resto pide. Evita el conflicto de merge clásico del índice compartido |
| `package.json` | dos lanes tocarían `exports` | solo `core`, y **solo el campo `exports`**, en la iteración 1 |
| Reportes | append paralelo al log del ciclo | cada lane escribe `.cofoundy/state/reports/{lane}.md` (nombre único, cero colisión); el CTO es el ÚNICO que escribe el índice |

## Telemetría de presupuesto (B-7)

Cada `.cofoundy/state/reports/{lane}.md` **debe** abrir con `wall_clock_minutes: <n>`. No es
opcional: sin el dato, `budget_overrun` es infireable y el threshold queda decorativo.

| Umbral | Acción |
|---|---|
| **16 h acumuladas al cierre de la ola 3** | aviso temprano — el CTO reproyecta (24 − 8 de margen) |
| **24 h acumuladas** | **disparo duro ⇒ escala** |
| **> USD 50** | escala (hoy ≈0: ninguna tarea usa servicios de terceros) |

## Olas (respetan el tope de concurrencia 2-3)

| Ola | Lanes | Desbloquea |
|---|---|---|
| 1 | `core` + `skin` | it. 1: demo abrible (core mínimo + element + WA layout) |
| 2 | `core` + `capture` | it. 2: fold completo + seek + PNG byte-idéntico |
| 3 | `channel` + `skin` | it. 3: Telegram + máquina de entrega + token iMessage |
| 4 | `app` + `qa` | it. 4-5: react, mobile, stories, tests |
| 5 | `qa` | it. 6: `MobileBaseline`, `COMPONENTS.md` |

`channel` arranca en la ola 3 a propósito: la interfaz de 16 campos ya está especificada en
`adapter-interface-draft.md`, así que `skin` puede construir el layout de WhatsApp contra ella sin
esperar la implementación.
