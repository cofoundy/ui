import type { StoryObj, Meta } from "@storybook/react";
import { DataTable } from "../../components/analytics/DataTable";

const agentColumns = [
  { key: "name", label: "Agente", align: "left" as const, format: "text" as const },
  { key: "response_time", label: "Resp. promedio", align: "right" as const, format: "duration" as const },
  { key: "resolved", label: "Resueltas", align: "right" as const, format: "number" as const },
  { key: "ai_rate", label: "AI manejo", align: "right" as const, format: "percentage" as const },
];

const agentData = [
  { name: "Ana Garcia", response_time: 102, resolved: 47, ai_rate: 82 },
  { name: "Carlos Ruiz", response_time: 190, resolved: 31, ai_rate: 71 },
  { name: "Maria Lopez", response_time: 85, resolved: 52, ai_rate: 88 },
];

const meta: Meta<typeof DataTable> = {
  title: "Analytics/DataTable",
  component: DataTable,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof DataTable>;

export const AgentPerformance: Story = {
  name: "Rendimiento agentes",
  args: { columns: agentColumns, rows: agentData, highlight: "best" },
};

export const Empty: Story = {
  name: "Estado vacio",
  args: { columns: agentColumns, rows: [], emptyText: "No hay agentes" },
};

export const SingleRow: Story = {
  name: "Una fila",
  args: { columns: agentColumns, rows: [agentData[0]] },
};

export const WithHighlights: Story = {
  name: "Con mejores valores",
  args: { columns: agentColumns, rows: agentData, highlight: "best" },
};

export const NoHighlights: Story = {
  name: "Sin resaltado",
  args: { columns: agentColumns, rows: agentData, highlight: "none" },
};
