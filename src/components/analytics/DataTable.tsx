"use client";

import { cn } from "../../utils/cn";

type ColumnFormat = "number" | "duration" | "percentage" | "text";

export interface DataTableColumn {
  key: string;
  label: string;
  align?: "left" | "right" | "center";
  format?: ColumnFormat;
}

export interface DataTableProps {
  columns: DataTableColumn[];
  rows: Record<string, unknown>[];
  emptyText?: string;
  highlight?: "best" | "none";
  className?: string;
}

function formatCell(value: unknown, format: ColumnFormat): string {
  const num = Number(value);
  switch (format) {
    case "duration": {
      if (num >= 3600) {
        const h = Math.floor(num / 3600);
        const m = Math.floor((num % 3600) / 60);
        return `${h}h ${String(m).padStart(2, "0")}m`;
      }
      const m = Math.floor(num / 60);
      const s = num % 60;
      return `${m}m ${String(s).padStart(2, "0")}s`;
    }
    case "percentage":
      return `${num}%`;
    case "number":
      return num.toLocaleString();
    case "text":
    default:
      return String(value ?? "");
  }
}

function findBestValues(
  columns: DataTableColumn[],
  rows: Record<string, unknown>[]
): Record<string, number> {
  const best: Record<string, number> = {};
  for (const col of columns) {
    if (col.format === "text" || !col.format) continue;
    let bestVal: number | null = null;
    let bestIdx = -1;
    for (let i = 0; i < rows.length; i++) {
      const val = Number(rows[i][col.key]);
      if (isNaN(val)) continue;
      // For duration, lower is better; for others, higher is better
      const isBetter =
        col.format === "duration"
          ? bestVal === null || val < bestVal
          : bestVal === null || val > bestVal;
      if (isBetter) {
        bestVal = val;
        bestIdx = i;
      }
    }
    if (bestIdx >= 0) best[col.key] = bestIdx;
  }
  return best;
}

export function DataTable({
  columns,
  rows,
  emptyText = "Sin datos",
  highlight = "none",
  className,
}: DataTableProps) {
  const bestValues = highlight === "best" ? findBestValues(columns, rows) : {};

  if (rows.length === 0) {
    return (
      <div
        data-slot="data-table"
        className={cn(
          "flex items-center justify-center py-8 bg-[var(--chat-card)] border border-[var(--chat-border)] rounded-xl",
          className
        )}
      >
        <span className="text-sm font-sans text-[var(--chat-muted)]">
          {emptyText}
        </span>
      </div>
    );
  }

  return (
    <div
      data-slot="data-table"
      className={cn(
        "overflow-x-auto bg-[var(--chat-card)] border border-[var(--chat-border)] rounded-xl",
        className
      )}
    >
      <table className="w-full">
        <thead>
          <tr className="border-b border-[var(--chat-border)]">
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  "px-4 py-2.5 text-[10px] font-mono font-medium uppercase tracking-wider text-[var(--chat-muted)]",
                  col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : "text-left"
                )}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIdx) => (
            <tr
              key={rowIdx}
              className={cn(
                rowIdx % 2 === 1 && "bg-[var(--chat-card)]",
                rowIdx % 2 === 0 && "bg-transparent"
              )}
            >
              {columns.map((col) => {
                const format = col.format ?? "text";
                const isNumeric = format !== "text";
                const isBest =
                  highlight === "best" && bestValues[col.key] === rowIdx;

                return (
                  <td
                    key={col.key}
                    className={cn(
                      "px-4 py-2.5 text-sm",
                      isNumeric ? "font-mono" : "font-sans",
                      col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : "text-left",
                      isBest
                        ? "text-[var(--chat-success)] font-semibold"
                        : "text-[var(--chat-foreground)]"
                    )}
                  >
                    {formatCell(row[col.key], format)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
