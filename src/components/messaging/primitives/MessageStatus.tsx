"use client";

import { Check, AlertCircle } from "lucide-react";
import { cn } from "../../../utils/cn";
import type { DeliveryStatus } from "../../../types/message";

interface MessageStatusProps {
  status: DeliveryStatus;
  className?: string;
}

/**
 * Delivery status indicator for outbound messages.
 * Shows WhatsApp-style checkmarks for sent/delivered/read status.
 */
export function MessageStatus({ status, className }: MessageStatusProps) {
  switch (status) {
    case "queued":
      return (
        <span className={cn("text-[var(--chat-muted)]", className)}>
          <span className="inline-block w-3 h-3 rounded-full border border-current animate-pulse" />
        </span>
      );

    case "sent":
      return (
        <span className={cn("text-[var(--chat-muted)]", className)}>
          <Check className="w-3 h-3" />
        </span>
      );

    case "delivered":
      return (
        <span className={cn("flex text-[var(--chat-muted)]", className)}>
          <Check className="w-3 h-3" />
          <Check className="w-3 h-3 -ml-1.5" />
        </span>
      );

    case "read":
      return (
        <span className={cn("flex text-[var(--chat-primary)]", className)}>
          <Check className="w-3 h-3" />
          <Check className="w-3 h-3 -ml-1.5" />
        </span>
      );

    case "failed":
      return (
        <span className={cn("text-[var(--status-error)]", className)}>
          <AlertCircle className="w-3 h-3" />
        </span>
      );

    default:
      return null;
  }
}
