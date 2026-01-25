"use client";

import type {
  Transport,
  TransportOptions,
  WebSocketTransportConfig,
  AppointmentConfirmation,
} from "./types";
import type { ConnectionStatus } from "../types";

/**
 * Streaming message types from WebSocket server
 */
interface StreamMessage {
  type:
    | "token"
    | "done"
    | "error"
    | "message_end"
    | "tool_start"
    | "tool_end"
    | "slots"
    | "confirmation";
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

/**
 * Creates a WebSocket transport instance
 */
export function createWebSocketTransport(
  config: WebSocketTransportConfig,
  options: TransportOptions
): Transport {
  let ws: WebSocket | null = null;
  let connectionStatus: ConnectionStatus = "disconnected";
  let reconnectAttempts = 0;
  let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  const messageQueue: string[] = [];
  let statusListener: ((status: ConnectionStatus) => void) | null = null;

  const {
    url,
    maxReconnectAttempts = 5,
    reconnectDelay = 1000,
  } = config;

  const {
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
  } = options;

  function setConnectionStatus(status: ConnectionStatus) {
    connectionStatus = status;
    statusListener?.(status);
  }

  function flushMessageQueue() {
    if (ws?.readyState === WebSocket.OPEN) {
      while (messageQueue.length > 0) {
        const message = messageQueue.shift();
        if (message) {
          ws.send(message);
        }
      }
    }
  }

  function handleMessage(event: MessageEvent) {
    try {
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
            onToolStart?.(
              msg.tool,
              msg.icon || "⚡",
              msg.text || `Ejecutando ${msg.tool}...`
            );
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
            const confirmation: AppointmentConfirmation = {
              datetime: msg.datetime,
              client_name: msg.client_name || "",
              client_email: msg.client_email || "",
              topic: msg.topic || "",
              event_id: msg.event_id,
              event_link: msg.event_link,
            };
            onConfirmation?.(confirmation);
          }
          break;
      }
    } catch {
      // Fallback for non-JSON messages (backward compatibility)
      onMessage?.(event.data);
    }
  }

  function connect() {
    if (!sessionId) return;

    // Close existing connection
    if (ws) {
      ws.close();
    }

    setConnectionStatus("connecting");

    // Auto-detect browser timezone and send with connection
    const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const wsUrl = `${url}/ws/${sessionId}?tz=${encodeURIComponent(browserTimezone)}`;
    ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      setConnectionStatus("connected");
      reconnectAttempts = 0;
      onConnect?.();
      flushMessageQueue();
    };

    ws.onmessage = handleMessage;

    ws.onclose = () => {
      setConnectionStatus("disconnected");
      onDisconnect?.();

      // Attempt reconnection with exponential backoff
      if (reconnectAttempts < (maxReconnectAttempts ?? 5)) {
        const delay = (reconnectDelay ?? 1000) * Math.pow(2, reconnectAttempts);
        reconnectAttempts += 1;

        reconnectTimeout = setTimeout(() => {
          connect();
        }, delay);
      } else {
        onMaxRetriesReached?.();
      }
    };

    ws.onerror = (error) => {
      setConnectionStatus("error");
      onError?.(error);
    };
  }

  function sendMessage(message: string) {
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(message);
    } else {
      messageQueue.push(message);
    }
  }

  function reconnect() {
    reconnectAttempts = 0;
    connect();
  }

  function disconnect() {
    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout);
      reconnectTimeout = null;
    }
    if (ws) {
      ws.close();
      ws = null;
    }
  }

  // Setup visibility change handler
  function handleVisibilityChange() {
    if (
      document.visibilityState === "visible" &&
      connectionStatus === "disconnected"
    ) {
      reconnect();
    }
  }

  // Auto-connect
  connect();

  // Listen for visibility changes
  if (typeof document !== "undefined") {
    document.addEventListener("visibilitychange", handleVisibilityChange);
  }

  return {
    sendMessage,
    get connectionStatus() {
      return connectionStatus;
    },
    reconnect,
    disconnect: () => {
      if (typeof document !== "undefined") {
        document.removeEventListener("visibilitychange", handleVisibilityChange);
      }
      disconnect();
    },
  };
}

/**
 * Type guard to check if config is WebSocket transport
 */
export function isWebSocketConfig(
  config: unknown
): config is WebSocketTransportConfig {
  return (
    typeof config === "object" &&
    config !== null &&
    "type" in config &&
    (config as { type: string }).type === "websocket"
  );
}
