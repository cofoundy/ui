import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  DangerZone,
  DangerZoneHeader,
  DangerZoneItem,
  ConfirmDialog,
} from "../../components/ui/danger-zone";
import { Button } from "../../components/ui/button";

const meta: Meta<typeof DangerZone> = {
  title: "UI/DangerZone",
  component: DangerZone,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div
        style={{
          padding: "2rem",
          maxWidth: 700,
          background: "var(--background)",
          color: "var(--foreground)",
          minHeight: "100vh",
        }}
      >
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof DangerZone>;

/* ─── Profile Settings: Full Danger Zone ─── */

export const ProfileSettings: Story = {
  render: () => {
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmType, setConfirmType] = useState<"revoke" | "delete">(
      "revoke"
    );

    const openConfirm = (type: "revoke" | "delete") => {
      setConfirmType(type);
      setConfirmOpen(true);
    };

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            Danger Zone
          </h2>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">
            Irreversible and destructive actions
          </p>
        </div>

        <DangerZone>
          <DangerZoneHeader />
          <DangerZoneItem
            title="Log out all devices"
            description="Revoke all active sessions. You will need to log in again on every device."
            buttonLabel="Revoke All Sessions"
            variant="outline"
            onAction={() => openConfirm("revoke")}
          />
          <DangerZoneItem
            title="Delete account"
            description="Permanently remove your account and unassign all your conversations. This action cannot be undone."
            buttonLabel="Delete Account"
            variant="solid"
            onAction={() => openConfirm("delete")}
          />
        </DangerZone>

        <ConfirmDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          title={
            confirmType === "revoke"
              ? "Revoke All Sessions"
              : "Delete Account"
          }
          description={
            confirmType === "revoke"
              ? "This will log you out of all devices and sessions. You will need to log in again."
              : "This will permanently delete your account, remove you from this workspace, and unassign all your conversations. This action cannot be undone."
          }
          confirmText={
            confirmType === "revoke" ? "revoke sessions" : "delete my account"
          }
          onConfirm={() => {
            alert(`Confirmed: ${confirmType}`);
            setConfirmOpen(false);
          }}
        />
      </div>
    );
  },
};

/* ─── Confirm Dialog Standalone ─── */

export const ConfirmDialogStory: Story = {
  name: "Confirm Dialog",
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <>
        <Button variant="destructive" onClick={() => setOpen(true)}>
          Delete Account
        </Button>
        <ConfirmDialog
          open={open}
          onOpenChange={setOpen}
          title="Delete Account"
          description="This will permanently delete your account, remove you from this workspace, and unassign all your conversations. This action cannot be undone."
          confirmText="delete my account"
          onConfirm={() => {
            alert("Account deleted!");
            setOpen(false);
          }}
        />
      </>
    );
  },
};

/* ─── Confirm Dialog: Warning Variant ─── */

export const ConfirmDialogWarning: Story = {
  name: "Confirm Dialog (Warning)",
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <>
        <Button
          variant="outline"
          className="border-amber-500/50 text-amber-500 hover:bg-amber-500 hover:text-white"
          onClick={() => setOpen(true)}
        >
          Revoke All Sessions
        </Button>
        <ConfirmDialog
          open={open}
          onOpenChange={setOpen}
          title="Revoke All Sessions"
          description="This will log you out of all devices. You will need to log in again."
          confirmText="revoke sessions"
          variant="warning"
          onConfirm={() => {
            alert("Sessions revoked!");
            setOpen(false);
          }}
        />
      </>
    );
  },
};

/* ─── Confirm Dialog: Loading State ─── */

export const ConfirmDialogLoading: Story = {
  name: "Confirm Dialog (Loading)",
  render: () => {
    const [open, setOpen] = useState(true);

    return (
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Delete Account"
        description="Permanently delete your account."
        confirmText="delete my account"
        loading={true}
        onConfirm={() => {}}
      />
    );
  },
};

/* ─── Danger Zone: Single Item ─── */

export const SingleItem: Story = {
  render: () => (
    <DangerZone>
      <DangerZoneHeader />
      <DangerZoneItem
        title="Delete account"
        description="Permanently remove your account. This action cannot be undone."
        buttonLabel="Delete Account"
        variant="solid"
        onAction={() => alert("Delete clicked")}
      />
    </DangerZone>
  ),
};

/* ─── Danger Zone: Disabled ─── */

export const Disabled: Story = {
  render: () => (
    <DangerZone>
      <DangerZoneHeader />
      <DangerZoneItem
        title="Delete account"
        description="Only the workspace owner can delete this account."
        buttonLabel="Delete Account"
        variant="solid"
        disabled={true}
        onAction={() => {}}
      />
    </DangerZone>
  ),
};
