# Prior art — spec de comportamiento y por qué su modelo temporal no sirve

Fuente: lectura completa de `whatsimule` v1.0.50 (MIT) por `recon-prior-art`, 2026-09-04.
**Este documento describe QUÉ debe hacer un simulador, no CÓMO lo hace ese repo.**

## Hallazgo central — el tiempo es la pila de llamadas, no un modelo

`simulator-engine.ts:381-1217` es un `for` async sobre los pasos: `await sleep(delay)` →
micro-coreografía hardcodeada → postea el mensaje. No hay scheduler ni timeline.

Consecuencias medidas (no inferidas):

| Mecanismo | Implementación | Garantía real |
|---|---|---|
| Determinismo | `Math.random()` en tecla, backspace, caption, búsqueda (`:691,698,723,729,827,1078`) | **NO determinista.** Dos corridas del mismo guion difieren en duración ⇒ captura frame-exacta imposible |
| Pausa | `sleep()` mira `isPausedState` al entrar; si pausado espera `max(10,ms)` SIN escalar y retorna (`:366-369`) | **No pausa.** El guion sigue a 1×; sólo se congela la barra ⇒ progreso y contenido se desincronizan |
| Seek | `goToStep(i)` → `startScript(id,i)` (`:1247`) reconstruye desde cero; previos sintetizados con timestamps falsos `now−(i−k)·60000` (`:301-308`) | **Re-instanciación, no scrub.** Pasos erase/avatar/llamada/push hacen `continue` ⇒ el seek PIERDE las tarjetas de llamada |
| Velocidad | `sleep()` divide `ms/speed` por llamada (`:369`); el prop se congela al montar (`useWhatsAppSimulator.ts:13`) | Sólo afecta sleeps futuros; el prop no es reactivo |
| Duración total | `calculateScriptDuration` (`:203-226`) estima, no mide | Miente: 0 ms para image/audio (reales ~2.5 s/~4.5 s), 1400 vs 1700 ms de assistant, y no divide por speed mientras el ticker corre en tiempo real (`:352-359`) ⇒ a 2× la barra muere al 50% |
| Cancelación | `activeRunId++` (`:295`) + guard tras cada await (~50 sitios) | La corrutina vieja queda suspendida para siempre — `clearAllTimers` (`:230`) mata el timeout y su promesa nunca resuelve |
| `stop()` | `:1280` | No limpia `attachmentMenu`, `contactPicker`, `incomingCall`, `pushNotification` ⇒ overlays huérfanos |

**Esto no es una lista de bugs a arreglar: es el techo de esa arquitectura.** Un modelo temporal
basado en la pila de llamadas no puede dar seek exacto ni reproducibilidad, que es justo el
requisito #1 de nuestro caso de uso (captura para marketing).

## Nuestro modelo temporal (decisión arquitectónica derivada)

```
guion + seed  ──compilar──▶  timeline inmutable [(t, evento)]
play    = avanzar reloj
pause   = detener reloj                       (pausa real)
seek(t) = estado(t) = replay de eventos ≤ t   (función pura de t y seed)
capture = renderizar estado(t)                 (frame-exacto, reproducible)
```

Invariantes que el engine DEBE cumplir y que el prior art no cumple:

1. **`estado(t)` es función pura de `(guion, seed, t)`.** Misma entrada ⇒ mismo píxel.
2. **Toda aleatoriedad viene de un PRNG sembrado**, nunca de `Math.random()`.
3. **`seek` no pierde eventos** — todo paso deja estado reconstruible, incluidos los que el prior
   art saltea (erase, avatar, llamada, push).
4. **`duration` se calcula de la timeline compilada**, no se estima ⇒ no puede mentir.
5. **`pause` detiene el reloj**, no sólo la barra.
6. **Cancelar resuelve las promesas pendientes** — sin corrutinas colgadas.

## Inventario de comportamientos a igualar o superar

| Capacidad | Disparo | Comportamiento | Nota para el rewrite |
|---|---|---|---|
| Tecleo char-a-char | `user/text` | char a char; modo teclado resalta y suelta cada tecla (`:660-700`) | el jitter va por PRNG sembrado |
| Borrado antes de enviar | `eraseBeforeSend` | escribe todo → 450 ms → backspace char a char → NO postea (`:702-740`) | debe dejar rastro seekable |
| Indicador "escribiendo" | paso no-user | 1400 ms **fijos**, ignora el largo del texto (`:1163-1171`) | derivar del contenido |
| Grabación de voz | `user/audio` | 35 ticks × 100 ms, waveform, timer (`:905-945`). Duración **fija 3.5 s**; `audioDuration` es texto decorativo | la duración debe ser real |
| Nota de voz recibida | `assistant/audio` | `isRecordingAudio` → "grabando audio…" (`:1161`) | |
| Staging de imagen | `type:image` | preview full-screen → caption tecleado → burbuja con blur + anillo SVG 10→30→60→85→100 (`:766-900`) | |
| Tarjeta de contacto | `type:contact` | coreografía de 9 pasos (`:973-1155`); **5 contactos ficticios hardcodeados con fotos de Unsplash** (`:982-988`) | ⚠️ assets de terceros embebidos — no replicar |

(Secciones 2-cont a 7 pendientes del agente: llamadas, push, avatar, markdown, code blocks,
link preview, sonido, estados visuales, WhatsApp vs Telegram.)
