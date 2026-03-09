"use client";

import { cn } from "../../utils/cn";

export interface SparkLineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  fillOpacity?: number;
  strokeWidth?: number;
  animate?: boolean;
  className?: string;
}

export function SparkLine({
  data,
  width = 80,
  height = 24,
  color = "var(--chat-primary)",
  fillOpacity = 0.1,
  strokeWidth = 1.5,
  animate = true,
  className,
}: SparkLineProps) {
  if (data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const padding = 1;

  const points = data.map((v, i) => {
    const x = padding + (i / (data.length - 1)) * (width - padding * 2);
    const y = height - padding - ((v - min) / range) * (height - padding * 2);
    return `${x},${y}`;
  });

  const polyline = points.join(" ");
  const fillPoints = `${padding},${height - padding} ${polyline} ${width - padding},${height - padding}`;

  return (
    <svg
      data-slot="spark-line"
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={cn("inline-block shrink-0", className)}
      style={{ overflow: "visible" }}
    >
      {/* Fill area */}
      <polygon
        points={fillPoints}
        fill={color}
        opacity={fillOpacity}
      />
      {/* Line */}
      <polyline
        points={polyline}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={animate ? {
          strokeDasharray: width * 3,
          strokeDashoffset: width * 3,
          animation: `cf-spark-draw var(--cf-duration-slow, 600ms) var(--cf-ease-default, ease) forwards`,
        } : undefined}
      />
      <style>{`
        @keyframes cf-spark-draw {
          to { stroke-dashoffset: 0; }
        }
      `}</style>
    </svg>
  );
}
