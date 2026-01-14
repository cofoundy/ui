import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { MessageCircle } from 'lucide-react';

// Import individual components to compose manually (bypassing WebSocket)
import { ChatContainer, type ChatTheme } from '../../components/chat-widget/ChatContainer';
import { ChatHeader } from '../../components/chat-widget/ChatHeader';
import { ChatInput } from '../../components/chat-widget/ChatInput';
import { MessageList } from '../../components/chat-widget/MessageList';
import { QuickActions } from '../../components/chat-widget/QuickActions';
import { TypingIndicator } from '../../components/chat-widget/TypingIndicator';
import { TimeSlotGrid } from '../../components/chat-widget/TimeSlotGrid';
import { ConfirmationCard } from '../../components/chat-widget/ConfirmationCard';
import type { Message, QuickAction, TimeSlot, Appointment } from '../../types';

// Static ChatWidget that composes sub-components without WebSocket
interface StaticChatWidgetProps {
  connectionStatus?: 'connected' | 'connecting' | 'disconnected' | 'error';
  connectionFailed?: boolean;
  messages?: Message[];
  isTyping?: boolean;
  showQuickActions?: boolean;
  quickActions?: QuickAction[];
  suggestedSlots?: TimeSlot[];
  confirmedAppointment?: Appointment | null;
  inputPlaceholder?: string;
  inputDisabled?: boolean;
  theme?: ChatTheme;
}

function StaticChatWidget({
  connectionStatus = 'connected',
  connectionFailed = false,
  messages = [],
  isTyping = false,
  showQuickActions = true,
  quickActions = [
    { id: 'landing', label: 'Landing Page', message: 'Necesito una landing page' },
    { id: 'chatbot', label: 'Chatbot IA', message: 'Quiero un chatbot' },
    { id: 'mvp', label: 'MVP', message: 'Tengo una idea de app' },
  ],
  suggestedSlots = [],
  confirmedAppointment = null,
  inputPlaceholder,
  inputDisabled,
  theme = 'dark',
}: StaticChatWidgetProps) {
  // Derive input state from connection status if not overridden
  const placeholder = inputPlaceholder ?? (
    connectionFailed
      ? 'Chat no disponible'
      : connectionStatus !== 'connected'
        ? 'Conectando...'
        : 'Escribe tu mensaje...'
  );
  const disabled = inputDisabled ?? (connectionStatus !== 'connected' || connectionFailed);

  // Only show quick actions if no user messages yet
  const hasUserMessage = messages.some((m) => m.role === 'user');

  return (
    <ChatContainer className="h-full" theme={theme}>
      <ChatHeader
        connectionStatus={connectionStatus}
        brandName="Cofoundy"
        brandSubtitle="Consultoría de Software & IA"
      />

      <MessageList messages={messages} isTyping={isTyping} />

      {/* Time slots */}
      {suggestedSlots.length > 0 && !confirmedAppointment && (
        <TimeSlotGrid slots={suggestedSlots} onSelectSlot={() => {}} />
      )}

      {/* Confirmation card */}
      {confirmedAppointment && (
        <div className="px-4">
          <ConfirmationCard appointment={confirmedAppointment} />
        </div>
      )}

      {/* Quick actions */}
      {showQuickActions && quickActions.length > 0 && !hasUserMessage && !isTyping && (
        <QuickActions actions={quickActions} onSelectAction={() => {}} />
      )}

      {/* WhatsApp fallback when connection fails */}
      {connectionFailed && (
        <div className="px-4 py-3 mx-4 mb-4 rounded-lg bg-green-500/10 border border-green-500/20">
          <div className="flex items-center gap-3">
            <MessageCircle className="w-6 h-6 text-green-500" />
            <div className="flex-1">
              <p className="text-sm text-[var(--chat-foreground)] font-medium">
                ¿Problemas de conexión?
              </p>
              <p className="text-xs text-[var(--chat-muted)]">
                Contáctanos directamente
              </p>
            </div>
          </div>
        </div>
      )}

      <ChatInput
        onSendMessage={() => {}}
        disabled={disabled}
        placeholder={placeholder}
      />
    </ChatContainer>
  );
}

const meta: Meta<typeof StaticChatWidget> = {
  title: 'Chat/ChatWidget (Full)',
  component: StaticChatWidget,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story, context) => {
      // Use global theme from toolbar, fallback to args
      const theme = context.globals.theme || context.args.theme || 'dark';
      const bgColor = theme === 'light' ? '#f8fafc' : '#020916';
      return (
        <div
          className="w-full h-[600px] max-w-[500px] mx-auto p-4"
          style={{ background: bgColor }}
        >
          <Story args={{ ...context.args, theme }} />
        </div>
      );
    },
  ],
  argTypes: {
    connectionStatus: {
      control: 'select',
      options: ['connected', 'connecting', 'disconnected', 'error'],
    },
    theme: {
      control: 'select',
      options: ['dark', 'light', 'system'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof StaticChatWidget>;

// Default greeting message
const greetingMessage: Message = {
  id: 'greeting',
  role: 'assistant',
  content: '¡Hola! Soy Tina de Cofoundy\n\n¿Qué proyecto tienes en mente?',
  timestamp: new Date(),
};

export const Default: Story = {
  args: {
    connectionStatus: 'connected',
    messages: [greetingMessage],
    isTyping: false,
    showQuickActions: true,
  },
};

export const WithConversation: Story = {
  args: {
    connectionStatus: 'connected',
    messages: [
      {
        id: '1',
        role: 'assistant',
        content: '¡Hola! Soy Tina de Cofoundy\n\n¿Qué proyecto tienes en mente?',
        timestamp: new Date(Date.now() - 300000),
      },
      {
        id: '2',
        role: 'user',
        content: 'Necesito una landing page para mi startup de delivery de comida saludable',
        timestamp: new Date(Date.now() - 290000),
      },
      {
        id: '3',
        role: 'assistant',
        content: '¡Me encanta el concepto! El mercado de comida saludable está creciendo mucho.\n\nPara la landing page necesitaríamos destacar:\n\n- **Propuesta de valor**: Comida sana sin esfuerzo\n- **Cómo funciona**: El proceso en 3 pasos\n- **Restaurantes**: Mostrar partners locales\n- **CTA**: Descarga la app o regístrate\n\n¿Te gustaría agendar una llamada para discutir los detalles?',
        timestamp: new Date(Date.now() - 280000),
      },
      {
        id: '4',
        role: 'user',
        content: 'Sí, ¿tienes disponibilidad mañana en la tarde?',
        timestamp: new Date(Date.now() - 270000),
      },
      {
        id: '5',
        role: 'assistant',
        content: 'Déjame revisar la disponibilidad para mañana...',
        timestamp: new Date(Date.now() - 265000),
      },
      {
        id: 'tool-1',
        role: 'tool',
        content: 'Consultando calendario',
        toolName: 'check_calendar',
        toolStatus: 'success',
        timestamp: new Date(Date.now() - 264000),
      },
      {
        id: 'tool-2',
        role: 'tool',
        content: 'Buscando horarios disponibles',
        toolName: 'get_available_slots',
        toolStatus: 'success',
        timestamp: new Date(Date.now() - 263000),
      },
      {
        id: '6',
        role: 'assistant',
        content: '¡Perfecto! Mañana tengo estos horarios disponibles en la tarde:\n\n- 3:00 PM\n- 4:00 PM\n- 5:30 PM\n\n¿Cuál te funciona mejor?',
        timestamp: new Date(Date.now() - 260000),
      },
      {
        id: '7',
        role: 'user',
        content: 'Las 4pm está bien',
        timestamp: new Date(Date.now() - 250000),
      },
      {
        id: '8',
        role: 'assistant',
        content: 'Excelente, voy a agendar la cita...',
        timestamp: new Date(Date.now() - 245000),
      },
      {
        id: 'tool-3',
        role: 'tool',
        content: 'Creando evento en calendario',
        toolName: 'create_calendar_event',
        toolStatus: 'success',
        timestamp: new Date(Date.now() - 244000),
      },
      {
        id: 'tool-4',
        role: 'tool',
        content: 'Enviando confirmación',
        toolName: 'send_confirmation_email',
        toolStatus: 'success',
        timestamp: new Date(Date.now() - 243000),
      },
      {
        id: '9',
        role: 'assistant',
        content: '¡Listo! Tu cita ha sido confirmada para mañana a las 4:00 PM.\n\nTe envié un correo con los detalles y el link de la videollamada.\n\n¿Hay algo más en lo que pueda ayudarte?',
        timestamp: new Date(Date.now() - 240000),
      },
    ],
    showQuickActions: false,
  },
};

export const Connecting: Story = {
  args: {
    connectionStatus: 'connecting',
    messages: [greetingMessage],
    inputPlaceholder: 'Conectando...',
    inputDisabled: true,
  },
};

export const Disconnected: Story = {
  args: {
    connectionStatus: 'disconnected',
    messages: [greetingMessage],
    inputPlaceholder: 'Reconectando...',
    inputDisabled: true,
  },
};

export const Error: Story = {
  args: {
    connectionStatus: 'error',
    connectionFailed: true,
    messages: [greetingMessage],
  },
};

export const Typing: Story = {
  args: {
    connectionStatus: 'connected',
    messages: [
      {
        id: '1',
        role: 'assistant',
        content: '¡Hola! Soy Tina de Cofoundy\n\n¿Qué proyecto tienes en mente?',
        timestamp: new Date(Date.now() - 30000),
      },
      {
        id: '2',
        role: 'user',
        content: '¿Cuánto cuesta una landing page?',
        timestamp: new Date(Date.now() - 10000),
      },
    ],
    isTyping: true,
    showQuickActions: false,
  },
};

export const WithTimeSlots: Story = {
  args: {
    connectionStatus: 'connected',
    messages: [
      {
        id: '1',
        role: 'assistant',
        content: '¡Hola! Soy Tina de Cofoundy\n\n¿Qué proyecto tienes en mente?',
        timestamp: new Date(Date.now() - 60000),
      },
      {
        id: '2',
        role: 'user',
        content: 'Quiero agendar una llamada',
        timestamp: new Date(Date.now() - 50000),
      },
      {
        id: '3',
        role: 'assistant',
        content: '¡Perfecto! Aquí tienes los horarios disponibles:',
        timestamp: new Date(Date.now() - 40000),
      },
    ],
    suggestedSlots: [
      { date: '2025/01/15', time: '10:00 AM', available: true },
      { date: '2025/01/15', time: '11:00 AM', available: true },
      { date: '2025/01/15', time: '3:00 PM', available: true },
      { date: '2025/01/16', time: '9:00 AM', available: true },
      { date: '2025/01/16', time: '2:00 PM', available: true },
      { date: '2025/01/16', time: '4:00 PM', available: true },
      { date: '2025/01/17', time: '10:00 AM', available: true },
      { date: '2025/01/17', time: '11:00 AM', available: true },
    ],
    showQuickActions: false,
  },
};

export const WithConfirmation: Story = {
  args: {
    connectionStatus: 'connected',
    messages: [
      {
        id: '1',
        role: 'assistant',
        content: '¡Perfecto! Tu cita ha sido confirmada.',
        timestamp: new Date(),
      },
    ],
    confirmedAppointment: {
      id: 'apt-1',
      date: '2025-01-15',
      time: '10:00 AM',
      topic: 'Consultoría Landing Page',
      attendees: ['cliente@example.com'],
      confirmed: true,
    },
    showQuickActions: false,
  },
};

// Showcase different sizes
export const Sizes: Story = {
  args: {
    theme: 'dark',
  },
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story, context) => {
      // Use global theme from toolbar, fallback to args
      const theme = (context.globals.theme || context.args.theme || 'dark') as ChatTheme;
      const bgColor = theme === 'light' ? '#f8fafc' : '#020916';
      const labelColor = theme === 'light' ? 'text-gray-600' : 'text-white/60';
      return (
        <div
          className="flex flex-wrap gap-8 p-8 items-end justify-center min-h-screen"
          style={{ background: bgColor }}
        >
          <div>
            <p className={`${labelColor} text-xs mb-2 text-center`}>Mobile (350px)</p>
            <div style={{ width: 350, height: 500 }} className="overflow-hidden rounded-xl">
              <StaticChatWidget
                connectionStatus="connected"
                messages={[greetingMessage]}
                theme={theme}
              />
            </div>
          </div>
          <div>
            <p className={`${labelColor} text-xs mb-2 text-center`}>Tablet (450px)</p>
            <div style={{ width: 450, height: 600 }} className="overflow-hidden rounded-xl">
              <StaticChatWidget
                connectionStatus="connected"
                messages={[greetingMessage]}
                theme={theme}
              />
            </div>
          </div>
        </div>
      );
    },
  ],
};
