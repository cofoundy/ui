# api-contract.md — chat-sim

Contrato de módulos y tipos. Toda lane programa CONTRA esto; cambiarlo requiere pasar por el CTO.

## Árbol y dueños

```
src/components/chat-sim/
├── core/          compile · fold · seek · playhead · prng     [core]
├── adapters/      caps · registry · whatsapp · telegram       [channel]
├── element/       custom element (pre-render + data-step)     [skin]
├── react/         renderer React                              [app]
├── capture/       API de captura                              [capture]
├── styles.css     stylesheet self-contained, scope .cf-chat-sim [skin]
└── index.ts       barrel del subpath                          [core]
scripts/capture-chat.mjs                                       [capture]
src/stories/chat-sim/**  ·  src/__tests__/chat-sim/**          [qa]
```

**`src/index.ts` (barrel principal) NO se toca.** §12: el ciclo exporta solo por subpath
`@cofoundy/ui/chat-sim`. Escribir ahí es violación de scope, no una optimización.

## Tipos núcleo — `core/types.ts` [core] · **entregable de T-001, ola 1**

**Regla de partición (D-1, tras el REFUTE del task graph):** los **TIPOS** del contrato viven en
`core/types.ts` y los entrega T-001 en la ola 1. Los **VALORES** que los pueblan (`caps.ts`,
`registry.ts`, `whatsapp.ts`, `telegram.ts`, `validateScript`) son de `channel` y llegan en T-005.

Por qué: la matriz ya da `R` sobre `core/**` a las seis lanes, así que T-002 satisface su fixture
de capabilities **leyendo**, sin forkear. La dirección de imports queda acíclica
(`adapters → core`, nunca al revés).

Arruga honesta: `caps.ts` deja de "no importar nada" — importa un tipo. Es `import type`, se borra
en compilación y no puede crear ciclo en runtime. La propiedad de hoja del arch es **sobre valores**.

```ts
type Tick = number;            // ms virtuales enteros desde t0
type MsgId = string;           // estable, asignado en compile
type ChannelId = 'whatsapp' | 'telegram' | 'imessage';

// Los 3 tipos que la ola 1 necesita y que ANTES estaban en disputa entre core y channel:
interface ChannelAdapter { /* los 16 campos de adapter-interface-draft.md, cero opcionales */ }
interface Diagnostic { code: string; msg: string; stepIdx?: number }

type Ev =
  | { k:'post';    id:MsgId; step:SimStep }
  | { k:'edit';    id:MsgId; v:number }
  | { k:'delete';  id:MsgId; scope:'me'|'all' }
  | { k:'react';   id:MsgId; emoji:string; by:ActorId; remove?:boolean }
  | { k:'pin'|'unpin'; id:MsgId }
  | { k:'receipt'; id:MsgId; to:DeliveryState }
  | { k:'read';    upTo:MsgId }
  | { k:'views';   id:MsgId; n:number }
  | { k:'draft';   by:ActorId; chars:number }   // ENMIENDA 2026-09-04: era idx:number
  | { k:'flag';    key:string; value:Json }
  | { k:'overlay'; id:string; phase:string }
  | { k:'cue';     sound:SoundId };

interface Frame { t: Tick; ev: Ev }
interface SimState { msgs:ReadonlyMap<MsgId,MsgState>; order:readonly MsgId[];
                     pinned:MsgId|null; draft:Draft|null; flags:Record<string,Json>;
                     overlays:Overlay[]; scrollId:MsgId|null }
interface Timeline { t0:Tick; frames:readonly Frame[]; keys:Int32Array;
                     checkpoints:readonly SimState[]; duration:Tick; digest:string }
```

## Firmas públicas

| Módulo | Firma | Dueño |
|---|---|---|
| core | `compile(script: SimScript, o:{seed:number; channel:ChannelId; locale:string; tz:string; t0:Tick}): Timeline` | core |
| core | `seek(tl: Timeline, t: Tick): SimState` — puro, O(log n + 64) | core |
| core | `createPlayhead(tl: Timeline): { play(); pause(); rate(n); onFrame(cb) }` | core |
| adapters | `getAdapter(c: ChannelId): ChannelAdapter` (desde `registry.ts`) | channel |
| adapters | `ChannelAdapter` = los **16 campos** de `adapter-interface-draft.md`, **cero opcionales** | channel |
| adapters | `validateScript(s: SimScript, c: ChannelId): Diagnostic[]` — vacío = compila | channel |
| element | `<cf-chat-sim script="…" channel="…" seed="…">` · atributo `data-step` en la raíz | skin |
| react | `<ChatSim script channel seed mode="demo"\|"live" />` | app |
| capture | `captureFrame(tl, t, o:{width;dpr;out}): Promise<string>` — tras el settle gate | capture |

**`tz` es obligatorio en `compile`.** Sin él el test pasa en una máquina y la propiedad de
determinismo es falsa cross-machine (§13).

## Invariantes verificables

| # | Invariante | Cómo falla |
|---|---|---|
| 1 | `seek(tl,t)` es puro | test: dos llamadas con el mismo `t` dan estado igual por deep-equal |
| 2 | Dos corridas del mismo `(script,seed,channel,locale,tz)` dan **PNG byte-idéntico** | gemelo positivo: cambiar `seed` DEBE romper el byte-compare |
| 3 | Un guion inválido para el canal **no compila** | `receipt:'delivered'` en Telegram ⇒ `Diagnostic`; el mismo en WhatsApp ⇒ vacío |
| 4 | `core/` es puro | lint `no-restricted-globals`: `Math.random`, `Date`, `fetch`, `window`, `document` |
| 5 | Cero utilidades Tailwind en `chat-sim/**` | lint: una clase de utilidad en un `.tsx` de la familia falla CI |
| 6 | `src/index.ts` sin cambios | CI: `git diff --exit-code src/index.ts` contra el merge-base |

---

## Enmiendas al contrato durante la ejecución

| Fecha | Cambio | Quién lo pidió | Por qué |
|---|---|---|---|
| 2026-09-04 | `Ev.draft` pasa de `{idx:number, chars}` a `{by:ActorId, chars}` | `core` (T-001, reactivación) | El `idx` numérico obligaba a un registro de actores con indirección. `element/` ya trataba `ActorId` como group key verbatim (`in` / `out:ai` / `out:human:{id}`), que es el mismo criterio de `inbox-ai/lib/messageGrouping.ts:25`. La indirección era invención nuestra, no del dominio. |

**Verificado por el CTO con test de mutación, no por reporte:** quitar `draft: null` del caso `post`
en `fold.ts:39` rompe **2 tests, uno en cada lane** (`core/__tests__/fold.test.ts` y
`element/chat-sim-element.test.ts`). Restaurado ⇒ 44/44 verdes. El fix está cubierto de los dos lados
del contrato, no solo del que lo escribió.
