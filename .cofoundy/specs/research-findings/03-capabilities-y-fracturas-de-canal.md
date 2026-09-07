# Modelo de capabilities (de prod) + las fracturas WhatsApp↔Telegram

## 1. `capabilities.py` de inbox-ai — la forma a espejar en TS

**Módulo hoja, no importa nada.** La cadena es deliberada:
`capabilities ← base ← los 6 adapters ← registry`. El registro `channel_type → capabilities` vive
en `registry.py`, NO acá, porque si viviera acá tendría que importar los adapters y cerraría el
ciclo `base → capabilities → whatsapp → base`. **Espejamos también esta separación en TS.**

```python
class Capability(StrEnum):
    REACTION = "reaction"
    BUTTONS  = "buttons"
    LIST     = "list"
    AUDIO_SEND = "audio_send"

@dataclass(frozen=True)
class ReactionConstraint:
    allowed_emoji: frozenset[str] | None = None  # None = cualquiera (WA) · frozenset = allowlist (TG, 73)
    max_per_message: int = 1
    max_age_days: int | None = None              # None = sin límite (TG) · 30 = WA (error 131009 pasado eso)
    can_target_own: bool                          # ...
```

**La tesis del diseño, textual del docstring:** *"Fields, not a boolean — Telegram y WhatsApp
ambos 'soportan reacciones' mientras no coinciden en casi nada sobre qué significa eso."*
Es exactamente el argumento de por qué canal ≠ tokens de color, ya validado en producción.

**Detalle que vale oro y que nadie adivina:** `normalize_reaction_emoji()` — la allowlist de
Telegram escribe `❤`, `⚡`, `🕊`, `✍`, `☃` **sin** el variation selector U+FE0F, mientras que todo
emoji picker lo emite. Comparar en crudo es un fallo garantizado. Hay UNA implementación a
propósito: allowlist, validador y adapter de salida la llaman todos.

**Qué reemplazó:** guards duck-typed (`hasattr(adapter,"send_reaction")`) y un
`_INTERACTIVE_CHANNELS` que confundía tres capabilities en un set — por eso Telegram (reacciones
sí, botones estilo WhatsApp no) **no se podía expresar**. Es la misma trampa que evitamos.

## 2. 🔴 CORRECCIÓN AL MODELO TEMPORAL: la timeline es un FOLD, no un append

Las fracturas de canal obligan a esto. Telegram muta mensajes **ya posteados**: editar, fijar,
borrar-para-todos, reaccionar. El `messages[]` append-only del prior art (`:1203`) no alcanza.

```
estado(t) = fold(eventos donde e.t ≤ t, aplicar)     ← no "concat de mensajes"
```

⇒ Requisitos derivados: **los mensajes necesitan id estable** (para que una mutación los apunte),
y los eventos incluyen `post | edit | delete | react | pin | read`, no sólo `post`.
El fold mantiene la pureza de `estado(t)` y absorbe la mutación sin caso especial.

## 3. Las 3 fracturas duras entre canales

| # | Fractura | Qué rompe |
|---|---|---|
| 1 | **Mensajes mutables e identificables** | edit / pin / delete-for-all / reacciones ⇒ el array append-only |
| 2 | **Entrega como máquina de estados explícita** | TG: 1 check enviado, 2 leído, **+ contador de vistas** en canales, y **no hay "entregado"**. WA: queued→sent→delivered→read |
| 3 | **Coreografía como datos por canal** | inline keyboards dentro del mensaje (TG) vs QWERTY del SO (WA); **álbumes** (N imágenes = 1 mensaje); video messages redondos |

Otras asunciones del prior art que se rompen: `sender` binario decide layout (no hay bots ni
reenviados), cola siempre presente (TG agrupa y pone cola sólo en la última), un chat = un contacto
(TG tiene topics y carpetas), y el aviso de E2E hardcodeado (`WhatsAppSimulator.tsx:733`) que es
**falso en Telegram** salvo Secret Chats.

## 4. Sonido — qué es parametrizable y qué está soldado

Las 7 recetas tienen **una sola forma** (`audio-synth.ts:36-215`): ctx singleton → N osciladores →
**un** GainNode compartido → destination. `type="sine"` siempre. Envolvente = peak + rampa
exponencial. El schema declarativo cae solo y cubre las 7 sin excepción:

```
{ id, layers: [{ freq | [from,to], startMs, durMs, jitterHz? }], gain, repeat?: [offsetsMs] }
```

**El DSP es ~90% parametrizable. Lo soldado es la taxonomía, la onda y el ciclo de vida:**

| Soldado | Por qué importa para multi-canal |
|---|---|
| `SoundType` union cerrado + `switch` 1:1 | la taxonomía es **global**, no por canal ⇒ Telegram no puede declarar `reaction` ni `edit` |
| `type="sine"` en las 7 | sin square/triangle/**noise** no hay percusivos ni whoosh — **Telegram suena distinto por textura, no por frecuencia** |
| **un** gain para todas las capas | la 2ª capa entra en una envolvente ya decayendo; falta envolvente por capa y falta *attack* |
| `AudioContext` singleton de módulo | dos simuladores en la página comparten mixer; sin master gain ni ducking |
| sin handle de cancelación | un seek deja la cola sonando (ver clase 5 del finding 01) |

⇒ **El sound pack es por canal, con envolvente por capa, soporte de ruido, y ciclo de vida
cancelable.** Nada de samples reales de WhatsApp/Telegram: esos assets sí son copyright, a
diferencia del código MIT.

## 5. Dato que refuerza no copiar: en lo más visible, NUESTRO código ya es mejor

| Detalle | prior art | `ChatDemo.astro` + inbox-ai |
|---|---|---|
| Agrupación por remitente | **no existe** — una cola por mensaje: 5 seguidos = **5 colas** (`MessageBubble.tsx:170-184`) | agrupan; cola sólo en la primera de la racha |
| Estado de entrega | **no existe** — doble check azul siempre, para todo mensaje del usuario (`:333`) | máquina real: queued/sent/delivered/read/failed |
| Separadores de día | no | sí (`InboxMessageList` agrupa por fecha) |

En el detalle más visible de WhatsApp — la colita y la agrupación — el prior art está
objetivamente mal y nuestras dos implementaciones están bien.
