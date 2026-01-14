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
          "border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90",
        outline:
          "text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        // Status variants
        success:
          "border-transparent bg-green-500/20 text-green-500 dark:bg-green-500/20 dark:text-green-400",
        warning:
          "border-transparent bg-yellow-500/20 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-400",
        error:
          "border-transparent bg-red-500/20 text-red-500 dark:bg-red-500/20 dark:text-red-400",
        info:
          "border-transparent bg-blue-500/20 text-blue-500 dark:bg-blue-500/20 dark:text-blue-400",
        // Channel variants for InboxAI omnichannel
        whatsapp:
          "border-transparent bg-[#25D366]/20 text-[#25D366]",
        telegram:
          "border-transparent bg-[#0088cc]/20 text-[#0088cc]",
        email:
          "border-transparent bg-purple-500/20 text-purple-500 dark:text-purple-400",
        webchat:
          "border-transparent bg-blue-500/20 text-blue-500 dark:text-blue-400",
        instagram:
          "border-transparent bg-[#E4405F]/20 text-[#E4405F]",
        messenger:
          "border-transparent bg-[#0084FF]/20 text-[#0084FF]",
        sms:
          "border-transparent bg-orange-500/20 text-orange-500 dark:text-orange-400",
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
