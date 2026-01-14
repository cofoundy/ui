import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { QuickActions } from '../../components/chat-widget/QuickActions';
import type { QuickAction } from '../../types';

const meta: Meta<typeof QuickActions> = {
  title: 'Chat/QuickActions',
  component: QuickActions,
  tags: ['autodocs'],
  args: {
    onSelectAction: fn(),
  },
  decorators: [
    (Story) => (
      <div className="w-[400px] p-4 bg-[var(--chat-background)]">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof QuickActions>;

const defaultActions: QuickAction[] = [
  { id: 'landing', label: 'Landing Page', message: 'Necesito una landing page para mi negocio' },
  { id: 'chatbot', label: 'Chatbot IA', message: 'Quiero un chatbot con inteligencia artificial' },
  { id: 'mvp', label: 'MVP', message: 'Tengo una idea de app que quiero desarrollar' },
];

const manyActions: QuickAction[] = [
  { id: '1', label: 'Landing Page', message: 'Landing page' },
  { id: '2', label: 'E-commerce', message: 'E-commerce' },
  { id: '3', label: 'Web App', message: 'Web app' },
  { id: '4', label: 'Mobile App', message: 'Mobile app' },
  { id: '5', label: 'Chatbot IA', message: 'Chatbot' },
  { id: '6', label: 'Automatizacion', message: 'Automatizacion' },
];

export const Default: Story = {
  args: {
    actions: defaultActions,
  },
};

export const WithLabel: Story = {
  args: {
    actions: defaultActions,
    label: 'O selecciona una opcion:',
  },
};

export const ManyActions: Story = {
  args: {
    actions: manyActions,
    label: 'Que te gustaria hacer?',
  },
};

export const TwoActions: Story = {
  args: {
    actions: [
      { id: 'si', label: 'Si, continuar', message: 'Si' },
      { id: 'no', label: 'No, gracias', message: 'No' },
    ],
  },
};
