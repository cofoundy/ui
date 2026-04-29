import type { Meta, StoryObj } from '@storybook/react';
import { BienvenidaCliente, type BienvenidaClienteProps } from '../../components/email/templates/BienvenidaCliente';
import { EmailPreview } from './EmailPreview';

const meta: Meta<BienvenidaClienteProps> = {
  title: 'Email/Bienvenida Cliente',
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<BienvenidaClienteProps>;

const defaultArgs: BienvenidaClienteProps = {
  clientName: 'Diana',
  projectName: 'Portal Web NeoSer',
  kickoffDate: '5 de mayo, 2026',
  pmName: 'André Pacheco',
  senderEmail: 'andre@cofoundy.dev',
  calLink: 'https://cal.cofoundy.dev/andre/meet',
};

export const Default: Story = {
  render: () => (
    <EmailPreview>
      <BienvenidaCliente {...defaultArgs} />
    </EmailPreview>
  ),
};

export const WithCustomSteps: Story = {
  render: () => (
    <EmailPreview>
      <BienvenidaCliente
        {...defaultArgs}
        nextStepsBullets={[
          'Reunión de kickoff el lunes 5 de mayo a las 10am',
          'Acceso al repositorio GitHub compartido',
          'Canal de WhatsApp para comunicación rápida',
          'Primer sprint: diseño de wireframes (1 semana)',
        ]}
        vikunjaUrl="https://vikunja.cofoundy.dev/projects/42"
      />
    </EmailPreview>
  ),
};

export const Minimal: Story = {
  render: () => (
    <EmailPreview>
      <BienvenidaCliente clientName="Carlos" projectName="App Delivery" />
    </EmailPreview>
  ),
};

export const TestMode: Story = {
  render: () => (
    <EmailPreview>
      <BienvenidaCliente {...defaultArgs} testMode />
    </EmailPreview>
  ),
};
