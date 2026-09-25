import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { LEAD, SpringValue, TRAIL, swapContent } from "./motion";

export interface CauseTab {
  value: string;
  label: string;
  count: number;
  content: React.ReactNode;
}

/** Base width the indicator is authored at; its visible width comes from scaleX. */
const BASE = 100;

/**
 * Underline tabs. The indicator is one 2 px element whose two edges ride two springs:
 * the edge nearest the destination leads, the other trails, so it stretches toward
 * the tab you touched and settles under it. Panels swap exit-before-enter.
 */
export function CauseTabs({
  tabs,
  value,
  onValueChange,
  label,
}: {
  tabs: CauseTab[];
  value: string;
  onValueChange: (v: string) => void;
  label: string;
}) {
  const list = React.useRef<HTMLDivElement>(null);
  const ind = React.useRef<HTMLSpanElement>(null);
  const panels = React.useRef<HTMLDivElement>(null);
  const L = React.useRef<SpringValue | null>(null);
  const R = React.useRef<SpringValue | null>(null);
  const prev = React.useRef(value);

  const target = React.useCallback((v: string) => {
    const l = list.current;
    const inner = l?.querySelector<HTMLElement>(`[data-value="${v}"] .cfc-tab-inner`);
    if (!l || !inner) return null;
    const lr = l.getBoundingClientRect();
    const r = inner.getBoundingClientRect();
    return { left: r.left - lr.left + l.scrollLeft, right: r.right - lr.left + l.scrollLeft };
  }, []);

  React.useLayoutEffect(() => {
    const paint = () => {
      const l = L.current?.value ?? 0;
      const r = R.current?.value ?? 0;
      if (ind.current) ind.current.style.transform = `translateX(${l}px) scaleX(${Math.max(0, r - l) / BASE})`;
    };
    const t = target(value) ?? { left: 0, right: 0 };
    L.current = new SpringValue(t.left, paint);
    R.current = new SpringValue(t.right, paint);
    paint();
    const ro = new ResizeObserver(() => {
      const t2 = target(prev.current);
      if (t2) {
        L.current?.jump(t2.left);
        R.current?.jump(t2.right);
      }
    });
    if (list.current) ro.observe(list.current);
    return () => {
      ro.disconnect();
      L.current?.stop();
      R.current?.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useLayoutEffect(() => {
    if (prev.current === value) return;
    const t = target(value);
    const from = L.current?.value ?? 0;
    if (t) {
      const right = t.left > from;
      L.current?.set(t.left, right ? TRAIL : LEAD);
      R.current?.set(t.right, right ? LEAD : TRAIL);
    }
    const root = panels.current;
    const pick = (k: string) => root?.querySelector(`:scope > [data-panel="${k}"]`) ?? null;
    swapContent(pick(prev.current), pick(value));
    prev.current = value;
  }, [value, target]);

  return (
    <TabsPrimitive.Root value={value} onValueChange={onValueChange} className="cfc-tabs" data-slot="cause-tabs">
      <TabsPrimitive.List ref={list} aria-label={label} className="cfc-tablist">
        {tabs.map((t) => (
          <TabsPrimitive.Trigger
            key={t.value}
            value={t.value}
            data-value={t.value}
            data-proto={`tab-${t.value}`}
            className="cfc-tab"
          >
            <span className="cfc-tab-inner">
              {t.label}
              <span className="cfc-count" aria-label={`${t.count} conversaciones`}>
                {t.count}
              </span>
            </span>
          </TabsPrimitive.Trigger>
        ))}
        <span ref={ind} className="cfc-indicator" aria-hidden />
      </TabsPrimitive.List>
      <div ref={panels} className="cfc-panels">
        {tabs.map((t) => (
          <TabsPrimitive.Content
            key={t.value}
            value={t.value}
            forceMount
            data-panel={t.value}
            data-current={t.value === value ? "" : undefined}
            aria-hidden={t.value === value ? undefined : true}
            inert={t.value === value ? undefined : true}
            className="cfc-panel"
          >
            {t.content}
          </TabsPrimitive.Content>
        ))}
      </div>
    </TabsPrimitive.Root>
  );
}
