import type { Meta, StoryObj } from "@storybook/react";

import { ActivationNote } from "../../components/ui/activation-note";

/**
 * ActivationNote — a calm, legible note with a brand-tinted left rule and no
 * loud icon, used to qualify a governance action. Copy is a slot: the product
 * supplies the text; nothing is hardcoded.
 */
const meta: Meta<typeof ActivationNote> = {
  title: "UI/ActivationNote",
  component: ActivationNote,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  argTypes: {
    variant: { control: "radio", options: ["inset", "inline"] },
  },
  args: {
    variant: "inset",
    children:
      "Access activates when this email signs in; accounts are provisioned by Cofoundy.",
  },
};
export default meta;
type Story = StoryObj<typeof ActivationNote>;

export const Inset: Story = { args: { variant: "inset" } };

export const Inline: Story = {
  args: {
    variant: "inline",
    children: "Will be able to read once they sign in.",
  },
};

export const Light: Story = {
  parameters: { backgrounds: { default: "light", values: [{ name: "light", value: "#ffffff" }] } },
  render: () => (
    <div data-theme="light" style={{ padding: 24, maxWidth: 480 }}>
      <ActivationNote variant="inset">
        Access activates when this email signs in; accounts are provisioned by Cofoundy.
      </ActivationNote>
    </div>
  ),
};
