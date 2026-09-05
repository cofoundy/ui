// adapters/whatsapp.ts — the WhatsApp `ChannelAdapter` value. The 16 fields are core's TYPE
// (T-001, core/types.ts); this is [channel]'s VALUE (adapter-interface-draft.md's WhatsApp
// column). Identical, by design, to element/fixtures.ts's `WHATSAPP_REFERENCE_ADAPTER` — that
// fixture is a wave-1 literal reading of the same table, kept only so `skin` could build against
// it before this file existed; this is the real one `registry.ts` serves.

import type { ChannelAdapter } from '../core/types';

export const whatsapp: ChannelAdapter = {
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
  // Real WhatsApp: glyph is constant across queued->sent->delivered->read (clock, then 1 tick,
  // then 2 ticks that STAY 2 ticks) — only the COLOR flips at `read` (telegram-fidelity-fix.md
  // §F-2). `#53bdeb` is the same literal styles.css already hardcodes at `.cf-receipt[data-read]`
  // (T-011 escalation E-002) — sourcing it from here retires that selector, doesn't reinvent it.
  receipt: {
    kind: 'ticks',
    states: {
      queued: { glyph: '🕐', color: 'var(--cf-cs-bubble-out-meta)' },
      sent: { glyph: '✓', color: 'var(--cf-cs-bubble-out-meta)' },
      delivered: { glyph: '✓✓', color: 'var(--cf-cs-bubble-out-meta)' },
      read: { glyph: '✓✓', color: '#53bdeb' }, // color flips, glyph doesn't
      // Not in telegram-fidelity-fix.md (out of scope for the F-2 fix) — standard failed-send
      // red, unconfirmed byte-exact against a real WhatsApp capture.
      failed: { glyph: '!', color: '#e53935' },
    },
    placement: 'in-bubble',
    scope: 'every',
  },
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
