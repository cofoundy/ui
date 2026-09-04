# Mobile composer checklist — T-007 acceptance #3

architecture-v1.md §8: *"Medible: el fork de `MobileComposer` queda sin razón de ser."* This is
that measurement, not an opinion. Source: `products/cofoundy-platform/inbox-ai/frontend/src/
components/conversation/MobileComposer.tsx` (13 KB, read in full 2026-09-04). One row per reason
**the file itself declares** for existing — not reasons inferred from outside it.

## A finding before the table

None of the seven reasons below is "the keyboard/viewport" — `MobileComposer.tsx` never mentions
`visualViewport`, `dvh`, or `interactive-widget` (grepped, zero hits across all of inbox-ai's
frontend, confirmed by team-lead). The fork exists for **layout and interaction-budget** reasons,
not for a keyboard-resize bug it never attempted to fix. `useKeyboardInset.ts` (this task) closes
the actual §8 gap — but that's an addition `react/` makes on top of the checklist below, not a row
in it: it answers a question `MobileComposer.tsx` never asked.

## The table

| # | Razón declarada (MobileComposer.tsx) | Veredicto | Por qué |
|---|---|---|---|
| 1 | Layout propio estilo WhatsApp (píldora con íconos dentro + botón enviar afuera) — el docstring dice literalmente "no un **ajuste de CSS sobre el** `MessageComposer`" porque reordenar hermanos y sacar el botón de enviar de la caja dependería del DOM interno de un paquete externo. | **Cubierto** | `LiveComposer.tsx` es dueño de su propio DOM (`react/**`, sin dependencia externa) — implementa la píldora + círculo directamente, sin ese problema de origen. |
| 2 | Presupuesto de iconos a ~390px — cita literal: *"**Tres botones y no cuatro**"* (emoji + adjuntar + IA + plantilla no entraban; la plantilla se movió al menú del header). | **Cubierto** | Por diseño minimalista: `LiveComposer` tiene 2 controles (input + enviar) — nunca se acerca al presupuesto que forzó el menú overflow en `MobileComposer`. |
| 3 | La nota de voz no es un cuarto botón — cita literal: *"**el micrófono NO entró en la píldora**"*, el círculo de ENVIAR cambia de rol cuando no hay texto. | **No cubierto** | Fuera de alcance: chat-sim es un simulador/demo, no tiene notas de voz. No hay rol que intercambiar. |
| 4 | Estado `busy`/Parar — el MISMO control primario cambia de rol en vez de sumar un botón; cita literal sobre el color: *"**Parar no es rojo ni de peligro**"*, tokens de TEMA (`--chat-*`), no de marca. | **No cubierto** | Fuera de alcance: `mode="live"` no tiene una respuesta de IA en vuelo que interrumpir — no hay backend detrás del composer. |
| 5 | `allowEmptySend` — cita literal: *"**Mismo nombre y misma semántica**"* que la prop homónima del `MessageComposer` de escritorio (#591), paridad de vocabulario entre las dos pantallas forkeadas. | **No cubierto / N/A** | chat-sim no comparte código ni vocabulario con `@cofoundy/ui`'s `MessageComposer` — no existe una pantalla de escritorio hermana en esta familia con la que guardar paridad. |
| 6 | Borrador (`initialValue`) — cita literal: *"El borrador **recuperado puede ser de varias líneas**"*, el textarea crece para mostrarlo al montar (auto-grow, tope `MAX_HEIGHT`). | **Cubierto** | `LiveComposer`'s `handleInput` hace auto-grow del textarea hasta `MAX_HEIGHT` en cada tecleo — mismo mecanismo (sin el caso "recuperar al montar", que no aplica: `LiveComposer` siempre monta vacío). |
| 7 | Sin "Enter envía" — un teclado táctil no diferencia Shift, así que el envío es SOLO por botón. | **Cubierto** | `LiveComposer` no registra ningún handler de teclado; Enter es un salto de línea normal del `<textarea>`, enviar es exclusivamente el botón. |

**4 de 7 cubiertas.** Las 3 no cubiertas son, en las tres, la misma clase de brecha: capacidades de
un composer de *mensajería real* (notas de voz, un estado async que interrumpir, vocabulario
compartido con un paquete hermano) que un composer de *simulador* no tiene motivo para replicar.
Ninguna es una regresión — son features que este ciclo nunca prometió.

## Lo que SÍ es nuevo (no está en la tabla porque no es una razón del fork)

`useKeyboardInset.ts` implementa lo que architecture-v1.md §8 realmente pide medible:
`visualViewport` + `100dvh` (root, `mode="live"`) + `env(safe-area-inset-bottom)` + tap targets
≥44px + `font-size` ≥16px en el `<textarea>`. Verificado mecánicamente en
`__tests__/mobile-viewport.test.tsx` (T-007 acceptance #2), no acá — esta tabla es sobre las
razones del FORK, esa prueba es sobre el TECLADO.
