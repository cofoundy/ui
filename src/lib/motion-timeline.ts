/**
 * The only JS in the primitives' motion: WHEN a state flips.
 *
 * Every pixel of movement is a CSS transition on a `--cf-spring-*` linear() easing. JS never
 * interpolates; it only decides the moment a `data-*` attribute changes. Those moments are
 * measured on rAF + performance.now (not setTimeout), so a frozen/virtual clock replays them.
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
 * A flip scheduled from rAF must commit in the SAME frame, or the CSS transition starts one
 * frame late (React would otherwise defer it to a scheduler tick).
 */
export function commit(fn: () => void) {
  flushSync(fn);
}

/** `prefers-reduced-motion: reduce` → every state change becomes instant. */
export function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/** Timings the CSS can't tell JS. Mirror of the choreography tokens in styles/index.css. */
export const MOTION = {
  /** --cf-duration-exit: content leaves before its container morphs. */
  contentExit: 80,
  /** Spinner floor: a save faster than this still shows the circle, so it doesn't flicker. */
  minLoading: 350,
} as const;
