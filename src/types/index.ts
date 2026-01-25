// Import transport types for local use
import type {
  TransportConfig as TransportConfigType,
  FloatingConfig as FloatingConfigType,
  WidgetMode as WidgetModeType,
} from '../transports/types';

// Re-export transport types
export type {
  TransportConfig,
  WebSocketTransportConfig,
  SocketIOTransportConfig,
  AGUITransportConfig,
  TransportType,
  TransportCallbacks,
  TransportOptions,
  Transport,
  FloatingConfig,
  FloatingPosition,
  WidgetMode,
  AppointmentConfirmation,
} from '../transports/types';

// Message send status for optimistic UI
export type MessageSendStatus = 'sending' | 'sent' | 'delivered' | 'failed';

// Chat message types
export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'tool';
  content: string;
  timestamp: Date;
  // Send status for user messages (optimistic UI)
  sendStatus?: MessageSendStatus;
  // Tool indicator fields (for role='tool')
  toolName?: string;
  toolIcon?: string;
  toolStatus?: 'running' | 'success' | 'error';
}

// Session types
export interface Session {
  id: string;
  createdAt: Date;
  isAuthenticated: boolean;
  userEmail?: string;
}

// WebSocket connection status
export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

// Time slot for scheduling
export interface TimeSlot {
  date: string;
  time: string;
  available: boolean;
}

// Appointment confirmation
export interface Appointment {
  id: string;
  date: string;
  time: string;
  topic: string;
  attendees: string[];
  confirmed: boolean;
}

// Auth status response
export interface AuthStatus {
  authenticated: boolean;
  email?: string;
  calendarConnected?: boolean;
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Chat store state
export interface ChatState {
  messages: Message[];
  isTyping: boolean;
  isConnected: boolean;
  connectionStatus: ConnectionStatus;
  sessionId: string;
  suggestedSlots: TimeSlot[];
  confirmedAppointment: Appointment | null;

  // Streaming state
  streamingMessageId: string | null;
  isStreaming: boolean;

  // Tool indicator state
  activeToolId: string | null;

  // Actions
  addMessage: (message: Message) => void;
  updateMessageStatus: (messageId: string, status: MessageSendStatus) => void;
  setTyping: (typing: boolean) => void;
  setConnected: (connected: boolean) => void;
  setConnectionStatus: (status: ConnectionStatus) => void;
  setSessionId: (id: string) => void;
  setSuggestedSlots: (slots: TimeSlot[]) => void;
  setConfirmedAppointment: (appointment: Appointment | null) => void;
  clearMessages: () => void;
  reset: () => void;

  // Streaming actions
  startStreaming: (messageId: string) => void;
  appendToken: (token: string) => void;
  finishStreaming: () => void;
  endCurrentMessage: () => void;

  // Tool indicator actions
  startTool: (toolName: string, icon: string, text: string) => void;
  endTool: (toolName: string, success: boolean) => void;
}

// Auth store state
export interface AuthState {
  isAuthenticated: boolean;
  userEmail: string | null;
  isLoading: boolean;

  // Actions
  setAuthenticated: (authenticated: boolean, email?: string) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

// Quick action button
export interface QuickAction {
  id: string;
  label: string;
  message: string;
}

// ChatWidget configuration
export interface ChatWidgetConfig {
  /**
   * @deprecated Use `transport` prop instead
   * WebSocket server URL (e.g., "wss://api.timelyai.com")
   */
  websocketUrl?: string;

  /**
   * Transport configuration (new API)
   * If not provided, falls back to websocketUrl
   */
  transport?: TransportConfigType;

  /**
   * Widget display mode
   * - 'embedded': Renders inline within container (default)
   * - 'floating': Renders as floating button + popup window
   */
  mode?: WidgetModeType;

  /**
   * Floating mode configuration (only used when mode='floating')
   */
  floating?: FloatingConfigType;

  /** API URL for auth endpoints (optional) */
  apiUrl?: string;

  /** Initial greeting message */
  greeting?: Message;

  /** Quick actions to show before first user message */
  quickActions?: QuickAction[];

  /** Session configuration */
  session?: {
    /** If true, creates new session on each page load. Default: true */
    newSessionOnReload?: boolean;
    /** Storage key prefix. Default: "cofoundy-chat" */
    storageKey?: string;
  };

  /** Styling configuration */
  theme?: {
    /** Container class names (merged with defaults) */
    containerClassName?: string;
    /** Header branding */
    brandName?: string;
    brandLogo?: string;
    brandSubtitle?: string;
    /** Primary color for theming */
    primaryColor?: string;
  };

  /** Callbacks */
  onAppointmentConfirmed?: (appointment: Appointment) => void;
  onConnectionStatusChange?: (status: ConnectionStatus) => void;
  onMessageSent?: (message: string) => void;
  onMaxRetriesReached?: () => void;
  /** Called when floating widget opens/closes */
  onOpenChange?: (open: boolean) => void;
}
