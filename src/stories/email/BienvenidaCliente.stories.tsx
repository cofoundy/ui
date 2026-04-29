import type { Meta, StoryObj } from '@storybook/react';
import { BienvenidaCliente } from '../../components/email/templates/BienvenidaCliente';

const meta: Meta<typeof BienvenidaCliente> = {
  title: 'Email/Bienvenida Cliente',
  component: BienvenidaCliente,
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
type Story = StoryObj<typeof BienvenidaCliente>;

export const Default: Story = {
  args: {
    clientName: 'Diana',
    projectName: 'Portal Web NeoSer',
    kickoffDate: '5 de mayo, 2026',
    pmName: 'André Pacheco',
    senderEmail: 'andre@cofoundy.dev',
    calLink: 'https://cal.cofoundy.dev/andre/meet',
  },
};

export const WithCustomSteps: Story = {
  args: {
    ...Default.args,
    nextStepsBullets: [
      'Reunión de kickoff el lunes 5 de mayo a las 10am',
      'Acceso al repositorio GitHub compartido',
      'Canal de WhatsApp para comunicación rápida',
      'Primer sprint: diseño de wireframes (1 semana)',
    ],
    vikunjaUrl: 'https://vikunja.cofoundy.dev/projects/42',
  },
};

export const Minimal: Story = {
  args: {
    clientName: 'Carlos',
    projectName: 'App Delivery',
  },
};

export const TestMode: Story = {
  args: {
    ...Default.args,
    testMode: true,
  },
};
