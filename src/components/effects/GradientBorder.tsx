import * as React from "react";
import { cn } from "../../utils/cn";

export interface GradientBorderProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  /** Color theme */
  variant?: "brand" | "gold" | "rainbow";
  /** Border width in pixels */
  borderWidth?: number;
  /** Border radius in pixels */
  borderRadius?: number;
  /** Animation duration in seconds */
  duration?: number;
  /** Disable animation */
  disabled?: boolean;
  /** Add glow effect */
  glow?: boolean;
  /** Background color for content area (required to hide the gradient middle) */
  background?: string;
}

// Gradient colors that repeat for seamless animation
const gradientColors = {
  brand: "linear-gradient(90deg, #2984AD, #46a0d0, #0D3A59, #2984AD, #46a0d0, #0D3A59, #2984AD)",
  gold: "linear-gradient(90deg, #fbbf24, #fef3c7, #b45309, #fbbf24, #fef3c7, #b45309, #fbbf24)",
  rainbow: "linear-gradient(90deg, #fb0094, #0000ff, #00ff00, #ffff00, #ff0000, #fb0094, #0000ff, #00ff00, #ffff00, #ff0000)",
};

export function GradientBorder({
  children,
  variant = "brand",
  borderWidth = 2,
  borderRadius = 12,
  duration = 3,
  disabled = false,
  glow = false,
  background = "#020916",
  className,
  style,
  ...props
}: GradientBorderProps) {
  const id = React.useId();
  const safeId = id.replace(/:/g, "");

  if (disabled) {
    return (
      <div className={className} style={style} {...props}>
        {children}
      </div>
    );
  }

  // Inner radius is outer radius minus border width
  const innerRadius = Math.max(0, borderRadius - borderWidth);

  return (
    <>
      <style>
        {`
          .gradient-border-${safeId} {
            position: relative;
            border-radius: ${borderRadius}px;
            z-index: 0;
          }

          .gradient-border-${safeId}::before,
          .gradient-border-${safeId}::after {
            content: '';
            position: absolute;
            left: -${borderWidth}px;
            top: -${borderWidth}px;
            border-radius: ${borderRadius}px;
            background: ${gradientColors[variant]};
            background-size: 300%;
            width: calc(100% + ${borderWidth * 2}px);
            height: calc(100% + ${borderWidth * 2}px);
            z-index: -1;
            animation: gradient-move-${safeId} ${duration}s linear infinite;
          }

          ${glow ? `
          .gradient-border-${safeId}::after {
            filter: blur(20px);
            opacity: 0.6;
          }
          ` : `
          .gradient-border-${safeId}::after {
            display: none;
          }
          `}

          @keyframes gradient-move-${safeId} {
            0% { background-position: 0% 50%; }
            100% { background-position: 300% 50%; }
          }
        `}
      </style>
      <div
        className={cn(`gradient-border-${safeId}`, className)}
        style={style}
        {...props}
      >
        {/* Inner content with solid background to cover gradient middle */}
        <div
          style={{
            background,
            borderRadius: innerRadius,
          }}
        >
          {children}
        </div>
      </div>
    </>
  );
}
