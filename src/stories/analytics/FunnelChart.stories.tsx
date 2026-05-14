import type { StoryObj, Meta } from "@storybook/react";
import { FunnelChart } from "../../components/analytics/FunnelChart";

const meta: Meta<typeof FunnelChart> = {
  title: "Analytics/FunnelChart",
  component: FunnelChart,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof FunnelChart>;

export const ConversationFunnel: Story = {
  name: "Embudo de conversaciones",
  args: {
    steps: [
      { label: "Conversaciones iniciadas", value: 500, color: "var(--chart-1)" },
      { label: "AI respondio", value: 450, color: "var(--chart-1)" },
      { label: "Resueltas por AI", value: 320, color: "var(--chart-3)" },
      { label: "Escaladas a agente", value: 130, color: "var(--chart-4)" },
      { label: "Resueltas por agente", value: 110, color: "var(--chart-2)" },
    ],
    showPercentages: true,
    showDropoff: true,
    animate: true,
  },
};

export const SalesFunnel: Story = {
  name: "Embudo de ventas",
  args: {
    steps: [
      { label: "Leads", value: 1000 },
      { label: "Contactados", value: 650 },
      { label: "Demo agendada", value: 200 },
      { label: "Propuesta enviada", value: 80 },
      { label: "Cerrados", value: 25 },
    ],
    showPercentages: true,
    showDropoff: true,
    animate: true,
  },
};

export const SimpleThreeStep: Story = {
  name: "Tres pasos",
  args: {
    steps: [
      { label: "Visitas", value: 1200, color: "var(--chart-4)" },
      { label: "Conversaciones", value: 147, color: "var(--chart-1)" },
      { label: "Convertidos", value: 23, color: "var(--chart-3)" },
    ],
    showPercentages: true,
    showDropoff: true,
  },
};

export const NoDropoff: Story = {
  name: "Sin indicador de abandono",
  args: {
    steps: [
      { label: "Inicio", value: 500 },
      { label: "Medio", value: 300 },
      { label: "Final", value: 150 },
    ],
    showPercentages: true,
    showDropoff: false,
    animate: true,
  },
};
