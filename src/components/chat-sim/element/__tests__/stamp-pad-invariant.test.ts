// element/__tests__/stamp-pad-invariant.test.ts — T-024 §F (#18), the `<cf-chat-sim>` twin of
// react/__tests__/stamp-pad-invariant.test.tsx. `--cf-cs-pad = stamp.offsetWidth + 10`
// (chat-sim-element.ts's `#measurePad()`) lived ONLY in a comment before this — nothing pinned
// the calculated value, so changing the constant (or how often it's re-measured) could silently
// invalidate capture's byte-identical PNG guarantee (T-024's own success criterion #1) with
// nothing going red.
//
// jsdom never lays out real content, so `.cf-stamp`'s `offsetWidth` is stubbed to a known fixture
// value rather than measured — the two fixtures (41 and 68) are arbitrary, chosen only to differ,
// so the twin proves the formula reads the LIVE value on every step, not a stale or hardcoded one.

import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import '../chat-sim-element';

const SCRIPT = JSON.stringify([{ k: 'post', by: 'out:ai', text: 'listo' }]);

function mount(): HTMLElement {
  const el = document.createElement('cf-chat-sim');
  el.setAttribute('channel', 'whatsapp'); // timestamp:'inside-pad' — the only placement `--cf-cs-pad` matters for
  el.setAttribute('seed', '7');
  el.setAttribute('t0', '1767261600000');
  const scriptTag = document.createElement('script');
  scriptTag.type = 'application/json';
  scriptTag.textContent = SCRIPT;
  el.appendChild(scriptTag);
  document.body.appendChild(el);
  return el;
}

/** Stubs EVERY element's `offsetWidth` (jsdom has no layout engine, so it's always 0 otherwise) —
 * scoped to one mount via try/finally so it can't leak into a sibling test. */
function withStampWidth<T>(px: number, fn: () => T): T {
  const original = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetWidth');
  Object.defineProperty(HTMLElement.prototype, 'offsetWidth', { configurable: true, get: () => px });
  try {
    return fn();
  } finally {
    if (original) Object.defineProperty(HTMLElement.prototype, 'offsetWidth', original);
  }
}

beforeEach(() => {
  document.body.innerHTML = '';
});
afterEach(() => {
  document.body.innerHTML = '';
});

describe('T-024 §F (#18) — `<cf-chat-sim>`\'s `--cf-cs-pad` invariant is pinned, not just commented', () => {
  it('equals the stamp\'s measured offsetWidth + 10, for a known fixture (41px)', () => {
    const el = withStampWidth(41, mount);
    const bubble = el.querySelector<HTMLElement>('.cf-bubble')!;
    expect(bubble.style.getPropertyValue('--cf-cs-pad')).toBe('51px');
  });

  it('twin — a different `.cf-stamp` width (68px) changes the pinned value, proving this reads the LIVE measurement, not a hardcoded constant', () => {
    const el = withStampWidth(68, mount);
    const bubble = el.querySelector<HTMLElement>('.cf-bubble')!;
    expect(bubble.style.getPropertyValue('--cf-cs-pad')).toBe('78px');
  });
});
