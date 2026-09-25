import * as React from "react"
import * as SwitchPrimitive from "@radix-ui/react-switch"
import { cva, type VariantProps } from "class-variance-authority"

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
  e.currentTarget.dataset.pressed = ""
}
const clearPressed = (e: React.PointerEvent<HTMLButtonElement>) => {
  delete e.currentTarget.dataset.pressed
}

/**
 * The knob is one indicator with two edges: the leading edge rides `--cf-spring-edge`, the
 * trailing edge `--cf-spring-smooth` compressed to 400 ms, so it stretches toward the target
 * and settles. Pointer-down reaches 6 px toward the target (first-frame response).
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
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root> & VariantProps<typeof switchVariants>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(switchVariants({ size }), className)}
      onPointerDown={(e) => {
        setPressed(e)
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
