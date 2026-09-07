// T-031 — alto fijo (A), rotación multi-guion (B), badge (C), etiqueta de rubro (D). Operator
// report: "el ratio del celular mocked tiene que ser fixed, como la izquierda" (A, 🔴) +
// "producción encadena rubro tras rubro" (B). C/D are opt-in slots, same discipline `reply-label`
// already established — attribute-driven, zero literals in the renderer.

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

function scriptTag(json: string, attrs: Record<string, string> = {}): HTMLScriptElement {
  const el = document.createElement('script');
  el.type = 'application/json';
  el.textContent = json;
  Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
  return el;
}

function mount(attrs: Record<string, string>, scripts: HTMLScriptElement[]): HTMLElement {
  const el = document.createElement('cf-chat-sim');
  el.setAttribute('channel', 'whatsapp');
  el.setAttribute('seed', '3');
  el.setAttribute('t0', '0');
  Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
  scripts.forEach((s) => el.appendChild(s));
  document.body.appendChild(el);
  return el;
}

describe('T-031 A — fixed height, configurable via attribute', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('defaults to the styles.css token (no inline override) when `height` is absent', () => {
    const el = mount({ 'data-step': '0' }, [scriptTag(JSON.stringify([{ k: 'post', by: 'in', text: 'hola' }]))]);
    expect(el.style.getPropertyValue('--cf-cs-height')).toBe('');
  });

  it('a bare number is treated as px', () => {
    const el = mount({ height: '300', 'data-step': '0' }, [
      scriptTag(JSON.stringify([{ k: 'post', by: 'in', text: 'hola' }])),
    ]);
    expect(el.style.getPropertyValue('--cf-cs-height')).toBe('300px');
  });

  it('a unit-carrying value passes through verbatim', () => {
    const el = mount({ height: '60vh', 'data-step': '0' }, [
      scriptTag(JSON.stringify([{ k: 'post', by: 'in', text: 'hola' }])),
    ]);
    expect(el.style.getPropertyValue('--cf-cs-height')).toBe('60vh');
  });

  it('el gemelo: two scripts of very different length set the SAME --cf-cs-height — the frame height is not a function of content', () => {
    const short = mount({ height: '350', 'data-step': '0' }, [
      scriptTag(JSON.stringify([{ k: 'post', by: 'in', text: 'hola' }])),
    ]);
    const long = mount({ height: '350', 'data-step': '0' }, [
      scriptTag(
        JSON.stringify(
          Array.from({ length: 20 }, (_, i) => ({ k: 'post', by: i % 2 ? 'out:ai' : 'in', text: `mensaje ${i}` })),
        ),
      ),
    ]);
    expect(short.style.getPropertyValue('--cf-cs-height')).toBe(long.style.getPropertyValue('--cf-cs-height'));
  });
});

describe('T-031 B — rotation across N scripts', () => {
  let raf: ReturnType<typeof stubRaf>;

  beforeEach(() => {
    vi.useFakeTimers();
    raf = stubRaf();
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    document.body.innerHTML = '';
  });

  const SCRIPT_A = JSON.stringify([
    { k: 'post', by: 'in', text: 'uno', delayMs: 0 },
    { k: 'post', by: 'out:ai', text: 'dos', delayMs: 50 },
  ]);
  const SCRIPT_B = JSON.stringify([{ k: 'post', by: 'in', text: 'tres', delayMs: 0 }]);

  it('without `loop`, a multi-script mount just shows the first slide and does not advance', () => {
    const el = mount({}, [scriptTag(SCRIPT_A), scriptTag(SCRIPT_B)]);
    const logs = el.querySelectorAll('.cf-log');
    expect(logs).toHaveLength(2); // both slides pre-built...
    expect((logs[0] as HTMLElement).hidden).toBe(false); // ...only the first is shown
    expect((logs[1] as HTMLElement).hidden).toBe(true);
    expect(el.querySelectorAll('.cf-msg')).toHaveLength(3); // 2 from A + 1 from B, all pre-rendered
  });

  it('with `loop`, playback chains to the NEXT script after the pause, and wraps back to the first after the last', () => {
    const el = mount({ loop: '', 'loop-pause-ms': '1000' }, [scriptTag(SCRIPT_A), scriptTag(SCRIPT_B)]);
    const logs = () => [...el.querySelectorAll('.cf-log')] as HTMLElement[];

    (el as unknown as { play(): void }).play();
    raf.flush(0);
    raf.flush(10_000); // completes slide A
    expect(logs()[0].hidden).toBe(false);

    vi.advanceTimersByTime(1000); // loop-pause-ms elapses -> advance to slide B
    raf.flush(0); // the new playhead's first tick, on B's timeline
    expect(logs()[0].hidden).toBe(true);
    expect(logs()[1].hidden).toBe(false);

    raf.flush(10_000); // completes slide B (only 1 frame)
    vi.advanceTimersByTime(1000); // wraps back to slide A
    raf.flush(0);
    expect(logs()[0].hidden).toBe(false);
    expect(logs()[1].hidden).toBe(true);
  });

  it('el gemelo (acceptance #2): cycling back to a slide does not recreate its nodes', () => {
    const el = mount({ loop: '', 'loop-pause-ms': '100' }, [scriptTag(SCRIPT_A), scriptTag(SCRIPT_B)]);
    const firstSlideNodesBefore = [...el.querySelectorAll('.cf-log')[0].querySelectorAll('.cf-msg')];

    (el as unknown as { play(): void }).play();
    raf.flush(0);
    raf.flush(10_000); // A done
    vi.advanceTimersByTime(100); // -> B
    raf.flush(0);
    raf.flush(10_000); // B done
    vi.advanceTimersByTime(100); // -> back to A

    const firstSlideNodesAfter = [...el.querySelectorAll('.cf-log')[0].querySelectorAll('.cf-msg')];
    expect(firstSlideNodesAfter).toHaveLength(firstSlideNodesBefore.length);
    firstSlideNodesAfter.forEach((li, i) => expect(li).toBe(firstSlideNodesBefore[i]));
  });

  it('a single script (attribute or one inline child) behaves exactly as before — one log, no rotation machinery engaged', () => {
    const el = mount({}, [scriptTag(SCRIPT_A)]);
    expect(el.querySelectorAll('.cf-log')).toHaveLength(1);
    expect((el.querySelector('.cf-log') as HTMLElement).hidden).toBe(false);
  });
});

describe('T-031 C — badge slot (opt-in, driven by SimState.flags via `badge-flag`)', () => {
  const SCRIPT = JSON.stringify([
    { k: 'flag', key: 'aiOn', value: true, delayMs: 0 },
    { k: 'post', by: 'in', text: 'hola', delayMs: 0 },
    { k: 'flag', key: 'aiOn', value: false, delayMs: 0 },
    { k: 'post', by: 'out:ai', text: 'chau', delayMs: 0 },
  ]);

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('no `badge-flag` attribute => no badge rendered at all (no forced default vocabulary)', () => {
    const el = mount({}, [scriptTag(SCRIPT)]);
    expect(el.querySelector('.cf-badge')).toBeNull();
  });

  it('reflects the named flag, using the consumer\'s own on/off labels — never a literal in the renderer', () => {
    const el = mount({ 'badge-flag': 'aiOn', 'badge-on-label': 'IA ACTIVA', 'badge-off-label': 'TE TOCA A TI', 'data-step': '2' }, [
      scriptTag(SCRIPT),
    ]);
    const badge = el.querySelector('.cf-badge');
    expect(badge).not.toBeNull();
    expect(badge!.textContent).toBe('IA ACTIVA');
    expect(badge!.getAttribute('data-on')).toBe('true');

    el.setAttribute('data-step', '4'); // the second flag flips it off
    expect(badge!.textContent).toBe('TE TOCA A TI');
    expect(badge!.getAttribute('data-on')).toBe('false');
  });

  it('el gemelo (acceptance #3): changing the attribute changes the text — no hardcoded "IA ACTIVA"', () => {
    const el = mount({ 'badge-flag': 'aiOn', 'badge-on-label': 'CUSTOM ON', 'data-step': '2' }, [scriptTag(SCRIPT)]);
    expect(el.querySelector('.cf-badge')!.textContent).toBe('CUSTOM ON');
  });

  it('falls back to a generic ON/OFF when the flag is set but no label attribute is given', () => {
    const el = mount({ 'badge-flag': 'aiOn', 'data-step': '2' }, [scriptTag(SCRIPT)]);
    expect(el.querySelector('.cf-badge')!.textContent).toBe('ON');
  });
});

describe('T-031 D — tag pill above the frame (opt-in, per-slide override)', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  const SCRIPT = JSON.stringify([{ k: 'post', by: 'in', text: 'hola', delayMs: 0 }]);

  it('no tag-icon/tag-label anywhere => hidden, never rendered', () => {
    const el = mount({}, [scriptTag(SCRIPT)]);
    expect((el.querySelector('.cf-tag') as HTMLElement).hidden).toBe(true);
  });

  it('host-level tag-icon/tag-label attributes render the pill', () => {
    const el = mount({ 'tag-icon': '💬', 'tag-label': 'FOVENTE' }, [scriptTag(SCRIPT)]);
    const tag = el.querySelector('.cf-tag') as HTMLElement;
    expect(tag.hidden).toBe(false);
    expect(el.querySelector('.cf-tag-icon')!.textContent).toBe('💬');
    expect(el.querySelector('.cf-tag-label')!.textContent).toBe('FOVENTE');
  });

  it('el gemelo (acceptance #3): changing the attribute changes the text', () => {
    const el = mount({ 'tag-label': 'ALPHA' }, [scriptTag(SCRIPT)]);
    expect(el.querySelector('.cf-tag-label')!.textContent).toBe('ALPHA');
    el.setAttribute('tag-label', 'BETA');
    // tag content is only re-applied on slide activation, not on every attribute mutation — the
    // attribute is mount-time-only, same as every other playback attribute in this file.
    expect(el.querySelector('.cf-tag-label')!.textContent).toBe('ALPHA');
  });

  it('a per-slide `data-tag-icon`/`data-tag-label` on the <script> child overrides the host default when that slide is active', () => {
    const el = mount({ 'tag-icon': '💬', 'tag-label': 'FOVENTE' }, [
      scriptTag(SCRIPT, { 'data-tag-icon': '🎉', 'data-tag-label': 'EVENTOS / CATERING' }),
      scriptTag(SCRIPT),
    ]);
    expect(el.querySelector('.cf-tag-label')!.textContent).toBe('EVENTOS / CATERING');
    expect(el.querySelector('.cf-tag-icon')!.textContent).toBe('🎉');
  });
});
