"use client";

import { cn } from "../../utils/cn";

export interface TimeRangeOption {
  value: string;
  label: string;
}

export interface TimeRangeSelectorProps {
  options: TimeRangeOption[];
  value: string;
  onChange: (value: string) => void;
  disabledOptions?: string[];
  className?: string;
}

export function TimeRangeSelector({
  options,
  value,
  onChange,
  disabledOptions = [],
  className,
}: TimeRangeSelectorProps) {
  return (
    <div
      data-slot="time-range-selector"
      className={cn(
        "inline-flex items-center gap-0.5 p-0.5 bg-[var(--chat-card)] border border-[var(--chat-border)] rounded-lg",
        className
      )}
    >
      {options.map((opt) => {
        const isActive = opt.value === value;
        const isDisabled = disabledOptions.includes(opt.value);

        return (
          <button
            key={opt.value}
            type="button"
            disabled={isDisabled}
            onClick={() => !isDisabled && onChange(opt.value)}
            title={isDisabled ? "Sin datos suficientes" : undefined}
            className={cn(
              "px-3 py-1 text-xs font-mono rounded-md transition-all",
              isActive
                ? "bg-[var(--chat-primary)] text-[var(--chat-on-primary)]"
                : "text-[var(--chat-muted)] hover:text-[var(--chat-foreground)]",
              isDisabled && "opacity-40 cursor-not-allowed hover:text-[var(--chat-muted)]"
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
