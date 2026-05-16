import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../../utils/cn";
import { Button } from "./button";

/**
 * NotFound — 404 page for the Cofoundy product suite.
 *
 * Strategic identity: "Threshold pause" — Sage-led, plain-spoken, with a single
 * hairline that marks the threshold and one committed Hero-stance CTA. Anti-self
 * traps explicitly avoided: no "Oops!", no "Error 404", no stack-trace styling,
 * no performed warmth, no search/sitemap noise.
 *
 * Reuse contract:
 *   - Host always supplies `primaryAction` (label + href) — recovery path varies
 *     per touchpoint (inbox vs. timely vs. pulse vs. landing).
 *   - `productContext` toggles the kicker + scope wording.
 *   - Optional `secondaryMessage` and `title` overrides cover edge cases.
 *
 * See `src/stories/ui/NotFound.stories.tsx` for the full brief + scorecard.
 */

const notFoundVariants = cva(
  [
    "grid min-h-screen w-full",
    "bg-[var(--chat-background)] text-[var(--chat-foreground)]",
    "font-sans",
    "px-6 md:px-12 lg:px-[7vw]",
  ].join(" "),
  {
    variants: {
      density: {
        // Asymmetric vertical rhythm — content sits slightly above optical
        // center, creating a "held breath" rather than a static centered block.
        default: "[grid-template-rows:38vh_1fr_22vh]",
        compact: "[grid-template-rows:24vh_1fr_14vh]",
      },
    },
    defaultVariants: {
      density: "default",
    },
  }
);

// Product-aware microcopy. Strings live with the component so hosts only have
// to pass productContext; the Sage line stays consistent across touchpoints.
const PRODUCT_LABEL: Record<string, string> = {
  inbox: "Inbox AI",
  timely: "Timely AI",
  pulse: "Pulse AI",
  landing: "Cofoundy",
};

const PRODUCT_SCOPE: Record<string, string> = {
  inbox: "tu inbox",
  timely: "tu agenda",
  pulse: "tu tablero",
  landing: "el sitio",
};

export interface NotFoundProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title">,
    VariantProps<typeof notFoundVariants> {
  /**
   * Which product surfaces this 404. Shown as the uppercase kicker and used
   * to resolve scope wording in the headline. Unknown strings render as-is
   * so white-label hosts can pass their own label.
   */
  productContext?: "inbox" | "timely" | "pulse" | "landing" | (string & {});
  /**
   * Required host-supplied recovery path. Single CTA per brief.
   */
  primaryAction: { label: string; href: string };
  /**
   * Optional override for the why-clause subline.
   * Defaults to "Se movió, expiró, o el enlace tenía un typo."
   */
  secondaryMessage?: string;
  /**
   * Optional override for the headline. Defaults to
   * "Pasa que esta URL ya no existe en {scope}."
   */
  title?: string;
  /**
   * Footer microtext. Defaults to "cofoundy.dev".
   */
  footerText?: string;
}

function resolveProductLabel(productContext?: string): string {
  if (!productContext) return "Cofoundy";
  return PRODUCT_LABEL[productContext] ?? productContext;
}

function resolveProductScope(productContext?: string): string {
  if (!productContext) return "el sitio";
  return PRODUCT_SCOPE[productContext] ?? "esta sección";
}

export function NotFound({
  productContext,
  primaryAction,
  secondaryMessage,
  title,
  footerText = "cofoundy.dev",
  density,
  className,
  ...props
}: NotFoundProps) {
  const productLabel = resolveProductLabel(productContext);
  const scope = resolveProductScope(productContext);
  const headline = title ?? `Pasa que esta URL ya no existe en ${scope}.`;
  const subline = secondaryMessage ?? "Se movió, expiró, o el enlace tenía un typo.";

  return (
    <div
      data-slot="not-found"
      className={cn(notFoundVariants({ density }), className)}
      {...props}
    >
      {/* Top eyebrow — tiny locator establishing where we are. No "404" badge. */}
      <header
        className={cn(
          "self-end pb-[4vh] flex justify-start items-baseline",
          "text-[12px] font-medium uppercase tracking-[0.12em]",
          "text-[var(--chat-muted)]"
        )}
      >
        <span>{productLabel}</span>
      </header>

      {/* The threshold — single graphic element. Hairline + sentence + CTA. */}
      <main className="flex flex-col items-stretch justify-start">
        <div
          aria-hidden
          className="h-px w-full origin-left bg-[var(--chat-border)] cf-not-found-threshold"
        />

        <h1
          className={cn(
            "font-display font-medium",
            "text-3xl md:text-4xl lg:text-5xl",
            "leading-[1.2] tracking-[-0.015em]",
            "text-[var(--chat-foreground)]",
            "max-w-[28ch] md:max-w-[40ch] lg:max-w-[56ch]",
            "mt-[8vh]",
            "cf-not-found-rise cf-not-found-rise--1"
          )}
        >
          {headline}
        </h1>

        <p
          className={cn(
            "font-sans font-normal",
            "text-base md:text-lg",
            "leading-[1.55] tracking-[-0.005em]",
            "text-[var(--chat-muted)]",
            "max-w-[28ch] md:max-w-[44ch] lg:max-w-[50ch]",
            "mt-[18px]",
            "cf-not-found-rise cf-not-found-rise--2"
          )}
        >
          {subline}
        </p>

        <div className="mt-[7vh] cf-not-found-rise cf-not-found-rise--3">
          {/* Hero stance: filled primary button, single CTA per brief. */}
          <Button asChild variant="default" size="lg">
            <a href={primaryAction.href}>{primaryAction.label}</a>
          </Button>
        </div>
      </main>

      {/* Footer — almost empty. The page exhales here. */}
      <footer
        className={cn(
          "self-end pb-[4vh]",
          "text-[12px] tracking-[0.08em] font-normal",
          "text-[var(--chat-muted)] opacity-60"
        )}
      >
        {footerText}
      </footer>

      {/* Scoped keyframes — local to NotFound, won't collide with global utils. */}
      <style>{`
        .cf-not-found-threshold {
          animation: cf-not-found-threshold-draw var(--cf-duration-slow) var(--cf-ease-default) both;
        }
        .cf-not-found-rise {
          animation: cf-not-found-sentence-rise var(--cf-duration-slow) var(--cf-ease-default) both;
        }
        .cf-not-found-rise--1 { animation-delay: 120ms; }
        .cf-not-found-rise--2 { animation-delay: 200ms; }
        .cf-not-found-rise--3 { animation-delay: 320ms; }
        @keyframes cf-not-found-threshold-draw {
          from { transform: scaleX(0); opacity: 0; }
          to   { transform: scaleX(1); opacity: 1; }
        }
        @keyframes cf-not-found-sentence-rise {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .cf-not-found-threshold,
          .cf-not-found-rise { animation: none; }
        }
      `}</style>
    </div>
  );
}

export { notFoundVariants };
