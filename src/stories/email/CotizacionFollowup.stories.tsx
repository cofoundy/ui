import type { Meta, StoryObj } from '@storybook/react';
import { CotizacionFollowup } from '../../components/email/templates/CotizacionFollowup';

const meta: Meta<typeof CotizacionFollowup> = {
  title: 'Email/Cotización Followup',
  component: CotizacionFollowup,
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
type Story = StoryObj<typeof CotizacionFollowup>;

export const Default: Story = {
  args: {
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
  },
};

export const Minimal: Story = {
  args: {
    clientName: 'Carlos',
  },
};

export const TestMode: Story = {
  args: {
    ...Default.args,
    testMode: true,
  },
};
