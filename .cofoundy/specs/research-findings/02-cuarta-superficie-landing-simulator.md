# La cuarta superficie: ya existe un simulador de chat, y prod se calibró contra él

Descubierto vía `inbox-ai/lib/messageGrouping.ts:17` — *"Es el mismo criterio del simulador del
hero en la landing"*. Nadie lo mencionó en el encargo.

**Artefacto:** `products/fovente-landingpage/src/components/ChatDemo.astro` — 190 líneas, Astro
puro, `<script is:inline>`, cero framework.

## Hay TRES implementaciones del mismo chat en Cofoundy

| # | Dónde | Tamaño | Estado |
|---|---|---|---|
| 1 | `fovente-landingpage/ChatDemo.astro` | 190 líneas | vivo en fovente.cofoundy.ai |
| 2 | `inbox-ai/components/conversation/MessageBubble.tsx` | **68 KB** | vivo en app.fovente |
| 3 | `@cofoundy/ui` messaging primitives | 106 líneas el bubble | la librería "compartida" que ninguno de los dos usa de verdad |

**Y 1 y 2 comparten código copiado, no abstracción:**

| Detalle | ChatDemo.astro | inbox-ai prod |
|---|---|---|
| SVG del tick | `viewBox="0 0 18 12"` render 15×10, `stroke-width 1.7` | idéntico (`MessageBubble.tsx:1265`) |
| Agrupación | `m.who !== prev`, **nunca mira el reloj** | `groupKey()` mismo criterio, citado literal (`messageGrouping.ts:17`) |
| Hueco de la hora | `.stamp` medido → `--pad` | `.fov-stamp` sobre el hueco de `.fov-pad` |
| Aire entre grupos | — | `space-y-[7px]`, *"el aire entre grupos del simulador de la landing"* |
| Colita | solo en la primera de la racha | idem, *"verified against a capture in the landing simulator"* |

⇒ **Ya existe un lenguaje de diseño de chat de Cofoundy, validado en producción. Lo que no existe
es un lugar donde viva.** Este ciclo no inventa un componente: consolida uno que ya está escrito
tres veces.

**Consecuencia para el pedido de "visual flavour mejor":** hay continuidad visual deliberada entre
el hero de la landing y el inbox de la app. Elevar el lenguaje: sí. Reemplazarlo: rompería algo que
alguien construyó a propósito. La divergencia de `ui-architect` se acota a elevar, no a redefinir.

## Su modelo temporal es MEJOR que el del prior art

| Propiedad | ChatDemo.astro | whatsimule |
|---|---|---|
| Determinismo | **sí** — tabla de cadencia fija `gap()`: typing 700 · in 1500 · done 900 · brief 900 · post-typing 1100 · default 850 | no (`Math.random()` en el hot path) |
| Contenido | **pre-renderizado en el DOM**, se revela con `.on` | construido en runtime |
| Reduced-motion | `matchMedia` → muestra el chat completo y no rota | no considerado |
| Scroll | `glide()` animado con rAF + ease cúbico 220 ms | `scrollIntoView` |

**Consecuencia arquitectónica grande:** el enfoque *pre-renderizar y revelar* es estrictamente
mejor para el target Astro — contenido visible para SEO, cero hidratación, y **un frame en el paso
N es exactamente "N clases aplicadas"**, o sea captura determinista por construcción.

⇒ El engine canónico no renderiza: **emite un estado de revelado** (qué pasos son visibles en `t`),
y los renderers (React y custom element) lo aplican. Mismo engine, dos renderers, y el de element
puede pre-renderizar.

## La única dependencia de medición del DOM (y por qué NO rompe el modelo)

`measure()` (`:104-112`): mide `.stamp` con `offsetWidth` para setear `--pad`, el hueco que la hora
ocupa en la última línea. Las burbujas nacen en `display:none`, así que hay que desplegarlas
invisibles para medirlas, y sólo se puede medir el slide activo.

Es un hecho de **layout**, no de timeline: se computa una vez al activar, independiente de `t`.
⇒ `estado(t)` sigue siendo función pura. Pero la captura debe esperar fuentes + medición antes de
disparar ⇒ el script de captura necesita un gate de settle, no un screenshot ingenuo.

## Vocabulario de dominio que el prior art no tiene

`ChatDemo.astro` maneja tipos de paso propios de Fovente: `in`, `out`, `typing`, `stop` (la IA
frena y pasa a humano — apaga el badge), `done`, y `brief` (tarjeta con `head`/`bullets`/`action`).
`stop` es la historia de producto de Fovente. Los guiones vienen de i18n (`t.hero.chat`,
`t.sectors.items`), o sea **contenido traducible, no hardcodeado**.

⇒ El modelo de pasos debe ser extensible por el consumidor, no un enum cerrado de WhatsApp.
