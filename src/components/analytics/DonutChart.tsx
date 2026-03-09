"use client";

import { cn } from "../../utils/cn";
import { useAnimatedValue } from "../../hooks/useAnimatedValue";

export interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

export interface DonutChartProps {
  segments: DonutSegment[];
  size?: number;
  thickness?: number;
  showCenter?: boolean;
  centerLabel?: string;
  centerValue?: string;
  showLegend?: boolean;
  animate?: boolean;
  className?: string;
}

export function DonutChart({
  segments,
  size = 160,
  thickness = 20,
  showCenter = true,
  centerLabel,
  centerValue,
  showLegend = false,
  animate = true,
  className,
}: DonutChartProps) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  // Animate from 0 to 360 degrees to reveal the chart
  const animatedAngle = useAnimatedValue({ value: 360, duration: 800, enabled: animate });

  if (total === 0) return null;

  // Build conic-gradient stops, clamped by animatedAngle
  let cumulative = 0;
  const stops: string[] = [];
  for (const seg of segments) {
    const start = (cumulative / total) * 360;
    cumulative += seg.value;
    const end = Math.min((cumulative / total) * 360, animatedAngle);
    if (start < animatedAngle) {
      stops.push(`${seg.color} ${start}deg ${end}deg`);
    }
  }
  // Fill remaining with transparent
  if (animatedAngle < 360) {
    stops.push(`transparent ${animatedAngle}deg 360deg`);
  }

  const gradient = `conic-gradient(${stops.join(", ")})`;
  const innerSize = size - thickness * 2;

  return (
    <div data-slot="donut-chart" className={cn("flex flex-col items-center gap-3", className)}>
      <div
        className="relative rounded-full flex items-center justify-center"
        style={{
          width: size,
          height: size,
          background: gradient,
        }}
      >
        <div
          className="rounded-full bg-[var(--chat-background)] flex flex-col items-center justify-center"
          style={{ width: innerSize, height: innerSize }}
        >
          {showCenter && (
            <>
              {centerValue && (
                <span className="font-mono font-semibold text-xl text-[var(--chat-foreground)]">
                  {centerValue}
                </span>
              )}
              {centerLabel && (
                <span className="text-[10px] font-sans text-[var(--chat-muted)] uppercase tracking-wider">
                  {centerLabel}
                </span>
              )}
            </>
          )}
        </div>
      </div>

      {showLegend && (
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
          {segments.map((seg, i) => {
            const pct = Math.round((seg.value / total) * 100);
            return (
              <div key={i} className="flex items-center gap-1.5 text-xs">
                <span
                  className="size-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: seg.color }}
                />
                <span className="font-sans text-[var(--chat-foreground)]">{seg.label}</span>
                <span className="font-mono text-[var(--chat-muted)]">{pct}%</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
