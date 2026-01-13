"use client";

import { useState, FormEvent, KeyboardEvent } from "react";
import { cn } from "../../utils/cn";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Send } from "lucide-react";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({
  onSendMessage,
  disabled = false,
  placeholder = "Escribe tu mensaje...",
}: ChatInputProps) {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage("");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-3 sm:p-4 border-t border-[var(--chat-border)]">
      <div className="flex gap-2">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            "flex-1 bg-[var(--chat-input-bg)] border-[var(--chat-border)]",
            "text-[var(--chat-foreground)]",
            "focus:border-[var(--chat-primary)]/50 focus:ring-[var(--chat-primary)]/20",
            "placeholder:text-[var(--chat-muted)]"
          )}
        />
        <Button
          type="submit"
          disabled={disabled || !message.trim()}
          className={cn(
            "chat-gradient-primary",
            "hover:opacity-90 transition-opacity",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </form>
  );
}
