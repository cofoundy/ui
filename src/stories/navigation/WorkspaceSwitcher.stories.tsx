import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";

import {
  WorkspaceSwitcher,
  type Workspace,
} from "../../components/navigation/WorkspaceSwitcher";

const NEGOCIOS: Workspace[] = [
  { id: "prudencia", name: "Picantería Doña Prudencia", role: "Administrador", initials: "DP" },
  { id: "muelle", name: "Cevichería El Muelle de Chorrillos", role: "Atención", initials: "EM" },
  { id: "killa", name: "Spa Killa Wasi", role: "Atención", initials: "KW" },
];

const meta: Meta<typeof WorkspaceSwitcher> = {
  title: "Navigation/WorkspaceSwitcher",
  component: WorkspaceSwitcher,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
Selector de negocio / workspace.

- **rail**: marca 40–44 px con badge sólido de chevrons que gira al abrir (snappy). Sin caja
  contenedora: el hover/foco/abierto es un anillo concéntrico en la marca misma. El menú nace
  desde la marca (smooth, origen del trigger), filas en cascada.
- **sheet**: fila de cabecera (hoja «Más» del celular) con «Cambiar» ↔ «Cerrar» y la lista inline
  con alto animado.
- Lista: marca + nombre + rol, hover que viaja (edge), ✓ que viaja a la fila elegida y recién
  después \`onSelect\` (\`confirmDelay\`, 260 ms).
- El nombre del negocio cambia SÓLO con opacidad (sin blur: flickea en texto chico); la marca
  hace swap (sale 80 ms → entra con escala .9 → 1). Con reduced motion: opacidad ≤ 100 ms.
`,
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof WorkspaceSwitcher>;

function Controlled(props: Partial<React.ComponentProps<typeof WorkspaceSwitcher>>) {
  const [active, setActive] = React.useState(NEGOCIOS[0]!.id);
  return (
    <WorkspaceSwitcher
      workspaces={NEGOCIOS}
      activeId={active}
      onSelect={setActive}
      {...props}
    />
  );
}

export const RailWithName: Story = {
  name: "Rail con nombre (76 px)",
  render: () => (
    <div style={{ width: 76 }}>
      <Controlled showName />
    </div>
  ),
};

export const RailIconOnly: Story = {
  name: "Rail de íconos",
  render: () => <Controlled />,
};

export const SingleWorkspace: Story = {
  name: "Un solo negocio (sin control)",
  render: () => (
    <div style={{ width: 76 }}>
      <WorkspaceSwitcher workspaces={[NEGOCIOS[0]!]} activeId="prudencia" onSelect={() => {}} showName />
    </div>
  ),
};

export const Sheet: Story = {
  name: "Sheet (cabecera de «Más»)",
  render: () => (
    <div style={{ width: 360 }}>
      <Controlled variant="sheet" />
    </div>
  ),
};

export const SheetSingle: Story = {
  name: "Sheet con un negocio",
  render: () => (
    <div style={{ width: 360 }}>
      <WorkspaceSwitcher variant="sheet" workspaces={[NEGOCIOS[0]!]} activeId="prudencia" onSelect={() => {}} />
    </div>
  ),
};
