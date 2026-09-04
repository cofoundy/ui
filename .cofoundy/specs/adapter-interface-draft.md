# Interfaz del channel adapter — insumo de Fase 3 (api-contract)

Refinamiento posterior al gate de Fase 2. **No amenda `architecture-v1.md`**: la decisión de fondo
(§3) no cambia; esto fija los campos exactos, que es materia del contrato, no de la arquitectura.

## Los 16 campos

| Propiedad | WhatsApp | Telegram | iMessage |
|---|---|---|---|
| `tail` | `first` de la racha | `last` | `last` |
| `wallpaper` | `pattern` | `pattern` | `none` |
| `reactions` | `overlay-below` | `own-row` | `overlay-edge` |
| `reactionConstraint` | cualquier emoji · `maxAgeDays 30` · `canTargetReaction false` | allowlist 73 · sin límite de edad | 6 tapbacks · `canTargetOutbound true` |
| `groupKey` | actor puro, **sin ventana temporal** (`in` / `out:ai` / `out:human:{id}`) | idem | idem |
| `deliveryStates` | queued→sent→delivered→read→failed | queued→sent→read→failed **(sin delivered)** | queued→sent→delivered |
| `receiptGlyph` | `double-tick` | `single-tick` | `trailing-label` |
| `counter` | — | `views` (canales) | — |
| `timestamp` | `inside-pad` | `inside-plain` | `gutter` |
| `quote` | `color-bar` | `thin-bar` | `stacked-bubble` |
| `bubbleTransport` | `per-conversation` | `per-conversation` | **`per-message`** |
| `senderKinds` | human · ai | human · ai · **bot · forwarded · channel** | human |
| `keyboard` | `os-qwerty` | `inline-in-message` | `os-qwerty` |
| `album` | `grid-in-one-bubble` | `grid-in-one-bubble` | `separate` |
| `e2eNotice` | `true` | `false` (salvo Secret Chats) | `true` |
| `avatarSide` | `inbound` | `inbound` | `none` |

`groupKey` es **exactamente** el de `inbox-ai/lib/messageGrouping.ts:25`, que a su vez es el de
`ChatDemo.astro`. No se reinventa: se adopta el que ya está en producción.

## La propiedad que hace falsable al adapter

**El adapter valida el guion en compile-time.** Un `receipt:'delivered'` en Telegram, o un emoji
fuera de la allowlist de 73, es **error de compilación** — no un render silencioso.

Esto es la Falsifiable Instrument Gate aplicada al adapter: la pregunta "¿qué tendría que romperse
para que esto se ponga rojo?" tiene respuesta concreta y verificable con un test negativo que debe
fallar a compilar, más su gemelo positivo (el mismo guion en WhatsApp compila).

## Partición de módulos

`caps.ts` es **hoja y no importa nada**; `registry.ts` importa los adapters. Fusionados se cierra
el ciclo `base → capabilities → whatsapp → base`, exactamente como en el Python de inbox-ai.

## Mitigación concreta del riesgo #1 (dependencia sin pin)

**Nada nuevo en el barrel principal.** El ciclo exporta solo por subpath `@cofoundy/ui/chat-sim`.
Un merge a `main` no puede romper ningún import existente de Fovente porque no toca `src/index.ts`.
Esto convierte el riesgo de "todo push entra a su prod" en "todo push agrega un subpath que nadie
importa todavía".

## Regla dura del orden de construcción

**No se construye nada que no sea abrible en la misma iteración.** No hay entrega parcial tipo
"core listo, cara después". Deriva de R-1 y aplica a las 6 iteraciones.
