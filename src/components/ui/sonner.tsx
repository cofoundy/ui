import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { useReducedMotionConfig } from "framer-motion"
import { Toaster as Sonner, type ToasterProps } from "sonner"

import { cn } from "../../utils/cn"

type SonnerToasterProps = ToasterProps & {
  /**
   * Theme for the toaster. Defaults to "system".
   * Consumers should pass their app's theme state here.
   */
  theme?: "light" | "dark" | "system"
  /**
   * Height in px of a bottom dock (composer, tab bar) the toasts must rise ABOVE. Sets the
   * bottom offset to `dock + 12` and clips the stack at the dock's top edge, so a toast rises
   * out of that edge instead of sliding over the dock. Omit when there is no dock: nothing
   * is clipped.
   */
  dock?: number
}

/*
 * Motion + brand layer over sonner. Scoped to `.cf-toaster` and doubled selectors so it wins
 * over sonner's own stylesheet AND the older `.cf-toaster` block in styles/index.css.
 *
 * - Every property that moves while the stack reflows (transform, height) rides the SAME
 *   spring (`--cf-spring-smooth`): sonner's default drops `height` onto a different 400 ms
 *   ease, so a front toast of a different height made the stack behind it jump.
 * - Exit: the smooth curve compressed to the snappy duration — leaves faster than it came,
 *   no overshoot either way.
 * - Content of a toast that goes BEHIND the stack leaves first (`--cf-duration-exit`); content
 *   that comes forward enters after (`--cf-duration-enter`). Never two texts at full ink.
 * - Reduced motion (OS or <MotionConfig reducedMotion="always">): no travel, opacity ≤ 120 ms.
 */
const TOASTER_CSS = `
.cf-toaster.cf-toaster[data-sonner-toaster] [data-sonner-toast][data-sonner-toast]:not([data-swiping="true"]) {
  transition:
    transform var(--cf-spring-smooth-duration) var(--cf-spring-smooth),
    height var(--cf-spring-smooth-duration) var(--cf-spring-smooth),
    opacity var(--cf-duration-enter) linear,
    box-shadow var(--cf-duration-fast) linear;
}
.cf-toaster.cf-toaster[data-sonner-toaster] [data-sonner-toast][data-sonner-toast][data-removed="true"]:not([data-swiping="true"]) {
  transition:
    transform var(--cf-spring-snappy-duration) var(--cf-spring-smooth),
    height var(--cf-spring-snappy-duration) var(--cf-spring-smooth),
    opacity var(--cf-duration-enter) linear;
}
.cf-toaster.cf-toaster [data-sonner-toast][data-sonner-toast] > * {
  transition: opacity var(--cf-duration-enter) linear var(--cf-duration-exit);
}
.cf-toaster.cf-toaster [data-sonner-toast][data-sonner-toast][data-expanded="false"][data-front="false"] > * {
  transition: opacity var(--cf-duration-exit) linear;
}
.cf-toaster.cf-toaster [data-sonner-toast][data-promise="true"] [data-icon] > svg {
  animation-duration: var(--cf-spring-snappy-duration);
  animation-timing-function: var(--cf-spring-smooth);
}
.cf-toaster [data-sonner-toast][data-type="success"] [data-icon] { color: var(--status-success, var(--cf-success)); }
.cf-toaster [data-sonner-toast][data-type="warning"] [data-icon] { color: var(--status-warning, var(--cf-warning)); }
.cf-toaster [data-sonner-toast][data-type="error"] [data-icon] { color: var(--destructive); }
.cf-toaster [data-sonner-toast][data-type="info"] [data-icon],
.cf-toaster [data-sonner-toast][data-type="loading"] [data-icon] { color: var(--primary); }
.cf-toaster.cf-toaster--reduce[data-sonner-toaster] [data-sonner-toast][data-sonner-toast],
.cf-toaster.cf-toaster--reduce[data-sonner-toaster] [data-sonner-toast][data-sonner-toast][data-removed="true"] {
  transition: opacity 120ms linear !important;
}
.cf-toaster.cf-toaster--reduce [data-sonner-toast][data-sonner-toast] > * {
  transition: opacity 120ms linear !important;
}
.cf-toaster.cf-toaster--reduce [data-sonner-toast] [data-icon] > svg { animation: none !important; opacity: 1 !important; transform: none !important; }
@media (prefers-reduced-motion: reduce) {
  .cf-toaster.cf-toaster[data-sonner-toaster] [data-sonner-toast][data-sonner-toast] { transition: opacity 120ms linear !important; }
}
`

/**
 * Toast rule: a toast is for results the operator can't see where they tapped — an action
 * whose result lives elsewhere ("Asignada a Lucía" + Deshacer) or a background failure.
 * Never for "saved": the control that was tapped says it (Button `status`).
 *
 * Position keeps sonner's default (bottom-right) so existing apps don't move; mobile-first apps
 * should pass `position="bottom-center"` (thumb reach). Rises and restacks on
 * `--cf-spring-smooth` (transform AND height, so the stack never jumps), leaves on the same
 * curve at the snappy duration. Icons take the status tokens; info/loading take `--primary`,
 * so a tenant's brand color reaches the toast with no prop.
 */
function Toaster({
  theme = "system",
  position = "bottom-right",
  dock,
  className,
  offset,
  mobileOffset,
  toastOptions,
  style,
  ...props
}: SonnerToasterProps) {
  const reduce = useReducedMotionConfig() === true
  const dockOffset = dock === undefined ? undefined : { bottom: dock + 12 }
  return (
    <>
      <style data-cf-toaster="">{TOASTER_CSS}</style>
      <Sonner
        theme={theme}
        position={position}
        className={cn(
          "toaster group cf-toaster",
          dock !== undefined && "cf-toaster--dock",
          reduce && "cf-toaster--reduce",
          className,
        )}
        offset={offset ?? dockOffset}
        mobileOffset={mobileOffset ?? dockOffset}
        icons={{
          success: <CircleCheckIcon className="size-4" />,
          info: <InfoIcon className="size-4" />,
          warning: <TriangleAlertIcon className="size-4" />,
          error: <OctagonXIcon className="size-4" />,
          loading: <Loader2Icon className="size-4 animate-spin" />,
        }}
        toastOptions={{
          ...toastOptions,
          classNames: {
            ...toastOptions?.classNames,
            actionButton: cn("cf-toast-action", toastOptions?.classNames?.actionButton),
          },
        }}
        style={
          {
            "--normal-bg": "var(--popover)",
            "--normal-text": "var(--popover-foreground)",
            "--normal-border": "var(--border)",
            "--border-radius": "var(--radius)",
            ...style,
          } as React.CSSProperties
        }
        {...props}
      />
    </>
  )
}

export { Toaster }
export { toast } from "sonner"
