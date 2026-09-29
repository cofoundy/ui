import * as React from "react";
import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";
import {
  AnimatePresence,
  motion,
  useReducedMotionConfig,
  type Transition,
  type Variants,
} from "framer-motion";
import { ChevronDown, type LucideIcon } from "lucide-react";

import { cn } from "../../utils/cn";
import { springTransition } from "../../lib/spring";

/**
 * Collapsible — Radix Collapsible with an animated height.
 *
 * Opening: the height grows with the `smooth` spring (`height: auto`) and the content fades in
 * a beat later. Closing: the content fades out first (~80 ms), then the height collapses.
 * `CollapsibleChevron` is an optional helper whose icon turns with the `snappy` spring.
 * Reduced motion (OS or `<MotionConfig reducedMotion="always">`): instant height, opacity ≤120 ms.
 *
 * The public API is Radix's; `CollapsibleContent` adds `animated` (default `true`).
 */

const CollapsibleOpenContext = React.createContext<boolean | null>(null);

function Collapsible({
  open: openProp,
  defaultOpen,
  onOpenChange,
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.Root>) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(
    defaultOpen ?? false,
  );
  const controlled = openProp !== undefined;
  const open = controlled ? openProp : uncontrolledOpen;

  const handleOpenChange = React.useCallback(
    (next: boolean) => {
      if (!controlled) setUncontrolledOpen(next);
      onOpenChange?.(next);
    },
    [controlled, onOpenChange],
  );

  return (
    <CollapsibleOpenContext.Provider value={open}>
      <CollapsiblePrimitive.Root
        data-slot="collapsible"
        open={open}
        onOpenChange={handleOpenChange}
        {...props}
      />
    </CollapsibleOpenContext.Provider>
  );
}

function CollapsibleTrigger({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleTrigger>) {
  return (
    <CollapsiblePrimitive.CollapsibleTrigger
      data-slot="collapsible-trigger"
      {...props}
    />
  );
}

/** Content leaves before the box closes; enters once the box has started opening. */
const CONTENT_EXIT_S = 0.08;
const CONTENT_ENTER_DELAY_S = 0.08;

function useContentMotion() {
  const reduced = useReducedMotionConfig() ?? false;
  return React.useMemo(() => {
    const smooth = springTransition("smooth");
    const box: Variants = reduced
      ? {
          open: { height: "auto", transition: { duration: 0 } },
          closed: { height: 0, transition: { duration: 0, delay: CONTENT_EXIT_S } },
        }
      : {
          open: { height: "auto", transition: smooth },
          closed: {
            height: 0,
            transition: { ...smooth, delay: CONTENT_EXIT_S * 0.75 },
          },
        };
    const inner: Variants = reduced
      ? {
          open: { opacity: 1, transition: { duration: 0.12 } },
          closed: { opacity: 0, transition: { duration: CONTENT_EXIT_S } },
        }
      : {
          open: {
            opacity: 1,
            transition: { ...smooth, delay: CONTENT_ENTER_DELAY_S },
          },
          closed: {
            opacity: 0,
            transition: { duration: CONTENT_EXIT_S, ease: "linear" },
          },
        };
    return { box, inner };
  }, [reduced]);
}

type CollapsibleContentProps = React.ComponentProps<
  typeof CollapsiblePrimitive.CollapsibleContent
> & {
  /**
   * Animate height + content opacity. Default `true`. `false` = the plain Radix content
   * (mount/unmount, no motion) — also what you get under a raw Radix root.
   */
  animated?: boolean;
};

function CollapsibleContent({
  animated = true,
  forceMount,
  asChild,
  className,
  children,
  ...props
}: CollapsibleContentProps) {
  const open = React.useContext(CollapsibleOpenContext);
  const { box, inner } = useContentMotion();
  const boxRef = React.useRef<HTMLDivElement>(null);

  // Closed but kept mounted (forceMount, or mid-exit): out of the tab order and a11y tree.
  // Set by hand: React 18 doesn't know the `inert` prop.
  React.useEffect(() => {
    boxRef.current?.toggleAttribute("inert", open === false);
  }, [open]);

  // Plain Radix: opted out, `asChild` (we can't wrap the consumer's element), or rendered
  // under a raw Radix root whose open state we can't read.
  if (!animated || asChild || open === null) {
    return (
      <CollapsiblePrimitive.CollapsibleContent
        data-slot="collapsible-content"
        forceMount={forceMount}
        asChild={asChild}
        className={className}
        {...props}
      >
        {children}
      </CollapsiblePrimitive.CollapsibleContent>
    );
  }

  const state = open ? "open" : "closed";
  // The outer box animates height and clips; the consumer's className lives on the inner
  // element so padding/margins/`space-y-*` are clipped with it instead of popping.
  const body = (
    <CollapsiblePrimitive.CollapsibleContent
      forceMount
      asChild
      data-slot="collapsible-content"
      {...props}
    >
      <motion.div
        ref={boxRef}
        variants={box}
        initial="closed"
        animate={state}
        exit="closed"
        style={{ overflow: "hidden" }}
      >
        <motion.div
          data-slot="collapsible-content-inner"
          data-state={state}
          variants={inner}
          className={className}
        >
          {children}
        </motion.div>
      </motion.div>
    </CollapsiblePrimitive.CollapsibleContent>
  );

  if (forceMount) return body;
  return (
    <AnimatePresence initial={false}>{open ? body : null}</AnimatePresence>
  );
}

type CollapsibleChevronProps = Omit<
  React.ComponentProps<typeof motion.span>,
  "children" | "animate" | "transition" | "initial"
> & {
  /** Icon to turn. Default `ChevronDown`. */
  icon?: LucideIcon;
  /** Degrees when open. Default `180` (a `ChevronRight` usually wants `90`). */
  openRotation?: number;
};

/**
 * Chevron that turns with the snappy spring when its `Collapsible` opens. Put it inside
 * `CollapsibleTrigger`; it's decorative (`aria-hidden`) — the trigger carries `aria-expanded`.
 */
function CollapsibleChevron({
  icon: Icon = ChevronDown,
  openRotation = 180,
  className,
  ...props
}: CollapsibleChevronProps) {
  const open = React.useContext(CollapsibleOpenContext) ?? false;
  const reduced = useReducedMotionConfig() ?? false;
  const transition: Transition = reduced
    ? { duration: 0 }
    : springTransition("snappy");
  return (
    <motion.span
      aria-hidden
      data-slot="collapsible-chevron"
      className={cn("inline-flex shrink-0 items-center justify-center", className)}
      initial={false}
      animate={{ rotate: open ? openRotation : 0 }}
      transition={transition}
      {...props}
    >
      <Icon className="size-4" />
    </motion.span>
  );
}

export {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
  CollapsibleChevron,
};
