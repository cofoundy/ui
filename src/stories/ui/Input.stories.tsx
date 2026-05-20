import type { Meta, StoryObj } from '@storybook/react';
import { Input } from '../../components/ui/input';
import { VIEWPORT_MOBILE } from '../_shared/viewports';

const meta: Meta<typeof Input> = {
  title: 'UI/Input',
  component: Input,
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'tel', 'url'],
      description: 'The input type',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the input is disabled',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: {
    placeholder: 'Enter text...',
  },
};

export const WithValue: Story = {
  args: {
    defaultValue: 'Hello World',
  },
};

export const Email: Story = {
  args: {
    type: 'email',
    placeholder: 'email@example.com',
  },
};

export const Password: Story = {
  args: {
    type: 'password',
    placeholder: 'Enter password',
  },
};

export const Disabled: Story = {
  args: {
    placeholder: 'Disabled input',
    disabled: true,
  },
};

export const WithLabel: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <label htmlFor="name" className="text-sm font-medium text-white">
        Name
      </label>
      <Input id="name" placeholder="Enter your name" />
    </div>
  ),
};

/**
 * Mobile-first contract baseline (375 px). Verifies the input renders with
 * `font-size ≥ 16px` (iOS auto-zooms below 16 px on focus) and tap target
 * height respects the 44 px floor. Required per packages/ui/CLAUDE.md.
 */
export const MobileBaseline: Story = {
  parameters: { viewport: VIEWPORT_MOBILE },
  render: () => (
    <div className="flex flex-col gap-3 p-4 w-full">
      <Input placeholder="Tap me — should not zoom on iOS" />
      <Input type="email" placeholder="email@example.com" />
      <Input type="tel" placeholder="+51 9XX XXX XXX" />
      <Input disabled placeholder="Disabled" />
    </div>
  ),
};

export const AllTypes: Story = {
  render: () => (
    <div className="flex flex-col gap-4 w-[300px]">
      <Input type="text" placeholder="Text input" />
      <Input type="email" placeholder="Email input" />
      <Input type="password" placeholder="Password input" />
      <Input type="number" placeholder="Number input" />
      <Input type="tel" placeholder="Phone input" />
      <Input disabled placeholder="Disabled input" />
    </div>
  ),
};
