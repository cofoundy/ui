"use client";

import { cn } from "../../utils/cn";
import type { ConnectionStatus } from "../../types";
import { Calendar } from "lucide-react";

interface ChatHeaderProps {
  connectionStatus: ConnectionStatus;
  isAuthenticated?: boolean;
  brandName?: string;
  brandLogo?: string;
  brandSubtitle?: string;
}

export function ChatHeader({
  connectionStatus,
  isAuthenticated = false,
  brandName = "Cofoundy",
  brandLogo,
  brandSubtitle = "Consultoría de Software & IA",
}: ChatHeaderProps) {
  const statusColor = {
    connected: "bg-green-500",
    connecting: "bg-yellow-500 animate-pulse",
    disconnected: "bg-red-500",
    error: "bg-red-500",
  }[connectionStatus];

  const statusTitle = {
    connected: "Conectado",
    connecting: "Conectando...",
    disconnected: "Desconectado",
    error: "Error de conexión",
  }[connectionStatus];

  return (
    <div className="flex items-center justify-between p-4 border-b border-[var(--chat-border)]">
      <div className="flex items-center gap-3">
        {/* Logo with status indicator */}
        <div className="relative w-10 h-10">
          {brandLogo ? (
            <img
              src={brandLogo}
              alt={brandName}
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="w-full h-full rounded-full bg-gradient-to-br from-[var(--chat-primary)] to-[var(--chat-primary)]/70 flex items-center justify-center text-[var(--chat-foreground)] font-bold">
              {brandName.charAt(0)}
            </div>
          )}
          {/* Status indicator - bottom right corner of logo */}
          <div
            className={cn(
              "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[var(--chat-background)]",
              statusColor
            )}
            title={statusTitle}
          />
        </div>
        <div className="min-w-0">
          <h1 className="font-semibold text-[var(--chat-foreground)]">{brandName}</h1>
          <p className="text-sm text-[var(--chat-muted)] truncate">{brandSubtitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Calendar authentication status (only show when authenticated) */}
        {isAuthenticated && (
          <div className="flex items-center gap-1 text-xs text-[var(--chat-success)]">
            <Calendar className="w-4 h-4" />
            <span>Calendario conectado</span>
          </div>
        )}
      </div>
    </div>
  );
}
