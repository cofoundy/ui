// Main exports

// Chat Widget
export { ChatWidget } from "./components/chat-widget";
export type { ChatWidgetConfig } from "./types";

// UI Components
export { Button, buttonVariants } from "./components/ui";
export { Input } from "./components/ui";
export { Avatar, AvatarImage, AvatarFallback } from "./components/ui";

// Hooks
export { useWebSocket } from "./hooks";
export type { UseWebSocketOptions, UseWebSocketReturn } from "./hooks";
export { useSession } from "./hooks";
export type { UseSessionOptions } from "./hooks";

// Store
export { useChatStore } from "./stores/chatStore";

// Types
export type {
  Message,
  TimeSlot,
  Appointment,
  QuickAction,
  ConnectionStatus,
  ChatState,
  Session,
  AuthStatus,
  ApiResponse,
} from "./types";

// Utils
export { cn } from "./utils/cn";
