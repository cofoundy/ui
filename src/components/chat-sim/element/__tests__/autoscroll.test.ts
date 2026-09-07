// T-027 A — auto-scroll. `core`'s `scrollId` (fold.ts: set on every `post`, types.ts:269) existed
// before this task and nothing consumed it (team-lead: "está el dato y falta el efecto").
// `#applyScroll` in chat-sim-element.ts is the first and only reader.
//
// jsdom never lays out real content, so `scrollHeight`/`clientHeight` are always 0 without a
// stub — same reasoning as element/__tests__/stamp-pad-invariant.test.ts's `offsetWidth` stub.
// Here `scrollHeight` is derived from the NUMBER OF VISIBLE `.cf-msg`/`.cf-typing-row` children,
// so it grows exactly when a real thread's would: on each `post` (and stays 0 before the first),
// giving genuine before/after scrollTop assertions instead of a hardcoded fixture. `clientHeight`
// is deliberately smaller than one row so even a single revealed message forces real scrolling.

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import '../chat-sim-element';

const ROW_PX = 80;
const CLIENT_PX = 50;

function target(visibleRows: number): number {
  return Math.max(0, visibleRows * ROW_PX - CLIENT_PX);
}

function stubLogMetrics() {
  const scrollHeightDesc = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'scrollHeight');
  const clientHeightDesc = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'clientHeight');
  Object.defineProperty(HTMLElement.prototype, 'scrollHeight', {
    configurable: true,
    get(this: HTMLElement) {
      if (!this.classList.contains('cf-log')) return 0;
      // Only `.cf-msg` rows — `.cf-log` also holds date-separator/typing-row `<li>`s that this
      // SCRIPT incidentally reveals too (a date pill on the very first message); counting those
      // would make `target(N)` depend on layout details unrelated to what this test is about.
      return this.querySelectorAll('.cf-msg:not([hidden])').length * ROW_PX;
    },
  });
  Object.defineProperty(HTMLElement.prototype, 'clientHeight', {
    configurable: true,
    get(this: HTMLElement) {
      return this.classList.contains('cf-log') ? CLIENT_PX : 0;
    },
  });
  return () => {
    if (scrollHeightDesc) Object.defineProperty(HTMLElement.prototype, 'scrollHeight', scrollHeightDesc);
    if (clientHeightDesc) Object.defineProperty(HTMLElement.prototype, 'clientHeight', clientHeightDesc);
  };
}

const SCRIPT = JSON.stringify([
  { k: 'post', by: 'in', text: 'uno', delayMs: 0 },
  { k: 'post', by: 'out:ai', text: 'dos', delayMs: 0 },
  { k: 'post', by: 'out:ai', text: 'tres', delayMs: 0 },
  { k: 'post', by: 'out:ai', text: 'cuatro', delayMs: 0 },
  { k: 'post', by: 'out:ai', text: 'cinco', delayMs: 0 },
]);

function mount(step: number): HTMLElement {
  const el = document.createElement('cf-chat-sim');
  el.setAttribute('channel', 'whatsapp');
  el.setAttribute('seed', '7');
  el.setAttribute('t0', '1767261600000');
  el.setAttribute('data-step', String(step));
  const scriptTag = document.createElement('script');
  scriptTag.type = 'application/json';
  scriptTag.textContent = SCRIPT;
  el.appendChild(scriptTag);
  document.body.appendChild(el);
  return el;
}

describe('auto-scroll (T-027 A) — reads state.scrollId, the one thing nothing consumed before this', () => {
  let restore: () => void;

  beforeEach(() => {
    restore = stubLogMetrics();
  });
  afterEach(() => {
    restore();
    document.body.innerHTML = '';
  });

  it('a manual data-step write (seek/scrub) jumps the log to bottom INSTANTLY — acceptance #1', () => {
    const el = mount(1);
    const log = el.querySelector('.cf-log') as HTMLElement;
    expect(log.scrollTop).toBe(target(1));

    el.setAttribute('data-step', '5');
    // No rAF/timer advance needed at all — if this were animated, scrollTop would still be at
    // its PREVIOUS value here (the tween hasn't run yet). Instant means it's already correct.
    expect(log.scrollTop).toBe(target(5));
  });

  it('the gemelo: mounting at step 0 (nothing posted yet, scrollId === null) never touches scrollTop', () => {
    const el = mount(0);
    const log = el.querySelector('.cf-log') as HTMLElement;
    expect(log.scrollTop).toBe(0);
  });

  it('a step that changes nothing about scrollId (a `receipt`, not a `post`) leaves scrollTop where it was', () => {
    const withReceipt = JSON.stringify([
      { k: 'post', by: 'in', text: 'uno', delayMs: 0 },
      { k: 'post', by: 'out:ai', text: 'dos', delayMs: 0 },
      { k: 'receipt', id: 'm1', to: 'delivered', delayMs: 0 },
    ]);
    const el = document.createElement('cf-chat-sim');
    el.setAttribute('channel', 'whatsapp');
    el.setAttribute('seed', '7');
    el.setAttribute('t0', '1767261600000');
    el.setAttribute('data-step', '2');
    const scriptTag = document.createElement('script');
    scriptTag.type = 'application/json';
    scriptTag.textContent = withReceipt;
    el.appendChild(scriptTag);
    document.body.appendChild(el);

    const log = el.querySelector('.cf-log') as HTMLElement;
    expect(log.scrollTop).toBe(target(2));
    el.setAttribute('data-step', '3'); // the `receipt` frame — same `order`, same `scrollId`
    expect(log.scrollTop).toBe(target(2));
  });

  it('play() animates the reveal via rAF (glide) instead of jumping instantly — the OTHER half of acceptance #1', () => {
    const staggered = JSON.stringify([
      { k: 'post', by: 'in', text: 'uno', delayMs: 1 },
      { k: 'post', by: 'out:ai', text: 'dos', delayMs: 5000 },
    ]);
    const rafCbs: Array<(t: number) => void> = [];
    vi.stubGlobal('requestAnimationFrame', (cb: (t: number) => void) => {
      rafCbs.push(cb);
      return rafCbs.length;
    });
    vi.stubGlobal('cancelAnimationFrame', () => {});

    const el = document.createElement('cf-chat-sim');
    el.setAttribute('channel', 'whatsapp');
    el.setAttribute('seed', '7');
    el.setAttribute('t0', '1767261600000');
    el.setAttribute('data-step', '0');
    const scriptTag = document.createElement('script');
    scriptTag.type = 'application/json';
    scriptTag.textContent = staggered;
    el.appendChild(scriptTag);
    document.body.appendChild(el);

    const log = el.querySelector('.cf-log') as HTMLElement;
    (el as unknown as { play(): { pause(): void } }).play();

    // Playhead's first tick only ESTABLISHES lastWall (playhead.ts's own documented quirk,
    // core/__tests__/playhead-live-cycle.test.ts) — virtualT stays 0, nothing reveals yet.
    rafCbs.shift()!(0);
    expect(el.dataset.step).toBe('0');

    // Second tick advances virtualT by 1000ms: past frame 0's ~1ms delay, nowhere near frame
    // 1's ~5000ms — deterministically reveals EXACTLY the first message.
    rafCbs.shift()!(1000);
    expect(el.dataset.step).toBe('1');

    // scrollHeight (80) now exceeds clientHeight (50): there IS somewhere to scroll to, and
    // #applyScroll queued its own rAF tween instead of jumping — scrollTop is still 0 here.
    expect(log.scrollTop).toBe(0);
    expect(target(1)).toBeGreaterThan(0);

    // Driving the glide's own queued rAF forward reaches the target eventually.
    const glideTick = rafCbs.shift()!;
    expect(glideTick).toBeDefined();
    // A full 220ms+ tick completes the ease (p clamps to 1).
    glideTick(performance.now() + 300);
    expect(log.scrollTop).toBe(target(1));

    vi.unstubAllGlobals();
  });
});
