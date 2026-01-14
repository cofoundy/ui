"use client";

import { useState, useEffect, useCallback } from "react";

export interface UseSessionOptions {
  /**
   * If true, generates a new session ID on each page load.
   * If false, persists the session ID across reloads using localStorage.
   * @default true
   */
  newSessionOnReload?: boolean;
  /**
   * Storage key prefix for the session ID.
   * @default "cofoundy-chat"
   */
  storageKey?: string;
}

/**
 * Hook for managing session IDs.
 * By default, generates a new UUID on each page load for unique sessions.
 * Can be configured to persist sessions across reloads.
 */
export function useSession(options: UseSessionOptions = {}) {
  const { newSessionOnReload = true, storageKey = "cofoundy-chat" } = options;
  const [sessionId, setSessionId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  const fullKey = `${storageKey}-session-id`;

  useEffect(() => {
    setIsLoading(true);

    if (newSessionOnReload) {
      // Always generate new session on page load
      const newId = crypto.randomUUID();
      setSessionId(newId);
      // Store in sessionStorage (survives only current tab)
      sessionStorage.setItem(fullKey, newId);
    } else {
      // Persist across reloads using localStorage
      const stored = localStorage.getItem(fullKey);
      if (stored) {
        setSessionId(stored);
      } else {
        const newId = crypto.randomUUID();
        localStorage.setItem(fullKey, newId);
        setSessionId(newId);
      }
    }

    setIsLoading(false);
  }, [newSessionOnReload, fullKey]);

  const resetSession = useCallback(() => {
    const newId = crypto.randomUUID();
    setSessionId(newId);

    if (newSessionOnReload) {
      sessionStorage.setItem(fullKey, newId);
    } else {
      localStorage.setItem(fullKey, newId);
    }

    return newId;
  }, [newSessionOnReload, fullKey]);

  return {
    sessionId,
    isLoading,
    resetSession,
  };
}
