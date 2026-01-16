"use client";

import { useEffect, useRef, useMemo } from "react";
import type { Message as MessageType } from "../../types";
import { Message } from "./Message";
import { ToolGroup } from "./ToolGroup";
import { TypingIndicator } from "./TypingIndicator";
import { useAutoScroll } from "../../hooks/useAutoScroll";
import { cn } from "../../utils/cn";

type MessageOrGroup =
  | MessageType
  | { type: "tool_group"; tools: MessageType[] };

/**
 * Groups consecutive tool messages together for vertical display.
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

/**
 * Message list using shared useAutoScroll hook.
 * Visually identical to the original implementation.
 */
export function MessageList({
  messages,
  isTyping,
  className,
  emptyMessage = "Comienza una conversación...",
}: MessageListProps) {
  // Use shared auto-scroll hook
  const { containerRef, scrollToBottom, isUserScrollLocked, handleScroll } =
    useAutoScroll();

  const lastMessageCountRef = useRef(messages.length);

  // Group consecutive tool messages for vertical display
  const groupedMessages = useMemo(() => groupMessages(messages), [messages]);

  // Auto-scroll when new messages arrive (only if not locked)
  useEffect(() => {
    const isNewMessage = messages.length > lastMessageCountRef.current;
    lastMessageCountRef.current = messages.length;

    if (isNewMessage && !isUserScrollLocked) {
      scrollToBottom();
    }
  }, [messages, isUserScrollLocked, scrollToBottom]);

  // Scroll to bottom on initial mount
  useEffect(() => {
    scrollToBottom(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Also scroll on typing indicator change (but respect lock)
  useEffect(() => {
    if (isTyping && !isUserScrollLocked) {
      scrollToBottom();
    }
  }, [isTyping, isUserScrollLocked, scrollToBottom]);

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      data-lenis-prevent
      className={cn(
        "flex-1 min-h-0 overflow-y-auto p-4 space-y-4",
        "chat-scrollbar",
        className
      )}
    >
      {messages.length === 0 && !isTyping && (
        <div className="h-full flex items-center justify-center text-[var(--chat-muted)] text-sm">
          {emptyMessage}
        </div>
      )}

      {groupedMessages.map((item, index) => {
        // Tool group - render vertically
        if ("type" in item && item.type === "tool_group") {
          const groupKey = item.tools.map((t) => t.id).join("-");
          return <ToolGroup key={groupKey} tools={item.tools} />;
        }
        // Regular message (cast since we know it's not a tool_group)
        const message = item as MessageType;
        return <Message key={message.id} message={message} />;
      })}

      {isTyping && <TypingIndicator />}
    </div>
  );
}
