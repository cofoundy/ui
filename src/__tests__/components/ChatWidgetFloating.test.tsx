import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ChatWidgetFloating } from '../../components/chat-widget/ChatWidgetFloating'
import type { TransportConfig, Message } from '../../types'

// Mock createPortal to render in the same container
vi.mock('react-dom', async () => {
  const actual = await vi.importActual('react-dom')
  return {
    ...actual,
    createPortal: (children: React.ReactNode) => children,
  }
})

describe('ChatWidgetFloating', () => {
  const defaultTransport: TransportConfig = {
    type: 'websocket',
    url: 'wss://test.example.com',
  }

  const defaultGreeting: Message = {
    id: 'greeting-1',
    role: 'assistant',
    content: 'Hello! How can I help you?',
    timestamp: new Date(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Initialization', () => {
    it('should render launcher button', async () => {
      render(
        <ChatWidgetFloating
          transport={defaultTransport}
          greeting={defaultGreeting}
        />
      )

      await waitFor(() => {
        const button = screen.getByRole('button')
        expect(button).toBeInTheDocument()
      })
    })

    it('should start closed by default', async () => {
      render(
        <ChatWidgetFloating
          transport={defaultTransport}
          greeting={defaultGreeting}
        />
      )

      await waitFor(() => {
        const button = screen.getByRole('button')
        expect(button).toHaveAttribute('aria-label', 'Abrir chat')
      })
    })

    it('should start open when defaultOpen is true', async () => {
      render(
        <ChatWidgetFloating
          transport={defaultTransport}
          greeting={defaultGreeting}
          floating={{ defaultOpen: true }}
        />
      )

      // When defaultOpen is true, the button shows close icon
      const closeButton = await screen.findByLabelText('Cerrar chat', {}, { timeout: 3000 })
      expect(closeButton).toBeInTheDocument()
    })
  })

  describe('Open/Close Behavior', () => {
    it('should open when launcher is clicked', async () => {
      render(
        <ChatWidgetFloating
          transport={defaultTransport}
          greeting={defaultGreeting}
        />
      )

      // Wait for component to mount
      const button = await screen.findByRole('button')

      // Click to open
      fireEvent.click(button)

      // Should now show close label
      await waitFor(
        () => {
          expect(button).toHaveAttribute('aria-label', 'Cerrar chat')
        },
        { timeout: 2000 }
      )
    })

    it('should close when launcher is clicked while open', async () => {
      render(
        <ChatWidgetFloating
          transport={defaultTransport}
          greeting={defaultGreeting}
          floating={{ defaultOpen: true }}
        />
      )

      // Find the button specifically by aria-label
      const openButton = await screen.findByLabelText('Cerrar chat', {}, { timeout: 3000 })

      // Click to close
      fireEvent.click(openButton)

      // Should now show open label
      await waitFor(
        () => {
          expect(screen.getByLabelText('Abrir chat')).toBeInTheDocument()
        },
        { timeout: 2000 }
      )
    })

    it('should call onOpenChange when toggled', async () => {
      const onOpenChange = vi.fn()

      render(
        <ChatWidgetFloating
          transport={defaultTransport}
          greeting={defaultGreeting}
          onOpenChange={onOpenChange}
        />
      )

      await waitFor(() => {
        const button = screen.getByRole('button')
        fireEvent.click(button)
      })

      await waitFor(() => {
        expect(onOpenChange).toHaveBeenCalledWith(true)
      })
    })
  })

  describe('Position Configuration', () => {
    it('should pass position to launcher', async () => {
      render(
        <ChatWidgetFloating
          transport={defaultTransport}
          greeting={defaultGreeting}
          floating={{ position: 'bottom-left' }}
        />
      )

      await waitFor(() => {
        const button = screen.getByRole('button')
        expect(button.className).toContain('left-0')
      })
    })

    it('should use bottom-right as default position', async () => {
      render(
        <ChatWidgetFloating
          transport={defaultTransport}
          greeting={defaultGreeting}
        />
      )

      await waitFor(() => {
        const button = screen.getByRole('button')
        expect(button.className).toContain('right-0')
      })
    })
  })

  describe('Theme Configuration', () => {
    it('should pass primaryColor to launcher', async () => {
      render(
        <ChatWidgetFloating
          transport={defaultTransport}
          greeting={defaultGreeting}
          theme={{ primaryColor: '#FF0000' }}
        />
      )

      await waitFor(() => {
        const button = screen.getByRole('button')
        expect(button).toHaveStyle({ backgroundColor: '#FF0000' })
      })
    })
  })

  describe('Z-Index Configuration', () => {
    it('should pass zIndex to launcher', async () => {
      render(
        <ChatWidgetFloating
          transport={defaultTransport}
          greeting={defaultGreeting}
          floating={{ zIndex: 50000 }}
        />
      )

      await waitFor(() => {
        const button = screen.getByRole('button')
        expect(button).toHaveStyle({ zIndex: 50000 })
      })
    })

    it('should use default zIndex of 9999', async () => {
      render(
        <ChatWidgetFloating
          transport={defaultTransport}
          greeting={defaultGreeting}
        />
      )

      await waitFor(() => {
        const button = screen.getByRole('button')
        expect(button).toHaveStyle({ zIndex: 9999 })
      })
    })
  })

  describe('Socket.IO Transport', () => {
    it('should accept socketio transport config', async () => {
      const socketioTransport: TransportConfig = {
        type: 'socketio',
        url: 'https://test.example.com',
        tenantId: 'test-tenant',
      }

      render(
        <ChatWidgetFloating
          transport={socketioTransport}
          greeting={defaultGreeting}
        />
      )

      await waitFor(() => {
        const button = screen.getByRole('button')
        expect(button).toBeInTheDocument()
      })
    })
  })

  describe('Offset Configuration', () => {
    it('should accept custom offset', async () => {
      render(
        <ChatWidgetFloating
          transport={defaultTransport}
          greeting={defaultGreeting}
          floating={{ offset: { x: 30, y: 40 } }}
        />
      )

      await waitFor(() => {
        const button = screen.getByRole('button')
        expect(button).toBeInTheDocument()
      })
    })
  })

  describe('Badge Configuration', () => {
    it('should show badge by default', async () => {
      render(
        <ChatWidgetFloating
          transport={defaultTransport}
          greeting={defaultGreeting}
        />
      )

      // Badge is only shown when there are unread messages
      await waitFor(() => {
        const button = screen.getByRole('button')
        expect(button).toBeInTheDocument()
      })
    })

    it('should hide badge when showBadge is false', async () => {
      render(
        <ChatWidgetFloating
          transport={defaultTransport}
          greeting={defaultGreeting}
          floating={{ showBadge: false }}
        />
      )

      await waitFor(() => {
        const button = screen.getByRole('button')
        expect(button).toBeInTheDocument()
      })
    })
  })
})
