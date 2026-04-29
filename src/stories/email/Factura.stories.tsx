import type { Meta, StoryObj } from '@storybook/react';
import { Factura, type FacturaProps } from '../../components/email/templates/Factura';
import { EmailPreview } from './EmailPreview';

const meta: Meta<FacturaProps> = {
  title: 'Email/Factura',
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<FacturaProps>;

const defaultArgs: FacturaProps = {
  clientName: 'Diana',
  invoiceNumber: 'F001-00042',
  amount: 'S/2,600.00',
  dueDate: '15 de mayo, 2026',
  hasXml: true,
  hasCdr: true,
};

export const Default: Story = {
  render: () => (
    <EmailPreview>
      <Factura {...defaultArgs} />
    </EmailPreview>
  ),
};

export const WithDetraction: Story = {
  render: () => (
    <EmailPreview>
      <Factura {...defaultArgs} detractionAmount="S/312.00" bdnAccount="00-028-152698" />
    </EmailPreview>
  ),
};

export const Minimal: Story = {
  render: () => (
    <EmailPreview>
      <Factura invoiceNumber="F001-00043" amount="S/800.00" />
    </EmailPreview>
  ),
};

export const TestMode: Story = {
  render: () => (
    <EmailPreview>
      <Factura {...defaultArgs} testMode />
    </EmailPreview>
  ),
};
