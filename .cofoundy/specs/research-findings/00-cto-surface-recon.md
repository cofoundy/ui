# Recon de superficie — hallazgos del CTO (Fase 0)

Fecha: 2026-09-04 · Worker `cto-d606f0` · verificado a mano, no inferido.

## H-1 — Fovente es un PRODUCTO de Cofoundy, no un cliente

Agente de ventas por WhatsApp, en producción. Landing `fovente.cofoundy.ai`, app
`app.fovente.cofoundy.ai`, MCP propio con 31 tools en prod. SKU recurrente S/.150–250/mes
(`deals/clients/XGodel/`, `deals/REACTIVATION-BACKLOG.md`).

**Consecuencia:** "que el cliente lo sienta idéntico a WhatsApp" no es una metáfora de marketing —
la app de Fovente le muestra a un negocio las conversaciones de WhatsApp de sus leads. El skin
tiene un consumidor de producto real, no hipotético.

**Abierto:** no existe repo `fovente-app` en la org (`gh repo list cofoundy`). Hipótesis a
confirmar por `recon-inbox`: la app de Fovente es una instancia white-label de `inbox-ai`
(cofoundy-platform se describe como "White-label SaaS suite"). Si se confirma, inbox-ai ES el
consumidor del skin y su modelo de mensaje es el modelo canónico.

## H-2 — CRÍTICO: las dos landings objetivo son Astro sin React, y NO consumen @cofoundy/ui

| Repo | Framework | React | `@cofoundy/ui` | Sitio |
|---|---|---|---|---|
| `products/fovente-landingpage` | **Astro 7** | ninguno | **no** | fovente.cofoundy.ai |
| `projects/landing-page-v3` | **Astro 5** | ninguno | **no** | cofoundy.dev (viva) |
| `projects/landing-page-v2` | Next 16 | 19.2.3 | `github:cofoundy/ui` | abandonada (último commit 2026-05-26) |

Verificado: `astro.config.*` de ambas solo integra `sitemap`; cero archivos `.tsx`/`.jsx` en `src/`.

**Consecuencia arquitectónica (rompe el supuesto por defecto):** un componente solo-React en
`@cofoundy/ui` **no lo puede consumir ninguna de las dos landings que el operador nombró**. Las
opciones son (a) meter `@astrojs/react` + runtime de React a sitios estáticos cuyo valor es
SEO/perf, o (b) exponer un **custom element** framework-agnóstico.

⇒ El **web component es un target de primera clase, no un extra**. La arquitectura se parte:

```
core/      engine + timeline        (TS puro, cero framework)
adapters/  canales                  (TS puro)
react/     componentes React        → app de Fovente / inbox-ai
element/   custom element wrapper   → landings Astro
capture/   headless → PNG/WebP/mp4  (apunta al element: sin runtime de React)
```

Nota: la capa de captura sale más barata contra el element que contra React — página estática,
sin hidratación.

## H-3 — Tier / rama de integración de `packages/ui`

- `git ls-remote --heads origin dev` ⇒ **vacío: no existe `dev`**.
- `gh api .../branches/main/protection` ⇒ **404 Branch not protected** (sin `strict`, sin reviews).
- `.github/workflows/deploy.yml` ⇒ push a `main` **auto-deploya** Storybook a ui.cofoundy.dev.

`packages/*` es Tier B (`~/cofoundy/CLAUDE.md`). Tier B sin `dev` ⇒ **sin auto-merge por lane**.
Como `main` no es protegida ni `strict`, la patología de N-PRs-invalidándose no aplica, así que
serializar por `/merge-coordinator` es barato.

**Disposición Fase 8 (decidida, no escalada):** PRs contra `main`, sin auto-merge, merge
serializado por el coordinator con gate de `ceo-agent`. Abrir `dev` sería un cambio a nivel repo
con consecuencia de deploy ⇒ no es decisión del orquestador.

## H-4 — Substrate previo archivado

El `.cofoundy/` que había pertenecía al ciclo `atelier-components-xgodel-dogfood` (2026-05-16,
last_phase 6), ya shippeado y mergeado. Movido a
`.cofoundy/archive/2026-05-16-atelier-components/`. No se resume; este es un ciclo nuevo.

---

# Recon de agentes — hallazgos confirmados (parcial, secciones truncadas pendientes)

## H-1 CONFIRMADO — `inbox-ai` ES Fovente

El producto que corre en `app.fovente.cofoundy.ai` es `inbox-ai`. No hay repo aparte.
⇒ **El consumidor del skin ya existe, en producción, y ya consume `@cofoundy/ui`.**

| Hecho | Evidencia |
|---|---|
| Dependencia | `frontend/package.json:20` → `"@cofoundy/ui": "github:cofoundy/ui#main"` |
| Alcance | **139 archivos** de `frontend/src` importan de `@cofoundy/ui` |
| Estilos | `frontend/src/app/layout.tsx:4` `import "@cofoundy/ui/styles"` |
| Build | `next.config.mjs:15` `transpilePackages` + `tailwind.config.ts:9` escanea el src del paquete |

## H-5 — ⚠️ CORREGIDO: la dependencia SÍ está pinneada por el lockfile

`github:cofoundy/ui#main` sigue la rama. **Cada push a `ui/main` entra a Fovente en prod sin
gate.** No es hipotético: 139 archivos y `MessageComposer` en el `ConversationView` real.

**Disposición:** el ciclo NO mergea a `main` hasta tener verificación verde, y el gate de Fase 11
tiene que considerar el blast radius sobre Fovente, no solo sobre Storybook. Recomendar el pin a
un tag es una decisión de repo ajeno ⇒ se propone, no se ejecuta.

## H-6 — 🟢 El modelo de capabilities YA está resuelto en prod (en Python)

`backend/src/services/channel_adapters/capabilities.py`: `Capability` StrEnum
(`REACTION`, `BUTTONS`, `LIST`, `AUDIO_SEND`) + `ReactionConstraint` — allowlist de 73 emoji en
Telegram vs cualquiera en WhatsApp, `max_age_days=30` en WA, `can_target_reaction=False`.
También `message_revocation.py` (si un edit/delete alcanza al cliente) y `channel_revoked`.

⇒ El channel adapter en TS **espeja este modelo, no lo inventa**. Es la misma abstracción que
predije que hacía falta, ya validada por producción.

## H-7 — Los primitivos actuales NO alcanzan para un skin de canal (evidencia dura)

`components/conversation/MessageBubble.tsx` de inbox-ai es **68 KB de código propio** y NO usa el
`MessageBubble` de `@cofoundy/ui`. `MobileComposer.tsx:71` es un fork deliberado del composer.
`WhatsAppPreview.tsx:42` forkea porque el de ui "está hecho para hilos del inbox".

⇒ No estamos construyendo algo especulativo: hay un cliente interno que ya pagó el costo de
forkear y tendría 68 KB que devolver. Ese es el caso de negocio del skin.

## H-8 — Telegram ya está comercialmente vivo

`backend/src/schemas/channel.py:8` — `ChannelType` cubre whatsapp, kapso, telegram, instagram,
messenger, web_chat, email, sms. 7 channel_types → 6 clases de adapter (`meta_graph` sirve
instagram+messenger). **Vivos comercialmente: WhatsApp (Meta + Kapso) y Telegram.** Email y
web_chat tienen código pero no están desplegados.

⇒ El pedido "que clone Telegram también" no es aspiracional: es el segundo canal que ya vende.

## H-9 — `--channel-*` ya existe en nuestros tokens

`packages/ui/src/styles/index.css:121-127` ya define tokens de canal para los 7. El adapter
hereda, no arranca de cero.

## H-10 — Dos modelos de `Message` divergentes dentro de `@cofoundy/ui`

- `UniversalMessage` (`src/types/message.ts:62`) — omnicanal, direction-based, con `channel`,
  `deliveryStatus` (5 estados), `sender`, `media`, `tool`.
- `Message` (`src/types/index.ts:28`) — widget/Zustand, role-based, `sendStatus` (4 estados).

Divergentes, **sin función de conversión** en el repo. El campo `role?` en `UniversalMessage` es
el único puente. Transports y stores usan exclusivamente el modelo B.

⇒ El skin se ancla a `UniversalMessage` (es el que ya habla de canales) y el ciclo debe entregar
el adaptador B→A que hoy falta, o declarar explícitamente que no lo toca.

---

# Guía de adopción para `inbox-ai` (entregada por `recon-inbox` al cierre)

## Prod
Rama por defecto `main`; deploya en **Railway** (backend+frontend+PG+Redis, GH Actions on push to
main, `DEPLOYMENT.md:9,118`) en inbox.cofoundy.dev. **`dev` NO existe.**

## Su `Message` como canónico, con 3 recortes

Copiar literal: `direction`, `sender.type` de 4 valores, `reply_to` denormalizado,
`channel_revoked`, y **los dos relojes** (`timestamp` del evento vs `created_at` de ingesta).

Recortar: reacciones deben ser **campo de primera clase** (hoy se anclan por `channel_message_id`);
`delivery_status` cerrado **sin** `draft|discarded` (eso es vocabulario de producto Fovente); y
tipar `media`, hoy `any[]` (`api.ts:236`).

## 🔴 Corrección a NUESTRO modelo: `channel` ≠ `provider`

`kapso` es un **proveedor de WhatsApp**, no un canal. Nuestro `ChannelId` los conflaciona igual que
el `ChannelType` de ellos. Separarlos: `channel` es **presentación** (cómo se ve), `provider` es
**transporte** (por dónde viaja). Un mismo canal puede tener varios proveedores.

No bloquea este ciclo —solo implementamos whatsapp y telegram, sin proveedores alternos— pero es
deuda de diseño conocida antes de agregar el canal 4.

## Riesgos al adoptar el skin, en orden

1. **`"@cofoundy/ui": "github:cofoundy/ui#main"` en 139 archivos de prod, pin flotante.**
   **Pinnear a un tag ANTES de tocar messaging.** (Hoy el lockfile lo congela en v0.2.2, así que el
   riesgo se materializa al re-resolver — que es justo lo que adoptar el skin requiere.)
2. No filtrar vocabulario de producto al skin: `draft`, `is_sandbox`, `ai_paused_reason` son de
   Fovente, no del componente.
3. **`can_edit` y `delete_reaches_customer` se reciben como props, NUNCA se derivan de `channel`** —
   ellos lo prohíben explícitamente en `api.ts:288`. Son política del servidor, no de presentación.
4. Separar `channel` de `provider` (arriba).

## Qué les sirve HOY

(1) la burbuja completa —tail + ticks + stamp + grouping—, hoy 68 KB propios copiados a mano del
simulador de la landing; (2) el capability model en TS, hoy re-derivado a mano en la UI; (3) el
composer móvil con el teclado resuelto (no usan `visualViewport` ni `dvh` — es el hueco real) ⇒ mata
su fork; (4) el wallpaper doodle (`globals.css:1254`).
