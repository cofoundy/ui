"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotionConfig } from "framer-motion";

import { cn } from "../../utils/cn";
import { springTransition } from "../../lib/spring";

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
  /** Where the popover is portalled. Default `document.body`. */
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
  portalContainer,
  className,
  itemClassName,
  triggerClassName,
  popoverClassName,
  onVisibleCountChange,
}: NavRailOverflowProps<T>) {
  const reduce = useReducedMotionConfig() ?? false;
  const popoverId = React.useId();

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

  // ── popover position: anchored to the trigger, clamped to the viewport ──
  const popRef = React.useRef<HTMLDivElement>(null);
  const [pos, setPos] = React.useState<{ top: number; left: number; width: number; maxHeight: number } | null>(null);

  const place = React.useCallback(() => {
    const t = triggerRef.current;
    const p = popRef.current;
    if (!t || !p) return;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const tr = t.getBoundingClientRect();
    const ar = anchorRef?.current?.getBoundingClientRect() ?? tr;
    const width = Math.min(popoverWidth, vw - VIEWPORT_MARGIN * 2);
    const maxHeight = vh - VIEWPORT_MARGIN * 2;
    const h = Math.min(p.scrollHeight, maxHeight);
    // First row lines up with the trigger (minus the panel's padding), then clamp.
    const top = Math.max(VIEWPORT_MARGIN, Math.min(tr.top - 6, vh - h - VIEWPORT_MARGIN));
    let left = ar.right + sideOffset;
    if (left + width > vw - VIEWPORT_MARGIN) left = ar.left - sideOffset - width; // no room: flip
    left = Math.max(VIEWPORT_MARGIN, Math.min(left, vw - width - VIEWPORT_MARGIN));
    setPos((prev) =>
      prev && prev.top === top && prev.left === left && prev.width === width && prev.maxHeight === maxHeight
        ? prev
        : { top, left, width, maxHeight },
    );
  }, [anchorRef, popoverWidth, sideOffset]);

  useIsoLayoutEffect(() => {
    if (!open) {
      setPos(null);
      return;
    }
    place();
  }, [open, place, hiddenCount]);

  React.useEffect(() => {
    if (!open) return;
    const onResize = () => place();
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onResize, true);
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(onResize) : null;
    if (ro && popRef.current) ro.observe(popRef.current);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onResize, true);
      ro?.disconnect();
    };
  }, [open, place]);

  // ── dismissal: outside press, Esc, focus leaving ──
  const openedByKeyboard = React.useRef(false);
  React.useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (popRef.current?.contains(target) || triggerRef.current?.contains(target)) return;
      close();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.stopPropagation();
      close();
      triggerRef.current?.focus();
    };
    document.addEventListener("pointerdown", onDown, true);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown, true);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  // Opened from the keyboard → focus lands on the first row.
  React.useEffect(() => {
    if (!open || !pos || !openedByKeyboard.current) return;
    openedByKeyboard.current = false;
    focusables(popRef.current)[0]?.focus();
  }, [open, pos]);

  const onPopoverKeyDown = (e: React.KeyboardEvent) => {
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(e.key)) return;
    const els = focusables(popRef.current);
    if (!els.length) return;
    e.preventDefault();
    const i = els.indexOf(document.activeElement as HTMLElement);
    const next =
      e.key === "Home" ? 0 : e.key === "End" ? els.length - 1 : e.key === "ArrowDown" ? (i + 1) % els.length : (i - 1 + els.length) % els.length;
    els[next]?.focus();
  };

  const onPopoverBlur = (e: React.FocusEvent) => {
    const to = e.relatedTarget as Node | null;
    if (!to) return;
    if (popRef.current?.contains(to) || triggerRef.current?.contains(to)) return;
    close();
  };

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

  const portalTarget = portalContainer ?? (typeof document !== "undefined" ? document.body : null);

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
          <motion.button
            ref={triggerRef}
            type="button"
            data-slot="nav-rail-overflow-trigger"
            data-state={open ? "open" : "closed"}
            data-active={hiddenActive || undefined}
            aria-expanded={open}
            aria-controls={open ? popoverId : undefined}
            aria-haspopup="true"
            aria-label={ariaLabel}
            onClick={(e) => {
              openedByKeyboard.current = e.detail === 0;
              setOpen(!open);
            }}
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
                    on
                      ? "bg-[var(--nav-overflow-active-bg)]"
                      : "group-hover/overflow:bg-[var(--accent)]",
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
        </div>
      )}

      {portalTarget &&
        createPortal(
          <AnimatePresence>
            {open && hiddenCount > 0 && (
              <motion.div
                ref={popRef}
                id={popoverId}
                role="region"
                aria-label={typeof titleNode === "string" ? titleNode : ariaLabel}
                data-slot="nav-rail-overflow-popover"
                initial={reduce ? { opacity: 0 } : { opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0, transition: reduce ? REDUCED : SPRING_SMOOTH }}
                exit={{ opacity: 0, transition: EXIT }}
                onKeyDown={onPopoverKeyDown}
                onBlur={onPopoverBlur}
                className={cn(
                  "fixed z-50 flex flex-col rounded-[14px] border border-[var(--border)] bg-[var(--popover)] p-1.5 text-[var(--popover-foreground)]",
                  popoverClassName,
                )}
                style={{
                  ...TOKENS,
                  top: pos?.top ?? VIEWPORT_MARGIN,
                  left: pos?.left ?? VIEWPORT_MARGIN,
                  width: pos?.width ?? popoverWidth,
                  maxHeight: pos?.maxHeight ?? `calc(100dvh - ${VIEWPORT_MARGIN * 2}px)`,
                  visibility: pos ? "visible" : "hidden",
                  boxShadow: "var(--nav-overflow-shadow)",
                }}
              >
                <p className="shrink-0 px-2.5 pb-1 pt-1.5 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--muted-foreground)]">
                  {titleNode}
                </p>
                <motion.ul
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
                    return (
                      <motion.li key={keys[index]} variants={row}>
                        {newSection && (
                          <p className="mt-1 border-t border-[var(--border)] px-2.5 pb-1 pt-2.5 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--muted-foreground)]">
                            {section}
                          </p>
                        )}
                        {renderItem(item, { placement: "menu", index, close })}
                      </motion.li>
                    );
                  })}
                </motion.ul>
              </motion.div>
            )}
          </AnimatePresence>,
          portalTarget,
        )}
    </div>
  );
}

// ───────────────────────── row helper ─────────────────────────

export interface NavRailOverflowRowProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "onSelect" | "title"> {
  /** Icon element (16 px), drawn in a 32 px tile. */
  icon?: React.ReactNode;
  label: React.ReactNode;
  /** One-line hint; clamps to 2 lines. */
  description?: React.ReactNode;
  /** Something after the label (a «nuevo» chip, a count). */
  trailing?: React.ReactNode;
  active?: boolean;
  /** Renders an `<a>` instead of a `<button>`. */
  href?: string;
  onSelect?: () => void;
}

/**
 * A ready-made row for the «+N» popover (icon + label + description), 48 px tall, radius 8 inside
 * the 14 px panel with 6 px padding. Optional: `renderItem` can draw any row it wants.
 */
export const NavRailOverflowRow = React.forwardRef<HTMLElement, NavRailOverflowRowProps>(
  function NavRailOverflowRow({ icon, label, description, trailing, active, href, onSelect, className, onClick, ...rest }, ref) {
    const cls = cn(
      "flex min-h-12 w-full items-center gap-3 rounded-[8px] px-2.5 py-2 text-left outline-none transition-colors",
      "hover:bg-[var(--accent)] focus-visible:bg-[var(--accent)] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--ring)]",
      active && "bg-[var(--nav-overflow-active-bg)] hover:bg-[var(--nav-overflow-active-bg)]",
      className,
    );
    const body = (
      <>
        {icon && (
          <span
            aria-hidden
            className={cn(
              "flex size-8 shrink-0 items-center justify-center rounded-[8px] bg-[var(--muted)] [&_svg]:size-4",
              active ? "text-[var(--nav-overflow-active-fg)]" : "text-[var(--foreground)]",
            )}
          >
            {icon}
          </span>
        )}
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2 text-[14px] font-medium text-[var(--popover-foreground)]">
            <span className="truncate">{label}</span>
            {trailing}
          </span>
          {description && (
            <span className="mt-0.5 line-clamp-2 block text-[12px] leading-snug text-[var(--muted-foreground)]">
              {description}
            </span>
          )}
        </span>
      </>
    );
    const handle = (e: React.MouseEvent<HTMLElement>) => {
      onClick?.(e);
      if (!e.defaultPrevented) onSelect?.();
    };
    if (href) {
      return (
        <a
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={href}
          aria-current={active ? "page" : undefined}
          className={cls}
          onClick={handle}
          style={TOKENS}
          {...rest}
        >
          {body}
        </a>
      );
    }
    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        type="button"
        aria-current={active ? "page" : undefined}
        className={cls}
        onClick={handle}
        style={TOKENS}
        {...rest}
      >
        {body}
      </button>
    );
  },
);

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

function noop() {}

function focusables(root: HTMLElement | null): HTMLElement[] {
  if (!root) return [];
  return Array.from(
    root.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'),
  );
}
