"use client";

import { User, Bot, Sparkles, Headphones } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "../../ui/avatar";
import { cn } from "../../../utils/cn";
import { getInitials } from "../../../utils/string";
import type { MessageSender, MessageDirection } from "../../../types/message";
import type { ChannelType } from "../../../utils/channel";

interface MessageAvatarProps {
  sender?: MessageSender;
  direction: MessageDirection;
  channel?: ChannelType;
  showChannelBadge?: boolean;
  className?: string;
}

function getSenderIcon(type: MessageSender["type"]) {
  switch (type) {
    case "ai":
      return Sparkles;
    case "agent":
      return Headphones;
    case "system":
      return Bot;
    case "customer":
    default:
      return User;
  }
}

function getAvatarColors(
  direction: MessageDirection,
  senderType?: MessageSender["type"]
) {
  if (direction === "outbound") {
    if (senderType === "ai") {
      return {
        bg: "bg-[#a855f7]/20",
        text: "text-[#c084fc]",
      };
    }
    return {
      bg: "bg-[var(--chat-primary)]/20",
      text: "text-[var(--chat-primary)]",
    };
  }

  return {
    bg: "bg-[var(--chat-card-hover)]",
    text: "text-[var(--chat-foreground)]",
  };
}

/**
 * Message avatar with sender info and optional channel badge.
 */
export function MessageAvatar({
  sender,
  direction,
  channel,
  showChannelBadge = false,
  className,
}: MessageAvatarProps) {
  const colors = getAvatarColors(direction, sender?.type);
  const Icon = sender?.type ? getSenderIcon(sender.type) : User;
  const initials = sender?.name ? getInitials(sender.name) : null;

  return (
    <div className={cn("relative flex-shrink-0 self-end", className)}>
      <Avatar
        className={cn(
          "w-8 h-8",
          colors.bg,
          "hidden sm:flex" // Hide on very small screens
        )}
      >
        {sender?.avatar ? (
          <AvatarImage src={sender.avatar} alt={sender.name} />
        ) : null}
        <AvatarFallback className={cn(colors.bg, colors.text)}>
          {initials ? (
            <span className="text-xs font-medium">{initials}</span>
          ) : (
            <Icon className="w-4 h-4" />
          )}
        </AvatarFallback>
      </Avatar>

      {/* Channel badge overlay */}
      {showChannelBadge && channel && (
        <span
          className={cn(
            "absolute -bottom-1 -right-1",
            "w-4 h-4 rounded-full",
            "flex items-center justify-center",
            "text-[8px] font-bold",
            "bg-[var(--chat-background)] border border-[var(--chat-border)]",
            "text-[var(--chat-muted)]"
          )}
        >
          {channel.charAt(0).toUpperCase()}
        </span>
      )}
    </div>
  );
}
