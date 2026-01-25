"use client";

import { useState, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { ChatWidget } from "./ChatWidget";
import { FloatingLauncher } from "./FloatingLauncher";
import { FloatingWindow } from "./FloatingWindow";
import type { ChatWidgetConfig } from "../../types";

export interface ChatWidgetFloatingProps extends Omit<ChatWidgetConfig, "mode"> {
  /** Additional props specific to floating mode are in config.floating */
}

/**
 * ChatWidgetFloating - Floating chat widget with launcher button and popup window
 *
 * Renders outside the normal document flow via React Portal for proper z-index handling.
 */
export function ChatWidgetFloating({
  floating = {},
  theme = {},
  onOpenChange,
  ...widgetProps
}: ChatWidgetFloatingProps) {
  const [isOpen, setIsOpen] = useState(floating.defaultOpen ?? false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [mounted, setMounted] = useState(false);

  const {
    position = "bottom-right",
    showBadge = true,
    launcherIcon,
    offset = { x: 20, y: 20 },
    zIndex = 9999,
  } = floating;

  const { primaryColor } = theme;

  // Client-side only rendering for portal
  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle open/close
  const handleToggle = useCallback(() => {
    const newOpen = !isOpen;
    setIsOpen(newOpen);
    if (newOpen) {
      setUnreadCount(0); // Clear unread when opened
    }
    onOpenChange?.(newOpen);
  }, [isOpen, onOpenChange]);

  // Track messages when widget is closed
  const handleMessageReceived = useCallback(() => {
    if (!isOpen && showBadge) {
      setUnreadCount((prev) => prev + 1);
    }
  }, [isOpen, showBadge]);

  // Don't render portal on server
  if (!mounted) {
    return null;
  }

  // Render floating UI via portal
  return createPortal(
    <>
      {/* Chat Window */}
      <FloatingWindow
        isOpen={isOpen}
        position={position}
        offset={offset}
        zIndex={zIndex - 1}
      >
        <ChatWidget
          {...widgetProps}
          mode="embedded" // Always embedded inside the floating window
          theme={theme}
          onConnectionStatusChange={(status) => {
            widgetProps.onConnectionStatusChange?.(status);
            // Track messages for badge
            if (status === "connected") {
              // Connection established
            }
          }}
        />
      </FloatingWindow>

      {/* Launcher Button */}
      <FloatingLauncher
        isOpen={isOpen}
        onClick={handleToggle}
        position={position}
        offset={offset}
        unreadCount={unreadCount}
        iconUrl={launcherIcon}
        primaryColor={primaryColor}
        zIndex={zIndex}
      />
    </>,
    document.body
  );
}

/**
 * Convenience export - use this for floating mode
 */
export { ChatWidgetFloating as FloatingChatWidget };
