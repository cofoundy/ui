import type { Meta, StoryObj } from '@storybook/react';
import { Factura } from '../../components/email/templates/Factura';

const meta: Meta<typeof Factura> = {
  title: 'Email/Factura',
  component: Factura,
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <div style={{ background: '#e5e7eb', minHeight: '100vh', padding: '0' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Factura>;

export const Default: Story = {
  args: {
    clientName: 'Diana',
    invoiceNumber: 'F001-00042',
    amount: 'S/2,600.00',
    dueDate: '15 de mayo, 2026',
    hasXml: true,
    hasCdr: true,
  },
};

export const WithDetraction: Story = {
  args: {
    ...Default.args,
    detractionAmount: 'S/312.00',
    bdnAccount: '00-028-152698',
  },
};

export const Minimal: Story = {
  args: {
    invoiceNumber: 'F001-00043',
    amount: 'S/800.00',
  },
};

export const TestMode: Story = {
  args: {
    ...Default.args,
    testMode: true,
  },
};
