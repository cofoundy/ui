/**
 * IIFE Entry Point for Cofoundy Chat Widget
 *
 * This file is the entry point for building a standalone IIFE bundle
 * that can be embedded on any website via a <script> tag.
 *
 * Usage:
 * <script>
 *   window.cofoundyChatConfig = {
 *     transport: { type: 'socketio', url: 'https://api.example.com', tenantId: 'ten_xxx' },
 *     theme: { primaryColor: '#2984AD', brandName: 'My Company' },
 *     floating: { position: 'bottom-right' },
 *     greeting: { id: '1', role: 'assistant', content: 'Hello!', timestamp: new Date() }
 *   };
 * </script>
 * <script src="https://cdn.cofoundy.dev/chat-widget.iife.js"></script>
 */

import React from "react";
import { createRoot } from "react-dom/client";
import { ChatWidgetFloating } from "../components/chat-widget/ChatWidgetFloating";
import type { ChatWidgetConfig, Message } from "../types";

// Import styles
import "../styles/index.css";

/**
 * Widget configuration from window.cofoundyChatConfig
 */
interface WidgetGlobalConfig {
  transport?: {
    type: "websocket" | "socketio";
    url: string;
    tenantId?: string;
    sessionId?: string;
  };
  theme?: {
    primaryColor?: string;
    brandName?: string;
    brandLogo?: string;
    brandSubtitle?: string;
  };
  floating?: {
    position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
    showBadge?: boolean;
    defaultOpen?: boolean;
    offset?: { x?: number; y?: number };
    zIndex?: number;
  };
  greeting?: {
    id?: string;
    content: string;
  };
  quickActions?: Array<{
    id: string;
    label: string;
    message: string;
  }>;
  session?: {
    newSessionOnReload?: boolean;
    storageKey?: string;
  };
  // Callbacks (optional, for advanced usage)
  onReady?: () => void;
  onOpenChange?: (open: boolean) => void;
  onMessageSent?: (message: string) => void;
}

declare global {
  interface Window {
    cofoundyChatConfig?: WidgetGlobalConfig;
    CofoundyChat?: {
      init: (config: WidgetGlobalConfig) => void;
      destroy: () => void;
    };
  }
}

// Container element for the widget
let widgetContainer: HTMLDivElement | null = null;
let widgetRoot: ReturnType<typeof createRoot> | null = null;

/**
 * Convert global config to ChatWidgetConfig
 */
function convertConfig(globalConfig: WidgetGlobalConfig): ChatWidgetConfig {
  const config: ChatWidgetConfig = {
    mode: "floating",
    floating: {
      position: globalConfig.floating?.position ?? "bottom-right",
      showBadge: globalConfig.floating?.showBadge ?? true,
      defaultOpen: globalConfig.floating?.defaultOpen ?? false,
      offset: globalConfig.floating?.offset,
      zIndex: globalConfig.floating?.zIndex ?? 9999,
    },
    theme: {
      brandName: globalConfig.theme?.brandName ?? "Chat",
      brandLogo: globalConfig.theme?.brandLogo,
      brandSubtitle: globalConfig.theme?.brandSubtitle,
      primaryColor: globalConfig.theme?.primaryColor ?? "#2984AD",
    },
    session: globalConfig.session,
    quickActions: globalConfig.quickActions,
    onOpenChange: globalConfig.onOpenChange,
    onMessageSent: globalConfig.onMessageSent,
  };

  // Set transport config
  if (globalConfig.transport) {
    if (globalConfig.transport.type === "socketio") {
      config.transport = {
        type: "socketio",
        url: globalConfig.transport.url,
        tenantId: globalConfig.transport.tenantId ?? "",
        sessionId: globalConfig.transport.sessionId,
      };
    } else {
      config.transport = {
        type: "websocket",
        url: globalConfig.transport.url,
        sessionId: globalConfig.transport.sessionId,
      };
    }
  }

  // Set greeting message
  if (globalConfig.greeting) {
    config.greeting = {
      id: globalConfig.greeting.id ?? "greeting-1",
      role: "assistant",
      content: globalConfig.greeting.content,
      timestamp: new Date(),
    } as Message;
  }

  return config;
}

/**
 * Initialize the chat widget
 */
function init(config: WidgetGlobalConfig) {
  // Destroy existing instance if any
  destroy();

  // Create container
  widgetContainer = document.createElement("div");
  widgetContainer.id = "cofoundy-chat-widget-root";
  document.body.appendChild(widgetContainer);

  // Convert config
  const widgetConfig = convertConfig(config);

  // Create React root and render
  widgetRoot = createRoot(widgetContainer);
  widgetRoot.render(
    <React.StrictMode>
      <ChatWidgetFloating {...widgetConfig} />
    </React.StrictMode>
  );

  // Call onReady callback
  config.onReady?.();
}

/**
 * Destroy the chat widget
 */
function destroy() {
  if (widgetRoot) {
    widgetRoot.unmount();
    widgetRoot = null;
  }
  if (widgetContainer) {
    widgetContainer.remove();
    widgetContainer = null;
  }
}

// Expose global API
window.CofoundyChat = {
  init,
  destroy,
};

// Auto-initialize if config is present
if (typeof window !== "undefined" && window.cofoundyChatConfig) {
  // Wait for DOM to be ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      init(window.cofoundyChatConfig!);
    });
  } else {
    init(window.cofoundyChatConfig);
  }
}

// Also support legacy InboxAI config format for backwards compatibility
declare global {
  interface Window {
    inboxaiConfig?: {
      tenantId: string;
      apiUrl: string;
      socketUrl?: string;
      primaryColor?: string;
      title?: string;
      subtitle?: string;
      position?: string;
    };
    InboxAI?: {
      init: (config: unknown) => void;
    };
  }
}

// Legacy InboxAI compatibility layer
if (typeof window !== "undefined") {
  window.InboxAI = {
    init: (legacyConfig: unknown) => {
      const config = legacyConfig as Window["inboxaiConfig"];
      if (!config) return;

      const modernConfig: WidgetGlobalConfig = {
        transport: {
          type: "socketio",
          url: config.socketUrl ?? config.apiUrl,
          tenantId: config.tenantId,
        },
        theme: {
          primaryColor: config.primaryColor,
          brandName: config.title,
          brandSubtitle: config.subtitle,
        },
        floating: {
          position:
            (config.position as "bottom-right" | "bottom-left") ?? "bottom-right",
        },
      };

      init(modernConfig);
    },
  };

  // Auto-init with legacy config if present
  if (window.inboxaiConfig && !window.cofoundyChatConfig) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => {
        window.InboxAI?.init(window.inboxaiConfig);
      });
    } else {
      window.InboxAI.init(window.inboxaiConfig);
    }
  }
}
