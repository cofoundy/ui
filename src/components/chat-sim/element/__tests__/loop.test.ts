// T-027 B — `<cf-chat-sim loop>`. Production (ChatDemo.astro) encadena rubro tras rubro para
// siempre; ours plays a script once and stops. Looping the SAME script is `play()` called again
// on natural completion (see chat-sim-element.ts's own comment on `play()` for why a brand-new
// `createPlayhead()` per call makes that safe — no Playhead-reuse quirk to work around).
//
// Deterministic rAF/setTimeout stubs, same style as
// src/__tests__/chat-sim/playhead-live-cycle.test.ts (qa's own suite, out of this scope.write) —
// re-implemented locally here since element/__tests__/** is [skin]'s cell, not qa's.

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import '../chat-sim-element';

function stubRaf() {
  let pending: ((t: number) => void) | null = null;
  vi.stubGlobal('requestAnimationFrame', (cb: (t: number) => void) => {
    pending = cb;
    return 1;
  });
  vi.stubGlobal('cancelAnimationFrame', () => {
    pending = null;
  });
  return {
    flush(t: number): boolean {
      const cb = pending;
      pending = null;
      cb?.(t);
      return pending !== null;
    },
  };
}

const SHORT_SCRIPT = JSON.stringify([
  { k: 'post', by: 'in', text: 'uno', delayMs: 0 },
  { k: 'post', by: 'out:ai', text: 'dos', delayMs: 50 },
]);

function mount(attrs: Record<string, string> = {}): HTMLElement {
  const el = document.createElement('cf-chat-sim');
  el.setAttribute('channel', 'whatsapp');
  el.setAttribute('seed', '3');
  el.setAttribute('t0', '0');
  el.setAttribute('data-step', '0');
  Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
  const scriptTag = document.createElement('script');
  scriptTag.type = 'application/json';
  scriptTag.textContent = SHORT_SCRIPT;
  el.appendChild(scriptTag);
  document.body.appendChild(el);
  return el;
}

describe('<cf-chat-sim loop> (T-027 B)', () => {
  let raf: ReturnType<typeof stubRaf>;

  beforeEach(() => {
    // Order matters: vitest's fake timers fake `requestAnimationFrame` too by default — stubbing
    // it AFTER `useFakeTimers()` makes this manual, deterministic stub win instead.
    vi.useFakeTimers();
    raf = stubRaf();
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    document.body.innerHTML = '';
  });

  it('without `loop`, playback stops at the end and does not restart', () => {
    const el = mount();
    (el as unknown as { play(): void }).play();
    raf.flush(0); // establishes lastWall
    raf.flush(10_000); // overshoots past tl.duration — completes
    expect(el.dataset.step).toBe('2');
    vi.advanceTimersByTime(60_000);
    expect(el.dataset.step).toBe('2'); // still — nothing scheduled a restart
  });

  it('with `loop`, playback restarts from step 0 after `loop-pause-ms`, without recreating any node', () => {
    const el = mount({ loop: '', 'loop-pause-ms': '1000' });
    const msgEls = [...el.querySelectorAll('.cf-msg')];
    const identityBefore = msgEls; // same node REFERENCES, checked below

    (el as unknown as { play(): void }).play();
    raf.flush(0);
    raf.flush(10_000); // completes the FIRST pass
    expect(el.dataset.step).toBe('2');

    vi.advanceTimersByTime(999);
    expect(el.dataset.step).toBe('2'); // pause hasn't elapsed yet

    vi.advanceTimersByTime(1); // exactly loop-pause-ms — restart fires (a fresh play())
    raf.flush(0); // the NEW playhead's first tick (establishes its own lastWall)
    expect(el.dataset.step).toBe('0'); // back to the start — the acceptance's "reinicia"

    // The gemelo (acceptance #2): count nodes between two loops. Same <li> objects, not rebuilt —
    // this is exactly the T-017 typing-animation regression class (repopulating instead of
    // recreating is what keeps a CSS animation looping instead of restarting).
    const msgElsAfter = [...el.querySelectorAll('.cf-msg')];
    expect(msgElsAfter).toHaveLength(identityBefore.length);
    msgElsAfter.forEach((li, i) => expect(li).toBe(identityBefore[i]));
  });

  it('a manual play() call while a loop-restart is pending cancels the stale timer (no double-play)', () => {
    const el = mount({ loop: '', 'loop-pause-ms': '500' });
    (el as unknown as { play(): void }).play();
    raf.flush(0);
    raf.flush(10_000);
    expect(el.dataset.step).toBe('2');

    (el as unknown as { play(): void }).play(); // consumer-driven replay, BEFORE the pause elapses
    raf.flush(0); // the new playhead's first tick
    expect(el.dataset.step).not.toBe('2'); // playback actually restarted

    // If the stale loop timer had survived (play() failing to clear it), this would trigger a
    // SECOND, unwanted play() — a brand-new playhead — once the OLD loop-pause-ms elapsed.
    const stepAfterManualReplay = el.dataset.step;
    vi.advanceTimersByTime(500);
    expect(el.dataset.step).toBe(stepAfterManualReplay);
  });

  it('unmounting clears a pending loop timer (no restart after disconnect)', () => {
    const el = mount({ loop: '', 'loop-pause-ms': '200' });
    (el as unknown as { play(): void }).play();
    raf.flush(0);
    raf.flush(10_000);
    el.remove();
    expect(() => vi.advanceTimersByTime(10_000)).not.toThrow();
  });
});
