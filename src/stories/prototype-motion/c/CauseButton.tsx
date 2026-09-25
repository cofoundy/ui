import * as React from "react";
import { Check, RotateCw } from "lucide-react";
import { SPRINGS } from "../../../lib/spring";
import { Layers } from "./Layers";
import { SpringValue, after, reduced, springCSS } from "./motion";

export type ButtonPhase = "idle" | "loading" | "success" | "error";

export interface CauseButtonProps {
  phase: ButtonPhase;
  label: string;
  successLabel?: string;
  errorLabel?: string;
  tone?: "primary" | "outline";
  block?: boolean;
  /** Receives the button so a toast can emerge from it. */
  onPress: (el: HTMLButtonElement) => void;
  "data-proto"?: string;
}

const PRESS_SCALE = 0.97;
/** A tap shorter than this still shows the full press — feedback you can see. */
const MIN_PRESS_MS = 120;

/**
 * One element, four states. The label never leaves while working: a 2 px edge sweeps
 * along the bottom. On success the SAME button says "Guardado"; on error it offers the retry.
 */
export function CauseButton({
  phase,
  label,
  successLabel = "Guardado",
  errorLabel = "Reintentar",
  tone = "primary",
  block,
  onPress,
  ...rest
}: CauseButtonProps) {
  const btn = React.useRef<HTMLButtonElement>(null);
  const edge = React.useRef<HTMLSpanElement>(null);
  const bar = React.useRef<HTMLSpanElement>(null);
  const scale = React.useRef<SpringValue | null>(null);
  const pressedAt = React.useRef(0);
  const lastRest = React.useRef<"idle" | "error">("idle");

  if (phase === "idle" || phase === "error") lastRest.current = phase;
  const layer = phase === "loading" ? lastRest.current : phase;
  const busy = phase === "loading" || phase === "success";

  React.useEffect(() => {
    scale.current = new SpringValue(1, (v) => {
      if (btn.current) btn.current.style.transform = v === 1 ? "" : `scale(${v})`;
    });
    return () => scale.current?.stop();
  }, []);

  const press = () => {
    pressedAt.current = performance.now();
    scale.current?.set(PRESS_SCALE, SPRINGS.snappy);
  };
  const release = () => {
    if (!pressedAt.current) return;
    const held = performance.now() - pressedAt.current;
    pressedAt.current = 0;
    after(Math.max(0, MIN_PRESS_MS - held), () => scale.current?.set(1, SPRINGS.snappy));
  };

  // The edge: sweep while loading, complete (from wherever the sweep is) on success.
  const prevPhase = React.useRef<ButtonPhase>("idle");
  React.useLayoutEffect(() => {
    const b = bar.current;
    const e = edge.current;
    const from = prevPhase.current;
    prevPhase.current = phase;
    if (!b || !e || from === phase) return;
    // Where the sweep is right now, before it's cancelled — the fill starts there.
    const er = e.getBoundingClientRect();
    const br = b.getBoundingClientRect();
    const left = er.width ? Math.max(0, (br.left - er.left) / er.width) : 0;
    const width = er.width ? Math.min(1 - left, (br.right - Math.max(br.left, er.left)) / er.width) : 0;
    b.getAnimations().forEach((a) => a.cancel());
    const r = reduced();

    if (phase === "loading") {
      if (r) {
        b.dataset.mode = "fill";
        b.animate([{ opacity: 0.3 }, { opacity: 1 }], {
          duration: 700,
          direction: "alternate",
          iterations: Infinity,
          easing: "ease-in-out",
        });
      } else {
        b.dataset.mode = "sweep";
        b.animate([{ transform: "translateX(-100%)" }, { transform: "translateX(250%)" }], {
          duration: 1100,
          iterations: Infinity,
          easing: "cubic-bezier(0.45, 0, 0.55, 1)",
        });
      }
      return;
    }
    if (from !== "loading") return;
    b.dataset.mode = "fill";
    if (r) {
      b.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, easing: "linear" });
      return;
    }
    const s = springCSS(SPRINGS.snappy);
    const w = Math.max(0.12, width);
    b.animate(
      [{ transform: `translateX(${left * 100}%) scaleX(${w})` }, { transform: "translateX(0%) scaleX(1)" }],
      { duration: s.ms, easing: s.easing },
    );
    const hold = phase === "error" ? 900 : 420;
    b.animate([{ opacity: 1 }, { opacity: 1, offset: 0.6 }, { opacity: 0 }], {
      duration: hold,
      easing: "linear",
    });
  }, [phase]);

  return (
    <>
      <button
        ref={btn}
        type="button"
        data-slot="cause-button"
        data-proto={rest["data-proto"]}
        data-tone={tone}
        data-phase={phase}
        data-block={block ? "" : undefined}
        aria-busy={phase === "loading" || undefined}
        aria-disabled={busy || undefined}
        className="cfc-btn"
        onPointerDown={press}
        onPointerUp={release}
        onPointerLeave={release}
        onPointerCancel={release}
        onClick={() => {
          if (busy || !btn.current) return;
          onPress(btn.current);
        }}
      >
        <Layers
          current={layer}
          layers={{
            idle: <span className="cfc-btn-label">{label}</span>,
            success: (
              <span className="cfc-btn-label">
                <Check className="cfc-btn-check" strokeWidth={2.25} aria-hidden />
                {successLabel}
              </span>
            ),
            error: (
              <span className="cfc-btn-label">
                <RotateCw className="cfc-icon" strokeWidth={2.25} aria-hidden />
                {errorLabel}
              </span>
            ),
          }}
        />
        <span ref={edge} className="cfc-edge" aria-hidden>
          <span ref={bar} className="cfc-edge-bar" data-mode="sweep" />
        </span>
      </button>
      <span className="cfc-sr" role="status" aria-live="polite">
        {phase === "loading" ? "Procesando" : phase === "success" ? successLabel : ""}
      </span>
    </>
  );
}
