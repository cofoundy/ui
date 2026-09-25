/**
 * Fovente-like mobile screen composing the four primitives.
 * PROTOTIPO · datos de ejemplo — the save is stubbed on the rAF clock (no network).
 */
import * as React from "react";

import {
  MorphButton,
  RiseToaster,
  StretchSwitch,
  TravelTabs,
  TravelTabsContent,
  type ButtonStatus,
} from "./components";
import { after, commit } from "./timeline";

interface Conv {
  name: string;
  channel: "WhatsApp" | "Instagram";
  msg: string;
  time: string;
  unread?: number;
}

const ABIERTAS: Conv[] = [
  { name: "María Fernanda Quispe Huamán de los Ríos", channel: "WhatsApp", msg: "¿Me confirmas si el pedido 4821 sale hoy? Estoy en Miraflores hasta las 6", time: "09:42", unread: 2 },
  { name: "Tienda Don Lucho", channel: "Instagram", msg: "Perfecto, te paso la dirección de entrega", time: "09:31" },
  { name: "Carlos Mendoza", channel: "WhatsApp", msg: "¿Tienen talla M en el modelo azul?", time: "09:12", unread: 1 },
  { name: "Rosa Chávez", channel: "WhatsApp", msg: "Gracias, ya hice el Yape", time: "08:55" },
  { name: "Inversiones Ayacucho SAC", channel: "WhatsApp", msg: "Necesitamos la factura con RUC 20614413566", time: "08:20" },
  { name: "Julia Paredes", channel: "Instagram", msg: "¿Hacen envíos a Arequipa?", time: "Ayer" },
];

const NOMBRES = [
  "Jorge Salazar", "Ana Lucía Torres", "Pedro Huamaní", "Valeria Ríos", "Miguel Ángel Cárdenas",
  "Sofía Ramírez", "Diego Flores", "Carmen Rosa Vilca", "Luis Alberto Soto", "Gabriela Núñez",
  "Renzo Castillo", "Patricia Mamani", "Óscar Delgado", "Milagros Rojas", "Kevin Paucar",
  "Andrea Gutiérrez", "Raúl Condori", "Daniela Vargas", "Fernando Lazo", "Elena Choque",
  "Bodega Santa Rosa", "Mariela Apaza", "Hugo Espinoza", "Rocío Villanueva",
];
const CERRADAS: Conv[] = NOMBRES.map((name, i) => ({
  name,
  channel: i % 3 === 0 ? "Instagram" : "WhatsApp",
  msg: ["Listo, recibido. Gracias", "Ya llegó el pedido", "Perfecto, quedamos así", "Gracias por la atención"][i % 4],
  time: `${22 - (i % 20)} sep`,
}));

function initials(name: string) {
  return name
    .split(" ")
    .filter((w) => /^[A-ZÁÉÍÓÚÑ]/.test(w))
    .slice(0, 2)
    .map((w) => w[0])
    .join("");
}

const rowPress = {
  onPointerDown: (e: React.PointerEvent<HTMLElement>) => {
    e.currentTarget.dataset.pressed = "";
  },
  onPointerUp: (e: React.PointerEvent<HTMLElement>) => {
    delete e.currentTarget.dataset.pressed;
  },
  onPointerLeave: (e: React.PointerEvent<HTMLElement>) => {
    delete e.currentTarget.dataset.pressed;
  },
  onPointerCancel: (e: React.PointerEvent<HTMLElement>) => {
    delete e.currentTarget.dataset.pressed;
  },
};

function Row({ c }: { c: Conv }) {
  return (
    <li className="pa-row" {...rowPress}>
      <span className="pa-row__avatar" aria-hidden>
        {initials(c.name)}
      </span>
      <span className="pa-row__name">{c.name}</span>
      <span className="pa-row__time">{c.time}</span>
      <span className="pa-row__msg">
        <b>{c.channel}</b> · {c.msg}
      </span>
      {c.unread ? (
        <span className="pa-row__unread" aria-label={`${c.unread} sin leer`}>
          {c.unread}
        </span>
      ) : (
        <span />
      )}
    </li>
  );
}

export interface OperadorProps {
  /** Stub: how long the save "request" takes. */
  requestMs?: number;
  /** Stub: make the save fail (no connection). */
  fail?: boolean;
  initialTab?: "abiertas" | "pendientes" | "cerradas";
  initialOperator?: boolean;
  /** Stub: the "Cerradas" list fails to load. */
  cerradasError?: boolean;
}

export function Operador({ requestMs = 900, fail = false, initialTab = "abiertas", initialOperator = false, cerradasError = false }: OperadorProps) {
  const [operatorNote, setOperatorNote] = React.useState<"idle" | "pending" | "failed">("idle");
  const [cerradasFailed, setCerradasFailed] = React.useState(cerradasError);
  const [tab, setTab] = React.useState<string>(initialTab);
  const [operator, setOperator] = React.useState(initialOperator);
  const [status, setStatus] = React.useState<ButtonStatus>("idle");
  const dockRef = React.useRef<HTMLElement>(null);
  const [dockH, setDockH] = React.useState(0);
  const cancels = React.useRef<Array<() => void>>([]);

  React.useLayoutEffect(() => {
    const el = dockRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setDockH(el.offsetHeight));
    ro.observe(el);
    setDockH(el.offsetHeight);
    return () => ro.disconnect();
  }, []);
  React.useEffect(() => () => cancels.current.forEach((c) => c()), []);

  const [text, setText] = React.useState("Tu pedido sale hoy entre 3 y 5 p. m. Te escribo apenas esté en camino.");

  const toggleOperator = (next: boolean) => {
    setOperator(next);
    if (!fail) {
      setOperatorNote("idle");
      return;
    }
    // Stub: activation fails → the knob springs back and the line says what is still true.
    setOperatorNote("pending");
    cancels.current.push(
      after(700, () =>
        commit(() => {
          setOperator(!next);
          setOperatorNote("failed");
        }),
      ),
    );
  };

  const operatorLine =
    operatorNote === "failed"
      ? "No se pudo activar. La IA sigue respondiendo."
      : operatorNote === "pending"
        ? "Activando…"
        : operator
          ? "IA en pausa en todas tus conversaciones. Tú respondes."
          : "Pausa la IA en todas tus conversaciones.";

  const save = () => {
    setStatus("loading");
    cancels.current.push(
      after(requestMs, () => {
        if (fail) {
          // Raised where the operator tapped → ONLY the button says it ("No se guardó ·
          // Reintentar", and a tap there retries). No toast: that would say it twice.
          commit(() => setStatus("error"));
          return;
        }
        // No toast: the button already says "Guardada" where the operator tapped.
        commit(() => setStatus("success"));
      }),
    );
  };

  return (
    <div className="pa-screen" data-slot="operador-screen">
      <header className="pa-top">
        <h1 className="pa-title">Bandeja</h1>
        <span className="pa-proto">
          PROTOTIPO · datos de ejemplo
          <br />
          los chats no se abren
        </span>
      </header>

      <label className="pa-operator" htmlFor="pa-operator-switch">
        <span className="pa-operator__text">
          <p className="pa-operator__title">Modo operador</p>
          <p
            className="pa-operator__hint"
            data-tone={operatorNote === "failed" ? "error" : operator && operatorNote === "idle" ? "on" : undefined}
            aria-live="polite"
          >
            {operatorLine}
          </p>
        </span>
        <StretchSwitch id="pa-operator-switch" checked={operator} onCheckedChange={toggleOperator} />
      </label>

      <TravelTabs
        value={tab}
        onValueChange={setTab}
        tabs={[
          { value: "abiertas", label: "Abiertas", count: ABIERTAS.length },
          { value: "pendientes", label: "Pendientes", count: 0 },
          { value: "cerradas", label: "Cerradas", count: cerradasFailed ? undefined : CERRADAS.length },
        ]}
      >
        <TravelTabsContent value="abiertas" asChild>
          <ul className="pa-list">
            {ABIERTAS.map((c) => (
              <Row key={c.name} c={c} />
            ))}
          </ul>
        </TravelTabsContent>
        <TravelTabsContent value="pendientes" className="pa-list">
          <div className="pa-empty">
            <p className="pa-empty__title">Nada pendiente</p>
            <p className="pa-empty__body">Cuando un cliente espere tu respuesta, su conversación aparecerá aquí.</p>
          </div>
        </TravelTabsContent>
        {cerradasFailed ? (
          <TravelTabsContent value="cerradas" className="pa-list">
            <div className="pa-empty" role="alert">
              <p className="pa-empty__title">No se pudieron cargar las cerradas</p>
              <p className="pa-empty__body">Tus conversaciones siguen guardadas. Revisa tu conexión.</p>
              <button type="button" className="pa-empty__retry" onClick={() => setCerradasFailed(false)}>
                Volver a cargar
              </button>
            </div>
          </TravelTabsContent>
        ) : (
          <TravelTabsContent value="cerradas" asChild>
            <ul className="pa-list">
              {CERRADAS.map((c) => (
                <Row key={c.name} c={c} />
              ))}
            </ul>
          </TravelTabsContent>
        )}
      </TravelTabs>

      <footer className="pa-dock" ref={dockRef}>
        <div className="pa-dock__head">
          <span className="pa-dock__label">Respuesta rápida</span>
          <span className="pa-dock__shortcut">/envio</span>
        </div>
        <textarea
          className="pa-dock__text"
          aria-label="Texto de la respuesta rápida"
          rows={2}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            // "Guardada" holds until the content it describes changes.
            if (status === "success") setStatus("idle");
          }}
        />
        <MorphButton
          full
          status={status}
          onClick={save}
          statusLabels={{ loading: "Guardando", success: "Guardada", error: "No se guardó · Reintentar" }}
        >
          Guardar respuesta rápida
        </MorphButton>
      </footer>

      <RiseToaster offset={dockH + 12} />
    </div>
  );
}
