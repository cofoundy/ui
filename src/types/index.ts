// Chat message types
export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'tool';
  content: string;
  timestamp: Date;
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
  /** WebSocket server URL (e.g., "wss://api.timelyai.com") */
  websocketUrl: string;

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
  };

  /** Callbacks */
  onAppointmentConfirmed?: (appointment: Appointment) => void;
  onConnectionStatusChange?: (status: ConnectionStatus) => void;
  onMessageSent?: (message: string) => void;
  onMaxRetriesReached?: () => void;
}
