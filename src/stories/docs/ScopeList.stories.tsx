import type { StoryObj, Meta } from "@storybook/react";
import { ScopeList } from "../../components/docs/ScopeList";

const meta: Meta<typeof ScopeList> = {
  title: "Docs/ScopeList",
  component: ScopeList,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ScopeList>;

export const Default: Story = {
  args: {
    items: [
      "Diseño UX/UI de las 5 pantallas principales",
      "Integración con WhatsApp Business API",
      "Panel de administración básico",
    ],
  },
};

export const Mixed: Story = {
  name: "Estados mixtos",
  args: {
    items: [
      { text: "Módulo de autenticación", status: "check" },
      { text: "Dashboard de métricas", status: "check" },
      { text: "Integración Alegra (en curso)", status: "pending" },
      { text: "App móvil nativa", status: "cross" },
    ],
  },
};
