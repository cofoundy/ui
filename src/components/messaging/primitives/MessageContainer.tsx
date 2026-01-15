"use client";

import type { ReactNode } from "react";
import { cn } from "../../../utils/cn";
import type { MessageDirection } from "../../../types/message";

interface MessageContainerProps {
  direction: MessageDirection;
  children: ReactNode;
  className?: string;
}

/**
 * Direction-aware container for message layout.
 * Handles flex direction and alignment based on inbound/outbound.
 */
export function MessageContainer({
  direction,
  children,
  className,
}: MessageContainerProps) {
  return (
    <div
      className={cn(
        "flex gap-2 cf-animate-fade-in",
        direction === "outbound" ? "flex-row-reverse" : "flex-row",
        className
      )}
    >
      {children}
    </div>
  );
}
