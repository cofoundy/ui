"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { ConnectionStatus } from "../types";

/**
 * Confirmation data from schedule_appointment tool
 */
export interface AppointmentConfirmation {
  datetime: string;
  client_name: string;
  client_email: string;
  topic: string;
  event_id?: string;
  event_link?: string;
}

/**
 * Streaming message types from WebSocket server
 */
interface StreamMessage {
  type: "token" | "done" | "error" | "message_end" | "tool_start" | "tool_end" | "slots" | "confirmation";
  content?: string;
  // Tool event fields
  tool?: string;
  icon?: string;
  text?: string;
  success?: boolean;
  // Slots event fields
  date?: string;
  slots?: string[];
  // Confirmation event fields
  datetime?: string;
  client_name?: string;
  client_email?: string;
  topic?: string;
  event_id?: string;
  event_link?: string;
}

export interface UseWebSocketOptions {
  url: string;
  sessionId: string;
  /** Called for each streamed token */
  onToken?: (content: string) => void;
  /** Called when stream completes */
  onStreamComplete?: () => void;
  /** Called on error (including stream errors) */
  onStreamError?: (error: string) => void;
  /** Called when message ends (before tool starts) */
  onMessageEnd?: () => void;
  /** Called when a tool starts executing */
  onToolStart?: (tool: string, icon: string, text: string) => void;
  /** Called when a tool finishes */
  onToolEnd?: (tool: string, success: boolean) => void;
  /** Called when slots are available from check_availability tool */
  onSlots?: (date: string, slots: string[]) => void;
  /** Called when appointment is confirmed from schedule_appointment tool */
  onConfirmation?: (confirmation: AppointmentConfirmation) => void;
  /** Legacy: Called for non-JSON messages (backward compatibility) */
  onMessage?: (message: string) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
  onMaxRetriesReached?: () => void;
  maxReconnectAttempts?: number;
  reconnectDelay?: number;
}

export interface UseWebSocketReturn {
  sendMessage: (message: string) => void;
  connectionStatus: ConnectionStatus;
  reconnect: () => void;
}

/**
 * Custom hook for WebSocket connection with streaming support and auto-reconnect.
 *
 * Handles JSON streaming messages from the server:
 * - {"type": "token", "content": "..."} - Individual tokens
 * - {"type": "done"} - Stream complete
 * - {"type": "error", "content": "..."} - Stream error
 */
export function useWebSocket({
  url,
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
  maxReconnectAttempts = 5,
  reconnectDelay = 1000,
}: UseWebSocketOptions): UseWebSocketReturn {
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("disconnected");
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const messageQueueRef = useRef<string[]>([]);
  // Store connect function in ref for recursive access
  const connectRef = useRef<() => void>(() => {});

  // Flush message queue when connected
  const flushMessageQueue = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      while (messageQueueRef.current.length > 0) {
        const message = messageQueueRef.current.shift();
        if (message) {
          wsRef.current.send(message);
        }
      }
    }
  }, []);

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (!sessionId) return;

    // Close existing connection
    if (wsRef.current) {
      wsRef.current.close();
    }

    setConnectionStatus("connecting");

    // Auto-detect browser timezone and send with connection
    const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const wsUrl = `${url}/ws/${sessionId}?tz=${encodeURIComponent(browserTimezone)}`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      setConnectionStatus("connected");
      reconnectAttemptsRef.current = 0;
      onConnect?.();
      flushMessageQueue();
    };

    ws.onmessage = (event) => {
      try {
        // Try to parse as JSON streaming message
        const msg: StreamMessage = JSON.parse(event.data);

        switch (msg.type) {
          case "token":
            if (msg.content) {
              onToken?.(msg.content);
            }
            break;
          case "done":
            onStreamComplete?.();
            break;
          case "error":
            onStreamError?.(msg.content || "Unknown error");
            break;
          case "message_end":
            onMessageEnd?.();
            break;
          case "tool_start":
            if (msg.tool) {
              onToolStart?.(msg.tool, msg.icon || "⚡", msg.text || `Ejecutando ${msg.tool}...`);
            }
            break;
          case "tool_end":
            if (msg.tool) {
              onToolEnd?.(msg.tool, msg.success ?? true);
            }
            break;
          case "slots":
            if (msg.date && msg.slots) {
              onSlots?.(msg.date, msg.slots);
            }
            break;
          case "confirmation":
            if (msg.datetime) {
              onConfirmation?.({
                datetime: msg.datetime,
                client_name: msg.client_name || "",
                client_email: msg.client_email || "",
                topic: msg.topic || "",
                event_id: msg.event_id,
                event_link: msg.event_link,
              });
            }
            break;
        }
      } catch {
        // Fallback for non-JSON messages (backward compatibility)
        onMessage?.(event.data);
      }
    };

    ws.onclose = () => {
      setConnectionStatus("disconnected");
      onDisconnect?.();

      // Attempt reconnection with exponential backoff
      if (reconnectAttemptsRef.current < maxReconnectAttempts) {
        const delay =
          reconnectDelay * Math.pow(2, reconnectAttemptsRef.current);
        reconnectAttemptsRef.current += 1;

        reconnectTimeoutRef.current = setTimeout(() => {
          connectRef.current();
        }, delay);
      } else {
        // Max retries reached - notify callback
        onMaxRetriesReached?.();
      }
    };

    ws.onerror = (error) => {
      setConnectionStatus("error");
      onError?.(error);
    };

    wsRef.current = ws;
  }, [
    url,
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
    maxReconnectAttempts,
    reconnectDelay,
    flushMessageQueue,
  ]);

  // Send message
  const sendMessage = useCallback((message: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(message);
    } else {
      // Queue message for when connection is established
      messageQueueRef.current.push(message);
    }
  }, []);

  // Manual reconnect
  const reconnect = useCallback(() => {
    reconnectAttemptsRef.current = 0;
    connect();
  }, [connect]);

  // Keep connectRef in sync with connect function for recursive access
  useEffect(() => {
    connectRef.current = connect;
  }, [connect]);

  // Connect on mount and when sessionId changes
  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  // Reconnect on tab visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (
        document.visibilityState === "visible" &&
        connectionStatus === "disconnected"
      ) {
        reconnect();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [connectionStatus, reconnect]);

  return {
    sendMessage,
    connectionStatus,
    reconnect,
  };
}
