import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Switch } from '../../components/ui/switch';
import { VIEWPORT_MOBILE } from '../_shared/viewports';

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

/**
 * Optimistic toggle that fails: the knob flips immediately, the save fails, the knob returns
 * on the same spring and the status line says what happened (no toast — it happened here).
 */
function FailingSwitchDemo() {
  const [on, setOn] = useState(false);
  const [line, setLine] = useState<{ tone: 'idle' | 'error'; text: string }>({
    tone: 'idle',
    text: 'Tú respondes a todas las conversaciones.',
  });
  return (
    <div className="flex max-w-sm items-start gap-4 rounded-xl border border-[var(--border)] p-4">
      <div className="flex-1">
        <p id="op-title" className="text-sm font-semibold text-[var(--foreground)]">
          Modo operador
        </p>
        <p
          role="status"
          className="mt-0.5 min-h-9 text-[13px] leading-[18px]"
          style={{
            color:
              line.tone === 'error'
                ? 'color-mix(in srgb, var(--destructive) 62%, var(--foreground))'
                : 'var(--muted-foreground)',
          }}
        >
          {line.text}
        </p>
      </div>
      <Switch
        size="lg"
        aria-labelledby="op-title"
        checked={on}
        onCheckedChange={(next) => {
          setOn(next);
          window.setTimeout(() => {
            setOn(!next);
            setLine({ tone: 'error', text: 'No se pudo cambiar. Sin conexión; sigue como estaba.' });
          }, 700);
        }}
      />
    </div>
  );
}

export const OptimisticFailure: Story = {
  render: () => <FailingSwitchDemo />,
};

export const Large: Story = {
  args: { size: 'lg', 'aria-label': 'Modo operador' },
};

export const MobileBaseline: Story = {
  parameters: { viewport: VIEWPORT_MOBILE },
  render: () => (
    <div className="flex flex-col gap-4 p-4">
      <FailingSwitchDemo />
      <div className="flex items-center gap-4">
        <Switch aria-label="default" />
        <Switch aria-label="default on" defaultChecked />
        <Switch aria-label="lg" size="lg" />
        <Switch aria-label="lg on" size="lg" defaultChecked />
      </div>
    </div>
  ),
};
