import type { Meta, StoryObj } from "@storybook/react";
import { useCallback, useEffect, useState } from "react";

/**
 * PROTOTIPO — comparador de las 3 direcciones de motion (ui-architect, 2026-09-25).
 * Cada variante vive en su carpeta (a/ b/ c/); aquí solo se montan sus historias "Operador"
 * en un marco de 375 px con el switcher flotante. ← / → cambian de variante; `?variant=a|b|c`
 * en la URL del iframe sobrevive el reload.
 */
const VARIANTS = [
  { key: "a", label: "A — Morfar en sitio ★ recomendado", id: "prototype-motion-a-morfar-en-sitio--operador" },
  { key: "b", label: "B — Física directa", id: "prototype-motion-b-f%C3%ADsica-directa--operador" },
  { key: "c", label: "C — Causa y efecto", id: "prototype-motion-c-causa-y-efecto--operador" },
] as const;

function initialIndex() {
  if (typeof window === "undefined") return 0;
  const q = new URLSearchParams(window.location.search).get("variant");
  const saved = q ?? window.localStorage.getItem("proto-motion-variant");
  const i = VARIANTS.findIndex((v) => v.key === saved);
  return i < 0 ? 0 : i;
}

function Compare() {
  const [i, setI] = useState(initialIndex);
  const go = useCallback((d: number) => setI((n) => (n + d + VARIANTS.length) % VARIANTS.length), []);

  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("variant", VARIANTS[i].key);
    window.history.replaceState(null, "", url);
    window.localStorage.setItem("proto-motion-variant", VARIANTS[i].key);
  }, [i]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  const v = VARIANTS[i];
  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: "24px 0 96px", background: "var(--muted)" }}>
      <iframe
        key={v.key}
        title={v.label}
        src={`/iframe.html?viewMode=story&id=${v.id}`}
        style={{ width: 375, height: 812, border: 0, borderRadius: 32, boxShadow: "0 12px 40px rgb(0 0 0 / 0.25)", background: "var(--background)" }}
      />
      <div
        role="group"
        aria-label="Variantes del prototipo"
        style={{
          position: "fixed", bottom: 20, left: "50%", transform: "translateX(-50%)",
          display: "flex", alignItems: "center", gap: 8, padding: "6px 8px",
          borderRadius: 999, background: "rgb(17 17 17 / 0.92)", color: "#fff",
          font: "500 13px/1 var(--font-sans, system-ui)", boxShadow: "0 6px 24px rgb(0 0 0 / 0.3)", zIndex: 50,
        }}
      >
        <button aria-label="Variante anterior" onClick={() => go(-1)} style={pill}>‹</button>
        <span style={{ minWidth: 250, textAlign: "center" }}>{v.label}</span>
        <button aria-label="Variante siguiente" onClick={() => go(1)} style={pill}>›</button>
        <span style={{ opacity: 0.6, fontSize: 11, paddingRight: 6 }}>PROTOTIPO · datos de ejemplo</span>
      </div>
    </div>
  );
}

const pill: React.CSSProperties = {
  width: 36, height: 36, borderRadius: 999, border: 0, background: "rgb(255 255 255 / 0.12)",
  color: "#fff", fontSize: 18, cursor: "pointer",
};

const meta: Meta = {
  title: "Prototype/Motion/Compare",
  parameters: { layout: "fullscreen" },
};
export default meta;

export const Compare_: StoryObj = { name: "Compare", render: () => <Compare /> };
