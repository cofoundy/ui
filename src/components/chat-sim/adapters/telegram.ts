// adapters/telegram.ts — the Telegram `ChannelAdapter` value (adapter-interface-draft.md's
// Telegram column). No `delivered` state (§2: Telegram has no delivery receipt, only
// queued -> sent -> read, plus a `views` counter on channel posts). Reaction allowlist size is
// DERIVED from `caps.ts`'s real set, never a bare literal `73` — the two can't drift apart.

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
  receiptGlyph: 'single-tick',
  counter: 'views',
  timestamp: 'inside-plain',
  quote: 'thin-bar',
  bubbleTransport: 'per-conversation',
  senderKinds: ['human', 'ai', 'bot', 'forwarded', 'channel'],
  keyboard: 'inline-in-message',
  album: 'grid-in-one-bubble',
  e2eNotice: false,
  avatarSide: 'inbound',
};
