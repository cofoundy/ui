import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Switch } from '../../components/ui/switch';

const meta: Meta<typeof Switch> = {
  title: 'UI/Switch',
  component: Switch,
  tags: ['autodocs'],
  argTypes: {
    checked: {
      control: 'boolean',
      description: 'Whether the switch is checked',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the switch is disabled',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Switch>;

export const Default: Story = {
  args: {},
};

export const Checked: Story = {
  args: {
    defaultChecked: true,
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const DisabledChecked: Story = {
  args: {
    disabled: true,
    defaultChecked: true,
  },
};

const ControlledSwitch = () => {
  const [checked, setChecked] = useState(false);
  return (
    <div className="flex items-center gap-4">
      <Switch checked={checked} onCheckedChange={setChecked} />
      <span className="text-sm text-foreground">
        {checked ? 'On' : 'Off'}
      </span>
    </div>
  );
};

export const Controlled: Story = {
  render: () => <ControlledSwitch />,
};

export const WithLabel: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <label className="flex items-center gap-3 cursor-pointer">
        <Switch id="notifications" />
        <span className="text-sm text-foreground">Enable notifications</span>
      </label>
      <label className="flex items-center gap-3 cursor-pointer">
        <Switch id="marketing" />
        <span className="text-sm text-foreground">Marketing emails</span>
      </label>
      <label className="flex items-center gap-3 cursor-pointer">
        <Switch id="analytics" defaultChecked />
        <span className="text-sm text-foreground">Analytics tracking</span>
      </label>
    </div>
  ),
};

export const SettingsExample: Story = {
  render: () => (
    <div className="w-80 p-4 bg-card rounded-xl border border-border">
      <h3 className="text-lg font-semibold text-foreground mb-4">Settings</h3>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">Dark mode</p>
            <p className="text-xs text-muted-foreground">Use dark theme</p>
          </div>
          <Switch defaultChecked />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">Notifications</p>
            <p className="text-xs text-muted-foreground">Receive push notifications</p>
          </div>
          <Switch />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">Auto-save</p>
            <p className="text-xs text-muted-foreground">Save changes automatically</p>
          </div>
          <Switch defaultChecked />
        </div>
      </div>
    </div>
  ),
};
