import type { StoryObj, Meta } from "@storybook/react";
import { QuoteCard } from "../../components/docs/QuoteCard";

const meta: Meta<typeof QuoteCard> = {
  title: "Docs/QuoteCard",
  component: QuoteCard,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof QuoteCard>;

export const Default: Story = {
  args: {
    client_name: "Cliente Demo SAC",
    prepared_for: "Ana Salazar — Gerente Comercial",
    valid_until: "2026-06-30",
    milestones: [
      { label: "Hito 1 — Discovery + Brief", deliverable: "Brief.yaml + Sitemap + Personas", amount: "S/. 1,500", due: "Semana 1" },
      { label: "Hito 2 — Diseño + Build", deliverable: "Landing v1 + QA + deploy a staging", amount: "S/. 3,500", due: "Semana 4" },
    ],
    total: "S/. 5,000",
    payment_terms: "50% adelanto al firmar, 50% al aprobar Hito 2.",
    notes: "Incluye revisiones ilimitadas hasta aprobación de cada hito. Hosting + dominio NO incluidos.",
  },
};

export const Accent: Story = {
  name: "Tono accent (highlight border)",
  args: {
    client_name: "Cliente Demo SAC",
    valid_until: "2026-06-30",
    milestones: [
      { label: "Hito único", deliverable: "Landing express + 1 round de QA", amount: "S/. 1,200", due: "Semana 2" },
    ],
    total: "S/. 1,200",
    payment_terms: "50/50 estándar.",
    tone: "accent",
  },
};

// XGodel — canonical cotización extracted from `deals/clients/XGodel/propuesta.html`.
export const XGodelCotizacion: Story = {
  name: "XGodel — propuesta v1",
  args: {
    client_name: "XGodel",
    prepared_for: "John Medina — Cofounder",
    valid_until: "2026-06-30",
    milestones: [
      { label: "Hito 1 — Discovery + Personas", deliverable: "Brief + 3 personas validadas + sitemap + IA", amount: "S/. 1,500", due: "Semana 1-2" },
      { label: "Hito 2 — Brand + Mockups", deliverable: "3 direcciones de marca + design tokens + 3 mockups responsive", amount: "S/. 2,000", due: "Semana 3-4" },
      { label: "Hito 3 — Build + Deploy", deliverable: "Landing en Next.js + CMS + deploy Cloudflare + QA", amount: "S/. 3,500", due: "Semana 5-7" },
    ],
    total: "S/. 7,000",
    payment_terms: "50% adelanto al firmar, 25% al aprobar Hito 2, 25% al deploy.",
    notes: "Sujeto a addendum-pago-comprobante.md. Incluye 30 días de soporte post-deploy.",
  },
};
