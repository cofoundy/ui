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
 * @returns Tailwind class string for background and text color using CSS variables
 */
export function getChannelColor(channel: string): string {
  const colorMap: Record<string, string> = {
    telegram: "bg-[var(--channel-telegram)]/20 text-[var(--channel-telegram)]",
    whatsapp: "bg-[var(--channel-whatsapp)]/20 text-[var(--channel-whatsapp)]",
    email: "bg-[var(--channel-email)]/20 text-[var(--channel-email)]",
    web_chat: "bg-[var(--channel-webchat)]/20 text-[var(--channel-webchat)]",
    webchat: "bg-[var(--channel-webchat)]/20 text-[var(--channel-webchat)]",
    instagram: "bg-[var(--channel-instagram)]/20 text-[var(--channel-instagram)]",
    messenger: "bg-[var(--channel-messenger)]/20 text-[var(--channel-messenger)]",
    sms: "bg-[var(--channel-sms)]/20 text-[var(--channel-sms)]",
  };
  return colorMap[channel.toLowerCase()] || "bg-[var(--muted)]/20 text-[var(--muted-foreground)]";
}
