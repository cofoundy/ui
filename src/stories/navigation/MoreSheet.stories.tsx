import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { BarChart3, CalendarDays, Megaphone, Plus, Settings, Users, Workflow } from "lucide-react";

import { MoreSheet, type MoreSheetSection } from "../../components/navigation/MoreSheet";
import { VIEWPORT_MOBILE } from "../_shared/viewports";

const meta: Meta<typeof MoreSheet> = {
  title: "Navigation/MoreSheet",
  component: MoreSheet,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
The «Más» bottom sheet of a mobile tab bar, composed on \`Sheet\` (side="bottom").

- Optional **header** slot (e.g. a workspace switcher), **sections** with a kicker, rows icon + title + description.
- Rows cascade in when the sheet opens (25 ms stagger, \`smooth\` spring, 6 px); the sheet itself moves with \`gentle\` (from \`Sheet\`).
- Press = \`scale .96\` (\`snappy\`). Reduced motion: opacity only, ≤ 120 ms, no stagger.
- The grab handle is the close button («Cerrar»); Esc and tapping the overlay also close.
- \`active\` row → tinted + \`aria-current="page"\`. \`href\` rows render \`linkComponent\` (default \`a\`).
`,
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof MoreSheet>;

const sections: MoreSheetSection[] = [
  {
    key: "funciones",
    kicker: "Tus funciones",
    items: [
      { key: "reservas", label: "Reservas", description: "Mesas de hoy y de la semana, con confirmación por WhatsApp", icon: <CalendarDays />, active: true },
      { key: "difusiones", label: "Difusiones", description: "Mensajes a muchos clientes a la vez, con aprobación", icon: <Megaphone /> },
      { key: "pipeline", label: "Pipeline", description: "Cada lead en su etapa, de la consulta a la reserva", icon: <Workflow /> },
      { key: "agregar", label: "Agregar funciones", icon: <Plus />, dashed: true },
    ],
  },
  {
    key: "nucleo",
    items: [
      { key: "leads", label: "Leads", icon: <Users /> },
      { key: "reportes", label: "Reportes", icon: <BarChart3 /> },
      { key: "ajustes", label: "Ajustes", icon: <Settings /> },
    ],
  },
];

function Demo(props: Partial<React.ComponentProps<typeof MoreSheet>>) {
  return (
    <div className="min-h-screen bg-[var(--background)] p-6 text-[var(--foreground)]">
      <MoreSheet
        title="Más"
        sections={sections}
        trigger={
          <button className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm">Abrir «Más»</button>
        }
        {...props}
      />
    </div>
  );
}

export const Default: Story = { render: () => <Demo /> };

export const WithHeader: Story = {
  render: () => (
    <Demo
      header={
        <div className="flex min-h-[56px] items-center gap-3 rounded-[12px] bg-[var(--muted)] px-2.5 py-2">
          <span className="grid size-9 place-items-center rounded-[10px] bg-[var(--primary)] text-[13px] font-semibold text-[var(--primary-foreground)]">DP</span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[15px] font-semibold">Picantería Doña Prudencia</span>
            <span className="block text-[12.5px] text-[var(--muted-foreground)]">Dueño · 3 negocios</span>
          </span>
        </div>
      }
    />
  ),
};

export const EmptySection: Story = {
  render: () => (
    <Demo
      sections={[
        { key: "funciones", kicker: "Tus funciones", items: [], empty: "Todavía no instalaste ninguna." },
        sections[1],
      ]}
    />
  ),
};

export const MobileBaseline: Story = {
  render: () => <Demo defaultOpen />,
  parameters: {
    viewport: VIEWPORT_MOBILE,
    docs: { description: { story: "Mobile baseline (375 px). Rows are ≥ 48 px tall; the grab handle is a 28 px × full-width close target." } },
  },
};
