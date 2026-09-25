import * as React from 'react';
import { flushSync } from 'react-dom';
import { CircleCheckIcon, OctagonXIcon } from 'lucide-react';
import { cn } from '../../../utils/cn';
import { B, SpringValue, capture, VelocityTracker, clamp, reducedMotion } from './physics';

type Kind = 'success' | 'error';
interface ToastData {
  id: number;
  kind: Kind;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  duration: number;
}
type Opts = Partial<Pick<ToastData, 'description' | 'action' | 'duration'>>;

let items: ToastData[] = [];
const leaving = new Set<number>();
let seq = 0;
const subs = new Set<(l: ToastData[]) => void>();
const depthSubs = new Map<number, (d: number) => void>();
function depthOf(id: number) {
  if (leaving.has(id)) return 0;
  const i = items.findIndex((t) => t.id === id);
  return items.slice(i + 1).filter((x) => !leaving.has(x.id)).length;
}
const emit = () => {
  subs.forEach((f) => flushSync(() => f(items))); // sync render: the enter spring starts this frame
  // Stack re-layout is driven imperatively — never waits on a React effect flush.
  items.forEach((t) => depthSubs.get(t.id)?.(depthOf(t.id)));
};

function push(kind: Kind, title: string, o: Opts = {}) {
  const t: ToastData = { id: ++seq, kind, title, duration: kind === 'error' ? 8000 : 4000, ...o };
  items = [...items, t].slice(-4);
  emit();
  return t.id;
}
/** The card behind is promoted the moment the front one starts leaving, not when it's gone. */
function markLeaving(id: number) {
  leaving.add(id);
  emit();
}
function remove(id: number) {
  leaving.delete(id);
  items = items.filter((t) => t.id !== id);
  emit();
}

/** Stubbed toast API (sonner-shaped): `thumbToast.success('Respuesta guardada')`. */
export const thumbToast = {
  success: (title: string, o?: Opts) => push('success', title, o),
  error: (title: string, o?: Opts) => push('error', title, o),
  clear: () => { items = []; leaving.clear(); emit(); },
};

/**
 * Toasts live next to the thumb (bottom, above the primary action), newest in front.
 * Swipe down or sideways: the card follows the finger 1:1; release past ~35 % or with a
 * flick and it leaves carrying the flick's velocity, otherwise it springs back.
 */
export function ThumbToaster({ className }: { className?: string }) {
  const [list, setList] = React.useState<ToastData[]>(items);
  React.useEffect(() => {
    subs.add(setList);
    return () => { subs.delete(setList); };
  }, []);
  return (
    <section
      aria-label="Notificaciones"
      aria-live="polite"
      data-slot="thumb-toaster"
      className={cn('pointer-events-none absolute inset-x-3 h-0', className)}
    >
      {list.map((t) => (
        <ToastItem key={t.id} t={t} depth={depthOf(t.id)} />
      ))}
    </section>
  );
}

function ToastItem({ t, depth }: { t: ToastData; depth: number }) {
  const el = React.useRef<HTMLDivElement>(null);
  const body = React.useRef<HTMLDivElement>(null);
  const st = React.useRef({ enter: 0, dx: 0, dy: 0, depth, h: 64, w: 340 });
  const gone = React.useRef(false);

  const paint = () => {
    const n = el.current;
    if (!n) return;
    const s = st.current;
    const y = (1 - s.enter) * (s.h + 24) + s.dy - s.depth * 10;
    const scale = 1 - Math.min(s.depth, 3) * 0.05;
    const drift = Math.max(Math.abs(s.dx) / s.w, Math.max(0, s.dy) / (s.h * 1.4));
    const depthFade = s.depth > 2 ? Math.max(0, 3 - s.depth) : 1;
    n.style.transform = `translate3d(${s.dx}px, ${y}px, 0) scale(${scale})`;
    n.style.opacity = String(clamp(s.enter, 0, 1) * (1 - clamp(drift, 0, 1)) * depthFade);
    // Cards behind show only their edge — their text would read through the one being dragged.
    if (body.current) body.current.style.opacity = String(1 - clamp(s.depth * 1.6, 0, 1));
  };
  const S = React.useMemo(() => ({
    enter: new SpringValue(0, (v) => { st.current.enter = v; paint(); }, B.toast, 0.002),
    dx: new SpringValue(0, (v) => { st.current.dx = v; paint(); }, B.snappy, 0.3),
    dy: new SpringValue(0, (v) => { st.current.dy = v; paint(); }, B.snappy, 0.3),
    depth: new SpringValue(depth, (v) => { st.current.depth = v; paint(); }, B.toast, 0.005),
  }), []); // eslint-disable-line react-hooks/exhaustive-deps

  React.useLayoutEffect(() => {
    const n = el.current!;
    st.current.h = n.offsetHeight;
    st.current.w = n.offsetWidth;
    paint();
    if (reducedMotion()) S.enter.set(1);
    else S.enter.to(1, { params: B.toast });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const depthRef = React.useRef(depth);
  React.useLayoutEffect(() => {
    depthSubs.set(t.id, (d) => {
      if (d === depthRef.current) return;
      depthRef.current = d;
      S.depth.to(d, { params: B.toast });
    });
    return () => { depthSubs.delete(t.id); };
  }, [t.id, S]);

  // Auto-dismiss on rAF time; paused while the finger is on it.
  const held = React.useRef(false);
  React.useEffect(() => {
    let last = performance.now();
    let left = t.duration;
    let id = 0;
    const tick = () => {
      const now = performance.now();
      if (!held.current && depthRef.current === 0) left -= now - last;
      last = now;
      if (left <= 0) return leave('down', 0);
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const leave = (dir: 'left' | 'right' | 'down', v: number) => {
    if (gone.current) return;
    gone.current = true;
    markLeaving(t.id);
    const done = () => remove(t.id);
    if (reducedMotion()) return done();
    const { w, h } = st.current;
    if (dir === 'down') S.dy.to(h + 48, { params: B.fling, velocity: Math.max(v, 0), onRest: done });
    else S.dx.to((dir === 'right' ? 1 : -1) * (w + 32), { params: B.fling, velocity: v, onRest: done });
  };

  // --- drag -----------------------------------------------------------------------
  const g = React.useRef<null | { x0: number; y0: number; axis: 'x' | 'y' | null; id: number; bx: number; by: number }>(null);
  const vt = React.useRef(new VelocityTracker());
  const onDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button')) return;
    capture(e.currentTarget, e.pointerId);
    held.current = true;
    S.dx.stop(); S.dy.stop();
    g.current = { x0: e.clientX, y0: e.clientY, axis: null, id: e.pointerId, bx: st.current.dx, by: st.current.dy };
    vt.current.reset(e.clientX, e.clientY);
  };
  const onMove = (e: React.PointerEvent) => {
    const s = g.current;
    if (!s || s.id !== e.pointerId) return;
    const dx = e.clientX - s.x0;
    const dy = e.clientY - s.y0;
    if (!s.axis) {
      if (Math.hypot(dx, dy) < 6) return;
      s.axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
    }
    vt.current.push(e.clientX, e.clientY);
    if (s.axis === 'x') S.dx.set(s.bx + dx);
    else {
      const y = s.by + dy;
      S.dy.set(y > 0 ? y : y * 0.2); // upward resists — that's not a dismiss direction
    }
  };
  const onUp = (e: React.PointerEvent) => {
    const s = g.current;
    g.current = null;
    held.current = false;
    if (!s || s.id !== e.pointerId || !s.axis) return;
    const { vx, vy } = vt.current.get();
    const { w, h } = st.current;
    if (s.axis === 'x') {
      const x = st.current.dx;
      if (Math.abs(x) > w * 0.35 || Math.abs(vx) > 650) leave(x + vx * 0.1 > 0 ? 'right' : 'left', vx);
      else S.dx.to(0, { params: B.snappy, velocity: vx });
    } else {
      const y = st.current.dy;
      if (y > h * 0.5 || vy > 500) leave('down', vy);
      else S.dy.to(0, { params: B.snappy, velocity: vy });
    }
  };

  const Icon = t.kind === 'success' ? CircleCheckIcon : OctagonXIcon;
  return (
    <div
      ref={el}
      role={t.kind === 'error' ? 'alert' : 'status'}
      data-slot="thumb-toast"
      data-kind={t.kind}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      style={{ zIndex: 10 - depth, opacity: 0, transformOrigin: '50% 100%' }}
      className={cn(
        'pointer-events-auto absolute inset-x-0 bottom-0 flex touch-none select-none items-center gap-3 rounded-2xl border py-3 pl-4 pr-2',
        'border-[var(--border)] bg-[var(--popover)] text-[var(--popover-foreground)] shadow-[var(--chat-shadow)]',
        depth > 0 && 'pointer-events-none',
      )}
    >
      <div ref={body} className="flex min-w-0 flex-1 items-center gap-3">
      <Icon
        aria-hidden
        className={cn('size-5 shrink-0', t.kind === 'success' ? 'text-[var(--status-success)]' : 'text-[var(--destructive)]')}
        strokeWidth={2.25}
      />
      <div className="min-w-0 flex-1">
        <p className="text-[15px] font-semibold leading-5">{t.title}</p>
        {t.description && <p className="mt-0.5 text-[13px] leading-[18px] text-[var(--muted-foreground)]">{t.description}</p>}
      </div>
      {t.action && (
        <button
          type="button"
          onClick={() => { t.action!.onClick(); leave('down', 0); }}
          className="h-11 shrink-0 rounded-xl px-3 text-[14px] font-semibold text-[var(--primary)] outline-none hover:bg-[var(--accent)] focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
        >
          {t.action.label}
        </button>
      )}
      </div>
    </div>
  );
}
