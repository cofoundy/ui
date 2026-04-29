import type { Meta, StoryObj } from '@storybook/react';
import { DevEntrega, type DevEntregaProps } from '../../components/email/templates/DevEntrega';
import { EmailPreview } from './EmailPreview';

const meta: Meta<DevEntregaProps> = {
  title: 'Email/Dev Entrega',
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<DevEntregaProps>;

const defaultArgs: DevEntregaProps = {
  clientName: 'Diana',
  projectName: 'Portal Web NeoSer',
  featureName: 'Módulo de contacto con formulario inteligente',
  testUrl: 'https://staging.neoser.pe',
  notes: 'El formulario detecta automáticamente el tipo de consulta y la redirige al área correspondiente.',
  reviewItems: [
    'Flujo completo del formulario de contacto',
    'Notificaciones por email al equipo interno',
    'Responsive en móvil',
    'Validaciones de campos',
  ],
  calLink: 'https://cal.cofoundy.dev/andre/meet',
};

export const Default: Story = {
  render: () => (
    <EmailPreview>
      <DevEntrega {...defaultArgs} />
    </EmailPreview>
  ),
};

export const WithNextSteps: Story = {
  render: () => (
    <EmailPreview>
      <DevEntrega
        {...defaultArgs}
        nextStepsBullets={[
          'Aprobación del módulo de contacto',
          'Inicio de sprint 3: integración de pagos',
          'Demo final programada para el 20 de mayo',
        ]}
      />
    </EmailPreview>
  ),
};

export const Minimal: Story = {
  render: () => (
    <EmailPreview>
      <DevEntrega clientName="Carlos" featureName="Dashboard de métricas" />
    </EmailPreview>
  ),
};

export const TestMode: Story = {
  render: () => (
    <EmailPreview>
      <DevEntrega {...defaultArgs} testMode />
    </EmailPreview>
  ),
};
