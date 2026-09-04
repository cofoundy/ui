// T-002 acceptance #6 (B-5) — the primary hardcode detector for the whole chat-sim cycle
// (T-005 #4 downgrades its own grep to secondary specifically because of this test).
//
// Renders the same three messages through `render.ts` with two adapters that differ ONLY on
// tail/receiptGlyph/timestamp/reactions (fixtures.ts) and asserts the DOM changes on exactly
// those four axes. A layout that draws the double-tick / first-of-streak-tail with no branch on
// the adapter passes any `grep channel ===` clean AND renders identically here — that's the
// failure this test exists to catch. Positive twin: re-render with the WhatsApp adapter and the
// DOM must match the reference render again (round-trip, not just "different").

import { describe, expect, it } from 'vitest';
import type { RenderMessage } from './render';
import { buildMessageElement, computeGroupFlags, populateMessageElement } from './render';
import { CAPS_FIXTURE_INVERTED_ADAPTER, WHATSAPP_REFERENCE_ADAPTER } from './fixtures';

const SCRIPT: readonly RenderMessage[] = [
  { id: 'm0', by: 'in', text: 'Hola, ¿tienen mesa para el sábado?', atLabel: '09:14', receipt: 'read', views: 0, reactions: [] },
  { id: 'm1', by: 'out:ai', text: 'Sí, ¿para cuántas personas?', atLabel: '09:14', receipt: 'read', views: 0, reactions: [] },
  { id: 'm2', by: 'out:ai', text: 'Y a qué hora les queda bien', atLabel: '09:15', receipt: 'delivered', views: 0, reactions: [{ emoji: '👍', by: 'in' }] },
];

function renderAll(msgs: readonly RenderMessage[], adapter: typeof WHATSAPP_REFERENCE_ADAPTER): HTMLLIElement[] {
  const flags = computeGroupFlags(msgs, adapter.tail);
  return msgs.map((m) => buildMessageElement(m, adapter, flags.get(m.id)!));
}

describe('render.ts — caps fixture (T-002 #6 / B-5)', () => {
  it('changes tail placement when adapter.tail flips', () => {
    const wa = renderAll(SCRIPT, WHATSAPP_REFERENCE_ADAPTER);
    const flipped = renderAll(SCRIPT, CAPS_FIXTURE_INVERTED_ADAPTER);
    // out:ai streak is [m1, m2] — WhatsApp tails the first, the fixture tails the last.
    expect(wa[1].hasAttribute('data-tail')).toBe(true);
    expect(wa[2].hasAttribute('data-tail')).toBe(false);
    expect(flipped[1].hasAttribute('data-tail')).toBe(false);
    expect(flipped[2].hasAttribute('data-tail')).toBe(true);
  });

  it('changes the receipt glyph structurally when adapter.receiptGlyph flips', () => {
    const wa = renderAll(SCRIPT, WHATSAPP_REFERENCE_ADAPTER);
    const flipped = renderAll(SCRIPT, CAPS_FIXTURE_INVERTED_ADAPTER);
    expect(wa[1].querySelectorAll('.cf-receipt path')).toHaveLength(2); // double-tick
    expect(flipped[1].querySelectorAll('.cf-receipt path')).toHaveLength(1); // single-tick
  });

  it('changes where the timestamp sits in the DOM when adapter.timestamp flips', () => {
    const wa = renderAll(SCRIPT, WHATSAPP_REFERENCE_ADAPTER);
    const flipped = renderAll(SCRIPT, CAPS_FIXTURE_INVERTED_ADAPTER);
    // inside-pad reserves a .cf-pad sibling right before .cf-stamp; inside-plain does not.
    expect(wa[0].querySelector('.cf-bubble > .cf-pad')).not.toBeNull();
    expect(flipped[0].querySelector('.cf-bubble > .cf-pad')).toBeNull();
    expect(flipped[0].querySelector('.cf-bubble > .cf-stamp')).not.toBeNull();
  });

  it('changes reaction placement in the DOM tree when adapter.reactions flips', () => {
    const wa = renderAll(SCRIPT, WHATSAPP_REFERENCE_ADAPTER);
    const flipped = renderAll(SCRIPT, CAPS_FIXTURE_INVERTED_ADAPTER);
    // overlay-below: reactions live INSIDE .cf-bubble. own-row: reactions are a SIBLING of it.
    expect(wa[2].querySelector('.cf-bubble > .cf-reactions')).not.toBeNull();
    expect(flipped[2].querySelector('.cf-bubble > .cf-reactions')).toBeNull();
    expect(flipped[2].querySelector(':scope > .cf-reactions')).not.toBeNull();
  });

  it('positive twin: re-rendering with the WhatsApp adapter matches the reference render again', () => {
    const wa1 = renderAll(SCRIPT, WHATSAPP_REFERENCE_ADAPTER);
    const wa2 = renderAll(SCRIPT, { ...CAPS_FIXTURE_INVERTED_ADAPTER, ...WHATSAPP_REFERENCE_ADAPTER });
    wa1.forEach((li, i) => expect(li.outerHTML).toBe(wa2[i].outerHTML));
  });

  it('repopulating the SAME <li> (as element/ does on every step change) does not stack duplicate content', () => {
    const flags = computeGroupFlags(SCRIPT, WHATSAPP_REFERENCE_ADAPTER.tail);
    const li = buildMessageElement(SCRIPT[0], WHATSAPP_REFERENCE_ADAPTER, flags.get('m0')!);
    const onceHTML = li.outerHTML;
    // repopulate the SAME node many times, as playback does on every rAF tick (~60/s)
    for (let i = 0; i < 5; i++) populateMessageElement(li, SCRIPT[0], WHATSAPP_REFERENCE_ADAPTER, flags.get('m0')!);
    expect(li.outerHTML).toBe(onceHTML);
    expect(li.querySelectorAll('.cf-bubble')).toHaveLength(1);
  });

  it('a hardcoded (non-adapter-driven) render would NOT change — sanity on the test itself', () => {
    // Twin of the twin: prove the assertions above are not vacuously true by rendering the SAME
    // adapter object twice and confirming the DOM is identical (no hidden nondeterminism).
    const a = renderAll(SCRIPT, WHATSAPP_REFERENCE_ADAPTER);
    const b = renderAll(SCRIPT, WHATSAPP_REFERENCE_ADAPTER);
    a.forEach((li, i) => expect(li.outerHTML).toBe(b[i].outerHTML));
  });
});

describe('computeGroupFlags — groupKey is `by` verbatim (adapter-interface-draft.md)', () => {
  it('does not group across different actors even with no time gap', () => {
    const flags = computeGroupFlags(SCRIPT, 'first');
    expect(flags.get('m0')!.grouped).toBe(false); // 'in' — alone
    expect(flags.get('m1')!.grouped).toBe(false); // 'out:ai' streak start
    expect(flags.get('m2')!.grouped).toBe(true); // 'out:ai' streak continues
  });

  it('gives every message its own streak of one when actors alternate', () => {
    const alternating: RenderMessage[] = [
      { id: 'a', by: 'in', text: 'x', atLabel: '09:00', receipt: 'read', views: 0, reactions: [] },
      { id: 'b', by: 'out:ai', text: 'y', atLabel: '09:00', receipt: 'read', views: 0, reactions: [] },
      { id: 'c', by: 'in', text: 'z', atLabel: '09:00', receipt: 'read', views: 0, reactions: [] },
    ];
    const flags = computeGroupFlags(alternating, 'first');
    alternating.forEach((m) => {
      expect(flags.get(m.id)!.grouped).toBe(false);
      expect(flags.get(m.id)!.tailHere).toBe(true);
    });
  });
});
