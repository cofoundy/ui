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
