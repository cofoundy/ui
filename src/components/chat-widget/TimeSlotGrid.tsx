"use client";

import { useState, useMemo } from "react";
import { cn } from "../../utils/cn";
import type { TimeSlot } from "../../types";
import { TimeSlotButton } from "./TimeSlotButton";

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

// Normalize date string: "2025/01/15" or "2025-01-15" -> Date object
function parseDate(dateStr: string): Date {
  // Replace slashes with dashes for consistent parsing
  const normalized = dateStr.replace(/\//g, "-");
  return new Date(normalized + "T12:00:00");
}

// Format date for tab: "Mié 15"
function formatTabDate(dateStr: string): string {
  const date = parseDate(dateStr);
  const weekday = date.toLocaleDateString("es-ES", { weekday: "short" });
  const day = date.getDate();
  // Capitalize first letter
  return `${weekday.charAt(0).toUpperCase()}${weekday.slice(1)} ${day}`;
}

// Format date for header when single day: "miércoles, 13 de enero"
function formatFullDate(dateStr: string): string {
  const date = parseDate(dateStr);
  return date.toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export function TimeSlotGrid({
  slots,
  onSelectSlot,
  className,
  title = "Horarios disponibles",
}: TimeSlotGridProps) {
  const groupedSlots = useMemo(() => groupSlotsByDate(slots), [slots]);
  const dates = Object.keys(groupedSlots);

  const [selectedDate, setSelectedDate] = useState<string>(dates[0] || "");
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);

  const handleSelect = (slot: TimeSlot) => {
    setSelectedSlot(slot);
    onSelectSlot(slot);
  };

  if (slots.length === 0) {
    return null;
  }

  const hasMultipleDays = dates.length > 1;
  const currentSlots = groupedSlots[selectedDate] || [];

  return (
    <div
      className={cn(
        "bg-[var(--chat-card)] backdrop-blur-sm rounded-lg p-3 mx-4 my-1",
        "border border-[var(--chat-border)]",
        "shadow-[inset_0_1px_0_var(--chat-inset-highlight)] shadow-lg",
        className
      )}
    >
      {/* Header */}
      <p className="text-[10px] uppercase tracking-wider text-[var(--chat-muted)] font-medium mb-2">
        {hasMultipleDays ? title : formatFullDate(selectedDate)}
      </p>

      {/* Day tabs - only show if multiple days */}
      {hasMultipleDays && (
        <div className="flex gap-1 mb-2 overflow-x-auto -mx-1 px-1">
          {dates.map((date) => (
            <button
              key={date}
              onClick={() => setSelectedDate(date)}
              className={cn(
                "relative px-3 py-1 text-xs font-medium whitespace-nowrap",
                "transition-all duration-200 ease-out",
                selectedDate === date
                  ? "text-[var(--chat-foreground)]"
                  : "text-[var(--chat-muted)] hover:text-[var(--chat-foreground)]"
              )}
            >
              {formatTabDate(date)}
              {/* Underline accent */}
              <span
                className={cn(
                  "absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 rounded-full",
                  "transition-all duration-200 ease-out",
                  selectedDate === date
                    ? "w-full bg-[var(--chat-primary)]"
                    : "w-0 bg-transparent"
                )}
              />
            </button>
          ))}
        </div>
      )}

      {/* Divider when multiple days */}
      {hasMultipleDays && (
        <div className="h-px bg-gradient-to-r from-transparent via-[var(--chat-border)] to-transparent mb-2" />
      )}

      {/* Time slots for selected day */}
      <div className="flex flex-wrap gap-1.5">
        {currentSlots.map((slot, idx) => (
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
  );
}
