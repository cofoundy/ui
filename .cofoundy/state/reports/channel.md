wall_clock_minutes: 25

# T-005 — channel: adapters WhatsApp + Telegram

## Entregado
- `src/components/chat-sim/adapters/caps.ts` — leaf (only `import type { ChannelId }` from
  `core/types.ts`, erased at compile). `VARIATION_SELECTOR_16`, `normalizeReactionEmoji()` (the
  ONE implementation), `TELEGRAM_REACTIONS` (the 73-entry allowlist, normalized), and
  `isAllowedReactionEmoji(channel, emoji)` keyed by `ChannelId` so callers never branch on the
  literal. The 73 entries are copied verbatim, doc order, from
  `products/cofoundy-platform/inbox-ai/backend/src/services/channel_adapters/telegram_reactions.py`
  (itself sourced from Telegram's Bot API docs, last-fetched 2026-08-01) — diffed programmatically
  against the Python source, 73/73 identical.
- `src/components/chat-sim/adapters/whatsapp.ts` — the WhatsApp `ChannelAdapter` value, the 16
  fields. Byte-identical to `element/fixtures.ts`'s `WHATSAPP_REFERENCE_ADAPTER` (skin's wave-1
  placeholder for the same table) — that identity IS the cross-check.
- `src/components/chat-sim/adapters/telegram.ts` — the Telegram value. `deliveryStates` has no
  `'delivered'`. `reactionConstraint.allowlistSize` is `TELEGRAM_REACTIONS.size` (derived), never
  a bare literal `73`.
- `src/components/chat-sim/adapters/registry.ts` — `getAdapter(channel): ChannelAdapter`.
  `'imessage'` throws (out of scope this cycle, architecture-v1.md §10 "Adapter iMessage
  completo"). Imports `whatsapp.ts` + `telegram.ts`; nothing imports `registry.ts` back, so the
  chain stays acyclic (`caps` ← `whatsapp`/`telegram` ← `registry`).
- `src/components/chat-sim/adapters/validate.ts` — `validateScript(script, channel): Diagnostic[]`.
  Two checks, both reading adapter/caps data, never the `ChannelId` literal: `receipt.to` must be
  in `adapter.deliveryStates`; `react.emoji` must pass `isAllowedReactionEmoji`.
- `adapters/__tests__/{caps,registry,validate}.test.ts` — 24 tests.

## Acceptance (falsable) — status
1. `receipt:'delivered'` on Telegram ⇒ `Diagnostic`; same script on WhatsApp ⇒ empty — **pass**
   (`validate.test.ts`). Verified in **red**: temporarily added `'delivered'` to
   `telegram.deliveryStates`, the exact test failed and no others did (`git diff` confirmed clean
   after revert, `mv` from a `.bak` snapshot — not hand-retyped).
2. Emoji outside the 73-allowlist ⇒ `Diagnostic`; with/without U+FE0F ⇒ same result — **pass**
   (`validate.test.ts`, 4 dedicated assertions: out-of-allowlist flagged, WhatsApp twin
   unconstrained, in-allowlist both forms clean, out-of-allowlist both forms identically flagged).
3. `channel` implements VALUES only — **pass**. `ChannelId`/`ChannelAdapter`/`Diagnostic` imported
   (`import type`) from `core/types.ts`, never redeclared. `npx madge --extensions ts,tsx
   --circular src/components/chat-sim` → "No circular dependency found!" (32 files).
4. Grep-proof hardcode detector — **pass by construction**: `validate.ts` never branches on the
   `ChannelId` string; every per-channel fact is read off `adapter.deliveryStates` or
   `isAllowedReactionEmoji`. The actual T-002 caps fixture (#6, `element/__tests__/render.test.ts`)
   is skin's file, outside my `scope.write` — not re-verified here, per the task's own framing
   ("el detector primario... que corre en la ola 1").

## Verificación adicional (no pedida por acceptance, hecha de todos modos)
- `npx tsc --noEmit`: 0 errores en `chat-sim/**`.
- `npx vitest run chat-sim/adapters`: 3 files / 24 tests, verde.
- `npx vitest run chat-sim` (suite completa): 93/94. El único rojo es
  `element/__tests__/bundle-freshness.test.ts` — **pre-existente, no mío**: mismo síntoma que
  T-003 documentó en este mismo reporte ("gate de frescura del bundle... el CTO ya dispuso que
  skin lo regenera como último paso antes del merge"). `adapters/**` no lo toca (`element/index.ts`
  no importa `adapters/**` todavía — usa `fixtures.ts`) y no es mi `scope.write`.

## Desviaciones de spec
Ninguna. `getAdapter('imessage')` lanza en vez de devolver un valor — es la consecuencia directa
de "Adapter iMessage completo" estando fuera de alcance (architecture-v1.md §10), no una decisión
mía nueva.
