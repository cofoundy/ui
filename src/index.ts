// Main exports

// Chat Widget
export { ChatWidget } from "./components/chat-widget";
export type { ChatWidgetConfig } from "./types";

// UI Components
export { Button, buttonVariants } from "./components/ui";
export { Input } from "./components/ui";
export { Avatar, AvatarImage, AvatarFallback } from "./components/ui";
export { Spinner, spinnerVariants } from "./components/ui";
export { Toast, toastVariants } from "./components/ui";
export { Switch } from "./components/ui";
export { Badge, badgeVariants } from "./components/ui";
export { SearchInput } from "./components/ui";
export { Tabs, TabsList, TabsTrigger, TabsContent } from "./components/ui";

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
export { getInitials, truncate, capitalize, toTitleCase } from "./utils/string";
export {
  getChannelBadgeVariant,
  getChannelIcon,
  getChannelDisplayName,
  getChannelColor,
  type ChannelType,
} from "./utils/channel";
