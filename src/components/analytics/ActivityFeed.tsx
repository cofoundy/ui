"use client";

import type { ReactNode } from "react";
import { cn } from "../../utils/cn";

export interface ActivityFeedItem {
  icon?: ReactNode;
  description: string;
  timestamp: string;
  actor?: string;
  color?: string;
}

export interface ActivityFeedProps {
  items: ActivityFeedItem[];
  maxItems?: number;
  showTimeline?: boolean;
  className?: string;
}

export function ActivityFeed({
  items,
  maxItems,
  showTimeline = true,
  className,
}: ActivityFeedProps) {
  const visibleItems = maxItems ? items.slice(0, maxItems) : items;

  return (
    <div data-slot="activity-feed" className={cn("flex flex-col", className)}>
      {visibleItems.map((item, i) => {
        const isLast = i === visibleItems.length - 1;
        return (
          <div
            key={i}
            className="flex gap-3 cf-animate-fade-in"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            {/* Timeline column */}
            <div className="flex flex-col items-center shrink-0 w-6">
              <div
                className="size-6 rounded-full flex items-center justify-center shrink-0 [&>svg]:size-3"
                style={{
                  backgroundColor: item.color
                    ? `color-mix(in srgb, ${item.color} 20%, transparent)`
                    : "var(--chat-card)",
                }}
              >
                {item.icon ? (
                  <span style={{ color: item.color ?? "var(--chat-muted)" }}>
                    {item.icon}
                  </span>
                ) : (
                  <span
                    className="size-2 rounded-full"
                    style={{ backgroundColor: item.color ?? "var(--chat-muted)" }}
                  />
                )}
              </div>
              {showTimeline && !isLast && (
                <div className="w-px flex-1 min-h-4 bg-[var(--chat-border)]" />
              )}
            </div>

            {/* Content */}
            <div className={cn("flex flex-col pb-4 min-w-0", isLast && "pb-0")}>
              <div className="flex items-baseline gap-2 flex-wrap">
                {item.actor && (
                  <span className="text-sm font-sans font-medium text-[var(--chat-foreground)]">
                    {item.actor}
                  </span>
                )}
                <span className="text-sm font-sans text-[var(--chat-muted)]">
                  {item.description}
                </span>
              </div>
              <span className="text-[10px] font-mono text-[var(--chat-muted)] mt-0.5">
                {item.timestamp}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
