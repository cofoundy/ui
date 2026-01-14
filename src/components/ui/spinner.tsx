import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../../utils/cn";

const spinnerVariants = cva("cf-folding-cube", {
  variants: {
    size: {
      sm: "cf-spinner-sm",
      default: "cf-spinner-default",
      lg: "cf-spinner-lg",
      xl: "cf-spinner-xl",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

interface SpinnerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spinnerVariants> {}

function Spinner({ className, size = "default", ...props }: SpinnerProps) {
  return (
    <div
      data-slot="spinner"
      data-size={size}
      className={cn(spinnerVariants({ size }), className)}
      {...props}
    >
      <div className="cf-cube cf-cube1" />
      <div className="cf-cube cf-cube2" />
      <div className="cf-cube cf-cube4" />
      <div className="cf-cube cf-cube3" />
    </div>
  );
}

export { Spinner, spinnerVariants };
