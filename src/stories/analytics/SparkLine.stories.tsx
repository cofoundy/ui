import type { Meta, StoryObj } from "@storybook/react";
import { SparkLine } from "../../components/analytics/SparkLine";

const meta: Meta<typeof SparkLine> = {
  title: "Analytics/SparkLine",
  component: SparkLine,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof SparkLine>;

export const Default: Story = {
  args: {
    data: [20, 35, 28, 42, 38, 58, 47],
  },
};

export const Uptrend: Story = {
  args: {
    data: [10, 15, 18, 22, 30, 35, 50],
    color: "var(--chat-success)",
  },
};

export const Downtrend: Story = {
  args: {
    data: [50, 45, 38, 35, 28, 20, 12],
    color: "var(--chat-error)",
  },
};

export const Flat: Story = {
  args: {
    data: [30, 32, 31, 30, 31, 29, 30],
    color: "var(--chat-muted)",
  },
};

export const LargeDataset: Story = {
  name: "30 puntos de datos",
  args: {
    data: Array.from({ length: 30 }, () => Math.floor(Math.random() * 80 + 10)),
    width: 160,
    height: 32,
  },
};

export const CustomSizes: StoryObj = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <span className="text-xs font-sans text-[var(--chat-muted)] w-16">Pequeno</span>
        <SparkLine data={[20, 35, 28, 42, 38, 58, 47]} width={60} height={16} />
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs font-sans text-[var(--chat-muted)] w-16">Default</span>
        <SparkLine data={[20, 35, 28, 42, 38, 58, 47]} />
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs font-sans text-[var(--chat-muted)] w-16">Grande</span>
        <SparkLine data={[20, 35, 28, 42, 38, 58, 47]} width={160} height={48} strokeWidth={2} />
      </div>
    </div>
  ),
};

export const InTableContext: StoryObj = {
  name: "Dentro de una tabla",
  render: () => (
    <table className="w-full max-w-md">
      <thead>
        <tr className="border-b border-[var(--chat-border)]">
          <th className="text-left text-[10px] font-mono uppercase text-[var(--chat-muted)] py-2">Agente</th>
          <th className="text-right text-[10px] font-mono uppercase text-[var(--chat-muted)] py-2">Resueltas</th>
          <th className="text-right text-[10px] font-mono uppercase text-[var(--chat-muted)] py-2">Tendencia</th>
        </tr>
      </thead>
      <tbody>
        {[
          { name: "Ana Garcia", count: 47, data: [8, 6, 10, 7, 5, 8, 3], color: "var(--chat-success)" },
          { name: "Carlos Ruiz", count: 31, data: [5, 4, 6, 3, 4, 5, 4], color: "var(--chat-primary)" },
          { name: "Maria Lopez", count: 52, data: [6, 8, 7, 9, 6, 8, 8], color: "var(--chat-success)" },
        ].map((agent) => (
          <tr key={agent.name} className="border-b border-[var(--chat-border)]">
            <td className="py-2 text-sm font-sans text-[var(--chat-foreground)]">{agent.name}</td>
            <td className="py-2 text-sm font-mono text-[var(--chat-foreground)] text-right">{agent.count}</td>
            <td className="py-2 text-right"><SparkLine data={agent.data} color={agent.color} width={60} height={16} /></td>
          </tr>
        ))}
      </tbody>
    </table>
  ),
};
