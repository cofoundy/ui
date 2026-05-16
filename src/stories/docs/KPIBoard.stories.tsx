import type { StoryObj, Meta } from "@storybook/react";
import { KPIBoard } from "../../components/docs/KPIBoard";

const meta: Meta<typeof KPIBoard> = {
  title: "Docs/KPIBoard",
  component: KPIBoard,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof KPIBoard>;

export const Default: Story = {
  args: {
    kpis: [
      {
        label: "MRR",
        value: "$12,400",
        trend: { direction: "up", value: "+18%" },
        status: "good",
      },
      {
        label: "Churn",
        value: "2.1%",
        trend: { direction: "down", value: "-0.4pp" },
        status: "good",
        target: "< 3%",
      },
      {
        label: "CAC",
        value: "$340",
        trend: { direction: "up", value: "+12%" },
        status: "warn",
        target: "< $300",
      },
      {
        label: "NPS",
        value: "72",
        trend: { direction: "flat", value: "0" },
        status: "good",
        target: "> 50",
      },
    ],
  },
};

export const Simple: Story = {
  name: "Sin tendencias",
  args: {
    kpis: [
      { label: "Usuarios activos", value: "1,234" },
      { label: "Conversión", value: "3.8%" },
      { label: "Tickets abiertos", value: "7", status: "warn" },
    ],
  },
};

// NEW — exercises `baseline` + `source` (Atelier patch). XGodel CRO plan KPIs.
export const XGodelCROBaseline: Story = {
  name: "XGodel — CRO plan (Atelier patch)",
  args: {
    kpis: [
      {
        label: "Time-to-MQL",
        value: "36h",
        trend: { direction: "down", value: "-12h" },
        target: "<48h",
        baseline: "60h (Q1 2026)",
        status: "good",
        source: "docs/16-cro-plan.md",
      },
      {
        label: "Cierres / mes",
        value: 3,
        target: "5",
        baseline: "2 (Q1 2026)",
        status: "warn",
        source: "deals/pipeline.yaml — 2026-05-10",
      },
      {
        label: "Lighthouse perf",
        value: 95,
        target: "≥90",
        baseline: "78 (pre-redesign)",
        status: "good",
        source: "Lighthouse CI 2026-05-15",
      },
    ],
    columns: 3,
  },
};
