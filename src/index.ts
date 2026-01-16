// @cofoundy/ui - Shared UI Components & Chat Widget

// Chat Widget
export { ChatWidget } from "./components/chat-widget";
export type { ChatWidgetConfig } from "./types";

// UI Components
export { Button, buttonVariants } from "./components/ui";
export { Input } from "./components/ui";
export { Avatar, AvatarImage, AvatarFallback } from "./components/ui";
export { Spinner, spinnerVariants } from "./components/ui";
export { Toaster, toast } from "./components/ui";
export { Switch } from "./components/ui";
export { Badge, badgeVariants } from "./components/ui";
export { Tabs, TabsList, TabsTrigger, TabsContent } from "./components/ui";
export { Logo, logoVariants } from "./components/ui";
export { ThemeSwitcher, themeSwitcherVariants } from "./components/ui";

// Sidebar system components
export { Separator } from "./components/ui";
export { Skeleton } from "./components/ui";
export { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "./components/ui";
export { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./components/ui";
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
} from "./components/ui";
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
} from "./components/ui";
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
} from "./components/ui";
export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
} from "./components/ui";

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
} from "./components/messaging";

// Messaging Components (Indicators)
export { AIBadge } from "./components/messaging";

// Messaging Components (Composed)
export {
  InboxMessage,
  type InboxMessageProps,
  InboxMessageList,
  type InboxMessageListProps,
} from "./components/messaging";

// Messaging Components (Inputs)
export {
  MessageComposer,
  type MessageComposerProps,
  type QuickAction as ComposerQuickAction,
} from "./components/messaging";

// Hooks
export { useWebSocket } from "./hooks";
export type { UseWebSocketOptions, UseWebSocketReturn } from "./hooks";
export { useSession } from "./hooks";
export type { UseSessionOptions } from "./hooks";
export { useAutoScroll } from "./hooks";
export type { UseAutoScrollOptions, UseAutoScrollReturn } from "./hooks";
export { useIsMobile } from "./hooks";

// Store
export { useChatStore } from "./stores/chatStore";

// Types (Chat Widget)
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
