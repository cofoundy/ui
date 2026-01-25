import { describe, it, expect } from 'vitest'
import type {
  TransportConfig,
  WebSocketTransportConfig,
  SocketIOTransportConfig,
  AGUITransportConfig,
  TransportType,
  FloatingConfig,
  FloatingPosition,
  WidgetMode,
  TransportCallbacks,
  AppointmentConfirmation,
} from '../../transports/types'

describe('Transport Types', () => {
  describe('WebSocketTransportConfig', () => {
    it('should have required type and url properties', () => {
      const config: WebSocketTransportConfig = {
        type: 'websocket',
        url: 'wss://api.example.com',
      }

      expect(config.type).toBe('websocket')
      expect(config.url).toBe('wss://api.example.com')
    })

    it('should accept optional properties', () => {
      const config: WebSocketTransportConfig = {
        type: 'websocket',
        url: 'wss://api.example.com',
        sessionId: 'my-session',
        maxReconnectAttempts: 5,
        reconnectDelay: 2000,
      }

      expect(config.sessionId).toBe('my-session')
      expect(config.maxReconnectAttempts).toBe(5)
      expect(config.reconnectDelay).toBe(2000)
    })
  })

  describe('SocketIOTransportConfig', () => {
    it('should have required type, url, and tenantId properties', () => {
      const config: SocketIOTransportConfig = {
        type: 'socketio',
        url: 'https://api.example.com',
        tenantId: 'tenant-123',
      }

      expect(config.type).toBe('socketio')
      expect(config.url).toBe('https://api.example.com')
      expect(config.tenantId).toBe('tenant-123')
    })

    it('should accept optional namespace', () => {
      const config: SocketIOTransportConfig = {
        type: 'socketio',
        url: 'https://api.example.com',
        tenantId: 'tenant-123',
        namespace: '/chat',
      }

      expect(config.namespace).toBe('/chat')
    })
  })

  describe('AGUITransportConfig', () => {
    it('should have required type and url properties', () => {
      const config: AGUITransportConfig = {
        type: 'agui',
        url: 'https://api.example.com/sse',
      }

      expect(config.type).toBe('agui')
      expect(config.url).toBe('https://api.example.com/sse')
    })

    it('should accept optional authToken', () => {
      const config: AGUITransportConfig = {
        type: 'agui',
        url: 'https://api.example.com/sse',
        authToken: 'bearer-token',
      }

      expect(config.authToken).toBe('bearer-token')
    })
  })

  describe('TransportConfig union', () => {
    it('should accept websocket config', () => {
      const config: TransportConfig = {
        type: 'websocket',
        url: 'wss://api.example.com',
      }

      expect(config.type).toBe('websocket')
    })

    it('should accept socketio config', () => {
      const config: TransportConfig = {
        type: 'socketio',
        url: 'https://api.example.com',
        tenantId: 'tenant-123',
      }

      expect(config.type).toBe('socketio')
    })

    it('should accept agui config', () => {
      const config: TransportConfig = {
        type: 'agui',
        url: 'https://api.example.com/sse',
      }

      expect(config.type).toBe('agui')
    })
  })

  describe('TransportType', () => {
    it('should be one of the valid transport types', () => {
      const types: TransportType[] = ['websocket', 'socketio', 'agui']

      expect(types).toContain('websocket')
      expect(types).toContain('socketio')
      expect(types).toContain('agui')
    })
  })

  describe('FloatingConfig', () => {
    it('should have all optional properties', () => {
      const config: FloatingConfig = {}

      expect(config.position).toBeUndefined()
      expect(config.showBadge).toBeUndefined()
      expect(config.defaultOpen).toBeUndefined()
    })

    it('should accept all valid properties', () => {
      const config: FloatingConfig = {
        position: 'bottom-right',
        showBadge: true,
        defaultOpen: false,
        launcherIcon: 'https://example.com/icon.png',
        offset: { x: 20, y: 20 },
        zIndex: 9999,
      }

      expect(config.position).toBe('bottom-right')
      expect(config.showBadge).toBe(true)
      expect(config.defaultOpen).toBe(false)
      expect(config.launcherIcon).toBe('https://example.com/icon.png')
      expect(config.offset?.x).toBe(20)
      expect(config.offset?.y).toBe(20)
      expect(config.zIndex).toBe(9999)
    })
  })

  describe('FloatingPosition', () => {
    it('should accept all valid positions', () => {
      const positions: FloatingPosition[] = [
        'bottom-right',
        'bottom-left',
        'top-right',
        'top-left',
      ]

      expect(positions).toHaveLength(4)
      expect(positions).toContain('bottom-right')
      expect(positions).toContain('bottom-left')
      expect(positions).toContain('top-right')
      expect(positions).toContain('top-left')
    })
  })

  describe('WidgetMode', () => {
    it('should be embedded or floating', () => {
      const modes: WidgetMode[] = ['embedded', 'floating']

      expect(modes).toContain('embedded')
      expect(modes).toContain('floating')
    })
  })

  describe('TransportCallbacks', () => {
    it('should have all callback properties optional', () => {
      const callbacks: TransportCallbacks = {}

      expect(callbacks.onToken).toBeUndefined()
      expect(callbacks.onStreamComplete).toBeUndefined()
      expect(callbacks.onConnect).toBeUndefined()
    })

    it('should accept callback functions', () => {
      const callbacks: TransportCallbacks = {
        onToken: (content: string) => console.log(content),
        onStreamComplete: () => console.log('done'),
        onStreamError: (error: string) => console.error(error),
        onMessageEnd: () => console.log('message end'),
        onToolStart: (tool: string, icon: string, text: string) =>
          console.log(tool, icon, text),
        onToolEnd: (tool: string, success: boolean) =>
          console.log(tool, success),
        onSlots: (date: string, slots: string[]) => console.log(date, slots),
        onConfirmation: (confirmation: AppointmentConfirmation) =>
          console.log(confirmation),
        onMessage: (message: string) => console.log(message),
        onConnect: () => console.log('connected'),
        onDisconnect: () => console.log('disconnected'),
        onError: (error: Event | Error) => console.error(error),
        onMaxRetriesReached: () => console.log('max retries'),
      }

      expect(typeof callbacks.onToken).toBe('function')
      expect(typeof callbacks.onConnect).toBe('function')
    })
  })

  describe('AppointmentConfirmation', () => {
    it('should have required properties', () => {
      const confirmation: AppointmentConfirmation = {
        datetime: '2024-01-15T14:00:00Z',
        client_name: 'John Doe',
        client_email: 'john@example.com',
        topic: 'Consultation',
      }

      expect(confirmation.datetime).toBe('2024-01-15T14:00:00Z')
      expect(confirmation.client_name).toBe('John Doe')
      expect(confirmation.client_email).toBe('john@example.com')
      expect(confirmation.topic).toBe('Consultation')
    })

    it('should accept optional properties', () => {
      const confirmation: AppointmentConfirmation = {
        datetime: '2024-01-15T14:00:00Z',
        client_name: 'John Doe',
        client_email: 'john@example.com',
        topic: 'Consultation',
        event_id: 'evt-123',
        event_link: 'https://calendar.example.com/evt-123',
      }

      expect(confirmation.event_id).toBe('evt-123')
      expect(confirmation.event_link).toBe('https://calendar.example.com/evt-123')
    })
  })
})
