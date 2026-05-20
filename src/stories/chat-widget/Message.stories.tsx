import type { Meta, StoryObj } from '@storybook/react';
import { useEffect, useState } from 'react';
import { Message } from '../../components/chat-widget/Message';
import { useChatStore } from '../../stores/chatStore';
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

const userMessageWithEmail: MessageType = {
  id: '5',
  role: 'user',
  content: 'andre pacheco apachecotaboada@gmail.com',
  timestamp: new Date(),
};

const userMessageWithLink: MessageType = {
  id: '6',
  role: 'user',
  content: 'Mira este sitio: https://cofoundy.dev y dime que opinas',
  timestamp: new Date(),
};

const assistantMessageWithEmail: MessageType = {
  id: '7',
  role: 'assistant',
  content: `Tu reunion esta confirmada:

- Dia: Manana, 26 de enero
- Hora: 5:00 PM
- Correo: apachecotaboada@gmail.com

Te he enviado una invitacion al calendario.`,
  timestamp: new Date(),
};

const assistantMessageWithLink: MessageType = {
  id: '8',
  role: 'assistant',
  content: 'Puedes ver nuestro portfolio en https://cofoundy.dev y contactarnos en info@cofoundy.dev',
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

export const UserWithEmail: Story = {
  args: {
    message: userMessageWithEmail,
  },
};

export const UserWithLink: Story = {
  args: {
    message: userMessageWithLink,
  },
};

export const AssistantWithEmail: Story = {
  args: {
    message: assistantMessageWithEmail,
  },
};

export const AssistantWithLink: Story = {
  args: {
    message: assistantMessageWithLink,
  },
};

export const LinksComparison: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Message message={userMessageWithEmail} />
      <Message message={assistantMessageWithEmail} />
      <Message message={userMessageWithLink} />
      <Message message={assistantMessageWithLink} />
    </div>
  ),
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

const STREAMING_SCRIPT = `## Estimación rápida

Para una **landing page** moderna con animaciones y responsive:

1. Diseño visual + brand
2. Implementación en \`Next.js\`
3. Deploy a *producción*

¿Te suena bien?`;

type StreamPattern = 'chunky' | 'smooth';

function useScriptedStream(
  messageId: string,
  pattern: StreamPattern,
  enabled: boolean,
) {
  useEffect(() => {
    if (!enabled) return;
    const store = useChatStore.getState();
    store.reset();
    store.startStreaming(messageId);

    let cancelled = false;
    let i = 0;
    const chunkSize = pattern === 'chunky' ? 28 : 3;
    const intervalMs = pattern === 'chunky' ? 420 : 35;

    const tick = () => {
      if (cancelled) return;
      const next = STREAMING_SCRIPT.slice(i, i + chunkSize);
      if (!next) {
        useChatStore.getState().finishStreaming();
        return;
      }
      useChatStore.getState().appendToken(next);
      i += chunkSize;
      setTimeout(tick, intervalMs);
    };
    setTimeout(tick, 200);

    return () => {
      cancelled = true;
      useChatStore.getState().reset();
    };
  }, [messageId, pattern, enabled]);
}

function StreamingDemo({
  pattern,
  messageId,
}: {
  pattern: StreamPattern;
  messageId: string;
}) {
  const [enabled, setEnabled] = useState(true);
  const [replayKey, setReplayKey] = useState(0);
  useScriptedStream(`${messageId}-${replayKey}`, pattern, enabled);

  const messages = useChatStore((s) => s.messages);
  const streamed = messages.find((m) => m.id === `${messageId}-${replayKey}`);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2 text-xs">
        <button
          onClick={() => {
            setEnabled(false);
            setTimeout(() => {
              setEnabled(true);
              setReplayKey((k) => k + 1);
            }, 50);
          }}
          className="px-3 py-1 rounded bg-[var(--chat-primary)] text-white"
        >
          Replay
        </button>
        <span className="text-[var(--chat-muted)] self-center">
          Pattern: <code>{pattern}</code>
        </span>
      </div>
      {streamed && <Message message={streamed} />}
    </div>
  );
}

export const StreamingChunky: Story = {
  name: 'Streaming — Chunky (LLM batches)',
  render: () => (
    <StreamingDemo pattern="chunky" messageId="demo-chunky" />
  ),
};

export const StreamingSmooth: Story = {
  name: 'Streaming — Smooth (per-token)',
  render: () => (
    <StreamingDemo pattern="smooth" messageId="demo-smooth" />
  ),
};

export const StreamingFinished: Story = {
  name: 'Streaming — Finished (renders as MessageContent)',
  render: () => {
    const finished: MessageType = {
      id: 'finished-msg',
      role: 'assistant',
      content: STREAMING_SCRIPT,
      timestamp: new Date(),
    };
    // Reset store so isStreaming is false for this message id.
    useChatStore.getState().reset();
    return <Message message={finished} />;
  },
};
