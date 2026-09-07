// adapters/whatsapp.ts — the WhatsApp `ChannelAdapter` value. The 16 fields are core's TYPE
// (T-001, core/types.ts); this is [channel]'s VALUE (adapter-interface-draft.md's WhatsApp
// column). Identical, by design, to element/fixtures.ts's `WHATSAPP_REFERENCE_ADAPTER` — that
// fixture is a wave-1 literal reading of the same table, kept only so `skin` could build against
// it before this file existed; this is the real one `registry.ts` serves.

import type { ChannelAdapterWithCapabilities } from './caps';

export const whatsapp: ChannelAdapterWithCapabilities = {
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
  // §F-2). `#53bdeb` was the same literal styles.css hardcoded at `.cf-receipt[data-read]`
  // (T-011 escalation E-002); both now resolve through `--channel-whatsapp-read` instead (T-028
  // follow-up, team-lead/skin) so a `branded` chrome consumer can retint the read-tick color —
  // the fallback keeps stock WhatsApp fidelity when nobody overrides the var.
  receipt: {
    kind: 'ticks',
    states: {
      queued: { glyph: 'clock', color: 'var(--cf-cs-bubble-out-meta)' },
      sent: { glyph: 'check', color: 'var(--cf-cs-bubble-out-meta)' },
      delivered: { glyph: 'double-check', color: 'var(--cf-cs-bubble-out-meta)' },
      // `read` is the only one of the four that needs a brand override slot: the other three
      // already resolve `var(--cf-cs-bubble-out-meta)` through real CSSOM (icons.ts sets
      // `el.style.color = color`, not an inert SVG attribute), so a `branded` chrome consumer
      // can already retint them; `read`'s literal couldn't. `skin` owns the
      // `[data-chrome='branded']` override for this var.
      read: { glyph: 'double-check', color: 'var(--channel-whatsapp-read, #53bdeb)' }, // color flips, glyph doesn't
      // Not in telegram-fidelity-fix.md (out of scope for the F-2 fix) — standard failed-send
      // red, unconfirmed byte-exact against a real WhatsApp capture.
      failed: { glyph: 'alert', color: '#e53935' },
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
  // T-028: WhatsApp Business's `interactive.type: "buttons"|"list"` — each its own native
  // message type with its own chrome (reply-buttons, and a scrollable list opened via a button).
  // Both supported, nothing to constrain yet (inbox-ai capabilities.py/registry.py's model).
  capabilities: {
    buttons: null,
    list: null,
  },
};
