import type { Meta, StoryObj } from '@storybook/react';
import { CierreProyecto, type CierreProyectoProps } from '../../components/email/templates/CierreProyecto';
import { EmailPreview } from './EmailPreview';

const meta: Meta<CierreProyectoProps> = {
  title: 'Email/Cierre Proyecto',
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<CierreProyectoProps>;

const defaultArgs: CierreProyectoProps = {
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
};

export const Default: Story = {
  render: () => (
    <EmailPreview>
      <CierreProyecto {...defaultArgs} />
    </EmailPreview>
  ),
};

export const WithCaseStudy: Story = {
  render: () => (
    <EmailPreview>
      <CierreProyecto {...defaultArgs} caseStudyUrl="https://cofoundy.dev/cases/neoser" />
    </EmailPreview>
  ),
};

export const Minimal: Story = {
  render: () => (
    <EmailPreview>
      <CierreProyecto projectName="App Delivery" />
    </EmailPreview>
  ),
};

export const TestMode: Story = {
  render: () => (
    <EmailPreview>
      <CierreProyecto {...defaultArgs} testMode />
    </EmailPreview>
  ),
};
