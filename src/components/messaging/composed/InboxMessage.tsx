"use client";

import { memo } from "react";
import { MessageContainer } from "../primitives/MessageContainer";
import { MessageBubble } from "../primitives/MessageBubble";
import { MessageAvatar } from "../primitives/MessageAvatar";
import { MessageContent } from "../primitives/MessageContent";
import { MessageTimestamp } from "../primitives/MessageTimestamp";
import { MessageStatus } from "../primitives/MessageStatus";
import { MessageMedia } from "../primitives/MessageMedia";
import { AIBadge } from "../indicators/AIBadge";
import { cn } from "../../../utils/cn";
import type { UniversalMessage } from "../../../types/message";

export interface InboxMessageProps {
  message: UniversalMessage;
  showAvatar?: boolean;
  showDeliveryStatus?: boolean;
  className?: string;
}

/**
 * Full-featured message component for agent inbox dashboards.
 * Displays delivery status, AI badge, media attachments, and more.
 */
export const InboxMessage = memo(
  function InboxMessage({
    message,
    showAvatar = true,
    showDeliveryStatus = true,
    className,
  }: InboxMessageProps) {
    const isOutbound = message.direction === "outbound";
    const isAI = message.aiGenerated;

    return (
      <MessageContainer direction={message.direction} className={className}>
        {/* Avatar */}
        {showAvatar && (
          <MessageAvatar
            sender={message.sender}
            direction={message.direction}
            channel={message.channel}
            showChannelBadge={!isOutbound}
          />
        )}

        {/* Message content wrapper */}
        <div className={cn("max-w-[70%] group")}>
          {/* Bubble */}
          <MessageBubble
            variant="inbox"
            direction={message.direction}
            aiGenerated={isAI}
          >
            {/* AI indicator */}
            {isAI && isOutbound && (
              <div className="mb-1">
                <AIBadge variant="full" />
              </div>
            )}

            {/* Content */}
            <MessageContent
              content={message.content}
              format={message.contentType}
            />

            {/* Media attachments */}
            {message.media && message.media.length > 0 && (
              <div className="mt-2">
                <MessageMedia media={message.media} variant="list" />
              </div>
            )}
          </MessageBubble>

          {/* Footer: timestamp and status */}
          <div
            className={cn(
              "flex items-center gap-1 mt-1 text-xs text-[var(--chat-muted)]",
              isOutbound ? "justify-end" : "justify-start"
            )}
          >
            <MessageTimestamp timestamp={message.timestamp} format="time" />
            {showDeliveryStatus && isOutbound && message.deliveryStatus && (
              <MessageStatus status={message.deliveryStatus} />
            )}
          </div>
        </div>
      </MessageContainer>
    );
  },
  // Custom comparison for memoization
  (prevProps, nextProps) => {
    return (
      prevProps.message.id === nextProps.message.id &&
      prevProps.message.content === nextProps.message.content &&
      prevProps.message.deliveryStatus === nextProps.message.deliveryStatus
    );
  }
);
