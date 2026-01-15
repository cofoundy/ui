"use client";

import { useRef, useCallback, useState, useEffect, type RefObject } from "react";

export interface UseAutoScrollOptions {
  /** Pixels from bottom to consider "at bottom" (default: 50) */
  threshold?: number;
  /** Delay before scrolling in ms (default: 50) */
  scrollDelay?: number;
}

export interface UseAutoScrollReturn {
  /** Ref to attach to the scrollable container */
  containerRef: RefObject<HTMLDivElement>;
  /** Scroll to bottom of container */
  scrollToBottom: (force?: boolean) => void;
  /** Whether user has scrolled up and locked auto-scroll */
  isUserScrollLocked: boolean;
  /** Handler for scroll events - attach to onScroll */
  handleScroll: () => void;
}

/**
 * Hook for managing auto-scroll behavior in message lists.
 * Automatically scrolls to bottom on new content, but respects
 * user scroll position if they've scrolled up.
 */
export function useAutoScroll(options: UseAutoScrollOptions = {}): UseAutoScrollReturn {
  const { threshold = 50, scrollDelay = 50 } = options;

  const containerRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isUserScrollLocked, setIsUserScrollLocked] = useState(false);

  // Check if scrolled to bottom (within threshold)
  const isAtBottom = useCallback(() => {
    const container = containerRef.current;
    if (!container) return true;
    return container.scrollHeight - container.scrollTop - container.clientHeight < threshold;
  }, [threshold]);

  // Scroll to bottom using scrollTop (local to container, not global)
  const scrollToBottom = useCallback((force = false) => {
    if (!force && isUserScrollLocked) return;

    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    scrollTimeoutRef.current = setTimeout(() => {
      const container = containerRef.current;
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }, scrollDelay);
  }, [isUserScrollLocked, scrollDelay]);

  // Handle scroll events to detect user scroll lock
  const handleScroll = useCallback(() => {
    const atBottom = isAtBottom();
    setIsUserScrollLocked(!atBottom);
  }, [isAtBottom]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  return {
    containerRef,
    scrollToBottom,
    isUserScrollLocked,
    handleScroll,
  };
}
