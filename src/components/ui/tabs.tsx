import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "../../utils/cn"
import { EdgeLayers } from "./edge-layers"

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  )
}

/**
 * One pill travels under the active trigger with two edges (see EdgeLayers): the leading edge
 * on `--cf-spring-edge`, the trailing one on `--cf-spring-smooth` compressed to 400 ms.
 * The list measures the active trigger itself (MutationObserver on `data-state`), so the
 * composable API is unchanged. No slide-in on mount: transitions arm after the first placement.
 */
function TabsList({
  className,
  children,
  ref,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  const listRef = React.useRef<HTMLDivElement | null>(null)
  const pillRef = React.useRef<HTMLSpanElement | null>(null)
  const lastLeft = React.useRef<number | null>(null)

  const setRefs = React.useCallback(
    (node: HTMLDivElement | null) => {
      listRef.current = node
      if (typeof ref === "function") ref(node)
      else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node
    },
    [ref]
  )

  const measure = React.useCallback(() => {
    const list = listRef.current
    const pill = pillRef.current
    if (!list || !pill) return
    const active = list.querySelector<HTMLElement>('[role="tab"][data-state="active"]')
    if (!active) {
      pill.dataset.empty = ""
      return
    }
    delete pill.dataset.empty
    // The pill spans the whole row of triggers (also the part scrolled out of view). Measured
    // from the triggers, never from scrollWidth: the pill itself counts toward scrollWidth,
    // so that would feed back and grow the row until it scrolls.
    let end = 0
    list.querySelectorAll<HTMLElement>('[role="tab"]').forEach((t) => {
      end = Math.max(end, t.offsetLeft + t.offsetWidth)
    })
    pill.style.width = `${Math.max(0, end - pill.offsetLeft)}px`
    const p = pill.getBoundingClientRect()
    const a = active.getBoundingClientRect()
    const l = a.left - p.left
    const r = a.right - p.left // right-edge position (not an inset)
    if (lastLeft.current !== null && l !== lastLeft.current) {
      list.dataset.cfDir = l > lastLeft.current ? "right" : "left"
    }
    lastLeft.current = l
    // Concentric corners: inner radius = the list's radius − its padding (the list clips its
    // overflow to its own rounded box, so a squarer pill would be cut at the ends).
    const outer = parseFloat(getComputedStyle(list).borderTopLeftRadius) || 0
    pill.style.setProperty("--cf-edge-rad", `${Math.max(0, outer - pill.offsetTop)}px`)
    pill.style.setProperty("--cf-edge-l", `${l}px`)
    pill.style.setProperty("--cf-edge-r", `${r}px`)
  }, [])

  React.useLayoutEffect(() => {
    const list = listRef.current
    if (!list) return
    measure()
    const arm = requestAnimationFrame(() => {
      list.dataset.ready = ""
    })
    const mo = new MutationObserver(measure)
    mo.observe(list, { subtree: true, attributes: true, attributeFilter: ["data-state"] })
    // A resize re-measures in place: if it lands mid-travel (content swap resizing the row)
    // the springs retarget instead of being cut.
    const ro = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(() => measure())
    ro?.observe(list)
    return () => {
      cancelAnimationFrame(arm)
      mo.disconnect()
      ro?.disconnect()
    }
  }, [measure])

  return (
    <TabsPrimitive.List
      ref={setRefs}
      data-slot="tabs-list"
      className={cn(
        "cf-tabs-list bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-lg p-[3px]",
        "overflow-x-auto scrollbar-none", // Mobile scroll support
        className
      )}
      {...props}
    >
      <span ref={pillRef} data-slot="tabs-pill" className="cf-tabs-pill" aria-hidden>
        <EdgeLayers />
      </span>
      {children}
    </TabsPrimitive.List>
  )
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        // Base styles. The active surface is the list's travelling pill, not the trigger.
        "cf-tabs-trigger inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap",
        // Inactive state - muted text
        "text-muted-foreground",
        // Active state - works in both themes via CSS variables
        "data-[state=active]:text-foreground",
        // Focus styles
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:outline-ring focus-visible:outline-1",
        // Disabled and icon styles
        "disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  )
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-none", className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
