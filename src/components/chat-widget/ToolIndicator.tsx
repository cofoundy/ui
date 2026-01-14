"use client";

import { memo } from "react";
import { cn } from "../../utils/cn";
import type { Message as MessageType } from "../../types";

interface ToolIndicatorProps {
  message: MessageType;
  /** When true, renders inline without wrapper (for ToolGroup) */
  compact?: boolean;
}

/**
 * Minimal tool indicator - git commit style
 * ○ Running...
 * ✓ Success
 * ✗ Error
 */
export const ToolIndicator = memo(
  function ToolIndicator({ message, compact = false }: ToolIndicatorProps) {
    const isRunning = message.toolStatus === "running";
    const isSuccess = message.toolStatus === "success";
    const isError = message.toolStatus === "error";

    const indicator = (
      <div
        className={cn(
          "flex items-center gap-2 text-sm font-mono",
          isRunning && "text-[var(--chat-muted)]",
          isSuccess && "text-[var(--chat-muted)]",
          isError && "text-[var(--chat-error)]/80"
        )}
      >
        {/* Status symbol */}
        <span className={cn(isRunning && "animate-pulse")}>
          {isRunning && "○"}
          {isSuccess && "✓"}
          {isError && "✗"}
        </span>

        {/* Tool text */}
        <span>
          {message.content}
          {isRunning && "..."}
        </span>
      </div>
    );

    if (compact) {
      return indicator;
    }

    return (
      <div className="pl-4 my-1 chat-animate-fade-in">
        {indicator}
      </div>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.message.id === nextProps.message.id &&
      prevProps.message.toolStatus === nextProps.message.toolStatus &&
      prevProps.compact === nextProps.compact
    );
  }
);
