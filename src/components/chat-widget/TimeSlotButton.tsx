"use client";

import { cn } from "../../utils/cn";
import type { TimeSlot } from "../../types";

interface TimeSlotButtonProps {
  slot: TimeSlot;
  selected?: boolean;
  onSelect: (slot: TimeSlot) => void;
}

export function TimeSlotButton({
  slot,
  selected = false,
  onSelect,
}: TimeSlotButtonProps) {
  return (
    <button
      onClick={() => onSelect(slot)}
      disabled={!slot.available}
      className={cn(
        // Base: floating card
        "px-2.5 py-1.5 rounded-md text-xs font-medium",
        "bg-[var(--chat-card)] border border-[var(--chat-border)]",
        "shadow-sm",
        // Transitions
        "transition-all duration-200 ease-out",
        // Hover: lift up
        "hover:-translate-y-0.5 hover:shadow-md",
        "hover:bg-[var(--chat-card-hover)]",
        // Selected: accent border + glow
        selected && [
          "border-l-2 border-l-[var(--chat-primary)]",
          "bg-[var(--chat-card-hover)]",
          "shadow-[0_4px_16px_var(--chat-primary)/20]",
        ],
        // Disabled
        !slot.available && "opacity-40 cursor-not-allowed hover:transform-none hover:shadow-sm"
      )}
    >
      <span className={cn(
        "text-[var(--chat-foreground)]/90",
        selected && "text-[var(--chat-foreground)]"
      )}>
        {slot.time}
      </span>
    </button>
  );
}
