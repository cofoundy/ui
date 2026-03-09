"use client";

import type { ReactNode } from "react";
import { cn } from "../../utils/cn";

export interface AnalyticsSectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
}

export function AnalyticsSectionHeader({
  title,
  subtitle,
  action,
  className,
}: AnalyticsSectionHeaderProps) {
  return (
    <div
      data-slot="analytics-section-header"
      className={cn("flex items-center justify-between gap-4", className)}
    >
      <div className="flex flex-col">
        <h2 className="font-display font-semibold text-lg text-[var(--chat-foreground)]">
          {title}
        </h2>
        {subtitle && (
          <span className="text-xs font-sans text-[var(--chat-muted)]">
            {subtitle}
          </span>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
