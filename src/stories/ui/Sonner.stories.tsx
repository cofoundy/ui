import type { Meta, StoryObj } from "@storybook/react";
import { Toaster, toast } from "../../components/ui/sonner";
import { Button } from "../../components/ui/button";
import { VIEWPORT_MOBILE } from "../_shared/viewports";

const meta: Meta<typeof Toaster> = {
  title: "UI/Sonner",
  component: Toaster,
  tags: ["autodocs"],
  decorators: [
    (Story, ctx) => (
      <div>
        <Story />
        <Toaster position="bottom-center" dock={ctx.parameters.dock as number | undefined} />
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

/**
 * The toast rule: only for failures or for results that live elsewhere — here the
 * conversation moved to Lucía's inbox, so the operator gets "Asignada a Lucía" + Deshacer.
 * Saving never raises a toast (the Button `status` answers in place).
 */
export const RemoteResult: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Button
        onClick={() =>
          toast.success("Asignada a Lucía", {
            description: "La conversación pasó a su bandeja.",
            action: { label: "Deshacer", onClick: () => {} },
          })
        }
      >
        Asignar a Lucía
      </Button>
      <Button
        variant="outline"
        onClick={() => toast.error("No se envió el mensaje", { description: "Sin conexión. Se reintenta al volver." })}
      >
        Falla en segundo plano
      </Button>
    </div>
  ),
};

/** Bottom-center on a phone, rising out of the top edge of a 72 px dock (`dock={72}`). */
export const MobileBaseline: Story = {
  parameters: { viewport: VIEWPORT_MOBILE, dock: 72, layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div className="relative min-h-[600px]">
        <Story />
        <div className="fixed inset-x-0 bottom-0 h-[72px] border-t border-[var(--border)] bg-[var(--background)] p-4 text-xs text-[var(--muted-foreground)]">
          Dock (composer)
        </div>
      </div>
    ),
  ],
  render: () => (
    <div className="p-4">
      <Button
        size="lg"
        onClick={() =>
          toast.success("Asignada a Lucía", { action: { label: "Deshacer", onClick: () => {} } })
        }
      >
        Asignar a Lucía
      </Button>
    </div>
  ),
};
