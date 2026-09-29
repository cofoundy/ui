import * as React from "react"

/**
 * Drives an `EdgeLayers` indicator: finds the active element inside `listRef`, measures it
 * against `pillRef` (the frame that hosts `<EdgeLayers />`) and writes `--cf-edge-l` /
 * `--cf-edge-r` on the pill. The travel direction goes on the list as `data-cf-dir`
 * ("left" | "right"), which is what arms the per-edge springs in `styles/index.css`.
 *
 * Re-measures on attribute changes inside the list (MutationObserver on `observe`) and on
 * resize (a resize mid-travel retargets the springs instead of cutting them).
 * No active element → `data-empty` on the pill.
 *
 * Shared by `TabsList`, `TabBar` and SchemaForm's segmented control.
 */
export interface UseEdgeIndicatorOptions {
  /** Attributes whose change means "the active element moved". Default `["data-state"]`. */
  observe?: string[]
  /**
   * Place instantly (no `data-cf-dir`, so no transition matches). Default `false`.
   * Read at measure time, so it may change between renders.
   */
  reduced?: boolean
  /**
   * `true`: with nothing active, forget the last position and drop `data-cf-dir`, so the next
   * active element gets the pill in place instead of sliding in from a stale spot; the first
   * placement is always instant too. `false` (default, Tabs): the direction is only
   * updated when the position changes and transitions are gated by `data-ready`.
   */
  resetOnEmpty?: boolean
  /** Set `data-ready` on the list one frame after the first placement (no slide-in on mount). Default `true`. */
  armReady?: boolean
  /**
   * Concentric corners: `--cf-edge-rad` = the list's radius − the pill's top inset.
   * Default `false` (keep whatever radius the pill already has).
   */
  concentric?: boolean
  /** Runs before each measurement once an active element was found (e.g. size the pill). */
  beforeMeasure?: (list: HTMLElement, pill: HTMLElement, active: HTMLElement) => void
}

export function useEdgeIndicator(
  listRef: React.RefObject<HTMLElement | null>,
  pillRef: React.RefObject<HTMLElement | null>,
  activeSelector: string,
  options: UseEdgeIndicatorOptions = {}
): { measure: () => void } {
  const {
    observe = ["data-state"],
    reduced = false,
    resetOnEmpty = false,
    armReady = true,
    concentric = false,
  } = options

  const lastLeft = React.useRef<number | null>(null)
  // Latest options without re-subscribing the observers on every render.
  const opts = React.useRef({ reduced, resetOnEmpty, concentric, beforeMeasure: options.beforeMeasure })
  opts.current = { reduced, resetOnEmpty, concentric, beforeMeasure: options.beforeMeasure }

  const measure = React.useCallback(() => {
    const list = listRef.current
    const pill = pillRef.current
    if (!list || !pill) return
    const o = opts.current
    const active = list.querySelector<HTMLElement>(activeSelector)
    if (!active) {
      pill.dataset.empty = ""
      if (o.resetOnEmpty) {
        delete list.dataset.cfDir
        lastLeft.current = null
      }
      return
    }
    o.beforeMeasure?.(list, pill, active)
    const p = pill.getBoundingClientRect()
    const a = active.getBoundingClientRect()
    const l = a.left - p.left
    const r = a.right - p.left // right-edge position (not an inset)
    if (o.reduced || (o.resetOnEmpty && lastLeft.current === null)) {
      delete list.dataset.cfDir // no transition rule matches → instant placement
    } else if (lastLeft.current !== null && l !== lastLeft.current) {
      list.dataset.cfDir = l > lastLeft.current ? "right" : "left"
    }
    lastLeft.current = l
    if (o.concentric) {
      // Inner radius = the list's radius − its padding (the list clips to its own rounded box,
      // so a squarer pill would be cut at the ends).
      const outer = parseFloat(getComputedStyle(list).borderTopLeftRadius) || 0
      pill.style.setProperty("--cf-edge-rad", `${Math.max(0, outer - pill.offsetTop)}px`)
    }
    pill.style.setProperty("--cf-edge-l", `${l}px`)
    pill.style.setProperty("--cf-edge-r", `${r}px`)
    delete pill.dataset.empty
  }, [listRef, pillRef, activeSelector])

  const observeKey = observe.join(",")
  React.useLayoutEffect(() => {
    const list = listRef.current
    if (!list) return
    measure()
    const arm = armReady
      ? requestAnimationFrame(() => {
          list.dataset.ready = ""
        })
      : 0
    const mo = new MutationObserver(measure)
    mo.observe(list, { subtree: true, attributes: true, attributeFilter: observeKey.split(",") })
    const ro = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(() => measure())
    ro?.observe(list)
    return () => {
      if (arm) cancelAnimationFrame(arm)
      mo.disconnect()
      ro?.disconnect()
    }
  }, [measure, listRef, observeKey, armReady])

  return { measure }
}
