"use client";

import { FileText, Image as ImageIcon, Film, Music } from "lucide-react";
import { cn } from "../../../utils/cn";
import type { MediaAttachment, MediaType } from "../../../types/message";

interface MessageMediaProps {
  media: MediaAttachment[];
  variant?: "grid" | "list";
  className?: string;
}

function getMediaIcon(type: MediaType) {
  switch (type) {
    case "image":
      return ImageIcon;
    case "video":
      return Film;
    case "audio":
      return Music;
    case "document":
    default:
      return FileText;
  }
}

function MediaItem({ item, variant }: { item: MediaAttachment; variant: "grid" | "list" }) {
  const Icon = getMediaIcon(item.type);

  // Image preview
  if (item.type === "image") {
    return (
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "block rounded-lg overflow-hidden",
          "hover:opacity-90 transition-opacity",
          variant === "grid" ? "aspect-square" : "max-w-[200px]"
        )}
      >
        <img
          src={item.thumbnailUrl || item.url}
          alt={item.filename || "Image"}
          className="w-full h-full object-cover"
        />
      </a>
    );
  }

  // Video preview
  if (item.type === "video") {
    return (
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "flex items-center gap-2 p-2 rounded-lg",
          "bg-[var(--chat-card-hover)] hover:bg-[var(--chat-border)] transition-colors"
        )}
      >
        <div className="w-10 h-10 rounded bg-[var(--chat-primary)]/20 flex items-center justify-center">
          <Icon className="w-5 h-5 text-[var(--chat-primary)]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{item.filename || "Video"}</p>
          <p className="text-xs text-[var(--chat-muted)]">Video</p>
        </div>
      </a>
    );
  }

  // Audio preview
  if (item.type === "audio") {
    return (
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "flex items-center gap-2 p-2 rounded-lg",
          "bg-[var(--chat-card-hover)] hover:bg-[var(--chat-border)] transition-colors"
        )}
      >
        <div className="w-10 h-10 rounded bg-[var(--chat-primary)]/20 flex items-center justify-center">
          <Icon className="w-5 h-5 text-[var(--chat-primary)]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{item.filename || "Audio"}</p>
          <p className="text-xs text-[var(--chat-muted)]">Audio</p>
        </div>
      </a>
    );
  }

  // Document/file preview
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "flex items-center gap-2 p-2 rounded-lg",
        "bg-[var(--chat-card-hover)] hover:bg-[var(--chat-border)] transition-colors"
      )}
    >
      <div className="w-10 h-10 rounded bg-[var(--chat-primary)]/20 flex items-center justify-center">
        <Icon className="w-5 h-5 text-[var(--chat-primary)]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{item.filename || "Document"}</p>
        <p className="text-xs text-[var(--chat-muted)]">
          {item.mimeType || "File"}
        </p>
      </div>
    </a>
  );
}

/**
 * Media attachment display for messages.
 * Supports images, videos, audio, and documents.
 */
export function MessageMedia({
  media,
  variant = "list",
  className,
}: MessageMediaProps) {
  if (!media || media.length === 0) return null;

  // Grid layout for multiple images
  const images = media.filter((m) => m.type === "image");
  const others = media.filter((m) => m.type !== "image");

  return (
    <div className={cn("space-y-2", className)}>
      {/* Image grid */}
      {images.length > 0 && variant === "grid" && (
        <div
          className={cn(
            "grid gap-1",
            images.length === 1 && "grid-cols-1",
            images.length === 2 && "grid-cols-2",
            images.length >= 3 && "grid-cols-3"
          )}
        >
          {images.map((item, index) => (
            <MediaItem key={index} item={item} variant="grid" />
          ))}
        </div>
      )}

      {/* List layout for images */}
      {images.length > 0 && variant === "list" && (
        <div className="space-y-1">
          {images.map((item, index) => (
            <MediaItem key={index} item={item} variant="list" />
          ))}
        </div>
      )}

      {/* Other media types */}
      {others.length > 0 && (
        <div className="space-y-1">
          {others.map((item, index) => (
            <MediaItem key={index} item={item} variant="list" />
          ))}
        </div>
      )}
    </div>
  );
}
