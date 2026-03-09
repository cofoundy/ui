import type { StoryObj, Meta } from "@storybook/react";
import { Leaderboard } from "../../components/analytics/Leaderboard";

const agentLeaderboard = [
  { name: "Maria Lopez", score: 52, subtitle: "Soporte L2" },
  { name: "Ana Garcia", score: 47, subtitle: "Soporte L1" },
  { name: "Carlos Ruiz", score: 31, subtitle: "Soporte L1" },
  { name: "Pedro Diaz", score: 28, subtitle: "Soporte L2" },
  { name: "Laura Sanchez", score: 19, subtitle: "Soporte L1" },
];

const meta: Meta<typeof Leaderboard> = {
  title: "Analytics/Leaderboard",
  component: Leaderboard,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Leaderboard>;

export const Default: Story = {
  args: {
    items: agentLeaderboard,
    metric: "Tickets resueltos",
    format: "number",
    showBars: true,
    podiumStyle: true,
  },
};

export const ResponseTime: Story = {
  name: "Tiempo de respuesta",
  args: {
    items: [
      { name: "Maria Lopez", score: 85, subtitle: "Soporte L2" },
      { name: "Ana Garcia", score: 102, subtitle: "Soporte L1" },
      { name: "Carlos Ruiz", score: 190, subtitle: "Soporte L1" },
    ],
    metric: "Resp. promedio (menor = mejor)",
    format: "duration",
    showBars: true,
    podiumStyle: true,
  },
};

export const AIRate: Story = {
  name: "Tasa AI",
  args: {
    items: [
      { name: "Maria Lopez", score: 88 },
      { name: "Ana Garcia", score: 82 },
      { name: "Carlos Ruiz", score: 71 },
      { name: "Pedro Diaz", score: 65 },
    ],
    metric: "AI manejo %",
    format: "percentage",
    showBars: true,
  },
};

export const NoBars: Story = {
  name: "Sin barras",
  args: {
    items: agentLeaderboard,
    metric: "Tickets resueltos",
    showBars: false,
  },
};

export const NoPodium: Story = {
  name: "Sin estilo podio",
  args: {
    items: agentLeaderboard,
    metric: "Tickets resueltos",
    podiumStyle: false,
    showBars: true,
  },
};
