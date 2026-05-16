import type { StoryObj, Meta } from "@storybook/react";
import { TestimonialCard } from "../../components/docs/TestimonialCard";
import { testimonialCardSchema } from "../../components/docs/TestimonialCard.schema";

const meta: Meta<typeof TestimonialCard> = {
  title: "Docs/TestimonialCard",
  component: TestimonialCard,
  tags: ["autodocs"],
  parameters: {
    // KEEP per Atelier cycle: schema-only ship — no XGodel render this v1.
    docs: {
      description: {
        component:
          "TestimonialCard ships with Zod schema in this cycle but has no XGodel render — XGodel deals tienen aún 0 testimonials públicos. Story exists to (a) catch visual regressions, (b) validate schema parses for canonical inputs.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof TestimonialCard>;

// Sanity assertion — fails Storybook build if schema drifts from example.
const _canonicalParse = testimonialCardSchema.parse({
  quote: "Cofoundy nos ayudó a lanzar en 6 semanas lo que pensábamos que tomaría 6 meses. El equipo es increíblemente eficiente.",
  author: "Rodrigo Lama",
  role: "CEO",
  source: "Pets.com.pe",
});

export const Default: Story = {
  args: _canonicalParse,
};

export const WithAvatar: Story = {
  name: "Con avatar",
  args: {
    quote: "La integración con nuestro CRM fue impecable. Cero bugs en producción.",
    author: "Lucía Mendoza",
    role: "CTO, FinTech Lima",
    avatar: "https://i.pravatar.cc/80?img=47",
    source: "LinkedIn",
    sourceUrl: "https://linkedin.com",
  },
};
