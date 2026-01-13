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
        "bg-white/[0.03] backdrop-blur-sm",
        "border border-white/10",
        "rounded-lg my-2",
        className
      )}
    >
      {/* Top accent bar - gradient */}
      <div className="h-1 bg-gradient-to-r from-green-500 via-emerald-400 to-green-500" />

      <div className="px-4 py-3">
        {/* Date & time - prominent */}
        <div className="flex items-center gap-2.5 mb-2">
          <CalendarCheck className="w-4 h-4 text-green-400" />
          <span className="text-white font-medium">
            {formattedDate} · {appointment.time}
          </span>
        </div>

        {/* Topic */}
        {appointment.topic && (
          <p className="text-white/60 text-sm mb-3 ml-[26px]">
            {appointment.topic}
          </p>
        )}

        {/* Confirmed badge */}
        <div className="flex items-center gap-1.5 ml-6">
          <span
            className={cn(
              "flex items-center justify-center w-4 h-4 rounded-full",
              "bg-green-500/20 text-green-400",
              "animate-[scaleIn_0.3s_ease-out,checkPulse_2s_ease-out_0.3s]"
            )}
          >
            <Check className="w-2.5 h-2.5" strokeWidth={3} />
          </span>
          <span className="text-xs text-green-400 font-medium tracking-wide">Confirmada</span>
        </div>
      </div>
    </div>
  );
}
