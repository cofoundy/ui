import * as React from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotionConfig,
  type HTMLMotionProps,
} from "framer-motion";

import { cn } from "../../utils/cn";
import { springTransition } from "../../lib/spring";

/**
 * StatusPill — a dot + a short label for the state of a thing (connected, pending, paused…).
 *
 * Changing `tone` / `children` MORPHS the same pill: the colour cross-tints (CSS transition on
 * the smooth spring), the width springs to the new label's measured width (smooth), and the label
 * swaps by opacity only — the old one leaves (~80 ms) before the new one enters, never both at
 * once. Label text is small, so no blur (it flickers at this size).
 *
 * Colour is derived from ONE hue per tone (`--status-pill-hue`) mixed against the theme's
 * foreground/background, so it reads in light and dark and follows a re-branded `--chat-primary`
 * for `info`. Reduced motion: instant width, opacity-only label swap ≤ 120 ms.
 */
export type StatusPillTone = "ok" | "warn" | "danger" | "info" | "muted";

const TONE_HUE: Record<StatusPillTone, string> = {
  ok: "var(--status-success, #059669)",
  warn: "var(--status-warning, #D97706)",
  danger: "var(--status-error, #BE123C)",
  info: "var(--status-info, var(--primary, #46a0d0))",
  muted: "var(--muted-foreground, #94a3b8)",
};

const SIZE = {
  sm: { box: "h-5 gap-1.5 pl-2 pr-2.5 text-[11px]", dot: "size-1.5" },
  default: { box: "h-6 gap-2 pl-2.5 pr-3 text-xs", dot: "size-2" },
} as const;

export interface StatusPillProps
  extends Omit<HTMLMotionProps<"span">, "children" | "animate" | "initial" | "transition"> {
  /** Semantic tone. Default `muted`. */
  tone?: StatusPillTone;
  /** The label. A change of this (or of `tone`) morphs the pill. */
  children: React.ReactNode;
  /** Stable key for the label swap when `children` is not a string/number. */
  labelKey?: React.Key;
  /** `sm` (20 px) or `default` (24 px). */
  size?: keyof typeof SIZE;
  /** Show the leading dot. Default `true`. */
  dot?: boolean;
  /** Announce changes to assistive tech (`role="status"`, polite). Default `false`. */
  live?: boolean;
}

const LABEL_EXIT_S = 0.08;

export const StatusPill = React.forwardRef<HTMLSpanElement, StatusPillProps>(
  function StatusPill(
    { tone = "muted", children, labelKey, size = "default", dot = true, live = false, className, style, ...props },
    ref,
  ) {
    const reduce = useReducedMotionConfig() ?? false;
    const s = SIZE[size];
    const key =
      labelKey ?? (typeof children === "string" || typeof children === "number" ? String(children) : "label");

    const colorTransition = reduce
      ? "none"
      : ["background-color", "color", "box-shadow"]
          .map((p) => `${p} var(--cf-spring-smooth-duration, 592ms) var(--cf-spring-smooth, ease-out)`)
          .join(", ");

    // The width morph: the inner row sizes to its content (max-content); the outer shell
    // springs its width to that measurement. Explicit width, not `layout` scale — a scaled
    // pill would squash its own label mid-flight.
    const innerRef = React.useRef<HTMLSpanElement>(null);
    const [width, setWidth] = React.useState<number | null>(null);
    React.useLayoutEffect(() => {
      const el = innerRef.current;
      if (!el) return;
      setWidth(el.offsetWidth);
      if (typeof ResizeObserver === "undefined") return;
      const ro = new ResizeObserver(() => setWidth(el.offsetWidth));
      ro.observe(el);
      return () => ro.disconnect();
    }, []);

    return (
      <motion.span
        ref={ref}
        initial={false}
        animate={width == null ? undefined : { width }}
        transition={reduce ? { duration: 0 } : springTransition("smooth")}
        data-tone={tone}
        role={live ? "status" : undefined}
        aria-live={live ? "polite" : undefined}
        className={cn(
          "inline-flex shrink-0 items-center overflow-hidden whitespace-nowrap align-middle font-medium leading-none",
          className,
        )}
        style={
          {
            "--status-pill-hue": TONE_HUE[tone],
            borderRadius: 999,
            color: "color-mix(in srgb, var(--status-pill-hue) 62%, var(--foreground, #0f172a))",
            backgroundColor: "color-mix(in srgb, var(--status-pill-hue) 13%, transparent)",
            boxShadow: "inset 0 0 0 1px color-mix(in srgb, var(--status-pill-hue) 26%, transparent)",
            transition: colorTransition,
            ...style,
          } as React.CSSProperties as HTMLMotionProps<"span">["style"]
        }
        {...props}
      >
        <span ref={innerRef} className={cn("inline-flex w-max shrink-0 items-center", s.box)}>
          {dot && (
            <span
              aria-hidden
              className={cn("shrink-0 rounded-full", s.dot)}
              style={{
                backgroundColor: "var(--status-pill-hue)",
                transition: reduce
                  ? "none"
                  : "background-color var(--cf-spring-smooth-duration, 592ms) var(--cf-spring-smooth, ease-out)",
              }}
            />
          )}
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={key}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: reduce ? { duration: 0.12, ease: "linear" } : { ...springTransition("smooth"), delay: 0.1 } }}
              exit={{ opacity: 0, transition: { duration: reduce ? 0.06 : LABEL_EXIT_S, ease: "linear" } }}
            >
              {children}
            </motion.span>
          </AnimatePresence>
        </span>
      </motion.span>
    );
  },
);
