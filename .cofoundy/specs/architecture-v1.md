# architecture-v1.md — chat-sim-rewrite

**Ciclo** `chat-sim-rewrite` · `packages/ui` · rama `cto/chat-sim-rewrite` · 2026-09-04
**Estado:** completa · pendiente gate Fase 2 (`ceo-agent`)

**Premisa:** no inventamos un componente — consolidamos uno escrito tres veces
(`ChatDemo.astro` 190 líneas · `inbox-ai/MessageBubble.tsx` 68 KB · primitivas de `@cofoundy/ui`).
El lenguaje visual ya está validado en producción, y en agrupación / colita / estados de entrega es
objetivamente mejor que el prior art. Lo que falta es el lugar donde viva y un modelo temporal que
no mienta.

---

## 1. Modelo temporal — la timeline es un FOLD

**Decisión: `estado(t) = fold(eventos ≤ t)` sobre una tabla de mensajes con ids estables.**
No un array append-only: Telegram muta mensajes ya posteados (edit / pin / delete-for-all /
reacciones) y un `concat` no lo absorbe sin caso especial.

```ts
type Tick  = number;   // ms virtuales enteros desde t0
type MsgId = string;   // ESTABLE — asignado en compile; es lo que la mutación apunta

type Ev =
  | { k:'post';    id:MsgId; step:SimStep }
  | { k:'edit';    id:MsgId; v:number }
  | { k:'delete';  id:MsgId; scope:'me'|'all' }
  | { k:'react';   id:MsgId; emoji:string; by:ActorId; remove?:boolean }
  | { k:'pin'|'unpin'; id:MsgId }
  | { k:'receipt'; id:MsgId; to:DeliveryState }   // validado contra el canal (§2)
  | { k:'read';    upTo:MsgId }
  | { k:'views';   id:MsgId; n:number }           // canales de Telegram
  | { k:'draft';   by:ActorId; chars:number }   // ENMIENDA 2026-09-04: era idx:number     // tecleo / borrado en el composer
  | { k:'flag';    key:string; value:Json }       // badge aiOn/aiOff, wallpaper, keyframe de tilt
  | { k:'overlay'; id:string; phase:string }      // llamada, push, contact-picker
  | { k:'cue';     sound:SoundId };               // EMITIDO, no aplicado por el reducer

interface Frame { t: Tick; ev: Ev }

interface SimState {                              // el acumulador del fold
  msgs:    ReadonlyMap<MsgId, MsgState>;          // copy-on-write shallow
  order:   readonly MsgId[];
  pinned:  MsgId | null;
  draft:   Draft | null;
  flags:   Record<string, Json>;
  overlays: Overlay[];
  scrollId: MsgId | null;
}

interface Timeline {
  readonly t0:          Tick;                     // epoch virtual — dato del GUION, no del reloj
  readonly frames:      readonly Frame[];
  readonly keys:        Int32Array;               // frames.map(f => f.t) — binary search
  readonly checkpoints: readonly SimState[];      // snapshot cada K=64 frames
  readonly duration:    Tick;                     // = frames.at(-1).t — se MIDE, no se estima
  readonly digest:      string;                   // hash(script, seed, channel, version)
}
```

### Compilador

`compile(script: SimScript, opts: { seed:number; channel:ChannelId; locale:string; t0:Tick }): Timeline`

**Puro por lint, no por convención.** `core/` prohíbe `Math.random`, `Date`, `fetch`, `window` y
`document` vía `no-restricted-globals` sobre la carpeta. La pureza es CI, no disciplina — que es la
única forma en que sobrevive a seis meses de mantenimiento.

**PRNG posicional:** `rand(seed, stepIdx, slot)` = `sfc32(hash(seed, stepIdx, slot))`.
El sorteo del paso N **no depende de cuántos draws hizo N−1**. Consecuencias: la compilación es
reordenable y paralelizable, y editar el paso 3 **no desplaza el jitter del paso 40** — o sea que
el diff de un guion es legible y una regresión visual es atribuible.

### `seek(t)` en O(log n + K)

```
i     = upperBound(keys, t)                        // O(log n) sobre Int32Array
c     = checkpoints[i >> 6]                        // O(1)
state = frames.slice(c.i, i).reduce(apply, c.state) // ≤ 64 ops — K constante
```

`apply` es puro y hace copy-on-write shallow del `Map`. Un guion realista (≤500 pasos) da ~8
snapshots de ≤500 entradas: costo despreciable. **Scrub hacia atrás cuesta lo mismo que hacia
adelante** — no hay re-instanciación, que es el defecto de fondo del prior art.

### Playhead

`play` = rAF acumulando `dt · rate`. `pause` detiene la acumulación. `rate` se lee en cada tick
(reactivo, no congelado al montar). **Sin `sleep`, sin promesas ⇒ no hay nada que cancelar.**

Toda la clase de bugs del prior art desaparece por construcción, no por parche: el drift entre el
ticker y el guion, `stop()` dejando overlays huérfanos, las corrutinas suspendidas para siempre, y
`calculateScriptDuration` como modelo paralelo que miente.

### Disposición de las 10 clases impuras

| # | Clase | Dentro / Fuera | Política |
|---|---|---|---|
| 1 | Reloj de pared | **Dentro** | `t0` es dato del guion; la hora es `fmt(t0 + f.t, locale, TZ)` |
| 2 | Sorteos perezosos | **Dentro** | A compile-time con PRNG posicional (~2k draws/min: trivial) |
| 3 | Medición de DOM (knob) | **Dentro** | Distancia en **%**, nunca px. El renderer jamás reporta medidas al core |
| 4 | Integradores físicos (springs) | **Fuera** | Tienen memoria ⇒ no seekeables. `seek` y `capture` los desactivan (`cf-static`). El tilt por **keyframes** sí entra: es tween, va como `flag` |
| 5 | Audio | **Fuera** | `cue` se emite; el `AudioSink` es suscriptor con **schedule-and-cancel** (guarda los nodos agendados y los frena en cualquier seek). Scrub ⇒ mute |
| 6 | Red (link previews) | **Fuera** | Resuelto en compile-time o precargado en el guion. **Cero llamadas a terceros en runtime** |
| 7 | Derivado de layout | **Fuera** | Settle gate antes de capturar (fuentes + medición de `--pad`) |
| 8 | Animaciones de entrada | **Fuera** | Modo *hidratar-sin-animar* tras un seek — el reveal-por-clase de `ChatDemo.astro` ya lo resuelve |
| 9 | Scroll animado | **Fuera** | `scroll = f(scrollId)`, instantáneo al seekear |
| 10 | Playback de nota de voz | **Fuera** | Dominio temporal del espectador, no de la timeline |

**Invariante:** un solo dominio temporal dentro de la timeline. Todo lo que tenga reloj propio vive
fuera y declara su política de scrub (cancelar / mutear / resetear).

---

## 2. Entrega como máquina de estados POR CANAL

No es un booleano ni un enum global. Cada adapter declara su máquina; el evento `receipt` se
**valida contra ella** en compile-time y un guion que pida un estado inexistente falla a compilar.

| Canal | Estados | Nota |
|---|---|---|
| WhatsApp | `queued → sent → delivered → read` (+`failed`) | doble check azul en `read` |
| Telegram | `queued → sent → read` **(sin `delivered`)** + `views:n` | contador de vistas en canales |
| iMessage | `queued → sent → delivered` | `delivered` como *trailing-label*, no como tick |

**Por qué importa:** el prior art pinta doble check azul siempre, para todo mensaje del usuario
(`MessageBubble.tsx:333`). Con máquina por canal, "entregado" en Telegram es **imposible de
expresar**, que es la propiedad que queremos.

---

## 3. Channel adapter — la interfaz, probada en papel contra 3 canales

Espeja la separación de `capabilities.py` de inbox-ai: **módulo hoja que no importa nada**
(`capabilities ← adapter-base ← adapters ← registry`), con el registro `channel → adapter` en
`registry.ts` aparte para no cerrar el ciclo de imports.

| Propiedad | WhatsApp | Telegram | iMessage |
|---|---|---|---|
| `tail` | `first` de la racha | `last` | `last` |
| `wallpaper` | `pattern` | `pattern` | `none` |
| `reactions` | `overlay-below` · cualquier emoji · ≤30 d | `own-row` · allowlist 73 · sin límite | `overlay-edge` · 6 tapbacks |
| `timestamp` | `inside-pad` | `inside-plain` | `gutter` |
| `quote` | `color-bar` | `thin-bar` | `stacked-bubble` |
| `receipts.states` | ver §2 | ver §2 | ver §2 |
| `bubbleTransport` | `per-conversation` | `per-conversation` | **`per-message`** |
| `senderKinds` | human · ai | human · ai · **bot · forwarded · channel** | human |
| `keyboard` | `os-qwerty` | `inline-in-message` | `os-qwerty` |
| `e2eNotice` | `true` | `false` (salvo Secret Chats) | `true` |

**Resultado de la prueba en papel:** con solo `tail`/`wallpaper`/`reactions` el renderer terminaba
con tres `if (channel === …)`. Los tres campos que los eliminan son:

1. **`receipts.states`** — el tick de "entregado" que Telegram no tiene.
2. **`bubbleTransport`** — iMessage mezcla **verde (SMS) y azul en el mismo hilo**; cualquier
   modelo per-conversación se rompe. Este es el hallazgo que justifica la prueba en papel.
3. **`senderKinds`** — un `sender` binario no distingue bot ni reenviado, y eso decide la colita.

**Sin campos opcionales.** `wallpaper:'none'` es un slot que no se llena, no un campo nullable —
un `?` es un `if` diferido.

**Reacciones — el detalle que nadie adivina:** la allowlist de Telegram escribe los emoji **sin**
el variation selector U+FE0F mientras todo picker lo emite. `normalizeReactionEmoji()` existe una
sola vez y la llaman allowlist, validador y renderer. Copiado tal cual del razonamiento de prod.

---

## 4. Dos renderers, un core

```
core/       compile · fold · seek · playhead      TS puro, cero framework, puro por lint
adapters/   capabilities · registry · 2 canales   TS puro
element/    custom element — pre-render + reveal  → landings Astro · preview · captura
react/      componentes                            → inbox-ai / app de Fovente
capture/    CLI headless                           → PNG/WebP deterministas
```

Los renderers **no comparten componentes**: comparten el `SimState` que emite el core. `element/`
pre-renderiza todo el hilo y revela con clases (el enfoque de `ChatDemo.astro`, superior al del
prior art para el target Astro: contenido visible para SEO, cero hidratación, y **un frame en el
paso N es exactamente N clases aplicadas**).

---

## 5. Modelo de mensaje

**Canónico: `UniversalMessage`** (`src/types/message.ts:62`) — ya es direction-based y ya conoce
`channel`, `deliveryStatus`, `sender` y `media`.

El segundo modelo (`Message`, `src/types/index.ts:28`, role-based, usado por transports y stores)
**queda fuera de alcance**: el ciclo no escribe el conversor que falta. Se declara la deuda **en los propios archivos de tipos** (`src/types/message.ts:62` y
`src/types/index.ts:28` — los modelos NO son intercambiables y no existe conversor), además de
`COMPONENTS.md` + issue. El desarrollador se tropieza en los tipos, no en el índice de componentes. Escribirlo tocaría el chat-widget de TimelyAI, que ningún criterio
de éxito de este ciclo cubre.

---

## 6. Namespacing

Prefijo de familia `ChatSim*`. `Message` y `QuickAction` **ya están definidos dos veces cada uno**
en el paquete — la deuda es previa. El ciclo **la aísla, no la repara**: nada nuevo colisiona, y el
issue queda abierto contra el paquete.

---

## 7. Sound packs — por canal, declarativos

```
{ id, layers:[{ freq | [from,to], startMs, durMs, jitterHz?, wave, attackMs }], gain, repeat? }
```

Contra lo soldado del prior art: taxonomía **por canal** (no un union global), `wave` incluye
**noise** (Telegram suena distinto por textura, no por frecuencia), envolvente y *attack* **por
capa**, y ciclo de vida cancelable con master gain.

**Nada de samples reales de WhatsApp/Telegram** — esos assets sí son copyright, a diferencia del
código MIT.

---

## 8. Mobile-first — criterio falsable

`inbox-ai` maneja el teclado por layout nativo: **cero** `visualViewport`, `dvh` e
`interactive-widget` en todo su frontend, y por eso `MobileComposer.tsx` son 13 KB de fork.

**Acceptance:** `visualViewport` + `100dvh` + `interactive-widget=resizes-content`, safe-area
insets, tap targets ≥44 px, `font-size ≥16 px` en el input. **Medible: el fork de `MobileComposer`
queda sin razón de ser.** `MobileBaseline` obligatoria en todo lo nuevo.

---

## 9. Orden de construcción — `element/` en la iteración 1

Deriva de R-1: cada iteración produce algo abrible.

| It. | Entrega | Abrible |
|---|---|---|
| 1 | `core/` + `element/` + adapter WhatsApp | ✅ página demo estática |
| 2 | `capture/` PNG/WebP + gate de settle | ✅ PNG byte-idéntico |
| 3 | Adapter Telegram + **token `--channel-imessage` y `ChannelId` de iMessage** (el token y el tipo, NO el adapter) | ✅ mismo guion, dos canales |
| 4 | `react/` + mobile + `MobileBaseline` | ✅ Storybook |
| 5 | Stories, tests, `COMPONENTS.md`. **La story de reemplazo se alimenta de la forma de mensaje REAL de inbox-ai** (o lleva adaptador documentado inline) — sin eso el criterio de éxito #4 se afirma en vez de medirse | ✅ Storybook completo |

---

## 10. Alcance recortado (decisión del CTO, con estimación)

| Recorte | Razón | Ahorro |
|---|---|---|
| `capture/` **solo PNG/WebP**, sin mp4 | el encoder es superficie de determinismo aparte; el operador pidió **fotos**, el video lo agregué yo | −2 d |
| `audio/` = schema + **cue packs por canal como DATOS** (WhatsApp + Telegram) + `AudioSink` a la política clase-5 de §1, muteado por default, + 1 story de audición | el trabajo duro ya está hecho: el DSP es ~90% parametrizable (finding 03 §4) y lo soldado ya se diseña afuera en §7. Falta **autoría de datos, no diseño** | −0,75 d **con tope: si excede ~0,5 d revierte al stub** |
| `pin` / `delete-for-all` = eventos + tests, **sin chrome** | el fold los absorbe gratis; dibujar barra de fijado y tombstone es UI nueva por canal | −1 d |
| Adapter iMessage completo | la prueba en papel ya rindió (`bubbleTransport`); implementarlo no agrega información | — |
| Migración de `inbox-ai` | el ciclo entrega el skin + story de reemplazo, no un PR contra ese repo | — |
| **Copia literal de `whatsimule`** | es referencia de **comportamiento**, no fuente | **prohibida** |

**Con los recortes: 12-14 días. Sin ellos: 17-19.**

✅ El audio **responde parcialmente** la queja explícita del operador sobre los sonidos: los cue packs
de WhatsApp y Telegram entran como datos, con story de audición. Lo que queda afuera es ampliar la
biblioteca de cues, no el diseño ni la textura.

---

### Restricción dura — el prior art es referencia de comportamiento, no fuente

`whatsimule` (MIT) se leyó para extraer **qué debe hacer** un simulador. **Cero copia literal** de
código, constantes o assets. Nombrados explícitamente porque son los que tientan:

- la coreografía de 9 pasos del contact-picker
- el anillo de progreso `10→30→60→85→100`
- la tabla de cadencias y los 5 contactos ficticios con fotos de Unsplash

**Tripwire:** una lane que crea necesitar un lift literal **PARA y escala**. No lo decide sola.

Esto es además lo que sostiene que D-1 no bloquee el build: sin copia sustancial, MIT no impone
atribución en build-time, y el release público ya está fuera del alcance del ciclo.

---

## 11. Riesgos

| # | Riesgo | Mitigación |
|---|---|---|
| 1 | `inbox-ai` consume `github:cofoundy/ui#main` **sin pin**: todo merge a `main` entra a su prod | No mergear sin verde verificado; el gate de Fase 11 evalúa blast radius sobre Fovente, no sobre Storybook. Proponer el pin (repo ajeno ⇒ no lo ejecutamos) |
| 2 | Romper la continuidad visual landing↔app, que es deliberada | La divergencia de `ui-architect` se acota a **elevar**, no redefinir. Baseline visual contra `ChatDemo.astro` antes de tocar |
| 3 | El adapter no aguanta el canal 4 | Ya se probó en papel contra 3 y rindió 3 campos nuevos. Regla: **cero opcionales** — un `?` es un `if` diferido |
| 4 | Determinismo falso: PNG que difieren por fuentes o layout | Gate de settle (fuentes + `--pad`) antes de capturar. Test que compara dos corridas byte a byte — **la sonda tiene gemelo positivo**: un cambio conocido debe romperla |
| 5 | Release OSS sin decisión de atribución (D-1) | Gate humano antes del push público. No bloquea el build |


---

## 12. Contrato de estilado — `chat-sim` es self-contained y scoped

**Añadido tras el REFUTE `esc-c1b8c98e0ecfa2` (honrado). El remedio está FORZADO, no elegido.**

### Por qué la mitigación anterior era falsa

| Hecho | Verificado en |
|---|---|
| El `content` glob de inbox-ai escanea `node_modules/@cofoundy/ui/src/**` **por path, no por import** | `inbox-ai/frontend/tailwind.config.ts:9` |
| El CSS del paquete es **un solo sheet global, cero `@layer`** | `packages/ui/src/styles/index.css` (1128 líneas) |
| Se importa en la raíz del App Router **antes** de `globals.css`, que lo sombrea | `inbox-ai/frontend/src/app/layout.tsx:4` |

⇒ El mapa de `exports` no tiene autoridad sobre ninguna de las tres. Un subpath gatea resolución de
módulos, no escaneo de archivos ni cascada de CSS.

### Las cuatro superficies no comparten Tailwind

| Consumidor | Tailwind |
|---|---|
| `fovente-landingpage` (fovente.cofoundy.ai) | **ninguno** |
| `landing-page-v3` (cofoundy.dev) | v4.1 |
| `inbox-ai` (app.fovente) | **v3.4** + puente manual + safelist |
| `packages/ui` (productor) | v4.1.18, **sin `tailwind.config`** |

Reconciliar v3/v4 **no resuelve**: una de las dos landings objetivo no tiene Tailwind en absoluto.
Un componente que dependa del Tailwind del host no puede shipear ahí. La opción se colapsa a una.

### El contrato

1. **`chat-sim` ships su propio stylesheet self-contained**, en `chat-sim/styles.css`, importado por
   subpath. No toca `src/styles/index.css`.
2. **Todos los tokens bajo `.cf-chat-sim`**, no en `:root`. Incluye `--channel-imessage` de A-5 —
   que era justamente el token que iba a aterrizar en la superficie compartida.
3. **Cero utilidades Tailwind en el source de la familia.** Regla fundacional de autoría: si un
   `.tsx` de `chat-sim/` contiene una clase de utilidad, falla el lint. Es lo que hace que el glob
   de inbox-ai escanee nuestros archivos y no encuentre nada que compilar.
4. **Precedente propio, no invención:** `ChatDemo.astro` ya renderiza este lenguaje visual con
   clases semánticas sobre CSS plano y custom properties, en un repo sin Tailwind, en producción.

### Lo que esto compra

El mismo artefacto renderiza idéntico en Storybook (v4), en `capture/` headless, en dos landings
Astro y en Fovente (v3) — **sin depender del compilador de CSS del consumidor**. Es la única forma
de que los golden PNG byte-comparados de las iteraciones 2-3 signifiquen algo, y de que el criterio
de éxito #4 ("sin regresión visual") sea medible en vez de afirmado.

**Costo de tomarla ahora:** este párrafo. **Costo en la iteración 4:** reestilar `element/` +
`react/` e invalidar todos los golden byte-comparados.

---

## 13. Correcciones menores del refute-pass (SUSTAIN, se arreglan durante)

| # | Hueco | Arreglo |
|---|---|---|
| 1 | `compile(script, {seed, channel, locale, t0})` **no recibe timezone**, pero §1 formatea con `fmt(t0+f.t, locale, TZ)`. Dos corridas en la misma máquina pasan el test y la propiedad igual es falsa cross-machine | `tz` entra a la firma de `compile` y al `digest`. Un campo |
| 2 | `element/` revela con **clases acumuladas** (monótono), pero el fold existe por mutaciones **no monótonas** (`edit`/`delete`/`react`/`pin`) | `data-step` en la raíz en vez de clases acumuladas. `capture/` ya ejercita `seek` desde la iteración 2 |

El #1 es notable: es un test que pasa y una propiedad que es falsa — exactamente un instrumento
que no puede fallar. `Int32Array` y el orden de `Map` sí se sostienen (los ticks son relativos a
`t0`, y `order` es explícito).
