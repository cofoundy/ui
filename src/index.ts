// @cofoundy/ui - Shared UI Components & Chat Widget

// Chat Widget
export { ChatWidget } from "./components/chat-widget/index.js";
export {
  ChatWidgetFloating,
  FloatingChatWidget,
  FloatingLauncher,
  FloatingWindow,
} from "./components/chat-widget/index.js";
export type {
  ChatWidgetFloatingProps,
  FloatingLauncherProps,
  FloatingWindowProps,
} from "./components/chat-widget/index.js";
export type { ChatWidgetConfig } from "./types";

// Transport types
export type {
  TransportConfig,
  WebSocketTransportConfig,
  SocketIOTransportConfig,
  AGUITransportConfig,
  TransportType,
  TransportCallbacks,
  Transport,
  FloatingConfig,
  FloatingPosition,
  WidgetMode,
  AppointmentConfirmation,
} from "./transports/index.js";
export { createWebSocketTransport } from "./transports/index.js";

// UI Components
export { Button, buttonVariants } from "./components/ui/index.js";
export { CalendlyButton, calendlyButtonVariants } from "./components/ui/index.js";
export type { CalendlyButtonProps } from "./components/ui/index.js";
export { Input } from "./components/ui/index.js";
export { Avatar, AvatarImage, AvatarFallback } from "./components/ui/index.js";
export { Spinner, spinnerVariants } from "./components/ui/index.js";
export { Toaster, toast } from "./components/ui/index.js";
export { Switch } from "./components/ui/index.js";
export { Badge, badgeVariants } from "./components/ui/index.js";
export { ChannelBadge, channelBadgeVariants } from "./components/ui/index.js";
export type { ChannelBadgeProps } from "./components/ui/index.js";
export { Tabs, TabsList, TabsTrigger, TabsContent } from "./components/ui/index.js";
export { Logo, logoVariants } from "./components/ui/index.js";
export { ThemeSwitcher, themeSwitcherVariants } from "./components/ui/index.js";

// Sidebar system components
export { Separator } from "./components/ui/index.js";
export { Skeleton } from "./components/ui/index.js";
export { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "./components/ui/index.js";
export { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./components/ui/index.js";
export {
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "./components/ui/index.js";
export {
  Sheet,
  SheetPortal,
  SheetOverlay,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
  sheetVariants,
} from "./components/ui/index.js";
export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
  sidebarMenuButtonVariants,
} from "./components/ui/index.js";
export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
} from "./components/ui/index.js";

// Messaging Components (Primitives)
export {
  MessageContainer,
  MessageBubble,
  messageBubbleVariants,
  type MessageBubbleProps,
  MessageAvatar,
  MessageTimestamp,
  type TimestampFormat,
  MessageStatus,
  MessageContent,
  MessageMedia,
} from "./components/messaging/index.js";

// Messaging Components (Indicators)
export { AIBadge } from "./components/messaging/index.js";

// Messaging Components (Composed)
export {
  InboxMessage,
  type InboxMessageProps,
  InboxMessageList,
  type InboxMessageListProps,
} from "./components/messaging/index.js";

// Messaging Components (Inputs)
export {
  MessageComposer,
  type MessageComposerProps,
  type QuickAction as ComposerQuickAction,
} from "./components/messaging/index.js";

// Hooks
export { useWebSocket } from "./hooks/index.js";
export type { UseWebSocketOptions, UseWebSocketReturn } from "./hooks/index.js";
export { useChatTransport, createTransportConfigFromUrl } from "./hooks/index.js";
export type { UseChatTransportOptions, UseChatTransportReturn } from "./hooks/index.js";
export { useSession } from "./hooks/index.js";
export type { UseSessionOptions } from "./hooks/index.js";
export { useAutoScroll } from "./hooks/index.js";
export type { UseAutoScrollOptions, UseAutoScrollReturn } from "./hooks/index.js";
export { useIsMobile } from "./hooks/index.js";
export { useAGUI, AGUIEventType } from "./hooks/index.js";
export type {
  UseAGUIOptions,
  UseAGUIReturn,
  AGUIEvent,
  ToolCallState,
  RunState,
  RunStatus,
} from "./hooks/index.js";

// Store
export { useChatStore } from "./stores/chatStore";

// Services
export {
  MessageQueue,
  getMessageQueue,
  generateMessageId,
  type QueuedMessage,
  type QueueMessageStatus,
  type MessageQueueConfig,
} from "./services/index.js";

// Circuit Breaker
export {
  CircuitBreaker,
  CircuitBreakerOpenError,
  createCircuitBreaker,
  type CircuitBreakerState,
  type CircuitBreakerConfig,
  type CircuitBreakerStats,
  type CircuitBreakerListener,
} from "./transports/index.js";

// Connection Metrics
export {
  ConnectionMetricsCollector,
  getMetricsCollector,
  createMetricsCollector,
  type ConnectionMetrics,
  type MetricsEvent,
  type MetricsListener,
} from "./transports/index.js";

// Types (Chat Widget)
export type {
  Message,
  MessageSendStatus,
  TimeSlot,
  Appointment,
  QuickAction,
  ConnectionStatus,
  ChatState,
  Session,
  AuthStatus,
  ApiResponse,
} from "./types";

// Types (Universal Messaging)
export type {
  UniversalMessage,
  MediaAttachment,
  MessageSender,
  DeliveryStatus,
  SenderType,
  ContentFormat,
  MessageDirection,
  MediaType,
  ToolExecution,
  MessageGroup,
} from "./types/message";

// Navigation Components
export {
  NavDropdown,
  navDropdownVariants,
  type NavDropdownProps,
  type NavDropdownItem,
  type FeaturedEffect,
} from "./components/navigation/index.js";

// Effect Components
export {
  ShimmerText,
  type ShimmerTextProps,
  GradientBorder,
  type GradientBorderProps,
} from "./components/effects/index.js";

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
