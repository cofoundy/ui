import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../../utils/cn";

const badgeVariants = cva(
  "inline-flex items-center rounded-full font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary/20 text-primary",
        secondary: "bg-secondary text-secondary-foreground",
        success: "bg-green-500/20 text-green-300",
        warning: "bg-yellow-500/20 text-yellow-300",
        error: "bg-red-500/20 text-red-300",
        info: "bg-blue-500/20 text-blue-300",
        outline: "border border-current bg-transparent",
        // Channel-specific variants
        telegram: "bg-blue-500/20 text-blue-300",
        whatsapp: "bg-green-500/20 text-green-300",
        email: "bg-purple-500/20 text-purple-300",
        webchat: "bg-cyan-500/20 text-cyan-300",
        instagram: "bg-pink-500/20 text-pink-300",
        messenger: "bg-indigo-500/20 text-indigo-300",
        sms: "bg-gray-500/20 text-gray-300",
      },
      size: {
        sm: "px-1.5 py-0.5 text-[10px]",
        default: "px-2 py-0.5 text-xs",
        lg: "px-3 py-1 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Badge({
  className,
  variant = "default",
  size = "default",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return (
    <span
      data-slot="badge"
      data-variant={variant}
      data-size={size}
      className={cn(badgeVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
