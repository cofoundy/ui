import type { StoryObj, Meta } from "@storybook/react";
import { DesignSystemPanel } from "../../components/docs/DesignSystemPanel";

const meta: Meta<typeof DesignSystemPanel> = {
  title: "Docs/DesignSystemPanel",
  component: DesignSystemPanel,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof DesignSystemPanel>;

export const Default: Story = {
  args: {
    colors: [
      { name: "Primary", value: "#1b577e" },
      { name: "Success", value: "#22c55e" },
      { name: "Error", value: "#ef4444" },
      { name: "Muted", value: "#6b7280" },
    ],
    typography: [
      { name: "Brand", family: "Inter", weight: "700", sample: "Cofoundy Platform" },
      { name: "Mono", family: "JetBrains Mono", weight: "400", sample: "const api = true;" },
    ],
    spacing: [
      { name: "xs", value: "4px" },
      { name: "sm", value: "8px" },
      { name: "md", value: "16px" },
      { name: "lg", value: "24px" },
    ],
    radius: [
      { name: "sm", value: "4px" },
      { name: "md", value: "8px" },
      { name: "lg", value: "12px" },
      { name: "full", value: "9999px" },
    ],
  },
};

export const ColorsOnly: Story = {
  name: "Solo colores",
  args: {
    colors: [
      { name: "Primary", value: "#1b577e" },
      { name: "Accent", value: "#46a0d0" },
    ],
  },
};
