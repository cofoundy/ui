// react/useKeyboardInset.ts — the actual mobile-keyboard fix (architecture-v1.md §8 / T-007
// acceptance #2). `MobileComposer.tsx` (inbox-ai, 13 KB fork) never touches `visualViewport` —
// grepped, zero hits across its whole frontend — so THIS is new ground, not a port of anything.
//
// Two layers, deliberately BOTH present, because a consumer page may or may not set
// `interactive-widget=resizes-content` on its own `<meta name="viewport">` (this component
// cannot set that tag itself — it doesn't own the document `<head>`, only its own subtree):
//
//  1. If the page DOES set it: the layout viewport itself shrinks when the keyboard opens, so
//     `100dvh` (ChatSim.tsx's live-mode root) already tracks the visible area and
//     `window.innerHeight` moves with `visualViewport.height` — this hook's computed inset
//     converges to ~0, a no-op.
//  2. If the page does NOT (default `resizes-visual`, or an older engine): the layout viewport
//     stays full-height and `visualViewport` shrinks instead — THIS is the gap
//     `MobileComposer.tsx` never had to close because it relies entirely on native layout
//     (architecture-v1.md §8's own framing) and inbox-ai apparently accepted that gap. The
//     fallback inset below (`innerHeight - visualViewport.height - offsetTop`) is what pulls the
//     composer back above the keyboard in that case.
//
// No `window`/`document` reference outside `useEffect` — this file is safe to import into a
// server-rendered tree (the effect simply never runs server-side).

import { useEffect, useRef, useState } from 'react';

/** Returns the current keyboard-occlusion inset in px (0 when no keyboard, or when
 * `visualViewport` is unsupported — older browsers fall back to whatever native layout gives
 * them, same ceiling `MobileComposer.tsx` already accepts). `onChange` fires on every measured
 * change, read via a ref so callers don't need to memoize it to keep the effect stable. */
export function useKeyboardInset(onChange?: (inset: number) => void): number {
  const [inset, setInset] = useState(0);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    const measure = (): void => {
      const next = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      setInset(next);
      onChangeRef.current?.(next);
    };

    measure();
    vv.addEventListener('resize', measure);
    vv.addEventListener('scroll', measure);
    return () => {
      vv.removeEventListener('resize', measure);
      vv.removeEventListener('scroll', measure);
    };
  }, []);

  return inset;
}
