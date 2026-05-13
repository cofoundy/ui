import type { StoryObj, Meta } from "@storybook/react";
import { AuthorNote } from "../../components/docs/AuthorNote";

const meta: Meta<typeof AuthorNote> = {
  title: "Docs/AuthorNote",
  component: AuthorNote,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof AuthorNote>;

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
