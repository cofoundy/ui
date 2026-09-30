"use client";

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { AnimatePresence, motion, useReducedMotionConfig } from "framer-motion"

import { cn } from "../../utils/cn"
import { springTransition } from "../../lib/spring"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        // Mismo motivo que en `button.tsx`: `--primary` es reasignable por la app
        // (Fovente lo ata al color del tenant), así que la tinta se deriva de él.
        // Las demás variantes conservan `text-white` a propósito — sus rellenos
        // son colores FIJOS del sistema, no de marca. → inbox-ai#617
        default:
          "border-transparent bg-[var(--primary)] text-[var(--primary-foreground)] [a&]:hover:bg-[var(--primary)]/90",
        secondary:
          "border-transparent bg-[var(--secondary)] text-white [a&]:hover:bg-[var(--secondary)]/90",
        destructive:
          "border-transparent bg-[var(--destructive)] text-white [a&]:hover:bg-[var(--destructive)]/90",
        outline:
          "border-[var(--border)] text-[var(--foreground)] [a&]:hover:bg-[var(--accent)]",
        // Status variants - white text for visibility
        success:
          "border-transparent bg-[var(--status-success)] text-white",
        warning:
          "border-transparent bg-[var(--status-warning)] text-white",
        error:
          "border-transparent bg-[var(--status-error)] text-white",
        info:
          "border-transparent bg-[var(--status-info)] text-white",
        // Channel variants for InboxAI omnichannel - white text for visibility
        whatsapp:
          "border-transparent bg-[var(--channel-whatsapp)] text-white",
        telegram:
          "border-transparent bg-[var(--channel-telegram)] text-white",
        email:
          "border-transparent bg-[var(--channel-email)] text-white",
        webchat:
          "border-transparent bg-[var(--channel-webchat)] text-white",
        instagram:
          "border-transparent bg-[var(--channel-instagram)] text-white",
        messenger:
          "border-transparent bg-[var(--channel-messenger)] text-white",
        sms:
          "border-transparent bg-[var(--channel-sms)] text-white",
      },
      size: {
        sm: "px-1.5 py-0 text-[10px]",
        default: "px-2 py-0.5 text-xs",
        lg: "px-2.5 py-1 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

/** Minimum box per size so a one-digit counter is a circle, never a sliver. */
const counterSize = {
  sm: "min-w-[18px] h-[18px] px-1 py-0",
  default: "min-w-[22px] h-[22px] px-1.5 py-0",
  lg: "min-w-[26px] h-[26px] px-2 py-0",
} as const

/** How far the pop grows. Up = something new arrived; down = read, so it barely nods. */
const POP_UP = 1.14
const POP_DOWN = 1.06
/** Time at the peak before the snappy spring is retargeted back to 1 (it keeps its velocity). */
const POP_HOLD_MS = 90

export interface BadgeCountProps {
  /**
   * Numeric counter mode. When set, the badge renders the number (not `children`),
   * pops (snappy spring) when it changes and swaps only the digits that changed, vertically.
   * `undefined` = the classic label badge, identical to before.
   */
  count?: number
  /** Above `max` it shows `${max}+`. Default 99. */
  max?: number
  /** Keep the badge visible at 0. Default false: at 0 it leaves (scale + opacity, snappy). */
  showZero?: boolean
}

type BadgeProps = React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean } & BadgeCountProps

function Badge({
  className,
  variant,
  size,
  asChild = false,
  count,
  max = 99,
  showZero = false,
  ...props
}: BadgeProps) {
  if (count !== undefined) {
    return (
      <CountBadge
        className={className}
        variant={variant}
        size={size}
        count={count}
        max={max}
        showZero={showZero}
        {...props}
      />
    )
  }

  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    />
  )
}

function formatCount(count: number, max: number) {
  const n = Math.max(0, Math.floor(count))
  return n > max ? `${max}+` : String(n)
}

type CountBadgeProps = Omit<
  BadgeProps,
  "asChild" | "count" | "max" | "showZero"
> & {
  count: number
  max: number
  showZero: boolean
}

function CountBadge({
  className,
  variant,
  size,
  count,
  max,
  showZero,
  children: _children,
  // Handlers whose DOM signatures clash with framer-motion's own props.
  onAnimationStart: _onAnimationStart,
  onAnimationEnd: _onAnimationEnd,
  onAnimationIteration: _onAnimationIteration,
  onDrag: _onDrag,
  onDragStart: _onDragStart,
  onDragEnd: _onDragEnd,
  ...props
}: CountBadgeProps) {
  // Honors both the OS setting and an app-level <MotionConfig reducedMotion>.
  const reduce = useReducedMotionConfig() ?? false
  const text = formatCount(count, max)
  const visible = count > 0 || showZero

  // Direction of the last change: +1 counts up (new digit enters from below), -1 counts down.
  const prev = React.useRef(count)
  const [dir, setDir] = React.useState<1 | -1>(1)
  const [pop, setPop] = React.useState(1)

  React.useEffect(() => {
    if (count === prev.current) return
    const up = count > prev.current
    prev.current = count
    setDir(up ? 1 : -1)
    if (reduce) return
    setPop(up ? POP_UP : POP_DOWN)
    const t = window.setTimeout(() => setPop(1), POP_HOLD_MS)
    return () => window.clearTimeout(t)
  }, [count, reduce])

  // After the first paint, a column that appears (9 → 10) rolls in instead of popping in.
  const mounted = React.useRef(false)
  React.useEffect(() => {
    mounted.current = true
  }, [])

  const snappy = reduce ? { duration: 0 } : springTransition("snappy")
  const chars = text.split("")

  return (
    <AnimatePresence initial={false}>
      {visible && (
        <motion.span
          key="badge-count"
          data-slot="badge"
          data-count={count}
          // Width follows the digits (9 → 10, 99+) as a transform, not a jump.
          layout={!reduce}
          // In style (not only the class) so framer counter-scales the radius during layout.
          style={{ borderRadius: 9999 }}
          className={cn(
            badgeVariants({ variant, size }),
            counterSize[size ?? "default"],
            "tabular-nums leading-none",
            className
          )}
          initial={{ scale: reduce ? 1 : 0.5, opacity: 0 }}
          animate={{ scale: pop, opacity: 1 }}
          exit={{ scale: reduce ? 1 : 0.5, opacity: 0 }}
          transition={snappy}
          {...props}
        >
          <span className="sr-only">{text}</span>
          <motion.span
            aria-hidden="true"
            className="inline-flex"
            // Counter-corrects the parent's layout scale so digits never stretch.
            layout={reduce ? false : "position"}
            transition={snappy}
          >
            {chars.map((ch, i) => (
              <DigitSlot
                // Keyed from the right so the ones digit stays the ones digit when 9 → 10.
                key={chars.length - i}
                char={ch}
                dir={dir}
                reduce={reduce}
                rollIn={mounted.current}
              />
            ))}
          </motion.span>
        </motion.span>
      )}
    </AnimatePresence>
  )
}

/**
 * One character column. Only a column whose char changed animates: the old digit leaves
 * first (opacity out in ~80 ms while it travels), the new one enters from the opposite side
 * a beat later — never two digits fully visible on top of each other. Text here is ≤ 14 px,
 * so no blur (it flickers at this size).
 */
function DigitSlot({
  char,
  dir,
  reduce,
  rollIn,
}: {
  char: string
  dir: 1 | -1
  reduce: boolean
  rollIn: boolean
}) {
  const enter = reduce
    ? { duration: 0 }
    : { ...springTransition("snappy"), delay: 0.05 }
  const leave = reduce
    ? { duration: 0 }
    : {
        ...springTransition("snappy"),
        opacity: { duration: 0.08, ease: "linear" as const },
      }

  return (
    <span className="relative inline-flex overflow-hidden">
      <AnimatePresence mode="popLayout" initial={rollIn} custom={dir}>
        <motion.span
          key={char}
          custom={dir}
          className="inline-block"
          variants={{
            enter: (d: 1 | -1) => ({
              y: reduce ? 0 : `${d * 70}%`,
              opacity: 0,
            }),
            center: { y: 0, opacity: 1, transition: enter },
            leave: (d: 1 | -1) => ({
              y: reduce ? 0 : `${-d * 70}%`,
              opacity: 0,
              transition: leave,
            }),
          }}
          initial="enter"
          animate="center"
          exit="leave"
        >
          {char}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

export { Badge, badgeVariants }
export type { BadgeProps }
