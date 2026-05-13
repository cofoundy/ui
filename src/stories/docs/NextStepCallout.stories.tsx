import type { StoryObj, Meta } from "@storybook/react";
import { NextStepCallout } from "../../components/docs/NextStepCallout";

const meta: Meta<typeof NextStepCallout> = {
  title: "Docs/NextStepCallout",
  component: NextStepCallout,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof NextStepCallout>;

export const Default: Story = {
  args: {
    label: "Siguiente paso",
    body: "Agenda una sesión de kick-off para definir el roadmap del próximo trimestre.",
    href: "https://cal.cofoundy.dev/andre/meet",
    ctaText: "Agendar reunión →",
  },
};

export const WithoutCTA: Story = {
  name: "Sin botón",
  args: {
    label: "Acción requerida",
    body: "Revisa el contrato adjunto y firma antes del viernes.",
  },
};
