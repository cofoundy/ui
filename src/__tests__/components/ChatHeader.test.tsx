import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ChatHeader } from '../../components/chat-widget/ChatHeader'

describe('ChatHeader', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Basic Rendering', () => {
    it('should render brand name', () => {
      render(<ChatHeader connectionStatus="connected" brandName="Test Brand" />)
      expect(screen.getByText('Test Brand')).toBeInTheDocument()
    })

    it('should render brand subtitle', () => {
      render(
        <ChatHeader
          connectionStatus="connected"
          brandSubtitle="Test Subtitle"
        />
      )
      expect(screen.getByText('Test Subtitle')).toBeInTheDocument()
    })

    it('should render default brand name when not provided', () => {
      render(<ChatHeader connectionStatus="connected" />)
      expect(screen.getByText('Cofoundy')).toBeInTheDocument()
    })

    it('should render default subtitle when not provided', () => {
      render(<ChatHeader connectionStatus="connected" />)
      expect(screen.getByText('Consultoría de Software & IA')).toBeInTheDocument()
    })
  })

  describe('Connection Status', () => {
    it('should show connected status indicator', () => {
      render(<ChatHeader connectionStatus="connected" />)
      const indicator = document.querySelector('[title="Conectado"]')
      expect(indicator).toBeInTheDocument()
    })

    it('should show connecting status indicator', () => {
      render(<ChatHeader connectionStatus="connecting" />)
      const indicator = document.querySelector('[title="Conectando..."]')
      expect(indicator).toBeInTheDocument()
    })

    it('should show disconnected status indicator', () => {
      render(<ChatHeader connectionStatus="disconnected" />)
      const indicator = document.querySelector('[title="Desconectado"]')
      expect(indicator).toBeInTheDocument()
    })

    it('should show error status indicator', () => {
      render(<ChatHeader connectionStatus="error" />)
      const indicator = document.querySelector('[title="Error de conexión"]')
      expect(indicator).toBeInTheDocument()
    })
  })

  describe('Calendar Authentication', () => {
    it('should show calendar connected when authenticated', () => {
      render(<ChatHeader connectionStatus="connected" isAuthenticated={true} />)
      expect(screen.getByText('Calendario conectado')).toBeInTheDocument()
    })

    it('should not show calendar status when not authenticated', () => {
      render(<ChatHeader connectionStatus="connected" isAuthenticated={false} />)
      expect(screen.queryByText('Calendario conectado')).not.toBeInTheDocument()
    })
  })

  describe('New Conversation Button', () => {
    it('should render new conversation button when callback provided', () => {
      const mockOnNewConversation = vi.fn()
      render(
        <ChatHeader
          connectionStatus="connected"
          onNewConversation={mockOnNewConversation}
        />
      )

      const button = screen.getByRole('button', { name: /nueva conversación/i })
      expect(button).toBeInTheDocument()
    })

    it('should not render new conversation button when no callback', () => {
      render(<ChatHeader connectionStatus="connected" />)

      const button = screen.queryByRole('button', { name: /nueva conversación/i })
      expect(button).not.toBeInTheDocument()
    })

    it('should call onNewConversation when button clicked', () => {
      const mockOnNewConversation = vi.fn()
      render(
        <ChatHeader
          connectionStatus="connected"
          onNewConversation={mockOnNewConversation}
        />
      )

      const button = screen.getByRole('button', { name: /nueva conversación/i })
      fireEvent.click(button)

      expect(mockOnNewConversation).toHaveBeenCalledTimes(1)
    })

    it('should have correct title attribute', () => {
      const mockOnNewConversation = vi.fn()
      render(
        <ChatHeader
          connectionStatus="connected"
          onNewConversation={mockOnNewConversation}
        />
      )

      const button = screen.getByTitle('Nueva conversación')
      expect(button).toBeInTheDocument()
    })

    it('should have correct aria-label for accessibility', () => {
      const mockOnNewConversation = vi.fn()
      render(
        <ChatHeader
          connectionStatus="connected"
          onNewConversation={mockOnNewConversation}
        />
      )

      const button = screen.getByLabelText('Iniciar nueva conversación')
      expect(button).toBeInTheDocument()
    })
  })

  describe('Brand Logo', () => {
    it('should render custom brand logo when provided', () => {
      render(
        <ChatHeader
          connectionStatus="connected"
          brandName="Custom Brand"
          brandLogo="https://example.com/logo.png"
        />
      )

      const logo = screen.getByAltText('Custom Brand')
      expect(logo).toBeInTheDocument()
      expect(logo).toHaveAttribute('src', 'https://example.com/logo.png')
    })

    it('should render default Logo component when no brandLogo', () => {
      render(<ChatHeader connectionStatus="connected" />)
      // Default logo is an SVG, not an img
      const img = screen.queryByRole('img')
      // No img tag for default logo
      expect(img).not.toBeInTheDocument()
    })
  })
})
