import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { FloatingLauncher } from '../../components/chat-widget/FloatingLauncher'

describe('FloatingLauncher', () => {
  const defaultProps = {
    isOpen: false,
    onClick: vi.fn(),
  }

  describe('Rendering', () => {
    it('should render the launcher button', () => {
      render(<FloatingLauncher {...defaultProps} />)

      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    it('should have correct aria-label when closed', () => {
      render(<FloatingLauncher {...defaultProps} isOpen={false} />)

      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-label', 'Abrir chat')
    })

    it('should have correct aria-label when open', () => {
      render(<FloatingLauncher {...defaultProps} isOpen={true} />)

      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-label', 'Cerrar chat')
    })

    it('should show message icon when closed', () => {
      render(<FloatingLauncher {...defaultProps} isOpen={false} />)

      // The MessageCircle icon should be visible
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    it('should show close icon when open', () => {
      render(<FloatingLauncher {...defaultProps} isOpen={true} />)

      // The X icon should be visible
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })
  })

  describe('Click Handling', () => {
    it('should call onClick when clicked', () => {
      const onClick = vi.fn()
      render(<FloatingLauncher {...defaultProps} onClick={onClick} />)

      const button = screen.getByRole('button')
      fireEvent.click(button)

      expect(onClick).toHaveBeenCalledTimes(1)
    })
  })

  describe('Positioning', () => {
    it('should apply bottom-right position by default', () => {
      render(<FloatingLauncher {...defaultProps} />)

      const button = screen.getByRole('button')
      expect(button.className).toContain('bottom-0')
      expect(button.className).toContain('right-0')
    })

    it('should apply bottom-left position', () => {
      render(<FloatingLauncher {...defaultProps} position="bottom-left" />)

      const button = screen.getByRole('button')
      expect(button.className).toContain('bottom-0')
      expect(button.className).toContain('left-0')
    })

    it('should apply top-right position', () => {
      render(<FloatingLauncher {...defaultProps} position="top-right" />)

      const button = screen.getByRole('button')
      expect(button.className).toContain('top-0')
      expect(button.className).toContain('right-0')
    })

    it('should apply top-left position', () => {
      render(<FloatingLauncher {...defaultProps} position="top-left" />)

      const button = screen.getByRole('button')
      expect(button.className).toContain('top-0')
      expect(button.className).toContain('left-0')
    })
  })

  describe('Unread Badge', () => {
    it('should not show badge when unreadCount is 0', () => {
      render(<FloatingLauncher {...defaultProps} unreadCount={0} />)

      const badge = screen.queryByText('0')
      expect(badge).not.toBeInTheDocument()
    })

    it('should show badge when unreadCount > 0', () => {
      render(<FloatingLauncher {...defaultProps} unreadCount={5} />)

      const badge = screen.getByText('5')
      expect(badge).toBeInTheDocument()
    })

    it('should show 99+ when unreadCount > 99', () => {
      render(<FloatingLauncher {...defaultProps} unreadCount={150} />)

      const badge = screen.getByText('99+')
      expect(badge).toBeInTheDocument()
    })

    it('should not show badge when isOpen is true', () => {
      render(<FloatingLauncher {...defaultProps} isOpen={true} unreadCount={5} />)

      const badge = screen.queryByText('5')
      expect(badge).not.toBeInTheDocument()
    })
  })

  describe('Styling', () => {
    it('should apply custom primary color', () => {
      render(<FloatingLauncher {...defaultProps} primaryColor="#FF0000" />)

      const button = screen.getByRole('button')
      expect(button).toHaveStyle({ backgroundColor: '#FF0000' })
    })

    it('should apply custom z-index', () => {
      render(<FloatingLauncher {...defaultProps} zIndex={50000} />)

      const button = screen.getByRole('button')
      expect(button).toHaveStyle({ zIndex: 50000 })
    })

    it('should apply custom className', () => {
      render(<FloatingLauncher {...defaultProps} className="custom-class" />)

      const button = screen.getByRole('button')
      expect(button.className).toContain('custom-class')
    })
  })

  describe('Custom Icon', () => {
    it('should render custom icon when iconUrl is provided', () => {
      render(<FloatingLauncher {...defaultProps} iconUrl="https://example.com/icon.png" />)

      // The image has alt="" so it's treated as presentation, use getByRole with name or query by attribute
      const img = screen.getByRole('presentation', { hidden: true })
      expect(img).toHaveAttribute('src', 'https://example.com/icon.png')
    })
  })
})
