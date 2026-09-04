// stories/chat-sim/ChatSimChannels.stories.tsx — per-channel overview + demo vs. live mode.
// Uses the same realistic script demo/index.html ships (T-002/[skin]'s reference conversation),
// so this reads as "the same demo, both channels, both modes" rather than a throwaway fixture.

import type { Meta, StoryObj } from '@storybook/react';
import { ChatSim } from '../../components/chat-sim';
import { VIEWPORT_MOBILE } from '../_shared/viewports';
import type { SimScript } from '../../components/chat-sim/core/types';
import '../../components/chat-sim/styles.css';

const RESERVA_SCRIPT: SimScript = [
  { k: 'post', by: 'in', text: 'Hola! ¿Tienen mesa para el sábado a las 8pm?', delayMs: 500 },
  { k: 'draft', by: 'out:ai', chars: 18, delayMs: 450 },
  { k: 'post', by: 'out:ai', text: '¡Hola! Sí, tenemos disponibilidad. ¿Para cuántas personas?', delayMs: 850 },
  { k: 'post', by: 'in', text: 'Para 4, por favor', delayMs: 1500 },
  { k: 'draft', by: 'out:ai', chars: 30, delayMs: 400 },
  { k: 'post', by: 'out:ai', text: 'Perfecto, reservado para 4 el sábado a las 8pm 🎉', delayMs: 900 },
  { k: 'receipt', id: 'm2', to: 'read', delayMs: 600 },
];

const TELEGRAM_SCRIPT: SimScript = [
  { k: 'post', by: 'out:human:agent_1', text: 'Promo del fin de semana 🎉', delayMs: 400 },
  { k: 'views', id: 'm0', n: 214, delayMs: 300 },
  { k: 'post', by: 'in', text: 'a qué hora abren?', delayMs: 900 },
  { k: 'receipt', id: 'm1', to: 'read', delayMs: 500 },
];

const meta: Meta<typeof ChatSim> = {
  title: 'ChatSim/Channels',
  component: ChatSim,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '`<ChatSim>` — the public React entry point (api-contract.md). `mode="demo"` mirrors ' +
          '`<cf-chat-sim>` (the custom element, T-002/[skin]) byte-for-byte at the DOM level; ' +
          '`mode="live"` freezes at the final step and swaps in a real, operable composer.',
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

/** Autoplaying — the same script/seed/channel `demo/index.html` ships, driven by the same core
 * `Playhead` `<cf-chat-sim>` uses. Not screenshot-stable by nature (it's mid-playback); the
 * frozen `mode="live"` stories below are what Chromatic should diff against. */
export const WhatsAppDemoAutoplay: Story = {
  args: {
    script: RESERVA_SCRIPT,
    channel: 'whatsapp',
    seed: 7,
    t0: 1789761600000,
    mode: 'demo',
    contactName: 'Fovente — Reservas',
    contactStatus: 'en línea',
  },
};

export const WhatsAppLive: Story = {
  args: {
    script: RESERVA_SCRIPT,
    channel: 'whatsapp',
    seed: 7,
    t0: 1789761600000,
    mode: 'live',
    contactName: 'Fovente — Reservas',
    contactStatus: 'en línea',
  },
};

/** Telegram: `own-row` reactions, single-tick receipt glyph, `views` counter — all four
 * structurally-flipped axes from WhatsApp (adapters/telegram.ts vs adapters/whatsapp.ts). */
export const TelegramLive: Story = {
  args: {
    script: TELEGRAM_SCRIPT,
    channel: 'telegram',
    seed: 3,
    mode: 'live',
    contactName: 'Fovente — Canal',
  },
};

/** `mode="live"`'s composer is the genuinely NEW interactive surface in this family: a real
 * `<textarea>` + send button with mobile keyboard handling (`useKeyboardInset` — `visualViewport`
 * + `100dvh` root + safe-area + ≥44px targets + ≥16px input font-size, architecture-v1.md §8). */
export const MobileBaseline: Story = {
  parameters: { viewport: VIEWPORT_MOBILE },
  args: {
    script: RESERVA_SCRIPT,
    channel: 'whatsapp',
    seed: 7,
    t0: 1789761600000,
    mode: 'live',
    contactName: 'Fovente — Reservas',
    contactStatus: 'en línea',
  },
};
