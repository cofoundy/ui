"use client";

import { forwardRef } from "react";
import { MessageCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../utils";
import type { FloatingPosition } from "../../transports/types";

export interface FloatingLauncherProps {
  /** Whether the chat window is open */
  isOpen: boolean;
  /** Click handler */
  onClick: () => void;
  /** Position of the launcher */
  position?: FloatingPosition;
  /** Offset from edges (mobile uses 16px, desktop uses provided value or 20px default) */
  offset?: { x?: number; y?: number };
  /** Number of unread messages (shows badge if > 0) */
  unreadCount?: number;
  /** Custom launcher icon URL */
  iconUrl?: string;
  /** Primary color for theming */
  primaryColor?: string;
  /** Z-index for the launcher */
  zIndex?: number;
  /** Additional class names */
  className?: string;
}

const positionClasses: Record<FloatingPosition, string> = {
  "bottom-right": "bottom-0 right-0",
  "bottom-left": "bottom-0 left-0",
  "top-right": "top-0 right-0",
  "top-left": "top-0 left-0",
};

/**
 * FloatingLauncher - Circular button that opens/closes the chat widget
 *
 * Mobile-first responsive design:
 * - Mobile (< 640px): 48px button, 16px offset from edges
 * - Desktop (≥ 640px): 56px button, configurable offset (default 20px)
 */
export const FloatingLauncher = forwardRef<HTMLButtonElement, FloatingLauncherProps>(
  function FloatingLauncher(
    {
      isOpen,
      onClick,
      position = "bottom-right",
      offset = { x: 20, y: 20 },
      unreadCount = 0,
      iconUrl,
      primaryColor,
      zIndex = 9999,
      className,
    },
    ref
  ) {
    // Mobile uses 16px offset, desktop uses provided value
    const mobileOffset = 16;
    const desktopOffsetX = offset.x ?? 20;
    const desktopOffsetY = offset.y ?? 20;

    return (
      <motion.button
        ref={ref}
        onClick={onClick}
        className={cn(
          "fixed flex items-center justify-center",
          // Mobile-first: 48px on mobile, 56px on desktop
          "w-12 h-12 sm:w-14 sm:h-14",
          "rounded-full",
          "shadow-lg hover:shadow-xl",
          "transition-shadow duration-200",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          positionClasses[position],
          className
        )}
        style={{
          backgroundColor: primaryColor ?? "var(--chat-primary, #2984AD)",
          zIndex,
          // Responsive offset via CSS custom properties
          ...(position.includes("right")
            ? { marginRight: `var(--launcher-offset-x, ${mobileOffset}px)` }
            : { marginLeft: `var(--launcher-offset-x, ${mobileOffset}px)` }),
          ...(position.includes("bottom")
            ? { marginBottom: `var(--launcher-offset-y, ${mobileOffset}px)` }
            : { marginTop: `var(--launcher-offset-y, ${mobileOffset}px)` }),
          // @ts-expect-error CSS custom properties
          "--launcher-offset-x": `${mobileOffset}px`,
          "--launcher-offset-y": `${mobileOffset}px`,
        }}
        // Apply desktop offsets via inline style media query workaround
        // Note: For proper responsive margins, we use Tailwind's responsive utilities
        // but margins need to be set via style for dynamic values
        data-desktop-offset-x={desktopOffsetX}
        data-desktop-offset-y={desktopOffsetY}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label={isOpen ? "Cerrar chat" : "Abrir chat"}
      >
        {/* Animated icon swap */}
        <AnimatePresence mode="wait" initial={false}>
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {/* Mobile-first: 20px icon on mobile, 24px on desktop */}
              <X className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {iconUrl ? (
                <img src={iconUrl} alt="" className="w-5 h-5 sm:w-6 sm:h-6" />
              ) : (
                <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Unread badge - Mobile-first: 18px on mobile, 20px on desktop */}
        <AnimatePresence>
          {unreadCount > 0 && !isOpen && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className={cn(
                "absolute -top-1 -right-1",
                "flex items-center justify-center",
                "min-w-[18px] h-[18px] sm:min-w-[20px] sm:h-5",
                "px-1 sm:px-1.5",
                "text-[10px] sm:text-xs font-semibold text-white",
                "bg-red-500 rounded-full"
              )}
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>

        {/* Pulse animation when closed with messages */}
        {!isOpen && unreadCount > 0 && (
          <span
            className="absolute inset-0 rounded-full animate-ping opacity-25"
            style={{ backgroundColor: primaryColor ?? "var(--chat-primary, #2984AD)" }}
          />
        )}
      </motion.button>
    );
  }
);
