import type { ConnectionStatus } from "../types";

/**
 * Appointment confirmation from backend
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
 * Message acknowledgment status
 */
export type MessageAckStatus = "received" | "delivered" | "failed";

/**
 * Message acknowledgment event
 */
export interface MessageAck {
  messageId: string;
  status: MessageAckStatus;
  timestamp?: string;
  error?: string;
}

/**
 * Transport event callbacks
 */
export interface TransportCallbacks {
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
  /** Called when slots are available */
  onSlots?: (date: string, slots: string[]) => void;
  /** Called when appointment is confirmed */
  onConfirmation?: (confirmation: AppointmentConfirmation) => void;
  /** Legacy: Called for non-streaming messages */
  onMessage?: (message: string) => void;
  /** Called when message delivery is acknowledged */
  onMessageAck?: (ack: MessageAck) => void;
  /** Connection lifecycle callbacks */
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event | Error) => void;
  onMaxRetriesReached?: () => void;
}

/**
 * Transport configuration options
 */
export interface TransportOptions extends TransportCallbacks {
  sessionId: string;
  maxReconnectAttempts?: number;
  reconnectDelay?: number;
}

/**
 * Circuit breaker state
 */
export type TransportCircuitBreakerState = "CLOSED" | "OPEN" | "HALF_OPEN";

/**
 * Circuit breaker statistics
 */
export interface TransportCircuitBreakerStats {
  state: TransportCircuitBreakerState;
  failures: number;
  successes: number;
  lastFailureTime: number | null;
  lastStateChange: number;
}

/**
 * Transport interface - all transport implementations must conform to this
 */
export interface Transport {
  /** Send a message through the transport with optional message ID for acknowledgment */
  sendMessage: (message: string, messageId?: string) => void;
  /** Current connection status */
  connectionStatus: ConnectionStatus;
  /** Manually trigger reconnection */
  reconnect: () => void;
  /** Cleanup resources */
  disconnect: () => void;
  /** Circuit breaker state (optional, for transports with circuit breaker) */
  readonly circuitBreakerState?: TransportCircuitBreakerState;
  /** Circuit breaker statistics (optional) */
  readonly circuitBreakerStats?: TransportCircuitBreakerStats;
  /** Reset circuit breaker (optional) */
  resetCircuitBreaker?: () => void;
}

/**
 * Transport type enum
 */
export type TransportType = "websocket" | "socketio" | "agui";

/**
 * Base transport configuration
 */
interface BaseTransportConfig {
  /** Transport type */
  type: TransportType;
  /** Server URL */
  url: string;
  /** Session ID (optional - auto-generated if not provided) */
  sessionId?: string;
  /** Max reconnection attempts */
  maxReconnectAttempts?: number;
  /** Delay between reconnection attempts (ms) */
  reconnectDelay?: number;
}

/**
 * WebSocket transport configuration
 */
export interface WebSocketTransportConfig extends BaseTransportConfig {
  type: "websocket";
}

/**
 * Socket.IO transport configuration (for InboxAI)
 */
export interface SocketIOTransportConfig extends BaseTransportConfig {
  type: "socketio";
  /** Tenant ID for InboxAI */
  tenantId: string;
  /** Namespace (optional) */
  namespace?: string;
}

/**
 * AG-UI transport configuration (SSE streaming)
 */
export interface AGUITransportConfig extends BaseTransportConfig {
  type: "agui";
  /** Auth token */
  authToken?: string;
}

/**
 * Union type for all transport configurations
 */
export type TransportConfig =
  | WebSocketTransportConfig
  | SocketIOTransportConfig
  | AGUITransportConfig;

/**
 * Floating widget position
 */
export type FloatingPosition =
  | "bottom-right"
  | "bottom-left"
  | "top-right"
  | "top-left";

/**
 * Floating mode configuration
 */
export interface FloatingConfig {
  /** Position of the floating launcher */
  position?: FloatingPosition;
  /** Show unread message badge */
  showBadge?: boolean;
  /** Initial open state */
  defaultOpen?: boolean;
  /** Custom launcher icon URL */
  launcherIcon?: string;
  /** Offset from edges (px) */
  offset?: {
    x?: number;
    y?: number;
  };
  /** Z-index for floating elements */
  zIndex?: number;
}

/**
 * Widget display mode
 */
export type WidgetMode = "embedded" | "floating";
