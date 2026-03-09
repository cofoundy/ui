"use client";

import type { ReactNode } from "react";
import { cn } from "../../utils/cn";

export interface EmptyStateAction {
  label: string;
  href?: string;
  onClick?: () => void;
}

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: EmptyStateAction;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      data-slot="empty-state"
      className={cn(
        "flex flex-col items-center justify-center py-16 px-6 text-center cf-animate-fade-in",
        className
      )}
    >
      {icon && (
        <span className="text-[var(--chat-muted)] [&>svg]:size-12 mb-4">
          {icon}
        </span>
      )}
      <h3 className="font-display font-medium text-lg text-[var(--chat-foreground)]">
        {title}
      </h3>
      {description && (
        <p className="mt-1.5 text-sm font-sans text-[var(--chat-muted)] max-w-sm">
          {description}
        </p>
      )}
      {action && (
        <a
          href={action.href}
          onClick={action.onClick}
          className="mt-4 px-4 py-2 text-sm font-sans text-[var(--chat-foreground)] hover:bg-[var(--chat-card)] rounded-lg transition-colors cursor-pointer border border-[var(--chat-border)]"
        >
          {action.label}
        </a>
      )}
    </div>
  );
}
