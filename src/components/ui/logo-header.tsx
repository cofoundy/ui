import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../../utils/cn";
import { Logo, type LogoVariant } from "./logo";

const logoHeaderVariants = cva(
  "cf-logo-header inline-flex items-center gap-2",
  {
    variants: {
      size: {
        sm: "gap-1.5",
        default: "gap-2",
        lg: "gap-3",
        xl: "gap-4",
      },
      layout: {
        horizontal: "flex-row",
        stacked: "flex-col text-center",
      },
    },
    defaultVariants: {
      size: "default",
      layout: "horizontal",
    },
  }
);

type LogoHeaderSize = "sm" | "default" | "lg" | "xl";
type LogoHeaderLayout = "horizontal" | "stacked";

/**
 * Tamaños por layout. En el apilado el isologo crece un escalón y el
 * wordmark va con interlineado 1, para que «Cofoundy» quede pegado y
 * centrado bajo los cubos (proporción del logo oficial de la web).
 */
const wordmarkSizes: Record<LogoHeaderLayout, Record<LogoHeaderSize, string>> = {
  horizontal: {
    sm: "text-lg",
    default: "text-xl",
    lg: "text-2xl",
    xl: "text-4xl",
  },
  stacked: {
    sm: "text-lg leading-none",
    default: "text-2xl leading-none",
    lg: "text-4xl leading-none",
    xl: "text-5xl leading-none",
  },
};

const isoloSizes: Record<
  LogoHeaderLayout,
  Record<LogoHeaderSize, "sm" | "default" | "lg" | "xl" | "2xl">
> = {
  horizontal: { sm: "sm", default: "default", lg: "lg", xl: "xl" },
  stacked: { sm: "default", default: "lg", lg: "xl", xl: "2xl" },
};

/** Wordmark «Cofoundy»: Space Grotesk Semibold, tracking -0.02em (igual en web, PDF y BRAND). */
const WORDMARK_STYLE: React.CSSProperties = {
  fontFamily: "var(--font-brand, 'Space Grotesk', sans-serif)",
  letterSpacing: "-0.02em",
};

interface LogoHeaderProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof logoHeaderVariants> {
  /**
   * Variante del isologo (ver `Logo`): `color` ↔ `*-color` (default) · `mono` ↔ `*-white` ·
   * `flat` ↔ `*-pure-white`. Cuál usar: BRAND/identity.md §02. En `mono` y `flat` el wordmark
   * hereda `currentColor`.
   */
  variant?: LogoVariant;
  /** @deprecated Usa `variant="mono"`. Se mantiene por compatibilidad. */
  mono?: boolean;
  /** @deprecated Usa `<Wordmark />`. */
  wordmarkOnly?: boolean;
  /** @deprecated Usa `<Logo />`. */
  isologoOnly?: boolean;
}

/**
 * Cofoundy Logo Header — isologo + wordmark
 * `layout="horizontal"` (default): cubos a la izquierda, «Cofoundy» a la derecha.
 * `layout="stacked"`: cubos arriba, «Cofoundy» debajo y centrado (logo apilado oficial).
 * Uses Space Grotesk Semibold for the wordmark
 */
function LogoHeader({
  className,
  size = "default",
  layout = "horizontal",
  variant,
  mono = false,
  wordmarkOnly = false,
  isologoOnly = false,
  ...props
}: LogoHeaderProps) {
  const sizeKey = size || "default";
  const layoutKey = layout || "horizontal";
  const wordmarkSize = wordmarkSizes[layoutKey][sizeKey];
  const isoloSize = isoloSizes[layoutKey][sizeKey];
  const resolved: LogoVariant = variant ?? (mono ? "mono" : "color");
  const rootClassName = cn(logoHeaderVariants({ size, layout }), className);

  if (isologoOnly) {
    return (
      <div className={rootClassName} data-layout={layoutKey} {...props}>
        <Logo size={isoloSize} variant={resolved} />
      </div>
    );
  }

  return (
    <div className={rootClassName} data-layout={layoutKey} data-variant={resolved} {...props}>
      {!wordmarkOnly && <Logo size={isoloSize} variant={resolved} aria-hidden />}
      <span
        className={cn(
          wordmarkSize,
          "font-semibold",
          resolved === "color" ? "text-foreground" : "text-current"
        )}
        style={WORDMARK_STYLE}
      >
        Cofoundy
      </span>
    </div>
  );
}

/**
 * Wordmark suelto («Cofoundy» en Space Grotesk Semibold). Es texto: el tamaño va con
 * clases `text-*` (no `h-*`) y el color con `text-*` o `currentColor`.
 */
function Wordmark({
  className,
  style,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn("text-xl font-semibold text-foreground", className)}
      style={{ ...WORDMARK_STYLE, ...style }}
      {...props}
    >
      Cofoundy
    </span>
  );
}

export { LogoHeader, logoHeaderVariants, Wordmark };
