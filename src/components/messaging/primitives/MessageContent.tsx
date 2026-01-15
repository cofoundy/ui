"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "../../../utils/cn";
import type { ContentFormat } from "../../../types/message";

interface MessageContentProps {
  content: string;
  format?: ContentFormat;
  className?: string;
}

/**
 * Message content renderer supporting plain text and markdown.
 */
export function MessageContent({
  content,
  format = "text",
  className,
}: MessageContentProps) {
  if (format === "markdown") {
    return (
      <div className={cn("prose prose-sm max-w-none text-inherit", className)}>
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
            code: ({ children }) => (
              <code className="bg-[var(--chat-muted)]/20 px-1 py-0.5 rounded text-[0.9em]">
                {children}
              </code>
            ),
            pre: ({ children }) => (
              <pre className="bg-[var(--chat-muted)]/20 p-2 rounded overflow-x-auto mb-2">
                {children}
              </pre>
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    );
  }

  // Plain text with whitespace preservation
  return (
    <p className={cn("text-sm whitespace-pre-wrap", className)}>{content}</p>
  );
}
