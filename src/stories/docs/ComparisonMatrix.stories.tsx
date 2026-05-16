import type { StoryObj, Meta } from "@storybook/react";
import { ComparisonMatrix } from "../../components/docs/ComparisonMatrix";

const meta: Meta<typeof ComparisonMatrix> = {
  title: "Docs/ComparisonMatrix",
  component: ComparisonMatrix,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ComparisonMatrix>;

export const Default: Story = {
  args: {
    columns: ["Opción A", "Opción B", "Opción C"],
    rows: [
      {
        feature: "Precio",
        options: [
          { name: "Opción A", value: "$50/mes" },
          { name: "Opción B", value: "$80/mes", highlight: true },
          { name: "Opción C", value: "$120/mes" },
        ],
      },
      {
        feature: "Usuarios incluidos",
        options: [
          { name: "Opción A", value: "5" },
          { name: "Opción B", value: "20", highlight: true },
          { name: "Opción C", value: "Ilimitados" },
        ],
      },
      {
        feature: "Soporte",
        options: [
          { name: "Opción A", value: "Email" },
          { name: "Opción B", value: "Chat + Email", highlight: true },
          { name: "Opción C", value: "Dedicado 24/7" },
        ],
      },
    ],
  },
};

// NEW — exercises `traffic_light` enum (green/yellow/red) + per-row `source`.
// XGodel brand direction trade-off matrix.
export const XGodelTradeoff: Story = {
  name: "XGodel — brand direction trade-off (Atelier patch)",
  args: {
    columns: ["A — Emerald Academic", "B — Bordeaux Historic", "C — Editorial Premium"],
    rows: [
      {
        feature: "Academic feel",
        options: [
          { name: "A — Emerald Academic", value: "Strong", traffic_light: "green" },
          { name: "B — Bordeaux Historic", value: "Mixed", traffic_light: "yellow" },
          { name: "C — Editorial Premium", value: "Weak", traffic_light: "red" },
        ],
        source: "visual-design/DECISIONS.md",
      },
      {
        feature: "Mobile perf budget",
        options: [
          { name: "A — Emerald Academic", value: 95, highlight: true, traffic_light: "green" },
          { name: "B — Bordeaux Historic", value: 88, traffic_light: "yellow" },
          { name: "C — Editorial Premium", value: 92, traffic_light: "green" },
        ],
        source: "Lighthouse audit 2026-05-10",
      },
      {
        feature: "Dev cost (días)",
        options: [
          { name: "A — Emerald Academic", value: 4, traffic_light: "green" },
          { name: "B — Bordeaux Historic", value: 6, traffic_light: "yellow" },
          { name: "C — Editorial Premium", value: 8, traffic_light: "red" },
        ],
      },
    ],
  },
};
