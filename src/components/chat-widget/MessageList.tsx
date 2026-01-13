"use client";

import { useEffect, useRef, useCallback, useMemo } from "react";
import type { Message as MessageType } from "../../types";
import { Message } from "./Message";
import { ToolGroup } from "./ToolGroup";
import { TypingIndicator } from "./TypingIndicator";
import { cn } from "../../utils/cn";

type MessageOrGroup =
  | MessageType
  | { type: "tool_group"; tools: MessageType[] };

/**
 * Groups consecutive tool messages together for horizontal display.
 */
function groupMessages(messages: MessageType[]): MessageOrGroup[] {
  const groups: MessageOrGroup[] = [];
  let currentToolGroup: MessageType[] = [];

  for (const msg of messages) {
    if (msg.role === "tool") {
      currentToolGroup.push(msg);
    } else {
      // Flush tool group before adding non-tool message
      if (currentToolGroup.length > 0) {
        groups.push({ type: "tool_group", tools: currentToolGroup });
        currentToolGroup = [];
      }
      groups.push(msg);
    }
  }

  // Flush remaining tool group
  if (currentToolGroup.length > 0) {
    groups.push({ type: "tool_group", tools: currentToolGroup });
  }

  return groups;
}

interface MessageListProps {
  messages: MessageType[];
  isTyping: boolean;
  className?: string;
  emptyMessage?: string;
}

export function MessageList({
  messages,
  isTyping,
  className,
  emptyMessage = "Comienza una conversación...",
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Group consecutive tool messages for horizontal display
  const groupedMessages = useMemo(() => groupMessages(messages), [messages]);

  // Debounced scroll to prevent jank during streaming
  const scrollToBottom = useCallback(() => {
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    scrollTimeoutRef.current = setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: "instant" });
    }, 50); // Batch scroll updates every 50ms
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Also scroll on typing indicator change (but not during streaming)
  useEffect(() => {
    if (isTyping) {
      scrollToBottom();
    }
  }, [isTyping, scrollToBottom]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      className={cn(
        "flex-1 overflow-y-auto p-4 space-y-4",
        "scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent",
        className
      )}
    >
      {messages.length === 0 && !isTyping && (
        <div className="h-full flex items-center justify-center text-[var(--chat-muted)] text-sm">
          {emptyMessage}
        </div>
      )}

      {groupedMessages.map((item, index) => {
        // Tool group - render horizontally
        if ("type" in item && item.type === "tool_group") {
          const groupKey = item.tools.map((t) => t.id).join("-");
          return <ToolGroup key={groupKey} tools={item.tools} />;
        }
        // Regular message (cast since we know it's not a tool_group)
        const message = item as MessageType;
        return <Message key={message.id} message={message} />;
      })}

      {isTyping && <TypingIndicator />}

      <div ref={bottomRef} />
    </div>
  );
}
