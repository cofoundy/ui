import type { StoryObj, Meta } from "@storybook/react";
import { EmptyState } from "../../components/analytics/EmptyState";

const meta: Meta<typeof EmptyState> = {
  title: "Analytics/EmptyState",
  component: EmptyState,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof EmptyState>;

export const Default: Story = {
  args: {
    title: "Aqui veras el rendimiento de tu equipo",
    description: "Las metricas aparecen cuando empiezas a recibir conversaciones.",
  },
};

export const WithAction: Story = {
  name: "Con accion",
  args: {
    title: "Aqui veras el rendimiento de tu equipo",
    description: "Las metricas aparecen cuando empiezas a recibir conversaciones.",
    action: { label: "Ir al inbox", href: "/inbox" },
  },
};

export const NoData: Story = {
  name: "Sin datos en periodo",
  args: {
    title: "Sin datos en este periodo",
    description: "Selecciona un rango de fechas con actividad.",
  },
};
