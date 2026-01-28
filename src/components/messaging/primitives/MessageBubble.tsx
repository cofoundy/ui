"use client";

import type { ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../../utils/cn";
import type { MessageDirection } from "../../../types/message";

const messageBubbleVariants = cva(
  "rounded-2xl px-3 py-2 sm:px-4 sm:py-3 max-w-[85%] sm:max-w-[80%]",
  {
    variants: {
      variant: {
        widget: "",
        inbox: "",
        minimal: "px-2 py-1",
      },
      direction: {
        inbound: "rounded-tl-sm",
        outbound: "rounded-tr-sm",
      },
      aiGenerated: {
        true: "",
        false: "",
      },
    },
    compoundVariants: [
      // Widget variant
      {
        variant: "widget",
        direction: "inbound",
        className: "bg-[var(--chat-card-hover)] text-[var(--chat-foreground)]",
      },
      {
        variant: "widget",
        direction: "outbound",
        className: "chat-gradient-primary text-[var(--primary-foreground)]",
      },
      // Inbox variant - inbound
      {
        variant: "inbox",
        direction: "inbound",
        className: "bg-[var(--chat-card-hover)] text-[var(--chat-foreground)]",
      },
      // Inbox variant - outbound (agent)
      {
        variant: "inbox",
        direction: "outbound",
        aiGenerated: false,
        className: "bg-[var(--chat-primary)] text-[var(--primary-foreground)]",
      },
      // Inbox variant - outbound (AI)
      {
        variant: "inbox",
        direction: "outbound",
        aiGenerated: true,
        className: "bg-[#9333ea] text-white",
      },
      // Minimal variant
      {
        variant: "minimal",
        direction: "inbound",
        className: "bg-[var(--chat-muted)]/20 text-[var(--chat-foreground)]",
      },
      {
        variant: "minimal",
        direction: "outbound",
        className: "bg-[var(--chat-primary)]/20 text-[var(--chat-foreground)]",
      },
    ],
    defaultVariants: {
      variant: "inbox",
      direction: "inbound",
      aiGenerated: false,
    },
  }
);

export interface MessageBubbleProps
  extends VariantProps<typeof messageBubbleVariants> {
  children: ReactNode;
  className?: string;
}

/**
 * The message bubble itself with variant styling.
 */
export function MessageBubble({
  variant,
  direction,
  aiGenerated,
  children,
  className,
}: MessageBubbleProps) {
  return (
    <div
      className={cn(
        messageBubbleVariants({ variant, direction, aiGenerated }),
        className
      )}
    >
      {children}
    </div>
  );
}

export { messageBubbleVariants };
