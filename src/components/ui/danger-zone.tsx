import * as React from "react";
import { AlertTriangle } from "lucide-react";

import { cn } from "../../utils/cn";
import { Button } from "./button";
import { Input } from "./input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "./dialog";

/* ─── DangerZone Container ─── */

interface DangerZoneProps {
  children: React.ReactNode;
  className?: string;
}

function DangerZone({ children, className }: DangerZoneProps) {
  return (
    <div className={cn("space-y-0 rounded-lg border border-[var(--destructive)]/30 overflow-hidden", className)}>
      {children}
    </div>
  );
}

/* ─── DangerZoneItem ─── */

interface DangerZoneItemProps {
  title: string;
  description: string;
  buttonLabel: string;
  onAction: () => void;
  variant?: "outline" | "solid";
  disabled?: boolean;
  className?: string;
}

function DangerZoneItem({
  title,
  description,
  buttonLabel,
  onAction,
  variant = "outline",
  disabled = false,
  className,
}: DangerZoneItemProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 p-4 border-b border-[var(--destructive)]/20 last:border-b-0",
        className
      )}
    >
      <div className="space-y-1 min-w-0">
        <p className="text-sm font-medium text-[var(--foreground)]">{title}</p>
        <p className="text-sm text-[var(--muted-foreground)]">{description}</p>
      </div>
      <Button
        variant={variant === "solid" ? "destructive" : "outline"}
        size="sm"
        onClick={onAction}
        disabled={disabled}
        className={cn(
          "shrink-0",
          variant === "outline" &&
            "border-[var(--destructive)]/50 text-[var(--destructive)] hover:bg-[var(--destructive)] hover:text-white"
        )}
      >
        {buttonLabel}
      </Button>
    </div>
  );
}

/* ─── ConfirmDialog (GitHub-style type-to-confirm) ─── */

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmText: string;
  confirmLabel?: string;
  onConfirm: () => void;
  loading?: boolean;
  variant?: "destructive" | "warning";
}

function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText,
  confirmLabel,
  onConfirm,
  loading = false,
  variant = "destructive",
}: ConfirmDialogProps) {
  const [inputValue, setInputValue] = React.useState("");
  const isMatch = inputValue === confirmText;

  // Reset input when dialog closes
  React.useEffect(() => {
    if (!open) setInputValue("");
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                variant === "destructive"
                  ? "bg-[var(--destructive)]/10 text-[var(--destructive)]"
                  : "bg-amber-500/10 text-amber-500"
              )}
            >
              <AlertTriangle className="h-4 w-4" />
            </div>
            <DialogTitle>{title}</DialogTitle>
          </div>
          <DialogDescription className="pt-2">{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <p className="text-sm text-[var(--muted-foreground)]">
            To confirm, type{" "}
            <span className="font-mono font-semibold text-[var(--foreground)] bg-[var(--muted)] px-1.5 py-0.5 rounded text-xs">
              {confirmText}
            </span>{" "}
            below:
          </p>
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={confirmText}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter" && isMatch && !loading) {
                onConfirm();
              }
            }}
          />
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            size="sm"
            disabled={!isMatch || loading}
            onClick={onConfirm}
          >
            {loading ? "Processing..." : confirmLabel || title}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ─── DangerZoneHeader ─── */

interface DangerZoneHeaderProps {
  className?: string;
}

function DangerZoneHeader({ className }: DangerZoneHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 px-4 py-3 border-b border-[var(--destructive)]/20 bg-[var(--destructive)]/5",
        className
      )}
    >
      <AlertTriangle className="h-4 w-4 text-[var(--destructive)]" />
      <h3 className="text-sm font-semibold text-[var(--destructive)]">Danger Zone</h3>
    </div>
  );
}

export {
  DangerZone,
  DangerZoneHeader,
  DangerZoneItem,
  ConfirmDialog,
};
export type {
  DangerZoneProps,
  DangerZoneItemProps,
  ConfirmDialogProps,
};
