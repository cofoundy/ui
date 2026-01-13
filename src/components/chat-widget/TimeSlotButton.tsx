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
        "bg-white/[0.03] border border-white/10",
        "shadow-[0_2px_6px_rgba(0,0,0,0.25)]",
        // Transitions
        "transition-all duration-200 ease-out",
        // Hover: lift up
        "hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.4)]",
        "hover:bg-white/[0.06] hover:border-white/20",
        // Selected: accent border + glow
        selected && [
          "border-l-2 border-l-[var(--chat-primary)]",
          "bg-white/[0.08]",
          "shadow-[0_4px_16px_rgba(41,132,173,0.2)]",
        ],
        // Disabled
        !slot.available && "opacity-40 cursor-not-allowed hover:transform-none hover:shadow-[0_2px_6px_rgba(0,0,0,0.25)]"
      )}
    >
      <span className={cn(
        "text-white/90",
        selected && "text-white"
      )}>
        {slot.time}
      </span>
    </button>
  );
}
