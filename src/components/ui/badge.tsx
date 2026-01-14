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
        // Status variants - using CSS variables
        success:
          "border-transparent bg-[var(--status-success)]/20 text-[var(--status-success)]",
        warning:
          "border-transparent bg-[var(--status-warning)]/20 text-[var(--status-warning)]",
        error:
          "border-transparent bg-[var(--status-error)]/20 text-[var(--status-error)]",
        info:
          "border-transparent bg-[var(--status-info)]/20 text-[var(--status-info)]",
        // Channel variants for InboxAI omnichannel - using CSS variables
        whatsapp:
          "border-transparent bg-[var(--channel-whatsapp)]/20 text-[var(--channel-whatsapp)]",
        telegram:
          "border-transparent bg-[var(--channel-telegram)]/20 text-[var(--channel-telegram)]",
        email:
          "border-transparent bg-[var(--channel-email)]/20 text-[var(--channel-email)]",
        webchat:
          "border-transparent bg-[var(--channel-webchat)]/20 text-[var(--channel-webchat)]",
        instagram:
          "border-transparent bg-[var(--channel-instagram)]/20 text-[var(--channel-instagram)]",
        messenger:
          "border-transparent bg-[var(--channel-messenger)]/20 text-[var(--channel-messenger)]",
        sms:
          "border-transparent bg-[var(--channel-sms)]/20 text-[var(--channel-sms)]",
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
