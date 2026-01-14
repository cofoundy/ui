import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "../../utils/cn"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground [a&]:hover:bg-destructive/90",
        outline:
          "text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
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

function Badge({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
