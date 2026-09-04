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

## Tipos núcleo — `core/types.ts` [core]

```ts
type Tick = number;            // ms virtuales enteros desde t0
type MsgId = string;           // estable, asignado en compile
type ChannelId = 'whatsapp' | 'telegram' | 'imessage';

type Ev =
  | { k:'post';    id:MsgId; step:SimStep }
  | { k:'edit';    id:MsgId; v:number }
  | { k:'delete';  id:MsgId; scope:'me'|'all' }
  | { k:'react';   id:MsgId; emoji:string; by:ActorId; remove?:boolean }
  | { k:'pin'|'unpin'; id:MsgId }
  | { k:'receipt'; id:MsgId; to:DeliveryState }
  | { k:'read';    upTo:MsgId }
  | { k:'views';   id:MsgId; n:number }
  | { k:'draft';   idx:number; chars:number }
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
