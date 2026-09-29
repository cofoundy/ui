import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { BarChart3, BookOpen, CalendarDays, ClipboardList, Home, Megaphone, MessageCircle, Users, type LucideIcon } from "lucide-react";

import { NavRailOverflow, NavRailOverflowRow } from "../../components/navigation/NavRailOverflow";

type D = { key: string; label: string; desc: string; icon: LucideIcon; seccion: string };
const ITEMS: D[] = [
  { key: "inicio", label: "Inicio", desc: "Lo que pasó hoy en el local", icon: Home, seccion: "Núcleo" },
  { key: "mensajes", label: "Mensajes", desc: "Chats de WhatsApp e Instagram", icon: MessageCircle, seccion: "Núcleo" },
  { key: "contactos", label: "Contactos", desc: "Comensales y proveedores", icon: Users, seccion: "Núcleo" },
  { key: "reportes", label: "Reportes", desc: "Ventas y tiempos de respuesta", icon: BarChart3, seccion: "Núcleo" },
  { key: "reservas", label: "Reservas", desc: "Mesas del almuerzo y la cena", icon: CalendarDays, seccion: "Funciones" },
  { key: "pedidos", label: "Pedidos", desc: "Para llevar y en salón", icon: ClipboardList, seccion: "Funciones" },
  { key: "carta", label: "Carta", desc: "Platos, precios y menú del día", icon: BookOpen, seccion: "Funciones" },
  { key: "difusiones", label: "Difusiones", desc: "El ceviche del viernes, a todos", icon: Megaphone, seccion: "Funciones" },
];

function Rail({ height, showLabel }: { height: number; showLabel?: boolean }) {
  const [ruta, setRuta] = React.useState("mensajes");
  return (
    <aside
      style={{ height }}
      className={`flex flex-col items-center border-r border-[var(--border)] bg-[var(--background)] py-2 ${showLabel ? "w-[76px] px-1.5" : "w-[56px] px-2"}`}
    >
      <NavRailOverflow
        items={ITEMS}
        getKey={(d) => d.key}
        isItemActive={(d) => d.key === ruta}
        getSection={(d) => d.seccion}
        showLabel={showLabel}
        renderItem={(d, { placement, close }) =>
          placement === "rail" ? (
            <button
              type="button"
              aria-label={d.label}
              aria-current={ruta === d.key ? "page" : undefined}
              onClick={() => setRuta(d.key)}
              className={`flex size-9 items-center justify-center rounded-[10px] ${ruta === d.key ? "text-[var(--primary)]" : "text-[var(--muted-foreground)] hover:bg-[var(--accent)]"}`}
            >
              <d.icon className="size-[18px]" />
            </button>
          ) : (
            <NavRailOverflowRow
              icon={<d.icon />}
              label={d.label}
              description={d.desc}
              active={ruta === d.key}
              onSelect={() => { close(); setRuta(d.key); }}
            />
          )
        }
      />
    </aside>
  );
}

const meta: Meta<typeof Rail> = {
  title: "Navigation/NavRailOverflow",
  component: Rail,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Mide el alto disponible (ResizeObserver) y colapsa lo que no entra en un ítem «+N Más». " +
          "El popover se ancla al botón y SIEMPRE queda dentro de la ventana (8 px): título fijo, lista que " +
          "scrollea adentro, filas en cascada (snappy, 25 ms). Genérico: `items` en orden de prioridad + " +
          "`renderItem(item, { placement: 'rail' | 'menu', close })`. El riel nunca scrollea.",
      },
    },
  },
  argTypes: { height: { control: { type: "range", min: 160, max: 520, step: 10 } } },
};
export default meta;
type Story = StoryObj<typeof Rail>;

export const Desborda: Story = { args: { height: 260 } };
export const TodoEntra: Story = { args: { height: 480 } };
export const ConNombres: Story = { args: { height: 320, showLabel: true } };
