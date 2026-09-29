"use client";

import * as React from "react";
import {
  motion,
  useReducedMotion,
  useReducedMotionConfig,
  type Variants,
} from "framer-motion";

import { cn } from "../../utils/cn";
import { springTransition } from "../../lib/spring";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";

/* ------------------------------------------------------------------------------------------------
 * MoreSheet — the «Más» bottom sheet of a mobile tab bar.
 *
 * Composes the package `Sheet` (side="bottom"): focus trap, Esc and tap-on-overlay close come
 * from Radix; the sheet's own enter/exit motion is the Sheet's (gentle). This component adds the
 * content: an optional header slot, sections with a kicker, rows icon + title + description,
 * and a short cascade when the sheet opens.
 * ---------------------------------------------------------------------------------------------- */

export interface MoreSheetItem {
  /** Stable key (also used as `data-more-item`). */
  key: string;
  label: React.ReactNode;
  /** One or two lines under the label (clamped to 2). */
  description?: React.ReactNode;
  /** Icon element (e.g. a lucide icon). Rendered inside a 36 px tile. */
  icon?: React.ReactNode;
  /** Renders the row as a link. Use `linkComponent` for a router link. */
  href?: string;
  onSelect?: () => void;
  /** The current screen lives here: tinted row + `aria-current="page"`. */
  active?: boolean;
  /** Trailing slot: a «nuevo» chip, a count, a status. */
  trailing?: React.ReactNode;
  /** Dashed icon tile — for an «Agregar …» action row. */
  dashed?: boolean;
  disabled?: boolean;
}

export interface MoreSheetSection {
  key: string;
  /** Small uppercase label above the rows. */
  kicker?: React.ReactNode;
  items: MoreSheetItem[];
  /** Shown instead of the rows when `items` is empty. With no `empty`, an empty section is not rendered. */
  empty?: React.ReactNode;
}

type LinkLikeProps = {
  href: string;
  className?: string;
  onClick?: React.MouseEventHandler;
  children?: React.ReactNode;
  "aria-current"?: "page";
  "aria-disabled"?: boolean;
  "data-more-item"?: string;
};

export interface MoreSheetProps {
  /** Accessible name of the dialog (e.g. «Más»). Visually hidden unless `showTitle`. */
  title: string;
  /** Accessible description, visually hidden. */
  description?: string;
  /** Show `title` as a visible heading above the content. */
  showTitle?: boolean;
  sections: MoreSheetSection[];
  /** Slot above the sections — e.g. a workspace switcher. Enters first in the cascade. */
  header?: React.ReactNode;
  /** Slot below the sections (outside the scroll area is NOT guaranteed; it scrolls with them). */
  footer?: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Element that opens the sheet (rendered with `asChild`). Optional when controlled. */
  trigger?: React.ReactNode;
  /** Called for every row selection, after the row's own `onSelect`. */
  onItemSelect?: (item: MoreSheetItem) => void;
  /** Close the sheet after a row is chosen. Default `true`. */
  closeOnSelect?: boolean;
  /**
   * CSS length the sheet sits above — e.g. the tab bar height (`"var(--tabbar-h)"`).
   * Default `0`: the sheet is flush with the viewport bottom and pads the safe area.
   */
  bottomOffset?: string;
  /** Component used for rows with `href` (e.g. Next's `Link`). Default `"a"`. */
  linkComponent?: React.ElementType<LinkLikeProps>;
  /** Accessible label of the grab handle, which is also the close button. Default «Cerrar». */
  closeLabel?: string;
  className?: string;
}

const PRESS = { scale: 0.96 };

function useMoreSheetReducedMotion() {
  const os = useReducedMotion();
  const config = useReducedMotionConfig();
  return Boolean(os || config);
}

function listVariants(reduce: boolean): Variants {
  return {
    hidden: {},
    show: reduce
      ? {}
      : { transition: { delayChildren: 0.06, staggerChildren: 0.025 } },
  };
}

function rowVariants(reduce: boolean): Variants {
  return reduce
    ? {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { duration: 0.12 } },
      }
    : {
        hidden: { opacity: 0, y: 6 },
        show: { opacity: 1, y: 0, transition: springTransition("smooth") },
      };
}

function MoreSheet({
  title,
  description,
  showTitle = false,
  sections,
  header,
  footer,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  trigger,
  onItemSelect,
  closeOnSelect = true,
  bottomOffset,
  linkComponent,
  closeLabel = "Cerrar",
  className,
}: MoreSheetProps) {
  const [openState, setOpenState] = React.useState(defaultOpen);
  const controlled = openProp !== undefined;
  const open = controlled ? openProp : openState;
  const setOpen = React.useCallback(
    (next: boolean) => {
      if (!controlled) setOpenState(next);
      onOpenChange?.(next);
    },
    [controlled, onOpenChange],
  );

  const reduce = useMoreSheetReducedMotion();
  const list = listVariants(reduce);
  const row = rowVariants(reduce);

  const choose = (item: MoreSheetItem) => {
    if (item.disabled) return;
    item.onSelect?.();
    onItemSelect?.(item);
    if (closeOnSelect) setOpen(false);
  };

  const visible = sections.filter((s) => s.items.length > 0 || s.empty);
  const offset = bottomOffset && bottomOffset !== "0" ? bottomOffset : undefined;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {trigger ? <SheetTrigger asChild>{trigger}</SheetTrigger> : null}
      <SheetContent
        side="bottom"
        data-slot="more-sheet"
        {...(description ? {} : { "aria-describedby": undefined })}
        className={cn(
          // One shape: 20 px top radius, rows inside at 12 px (20 − 8 px padding).
          "flex max-h-[min(85dvh,640px)] flex-col gap-0 rounded-t-[20px] border-x-0 bg-[var(--popover)] p-0 text-[var(--popover-foreground)]",
          // The Sheet's corner ✕ is replaced by the grab handle (a real close button, 44 px tall).
          "[&>button]:hidden",
          className,
        )}
        style={offset ? { bottom: offset } : undefined}
      >
        <div className="flex min-h-0 flex-1 flex-col">
          <SheetClose
            aria-label={closeLabel}
            className="group flex h-6 w-full shrink-0 cursor-grab items-center justify-center rounded-t-[20px] pt-2 focus:outline-none"
            style={{ minHeight: 28 }}
          >
            <span className="h-1 w-9 rounded-full bg-[var(--border)] transition-colors group-hover:bg-[var(--muted-foreground)] group-focus-visible:bg-[var(--ring)]" />
          </SheetClose>

          <SheetTitle className={showTitle ? "px-4 pb-1 pt-1 text-[15px] font-semibold" : "sr-only"}>
            {title}
          </SheetTitle>
          {description ? <SheetDescription className="sr-only">{description}</SheetDescription> : null}

          <motion.div
            variants={list}
            initial="hidden"
            animate="show"
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2"
            style={{
              paddingBottom: offset ? 12 : "max(12px, env(safe-area-inset-bottom))",
            }}
          >
            {header ? (
              <motion.div variants={row} className="px-0.5 pb-1.5 pt-1">
                {header}
              </motion.div>
            ) : null}

            {visible.map((section, i) => (
              <section key={section.key} data-more-section={section.key} aria-label={typeof section.kicker === "string" ? section.kicker : undefined}>
                {i > 0 || header ? (
                  <motion.div variants={row} aria-hidden className="mx-2.5 my-1.5 h-px bg-[var(--border)]" />
                ) : null}
                {section.kicker ? (
                  <motion.p
                    variants={row}
                    className="px-2.5 pb-1 pt-1.5 font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-[var(--muted-foreground)]"
                  >
                    {section.kicker}
                  </motion.p>
                ) : null}
                {section.items.length === 0 ? (
                  <motion.div variants={row} className="px-2.5 pb-2 text-[13.5px] text-[var(--muted-foreground)]">
                    {section.empty}
                  </motion.div>
                ) : (
                  <ul className="flex flex-col">
                    {section.items.map((item) => (
                      <motion.li
                        key={item.key}
                        variants={row}
                        whileTap={reduce || item.disabled ? undefined : PRESS}
                        transition={springTransition("snappy")}
                      >
                        <MoreSheetRow item={item} onChoose={choose} linkComponent={linkComponent} />
                      </motion.li>
                    ))}
                  </ul>
                )}
              </section>
            ))}

            {footer ? (
              <motion.div variants={row} className="px-0.5 pt-1.5">
                {footer}
              </motion.div>
            ) : null}
          </motion.div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function MoreSheetRow({
  item,
  onChoose,
  linkComponent,
}: {
  item: MoreSheetItem;
  onChoose: (item: MoreSheetItem) => void;
  linkComponent?: React.ElementType<LinkLikeProps>;
}) {
  const rowClass = cn(
    "group/row flex w-full items-center gap-3 rounded-[12px] px-2.5 py-2 text-left outline-none",
    item.description ? "min-h-[56px]" : "min-h-[48px]",
    "transition-colors hover:bg-[var(--accent)] focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
    item.active && "bg-[color-mix(in_srgb,var(--primary)_12%,transparent)] hover:bg-[color-mix(in_srgb,var(--primary)_16%,transparent)]",
    item.disabled && "pointer-events-none opacity-50",
  );

  const body = (
    <>
      {item.icon !== undefined ? (
        <span
          aria-hidden
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-[10px] transition-colors [&_svg]:size-[18px]",
            item.dashed
              ? "border border-dashed border-[var(--border)] text-[var(--muted-foreground)] group-hover/row:border-[var(--muted-foreground)]"
              : item.active
                ? "bg-[color-mix(in_srgb,var(--primary)_18%,transparent)] text-[var(--primary)]"
                : "bg-[var(--muted)] text-[var(--muted-foreground)] group-hover/row:text-[var(--foreground)]",
          )}
        >
          {item.icon}
        </span>
      ) : null}
      <span className="min-w-0 flex-1">
        <span
          className={cn(
            "block truncate text-[14.5px] font-medium leading-5",
            item.active ? "text-[var(--primary)]" : "text-[var(--popover-foreground)]",
          )}
        >
          {item.label}
        </span>
        {item.description ? (
          <span className="line-clamp-2 text-[12.5px] leading-[1.35] text-[var(--muted-foreground)]">
            {item.description}
          </span>
        ) : null}
      </span>
      {item.trailing ? <span className="shrink-0">{item.trailing}</span> : null}
    </>
  );

  const common = {
    "data-more-item": item.key,
    "aria-current": item.active ? ("page" as const) : undefined,
  };

  if (item.href) {
    const Link = (linkComponent ?? "a") as React.ElementType<LinkLikeProps>;
    return (
      <Link
        href={item.href}
        className={rowClass}
        aria-disabled={item.disabled || undefined}
        onClick={() => onChoose(item)}
        {...common}
      >
        {body}
      </Link>
    );
  }

  return (
    <button type="button" className={rowClass} disabled={item.disabled} onClick={() => onChoose(item)} {...common}>
      {body}
    </button>
  );
}

export { MoreSheet };
