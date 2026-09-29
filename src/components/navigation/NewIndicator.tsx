import * as React from "react";
import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";

import { cn } from "../../utils/cn";
import { springTransition } from "../../lib/spring";

/**
 * «Nuevo» markers: a dot for icon-only surfaces (rail, tab bar) and a text chip for rows.
 *
 * Motion contract: they enter ONCE (scale on the `snappy` spring, optional delay) and then
 * sit still — no pulse, no loop. Re-renders never replay the entrance. Inside an
 * `AnimatePresence` they also leave (opacity, short). With reduced motion: opacity only, ≤120 ms.
 *
 * Tokens (local until promoted): `--cf-new-accent` (default `--primary`) and
 * `--cf-new-ring` (the surface behind the dot; default `--background`).
 */

const ACCENT = "var(--cf-new-accent, var(--primary))";

type MotionSpanProps = Omit<
  HTMLMotionProps<"span">,
  "initial" | "animate" | "exit" | "transition" | "children"
>;

interface EntranceOptions {
  /** Seconds to wait before entering (e.g. after the surface itself settled). Default 0. */
  delay?: number;
  /** `false` renders it already in place (no entrance). Default `true`. */
  animate?: boolean;
}

function useEntrance({ delay = 0, animate = true }: EntranceOptions) {
  const reduce = useReducedMotion();
  if (reduce) {
    return {
      initial: animate ? { opacity: 0 } : false,
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.12, delay },
    } as const;
  }
  return {
    initial: animate ? { opacity: 0, scale: 0.4 } : false,
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.6, transition: { duration: 0.08 } },
    transition: {
      scale: { ...springTransition("snappy"), delay },
      opacity: { duration: 0.1, delay },
    },
  } as const;
}

// ============================================
// NewDot
// ============================================

export interface NewDotProps extends MotionSpanProps, EntranceOptions {
  /**
   * Text for assistive tech, rendered visually hidden so it joins the parent's accessible
   * name ("Plugins nuevo"). NOTE: a parent with `aria-label` ignores its children — then
   * include «nuevo» in that aria-label yourself and pass `decorative`. Default «nuevo».
   */
  label?: string;
  /** Purely visual (aria-hidden, no hidden text). Use when the parent already says «nuevo». */
  decorative?: boolean;
  /**
   * Pins the dot to the parent's top-right corner (parent needs `position: relative`).
   * `false` = inline, flows with text. Default `true`.
   */
  anchored?: boolean;
  /** Color of the separating ring = the surface the dot sits on. Default `var(--cf-new-ring, var(--background))`. */
  ringColor?: string;
}

export const NewDot = React.forwardRef<HTMLSpanElement, NewDotProps>(function NewDot(
  {
    label = "nuevo",
    decorative = false,
    anchored = true,
    ringColor,
    delay,
    animate,
    className,
    style,
    ...rest
  },
  ref,
) {
  const motionProps = useEntrance({ delay, animate });
  return (
    <motion.span
      ref={ref}
      data-slot="new-dot"
      aria-hidden={decorative || undefined}
      {...motionProps}
      {...rest}
      className={cn(
        "pointer-events-none block size-2 shrink-0 rounded-full",
        anchored ? "absolute -right-0.5 -top-0.5" : "relative inline-block align-middle",
        className,
      )}
      style={{
        background: ACCENT,
        // A ring the colour of the surface separates the dot from the icon it overlaps.
        boxShadow: `0 0 0 2px ${ringColor ?? "var(--cf-new-ring, var(--background))"}`,
        ...style,
      }}
    >
      {!decorative && <span className="cf-sr-only"> {label}</span>}
    </motion.span>
  );
});

// ============================================
// NewChip
// ============================================

export interface NewChipProps extends MotionSpanProps, EntranceOptions {
  /** Visible text. Default «nuevo». Real text, so screen readers read it as-is. */
  children?: React.ReactNode;
  /** `soft` = tinted fill (default, for list rows) · `solid` = accent fill (for dense or busy rows). */
  tone?: "soft" | "solid";
}

export const NewChip = React.forwardRef<HTMLSpanElement, NewChipProps>(function NewChip(
  { children = "nuevo", tone = "soft", delay, animate, className, style, ...rest },
  ref,
) {
  const motionProps = useEntrance({ delay, animate });
  return (
    <motion.span
      ref={ref}
      data-slot="new-chip"
      data-tone={tone}
      {...motionProps}
      {...rest}
      className={cn(
        "inline-flex shrink-0 select-none items-center rounded-full px-1.5 py-px",
        "text-[10px] font-semibold uppercase leading-[14px] tracking-[0.06em]",
        className,
      )}
      style={{
        ...(tone === "solid"
          ? { background: ACCENT, color: "var(--primary-foreground)" }
          : {
              background: `color-mix(in srgb, ${ACCENT} 16%, transparent)`,
              // Pulled toward the foreground so it clears contrast on both themes.
              color: `color-mix(in srgb, ${ACCENT} 72%, var(--foreground))`,
            }),
        ...style,
      }}
    >
      {children}
    </motion.span>
  );
});
