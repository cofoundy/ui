import type { StoryObj, Meta } from "@storybook/react";
import { Sitemap } from "../../components/docs/Sitemap";

const meta: Meta<typeof Sitemap> = {
  title: "Docs/Sitemap",
  component: Sitemap,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Sitemap>;

export const Default: Story = {
  args: {
    nodes: [
      {
        path: "/",
        label: "Home",
        intent: "transactional",
        nav_group: "primary",
        children: [
          { path: "/about", label: "About", nav_group: "primary", intent: "informational" },
          {
            path: "/products",
            label: "Products",
            intent: "informational",
            nav_group: "primary",
            children: [
              { path: "/products/inbox-ai", label: "Inbox AI" },
              { path: "/products/agenda-ai", label: "Agenda AI" },
            ],
          },
          { path: "/pricing", label: "Pricing", intent: "transactional", nav_group: "primary" },
        ],
      },
      { path: "/contact", label: "Contact", nav_group: "footer", intent: "transactional" },
      { path: "/legal", label: "Legal", nav_group: "footer" },
    ],
    defaultExpanded: true,
    density: "comfortable",
  },
};

export const Compact: Story = {
  name: "Compact density",
  args: {
    nodes: [
      { path: "/", label: "Home", children: [{ path: "/about", label: "About" }] },
      { path: "/blog", label: "Blog" },
    ],
    defaultExpanded: true,
    density: "compact",
  },
};

// XGodel — canonical sitemap from `projects/xgodel-landing/research/07-information-architecture.md`.
export const XGodelSitemap: Story = {
  name: "XGodel — landing IA",
  args: {
    nodes: [
      {
        path: "/",
        label: "Home (Hero + propuesta de valor)",
        intent: "transactional",
        nav_group: "primary",
        children: [
          { path: "/metodologia", label: "Metodología académica", intent: "informational", nav_group: "primary" },
          { path: "/casos", label: "Casos de éxito", intent: "informational", nav_group: "primary" },
          {
            path: "/programas",
            label: "Programas",
            intent: "transactional",
            nav_group: "primary",
            children: [
              { path: "/programas/aceleracion", label: "Aceleración 12 sem", intent: "transactional" },
              { path: "/programas/mentoria-1on1", label: "Mentoría 1-on-1", intent: "transactional" },
            ],
          },
        ],
      },
      { path: "/blog", label: "Blog", intent: "informational", nav_group: "footer" },
      { path: "/contacto", label: "Reservar call", intent: "transactional", nav_group: "footer" },
    ],
    defaultExpanded: true,
    density: "comfortable",
  },
};
