"use client";

import { cn } from "../../utils/cn";
import type { Appointment } from "../../types";
import { CheckCircle, Calendar, Clock, MessageSquare } from "lucide-react";

interface ConfirmationCardProps {
  appointment: Appointment;
  className?: string;
  title?: string;
  footerMessage?: string;
}

export function ConfirmationCard({
  appointment,
  className,
  title = "Cita Confirmada",
  footerMessage = "Recibirás un correo de confirmación con los detalles y el enlace para la videollamada.",
}: ConfirmationCardProps) {
  return (
    <div
      className={cn(
        "bg-gradient-to-r from-green-500/20 to-emerald-500/20",
        "border border-green-500/30",
        "rounded-xl p-4 my-2",
        "chat-animate-slide-up",
        className
      )}
    >
      {/* Success header */}
      <div className="flex items-center gap-2 mb-4">
        <CheckCircle className="w-5 h-5 text-green-400" />
        <span className="font-semibold text-green-400">{title}</span>
      </div>

      {/* Appointment details */}
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2 text-white">
          <Calendar className="w-4 h-4 text-[var(--chat-muted)]" />
          <span>
            {/* Append T12:00:00 to avoid timezone-induced off-by-one-day errors.
                new Date("YYYY-MM-DD") parses as UTC midnight, which in negative
                UTC timezones (e.g., Peru UTC-5) displays as the previous day. */}
            {new Date(appointment.date + "T12:00:00").toLocaleDateString(
              "es-ES",
              {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              }
            )}
          </span>
        </div>

        <div className="flex items-center gap-2 text-white">
          <Clock className="w-4 h-4 text-[var(--chat-muted)]" />
          <span>{appointment.time}</span>
        </div>

        {appointment.topic && (
          <div className="flex items-center gap-2 text-white">
            <MessageSquare className="w-4 h-4 text-[var(--chat-muted)]" />
            <span>{appointment.topic}</span>
          </div>
        )}
      </div>

      {/* Footer message */}
      <p className="mt-4 text-xs text-[var(--chat-muted)]">{footerMessage}</p>
    </div>
  );
}
