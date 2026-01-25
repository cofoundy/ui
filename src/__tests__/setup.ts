import '@testing-library/jest-dom'
import { vi, beforeEach, afterEach } from 'vitest'

// Mock crypto.randomUUID
Object.defineProperty(globalThis, 'crypto', {
  value: {
    randomUUID: () => `test-uuid-${Math.random().toString(36).substring(7)}`,
  },
})

// Mock WebSocket
class MockWebSocket {
  static CONNECTING = 0
  static OPEN = 1
  static CLOSING = 2
  static CLOSED = 3

  readyState = MockWebSocket.CONNECTING
  url: string
  onopen: ((event: Event) => void) | null = null
  onclose: ((event: CloseEvent) => void) | null = null
  onmessage: ((event: MessageEvent) => void) | null = null
  onerror: ((event: Event) => void) | null = null

  constructor(url: string) {
    this.url = url
    // Simulate connection after a tick
    setTimeout(() => {
      this.readyState = MockWebSocket.OPEN
      this.onopen?.(new Event('open'))
    }, 10)
  }

  send = vi.fn()
  close = vi.fn(() => {
    this.readyState = MockWebSocket.CLOSED
    this.onclose?.(new CloseEvent('close'))
  })

  // Helper to simulate receiving a message
  simulateMessage(data: string | object) {
    const messageData = typeof data === 'string' ? data : JSON.stringify(data)
    this.onmessage?.(new MessageEvent('message', { data: messageData }))
  }

  // Helper to simulate error
  simulateError() {
    this.onerror?.(new Event('error'))
  }

  // Helper to simulate close
  simulateClose() {
    this.readyState = MockWebSocket.CLOSED
    this.onclose?.(new CloseEvent('close'))
  }
}

// Store reference for tests to access
;(globalThis as any).MockWebSocket = MockWebSocket
;(globalThis as any).WebSocket = MockWebSocket

// Mock ResizeObserver
class MockResizeObserver {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
}
globalThis.ResizeObserver = MockResizeObserver as any

// Mock IntersectionObserver
class MockIntersectionObserver {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
}
globalThis.IntersectionObserver = MockIntersectionObserver as any

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock Intl.DateTimeFormat for timezone
const OriginalDateTimeFormat = Intl.DateTimeFormat
const MockDateTimeFormat = function(this: any, locale?: string, options?: Intl.DateTimeFormatOptions) {
  const instance = new OriginalDateTimeFormat(locale, options)
  return {
    format: instance.format.bind(instance),
    formatToParts: instance.formatToParts.bind(instance),
    formatRange: (instance as any).formatRange?.bind(instance),
    formatRangeToParts: (instance as any).formatRangeToParts?.bind(instance),
    resolvedOptions: () => ({
      ...instance.resolvedOptions(),
      timeZone: 'America/New_York',
    }),
  }
} as unknown as typeof Intl.DateTimeFormat

// Copy static methods
MockDateTimeFormat.supportedLocalesOf = OriginalDateTimeFormat.supportedLocalesOf

;(globalThis as any).Intl = {
  ...Intl,
  DateTimeFormat: MockDateTimeFormat,
}

// Mock document.visibilityState
Object.defineProperty(document, 'visibilityState', {
  configurable: true,
  get: () => 'visible',
})

// Mock sessionStorage
const sessionStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()
Object.defineProperty(window, 'sessionStorage', { value: sessionStorageMock })

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()
Object.defineProperty(window, 'localStorage', { value: localStorageMock })

// Reset mocks and storage between tests
beforeEach(() => {
  vi.clearAllMocks()
  sessionStorageMock.clear()
  localStorageMock.clear()
})

afterEach(() => {
  vi.restoreAllMocks()
})
