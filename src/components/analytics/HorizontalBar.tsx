"use client";

import type { ReactNode } from "react";
import { cn } from "../../utils/cn";
import { useMountTransition } from "../../hooks/useMountTransition";
import { AnimatedNumber } from "./AnimatedNumber";

export interface HorizontalBarItem {
  label: string;
  value: number;
  color: string;
  icon?: ReactNode;
}

export interface HorizontalBarProps {
  items: HorizontalBarItem[];
  showCounts?: boolean;
  animate?: boolean;
  className?: string;
}

export function HorizontalBar({
  items,
  showCounts = true,
  animate = true,
  className,
}: HorizontalBarProps) {
  const mounted = useMountTransition(animate);
  const maxValue = Math.max(...items.map((d) => d.value), 1);

  return (
    <div data-slot="horizontal-bar" className={cn("flex flex-col gap-2.5", className)}>
      {items.map((item, i) => {
        const pct = (item.value / maxValue) * 100;
        return (
          <div key={i} className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 w-24 shrink-0">
              {item.icon && (
                <span className="text-[var(--chat-muted)] [&>svg]:size-4">
                  {item.icon}
                </span>
              )}
              <span className="text-xs font-sans text-[var(--chat-foreground)] truncate">
                {item.label}
              </span>
            </div>

            <div className="flex-1 h-6 rounded-md overflow-hidden bg-[var(--chat-border)]">
              <div
                className="h-full rounded-md"
                style={{
                  width: mounted ? `${pct}%` : "0%",
                  backgroundColor: item.color,
                  transition: animate
                    ? `width var(--cf-duration-smooth) var(--cf-ease-default) ${i * 80}ms`
                    : undefined,
                }}
              />
            </div>

            {showCounts && (
              <span className="text-xs font-mono text-[var(--chat-muted)] w-12 text-right shrink-0">
                <AnimatedNumber value={item.value} animate={animate} />
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
