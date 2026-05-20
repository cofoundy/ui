"use client";

import { useEffect, useRef, useState } from "react";

export type DripMode = "adaptive" | "typewriter" | "off";

export interface UseStreamingDripOptions {
  isStreaming: boolean;
  mode?: DripMode;
  /** Fixed rate for typewriter mode. Default 60. */
  cps?: number;
  /** Adaptive floor. Default 30. */
  minCps?: number;
  /** Adaptive ceiling. Default 160. */
  maxCps?: number;
  /** Adaptive target lag in ms. Higher = smoother but more delayed. Default 150. */
  targetLagMs?: number;
}

export interface UseStreamingDripResult {
  /** content.slice(0, displayedLen) — the chars currently revealed. */
  displayed: string;
  /** True while displayedLen < content.length. */
  isCatchingUp: boolean;
}

/**
 * Decouples a fast-arriving text stream from its visual reveal rate.
 *
 * - mode="off" or !isStreaming → passthrough (displayed === content).
 * - mode="typewriter" → fixed cps drip.
 * - mode="adaptive" → cps proportional to backlog, clamped [minCps, maxCps],
 *   target lag of targetLagMs behind incoming stream.
 *
 * To reset (e.g., replay), the consumer should change a React key on the parent
 * component to force remount.
 */
export function useStreamingDrip(
  content: string,
  opts: UseStreamingDripOptions,
): UseStreamingDripResult {
  const {
    isStreaming,
    mode = "adaptive",
    cps = 60,
    minCps = 30,
    maxCps = 160,
    targetLagMs = 150,
  } = opts;

  const [displayedLen, setDisplayedLen] = useState(0);

  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const accumRef = useRef<number>(0);
  const contentRef = useRef(content);
  contentRef.current = content;

  // Track recent arrival samples to estimate incoming cps and avoid
  // burst-catchup which visually couples many wave animations together.
  // arrivals[i] = { len: content.length, t: ms } at the moment we observed a growth.
  const arrivalsRef = useRef<Array<{ len: number; t: number }>>([]);
  const lastContentLenRef = useRef<number>(0);

  useEffect(() => {
    if (mode === "off" || !isStreaming) {
      setDisplayedLen(contentRef.current.length);
      return;
    }

    let cancelled = false;
    const loop = (t: number) => {
      if (cancelled) return;
      const last = lastTimeRef.current || t;
      const dt = t - last;
      lastTimeRef.current = t;

      // Observe content arrival samples (for adaptive incoming-rate estimate)
      const currentLen = contentRef.current.length;
      if (currentLen !== lastContentLenRef.current) {
        arrivalsRef.current.push({ len: currentLen, t });
        // Keep only last ~1.2s of samples
        const cutoff = t - 1200;
        while (
          arrivalsRef.current.length > 1 &&
          arrivalsRef.current[0].t < cutoff
        ) {
          arrivalsRef.current.shift();
        }
        lastContentLenRef.current = currentLen;
      }

      setDisplayedLen((prev) => {
        const target = contentRef.current.length;
        if (prev >= target) return prev;
        const gap = target - prev;

        let desiredCps: number;
        if (mode === "typewriter") {
          desiredCps = cps;
        } else {
          // Adaptive: aim to drain `gap` over `targetLagMs`, but never faster
          // than the smoothed incoming rate (so no burst-catchup when chunks
          // arrive in 40-char batches every 500ms — drip stays steady at the
          // chunk rate instead of racing to consume the batch).
          const samples = arrivalsRef.current;
          let incomingCps = maxCps;
          if (samples.length >= 2) {
            const first = samples[0];
            const lastS = samples[samples.length - 1];
            const dtMs = Math.max(1, lastS.t - first.t);
            const dLen = lastS.len - first.len;
            incomingCps = (dLen / dtMs) * 1000;
          }
          // Drain rate: gap-derived urgency, ceilinged by incoming rate +20%
          // so we don't outrun the stream. Floored by minCps so slow streams
          // still feel alive.
          const urgency = (gap / targetLagMs) * 1000;
          const ceiling = Math.min(maxCps, incomingCps * 1.2);
          desiredCps = Math.max(minCps, Math.min(ceiling, urgency));
        }

        accumRef.current += (dt / 1000) * desiredCps;
        const chars = Math.floor(accumRef.current);
        if (chars <= 0) return prev;
        accumRef.current -= chars;
        return Math.min(target, prev + chars);
      });
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      cancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      lastTimeRef.current = 0;
      accumRef.current = 0;
      arrivalsRef.current = [];
      lastContentLenRef.current = 0;
    };
  }, [mode, isStreaming, cps, minCps, maxCps, targetLagMs]);

  const displayed = content.slice(0, displayedLen);
  const isCatchingUp = displayedLen < content.length;
  return { displayed, isCatchingUp };
}
