// T-027 — `reply-in` and `link` bubbles. Found beyond the A-E list while running the live
// preview (team-lead: "reply-in estaba en mi lista original y lo perdí al escribir el
// acceptance"). Both are ADDITIVE flags on an ORDINARY directional bubble (unlike `service`/
// `card`, which replace it) — `media.replyFast` / `media.link`, read via `asReplyFast`/
// `asLinkBubble` (render.ts), independent of `media.kind`.
//
// The text discipline (team-lead): "el label es genérico, el texto no" — `replyLabel` must come
// from the caller (chat-sim-element.ts's `reply-label` attribute), never a literal in render.ts.
// These tests assert render.ts only ever echoes `msg.replyLabel` verbatim — it never invents text.

import { describe, expect, it } from 'vitest';
import type { RenderMessage } from '../render';
import { asLinkBubble, asReplyFast, buildMessageElement, computeGroupFlags } from '../render';
import { whatsapp } from '../../adapters/whatsapp';
import { telegram } from '../../adapters/telegram';

function render(msg: RenderMessage, adapter: typeof whatsapp): HTMLLIElement {
  const flags = computeGroupFlags([msg], adapter.tail);
  return buildMessageElement(msg, adapter, flags.get(msg.id)!);
}

const BASE = { id: 'm0', by: 'in', atLabel: '09:14', receipt: 'read', views: 0, reactions: [] } as const;

describe('asReplyFast / asLinkBubble — additive flags, independent of media.kind', () => {
  it('read specific keys directly, not a discriminant — both can coexist on one media object', () => {
    expect(asReplyFast({ replyFast: true })).toBe(true);
    expect(asLinkBubble({ link: true })).toBe(true);
    expect(asReplyFast({ replyFast: true, link: true })).toBe(true);
    expect(asLinkBubble({ replyFast: true, link: true })).toBe(true);
  });

  it('default to false for undefined, non-record, or absent keys', () => {
    expect(asReplyFast(undefined)).toBe(false);
    expect(asReplyFast('reply')).toBe(false);
    expect(asReplyFast({})).toBe(false);
    expect(asLinkBubble({ kind: 'service', variant: 'neutral' })).toBe(false);
  });

});

describe('reply-in label — same slot/pattern as editedLabel', () => {
  it("with replyLabel set, renders a .cf-reply-in inside the stamp, textContent EXACTLY what the caller passed", () => {
    const msg: RenderMessage = { ...BASE, text: 'Ya llegó', media: { replyFast: true }, replyLabel: 'Respondió en 4 s' };
    const li = render(msg, whatsapp);
    const reply = li.querySelector('.cf-reply-in');
    expect(reply?.textContent).toBe('Respondió en 4 s');
    // render.ts never invents this text — a different caller-supplied string round-trips verbatim.
    const msg2: RenderMessage = { ...msg, replyLabel: 'Some totally different caller string' };
    const li2 = render(msg2, whatsapp);
    expect(li2.querySelector('.cf-reply-in')?.textContent).toBe('Some totally different caller string');
  });

  it('without replyLabel, no .cf-reply-in element exists at all', () => {
    const msg: RenderMessage = { ...BASE, text: 'hola', media: { replyFast: true } }; // no replyLabel — element/'s job to have set it
    const li = render(msg, whatsapp);
    expect(li.querySelector('.cf-reply-in')).toBeNull();
  });

  it('renders in both channels — same structure, no channel branch', () => {
    const msg: RenderMessage = { ...BASE, text: 'hola', media: { replyFast: true }, replyLabel: 'Respondió en 4 s' };
    const wa = render(msg, whatsapp);
    const tg = render(msg, telegram);
    expect(wa.querySelector('.cf-reply-in')?.textContent).toBe(tg.querySelector('.cf-reply-in')?.textContent);
  });

  it('does not appear on a service/card message even if media also sets replyFast (short-circuited before the stamp is ever built)', () => {
    const msg: RenderMessage = {
      ...BASE,
      text: 'FOVENTE SE DETUVO',
      media: { kind: 'service', variant: 'warn', replyFast: true },
      replyLabel: 'Respondió en 4 s',
    };
    const li = render(msg, whatsapp);
    expect(li.className).toContain('cf-msg-service');
    expect(li.querySelector('.cf-reply-in')).toBeNull();
    expect(li.querySelector('.cf-stamp')).toBeNull();
  });
});

describe('link bubble — presentation flag only, text stays authored content', () => {
  it('media.link adds cf-bubble-link; the bubble text is still msg.text verbatim', () => {
    const msg: RenderMessage = { ...BASE, by: 'out:ai', text: 'Pagar aquí: bit.ly/xyz', media: { link: true } };
    const li = render(msg, whatsapp);
    const bubble = li.querySelector('.cf-bubble');
    expect(bubble?.classList.contains('cf-bubble-link')).toBe(true);
    expect(li.querySelector('.cf-text')?.textContent).toBe('Pagar aquí: bit.ly/xyz');
  });

  it('without media.link, the bubble never gets the class', () => {
    const msg: RenderMessage = { ...BASE, by: 'out:ai', text: 'texto normal' };
    const li = render(msg, whatsapp);
    expect(li.querySelector('.cf-bubble')?.classList.contains('cf-bubble-link')).toBe(false);
  });

  it('reply-in and link coexist on the same message without interfering with each other', () => {
    const msg: RenderMessage = {
      ...BASE,
      by: 'out:ai',
      text: 'Pagar aquí: bit.ly/xyz',
      media: { link: true, replyFast: true },
      replyLabel: 'Respondió en 4 s',
    };
    const li = render(msg, whatsapp);
    expect(li.querySelector('.cf-bubble')?.classList.contains('cf-bubble-link')).toBe(true);
    expect(li.querySelector('.cf-reply-in')?.textContent).toBe('Respondió en 4 s');
    expect(li.querySelector('.cf-text')?.textContent).toBe('Pagar aquí: bit.ly/xyz');
  });
});
