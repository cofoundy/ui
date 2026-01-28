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
    base: "#fbbf24",
    light: "#fef3c7",
    dark: "#b45309",
  },
  brand: {
    base: "#2984AD",
    light: "#7dd3fc",
    dark: "#0c4a6e",
  },
  silver: {
    base: "#94a3b8",
    light: "#f1f5f9",
    dark: "#475569",
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
