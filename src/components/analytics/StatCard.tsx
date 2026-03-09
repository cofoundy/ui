"use client";

import type { ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../utils/cn";

function formatValue(value: number, format: StatCardFormat): string {
  switch (format) {
    case "duration": {
      if (value >= 3600) {
        const h = Math.floor(value / 3600);
        const m = Math.floor((value % 3600) / 60);
        return `${h}h ${String(m).padStart(2, "0")}m`;
      }
      const m = Math.floor(value / 60);
      const s = value % 60;
      return `${m}m ${String(s).padStart(2, "0")}s`;
    }
    case "percentage":
      return `${value}%`;
    case "number":
    default:
      return value.toLocaleString();
  }
}

const statCardVariants = cva(
  "relative overflow-hidden bg-[var(--chat-card)] border border-[var(--chat-border)] rounded-xl cf-animate-fade-in",
  {
    variants: {
      size: {
        sm: "p-3 gap-1",
        default: "p-4 gap-2",
        lg: "p-6 gap-3",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
);

type StatCardFormat = "number" | "duration" | "percentage";

export interface StatCardTrend {
  delta: number;
  direction: "up" | "down";
}

export interface StatCardProps extends VariantProps<typeof statCardVariants> {
  label: string;
  value: number;
  format?: StatCardFormat;
  trend?: StatCardTrend | null;
  trendPositive?: "good" | "bad";
  icon?: ReactNode;
  muted?: boolean;
  mutedText?: string;
  className?: string;
}

export function StatCard({
  label,
  value,
  format = "number",
  trend,
  trendPositive = "good",
  icon,
  muted = false,
  mutedText = "< 10 datos",
  size,
  className,
}: StatCardProps) {
  const isPositiveTrend = trend?.direction === "up";
  const trendIsGood =
    (trendPositive === "good" && isPositiveTrend) ||
    (trendPositive === "bad" && !isPositiveTrend);

  return (
    <div data-slot="stat-card" className={cn(statCardVariants({ size }), className)}>
      <div className="flex items-center justify-between">
        <span
          className={cn(
            "font-sans text-[var(--chat-muted)] uppercase tracking-wider",
            size === "sm" ? "text-[10px]" : size === "lg" ? "text-xs" : "text-[11px]"
          )}
        >
          {label}
        </span>
        {icon && (
          <span className="text-[var(--chat-muted)] [&>svg]:size-4">{icon}</span>
        )}
      </div>

      <div
        className={cn(
          "font-mono font-semibold text-[var(--chat-foreground)]",
          size === "sm" ? "text-xl" : size === "lg" ? "text-4xl" : "text-2xl",
          muted && "text-[var(--chat-muted)]"
        )}
      >
        {muted ? "---" : formatValue(value, format)}
      </div>

      {muted && mutedText && (
        <span className="text-xs font-sans text-[var(--chat-muted)]">{mutedText}</span>
      )}

      {!muted && trend && (
        <div className="flex items-center gap-1">
          <span
            className={cn(
              "text-xs font-mono font-medium",
              trendIsGood
                ? "text-[var(--chat-success)]"
                : "text-[var(--chat-error)]"
            )}
          >
            {isPositiveTrend ? "\u25B2" : "\u25BC"} {Math.abs(trend.delta)}%
          </span>
        </div>
      )}
    </div>
  );
}

export { statCardVariants };
