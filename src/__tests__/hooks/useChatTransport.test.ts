import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useChatTransport, createTransportConfigFromUrl } from '../../hooks/useChatTransport'
import type { TransportConfig } from '../../transports/types'

describe('useChatTransport', () => {
  const defaultConfig: TransportConfig = {
    type: 'websocket',
    url: 'wss://test.example.com',
    maxReconnectAttempts: 3,
    reconnectDelay: 100,
  }

  const defaultCallbacks = {
    onToken: vi.fn(),
    onStreamComplete: vi.fn(),
    onStreamError: vi.fn(),
    onConnect: vi.fn(),
    onDisconnect: vi.fn(),
    onError: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Initialization', () => {
    it('should initialize with connecting status', () => {
      const { result } = renderHook(() =>
        useChatTransport({
          config: defaultConfig,
          sessionId: 'test-session',
          ...defaultCallbacks,
        })
      )

      expect(result.current.connectionStatus).toBe('connecting')
    })

    it('should transition to connected status', async () => {
      const { result } = renderHook(() =>
        useChatTransport({
          config: defaultConfig,
          sessionId: 'test-session',
          ...defaultCallbacks,
        })
      )

      await waitFor(() => {
        expect(result.current.connectionStatus).toBe('connected')
      })

      expect(result.current.isReady).toBe(true)
    })

    it('should not initialize without sessionId', () => {
      const { result } = renderHook(() =>
        useChatTransport({
          config: defaultConfig,
          sessionId: '',
          ...defaultCallbacks,
        })
      )

      // Should remain disconnected without session
      expect(result.current.connectionStatus).toBe('disconnected')
    })
  })

  describe('sendMessage', () => {
    it('should provide sendMessage function', async () => {
      const { result } = renderHook(() =>
        useChatTransport({
          config: defaultConfig,
          sessionId: 'test-session',
          ...defaultCallbacks,
        })
      )

      await waitFor(() => {
        expect(result.current.isReady).toBe(true)
      })

      expect(typeof result.current.sendMessage).toBe('function')
    })

    it('should call sendMessage without error when connected', async () => {
      const { result } = renderHook(() =>
        useChatTransport({
          config: defaultConfig,
          sessionId: 'test-session',
          ...defaultCallbacks,
        })
      )

      await waitFor(() => {
        expect(result.current.isReady).toBe(true)
      })

      act(() => {
        result.current.sendMessage('Test message')
      })

      // No error thrown is success
    })
  })

  describe('reconnect', () => {
    it('should provide reconnect function', async () => {
      const { result } = renderHook(() =>
        useChatTransport({
          config: defaultConfig,
          sessionId: 'test-session',
          ...defaultCallbacks,
        })
      )

      expect(typeof result.current.reconnect).toBe('function')
    })

    it('should call reconnect without error', async () => {
      const { result } = renderHook(() =>
        useChatTransport({
          config: defaultConfig,
          sessionId: 'test-session',
          ...defaultCallbacks,
        })
      )

      await waitFor(() => {
        expect(result.current.isReady).toBe(true)
      })

      act(() => {
        result.current.reconnect()
      })
    })
  })

  describe('Cleanup', () => {
    it('should cleanup transport on unmount', async () => {
      const { result, unmount } = renderHook(() =>
        useChatTransport({
          config: defaultConfig,
          sessionId: 'test-session',
          ...defaultCallbacks,
        })
      )

      await waitFor(() => {
        expect(result.current.isReady).toBe(true)
      })

      unmount()

      // Transport should be disconnected
    })

    it('should cleanup and recreate on config change', async () => {
      const { result, rerender } = renderHook(
        ({ config, sessionId }) =>
          useChatTransport({
            config,
            sessionId,
            ...defaultCallbacks,
          }),
        {
          initialProps: {
            config: defaultConfig,
            sessionId: 'session-1',
          },
        }
      )

      await waitFor(() => {
        expect(result.current.isReady).toBe(true)
      })

      // Change session ID
      rerender({
        config: defaultConfig,
        sessionId: 'session-2',
      })

      // Should reconnect with new session
      await waitFor(() => {
        expect(result.current.connectionStatus).toBe('connected')
      })
    })
  })

  describe('Socket.IO Transport', () => {
    it('should handle socketio config type', async () => {
      const socketioConfig: TransportConfig = {
        type: 'socketio',
        url: 'https://test.example.com',
        tenantId: 'test-tenant',
      }

      // This will throw because socket.io-client is not available in test
      // but we're testing that the hook handles the config type correctly
      const { result } = renderHook(() =>
        useChatTransport({
          config: socketioConfig,
          sessionId: 'test-session',
          ...defaultCallbacks,
        })
      )

      // Should start in connecting state
      expect(result.current.connectionStatus).toBe('connecting')
    })
  })
})

describe('createTransportConfigFromUrl', () => {
  it('should create websocket config from URL', () => {
    const config = createTransportConfigFromUrl('wss://api.example.com')

    expect(config.type).toBe('websocket')
    expect(config.url).toBe('wss://api.example.com')
  })

  it('should include sessionId if provided', () => {
    const config = createTransportConfigFromUrl('wss://api.example.com', 'my-session')

    expect(config.type).toBe('websocket')
    expect(config.url).toBe('wss://api.example.com')
    expect(config.sessionId).toBe('my-session')
  })

  it('should work with ws:// URLs', () => {
    const config = createTransportConfigFromUrl('ws://localhost:8080')

    expect(config.type).toBe('websocket')
    expect(config.url).toBe('ws://localhost:8080')
  })
})
