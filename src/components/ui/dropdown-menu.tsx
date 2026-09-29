import * as React from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { CheckIcon, ChevronRightIcon, CircleIcon } from "lucide-react";
import { LayoutGroup, motion, useReducedMotionConfig } from "framer-motion";

import { cn } from "../../utils/cn";
import { springTransition } from "../../lib/spring";

/* ---------------------------------------------------------------------------
 * Motion
 * - The surface grows out of its trigger: `transform-origin` is Radix's
 *   `--radix-dropdown-menu-content-transform-origin`, scale .96 → 1 + 4 px toward
 *   the side it opened on + opacity, on `--cf-spring-smooth`. It leaves on the
 *   same spring compressed to `--cf-dd-exit` (opacity + scale .97).
 *   CSS keyframes (not framer) so Radix `Presence` keeps the surface mounted
 *   until the exit ends and the Root stays uncontrolled — the API is untouched.
 *   The CSS is `.cf-dd-surface` + the shared `cf-pop-in/out` pair in
 *   `styles/index.css` (same `[data-side]` rule as Tooltip).
 * - The highlight is ONE element per menu that travels between items
 *   (framer `layoutId`, `edge` spring). Sub-menus get their own.
 * - Reduced motion (OS or framer `MotionConfig reducedMotion`): opacity only,
 *   --cf-duration-instant, and the highlight jumps.
 * ------------------------------------------------------------------------- */

/** Present only inside our Content/SubContent: enables the travelling highlight. */
const HighlightScope = React.createContext<{ reduced: boolean } | null>(null);

function MenuSurface({
  children,
  asChild,
}: {
  children: React.ReactNode;
  asChild?: boolean;
}) {
  const id = React.useId();
  const reduced = useReducedMotionConfig() === true;
  const scope = React.useMemo(() => ({ reduced }), [reduced]);
  if (asChild) return <>{children}</>;
  return (
    <HighlightScope.Provider value={scope}>
      <LayoutGroup id={`cf-dd-${id}`}>{children}</LayoutGroup>
    </HighlightScope.Provider>
  );
}

/** Tracks whether this item holds the menu's highlight (Radix focuses the highlighted item). */
function useItemHighlight(
  onFocus?: React.FocusEventHandler<HTMLDivElement>,
  onBlur?: React.FocusEventHandler<HTMLDivElement>
) {
  const scope = React.useContext(HighlightScope);
  const [on, setOn] = React.useState(false);
  return {
    scope,
    on: !!scope && on,
    onFocus: (e: React.FocusEvent<HTMLDivElement>) => {
      onFocus?.(e);
      if (e.target === e.currentTarget) setOn(true);
    },
    onBlur: (e: React.FocusEvent<HTMLDivElement>) => {
      onBlur?.(e);
      if (e.target === e.currentTarget) setOn(false);
    },
  };
}

function ItemHighlight({
  reduced,
  destructive,
}: {
  reduced: boolean;
  destructive?: boolean;
}) {
  return (
    <motion.span
      aria-hidden
      data-slot="dropdown-menu-highlight"
      layoutId="highlight"
      initial={false}
      transition={reduced ? { duration: 0 } : springTransition("edge")}
      className={cn(
        "pointer-events-none absolute inset-0 -z-10 rounded-[inherit]",
        destructive ? "bg-[var(--destructive)]/10" : "bg-[var(--accent)]"
      )}
    />
  );
}

const SURFACE =
  "cf-dd-surface isolate z-50 min-w-[8rem] rounded-[10px] border border-[var(--border)] bg-[var(--popover)] p-1 text-[var(--popover-foreground)]";
/** Inner radius = outer (10) − padding (4). Items are NOT stacking contexts on purpose: the
 *  travelling highlight (z −10) belongs to the surface's context (`isolate`), so while it slides
 *  over a neighbour it still paints under that neighbour's text. */
const ITEM =
  "relative flex cursor-default select-none items-center gap-2 rounded-[6px] text-sm outline-none data-[highlighted]:text-[var(--accent-foreground)] data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&>svg]:size-4 [&>svg]:shrink-0";
/** Used only when an item is rendered outside our Content (no highlight scope). */
const ITEM_STATIC_FOCUS = "focus:bg-[var(--accent)]";

function DropdownMenu({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Root>) {
  return <DropdownMenuPrimitive.Root data-slot="dropdown-menu" {...props} />;
}

function DropdownMenuPortal({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Portal>) {
  return (
    <DropdownMenuPrimitive.Portal data-slot="dropdown-menu-portal" {...props} />
  );
}

function DropdownMenuTrigger({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Trigger>) {
  return (
    <DropdownMenuPrimitive.Trigger
      data-slot="dropdown-menu-trigger"
      {...props}
    />
  );
}

function DropdownMenuContent({
  className,
  sideOffset = 4,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Content>) {
  const reduced = useReducedMotionConfig() === true;
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        data-slot="dropdown-menu-content"
        data-reduced-motion={reduced ? "" : undefined}
        sideOffset={sideOffset}
        className={cn(
          SURFACE,
          "max-h-[var(--radix-dropdown-menu-content-available-height)] overflow-x-hidden overflow-y-auto shadow-[var(--cf-shadow-float)]",
          className
        )}
        {...props}
      >
        <MenuSurface asChild={props.asChild}>{children}</MenuSurface>
      </DropdownMenuPrimitive.Content>
    </DropdownMenuPrimitive.Portal>
  );
}

function DropdownMenuGroup({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Group>) {
  return (
    <DropdownMenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />
  );
}

function DropdownMenuItem({
  className,
  inset,
  variant = "default",
  children,
  onFocus,
  onBlur,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Item> & {
  inset?: boolean;
  variant?: "default" | "destructive";
}) {
  const hl = useItemHighlight(onFocus, onBlur);
  const destructive = variant === "destructive";
  return (
    <DropdownMenuPrimitive.Item
      data-slot="dropdown-menu-item"
      data-inset={inset}
      data-variant={variant}
      onFocus={hl.onFocus}
      onBlur={hl.onBlur}
      className={cn(
        ITEM,
        "px-2 py-1.5",
        !hl.scope && ITEM_STATIC_FOCUS,
        inset && "pl-8",
        destructive &&
          cn(
            "text-[var(--destructive)] data-[highlighted]:text-[var(--destructive)]",
            !hl.scope && "focus:bg-[var(--destructive)]/10"
          ),
        className
      )}
      {...props}
    >
      {hl.on && !props.asChild && (
        <ItemHighlight reduced={hl.scope!.reduced} destructive={destructive} />
      )}
      {children}
    </DropdownMenuPrimitive.Item>
  );
}

function DropdownMenuCheckboxItem({
  className,
  children,
  checked,
  onFocus,
  onBlur,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.CheckboxItem>) {
  const hl = useItemHighlight(onFocus, onBlur);
  return (
    <DropdownMenuPrimitive.CheckboxItem
      data-slot="dropdown-menu-checkbox-item"
      onFocus={hl.onFocus}
      onBlur={hl.onBlur}
      className={cn(
        ITEM,
        "py-1.5 pl-8 pr-2",
        !hl.scope && ITEM_STATIC_FOCUS,
        className
      )}
      checked={checked}
      {...props}
    >
      {hl.on && <ItemHighlight reduced={hl.scope!.reduced} />}
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <CheckIcon className="size-4" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.CheckboxItem>
  );
}

function DropdownMenuRadioGroup({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.RadioGroup>) {
  return (
    <DropdownMenuPrimitive.RadioGroup
      data-slot="dropdown-menu-radio-group"
      {...props}
    />
  );
}

function DropdownMenuRadioItem({
  className,
  children,
  onFocus,
  onBlur,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.RadioItem>) {
  const hl = useItemHighlight(onFocus, onBlur);
  return (
    <DropdownMenuPrimitive.RadioItem
      data-slot="dropdown-menu-radio-item"
      onFocus={hl.onFocus}
      onBlur={hl.onBlur}
      className={cn(
        ITEM,
        "py-1.5 pl-8 pr-2",
        !hl.scope && ITEM_STATIC_FOCUS,
        className
      )}
      {...props}
    >
      {hl.on && <ItemHighlight reduced={hl.scope!.reduced} />}
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <CircleIcon className="size-2 fill-current" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.RadioItem>
  );
}

function DropdownMenuLabel({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Label> & {
  inset?: boolean;
}) {
  return (
    <DropdownMenuPrimitive.Label
      data-slot="dropdown-menu-label"
      data-inset={inset}
      className={cn(
        "px-2 py-1.5 text-sm font-semibold",
        inset && "pl-8",
        className
      )}
      {...props}
    />
  );
}

function DropdownMenuSeparator({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Separator>) {
  return (
    <DropdownMenuPrimitive.Separator
      data-slot="dropdown-menu-separator"
      className={cn("-mx-1 my-1 h-px bg-[var(--border)]", className)}
      {...props}
    />
  );
}

function DropdownMenuShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="dropdown-menu-shortcut"
      className={cn(
        "ml-auto text-xs tracking-widest text-[var(--muted-foreground)]",
        className
      )}
      {...props}
    />
  );
}

function DropdownMenuSub({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Sub>) {
  return <DropdownMenuPrimitive.Sub data-slot="dropdown-menu-sub" {...props} />;
}

function DropdownMenuSubTrigger({
  className,
  inset,
  children,
  onFocus,
  onBlur,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubTrigger> & {
  inset?: boolean;
}) {
  const hl = useItemHighlight(onFocus, onBlur);
  return (
    <DropdownMenuPrimitive.SubTrigger
      data-slot="dropdown-menu-sub-trigger"
      data-inset={inset}
      onFocus={hl.onFocus}
      onBlur={hl.onBlur}
      className={cn(
        ITEM,
        "px-2 py-1.5 data-[state=open]:text-[var(--accent-foreground)]",
        // While its sub-menu is open the highlight lives there; the trigger keeps a quiet fill.
        "data-[state=open]:bg-[var(--accent)]",
        !hl.scope && ITEM_STATIC_FOCUS,
        inset && "pl-8",
        className
      )}
      {...props}
    >
      {hl.on && <ItemHighlight reduced={hl.scope!.reduced} />}
      {children}
      <ChevronRightIcon className="ml-auto size-4" />
    </DropdownMenuPrimitive.SubTrigger>
  );
}

function DropdownMenuSubContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubContent>) {
  const reduced = useReducedMotionConfig() === true;
  return (
    <DropdownMenuPrimitive.SubContent
      data-slot="dropdown-menu-sub-content"
      data-reduced-motion={reduced ? "" : undefined}
      className={cn(SURFACE, "overflow-hidden shadow-[var(--cf-shadow-float)]", className)}
      {...props}
    >
      <MenuSurface asChild={props.asChild}>{children}</MenuSurface>
    </DropdownMenuPrimitive.SubContent>
  );
}

export {
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
};
