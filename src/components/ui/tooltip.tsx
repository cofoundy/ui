"use client";

import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { useReducedMotion } from "framer-motion";

import { cn } from "../../utils/cn";

/**
 * Motion
 * - Opens with a fade + 4 px travel TOWARD its `side` (it rises out of the trigger), on
 *   --cf-spring-snappy. Closes faster (--cf-duration-fast) and travels back only 2 px.
 * - Neighbours open with no delay: all `Tooltip`s under one `TooltipProvider` share Radix's
 *   skip window (`skipDelayDuration`, 300 ms), and a bare `Tooltip` reuses an outer provider.
 * - Reduced motion (OS setting, or framer `MotionConfig reducedMotion="always"`): opacity only.
 * Radix `Presence` waits for a CSS `animationend` before unmounting, so the motion is a CSS
 * animation (not framer): the shared `cf-pop-in/out` pair in `styles/motion.css`, keyed by
 * `[data-slot="tooltip-content"]` + Radix's `data-side` (same rule as DropdownMenu).
 */

/** True when a TooltipProvider is mounted above: `Tooltip` then reuses it. */
const HasProviderContext = React.createContext(false);

function TooltipProvider({
  delayDuration = 0,
  skipDelayDuration = 300,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return (
    <HasProviderContext.Provider value={true}>
      <TooltipPrimitive.Provider
        data-slot="tooltip-provider"
        delayDuration={delayDuration}
        skipDelayDuration={skipDelayDuration}
        {...props}
      />
    </HasProviderContext.Provider>
  );
}

function Tooltip({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  const hasProvider = React.useContext(HasProviderContext);
  const root = <TooltipPrimitive.Root data-slot="tooltip" {...props} />;
  // Neighbouring tooltips only share the skip-delay window if they share ONE provider.
  // Wrapping every Tooltip in its own provider (the old behaviour) made each start cold.
  if (hasProvider) return root;
  return <TooltipProvider>{root}</TooltipProvider>;
}

function TooltipTrigger({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />;
}

function TooltipContent({
  className,
  sideOffset = 4,
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content>) {
  const reduced = useReducedMotion();
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        data-reduced={reduced ? "" : undefined}
        sideOffset={sideOffset}
        className={cn(
          "z-50 overflow-hidden rounded-md bg-[var(--primary)] px-3 py-1.5 text-xs text-[var(--primary-foreground)] origin-[var(--radix-tooltip-content-transform-origin)]",
          className
        )}
        {...props}
      >
        {children}
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
