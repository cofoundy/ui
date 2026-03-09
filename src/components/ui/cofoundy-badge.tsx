import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Heart } from "lucide-react";

import { cn } from "../../utils/cn";
import { Logo } from "./logo";
import { ShimmerText } from "../effects/ShimmerText";

const cofoundyBadgeVariants = cva(
  "inline-flex items-center gap-2 text-xs transition-all duration-300 group/cf-badge",
  {
    variants: {
      variant: {
        /** Full-color cube + brand blue text + hover glow. */
        professional:
          "hover:drop-shadow-[0_0_8px_var(--chat-primary)]",
        /** Full-color cube + shimmer brand text. Animated premium feel. */
        shimmer: "hover:drop-shadow-[0_0_8px_var(--chat-primary)]",
        /** Pill badge with mono cube + hover shimmer & brand color reveal. */
        pill: "px-4 py-1.5 rounded-full border border-[var(--chat-border)] hover:border-[var(--chat-foreground)]/20 hover:-translate-y-px",
        /** Friendly with separator lines, cube, heart icon. Warm and approachable. */
        friendly: "gap-2.5",
      },
    },
    defaultVariants: {
      variant: "professional",
    },
  }
);

interface CofoundyBadgeProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement>,
    VariantProps<typeof cofoundyBadgeVariants> {
  /** Override the default prefix text. For "friendly" variant defaults to "Hecho con amor por". */
  prefix?: string;
}

/**
 * Cofoundy agency branding badge for demo/client projects.
 *
 * Place in footer as a subtle but visible attribution link.
 *
 * Variants:
 * - `professional` — Full-color 3D cube + brand blue text + hover glow.
 * - `shimmer` — Full-color 3D cube + shimmer animated brand text.
 * - `pill` — Contained pill with mono cube, border, hover shimmer reveal.
 * - `friendly` — Separator lines + cube + "Hecho con amor por Cofoundy" + heart. Warm feel.
 */
function CofoundyBadge({
  className,
  variant = "professional",
  prefix,
  ...props
}: CofoundyBadgeProps) {
  const resolvedPrefix =
    prefix ?? (variant === "friendly" ? "Hecho con amor por" : "Hecho por");

  return (
    <a
      href="https://cofoundy.dev"
      target="_blank"
      rel="noopener noreferrer"
      className={cn(cofoundyBadgeVariants({ variant }), className)}
      data-slot="cofoundy-badge"
      {...props}
    >
      {variant === "professional" && (
        <>
          <Logo size="sm" className="w-4 h-4 shrink-0" />
          <span className="text-[var(--chat-primary)]/60 group-hover/cf-badge:text-[var(--chat-primary)] transition-colors">
            {resolvedPrefix}{" "}
            <span className="font-semibold">Cofoundy</span>
          </span>
        </>
      )}
      {variant === "shimmer" && (
        <>
          <Logo size="sm" className="w-4 h-4 shrink-0" />
          <span className="text-[var(--chat-muted)]/60 group-hover/cf-badge:text-[var(--chat-muted)] transition-colors">
            {resolvedPrefix}
          </span>
          <ShimmerText variant="brand" duration={3} className="font-semibold">
            Cofoundy
          </ShimmerText>
        </>
      )}
      {variant === "pill" && (
        <>
          <Logo
            mono
            size="sm"
            className="w-3.5 h-3.5 shrink-0 text-[var(--chat-muted)]/50 group-hover/cf-badge:text-[var(--chat-primary)] transition-colors duration-300"
          />
          <span className="text-[var(--chat-muted)]/60 group-hover/cf-badge:text-[var(--chat-muted)] transition-colors">
            {resolvedPrefix}
          </span>
          <span className="relative font-semibold">
            <span className="text-[var(--chat-muted)]/60 transition-opacity duration-300 group-hover/cf-badge:opacity-0">
              Cofoundy
            </span>
            <span className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover/cf-badge:opacity-100">
              <ShimmerText variant="brand" duration={2} className="font-semibold">
                Cofoundy
              </ShimmerText>
            </span>
          </span>
        </>
      )}
      {variant === "friendly" && (
        <>
          <span className="block w-8 h-px bg-[var(--chat-border)] group-hover/cf-badge:bg-[var(--chat-foreground)]/20 transition-colors" />
          <Logo
            size="sm"
            className="w-4 h-4 shrink-0"
          />
          <span className="text-[var(--chat-muted)]/50 group-hover/cf-badge:text-[var(--chat-muted)] transition-colors">
            {resolvedPrefix}{" "}
            <span className="font-semibold text-[var(--chat-muted)]/60 group-hover/cf-badge:text-[var(--chat-primary)] transition-colors">
              Cofoundy
            </span>
          </span>
          <Heart className="w-3 h-3 text-[var(--chat-primary)]/50 group-hover/cf-badge:text-[var(--chat-primary)] group-hover/cf-badge:fill-[var(--chat-primary)] group-hover/cf-badge:scale-110 transition-all duration-300" />
          <span className="block w-8 h-px bg-[var(--chat-border)] group-hover/cf-badge:bg-[var(--chat-foreground)]/20 transition-colors" />
        </>
      )}
    </a>
  );
}

export { CofoundyBadge, cofoundyBadgeVariants };
export type { CofoundyBadgeProps };
