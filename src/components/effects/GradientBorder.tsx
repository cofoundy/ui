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
  /** Background color for the content area */
  background?: string;
}

const gradientColors = {
  brand: "conic-gradient(from var(--angle), #2984AD, #46a0d0, #0D3A59, #2984AD)",
  gold: "conic-gradient(from var(--angle), #fbbf24, #fef3c7, #b45309, #fbbf24)",
  rainbow: "conic-gradient(from var(--angle), #f59e0b, #22c55e, #06b6d4, #3b82f6, #8b5cf6, #f59e0b)",
};

export function GradientBorder({
  children,
  variant = "brand",
  borderWidth = 2,
  borderRadius = 12,
  duration = 3,
  disabled = false,
  background,
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

  return (
    <>
      <style>
        {`
          @property --angle {
            syntax: '<angle>';
            initial-value: 0deg;
            inherits: false;
          }

          .gradient-border-${safeId} {
            --angle: 0deg;
            position: relative;
            border-radius: ${borderRadius}px;
            animation: gradient-rotate-${safeId} ${duration}s linear infinite;
          }

          .gradient-border-${safeId}::before {
            content: '';
            position: absolute;
            inset: 0;
            border-radius: inherit;
            padding: ${borderWidth}px;
            background: ${gradientColors[variant]};
            -webkit-mask:
              linear-gradient(#fff 0 0) content-box,
              linear-gradient(#fff 0 0);
            mask:
              linear-gradient(#fff 0 0) content-box,
              linear-gradient(#fff 0 0);
            -webkit-mask-composite: xor;
            mask-composite: exclude;
            pointer-events: none;
          }

          @keyframes gradient-rotate-${safeId} {
            to { --angle: 360deg; }
          }
        `}
      </style>
      <div
        className={cn(`gradient-border-${safeId}`, className)}
        style={{ background, ...style }}
        {...props}
      >
        {children}
      </div>
    </>
  );
}
