import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { InfoBox } from '../../components/email/components/InfoBox';
import { InfoBoxRow } from '../../components/email/components/InfoBoxRow';
import { ScopeList } from '../../components/email/components/ScopeList';
import { NextStepCallout } from '../../components/email/components/NextStepCallout';
import { EmailButton } from '../../components/email/components/EmailButton';
import { EmailHeading } from '../../components/email/components/EmailHeading';
import { EmailText } from '../../components/email/components/EmailText';
import { EmailDivider } from '../../components/email/components/EmailDivider';
import { TestBanner } from '../../components/email/components/TestBanner';
import { EmailPreview } from './EmailPreview';
import { EmailLayout } from '../../components/email/components/EmailLayout';

const meta: Meta = {
  title: 'Email/Primitives',
  parameters: { layout: 'fullscreen' },
};

export default meta;

export const InfoBoxDefault: StoryObj = {
  name: 'InfoBox — Default',
  render: () => (
    <EmailPreview>
      <EmailLayout heading="InfoBox Demo">
        <InfoBox label="Inversión total" value="S/2,600.00" />
      </EmailLayout>
    </EmailPreview>
  ),
};

export const InfoBoxRowDefault: StoryObj = {
  name: 'InfoBoxRow — Side by Side',
  render: () => (
    <EmailPreview>
      <EmailLayout heading="InfoBoxRow Demo">
        <InfoBoxRow
          items={[
            { label: 'Inversión total', value: 'S/2,600.00' },
            { label: 'Tiempo estimado', value: '8 semanas' },
          ]}
        />
      </EmailLayout>
    </EmailPreview>
  ),
};

export const ScopeListDefault: StoryObj = {
  name: 'ScopeList — Checklist',
  render: () => (
    <EmailPreview>
      <EmailLayout heading="ScopeList Demo">
        <EmailHeading as="h2">Lo que incluye</EmailHeading>
        <ScopeList
          items={[
            'Diseño y desarrollo del portal web corporativo',
            'Integración con API de servicios existente',
            'Panel administrativo para gestión de contenido',
            'Optimización SEO y performance',
          ]}
        />
      </EmailLayout>
    </EmailPreview>
  ),
};

export const NextStepDefault: StoryObj = {
  name: 'NextStepCallout',
  render: () => (
    <EmailPreview>
      <EmailLayout heading="NextStep Demo">
        <NextStepCallout>
          Revisa la propuesta adjunta y confírmanos tu disponibilidad para arrancar.
        </NextStepCallout>
      </EmailLayout>
    </EmailPreview>
  ),
};

export const ButtonDefault: StoryObj = {
  name: 'EmailButton',
  render: () => (
    <EmailPreview>
      <EmailLayout heading="Button Demo">
        <EmailButton href="https://cal.cofoundy.dev/andre/meet">Agendar llamada</EmailButton>
      </EmailLayout>
    </EmailPreview>
  ),
};

export const Headings: StoryObj = {
  name: 'Headings',
  render: () => (
    <EmailPreview>
      <EmailLayout heading="Heading Demo">
        <EmailHeading as="h2">Sección con label teal</EmailHeading>
        <EmailText>Los h2 se renderizan como labels de sección en uppercase teal.</EmailText>
      </EmailLayout>
    </EmailPreview>
  ),
};

export const TextVariants: StoryObj = {
  name: 'EmailText Variants',
  render: () => (
    <EmailPreview>
      <EmailLayout heading="Text Variants">
        <EmailText variant="greeting">Hola Diana,</EmailText>
        <EmailText>
          Este es el texto body por defecto. Gracias por la conversación, quedamos bien alineados en los objetivos.
        </EmailText>
        <EmailText variant="muted">
          También puedes responder a este correo y te contesto a la brevedad.
        </EmailText>
      </EmailLayout>
    </EmailPreview>
  ),
};

export const DividerDefault: StoryObj = {
  name: 'EmailDivider',
  render: () => (
    <EmailPreview>
      <EmailLayout heading="Divider Demo">
        <EmailText>Contenido antes del divisor.</EmailText>
        <EmailDivider />
        <EmailText>Contenido después del divisor.</EmailText>
      </EmailLayout>
    </EmailPreview>
  ),
};

export const TestBannerDefault: StoryObj = {
  name: 'TestBanner',
  render: () => (
    <EmailPreview>
      <EmailLayout heading="Test Banner Demo" testMode>
        <EmailText>Este email tiene el banner de prueba activado.</EmailText>
      </EmailLayout>
    </EmailPreview>
  ),
};
