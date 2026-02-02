'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Calendar } from 'lucide-react';
import { cn } from '../../utils/cn';

// Calendly types
declare global {
  interface Window {
    Calendly?: {
      initPopupWidget: (options: { url: string; prefill?: CalendlyPrefill }) => void;
    };
  }
}

interface CalendlyPrefill {
  name?: string;
  email?: string;
  customAnswers?: Record<string, string>;
}

const calendlyButtonVariants = cva(
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

export interface CalendlyButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof calendlyButtonVariants> {
  /**
   * Your Calendly event URL
   * @example "https://calendly.com/cofoundy/intro"
   */
  url: string;
  /**
   * Prefill visitor information
   */
  prefill?: CalendlyPrefill;
  /**
   * Show calendar icon
   * @default true
   */
  showIcon?: boolean;
  /**
   * Icon position
   * @default "left"
   */
  iconPosition?: 'left' | 'right';
}

/**
 * CalendlyButton - Opens Calendly popup modal on click
 *
 * Uses Calendly's official popup widget for seamless scheduling.
 * Loads Calendly script lazily on first interaction.
 *
 * @example
 * ```tsx
 * <CalendlyButton url="https://calendly.com/cofoundy/intro">
 *   Agendar llamada gratis
 * </CalendlyButton>
 * ```
 */
export function CalendlyButton({
  className,
  variant,
  size,
  url,
  prefill,
  showIcon = true,
  iconPosition = 'left',
  children,
  onClick,
  ...props
}: CalendlyButtonProps) {
  const [isScriptLoaded, setIsScriptLoaded] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  // Load Calendly script lazily
  const loadCalendlyScript = React.useCallback(() => {
    return new Promise<void>((resolve, reject) => {
      // Check if already loaded
      if (window.Calendly) {
        resolve();
        return;
      }

      // Check if script tag exists
      const existingScript = document.querySelector(
        'script[src*="calendly.com/assets/external/widget.js"]'
      );
      if (existingScript) {
        existingScript.addEventListener('load', () => resolve());
        return;
      }

      // Load CSS
      const link = document.createElement('link');
      link.href = 'https://assets.calendly.com/assets/external/widget.css';
      link.rel = 'stylesheet';
      document.head.appendChild(link);

      // Load JS
      const script = document.createElement('script');
      script.src = 'https://assets.calendly.com/assets/external/widget.js';
      script.async = true;
      script.onload = () => {
        setIsScriptLoaded(true);
        resolve();
      };
      script.onerror = () => reject(new Error('Failed to load Calendly widget'));
      document.body.appendChild(script);
    });
  }, []);

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    // Call original onClick if provided
    onClick?.(e);

    if (e.defaultPrevented) return;

    setIsLoading(true);

    try {
      await loadCalendlyScript();

      if (window.Calendly) {
        window.Calendly.initPopupWidget({
          url,
          prefill,
        });
      }
    } catch (error) {
      console.error('CalendlyButton: Failed to open popup', error);
      // Fallback: open in new tab
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
      className={cn(calendlyButtonVariants({ variant, size, className }))}
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

export { calendlyButtonVariants };
