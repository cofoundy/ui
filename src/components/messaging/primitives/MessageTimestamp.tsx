"use client";

import { useMemo } from "react";
import { cn } from "../../../utils/cn";

export type TimestampFormat = "time" | "relative" | "full" | "date";

interface MessageTimestampProps {
  timestamp: Date;
  format?: TimestampFormat;
  className?: string;
}

/**
 * Formats a timestamp for message display.
 */
function formatTimestamp(timestamp: Date, format: TimestampFormat): string {
  const now = new Date();
  const diff = now.getTime() - timestamp.getTime();
  const diffMinutes = Math.floor(diff / 60000);
  const diffHours = Math.floor(diff / 3600000);
  const diffDays = Math.floor(diff / 86400000);

  switch (format) {
    case "time":
      return timestamp.toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
      });

    case "relative":
      if (diffMinutes < 1) return "Just now";
      if (diffMinutes < 60) return `${diffMinutes}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      return timestamp.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      });

    case "date":
      const isToday = timestamp.toDateString() === now.toDateString();
      const isYesterday =
        new Date(now.getTime() - 86400000).toDateString() === timestamp.toDateString();

      if (isToday) return "Today";
      if (isYesterday) return "Yesterday";
      return timestamp.toLocaleDateString(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
      });

    case "full":
      return timestamp.toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

    default:
      return timestamp.toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
      });
  }
}

/**
 * Message timestamp component with multiple format options.
 */
export function MessageTimestamp({
  timestamp,
  format = "time",
  className,
}: MessageTimestampProps) {
  const formattedTime = useMemo(
    () => formatTimestamp(timestamp, format),
    [timestamp, format]
  );

  return (
    <time
      dateTime={timestamp.toISOString()}
      className={cn("text-[10px] opacity-50", className)}
    >
      {formattedTime}
    </time>
  );
}
