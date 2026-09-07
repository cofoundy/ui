// T-027 C — `service` messages. Rides the ordinary `post` event's `media: Json` field (already
// carried by fold.ts/core/types.ts — zero core changes), read here via `asServiceMedia`
// (render.ts).
//
// `card` (title+bullets+action) shipped alongside this in the same task and was REMOVED
// (team-lead): the rationalization that WhatsApp's contact/location cards made a free
// title+bullets container "the same family" was wrong — those are FIXED structures. This file
// used to be service-card.test.ts; renamed on the removal, and one regression test below asserts
// `card`-shaped media no longer gets special treatment at all — it's just an ordinary Json blob a
// normal bubble ignores.

import { describe, expect, it } from 'vitest';
import type { RenderMessage } from '../render';
import { asServiceMedia, buildMessageElement, computeGroupFlags, populateMessageElement } from '../render';
import { whatsapp } from '../../adapters/whatsapp';
import { telegram } from '../../adapters/telegram';

function render(msg: RenderMessage, adapter: typeof whatsapp): HTMLLIElement {
  const flags = computeGroupFlags([msg], adapter.tail);
  return buildMessageElement(msg, adapter, flags.get(msg.id)!);
}

const BASE = { id: 'm0', by: 'system', atLabel: '09:14', receipt: 'read', views: 0, reactions: [] } as const;

describe('asServiceMedia — narrow, defensive read of an opaque Json', () => {
  it('rejects anything without kind, or the wrong kind', () => {
    expect(asServiceMedia(undefined)).toBeNull();
    expect(asServiceMedia({ kind: 'card', bullets: [] })).toBeNull();
    expect(asServiceMedia('service')).toBeNull(); // not a record
  });

  it('defaults an unrecognized/missing variant to neutral — cero opcionales at the boundary', () => {
    expect(asServiceMedia({ kind: 'service' })?.variant).toBe('neutral');
    expect(asServiceMedia({ kind: 'service', variant: 'loud' })?.variant).toBe('neutral');
    expect(asServiceMedia({ kind: 'service', variant: 'warn' })?.variant).toBe('warn');
    expect(asServiceMedia({ kind: 'service', variant: 'success' })?.variant).toBe('success');
  });
});

describe('service message rendering', () => {
  it('renders a centered pill, not a directional bubble', () => {
    const msg: RenderMessage = { ...BASE, text: 'FOVENTE SE DETUVO · PAGO DECLARADO', media: { kind: 'service', variant: 'warn' } };
    const li = render(msg, whatsapp);
    expect(li.className).toContain('cf-msg-service');
    expect(li.hasAttribute('data-dir')).toBe(false);
    expect(li.dataset.variant).toBe('warn');
    expect(li.querySelector('.cf-bubble')).toBeNull();
    const pill = li.querySelector('.cf-service-pill');
    expect(pill?.textContent).toBe('FOVENTE SE DETUVO · PAGO DECLARADO');
  });

  it('renders in both channels — same structure, no channel branch in the code path', () => {
    const msg: RenderMessage = { ...BASE, text: 'Cierre exitoso', media: { kind: 'service', variant: 'success' } };
    const wa = render(msg, whatsapp);
    const tg = render(msg, telegram);
    expect(wa.querySelector('.cf-service-pill')?.textContent).toBe(tg.querySelector('.cf-service-pill')?.textContent);
    expect(wa.dataset.variant).toBe(tg.dataset.variant);
  });

  it("repopulating the SAME <li> (element/'s reconcile contract) does not stack duplicate pills", () => {
    const msg: RenderMessage = { ...BASE, text: 'hola', media: { kind: 'service', variant: 'neutral' } };
    const flags = computeGroupFlags([msg], whatsapp.tail);
    const li = buildMessageElement(msg, whatsapp, flags.get(msg.id)!);
    for (let i = 0; i < 5; i++) populateMessageElement(li, msg, whatsapp, flags.get(msg.id)!);
    expect(li.querySelectorAll('.cf-service-pill')).toHaveLength(1);
  });
});

describe('card — removed (team-lead: wrong rationalization); regression coverage that it stays gone', () => {
  it("a `card`-shaped media no longer gets special treatment — it's an ordinary bubble now", () => {
    const msg: RenderMessage = {
      ...BASE,
      by: 'out:ai',
      text: '*Para 40 tenemos dos opciones*\n• Clásico — S/. 32 c/u\n• Premium — S/. 48 c/u',
      media: { kind: 'card', bullets: ['Clásico', 'Premium'], action: 'Confirmar' },
    };
    const li = render(msg, whatsapp);
    expect(li.className).not.toContain('cf-msg-card');
    expect(li.querySelector('.cf-bubble')).not.toBeNull();
    expect(li.querySelector('.cf-card-title')).toBeNull();
    expect(li.querySelector('.cf-card-bullet')).toBeNull();
    // The markdown-styled brief IS the plain text — pre-line whitespace (styles.css) renders the
    // bold/bullet characters exactly as authored, no dedicated component required.
    expect(li.querySelector('.cf-text')?.textContent).toBe(msg.text);
  });
});
