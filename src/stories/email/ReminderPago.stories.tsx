import type { Meta, StoryObj } from '@storybook/react';
import { ReminderPago } from '../../components/email/templates/ReminderPago';

const meta: Meta<typeof ReminderPago> = {
  title: 'Email/Reminder Pago',
  component: ReminderPago,
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
type Story = StoryObj<typeof ReminderPago>;

export const Default: Story = {
  args: {
    clientName: 'Diana',
    invoiceNumber: 'F001-00042',
    amount: 'S/2,600.00',
    dueDate: '15 de abril, 2026',
    daysOverdue: 13,
    calLink: 'https://cal.cofoundy.dev/andre/meet',
  },
};

export const WithDetraction: Story = {
  args: {
    ...Default.args,
    bdnAccount: '00-028-152698',
  },
};

export const NotOverdue: Story = {
  name: 'Not Yet Overdue',
  args: {
    clientName: 'Carlos',
    amount: 'S/800.00',
    dueDate: '30 de abril, 2026',
  },
};

export const Minimal: Story = {
  args: {
    amount: 'S/1,200.00',
  },
};

export const TestMode: Story = {
  args: {
    ...Default.args,
    testMode: true,
  },
};
