"use client";

import {
  useState,
  useRef,
  useCallback,
  type FormEvent,
  type KeyboardEvent,
  type ChangeEvent,
  type ClipboardEvent,
  type ReactNode,
} from "react";
import { Send, Paperclip, Smile } from "lucide-react";
import { cn } from "../../../utils/cn";

/* ─── Types ─── */

export interface ComposerMode {
  id: string;
  label: string;
  icon?: ReactNode;
  /** CSS color class for active tab accent, e.g. "text-amber-400 border-amber-400" */
  activeClass?: string;
  /** Placeholder override when this mode is active */
  placeholder?: string;
  /** Send button label override, e.g. "Añadir nota" */
  sendLabel?: string;
}

export interface ComposerToolbarItem {
  id: string;
  icon: ReactNode;
  /** Tooltip / aria-label */
  label: string;
  onClick: () => void;
  /** Hide this item in certain modes */
  hideInModes?: string[];
}

/** @deprecated Use ComposerMode + ComposerToolbarItem instead */
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
  /** Called when user pastes files (e.g. images from clipboard) */
  onPaste?: (files: File[]) => void;

  /* ─── Mode tabs (Reply vs Note) ─── */
  /** Define modes to show tabs. If omitted, no tabs are shown. */
  modes?: ComposerMode[];
  /** Currently active mode id */
  activeMode?: string;
  /** Called when user switches mode */
  onModeChange?: (modeId: string) => void;

  /* ─── Toolbar ─── */
  /** Extra toolbar items (emoji picker, template picker, etc.) rendered before attach */
  toolbarItems?: ComposerToolbarItem[];

  /* ─── Basics ─── */
  placeholder?: string;
  disabled?: boolean;
  /** Maximum height for textarea in pixels */
  maxHeight?: number;
  /** Show the built-in attachment button */
  showAttachment?: boolean;
  /** Show the built-in emoji button (icon only, no picker) */
  showEmoji?: boolean;
  /** Custom send button label */
  sendLabel?: string;

  /** Custom ReactNode injected at the start of the toolbar (e.g. an emoji picker with its own popover) */
  toolbarLeading?: ReactNode;

  /** @deprecated Use modes + toolbarItems instead */
  quickActions?: QuickAction[];

  className?: string;
}

/**
 * Agent inbox message composer following Intercom/Front patterns:
 * - Optional mode tabs (Reply | Note) at top
 * - Auto-resizing textarea
 * - Bottom toolbar inside the input border (leading icons + send button)
 * - Single unified visual block
 */
export function MessageComposer({
  onSend,
  onAttach,
  onPaste,
  modes,
  activeMode,
  onModeChange,
  toolbarItems,
  placeholder = "Type a message...",
  disabled = false,
  maxHeight = 120,
  showAttachment = true,
  showEmoji = false,
  toolbarLeading,
  sendLabel,
  quickActions,
  className,
}: MessageComposerProps) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Resolve active mode config
  const currentMode = modes?.find((m) => m.id === activeMode);
  const resolvedPlaceholder = currentMode?.placeholder ?? placeholder;
  const resolvedSendLabel = currentMode?.sendLabel ?? sendLabel;

  // Filter toolbar items by current mode
  const visibleToolbarItems = toolbarItems?.filter(
    (item) => !item.hideInModes || !activeMode || !item.hideInModes.includes(activeMode)
  );

  // Should hide attach in current mode?
  const showAttachInMode = showAttachment && onAttach;

  // Auto-resize textarea
  const handleInput = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      const textarea = e.target;
      setMessage(textarea.value);
      textarea.style.height = "auto";
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
        if (textareaRef.current) {
          textareaRef.current.style.height = "auto";
        }
      }
    },
    [message, disabled, onSend]
  );

  // Enter to send, Shift+Enter for newline
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  // File selection
  const handleFileSelect = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0 && onAttach) {
        onAttach(e.target.files);
        e.target.value = "";
      }
    },
    [onAttach]
  );

  // Paste handler
  const handlePaste = useCallback(
    (e: ClipboardEvent<HTMLTextAreaElement>) => {
      if (!onPaste) return;
      const items = e.clipboardData?.items;
      if (!items) return;
      const files: File[] = [];
      for (const item of Array.from(items)) {
        if (item.kind === "file") {
          const file = item.getAsFile();
          if (file) files.push(file);
        }
      }
      if (files.length > 0) {
        e.preventDefault();
        onPaste(files);
      }
    },
    [onPaste]
  );

  const handleAttachClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // Determine accent styling for note-like modes
  const isAccented = currentMode?.activeClass;

  return (
    <div className={cn("flex flex-col", className)}>
      {/* ─── Mode tabs ─── */}
      {modes && modes.length > 1 && (
        <div className="flex items-center gap-1 px-3 pt-3 pb-0">
          {modes.map((mode) => {
            const isActive = mode.id === activeMode;
            return (
              <button
                key={mode.id}
                type="button"
                onClick={() => onModeChange?.(mode.id)}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-t-lg border-b-2 transition-colors",
                  isActive
                    ? mode.activeClass ?? "text-[var(--chat-primary)] border-[var(--chat-primary)]"
                    : "text-[var(--chat-muted)] border-transparent hover:text-[var(--chat-foreground)] hover:border-[var(--chat-border)]"
                )}
              >
                {mode.icon}
                {mode.label}
              </button>
            );
          })}
        </div>
      )}

      {/* ─── Unified input container ─── */}
      <div
        className={cn(
          "mx-3 mb-3 mt-2 rounded-xl border transition-colors",
          isAccented
            ? "border-amber-500/40 bg-amber-500/5"
            : "border-[var(--chat-border)] bg-[var(--chat-input-bg,var(--chat-card-hover))]"
        )}
      >
        {/* Textarea */}
        <form onSubmit={handleSubmit}>
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder={resolvedPlaceholder}
            disabled={disabled}
            rows={1}
            className={cn(
              "w-full resize-none bg-transparent",
              "px-3.5 pt-3 pb-1.5",
              "text-[var(--chat-foreground)] text-sm",
              "placeholder:text-[var(--chat-muted)]",
              "focus:outline-none",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
            style={{ maxHeight: `${maxHeight}px` }}
          />

          {/* ─── Bottom toolbar ─── */}
          <div className="flex items-center gap-0.5 px-2 pb-2">
            {/* Custom leading content (e.g. emoji picker with popover) */}
            {toolbarLeading}

            {/* Leading: attach, emoji, custom toolbar items */}
            {showAttachInMode && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileSelect}
                />
                <button
                  type="button"
                  onClick={handleAttachClick}
                  disabled={disabled}
                  className="p-1.5 rounded-lg text-[var(--chat-muted)] hover:text-[var(--chat-foreground)] hover:bg-[var(--chat-border)]/50 transition-colors disabled:opacity-50"
                  title="Adjuntar archivo"
                >
                  <Paperclip className="w-[18px] h-[18px]" />
                </button>
              </>
            )}

            {showEmoji && (
              <button
                type="button"
                disabled={disabled}
                className="p-1.5 rounded-lg text-[var(--chat-muted)] hover:text-[var(--chat-foreground)] hover:bg-[var(--chat-border)]/50 transition-colors disabled:opacity-50"
                title="Emojis"
              >
                <Smile className="w-[18px] h-[18px]" />
              </button>
            )}

            {visibleToolbarItems?.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={item.onClick}
                disabled={disabled}
                className="p-1.5 rounded-lg text-[var(--chat-muted)] hover:text-[var(--chat-foreground)] hover:bg-[var(--chat-border)]/50 transition-colors disabled:opacity-50"
                title={item.label}
              >
                {item.icon}
              </button>
            ))}

            {/* Spacer */}
            <div className="flex-1" />

            {/* Send button */}
            <button
              type="submit"
              disabled={disabled || !message.trim()}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                "disabled:opacity-30 disabled:cursor-not-allowed",
                isAccented
                  ? "bg-amber-500 hover:bg-amber-600 text-black"
                  : "bg-[var(--chat-primary)] hover:bg-[var(--chat-primary)]/80 text-white"
              )}
            >
              <Send className="w-3.5 h-3.5" />
              {resolvedSendLabel && (
                <span className="hidden sm:inline">{resolvedSendLabel}</span>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* ─── Legacy quick actions (deprecated) ─── */}
      {quickActions && quickActions.length > 0 && (
        <div className="flex items-center gap-2 px-4 pb-3">
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
    </div>
  );
}
