/**
 * Closed-form springs — motion as a pure function of time.
 *
 * Parameters are perceptual (SwiftUI's convention; framer-motion's `visualDuration`/`bounce`
 * map close to it but not identically): `duration` is the period of the undamped spring in seconds,
 * `bounce` 0 = critically damped (no overshoot), >0 = underdamped, <0 = overdamped.
 * Cofoundy's taste contract caps overshoot at ~2 % (bounce ≤ 0.2).
 *
 *   springAt(t, SPRINGS.snappy)            // 0 → 1 progress at t seconds
 *   springToCSSLinear(SPRINGS.smooth)      // { easing: "linear(…)", duration: 0.52 }
 *   springTrack(t, [{ at: 0, to: 1 }, { at: 0.2, to: 0.4 }])  // retargeted mid-flight
 */

export interface SpringParams {
  /** Perceptual duration in seconds (period of the undamped spring). */
  duration: number;
  /** -1..1 — 0 = no overshoot. Keep ≤ 0.2 on UI chrome. */
  bounce: number;
  /** Initial velocity in progress units per second (0 = starts at rest). */
  velocity?: number;
}

export const SPRINGS = {
  /** Toggles, presses, knobs — quick with a barely-there settle. */
  snappy: { duration: 0.35, bounce: 0.15 },
  /** Tabs, dropdowns, popovers, content swaps. */
  smooth: { duration: 0.5, bounce: 0 },
  /** Sheets, dialogs, large layout moves. */
  gentle: { duration: 0.8, bounce: 0 },
} as const satisfies Record<string, SpringParams>;

export type SpringName = keyof typeof SPRINGS;

function physics({ duration, bounce }: SpringParams) {
  const omega = (2 * Math.PI) / duration;
  const zeta = bounce >= 0 ? 1 - bounce : 1 / (1 + bounce);
  return { omega, zeta };
}

/** Progress (0 → 1) of a spring step response at time `t` seconds. */
export function springAt(t: number, params: SpringParams): number {
  if (t <= 0) return 0;
  const { omega, zeta } = physics(params);
  const v0 = params.velocity ?? 0;
  if (Math.abs(zeta - 1) < 1e-6) {
    return 1 - Math.exp(-omega * t) * (1 + (omega - v0) * t);
  }
  if (zeta < 1) {
    const wd = omega * Math.sqrt(1 - zeta * zeta);
    const a = (zeta * omega - v0) / wd;
    return 1 - Math.exp(-zeta * omega * t) * (Math.cos(wd * t) + a * Math.sin(wd * t));
  }
  const s = Math.sqrt(zeta * zeta - 1);
  const r1 = -omega * (zeta - s);
  const r2 = -omega * (zeta + s);
  const c1 = (v0 + r2) / (r1 - r2);
  const c2 = -1 - c1;
  return 1 + c1 * Math.exp(r1 * t) + c2 * Math.exp(r2 * t);
}

/** Largest overshoot past the target, as a fraction of travel (0.01 = 1 %). */
export function springOvershoot(params: SpringParams): number {
  const end = springSettleTime(params);
  let max = 0;
  for (let t = 0; t <= end; t += end / 400) max = Math.max(max, springAt(t, params) - 1);
  return max;
}

/** Time in seconds after which the spring stays within `epsilon` of the target. */
export function springSettleTime(params: SpringParams, epsilon = 0.001): number {
  const dt = 1 / 240;
  const limit = params.duration * 10;
  let last = 0;
  for (let t = dt; t <= limit; t += dt) {
    if (Math.abs(1 - springAt(t, params)) >= epsilon) last = t;
  }
  return Math.ceil((last + dt) * 1000) / 1000;
}

/**
 * The spring as a CSS `linear()` easing + the duration to pair it with.
 * CSS motion built this way is a Web Animation, so it can be paused and seeked
 * (the ui-snap filmstrip relies on that).
 */
export function springToCSSLinear(
  params: SpringParams,
  points = 40,
  /** 0.005 = within half a pixel on a 100 px move; the imperceptible tail is cut. */
  epsilon = 0.005,
): { easing: string; duration: number } {
  const duration = springSettleTime(params, epsilon);
  const stops: string[] = [];
  for (let i = 0; i <= points; i++) {
    const v = i === points ? 1 : springAt((duration * i) / points, params);
    stops.push(String(Math.round(v * 10000) / 10000));
  }
  return { easing: `linear(${stops.join(", ")})`, duration };
}

/** framer-motion transition for a preset: `<motion.div transition={springTransition("snappy")} />`. */
export function springTransition(name: SpringName) {
  const { duration, bounce } = SPRINGS[name];
  return { type: "spring" as const, visualDuration: duration, bounce };
}

export interface SpringChange {
  /** Seconds at which the target changes. */
  at: number;
  /** New target value. */
  to: number;
}

/**
 * A value that is retargeted several times, still a pure function of time: the sum of one
 * spring per change, each carrying the delta from the previous target. Use it to drive
 * seek(t)-style prototypes and stories without state carried between frames.
 */
export function springTrack(
  t: number,
  changes: SpringChange[],
  params: SpringParams = SPRINGS.smooth,
  from = 0,
): number {
  let value = from;
  let prev = from;
  for (const c of changes) {
    value += (c.to - prev) * springAt(t - c.at, params);
    prev = c.to;
  }
  return value;
}
