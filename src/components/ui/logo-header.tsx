import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../../utils/cn";
import { Logo } from "./logo";

const logoHeaderVariants = cva(
  "cf-logo-header inline-flex items-center gap-2",
  {
    variants: {
      size: {
        sm: "gap-1.5",
        default: "gap-2",
        lg: "gap-3",
        xl: "gap-4",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
);

const wordmarkSizes = {
  sm: "text-lg",
  default: "text-xl",
  lg: "text-2xl",
  xl: "text-4xl",
};

const isoloSizes = {
  sm: "sm" as const,
  default: "default" as const,
  lg: "lg" as const,
  xl: "xl" as const,
};

interface LogoHeaderProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof logoHeaderVariants> {
  /** Use monochrome version with current color */
  mono?: boolean;
  /** Hide the isologo, show only wordmark */
  wordmarkOnly?: boolean;
  /** Hide the wordmark, show only isologo */
  isologoOnly?: boolean;
}

/**
 * Cofoundy Logo Header - Horizontal layout with isologo + wordmark
 * Uses Space Grotesk Semibold for the wordmark
 */
function LogoHeader({
  className,
  size = "default",
  mono = false,
  wordmarkOnly = false,
  isologoOnly = false,
  ...props
}: LogoHeaderProps) {
  const wordmarkSize = wordmarkSizes[size || "default"];
  const isoloSize = isoloSizes[size || "default"];

  if (isologoOnly) {
    return (
      <div className={cn(logoHeaderVariants({ size }), className)} {...props}>
        <Logo size={isoloSize} mono={mono} />
      </div>
    );
  }

  return (
    <div className={cn(logoHeaderVariants({ size }), className)} {...props}>
      {!wordmarkOnly && <Logo size={isoloSize} mono={mono} />}
      <span
        className={cn(
          wordmarkSize,
          "font-semibold text-foreground",
          mono && "text-current"
        )}
        style={{
          fontFamily: "var(--font-brand, 'Space Grotesk', sans-serif)",
          letterSpacing: "-0.02em"
        }}
        aria-label="Cofoundy"
      >
        Cofoundy
      </span>
    </div>
  );
}

/**
 * Standalone Wordmark component (Space Grotesk Semibold "Cofoundy")
 */
function Wordmark({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn("text-xl font-semibold text-foreground", className)}
      style={{
        fontFamily: "var(--font-brand, 'Space Grotesk', sans-serif)",
        letterSpacing: "-0.02em"
      }}
      aria-label="Cofoundy"
      {...props}
    >
      Cofoundy
    </span>
  );
}

export { LogoHeader, logoHeaderVariants, Wordmark };
