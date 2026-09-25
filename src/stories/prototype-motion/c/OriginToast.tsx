import * as React from "react";
import { CircleAlert, UserRoundCheck } from "lucide-react";
import { flushSync } from "react-dom";
import { CONTENT, TRAVEL, after, reduced, springCSS } from "./motion";

/**
 * Toasts only for what the button can't say by itself: an error, or a result that lives
 * somewhere else. Each one is born at the element you touched (its rect, its fill) and
 * travels to a dock above the thumb; it leaves downward.
 */
export interface ToastInput {
  origin?: HTMLElement | null;
  tone?: "neutral" | "error";
  title: string;
  detail?: string;
  action?: { label: string; onAction: () => void };
  /** ms; default 5000 (neutral) / 8000 (error). */
  ttl?: number;
}

interface OriginSnap {
  rect: DOMRect;
  radius: number;
  bg: string;
}

interface ToastRecord extends ToastInput {
  id: number;
  from: OriginSnap | null;
  leaving: boolean;
}

/** Exit rides the content spring (no overshoot): ~360 ms. */
const exitMs = () => springCSS(CONTENT).ms;
let seq = 0;
let items: ToastRecord[] = [];
const subs = new Set<() => void>();
const timers = new Map<number, () => void>();
const emit = () => subs.forEach((f) => f());

function snap(el: HTMLElement | null | undefined): OriginSnap | null {
  if (!el) return null;
  const cs = getComputedStyle(el);
  const bg = cs.backgroundColor;
  return {
    rect: el.getBoundingClientRect(),
    radius: parseFloat(cs.borderTopLeftRadius) || 12,
    bg: bg && bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent" ? bg : "",
  };
}

export function dismissToast(id: number) {
  const t = items.find((x) => x.id === id);
  if (!t || t.leaving) return;
  timers.get(id)?.();
  items = items.map((x) => (x.id === id ? { ...x, leaving: true } : x));
  emit();
  after(reduced() ? 160 : exitMs(), () => {
    items = items.filter((x) => x.id !== id);
    emit();
  });
}

/** Call inside an event handler or `later()` — the dock commits synchronously. */
export function showToast(input: ToastInput) {
  // One at a time: whatever is docked steps aside for the newer cause.
  items.filter((x) => !x.leaving).forEach((x) => dismissToast(x.id));
  const id = ++seq;
  items = [...items, { ...input, id, from: snap(input.origin), leaving: false }];
  emit();
  const ttl = input.ttl ?? (input.tone === "error" ? 8000 : 5000);
  timers.set(
    id,
    after(ttl, () => flushSync(() => dismissToast(id))),
  );
  return id;
}

export function resetToasts() {
  timers.forEach((c) => c());
  timers.clear();
  items = [];
  emit();
}

function useToasts() {
  return React.useSyncExternalStore(
    (f) => {
      subs.add(f);
      return () => subs.delete(f);
    },
    () => items,
    () => items,
  );
}

export function ToastSurface({
  tone = "neutral",
  title,
  detail,
  action,
  onAction,
}: Pick<ToastInput, "tone" | "title" | "detail" | "action"> & { onAction?: () => void }) {
  const Icon = tone === "error" ? CircleAlert : UserRoundCheck;
  return (
    <div className="cfc-toast-body">
      <Icon className="cfc-toast-icon" data-tone={tone} strokeWidth={2.25} aria-hidden />
      <div className="cfc-toast-text">
        <p className="cfc-toast-title">{title}</p>
        {detail ? <p className="cfc-toast-detail">{detail}</p> : null}
      </div>
      {action ? (
        <button type="button" className="cfc-toast-action" onClick={onAction ?? action.onAction}>
          {action.label}
        </button>
      ) : null}
    </div>
  );
}

function DockedToast({ t }: { t: ToastRecord }) {
  const wrap = React.useRef<HTMLDivElement>(null);
  const surface = React.useRef<HTMLDivElement>(null);
  const content = React.useRef<HTMLDivElement>(null);
  const plate = React.useRef<HTMLDivElement>(null);

  // Enter: FLIP from the origin's rect. The wrapper travels, the surface's clip grows
  // from the origin's size + radius, its fill morphs from the origin's fill; the text
  // waits until the shape is mostly there, then springs in.
  React.useLayoutEffect(() => {
    const w = wrap.current;
    const s = surface.current;
    const c = content.current;
    const p = plate.current;
    if (!w || !s || !c || !p) return;
    if (reduced() || !t.from) {
      w.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 160, easing: "linear" });
      return;
    }
    const end = w.getBoundingClientRect();
    const o = t.from.rect;
    const dx = o.left + o.width / 2 - (end.left + end.width / 2);
    const dy = o.top + o.height / 2 - (end.top + end.height / 2);
    const ix = Math.max(0, (end.width - o.width) / 2);
    const iy = Math.max(0, (end.height - o.height) / 2);
    const r = parseFloat(getComputedStyle(s).borderTopLeftRadius) || 14;
    const sp = springCSS(TRAVEL);
    w.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: "translate(0px, 0px)" }], {
      duration: sp.ms,
      easing: sp.easing,
    });
    const endBg = getComputedStyle(s).backgroundColor;
    s.animate(
      [
        {
          clipPath: `inset(${iy}px ${ix}px round ${t.from.radius}px)`,
          backgroundColor: t.from.bg || endBg,
        },
        // The origin's fill hands over early: the shape keeps travelling as a toast.
        { backgroundColor: endBg, offset: 0.35 },
        { clipPath: `inset(0px 0px round ${r}px)`, backgroundColor: endBg },
      ],
      { duration: sp.ms, easing: sp.easing },
    );
    const cs = springCSS(CONTENT);
    c.animate(
      [
        { opacity: 0, filter: "blur(3px)", transform: "translateY(4px)" },
        { opacity: 1, filter: "blur(0px)", transform: "translateY(0px)" },
      ],
      { duration: cs.ms, delay: 140, easing: cs.easing, fill: "backwards" },
    );
    p.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200, delay: 320, easing: "linear", fill: "backwards" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Exit: back down, out of the way of the thumb.
  React.useLayoutEffect(() => {
    if (!t.leaving || !wrap.current) return;
    const w = wrap.current;
    w.getAnimations().forEach((a) => a.cancel());
    if (reduced()) {
      w.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 160, easing: "linear", fill: "forwards" });
      return;
    }
    const sp = springCSS(CONTENT);
    w.animate(
      [
        { transform: "translateY(0px)", opacity: 1 },
        { transform: "translateY(calc(100% + 32px))", opacity: 0 },
      ],
      { duration: sp.ms, easing: sp.easing, fill: "forwards" },
    );
  }, [t.leaving]);

  return (
    <div
      ref={wrap}
      className="cfc-toast"
      data-slot="cause-toast"
      data-tone={t.tone ?? "neutral"}
      data-leaving={t.leaving ? "" : undefined}
      role={t.tone === "error" ? "alert" : "status"}
    >
      <div ref={plate} className="cfc-toast-plate" aria-hidden />
      <div ref={surface} className="cfc-toast-surface">
        <div ref={content}>
          <ToastSurface
            tone={t.tone}
            title={t.title}
            detail={t.detail}
            action={t.action}
            onAction={() => {
              t.action?.onAction();
              dismissToast(t.id);
            }}
          />
        </div>
      </div>
    </div>
  );
}

/** Mount once per screen. Bottom dock, centred, above the thumb. */
export function ToastDock() {
  const list = useToasts();
  React.useEffect(() => () => resetToasts(), []);
  return (
    <div className="cfc-dock" aria-live="polite">
      {list.map((t) => (
        <DockedToast key={t.id} t={t} />
      ))}
    </div>
  );
}
