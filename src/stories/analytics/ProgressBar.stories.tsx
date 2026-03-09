import type { StoryObj, Meta } from "@storybook/react";
import { ProgressBar } from "../../components/analytics/ProgressBar";

const meta: Meta<typeof ProgressBar> = {
  title: "Analytics/ProgressBar",
  component: ProgressBar,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ProgressBar>;

export const Default: Story = {
  args: {
    label: "Tickets resueltos",
    value: 85,
    max: 100,
    format: "fraction",
  },
};

export const Percentage: Story = {
  name: "Formato porcentaje",
  args: {
    label: "Meta mensual",
    value: 73,
    max: 100,
    format: "percentage",
    color: "var(--chat-success)",
  },
};

export const AlmostComplete: Story = {
  name: "Casi completa",
  args: {
    label: "Onboarding",
    value: 95,
    max: 100,
    format: "percentage",
    color: "var(--chat-success)",
  },
};

export const LowProgress: Story = {
  name: "Progreso bajo",
  args: {
    label: "Conversiones",
    value: 12,
    max: 100,
    format: "fraction",
    color: "var(--chat-warning)",
  },
};

export const MultipleGoals: StoryObj = {
  name: "Multiples metas",
  render: () => (
    <div className="flex flex-col gap-4 max-w-md">
      <ProgressBar label="Tickets resueltos" value={85} max={100} format="fraction" color="var(--chat-success)" />
      <ProgressBar label="Tiempo respuesta < 2min" value={62} max={100} format="percentage" color="var(--chat-primary)" />
      <ProgressBar label="CSAT > 4.5" value={45} max={100} format="percentage" color="var(--chat-warning)" />
      <ProgressBar label="Tasa abandono < 5%" value={90} max={100} format="percentage" color="var(--chat-success)" />
    </div>
  ),
};
