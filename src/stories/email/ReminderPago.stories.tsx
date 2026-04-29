import type { Meta, StoryObj } from '@storybook/react';
import { ReminderPago, type ReminderPagoProps } from '../../components/email/templates/ReminderPago';
import { EmailPreview } from './EmailPreview';

const meta: Meta<ReminderPagoProps> = {
  title: 'Email/Reminder Pago',
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<ReminderPagoProps>;

const defaultArgs: ReminderPagoProps = {
  clientName: 'Diana',
  invoiceNumber: 'F001-00042',
  amount: 'S/2,600.00',
  dueDate: '15 de abril, 2026',
  daysOverdue: 13,
  calLink: 'https://cal.cofoundy.dev/andre/meet',
};

export const Default: Story = {
  render: () => (
    <EmailPreview>
      <ReminderPago {...defaultArgs} />
    </EmailPreview>
  ),
};

export const WithDetraction: Story = {
  render: () => (
    <EmailPreview>
      <ReminderPago {...defaultArgs} bdnAccount="00-028-152698" />
    </EmailPreview>
  ),
};

export const NotOverdue: Story = {
  name: 'Not Yet Overdue',
  render: () => (
    <EmailPreview>
      <ReminderPago clientName="Carlos" amount="S/800.00" dueDate="30 de abril, 2026" />
    </EmailPreview>
  ),
};

export const Minimal: Story = {
  render: () => (
    <EmailPreview>
      <ReminderPago amount="S/1,200.00" />
    </EmailPreview>
  ),
};

export const TestMode: Story = {
  render: () => (
    <EmailPreview>
      <ReminderPago {...defaultArgs} testMode />
    </EmailPreview>
  ),
};
