import type { StoryObj, Meta } from "@storybook/react";
import { PersonalNote as DocsPersonalNote } from "../../components/docs/PersonalNote";

// Note: exported as DocsPersonalNote to avoid collision with the email
// template PersonalNote already exported from @cofoundy/ui.

const meta: Meta<typeof DocsPersonalNote> = {
  title: "Docs/PersonalNote",
  component: DocsPersonalNote,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof DocsPersonalNote>;

export const Default: Story = {
  args: {
    author: "Andre Pacheco",
    role: "CEO, Cofoundy",
    signature: "Andre",
    children: "Este documento resume los acuerdos clave de nuestra sesión de estrategia. Si algo no refleja lo conversado, escríbeme directamente.",
  },
};

export const WithAvatar: Story = {
  name: "Con avatar",
  args: {
    author: "Andre Pacheco",
    role: "CEO, Cofoundy",
    avatar: "https://github.com/A-PachecoT.png",
    children: "Adjunto el resumen ejecutivo para tu revisión antes del board.",
  },
};
