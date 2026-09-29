import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { CircleAlertIcon, CircleCheckIcon } from "lucide-react";

import { cn } from "../../utils/cn";
import { after, commit, MOTION, prefersReducedMotion } from "../../lib/motion-timeline";

// Press: the whole button settles to .96 on pointer-down (fast, --cf-duration-press) and
// springs back on release (--cf-spring-snappy). `scale`, not `transform`, so it composes with
// any transform a caller adds. Reduced motion: no scale, no transition. The morph mode
// (`status`/`loading`) owns its press in styles/index.css (`.cf-btn[data-pressed]`).
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-[color,background-color,border-color,box-shadow,scale] duration-[var(--cf-spring-snappy-duration)] ease-[var(--cf-spring-snappy)] active:scale-[.96] active:duration-[var(--cf-duration-press)] motion-reduce:transition-none motion-reduce:active:scale-100 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
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

export type ButtonStatus = "idle" | "loading" | "success" | "error";
type ButtonPhase = "idle" | "exit" | "loading" | "success" | "error" | "restore";
export type ButtonStatusLabels = Partial<Record<Exclude<ButtonStatus, "idle">, string>>;

const DEFAULT_STATUS_LABELS: Record<Exclude<ButtonStatus, "idle">, string> = {
  loading: "Guardando",
  success: "Guardada",
  error: "No se guardó · Reintentar",
};

type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    /**
     * Opt-in morph-in-place feedback. Omit it and the button renders exactly as before.
     * The caller owns the request; the button owns the choreography:
     * `loading` → the surface shrinks to a circle with a spinner (≥ 350 ms on screen),
     * `success` → persists until the caller sets `idle` (e.g. the content changed),
     * `error` → stays clickable; that click is the retry.
     * Ignored with `asChild`.
     */
    status?: ButtonStatus;
    /** Words for each state. Shown in both motion modes; reduced motion removes only movement. */
    statusLabels?: ButtonStatusLabels;
    /**
     * Shorthand for `status`: `true` → `"loading"`, `false` → `"idle"`. Pass it from the first
     * render (even as `false`) so the button already has the morph structure when it flips.
     * `status` wins when both are set. Ignored with `asChild`.
     */
    loading?: boolean;
  };

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  status,
  statusLabels,
  loading,
  ...props
}: ButtonProps) {
  const resolved: ButtonStatus | undefined =
    status ?? (loading === undefined ? undefined : loading ? "loading" : "idle");
  if (resolved !== undefined && !asChild) {
    return (
      <StatusButton
        className={className}
        variant={variant}
        size={size}
        status={resolved}
        reserve={status === undefined ? LOADING_ONLY : ALL_STATES}
        statusLabels={statusLabels}
        {...props}
      />
    );
  }

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

function useReducedMotion() {
  const [reduced, setReduced] = React.useState(prefersReducedMotion);
  React.useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const on = () => setReduced(mq.matches);
    mq.addEventListener?.("change", on);
    return () => mq.removeEventListener?.("change", on);
  }, []);
  return reduced;
}

type Reservable = Exclude<ButtonStatus, "idle">;
const ALL_STATES: readonly Reservable[] = ["loading", "success", "error"];
// `loading` never reaches success/error, so it reserves only the loading words: the button
// keeps its own width instead of growing to fit "No se guardó · Reintentar".
const LOADING_ONLY: readonly Reservable[] = ["loading"];

type StatusButtonProps = Omit<ButtonProps, "asChild" | "status" | "loading"> & {
  status: ButtonStatus;
  reserve: readonly Reservable[];
};

/**
 * Morph-in-place button. Movement lives in styles/index.css (`.cf-btn`); this component only
 * flips `data-phase` at measured times. `exit`/`restore` are the 80 ms content-only windows
 * around the circle.
 */
function StatusButton({
  className,
  variant,
  size,
  status,
  statusLabels,
  reserve,
  children,
  onClick,
  onPointerDown,
  onPointerUp,
  onPointerLeave,
  onPointerCancel,
  type = "button",
  ...props
}: StatusButtonProps) {
  const reduced = useReducedMotion();
  const [phase, setPhaseState] = React.useState<ButtonPhase>(status === "idle" ? "idle" : status);
  const phaseRef = React.useRef(phase);
  const setPhase = (p: ButtonPhase) => {
    phaseRef.current = p;
    setPhaseState(p);
  };
  const cancel = React.useRef<() => void>(() => {});
  const loadingSince = React.useRef(0);
  const labels = { ...DEFAULT_STATUS_LABELS, ...statusLabels };

  React.useLayoutEffect(() => {
    cancel.current();
    const from = phaseRef.current;
    if (status === "loading") {
      loadingSince.current = performance.now();
      if (reduced || from !== "idle") {
        setPhase("loading");
      } else {
        // 1) the label leaves (80 ms), 2) only then the surface morphs to the circle
        setPhase("exit");
        cancel.current = after(MOTION.contentExit, () => commit(() => setPhase("loading")));
      }
    } else if (status === "success" || status === "error") {
      // A fast save must not flicker: the spinner stays on screen ≥ MOTION.minLoading.
      const shown = performance.now() - loadingSince.current;
      if ((from === "loading" || from === "exit") && shown < MOTION.minLoading) {
        cancel.current = after(MOTION.minLoading - shown, () => commit(() => setPhase(status)));
      } else {
        setPhase(status);
      }
    } else if ((from === "loading" || from === "exit") && !reduced) {
      // cancelled while loading: the glyph leaves (80 ms), the surface grows back, label enters
      setPhase("restore");
      cancel.current = after(MOTION.contentExit, () => commit(() => setPhase("idle")));
    } else {
      // success/error → idle: the surface is already full width; only content + color swap
      setPhase("idle");
    }
    return () => cancel.current();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, reduced]);

  const shownStatus: ButtonStatus =
    phase === "exit" || phase === "loading"
      ? "loading"
      : phase === "success" || phase === "error"
        ? phase
        : "idle";
  const blocked = status === "loading" || status === "success";
  const unpress = (e: React.PointerEvent<HTMLButtonElement>) => {
    delete e.currentTarget.dataset.pressed;
  };

  return (
    <button
      type={type}
      data-slot="button"
      data-variant={variant}
      data-size={size}
      data-status={status}
      data-phase={phase}
      data-reduced={reduced ? "" : undefined}
      aria-busy={status === "loading" || undefined}
      aria-disabled={blocked || undefined}
      // `active:scale-100`: the base press is a `scale` utility; here `.cf-btn[data-pressed]`
      // presses instead (it knows when the button is blocked), so the two never compound.
      className={cn(buttonVariants({ variant, size, className }), "cf-btn active:scale-100")}
      onClick={(e) => {
        if (blocked) {
          e.preventDefault(); // a submit button must not re-submit while saving
          return;
        }
        onClick?.(e);
      }}
      onPointerDown={(e) => {
        if (!blocked) e.currentTarget.dataset.pressed = "";
        onPointerDown?.(e);
      }}
      onPointerUp={(e) => {
        unpress(e);
        onPointerUp?.(e);
      }}
      onPointerLeave={(e) => {
        unpress(e);
        onPointerLeave?.(e);
      }}
      onPointerCancel={(e) => {
        unpress(e);
        onPointerCancel?.(e);
      }}
      {...props}
    >
      <span data-slot="button-ring" className="cf-btn__ring" aria-hidden />
      <span data-slot="button-surface" className="cf-btn__surface" aria-hidden />
      <span className="cf-btn__stack">
        <span data-slot="button-label" className="cf-btn__label">
          {children}
        </span>
        <span data-slot="button-status" className="cf-btn__status" aria-hidden>
          <StatusGlyph status={shownStatus} />
          {shownStatus === "idle" ? null : labels[shownStatus]}
        </span>
        {/* Width reservation: the button is as wide as its longest state from the first
            frame, so success/error never grow it (and never shift what sits beside it). */}
        {reserve.map((s) => (
          <span key={s} className="cf-btn__sizer" aria-hidden>
            <StatusGlyph status={s} />
            {labels[s]}
          </span>
        ))}
      </span>
      <span className="cf-btn__glyph" aria-hidden>
        <svg className="cf-btn__spinner" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 3a9 9 0 0 1 9 9" />
        </svg>
      </span>
      <span className="cf-sr-only" role="status">
        {status === "idle" ? "" : labels[status]}
      </span>
    </button>
  );
}

function StatusGlyph({ status }: { status: ButtonStatus }) {
  if (status === "loading")
    return (
      <svg className="cf-btn__inline-icon cf-btn__inline-spin" viewBox="0 0 24 24" aria-hidden>
        <path d="M12 3a9 9 0 1 0 9 9" />
      </svg>
    );
  if (status === "success") return <CircleCheckIcon className="cf-btn__inline-icon" aria-hidden />;
  if (status === "error") return <CircleAlertIcon className="cf-btn__inline-icon" aria-hidden />;
  return null;
}

export { Button, buttonVariants };
export type { ButtonProps };
