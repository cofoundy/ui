"use client";

import { useState } from "react";
import { cn } from "../../utils/cn";
import type { TimeSlot } from "../../types";
import { TimeSlotButton } from "./TimeSlotButton";
import { Calendar } from "lucide-react";

interface TimeSlotGridProps {
  slots: TimeSlot[];
  onSelectSlot: (slot: TimeSlot) => void;
  className?: string;
  title?: string;
}

// Group slots by date
function groupSlotsByDate(slots: TimeSlot[]): Record<string, TimeSlot[]> {
  return slots.reduce(
    (acc, slot) => {
      if (!acc[slot.date]) {
        acc[slot.date] = [];
      }
      acc[slot.date].push(slot);
      return acc;
    },
    {} as Record<string, TimeSlot[]>
  );
}

export function TimeSlotGrid({
  slots,
  onSelectSlot,
  className,
  title = "Horarios disponibles",
}: TimeSlotGridProps) {
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const groupedSlots = groupSlotsByDate(slots);

  const handleSelect = (slot: TimeSlot) => {
    setSelectedSlot(slot);
    onSelectSlot(slot);
  };

  if (slots.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        "bg-white/5 rounded-xl p-4 my-2",
        "border border-white/10",
        "chat-animate-fade-in",
        className
      )}
    >
      <div className="flex items-center gap-2 mb-3 text-sm text-white">
        <Calendar className="w-4 h-4 text-[var(--chat-primary)]" />
        <span className="font-medium">{title}</span>
      </div>

      <div className="space-y-4">
        {Object.entries(groupedSlots).map(([date, dateSlots]) => (
          <div key={date}>
            <p className="text-xs text-[var(--chat-muted)] mb-2">
              {new Date(date).toLocaleDateString("es-ES", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </p>
            <div className="flex flex-wrap gap-2">
              {dateSlots.map((slot, idx) => (
                <TimeSlotButton
                  key={`${slot.date}-${slot.time}-${idx}`}
                  slot={slot}
                  selected={
                    selectedSlot?.date === slot.date &&
                    selectedSlot?.time === slot.time
                  }
                  onSelect={handleSelect}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
