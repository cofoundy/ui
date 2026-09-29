"use client";

import * as React from "react";
import { useReducedMotionConfig } from "framer-motion";

import { cn } from "../../utils/cn";

/**
 * Motion
 * - `shimmer` (default): a soft highlight band travels left → right across the block, then
 *   rests before the next pass. It is the only looping motion allowed in the system, and only
 *   because it signals loading. The band moves by `transform` on a pseudo-element (compositor
 *   only, no repaint per frame), so fifty skeletons on a list cost the same as one.
 *   The travel is `linear`: a loop has no start or end to ease into, and a spring would read as
 *   the band "arriving" somewhere.
 * - `pulse`: the previous opacity pulse, kept for callers that opt back in.
 * - `none`: static block.
 * - Reduced motion (OS setting, framer `MotionConfig reducedMotion="always"`, or `reduced`):
 *   static block, no loop at all. The band is not rendered.
 * Theming: `--cf-skeleton-highlight` overrides the band colour (default: foreground at 7 %,
 * which reads on light and dark), `--cf-skeleton-duration` the period of one pass.
 * The keyframes are injected once into <head> (same pattern as `tooltip.tsx`).
 */
const SKELETON_CSS = `
@keyframes cf-skeleton-sweep {
  0% { transform: translateX(-100%); }
  62%, 100% { transform: translateX(100%); }
}
[data-slot="skeleton"][data-animation="shimmer"] {
  position: relative;
  overflow: hidden;
  isolation: isolate;
}
[data-slot="skeleton"][data-animation="shimmer"]::after {
  content: "";
  position: absolute;
  inset: 0;
  transform: translateX(-100%);
  background: linear-gradient(
    90deg,
    transparent 0%,
    var(--cf-skeleton-highlight, color-mix(in oklab, var(--foreground) 7%, transparent)) 50%,
    transparent 100%
  );
  animation: cf-skeleton-sweep var(--cf-skeleton-duration, 1.8s) linear infinite;
  pointer-events: none;
}
[data-slot="skeleton"][data-reduced][data-animation]::after { content: none; animation: none; }
[data-slot="skeleton"][data-reduced][data-animation] { animation: none; }
@media (prefers-reduced-motion: reduce) {
  [data-slot="skeleton"][data-animation]::after { content: none; animation: none; }
  [data-slot="skeleton"][data-animation] { animation: none; }
}
`;

const STYLE_ID = "cf-skeleton-motion";
const useInsertion =
  typeof window === "undefined" ? React.useEffect : React.useInsertionEffect;

function useSkeletonStyles() {
  useInsertion(() => {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = SKELETON_CSS;
    document.head.appendChild(style);
  }, []);
}

type SkeletonAnimation = "shimmer" | "pulse" | "none";

interface SkeletonProps extends React.ComponentProps<"div"> {
  /** Loading motion. Default `shimmer`. */
  animation?: SkeletonAnimation;
  /** Force the static block regardless of the OS / MotionConfig setting. */
  reduced?: boolean;
}

function Skeleton({ className, animation = "shimmer", reduced, ...props }: SkeletonProps) {
  useSkeletonStyles();
  const reducedConfig = useReducedMotionConfig();
  const isReduced = reduced ?? !!reducedConfig;

  return (
    <div
      data-slot="skeleton"
      data-animation={animation === "none" ? undefined : animation}
      data-reduced={isReduced ? "" : undefined}
      className={cn(
        "rounded-md bg-[var(--accent)]",
        animation === "pulse" && !isReduced && "animate-pulse",
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
export type { SkeletonProps, SkeletonAnimation };
