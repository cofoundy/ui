import * as React from "react";

import { cn } from "../../utils/cn";

/**
 * WorkspaceShell — the rail + well responsive layout primitive for governance
 * surfaces (members / teams / access ledgers). Composable:
 *
 *   <WorkspaceShell>
 *     <WorkspaceShellRail>
 *       <WorkspaceShellIdentity wordmark="Cofoundy" glyph="C" chip={<RoleChip tone="owner" />} />
 *       <WorkspaceShellNav>
 *         <WorkspaceShellNavItem icon={…} count={3} active>Members</WorkspaceShellNavItem>
 *         <WorkspaceShellNavItem icon={…} count={3}>Teams</WorkspaceShellNavItem>
 *       </WorkspaceShellNav>
 *       <WorkspaceShellRailFooter>Accounts provisioned by Cofoundy</WorkspaceShellRailFooter>
 *     </WorkspaceShellRail>
 *     <WorkspaceShellWell>{children}</WorkspaceShellWell>
 *   </WorkspaceShell>
 *
 * The rail is 272px fixed on desktop (≥ md) and collapses to a sticky top-bar
 * on mobile (< md). The well fills remaining width with a ~1040px inner
 * reading measure and generous gutters. Product-agnostic — identity label,
 * nav items, counts and copy are all supplied by the consumer.
 *
 * Colour comes from the `--rail-bg` / `--well-bg` / `--doc-*` CSS vars defined
 * light + dark in @cofoundy/ui/styles.
 */

/* ------------------------------------------------------------------ */
/* Root                                                                */
/* ------------------------------------------------------------------ */
export type WorkspaceShellProps = React.ComponentProps<"div">;

const WorkspaceShell = React.forwardRef<HTMLDivElement, WorkspaceShellProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="workspace-shell"
      className={cn(
        "relative flex min-h-screen w-full flex-col font-sans text-[var(--doc-ink)] md:flex-row",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
);
WorkspaceShell.displayName = "WorkspaceShell";

/* ------------------------------------------------------------------ */
/* Rail — persistent left rail (desktop) / sticky top-bar (mobile)     */
/* ------------------------------------------------------------------ */
export type WorkspaceShellRailProps = React.ComponentProps<"aside">;

const WorkspaceShellRail = React.forwardRef<HTMLElement, WorkspaceShellRailProps>(
  ({ className, children, ...props }, ref) => (
    <aside
      ref={ref}
      data-slot="workspace-shell-rail"
      className={cn(
        // mobile: sticky horizontal top bar
        "sticky top-0 z-20 flex w-full flex-row items-center gap-3.5 border-b border-[var(--doc-rule)] bg-[var(--rail-bg)] px-4 py-3 backdrop-blur-md",
        // desktop: fixed 272px vertical rail
        "md:static md:min-h-full md:w-[272px] md:flex-none md:flex-col md:items-stretch md:gap-0 md:border-b-0 md:border-r md:px-[18px] md:py-[22px] md:backdrop-blur-none",
        className
      )}
      {...props}
    >
      {children}
    </aside>
  )
);
WorkspaceShellRail.displayName = "WorkspaceShellRail";

/* ------------------------------------------------------------------ */
/* Identity — wordmark glyph + label + role chip slot                  */
/* ------------------------------------------------------------------ */
export interface WorkspaceShellIdentityProps
  extends Omit<React.ComponentProps<"div">, "children"> {
  /** Workspace wordmark (e.g. "Cofoundy"). */
  wordmark: React.ReactNode;
  /** Single-glyph mark shown in the gradient tile (e.g. "C"). */
  glyph?: React.ReactNode;
  /** Slot for a role/status chip beneath the wordmark (e.g. <RoleChip tone="owner" />). */
  chip?: React.ReactNode;
}

const WorkspaceShellIdentity = React.forwardRef<
  HTMLDivElement,
  WorkspaceShellIdentityProps
>(({ className, wordmark, glyph, chip, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="workspace-shell-identity"
    className={cn(
      "flex min-w-0 flex-1 items-center gap-3 rounded-2xl bg-[color-mix(in_srgb,var(--doc-accent)_5%,transparent)] px-3 py-2.5 shadow-[inset_0_0_0_1px_var(--doc-rule)]",
      "md:mb-[26px] md:flex-none",
      className
    )}
    {...props}
  >
    {glyph != null && (
      <span
        aria-hidden
        className="grid size-[38px] flex-none place-items-center overflow-hidden rounded-xl bg-[linear-gradient(145deg,#46a0d0,#1b577e)] font-display text-lg font-bold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_6px_16px_-6px_rgba(41,132,173,0.7)]"
      >
        {glyph}
      </span>
    )}
    <div className="min-w-0">
      <div className="truncate font-display text-[15px] font-semibold leading-tight tracking-[-0.01em] text-[var(--doc-ink)]">
        {wordmark}
      </div>
      {chip && <div className="mt-1">{chip}</div>}
    </div>
  </div>
));
WorkspaceShellIdentity.displayName = "WorkspaceShellIdentity";

/* ------------------------------------------------------------------ */
/* Nav group + optional section label                                  */
/* ------------------------------------------------------------------ */
export interface WorkspaceShellNavProps extends React.ComponentProps<"nav"> {
  /** Uppercase section label, hidden on mobile (e.g. "Workspace access"). */
  label?: React.ReactNode;
}

const WorkspaceShellNav = React.forwardRef<HTMLElement, WorkspaceShellNavProps>(
  ({ className, label, children, ...props }, ref) => (
    <>
      {label && (
        <div
          data-slot="workspace-shell-nav-label"
          className="hidden px-3 pb-2.5 font-sans text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--doc-ink-muted)] md:block"
        >
          {label}
        </div>
      )}
      <nav
        ref={ref}
        data-slot="workspace-shell-nav"
        className={cn(
          "flex flex-none flex-row gap-1.5 md:flex-col md:gap-1",
          className
        )}
        {...props}
      >
        {children}
      </nav>
    </>
  )
);
WorkspaceShellNav.displayName = "WorkspaceShellNav";

/* ------------------------------------------------------------------ */
/* NavItem — active state + count-pill slot. Polymorphic via `asChild` */
/* so consumers can drop a next/link <a> in for real-route deep-links. */
/* ------------------------------------------------------------------ */
export interface WorkspaceShellNavItemProps
  extends Omit<React.ComponentProps<"button">, "children"> {
  icon?: React.ReactNode;
  count?: React.ReactNode;
  active?: boolean;
  children: React.ReactNode;
  /**
   * When true, renders the single child element instead of a <button>,
   * forwarding all styling/props (for next/link or <a> deep-linking).
   */
  asChild?: boolean;
}

const WorkspaceShellNavItem = React.forwardRef<
  HTMLButtonElement,
  WorkspaceShellNavItemProps
>(({ className, icon, count, active, children, asChild, ...props }, ref) => {
  const classes = cn(
    "group relative flex h-11 items-center gap-3 rounded-[11px] border-none px-2.5 text-left font-sans text-[14.5px] transition-colors duration-300 ease-[var(--cf-ease-default)] cursor-pointer",
    "md:w-full md:gap-3 md:px-3",
    active
      ? "bg-[color-mix(in_srgb,var(--doc-accent)_13%,transparent)] font-semibold text-[var(--doc-ink)] shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--doc-accent)_24%,transparent)]"
      : "bg-transparent font-medium text-[var(--doc-ink-muted)] hover:text-[var(--doc-ink)]",
    className
  );

  const inner = (
    <>
      {/* active left bar — desktop only */}
      {active && (
        <span
          aria-hidden
          className="absolute -left-[18px] bottom-2.5 top-2.5 hidden w-[3px] rounded-full bg-[linear-gradient(180deg,#46a0d0,#2984ad)] shadow-[0_0_10px_rgba(70,160,208,0.8)] md:block"
        />
      )}
      {icon && (
        <span
          className={cn(
            "grid flex-none place-items-center",
            active ? "text-[var(--cf-primary)]" : "text-[var(--doc-ink-muted)]"
          )}
        >
          {icon}
        </span>
      )}
      <span className="flex-none md:flex-1">{children}</span>
      {count != null && (
        <span
          className={cn(
            "min-w-[22px] rounded-[7px] px-[7px] py-px text-center font-mono text-xs font-semibold",
            active
              ? "bg-[color-mix(in_srgb,var(--doc-accent)_14%,transparent)] text-[#9fc8e2]"
              : "bg-[color-mix(in_srgb,var(--doc-ink-muted)_8%,transparent)] text-[var(--doc-ink-muted)]"
          )}
        >
          {count}
        </span>
      )}
    </>
  );

  if (asChild && React.isValidElement(children)) {
    // asChild: the child element (e.g. next/link <a>) receives the styling and
    // wraps the icon/label/count. We clone, merging className + data-slot.
    const child = children as React.ReactElement<{
      className?: string;
      children?: React.ReactNode;
    }>;
    return React.cloneElement(child, {
      className: cn(classes, child.props.className),
      "data-slot": "workspace-shell-nav-item",
      "data-active": active ? "" : undefined,
      children: (
        <>
          {active && (
            <span
              aria-hidden
              className="absolute -left-[18px] bottom-2.5 top-2.5 hidden w-[3px] rounded-full bg-[linear-gradient(180deg,#46a0d0,#2984ad)] shadow-[0_0_10px_rgba(70,160,208,0.8)] md:block"
            />
          )}
          {icon && (
            <span
              className={cn(
                "grid flex-none place-items-center",
                active
                  ? "text-[var(--cf-primary)]"
                  : "text-[var(--doc-ink-muted)]"
              )}
            >
              {icon}
            </span>
          )}
          <span className="flex-none md:flex-1">{child.props.children}</span>
          {count != null && (
            <span
              className={cn(
                "min-w-[22px] rounded-[7px] px-[7px] py-px text-center font-mono text-xs font-semibold",
                active
                  ? "bg-[color-mix(in_srgb,var(--doc-accent)_14%,transparent)] text-[#9fc8e2]"
                  : "bg-[color-mix(in_srgb,var(--doc-ink-muted)_8%,transparent)] text-[var(--doc-ink-muted)]"
              )}
            >
              {count}
            </span>
          )}
        </>
      ),
    } as Record<string, unknown>);
  }

  return (
    <button
      ref={ref}
      type="button"
      data-slot="workspace-shell-nav-item"
      data-active={active ? "" : undefined}
      className={classes}
      {...props}
    >
      {inner}
    </button>
  );
});
WorkspaceShellNavItem.displayName = "WorkspaceShellNavItem";

/* ------------------------------------------------------------------ */
/* Rail footer — quiet orienting line; hidden on mobile.               */
/* ------------------------------------------------------------------ */
export type WorkspaceShellRailFooterProps = React.ComponentProps<"div">;

const WorkspaceShellRailFooter = React.forwardRef<
  HTMLDivElement,
  WorkspaceShellRailFooterProps
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="workspace-shell-rail-footer"
    className={cn(
      "mt-auto hidden items-center gap-2 px-3 font-sans text-xs leading-normal text-[var(--doc-ink-muted)] md:flex",
      className
    )}
    {...props}
  >
    <span
      aria-hidden
      className="size-1.5 flex-none rounded-full bg-[var(--cf-success)] shadow-[0_0_8px_var(--cf-success)]"
    />
    {children}
  </div>
));
WorkspaceShellRailFooter.displayName = "WorkspaceShellRailFooter";

/* ------------------------------------------------------------------ */
/* Well — main content surface, fills width, ~1040px inner measure.    */
/* ------------------------------------------------------------------ */
export interface WorkspaceShellWellProps extends React.ComponentProps<"main"> {
  /** Inner reading measure cap (px). Defaults to 1040. */
  maxWidth?: number;
}

const WorkspaceShellWell = React.forwardRef<HTMLElement, WorkspaceShellWellProps>(
  ({ className, children, maxWidth = 1040, ...props }, ref) => (
    <main
      ref={ref}
      data-slot="workspace-shell-well"
      className={cn(
        "min-w-0 flex-1 overflow-auto bg-[var(--well-bg)] px-[18px] pb-14 pt-6 md:px-14 md:pb-[72px] md:pt-10",
        className
      )}
      {...props}
    >
      <div className="mx-auto" style={{ maxWidth }}>
        {children}
      </div>
    </main>
  )
);
WorkspaceShellWell.displayName = "WorkspaceShellWell";

export {
  WorkspaceShell,
  WorkspaceShellRail,
  WorkspaceShellIdentity,
  WorkspaceShellNav,
  WorkspaceShellNavItem,
  WorkspaceShellRailFooter,
  WorkspaceShellWell,
};
