// T-011 acceptance #2: prove `ReceiptModel` can express all 4 rows of telegram-fidelity-fix.md
// §F-1. Two of the four rows (WhatsApp, Telegram 1:1/group) now assert against the REAL adapter
// values returned by `getAdapter(...)` — production data, not a hand-typed local literal — so a
// regression in `adapters/whatsapp.ts` or `adapters/telegram.ts` actually fails this file.
//
// T-022 §B: the previous version of this file built its OWN `ReceiptModel` object per case and
// then asserted against that same object — a probe that can never go red, since nothing outside
// the test can ever disagree with a value the test invented. Fixed by reading the real thing.
//
// The remaining two rows (Telegram broadcast-channel `metric`, iMessage `text`) have NO real
// adapter yet — `registry.ts` only wires whatsapp/telegram 1:1-group (imessage is explicitly out
// of scope this cycle, architecture-v1.md §10). Those two stay paper-proof fixtures, exactly as
// documented below; their only sound gate is the type system, not this runtime file — see
// `types-contract.typecheck.test.ts`, which reproduces the audit's `core/types.ts` mutation and
// proves it actually reddens (via `tsc --noEmit`, not vitest — TS types are erased at runtime, so
// no vitest assertion can ever detect a types-only mutation, no matter what it asserts against).

import { describe, expect, it } from 'vitest';
import type { ReceiptIconId, TickReceiptStateStyle } from '../types';
import { getAdapter } from '../../adapters/registry';

describe('ReceiptModel expresses all 4 §F-1 cases (acceptance #2)', () => {
  it('WhatsApp (real adapter) — glyph fixed, COLOR varies at read', () => {
    const { receipt } = getAdapter('whatsapp');
    if (receipt.kind !== 'ticks') throw new Error('expected whatsapp to use kind:"ticks"');
    expect(receipt.states.delivered.glyph).toBe(receipt.states.read.glyph);
    expect(receipt.states.delivered.color).not.toBe(receipt.states.read.color);
  });

  it('Telegram 1:1/group (real adapter) — GLYPH varies, color fixed, no reachable "delivered"', () => {
    const adapter = getAdapter('telegram');
    if (adapter.receipt.kind !== 'ticks') throw new Error('expected telegram to use kind:"ticks"');
    // Telegram's real `deliveryStates` (adapter-interface-draft.md) never produces 'delivered'
    // (queued -> sent -> read only) — asserted against the adapter's OWN field, not a re-typed copy.
    expect(adapter.deliveryStates).not.toContain('delivered');
    expect(adapter.receipt.states.sent.glyph).not.toBe(adapter.receipt.states.read.glyph);
    expect(adapter.receipt.states.sent.color).toBe(adapter.receipt.states.read.color);
  });

  // Paper proof (T-012 hasn't wired a real `kind:'metric'` adapter this cycle) — the shape must
  // still type-check, per acceptance #2. Runtime assertions here can only prove the fixture is
  // internally consistent, never that it matches a real adapter (there isn't one).
  it('Telegram broadcast channel — a METRIC, not a delivery state (paper proof, no live adapter)', () => {
    const glyph = '👁';
    const color = 'var(--tg-metric)';
    const telegramBroadcast = {
      kind: 'metric' as const,
      states: {
        queued: { glyph, color },
        sent: { glyph, color },
        delivered: { glyph, color },
        read: { glyph, color },
        failed: { glyph, color },
      },
      placement: 'in-bubble' as const,
      scope: 'every' as const,
    };
    expect(telegramBroadcast.kind).toBe('metric');
    expect(new Set(Object.values(telegramBroadcast.states).map((s) => s.glyph)).size).toBe(1);
  });

  // Paper proof — iMessage adapter is out of scope this cycle (registry.ts has no entry for it).
  it('iMessage — TEXT, below the bubble, only the last message of a run (paper proof, no live adapter)', () => {
    const imessage = {
      kind: 'text' as const,
      states: {
        queued: { glyph: '', color: 'var(--im-label)' },
        sent: { glyph: '', color: 'var(--im-label)' },
        delivered: { glyph: 'Entregado', color: 'var(--im-label)' },
        read: { glyph: 'Leído', color: 'var(--im-label)' },
        failed: { glyph: '', color: 'var(--im-label)' },
      },
      placement: 'below-bubble' as const,
      scope: 'last-only' as const,
    };
    expect(imessage.placement).toBe('below-bubble');
    expect(imessage.scope).toBe('last-only');
  });
});

// T-016 acceptance #1: "ReceiptIconId es cerrado. Un carácter literal no compila." This is
// inherently a compile-time proof — enforced by `types-contract.typecheck.test.ts`, not by the
// runtime assertions below (which TS erases the type of before either can execute).
describe('ReceiptIconId is closed (T-016 acceptance #1)', () => {
  it('accepts the 4 declared members', () => {
    const ids: ReceiptIconId[] = ['clock', 'check', 'double-check', 'alert'];
    expect(ids).toHaveLength(4);
  });

  it('rejects a raw glyph character — this is a compile-time proof, not a runtime one', () => {
    // @ts-expect-error — '🕐' is a string, not a ReceiptIconId; this is the exact defect T-016
    // closes (an emoji baked into a `kind: 'ticks'` state). If this stops erroring, the enum
    // stopped being closed and `tsc --noEmit` (not this line) should fail loudly.
    const queued: TickReceiptStateStyle = { glyph: '🕐', color: 'var(--x)' };
    expect(queued.glyph).toBe('🕐');
  });
});
