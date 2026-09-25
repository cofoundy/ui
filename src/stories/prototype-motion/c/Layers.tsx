import * as React from "react";
import { swapContent } from "./motion";

/**
 * Stacked content layers in one grid cell: the container is always as wide as its
 * widest layer, so swapping "Guardar respuesta rápida" → "Guardado" never moves layout.
 */
export function Layers({
  current,
  layers,
  className,
  as: Tag = "span",
}: {
  current: string;
  layers: Record<string, React.ReactNode>;
  className?: string;
  as?: "span" | "div";
}) {
  const ref = React.useRef<HTMLElement>(null);
  const prev = React.useRef(current);
  React.useLayoutEffect(() => {
    if (prev.current === current) return;
    const root = ref.current;
    if (!root) return;
    const pick = (k: string) => root.querySelector(`:scope > [data-layer="${k}"]`);
    swapContent(pick(prev.current), pick(current));
    prev.current = current;
  }, [current]);

  return (
    <Tag ref={ref as never} className={`cfc-layers ${className ?? ""}`}>
      {Object.entries(layers).map(([k, node]) => (
        <Tag
          key={k}
          data-layer={k}
          data-current={k === current ? "" : undefined}
          aria-hidden={k === current ? undefined : true}
        >
          {node}
        </Tag>
      ))}
    </Tag>
  );
}
