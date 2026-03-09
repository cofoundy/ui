"use client";

import type { ReactNode } from "react";
import { cn } from "../../utils/cn";

type LeaderboardFormat = "number" | "duration" | "percentage";

export interface LeaderboardItem {
  name: string;
  score: number;
  avatar?: ReactNode;
  subtitle?: string;
}

export interface LeaderboardProps {
  items: LeaderboardItem[];
  metric?: string;
  format?: LeaderboardFormat;
  showBars?: boolean;
  podiumStyle?: boolean;
  className?: string;
}

function formatScore(value: number, format: LeaderboardFormat): string {
  switch (format) {
    case "duration": {
      if (value >= 3600) {
        const h = Math.floor(value / 3600);
        const m = Math.floor((value % 3600) / 60);
        return `${h}h ${String(m).padStart(2, "0")}m`;
      }
      const m = Math.floor(value / 60);
      const s = value % 60;
      return `${m}m ${String(s).padStart(2, "0")}s`;
    }
    case "percentage":
      return `${value}%`;
    case "number":
    default:
      return value.toLocaleString();
  }
}

const rankColors = [
  "var(--chat-warning)",   // #1 gold
  "var(--chat-muted)",     // #2 silver
  "#CD7F32",               // #3 bronze
];

export function Leaderboard({
  items,
  metric,
  format = "number",
  showBars = true,
  podiumStyle = true,
  className,
}: LeaderboardProps) {
  const maxScore = Math.max(...items.map((i) => i.score), 1);

  return (
    <div data-slot="leaderboard" className={cn("flex flex-col gap-1", className)}>
      {metric && (
        <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--chat-muted)] mb-1">
          {metric}
        </span>
      )}
      {items.map((item, i) => {
        const rank = i + 1;
        const barPct = (item.score / maxScore) * 100;
        const isPodium = podiumStyle && rank <= 3;

        return (
          <div
            key={i}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
              isPodium
                ? "bg-[var(--chat-card)]"
                : "hover:bg-[var(--chat-card)]"
            )}
          >
            {/* Rank */}
            <span
              className={cn(
                "w-6 text-center font-mono text-sm font-semibold shrink-0",
                isPodium
                  ? "text-[var(--chat-foreground)]"
                  : "text-[var(--chat-muted)]"
              )}
              style={isPodium ? { color: rankColors[i] } : undefined}
            >
              {rank}
            </span>

            {/* Avatar */}
            {item.avatar && (
              <span className="shrink-0 [&>*]:size-7 [&>svg]:size-5">
                {item.avatar}
              </span>
            )}

            {/* Name + subtitle */}
            <div className="flex flex-col flex-1 min-w-0">
              <span className="text-sm font-sans text-[var(--chat-foreground)] truncate">
                {item.name}
              </span>
              {item.subtitle && (
                <span className="text-[10px] font-sans text-[var(--chat-muted)]">
                  {item.subtitle}
                </span>
              )}
            </div>

            {/* Bar + score */}
            <div className="flex items-center gap-2 shrink-0">
              {showBars && (
                <div className="w-20 h-1.5 rounded-full overflow-hidden bg-[var(--chat-border)]">
                  <div
                    className="h-full rounded-full transition-[width]"
                    style={{
                      width: `${barPct}%`,
                      backgroundColor: isPodium
                        ? rankColors[i] ?? "var(--chat-primary)"
                        : "var(--chat-primary)",
                      transition: `width var(--cf-duration-smooth) var(--cf-ease-default)`,
                    }}
                  />
                </div>
              )}
              <span className="font-mono text-sm text-[var(--chat-foreground)] w-14 text-right">
                {formatScore(item.score, format)}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
