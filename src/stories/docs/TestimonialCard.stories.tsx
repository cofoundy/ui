import type { StoryObj, Meta } from "@storybook/react";
import { TestimonialCard } from "../../components/docs/TestimonialCard";

const meta: Meta<typeof TestimonialCard> = {
  title: "Docs/TestimonialCard",
  component: TestimonialCard,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof TestimonialCard>;

export const Default: Story = {
  args: {
    quote: "Cofoundy nos ayudó a lanzar en 6 semanas lo que pensábamos que tomaría 6 meses. El equipo es increíblemente eficiente.",
    author: "Rodrigo Lama",
    role: "CEO",
    source: "Pets.com.pe",
  },
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
