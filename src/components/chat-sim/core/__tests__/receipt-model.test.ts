// T-011 acceptance #2: prove `ReceiptModel` can express all 4 rows of telegram-fidelity-fix.md
// §F-1 as type-level fixtures — one per row, including Telegram's broadcast-channel variant and
// iMessage. This is a paper proof (the values below are illustrative, not real channel data —
// that's T-012's job); if any row couldn't type-check here, T-011's acceptance says to stop and
// escalate instead of shipping the shape. All 4 do, so no escalation was filed for the shape
// itself (see history.jsonl / escalation-queue.jsonl for a separate, non-blocking note about
// this change's blast radius on out-of-scope consumers).

import { describe, expect, it } from 'vitest';
import type { ReceiptIconId, ReceiptModel, TickReceiptStateStyle } from '../types';

describe('ReceiptModel expresses all 4 §F-1 cases (acceptance #2)', () => {
  it('WhatsApp — glyph fixed, COLOR varies at read', () => {
    // T-016: `kind: 'ticks'` states carry a `ReceiptIconId` (semantics), never a raw glyph
    // character — the renderer, not this fixture, owns which pixels 'check'/'double-check' draw.
    const whatsapp: ReceiptModel = {
      kind: 'ticks',
      states: {
        queued: { glyph: 'clock', color: 'var(--wa-tick-gray)' },
        sent: { glyph: 'check', color: 'var(--wa-tick-gray)' },
        delivered: { glyph: 'double-check', color: 'var(--wa-tick-gray)' },
        read: { glyph: 'double-check', color: 'var(--wa-tick-blue)' }, // color flips, glyph doesn't
        failed: { glyph: 'alert', color: 'var(--wa-tick-red)' },
      },
      placement: 'in-bubble',
      scope: 'every',
    };
    expect(whatsapp.states.delivered.glyph).toBe(whatsapp.states.read.glyph);
    expect(whatsapp.states.delivered.color).not.toBe(whatsapp.states.read.color);
  });

  it('Telegram 1:1/group — GLYPH varies, color fixed, no reachable "delivered"', () => {
    // Telegram's own `deliveryStates` field (adapter-interface-draft.md) never produces
    // 'delivered' (queued -> sent -> read only). `states` is still a TOTAL map over
    // DeliveryState — the unreachable key gets an explicit placeholder (same value as `sent`),
    // never `?`, per this file's "cero opcionales" convention.
    const telegramDirect: ReceiptModel = {
      kind: 'ticks',
      states: {
        queued: { glyph: 'clock', color: 'var(--tg-tick)' },
        sent: { glyph: 'check', color: 'var(--tg-tick)' },
        delivered: { glyph: 'check', color: 'var(--tg-tick)' }, // unreachable, mirrors `sent`
        read: { glyph: 'double-check', color: 'var(--tg-tick)' }, // glyph flips, color doesn't
        failed: { glyph: 'alert', color: 'var(--tg-tick-failed)' },
      },
      placement: 'in-bubble',
      scope: 'every',
    };
    expect(telegramDirect.states.sent.glyph).not.toBe(telegramDirect.states.read.glyph);
    expect(telegramDirect.states.sent.color).toBe(telegramDirect.states.read.color);
  });

  it('Telegram broadcast channel — a METRIC, not a delivery state', () => {
    // "el recibo no es un estado, es una métrica" (§F-1). No channel adapter this cycle
    // actually sets `kind:'metric'` (T-012 only wires 1:1/group values) — this fixture proves
    // the SHAPE can hold the case on paper, per acceptance #2. `states` carries no real
    // per-DeliveryState signal here (a view count doesn't vary by queued/sent/delivered/read),
    // so every key is the same placeholder — degenerate but not `?`, same convention as
    // `allowlistSize: 0 when emoji === 'any'`. The live count itself is `MsgState.views`
    // (already a separate field), composed by the renderer — never baked into this static config.
    const glyph = '👁';
    const color = 'var(--tg-metric)';
    const telegramBroadcast: ReceiptModel = {
      kind: 'metric',
      states: {
        queued: { glyph, color },
        sent: { glyph, color },
        delivered: { glyph, color },
        read: { glyph, color },
        failed: { glyph, color },
      },
      placement: 'in-bubble',
      scope: 'every',
    };
    expect(telegramBroadcast.kind).toBe('metric');
    expect(new Set(Object.values(telegramBroadcast.states).map((s) => s.glyph)).size).toBe(1);
  });

  it('iMessage — TEXT, below the bubble, only the last message of a run', () => {
    // The literal rendered string ("Leído 9:41") splices a real read timestamp — dynamic,
    // per-message data that can't live in a static per-channel config. `glyph` here holds only
    // the static label ("Entregado" / "Leído"); the renderer appends the actual time using the
    // same timestamp-formatting path every channel already needs (TimestampPlacement), same as
    // the metric's live count above — composition happens downstream, out of core/'s scope.
    const imessage: ReceiptModel = {
      kind: 'text',
      states: {
        queued: { glyph: '', color: 'var(--im-label)' }, // nothing shown pre-delivery
        sent: { glyph: '', color: 'var(--im-label)' },
        delivered: { glyph: 'Entregado', color: 'var(--im-label)' },
        read: { glyph: 'Leído', color: 'var(--im-label)' }, // renderer appends the time
        failed: { glyph: '', color: 'var(--im-label)' },
      },
      placement: 'below-bubble',
      scope: 'last-only',
    };
    expect(imessage.placement).toBe('below-bubble');
    expect(imessage.scope).toBe('last-only');
  });
});

// T-016 acceptance #1: "ReceiptIconId es cerrado. Un carácter literal no compila."
describe('ReceiptIconId is closed (T-016 acceptance #1)', () => {
  it('accepts the 4 declared members', () => {
    const ids: ReceiptIconId[] = ['clock', 'check', 'double-check', 'alert'];
    expect(ids).toHaveLength(4);
  });

  it('rejects a raw glyph character — this is a compile-time proof, not a runtime one', () => {
    // @ts-expect-error — '🕐' is a string, not a ReceiptIconId; this is the exact defect T-016
    // closes (an emoji baked into a `kind: 'ticks'` state). If this stops erroring, the enum
    // stopped being closed and this test should fail `tsc --noEmit` loudly.
    const queued: TickReceiptStateStyle = { glyph: '🕐', color: 'var(--x)' };
    expect(queued.glyph).toBe('🕐');
  });
});
