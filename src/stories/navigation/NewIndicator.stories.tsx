import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { AnimatePresence } from "framer-motion";
import { LayoutGrid, Megaphone } from "lucide-react";

import { NewChip, NewDot } from "../../components/navigation/NewIndicator";

const meta: Meta<typeof NewDot> = {
  title: "Navigation/NewIndicator",
  component: NewDot,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
Marca de «nuevo». **NewDot** (8 px, aro del color de la superficie) para superficies de solo ícono;
**NewChip** (texto «nuevo») para filas.

- Entra **una vez**: scale con spring \`snappy\` + opacidad, \`delay\` opcional. Un re-render no la repite; nunca late.
- Dentro de \`AnimatePresence\` también sale (opacidad corta) cuando el usuario ya lo vio.
- Reduced motion: solo opacidad, 120 ms.
- A11y: NewDot agrega texto oculto («nuevo») que se suma al nombre accesible del padre. Si el padre usa \`aria-label\`, incluí «nuevo» ahí y pasá \`decorative\`. NewChip es texto real.
- Tokens: \`--cf-new-accent\` (default \`--primary\`), \`--cf-new-ring\` (default \`--background\`).
        `,
      },
    },
  },
};
export default meta;

export const Dot: StoryObj<typeof NewDot> = {
  render: () => (
    <div className="flex items-center gap-6" style={{ color: "var(--foreground)" }}>
      <button aria-label="Difusiones (nuevo)" className="relative flex size-10 items-center justify-center">
        <span className="relative">
          <Megaphone className="size-[18px]" />
          <NewDot decorative delay={0.2} />
        </span>
      </button>
      <button className="relative flex items-center gap-2 text-sm">
        <span className="relative">
          <LayoutGrid className="size-[18px]" />
          <NewDot />
        </span>
        Plugins
      </button>
      <span className="flex items-center gap-2 text-sm">
        Carta actualizada <NewDot anchored={false} label="novedad" />
      </span>
    </div>
  ),
};

export const Chip: StoryObj<typeof NewChip> = {
  render: () => (
    <div className="flex items-center gap-3 text-sm" style={{ color: "var(--foreground)" }}>
      Reservas por WhatsApp <NewChip />
      <NewChip tone="solid" delay={0.1} />
      <NewChip tone="solid" delay={0.15}>beta</NewChip>
    </div>
  ),
};

export const MarkAsSeen: StoryObj<typeof NewChip> = {
  render: function Render() {
    const [show, setShow] = React.useState(true);
    return (
      <div className="flex items-center gap-3 text-sm" style={{ color: "var(--foreground)" }}>
        <button onClick={() => setShow((s) => !s)} className="rounded-full border px-3 py-1">
          {show ? "Marcar como visto" : "Volver a mostrar"}
        </button>
        Carta del día
        <AnimatePresence>{show && <NewChip />}</AnimatePresence>
      </div>
    );
  },
};
