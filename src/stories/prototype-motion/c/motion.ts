/**
 * Variant C — "Causa → efecto". Motion helpers, prototype-local.
 *
 * Every timeline here runs on requestAnimationFrame + performance.now or on the Web
 * Animations API, never on setTimeout: the ui-snap virtual clock drives all three, so a
 * filmstrip of loading → éxito is a pure function of time.
 */
import { flushSync } from "react-dom";
import {
  SPRINGS,
  springAt,
  springSettleTime,
  springToCSSLinear,
  type SpringParams,
} from "../../../lib/spring";

/** Leading edge of a travelling indicator: stiffer, arrives first. */
export const LEAD: SpringParams = { duration: 0.28, bounce: 0.1 };
/** Trailing edge: softer, catches up — the stretch is the gap between the two. */
export const TRAIL: SpringParams = { duration: 0.38, bounce: 0.05 };
/** Content entering after a swap: no overshoot (blur can't go negative). */
export const CONTENT: SpringParams = { duration: 0.3, bounce: 0 };
/** Toast travelling from the element you touched to the dock. ≤ 600 ms settle. */
export const TRAVEL: SpringParams = SPRINGS.smooth;

export const EXIT_MS = 80;

export function reduced(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

const cssCache = new Map<string, { easing: string; ms: number }>();
/** Spring as CSS `linear()` + duration in ms, for WAAPI. */
export function springCSS(p: SpringParams) {
  const k = `${p.duration}/${p.bounce}`;
  let v = cssCache.get(k);
  if (!v) {
    const { easing, duration } = springToCSSLinear(p);
    v = { easing, ms: Math.round(duration * 1000) };
    cssCache.set(k, v);
  }
  return v;
}

/** setTimeout that the virtual clock can drive. Returns a cancel function. */
export function after(ms: number, cb: () => void): () => void {
  const start = performance.now();
  let id = 0;
  let dead = false;
  const tick = () => {
    if (dead) return;
    if (performance.now() - start >= ms) cb();
    else id = requestAnimationFrame(tick);
  };
  id = requestAnimationFrame(tick);
  return () => {
    dead = true;
    cancelAnimationFrame(id);
  };
}

/** `after` + a synchronous React commit, so the DOM changes inside the same frame. */
export function later(ms: number, fn: () => void) {
  return after(ms, () => flushSync(fn));
}

/**
 * A number driven by a closed-form spring, retargetable mid-flight with velocity carried.
 * `write` receives every frame's value (write styles there, never React state).
 */
export class SpringValue {
  value: number;
  private to: number;
  private from: number;
  private t0 = 0;
  private p: SpringParams = SPRINGS.snappy;
  private settle = 0;
  private raf = 0;

  constructor(initial: number, private write: (v: number) => void) {
    this.value = this.to = this.from = initial;
  }

  private velocityNow() {
    if (!this.raf) return 0;
    const t = (performance.now() - this.t0) / 1000;
    const h = 1 / 240;
    return ((this.to - this.from) * (springAt(t + h, this.p) - springAt(t, this.p))) / h;
  }

  jump(v: number) {
    cancelAnimationFrame(this.raf);
    this.raf = 0;
    this.value = this.to = this.from = v;
    this.write(v);
  }

  set(to: number, params: SpringParams) {
    if (reduced()) return this.jump(to);
    if (to === this.to) return;
    const vel = this.velocityNow();
    this.from = this.value;
    this.to = to;
    this.t0 = performance.now();
    const d = to - this.from;
    if (Math.abs(d) < 1e-6) return this.jump(to);
    this.p = { ...params, velocity: vel / d };
    this.settle = springSettleTime(this.p, 0.001);
    cancelAnimationFrame(this.raf);
    const tick = () => {
      const t = (performance.now() - this.t0) / 1000;
      if (t >= this.settle) {
        this.value = this.to;
        this.raf = 0;
        this.write(this.value);
        return;
      }
      this.value = this.from + d * springAt(t, this.p);
      this.write(this.value);
      this.raf = requestAnimationFrame(tick);
    };
    this.raf = requestAnimationFrame(tick);
  }

  stop() {
    cancelAnimationFrame(this.raf);
    this.raf = 0;
  }
}

/**
 * Exit-before-enter content swap. React owns the resting state (`data-current` flips
 * opacity in CSS); this only adds the transition on top. The outgoing layer leaves in
 * 80 ms (opacity + 3 px blur + 4 px up); the incoming one waits for it, then springs in.
 * Never two labels visible at once.
 */
export function swapContent(out: Element | null, inn: Element | null) {
  const r = reduced();
  for (const el of [out, inn]) el?.getAnimations().forEach((a) => a.cancel());
  if (out && !r) {
    out.animate(
      [
        { opacity: 1, filter: "blur(0px)", transform: "translateY(0px)" },
        { opacity: 0, filter: "blur(3px)", transform: "translateY(-4px)" },
      ],
      { duration: EXIT_MS, easing: "cubic-bezier(0.4, 0, 1, 1)" },
    );
  }
  if (inn) {
    if (r) {
      inn.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 120, easing: "linear", fill: "backwards" });
    } else {
      const s = springCSS(CONTENT);
      inn.animate(
        [
          { opacity: 0, filter: "blur(3px)", transform: "translateY(4px)" },
          { opacity: 1, filter: "blur(0px)", transform: "translateY(0px)" },
        ],
        { duration: s.ms, delay: EXIT_MS, easing: s.easing, fill: "backwards" },
      );
    }
  }
}
