import type { Meta, StoryObj } from '@storybook/react';
import { PersonalNote, type PersonalNoteProps } from '../../components/email/templates/PersonalNote';
import { EmailText } from '../../components/email/components/EmailText';
import { EmailPreview } from './EmailPreview';

const meta: Meta<PersonalNoteProps> = {
  title: 'Email/Personal Note',
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<PersonalNoteProps>;

export const FollowUp: Story = {
  name: 'Follow-up (sin calLink)',
  render: () => (
    <EmailPreview>
      <PersonalNote
        greeting="Hola Diana,"
        previewText="Guía de marca — Portal NeoSer"
      >
        <EmailText>
          Fue un gusto conversar contigo hoy. Te comparto la guía de marca que
          preparamos para el proyecto. Creo que va a ayudarte a alinear al equipo
          de diseño con la dirección que acordamos.
        </EmailText>
        <EmailText>
          Si tienes alguna duda, me escribes y lo vemos.
        </EmailText>
      </PersonalNote>
    </EmailPreview>
  ),
};

export const PostMeeting: Story = {
  name: 'Post-reunión (con calLink)',
  render: () => (
    <EmailPreview>
      <PersonalNote
        greeting="Hola Diana,"
        calLink="https://cal.cofoundy.dev/andre/meet"
        previewText="Seguimiento reunión — Portal NeoSer"
      >
        <EmailText>
          Fue un gusto conversar contigo hoy. Te comparto la guía de marca que
          preparamos para el proyecto. Creo que va a ayudarte a alinear al equipo
          de diseño con la dirección que acordamos.
        </EmailText>
        <EmailText>
          Cuando tengas los comentarios del equipo, armamos una llamada rápida
          para cerrar los últimos detalles.
        </EmailText>
      </PersonalNote>
    </EmailPreview>
  ),
};

export const Proposal: Story = {
  name: 'Propuesta activa (calLabel custom)',
  render: () => (
    <EmailPreview>
      <PersonalNote
        greeting="Hola Carlos,"
        signOff="Quedo atento,"
        calLink="https://cal.cofoundy.dev/andre/meet"
        calLabel="Revisar propuesta juntos"
        previewText="Propuesta actualizada — App Delivery"
      >
        <EmailText>
          Te adjunto la propuesta actualizada con los ajustes que conversamos.
          Incluye el desglose por fase y el cronograma revisado.
        </EmailText>
        <EmailText>
          Me encantaría caminar por la propuesta juntos y resolver cualquier
          duda que tengas.
        </EmailText>
      </PersonalNote>
    </EmailPreview>
  ),
};

export const QuickThanks: Story = {
  name: 'Agradecimiento rápido',
  render: () => (
    <EmailPreview>
      <PersonalNote
        greeting="Hola María,"
        signOff="¡Gracias!"
        previewText="Gracias por tu feedback"
      >
        <EmailText>
          Quería agradecerte por el feedback que nos diste la semana pasada.
          Ya implementamos los cambios y se ven mucho mejor. Tu ojo para el
          detalle hizo la diferencia.
        </EmailText>
      </PersonalNote>
    </EmailPreview>
  ),
};

export const DifferentSender: Story = {
  name: 'Otro sender',
  render: () => (
    <EmailPreview>
      <PersonalNote
        senderName="Sebastián Rojas"
        senderRole="Lead Developer"
        senderEmail="sebastian@cofoundy.dev"
        greeting="Hola equipo,"
        signOff="Saludos,"
        previewText="Update del sprint"
      >
        <EmailText>
          Les comparto el update del sprint. Cerramos los 3 tickets
          prioritarios y el deploy a staging está listo para QA.
        </EmailText>
        <EmailText>
          Si encuentran algo raro, me avisan por Slack o por aquí.
        </EmailText>
      </PersonalNote>
    </EmailPreview>
  ),
};

export const TestMode: Story = {
  render: () => (
    <EmailPreview>
      <PersonalNote
        greeting="Hola Diana,"
        calLink="https://cal.cofoundy.dev/andre/meet"
        testMode
      >
        <EmailText>
          Este es un email de prueba con el banner de test mode visible.
        </EmailText>
      </PersonalNote>
    </EmailPreview>
  ),
};
