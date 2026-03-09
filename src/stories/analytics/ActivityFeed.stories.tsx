import type { StoryObj, Meta } from "@storybook/react";
import { ActivityFeed } from "../../components/analytics/ActivityFeed";

const meta: Meta<typeof ActivityFeed> = {
  title: "Analytics/ActivityFeed",
  component: ActivityFeed,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ActivityFeed>;

const sampleItems = [
  {
    actor: "Maria Lopez",
    description: "resolvio conversacion #1247",
    timestamp: "Hace 2 min",
    color: "var(--chat-success)",
  },
  {
    actor: "AI",
    description: "resolvio automaticamente conversacion #1246",
    timestamp: "Hace 5 min",
    color: "var(--chat-primary)",
  },
  {
    actor: "Carlos Ruiz",
    description: "escalo conversacion #1245 a Soporte L2",
    timestamp: "Hace 12 min",
    color: "var(--chat-warning)",
  },
  {
    actor: "Ana Garcia",
    description: "se conecto al inbox",
    timestamp: "Hace 15 min",
    color: "var(--chat-muted)",
  },
  {
    actor: "AI",
    description: "detecto intencion de cancelacion en conversacion #1243",
    timestamp: "Hace 20 min",
    color: "var(--chat-error)",
  },
  {
    actor: "Sistema",
    description: "genero reporte semanal de metricas",
    timestamp: "Hace 1 hora",
    color: "var(--chat-muted)",
  },
];

export const Default: Story = {
  args: {
    items: sampleItems,
    showTimeline: true,
  },
};

export const Limited: Story = {
  name: "Limitado a 3 items",
  args: {
    items: sampleItems,
    maxItems: 3,
    showTimeline: true,
  },
};

export const NoTimeline: Story = {
  name: "Sin linea de tiempo",
  args: {
    items: sampleItems.slice(0, 4),
    showTimeline: false,
  },
};

export const SingleItem: Story = {
  name: "Un solo evento",
  args: {
    items: [sampleItems[0]],
    showTimeline: true,
  },
};
