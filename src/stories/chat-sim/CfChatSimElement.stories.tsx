// stories/chat-sim/CfChatSimElement.stories.tsx — T-024 §D: `<cf-chat-sim>` is the public custom
// element (api-contract.md §"Firmas públicas", element/chat-sim-element.ts), documented ONLY via
// `demo/*.html` — outside Storybook and outside Chromatic, so a visual regression here (wallpaper,
// receipt glyphs, own-row vs overlay reactions, the `--cf-cs-pad` stamp gap) had zero coverage.
// See ChatSimChannels.stories.tsx for the React `<ChatSim>` sibling this contract is byte-for-byte
// checked against (snapshot-cross-check.test.tsx) — same script, same seed, same channel here.
//
// Mounted imperatively (a plain host <div> + `document.createElement('cf-chat-sim')`), not as a
// JSX intrinsic tag: attributes must be set BEFORE the element is inserted into the document so
// `connectedCallback` (which reads them synchronously, once, on connect) sees the real values —
// this is also exactly how a real consumer authors it (demo/*.html's static markup), just built
// imperatively so Storybook's React harness can own the lifecycle.

import { useEffect, useRef } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import '../../components/chat-sim/element'; // side effect: registers <cf-chat-sim>
import type { ChannelId, Chrome, SimScript } from '../../components/chat-sim/core/types';
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

interface CfChatSimHostProps {
  script: SimScript;
  channel: ChannelId;
  seed: number;
  t0?: number;
  locale?: string;
  tz?: string;
  contactName?: string;
  contactStatus?: string;
  chrome?: Chrome;
}

function CfChatSimHost({
  script,
  channel,
  seed,
  t0,
  locale,
  tz,
  contactName,
  contactStatus,
  chrome,
}: CfChatSimHostProps) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const el = document.createElement('cf-chat-sim');
    el.setAttribute('script', JSON.stringify(script));
    el.setAttribute('channel', channel);
    el.setAttribute('seed', String(seed));
    if (t0 !== undefined) el.setAttribute('t0', String(t0));
    if (locale) el.setAttribute('locale', locale);
    if (tz) el.setAttribute('tz', tz);
    if (contactName) el.setAttribute('contact-name', contactName);
    if (contactStatus) el.setAttribute('contact-status', contactStatus);
    if (chrome) el.setAttribute('chrome', chrome);
    host.appendChild(el);
    return () => {
      host.removeChild(el);
    };
  }, [script, channel, seed, t0, locale, tz, contactName, contactStatus, chrome]);

  return <div ref={hostRef} />;
}

const meta: Meta<typeof CfChatSimHost> = {
  title: 'ChatSim/CustomElement',
  component: CfChatSimHost,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '`<cf-chat-sim>` — the public custom element (api-contract.md), pre-rendered timeline ' +
          'playback via `data-step` scrubbing. Byte-for-byte DOM parity with `<ChatSim mode="demo">` ' +
          'is enforced by `react/__tests__/snapshot-cross-check.test.tsx`; this story is what gives ' +
          'that same contract Chromatic visual-regression coverage.',
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
type Story = StoryObj<typeof CfChatSimHost>;

export const WhatsApp: Story = {
  args: {
    script: RESERVA_SCRIPT,
    channel: 'whatsapp',
    seed: 7,
    t0: 1789761600000,
    contactName: 'Fovente — Reservas',
    contactStatus: 'en línea',
  },
};

/** Telegram: `own-row` reactions, single-tick receipt glyph, `views` counter — the four
 * structurally-flipped axes from WhatsApp (adapters/telegram.ts vs adapters/whatsapp.ts), same as
 * ChatSimChannels.stories.tsx's `TelegramLive`. */
export const Telegram: Story = {
  args: {
    script: TELEGRAM_SCRIPT,
    channel: 'telegram',
    seed: 3,
    contactName: 'Fovente — Canal',
  },
};

/** `chrome="consistent"` (T-017 Alcance B): the composer's own icon order stays fixed regardless
 * of channel, instead of mirroring per-channel fidelity — the axis only `<cf-chat-sim>` exposes
 * (React's `<ChatSim>` doesn't take a `chrome` prop). */
export const ConsistentChrome: Story = {
  args: {
    script: RESERVA_SCRIPT,
    channel: 'telegram',
    seed: 7,
    t0: 1789761600000,
    chrome: 'consistent',
    contactName: 'Fovente — Reservas',
    contactStatus: 'en línea',
  },
};
