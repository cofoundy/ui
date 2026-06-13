import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../../utils/cn";

/**
 * RoleChip — a tinted, small-caps mono chip with a leading status dot, for
 * role / visibility / access state. The scannable spine of a governance row.
 *
 * Tones map to workspace governance semantics:
 *  - owner   (brand-blue tint)
 *  - admin   (amber tint)
 *  - member  (neutral tint)
 *  - open    (emerald tint)
 *  - private (slate / neutral tint)
 *  - public  (amber tint)
 *
 * Colour comes entirely from `--chip-*` CSS vars (defined light + dark in
 * @cofoundy/ui/styles), so the chip passes AA in BOTH themes — light mode
 * flips the foreground to a dark saturated tone via `--chip-fg-*`.
 */
const roleChipVariants = cva(
  "inline-flex items-center whitespace-nowrap rounded-md font-mono font-semibold uppercase",
  {
    variants: {
      tone: {
        owner:
          "text-[var(--chip-fg-owner)] bg-[var(--chip-bg-owner)] shadow-[inset_0_0_0_1px_var(--chip-ring-owner)]",
        admin:
          "text-[var(--chip-fg-admin)] bg-[var(--chip-bg-admin)] shadow-[inset_0_0_0_1px_var(--chip-ring-admin)]",
        member:
          "text-[var(--chip-fg-member)] bg-[var(--chip-bg-member)] shadow-[inset_0_0_0_1px_var(--chip-ring-member)]",
        open:
          "text-[var(--chip-fg-open)] bg-[var(--chip-bg-open)] shadow-[inset_0_0_0_1px_var(--chip-ring-open)]",
        private:
          "text-[var(--chip-fg-private)] bg-[var(--chip-bg-private)] shadow-[inset_0_0_0_1px_var(--chip-ring-private)]",
        public:
          "text-[var(--chip-fg-public)] bg-[var(--chip-bg-public)] shadow-[inset_0_0_0_1px_var(--chip-ring-public)]",
      },
      size: {
        sm: "h-[20px] gap-1.5 pl-[7px] pr-2 text-[10px] tracking-[0.06em]",
        default: "h-6 gap-1.5 pl-2 pr-2.5 text-[11px] tracking-[0.07em]",
      },
    },
    defaultVariants: {
      tone: "member",
      size: "default",
    },
  }
);

const dotToneClass: Record<NonNullable<RoleChipProps["tone"]>, string> = {
  owner: "bg-[var(--chip-dot-owner)] shadow-[0_0_6px_var(--chip-dot-owner)]",
  admin: "bg-[var(--chip-dot-admin)] shadow-[0_0_6px_var(--chip-dot-admin)]",
  member: "bg-[var(--chip-dot-member)] shadow-[0_0_6px_var(--chip-dot-member)]",
  open: "bg-[var(--chip-dot-open)] shadow-[0_0_6px_var(--chip-dot-open)]",
  private: "bg-[var(--chip-dot-private)] shadow-[0_0_6px_var(--chip-dot-private)]",
  public: "bg-[var(--chip-dot-public)] shadow-[0_0_6px_var(--chip-dot-public)]",
};

export interface RoleChipProps
  extends Omit<React.ComponentProps<"span">, "children">,
    VariantProps<typeof roleChipVariants> {
  /** The chip label (e.g. "OWNER", "PUBLIC"). Falls back to the tone, upper-cased. */
  children?: React.ReactNode;
  /** Render the leading status dot. Defaults to true. */
  dot?: boolean;
}

const RoleChip = React.forwardRef<HTMLSpanElement, RoleChipProps>(
  ({ className, tone = "member", size, dot = true, children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        data-slot="role-chip"
        data-tone={tone ?? undefined}
        className={cn(roleChipVariants({ tone, size }), className)}
        {...props}
      >
        {dot && (
          <span
            aria-hidden
            className={cn(
              "block size-[5px] flex-none rounded-full",
              tone ? dotToneClass[tone] : dotToneClass.member
            )}
          />
        )}
        {children ?? (tone ?? "member").toUpperCase()}
      </span>
    );
  }
);
RoleChip.displayName = "RoleChip";

export { RoleChip, roleChipVariants };
