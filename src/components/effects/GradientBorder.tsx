import * as React from "react";
import { cn } from "../../utils/cn";

export interface GradientBorderProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  /** Color theme */
  variant?: "brand" | "gold" | "rainbow";
  /** Border width in pixels */
  borderWidth?: number;
  /** Border radius */
  rounded?: "sm" | "md" | "lg" | "xl" | "full";
  /** Animation duration in seconds */
  duration?: number;
  /** Disable animation */
  disabled?: boolean;
  /** Background color (for the inner content) */
  background?: string;
}

const gradientColors = {
  brand: "conic-gradient(from 0deg, #2984AD, #46a0d0, #0D3A59, #2984AD)",
  gold: "conic-gradient(from 0deg, #fbbf24, #fef3c7, #b45309, #fbbf24)",
  rainbow: "conic-gradient(from 0deg, #f59e0b, #22c55e, #06b6d4, #3b82f6, #8b5cf6, #f59e0b)",
};

const roundedMap = {
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  xl: "rounded-xl",
  full: "rounded-full",
};

const innerRoundedMap = {
  sm: "rounded-[calc(0.125rem-1px)]",
  md: "rounded-[calc(0.375rem-1px)]",
  lg: "rounded-[calc(0.5rem-1px)]",
  xl: "rounded-[calc(0.75rem-1px)]",
  full: "rounded-full",
};

export function GradientBorder({
  children,
  variant = "brand",
  borderWidth = 2,
  rounded = "lg",
  duration = 3,
  disabled = false,
  background = "#020916",
  className,
  style,
  ...props
}: GradientBorderProps) {
  const id = React.useId();

  if (disabled) {
    return (
      <div className={className} style={style} {...props}>
        {children}
      </div>
    );
  }

  return (
    <>
      <style>
        {`
          @keyframes rotate-gradient-${id.replace(/:/g, "")} {
            0% { transform: translate(-50%, -50%) rotate(0deg); }
            100% { transform: translate(-50%, -50%) rotate(360deg); }
          }
        `}
      </style>
      <div
        className={cn("relative", roundedMap[rounded], className)}
        style={{
          padding: borderWidth,
          ...style,
        }}
        {...props}
      >
        {/* Animated gradient background - large square to cover corners during rotation */}
        <div
          className={cn(
            "absolute inset-0 overflow-hidden",
            roundedMap[rounded]
          )}
          aria-hidden="true"
        >
          <div
            className="absolute"
            style={{
              width: "300%",
              height: "300%",
              top: "50%",
              left: "50%",
              background: gradientColors[variant],
              animation: `rotate-gradient-${id.replace(/:/g, "")} ${duration}s linear infinite`,
            }}
          />
        </div>
        {/* Inner content */}
        <div
          className={cn("relative", innerRoundedMap[rounded])}
          style={{ background }}
        >
          {children}
        </div>
      </div>
    </>
  );
}
