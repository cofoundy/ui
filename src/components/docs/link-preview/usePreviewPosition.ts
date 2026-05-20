import { useEffect, useLayoutEffect, useRef, useState } from 'react';

/**
 * Hover-link preview positioning.
 *
 * - Anchors below the trigger by default, flips above near viewport bottom
 * - Clamps horizontally so popover stays inside viewport with `viewportPadding`
 * - Recalculates on scroll/resize while open
 * - No deps. ~60 lines of math.
 *
 * IMPORTANT: takes `triggerEl` (HTMLElement), not a DOMRect — DOMRect identity
 * changes every read, which would cause effect thrash.
 */

export interface PositionInput {
  triggerEl: HTMLElement | null;
  popoverEl: HTMLElement | null;
  /** px of breathing room between trigger and popover. Default 8. */
  offset?: number;
  /** px clamp from viewport edges. Default 12. */
  viewportPadding?: number;
}

export interface Position {
  top: number;
  left: number;
  /** Which side the popover anchored to — useful for arrow/motion direction. */
  placement: 'bottom' | 'top';
}

const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

export function usePreviewPosition({
  triggerEl,
  popoverEl,
  offset = 8,
  viewportPadding = 12,
}: PositionInput): Position | null {
  const [pos, setPos] = useState<Position | null>(null);

  useIsoLayoutEffect(() => {
    if (!triggerEl || !popoverEl) {
      setPos(null);
      return;
    }
    let raf = 0;
    function compute() {
      if (!triggerEl || !popoverEl) return;
      const triggerRect = triggerEl.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const pw = popoverEl.offsetWidth;
      const ph = popoverEl.offsetHeight;

      const spaceBelow = vh - triggerRect.bottom;
      const placement: 'bottom' | 'top' =
        spaceBelow >= ph + offset + viewportPadding || spaceBelow >= vh / 2 ? 'bottom' : 'top';
      const top = placement === 'bottom' ? triggerRect.bottom + offset : triggerRect.top - ph - offset;

      let left = triggerRect.left;
      if (left + pw > vw - viewportPadding) left = vw - viewportPadding - pw;
      if (left < viewportPadding) left = viewportPadding;

      // De-dup identical positions to break ResizeObserver / scroll feedback loops.
      setPos((prev) =>
        prev && prev.top === top && prev.left === left && prev.placement === placement
          ? prev
          : { top, left, placement },
      );
    }
    function scheduleCompute() {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(compute);
    }
    compute();

    const ro = new ResizeObserver(scheduleCompute);
    ro.observe(popoverEl);
    window.addEventListener('scroll', scheduleCompute, true);
    window.addEventListener('resize', scheduleCompute);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener('scroll', scheduleCompute, true);
      window.removeEventListener('resize', scheduleCompute);
    };
  }, [triggerEl, popoverEl, offset, viewportPadding]);

  return pos;
}

/** Detect touch-primary input — used to short-circuit preview on mobile. */
export function isTouchPrimary(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia?.('(hover: none)').matches ?? false;
}

/** Respect prefers-reduced-motion. */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
}

/** Stable, fresh ref to the latest value — for closures inside event listeners. */
export function useLatest<T>(value: T) {
  const ref = useRef(value);
  ref.current = value;
  return ref;
}
