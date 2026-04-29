import type { Meta, StoryObj } from '@storybook/react';
import { CotizacionFollowup, type CotizacionFollowupProps } from '../../components/email/templates/CotizacionFollowup';
import { EmailPreview } from './EmailPreview';

const meta: Meta<CotizacionFollowupProps> = {
  title: 'Email/Cotización Followup',
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<CotizacionFollowupProps>;

const defaultArgs: CotizacionFollowupProps = {
  clientName: 'Diana',
  projectName: 'Portal Web NeoSer',
  scopeBullets: [
    'Diseño y desarrollo del portal web corporativo',
    'Integración con API de servicios existente',
    'Panel administrativo para gestión de contenido',
    'Optimización SEO y performance',
  ],
  amount: 'S/2,600.00',
  timeline: '8 semanas',
  nextStep: 'Revisa la propuesta adjunta y confirmanos tu disponibilidad para arrancar',
  calLink: 'https://cal.cofoundy.dev/andre/meet',
};

export const Default: Story = {
  render: () => (
    <EmailPreview>
      <CotizacionFollowup {...defaultArgs} />
    </EmailPreview>
  ),
};

export const Minimal: Story = {
  render: () => (
    <EmailPreview>
      <CotizacionFollowup clientName="Carlos" />
    </EmailPreview>
  ),
};

export const TestMode: Story = {
  render: () => (
    <EmailPreview>
      <CotizacionFollowup {...defaultArgs} testMode />
    </EmailPreview>
  ),
};
