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
