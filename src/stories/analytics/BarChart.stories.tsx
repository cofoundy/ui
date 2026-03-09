import type { StoryObj, Meta } from "@storybook/react";
import { BarChart } from "../../components/analytics/BarChart";

const weekData = [
  { label: "Lun", value: 42 },
  { label: "Mar", value: 58 },
  { label: "Mie", value: 35 },
  { label: "Jue", value: 67 },
  { label: "Vie", value: 51 },
  { label: "Sab", value: 23 },
  { label: "Dom", value: 14 },
];

const monthData = Array.from({ length: 30 }, (_, i) => ({
  label: `${i + 1}`,
  value: Math.floor(Math.random() * 80 + 10),
}));

const meta: Meta<typeof BarChart> = {
  title: "Analytics/BarChart",
  component: BarChart,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof BarChart>;

export const Default: Story = {
  args: { data: weekData, height: 200, animate: true },
};

export const Empty: Story = {
  name: "Estado vacio",
  args: { data: [], height: 200 },
};

export const WithValues: Story = {
  name: "Con valores visibles",
  args: { data: weekData, height: 200, showValues: true, animate: true },
};

export const SingleBar: Story = {
  name: "Una sola barra",
  args: { data: [{ label: "Hoy", value: 42 }], height: 200, showValues: true },
};

export const ThirtyDays: Story = {
  name: "30 dias",
  args: { data: monthData, height: 200, animate: true },
};

export const CustomColor: Story = {
  name: "Color personalizado",
  args: { data: weekData, height: 200, barColor: "var(--chat-success)", animate: true },
};
