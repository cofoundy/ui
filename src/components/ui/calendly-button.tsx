'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Calendar } from 'lucide-react';
import { cn } from '../../utils/cn';

const calBookingButtonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/30 cursor-pointer',
  {
    variants: {
      variant: {
        primary:
          'bg-[var(--primary)] text-white hover:bg-[var(--primary)]/90 shadow-md hover:shadow-lg',
        secondary:
          'bg-[var(--secondary)] text-white hover:bg-[var(--secondary)]/80',
        outline:
          'border-2 border-[var(--primary)] bg-transparent text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white',
        ghost:
          'text-[var(--primary)] hover:bg-[var(--primary)]/10',
      },
      size: {
        sm: 'h-9 px-4 text-sm',
        md: 'h-11 px-6 text-base',
        lg: 'h-14 px-8 text-lg font-semibold',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface CalBookingButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof calBookingButtonVariants> {
  /** Cal.com booking URL (e.g. "https://cal.cofoundy.dev/team/cofoundy/discovery") */
  url: string;
  /** Prefill guest name */
  name?: string;
  /** Prefill guest email */
  email?: string;
  /** Show calendar icon @default true */
  showIcon?: boolean;
  /** Icon position @default "left" */
  iconPosition?: 'left' | 'right';
}

/** @deprecated Use CalBookingButton instead */
export type CalendlyButtonProps = CalBookingButtonProps;

/**
 * CalBookingButton - Opens Cal.com popup modal on click
 *
 * Loads Cal.com embed script lazily on first interaction.
 * Falls back to opening URL in new tab if embed fails.
 *
 * @example
 * ```tsx
 * <CalBookingButton url="https://cal.cofoundy.dev/team/cofoundy/discovery">
 *   Agendar llamada gratis
 * </CalBookingButton>
 * ```
 */
export function CalBookingButton({
  className,
  variant,
  size,
  url,
  name,
  email,
  showIcon = true,
  iconPosition = 'left',
  children,
  onClick,
  ...props
}: CalBookingButtonProps) {
  const [isLoading, setIsLoading] = React.useState(false);

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(e);
    if (e.defaultPrevented) return;

    setIsLoading(true);

    try {
      const win = window as any;
      const calUrl = new URL(url);
      const calLink = calUrl.pathname.replace(/^\//, '');
      const embedSrc = `${calUrl.origin}/embed/embed.js`;

      // Cal.com official embed snippet: create queue function, it auto-loads the script
      if (!win.Cal) {
        (function (C: any, A: string, L: string) {
          const p = function (a: any, ar: any) { a.q.push(ar); };
          const d = C.document;
          C.Cal = C.Cal || function () {
            const cal = C.Cal;
            const ar = arguments;
            if (!cal.loaded) {
              cal.ns = {};
              cal.q = cal.q || [];
              d.head.appendChild(d.createElement('script')).src = A;
              cal.loaded = true;
            }
            if (ar[0] === L) {
              const api = function () { p(api, arguments); } as any;
              const namespace = ar[1];
              api.q = api.q || [];
              if (typeof namespace === 'string') {
                cal.ns[namespace] = cal.ns[namespace] || api;
                p(cal.ns[namespace], ar);
                p(cal, ['initNamespace', namespace]);
              } else p(cal, ar);
              return;
            }
            p(cal, ar);
          };
        })(win, embedSrc, 'init');
      }

      const Cal = win.Cal;
      Cal('init', { origin: calUrl.origin });
      Cal('modal', {
        calLink,
        config: {
          layout: 'month_view',
          theme: 'dark',
          ...(name && { name }),
          ...(email && { email }),
        },
      });
    } catch (error) {
      console.error('CalBookingButton: Failed to open popup', error);
      window.open(url, '_blank', 'noopener,noreferrer');
    } finally {
      setIsLoading(false);
    }
  };

  const icon = showIcon ? (
    <Calendar
      className={cn(
        'shrink-0',
        size === 'sm' && 'size-4',
        size === 'md' && 'size-5',
        size === 'lg' && 'size-6'
      )}
    />
  ) : null;

  return (
    <button
      type="button"
      className={cn(calBookingButtonVariants({ variant, size, className }))}
      onClick={handleClick}
      disabled={isLoading}
      {...props}
    >
      {iconPosition === 'left' && icon}
      {isLoading ? 'Cargando...' : children}
      {iconPosition === 'right' && icon}
    </button>
  );
}

/** @deprecated Use CalBookingButton instead */
export const CalendlyButton = CalBookingButton;

/** @deprecated Use calBookingButtonVariants instead */
export const calendlyButtonVariants = calBookingButtonVariants;
export { calBookingButtonVariants };
