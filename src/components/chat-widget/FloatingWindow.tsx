"use client";

import { forwardRef, type ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "../../utils";
import type { FloatingPosition } from "../../transports/types";

export interface FloatingWindowProps {
  /** Whether the window is open */
  isOpen: boolean;
  /** Position of the window */
  position?: FloatingPosition;
  /** Offset from edges */
  offset?: { x?: number; y?: number };
  /** Z-index for the window */
  zIndex?: number;
  /** Children to render inside the window */
  children: ReactNode;
  /** Additional class names */
  className?: string;
}

// Position styles for the window
const getPositionStyles = (
  position: FloatingPosition,
  offset: { x?: number; y?: number }
): Record<string, number | string> => {
  const x = offset.x ?? 20;
  const y = offset.y ?? 20;
  // Window is positioned above the launcher button (launcher is 56px + margin)
  const launcherHeight = 56 + y + 16; // Button height + offset + gap

  switch (position) {
    case "bottom-right":
      return { bottom: launcherHeight, right: x };
    case "bottom-left":
      return { bottom: launcherHeight, left: x };
    case "top-right":
      return { top: launcherHeight, right: x };
    case "top-left":
      return { top: launcherHeight, left: x };
    default:
      return { bottom: launcherHeight, right: x };
  }
};

/**
 * FloatingWindow - Modal window container for floating chat widget
 *
 * IMPORTANT: Children remain mounted when closed to preserve state (messages, connection).
 * Only visibility and animations change on open/close.
 */
export const FloatingWindow = forwardRef<HTMLDivElement, FloatingWindowProps>(
  function FloatingWindow(
    {
      isOpen,
      position = "bottom-right",
      offset = { x: 20, y: 20 },
      zIndex = 9998,
      children,
      className,
    },
    ref
  ) {
    const positionStyles = getPositionStyles(position, offset);
    const isBottom = position.includes("bottom");
    const isRight = position.includes("right");

    return (
      <motion.div
        ref={ref}
        className={cn(
          "fixed",
          "w-[380px] h-[600px]",
          "max-w-[calc(100vw-40px)] max-h-[calc(100vh-140px)]",
          "bg-[var(--chat-background,#0a0f1a)]",
          "rounded-2xl",
          "shadow-2xl",
          "overflow-hidden",
          "border border-[var(--chat-border,rgba(255,255,255,0.1))]",
          // Mobile responsive
          "sm:w-[380px] sm:h-[600px]",
          className
        )}
        style={{
          ...positionStyles,
          zIndex,
        }}
        initial={false}
        animate={{
          opacity: isOpen ? 1 : 0,
          scale: isOpen ? 1 : 0.9,
          y: isOpen ? 0 : (isBottom ? 20 : -20),
          x: isOpen ? 0 : (isRight ? 20 : -20),
          pointerEvents: isOpen ? "auto" : "none",
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 25,
          duration: isOpen ? undefined : 0.15,
        }}
        aria-hidden={!isOpen}
      >
        {children}
      </motion.div>
    );
  }
);
