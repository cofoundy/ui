"use client";

import { cn } from "../../utils/cn";
import { Button } from "../ui/button";
import type { QuickAction } from "../../types";

interface QuickActionsProps {
  onSelectAction: (message: string) => void;
  actions: QuickAction[];
  className?: string;
  label?: string;
}

export function QuickActions({
  onSelectAction,
  actions,
  className,
  label = "O selecciona una opción:",
}: QuickActionsProps) {
  if (actions.length === 0) return null;

  return (
    <div className={cn("px-4 pb-4", className)}>
      <p className="text-xs text-[var(--chat-muted)] mb-2 text-center">{label}</p>
      <div className="flex flex-wrap gap-2 justify-center">
        {actions.map((action) => (
          <Button
            key={action.id}
            variant="outline"
            size="sm"
            onClick={() => onSelectAction(action.message)}
            className={cn(
              "chat-glass-button",
              "text-xs",
              "hover:scale-105 transition-transform"
            )}
          >
            {action.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
