import type { Meta, StoryObj } from '@storybook/react';
import { EnvioContrato, type EnvioContratoProps } from '../../components/email/templates/EnvioContrato';
import { EmailPreview } from './EmailPreview';

const meta: Meta<EnvioContratoProps> = {
  title: 'Email/Envio Contrato',
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<EnvioContratoProps>;

const defaultArgs: EnvioContratoProps = {
  clientName: 'Diana',
  contractType: 'Acuerdo de Confidencialidad (NDA)',
  projectName: 'Portal Web NeoSer',
  keyPoints: [
    'Vigencia de 2 años desde la firma',
    'Cubre información técnica, comercial y estratégica',
    'Aplica a ambas partes (bilateral)',
    'Jurisdicción: Lima, Perú',
  ],
  signingDeadline: '5 de mayo, 2026',
  contactName: 'André Pacheco',
  calLink: 'https://cal.cofoundy.dev/andre/meet',
};

export const Default: Story = {
  render: () => (
    <EmailPreview>
      <EnvioContrato {...defaultArgs} />
    </EmailPreview>
  ),
};

export const TMA: Story = {
  name: 'TMA (Términos Marco)',
  render: () => (
    <EmailPreview>
      <EnvioContrato
        clientName="Carlos"
        contractType="Términos Marco de Servicios (TMA)"
        projectName="App Delivery"
        keyPoints={[
          'Alcance general de servicios de desarrollo',
          'Condiciones de pago: 50% adelanto, 50% contra entrega',
          'Propiedad intelectual transferida al cliente',
          'Garantía de 30 días post-entrega',
          'Cláusula de resolución anticipada',
        ]}
        signingDeadline="10 de mayo, 2026"
        contactName="André Pacheco"
        calLink="https://cal.cofoundy.dev/andre/meet"
      />
    </EmailPreview>
  ),
};

export const Minimal: Story = {
  render: () => (
    <EmailPreview>
      <EnvioContrato clientName="María" />
    </EmailPreview>
  ),
};

export const WithDeadlineOnly: Story = {
  name: 'Con plazo de firma',
  render: () => (
    <EmailPreview>
      <EnvioContrato
        clientName="Diana"
        contractType="Adenda de servicios"
        signingDeadline="12 de mayo, 2026"
      />
    </EmailPreview>
  ),
};

export const TestMode: Story = {
  render: () => (
    <EmailPreview>
      <EnvioContrato {...defaultArgs} testMode />
    </EmailPreview>
  ),
};
