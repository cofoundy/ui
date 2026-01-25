import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { FloatingLauncher } from '../../components/chat-widget/FloatingLauncher'
import { FloatingWindow } from '../../components/chat-widget/FloatingWindow'
import { ChatWidgetFloating } from '../../components/chat-widget/ChatWidgetFloating'

// ============================================================================
// FloatingLauncher Stories
// ============================================================================

const launcherMeta: Meta<typeof FloatingLauncher> = {
  title: 'Chat/Floating/Launcher',
  component: FloatingLauncher,
  parameters: {
    layout: 'fullscreen',
    backgrounds: { default: 'dark' },
  },
  decorators: [
    (Story) => (
      <div className="relative w-full h-[400px] bg-[var(--chat-background)]">
        <Story />
      </div>
    ),
  ],
}

export default launcherMeta
type LauncherStory = StoryObj<typeof FloatingLauncher>

export const Closed: LauncherStory = {
  args: {
    isOpen: false,
    onClick: () => console.log('Launcher clicked'),
  },
}

export const Open: LauncherStory = {
  args: {
    isOpen: true,
    onClick: () => console.log('Launcher clicked'),
  },
}

export const WithUnreadBadge: LauncherStory = {
  args: {
    isOpen: false,
    onClick: () => console.log('Launcher clicked'),
    unreadCount: 3,
  },
}

export const WithManyUnread: LauncherStory = {
  args: {
    isOpen: false,
    onClick: () => console.log('Launcher clicked'),
    unreadCount: 150,
  },
}

export const BottomLeft: LauncherStory = {
  args: {
    isOpen: false,
    onClick: () => console.log('Launcher clicked'),
    position: 'bottom-left',
  },
}

export const CustomColor: LauncherStory = {
  args: {
    isOpen: false,
    onClick: () => console.log('Launcher clicked'),
    primaryColor: '#059669',
  },
}

export const CustomIcon: LauncherStory = {
  args: {
    isOpen: false,
    onClick: () => console.log('Launcher clicked'),
    iconUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=cofoundy',
  },
}

export const Interactive: LauncherStory = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false)
    return (
      <FloatingLauncher
        isOpen={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        unreadCount={isOpen ? 0 : 2}
      />
    )
  },
}

// ============================================================================
// FloatingWindow Stories
// ============================================================================

export const WindowOpen: StoryObj<typeof FloatingWindow> = {
  render: () => (
    <div className="relative w-full h-[600px] bg-slate-900">
      <FloatingWindow isOpen={true} position="bottom-right">
        <div className="p-4 text-white">
          <h2 className="text-lg font-semibold mb-2">Chat Content</h2>
          <p className="text-sm text-gray-400">This is where the chat widget content goes.</p>
        </div>
      </FloatingWindow>
    </div>
  ),
  parameters: {
    layout: 'fullscreen',
  },
}

export const WindowBottomLeft: StoryObj<typeof FloatingWindow> = {
  render: () => (
    <div className="relative w-full h-[600px] bg-slate-900">
      <FloatingWindow isOpen={true} position="bottom-left">
        <div className="p-4 text-white">
          <h2 className="text-lg font-semibold mb-2">Bottom Left Position</h2>
          <p className="text-sm text-gray-400">Window positioned on the left side.</p>
        </div>
      </FloatingWindow>
    </div>
  ),
  parameters: {
    layout: 'fullscreen',
  },
}

// ============================================================================
// ChatWidgetFloating (Full Integration)
// ============================================================================

export const FullWidget: StoryObj<typeof ChatWidgetFloating> = {
  render: () => (
    <div className="relative w-full h-[700px] bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="p-8">
        <h1 className="text-2xl font-bold text-white mb-4">Landing Page Content</h1>
        <p className="text-gray-400 max-w-md">
          This demonstrates the floating chat widget as it would appear on a real page.
          Click the bubble to open the chat.
        </p>
      </div>
      <ChatWidgetFloating
        transport={{
          type: 'websocket',
          url: 'wss://demo.example.com',
        }}
        greeting={{
          id: 'greeting-1',
          role: 'assistant',
          content: '¡Hola! Soy Tina, tu asistente virtual. ¿En qué puedo ayudarte?',
          timestamp: new Date(),
        }}
        floating={{
          position: 'bottom-right',
          showBadge: true,
          defaultOpen: false,
        }}
        theme={{
          primaryColor: '#2984AD',
          brandName: 'Cofoundy',
          brandSubtitle: 'Consultora de Software & IA',
        }}
      />
    </div>
  ),
  parameters: {
    layout: 'fullscreen',
  },
}

export const FullWidgetOpen: StoryObj<typeof ChatWidgetFloating> = {
  render: () => (
    <div className="relative w-full h-[700px] bg-gradient-to-br from-slate-900 to-slate-800">
      <ChatWidgetFloating
        transport={{
          type: 'websocket',
          url: 'wss://demo.example.com',
        }}
        greeting={{
          id: 'greeting-1',
          role: 'assistant',
          content: '¡Hola! ¿Cómo puedo ayudarte hoy?',
          timestamp: new Date(),
        }}
        floating={{
          position: 'bottom-right',
          defaultOpen: true,
        }}
        theme={{
          primaryColor: '#2984AD',
          brandName: 'Demo Chat',
        }}
      />
    </div>
  ),
  parameters: {
    layout: 'fullscreen',
  },
}
