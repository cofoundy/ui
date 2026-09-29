import * as React from "react"
import * as SwitchPrimitive from "@radix-ui/react-switch"
import { cva, type VariantProps } from "class-variance-authority"
import { useReducedMotionConfig } from "framer-motion"

import { cn } from "../../utils/cn"
import { EdgeLayers } from "./edge-layers"

const switchVariants = cva("cf-switch peer", {
  variants: {
    size: {
      /** 36 × 20 track — the historical footprint (hit area still 44 px tall). */
      default: "",
      /** 48 × 28 track — touch-first surfaces (Fovente operator). */
      lg: "",
    },
  },
  defaultVariants: { size: "default" },
})

const setPressed = (e: React.PointerEvent<HTMLButtonElement>) => {
  // Chrome dispatches pointer events on disabled buttons: a disabled switch must not reach.
  if (e.currentTarget.disabled || e.button !== 0) return
  e.currentTarget.dataset.pressed = ""
}
const clearPressed = (e: React.PointerEvent<HTMLButtonElement>) => {
  delete e.currentTarget.dataset.pressed
}

/** The edge transitions read these durations; zeroed, the knob jumps (scoped, inherits down). */
const REDUCED_VARS = {
  "--cf-spring-edge-duration": "0ms",
  "--cf-duration-trail": "0ms",
  "--cf-duration-press": "0ms",
} as React.CSSProperties

/**
 * The knob is one indicator with two edges: the leading edge rides `--cf-spring-edge`, the
 * trailing edge `--cf-spring-smooth` compressed to 400 ms, so it stretches toward the target
 * and settles. Pointer-down reaches 6 px toward the target (first-frame response).
 *
 * Reduced motion (OS setting or a framer `<MotionConfig reducedMotion="always">` above it): the
 * knob jumps — both edges and the press reach resolve in 0 ms; state and colors are identical.
 *
 * Optimistic use: flip `checked` immediately; if the save fails, flip it back — the knob
 * returns on the same spring — and explain what happened in a status line next to it.
 */
function Switch({
  className,
  size = "default",
  onPointerDown,
  onPointerUp,
  onPointerLeave,
  onPointerCancel,
  style,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root> & VariantProps<typeof switchVariants>) {
  const reduced = useReducedMotionConfig() === true
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      data-reduced={reduced ? "" : undefined}
      className={cn(switchVariants({ size }), className)}
      style={reduced ? { ...REDUCED_VARS, ...style } : style}
      onPointerDown={(e) => {
        if (!reduced) setPressed(e)
        onPointerDown?.(e)
      }}
      onPointerUp={(e) => {
        clearPressed(e)
        onPointerUp?.(e)
      }}
      onPointerLeave={(e) => {
        clearPressed(e)
        onPointerLeave?.(e)
      }}
      onPointerCancel={(e) => {
        clearPressed(e)
        onPointerCancel?.(e)
      }}
      {...props}
    >
      <SwitchPrimitive.Thumb data-slot="switch-thumb" className="cf-switch__knob">
        <EdgeLayers />
      </SwitchPrimitive.Thumb>
    </SwitchPrimitive.Root>
  )
}

export { Switch, switchVariants }
