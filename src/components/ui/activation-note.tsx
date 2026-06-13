import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../../utils/cn";

/**
 * ActivationNote — a calm, legible note primitive with a brand-tinted left
 * rule and no loud icon. Used to qualify a governance action (e.g. "access
 * activates when this email signs in"). The copy is a slot — the product
 * supplies the text; nothing is hardcoded here.
 *
 * Variants:
 *  - inset  — boxed/standalone, for the invite/create form (wider measure).
 *  - inline — compact, for an inline grant row (tighter measure).
 *
 * Colour comes from `--doc-ink-note` + `--doc-rule-strong` (defined light +
 * dark in @cofoundy/ui/styles), lifted off the AA-failing gray of the POC.
 */
const activationNoteVariants = cva(
  "m-0 border-l-2 border-[var(--doc-rule-strong)] pl-3 font-sans font-normal text-[var(--doc-ink-note)]",
  {
    variants: {
      variant: {
        inset: "max-w-[48ch] text-[12.5px] leading-relaxed",
        inline: "max-w-[54ch] text-[12.5px] leading-snug",
      },
    },
    defaultVariants: {
      variant: "inset",
    },
  }
);

export interface ActivationNoteProps
  extends React.ComponentProps<"p">,
    VariantProps<typeof activationNoteVariants> {}

const ActivationNote = React.forwardRef<HTMLParagraphElement, ActivationNoteProps>(
  ({ className, variant, children, ...props }, ref) => {
    return (
      <p
        ref={ref}
        data-slot="activation-note"
        className={cn(activationNoteVariants({ variant }), className)}
        {...props}
      >
        {children}
      </p>
    );
  }
);
ActivationNote.displayName = "ActivationNote";

export { ActivationNote, activationNoteVariants };
