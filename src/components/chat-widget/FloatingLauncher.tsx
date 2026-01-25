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
  /** Offset from edges */
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
    const offsetStyle = {
      ...(position.includes("right") ? { marginRight: offset.x ?? 20 } : { marginLeft: offset.x ?? 20 }),
      ...(position.includes("bottom") ? { marginBottom: offset.y ?? 20 } : { marginTop: offset.y ?? 20 }),
    };

    return (
      <motion.button
        ref={ref}
        onClick={onClick}
        className={cn(
          "fixed flex items-center justify-center",
          "w-14 h-14 rounded-full",
          "shadow-lg hover:shadow-xl",
          "transition-shadow duration-200",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          positionClasses[position],
          className
        )}
        style={{
          backgroundColor: primaryColor ?? "var(--chat-primary, #2984AD)",
          zIndex,
          ...offsetStyle,
        }}
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
              <X className="w-6 h-6 text-white" />
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
                <img src={iconUrl} alt="" className="w-6 h-6" />
              ) : (
                <MessageCircle className="w-6 h-6 text-white" />
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Unread badge */}
        <AnimatePresence>
          {unreadCount > 0 && !isOpen && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className={cn(
                "absolute -top-1 -right-1",
                "flex items-center justify-center",
                "min-w-[20px] h-5 px-1.5",
                "text-xs font-semibold text-white",
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
