"use client";

import * as React from "react";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { cva, type VariantProps } from "class-variance-authority";
import { XIcon } from "lucide-react";
import {
  AnimatePresence,
  MotionConfigContext,
  motion,
  useReducedMotion,
  type MotionStyle,
} from "framer-motion";

import { cn } from "../../utils/cn";
import { springTransition } from "../../lib/spring";

/**
 * Open state shared by Sheet → SheetContent so the content can animate its own exit.
 * Radix unmounts closed content immediately, so SheetContent force-mounts it and lets
 * AnimatePresence decide when it leaves. `null` = SheetContent rendered under a bare
 * Radix Root (no Sheet): it falls back to Radix's own mounting, without motion.
 */
const SheetOpenContext = React.createContext<boolean | null>(null);

function Sheet({
  open: openProp,
  defaultOpen,
  onOpenChange,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Root>) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen ?? false);
  const isControlled = openProp !== undefined;
  const open = isControlled ? openProp : uncontrolledOpen;
  const handleOpenChange = React.useCallback(
    (next: boolean) => {
      if (!isControlled) setUncontrolledOpen(next);
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange]
  );
  return (
    <SheetOpenContext.Provider value={open}>
      <SheetPrimitive.Root
        data-slot="sheet"
        open={open}
        onOpenChange={handleOpenChange}
        {...props}
      />
    </SheetOpenContext.Provider>
  );
}

function SheetTrigger({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Trigger>) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />;
}

function SheetClose({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Close>) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />;
}

function SheetPortal({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Portal>) {
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />;
}

/** Scrim: 28 % black mixed into transparent — dims the page without blacking it out. */
const overlayClassName =
  "fixed inset-0 z-50 bg-[color-mix(in_oklab,black_28%,transparent)]";

function SheetOverlay({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Overlay>) {
  return (
    <SheetPrimitive.Overlay
      data-slot="sheet-overlay"
      className={cn(overlayClassName, className)}
      {...props}
    />
  );
}

const sheetVariants = cva(
  "fixed z-50 gap-4 bg-[var(--background)] p-6 shadow-lg will-change-transform",
  {
    variants: {
      side: {
        top: "inset-x-0 top-0 border-b border-[var(--border)]",
        bottom: "inset-x-0 bottom-0 border-t border-[var(--border)]",
        left: "inset-y-0 left-0 h-full w-3/4 border-r border-[var(--border)] sm:max-w-sm",
        right: "inset-y-0 right-0 h-full w-3/4 border-l border-[var(--border)] sm:max-w-sm",
      },
    },
    defaultVariants: {
      side: "right",
    },
  }
);

type SheetSide = NonNullable<VariantProps<typeof sheetVariants>["side"]>;

/** Off-screen position per side: the panel travels its own size from the edge it lives on. */
const OFFSCREEN: Record<SheetSide, { x?: string; y?: string }> = {
  top: { y: "-100%" },
  bottom: { y: "100%" },
  left: { x: "-100%" },
  right: { x: "100%" },
};

/** Reduced motion: no travel, a short opacity change (≤ 120 ms). */
const REDUCED_FADE = { duration: 0.12, ease: "linear" as const };

function SheetCloseButton() {
  return (
    <SheetPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-[var(--background)] transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-[var(--secondary)]">
      <XIcon className="size-4" />
      <span className="sr-only">Close</span>
    </SheetPrimitive.Close>
  );
}

function SheetContent({
  className,
  children,
  side = "right",
  style,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Content> &
  VariantProps<typeof sheetVariants>) {
  const open = React.useContext(SheetOpenContext);
  // OS preference, or a <MotionConfig reducedMotion="always"> above (which useReducedMotion ignores).
  const prefersReduced = useReducedMotion();
  const reduced =
    Boolean(prefersReduced) || React.useContext(MotionConfigContext).reducedMotion === "always";
  const resolvedSide: SheetSide = side ?? "right";

  // Bare Radix Root without <Sheet>: no open state to animate from, keep Radix mounting.
  if (open === null) {
    return (
      <SheetPortal>
        <SheetOverlay />
        <SheetPrimitive.Content
          data-slot="sheet-content"
          className={cn(sheetVariants({ side: resolvedSide }), className)}
          style={style}
          {...props}
        >
          <SheetCloseButton />
          {children}
        </SheetPrimitive.Content>
      </SheetPortal>
    );
  }

  const hidden = reduced ? { opacity: 0 } : { ...OFFSCREEN[resolvedSide] };
  const shown = reduced ? { opacity: 1 } : { x: 0, y: 0 };

  return (
    <AnimatePresence>
      {open && (
        <SheetPortal forceMount>
          <SheetPrimitive.Overlay data-slot="sheet-overlay" forceMount asChild>
            <motion.div
              className={overlayClassName}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, pointerEvents: "none" }}
              transition={reduced ? REDUCED_FADE : springTransition("smooth")}
            />
          </SheetPrimitive.Overlay>
          <SheetPrimitive.Content
            data-slot="sheet-content"
            forceMount
            asChild
            {...props}
          >
            <motion.div
              className={cn(sheetVariants({ side: resolvedSide }), className)}
              style={style as MotionStyle}
              initial={hidden}
              animate={shown}
              exit={{ ...hidden, pointerEvents: "none" }}
              transition={reduced ? REDUCED_FADE : springTransition("gentle")}
            >
              <SheetCloseButton />
              {children}
            </motion.div>
          </SheetPrimitive.Content>
        </SheetPortal>
      )}
    </AnimatePresence>
  );
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-header"
      className={cn(
        "flex flex-col space-y-2 text-center sm:text-left",
        className
      )}
      {...props}
    />
  );
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn(
        "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
        className
      )}
      {...props}
    />
  );
}

function SheetTitle({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Title>) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn(
        "text-lg font-semibold text-[var(--foreground)]",
        className
      )}
      {...props}
    />
  );
}

function SheetDescription({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Description>) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn("text-sm text-[var(--muted-foreground)]", className)}
      {...props}
    />
  );
}

export {
  Sheet,
  SheetPortal,
  SheetOverlay,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
  sheetVariants,
};
