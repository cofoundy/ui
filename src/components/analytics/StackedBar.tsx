"use client";

import { cn } from "../../utils/cn";

export interface StackedBarSegment {
  label: string;
  value: number;
  color: string;
}

export interface StackedBarProps {
  segments: StackedBarSegment[];
  total?: number;
  showLegend?: boolean;
  showPercentages?: boolean;
  height?: number;
  animate?: boolean;
  className?: string;
}

export function StackedBar({
  segments,
  total,
  showLegend = true,
  showPercentages = false,
  height = 32,
  animate = true,
  className,
}: StackedBarProps) {
  const computedTotal = total ?? segments.reduce((sum, s) => sum + s.value, 0);

  if (computedTotal === 0) return null;

  return (
    <div data-slot="stacked-bar" className={cn("flex flex-col gap-3", className)}>
      <div
        className="flex w-full overflow-hidden rounded-lg"
        style={{ height }}
      >
        {segments.map((seg, i) => {
          const pct = (seg.value / computedTotal) * 100;
          return (
            <div
              key={i}
              className="relative flex items-center justify-center transition-[width]"
              style={{
                width: `${pct}%`,
                backgroundColor: seg.color,
                transition: animate
                  ? `width var(--cf-duration-smooth) var(--cf-ease-default) ${i * 80}ms`
                  : undefined,
              }}
            >
              {showPercentages && pct >= 5 && (
                <span className="text-[11px] font-mono font-medium text-white drop-shadow-sm">
                  {Math.round(pct)}%
                </span>
              )}
            </div>
          );
        })}
      </div>

      {showLegend && (
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          {segments.map((seg, i) => {
            const pct = (seg.value / computedTotal) * 100;
            return (
              <div key={i} className="flex items-center gap-1.5 text-xs">
                <span
                  className="size-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: seg.color }}
                />
                <span className="font-sans text-[var(--chat-foreground)]">
                  {seg.label}
                </span>
                <span className="font-mono text-[var(--chat-muted)]">
                  {seg.value.toLocaleString()} ({Math.round(pct)}%)
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
