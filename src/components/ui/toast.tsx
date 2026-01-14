"use client";

import * as React from "react";
import { Check, X, AlertCircle, Info } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../../utils/cn";

const toastVariants = cva(
  "fixed bottom-4 right-4 px-4 py-3 rounded-xl flex items-center gap-2 shadow-lg z-50 animate-in slide-in-from-bottom-2 fade-in duration-300",
  {
    variants: {
      variant: {
        success: "bg-green-500/90 text-white",
        error: "bg-red-500/90 text-white",
        warning: "bg-yellow-500/90 text-white",
        info: "bg-blue-500/90 text-white",
      },
    },
    defaultVariants: {
      variant: "info",
    },
  }
);

const iconMap = {
  success: Check,
  error: X,
  warning: AlertCircle,
  info: Info,
};

interface ToastProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof toastVariants> {
  message: string;
  onClose: () => void;
  duration?: number;
}

function Toast({
  className,
  variant = "info",
  message,
  onClose,
  duration = 3000,
  ...props
}: ToastProps) {
  React.useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const Icon = iconMap[variant || "info"];

  return (
    <div
      data-slot="toast"
      data-variant={variant}
      role="alert"
      className={cn(toastVariants({ variant, className }))}
      {...props}
    >
      <Icon className="size-5 shrink-0" />
      <span className="text-sm font-medium">{message}</span>
      <button
        onClick={onClose}
        className="ml-2 hover:opacity-70 transition-opacity"
        aria-label="Dismiss"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}

export { Toast, toastVariants };
