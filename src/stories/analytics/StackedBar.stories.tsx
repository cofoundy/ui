import type { StoryObj, Meta } from "@storybook/react";
import { StackedBar } from "../../components/analytics/StackedBar";

const meta: Meta<typeof StackedBar> = {
  title: "Analytics/StackedBar",
  component: StackedBar,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof StackedBar>;

export const TwoSegments: Story = {
  name: "AI vs Agente",
  args: {
    segments: [
      { label: "AI resolvio", value: 107, color: "var(--chat-success)" },
      { label: "Agente resolvio", value: 40, color: "var(--chat-primary)" },
    ],
    showLegend: true,
    showPercentages: true,
    animate: true,
  },
};

export const ThreeSegments: Story = {
  name: "Tres segmentos",
  args: {
    segments: [
      { label: "AI resolvio", value: 85, color: "var(--chat-success)" },
      { label: "Agente resolvio", value: 40, color: "var(--chat-primary)" },
      { label: "Sin resolver", value: 12, color: "var(--chat-warning)" },
    ],
    showLegend: true,
    showPercentages: true,
    animate: true,
  },
};

export const SingleSegment: Story = {
  name: "100% un segmento",
  args: {
    segments: [{ label: "AI resolvio todo", value: 147, color: "var(--chat-success)" }],
    showLegend: true,
    showPercentages: true,
  },
};

export const CompactWithLegend: Story = {
  name: "Compacta con leyenda",
  args: {
    segments: [
      { label: "AI resolvio", value: 107, color: "var(--chat-success)" },
      { label: "Agente resolvio", value: 40, color: "var(--chat-primary)" },
    ],
    showLegend: true,
    height: 24,
  },
};
