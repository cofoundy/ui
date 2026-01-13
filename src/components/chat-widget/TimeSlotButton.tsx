"use client";

import { cn } from "../../utils/cn";
import { Button } from "../ui/button";
import type { TimeSlot } from "../../types";
import { Clock } from "lucide-react";

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
    <Button
      variant={selected ? "default" : "outline"}
      size="sm"
      onClick={() => onSelect(slot)}
      disabled={!slot.available}
      className={cn(
        "flex items-center gap-2",
        selected
          ? "chat-gradient-primary text-white"
          : "chat-glass-button hover:bg-[var(--chat-primary)]/20",
        !slot.available && "opacity-50 cursor-not-allowed"
      )}
    >
      <Clock className="w-3 h-3" />
      <span>{slot.time}</span>
    </Button>
  );
}
