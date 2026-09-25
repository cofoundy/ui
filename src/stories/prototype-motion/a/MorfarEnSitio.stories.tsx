import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";

import { VIEWPORT_MOBILE } from "../../_shared/viewports";
import {
  MorphButton,
  RiseToaster,
  StretchSwitch,
  TravelTabs,
  toastA,
  type ButtonPhase,
  type ButtonStatus,
} from "./components";
import { Operador } from "./Operador";
import { after, commit } from "./timeline";

/**
 * Direction A — "Morfar en sitio, CSS puro".
 * Every state change is the same element morphing; all movement = CSS transitions on
 * `--cf-spring-*` linear() tokens (Web Animations → seekable). JS only flips data-attributes
 * on the rAF clock. PROTOTIPO · datos de ejemplo.
 */
/**
 * The preview wrapper paints a hard-coded canvas color; every story here paints the TOKEN
 * background instead, so light/dark captures show the real canvas (and real contrast).
 * `paCanvas: "bare"` = full-bleed screens (Operador) that lay themselves out.
 */
const meta: Meta = {
  title: "Prototype/Motion/A — Morfar en sitio",
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story, ctx) => (
      <div
        className="pa-canvas"
        data-bare={ctx.parameters.paCanvas === "bare" ? "" : undefined}
      >
        <Story />
      </div>
    ),
  ],
};
export default meta;
type Story = StoryObj;

/* ---------------------------------------------------------------- Operador */

export const Operador_: Story = {
  name: "Operador",
  parameters: { paCanvas: "bare", viewport: VIEWPORT_MOBILE },
  render: () => <Operador />,
};

export const OperadorSinConexion: Story = {
  name: "Operador · sin conexión",
  parameters: { paCanvas: "bare", viewport: VIEWPORT_MOBILE },
  render: () => <Operador fail />,
};

export const OperadorPendientesVacio: Story = {
  name: "Operador · pendientes vacío",
  parameters: { paCanvas: "bare", viewport: VIEWPORT_MOBILE },
  render: () => <Operador initialTab="pendientes" initialOperator />,
};

export const OperadorErrorCarga: Story = {
  name: "Operador · error al cargar",
  parameters: { paCanvas: "bare", viewport: VIEWPORT_MOBILE },
  render: () => <Operador initialTab="cerradas" cerradasError />,
};

/* ------------------------------------------------------------- Primitives */

function useStubbedSave(requestMs = 900) {
  const [status, setStatus] = React.useState<ButtonStatus>("idle");
  const cancels = React.useRef<Array<() => void>>([]);
  React.useEffect(() => () => cancels.current.forEach((c) => c()), []);
  const reset = () => setStatus("idle");
  const run = () => {
    setStatus("loading");
    cancels.current.push(
      after(requestMs, () => {
        // "Guardada" persists — it only goes back to idle when the content changes.
        commit(() => setStatus("success"));
      }),
    );
  };
  return { status, run, reset };
}

export const Boton: Story = {
  name: "Botón · cargando → listo",
  render: () => {
    const { status, run } = useStubbedSave();
    return (
      <MorphButton status={status} onClick={run}>
        Guardar respuesta rápida
      </MorphButton>
    );
  },
};

/** 120 ms request: the spinner still holds T.minLoading (350 ms) so it doesn't flicker. */
export const BotonRapido: Story = {
  name: "Botón · guardado rápido",
  render: () => {
    const { status, run } = useStubbedSave(120);
    return (
      <MorphButton status={status} onClick={run}>
        Guardar respuesta rápida
      </MorphButton>
    );
  },
};

export const Interruptor: Story = {
  name: "Interruptor",
  render: () => {
    const [on, setOn] = React.useState(false);
    return (
      <label style={{ display: "flex", alignItems: "center", gap: 16, font: "500 15px var(--font-sans)", color: "var(--foreground)" }}>
        Modo operador · pausa la IA en todas tus conversaciones
        <StretchSwitch checked={on} onCheckedChange={setOn} />
      </label>
    );
  },
};

export const Pestanas: Story = {
  name: "Pestañas",
  render: () => {
    const [v, setV] = React.useState("abiertas");
    return (
      <div style={{ width: 343 }}>
        <TravelTabs
          value={v}
          onValueChange={setV}
          tabs={[
            { value: "abiertas", label: "Abiertas", count: 6 },
            { value: "pendientes", label: "Pendientes" },
            { value: "cerradas", label: "Cerradas", count: 24 },
          ]}
        />
      </div>
    );
  },
};

/** The result lives elsewhere (Lucía's inbox) → a toast, with the way back. */
const assignToast = (persist = false) =>
  toastA.success("Asignada a Lucía", {
    description: "María Fernanda Quispe ya está en su bandeja.",
    action: { label: "Deshacer", onClick: () => {} },
    persist,
  });

export const Aviso: Story = {
  name: "Aviso · entrada",
  parameters: { viewport: VIEWPORT_MOBILE },
  render: () => (
    <>
      <MorphButton onClick={() => assignToast(true)}>Asignar a Lucía</MorphButton>
      <RiseToaster />
    </>
  ),
};

export const AvisoSalida: Story = {
  name: "Aviso · salida",
  parameters: { viewport: VIEWPORT_MOBILE },
  render: () => {
    React.useEffect(() => {
      queueMicrotask(() => assignToast(true));
    }, []);
    return (
      <>
        <span style={{ font: "400 13px var(--font-sans)", color: "var(--muted-foreground)" }}>Toca la X del aviso</span>
        <RiseToaster />
      </>
    );
  },
};

/* ------------------------------------------------------------ States sheet */

const PHASES: Array<[ButtonPhase, string]> = [
  ["idle", "Reposo"],
  ["exit", "Etiqueta sale (80 ms)"],
  ["loading", "Cargando"],
  ["success", "Guardada (persiste)"],
  ["error", "Error · reintento"],
];

export const Estados: Story = {
  name: "Estados",
  render: () => (
    <div className="pa-sheet" data-slot="states">
      <section className="pa-sheet__group">
        <h3 className="pa-sheet__h">Botón</h3>
        <div className="pa-sheet__row">
          {PHASES.map(([p, label]) => (
            <div className="pa-sheet__cell" key={p}>
              <MorphButton forcePhase={p}>Guardar respuesta</MorphButton>
              {label}
            </div>
          ))}
          <div className="pa-sheet__cell">
            <MorphButton disabled>Guardar respuesta</MorphButton>
            Deshabilitado
          </div>
        </div>
      </section>
      <section className="pa-sheet__group">
        <h3 className="pa-sheet__h">Interruptor</h3>
        <div className="pa-sheet__row">
          <div className="pa-sheet__cell"><StretchSwitch checked={false} />Apagado</div>
          <div className="pa-sheet__cell"><StretchSwitch checked />Encendido</div>
          <div className="pa-sheet__cell"><StretchSwitch checked={false} data-pressed="" />Presionado</div>
          <div className="pa-sheet__cell"><StretchSwitch disabled checked />Deshabilitado</div>
        </div>
      </section>
      <section className="pa-sheet__group">
        <h3 className="pa-sheet__h">Pestañas</h3>
        <div style={{ width: 343 }}>
          <TravelTabs
            value="pendientes"
            onValueChange={() => {}}
            tabs={[
              { value: "abiertas", label: "Abiertas", count: 6 },
              { value: "pendientes", label: "Pendientes" },
              { value: "cerradas", label: "Cerradas", count: 24 },
            ]}
          />
        </div>
      </section>
      <section className="pa-sheet__group">
        <h3 className="pa-sheet__h">Aviso</h3>
        <StaticToasts />
      </section>
    </div>
  ),
};

function StaticToasts() {
  React.useEffect(() => {
    queueMicrotask(() => {
      assignToast(true);
      toastA.error("No se guardó la respuesta", { description: "Revisa tu conexión y vuelve a intentarlo. Tu texto sigue aquí.", persist: true });
    });
  }, []);
  return <RiseToaster inline />; // sheet only: in flow, so it covers nothing
}
