import type { StoryObj, Meta } from "@storybook/react";
import { DonutChart } from "../../components/analytics/DonutChart";

const meta: Meta<typeof DonutChart> = {
  title: "Analytics/DonutChart",
  component: DonutChart,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof DonutChart>;

export const Default: Story = {
  args: {
    segments: [
      { label: "AI resolvio", value: 107, color: "var(--chat-success)" },
      { label: "Agente resolvio", value: 40, color: "var(--chat-primary)" },
    ],
    centerValue: "73%",
    centerLabel: "AI",
    showLegend: true,
  },
};

export const CSATScore: Story = {
  name: "Score CSAT",
  args: {
    segments: [
      { label: "Satisfecho", value: 85, color: "var(--chat-success)" },
      { label: "Neutral", value: 10, color: "var(--chat-warning)" },
      { label: "Insatisfecho", value: 5, color: "var(--chat-error)" },
    ],
    centerValue: "85%",
    centerLabel: "CSAT",
    showLegend: true,
  },
};

export const ThreeWaySplit: Story = {
  name: "Tres segmentos",
  args: {
    segments: [
      { label: "WhatsApp", value: 312, color: "var(--channel-whatsapp)" },
      { label: "Telegram", value: 84, color: "var(--channel-telegram)" },
      { label: "Instagram", value: 156, color: "var(--channel-instagram)" },
    ],
    centerValue: "552",
    centerLabel: "Total",
    showLegend: true,
  },
};

export const SmallDonut: Story = {
  name: "Pequeno (inline)",
  args: {
    segments: [
      { label: "Resuelto", value: 73, color: "var(--chat-success)" },
      { label: "Pendiente", value: 27, color: "var(--chat-border)" },
    ],
    size: 80,
    thickness: 10,
    showCenter: true,
    centerValue: "73%",
    showLegend: false,
  },
};

export const Sizes: StoryObj = {
  name: "Tamanos",
  render: () => (
    <div className="flex items-center gap-6">
      <DonutChart
        segments={[
          { label: "OK", value: 80, color: "var(--chat-success)" },
          { label: "Resto", value: 20, color: "var(--chat-border)" },
        ]}
        size={60}
        thickness={8}
        centerValue="80%"
        showLegend={false}
      />
      <DonutChart
        segments={[
          { label: "OK", value: 80, color: "var(--chat-success)" },
          { label: "Resto", value: 20, color: "var(--chat-border)" },
        ]}
        size={120}
        thickness={16}
        centerValue="80%"
        centerLabel="CSAT"
        showLegend={false}
      />
      <DonutChart
        segments={[
          { label: "OK", value: 80, color: "var(--chat-success)" },
          { label: "Resto", value: 20, color: "var(--chat-border)" },
        ]}
        size={200}
        thickness={24}
        centerValue="80%"
        centerLabel="CSAT"
        showLegend={false}
      />
    </div>
  ),
};
