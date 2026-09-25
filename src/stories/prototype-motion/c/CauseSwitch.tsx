import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { Layers } from "./Layers";
import { LEAD, SpringValue, TRAIL } from "./motion";

/** Track inner width and knob size (px). The knob is drawn by clipping a full-width layer. */
const INNER = 42;
const KNOB = 22;

/**
 * A settings row where the switch and the sentence it controls move together: the knob
 * travels with two edges (leading stiffer, trailing softer), and the status line under the
 * title swaps with exit-before-enter timing. The row IS the tap target.
 */
export function CauseSwitchRow({
  id,
  title,
  checked,
  status,
  statusTone = "muted",
  onCheckedChange,
  "data-proto": proto,
}: {
  id: string;
  title: string;
  checked: boolean;
  /** Key + text of the status line; a new key triggers the swap. */
  status: { key: string; text: string };
  statusTone?: "muted" | "accent" | "error";
  onCheckedChange: (v: boolean) => void;
  "data-proto"?: string;
}) {
  const knob = React.useRef<HTMLSpanElement>(null);
  const L = React.useRef<SpringValue | null>(null);
  const R = React.useRef<SpringValue | null>(null);
  const texts = React.useRef<Record<string, { text: string; tone: string }>>({});
  texts.current[status.key] = { text: status.text, tone: statusTone };

  React.useEffect(() => {
    const paint = () => {
      const l = L.current?.value ?? 0;
      const r = R.current?.value ?? KNOB;
      if (knob.current) knob.current.style.clipPath = `inset(0px ${INNER - r}px 0px ${l}px round ${KNOB / 2}px)`;
    };
    const x = checked ? INNER - KNOB : 0;
    L.current = new SpringValue(x, paint);
    R.current = new SpringValue(x + KNOB, paint);
    paint();
    return () => {
      L.current?.stop();
      R.current?.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    const x = checked ? INNER - KNOB : 0;
    // Moving right, the right edge leads; moving left, the left edge leads.
    L.current?.set(x, checked ? TRAIL : LEAD);
    R.current?.set(x + KNOB, checked ? LEAD : TRAIL);
  }, [checked]);

  return (
    <label htmlFor={id} className="cfc-row cfc-row--switch" data-proto={proto}>
      <span className="cfc-row-text">
        <span className="cfc-row-title">{title}</span>
        <Layers
          className="cfc-row-status"
          current={status.key}
          layers={Object.fromEntries(
            Object.entries(texts.current).map(([k, v]) => [k, <span data-tone={v.tone}>{v.text}</span>]),
          )}
        />
      </span>
      <SwitchPrimitive.Root
        id={id}
        data-slot="cause-switch"
        checked={checked}
        onCheckedChange={onCheckedChange}
        className="cfc-switch"
      >
        <span ref={knob} className="cfc-knob" aria-hidden />
      </SwitchPrimitive.Root>
    </label>
  );
}
