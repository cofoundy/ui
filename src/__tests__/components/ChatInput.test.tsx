import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ChatInput } from '../../components/chat-widget/ChatInput'

describe('ChatInput', () => {
  const mockOnSendMessage = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Basic Rendering', () => {
    it('should render input field', () => {
      render(<ChatInput onSendMessage={mockOnSendMessage} />)
      const input = screen.getByPlaceholderText('Escribe tu mensaje...')
      expect(input).toBeInTheDocument()
    })

    it('should render send button', () => {
      render(<ChatInput onSendMessage={mockOnSendMessage} />)
      const button = screen.getByRole('button', { name: '' }) // Button has icon only
      expect(button).toBeInTheDocument()
    })

    it('should render custom placeholder', () => {
      render(
        <ChatInput
          onSendMessage={mockOnSendMessage}
          placeholder="Type here..."
        />
      )
      expect(screen.getByPlaceholderText('Type here...')).toBeInTheDocument()
    })
  })

  describe('Input Behavior', () => {
    it('should allow typing in input', async () => {
      const user = userEvent.setup()
      render(<ChatInput onSendMessage={mockOnSendMessage} />)

      const input = screen.getByPlaceholderText('Escribe tu mensaje...')
      await user.type(input, 'Hello world')

      expect(input).toHaveValue('Hello world')
    })

    it('should clear input after sending', async () => {
      const user = userEvent.setup()
      render(<ChatInput onSendMessage={mockOnSendMessage} />)

      const input = screen.getByPlaceholderText('Escribe tu mensaje...')
      await user.type(input, 'Test message')
      await user.click(screen.getByRole('button'))

      expect(input).toHaveValue('')
    })
  })

  describe('Send Button Disabled States', () => {
    it('should disable send button when input is empty', () => {
      render(<ChatInput onSendMessage={mockOnSendMessage} />)
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
    })

    it('should enable send button when input has text', async () => {
      const user = userEvent.setup()
      render(<ChatInput onSendMessage={mockOnSendMessage} />)

      const input = screen.getByPlaceholderText('Escribe tu mensaje...')
      await user.type(input, 'Hello')

      const button = screen.getByRole('button')
      expect(button).not.toBeDisabled()
    })

    it('should disable send button when disabled prop is true', async () => {
      const user = userEvent.setup()
      render(<ChatInput onSendMessage={mockOnSendMessage} disabled={true} />)

      const input = screen.getByPlaceholderText('Escribe tu mensaje...')
      await user.type(input, 'Hello')

      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
    })

    it('should disable send button with whitespace-only input', async () => {
      const user = userEvent.setup()
      render(<ChatInput onSendMessage={mockOnSendMessage} />)

      const input = screen.getByPlaceholderText('Escribe tu mensaje...')
      await user.type(input, '   ')

      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
    })
  })

  describe('Input vs Send Disabled States (UX Fix)', () => {
    it('should keep input enabled when only disabled prop is true', async () => {
      const user = userEvent.setup()
      render(<ChatInput onSendMessage={mockOnSendMessage} disabled={true} />)

      const input = screen.getByPlaceholderText('Escribe tu mensaje...')
      // Input should NOT be disabled - user can type while AI responds
      expect(input).not.toBeDisabled()

      // User should be able to type
      await user.type(input, 'Typing while AI responds')
      expect(input).toHaveValue('Typing while AI responds')
    })

    it('should disable input when inputDisabled prop is true', () => {
      render(
        <ChatInput
          onSendMessage={mockOnSendMessage}
          inputDisabled={true}
        />
      )

      const input = screen.getByPlaceholderText('Escribe tu mensaje...')
      expect(input).toBeDisabled()
    })

    it('should allow typing when disabled=true but inputDisabled=false', async () => {
      const user = userEvent.setup()
      render(
        <ChatInput
          onSendMessage={mockOnSendMessage}
          disabled={true}
          inputDisabled={false}
        />
      )

      const input = screen.getByPlaceholderText('Escribe tu mensaje...')
      expect(input).not.toBeDisabled()

      await user.type(input, 'Can still type')
      expect(input).toHaveValue('Can still type')

      // But send button should be disabled
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
    })

    it('should disable both input and button when inputDisabled=true', () => {
      render(
        <ChatInput
          onSendMessage={mockOnSendMessage}
          inputDisabled={true}
          disabled={true}
        />
      )

      const input = screen.getByPlaceholderText('Escribe tu mensaje...')
      const button = screen.getByRole('button')

      expect(input).toBeDisabled()
      expect(button).toBeDisabled()
    })
  })

  describe('Message Sending', () => {
    it('should call onSendMessage when button clicked', async () => {
      const user = userEvent.setup()
      render(<ChatInput onSendMessage={mockOnSendMessage} />)

      const input = screen.getByPlaceholderText('Escribe tu mensaje...')
      await user.type(input, 'Test message')
      await user.click(screen.getByRole('button'))

      expect(mockOnSendMessage).toHaveBeenCalledWith('Test message')
    })

    it('should call onSendMessage when Enter is pressed', async () => {
      const user = userEvent.setup()
      render(<ChatInput onSendMessage={mockOnSendMessage} />)

      const input = screen.getByPlaceholderText('Escribe tu mensaje...')
      await user.type(input, 'Test message')
      await user.keyboard('{Enter}')

      expect(mockOnSendMessage).toHaveBeenCalledWith('Test message')
    })

    it('should NOT call onSendMessage when disabled and Enter pressed', async () => {
      const user = userEvent.setup()
      render(<ChatInput onSendMessage={mockOnSendMessage} disabled={true} />)

      const input = screen.getByPlaceholderText('Escribe tu mensaje...')
      await user.type(input, 'Test message')
      await user.keyboard('{Enter}')

      expect(mockOnSendMessage).not.toHaveBeenCalled()
    })

    it('should NOT send when Shift+Enter is pressed', () => {
      render(<ChatInput onSendMessage={mockOnSendMessage} />)

      const input = screen.getByPlaceholderText('Escribe tu mensaje...')
      fireEvent.change(input, { target: { value: 'Test message' } })

      // Simulate Shift+Enter using fireEvent for more control
      fireEvent.keyDown(input, { key: 'Enter', shiftKey: true })

      expect(mockOnSendMessage).not.toHaveBeenCalled()
      // Message should still be in input (not cleared)
      expect(input).toHaveValue('Test message')
    })

    it('should trim whitespace from message', async () => {
      const user = userEvent.setup()
      render(<ChatInput onSendMessage={mockOnSendMessage} />)

      const input = screen.getByPlaceholderText('Escribe tu mensaje...')
      await user.type(input, '  Hello world  ')
      await user.click(screen.getByRole('button'))

      expect(mockOnSendMessage).toHaveBeenCalledWith('Hello world')
    })

    it('should not send empty message after trim', async () => {
      const user = userEvent.setup()
      render(<ChatInput onSendMessage={mockOnSendMessage} />)

      const input = screen.getByPlaceholderText('Escribe tu mensaje...')
      // Type spaces directly into the input
      fireEvent.change(input, { target: { value: '   ' } })
      fireEvent.submit(input.closest('form')!)

      expect(mockOnSendMessage).not.toHaveBeenCalled()
    })
  })

  describe('Streaming/Processing State (Real-world UX)', () => {
    it('should allow user to compose next message while AI is responding', async () => {
      // This test simulates the real-world scenario:
      // User sends message -> AI is streaming -> User wants to type next message
      const user = userEvent.setup()
      render(
        <ChatInput
          onSendMessage={mockOnSendMessage}
          disabled={true} // AI is streaming
          inputDisabled={false}
          placeholder="Escribe tu mensaje..."
        />
      )

      const input = screen.getByPlaceholderText('Escribe tu mensaje...')

      // User should be able to type their next message
      expect(input).not.toBeDisabled()
      await user.type(input, 'My follow-up question')
      expect(input).toHaveValue('My follow-up question')

      // But they can't send yet (button disabled)
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
    })

    it('should show processing placeholder but keep input enabled', async () => {
      const user = userEvent.setup()
      render(
        <ChatInput
          onSendMessage={mockOnSendMessage}
          disabled={true}
          inputDisabled={false}
          placeholder="Procesando..."
        />
      )

      const input = screen.getByPlaceholderText('Procesando...')
      expect(input).not.toBeDisabled()

      await user.type(input, 'Can still type')
      expect(input).toHaveValue('Can still type')
    })
  })
})
