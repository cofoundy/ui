// adapters/telegram.ts — the Telegram `ChannelAdapter` value (adapter-interface-draft.md's
// Telegram column). No `delivered` state (§2: Telegram has no delivery receipt, only
// queued -> sent -> read). `views` is a channel-POST metric, not a 1:1/group receipt — this
// adapter models 1:1/group, so `counter` is 'none' here (telegram-fidelity-fix.md §F-2: the
// 👁 N slot in 1:1 is occupied by the ticks, not stacked alongside them). Reaction allowlist size
// is DERIVED from `caps.ts`'s real set, never a bare literal `73` — the two can't drift apart.

import type { ChannelAdapter } from '../core/types';
import { TELEGRAM_REACTIONS } from './caps';

export const telegram: ChannelAdapter = {
  tail: 'last',
  wallpaper: 'pattern',
  reactions: 'own-row',
  reactionConstraint: {
    emoji: 'allowlist',
    allowlistSize: TELEGRAM_REACTIONS.size,
    maxAgeDays: 0,
    canTargetReaction: false,
    canTargetOutbound: true,
    maxPerMessage: 0,
  },
  groupKey: 'actor',
  deliveryStates: ['queued', 'sent', 'read', 'failed'],
  // Real Telegram 1:1/group: color is constant, the GLYPH flips at `read` — the inverse twin of
  // WhatsApp (telegram-fidelity-fix.md §F-2). `delivered` is unreachable (not in deliveryStates
  // above) but `states` is a total map over DeliveryState (cero opcionales, core/types.ts) — it
  // mirrors `sent`, same convention core/__tests__/receipt-model.test.ts already fixtures.
  receipt: {
    kind: 'ticks',
    states: {
      queued: { glyph: '🕐', color: 'var(--cf-cs-bubble-out-meta)' },
      sent: { glyph: '✓', color: 'var(--cf-cs-bubble-out-meta)' },
      delivered: { glyph: '✓', color: 'var(--cf-cs-bubble-out-meta)' }, // unreachable, mirrors sent
      read: { glyph: '✓✓', color: 'var(--cf-cs-bubble-out-meta)' }, // glyph flips, color doesn't
      // Not in telegram-fidelity-fix.md (out of scope for the F-2 fix) — standard failed-send
      // red, unconfirmed byte-exact against a real Telegram capture.
      failed: { glyph: '!', color: '#e53935' },
    },
    placement: 'in-bubble',
    scope: 'every',
  },
  counter: 'none',
  timestamp: 'inside-plain',
  quote: 'thin-bar',
  bubbleTransport: 'per-conversation',
  senderKinds: ['human', 'ai', 'bot', 'forwarded', 'channel'],
  keyboard: 'inline-in-message',
  album: 'grid-in-one-bubble',
  e2eNotice: false,
  avatarSide: 'inbound',
};
