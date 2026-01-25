"use client";

import type {
  Transport,
  TransportOptions,
  SocketIOTransportConfig,
  AppointmentConfirmation,
} from "./types";
import type { ConnectionStatus } from "../types";

/**
 * Socket.IO message types for InboxAI backend
 */
interface SocketIOMessage {
  content?: string;
  text?: string;
  message?: string;
  type?: string;
  // Tool events
  tool?: string;
  icon?: string;
  success?: boolean;
  // Slots/confirmation
  date?: string;
  slots?: string[];
  datetime?: string;
  client_name?: string;
  client_email?: string;
  topic?: string;
  event_id?: string;
  event_link?: string;
}

/**
 * Socket.IO types (for dynamic import)
 */
interface SocketIOClient {
  io: (url: string, opts?: Record<string, unknown>) => SocketInstance;
}

interface SocketInstance {
  connected: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  on: (event: string, callback: (...args: any[]) => void) => void;
  emit: (event: string, data: unknown) => void;
  connect: () => void;
  disconnect: () => void;
  removeAllListeners: () => void;
}

/**
 * Dynamic import for socket.io-client
 * This ensures the library is only loaded when Socket.IO transport is used
 */
async function loadSocketIO(): Promise<SocketIOClient> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const socketio = await import("socket.io-client" as any);
  return socketio as unknown as SocketIOClient;
}

/**
 * Creates a Socket.IO transport instance for InboxAI backend
 */
export async function createSocketIOTransport(
  config: SocketIOTransportConfig,
  options: TransportOptions
): Promise<Transport> {
  // Dynamic import of socket.io-client
  const { io } = await loadSocketIO();

  let socket: ReturnType<typeof io> | null = null;
  let connectionStatus: ConnectionStatus = "disconnected";
  let reconnectAttempts = 0;
  const messageQueue: string[] = [];

  const {
    url,
    tenantId,
    namespace = "/",
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
  }

  function flushMessageQueue() {
    if (socket?.connected) {
      while (messageQueue.length > 0) {
        const message = messageQueue.shift();
        if (message) {
          socket.emit("message", { content: message, tenantId });
        }
      }
    }
  }

  function handleAssistantMessage(data: SocketIOMessage) {
    const content = data.content || data.text || data.message || "";

    // Check if this is a streaming token or complete message
    if (data.type === "token") {
      onToken?.(content);
    } else if (data.type === "done") {
      onStreamComplete?.();
    } else if (data.type === "error") {
      onStreamError?.(content || "Unknown error");
    } else if (data.type === "message_end") {
      onMessageEnd?.();
    } else if (data.type === "tool_start" && data.tool) {
      onToolStart?.(data.tool, data.icon || "⚡", content || `Ejecutando ${data.tool}...`);
    } else if (data.type === "tool_end" && data.tool) {
      onToolEnd?.(data.tool, data.success ?? true);
    } else if (data.type === "slots" && data.date && data.slots) {
      onSlots?.(data.date, data.slots);
    } else if (data.type === "confirmation" && data.datetime) {
      const confirmation: AppointmentConfirmation = {
        datetime: data.datetime,
        client_name: data.client_name || "",
        client_email: data.client_email || "",
        topic: data.topic || "",
        event_id: data.event_id,
        event_link: data.event_link,
      };
      onConfirmation?.(confirmation);
    } else {
      // Complete message (non-streaming)
      onMessage?.(content);
    }
  }

  function connect() {
    if (!sessionId) return;

    setConnectionStatus("connecting");

    // Get browser timezone
    const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    // Create Socket.IO connection
    socket = io(url, {
      path: "/socket.io",
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: maxReconnectAttempts,
      reconnectionDelay: reconnectDelay,
      query: {
        sessionId,
        tenantId,
        tz: browserTimezone,
      },
    });

    socket.on("connect", () => {
      setConnectionStatus("connected");
      reconnectAttempts = 0;
      onConnect?.();
      flushMessageQueue();
    });

    socket.on("disconnect", (reason: string) => {
      setConnectionStatus("disconnected");
      onDisconnect?.();

      // Check if this was a server disconnect (not user-initiated)
      if (reason === "io server disconnect") {
        // Server forced disconnect, attempt reconnection
        socket?.connect();
      }
    });

    socket.on("connect_error", (error: Error) => {
      setConnectionStatus("error");
      onError?.(error);

      reconnectAttempts++;
      if (reconnectAttempts >= maxReconnectAttempts) {
        onMaxRetriesReached?.();
      }
    });

    // Listen for assistant messages (various event names for compatibility)
    socket.on("assistant_message", handleAssistantMessage);
    socket.on("message", (data: SocketIOMessage) => {
      // Only handle if it's from assistant (not echoed user message)
      if (data.type !== "user") {
        handleAssistantMessage(data);
      }
    });
    socket.on("response", handleAssistantMessage);
    socket.on("stream", handleAssistantMessage);

    // Typing indicator
    socket.on("typing", () => {
      // The store handles typing state, this just triggers an update
    });
  }

  function sendMessage(message: string) {
    if (socket?.connected) {
      socket.emit("message", {
        content: message,
        tenantId,
        sessionId,
      });
    } else {
      messageQueue.push(message);
    }
  }

  function reconnect() {
    reconnectAttempts = 0;
    if (socket) {
      socket.disconnect();
    }
    connect();
  }

  function disconnect() {
    if (socket) {
      socket.removeAllListeners();
      socket.disconnect();
      socket = null;
    }
  }

  // Setup visibility change handler
  function handleVisibilityChange() {
    if (
      typeof document !== "undefined" &&
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
 * Type guard to check if config is Socket.IO transport
 */
export function isSocketIOConfig(
  config: unknown
): config is SocketIOTransportConfig {
  return (
    typeof config === "object" &&
    config !== null &&
    "type" in config &&
    (config as { type: string }).type === "socketio"
  );
}
