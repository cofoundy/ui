"use client";

import { memo, useMemo } from "react";
import { cn } from "../../utils/cn";
import type { Message as MessageType } from "../../types";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

interface ToolIndicatorProps {
  message: MessageType;
  /** When true, renders as a compact pill without outer wrapper (for ToolGroup) */
  compact?: boolean;
}

/**
 * ToolIndicator component for showing tool execution status.
 * Displays a card with icon, text, and animated progress indicator.
 */
export const ToolIndicator = memo(
  function ToolIndicator({ message, compact = false }: ToolIndicatorProps) {
    const isRunning = message.toolStatus === "running";
    const isSuccess = message.toolStatus === "success";

    // Get status-specific styles
    const statusStyles = useMemo(() => {
      if (isRunning) {
        return {
          bg: "bg-gradient-to-r from-blue-500/20 to-purple-500/20",
          border: "border-blue-500/30",
          text: "text-blue-200",
          icon: <Loader2 className="w-4 h-4 animate-spin" />,
        };
      }
      if (isSuccess) {
        return {
          bg: "bg-gradient-to-r from-green-500/20 to-emerald-500/20",
          border: "border-green-500/30",
          text: "text-green-200",
          icon: <CheckCircle2 className="w-4 h-4" />,
        };
      }
      // Error
      return {
        bg: "bg-gradient-to-r from-red-500/20 to-orange-500/20",
        border: "border-red-500/30",
        text: "text-red-200",
        icon: <XCircle className="w-4 h-4" />,
      };
    }, [isRunning, isSuccess]);

    const pill = (
      <div
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full",
          "border backdrop-blur-sm transition-all duration-300",
          compact ? "px-3 py-1.5" : "px-4 py-2",
          statusStyles.bg,
          statusStyles.border,
          statusStyles.text,
          isRunning && "animate-pulse"
        )}
      >
        {/* Tool icon from backend */}
        <span className={compact ? "text-sm" : "text-base"}>
          {message.toolIcon}
        </span>

        {/* Tool text */}
        <span className={cn("font-medium", compact ? "text-xs" : "text-sm")}>
          {message.content}
        </span>

        {/* Status icon */}
        <span
          className={cn(
            "transition-opacity duration-300",
            isRunning ? "opacity-100" : "opacity-80"
          )}
        >
          {statusStyles.icon}
        </span>
      </div>
    );

    // In compact mode, ToolGroup handles the layout
    if (compact) {
      return pill;
    }

    return (
      <div className="flex justify-center my-2 chat-animate-fade-in">{pill}</div>
    );
  },
  // Custom comparison: re-render when status or compact changes
  (prevProps, nextProps) => {
    return (
      prevProps.message.id === nextProps.message.id &&
      prevProps.message.toolStatus === nextProps.message.toolStatus &&
      prevProps.compact === nextProps.compact
    );
  }
);
