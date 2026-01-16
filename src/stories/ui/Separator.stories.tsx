import type { Meta, StoryObj } from "@storybook/react";
import { Separator } from "../../components/ui/separator";

const meta: Meta<typeof Separator> = {
  title: "UI/Separator",
  component: Separator,
  tags: ["autodocs"],
  argTypes: {
    orientation: {
      control: "select",
      options: ["horizontal", "vertical"],
      description: "The orientation of the separator",
    },
    decorative: {
      control: "boolean",
      description: "Whether the separator is purely decorative",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Separator>;

export const Horizontal: Story = {
  render: () => (
    <div className="w-full max-w-sm">
      <div className="space-y-1">
        <h4 className="text-sm font-medium leading-none">Radix Primitives</h4>
        <p className="text-sm text-[var(--muted-foreground)]">
          An open-source UI component library.
        </p>
      </div>
      <Separator className="my-4" />
      <div className="flex h-5 items-center space-x-4 text-sm">
        <div>Blog</div>
        <Separator orientation="vertical" />
        <div>Docs</div>
        <Separator orientation="vertical" />
        <div>Source</div>
      </div>
    </div>
  ),
};

export const Vertical: Story = {
  render: () => (
    <div className="flex h-12 items-center space-x-4 text-sm">
      <div>Dashboard</div>
      <Separator orientation="vertical" className="h-full" />
      <div>Settings</div>
      <Separator orientation="vertical" className="h-full" />
      <div>Profile</div>
    </div>
  ),
};

export const InList: Story = {
  render: () => (
    <div className="w-full max-w-sm space-y-2">
      <div className="py-2">
        <p className="text-sm font-medium">Option 1</p>
        <p className="text-xs text-[var(--muted-foreground)]">Description for option 1</p>
      </div>
      <Separator />
      <div className="py-2">
        <p className="text-sm font-medium">Option 2</p>
        <p className="text-xs text-[var(--muted-foreground)]">Description for option 2</p>
      </div>
      <Separator />
      <div className="py-2">
        <p className="text-sm font-medium">Option 3</p>
        <p className="text-xs text-[var(--muted-foreground)]">Description for option 3</p>
      </div>
    </div>
  ),
};
