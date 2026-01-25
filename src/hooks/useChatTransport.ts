"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type {
  TransportConfig,
  TransportCallbacks,
  Transport,
} from "../transports/types";
import type { ConnectionStatus } from "../types";
import { createWebSocketTransport } from "../transports/WebSocketTransport";
import type { SocketIOTransportConfig } from "../transports/types";

export interface UseChatTransportOptions extends TransportCallbacks {
  /** Transport configuration */
  config: TransportConfig;
  /** Session ID for the chat */
  sessionId: string;
}

export interface UseChatTransportReturn {
  /** Send a message through the transport */
  sendMessage: (message: string) => void;
  /** Current connection status */
  connectionStatus: ConnectionStatus;
  /** Manually trigger reconnection */
  reconnect: () => void;
  /** Whether the transport is ready (connected) */
  isReady: boolean;
}

/**
 * Unified hook for chat transport
 * Dynamically loads the appropriate transport based on config type
 */
export function useChatTransport({
  config,
  sessionId,
  onToken,
  onStreamComplete,
  onStreamError,
  onMessageEnd,
  onToolStart,
  onToolEnd,
  onSlots,
  onConfirmation,
  onMessage,
  onConnect,
  onDisconnect,
  onError,
  onMaxRetriesReached,
}: UseChatTransportOptions): UseChatTransportReturn {
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("disconnected");
  const transportRef = useRef<Transport | null>(null);
  const configRef = useRef(config);
  const sessionIdRef = useRef(sessionId);

  // Create stable callback refs to avoid recreating transport on callback changes
  const callbacksRef = useRef({
    onToken,
    onStreamComplete,
    onStreamError,
    onMessageEnd,
    onToolStart,
    onToolEnd,
    onSlots,
    onConfirmation,
    onMessage,
    onConnect,
    onDisconnect,
    onError,
    onMaxRetriesReached,
  });

  // Update callback refs
  useEffect(() => {
    callbacksRef.current = {
      onToken,
      onStreamComplete,
      onStreamError,
      onMessageEnd,
      onToolStart,
      onToolEnd,
      onSlots,
      onConfirmation,
      onMessage,
      onConnect,
      onDisconnect,
      onError,
      onMaxRetriesReached,
    };
  }, [
    onToken,
    onStreamComplete,
    onStreamError,
    onMessageEnd,
    onToolStart,
    onToolEnd,
    onSlots,
    onConfirmation,
    onMessage,
    onConnect,
    onDisconnect,
    onError,
    onMaxRetriesReached,
  ]);

  // Initialize transport
  useEffect(() => {
    if (!sessionId) return;

    // Create wrapper callbacks that use refs
    const wrappedCallbacks: TransportCallbacks = {
      onToken: (content) => callbacksRef.current.onToken?.(content),
      onStreamComplete: () => callbacksRef.current.onStreamComplete?.(),
      onStreamError: (error) => callbacksRef.current.onStreamError?.(error),
      onMessageEnd: () => callbacksRef.current.onMessageEnd?.(),
      onToolStart: (tool, icon, text) =>
        callbacksRef.current.onToolStart?.(tool, icon, text),
      onToolEnd: (tool, success) =>
        callbacksRef.current.onToolEnd?.(tool, success),
      onSlots: (date, slots) => callbacksRef.current.onSlots?.(date, slots),
      onConfirmation: (confirmation) =>
        callbacksRef.current.onConfirmation?.(confirmation),
      onMessage: (message) => callbacksRef.current.onMessage?.(message),
      onConnect: () => {
        setConnectionStatus("connected");
        callbacksRef.current.onConnect?.();
      },
      onDisconnect: () => {
        setConnectionStatus("disconnected");
        callbacksRef.current.onDisconnect?.();
      },
      onError: (error) => {
        setConnectionStatus("error");
        callbacksRef.current.onError?.(error);
      },
      onMaxRetriesReached: () => callbacksRef.current.onMaxRetriesReached?.(),
    };

    let transport: Transport | null = null;
    let isCancelled = false;

    async function initTransport() {
      // Create transport based on type
      switch (config.type) {
        case "websocket":
          transport = createWebSocketTransport(config, {
            sessionId,
            ...wrappedCallbacks,
            maxReconnectAttempts: config.maxReconnectAttempts,
            reconnectDelay: config.reconnectDelay,
          });
          break;

        case "socketio":
          // Dynamic import for Socket.IO transport
          const { createSocketIOTransport } = await import(
            "../transports/SocketIOTransport"
          );
          if (isCancelled) return;
          transport = await createSocketIOTransport(
            config as SocketIOTransportConfig,
            {
              sessionId,
              ...wrappedCallbacks,
              maxReconnectAttempts: config.maxReconnectAttempts,
              reconnectDelay: config.reconnectDelay,
            }
          );
          break;

        case "agui":
          // AG-UI transport will be implemented later
          throw new Error(
            "AG-UI transport not yet implemented. Use websocket transport."
          );

        default:
          throw new Error(
            `Unknown transport type: ${(config as { type: string }).type}`
          );
      }

      if (isCancelled || !transport) return;

      transportRef.current = transport;
      configRef.current = config;
      sessionIdRef.current = sessionId;
    }

    setConnectionStatus("connecting");
    initTransport().catch((error) => {
      console.error("[useChatTransport] Failed to initialize transport:", error);
      setConnectionStatus("error");
    });

    return () => {
      isCancelled = true;
      if (transportRef.current) {
        transportRef.current.disconnect();
        transportRef.current = null;
      }
    };
  }, [config.type, config.url, sessionId]); // Only recreate on transport type/url/session change

  // Send message
  const sendMessage = useCallback((message: string) => {
    if (transportRef.current) {
      transportRef.current.sendMessage(message);
    } else {
      console.warn("[useChatTransport] No transport available to send message");
    }
  }, []);

  // Reconnect
  const reconnect = useCallback(() => {
    if (transportRef.current) {
      transportRef.current.reconnect();
    }
  }, []);

  return {
    sendMessage,
    connectionStatus,
    reconnect,
    isReady: connectionStatus === "connected",
  };
}

/**
 * Helper to create transport config from legacy websocketUrl
 */
export function createTransportConfigFromUrl(
  websocketUrl: string,
  sessionId?: string
): TransportConfig {
  return {
    type: "websocket",
    url: websocketUrl,
    sessionId,
  };
}
