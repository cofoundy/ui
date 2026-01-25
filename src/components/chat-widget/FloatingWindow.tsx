"use client";

import { forwardRef, type ReactNode, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "../../utils";
import type { FloatingPosition } from "../../transports/types";

export interface FloatingWindowProps {
  /** Whether the window is open */
  isOpen: boolean;
  /** Position of the window (ignored on mobile - always full-screen) */
  position?: FloatingPosition;
  /** Offset from edges (desktop only) */
  offset?: { x?: number; y?: number };
  /** Z-index for the window */
  zIndex?: number;
  /** Children to render inside the window */
  children: ReactNode;
  /** Additional class names */
  className?: string;
}

// Position styles for the window (desktop only)
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
 * Mobile-first responsive design:
 * - Mobile (< 640px): True full-screen (inset-0), no rounded corners
 * - Desktop (≥ 640px): Floating window with position, rounded corners
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
    const [isMobile, setIsMobile] = useState(false);

    // Detect mobile viewport for animation differences
    useEffect(() => {
      const checkMobile = () => {
        setIsMobile(window.innerWidth < 640);
      };
      checkMobile();
      window.addEventListener("resize", checkMobile);
      return () => window.removeEventListener("resize", checkMobile);
    }, []);

    const positionStyles = getPositionStyles(position, offset);
    const isBottom = position.includes("bottom");
    const isRight = position.includes("right");

    // Animation variants differ between mobile and desktop
    const getAnimateProps = () => {
      if (isMobile) {
        // Mobile: slide up from bottom
        return {
          opacity: isOpen ? 1 : 0,
          y: isOpen ? 0 : "100%",
          pointerEvents: isOpen ? ("auto" as const) : ("none" as const),
        };
      }
      // Desktop: scale + directional offset
      return {
        opacity: isOpen ? 1 : 0,
        scale: isOpen ? 1 : 0.9,
        y: isOpen ? 0 : isBottom ? 20 : -20,
        x: isOpen ? 0 : isRight ? 20 : -20,
        pointerEvents: isOpen ? ("auto" as const) : ("none" as const),
      };
    };

    return (
      <motion.div
        ref={ref}
        className={cn(
          "fixed",
          // Mobile-first: true full-screen on mobile
          "inset-0",
          // Desktop: reset inset and apply floating dimensions
          "sm:inset-auto",
          "sm:w-[380px] sm:h-[600px]",
          "sm:max-w-[calc(100vw-40px)] sm:max-h-[calc(100vh-140px)]",
          // Background
          "bg-[var(--chat-background,#0a0f1a)]",
          // Mobile: no rounded corners, no border (edge-to-edge)
          "rounded-none sm:rounded-2xl",
          "border-0 sm:border sm:border-[var(--chat-border,rgba(255,255,255,0.1))]",
          // Shadow only on desktop
          "sm:shadow-2xl",
          "overflow-hidden",
          className
        )}
        style={{
          // Desktop position styles (mobile uses inset-0 via Tailwind)
          ...(isMobile ? {} : positionStyles),
          zIndex,
        }}
        initial={false}
        animate={getAnimateProps()}
        transition={
          isMobile
            ? {
                type: "spring",
                stiffness: 400,
                damping: 30,
              }
            : {
                type: "spring",
                stiffness: 300,
                damping: 25,
                duration: isOpen ? undefined : 0.15,
              }
        }
        aria-hidden={!isOpen}
      >
        {children}
      </motion.div>
    );
  }
);
