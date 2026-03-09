"use client";

import { useState } from "react";
import { cn } from "../../utils/cn";

export interface BarChartItem {
  label: string;
  value: number;
}

export interface BarChartProps {
  data: BarChartItem[];
  height?: number;
  barColor?: string;
  emptyText?: string;
  showValues?: boolean;
  animate?: boolean;
  className?: string;
}

export function BarChart({
  data,
  height = 200,
  barColor = "var(--chat-primary)",
  emptyText = "Sin datos en este periodo",
  showValues = false,
  animate = true,
  className,
}: BarChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const maxValue = Math.max(...data.map((d) => d.value), 1);

  if (data.length === 0) {
    return (
      <div
        data-slot="bar-chart"
        className={cn(
          "flex items-center justify-center bg-[var(--chat-card)] border border-[var(--chat-border)] rounded-xl",
          className
        )}
        style={{ height }}
      >
        <span className="text-sm font-sans text-[var(--chat-muted)]">
          {emptyText}
        </span>
      </div>
    );
  }

  return (
    <div data-slot="bar-chart" className={cn("flex flex-col gap-2", className)}>
      <div
        className="flex items-end gap-1"
        style={{ height }}
      >
        {data.map((item, i) => {
          const pct = (item.value / maxValue) * 100;
          const isHovered = hoveredIndex === i;
          return (
            <div
              key={i}
              className="relative flex-1 flex flex-col items-center justify-end h-full"
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {(showValues || isHovered) && (
                <span className="text-[10px] font-mono text-[var(--chat-muted)] mb-1">
                  {item.value.toLocaleString()}
                </span>
              )}
              <div
                className={cn(
                  "w-full rounded-t-md transition-[height,opacity] min-h-[2px]",
                  isHovered ? "opacity-100" : "opacity-80"
                )}
                style={{
                  height: animate ? `${pct}%` : `${pct}%`,
                  backgroundColor: barColor,
                  transition: animate
                    ? `height var(--cf-duration-smooth) var(--cf-ease-default) ${i * 50}ms, opacity var(--cf-duration-fast)`
                    : `opacity var(--cf-duration-fast)`,
                  ...(animate ? { animation: `cf-bar-grow var(--cf-duration-smooth) var(--cf-ease-default) ${i * 50}ms both` } : {}),
                }}
              />
            </div>
          );
        })}
      </div>
      <div className="flex gap-1">
        {data.map((item, i) => (
          <div key={i} className="flex-1 text-center">
            <span className="text-[10px] font-sans text-[var(--chat-muted)]">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
