"use client";

import { useState, useEffect, useRef } from "react";

export interface UseAnimatedValueOptions {
  /** Target value to animate to */
  value: number;
  /** Animation duration in ms (default: 600) */
  duration?: number;
  /** Whether animation is enabled (default: true) */
  enabled?: boolean;
  /** Easing function (default: easeOutExpo) */
  easing?: (t: number) => number;
}

// Cofoundy default easing — fast start, smooth deceleration
function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

export function useAnimatedValue({
  value,
  duration = 600,
  enabled = true,
  easing = easeOutExpo,
}: UseAnimatedValueOptions): number {
  const [current, setCurrent] = useState(enabled ? 0 : value);
  const rafRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const fromRef = useRef<number>(0);

  useEffect(() => {
    if (!enabled) {
      setCurrent(value);
      return;
    }

    fromRef.current = current;
    startTimeRef.current = 0;

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easing(progress);

      const interpolated =
        fromRef.current + (value - fromRef.current) * easedProgress;
      setCurrent(interpolated);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, duration, enabled]);

  return current;
}
