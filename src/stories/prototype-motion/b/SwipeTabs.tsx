import * as React from 'react';
import { cn } from '../../../utils/cn';
import { B, SpringValue, capture, VelocityTracker, clamp, rubber } from './physics';

export interface SwipeTab {
  id: string;
  label: string;
  count?: number;
  content: React.ReactNode;
}

export interface SwipeTabsProps {
  tabs: SwipeTab[];
  defaultIndex?: number;
  onChange?: (i: number) => void;
  className?: string;
  /** Class for the swipeable viewport (give it a height). */
  panelClassName?: string;
  'aria-label'?: string;
}

const PAD = 4; // tablist inner padding (p-1)
const GUTTER = 24; // space between panels while swiping (gap-6)

/**
 * One gesture surface: swipe the CONTENT sideways and the indicator travels with it,
 * 1:1 (content moved by one panel width = indicator moved by one tab). Release springs
 * from where both are, carrying the finger's velocity. Tapping a tab moves the two
 * indicator edges on two springs — the leading edge stiffer, so the pill stretches
 * toward the target and settles. Retargeting mid-flight keeps position + velocity.
 */
export function SwipeTabs({ tabs, defaultIndex = 0, onChange, className, panelClassName, ...aria }: SwipeTabsProps) {
  const n = tabs.length;
  const uid = React.useId();
  const [active, setActive] = React.useState(defaultIndex);
  const activeRef = React.useRef(defaultIndex);
  const list = React.useRef<HTMLDivElement>(null);
  const overlay = React.useRef<HTMLDivElement>(null);
  const viewport = React.useRef<HTMLDivElement>(null);
  const track = React.useRef<HTMLDivElement>(null);
  const geo = React.useRef({ inner: 0, tab: 0, vw: 0 });
  const edge = React.useRef({ l: 0, r: 0 });

  const paintIndicator = () => {
    const el = overlay.current;
    if (!el) return;
    const { inner } = geo.current;
    const { l, r } = edge.current;
    el.style.clipPath = `inset(0px ${Math.max(0, inner - r)}px 0px ${Math.max(0, l)}px round 10px)`;
  };
  const left = React.useMemo(() => new SpringValue(0, (v) => { edge.current.l = v; paintIndicator(); }, B.trail, 0.1), []);
  const right = React.useMemo(() => new SpringValue(0, (v) => { edge.current.r = v; paintIndicator(); }, B.lead, 0.1), []);
  const trackX = React.useMemo(
    () => new SpringValue(0, (x) => track.current && (track.current.style.transform = `translate3d(${x}px,0,0)`), B.track, 0.2),
    [],
  );

  const layout = React.useCallback(() => {
    const L = list.current;
    const V = viewport.current;
    if (!L || !V) return;
    const inner = L.clientWidth - PAD * 2;
    geo.current = { inner, tab: inner / n, vw: V.clientWidth + GUTTER }; // vw = one panel step
    const i = activeRef.current;
    left.set(i * geo.current.tab);
    right.set((i + 1) * geo.current.tab);
    trackX.set(-i * geo.current.vw);
  }, [n, left, right, trackX]);

  React.useLayoutEffect(() => {
    layout();
    const ro = new ResizeObserver(layout);
    if (list.current) ro.observe(list.current);
    if (viewport.current) ro.observe(viewport.current);
    return () => ro.disconnect();
  }, [layout]);

  /** Go to tab i. `vIdx` = velocity in tabs/s from a swipe (else each spring keeps its own). */
  const select = (i: number, vIdx?: number) => {
    const { tab, vw } = geo.current;
    const goingRight = i * tab >= edge.current.l;
    const vEdge = vIdx === undefined ? undefined : vIdx * tab;
    right.to((i + 1) * tab, { params: goingRight ? B.lead : B.trail, velocity: vEdge });
    left.to(i * tab, { params: goingRight ? B.trail : B.lead, velocity: vEdge });
    trackX.to(-i * vw, { params: B.track, velocity: vIdx === undefined ? undefined : -vIdx * vw });
    if (i !== activeRef.current) {
      activeRef.current = i;
      setActive(i);
      onChange?.(i);
    }
  };

  // --- swipe on content -------------------------------------------------------------
  const g = React.useRef<null | { x0: number; y0: number; t0: number; axis: 'x' | 'y' | null; id: number; from: number }>(null);
  const vt = React.useRef(new VelocityTracker());
  const onDown = (e: React.PointerEvent) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    g.current = { x0: e.clientX, y0: e.clientY, t0: trackX.value, axis: null, id: e.pointerId, from: activeRef.current };
    vt.current.reset(e.clientX, e.clientY);
  };
  const onMove = (e: React.PointerEvent) => {
    const s = g.current;
    if (!s || s.id !== e.pointerId) return;
    const dx = e.clientX - s.x0;
    const dy = e.clientY - s.y0;
    if (!s.axis) {
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
      s.axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
      if (s.axis === 'y') return; // let the list scroll natively (touch-action: pan-y)
      capture(e.currentTarget, e.pointerId);
      // Grab whatever is in flight — the finger takes it from where it IS.
      s.t0 = trackX.value;
      s.x0 = e.clientX;
      trackX.stop(); left.stop(); right.stop();
    }
    if (s.axis !== 'x') return;
    vt.current.push(e.clientX, e.clientY);
    const { vw, tab } = geo.current;
    const x = rubber(s.t0 + (e.clientX - s.x0), -(n - 1) * vw, 0, 0.3);
    trackX.set(x);
    const p = -x / vw; // fractional tab index
    left.set(p * tab);
    right.set((p + 1) * tab);
  };
  const onUp = (e: React.PointerEvent) => {
    const s = g.current;
    g.current = null;
    if (!s || s.id !== e.pointerId || s.axis !== 'x') return;
    const { vw } = geo.current;
    const { vx } = vt.current.get();
    const projected = trackX.value + vx * 0.15;
    const i = clamp(Math.round(-projected / vw), Math.max(0, s.from - 1), Math.min(n - 1, s.from + 1));
    select(i, -vx / vw);
  };

  const onKey = (e: React.KeyboardEvent) => {
    const i = activeRef.current;
    const next = e.key === 'ArrowRight' ? i + 1 : e.key === 'ArrowLeft' ? i - 1 : e.key === 'Home' ? 0 : e.key === 'End' ? n - 1 : null;
    if (next === null) return;
    e.preventDefault();
    const j = clamp(next, 0, n - 1);
    select(j);
    list.current?.querySelectorAll<HTMLButtonElement>('[role=tab]')[j]?.focus();
  };

  const labels = (tone: 'base' | 'on') =>
    tabs.map((t, i) => (
      <span key={t.id} className="flex items-center justify-center gap-1.5 truncate px-2">
        <span className="truncate">{t.label}</span>
        {t.count !== undefined && (
          <span
            className={cn(
              'font-mono text-[12px] tabular-nums',
              tone === 'on' ? 'text-[var(--muted-foreground)]' : 'opacity-70',
            )}
          >
            {t.count}
          </span>
        )}
      </span>
    ));

  return (
    <div data-slot="swipe-tabs" className={cn('flex min-h-0 flex-col gap-3', className)}>
      <div
        ref={list}
        role="tablist"
        aria-label={aria['aria-label']}
        onKeyDown={onKey}
        className="relative grid h-11 shrink-0 select-none rounded-[14px] bg-[var(--muted)] p-1 text-[14px] font-medium"
        style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}
      >
        {tabs.map((t, i) => (
          <button
            key={t.id}
            role="tab"
            type="button"
            id={`${uid}-tab-${i}`}
            aria-selected={active === i}
            aria-controls={`${uid}-panel-${i}`}
            tabIndex={active === i ? 0 : -1}
            onClick={() => select(i)}
            className="relative z-10 rounded-[10px] text-[var(--muted-foreground)] outline-none [-webkit-tap-highlight-color:transparent] focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
          >
            <span className="sr-only">{t.label}{t.count !== undefined ? `, ${t.count}` : ''}</span>
          </button>
        ))}
        {/* Muted labels under, the active copy above — the pill IS a clip of the active copy. */}
        <div aria-hidden className="pointer-events-none absolute inset-1 grid text-[var(--muted-foreground)]" style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}>
          {labels('base')}
        </div>
        <div
          ref={overlay}
          aria-hidden
          data-slot="swipe-tabs-indicator"
          className="pointer-events-none absolute inset-1 grid rounded-[10px] bg-[var(--background)] text-[var(--foreground)]"
          style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))`, clipPath: 'inset(0 100% 0 0)' }}
        >
          {labels('on')}
        </div>
      </div>

      <div
        ref={viewport}
        data-slot="swipe-tabs-viewport"
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        className={cn('relative min-h-0 flex-1 touch-pan-y overflow-hidden', panelClassName)}
      >
        <div ref={track} className="flex h-full w-full gap-6">
          {tabs.map((t, i) => (
            <div
              key={t.id}
              role="tabpanel"
              id={`${uid}-panel-${i}`}
              aria-labelledby={`${uid}-tab-${i}`}
              aria-hidden={active !== i}
              ref={(el) => { if (el) (el as HTMLElement & { inert: boolean }).inert = active !== i; }}
              className="h-full w-full shrink-0 overflow-y-auto overscroll-contain"
            >
              {t.content}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
