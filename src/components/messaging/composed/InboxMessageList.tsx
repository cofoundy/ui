"use client";

import { useEffect, useRef, useMemo } from "react";
import { InboxMessage } from "./InboxMessage";
import { useAutoScroll } from "../../../hooks/useAutoScroll";
import { cn } from "../../../utils/cn";
import { Spinner } from "../../ui/spinner";
import type { UniversalMessage } from "../../../types/message";

interface DateGroup {
  date: Date;
  messages: UniversalMessage[];
}

/**
 * Groups messages by date for display with date separators.
 */
function groupMessagesByDate(messages: UniversalMessage[]): DateGroup[] {
  const groups: DateGroup[] = [];
  let currentDate: string | null = null;
  let currentGroup: UniversalMessage[] = [];

  for (const message of messages) {
    const messageDate = new Date(message.timestamp).toDateString();

    if (messageDate !== currentDate) {
      // Save current group if not empty
      if (currentGroup.length > 0 && currentDate) {
        groups.push({
          date: new Date(currentDate),
          messages: currentGroup,
        });
      }
      // Start new group
      currentDate = messageDate;
      currentGroup = [message];
    } else {
      currentGroup.push(message);
    }
  }

  // Save last group
  if (currentGroup.length > 0 && currentDate) {
    groups.push({
      date: new Date(currentDate),
      messages: currentGroup,
    });
  }

  return groups;
}

/**
 * Formats a date for the date separator.
 */
function formatDateSeparator(date: Date): string {
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const isYesterday =
    new Date(now.getTime() - 86400000).toDateString() === date.toDateString();

  if (isToday) return "Today";
  if (isYesterday) return "Yesterday";

  return date.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export interface InboxMessageListProps {
  messages: UniversalMessage[];
  loading?: boolean;
  emptyMessage?: string;
  showAvatar?: boolean;
  className?: string;
}

/**
 * Message list component for agent inbox with date grouping.
 */
export function InboxMessageList({
  messages,
  loading = false,
  emptyMessage = "No messages yet",
  showAvatar = true,
  className,
}: InboxMessageListProps) {
  const { containerRef, scrollToBottom, isUserScrollLocked, handleScroll } =
    useAutoScroll();
  const lastMessageCountRef = useRef(messages.length);

  // Group messages by date
  const groupedMessages = useMemo(
    () => groupMessagesByDate(messages),
    [messages]
  );

  // Auto-scroll when new messages arrive
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

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className={cn(
        "flex-1 min-h-0 overflow-y-auto p-4 space-y-4",
        "chat-scrollbar",
        className
      )}
    >
      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center h-32">
          <Spinner size="default" />
        </div>
      )}

      {/* Empty state */}
      {!loading && messages.length === 0 && (
        <div className="h-full flex items-center justify-center text-[var(--chat-muted)] text-sm">
          {emptyMessage}
        </div>
      )}

      {/* Messages grouped by date */}
      {!loading &&
        groupedMessages.map((group) => (
          <div key={group.date.toISOString()} className="space-y-4">
            {/* Date separator */}
            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-[var(--chat-border)]" />
              <span className="text-xs text-[var(--chat-muted)] font-medium">
                {formatDateSeparator(group.date)}
              </span>
              <div className="flex-1 h-px bg-[var(--chat-border)]" />
            </div>

            {/* Messages for this date */}
            {group.messages.map((message) => (
              <InboxMessage key={message.id} message={message} showAvatar={showAvatar} />
            ))}
          </div>
        ))}
    </div>
  );
}
