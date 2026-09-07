// react/__tests__/stamp-pad-invariant.test.tsx — T-024 §F (#18): `--cf-cs-pad = stamp.offsetWidth
// + 10` (MessageThread.tsx's `useLayoutEffect`, mirrors element/chat-sim-element.ts's own
// `#measurePad()`, same formula, same comment) lived ONLY in a comment before this — nothing
// pinned the calculated value, so changing the constant, or changing WHAT gets re-measured (e.g.
// reading it once instead of per-render), could silently invalidate capture's byte-identical PNG
// guarantee (T-024's own success criterion #1) with nothing going red.
//
// jsdom never lays out real content, so `.cf-stamp`'s `offsetWidth` is stubbed to a known fixture
// value rather than measured — the two fixtures below (41 and 68) are arbitrary, chosen only to
// differ, so the twin can prove the formula reads the LIVE value on every render instead of a
// stale or hardcoded one.

import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import { compile } from '../../core/compile';
import { getAdapter } from '../../adapters/registry';
import type { SimScript } from '../../core/types';
import { dateSeparators, draftIntervals, fullSequence, postedAtByMsgId, stateAtStep } from '../engine';
import { MessageThread } from '../MessageThread';

const T0 = 1767261600000;
const LOCALE = 'es-PE';
const TZ = 'America/Lima';
const SEED = 7;
const SCRIPT: SimScript = [{ k: 'post', by: 'out:ai', text: 'listo' }];

function renderWhatsApp(): HTMLElement {
  const timeline = compile(SCRIPT, { seed: SEED, channel: 'whatsapp', locale: LOCALE, tz: TZ, t0: T0 });
  const postedAt = postedAtByMsgId(timeline.frames);
  const finalState = stateAtStep(timeline, timeline.frames.length);
  const seps = dateSeparators(finalState.order, postedAt, T0, LOCALE, TZ);
  const seq = fullSequence(finalState.order, seps, draftIntervals(timeline));
  const { container } = render(
    <MessageThread
      finalOrder={finalState.order}
      seq={seq}
      visibleIds={new Set(finalState.order)}
      step={timeline.frames.length}
      msgs={finalState.msgs}
      postedAt={postedAt}
      adapter={getAdapter('whatsapp')} // timestamp:'inside-pad' — the only placement `--cf-cs-pad` matters for
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

/** Stubs EVERY element's `offsetWidth` (jsdom has no layout engine, so it's always 0 otherwise) —
 * scoped to one render via try/finally so it can't leak into a sibling test. */
function withStampWidth<T>(px: number, fn: () => T): T {
  const original = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetWidth');
  Object.defineProperty(HTMLElement.prototype, 'offsetWidth', { configurable: true, get: () => px });
  try {
    return fn();
  } finally {
    if (original) Object.defineProperty(HTMLElement.prototype, 'offsetWidth', original);
  }
}

afterEach(() => cleanup());

describe('T-024 §F (#18) — `--cf-cs-pad` invariant is pinned, not just commented', () => {
  it('equals the stamp\'s measured offsetWidth + 10, for a known fixture (41px)', () => {
    const container = withStampWidth(41, renderWhatsApp);
    const bubble = container.querySelector<HTMLElement>('.cf-bubble')!;
    expect(bubble.style.getPropertyValue('--cf-cs-pad')).toBe('51px');
  });

  it('twin — a different `.cf-stamp` width (68px) changes the pinned value, proving this reads the LIVE measurement, not a hardcoded constant', () => {
    const container = withStampWidth(68, renderWhatsApp);
    const bubble = container.querySelector<HTMLElement>('.cf-bubble')!;
    expect(bubble.style.getPropertyValue('--cf-cs-pad')).toBe('78px');
  });
});
