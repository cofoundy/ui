import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { ChevronLeft } from "lucide-react";
import { VIEWPORT_MOBILE } from "../../_shared/viewports";
import { CauseButton, type ButtonPhase } from "./CauseButton";
import { CauseSwitchRow } from "./CauseSwitch";
import { CauseTabs } from "./CauseTabs";
import { Layers } from "./Layers";
import { ToastDock, ToastSurface, showToast, dismissToast } from "./OriginToast";
import { later } from "./motion";
import "./causa.css";

/* PROTOTIPO · datos de ejemplo */
const CONTACT = "María José Quispe Huamán de la Cruz";
const ABIERTAS = [
  { t: "¿Tienen la talla M en el polo de lino arena?", m: "Tú · WhatsApp", d: "10:42" },
  { t: "Cambio de dirección de envío para el pedido 4821", m: "IA · WhatsApp", d: "ayer" },
];
const CERRADAS = [
  ["Consulta por envío a Arequipa", "12 sep"],
  ["Pedido 4790 entregado, confirmación de recepción", "9 sep"],
  ["Descuento por compra al por mayor (12 unidades)", "2 sep"],
  ["¿Aceptan Yape o Plin?", "28 ago"],
  ["Reclamo: la casaca llegó con el cierre roto", "21 ago"],
  ["Horario de la tienda de Miraflores", "15 ago"],
  ["Cambio de talla del jean mom fit", "9 ago"],
  ["Pedido 4533, factura a nombre de empresa", "1 ago"],
  ["Stock de polos básicos en negro", "25 jul"],
  ["¿Hacen envíos a Cusco?", "18 jul"],
  ["Seguimiento del pedido 4402", "11 jul"],
  ["Consulta por la nueva colección de invierno", "3 jul"],
  ["Devolución aprobada, reembolso en 5 días", "26 jun"],
  ["Primer mensaje: ¿dónde están ubicados?", "20 jun"],
];
const REPLY =
  "Hacemos envíos a todo Lima en 24 a 48 horas. A provincias, de 3 a 5 días hábiles por Olva Courier.";
/** Fake latency (rAF-timed, so the filmstrip is deterministic). */
const LATENCY = 850;

type Net = "ok" | "offline";

function ClosedPanel({ state, onRetry }: { state: "loading" | "ready" | "error"; onRetry: () => void }) {
  return (
    <Layers
      as="div"
      current={state}
      layers={{
        loading: (
          <div className="cfc-skel-wrap" aria-label="Cargando conversaciones cerradas">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="cfc-skel">
                <span style={{ width: `${78 - i * 9}%` }} />
                <span />
              </div>
            ))}
          </div>
        ),
        ready: (
          <ul className="cfc-list">
            {CERRADAS.map(([t, d]) => (
              <li key={t} className="cfc-item">
                <span className="cfc-item-title">{t}</span>
                <span className="cfc-item-date">{d}</span>
                <span className="cfc-item-meta">Cerrada</span>
              </li>
            ))}
          </ul>
        ),
        error: (
          <div className="cfc-empty">
            <p className="cfc-empty-title">No se pudo cargar el historial</p>
            <p className="cfc-empty-text">Sin conexión. Lo demás de la conversación sigue funcionando.</p>
            <button type="button" className="cfc-inline-action" onClick={onRetry}>
              Volver a cargar
            </button>
          </div>
        ),
      }}
    />
  );
}

function OperatorScreen({ initialNet = "ok" }: { initialNet?: Net }) {
  const [net, setNet] = React.useState<Net>(initialNet);
  const netRef = React.useRef(net);
  netRef.current = net;

  // Modo operador
  const [operator, setOperator] = React.useState(false);
  const [opStatus, setOpStatus] = React.useState<"off" | "on" | "fail-on" | "fail-off">("off");
  const onOperator = (v: boolean) => {
    setOperator(v);
    setOpStatus(v ? "on" : "off");
    if (netRef.current === "offline") {
      later(700, () => {
        setOperator(!v);
        setOpStatus(v ? "fail-on" : "fail-off");
      });
    }
  };
  const opText = {
    off: { text: "La IA responde por ti", tone: "muted" as const },
    on: { text: "Tú respondes · la IA está en pausa", tone: "accent" as const },
    "fail-on": { text: "No se pudo activar. La IA sigue respondiendo", tone: "error" as const },
    "fail-off": { text: "No se pudo desactivar. Sigues respondiendo tú", tone: "error" as const },
  }[opStatus];

  // Asignar a Lucía — the result lives in Lucía's inbox, so it earns a toast.
  const [assign, setAssign] = React.useState<ButtonPhase>("idle");
  const assignRef = React.useRef<HTMLButtonElement | null>(null);
  const onAssign = (el: HTMLButtonElement) => {
    assignRef.current = el;
    setAssign("loading");
    later(600, () => {
      if (netRef.current === "offline") {
        setAssign("error");
        showToast({
          origin: el,
          tone: "error",
          title: "No se pudo asignar a Lucía",
          detail: "Sin conexión. Vuelve a intentarlo en un momento.",
          action: { label: "Reintentar", onAction: () => onAssign(el) },
        });
        return;
      }
      setAssign("success");
      const id = showToast({
        origin: el,
        title: "Asignada a Lucía",
        detail: "Ya la ve en su bandeja.",
        action: {
          label: "Deshacer",
          onAction: () => {
            setAssign("idle");
            dismissToast(id);
          },
        },
      });
    });
  };

  // Guardar respuesta rápida — success is said by the button itself; no toast.
  const [reply, setReply] = React.useState(REPLY);
  const [save, setSave] = React.useState<ButtonPhase>("idle");
  const onSave = (el: HTMLButtonElement) => {
    setSave("loading");
    later(LATENCY, () => {
      if (netRef.current === "offline") {
        setSave("error");
        showToast({
          origin: el,
          tone: "error",
          title: "No se guardó",
          detail: "Sin conexión. Tu texto sigue aquí.",
          action: { label: "Reintentar", onAction: () => onSave(el) },
        });
        return;
      }
      setSave("success");
    });
  };

  // Tabs
  const [tab, setTab] = React.useState("abiertas");
  const [closed, setClosed] = React.useState<"loading" | "ready" | "error">("loading");
  const loadClosed = () => {
    setClosed("loading");
    later(500, () => setClosed(netRef.current === "offline" ? "error" : "ready"));
  };
  const onTab = (v: string) => {
    setTab(v);
    if (v === "cerradas" && closed !== "ready") loadClosed();
  };

  return (
    <div className="cfc-screen" data-slot="cause-screen">
      <div className="cfc-col">
        <div className="cfc-proto">
          <span>PROTOTIPO · datos de ejemplo</span>
          <span className="cfc-proto-seg" role="group" aria-label="Simular red">
            <button type="button" aria-pressed={net === "ok"} onClick={() => setNet("ok")} data-proto="net-ok">
              Con red
            </button>
            <button
              type="button"
              aria-pressed={net === "offline"}
              onClick={() => setNet("offline")}
              data-proto="net-offline"
            >
              Sin red
            </button>
          </span>
        </div>

        <header className="cfc-head">
          <button type="button" className="cfc-iconbtn" aria-label="Volver a la conversación">
            <ChevronLeft size={22} strokeWidth={2.25} aria-hidden />
          </button>
          <div className="cfc-head-text">
            <div className="cfc-head-name" title={CONTACT}>
              {CONTACT}
            </div>
            <div className="cfc-head-meta">
              <span className="cfc-dot" aria-hidden />
              WhatsApp · +51 987 654 321
            </div>
          </div>
        </header>

        <section className="cfc-section">
          <h2 className="cfc-label">Esta conversación</h2>
          <div className="cfc-card">
            <CauseSwitchRow
              id="modo-operador"
              data-proto="operator"
              title="Modo operador"
              checked={operator}
              status={{ key: opStatus, text: opText.text }}
              statusTone={opText.tone}
              onCheckedChange={onOperator}
            />
            <div className="cfc-row">
              <span className="cfc-row-text">
                <span className="cfc-row-title">Asignada a</span>
                <Layers
                  className="cfc-row-status"
                  current={assign === "success" ? "lucia" : "none"}
                  layers={{
                    none: <span>Nadie todavía</span>,
                    lucia: <span data-tone="strong">Lucía Fernández</span>,
                  }}
                />
              </span>
              <CauseButton
                data-proto="assign"
                tone="outline"
                phase={assign}
                label="Asignar a Lucía"
                successLabel="Asignada"
                onPress={onAssign}
              />
            </div>
          </div>
        </section>

        <section className="cfc-section">
          <h2 className="cfc-label">Respuesta rápida</h2>
          <div className="cfc-card" data-proto="reply-card">
            <label className="cfc-field">
              <span className="cfc-shortcut">/envio</span>
              <textarea
                className="cfc-textarea"
                rows={3}
                value={reply}
                aria-label="Texto de la respuesta rápida"
                onChange={(e) => {
                  setReply(e.target.value);
                  if (save === "success") setSave("idle");
                }}
              />
              <p className="cfc-hint">Escribe /envio en cualquier chat para usarla.</p>
            </label>
            <div className="cfc-foot">
              <CauseButton
                data-proto="save"
                block
                phase={save}
                label="Guardar respuesta rápida"
                successLabel="Guardada"
                onPress={onSave}
              />
            </div>
          </div>
        </section>

        <section className="cfc-section" data-proto="history">
          <h2 className="cfc-label">Historial con este cliente</h2>
          <CauseTabs
            label="Historial con este cliente"
            value={tab}
            onValueChange={onTab}
            tabs={[
              {
                value: "abiertas",
                label: "Abiertas",
                count: ABIERTAS.length,
                content: (
                  <ul className="cfc-list">
                    {ABIERTAS.map((c) => (
                      <li key={c.t} className="cfc-item">
                        <span className="cfc-item-title">{c.t}</span>
                        <span className="cfc-item-date">{c.d}</span>
                        <span className="cfc-item-meta">{c.m}</span>
                      </li>
                    ))}
                  </ul>
                ),
              },
              {
                value: "pendientes",
                label: "Pendientes",
                count: 0,
                content: (
                  <div className="cfc-empty">
                    <p className="cfc-empty-title">Nada pendiente con este cliente</p>
                    <p className="cfc-empty-text">
                      Si te escribe y nadie responde en 2 horas, la conversación aparece aquí.
                    </p>
                  </div>
                ),
              },
              {
                value: "cerradas",
                label: "Cerradas",
                count: CERRADAS.length,
                content: <ClosedPanel state={closed} onRetry={loadClosed} />,
              },
            ]}
          />
        </section>
      </div>
      <ToastDock />
    </div>
  );
}

/** Every state, frozen, side by side — for review without clicking. */
function StatesBoard() {
  const noop = () => {};
  return (
    <div className="cfc-screen">
      <div className="cfc-board">
        <div className="cfc-proto" style={{ margin: 0 }}>
          <span>PROTOTIPO · datos de ejemplo</span>
        </div>
        <div>
          <h3>Botón · un elemento, cuatro estados</h3>
          <div className="cfc-board-stack">
            {(["idle", "loading", "success", "error"] as ButtonPhase[]).map((p) => (
              <div key={p}>
                <p className="cfc-board-cap">{p}</p>
                <CauseButton block phase={p} label="Guardar respuesta rápida" successLabel="Guardada" onPress={noop} />
              </div>
            ))}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {(["idle", "loading", "success", "error"] as ButtonPhase[]).map((p) => (
                <CauseButton key={p} tone="outline" phase={p} label="Asignar a Lucía" successLabel="Asignada" onPress={noop} />
              ))}
            </div>
          </div>
        </div>
        <div>
          <h3>Interruptor · el texto dice qué cambió</h3>
          <div className="cfc-card">
            <CauseSwitchRow id="s1" title="Modo operador" checked={false} status={{ key: "off", text: "La IA responde por ti" }} onCheckedChange={noop} />
            <CauseSwitchRow id="s2" title="Modo operador" checked status={{ key: "on", text: "Tú respondes · la IA está en pausa" }} statusTone="accent" onCheckedChange={noop} />
            <CauseSwitchRow id="s3" title="Modo operador" checked={false} status={{ key: "e", text: "No se pudo activar. La IA sigue respondiendo" }} statusTone="error" onCheckedChange={noop} />
          </div>
        </div>
        <div>
          <h3>Pestañas · vacío, cargando, error</h3>
          <div className="cfc-board-stack">
            {(["pendientes", "loading", "error"] as const).map((k) => (
              <CauseTabs
                key={k}
                label="Historial"
                value={k === "pendientes" ? "pendientes" : "cerradas"}
                onValueChange={noop}
                tabs={[
                  { value: "abiertas", label: "Abiertas", count: 2, content: null },
                  {
                    value: "pendientes",
                    label: "Pendientes",
                    count: 0,
                    content: (
                      <div className="cfc-empty">
                        <p className="cfc-empty-title">Nada pendiente con este cliente</p>
                        <p className="cfc-empty-text">Si te escribe y nadie responde en 2 horas, la conversación aparece aquí.</p>
                      </div>
                    ),
                  },
                  {
                    value: "cerradas",
                    label: "Cerradas",
                    count: 14,
                    content: <ClosedPanel state={k === "error" ? "error" : "loading"} onRetry={noop} />,
                  },
                ]}
              />
            ))}
          </div>
        </div>
        <div>
          <h3>Aviso · solo si el resultado vive en otro lado, o falló</h3>
          <div className="cfc-board-stack">
            <div className="cfc-toast-surface">
              <ToastSurface
                title="Asignada a Lucía"
                detail="Ya la ve en su bandeja."
                action={{ label: "Deshacer", onAction: noop }}
              />
            </div>
            <div className="cfc-toast-surface">
              <ToastSurface
                tone="error"
                title="No se guardó"
                detail="Sin conexión. Tu texto sigue aquí."
                action={{ label: "Reintentar", onAction: noop }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const meta: Meta = {
  title: "Prototype/Motion/C — Causa y efecto",
  parameters: {
    layout: "fullscreen",
    viewport: VIEWPORT_MOBILE,
    docs: {
      description: {
        component:
          "Variante C: el feedback nace donde tocaste. El botón dice «Guardada» por sí mismo; " +
          "el aviso solo aparece si falló o si el resultado vive en otro lado, y sale del elemento " +
          "que lo causó hacia un dock sobre el pulgar. Con prefers-reduced-motion todo es cambio " +
          "instantáneo (a lo sumo opacidad).",
      },
    },
  },
};
export default meta;

export const Operador: StoryObj = { render: () => <OperatorScreen /> };
export const OperadorSinConexion: StoryObj = {
  name: "Operador · sin conexión",
  render: () => <OperatorScreen initialNet="offline" />,
};
export const Estados: StoryObj = { render: () => <StatesBoard /> };
