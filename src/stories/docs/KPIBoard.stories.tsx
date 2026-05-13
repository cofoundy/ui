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
