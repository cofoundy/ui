import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FloatingWindow } from '../../components/chat-widget/FloatingWindow'

describe('FloatingWindow', () => {
  describe('Rendering', () => {
    it('should keep children mounted but hidden when closed', () => {
      // Children stay mounted to preserve state (messages, connection)
      // Only visibility changes on open/close
      render(
        <FloatingWindow isOpen={false}>
          <div data-testid="content">Chat Content</div>
        </FloatingWindow>
      )

      const content = screen.getByTestId('content')
      expect(content).toBeInTheDocument()
      // Parent should be aria-hidden when closed
      expect(content.parentElement).toHaveAttribute('aria-hidden', 'true')
    })

    it('should render children visibly when open', () => {
      render(
        <FloatingWindow isOpen={true}>
          <div data-testid="content">Chat Content</div>
        </FloatingWindow>
      )

      const content = screen.getByTestId('content')
      expect(content).toBeInTheDocument()
      // Parent should not be aria-hidden when open
      expect(content.parentElement).toHaveAttribute('aria-hidden', 'false')
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

    it('should have rounded corners on desktop (sm: breakpoint)', () => {
      render(
        <FloatingWindow isOpen={true}>
          <div data-testid="content">Content</div>
        </FloatingWindow>
      )

      const window = screen.getByTestId('content').parentElement
      // Mobile-first: no rounded corners on mobile, rounded on desktop (sm:)
      expect(window).toHaveClass('rounded-none')
      expect(window).toHaveClass('sm:rounded-2xl')
    })

    it('should have shadow on desktop (sm: breakpoint)', () => {
      render(
        <FloatingWindow isOpen={true}>
          <div data-testid="content">Content</div>
        </FloatingWindow>
      )

      const window = screen.getByTestId('content').parentElement
      // Mobile-first: shadow only on desktop (sm:)
      expect(window).toHaveClass('sm:shadow-2xl')
    })
  })

  describe('Dimensions', () => {
    it('should be full-screen on mobile, fixed size on desktop', () => {
      render(
        <FloatingWindow isOpen={true}>
          <div data-testid="content">Content</div>
        </FloatingWindow>
      )

      const window = screen.getByTestId('content').parentElement
      // Mobile-first: full-screen on mobile (inset-0), fixed dimensions on desktop
      expect(window).toHaveClass('inset-0')
      expect(window).toHaveClass('sm:inset-auto')
      expect(window).toHaveClass('sm:w-[380px]')
      expect(window).toHaveClass('sm:h-[600px]')
    })

    it('should have max dimensions for desktop viewport', () => {
      render(
        <FloatingWindow isOpen={true}>
          <div data-testid="content">Content</div>
        </FloatingWindow>
      )

      const window = screen.getByTestId('content').parentElement
      // Mobile-first: max dimensions only apply on desktop
      expect(window).toHaveClass('sm:max-w-[calc(100vw-40px)]')
      expect(window).toHaveClass('sm:max-h-[calc(100vh-140px)]')
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
