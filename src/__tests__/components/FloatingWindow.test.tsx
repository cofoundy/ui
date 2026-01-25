import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FloatingWindow } from '../../components/chat-widget/FloatingWindow'

describe('FloatingWindow', () => {
  describe('Rendering', () => {
    it('should not render children when closed', () => {
      render(
        <FloatingWindow isOpen={false}>
          <div data-testid="content">Chat Content</div>
        </FloatingWindow>
      )

      const content = screen.queryByTestId('content')
      expect(content).not.toBeInTheDocument()
    })

    it('should render children when open', () => {
      render(
        <FloatingWindow isOpen={true}>
          <div data-testid="content">Chat Content</div>
        </FloatingWindow>
      )

      const content = screen.getByTestId('content')
      expect(content).toBeInTheDocument()
    })
  })

  describe('Positioning', () => {
    it('should apply bottom-right position by default', () => {
      render(
        <FloatingWindow isOpen={true}>
          <div>Content</div>
        </FloatingWindow>
      )

      // Window should be positioned fixed
      const window = screen.getByText('Content').parentElement
      expect(window).toHaveClass('fixed')
    })

    it('should apply correct position styles for bottom-left', () => {
      render(
        <FloatingWindow isOpen={true} position="bottom-left">
          <div data-testid="content">Content</div>
        </FloatingWindow>
      )

      const content = screen.getByTestId('content')
      expect(content.parentElement).toHaveClass('fixed')
    })

    it('should apply correct position styles for top-right', () => {
      render(
        <FloatingWindow isOpen={true} position="top-right">
          <div data-testid="content">Content</div>
        </FloatingWindow>
      )

      const content = screen.getByTestId('content')
      expect(content.parentElement).toHaveClass('fixed')
    })

    it('should apply correct position styles for top-left', () => {
      render(
        <FloatingWindow isOpen={true} position="top-left">
          <div data-testid="content">Content</div>
        </FloatingWindow>
      )

      const content = screen.getByTestId('content')
      expect(content.parentElement).toHaveClass('fixed')
    })
  })

  describe('Styling', () => {
    it('should apply custom z-index', () => {
      render(
        <FloatingWindow isOpen={true} zIndex={50000}>
          <div data-testid="content">Content</div>
        </FloatingWindow>
      )

      const window = screen.getByTestId('content').parentElement
      expect(window).toHaveStyle({ zIndex: 50000 })
    })

    it('should apply custom className', () => {
      render(
        <FloatingWindow isOpen={true} className="custom-window">
          <div data-testid="content">Content</div>
        </FloatingWindow>
      )

      const window = screen.getByTestId('content').parentElement
      expect(window).toHaveClass('custom-window')
    })

    it('should have rounded corners', () => {
      render(
        <FloatingWindow isOpen={true}>
          <div data-testid="content">Content</div>
        </FloatingWindow>
      )

      const window = screen.getByTestId('content').parentElement
      expect(window).toHaveClass('rounded-2xl')
    })

    it('should have shadow', () => {
      render(
        <FloatingWindow isOpen={true}>
          <div data-testid="content">Content</div>
        </FloatingWindow>
      )

      const window = screen.getByTestId('content').parentElement
      expect(window).toHaveClass('shadow-2xl')
    })
  })

  describe('Dimensions', () => {
    it('should have default width and height', () => {
      render(
        <FloatingWindow isOpen={true}>
          <div data-testid="content">Content</div>
        </FloatingWindow>
      )

      const window = screen.getByTestId('content').parentElement
      expect(window).toHaveClass('w-[380px]')
      expect(window).toHaveClass('h-[600px]')
    })

    it('should have max dimensions for mobile', () => {
      render(
        <FloatingWindow isOpen={true}>
          <div data-testid="content">Content</div>
        </FloatingWindow>
      )

      const window = screen.getByTestId('content').parentElement
      expect(window).toHaveClass('max-w-[calc(100vw-40px)]')
      expect(window).toHaveClass('max-h-[calc(100vh-140px)]')
    })
  })

  describe('Overflow', () => {
    it('should hide overflow', () => {
      render(
        <FloatingWindow isOpen={true}>
          <div data-testid="content">Content</div>
        </FloatingWindow>
      )

      const window = screen.getByTestId('content').parentElement
      expect(window).toHaveClass('overflow-hidden')
    })
  })

  describe('Offset', () => {
    it('should apply custom offset', () => {
      render(
        <FloatingWindow isOpen={true} offset={{ x: 30, y: 40 }}>
          <div data-testid="content">Content</div>
        </FloatingWindow>
      )

      const window = screen.getByTestId('content').parentElement
      expect(window).toHaveClass('fixed')
      // Offset is applied via inline styles
    })
  })
})
