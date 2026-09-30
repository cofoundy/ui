"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { AnimatePresence, motion, useReducedMotionConfig } from "framer-motion";

import { cn } from "../../utils/cn";
import { springTransition } from "../../lib/spring";
import { EdgeLayers, useEdgeIndicator } from "../ui/edge-layers";
import { Badge } from "../ui/badge";
import { NewDot } from "./NewIndicator";

/**
 * TabBar — bottom navigation for phones (max. 5 destinations).
 *
 *  - ONE pill travels behind the active icon with two edges (EdgeLayers, the same machinery
 *    as Tabs and Switch): the leading edge on `--cf-spring-edge`, the trailing one on
 *    `--cf-spring-smooth` compressed to `--cf-duration-trail`. It stretches toward the target
 *    and settles; nothing animates a length. No slide-in on mount or after an "empty" state.
 *  - Numeric badge = `Badge count` (pop on the snappy spring, digit swap, enter/leave at 0);
 *    the "new" dot = `NewDot` (enters once, never pulses). The pill is driven by `useEdgeIndicator`.
 *  - Press = `whileTap` scale .96 on the item's content.
 *  - Safe-area: the bar adds `env(safe-area-inset-bottom)` below its 56 px row (needs
 *    `viewport-fit=cover` in the page's viewport meta to be non-zero).
 *  - Reduced motion (OS setting or `<MotionConfig reducedMotion="always">`): instant.
 *
 * Proposed tokens (defined locally here, not in index.css): `--cf-tabbar-h` (56px) and
 * `--cf-tabbar-space` (= h + safe-area), which a scroll container can use as bottom padding.
 */

const MAX_ITEMS = 5;

interface TabBarContextValue {
  value?: string;
  select: (value: string) => void;
  reduced: boolean;
}

const TabBarContext = React.createContext<TabBarContextValue | null>(null);

export interface TabBarProps extends Omit<React.HTMLAttributes<HTMLElement>, "onChange"> {
  /** Value of the active item. An item can also force `active` itself. */
  value?: string;
  /** Called with the item's `value` when an item is pressed. */
  onValueChange?: (value: string) => void;
  /**
   * `fixed` (default) pins the bar to the bottom of the viewport; `static` leaves positioning
   * to you (e.g. inside a phone frame or a storybook canvas).
   */
  position?: "fixed" | "static";
  /** Accessible name of the `<nav>`. */
  "aria-label"?: string;
}

export const TabBar = React.forwardRef<HTMLElement, TabBarProps>(function TabBar(
  {
    value,
    onValueChange,
    position = "fixed",
    className,
    style,
    children,
    "aria-label": ariaLabel = "Navegación principal",
    ...props
  },
  ref,
) {
  const reduced = useReducedMotionConfig() === true;
  const navRef = React.useRef<HTMLElement | null>(null);
  const pillRef = React.useRef<HTMLSpanElement | null>(null);

  const setRefs = React.useCallback(
    (node: HTMLElement | null) => {
      navRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) (ref as React.MutableRefObject<HTMLElement | null>).current = node;
    },
    [ref],
  );

  if (process.env.NODE_ENV !== "production") {
    const count = React.Children.toArray(children).filter(React.isValidElement).length;
    if (count > MAX_ITEMS) {
      console.warn(`[TabBar] ${count} items: a tab bar holds at most ${MAX_ITEMS}. Move the rest to a "Más" sheet.`);
    }
  }

  // Nothing active (e.g. a screen that lives in "Más") hides the pill and forgets the position,
  // so the next active item gets the pill in place instead of sliding in from a stale spot.
  useEdgeIndicator(
    navRef,
    pillRef,
    '[data-slot="tab-bar-item"][data-active] [data-slot="tab-bar-anchor"]',
    { observe: ["data-active"], reduced, resetOnEmpty: true, armReady: false },
  );

  const ctx = React.useMemo<TabBarContextValue>(
    () => ({ value, select: (v) => onValueChange?.(v), reduced }),
    [value, onValueChange, reduced],
  );

  return (
    <TabBarContext.Provider value={ctx}>
      <nav
        ref={setRefs}
        data-slot="tab-bar"
        aria-label={ariaLabel}
        className={cn(
          "z-40 flex items-stretch bg-[var(--popover)] text-[var(--popover-foreground)]",
          position === "fixed" && "fixed inset-x-0 bottom-0",
          position === "static" && "relative w-full",
          className,
        )}
        style={
          {
            "--cf-tabbar-h": "56px",
            "--cf-tabbar-space": "calc(var(--cf-tabbar-h) + env(safe-area-inset-bottom, 0px))",
            height: "var(--cf-tabbar-space)",
            paddingBottom: "env(safe-area-inset-bottom, 0px)",
            // A raised surface separated by height, not by a hard rule: a hairline plus a soft lift.
            boxShadow:
              "0 -1px 0 var(--border), 0 -6px 20px color-mix(in srgb, var(--foreground) 6%, transparent)",
            ...style,
          } as React.CSSProperties
        }
        {...props}
      >
        {/* The travelling pill: a full-width frame aligned with the icon slots; EdgeLayers paint
            only [left, right] of the active anchor. */}
        <span
          ref={pillRef}
          data-slot="tab-bar-pill"
          aria-hidden
          data-empty=""
          className="pointer-events-none absolute inset-x-0 top-1.5 block h-8 overflow-clip opacity-100 data-[empty]:opacity-0"
          style={
            {
              "--cf-edge-rad": "16px",
              "--cf-edge-fill": "color-mix(in srgb, var(--primary) 16%, transparent)",
            } as React.CSSProperties
          }
        >
          <EdgeLayers />
        </span>
        {children}
      </nav>
    </TabBarContext.Provider>
  );
});

export interface TabBarItemProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  /** Identifies the item; `TabBar`'s `value` activates it and `onValueChange` receives it. */
  value: string;
  /** Visible label (short: one word fits best at 375 px). */
  label: React.ReactNode;
  /** Icon element (e.g. `<MessageCircle />`); sized to 20 px unless it sets its own size. */
  icon: React.ReactNode;
  /** Force the active state regardless of `TabBar`'s `value` (e.g. "Más" while its sheet is open). */
  active?: boolean;
  /** Numeric badge; hidden at 0 / undefined. Pops when it changes. */
  badge?: number;
  /** Above this the badge reads `{max}+`. Default 99. */
  badgeMax?: number;
  /** Screen-reader text for the badge, e.g. "3 sin leer". Defaults to the number. */
  badgeLabel?: string;
  /** Small dot (e.g. something new inside). Ignored while a numeric badge shows. */
  dot?: boolean;
  /** Screen-reader text for the dot. Default "nuevo". */
  dotLabel?: string;
  /** Render your own element (e.g. a router `<Link>`) instead of the `<button>`. */
  asChild?: boolean;
  children?: React.ReactElement;
}

export const TabBarItem = React.forwardRef<HTMLButtonElement, TabBarItemProps>(function TabBarItem(
  {
    value,
    label,
    icon,
    active: activeProp,
    badge,
    badgeMax = 99,
    badgeLabel,
    dot,
    dotLabel = "nuevo",
    asChild,
    className,
    onClick,
    children,
    ...props
  },
  ref,
) {
  const ctx = React.useContext(TabBarContext);
  const reduced = ctx?.reduced ?? false;
  const active = activeProp ?? (ctx?.value !== undefined && ctx.value === value);
  const showBadge = typeof badge === "number" && badge > 0;
  const badgeText = showBadge ? (badge > badgeMax ? `${badgeMax}+` : String(badge)) : "";
  const Comp = asChild ? Slot : "button";

  const content = (
    <motion.span
      className="flex h-full w-full flex-col items-center gap-1 pt-1.5"
      whileTap={reduced ? undefined : { scale: 0.96 }}
      transition={springTransition("snappy")}
    >
      <span
        data-slot="tab-bar-anchor"
        className={cn(
          "relative flex h-8 w-14 items-center justify-center rounded-full",
          "text-[var(--muted-foreground)] transition-colors [transition-duration:var(--cf-spring-smooth-duration)] [transition-timing-function:var(--cf-spring-smooth)]",
          "group-hover:text-[var(--foreground)]",
          active && "text-[var(--primary)] group-hover:text-[var(--primary)]",
          "group-focus-visible:ring-2 group-focus-visible:ring-[var(--ring)]",
          "[&_svg:not([class*='size-'])]:size-5 [&_svg]:shrink-0",
        )}
      >
        {icon}
        {/* Counter: Badge owns the pop (snappy), the digit swap and its own enter/leave at 0.
            aria-hidden: the item's sr-only text below carries `badgeLabel`. */}
        <span aria-hidden className="absolute -top-0.5 right-1.5">
          <Badge
            count={showBadge ? badge : 0}
            max={badgeMax}
            size="sm"
            data-slot="tab-bar-badge"
            className="text-[11px] font-semibold"
            style={{ borderRadius: 9999, boxShadow: "0 0 0 2px var(--popover)" }}
          />
        </span>
        <AnimatePresence initial={false}>
          {!showBadge && dot ? (
            <NewDot key="dot" decorative ringColor="var(--popover)" className="right-3 top-0.5" />
          ) : null}
        </AnimatePresence>
      </span>
      <span
        className={cn(
          "w-full truncate px-0.5 text-center text-xs font-medium leading-none",
          "text-[var(--muted-foreground)] transition-colors [transition-duration:var(--cf-spring-smooth-duration)] [transition-timing-function:var(--cf-spring-smooth)]",
          active && "text-[var(--foreground)]",
        )}
      >
        {label}
      </span>
      {showBadge ? (
        <span className="sr-only">, {badgeLabel ?? badgeText}</span>
      ) : dot ? (
        <span className="sr-only">, {dotLabel}</span>
      ) : null}
    </motion.span>
  );

  return (
    <Comp
      ref={ref}
      type={asChild ? undefined : "button"}
      data-slot="tab-bar-item"
      data-value={value}
      data-active={active ? "" : undefined}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group relative z-[1] flex min-w-0 flex-1 select-none outline-none [-webkit-tap-highlight-color:transparent]",
        "disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(e);
        if (!e.defaultPrevented) ctx?.select(value);
      }}
      {...props}
    >
      {asChild && React.isValidElement(children)
        ? React.cloneElement(children as React.ReactElement<{ children?: React.ReactNode }>, undefined, content)
        : content}
    </Comp>
  );
});
