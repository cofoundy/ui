'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type {
  FetchPreview,
  GetPreview,
  LinkPreviewProviderProps,
  LinkPreviewVariant,
  PreviewData,
  PreviewResult,
} from './types';
import {
  isTouchPrimary,
  prefersReducedMotion,
  useLatest,
  usePreviewPosition,
} from './usePreviewPosition';
import { LinkPreviewSurface } from './LinkPreviewSurface';

/**
 * LinkPreviewProvider
 *
 * Mount once at the root of any region with previewable anchors (e.g.,
 * inside <DocLayout> wrapping the precompiled HTML article). Uses event
 * delegation — no per-link wiring required. Opt-in via `data-link-preview`
 * attribute on anchors, OR by passing a custom selector.
 *
 * Data flow:
 *   1. mouseenter on opt-in anchor → start openDelay timer (default 180ms)
 *   2. on fire: synchronous `getPreview(href)` — if hit, render immediately
 *      else show skeleton + call async `fetchPreview(href)`
 *   3. mouseleave on trigger → closeDelay (120ms) — cancelled if cursor
 *      moves into popover (mouseenter on popover root resets the timer)
 *   4. dismiss on: ESC, scroll (any), click outside, route change (consumer
 *      responsibility: trigger via key reset)
 *
 * SSR safety: provider is `'use client'`. The portal mounts only when a
 * preview is active, after first paint.
 *
 * Touch: if `disabled` is undefined, auto-disables on `(hover: none)` media.
 */

interface ActivePreview {
  trigger: HTMLAnchorElement;
  href: string;
  result: PreviewResult;
}

export function LinkPreviewProvider({
  children,
  getPreview,
  fetchPreview,
  openDelay = 180,
  closeDelay = 120,
  variant = 'quiet',
  disabled,
  selector = 'a[data-link-preview]',
}: LinkPreviewProviderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<ActivePreview | null>(null);
  const [popoverEl, setPopoverEl] = useState<HTMLElement | null>(null);
  const triggerEl = active ? active.trigger : null;
  const position = usePreviewPosition({ triggerEl, popoverEl });

  // Auto-disable on touch.
  const [touchDisabled, setTouchDisabled] = useState(false);
  useEffect(() => {
    if (disabled !== undefined) return;
    setTouchDisabled(isTouchPrimary());
  }, [disabled]);

  const effectivelyDisabled = disabled ?? touchDisabled;

  // Refs for stable closures inside event listeners.
  const openTimerRef = useRef<number | null>(null);
  const closeTimerRef = useRef<number | null>(null);
  const fetchAbortRef = useRef<AbortController | null>(null);
  const latestActive = useLatest(active);
  const latestDisabled = useLatest(effectivelyDisabled);

  const clearTimers = useCallback(() => {
    if (openTimerRef.current) {
      window.clearTimeout(openTimerRef.current);
      openTimerRef.current = null;
    }
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const dismiss = useCallback(() => {
    clearTimers();
    fetchAbortRef.current?.abort();
    fetchAbortRef.current = null;
    setActive(null);
  }, [clearTimers]);

  const openFor = useCallback(
    async (anchor: HTMLAnchorElement) => {
      const href = anchor.getAttribute('href');
      if (!href) return;

      // Same-origin only — never preview external links.
      try {
        const url = new URL(href, window.location.origin);
        if (url.origin !== window.location.origin) return;
      } catch {
        return;
      }

      // 1. Sync cache hit.
      const cached = getPreview?.(href) ?? null;
      if (cached) {
        setActive({ trigger: anchor, href, result: { state: 'ready', data: cached } });
        return;
      }

      // 2. Async fetch.
      if (!fetchPreview) {
        // Nothing to show; bail silently.
        return;
      }
      setActive({ trigger: anchor, href, result: { state: 'loading' } });
      const ac = new AbortController();
      fetchAbortRef.current = ac;
      try {
        const data = await fetchPreview(href);
        if (ac.signal.aborted) return;
        setActive((curr) => (curr && curr.href === href ? { ...curr, result: { state: 'ready', data } } : curr));
      } catch {
        if (ac.signal.aborted) return;
        setActive((curr) => (curr && curr.href === href ? { ...curr, result: { state: 'error', reason: 'network' } } : curr));
      }
    },
    [getPreview, fetchPreview],
  );

  // Event delegation.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    function isOptIn(target: EventTarget | null): HTMLAnchorElement | null {
      if (!(target instanceof Element)) return null;
      const anchor = target.closest(selector) as HTMLAnchorElement | null;
      return anchor;
    }

    function onEnter(e: MouseEvent | FocusEvent) {
      if (latestDisabled.current) return;
      const anchor = isOptIn(e.target);
      if (!anchor) return;
      clearTimers();
      openTimerRef.current = window.setTimeout(() => {
        openFor(anchor);
      }, openDelay);
    }

    function onLeave(e: MouseEvent | FocusEvent) {
      const anchor = isOptIn(e.target);
      if (!anchor) return;
      // Cancel pending open; schedule close.
      if (openTimerRef.current) {
        window.clearTimeout(openTimerRef.current);
        openTimerRef.current = null;
      }
      if (!latestActive.current) return;
      closeTimerRef.current = window.setTimeout(dismiss, closeDelay);
    }

    container.addEventListener('mouseover', onEnter);
    container.addEventListener('mouseout', onLeave);
    container.addEventListener('focusin', onEnter);
    container.addEventListener('focusout', onLeave);
    return () => {
      container.removeEventListener('mouseover', onEnter);
      container.removeEventListener('mouseout', onLeave);
      container.removeEventListener('focusin', onEnter);
      container.removeEventListener('focusout', onLeave);
    };
  }, [selector, openDelay, closeDelay, openFor, dismiss, clearTimers, latestActive, latestDisabled]);

  // Global dismiss listeners while open.
  useEffect(() => {
    if (!active) return;
    const current = active;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') dismiss();
    }
    function onScroll(e: Event) {
      // Ignore scroll inside the popover itself.
      if (popoverEl && e.target instanceof Node && popoverEl.contains(e.target)) return;
      dismiss();
    }
    function onClickOutside(e: MouseEvent) {
      if (!(e.target instanceof Node)) return;
      if (popoverEl?.contains(e.target)) return;
      if (current.trigger.contains(e.target)) return;
      dismiss();
    }
    window.addEventListener('keydown', onKey);
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('mousedown', onClickOutside);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('mousedown', onClickOutside);
    };
  }, [active, popoverEl, dismiss]);

  // Cancel close-timer when cursor enters popover.
  const onPopoverEnter = useCallback(() => {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);
  const onPopoverLeave = useCallback(() => {
    closeTimerRef.current = window.setTimeout(dismiss, closeDelay);
  }, [closeDelay, dismiss]);

  const reduceMotion = typeof window !== 'undefined' ? prefersReducedMotion() : false;

  return (
    <div ref={containerRef} data-slot="link-preview-provider">
      {children}
      {active && typeof document !== 'undefined' &&
        createPortal(
          <LinkPreviewSurface
            ref={setPopoverEl}
            variant={variant}
            result={active.result}
            href={active.href}
            position={position}
            onMouseEnter={onPopoverEnter}
            onMouseLeave={onPopoverLeave}
            reduceMotion={reduceMotion}
          />,
          document.body,
        )}
    </div>
  );
}

export type { LinkPreviewVariant, PreviewData, FetchPreview, GetPreview };
