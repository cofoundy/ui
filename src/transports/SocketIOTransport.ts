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
 * Map tool names to icons
 */
function getToolIcon(toolName: string): string {
  const toolIcons: Record<string, string> = {
    schedule_appointment: "📅",
    get_available_slots: "🕐",
    search: "🔍",
    web_search: "🌐",
    calculator: "🔢",
    send_email: "📧",
    create_task: "✅",
  };
  return toolIcons[toolName.toLowerCase()] || "⚡";
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
    const previousStatus = connectionStatus;
    connectionStatus = status;

    // Fire callbacks on status changes
    if (status === "connected" && previousStatus !== "connected") {
      onConnect?.();
    } else if (status === "disconnected" && previousStatus === "connected") {
      onDisconnect?.();
    } else if (status === "error") {
      onError?.(new Error("Connection error"));
    }
  }

  function flushMessageQueue() {
    if (socket?.connected) {
      while (messageQueue.length > 0) {
        const message = messageQueue.shift();
        if (message) {
          socket.emit("widget_message", {
            content: message,
            tenant_id: tenantId,
            session_id: sessionId,
          });
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
    // Widget connections use auth: { widget: true } to bypass JWT auth
    socket = io(url, {
      path: "/socket.io",
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: maxReconnectAttempts,
      reconnectionDelay: reconnectDelay,
      reconnectionDelayMax: 30000,  // Max 30s between retries
      randomizationFactor: 0.5,     // Jitter to avoid thundering herd
      timeout: 10000,               // 10s timeout per connection attempt
      auth: {
        widget: true,  // Required for InboxAI to allow connection without JWT
      },
      query: {
        sessionId,
        tenantId,
        tz: browserTimezone,
      },
    });

    socket.on("connect", () => {
      // Send widget_init event to initialize the session
      socket?.emit("widget_init", {
        tenant_id: tenantId,
        session_id: sessionId,
        visitor_name: "Visitor",
        metadata: {
          page_url: typeof window !== "undefined" ? window.location.href : "",
          page_title: typeof document !== "undefined" ? document.title : "",
        },
      });

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

    // InboxAI widget events
    socket.on("widget:session", (data: { sessionId: string; conversationId: string | null }) => {
      // Session initialized successfully
      console.log("[SocketIO] Widget session initialized:", data);
    });

    // Listen for messages (InboxAI emits message:new)
    socket.on("message:new", (data: SocketIOMessage) => {
      // Only handle if it's from AI/agent (not echoed user message)
      if (data.type !== "user" && (data as { sender?: { type?: string } }).sender?.type !== "visitor") {
        handleAssistantMessage(data);
      }
    });

    // Legacy event names for compatibility with other backends
    socket.on("assistant_message", handleAssistantMessage);
    socket.on("message", (data: SocketIOMessage) => {
      if (data.type !== "user") {
        handleAssistantMessage(data);
      }
    });
    socket.on("response", handleAssistantMessage);
    socket.on("stream", handleAssistantMessage);

    // AG-UI streaming events (for AI responses)
    socket.on("ag_ui:event", (event: Record<string, unknown>) => {
      const eventType = event.type as string;

      // Message events
      if (eventType === "TEXT_MESSAGE_CONTENT") {
        onToken?.((event as { delta?: string }).delta || "");
      } else if (eventType === "TEXT_MESSAGE_END") {
        onStreamComplete?.();
      } else if (eventType === "RUN_ERROR") {
        onStreamError?.((event as { message?: string }).message || "Unknown error");
      }
      // Tool events
      else if (eventType === "TOOL_CALL_START") {
        const toolName = (event as { toolCallName?: string }).toolCallName || "tool";
        const toolIcon = getToolIcon(toolName);
        onToolStart?.(toolName, toolIcon, `Ejecutando ${toolName}...`);
      } else if (eventType === "TOOL_CALL_END") {
        const toolName = (event as { toolCallName?: string }).toolCallName;
        if (toolName) {
          onToolEnd?.(toolName, true);
        }
      } else if (eventType === "TOOL_CALL_RESULT") {
        const toolCallId = (event as { toolCallId?: string }).toolCallId || "";
        const resultStr = (event as { result?: string }).result || "";

        // Try to parse the result to check for scheduling confirmation
        try {
          const result = typeof resultStr === "string" ? JSON.parse(resultStr) : resultStr;

          // Check if this is a scheduling confirmation from schedule_appointment tool
          // Backend schema: { success: true, datetime, client_name, client_email, topic, event_id?, event_link? }
          if (result?.success === true && result.datetime) {
            const confirmation: AppointmentConfirmation = {
              datetime: result.datetime,
              client_name: result.client_name || "",
              client_email: result.client_email || "",
              topic: result.topic || "",
              event_id: result.event_id,
              event_link: result.event_link,
            };
            onConfirmation?.(confirmation);
          }
        } catch {
          // Result wasn't JSON or couldn't be parsed - that's OK
          console.log("[SocketIO] Tool result not parseable:", toolCallId);
        }
      }
    });

    // Typing indicator
    socket.on("agent:typing", (data: { active: boolean }) => {
      // Could emit a typing event to the UI if needed
      console.log("[SocketIO] Agent typing:", data.active);
    });
  }

  function sendMessage(message: string) {
    if (socket?.connected) {
      // Use widget_message event for InboxAI backend
      socket.emit("widget_message", {
        content: message,
        tenant_id: tenantId,
        session_id: sessionId,
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
      (connectionStatus === "disconnected" || connectionStatus === "error")
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
