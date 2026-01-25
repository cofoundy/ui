import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { FloatingLauncher } from '../../components/chat-widget/FloatingLauncher'
import { FloatingWindow } from '../../components/chat-widget/FloatingWindow'
import { ChatWidgetFloating } from '../../components/chat-widget/ChatWidgetFloating'

// ============================================================================
// Viewport configurations for responsive testing
// ============================================================================

const VIEWPORT_MOBILE = { defaultViewport: 'mobile1' } // 375px (iPhone SE)
const VIEWPORT_MOBILE_LANDSCAPE = { defaultViewport: 'mobile2' } // 414px landscape
const VIEWPORT_TABLET = { defaultViewport: 'tablet' } // 768px (iPad)
const VIEWPORT_DESKTOP = { defaultViewport: 'responsive' } // Full width

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

// ============================================================================
// Responsive Viewport Stories
// ============================================================================

/**
 * Mobile view (375px) - Launcher should be 48px, compact margins
 * On open: Full-screen chat window with no rounded corners
 */
export const MobileView: LauncherStory = {
  args: {
    isOpen: false,
    onClick: () => console.log('Launcher clicked'),
    unreadCount: 3,
  },
  parameters: {
    viewport: VIEWPORT_MOBILE,
    docs: {
      description: {
        story: 'Mobile viewport (375px): Launcher is 48px with 16px edge offset. More compact for smaller screens while maintaining 44px+ touch target.',
      },
    },
  },
}

/**
 * Tablet view (768px) - Uses desktop sizing (above 640px breakpoint)
 */
export const TabletView: LauncherStory = {
  args: {
    isOpen: false,
    onClick: () => console.log('Launcher clicked'),
    unreadCount: 5,
  },
  parameters: {
    viewport: VIEWPORT_TABLET,
    docs: {
      description: {
        story: 'Tablet viewport (768px): Uses desktop sizing - 56px launcher with standard 20px offset.',
      },
    },
  },
}

/**
 * Desktop view - Full-size launcher with configurable offset
 */
export const DesktopView: LauncherStory = {
  args: {
    isOpen: false,
    onClick: () => console.log('Launcher clicked'),
    unreadCount: 2,
  },
  parameters: {
    viewport: VIEWPORT_DESKTOP,
    docs: {
      description: {
        story: 'Desktop viewport: Full 56px launcher with 20px default offset. Hover effects more prominent.',
      },
    },
  },
}

/**
 * Mobile landscape view - Tests horizontal orientation
 */
export const MobileLandscape: LauncherStory = {
  args: {
    isOpen: false,
    onClick: () => console.log('Launcher clicked'),
  },
  parameters: {
    viewport: VIEWPORT_MOBILE_LANDSCAPE,
    docs: {
      description: {
        story: 'Mobile landscape (414px): Still uses mobile sizing since width < 640px breakpoint.',
      },
    },
  },
}

// ============================================================================
// Full-Screen Window (Mobile) Stories
// ============================================================================

/**
 * Mobile full-screen chat window
 * - inset-0 takes entire viewport
 * - No rounded corners
 * - Slide-up animation
 */
export const MobileWindowOpen: StoryObj<typeof FloatingWindow> = {
  render: () => (
    <div className="relative w-full h-screen bg-slate-900">
      <FloatingWindow isOpen={true} position="bottom-right">
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-white/10">
            <h2 className="text-lg font-semibold text-white">Chat Support</h2>
            <p className="text-sm text-gray-400">Full-screen on mobile</p>
          </div>
          <div className="flex-1 p-4 overflow-y-auto">
            <p className="text-gray-300">
              On mobile devices (under 640px), the chat window takes the full screen
              with no rounded corners for maximum usable space.
            </p>
          </div>
        </div>
      </FloatingWindow>
    </div>
  ),
  parameters: {
    layout: 'fullscreen',
    viewport: VIEWPORT_MOBILE,
    docs: {
      description: {
        story: 'Mobile full-screen mode: Window uses `inset-0` to cover entire viewport. No rounded corners, no borders, slide-up animation.',
      },
    },
  },
}

/**
 * Desktop floating window (for comparison)
 */
export const DesktopWindowOpen: StoryObj<typeof FloatingWindow> = {
  render: () => (
    <div className="relative w-full h-[700px] bg-slate-900">
      <FloatingWindow isOpen={true} position="bottom-right">
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-white/10">
            <h2 className="text-lg font-semibold text-white">Chat Support</h2>
            <p className="text-sm text-gray-400">Floating window on desktop</p>
          </div>
          <div className="flex-1 p-4 overflow-y-auto">
            <p className="text-gray-300">
              On desktop (640px+), the window floats at 380x600px with rounded corners,
              shadow, and border.
            </p>
          </div>
        </div>
      </FloatingWindow>
    </div>
  ),
  parameters: {
    layout: 'fullscreen',
    viewport: VIEWPORT_DESKTOP,
    docs: {
      description: {
        story: 'Desktop floating mode: 380x600px window with rounded corners, shadow, and positioned above the launcher.',
      },
    },
  },
}

// ============================================================================
// Interactive Responsive Demo
// ============================================================================

/**
 * Interactive demo showing responsive behavior
 * Resize the viewport to see changes
 */
export const ResponsiveInteractive: StoryObj<typeof ChatWidgetFloating> = {
  render: () => {
    const [viewportInfo, setViewportInfo] = useState('')

    // Update viewport info on mount and resize
    if (typeof window !== 'undefined') {
      const updateInfo = () => {
        const width = window.innerWidth
        const mode = width < 640 ? 'Mobile' : 'Desktop'
        setViewportInfo(`${width}px (${mode} mode)`)
      }
      if (!viewportInfo) updateInfo()
      window.addEventListener('resize', updateInfo)
    }

    return (
      <div className="relative w-full min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-white mb-2">Responsive Demo</h1>
          <p className="text-gray-400 mb-4">
            Viewport: <span className="text-cyan-400 font-mono">{viewportInfo}</span>
          </p>
          <div className="text-sm text-gray-500 space-y-1">
            <p>• Mobile (&lt;640px): 48px launcher, full-screen chat</p>
            <p>• Desktop (≥640px): 56px launcher, floating 380x600 window</p>
          </div>
        </div>
        <ChatWidgetFloating
          transport={{
            type: 'websocket',
            url: 'wss://demo.example.com',
          }}
          greeting={{
            id: 'greeting-1',
            role: 'assistant',
            content: '¡Hola! Resize the browser to see responsive behavior.',
            timestamp: new Date(),
          }}
          floating={{
            position: 'bottom-right',
            defaultOpen: false,
            showBadge: true,
          }}
          theme={{
            primaryColor: '#2984AD',
            brandName: 'Responsive Chat',
            brandSubtitle: 'Try resizing the viewport',
          }}
        />
      </div>
    )
  },
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        story: 'Interactive demo: Use the Storybook viewport selector or resize your browser to see responsive breakpoints in action.',
      },
    },
  },
}
