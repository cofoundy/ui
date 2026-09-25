/**
 * Direction A — the only JS in the motion system: WHEN a state flips.
 *
 * Every pixel of movement is a CSS transition on a `--cf-spring-*` linear() easing (so it
 * is a Web Animation: pausable, seekable, filmstrip-deterministic). JS never interpolates;
 * it only decides the moment a `data-*` attribute changes. Those moments are measured on
 * rAF + performance.now — not setTimeout — so a frozen/virtual clock replays them exactly.
 */
import { flushSync } from "react-dom";

/** Run `fn` once `ms` have elapsed on the rAF clock. Returns a cancel function. */
export function after(ms: number, fn: () => void): () => void {
  const start = performance.now();
  let id = 0;
  let cancelled = false;
  const tick = () => {
    if (cancelled) return;
    // 0.5 ms tolerance: fixed 1/60 s steps accumulate float error.
    if (performance.now() - start >= ms - 0.5) fn();
    else id = requestAnimationFrame(tick);
  };
  id = requestAnimationFrame(tick);
  return () => {
    cancelled = true;
    cancelAnimationFrame(id);
  };
}

/**
 * State flips scheduled from rAF must commit in the SAME frame, or the CSS transition
 * starts one frame late (React would otherwise defer to a microtask/scheduler tick).
 */
export function commit(fn: () => void) {
  flushSync(fn);
}

/** `prefers-reduced-motion: reduce` → every state change becomes instant. */
export function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Timings the CSS can't know. Keep in sync with motion-a.css. */
export const T = {
  /** Content exits before its container morphs (taste contract: ≈ 80 ms). */
  contentExit: 80,
  /** Spinner floor: a save faster than this still shows the circle, so it doesn't flicker. */
  minLoading: 350,
  /** Toast auto-dismiss. */
  toastSuccess: 3200,
  toastError: 6000,
  /** Exit transition length (snappy) before the toast leaves the DOM. */
  toastExit: 380,
} as const;
