// @cofoundy/ui - Shared UI Components
// For the embeddable chat widget, use @cofoundy/chat-widget

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
