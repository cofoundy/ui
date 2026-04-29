import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { InfoBox } from '../../components/email/components/InfoBox';
import { EmailButton } from '../../components/email/components/EmailButton';
import { EmailHeading } from '../../components/email/components/EmailHeading';
import { EmailText } from '../../components/email/components/EmailText';
import { EmailDivider } from '../../components/email/components/EmailDivider';
import { TestBanner } from '../../components/email/components/TestBanner';

const meta: Meta = {
  title: 'Email/Primitives',
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '520px', padding: '24px', fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;

export const InfoBoxDefault: StoryObj = {
  name: 'InfoBox — Default',
  render: () => <InfoBox label="Inversión total" value="S/2,600.00" />,
};

export const InfoBoxWithLink: StoryObj = {
  name: 'InfoBox — With Link',
  render: () => <InfoBox label="Tu proyecto en línea" value="https://app.neoser.pe" href="https://app.neoser.pe" />,
};

export const InfoBoxStack: StoryObj = {
  name: 'InfoBox — Stacked',
  render: () => (
    <>
      <InfoBox label="Monto total" value="S/2,600.00" />
      <InfoBox label="Fecha de vencimiento" value="15 de mayo, 2026" />
      <InfoBox label="Comprobante" value="F001-00042" />
    </>
  ),
};

export const ButtonDefault: StoryObj = {
  name: 'EmailButton',
  render: () => <EmailButton href="https://cal.cofoundy.dev/andre/meet">Agendar llamada</EmailButton>,
};

export const Headings: StoryObj = {
  name: 'Headings',
  render: () => (
    <>
      <EmailHeading as="h1">Tu propuesta está lista</EmailHeading>
      <EmailHeading as="h2">Lo que incluye</EmailHeading>
    </>
  ),
};

export const TextParagraph: StoryObj = {
  name: 'EmailText',
  render: () => (
    <EmailText>
      Gracias por la conversación. Quedamos bien alineados en los objetivos
      y te comparto la propuesta formal que resume lo que acordamos.
    </EmailText>
  ),
};

export const DividerDefault: StoryObj = {
  name: 'EmailDivider',
  render: () => (
    <>
      <EmailText>Content above the divider.</EmailText>
      <EmailDivider />
      <EmailText>Content below the divider.</EmailText>
    </>
  ),
};

export const TestBannerDefault: StoryObj = {
  name: 'TestBanner',
  render: () => <TestBanner />,
};
