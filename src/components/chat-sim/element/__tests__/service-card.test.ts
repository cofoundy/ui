// T-027 C/D — `service`/`card` messages. Both ride the ordinary `post` event's `media: Json`
// field (already carried by fold.ts/core/types.ts — zero core changes), read here via
// `asServiceMedia`/`asCardMedia` (render.ts). Structural-by-adapter (acceptance #3): the card's
// accent treatment keys off `adapter.quote`, the SAME field WhatsApp/Telegram already diverge on
// for quoted replies — never a `channel ===` branch, following render.test.ts's caps-fixture
// precedent (T-002 #6 / B-5).

import { describe, expect, it } from 'vitest';
import type { RenderMessage } from '../render';
import { asCardMedia, asServiceMedia, buildMessageElement, computeGroupFlags, populateMessageElement } from '../render';
import { whatsapp } from '../../adapters/whatsapp';
import { telegram } from '../../adapters/telegram';

function render(msg: RenderMessage, adapter: typeof whatsapp): HTMLLIElement {
  const flags = computeGroupFlags([msg], adapter.tail);
  return buildMessageElement(msg, adapter, flags.get(msg.id)!);
}

const BASE = { id: 'm0', by: 'system', atLabel: '09:14', receipt: 'read', views: 0, reactions: [] } as const;

describe('asServiceMedia / asCardMedia — narrow, defensive reads of an opaque Json', () => {
  it('rejects anything without kind, or the wrong kind', () => {
    expect(asServiceMedia(undefined)).toBeNull();
    expect(asServiceMedia({ kind: 'card', bullets: [] })).toBeNull();
    expect(asServiceMedia('service')).toBeNull(); // not a record
    expect(asCardMedia({ kind: 'service', variant: 'warn' })).toBeNull();
  });

  it('defaults an unrecognized/missing variant to neutral — cero opcionales at the boundary', () => {
    expect(asServiceMedia({ kind: 'service' })?.variant).toBe('neutral');
    expect(asServiceMedia({ kind: 'service', variant: 'loud' })?.variant).toBe('neutral');
    expect(asServiceMedia({ kind: 'service', variant: 'warn' })?.variant).toBe('warn');
    expect(asServiceMedia({ kind: 'service', variant: 'success' })?.variant).toBe('success');
  });

  it('card: filters non-string bullets, keeps action optional', () => {
    const card = asCardMedia({ kind: 'card', bullets: ['ok', 5, 'also ok'], action: 'Confirmar' });
    expect(card?.bullets).toEqual(['ok', 'also ok']);
    expect(card?.action).toBe('Confirmar');
    expect(asCardMedia({ kind: 'card', bullets: [] })?.action).toBeUndefined();
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

describe('card message rendering', () => {
  const CARD_MSG: RenderMessage = {
    ...BASE,
    text: 'Para 40 tenemos dos opciones',
    media: { kind: 'card', bullets: ['Clásico — S/. 32 c/u', 'Premium — S/. 48 c/u'], action: 'Confirmar' },
  };

  it('renders title/bullets/action, full-width, not a directional bubble', () => {
    const li = render(CARD_MSG, whatsapp);
    expect(li.className).toContain('cf-msg-card');
    expect(li.hasAttribute('data-dir')).toBe(false);
    expect(li.querySelector('.cf-bubble')).toBeNull();
    expect(li.querySelector('.cf-card-title')?.textContent).toBe('Para 40 tenemos dos opciones');
    expect(li.querySelectorAll('.cf-card-bullet')).toHaveLength(2);
    expect(li.querySelector('.cf-card-action')?.textContent).toBe('Confirmar');
  });

  it('omits the action element entirely when the script author didn\'t provide one', () => {
    const noAction: RenderMessage = { ...BASE, text: 'Resumen', media: { kind: 'card', bullets: ['uno'] } };
    const li = render(noAction, whatsapp);
    expect(li.querySelector('.cf-card-action')).toBeNull();
  });

  it('twin (acceptance #3): the card structurally differs by adapter.quote — WhatsApp color-bar vs Telegram thin-bar', () => {
    const wa = render(CARD_MSG, whatsapp);
    const tg = render(CARD_MSG, telegram);
    expect(whatsapp.quote).toBe('color-bar');
    expect(telegram.quote).toBe('thin-bar');
    expect(wa.dataset.quoteStyle).toBe('color-bar');
    expect(tg.dataset.quoteStyle).toBe('thin-bar');
    expect(wa.dataset.quoteStyle).not.toBe(tg.dataset.quoteStyle);
  });
});
