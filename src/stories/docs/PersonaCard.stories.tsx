import type { StoryObj, Meta } from "@storybook/react";
import { PersonaCard } from "../../components/docs/PersonaCard";

const meta: Meta<typeof PersonaCard> = {
  title: "Docs/PersonaCard",
  component: PersonaCard,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof PersonaCard>;

export const Default: Story = {
  args: {
    name: "María Torres",
    role: "Gerente de Operaciones, PyME manufacturera",
    quote: "Necesito saber en tiempo real qué está pasando sin tener que preguntarle a todos.",
    demographics: ["35-50 años", "Lima Metropolitana", "10-50 empleados"],
    painPoints: [
      "Pierde horas coordinando por WhatsApp",
      "No tiene visibilidad de métricas en tiempo real",
    ],
    goals: [
      "Reducir tiempo de coordinación en 50%",
      "Dashboard unificado de operaciones",
    ],
  },
};

export const Minimal: Story = {
  name: "Mínimo (sin avatar ni listas)",
  args: {
    name: "Carlos Ríos",
    role: "Founder, SaaS B2B",
    quote: "Quiero crecer sin contratar más gente de soporte.",
  },
};
