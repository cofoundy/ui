"use client";

import { cn } from "../../utils/cn";
import { useMountTransition } from "../../hooks/useMountTransition";
import { useAnimatedValue } from "../../hooks/useAnimatedValue";

type ProgressFormat = "number" | "percentage" | "fraction";

export interface ProgressBarProps {
  label: string;
  value: number;
  max: number;
  format?: ProgressFormat;
  color?: string;
  showLabel?: boolean;
  animate?: boolean;
  className?: string;
}

function formatProgress(value: number, max: number, format: ProgressFormat): string {
  const rounded = Math.round(value);
  switch (format) {
    case "percentage":
      return `${Math.round((rounded / max) * 100)}%`;
    case "fraction":
      return `${rounded.toLocaleString()} / ${max.toLocaleString()}`;
    case "number":
    default:
      return rounded.toLocaleString();
  }
}

export function ProgressBar({
  label,
  value,
  max,
  format = "fraction",
  color = "var(--chat-primary)",
  showLabel = true,
  animate = true,
  className,
}: ProgressBarProps) {
  const mounted = useMountTransition(animate);
  const animatedValue = useAnimatedValue({ value, enabled: animate });
  const pct = Math.min((value / Math.max(max, 1)) * 100, 100);

  return (
    <div data-slot="progress-bar" className={cn("flex flex-col gap-1.5", className)}>
      {showLabel && (
        <div className="flex items-center justify-between">
          <span className="text-xs font-sans text-[var(--chat-foreground)]">{label}</span>
          <span className="text-xs font-mono text-[var(--chat-muted)]">
            {formatProgress(animatedValue, max, format)}
          </span>
        </div>
      )}
      <div className="h-2 w-full rounded-full overflow-hidden bg-[var(--chat-border)]">
        <div
          className="h-full rounded-full"
          style={{
            width: mounted ? `${pct}%` : "0%",
            backgroundColor: color,
            transition: animate
              ? `width var(--cf-duration-smooth) var(--cf-ease-default)`
              : undefined,
          }}
        />
      </div>
    </div>
  );
}
