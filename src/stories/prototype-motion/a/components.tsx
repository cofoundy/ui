/**
 * Direction A — prototype-local copies of Button / Switch / Tabs / Toast.
 * Movement lives in motion-a.css; this file only flips data-attributes at measured times.
 */
import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { CircleAlertIcon, CircleCheckIcon, XIcon } from "lucide-react";

import { after, commit, prefersReducedMotion, T } from "./timeline";
import "./motion-a.css";

function useReducedMotion() {
  const [reduced, setReduced] = React.useState(prefersReducedMotion);
  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const on = () => setReduced(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return reduced;
}

const pressHandlers = {
  onPointerDown: (e: React.PointerEvent<HTMLElement>) => {
    e.currentTarget.dataset.pressed = "";
  },
  onPointerUp: (e: React.PointerEvent<HTMLElement>) => {
    delete e.currentTarget.dataset.pressed;
  },
  onPointerLeave: (e: React.PointerEvent<HTMLElement>) => {
    delete e.currentTarget.dataset.pressed;
  },
  onPointerCancel: (e: React.PointerEvent<HTMLElement>) => {
    delete e.currentTarget.dataset.pressed;
  },
};

/* ------------------------------------------------------------------------ */
/* MorphButton                                                               */
/* ------------------------------------------------------------------------ */

export type ButtonStatus = "idle" | "loading" | "success" | "error";
/** Visual phase. `exit`/`restore` are the 80 ms content-only windows around the circle. */
export type ButtonPhase = "idle" | "exit" | "loading" | "success" | "error" | "restore";

export interface MorphButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  children: React.ReactNode;
  /**
   * Proposed API: the caller owns the request, the button owns the choreography.
   * `success` persists until the caller sets `idle` (e.g. the content changed);
   * `error` stays clickable — a click there is the retry.
   */
  status?: ButtonStatus;
  /** State words. Shown in BOTH motion modes; reduced motion only removes movement. */
  statusLabels?: Partial<Record<Exclude<ButtonStatus, "idle">, string>>;
  full?: boolean;
  /** Stories only: pin a phase for the static states sheet. */
  forcePhase?: ButtonPhase;
}

const DEFAULT_LABELS = { loading: "Guardando", success: "Guardada", error: "No se guardó · Reintentar" };

export function MorphButton({
  children,
  status = "idle",
  statusLabels,
  full,
  forcePhase,
  onClick,
  ...rest
}: MorphButtonProps) {
  const reduced = useReducedMotion();
  const [phase, setPhaseState] = React.useState<ButtonPhase>(status === "idle" ? "idle" : status);
  const phaseRef = React.useRef(phase);
  const setPhase = (p: ButtonPhase) => {
    phaseRef.current = p;
    setPhaseState(p);
  };
  const cancel = React.useRef<() => void>(() => {});
  const loadingSince = React.useRef(0);
  const labels = { ...DEFAULT_LABELS, ...statusLabels };

  React.useLayoutEffect(() => {
    cancel.current();
    const from = phaseRef.current;
    if (status === "loading") {
      loadingSince.current = performance.now();
      if (reduced || from !== "idle") {
        setPhase("loading");
      } else {
        // 1) label leaves (80 ms) 2) only then the surface morphs to the circle
        setPhase("exit");
        cancel.current = after(T.contentExit, () => commit(() => setPhase("loading")));
      }
    } else if (status === "success" || status === "error") {
      // A fast save must not flicker: the spinner is on screen ≥ T.minLoading.
      const shown = performance.now() - loadingSince.current;
      if ((from === "loading" || from === "exit") && shown < T.minLoading) {
        cancel.current = after(T.minLoading - shown, () => commit(() => setPhase(status)));
      } else {
        setPhase(status);
      }
    } else if (from === "loading" || from === "exit") {
      if (reduced) {
        setPhase("idle");
      } else {
        // cancelled while loading: glyph leaves (80 ms), surface grows back, label enters
        setPhase("restore");
        cancel.current = after(T.contentExit, () => commit(() => setPhase("idle")));
      }
    } else {
      // success/error → idle: surface is already full width; only content + color swap
      setPhase("idle");
    }
    return () => cancel.current();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, reduced]);

  const shown = forcePhase ?? phase;
  const shownStatus: ButtonStatus =
    shown === "exit" || shown === "loading" ? "loading" : shown === "success" || shown === "error" ? shown : "idle";
  const blocked = status === "loading" || status === "success";

  return (
    <button
      type="button"
      data-slot="button"
      className="pa-btn"
      data-phase={shown}
      data-full={full ? "" : undefined}
      data-reduced={reduced ? "" : undefined}
      aria-busy={status === "loading" || undefined}
      aria-disabled={blocked || undefined}
      onClick={(e) => {
        if (blocked) return;
        onClick?.(e);
      }}
      {...pressHandlers}
      {...rest}
    >
      <span className="pa-btn__ring" aria-hidden />
      <span className="pa-btn__surface" aria-hidden />
      <span className="pa-btn__label">{children}</span>
      {/* State words: visible for success/error in every mode, and for loading when reduced. */}
      <span className="pa-btn__status" aria-hidden>
        <StatusGlyph status={shownStatus} />
        {shownStatus === "idle" ? "" : labels[shownStatus]}
      </span>
      <span className="pa-btn__glyph" aria-hidden>
        <svg className="pa-spin" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 3a9 9 0 0 1 9 9" />
        </svg>
      </span>
      <span className="pa-sr" role="status">
        {status === "idle" ? "" : labels[status]}
      </span>
    </button>
  );
}

function StatusGlyph({ status }: { status: ButtonStatus }) {
  if (status === "loading")
    return (
      <svg className="pa-btn__inline-icon pa-spin" viewBox="0 0 24 24" aria-hidden>
        <path d="M12 3a9 9 0 1 0 9 9" />
      </svg>
    );
  // Same lucide set as the toasts: circle-check (its tick draws in) and circle-alert.
  if (status === "success")
    return (
      <svg className="pa-btn__inline-icon pa-draw" viewBox="0 0 24 24" aria-hidden>
        <circle cx="12" cy="12" r="10" />
        <path d="m9 12 2 2 4-4" pathLength={1} />
      </svg>
    );
  if (status === "error") return <CircleAlertIcon className="pa-btn__inline-icon" aria-hidden />;
  return null;
}

/* ------------------------------------------------------------------------ */
/* StretchSwitch                                                             */
/* ------------------------------------------------------------------------ */

/**
 * Two-edge indicator on transforms only (compositor). The frame clips; three layers:
 *  L  translateX(--pa-l)      its box starts at the LEFT edge; overflow hidden + left radius
 *  C  translateX(-(--pa-l))   same spring as L → cancels L exactly, back to frame coords
 *  R  translateX(--pa-r)      a box whose RIGHT edge is the right edge; paint + right radius
 * Visible = L ∩ R = [left, right]. Each edge rides its own spring; nothing animates a length.
 */
function EdgeLayers() {
  return (
    <span className="pa-edge-l">
      <span className="pa-edge-c">
        <span className="pa-edge-r" />
      </span>
    </span>
  );
}

export function StretchSwitch(props: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root data-slot="switch" className="pa-switch" {...pressHandlers} {...props}>
      <SwitchPrimitive.Thumb data-slot="switch-thumb" className="pa-switch__knob">
        <EdgeLayers />
      </SwitchPrimitive.Thumb>
    </SwitchPrimitive.Root>
  );
}

/* ------------------------------------------------------------------------ */
/* TravelTabs — one pill, two edges (transform layers, see EdgeLayers)       */
/* ------------------------------------------------------------------------ */

export interface TabDef {
  value: string;
  label: string;
  count?: number;
}

export function TravelTabs({
  tabs,
  value,
  onValueChange,
  children,
  className,
}: {
  tabs: TabDef[];
  value: string;
  onValueChange: (v: string) => void;
  children?: React.ReactNode;
  className?: string;
}) {
  const listRef = React.useRef<HTMLDivElement>(null);
  const pillRef = React.useRef<HTMLSpanElement>(null);
  const lastLeft = React.useRef<number | null>(null);

  const measure = React.useCallback(() => {
    const list = listRef.current;
    const pill = pillRef.current;
    if (!list || !pill) return;
    const active = list.querySelector<HTMLElement>('[role="tab"][data-state="active"]');
    if (!active) return;
    const p = pill.getBoundingClientRect();
    const a = active.getBoundingClientRect();
    const l = a.left - p.left;
    const r = a.right - p.left; // right-edge position (not an inset)
    if (lastLeft.current !== null && l !== lastLeft.current) {
      list.dataset.paDir = l > lastLeft.current ? "right" : "left";
    }
    lastLeft.current = l;
    pill.style.setProperty("--pa-l", `${l}px`);
    pill.style.setProperty("--pa-r", `${r}px`);
  }, []);

  React.useLayoutEffect(measure, [value, measure]);
  React.useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    // Arm transitions only after the first placement (no slide-in on mount).
    const id = requestAnimationFrame(() => (list.dataset.ready = ""));
    const ro = new ResizeObserver(() => {
      delete list.dataset.ready;
      lastLeft.current = null;
      measure();
      requestAnimationFrame(() => (list.dataset.ready = ""));
    });
    ro.observe(list);
    return () => {
      cancelAnimationFrame(id);
      ro.disconnect();
    };
  }, [measure]);

  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={["pa-tabs", className].filter(Boolean).join(" ")}
      value={value}
      onValueChange={onValueChange}
    >
      <TabsPrimitive.List ref={listRef} data-slot="tabs-list" className="pa-tabs__list">
        <span ref={pillRef} className="pa-tabs__pill" aria-hidden>
          <EdgeLayers />
        </span>
        {tabs.map((t) => (
          <TabsPrimitive.Trigger key={t.value} value={t.value} className="pa-tabs__trigger">
            {t.label}
            {t.count !== undefined && t.count > 0 ? (
              <span className="pa-tabs__count">{t.count}</span>
            ) : null}
          </TabsPrimitive.Trigger>
        ))}
      </TabsPrimitive.List>
      {children}
    </TabsPrimitive.Root>
  );
}
export const TravelTabsContent = TabsPrimitive.Content;

/* ------------------------------------------------------------------------ */
/* RiseToast — prototype store (sonner-shaped API: toastA.success / .error)   */
/* ------------------------------------------------------------------------ */

type Tone = "success" | "error";
interface ToastItem {
  id: number;
  tone: Tone;
  title: string;
  description?: string;
  action?: ToastAction;
  state: "open" | "closed";
}
/** e.g. "Deshacer". Clicking runs it and dismisses the toast. */
export interface ToastAction {
  label: string;
  onClick: () => void;
}
type ToastOpts = { description?: string; persist?: boolean; action?: ToastAction };

let items: ToastItem[] = [];
let seq = 0;
const listeners = new Set<() => void>();
const timers = new Map<number, () => void>();
function emit(next: ToastItem[]) {
  items = next;
  commit(() => listeners.forEach((l) => l()));
}

function push(tone: Tone, title: string, opts: ToastOpts = {}) {
  const id = ++seq;
  emit([...items.slice(-2), { id, tone, title, description: opts.description, action: opts.action, state: "open" }]);
  if (!opts.persist) timers.set(id, after(tone === "error" ? T.toastError : T.toastSuccess, () => dismiss(id)));
  return id;
}

export function dismiss(id: number) {
  timers.get(id)?.();
  timers.delete(id);
  if (!items.some((t) => t.id === id && t.state === "open")) return;
  emit(items.map((t) => (t.id === id ? { ...t, state: "closed" } : t)));
  after(prefersReducedMotion() ? 120 : T.toastExit, () => emit(items.filter((t) => t.id !== id)));
}

/**
 * Toast rule (direction A): a toast is for REMOTE results the operator can't see where they
 * tapped — an action whose result lives elsewhere (assigned → another inbox) or a background
 * failure. Anything raised where the operator tapped (save ok / save failed) lives ONLY on
 * that control: the button already says "Guardada" or "No se guardó · Reintentar".
 */
export const toastA = {
  success: (title: string, o?: ToastOpts) => push("success", title, o),
  error: (title: string, o?: ToastOpts) => push("error", title, o),
  clear: () => {
    timers.forEach((c) => c());
    timers.clear();
    items = [];
    listeners.forEach((l) => l());
  },
};

function useToasts() {
  return React.useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => items,
    () => items,
  );
}

/** `offset` = distance from the bottom edge. Keep it above the thumb zone / bottom dock. */
export function RiseToaster({ offset = 96, inline }: { offset?: number; /** states sheet only */ inline?: boolean }) {
  const list = useToasts();
  React.useEffect(() => () => toastA.clear(), []);
  return (
    <section
      className="pa-toasts"
      data-inline={inline ? "" : undefined}
      aria-label="Avisos"
      style={{ "--pa-toast-offset": `${offset}px` } as React.CSSProperties}
    >
      {list.map((t) => (
        <div
          key={t.id}
          data-slot="toast"
          className="pa-toast"
          data-state={t.state}
          data-action={t.action ? "" : undefined}
          data-tone={t.tone}
          role={t.tone === "error" ? "alert" : "status"}
        >
          {t.tone === "success" ? (
            <CircleCheckIcon className="pa-toast__icon" aria-hidden />
          ) : (
            <CircleAlertIcon className="pa-toast__icon" aria-hidden />
          )}
          <div>
            <p className="pa-toast__title">{t.title}</p>
            {t.description ? <p className="pa-toast__desc">{t.description}</p> : null}
          </div>
          {t.action ? (
            <button
              type="button"
              className="pa-toast__action"
              onClick={() => {
                t.action?.onClick();
                dismiss(t.id);
              }}
            >
              {t.action.label}
            </button>
          ) : null}
          <button type="button" className="pa-toast__close" aria-label="Cerrar aviso" onClick={() => dismiss(t.id)}>
            <XIcon size={16} aria-hidden />
          </button>
        </div>
      ))}
    </section>
  );
}
