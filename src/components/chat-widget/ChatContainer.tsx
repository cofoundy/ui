"use client";

import { ReactNode, useMemo, useEffect, useState } from "react";
import { cn } from "../../utils/cn";

export type ChatTheme = "dark" | "light" | "system";

interface ChatContainerProps {
  children: ReactNode;
  className?: string;
  /** Theme for the chat widget. Defaults to "dark" */
  theme?: ChatTheme;
}

function useResolvedTheme(theme: ChatTheme): "dark" | "light" {
  const [systemTheme, setSystemTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    if (theme !== "system") return;

    // Check initial system preference
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    setSystemTheme(mediaQuery.matches ? "dark" : "light");

    // Listen for changes
    const handler = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? "dark" : "light");
    };
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, [theme]);

  if (theme === "system") {
    return systemTheme;
  }
  return theme;
}

export function ChatContainer({
  children,
  className,
  theme = "dark",
}: ChatContainerProps) {
  const resolvedTheme = useResolvedTheme(theme);

  return (
    <div
      data-theme={resolvedTheme}
      className={cn(
        "w-full h-full",
        "chat-glass-card",
        "flex flex-col",
        "overflow-hidden", // Constrain children so MessageList scrolls
        "chat-animate-fade-in",
        className
      )}
    >
      {children}
    </div>
  );
}
