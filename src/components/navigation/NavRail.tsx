import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useReducedMotionConfig,
} from "framer-motion";

import { cn } from "../../utils/cn";
import { springTransition } from "../../lib/spring";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

/**
 * NavRail — vertical icon rail for app shells.
 *
 * Two modes:
 * - **icon rail** (default): 56 px of icons; the label is the tooltip and the accessible name.
 * - **`expandOnHover`**: on mouse hover (after `expandDelay`) or keyboard focus the rail grows
 *   OVER the content to `expandedWidth`, showing every name. It never pushes layout — the rail
 *   reserves only its collapsed width. `pinned` keeps it open AND reserves the full width.
 *
 * Motion (all from `lib/spring.ts`, all instant with reduced motion):
 * - expand/collapse: clip-path reveal on `smooth`; labels fade in after the reveal starts,
 *   fade out first (80 ms, opacity only — rail labels are < 14 px, blur would flicker).
 * - active indicator: ONE element that travels between items (`layoutId`) on `edge`.
 * - press: the icon pill scales to .94 on `snappy`.
 * - new dot: scales in once on `snappy`, never pulses.
 */

// ─────────────────────────────── tokens ───────────────────────────────

/** Proposed tokens (local until the architect lifts them into styles/index.css). */
const ACTIVE_BG = "var(--cf-nav-active-bg, color-mix(in oklab, var(--primary) 16%, transparent))";
const ACTIVE_FG = "var(--cf-nav-active-fg, var(--primary))";
const HOVER_BG = "var(--cf-nav-hover-bg, color-mix(in oklab, var(--sidebar-foreground, var(--foreground)) 7%, transparent))";
const RAIL_BG = "var(--sidebar-background, var(--background))";
const RAIL_BORDER = "var(--sidebar-border, var(--border))";

const SMOOTH = springTransition("smooth");
const EDGE = springTransition("edge");
const SNAPPY = springTransition("snappy");
const INSTANT = { duration: 0 } as const;
const LABEL_EXIT = { type: "tween", ease: "linear", duration: 0.08 } as const;
const LABEL_EXIT_REDUCED = { type: "tween", ease: "linear", duration: 0.12 } as const;

// ─────────────────────────────── context ───────────────────────────────

interface NavRailContextValue {
  /** Labels are visible (hover-expanded or pinned). */
  expanded: boolean;
  /** Rail is in expandOnHover mode (labels exist in the layout). */
  expandable: boolean;
  collapsedWidth: number;
  expandedWidth: number;
  reduce: boolean;
  newLabel: string;
}

const NavRailContext = React.createContext<NavRailContextValue | null>(null);

function useNavRail(component: string) {
  const ctx = React.useContext(NavRailContext);
  if (!ctx) throw new Error(`<${component}> must be rendered inside <NavRail>`);
  return ctx;
}

// ─────────────────────────────── NavRail ───────────────────────────────

/** HTML props that framer-motion redefines with its own signatures. */
type MotionConflicts =
  | "onAnimationStart" | "onAnimationEnd" | "onAnimationIteration"
  | "onDrag" | "onDragStart" | "onDragEnd" | "onDragEnter" | "onDragLeave" | "onDragOver" | "onDragExit" | "onDrop";

export interface NavRailProps extends Omit<React.HTMLAttributes<HTMLElement>, "children" | MotionConflicts> {
  children: React.ReactNode;
  /** Slot above the items (brand / workspace switcher). */
  header?: React.ReactNode;
  /** Slot pinned to the bottom (settings, avatar). Never pushed away by the items. */
  footer?: React.ReactNode;
  /** Grow over the content on hover / keyboard focus, showing every label. Default false. */
  expandOnHover?: boolean;
  /** Keep the rail expanded and reserve its full width (pushes layout). Only with expandOnHover. */
  pinned?: boolean;
  /** Collapsed width in px (48–56). Default 56. */
  collapsedWidth?: number;
  /** Expanded width in px. Default 220. */
  expandedWidth?: number;
  /** Hover delay before expanding, ms. Collapse is immediate. Default 120. */
  expandDelay?: number;
  /** Fires when the hover/focus expansion changes (not when `pinned` changes). */
  onExpandedChange?: (expanded: boolean) => void;
  /** Accessible text appended to items with `isNew`. Default "nuevo". */
  newLabel?: string;
}

export function NavRail({
  children,
  header,
  footer,
  expandOnHover = false,
  pinned = false,
  collapsedWidth = 56,
  expandedWidth = 220,
  expandDelay = 120,
  onExpandedChange,
  newLabel = "nuevo",
  className,
  style,
  "aria-label": ariaLabel = "Principal",
  ...props
}: NavRailProps) {
  const reduce = useReducedMotionConfig() ?? false;
  const layoutGroupId = React.useId();
  const [hovered, setHovered] = React.useState(false);
  const [keyboardFocus, setKeyboardFocus] = React.useState(false);
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const isPinned = expandOnHover && pinned;
  const floating = expandOnHover && !isPinned && (hovered || keyboardFocus);
  const expanded = isPinned || floating;

  const lastReported = React.useRef(floating);
  React.useEffect(() => {
    if (lastReported.current === floating) return;
    lastReported.current = floating;
    onExpandedChange?.(floating);
  }, [floating, onExpandedChange]);

  React.useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const clearTimer = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  };

  const handlers = expandOnHover
    ? {
        onPointerEnter: (e: React.PointerEvent) => {
          if (e.pointerType !== "mouse") return;
          clearTimer();
          timer.current = setTimeout(() => setHovered(true), expandDelay);
        },
        onPointerLeave: (e: React.PointerEvent) => {
          if (e.pointerType !== "mouse") return;
          clearTimer();
          setHovered(false);
        },
        onPointerDown: () => setKeyboardFocus(false),
        onFocus: (e: React.FocusEvent) => {
          const el = e.target as HTMLElement;
          if (typeof el.matches === "function" && el.matches(":focus-visible")) setKeyboardFocus(true);
        },
        onBlur: (e: React.FocusEvent) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setKeyboardFocus(false);
        },
        onKeyDown: (e: React.KeyboardEvent) => {
          if (e.key === "Escape" && !isPinned) {
            clearTimer();
            setHovered(false);
            setKeyboardFocus(false);
          }
        },
      }
    : {};

  const ctx = React.useMemo<NavRailContextValue>(
    () => ({ expanded, expandable: expandOnHover, collapsedWidth, expandedWidth, reduce, newLabel }),
    [expanded, expandOnHover, collapsedWidth, expandedWidth, reduce, newLabel],
  );

  const panelWidth = expandOnHover ? expandedWidth : collapsedWidth;
  const hiddenRight = panelWidth - collapsedWidth;
  const reveal = reduce ? INSTANT : SMOOTH;

  return (
    <NavRailContext.Provider value={ctx}>
      <LayoutGroup id={layoutGroupId}>
        <motion.nav
          aria-label={ariaLabel}
          data-slot="nav-rail"
          data-expanded={expanded || undefined}
          data-pinned={isPinned || undefined}
          className={cn("relative h-full shrink-0", className)}
          initial={false}
          animate={{ width: isPinned ? expandedWidth : collapsedWidth }}
          transition={reveal}
          style={style}
          {...handlers}
          {...props}
        >
          {/* The panel is always `panelWidth` wide; collapsed = clipped to the rail. Labels never reflow. */}
          <motion.div
            className="absolute inset-y-0 left-0 z-40 flex flex-col"
            style={{ width: panelWidth, background: RAIL_BG, color: "var(--sidebar-foreground, var(--foreground))" }}
            initial={false}
            animate={{ clipPath: `inset(0px ${expanded ? 0 : hiddenRight}px 0px 0px)` }}
            transition={reveal}
          >
            {header && <div className="flex shrink-0 flex-col py-2">{header}</div>}
            <div className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-hidden py-2">{children}</div>
            {footer && <div className="flex shrink-0 flex-col gap-0.5 py-2">{footer}</div>}
          </motion.div>
          {/* The edge: one hairline that travels with the reveal; lifts with a shadow only while floating. */}
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 z-40 w-px"
            style={{ left: collapsedWidth - 1, background: RAIL_BORDER }}
            initial={false}
            animate={{
              x: expanded ? hiddenRight : 0,
              boxShadow: floating
                ? "12px 0 28px -10px rgba(2, 11, 27, 0.28)"
                : "0px 0 0px 0px rgba(2, 11, 27, 0)",
            }}
            transition={reveal}
          />
        </motion.nav>
      </LayoutGroup>
    </NavRailContext.Provider>
  );
}

// ─────────────────────────────── NavRailItem ───────────────────────────────

type ItemBase = {
  /** Icon element, e.g. `<Inbox />` or a lucide component. Sized to 18 px. */
  icon: React.ReactNode | React.ComponentType<{ className?: string }>;
  /** Visible name (expanded), tooltip (icon rail) and accessible name. */
  label: string;
  active?: boolean;
  /** Count or short text. Numbers above 99 render as "99+". */
  badge?: number | string;
  /** Show the "new" dot (enters once, never pulses). */
  isNew?: boolean;
  disabled?: boolean;
  className?: string;
};

export type NavRailItemProps = ItemBase &
  (
    | ({ asChild?: false; href?: undefined } & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof ItemBase | "children">)
    | ({ asChild?: false; href: string } & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof ItemBase | "children">)
    | ({
        /** Render into your own link element (e.g. Next.js `<Link href>`), passed as the only child. */
        asChild: true;
        children: React.ReactElement;
        href?: undefined;
      } & Omit<React.HTMLAttributes<HTMLElement>, keyof ItemBase | "children">)
  );

function renderIcon(icon: ItemBase["icon"]) {
  if (React.isValidElement(icon)) return icon;
  if (typeof icon === "function" || (typeof icon === "object" && icon !== null && "$$typeof" in icon)) {
    const Icon = icon as React.ComponentType<{ className?: string }>;
    return <Icon className="size-[18px]" />;
  }
  return icon as React.ReactNode;
}

function formatBadge(badge: number | string) {
  return typeof badge === "number" && badge > 99 ? "99+" : String(badge);
}

export function NavRailItem(props: NavRailItemProps) {
  const { icon, label, active = false, badge, isNew = false, disabled = false, className, ...rest } = props;
  const { expanded, expandable, collapsedWidth, reduce, newLabel } = useNavRail("NavRailItem");
  const [pressed, setPressed] = React.useState(false);

  const hasBadge = badge !== undefined && badge !== null && badge !== "" && badge !== 0;
  const srExtra = [hasBadge ? `(${formatBadge(badge!)})` : null, isNew ? `(${newLabel})` : null].filter(Boolean).join(" ");

  const content = (
    <>
      <span className="flex shrink-0 items-center justify-center" style={{ width: collapsedWidth }}>
        <motion.span
          className="relative flex h-8 w-10 items-center justify-center rounded-[10px]"
          animate={{ scale: pressed && !reduce ? 0.94 : 1 }}
          transition={SNAPPY}
        >
          {active && (
            <motion.span
              layoutId="nav-rail-active"
              aria-hidden
              className="absolute inset-0 rounded-[10px]"
              style={{ background: ACTIVE_BG, borderRadius: 10 }}
              transition={reduce ? INSTANT : EDGE}
            />
          )}
          <span
            aria-hidden
            className="absolute inset-0 rounded-[10px] opacity-0 transition-opacity group-hover/nav-item:opacity-100"
            style={{
              background: active ? "transparent" : HOVER_BG,
              transitionDuration: "var(--cf-duration-fast, 150ms)",
              transitionTimingFunction: "linear",
            }}
          />
          <span className="relative flex [&_svg]:size-[18px] [&_svg]:shrink-0">{renderIcon(icon)}</span>
          {hasBadge && (
            <span
              aria-hidden
              className="absolute -right-1.5 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold tabular-nums leading-none"
              style={{
                background: "var(--primary)",
                color: "var(--primary-foreground)",
                boxShadow: `0 0 0 2px ${RAIL_BG}`,
              }}
            >
              {formatBadge(badge!)}
            </span>
          )}
          {isNew && !hasBadge && (
            <motion.span
              aria-hidden
              data-slot="nav-rail-new-dot"
              className="absolute -right-0.5 -top-0.5 size-2 rounded-full"
              style={{ background: "var(--primary)", boxShadow: `0 0 0 2px ${RAIL_BG}` }}
              initial={reduce ? false : { scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ ...SNAPPY, delay: 0.25 }}
            />
          )}
        </motion.span>
      </span>
      {expandable ? (
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.span
              key="label"
              className="min-w-0 flex-1 truncate pr-3 text-[13px] font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: reduce ? LABEL_EXIT_REDUCED : { ...SMOOTH, delay: 0.06 } }}
              exit={{ opacity: 0, transition: reduce ? LABEL_EXIT_REDUCED : LABEL_EXIT }}
            >
              {label}
            </motion.span>
          )}
        </AnimatePresence>
      ) : null}
      <span className="sr-only">
        {expandable && expanded ? "" : label}
        {srExtra ? ` ${srExtra}` : ""}
      </span>
    </>
  );

  const shared = {
    "data-slot": "nav-rail-item",
    "data-active": active || undefined,
    "aria-current": active ? ("page" as const) : undefined,
    className: cn(
      "group/nav-item relative flex h-10 w-full shrink-0 select-none items-center text-left outline-none",
      "focus-visible:[&>span:first-child>span]:ring-2 focus-visible:[&>span:first-child>span]:ring-[var(--ring,var(--primary))]",
      "disabled:pointer-events-none disabled:opacity-40 aria-disabled:pointer-events-none aria-disabled:opacity-40",
      className,
    ),
    style: {
      color: active ? ACTIVE_FG : "var(--muted-foreground)",
    } as React.CSSProperties,
    onPointerDown: (e: React.PointerEvent<HTMLElement>) => {
      setPressed(true);
      (rest as { onPointerDown?: (e: React.PointerEvent<HTMLElement>) => void }).onPointerDown?.(e);
    },
    onPointerUp: (e: React.PointerEvent<HTMLElement>) => {
      setPressed(false);
      (rest as { onPointerUp?: (e: React.PointerEvent<HTMLElement>) => void }).onPointerUp?.(e);
    },
    onPointerLeave: (e: React.PointerEvent<HTMLElement>) => {
      setPressed(false);
      (rest as { onPointerLeave?: (e: React.PointerEvent<HTMLElement>) => void }).onPointerLeave?.(e);
    },
    onPointerCancel: () => setPressed(false),
  };

  let element: React.ReactElement;
  if (rest.asChild) {
    const { asChild: _a, children, ...other } = rest as { asChild: true; children: React.ReactElement } & Record<string, unknown>;
    element = (
      <Slot {...other} {...shared} aria-disabled={disabled || undefined}>
        {React.cloneElement(children, undefined, content)}
      </Slot>
    );
  } else if (typeof rest.href === "string") {
    const { asChild: _a, ...other } = rest as Record<string, unknown>;
    element = (
      <a {...(other as React.AnchorHTMLAttributes<HTMLAnchorElement>)} {...shared} aria-disabled={disabled || undefined}>
        {content}
      </a>
    );
  } else {
    const { asChild: _a, type = "button", ...other } = rest as React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: false };
    element = (
      <button type={type} {...other} {...shared} disabled={disabled}>
        {content}
      </button>
    );
  }

  // Icon rail: the name lives in a tooltip. Expandable rail: the name is on screen when it matters.
  if (expandable) return element;
  return (
    <Tooltip>
      <TooltipTrigger asChild>{element}</TooltipTrigger>
      <TooltipContent side="right" align="center">
        {label}
        {isNew && <span className="ml-1.5 text-[10px] uppercase tracking-wider opacity-70">{newLabel}</span>}
      </TooltipContent>
    </Tooltip>
  );
}

// ─────────────────────────────── NavRailSection ───────────────────────────────

export interface NavRailSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Kicker shown (mono, uppercase) when the rail is expanded; always the group's accessible name. */
  label?: string;
  /** Hide the separator line (e.g. first section). Default false. */
  hideSeparator?: boolean;
}

export function NavRailSection({ label, hideSeparator = false, children, className, ...props }: NavRailSectionProps) {
  const { expanded, expandable, collapsedWidth, reduce } = useNavRail("NavRailSection");
  return (
    <div role="group" aria-label={label} data-slot="nav-rail-section" className={cn("flex flex-col gap-0.5", className)} {...props}>
      {!hideSeparator && (
        <div aria-hidden className="relative flex h-6 shrink-0 items-center">
          <span
            className="block h-px"
            style={{ marginLeft: 12, width: collapsedWidth - 24, background: RAIL_BORDER }}
          />
          {expandable && label ? (
            <AnimatePresence initial={false}>
              {expanded && (
                <motion.span
                  key="kicker"
                  className="ml-2 truncate pr-3 font-mono text-[10px] uppercase tracking-[0.12em]"
                  style={{ color: "var(--muted-foreground)" }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, transition: reduce ? LABEL_EXIT_REDUCED : { ...SMOOTH, delay: 0.06 } }}
                  exit={{ opacity: 0, transition: reduce ? LABEL_EXIT_REDUCED : LABEL_EXIT }}
                >
                  {label}
                </motion.span>
              )}
            </AnimatePresence>
          ) : null}
        </div>
      )}
      {children}
    </div>
  );
}
