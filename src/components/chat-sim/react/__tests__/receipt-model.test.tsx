// T-015 acceptance #2/#3 — the two orthogonality twins (rendered, not just type-checked) plus the
// generality twin (a shape no shipped adapter exercises yet must still work). Acceptance #1
// (tsc/madge) and #4 (element<->react cross-check) are proven by `npx tsc --noEmit`, `npx madge
// --circular`, and the existing snapshot-cross-check.test.tsx respectively — this file is the one
// that actually renders receipts and reads glyph/color back out of the DOM.

import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import { compile } from '../../core/compile';
import { getAdapter } from '../../adapters/registry';
import type { ChannelAdapter, ChannelId, SimScript } from '../../core/types';
import { dateSeparators, draftIntervals, fullSequence, postedAtByMsgId, stateAtStep } from '../engine';
import { MessageThread } from '../MessageThread';

const T0 = 1767261600000; // same literal snapshot-cross-check.test.tsx uses
const LOCALE = 'es-PE';
const TZ = 'America/Lima';
const SEED = 7;

function renderAt(channel: ChannelId, script: SimScript, step: number, adapter?: ChannelAdapter): HTMLElement {
  const timeline = compile(script, { seed: SEED, channel, locale: LOCALE, tz: TZ, t0: T0 });
  const postedAt = postedAtByMsgId(timeline.frames);
  const finalState = stateAtStep(timeline, timeline.frames.length);
  const seps = dateSeparators(finalState.order, postedAt, T0, LOCALE, TZ);
  const seq = fullSequence(finalState.order, seps, draftIntervals(timeline));
  const stepState = stateAtStep(timeline, step);
  const visibleIds = new Set(stepState.order.filter((id) => stepState.msgs.get(id)?.deleted === null));

  const { container } = render(
    <MessageThread
      finalOrder={finalState.order}
      seq={seq}
      visibleIds={visibleIds}
      step={step}
      msgs={finalState.msgs}
      postedAt={postedAt}
      adapter={adapter ?? getAdapter(channel)}
      locale={LOCALE}
      tz={TZ}
      t0={T0}
      editedLabel="Editado"
      contactName="Chat"
      contactStatus=""
    />,
  );
  return container;
}

afterEach(() => cleanup());

// `msgs` is always `finalState.msgs` (T-007's own contract, api-contract.md's `<ChatSim>` §; see
// ChatSim.tsx:129) — `step`/`visibleIds` gate a message's EXISTENCE, never a mid-flight replay of
// its mutable fields. So two receipt states are compared via two DIFFERENT scripts (each fully
// revealed, `step === frames.length`), never via two steps of the SAME script.
function full(script: SimScript): number {
  return script.length;
}

describe('T-015 acceptance #2 — receipt orthogonality, rendered', () => {
  it('Telegram: sent vs read differ in GLYPH (1 vs 2 ticks), same COLOR', () => {
    const sentScript: SimScript = [{ k: 'post', by: 'out:ai', text: 'hola' }, { k: 'receipt', id: 'm0', to: 'sent' }];
    const readScript: SimScript = [
      { k: 'post', by: 'out:ai', text: 'hola' },
      { k: 'receipt', id: 'm0', to: 'sent' },
      { k: 'receipt', id: 'm0', to: 'read' },
    ];
    const sentSvg = renderAt('telegram', sentScript, full(sentScript)).querySelector<SVGSVGElement>('svg.cf-receipt')!;
    const readSvg = renderAt('telegram', readScript, full(readScript)).querySelector<SVGSVGElement>('svg.cf-receipt')!;

    expect(sentSvg.querySelectorAll('path')).toHaveLength(1); // single tick
    expect(readSvg.querySelectorAll('path')).toHaveLength(2); // double tick — glyph flipped
    expect(sentSvg.style.color).toBe(readSvg.style.color); // color did NOT flip
  });

  it('WhatsApp: delivered vs read same GLYPH (both 2 ticks), different COLOR', () => {
    const deliveredScript: SimScript = [
      { k: 'post', by: 'out:ai', text: 'hola' },
      { k: 'receipt', id: 'm0', to: 'delivered' },
    ];
    const readScript: SimScript = [
      { k: 'post', by: 'out:ai', text: 'hola' },
      { k: 'receipt', id: 'm0', to: 'delivered' },
      { k: 'receipt', id: 'm0', to: 'read' },
    ];
    const deliveredSvg = renderAt('whatsapp', deliveredScript, full(deliveredScript)).querySelector<SVGSVGElement>(
      'svg.cf-receipt',
    )!;
    const readSvg = renderAt('whatsapp', readScript, full(readScript)).querySelector<SVGSVGElement>('svg.cf-receipt')!;

    expect(deliveredSvg.querySelectorAll('path')).toHaveLength(2);
    expect(readSvg.querySelectorAll('path')).toHaveLength(2); // glyph did NOT flip
    expect(deliveredSvg.style.color).not.toBe(readSvg.style.color); // color flipped
  });

  it('positive twin — the comparator actually discriminates (WhatsApp queued vs read: both glyph AND color differ)', () => {
    // queued's glyph is the clock '🕐' — zero '✓', so it falls through to the plain-text span
    // path (buildReceiptGlyph's own fallback), not the tick SVG — an even stronger glyph
    // difference than tick-count, plus the color still flips.
    const queuedScript: SimScript = [{ k: 'post', by: 'out:ai', text: 'hola' }];
    const readScript: SimScript = [
      { k: 'post', by: 'out:ai', text: 'hola' },
      { k: 'receipt', id: 'm0', to: 'read' },
    ];
    const queuedEl = renderAt('whatsapp', queuedScript, full(queuedScript)).querySelector<HTMLElement>('.cf-receipt')!;
    const readEl = renderAt('whatsapp', readScript, full(readScript)).querySelector<SVGSVGElement>('.cf-receipt')!;
    expect(queuedEl.tagName.toLowerCase()).toBe('span');
    expect(readEl.tagName.toLowerCase()).toBe('svg');
    expect(queuedEl.style.color).not.toBe(readEl.style.color);
  });
});

describe('T-015 acceptance #3 — a shape no shipped adapter uses yet still renders correctly', () => {
  // Telegram's own adapter (tail:'last') as the base — only `receipt` is overridden, so grouping/
  // tail behavior (what "last-only" reads) is real production behavior, not invented for the test.
  const belowLastOnlyAdapter: ChannelAdapter = {
    ...getAdapter('telegram'),
    receipt: {
      kind: 'text',
      states: {
        queued: { glyph: 'Enviando', color: '#8c8c8c' },
        sent: { glyph: 'Enviado', color: '#8c8c8c' },
        delivered: { glyph: 'Entregado', color: '#8c8c8c' },
        read: { glyph: 'Leído 09:00', color: '#3478f6' },
        failed: { glyph: 'Fallido', color: '#e53935' },
      },
      placement: 'below-bubble',
      scope: 'last-only',
    },
  };

  it('renders below the bubble (sibling, not nested inside .cf-bubble) and only on the last message of the streak', () => {
    const script: SimScript = [
      { k: 'post', by: 'out:ai', text: 'first' }, // m0
      { k: 'post', by: 'out:ai', text: 'second' }, // m1 — same actor streak, tail:'last' -> m1 is the tail
      { k: 'receipt', id: 'm0', to: 'read' },
      { k: 'receipt', id: 'm1', to: 'read' },
    ];
    const container = renderAt('telegram', script, script.length, belowLastOnlyAdapter);
    const bubbles = container.querySelectorAll('li.cf-msg');
    expect(bubbles).toHaveLength(2);

    const [first, second] = Array.from(bubbles);
    expect(second.hasAttribute('data-tail')).toBe(true); // sanity: confirms which one is "last"
    expect(first.hasAttribute('data-tail')).toBe(false);

    // last-only: only the tail message carries a receipt at all.
    expect(first.querySelector('.cf-receipt-label')).toBeNull();
    const receiptLabel = second.querySelector('.cf-receipt-label');
    expect(receiptLabel).not.toBeNull();
    expect(receiptLabel!.textContent).toBe('Leído 09:00');

    // below-bubble: the receipt is OUTSIDE .cf-bubble (a sibling within the <li>), never nested
    // inside it (in-bubble placement would put it inside .cf-stamp, itself inside .cf-bubble).
    const bubbleEl = second.querySelector(':scope > .cf-bubble')!;
    expect(bubbleEl.querySelector('.cf-receipt-label')).toBeNull();
    expect(second.querySelector(':scope > .cf-receipt-below .cf-receipt-label')).toBe(receiptLabel);
  });
});
