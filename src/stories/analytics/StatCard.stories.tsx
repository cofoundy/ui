import type { Meta, StoryObj } from "@storybook/react";
import { StatCard } from "../../components/analytics/StatCard";
import { SparkLine } from "../../components/analytics/SparkLine";

const meta: Meta<typeof StatCard> = {
  title: "Analytics/StatCard",
  component: StatCard,
  tags: ["autodocs"],
  argTypes: {
    size: { control: "select", options: ["sm", "default", "lg"] },
    format: { control: "select", options: ["number", "duration", "percentage"] },
    trendPositive: { control: "select", options: ["good", "bad"] },
  },
};

export default meta;
type Story = StoryObj<typeof StatCard>;

export const Default: Story = {
  args: { label: "Conversaciones", value: 147, format: "number" },
};

export const WithTrend: Story = {
  args: {
    label: "Conversaciones",
    value: 147,
    format: "number",
    trend: { delta: 12, direction: "up" },
  },
};

export const DurationFormat: Story = {
  args: {
    label: "Resp. promedio",
    value: 132,
    format: "duration",
    trend: { delta: 15, direction: "down" },
    trendPositive: "bad",
  },
};

export const PercentageFormat: Story = {
  args: {
    label: "Resuelto por AI",
    value: 73,
    format: "percentage",
    trend: { delta: 5, direction: "up" },
  },
};

export const MutedState: Story = {
  args: {
    label: "Satisfaccion",
    value: 0,
    format: "percentage",
    muted: true,
    mutedText: "< 10 datos",
  },
};

export const AllSizes: StoryObj = {
  render: () => (
    <div className="flex flex-col gap-4">
      <StatCard label="Pequeno" value={42} format="number" size="sm" />
      <StatCard label="Default" value={147} format="number" />
      <StatCard label="Grande" value={1247} format="number" size="lg" trend={{ delta: 8, direction: "up" }} />
    </div>
  ),
};

export const WithSparkLine: StoryObj = {
  name: "Con SparkLine embebido",
  render: () => (
    <div className="grid grid-cols-2 gap-4 max-w-md">
      <div className="bg-[var(--chat-card)] border border-[var(--chat-border)] rounded-xl p-4 flex flex-col gap-2">
        <span className="text-[11px] font-sans text-[var(--chat-muted)] uppercase tracking-wider">Conversaciones</span>
        <div className="flex items-end justify-between">
          <span className="font-mono font-semibold text-2xl text-[var(--chat-foreground)]">147</span>
          <SparkLine data={[20, 35, 28, 42, 38, 58, 47]} />
        </div>
      </div>
      <div className="bg-[var(--chat-card)] border border-[var(--chat-border)] rounded-xl p-4 flex flex-col gap-2">
        <span className="text-[11px] font-sans text-[var(--chat-muted)] uppercase tracking-wider">Resolucion AI</span>
        <div className="flex items-end justify-between">
          <span className="font-mono font-semibold text-2xl text-[var(--chat-foreground)]">73%</span>
          <SparkLine data={[60, 65, 68, 70, 72, 71, 73]} color="var(--chat-success)" />
        </div>
      </div>
    </div>
  ),
};

export const KPIRow: StoryObj = {
  render: () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard label="Conversaciones" value={147} format="number" trend={{ delta: 12, direction: "up" }} />
      <StatCard label="Resp. agente" value={132} format="duration" trend={{ delta: 15, direction: "down" }} trendPositive="bad" />
      <StatCard label="Resuelto por AI" value={73} format="percentage" trend={{ delta: 5, direction: "up" }} />
      <StatCard label="Abiertas" value={12} format="number" />
    </div>
  ),
};
