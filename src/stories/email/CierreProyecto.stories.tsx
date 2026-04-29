import type { Meta, StoryObj } from '@storybook/react';
import { CierreProyecto } from '../../components/email/templates/CierreProyecto';

const meta: Meta<typeof CierreProyecto> = {
  title: 'Email/Cierre Proyecto',
  component: CierreProyecto,
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
type Story = StoryObj<typeof CierreProyecto>;

export const Default: Story = {
  args: {
    clientName: 'Diana',
    projectName: 'Portal Web NeoSer',
    deliverables: [
      'Portal web corporativo (neoser.pe)',
      'Panel admin con CMS',
      'API de servicios integrada',
      'Documentación técnica',
    ],
    liveUrl: 'https://neoser.pe',
    calLink: 'https://cal.cofoundy.dev/andre/meet',
  },
};

export const WithCaseStudy: Story = {
  args: {
    ...Default.args,
    caseStudyUrl: 'https://cofoundy.dev/cases/neoser',
  },
};

export const Minimal: Story = {
  args: {
    projectName: 'App Delivery',
  },
};

export const TestMode: Story = {
  args: {
    ...Default.args,
    testMode: true,
  },
};
