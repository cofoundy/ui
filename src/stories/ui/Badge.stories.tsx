import type { Meta, StoryObj } from "@storybook/react";
import { Badge } from "../../components/ui/badge";

const meta: Meta<typeof Badge> = {
  title: "UI/Badge",
  component: Badge,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: [
        "default",
        "secondary",
        "destructive",
        "success",
        "warning",
        "error",
        "info",
        "outline",
      ],
      description: "The visual style of the badge",
    },
    size: {
      control: "select",
      options: ["sm", "default", "lg"],
      description: "The size of the badge",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Default: Story = {
  args: {
    children: "Badge",
    variant: "default",
  },
};

export const Secondary: Story = {
  args: {
    children: "Secondary",
    variant: "secondary",
  },
};

export const Outline: Story = {
  args: {
    children: "Outline",
    variant: "outline",
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <div>
        <h4 className="text-sm font-medium text-foreground mb-2">Base</h4>
        <div className="flex gap-2 flex-wrap">
          <Badge variant="default">Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
        </div>
      </div>
      <div>
        <h4 className="text-sm font-medium text-foreground mb-2">Status</h4>
        <div className="flex gap-2 flex-wrap">
          <Badge variant="success">Success</Badge>
          <Badge variant="warning">Warning</Badge>
          <Badge variant="error">Error</Badge>
          <Badge variant="info">Info</Badge>
        </div>
      </div>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Badge size="sm">Small</Badge>
      <Badge size="default">Default</Badge>
      <Badge size="lg">Large</Badge>
    </div>
  ),
};

export const InContext: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <span className="text-sm text-foreground">Status:</span>
        <Badge variant="success">Active</Badge>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-foreground">Priority:</span>
        <Badge variant="error">High</Badge>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-foreground">Type:</span>
        <Badge variant="info">New</Badge>
      </div>
    </div>
  ),
};

export const NotificationCount: Story = {
  render: () => (
    <div className="flex items-center gap-6">
      <div className="relative">
        <div className="size-10 rounded-lg bg-accent flex items-center justify-center">
          <span className="text-foreground">Icon</span>
        </div>
        <Badge
          variant="error"
          size="sm"
          className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1"
        >
          3
        </Badge>
      </div>
      <div className="relative">
        <div className="size-10 rounded-lg bg-accent flex items-center justify-center">
          <span className="text-foreground">Icon</span>
        </div>
        <Badge
          variant="error"
          size="sm"
          className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1"
        >
          99+
        </Badge>
      </div>
    </div>
  ),
};
