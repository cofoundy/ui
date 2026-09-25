import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import { Button } from '../../components/ui/button';
import { VIEWPORT_MOBILE } from '../_shared/viewports';

const meta: Meta<typeof Tabs> = {
  title: 'UI/Tabs',
  component: Tabs,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Tabs>;

export const Default: Story = {
  render: () => (
    <Tabs defaultValue="tab1" className="w-96">
      <TabsList>
        <TabsTrigger value="tab1">Account</TabsTrigger>
        <TabsTrigger value="tab2">Password</TabsTrigger>
        <TabsTrigger value="tab3">Settings</TabsTrigger>
      </TabsList>
      <TabsContent value="tab1">
        <p className="text-sm text-foreground">
          Make changes to your account here. Click save when you're done.
        </p>
      </TabsContent>
      <TabsContent value="tab2">
        <p className="text-sm text-foreground">
          Change your password here. After saving, you'll be logged out.
        </p>
      </TabsContent>
      <TabsContent value="tab3">
        <p className="text-sm text-foreground">
          Manage your notification preferences and other settings.
        </p>
      </TabsContent>
    </Tabs>
  ),
};

export const TwoTabs: Story = {
  render: () => (
    <Tabs defaultValue="active" className="w-96">
      <TabsList>
        <TabsTrigger value="active">Active</TabsTrigger>
        <TabsTrigger value="archived">Archived</TabsTrigger>
      </TabsList>
      <TabsContent value="active">
        <div className="space-y-2">
          <div className="p-3 bg-card rounded-lg border border-border">
            <p className="text-sm text-foreground">Active conversation 1</p>
          </div>
          <div className="p-3 bg-card rounded-lg border border-border">
            <p className="text-sm text-foreground">Active conversation 2</p>
          </div>
        </div>
      </TabsContent>
      <TabsContent value="archived">
        <div className="space-y-2">
          <div className="p-3 bg-card rounded-lg border border-border opacity-60">
            <p className="text-sm text-foreground">Archived conversation 1</p>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  ),
};

export const WithDisabled: Story = {
  render: () => (
    <Tabs defaultValue="tab1" className="w-96">
      <TabsList>
        <TabsTrigger value="tab1">Available</TabsTrigger>
        <TabsTrigger value="tab2">Also Available</TabsTrigger>
        <TabsTrigger value="tab3" disabled>
          Coming Soon
        </TabsTrigger>
      </TabsList>
      <TabsContent value="tab1">
        <p className="text-sm text-foreground">This tab is available.</p>
      </TabsContent>
      <TabsContent value="tab2">
        <p className="text-sm text-foreground">This tab is also available.</p>
      </TabsContent>
    </Tabs>
  ),
};

export const ChannelTabs: Story = {
  render: () => (
    <Tabs defaultValue="all" className="w-full max-w-md">
      <TabsList>
        <TabsTrigger value="all">All</TabsTrigger>
        <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
        <TabsTrigger value="telegram">Telegram</TabsTrigger>
        <TabsTrigger value="email">Email</TabsTrigger>
      </TabsList>
      <TabsContent value="all">
        <div className="space-y-2">
          <div className="p-3 bg-card rounded-lg border border-border flex justify-between">
            <span className="text-sm text-foreground">John Doe</span>
            <span className="text-xs text-[var(--channel-whatsapp)]">WhatsApp</span>
          </div>
          <div className="p-3 bg-card rounded-lg border border-border flex justify-between">
            <span className="text-sm text-foreground">Jane Smith</span>
            <span className="text-xs text-[var(--channel-telegram)]">Telegram</span>
          </div>
          <div className="p-3 bg-card rounded-lg border border-border flex justify-between">
            <span className="text-sm text-foreground">Bob Wilson</span>
            <span className="text-xs text-[var(--channel-email)]">Email</span>
          </div>
        </div>
      </TabsContent>
      <TabsContent value="whatsapp">
        <div className="p-3 bg-card rounded-lg border border-border">
          <span className="text-sm text-foreground">John Doe - WhatsApp</span>
        </div>
      </TabsContent>
      <TabsContent value="telegram">
        <div className="p-3 bg-card rounded-lg border border-border">
          <span className="text-sm text-foreground">Jane Smith - Telegram</span>
        </div>
      </TabsContent>
      <TabsContent value="email">
        <div className="p-3 bg-card rounded-lg border border-border">
          <span className="text-sm text-foreground">Bob Wilson - Email</span>
        </div>
      </TabsContent>
    </Tabs>
  ),
};

export const SettingsPanel: Story = {
  render: () => (
    <div className="w-full max-w-lg p-4 bg-card rounded-xl border border-border">
      <h2 className="text-lg font-semibold text-foreground mb-4">Settings</h2>
      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>
        <TabsContent value="general">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">Display Name</label>
              <input
                type="text"
                className="mt-1 w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground text-sm"
                defaultValue="John Doe"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Email</label>
              <input
                type="email"
                className="mt-1 w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground text-sm"
                defaultValue="john@example.com"
              />
            </div>
          </div>
        </TabsContent>
        <TabsContent value="notifications">
          <div className="space-y-3">
            <label className="flex items-center gap-3">
              <input type="checkbox" defaultChecked className="rounded" />
              <span className="text-sm text-foreground">Email notifications</span>
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" defaultChecked className="rounded" />
              <span className="text-sm text-foreground">Push notifications</span>
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" className="rounded" />
              <span className="text-sm text-foreground">SMS notifications</span>
            </label>
          </div>
        </TabsContent>
        <TabsContent value="security">
          <div className="space-y-4">
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm">
              Change Password
            </button>
            <button className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm ml-2">
              Enable 2FA
            </button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  ),
};

/** Designed empty and load-error states inside tabs. The pill travels; content swaps. */
function InboxTabsDemo() {
  const [failed, setFailed] = useState(true);
  return (
    <Tabs defaultValue="todas" className="w-full max-w-sm">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="todas">Todas 12</TabsTrigger>
        <TabsTrigger value="mias">Mías</TabsTrigger>
        <TabsTrigger value="cerradas">Cerradas</TabsTrigger>
      </TabsList>
      <TabsContent value="todas" className="p-4 text-sm text-[var(--foreground)]">
        12 conversaciones abiertas.
      </TabsContent>
      <TabsContent value="mias" className="flex flex-col items-start gap-1.5 px-6 py-10">
        <p className="text-[17px] font-semibold text-[var(--foreground)]">Nada pendiente</p>
        <p className="max-w-[30ch] text-sm text-[var(--muted-foreground)]">
          Cuando te asignen una conversación aparece aquí.
        </p>
      </TabsContent>
      <TabsContent value="cerradas" className="flex flex-col items-start gap-1.5 px-6 py-10">
        {failed ? (
          <>
            <p className="text-[17px] font-semibold text-[var(--foreground)]">No se pudieron cargar</p>
            <p className="max-w-[30ch] text-sm text-[var(--muted-foreground)]">
              Revisa tu conexión e inténtalo otra vez.
            </p>
            <Button variant="outline" size="lg" className="mt-2" onClick={() => setFailed(false)}>
              Volver a cargar
            </Button>
          </>
        ) : (
          <p className="text-sm text-[var(--foreground)]">48 conversaciones cerradas.</p>
        )}
      </TabsContent>
    </Tabs>
  );
}

export const EmptyAndError: Story = {
  render: () => <InboxTabsDemo />,
};

export const MobileBaseline: Story = {
  parameters: { viewport: VIEWPORT_MOBILE },
  render: () => (
    <div className="w-full p-4">
      <InboxTabsDemo />
    </div>
  ),
};
