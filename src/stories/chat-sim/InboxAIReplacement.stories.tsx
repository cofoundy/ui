// stories/chat-sim/InboxAIReplacement.stories.tsx — T-008 acceptance #1.
//
// The fixtures below (inboxMessageFixtures.ts) are typed as the REAL inbox-ai `Message`
// (inbox-ai/frontend/src/lib/api.ts:229) via a plain cross-repo `import type` — no adapter, no
// hand-copied mirror. If that interface's required fields ever change shape, this story stops
// compiling; there is no fallback path (see `__shims/inbox-ai-alias.d.ts` for the one thing that
// IS shimmed, and why it doesn't loosen this).
//
// "N KB reemplazables": inbox-ai/frontend/src/components/conversation/MessageBubble.tsx's own
// `Ticks` (delivery-tick SVG, lines 1265-1286), `DeliveryStatus` (+ its `DELIVERY_STATUS_KEYS`
// lookup, lines 1287-1364) and `ReactionPill` (lines 1125-1152) — the three blocks this replaces
// end to end (receipt/read state + reactions). Measured with:
//
//   F=inbox-ai/frontend/src/components/conversation/MessageBubble.tsx
//   { sed -n '1125,1152p' "$F"; sed -n '1265,1286p' "$F"; sed -n '1287,1364p' "$F"; } | wc -c
//   => 4976 bytes (4.86 KB)
//
// NOT counted, even though this story also exercises them: `isEdited`'s "Editado" indicator and
// `isSoftDeleted`'s tombstone (`SystemPlaceholder`) — both are inline in MessageBubble.tsx's one
// 636-line render function (lines 108-744) tangled with media/location/quote/interactive-button
// rendering this story does nothing for, so there is no clean byte range that is ONLY the
// edited/deleted logic. Counting the whole function would overclaim; this story states both
// divergences below instead of padding the number.

import type { Meta, StoryObj } from '@storybook/react';
import { ChatSim } from '../../components/chat-sim';
import { VIEWPORT_MOBILE } from '../_shared/viewports';
import { messagesToScript } from './lib/inboxMessageAdapter';
import {
  AI_DRAFT_PENDING,
  ALL_FIXTURES,
  OUTBOUND_AI_READ,
  TELEGRAM_CHANNEL_POST,
} from './lib/inboxMessageFixtures';
import '../../components/chat-sim/styles.css';

const meta: Meta<typeof ChatSim> = {
  title: 'ChatSim/InboxAI Replacement',
  component: ChatSim,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Replaces the receipt-tick, read-state and reaction rendering of `MessageBubble.tsx` ' +
          '(inbox-ai) with `@cofoundy/ui/chat-sim`. Fixtures are typed against the real ' +
          '`Message` interface — see the file header for the exact byte range replaced.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="cf-chat-sim" style={{ width: 'min(380px, 92vw)', height: 620 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ChatSim>;

/**
 * All 5 fixtures run through the real `Message` -> `SimStep[]` mapper and the public
 * `compile()`/`fold()` pipeline. `AI_DRAFT_PENDING` never appears — a held-for-approval draft
 * has no chat-sim representation this cycle (`isPostableDeliveryStatus` excludes it), which is
 * the correct behavior, not a gap: nothing in `MessageBubble.tsx`'s block being replaced here
 * renders drafts either (that's `DraftBubble`, a separate function, out of this story's scope).
 */
export const RealConversation: Story = {
  args: {
    script: messagesToScript(ALL_FIXTURES),
    channel: 'whatsapp',
    seed: 1,
    mode: 'live',
    contactName: 'María',
    contactStatus: 'cliente',
  },
};

/** Isolates the one state the N-KB claim is actually about: an AI-generated outbound message
 * the customer has read (`OUTBOUND_AI_READ.delivery_status === 'read'`) — WhatsApp's read-blue
 * double-tick, `Ticks` + `DeliveryStatus`'s exact replacement target. */
export const ReadReceipt: Story = {
  args: {
    script: messagesToScript([OUTBOUND_AI_READ]),
    channel: 'whatsapp',
    seed: 1,
    mode: 'live',
  },
};

/** `TELEGRAM_CHANNEL_POST` has no `views` count in the real `Message` shape — inbox-ai is a
 * 1:1 support inbox, not a broadcast channel, so there is no `view_count`-shaped field to map.
 * This story stays scoped to what IS derivable from `Message` (the delivery_status -> receipt
 * mapping, still exercised); `ChatSimStates.stories.tsx`'s `ViewsCounter` story is where the
 * Telegram views counter itself is demonstrated, with an explicitly synthetic count. */
export const TelegramReceipt: Story = {
  args: {
    script: messagesToScript([TELEGRAM_CHANNEL_POST]),
    channel: 'telegram',
    seed: 1,
    mode: 'live',
    contactName: 'Fovente — Canal',
  },
};

/**
 * Two named divergences from the real product, both real findings (not silently patched over):
 *
 * 1. **Edited.** inbox-ai's own `isEdited` check reads `message.metadata.edited === true`
 *    (MessageBubble.tsx:182) — NOT `message.edited_at`, even though `Message` carries both.
 *    `inboxMessageAdapter.ts` mirrors that exact field, on purpose (see its own comment) — a
 *    mapper that used the more-obvious `edited_at` would compile fine and still not match
 *    production.
 * 2. **Soft-deleted.** The real product renders a muted tombstone (`SystemPlaceholder`) in the
 *    deleted message's place. chat-sim's `delete` Ev instead removes the message from the
 *    visible thread entirely (`fold.ts`'s visibility rule is `deleted === null`) — the thread
 *    behaves as if the message never happened, not as if it happened-and-was-retracted. This is
 *    why `SystemPlaceholder` is NOT in the "N KB reemplazables" count above: it isn't actually
 *    replaced, it's a gap.
 */
export const EditedAndDeletedDivergence: Story = {
  args: {
    script: messagesToScript(ALL_FIXTURES.filter((m) => m.id !== 'msg_5')),
    channel: 'whatsapp',
    seed: 1,
    mode: 'live',
    contactName: 'María',
  },
};

/** `mode="live"` is a real, operable composer (textarea + send button, ≥44px targets, ≥16px
 * input to prevent iOS auto-zoom) — the one genuinely NEW interactive surface this story family
 * introduces, per COMPONENTS.md's mobile-first contract. */
export const MobileBaseline: Story = {
  parameters: { viewport: VIEWPORT_MOBILE },
  args: {
    script: messagesToScript(ALL_FIXTURES),
    channel: 'whatsapp',
    seed: 1,
    mode: 'live',
    contactName: 'María',
    contactStatus: 'cliente',
  },
};
