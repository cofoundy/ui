import type { Meta, StoryObj } from '@storybook/react';
import { DevEntrega } from '../../components/email/templates/DevEntrega';

const meta: Meta<typeof DevEntrega> = {
  title: 'Email/Dev Entrega',
  component: DevEntrega,
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
type Story = StoryObj<typeof DevEntrega>;

export const Default: Story = {
  args: {
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
  },
};

export const WithNextSteps: Story = {
  args: {
    ...Default.args,
    nextStepsBullets: [
      'Aprobación del módulo de contacto',
      'Inicio de sprint 3: integración de pagos',
      'Demo final programada para el 20 de mayo',
    ],
  },
};

export const Minimal: Story = {
  args: {
    clientName: 'Carlos',
    featureName: 'Dashboard de métricas',
  },
};

export const TestMode: Story = {
  args: {
    ...Default.args,
    testMode: true,
  },
};
