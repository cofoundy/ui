/**
 * Variant B — "Física directa": a retargetable, velocity-carrying spring value built on
 * `src/lib/spring.ts`. Motion is a pure function of time since the last retarget
 * (rAF + performance.now only — no setTimeout — so the virtual clock can seek it).
 *
 * Retarget math: the spring is linear, so the response from (x, v) toward T is
 *   x(t) = x + (T − x)·step(t) + v·impulse(t)
 * where step = springAt(t, p) and impulse = springAt(t, {…p, velocity: 1}) − step.
 * No division by travel, so a fling with ~0 travel still carries its velocity.
 */
import { springAt, SPRINGS, type SpringParams } from '../../../lib/spring';

export { SPRINGS };

/** Presets of this variant. All bounce ≤ 0.15 → overshoot ≤ 0.63 % (taste cap 2 %). */
export const B = {
  /** Button press-in: fast, no bounce — the depth tracks the finger. */
  pressIn: { duration: 0.18, bounce: 0 },
  /** Release / knob / toast snap-back. */
  snappy: SPRINGS.snappy,
  /** Tab indicator: leading edge (stiffer) vs trailing edge (softer). */
  lead: { duration: 0.3, bounce: 0 },
  trail: { duration: 0.46, bounce: 0 },
  /** Content track of the tabs. */
  track: { duration: 0.42, bounce: 0 },
  /** Toast enter / stack re-layout. */
  toast: { duration: 0.45, bounce: 0 },
  /** Fling off-screen (velocity carried). */
  fling: { duration: 0.32, bounce: 0 },
  /** Label exit (~80 ms to near-zero) and enter. */
  exit: { duration: 0.16, bounce: 0 },
  enter: { duration: 0.3, bounce: 0 },
} as const satisfies Record<string, SpringParams>;

export function reducedMotion(): boolean {
  return typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}

export class SpringValue {
  value: number;
  target: number;
  private from = 0;
  private v0 = 0;
  private t0 = 0;
  private raf = 0;
  private params: SpringParams;

  constructor(
    initial: number,
    private onChange: (v: number) => void,
    params: SpringParams = SPRINGS.snappy,
    /** Units under which the value counts as settled (px for positions, 0.001 for 0..1). */
    private precision = 0.1,
  ) {
    this.value = initial;
    this.target = initial;
    this.params = params;
  }

  get moving() {
    return this.raf !== 0;
  }

  private sample(t: number) {
    const step = springAt(t, this.params);
    const withV = springAt(t, { ...this.params, velocity: 1 });
    return this.from + (this.target - this.from) * step + this.v0 * (withV - step);
  }

  /** Current velocity in units/s (numeric derivative of the closed form). */
  get velocity(): number {
    if (!this.raf) return 0;
    const t = Math.max(0, (performance.now() - this.t0) / 1000);
    const dt = 0.004;
    return (this.sample(t + dt) - this.sample(t)) / dt;
  }

  /** Jump (direct manipulation or reduced motion). Stops any flight. */
  set(v: number) {
    this.stop();
    this.value = v;
    this.target = v;
    this.onChange(v);
  }

  stop() {
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = 0;
  }

  /** Retarget from wherever the value is, keeping its velocity unless one is given. */
  to(target: number, opts: { params?: SpringParams; velocity?: number; onRest?: () => void } = {}) {
    if (reducedMotion()) {
      this.set(target);
      opts.onRest?.();
      return;
    }
    const v = opts.velocity ?? this.velocity;
    this.stop();
    this.params = opts.params ?? this.params;
    this.from = this.value;
    this.v0 = v;
    this.target = target;
    this.t0 = performance.now();
    const tick = () => {
      const t = (performance.now() - this.t0) / 1000;
      const x = this.sample(t);
      const vel = (this.sample(t + 0.004) - x) / 0.004;
      if (t > 0.05 && Math.abs(x - this.target) < this.precision && Math.abs(vel) < this.precision * 20) {
        this.raf = 0;
        this.value = this.target;
        this.onChange(this.value);
        opts.onRest?.();
        return;
      }
      this.value = x;
      this.onChange(x);
      this.raf = requestAnimationFrame(tick);
    };
    // First frame lands on the next rAF (≤ 1 frame after the input).
    this.raf = requestAnimationFrame(tick);
  }
}

/** Pointer velocity over the last ~80 ms, px/s. Uses performance.now (virtual-clock safe). */
export class VelocityTracker {
  private s: { t: number; x: number; y: number }[] = [];
  reset(x: number, y: number) {
    this.s = [{ t: performance.now(), x, y }];
  }
  push(x: number, y: number) {
    const t = performance.now();
    this.s.push({ t, x, y });
    while (this.s.length > 2 && t - this.s[0].t > 80) this.s.shift();
  }
  get(): { vx: number; vy: number } {
    const a = this.s[0];
    const b = this.s[this.s.length - 1];
    if (!a || !b || b.t - a.t < 1) return { vx: 0, vy: 0 };
    const dt = (b.t - a.t) / 1000;
    return { vx: (b.x - a.x) / dt, vy: (b.y - a.y) / dt };
  }
}

/** setTimeout replacement on rAF + performance.now, so the filmstrip clock can drive it. */
export function after(ms: number, fn: () => void): () => void {
  const start = performance.now();
  let id = 0;
  const tick = () => {
    if (performance.now() - start >= ms) fn();
    else id = requestAnimationFrame(tick);
  };
  id = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(id);
}

/** Beyond the allowed range the value resists (iOS-style), still continuous. */
export function rubber(x: number, min: number, max: number, k = 0.35) {
  if (x < min) return min - (min - x) * k;
  if (x > max) return max + (x - max) * k;
  return x;
}

export const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));

/** setPointerCapture that tolerates synthetic/finished pointers (throws NotFoundError otherwise). */
export function capture(el: Element, pointerId: number) {
  try {
    el.setPointerCapture(pointerId);
  } catch {
    /* pointer already gone — dragging still works through bubbling */
  }
}
