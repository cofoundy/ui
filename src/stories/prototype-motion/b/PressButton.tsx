import * as React from 'react';
import { CheckIcon, Loader2Icon, RotateCcwIcon } from 'lucide-react';
import { cn } from '../../../utils/cn';
import { B, SpringValue, after, reducedMotion } from './physics';

export type PressPhase = 'idle' | 'loading' | 'success' | 'error';

export interface PressButtonProps {
  label: string;
  loadingLabel?: string;
  successLabel?: string;
  errorLabel?: string;
  /** Stubbed mutation. Resolve = éxito, reject = error. */
  onAction?: () => Promise<void>;
  onSuccess?: () => void;
  onError?: () => void;
  /** Freeze a phase (states story). */
  phase?: PressPhase;
  disabled?: boolean;
  /** How long "Guardada" holds before returning to idle. */
  successHoldMs?: number;
  className?: string;
}

const PHASES: PressPhase[] = ['idle', 'loading', 'success', 'error'];

/**
 * Press depth follows the finger (0.97 while held). loading → éxito swaps CONTENT inside
 * a button whose width never changes: every label lives in the same grid cell, so the
 * button is always as wide as the widest one. Old label exits (~80 ms, opacity + 3 px
 * blur), then the next one enters — never two labels cross-fading on top of each other.
 */
export function PressButton({
  label,
  loadingLabel = 'Guardando',
  successLabel = 'Guardada',
  errorLabel = 'No se guardó · Reintentar',
  onAction,
  onSuccess,
  onError,
  phase: forced,
  disabled,
  successHoldMs = 1600,
  className,
}: PressButtonProps) {
  const root = React.useRef<HTMLButtonElement>(null);
  const layers = React.useRef<Record<PressPhase, HTMLSpanElement | null>>({ idle: null, loading: null, success: null, error: null });
  const errorFill = React.useRef<HTMLSpanElement>(null);
  const phaseRef = React.useRef<PressPhase>(forced ?? 'idle');
  const [announce, setAnnounce] = React.useState('');
  const [busy, setBusy] = React.useState(false);

  const press = React.useMemo(
    () => new SpringValue(1, (s) => root.current && (root.current.style.transform = `scale(${s})`), B.pressIn, 0.0005),
    [],
  );
  const presence = React.useMemo(() => {
    const m = {} as Record<PressPhase, SpringValue>;
    for (const p of PHASES) {
      m[p] = new SpringValue(p === phaseRef.current ? 1 : 0, (v) => {
        const el = layers.current[p];
        if (!el) return;
        el.style.opacity = String(v);
        el.style.filter = v > 0.995 ? '' : `blur(${(1 - v) * 3}px)`;
        el.style.transform = `translateY(${(1 - v) * (p === 'idle' ? -4 : 4)}px)`;
      }, B.enter, 0.002);
    }
    return m;
  }, []);
  const errorTint = React.useMemo(
    () => new SpringValue(0, (v) => errorFill.current && (errorFill.current.style.opacity = String(v)), B.enter, 0.002),
    [],
  );

  const go = React.useCallback(
    (next: PressPhase) => {
      const prev = phaseRef.current;
      if (prev === next) return;
      phaseRef.current = next;
      setBusy(next === 'loading');
      setAnnounce(next === 'loading' ? loadingLabel : next === 'success' ? successLabel : next === 'error' ? errorLabel : '');
      presence[prev].to(0, { params: B.exit });
      errorTint.to(next === 'error' ? 1 : 0, { params: B.enter });
      // Content swap: the next label waits for the old one to leave.
      if (reducedMotion()) presence[next].set(1);
      else after(80, () => phaseRef.current === next && presence[next].to(1, { params: B.enter }));
    },
    [presence, errorTint, loadingLabel, successLabel, errorLabel],
  );

  React.useEffect(() => {
    if (forced) go(forced);
  }, [forced, go]);

  // Paint initial layer state once mounted.
  React.useLayoutEffect(() => {
    for (const p of PHASES) presence[p].set(p === phaseRef.current ? 1 : 0);
    errorTint.set(phaseRef.current === 'error' ? 1 : 0);
  }, [presence, errorTint]);

  const run = () => {
    if (forced || disabled) return;
    const ph = phaseRef.current;
    if (ph === 'loading' || ph === 'success') return; // no double submit
    const started = performance.now();
    go('loading');
    (onAction?.() ?? Promise.resolve()).then(
      () => {
        // Spinner stays ≥ 350 ms so a fast save doesn't flash.
        after(Math.max(0, 350 - (performance.now() - started)), () => {
          go('success');
          onSuccess?.();
          after(successHoldMs, () => phaseRef.current === 'success' && go('idle'));
        });
      },
      () => after(Math.max(0, 350 - (performance.now() - started)), () => {
        go('error');
        onError?.();
      }),
    );
  };

  const down = (e: React.PointerEvent) => {
    if (disabled || e.button !== 0) return;
    press.to(0.97, { params: B.pressIn });
  };
  const up = () => press.to(1, { params: B.snappy });

  return (
    <button
      ref={root}
      type="button"
      data-slot="press-button"
      data-phase={forced ?? undefined}
      disabled={disabled}
      aria-busy={busy || undefined}
      onPointerDown={down}
      onPointerUp={up}
      onPointerLeave={up}
      onPointerCancel={up}
      onClick={run}
      className={cn(
        'group relative isolate inline-grid h-12 min-w-[44px] select-none place-items-center overflow-hidden rounded-xl px-5',
        'bg-[var(--primary)] text-[15px] font-semibold text-[var(--primary-foreground)]',
        'outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--ring)]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]',
        'disabled:cursor-not-allowed disabled:bg-[var(--muted)] disabled:text-[var(--muted-foreground)]',
        '[-webkit-tap-highlight-color:transparent] touch-manipulation',
        className,
      )}
    >
      {/* Hover/active wash — not just a background swap: an inner light that sits under content. */}
      <span aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-[var(--primary-foreground)] opacity-0 transition-opacity duration-150 group-hover:opacity-[0.08] group-disabled:hidden" />
      <span ref={errorFill} aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-[var(--destructive)] opacity-0" />
      <span ref={(n) => { layers.current.idle = n; }} className="col-start-1 row-start-1 inline-flex items-center gap-2 whitespace-nowrap">
        {label}
      </span>
      <span ref={(n) => { layers.current.loading = n; }} aria-hidden className="col-start-1 row-start-1 inline-flex items-center gap-2 whitespace-nowrap opacity-0">
        <Loader2Icon className="size-[18px] animate-spin" strokeWidth={2.25} />
        {loadingLabel}
      </span>
      <span ref={(n) => { layers.current.success = n; }} aria-hidden className="col-start-1 row-start-1 inline-flex items-center gap-2 whitespace-nowrap opacity-0">
        <CheckIcon className="size-[18px]" strokeWidth={2.25} />
        {successLabel}
      </span>
      <span ref={(n) => { layers.current.error = n; }} aria-hidden className="col-start-1 row-start-1 inline-flex items-center gap-2 whitespace-nowrap opacity-0">
        <RotateCcwIcon className="size-[18px]" strokeWidth={2.25} />
        {errorLabel}
      </span>
      <span className="sr-only" aria-live="polite">{announce}</span>
    </button>
  );
}

/** Stub for a mutation: resolves/rejects after `ms` on rAF time. */
export function fakeRequest(ms: number, fail = false): Promise<void> {
  return new Promise((res, rej) => after(ms, () => (fail ? rej(new Error('offline')) : res())));
}
