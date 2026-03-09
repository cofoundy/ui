"use client";

import { cn } from "../../utils/cn";
import { useMountTransition } from "../../hooks/useMountTransition";
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
  const mounted = useMountTransition(animate);

  if (steps.length === 0) return null;

  const maxValue = steps[0].value;

  return (
    <div data-slot="funnel-chart" className={cn("flex flex-col gap-1", className)}>
      {steps.map((step, i) => {
        const pct = maxValue > 0 ? (step.value / maxValue) * 100 : 0;
        const widthPct = Math.max(pct, 8);
        const prevValue = i > 0 ? steps[i - 1].value : step.value;
        const dropoff = prevValue > 0 ? Math.round(((prevValue - step.value) / prevValue) * 100) : 0;
        const color = step.color ?? "var(--chat-primary)";

        return (
          <div key={i} className="flex flex-col">
            {showDropoff && i > 0 && dropoff > 0 && (
              <div className="flex items-center gap-2 py-0.5 pl-4">
                <span className="text-[10px] font-mono text-[var(--chat-error)]">
                  -{dropoff}%
                </span>
                <span className="text-[10px] font-sans text-[var(--chat-muted)]">
                  abandono
                </span>
              </div>
            )}

            <div className="flex items-center gap-3">
              <div className="flex-1 flex justify-center">
                <div
                  className="h-10 rounded-lg flex items-center justify-between px-3"
                  style={{
                    width: mounted ? `${widthPct}%` : "0%",
                    backgroundColor: color,
                    opacity: 0.15 + (pct / 100) * 0.85,
                    transition: animate
                      ? `width var(--cf-duration-smooth) var(--cf-ease-default) ${i * 80}ms`
                      : undefined,
                  }}
                >
                  <span className="text-xs font-sans text-[var(--chat-foreground)] truncate">
                    {step.label}
                  </span>
                  <span className="text-xs font-mono text-[var(--chat-foreground)] shrink-0 ml-2">
                    <AnimatedNumber value={step.value} animate={animate} />
                    {showPercentages && i > 0 && (
                      <span className="text-[var(--chat-muted)] ml-1">
                        ({Math.round(pct)}%)
                      </span>
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
