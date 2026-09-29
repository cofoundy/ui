import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { BarChart3, CalendarDays, Home, Inbox, Megaphone, Plus, Settings, Sparkles, Users } from "lucide-react";

import { NavRail, NavRailItem, NavRailSection } from "../../components/navigation/NavRail";

const CORE = [
  { key: "inicio", label: "Inicio", icon: Home },
  { key: "mensajes", label: "Mensajes", icon: Inbox },
  { key: "clientes", label: "Clientes", icon: Users },
  { key: "reportes", label: "Reportes", icon: BarChart3 },
];
const FUNCIONES = [
  { key: "reservas", label: "Reservas", icon: CalendarDays },
  { key: "difusiones", label: "Difusiones", icon: Megaphone },
  { key: "sugerencias", label: "Platos sugeridos", icon: Sparkles },
];

function Shell(props: { expandOnHover?: boolean; pinned?: boolean }) {
  const [active, setActive] = React.useState("mensajes");
  return (
    <div className="flex overflow-hidden rounded-xl border border-[var(--border)]" style={{ height: 520, width: 760 }}>
      <NavRail
        {...props}
        aria-label="Navegación principal"
        footer={<NavRailItem icon={Settings} label="Ajustes" active={active === "ajustes"} onClick={() => setActive("ajustes")} />}
      >
        {CORE.map((d) => (
          <NavRailItem key={d.key} icon={d.icon} label={d.label} active={active === d.key}
            badge={d.key === "mensajes" ? 3 : undefined} onClick={() => setActive(d.key)} />
        ))}
        <NavRailSection label="Funciones">
          {FUNCIONES.map((d) => (
            <NavRailItem key={d.key} icon={d.icon} label={d.label} active={active === d.key}
              isNew={d.key === "sugerencias"} onClick={() => setActive(d.key)} />
          ))}
          <NavRailItem icon={Plus} label="Agregar funciones" onClick={() => setActive("agregar")} active={active === "agregar"} />
        </NavRailSection>
      </NavRail>
      <main className="flex-1 bg-[var(--card)] p-5 text-sm text-[var(--muted-foreground)]">Contenido</main>
    </div>
  );
}

const meta: Meta<typeof Shell> = {
  title: "Navigation/NavRail",
  component: Shell,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
Vertical icon rail. \`NavRailItem\`: icon + \`label\` (tooltip + accessible name), \`active\`, \`badge\`, \`isNew\`, \`href\` or \`asChild\` (Next.js Link).
The active indicator is ONE element that travels between items (\`layoutId\`, spring edge). Press scales the icon pill to .94 (snappy).

**\`expandOnHover\`**: on mouse hover (after 120 ms) or keyboard focus the rail grows OVER the content to 220 px showing every name (clip reveal, spring smooth); collapse is immediate, Esc closes. It never pushes layout. \`pinned\` keeps it open and reserves the width.
\`NavRailSection\`: separator + optional kicker (visible when expanded, always the group's aria-label).
Reduced motion (OS or \`MotionConfig reducedMotion="always"\`): instant changes, labels fade ≤120 ms.`,
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof Shell>;

export const IconRail: Story = { args: {} };
export const ExpandOnHover: Story = { args: { expandOnHover: true } };
export const Pinned: Story = { args: { expandOnHover: true, pinned: true } };
