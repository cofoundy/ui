import type { Meta, StoryObj } from '@storybook/react';
import { Message } from '../../components/chat-widget/Message';
import type { Message as MessageType } from '../../types';

const meta: Meta<typeof Message> = {
  title: 'Chat/Message',
  component: Message,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="w-[400px] p-4 bg-[var(--chat-background)]">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Message>;

const userMessage: MessageType = {
  id: '1',
  role: 'user',
  content: 'Necesito una landing page para mi negocio',
  timestamp: new Date(),
};

const assistantMessage: MessageType = {
  id: '2',
  role: 'assistant',
  content: '!Hola! Soy Tina de Cofoundy.\n\nQue tipo de negocio tienes? Me encantaria saber mas para ayudarte mejor.',
  timestamp: new Date(),
};

const markdownMessage: MessageType = {
  id: '3',
  role: 'assistant',
  content: `## Opciones de Landing Page

Tenemos varias opciones para ti:

- Landing page **basica** - Ideal para startups
- Landing page con *formulario de contacto*
- Landing page con \`chat integrado\`

### Precios

| Plan | Precio |
|------|--------|
| Basico | $499 |
| Pro | $999 |
| Enterprise | Custom |

Cual te interesa mas?`,
  timestamp: new Date(),
};

const longMessage: MessageType = {
  id: '4',
  role: 'assistant',
  content: `Excelente pregunta! Dejame explicarte en detalle como funciona nuestro proceso de desarrollo:

1. **Descubrimiento**: Primero tenemos una llamada para entender tu negocio, objetivos y audiencia target.

2. **Diseno**: Nuestro equipo crea mockups y prototipos interactivos para que apruebes el diseno antes de desarrollar.

3. **Desarrollo**: Construimos tu landing page usando las ultimas tecnologias (Next.js, Tailwind CSS, etc).

4. **Pruebas**: Realizamos pruebas exhaustivas en diferentes dispositivos y navegadores.

5. **Lanzamiento**: Desplegamos tu sitio y te damos acceso al panel de administracion.

6. **Soporte**: Incluimos 6 meses de soporte y mantenimiento.

Tienes alguna pregunta sobre el proceso?`,
  timestamp: new Date(),
};

export const UserMessage: Story = {
  args: {
    message: userMessage,
  },
};

export const AssistantMessage: Story = {
  args: {
    message: assistantMessage,
  },
};

export const WithMarkdown: Story = {
  args: {
    message: markdownMessage,
  },
};

export const LongMessage: Story = {
  args: {
    message: longMessage,
  },
};

export const Conversation: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Message message={userMessage} />
      <Message message={assistantMessage} />
      <Message message={{ ...userMessage, id: '5', content: 'Tengo una tienda de ropa online' }} />
      <Message message={markdownMessage} />
    </div>
  ),
};
