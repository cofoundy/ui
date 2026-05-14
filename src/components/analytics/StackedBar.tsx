import { cn } from "../../utils/cn";
import { AnimatedNumber } from "./AnimatedNumber";

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
              className={cn(
                "relative flex items-center justify-center",
                animate && "cf-bar-reveal-x"
              )}
              style={{
                width: `${pct}%`,
                backgroundColor: seg.color,
                ["--cf-stagger-index" as string]: i,
              } as React.CSSProperties}
            >
              {showPercentages && pct >= 5 && (
                <span className="text-[11px] font-mono font-medium text-[var(--chat-on-primary)] drop-shadow-sm">
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
                  <AnimatedNumber value={seg.value} animate={animate} /> ({Math.round(pct)}%)
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
