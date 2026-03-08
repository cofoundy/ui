import type { Meta, StoryObj } from '@storybook/react';
import { CofoundyBadge } from '../../components/ui/cofoundy-badge';

const meta: Meta<typeof CofoundyBadge> = {
  title: 'UI/CofoundyBadge',
  component: CofoundyBadge,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['professional', 'shimmer', 'pill', 'friendly'],
      description: 'Badge style variant',
    },
    prefix: {
      control: 'text',
      description: 'Text before "Cofoundy"',
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Agency branding badge for demo/client project footers. Links to cofoundy.dev.',
      },
    },
    backgrounds: {
      default: 'dark',
      values: [
        { name: 'dark', value: '#0d0d0d' },
        { name: 'light', value: '#f5f0eb' },
      ],
    },
  },
  decorators: [
    (Story) => (
      <div className="flex items-center justify-center min-h-[100px]">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof CofoundyBadge>;

export const Professional: Story = {
  args: { variant: 'professional' },
};

export const Shimmer: Story = {
  args: { variant: 'shimmer' },
};

export const Pill: Story = {
  args: { variant: 'pill' },
};

export const Friendly: Story = {
  args: { variant: 'friendly' },
};

export const CustomPrefix: Story = {
  args: { variant: 'professional', prefix: 'Built by' },
  name: 'Custom Prefix (English)',
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col items-center gap-8">
      <div className="text-center">
        <p className="text-white/40 text-[10px] uppercase tracking-widest mb-3">
          Professional — Full-color cube + brand blue
        </p>
        <CofoundyBadge variant="professional" />
      </div>
      <div className="text-center">
        <p className="text-white/40 text-[10px] uppercase tracking-widest mb-3">
          Shimmer — Full-color cube + animated shimmer
        </p>
        <CofoundyBadge variant="shimmer" />
      </div>
      <div className="text-center">
        <p className="text-white/40 text-[10px] uppercase tracking-widest mb-3">
          Pill — Contained badge + mono cube + hover shimmer
        </p>
        <CofoundyBadge variant="pill" />
      </div>
      <div className="text-center">
        <p className="text-white/40 text-[10px] uppercase tracking-widest mb-3">
          Friendly — Lines + cube + heart. Warm and approachable
        </p>
        <CofoundyBadge variant="friendly" />
      </div>
    </div>
  ),
  name: 'All Variants',
};

export const InFooterContext: Story = {
  render: () => (
    <div className="w-full max-w-4xl bg-[#0d0d0d] rounded-lg p-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 pb-4 border-b border-white/10">
        <p className="text-white/30 text-sm">
          © 2026 Demo Project. All rights reserved.
        </p>
        <div className="flex gap-6 text-white/30 text-sm">
          <span>Terms</span>
          <span>Privacy</span>
        </div>
      </div>
      <div className="pt-4 text-center">
        <CofoundyBadge variant="pill" />
      </div>
    </div>
  ),
  name: 'In Footer Context',
};
