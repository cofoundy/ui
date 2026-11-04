import * as React from "react";

import { cn } from "../../utils/cn";

/**
 * Tarjeta de demostración para las stories de marca: fija su propio tema con `data-theme`
 * (el logo y el wordmark usan tokens) y rotula el caso de uso con su regla.
 */
export function BrandPanel({
  theme,
  surface = "background",
  title,
  rule,
  children,
}: {
  theme: "light" | "dark";
  /** `background`: fondo neutro del tema · `brand`: fondo de color (el de un cliente o la marca). */
  surface?: "background" | "brand";
  title: string;
  rule: string;
  children: React.ReactNode;
}) {
  return (
    <figure
      data-theme={theme}
      className={cn(
        "m-0 flex w-60 flex-col items-center gap-5 rounded-xl border border-border px-6 pt-10 pb-5",
        surface === "brand" ? "bg-primary text-primary-foreground" : "bg-background text-foreground"
      )}
    >
      <div className="flex min-h-28 items-center justify-center">{children}</div>
      <figcaption className="flex flex-col items-center gap-1 text-center">
        <span className={cn("whitespace-pre-line text-xs font-medium", surface === "brand" ? "text-primary-foreground" : "text-foreground")}>
          {title}
        </span>
        <span className={cn("text-[11px] leading-snug", surface === "brand" ? "text-primary-foreground/80" : "text-muted-foreground")}>
          {rule}
        </span>
      </figcaption>
    </figure>
  );
}

export function BrandGrid({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap items-stretch gap-4">{children}</div>;
}
