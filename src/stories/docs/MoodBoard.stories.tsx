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

// NEW — exercises `concept_tag` + `source_url` (Atelier patch). 4 XGodel
// concept directions A/B/C/D — final picked via DECISIONS.md.
export const XGodelConcepts: Story = {
  name: "XGodel — 4 concepts (concept_tag + source_url)",
  args: {
    items: [
      {
        src: "https://picsum.photos/seed/xgodel-A/400/300",
        alt: "Concept A — emerald academic",
        caption: "Editorial premium",
        concept_tag: "A",
        source_url: "https://example.com/xgodel/concept-A",
      },
      {
        src: "https://picsum.photos/seed/xgodel-B/400/300",
        alt: "Concept B — bordeaux historic",
        caption: "Historic gravitas",
        concept_tag: "B",
        source_url: "https://example.com/xgodel/concept-B",
      },
      {
        src: "https://picsum.photos/seed/xgodel-C/400/300",
        alt: "Concept C — editorial premium",
        caption: "Magazine layout",
        concept_tag: "C",
      },
      {
        src: "https://picsum.photos/seed/xgodel-D/400/300",
        alt: "Concept D — minimal",
        caption: "Reserved typography",
        concept_tag: "D",
      },
    ],
    columns: 4,
  },
};
