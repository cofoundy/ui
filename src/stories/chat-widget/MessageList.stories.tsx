import type { Meta, StoryObj } from '@storybook/react';
import { MessageList } from '../../components/chat-widget/MessageList';
import type { Message } from '../../types';

const meta: Meta<typeof MessageList> = {
  title: 'Chat/MessageList',
  component: MessageList,
  tags: ['autodocs'],
  argTypes: {
    isTyping: {
      control: 'boolean',
      description: 'Show typing indicator',
    },
  },
  decorators: [
    (Story) => (
      <div className="w-[400px] h-[500px] bg-[var(--chat-background)] rounded-xl overflow-hidden">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof MessageList>;

const sampleMessages: Message[] = [
  {
    id: '1',
    role: 'assistant',
    content: 'Hola! Soy Tina de Cofoundy.\n\nQue proyecto tienes en mente?',
    timestamp: new Date(Date.now() - 60000),
  },
  {
    id: '2',
    role: 'user',
    content: 'Necesito una landing page para mi negocio de consultoria',
    timestamp: new Date(Date.now() - 50000),
  },
  {
    id: '3',
    role: 'assistant',
    content: 'Excelente! Una landing page es perfecta para captar clientes.\n\nMe puedes contar mas sobre tu negocio? Que servicios ofreces?',
    timestamp: new Date(Date.now() - 40000),
  },
  {
    id: '4',
    role: 'user',
    content: 'Ofrezco consultoria en marketing digital y estrategia de redes sociales',
    timestamp: new Date(Date.now() - 30000),
  },
];

const conversationWithTool: Message[] = [
  ...sampleMessages,
  {
    id: '5',
    role: 'assistant',
    content: 'Perfecto! Me gustaria mostrarte algunos horarios disponibles para una llamada.',
    timestamp: new Date(Date.now() - 20000),
  },
  {
    id: 'tool-1',
    role: 'tool',
    content: 'Buscando disponibilidad...',
    timestamp: new Date(Date.now() - 15000),
    toolName: 'check_availability',
    toolIcon: 'calendar',
    toolStatus: 'success',
  },
  {
    id: '6',
    role: 'assistant',
    content: 'Encontre estos horarios disponibles para manana. Cual te viene mejor?',
    timestamp: new Date(Date.now() - 10000),
  },
];

export const Empty: Story = {
  args: {
    messages: [],
    isTyping: false,
  },
};

export const WithMessages: Story = {
  args: {
    messages: sampleMessages,
    isTyping: false,
  },
};

export const WithTyping: Story = {
  args: {
    messages: sampleMessages,
    isTyping: true,
  },
};

export const WithToolIndicator: Story = {
  args: {
    messages: conversationWithTool,
    isTyping: false,
  },
};

export const LongConversation: Story = {
  args: {
    messages: [
      ...sampleMessages,
      ...conversationWithTool.slice(4),
      {
        id: '7',
        role: 'user',
        content: 'El horario de las 10 AM me funciona perfecto',
        timestamp: new Date(Date.now() - 5000),
      },
      {
        id: '8',
        role: 'assistant',
        content: 'Excelente! He agendado nuestra llamada para manana a las 10 AM.\n\nTe enviare un email con el link de la videollamada. Nos vemos!',
        timestamp: new Date(),
      },
    ],
    isTyping: false,
  },
};

export const CustomEmptyMessage: Story = {
  args: {
    messages: [],
    isTyping: false,
    emptyMessage: 'Inicia una conversacion para comenzar',
  },
};
