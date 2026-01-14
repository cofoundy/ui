import type { VariantProps } from "class-variance-authority";
import type { badgeVariants } from "../components/ui/badge";

type BadgeVariant = VariantProps<typeof badgeVariants>["variant"];

/**
 * Channel types supported by Cofoundy products
 */
export type ChannelType =
  | "telegram"
  | "whatsapp"
  | "email"
  | "web_chat"
  | "webchat"
  | "instagram"
  | "messenger"
  | "sms";

/**
 * Get the badge variant for a channel type
 * @param channel - Channel type string
 * @returns Badge variant name for use with Badge component
 * @example getChannelBadgeVariant("telegram") // "telegram"
 */
export function getChannelBadgeVariant(channel: string): BadgeVariant {
  const variantMap: Record<string, BadgeVariant> = {
    telegram: "telegram",
    whatsapp: "whatsapp",
    email: "email",
    web_chat: "webchat",
    webchat: "webchat",
    instagram: "instagram",
    messenger: "messenger",
    sms: "sms",
  };
  return variantMap[channel.toLowerCase()] || "default";
}

/**
 * Get a single-letter icon representation for a channel
 * @param channel - Channel type string
 * @returns Single uppercase letter representing the channel
 * @example getChannelIcon("telegram") // "T"
 */
export function getChannelIcon(channel: string): string {
  const iconMap: Record<string, string> = {
    telegram: "T",
    whatsapp: "W",
    email: "@",
    web_chat: "C",
    webchat: "C",
    instagram: "I",
    messenger: "M",
    sms: "S",
  };
  return iconMap[channel.toLowerCase()] || "?";
}

/**
 * Get a human-readable display name for a channel
 * @param channel - Channel type string
 * @returns Formatted channel name
 * @example getChannelDisplayName("web_chat") // "Web Chat"
 */
export function getChannelDisplayName(channel: string): string {
  const nameMap: Record<string, string> = {
    telegram: "Telegram",
    whatsapp: "WhatsApp",
    email: "Email",
    web_chat: "Web Chat",
    webchat: "Web Chat",
    instagram: "Instagram",
    messenger: "Messenger",
    sms: "SMS",
  };
  return nameMap[channel.toLowerCase()] || channel;
}

/**
 * Get the color classes for a channel (legacy support)
 * @deprecated Use getChannelBadgeVariant with Badge component instead
 * @param channel - Channel type string
 * @returns Tailwind class string for background and text color
 */
export function getChannelColor(channel: string): string {
  const colorMap: Record<string, string> = {
    telegram: "bg-blue-500/20 text-blue-300",
    whatsapp: "bg-green-500/20 text-green-300",
    email: "bg-purple-500/20 text-purple-300",
    web_chat: "bg-cyan-500/20 text-cyan-300",
    webchat: "bg-cyan-500/20 text-cyan-300",
    instagram: "bg-pink-500/20 text-pink-300",
    messenger: "bg-indigo-500/20 text-indigo-300",
    sms: "bg-gray-500/20 text-gray-300",
  };
  return colorMap[channel.toLowerCase()] || "bg-gray-500/20 text-gray-300";
}
