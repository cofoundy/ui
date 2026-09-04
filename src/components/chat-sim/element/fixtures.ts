// Wave-1 reference adapter values — NOT the real adapter registry.
//
// `adapters/**` (caps.ts / registry.ts / whatsapp.ts / telegram.ts / validateScript) is [channel]'s
// write cell (file-ownership-matrix.md) and lands in T-005 (blockedBy T-003 — several waves out).
// architecture-v1.md §9 still puts "adapter WhatsApp" in iteration 1's "abrible" deliverable, and
// the Fase-5 decision (Q5, .cofoundy/context/decisions/2026-09-04-phase-5-tasks.md) resolves the
// tension explicitly: adapter-interface-draft.md tabulates all 16 fields' values per channel
// already, so `skin` has everything it needs to build the WhatsApp layout without T-005's real
// implementation — it just can't import `adapters/registry.ts` yet.
//
// These two constants are that: a literal reading of adapter-interface-draft.md's WhatsApp column,
// typed against `ChannelAdapter` from core/types.ts (T-001) — read, not forked. `demo/` and this
// package's own tests use them until `getAdapter('whatsapp')` exists; swapping the import then is
// a one-line change, not a rewrite (render.ts never branches on `channel`, only on adapter fields).

import type { ChannelAdapter } from '../core/types';

export const WHATSAPP_REFERENCE_ADAPTER: ChannelAdapter = {
  tail: 'first',
  wallpaper: 'pattern',
  reactions: 'overlay-below',
  reactionConstraint: {
    emoji: 'any',
    allowlistSize: 0,
    maxAgeDays: 30,
    canTargetReaction: false,
    canTargetOutbound: true,
    maxPerMessage: 0,
  },
  groupKey: 'actor',
  deliveryStates: ['queued', 'sent', 'delivered', 'read', 'failed'],
  receiptGlyph: 'double-tick',
  counter: 'none',
  timestamp: 'inside-pad',
  quote: 'color-bar',
  bubbleTransport: 'per-conversation',
  senderKinds: ['human', 'ai'],
  keyboard: 'os-qwerty',
  album: 'grid-in-one-bubble',
  e2eNotice: true,
  avatarSide: 'inbound',
};

/**
 * T-002 acceptance #6 (B-5) fixture: implements the same 16-field interface but flips the four
 * structural axes named by the amendment — tail/receiptGlyph/timestamp/reactions. `wallpaper` is
 * deliberately NOT flipped (it's `pattern` in both WhatsApp and Telegram — B-5 excludes it by
 * name: it doesn't discriminate, and it's background, which is exactly what the criterion isn't
 * measuring). Values otherwise borrowed from Telegram's column so the object stays internally
 * plausible, not just "WhatsApp with four fields negated" — but that plausibility isn't what's
 * under test, only that render.ts's DOM output changes on these four axes when it changes.
 */
export const CAPS_FIXTURE_INVERTED_ADAPTER: ChannelAdapter = {
  ...WHATSAPP_REFERENCE_ADAPTER,
  tail: 'last',
  receiptGlyph: 'single-tick',
  timestamp: 'inside-plain',
  reactions: 'own-row',
};
