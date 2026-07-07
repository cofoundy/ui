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
  /** Color for bars below the zero baseline. Defaults to `barColor`. */
  negativeBarColor?: string;
  emptyText?: string;
  showValues?: boolean;
  animate?: boolean;
  className?: string;
}

export function BarChart({
  data,
  height = 200,
  barColor = "var(--chat-primary)",
  negativeBarColor,
  emptyText = "Sin datos en este periodo",
  showValues = false,
  animate = true,
  className,
}: BarChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

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

  // Zero-baseline domain: bars grow UP from zero for positive values and DOWN
  // from zero for negative values. `domainMax`/`domainMin` are clamped to include
  // zero so the baseline is always at value 0. For all-positive data this reduces
  // to the classic bottom-anchored bar chart (bottom region collapses to 0).
  const values = data.map((d) => d.value);
  const domainMax = Math.max(...values, 0);
  const domainMin = Math.min(...values, 0);
  const range = domainMax - domainMin || 1;
  const hasNegative = domainMin < 0;
  const topPct = (domainMax / range) * 100; // height of the above-zero region
  const bottomPct = (-domainMin / range) * 100; // height of the below-zero region
  const negColor = negativeBarColor ?? barColor;

  return (
    <div data-slot="bar-chart" className={cn("flex flex-col gap-2", className)}>
      <div className="relative flex items-stretch gap-1" style={{ height }}>
        {hasNegative && (
          <div
            data-slot="bar-chart-baseline"
            aria-hidden
            className="absolute inset-x-0 border-t border-[var(--chat-border)] opacity-70"
            style={{ top: `${topPct}%` }}
          />
        )}
        {data.map((item, i) => {
          const isHovered = hoveredIndex === i;
          const isPositive = item.value >= 0;
          // Each bar's height is relative to its own region: a positive value
          // fills `value / domainMax` of the top region; a negative value fills
          // `|value| / |domainMin|` of the bottom region.
          const fillPct = isPositive
            ? domainMax > 0
              ? (item.value / domainMax) * 100
              : 0
            : domainMin < 0
              ? (-item.value / -domainMin) * 100
              : 0;
          const label =
            (showValues || isHovered) && item.value !== 0 ? (
              <span className="text-[10px] font-mono text-[var(--chat-muted)]">
                {item.value.toLocaleString()}
              </span>
            ) : null;
          const bar =
            item.value !== 0 ? (
              <div
                data-slot="bar-chart-bar"
                data-sign={isPositive ? "positive" : "negative"}
                className={cn(
                  "w-full min-h-[2px]",
                  isPositive ? "rounded-t-md" : "rounded-b-md",
                  isHovered ? "opacity-100" : "opacity-80",
                  animate && "cf-bar-reveal-y"
                )}
                style={{
                  height: `${fillPct}%`,
                  backgroundColor: isPositive ? barColor : negColor,
                  ["--cf-stagger-index" as string]: i,
                } as React.CSSProperties}
              />
            ) : null;
          return (
            <div
              key={i}
              className="relative flex-1 flex flex-col h-full"
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Above-zero region: bars grow up from the baseline. */}
              <div
                className="flex flex-col justify-end items-center"
                style={{ height: `${topPct}%` }}
              >
                {isPositive && label ? <span className="mb-1">{label}</span> : null}
                {isPositive ? bar : null}
              </div>
              {/* Below-zero region: bars grow down from the baseline. */}
              <div
                className="flex flex-col justify-start items-center"
                style={{ height: `${bottomPct}%` }}
              >
                {!isPositive ? bar : null}
                {!isPositive && label ? <span className="mt-1">{label}</span> : null}
              </div>
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
