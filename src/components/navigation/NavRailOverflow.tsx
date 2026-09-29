"use client";

import * as React from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { AnimatePresence, motion, useReducedMotionConfig } from "framer-motion";

import { cn } from "../../utils/cn";
import { springTransition } from "../../lib/spring";
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuTrigger } from "../ui/dropdown-menu";

/**
 * NavRailOverflow — a vertical rail region that MEASURES the height it has (ResizeObserver) and
 * collapses whatever does not fit into one «+N Más» item. Its popover anchors to that item and
 * ALWAYS stays inside the viewport (8 px margins): fixed title, list that scrolls inside, rows
 * that enter in a short cascade. The rail itself never scrolls.
 *
 * Generic: it knows nothing about destinations. It receives `items` (already in priority order —
 * the ones that must stay visible go first) and a `renderItem` that draws an item either in the
 * rail (`placement: "rail"`) or as a row of the popover (`placement: "menu"`).
 *
 *   <NavRailOverflow
 *     items={destinos}
 *     getKey={(d) => d.key}
 *     isItemActive={(d) => d.key === ruta}
 *     renderItem={(d, { placement, close }) =>
 *       placement === "rail"
 *         ? <NavRailItem … />
 *         : <NavRailOverflowRow icon={<d.icon />} label={d.label} description={d.desc}
 *             active={d.key === ruta} onSelect={() => { close(); ir(d.key); }} />}
 *   />
 *
 * Put it where the rail's flexible middle is (`flex-1` inside a column with a fixed top and
 * bottom): it fills that space and decides how much of `items` fits.
 */

// ───────────────────────── motion (springs from lib/spring only) ─────────────────────────

/** Popovers and content swaps. */
const SPRING_SMOOTH = springTransition("smooth");
/** Presses and small pops. */
const SPRING_SNAPPY = springTransition("snappy");
/** Content leaves first: ≈80 ms of opacity, then the new content enters. */
const EXIT = { duration: 0.08, ease: "linear" as const };
/** With reduced motion: opacity only, ≤120 ms. */
const REDUCED = { duration: 0.12, ease: "linear" as const };
/** Rows of the popover: a short cascade that finishes in < 180 ms. */
const STAGGER = 0.025;

/** Viewport margin the popover never crosses. */
const VIEWPORT_MARGIN = 8;

// ───────────────────────── types ─────────────────────────

export interface NavRailOverflowRenderContext {
  /** Where the item is being drawn: in the rail, or as a row inside the «+N» popover. */
  placement: "rail" | "menu";
  /** Index of the item in `items`. */
  index: number;
  /** Closes the popover (no-op in the rail). Call it when a row navigates. */
  close: () => void;
}

export interface NavRailOverflowTriggerContext {
  /** How many items went to the popover. */
  count: number;
  open: boolean;
  /** One of the hidden items is the active one (`isItemActive`). */
  active: boolean;
}

export interface NavRailOverflowProps<T> {
  /** Items in PRIORITY order: whatever does not fit is taken from the end. */
  items: readonly T[];
  /** Draws one item. `placement` tells you whether it lives in the rail or in the popover. */
  renderItem: (item: T, ctx: NavRailOverflowRenderContext) => React.ReactNode;
  /** Stable key per item (required for measuring: heights are cached by key). */
  getKey: (item: T, index: number) => React.Key;
  /** Marks the «+N» trigger active when the active item is one of the hidden ones. */
  isItemActive?: (item: T) => boolean;
  /**
   * Optional section per item. In the popover, a kicker + hairline is drawn where the section
   * changes (never above the first row: the title already heads it).
   */
  getSection?: (item: T) => string | undefined;
  /** Popover title. A function receives the hidden items (e.g. «Otras funciones» if all are plugins). */
  title?: React.ReactNode | ((hidden: T[]) => React.ReactNode);
  /** Label under the «+N» pill when the rail shows names (`showLabel`). Default «Más». */
  label?: React.ReactNode;
  /** Rail with names (≈76 px): the trigger shows a pill «+N» and `label` under it. */
  showLabel?: boolean;
  /** Accessible name of the trigger. Default: `${label}: N más`. */
  triggerAriaLabel?: (count: number) => string;
  /** Replaces the CONTENT of the trigger (the button, its aria and its press stay ours). */
  renderTrigger?: (ctx: NavRailOverflowTriggerContext) => React.ReactNode;
  /** Never show fewer than this many items in the rail (even if they overflow). Default 1. */
  minVisible?: number;
  /** Show at most this many, even if there is room (more is noise). Default: no cap. */
  maxVisible?: number;
  /** Popover width in px (clamped to the viewport). Default 280. */
  popoverWidth?: number;
  /** Gap between the anchor and the popover. Default 8. */
  sideOffset?: number;
  /**
   * Element whose horizontal edge the popover aligns to (e.g. the whole `<aside>` so it opens
   * past the rail's border). Default: the trigger itself.
   */
  anchorRef?: React.RefObject<HTMLElement | null>;
  /** Controlled open state (optional). */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /**
   * @deprecated No-op since the popover became the package `DropdownMenuContent` (always
   * portalled to `document.body`). Kept so existing callers still type-check.
   */
  portalContainer?: HTMLElement | null;
  /** Class of the measured column (it is `flex-1 min-h-0 overflow-hidden flex-col`). */
  className?: string;
  /** Class of each item's wrapper in the rail. */
  itemClassName?: string;
  /** Class of the «+N» button. */
  triggerClassName?: string;
  /** Class of the popover panel. */
  popoverClassName?: string;
  /** Called with the number of items shown in the rail whenever it changes. */
  onVisibleCountChange?: (visible: number) => void;
}

// ───────────────────────── hooks ─────────────────────────

const useIsoLayoutEffect = typeof window === "undefined" ? React.useEffect : React.useLayoutEffect;

function sum(xs: number[]) {
  let s = 0;
  for (const x of xs) s += x;
  return s;
}

// ───────────────────────── component ─────────────────────────

export function NavRailOverflow<T>({
  items,
  renderItem,
  getKey,
  isItemActive,
  getSection,
  title,
  label = "Más",
  showLabel = false,
  triggerAriaLabel,
  renderTrigger,
  minVisible = 1,
  maxVisible,
  popoverWidth = 280,
  sideOffset = 8,
  anchorRef,
  open: openProp,
  onOpenChange,
  className,
  itemClassName,
  triggerClassName,
  popoverClassName,
  onVisibleCountChange,
}: NavRailOverflowProps<T>) {
  const reduce = useReducedMotionConfig() ?? false;

  // ── open state (controlled or not) ──
  const [openState, setOpenState] = React.useState(false);
  const open = openProp ?? openState;
  const setOpen = React.useCallback(
    (next: boolean) => {
      if (openProp === undefined) setOpenState(next);
      onOpenChange?.(next);
    },
    [openProp, onOpenChange],
  );
  const close = React.useCallback(() => setOpen(false), [setOpen]);

  // ── measurement ──
  // `null` = everything fits. Otherwise, how many items stay in the rail (the rest go to «+N»).
  const [visibleCount, setVisibleCount] = React.useState<number | null>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const itemEls = React.useRef(new Map<React.Key, HTMLElement>());
  const heights = React.useRef(new Map<React.Key, number>());
  const triggerHeight = React.useRef<number | null>(null);
  // Safety net: if the estimate still overflows (rounding, margins), take one more away.
  // Reset whenever the available height or the items change.
  const correction = React.useRef(0);

  const keys = items.map((it, i) => getKey(it, i));
  const keySig = keys.join("\u0000");

  const measure = React.useCallback(() => {
    const c = containerRef.current;
    if (!c) return;
    for (const [k, el] of itemEls.current) heights.current.set(k, el.getBoundingClientRect().height);
    if (triggerRef.current) triggerHeight.current = triggerRef.current.getBoundingClientRect().height;

    const n = keys.length;
    const known = keys.map((k) => heights.current.get(k)).filter((h): h is number => h !== undefined);
    const avg = known.length ? sum(known) / known.length : 40;
    const hs = keys.map((k) => heights.current.get(k) ?? avg);
    const trig = triggerHeight.current ?? avg;
    const gap = parseFloat(getComputedStyle(c).rowGap || "0") || 0;
    const avail = c.clientHeight;
    const cap = maxVisible ?? Infinity;
    const EPS = 0.5;

    let next: number | null;
    if (n <= cap && sum(hs) + gap * Math.max(0, n - 1) <= avail + EPS) {
      next = null;
    } else {
      let used = trig;
      let k = 0;
      while (k < n && k < cap && used + hs[k] + gap <= avail + EPS) {
        used += hs[k] + gap;
        k++;
      }
      k = Math.max(Math.min(minVisible, n), k - correction.current);
      next = k >= n ? null : k;
    }
    setVisibleCount((prev) => (prev === next ? prev : next));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keySig, maxVisible, minVisible]);

  // Items changed → forget the correction and re-measure.
  useIsoLayoutEffect(() => {
    correction.current = 0;
  }, [keySig, maxVisible, minVisible]);

  // Every render: cache heights of what is on screen and decide (setState is guarded, it converges).
  useIsoLayoutEffect(() => {
    measure();
    const c = containerRef.current;
    if (c && visibleCount !== null && c.scrollHeight > c.clientHeight + 1 && visibleCount > minVisible) {
      correction.current += 1;
      measure();
    }
  });

  // The available height changes → re-measure from scratch.
  useIsoLayoutEffect(() => {
    const c = containerRef.current;
    if (!c || typeof ResizeObserver === "undefined") return;
    let lastH = c.clientHeight;
    const ro = new ResizeObserver(() => {
      if (c.clientHeight === lastH) return;
      lastH = c.clientHeight;
      correction.current = 0;
      measure();
    });
    ro.observe(c);
    return () => ro.disconnect();
  }, [measure]);

  const shownCount = visibleCount ?? items.length;
  React.useEffect(() => {
    onVisibleCountChange?.(shownCount);
  }, [shownCount, onVisibleCountChange]);

  const hidden = React.useMemo(() => items.slice(shownCount), [items, shownCount]);
  const hiddenCount = hidden.length;
  const hiddenActive = !!isItemActive && hidden.some(isItemActive);

  // Nothing left to hide → nothing to show in a popover.
  React.useEffect(() => {
    if (open && hiddenCount === 0) close();
  }, [open, hiddenCount, close]);

  // `anchorRef`: the popover opens past that element's edge instead of the trigger's. Radix
  // anchors to the trigger, so the difference becomes extra side offset, measured on open.
  const [extraOffset, setExtraOffset] = React.useState(0);
  useIsoLayoutEffect(() => {
    if (!open) return;
    const t = triggerRef.current?.getBoundingClientRect();
    const a = anchorRef?.current?.getBoundingClientRect();
    const next = t && a ? Math.max(0, Math.round(a.right - t.right)) : 0;
    setExtraOffset((prev) => (prev === next ? prev : next));
  }, [open, anchorRef]);

  // ── render ──
  const titleNode = typeof title === "function" ? title(hidden) : (title ?? label);
  const ariaLabel = triggerAriaLabel
    ? triggerAriaLabel(hiddenCount)
    : `${typeof label === "string" ? label : "Más"}: ${hiddenCount} más`;
  const on = open || hiddenActive;

  const list = { hidden: {}, show: { transition: { staggerChildren: reduce ? 0 : STAGGER } } };
  const row = reduce
    ? { hidden: { opacity: 0 }, show: { opacity: 1, transition: REDUCED } }
    : { hidden: { opacity: 0, y: 4 }, show: { opacity: 1, y: 0, transition: SPRING_SNAPPY } };

  const setItemEl = (k: React.Key) => (el: HTMLElement | null) => {
    if (el) itemEls.current.set(k, el);
    else itemEls.current.delete(k);
  };

  return (
    <div
      ref={containerRef}
      data-slot="nav-rail-overflow"
      data-overflowing={hiddenCount > 0 || undefined}
      className={cn("flex min-h-0 w-full flex-1 flex-col items-center gap-1 overflow-hidden", className)}
    >
      {items.slice(0, shownCount).map((item, index) => {
        const k = keys[index];
        return (
          <div
            key={k}
            ref={setItemEl(k)}
            data-slot="nav-rail-overflow-item"
            className={cn("flex w-full shrink-0 justify-center", itemClassName)}
          >
            {renderItem(item, { placement: "rail", index, close: noop })}
          </div>
        );
      })}

      {hiddenCount > 0 && (
        <div className="flex w-full shrink-0 justify-center">
          {/* Non-modal: the rest of the rail stays hoverable while the list is open. Radix gives
              us Esc/outside-press dismissal, focus on open-by-keyboard, arrow keys and typeahead. */}
          <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
            <DropdownMenuTrigger asChild>
              <motion.button
                ref={triggerRef}
                type="button"
                data-slot="nav-rail-overflow-trigger"
                data-active={hiddenActive || undefined}
                aria-label={ariaLabel}
                whileTap={reduce ? undefined : { scale: 0.94 }}
                transition={SPRING_SNAPPY}
                className={cn(
                  "group/overflow flex items-center justify-center text-[var(--muted-foreground)] outline-none transition-colors hover:text-[var(--foreground)] focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
                  showLabel ? "w-full flex-col gap-1 rounded-[10px] px-1 py-1.5" : "size-9 rounded-[10px]",
                  on && "text-[var(--nav-overflow-active-fg)] hover:text-[var(--nav-overflow-active-fg)]",
                  triggerClassName,
                )}
                style={TOKENS}
              >
                {renderTrigger ? (
                  renderTrigger({ count: hiddenCount, open, active: hiddenActive })
                ) : (
                  <>
                    <span
                      className={cn(
                        "flex items-center justify-center overflow-hidden font-mono text-[12px] font-semibold tabular-nums transition-colors",
                        showLabel ? "h-7 w-11 rounded-full" : "size-9 rounded-[10px]",
                        on ? "bg-[var(--nav-overflow-active-bg)]" : "group-hover/overflow:bg-[var(--accent)]",
                      )}
                    >
                      {/* The count changes when the window resizes: old number leaves, new one enters.
                          Text is 12 px → opacity only (blur flickers on small text). */}
                      <AnimatePresence mode="wait" initial={false}>
                        <motion.span
                          key={hiddenCount}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1, transition: reduce ? REDUCED : SPRING_SMOOTH }}
                          exit={{ opacity: 0, transition: EXIT }}
                        >
                          +{hiddenCount}
                        </motion.span>
                      </AnimatePresence>
                    </span>
                    {showLabel && <span className="text-center text-[10.5px] font-medium leading-none">{label}</span>}
                  </>
                )}
              </motion.button>
            </DropdownMenuTrigger>

            {/* The package surface: grows out of the trigger (smooth), stays 8 px inside the
                viewport (`collisionPadding`), flips left when there is no room on the right.
                Title fixed; only the list scrolls. First row lines up with the trigger
                (alignOffset = −panel padding). */}
            <DropdownMenuContent
              side="right"
              align="start"
              sideOffset={sideOffset + extraOffset}
              alignOffset={-6}
              collisionPadding={VIEWPORT_MARGIN}
              aria-label={typeof titleNode === "string" ? titleNode : ariaLabel}
              data-slot="nav-rail-overflow-popover"
              className={cn(
                "flex flex-col overflow-hidden rounded-[14px] p-1.5",
                "max-h-[var(--radix-dropdown-menu-content-available-height)]",
                popoverClassName,
              )}
              style={{
                ...TOKENS,
                width: `min(${popoverWidth}px, calc(100vw - ${VIEWPORT_MARGIN * 2}px))`,
                boxShadow: "var(--nav-overflow-shadow)",
              }}
            >
              <DropdownMenuLabel className={cn(KICKER, "shrink-0 pb-1 pt-1.5")}>{titleNode}</DropdownMenuLabel>
              <motion.ul
                role="none"
                className="min-h-0 overflow-y-auto overscroll-contain"
                variants={list}
                initial="hidden"
                animate="show"
              >
                {hidden.map((item, i) => {
                  const index = shownCount + i;
                  const section = getSection?.(item);
                  const prevSection = i > 0 ? getSection?.(hidden[i - 1]) : undefined;
                  const newSection = !!getSection && i > 0 && section !== prevSection && !!section;
                  const node = renderItem(item, { placement: "menu", index, close });
                  return (
                    <motion.li key={keys[index]} role="none" variants={row}>
                      {newSection && (
                        <DropdownMenuLabel className={cn(KICKER, "mt-1 border-t border-[var(--border)] pb-1 pt-2.5")}>
                          {section}
                        </DropdownMenuLabel>
                      )}
                      {/* A single element becomes a Radix menu item (roving focus, typeahead,
                          select closes the menu). It must forward its ref and props — NavListRow does. */}
                      {React.isValidElement(node) ? <DropdownMenuPrimitive.Item asChild>{node}</DropdownMenuPrimitive.Item> : node}
                    </motion.li>
                  );
                })}
              </motion.ul>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );
}

// ───────────────────────── row helper ─────────────────────────

/**
 * `NavRailOverflowRow` is the shared `NavListRow` (`size="sm"`), re-exported under its old name.
 * Optional: `renderItem` can draw any row it wants.
 */
export { NavRailOverflowRow, type NavRailOverflowRowProps } from "./NavListRow";

// ───────────────────────── internals ─────────────────────────

/**
 * Local tokens (proposed for index.css): the active tint and the floating shadow. Consumers can
 * override them on any ancestor; these are only the fallbacks.
 */
const TOKENS = {
  "--nav-overflow-active-bg": "var(--cf-nav-active-bg, color-mix(in oklab, var(--primary) 16%, transparent))",
  "--nav-overflow-active-fg": "var(--cf-nav-active-fg, var(--primary))",
  "--nav-overflow-shadow": "var(--cf-shadow-float, 0 12px 32px rgb(0 0 0 / 0.18), 0 2px 6px rgb(0 0 0 / 0.08))",
} as React.CSSProperties;

/** Kicker of the popover title and of each section (overrides DropdownMenuLabel's text-sm). */
const KICKER =
  "px-2.5 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--muted-foreground)]";

function noop() {}
