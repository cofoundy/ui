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

// NEW — exercises `direction` label + per-color `usage_note` (Atelier patch).
// XGodel "Emerald Academic" brand direction.
export const XGodelEmeraldAcademic: Story = {
  name: "XGodel — Emerald Academic (Atelier patch)",
  args: {
    direction: "Emerald Academic",
    colors: [
      { name: "Primary", value: "#0F5132", usage_note: "Headlines + primary CTAs" },
      { name: "Accent", value: "#E2B007", usage_note: "Decorative only; never body text" },
      { name: "Surface", value: "#F8F5EC", usage_note: "Page background, cards" },
      { name: "Ink", value: "#1A1D1A", usage_note: "Body text, ≥7:1 contrast" },
    ],
    typography: [
      { name: "Display", family: "Fraunces", weight: "700", sample: "El rigor académico empieza aquí." },
      { name: "Body", family: "Inter", weight: "400", sample: "Acompañamos a startups con metodología académica." },
    ],
    spacing: [
      { name: "sm", value: "8px" },
      { name: "md", value: "16px" },
      { name: "lg", value: "24px" },
    ],
    radius: [
      { name: "card", value: "12px" },
      { name: "pill", value: "9999px" },
    ],
  },
};
