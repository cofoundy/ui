"use client";

import { Sparkles } from "lucide-react";
import { cn } from "../../../utils/cn";

interface AIBadgeProps {
  /** Display variant */
  variant?: "full" | "icon-only";
  /** Custom label (default: "AI Response") */
  label?: string;
  className?: string;
}

/**
 * Badge indicating an AI-generated message.
 */
export function AIBadge({
  variant = "full",
  label = "AI Response",
  className,
}: AIBadgeProps) {
  if (variant === "icon-only") {
    return (
      <span
        className={cn(
          "inline-flex items-center justify-center",
          "w-5 h-5 rounded-full",
          "bg-[#a855f7]/20 text-[#c084fc]",
          className
        )}
        title={label}
      >
        <Sparkles className="w-3 h-3" />
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1",
        "text-xs text-[#d8b4fe]",
        className
      )}
    >
      <Sparkles className="w-3 h-3" />
      {label}
    </span>
  );
}
