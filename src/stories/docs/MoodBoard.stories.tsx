import type { StoryObj, Meta } from "@storybook/react";
import { MoodBoard } from "../../components/docs/MoodBoard";

const meta: Meta<typeof MoodBoard> = {
  title: "Docs/MoodBoard",
  component: MoodBoard,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof MoodBoard>;

export const Default: Story = {
  args: {
    items: [
      { src: "https://picsum.photos/seed/a/400/300", alt: "Referencia visual 1", caption: "Interfaz limpia y minimalista" },
      { src: "https://picsum.photos/seed/b/400/300", alt: "Referencia visual 2", caption: "Paleta de colores oscura" },
      { src: "https://picsum.photos/seed/c/400/300", alt: "Referencia visual 3", caption: "Tipografía bold" },
    ],
    columns: 3,
  },
};

export const TwoColumns: Story = {
  name: "2 columnas",
  args: {
    items: [
      { src: "https://picsum.photos/seed/d/400/300", alt: "Imagen 1" },
      { src: "https://picsum.photos/seed/e/400/300", alt: "Imagen 2" },
      { src: "https://picsum.photos/seed/f/400/300", alt: "Imagen 3" },
      { src: "https://picsum.photos/seed/g/400/300", alt: "Imagen 4" },
    ],
    columns: 2,
  },
};
