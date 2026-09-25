import * as React from 'react';
import { cn } from '../../../utils/cn';
import { B, SpringValue, capture, VelocityTracker, clamp, rubber } from './physics';

export interface DragSwitchProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (v: boolean) => void;
  disabled?: boolean;
  id?: string;
  'aria-labelledby'?: string;
  'aria-label'?: string;
  'aria-describedby'?: string;
  className?: string;
}

// Geometry (px). Track 52×32, knob 26, inset 3 → travel 20.
const TRACK_W = 52;
const KNOB = 26;
const INSET = 3;
const TRAVEL = TRACK_W - KNOB - INSET * 2;
const STRETCH = 6; // knob widens while held — the finger "has" it

/**
 * The knob is the value. Drag it and it follows the finger 1:1 (rubber-banded past the
 * ends); let go and it springs from where it is, carrying the release velocity, to the
 * side it was thrown toward. Tap anywhere on the 44 px hit area toggles.
 */
export function DragSwitch({
  checked: controlled,
  defaultChecked = false,
  onCheckedChange,
  disabled,
  className,
  ...aria
}: DragSwitchProps) {
  const [inner, setInner] = React.useState(defaultChecked);
  const checked = controlled ?? inner;
  const knob = React.useRef<HTMLSpanElement>(null);
  const fill = React.useRef<HTMLSpanElement>(null);
  const checkedRef = React.useRef(checked);
  checkedRef.current = checked;

  const paint = React.useRef({ x: checked ? TRAVEL : 0, held: 0 });
  const render = () => {
    const { x, held } = paint.current;
    const p = clamp(x / TRAVEL, 0, 1);
    if (fill.current) fill.current.style.opacity = String(p);
    if (knob.current) {
      // Widen toward the free side: grow width, shift left by the part that must not cross the end.
      const w = KNOB + STRETCH * held;
      knob.current.style.width = `${w}px`;
      knob.current.style.transform = `translateX(${x - (w - KNOB) * p}px)`;
    }
  };
  const pos = React.useMemo(() => new SpringValue(paint.current.x, (x) => { paint.current.x = x; render(); }, B.snappy, 0.05), []);
  const held = React.useMemo(() => new SpringValue(0, (h) => { paint.current.held = h; render(); }, B.pressIn, 0.002), []);

  React.useLayoutEffect(render, []);
  // External changes (controlled, keyboard) animate to the new side.
  React.useEffect(() => {
    if (!drag.current) pos.to(checked ? TRAVEL : 0, { params: B.snappy });
  }, [checked, pos]);

  const commit = (v: boolean) => {
    if (controlled === undefined) setInner(v);
    if (v !== checkedRef.current) onCheckedChange?.(v);
  };

  const drag = React.useRef<null | { startX: number; startPos: number; moved: boolean; id: number }>(null);
  const vt = React.useRef(new VelocityTracker());

  const onDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (disabled || (e.pointerType === 'mouse' && e.button !== 0)) return;
    capture(e.currentTarget, e.pointerId);
    drag.current = { startX: e.clientX, startPos: pos.value, moved: false, id: e.pointerId };
    vt.current.reset(e.clientX, 0);
    pos.stop();
    held.to(1, { params: B.pressIn });
  };
  const onMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const dx = e.clientX - d.startX;
    if (!d.moved && Math.abs(dx) < 3) return;
    d.moved = true;
    vt.current.push(e.clientX, 0);
    pos.set(rubber(d.startPos + dx, 0, TRAVEL, 0.25)); // 1:1 with the finger
  };
  const onUp = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    held.to(0, { params: B.snappy });
    if (!d.moved) {
      // Tap: toggle, starting from rest.
      const next = !checkedRef.current;
      commit(next);
      pos.to(next ? TRAVEL : 0, { params: B.snappy, velocity: 0 });
      return;
    }
    const { vx } = vt.current.get();
    // Project where a throw would land (~100 ms of momentum) and pick that side.
    const next = pos.value + vx * 0.1 > TRAVEL / 2;
    commit(next);
    pos.to(next ? TRAVEL : 0, { params: B.snappy, velocity: vx });
  };
  const onCancel = () => {
    if (!drag.current) return;
    drag.current = null;
    held.to(0, { params: B.snappy });
    pos.to(checkedRef.current ? TRAVEL : 0, { params: B.snappy });
  };

  return (
    <button
      type="button"
      role="switch"
      data-slot="drag-switch"
      aria-checked={checked}
      disabled={disabled}
      {...aria}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onCancel}
      onClick={(e) => e.preventDefault()}
      onKeyDown={(e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          commit(!checkedRef.current);
        }
      }}
      className={cn(
        // 56×44 hit area around a 52×32 track.
        'group relative inline-flex h-11 w-14 shrink-0 cursor-pointer touch-none select-none items-center justify-center rounded-full outline-none',
        '[-webkit-tap-highlight-color:transparent] disabled:cursor-not-allowed',
        className,
      )}
    >
      <span
        className={cn(
          'relative block h-8 w-[52px] overflow-hidden rounded-full bg-[var(--input)] ring-1 ring-inset ring-[var(--border)]',
          'group-focus-visible:ring-2 group-focus-visible:ring-[var(--ring)] group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-[var(--background)]',
          'group-disabled:opacity-50',
        )}
      >
        <span ref={fill} aria-hidden className="absolute inset-0 rounded-full bg-[var(--primary)] opacity-0" />
        <span
          ref={knob}
          aria-hidden
          className="absolute left-[3px] top-[3px] h-[26px] w-[26px] rounded-full bg-[var(--primary-foreground)] shadow-md ring-1 ring-[var(--border)]"
        />
      </span>
    </button>
  );
}
