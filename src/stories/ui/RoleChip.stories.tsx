import type { Meta, StoryObj } from "@storybook/react";

import { RoleChip } from "../../components/ui/role-chip";

/**
 * RoleChip — a tinted small-caps mono chip with a leading status dot, for
 * role / visibility / access state. The scannable spine of a governance row.
 * Passes AA in both light and dark via per-tone `--chip-fg-*` overrides.
 */
const meta: Meta<typeof RoleChip> = {
  title: "UI/RoleChip",
  component: RoleChip,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  argTypes: {
    tone: {
      control: "select",
      options: ["owner", "admin", "member", "open", "private", "public"],
    },
    size: { control: "radio", options: ["sm", "default"] },
    dot: { control: "boolean" },
  },
  args: { tone: "owner", size: "default", dot: true },
};
export default meta;
type Story = StoryObj<typeof RoleChip>;

export const Owner: Story = { args: { tone: "owner" } };

export const AllTones: Story = {
  render: () => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
      <RoleChip tone="owner" />
      <RoleChip tone="admin" />
      <RoleChip tone="member" />
      <RoleChip tone="open" />
      <RoleChip tone="private" />
      <RoleChip tone="public" />
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <RoleChip tone="owner" size="sm" />
      <RoleChip tone="owner" size="default" />
    </div>
  ),
};

export const CustomLabel: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 12 }}>
      <RoleChip tone="public">PUBLIC</RoleChip>
      <RoleChip tone="private">RESTRICTED</RoleChip>
    </div>
  ),
};

export const Light: Story = {
  parameters: { backgrounds: { default: "light", values: [{ name: "light", value: "#ffffff" }] } },
  render: () => (
    <div data-theme="light" style={{ display: "flex", flexWrap: "wrap", gap: 12, padding: 24 }}>
      <RoleChip tone="owner" />
      <RoleChip tone="admin" />
      <RoleChip tone="member" />
      <RoleChip tone="open" />
      <RoleChip tone="private" />
      <RoleChip tone="public" />
    </div>
  ),
};
