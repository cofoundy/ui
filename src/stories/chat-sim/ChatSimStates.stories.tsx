// stories/chat-sim/ChatSimStates.stories.tsx — one story per visually-meaningful `Ev` state,
// each frozen (`mode="live"`) so it's a deterministic single frame rather than a live playback —
// Chromatic/visual-regression friendly, and easier to read as a state catalog.
//
// `pin`/`unpin`, `flag`, `overlay` and `cue` are DELIBERATELY absent from this file: none of them
// have a visual renderer this cycle (core/fold.ts's own header: "overlay/cue stay no-ops here…
// no task has claimed populating [overlays] yet"; `pin`/`flag` update `SimState` but nothing in
// element/render.ts or react/MessageThread.tsx reads `state.pinned` or `state.flags` for
// rendering). A story that "shows" one of those would screenshot a state that looks identical
// to not having sent the event at all — a fake positive, not a demonstration.

import type { Meta, StoryObj } from '@storybook/react';
import { ChatSim } from '../../components/chat-sim';
import { VIEWPORT_MOBILE } from '../_shared/viewports';
import type { SimScript } from '../../components/chat-sim/core/types';
import '../../components/chat-sim/styles.css';

const meta: Meta<typeof ChatSim> = {
  title: 'ChatSim/States',
  component: ChatSim,
  tags: ['autodocs'],
  argTypes: {
    channel: { control: 'select', options: ['whatsapp', 'telegram'] },
  },
  args: {
    channel: 'whatsapp',
    seed: 7,
    mode: 'live',
  },
  decorators: [
    (Story) => (
      <div className="cf-chat-sim" style={{ width: 'min(380px, 92vw)', height: 480 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ChatSim>;

const post = (by: string, text: string): SimScript[number] => ({ k: 'post', by, text });

export const Post: Story = {
  args: { script: [post('in', '¿Tienen mesa para el sábado a las 8pm?')] },
};

export const Edit: Story = {
  args: {
    script: [post('out:ai', 'Perfecto, reservado para el sábado a las 8pm'), { k: 'edit', id: 'm0', v: 1 }],
    editedLabel: 'Editado',
  },
};

/** chat-sim's `delete` removes the message from the visible thread — see
 * `InboxAIReplacement.stories.tsx`'s `EditedAndDeletedDivergence` for why that's a named
 * divergence from the real product's tombstone. Shown here alongside a second message so the
 * story isn't just an empty thread. */
export const Delete: Story = {
  args: {
    script: [
      post('in', 'esto no debía salir así'),
      { k: 'delete', id: 'm0', scope: 'all' },
      post('in', 'perdón, va de nuevo: ¿mesa para el sábado?'),
    ],
  },
};

/** WhatsApp: `reactions: 'overlay-below'` (adapters/whatsapp.ts) — a pill overlapping the
 * bubble's bottom corner. Switch the Controls panel to `telegram` to compare against
 * `own-row` (adapters/telegram.ts). Currently affected by `.cofoundy/tasks/T-010.md` — see that
 * task and `src/__tests__/chat-sim/chatsim-cross-channel-states.test.tsx` for the confirmed root
 * cause (an `&&` operator-precedence bug in `react/MessageThread.tsx` that suppresses the
 * reaction pill on every channel, not just this one). The reaction IS present in `SimState`
 * either way (verified via `compile()`/`seek()`) — only the visual is pending that fix. */
export const Reaction: Story = {
  args: {
    script: [post('in', 'reservado, gracias!'), { k: 'react', id: 'm0', emoji: '❤', by: 'out:ai' }],
  },
};

export const Pinned: Story = {
  args: {
    script: [post('out:ai', 'Recuerda: la reserva es a nombre de María'), { k: 'pin', id: 'm0' }],
  },
  parameters: {
    docs: {
      description: {
        story:
          'Included for script-authoring completeness — `pin` updates `SimState.pinned`, but ' +
          'no renderer reads it this cycle, so this looks IDENTICAL to `Post` above. That is ' +
          'the accurate state of the feature, not a story bug.',
      },
    },
  },
};

/** The 5-state receipt progression a single message can carry (`DeliveryState`, core/types.ts).
 * `queued`/`sent`/`delivered` are WhatsApp-only (adapters/telegram.ts has no `delivered`). */
export const ReceiptQueued: Story = {
  args: { script: [post('out:ai', 'enviando...'), { k: 'receipt', id: 'm0', to: 'queued' }] },
};
export const ReceiptSent: Story = {
  args: { script: [post('out:ai', 'reservado para 4'), { k: 'receipt', id: 'm0', to: 'sent' }] },
};
export const ReceiptDelivered: Story = {
  args: { script: [post('out:ai', 'reservado para 4'), { k: 'receipt', id: 'm0', to: 'delivered' }] },
};

/** The read-blue tick (`.cf-receipt[data-read='true']`, styles.css:333). */
export const ReceiptRead: Story = {
  args: { script: [post('out:ai', 'reservado para 4'), { k: 'receipt', id: 'm0', to: 'read' }] },
};

export const ReceiptFailed: Story = {
  args: { script: [post('out:ai', 'reservado para 4'), { k: 'receipt', id: 'm0', to: 'failed' }] },
};

/** `read` (upTo) marks every message up to and including the target as read in one step —
 * distinct from a per-message `receipt` — the read-receipt-sweep a customer opening the thread
 * actually produces. */
export const ReadUpTo: Story = {
  args: {
    script: [post('in', 'hola'), post('out:ai', 'hola, ¿en qué te ayudo?'), { k: 'read', upTo: 'm1' }],
  },
};

/** Telegram-only: `counter: 'views'` (adapters/telegram.ts) vs WhatsApp's `counter: 'none'` —
 * this state is invisible on WhatsApp by design, so this story is PINNED to Telegram rather
 * than left on the shared `channel` control default. */
export const ViewsCounter: Story = {
  args: {
    channel: 'telegram',
    script: [post('out:human:agent_1', 'Promo del fin de semana 🎉'), { k: 'views', id: 'm0', n: 128 }],
  },
};

/** `draft` (typing indicator) with no following `post` — the bubble stays visible at the frozen
 * final step, same as a mid-typing snapshot. */
export const TypingIndicator: Story = {
  args: {
    script: [post('in', 'hola'), { k: 'draft', by: 'out:ai', chars: 12 }],
  },
};

export const MobileBaseline: Story = {
  parameters: { viewport: VIEWPORT_MOBILE },
  args: {
    script: [
      post('in', '¿Tienen mesa para el sábado a las 8pm?'),
      { k: 'draft', by: 'out:ai', chars: 18 },
      post('out:ai', 'Sí, tenemos disponibilidad. ¿Para cuántas personas?'),
      { k: 'receipt', id: 'm1', to: 'read' },
    ],
  },
};
