// @cofoundy/ui - Shared UI Components & Chat Widget

// Chat Widget
export { ChatWidget } from "./components/chat-widget/index";
export {
  ChatWidgetFloating,
  FloatingChatWidget,
  FloatingLauncher,
  FloatingWindow,
} from "./components/chat-widget/index";
export type {
  ChatWidgetFloatingProps,
  FloatingLauncherProps,
  FloatingWindowProps,
} from "./components/chat-widget/index";
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
} from "./transports/index";
export { createWebSocketTransport } from "./transports/index";

// UI Components
export { Button, buttonVariants } from "./components/ui/index";
export { CalendlyButton, calendlyButtonVariants } from "./components/ui/index";
export type { CalendlyButtonProps } from "./components/ui/index";
export { Input } from "./components/ui/index";
export { Avatar, AvatarImage, AvatarFallback } from "./components/ui/index";
export { Spinner, spinnerVariants } from "./components/ui/index";
export { Toaster, toast } from "./components/ui/index";
export { Switch } from "./components/ui/index";
export { Badge, badgeVariants } from "./components/ui/index";
export { ChannelBadge, channelBadgeVariants } from "./components/ui/index";
export type { ChannelBadgeProps } from "./components/ui/index";
export { Tabs, TabsList, TabsTrigger, TabsContent } from "./components/ui/index";
export { Logo, logoVariants } from "./components/ui/index";
export { ThemeSwitcher, themeSwitcherVariants } from "./components/ui/index";

// Sidebar system components
export { Separator } from "./components/ui/index";
export { Skeleton } from "./components/ui/index";
export { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "./components/ui/index";
export { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./components/ui/index";
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
} from "./components/ui/index";
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
} from "./components/ui/index";
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
} from "./components/ui/index";
export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
} from "./components/ui/index";

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
} from "./components/messaging/index";

// Messaging Components (Indicators)
export { AIBadge } from "./components/messaging/index";

// Messaging Components (Composed)
export {
  InboxMessage,
  type InboxMessageProps,
  InboxMessageList,
  type InboxMessageListProps,
} from "./components/messaging/index";

// Messaging Components (Inputs)
export {
  MessageComposer,
  type MessageComposerProps,
  type QuickAction as ComposerQuickAction,
} from "./components/messaging/index";

// Hooks
export { useWebSocket } from "./hooks/index";
export type { UseWebSocketOptions, UseWebSocketReturn } from "./hooks/index";
export { useChatTransport, createTransportConfigFromUrl } from "./hooks/index";
export type { UseChatTransportOptions, UseChatTransportReturn } from "./hooks/index";
export { useSession } from "./hooks/index";
export type { UseSessionOptions } from "./hooks/index";
export { useAutoScroll } from "./hooks/index";
export type { UseAutoScrollOptions, UseAutoScrollReturn } from "./hooks/index";
export { useIsMobile } from "./hooks/index";
export { useAGUI, AGUIEventType } from "./hooks/index";
export type {
  UseAGUIOptions,
  UseAGUIReturn,
  AGUIEvent,
  ToolCallState,
  RunState,
  RunStatus,
} from "./hooks/index";

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
} from "./services/index";

// Circuit Breaker
export {
  CircuitBreaker,
  CircuitBreakerOpenError,
  createCircuitBreaker,
  type CircuitBreakerState,
  type CircuitBreakerConfig,
  type CircuitBreakerStats,
  type CircuitBreakerListener,
} from "./transports/index";

// Connection Metrics
export {
  ConnectionMetricsCollector,
  getMetricsCollector,
  createMetricsCollector,
  type ConnectionMetrics,
  type MetricsEvent,
  type MetricsListener,
} from "./transports/index";

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
} from "./components/navigation/index";

// Effect Components
export {
  ShimmerText,
  type ShimmerTextProps,
  GradientBorder,
  type GradientBorderProps,
} from "./components/effects/index";

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
