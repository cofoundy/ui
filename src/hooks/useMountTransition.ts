"use client";

import { useState, useEffect } from "react";

/**
 * Returns `false` on first render, `true` after mount.
 * Use this to trigger CSS transitions on mount by toggling
 * between initial (0) and target values.
 */
export function useMountTransition(enabled = true): boolean {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    // Double rAF ensures the browser has painted the initial state
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setMounted(true);
      });
    });
    return () => cancelAnimationFrame(raf);
  }, [enabled]);

  return enabled ? mounted : true;
}
