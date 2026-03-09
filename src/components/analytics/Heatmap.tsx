"use client";

import { useState } from "react";
import { cn } from "../../utils/cn";

export interface HeatmapCell {
  row: number;
  col: number;
  value: number;
}

export interface HeatmapProps {
  data: HeatmapCell[];
  rows: string[];
  cols: string[];
  color?: string;
  emptyColor?: string;
  showLabels?: boolean;
  className?: string;
}

export function Heatmap({
  data,
  rows,
  cols,
  color = "var(--chat-primary)",
  emptyColor = "var(--chat-card)",
  showLabels = true,
  className,
}: HeatmapProps) {
  const [hovered, setHovered] = useState<{ row: number; col: number; value: number } | null>(null);

  const maxValue = Math.max(...data.map((d) => d.value), 1);

  // Build lookup map
  const lookup = new Map<string, number>();
  for (const d of data) {
    lookup.set(`${d.row}-${d.col}`, d.value);
  }

  return (
    <div data-slot="heatmap" className={cn("flex flex-col gap-1", className)}>
      {/* Column headers */}
      {showLabels && (
        <div className="flex" style={{ paddingLeft: 40 }}>
          {cols.map((col, i) => (
            <div
              key={i}
              className="flex-1 text-center text-[9px] font-mono text-[var(--chat-muted)]"
            >
              {col}
            </div>
          ))}
        </div>
      )}

      {/* Rows */}
      {rows.map((rowLabel, r) => (
        <div key={r} className="flex items-center gap-1">
          {showLabels && (
            <span className="w-9 text-right text-[9px] font-mono text-[var(--chat-muted)] shrink-0">
              {rowLabel}
            </span>
          )}
          <div className="flex flex-1 gap-[2px]">
            {cols.map((_, c) => {
              const value = lookup.get(`${r}-${c}`) ?? 0;
              const opacity = value > 0 ? 0.15 + (value / maxValue) * 0.85 : 0;
              const isHovered = hovered?.row === r && hovered?.col === c;

              return (
                <div
                  key={c}
                  className={cn(
                    "flex-1 aspect-square rounded-sm transition-transform",
                    isHovered && "scale-125 z-10"
                  )}
                  style={{
                    backgroundColor: value > 0 ? color : emptyColor,
                    opacity: value > 0 ? opacity : 1,
                    transition: `transform var(--cf-duration-fast)`,
                  }}
                  title={`${rows[r]} ${cols[c]}: ${value}`}
                  onMouseEnter={() => setHovered({ row: r, col: c, value })}
                  onMouseLeave={() => setHovered(null)}
                />
              );
            })}
          </div>
        </div>
      ))}

      {/* Tooltip — fixed height to avoid layout shift */}
      <div className="h-4 text-[10px] font-mono text-[var(--chat-muted)] text-center mt-1">
        {hovered && hovered.value > 0
          ? `${rows[hovered.row]} ${cols[hovered.col]}: ${hovered.value} conversaciones`
          : "\u00A0"}
      </div>
    </div>
  );
}
