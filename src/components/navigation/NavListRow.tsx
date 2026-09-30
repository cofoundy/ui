"use client";

import * as React from "react";

import { cn } from "../../utils/cn";

/**
 * NavListRow — the ONE row of a navigation list: icon tile + label + optional description +
 * trailing slot. Used by the «+N Más» popover of `NavRailOverflow` (`size="sm"`) and by the rows
 * of `MoreSheet` (`size="md"`, touch-sized). `NavRailOverflowRow` and `MoreSheetRow` are presets
 * of this component kept for their old names.
 *
 * Renders a `<button>`, or a link when `href` is set (`linkComponent` for a router link). It
 * forwards its ref and spreads the rest of its props on that element, so a Radix menu item can
 * wrap it with `asChild` (the highlighted state reads `data-highlighted`).
 *
 * One shape per size: the tile radius and the row radius match the container they sit in
 * (sm: 8 px inside a 14 px panel with 6 px padding · md: 12 px inside a 20 px sheet with 8 px).
 *
 * Tokens (fallbacks inline; defined in motion.css): `--cf-nav-active-bg`, `--cf-nav-active-fg`,
 * `--cf-nav-hover-bg`.
 */

type LinkLikeProps = {
  href: string;
  className?: string;
  onClick?: React.MouseEventHandler;
  children?: React.ReactNode;
  "aria-current"?: "page";
  "aria-disabled"?: boolean;
};

export interface NavListRowProps extends Omit<React.HTMLAttributes<HTMLElement>, "onSelect" | "title"> {
  /** Icon element (16 px in `sm`, 18 px in `md`), drawn in a square tile. */
  icon?: React.ReactNode;
  label: React.ReactNode;
  /** One-line hint; clamps to 2 lines. */
  description?: React.ReactNode;
  /** Something after the label (a «nuevo» chip, a count, a status). */
  trailing?: React.ReactNode;
  /** The current screen lives here: tinted row + `aria-current="page"`. */
  active?: boolean;
  /** Dashed icon tile — for an «Agregar …» action row. */
  dashed?: boolean;
  disabled?: boolean;
  /** Renders a link instead of a `<button>`. */
  href?: string;
  /** Component used when `href` is set (e.g. Next's `Link`). Default `"a"`. */
  linkComponent?: React.ElementType<LinkLikeProps>;
  /** Called on click (unless the click handler called `preventDefault`). */
  onSelect?: () => void;
  /** `sm` = 48 px rows for popovers · `md` = 48/56 px touch rows for sheets. Default `sm`. */
  size?: "sm" | "md";
}

const TOKENS = {
  "--nav-row-active-bg": "var(--cf-nav-active-bg, color-mix(in oklab, var(--primary) 16%, transparent))",
  "--nav-row-active-fg": "var(--cf-nav-active-fg, var(--primary))",
  "--nav-row-hover-bg": "var(--cf-nav-hover-bg, var(--accent))",
} as React.CSSProperties;

export const NavListRow = React.forwardRef<HTMLElement, NavListRowProps>(function NavListRow(
  {
    icon,
    label,
    description,
    trailing,
    active,
    dashed,
    disabled,
    href,
    linkComponent,
    onSelect,
    size = "sm",
    className,
    onClick,
    style,
    ...rest
  },
  ref,
) {
  const md = size === "md";
  const cls = cn(
    "group/row flex w-full items-center gap-3 px-2.5 py-2 text-left outline-none transition-colors",
    md ? "rounded-[12px]" : "rounded-[8px]",
    md && description ? "min-h-[56px]" : "min-h-12",
    "hover:bg-[var(--nav-row-hover-bg)] data-[highlighted]:bg-[var(--nav-row-hover-bg)]",
    "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--ring)]",
    active &&
      "bg-[var(--nav-row-active-bg)] hover:bg-[var(--nav-row-active-bg)] data-[highlighted]:bg-[var(--nav-row-active-bg)]",
    disabled && "pointer-events-none opacity-50",
    className,
  );

  const body = (
    <>
      {icon !== undefined ? (
        <span
          aria-hidden
          className={cn(
            "flex shrink-0 items-center justify-center transition-colors",
            md ? "size-9 rounded-[10px] [&_svg]:size-[18px]" : "size-8 rounded-[8px] [&_svg]:size-4",
            dashed
              ? "border border-dashed border-[var(--border)] text-[var(--muted-foreground)] group-hover/row:border-[var(--muted-foreground)]"
              : active
                ? "bg-[var(--nav-row-active-bg)] text-[var(--nav-row-active-fg)]"
                : "bg-[var(--muted)] text-[var(--muted-foreground)] group-hover/row:text-[var(--foreground)]",
          )}
        >
          {icon}
        </span>
      ) : null}
      <span className="min-w-0 flex-1">
        <span
          className={cn(
            "flex items-center gap-2 font-medium",
            md ? "text-[14.5px] leading-5" : "text-[14px]",
            active ? "text-[var(--nav-row-active-fg)]" : "text-[var(--popover-foreground)]",
          )}
        >
          <span className="truncate">{label}</span>
          {trailing ? <span className="ml-auto flex shrink-0 items-center">{trailing}</span> : null}
        </span>
        {description ? (
          <span
            className={cn(
              "mt-0.5 line-clamp-2 block leading-snug text-[var(--muted-foreground)]",
              md ? "text-[12.5px]" : "text-[12px]",
            )}
          >
            {description}
          </span>
        ) : null}
      </span>
    </>
  );

  const handle = (e: React.MouseEvent<HTMLElement>) => {
    onClick?.(e);
    if (!e.defaultPrevented && !disabled) onSelect?.();
  };
  const merged = { ...TOKENS, ...style };

  if (href) {
    const Link = (linkComponent ?? "a") as React.ElementType;
    return (
      <Link
        ref={ref}
        href={href}
        aria-current={active ? "page" : undefined}
        aria-disabled={disabled || undefined}
        className={cls}
        style={merged}
        onClick={handle}
        {...rest}
      >
        {body}
      </Link>
    );
  }
  return (
    <button
      ref={ref as React.Ref<HTMLButtonElement>}
      type="button"
      aria-current={active ? "page" : undefined}
      disabled={disabled}
      className={cls}
      style={merged}
      onClick={handle}
      {...rest}
    >
      {body}
    </button>
  );
});

/** @deprecated name — the popover row of `NavRailOverflow`. Same as `<NavListRow size="sm">`. */
export const NavRailOverflowRow = React.forwardRef<HTMLElement, NavListRowProps>(function NavRailOverflowRow(
  props,
  ref,
) {
  return <NavListRow ref={ref} size="sm" {...props} />;
});
export type NavRailOverflowRowProps = NavListRowProps;

/** @deprecated name — the row of `MoreSheet`. Same as `<NavListRow size="md">`. */
export const MoreSheetRow = React.forwardRef<HTMLElement, NavListRowProps>(function MoreSheetRow(props, ref) {
  return <NavListRow ref={ref} size="md" {...props} />;
});
export type MoreSheetRowProps = NavListRowProps;
