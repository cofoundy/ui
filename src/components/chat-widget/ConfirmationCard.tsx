"use client";

import { cn } from "../../utils/cn";
import { CalendarCheck, Check } from "lucide-react";
import type { Appointment } from "../../types";

interface ConfirmationCardProps {
  appointment: Appointment;
  className?: string;
}

export function ConfirmationCard({
  appointment,
  className,
}: ConfirmationCardProps) {
  // Format date compactly: "Mié 15 Ene"
  const dateObj = new Date(appointment.date + "T12:00:00");
  const weekday = dateObj.toLocaleDateString("es-ES", { weekday: "short" });
  const day = dateObj.getDate();
  const month = dateObj.toLocaleDateString("es-ES", { month: "short" });
  const formattedDate = `${weekday} ${day} ${month}`;

  return (
    <div
      className={cn(
        "relative overflow-hidden",
        "bg-[var(--chat-card)] backdrop-blur-sm",
        "border border-[var(--chat-border)]",
        "rounded-lg my-2",
        className
      )}
    >
      {/* Top accent bar - gradient */}
      <div className="h-1 bg-gradient-to-r from-[var(--chat-success)] via-emerald-400 to-[var(--chat-success)]" />

      <div className="px-4 py-3">
        {/* Date & time - prominent */}
        <div className="flex items-center gap-2.5 mb-2">
          <CalendarCheck className="w-4 h-4 text-[var(--chat-success)]" />
          <span className="text-[var(--chat-foreground)] font-medium">
            {formattedDate} · {appointment.time}
          </span>
        </div>

        {/* Topic */}
        {appointment.topic && (
          <p className="text-[var(--chat-muted)] text-sm mb-3 ml-[26px]">
            {appointment.topic}
          </p>
        )}

        {/* Confirmed badge */}
        <div className="flex items-center gap-1.5 ml-6">
          <span
            className={cn(
              "flex items-center justify-center w-4 h-4 rounded-full",
              "bg-[var(--chat-success)]/20 text-[var(--chat-success)]",
              "animate-[cf-scale-in_0.3s_ease-out,cf-pulse-success_2s_ease-out_0.3s]"
            )}
          >
            <Check className="w-2.5 h-2.5" strokeWidth={3} />
          </span>
          <span className="text-xs text-[var(--chat-success)] font-medium tracking-wide">Confirmada</span>
        </div>
      </div>
    </div>
  );
}
