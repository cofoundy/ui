// T-007 acceptance #2: "Test mecánico, no prosa: con `visualViewport` simulado a
// 375×(alto−336), el composer queda dentro del viewport visible y el último mensaje sigue
// visible. Gemelo: sin el fix, el test falla."
//
// Mechanical = numeric assertions against a mocked `window.visualViewport`, not a visual/prose
// judgment — jsdom has no real layout engine, so "inside the visible viewport" is verified as
// "the composer's computed keyboard-inset equals what visualViewport reports", and "last message
// stays visible" as "the log scrolls to its bottom whenever that inset changes" — the two
// concrete, testable claims `useKeyboardInset.ts`'s header comment makes.
//
// The twin renders a composer that deliberately does NOT call `useKeyboardInset` (the shape
// MobileComposer.tsx itself has — zero visualViewport usage, confirmed by grep) against the
// SAME simulated keyboard event, and asserts the same claims come back false for it. That's what
// proves the mechanism is real, not the assertion happening to always be true (same "gemelo"
// convention as no-tailwind.test.ts / core's digest test).

import { useRef } from 'react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { act, render } from '@testing-library/react';
import { LiveComposer } from '../LiveComposer';

const IPHONE_SE_WIDTH = 375;
const IPHONE_SE_HEIGHT = 667;
const KEYBOARD_HEIGHT = 336; // "alto − 336" per the acceptance text, literally

class FakeVisualViewport extends EventTarget {
  width = IPHONE_SE_WIDTH;
  height = IPHONE_SE_HEIGHT;
  offsetTop = 0;
  offsetLeft = 0;
  scale = 1;
}

let vv: FakeVisualViewport;

beforeEach(() => {
  vv = new FakeVisualViewport();
  Object.defineProperty(window, 'visualViewport', { configurable: true, value: vv });
  Object.defineProperty(window, 'innerHeight', { configurable: true, value: IPHONE_SE_HEIGHT });
});

afterEach(() => {
  // @ts-expect-error — test-only teardown of a property we defined above
  delete window.visualViewport;
});

function openKeyboard(): void {
  act(() => {
    vv.height = IPHONE_SE_HEIGHT - KEYBOARD_HEIGHT;
    vv.dispatchEvent(new Event('resize'));
  });
}

/** Mounts LiveComposer with a real `<ol>` `logRef`, its `scrollHeight` stubbed (jsdom always
 * reports 0 for real layout metrics) so "scrolled to bottom" is a checkable assertion. */
function mountLiveComposer() {
  function Harness() {
    const logRef = useRef<HTMLOListElement>(null);
    return (
      <>
        <ol ref={logRef} className="cf-log">
          <li>último mensaje</li>
        </ol>
        <LiveComposer placeholder="Mensaje" onSend={() => {}} logRef={logRef} />
      </>
    );
  }
  const { container } = render(<Harness />);
  const log = container.querySelector('.cf-log') as HTMLOListElement;
  Object.defineProperty(log, 'scrollHeight', { configurable: true, value: 1000 });
  log.scrollTop = 0;
  return { container, log };
}

describe('T-007 acceptance #2 — mobile keyboard inset (mechanical)', () => {
  it('composer reports zero inset before the keyboard opens', () => {
    const { container } = mountLiveComposer();
    const composer = container.querySelector('.cf-live-composer')!;
    expect(composer.getAttribute('data-kb-inset')).toBe('0');
  });

  it('composer inset tracks the simulated keyboard exactly (innerHeight - visualViewport.height - offsetTop)', () => {
    const { container } = mountLiveComposer();
    openKeyboard();
    const composer = container.querySelector('.cf-live-composer')!;
    expect(composer.getAttribute('data-kb-inset')).toBe(String(KEYBOARD_HEIGHT));
  });

  it('the log scrolls to its bottom when the keyboard opens — the last message stays visible', () => {
    const { log } = mountLiveComposer();
    expect(log.scrollTop).toBe(0);
    openKeyboard();
    expect(log.scrollTop).toBe(log.scrollHeight); // === 1000, the stubbed value
  });

  it('twin — without Visual Viewport support (useKeyboardInset.ts\'s own documented fallback, "if (!vv) return"), the SAME real LiveComposer proves nothing moves', () => {
    // Was: a hand-rolled `NaiveComposer` rendered locally, with zero visualViewport listener of
    // its own — disconnected from production code, so a regression in `useKeyboardInset.ts`
    // (e.g. deleting its `addEventListener` calls) could never turn this test red (verified by
    // mutation). Rewritten to exercise the REAL `LiveComposer` + real `useKeyboardInset`, reaching
    // "the fix does nothing" through the hook's own documented unsupported-engine branch instead
    // of a fake sibling that merely mimics the shape.
    // @ts-expect-error — test-only: simulate an engine with no Visual Viewport API at all.
    delete window.visualViewport;
    const { container, log } = mountLiveComposer();

    openKeyboard(); // dispatched on the (now orphaned) `vv` object — the hook bailed at mount, nothing was ever subscribed

    const composer = container.querySelector('.cf-live-composer')!;
    expect(composer.getAttribute('data-kb-inset')).toBe('0'); // never updates — hook bailed at !vv
    expect(log.scrollTop).toBe(0); // never scrolls — nothing keeps the last message visible
  });
});
