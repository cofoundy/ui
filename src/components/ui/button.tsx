import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../../utils/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
  {
    variants: {
      variant: {
        // La tinta se DERIVA del relleno, no se fija. `--primary` es el color de
        // marca y una app puede reasignarlo (Fovente lo ata al color del tenant),
        // así que un `text-white` clavado acá deja el relleno variable y la tinta
        // constante: sobre un relleno claro el rótulo desaparece. Medido en el DOM
        // vivo de Fovente, tema oscuro: blanco sobre #D98D7D = 2.61:1, reprueba AA
        // en TODA acción primaria de la app. `--primary-foreground` ya existe en
        // `styles/index.css` y vale `#ffffff` en los dos temas, así que para quien
        // no lo reasigne (TimelyAI, Landing) esto no mueve un píxel. → inbox-ai#617
        default: "bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary)]/90",
        destructive: "bg-[var(--destructive)] text-white hover:bg-[var(--destructive)]/90",
        outline:
          "border border-[var(--border)] bg-transparent text-[var(--foreground)] shadow-xs hover:bg-[var(--accent)]",
        secondary: "bg-[var(--secondary)] text-white hover:bg-[var(--secondary)]/80",
        ghost: "text-[var(--foreground)] hover:bg-[var(--accent)]",
        link: "text-[var(--primary)] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
