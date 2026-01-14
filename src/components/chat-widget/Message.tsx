"use client";

import { memo, useMemo } from "react";
import { cn } from "../../utils/cn";
import type { Message as MessageType } from "../../types";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { User, Bot } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MessageProps {
  message: MessageType;
}

/**
 * Message component with memoization for streaming performance.
 * Only re-renders when message content or id changes.
 */
export const Message = memo(
  function Message({ message }: MessageProps) {
    const isUser = message.role === "user";

    // Memoize formatted time to avoid recalculation on every render
    const formattedTime = useMemo(() => {
      return new Date(message.timestamp).toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }, [message.timestamp]);

    return (
      <div
        className={cn(
          "flex gap-2 cf-animate-fade-in",
          isUser ? "flex-row-reverse" : "flex-row"
        )}
      >
        {/* Avatar - hidden on very small screens */}
        <Avatar
          className={cn(
            "w-8 h-8 shrink-0 hidden sm:flex",
            isUser ? "bg-[var(--chat-primary)]" : "bg-[var(--chat-card-hover)]"
          )}
        >
          <AvatarFallback
            className={cn(
              isUser
                ? "bg-[var(--chat-primary)] text-[var(--primary-foreground)]"
                : "bg-[var(--chat-card-hover)] text-[var(--chat-foreground)]"
            )}
          >
            {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
          </AvatarFallback>
        </Avatar>

        {/* Message content */}
        <div
          className={cn(
            "max-w-[85%] sm:max-w-[80%] rounded-2xl px-3 py-2 sm:px-4 sm:py-3",
            isUser
              ? "chat-gradient-primary text-[var(--primary-foreground)] rounded-tr-sm"
              : "bg-[var(--chat-card-hover)] text-[var(--chat-foreground)] rounded-tl-sm"
          )}
        >
          <div className="prose prose-sm max-w-none text-inherit">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                p: ({ children }) => (
                  <p className="mb-2 last:mb-0">{children}</p>
                ),
                a: ({ href, children }) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--chat-primary)] underline hover:opacity-80"
                  >
                    {children}
                  </a>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc list-inside mb-2">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal list-inside mb-2">{children}</ol>
                ),
                strong: ({ children }) => (
                  <strong className="font-semibold">{children}</strong>
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
          <span className="text-[10px] opacity-50 mt-1 block">
            {formattedTime}
          </span>
        </div>
      </div>
    );
  },
  // Custom comparison: only re-render if content or id changes
  (prevProps, nextProps) => {
    return (
      prevProps.message.id === nextProps.message.id &&
      prevProps.message.content === nextProps.message.content
    );
  }
);
