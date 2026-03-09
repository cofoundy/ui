import * as React from "react";
import { cn } from "../../utils/cn";

export interface ShimmerTextProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  /** Shimmer color theme */
  variant?: "gold" | "brand" | "silver";
  /** Animation duration in seconds */
  duration?: number;
  /** Disable animation */
  disabled?: boolean;
}

const shimmerColors = {
  gold: {
    base: "var(--shimmer-gold, #fbbf24)",
    light: "var(--shimmer-gold-light, #fef3c7)",
    dark: "var(--shimmer-gold-dark, #b45309)",
  },
  brand: {
    base: "var(--shimmer-brand, #2984AD)",
    light: "var(--shimmer-brand-light, #7dd3fc)",
    dark: "var(--shimmer-brand-dark, #0c4a6e)",
  },
  silver: {
    base: "var(--shimmer-silver, #94a3b8)",
    light: "var(--shimmer-silver-light, #f1f5f9)",
    dark: "var(--shimmer-silver-dark, #475569)",
  },
};

export function ShimmerText({
  children,
  variant = "gold",
  duration = 2,
  disabled = false,
  className,
  style,
  ...props
}: ShimmerTextProps) {
  const colors = shimmerColors[variant];
  const id = React.useId();

  if (disabled) {
    return (
      <span className={className} style={style} {...props}>
        {children}
      </span>
    );
  }

  return (
    <>
      <style>
        {`
          @keyframes shimmer-text-${id.replace(/:/g, "")} {
            0% {
              background-position: -200% center;
            }
            100% {
              background-position: 200% center;
            }
          }
        `}
      </style>
      <span
        className={cn("inline-block", className)}
        style={{
          background: `linear-gradient(
            90deg,
            ${colors.base} 0%,
            ${colors.base} 40%,
            ${colors.light} 50%,
            ${colors.base} 60%,
            ${colors.base} 100%
          )`,
          backgroundSize: "200% auto",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          WebkitTextFillColor: "transparent",
          animation: `shimmer-text-${id.replace(/:/g, "")} ${duration}s linear infinite`,
          ...style,
        }}
        {...props}
      >
        {children}
      </span>
    </>
  );
}
