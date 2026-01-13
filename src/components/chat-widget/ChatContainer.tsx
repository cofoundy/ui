"use client";

import { ReactNode } from "react";
import { cn } from "../../utils/cn";

interface ChatContainerProps {
  children: ReactNode;
  className?: string;
}

export function ChatContainer({ children, className }: ChatContainerProps) {
  return (
    <div
      className={cn(
        "w-full h-full",
        "chat-glass-card",
        "flex flex-col",
        "shadow-2xl shadow-primary/10",
        "chat-animate-fade-in",
        className
      )}
    >
      {children}
    </div>
  );
}
