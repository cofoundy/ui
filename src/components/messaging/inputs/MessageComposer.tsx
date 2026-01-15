"use client";

import {
  useState,
  useRef,
  useCallback,
  type FormEvent,
  type KeyboardEvent,
  type ChangeEvent,
  type ReactNode,
} from "react";
import { Send, Paperclip, Smile } from "lucide-react";
import { Button } from "../../ui/button";
import { cn } from "../../../utils/cn";

export interface QuickAction {
  id: string;
  label: string;
  icon?: ReactNode;
  onClick: () => void;
}

export interface MessageComposerProps {
  /** Called when user sends a message */
  onSend: (message: string) => void;
  /** Called when user selects files to attach */
  onAttach?: (files: FileList) => void;
  /** Quick action buttons to display */
  quickActions?: QuickAction[];
  /** Placeholder text */
  placeholder?: string;
  /** Disable the input */
  disabled?: boolean;
  /** Maximum height for textarea in pixels */
  maxHeight?: number;
  /** Show emoji button (placeholder) */
  showEmoji?: boolean;
  /** Show attachment button */
  showAttachment?: boolean;
  className?: string;
}

/**
 * Full-featured message composer for agent inbox.
 * Includes auto-resizing textarea, attachments, and quick actions.
 */
export function MessageComposer({
  onSend,
  onAttach,
  quickActions,
  placeholder = "Type a message...",
  disabled = false,
  maxHeight = 120,
  showEmoji = false,
  showAttachment = true,
  className,
}: MessageComposerProps) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-resize textarea
  const handleInput = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      const textarea = e.target;
      setMessage(textarea.value);

      // Reset height to auto to get correct scrollHeight
      textarea.style.height = "auto";
      // Set new height, capped at maxHeight
      const newHeight = Math.min(textarea.scrollHeight, maxHeight);
      textarea.style.height = `${newHeight}px`;
    },
    [maxHeight]
  );

  // Handle send
  const handleSubmit = useCallback(
    (e?: FormEvent) => {
      e?.preventDefault();
      if (message.trim() && !disabled) {
        onSend(message.trim());
        setMessage("");
        // Reset textarea height
        if (textareaRef.current) {
          textareaRef.current.style.height = "auto";
        }
      }
    },
    [message, disabled, onSend]
  );

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      // Enter to send, Shift+Enter for newline
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  // Handle file selection
  const handleFileSelect = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0 && onAttach) {
        onAttach(e.target.files);
        // Reset input
        e.target.value = "";
      }
    },
    [onAttach]
  );

  // Open file picker
  const handleAttachClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <div className={cn("border-t border-[var(--chat-border)]", className)}>
      {/* Quick actions */}
      {quickActions && quickActions.length > 0 && (
        <div className="flex items-center gap-2 px-4 py-2 border-b border-[var(--chat-border)]">
          {quickActions.map((action) => (
            <button
              key={action.id}
              onClick={action.onClick}
              disabled={disabled}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full",
                "text-xs font-medium",
                "bg-[var(--chat-card-hover)] text-[var(--chat-muted)]",
                "hover:bg-[var(--chat-border)] hover:text-[var(--chat-foreground)]",
                "transition-colors",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {action.icon}
              {action.label}
            </button>
          ))}
        </div>
      )}

      {/* Input area */}
      <form onSubmit={handleSubmit} className="p-3 sm:p-4">
        <div className="flex items-end gap-2">
          {/* Attachment button */}
          {showAttachment && onAttach && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleFileSelect}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleAttachClick}
                disabled={disabled}
                className="shrink-0 text-[var(--chat-muted)] hover:text-[var(--chat-foreground)]"
              >
                <Paperclip className="w-5 h-5" />
              </Button>
            </>
          )}

          {/* Textarea */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled}
              rows={1}
              className={cn(
                "w-full resize-none",
                "px-4 py-2.5 rounded-2xl",
                "bg-[var(--chat-input-bg,var(--chat-card-hover))] text-[var(--chat-foreground)]",
                "border border-[var(--chat-border)]",
                "placeholder:text-[var(--chat-muted)]",
                "focus:outline-none focus:ring-2 focus:ring-[var(--chat-primary)]/50 focus:border-[var(--chat-primary)]/50",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "transition-all duration-200"
              )}
              style={{ maxHeight: `${maxHeight}px` }}
            />
          </div>

          {/* Emoji button (placeholder) */}
          {showEmoji && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={disabled}
              className="shrink-0 text-[var(--chat-muted)] hover:text-[var(--chat-foreground)]"
            >
              <Smile className="w-5 h-5" />
            </Button>
          )}

          {/* Send button */}
          <Button
            type="submit"
            disabled={disabled || !message.trim()}
            className={cn(
              "shrink-0",
              "bg-[var(--chat-primary)] hover:bg-[var(--chat-primary)]/90",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
