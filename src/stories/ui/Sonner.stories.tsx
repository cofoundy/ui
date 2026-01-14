import type { Meta, StoryObj } from "@storybook/react";
import { Toaster, toast } from "../../components/ui/sonner";
import { Button } from "../../components/ui/button";

const meta: Meta<typeof Toaster> = {
  title: "UI/Sonner",
  component: Toaster,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div>
        <Story />
        <Toaster />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          "A toast notification component built on top of Sonner. Use the `toast` function to trigger notifications.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Toaster>;

export const Default: Story = {
  render: () => (
    <div className="flex gap-2 flex-wrap">
      <Button onClick={() => toast("Event has been created")}>
        Show Toast
      </Button>
    </div>
  ),
};

export const WithDescription: Story = {
  render: () => (
    <Button
      onClick={() =>
        toast("Event Created", {
          description: "Your event has been scheduled for tomorrow.",
        })
      }
    >
      Toast with Description
    </Button>
  ),
};

export const Success: Story = {
  render: () => (
    <Button onClick={() => toast.success("Successfully saved!")}>
      Success Toast
    </Button>
  ),
};

export const Error: Story = {
  render: () => (
    <Button
      variant="destructive"
      onClick={() => toast.error("Something went wrong!")}
    >
      Error Toast
    </Button>
  ),
};

export const Warning: Story = {
  render: () => (
    <Button
      variant="outline"
      onClick={() => toast.warning("Please review your input")}
    >
      Warning Toast
    </Button>
  ),
};

export const Info: Story = {
  render: () => (
    <Button variant="secondary" onClick={() => toast.info("Did you know?")}>
      Info Toast
    </Button>
  ),
};

export const Loading: Story = {
  render: () => (
    <Button
      onClick={() => {
        const toastId = toast.loading("Loading...");
        setTimeout(() => {
          toast.success("Completed!", { id: toastId });
        }, 2000);
      }}
    >
      Loading Toast
    </Button>
  ),
};

export const WithAction: Story = {
  render: () => (
    <Button
      onClick={() =>
        toast("File deleted", {
          action: {
            label: "Undo",
            onClick: () => toast.success("Restored!"),
          },
        })
      }
    >
      Toast with Action
    </Button>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <h4 className="text-sm font-medium text-foreground">Toast Variants</h4>
      <div className="flex gap-2 flex-wrap">
        <Button onClick={() => toast("Default toast")}>Default</Button>
        <Button onClick={() => toast.success("Success toast")}>Success</Button>
        <Button onClick={() => toast.error("Error toast")}>Error</Button>
        <Button onClick={() => toast.warning("Warning toast")}>Warning</Button>
        <Button onClick={() => toast.info("Info toast")}>Info</Button>
      </div>
    </div>
  ),
};
