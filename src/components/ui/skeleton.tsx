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
 * declared per theme in index.css), `--cf-skeleton-duration` the period of one pass.
 * The CSS (`cf-skeleton-sweep`, shared with `.cf-animate-shimmer`) lives in `styles/index.css`.
 */

type SkeletonAnimation = "shimmer" | "pulse" | "none";

interface SkeletonProps extends React.ComponentProps<"div"> {
  /** Loading motion. Default `shimmer`. */
  animation?: SkeletonAnimation;
  /** Force the static block regardless of the OS / MotionConfig setting. */
  reduced?: boolean;
}

function Skeleton({ className, animation = "shimmer", reduced, ...props }: SkeletonProps) {
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
