import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
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

/**
 * Toast rule: a toast is for results the operator can't see where they tapped — an action
 * whose result lives elsewhere ("Asignada a Lucía" + Deshacer) or a background failure.
 * Never for "saved": the control that was tapped says it (Button `status`).
 *
 * Position keeps sonner's default (bottom-right) so existing apps don't move; mobile-first apps
 * should pass `position="bottom-center"` (thumb reach). Rises on `--cf-spring-smooth`, leaves on
 * `--cf-spring-snappy`; motion lives in styles/index.css (`.cf-toaster`).
 */
function Toaster({
  theme = "system",
  position = "bottom-right",
  dock,
  className,
  offset,
  mobileOffset,
  toastOptions,
  ...props
}: SonnerToasterProps) {
  const dockOffset = dock === undefined ? undefined : { bottom: dock + 12 }
  return (
    <Sonner
      theme={theme}
      position={position}
      className={cn("toaster group cf-toaster", dock !== undefined && "cf-toaster--dock", className)}
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
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
export { toast } from "sonner"
