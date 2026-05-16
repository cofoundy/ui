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

// NEW — exercises Atelier §6.2 patched props (jtbd, objections, journeyStage,
// age, incomeRange, source). Canonical XGodel persona — sourced from
// `deals/clients/XGodel/ux-research/02-user-personas.md`.
export const XGodelFull: Story = {
  name: "XGodel — full (Atelier patched props)",
  args: {
    name: "John Medina",
    role: "Cofounder, XGodel",
    avatar: "https://i.pravatar.cc/80?img=12",
    demographics: ["Lima, Peru", "32 años", "Startup AcademicTech"],
    painPoints: [
      "Demasiados leads no calificados",
      "Branding inconsistente entre touchpoints",
      "Sitio actual no transmite seriedad académica",
    ],
    goals: [
      "Cerrar 3 cuentas enterprise en Q3",
      "Reducir time-to-MQL <48h",
    ],
    quote: "Necesito que mi sitio refleje seriedad académica sin parecer aburrido.",
    jtbd: "Cuando un VC visita nuestra landing, quiero que perciba rigor inmediato — para que reservemos call sin objeción.",
    objections: ["No tenemos presupuesto este mes", "Ya tenemos un dev interno"],
    journeyStage: "decision",
    age: "30-35",
    incomeRange: "S/.12k-20k/mes",
    source: "ux-research/02-user-personas.md",
  },
};
