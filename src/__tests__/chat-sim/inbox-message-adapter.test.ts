// __tests__/chat-sim/inbox-message-adapter.test.ts — qa's own write cell.
//
// Runtime behavior of stories/chat-sim/lib/inboxMessageAdapter.ts on top of the compile-time
// check T-008 acceptance #1 asks for (the fixtures themselves are typed against the REAL
// inbox-ai `Message`, not a hand-copied mirror — see inboxMessageFixtures.ts). A type that
// compiles proves the SHAPE lines up; these tests prove the VALUES map correctly.

import { describe, expect, it } from 'vitest';
import { compile } from '../../components/chat-sim/core/compile';
import { seek } from '../../components/chat-sim/core/seek';
import { getAdapter } from '../../components/chat-sim/adapters/registry';
import { validateScript } from '../../components/chat-sim/adapters/validate';
import {
  isPostableDeliveryStatus,
  messageToActorId,
  messagesToScript,
  messageToSteps,
} from '../../stories/chat-sim/lib/inboxMessageAdapter';
import {
  AI_DRAFT_PENDING,
  ALL_FIXTURES,
  INBOUND_TEXT,
  OUTBOUND_AI_READ,
  OUTBOUND_EDITED,
  OUTBOUND_SOFT_DELETED,
  TELEGRAM_CHANNEL_POST,
} from '../../stories/chat-sim/lib/inboxMessageFixtures';

describe('messageToActorId()', () => {
  it('inbound -> "in", regardless of sender.type', () => {
    expect(messageToActorId(INBOUND_TEXT)).toBe('in');
  });
  it('outbound + sender.type "ai" -> "out:ai"', () => {
    expect(messageToActorId(OUTBOUND_AI_READ)).toBe('out:ai');
  });
  it('outbound + sender.type "agent" -> "out:human:<sender.id>" (never a bare "out")', () => {
    expect(messageToActorId(OUTBOUND_EDITED)).toBe('out:human:agent_1');
  });
});

describe('isPostableDeliveryStatus()', () => {
  it('accepts the 5 real DeliveryState values', () => {
    for (const s of ['queued', 'sent', 'delivered', 'read', 'failed']) {
      expect(isPostableDeliveryStatus(s)).toBe(true);
    }
  });
  it('rejects "draft"/"discarded" — a different concept from chat-sim\'s own draft Ev', () => {
    expect(isPostableDeliveryStatus('draft')).toBe(false);
    expect(isPostableDeliveryStatus('discarded')).toBe(false);
  });
});

describe('messageToSteps()', () => {
  it('a held-for-approval AI draft has no SimStep — excluded, not coerced', () => {
    expect(messageToSteps(AI_DRAFT_PENDING)).toBeNull();
  });

  it('reads metadata.edited (not edited_at) to decide the edit step', () => {
    const steps = messageToSteps(OUTBOUND_EDITED)!;
    expect(steps.some((s) => s.k === 'edit')).toBe(true);
    // Same content, minus `metadata.edited` — edited_at is still set, proving the mapper
    // really branches on metadata.edited and not the more-obvious-looking field.
    const notFlagged = { ...OUTBOUND_EDITED, metadata: {} };
    expect(messageToSteps(notFlagged)!.some((s) => s.k === 'edit')).toBe(false);
  });

  it('a soft-deleted message gets post + delete, never a receipt step', () => {
    const steps = messageToSteps(OUTBOUND_SOFT_DELETED)!;
    expect(steps.map((s) => s.k)).toEqual(['post', 'delete']);
  });

  it('an ordinary posted message gets post + receipt, mapped 1:1 from delivery_status', () => {
    const steps = messageToSteps(OUTBOUND_AI_READ)!;
    expect(steps.map((s) => s.k)).toEqual(['post', 'receipt']);
    const receipt = steps.find((s) => s.k === 'receipt');
    expect(receipt).toMatchObject({ to: 'read' });
  });
});

describe('messagesToScript() — end to end through the real compile()/fold() pipeline', () => {
  it('assembles a script that compiles clean for whatsapp and reproduces the mapped states', () => {
    const script = messagesToScript(ALL_FIXTURES);
    const diagnostics = validateScript(script, 'whatsapp');
    expect(diagnostics).toEqual([]);

    const tl = compile(script, { seed: 1, channel: 'whatsapp', locale: 'es-PE', tz: 'America/Lima', t0: 0 });
    const finalState = seek(tl, tl.duration);

    // AI_DRAFT_PENDING is excluded -> only 4 of the 5 fixtures ever get a MsgId.
    expect(finalState.msgs.size).toBe(4);

    const read = finalState.msgs.get('m1')!; // OUTBOUND_AI_READ is the 2nd postable fixture
    expect(read.receipt).toBe('read');
    expect(read.text).toBe(OUTBOUND_AI_READ.content);

    const edited = finalState.msgs.get('m2')!; // OUTBOUND_EDITED
    expect(edited.v).toBeGreaterThan(0);

    const deleted = finalState.msgs.get('m3')!; // OUTBOUND_SOFT_DELETED
    expect(deleted.deleted).toBe('all');
    // `SimState.order` itself still lists a deleted message — `delete` doesn't remove the entry,
    // it flags it. The VISIBILITY filter (react/ChatSim.tsx's `visibleAt`, element/'s equivalent)
    // is what drops it, via exactly this predicate — asserted here so the named divergence from
    // the real product's tombstone (SystemPlaceholder) can't silently regress into "looks
    // deleted" vs "actually still shows something".
    expect(finalState.order.includes('m3')).toBe(true);
    const visibleIds = finalState.order.filter((id) => finalState.msgs.get(id)?.deleted === null);
    expect(visibleIds.includes('m3')).toBe(false);
  });

  it('Telegram: the same delivery_status vocabulary still validates (no "delivered" used)', () => {
    const script = messagesToScript([TELEGRAM_CHANNEL_POST]);
    expect(validateScript(script, 'telegram')).toEqual([]);
    // Sanity: whatsapp's adapter has 'delivered', telegram's does not (adapters/telegram.ts) —
    // proves this isn't a vacuously-true check against an adapter that accepts everything.
    expect(getAdapter('telegram').deliveryStates).not.toContain('delivered');
    expect(getAdapter('whatsapp').deliveryStates).toContain('delivered');
  });

  it('gemelo positivo: a script that DOES use an unsupported delivery state for the channel is caught', () => {
    const invalidForTelegram = messagesToScript([{ ...OUTBOUND_AI_READ, delivery_status: 'delivered' }]);
    const diagnostics = validateScript(invalidForTelegram, 'telegram');
    expect(diagnostics).toHaveLength(1);
    expect(diagnostics[0].code).toBe('unsupported-delivery-state');
  });
});
