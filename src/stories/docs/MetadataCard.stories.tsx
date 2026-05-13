import type { StoryObj, Meta } from "@storybook/react";
import { MetadataCard } from "../../components/docs/MetadataCard";

const meta: Meta<typeof MetadataCard> = {
  title: "Docs/MetadataCard",
  component: MetadataCard,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof MetadataCard>;

export const Default: Story = {
  args: {
    items: [
      { label: "Autor", value: "Andre Pacheco" },
      { label: "Versión", value: "2.1.0" },
      { label: "Actualizado", value: "2026-05-13" },
      { label: "Estado", value: "Publicado" },
    ],
  },
};
