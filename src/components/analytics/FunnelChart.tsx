"use client";

import { useState } from "react";
import { cn } from "../../utils/cn";
import { AnimatedNumber } from "./AnimatedNumber";

export interface FunnelStep {
  label: string;
  value: number;
  color?: string;
}

export interface FunnelChartProps {
  steps: FunnelStep[];
  showPercentages?: boolean;
  showDropoff?: boolean;
  animate?: boolean;
  className?: string;
}

export function FunnelChart({
  steps,
  showPercentages = true,
  showDropoff = true,
  animate = true,
  className,
}: FunnelChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (steps.length === 0) return null;

  const maxValue = steps[0].value;

  return (
    <div data-slot="funnel-chart" className={cn("flex flex-col", className)}>
      {steps.map((step, i) => {
        const pct = maxValue > 0 ? (step.value / maxValue) * 100 : 0;
        const prevValue = i > 0 ? steps[i - 1].value : step.value;
        const dropoff = prevValue > 0 ? Math.round(((prevValue - step.value) / prevValue) * 100) : 0;
        const color = step.color ?? "var(--chat-primary)";
        const isDimmed = hoveredIndex !== null && hoveredIndex !== i;

        return (
          <div key={i} className="flex flex-col">
            {showDropoff && i > 0 && dropoff > 0 && (
              <div
                className={cn(
                  "flex items-center gap-1.5 py-1.5 pl-1",
                  animate && "cf-stagger-fade-in"
                )}
                style={{
                  ["--cf-stagger-index" as string]: i * 2 + 1,
                } as React.CSSProperties}
              >
                <svg
                  width="8"
                  height="10"
                  viewBox="0 0 8 10"
                  className="text-[var(--chat-muted)] opacity-60 shrink-0"
                  aria-hidden
                >
                  <path
                    d="M4 0v8M1 5l3 3 3-3"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="text-[10px] font-mono text-[var(--chat-error)] tabular-nums">
                  -{dropoff}%
                </span>
                <span className="text-[10px] font-sans text-[var(--chat-muted)]">
                  abandono
                </span>
              </div>
            )}

            <div
              className="flex flex-col gap-1.5"
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              style={{
                opacity: isDimmed ? 0.45 : 1,
                transition: "opacity var(--cf-duration-fast) var(--cf-ease-default)",
              }}
            >
              <div
                className={cn(
                  "flex items-baseline justify-between gap-3 px-1 min-w-0",
                  animate && "cf-stagger-fade-in"
                )}
                style={{
                  ["--cf-stagger-index" as string]: i,
                } as React.CSSProperties}
              >
                <span className="text-xs font-sans text-[var(--chat-foreground)] truncate min-w-0">
                  {step.label}
                </span>
                <span className="text-xs font-mono text-[var(--chat-foreground)] tabular-nums shrink-0">
                  <AnimatedNumber value={step.value} animate={animate} />
                  {showPercentages && i > 0 && (
                    <span className="text-[var(--chat-muted)] ml-1.5">
                      ({Math.round(pct)}%)
                    </span>
                  )}
                </span>
              </div>

              <div className="h-7 rounded-md overflow-hidden bg-[var(--chat-border)]">
                <div
                  className={cn("h-full rounded-md", animate && "cf-bar-reveal-x")}
                  style={{
                    width: `${pct}%`,
                    backgroundColor: color,
                    ["--cf-stagger-index" as string]: i,
                  } as React.CSSProperties}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
