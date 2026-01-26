"use client";

import { useEffect, useCallback, useState, useRef } from "react";
import { MessageCircle } from "lucide-react";

import { ChatContainer } from "./ChatContainer";
import { ChatHeader } from "./ChatHeader";
import { ChatInput } from "./ChatInput";
import { MessageList } from "./MessageList";
import { QuickActions } from "./QuickActions";
import { TimeSlotGrid } from "./TimeSlotGrid";
import { ConfirmationCard } from "./ConfirmationCard";

import { useSession } from "../../hooks/useSession";
import { useChatTransport, createTransportConfigFromUrl } from "../../hooks/useChatTransport";
import { useChatStore } from "../../stores/chatStore";
import { getMessageQueue, generateMessageId } from "../../services/messageQueue";
import type {
  Message,
  TimeSlot,
  Appointment,
  QuickAction,
  ChatWidgetConfig,
  TransportConfig,
  AppointmentConfirmation,
  MessageSendStatus,
} from "../../types";
import type { MessageAck } from "../../transports/types";

// Use generateMessageId from services for consistent UUID generation
const generateId = generateMessageId;

// Convert date string from tool output to actual Date
function parseDateFromTool(dateStr: string): Date {
  const today = new Date();
  const lowerDate = dateStr.toLowerCase();

  if (lowerDate === "today" || lowerDate === "hoy") {
    return today;
  }
  if (lowerDate === "tomorrow" || lowerDate === "mañana") {
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  }

  const dayNames = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  const dayIndex = dayNames.findIndex((d) => lowerDate.includes(d));

  if (dayIndex !== -1) {
    const result = new Date(today);
    const currentDay = today.getDay();
    let daysToAdd = dayIndex - currentDay;
    if (daysToAdd <= 0) daysToAdd += 7;
    result.setDate(result.getDate() + daysToAdd);
    return result;
  }

  const parsed = new Date(dateStr);
  return isNaN(parsed.getTime()) ? today : parsed;
}


/**
 * ChatWidget - Unified chat widget supporting multiple transports and modes.
 *
 * Supports:
 * - Embedded mode (default): Renders inline within container
 * - Floating mode: Renders as floating button + popup (use ChatWidgetFloating)
 *
 * Transports:
 * - WebSocket (default): For TimelyAI backend
 * - Socket.IO: For InboxAI backend
 * - AG-UI: For SSE streaming
 */
export function ChatWidget({
  websocketUrl,
  transport,
  mode = "embedded",
  greeting,
  quickActions = [],
  session = {},
  theme = {},
  onAppointmentConfirmed,
  onConnectionStatusChange,
  onMessageSent,
  onMaxRetriesReached,
}: ChatWidgetConfig) {
  const { newSessionOnReload = true, storageKey = "cofoundy-chat" } = session;
  const {
    containerClassName,
    brandName = "Cofoundy",
    brandLogo,
    brandSubtitle,
  } = theme;

  // Session management
  const { sessionId, isLoading: sessionLoading, resetSession } = useSession({
    newSessionOnReload,
    storageKey,
  });

  // Chat store
  const {
    messages,
    isTyping,
    connectionStatus,
    suggestedSlots,
    confirmedAppointment,
    streamingMessageId,
    isStreaming,
    activeToolId,
    addMessage,
    updateMessageStatus,
    setTyping,
    setConnectionStatus,
    setSuggestedSlots,
    setConfirmedAppointment,
    startStreaming,
    appendToken,
    finishStreaming,
    endCurrentMessage,
    startTool,
    endTool,
    clearMessages,
  } = useChatStore();

  // Initialize message queue
  const messageQueueRef = useRef(getMessageQueue());

  // Track if connection permanently failed
  const [connectionFailed, setConnectionFailed] = useState(false);

  // Ref to track current streaming message ID
  const streamingMessageIdRef = useRef<string | null>(null);

  // Ref to prevent duplicate greeting in React Strict Mode
  const greetingAddedRef = useRef(false);

  useEffect(() => {
    streamingMessageIdRef.current = streamingMessageId;
  }, [streamingMessageId]);

  // Initialize greeting on first mount only
  // IMPORTANT: Do NOT reset if messages already exist (preserves history on toggle)
  useEffect(() => {
    if (!greetingAddedRef.current) {
      greetingAddedRef.current = true;
      const currentMessages = useChatStore.getState().messages;

      // Only add greeting if no messages exist yet
      if (currentMessages.length === 0 && greeting) {
        addMessage(greeting);
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle streaming tokens
  const handleToken = useCallback(
    (content: string) => {
      if (!streamingMessageIdRef.current) {
        const msgId = generateId();
        streamingMessageIdRef.current = msgId;
        startStreaming(msgId);
      }

      if (content.includes("\n\n")) {
        const parts = content.split("\n\n");

        if (parts[0]) {
          appendToken(parts[0]);
        }

        for (let i = 1; i < parts.length; i++) {
          endCurrentMessage();

          const newMsgId = generateId();
          streamingMessageIdRef.current = newMsgId;
          startStreaming(newMsgId);

          if (parts[i]) {
            appendToken(parts[i]);
          }
        }
      } else {
        appendToken(content);
      }
    },
    [startStreaming, appendToken, endCurrentMessage]
  );

  // Handle stream completion
  // Note: Slots and confirmations now come via structured events (onSlots, onConfirmation)
  const handleStreamComplete = useCallback(() => {
    streamingMessageIdRef.current = null;
    finishStreaming();
  }, [finishStreaming]);

  // Handle streaming errors
  const handleStreamError = useCallback(() => {
    streamingMessageIdRef.current = null;
    finishStreaming();
  }, [finishStreaming]);

  // Handle message end
  const handleMessageEnd = useCallback(() => {
    streamingMessageIdRef.current = null;
    endCurrentMessage();
  }, [endCurrentMessage]);

  // Handle tool start/end
  const handleToolStart = useCallback(
    (tool: string, icon: string, text: string) => {
      startTool(tool, icon, text);
    },
    [startTool]
  );

  const handleToolEnd = useCallback(
    (tool: string, success: boolean) => {
      endTool(tool, success);
    },
    [endTool]
  );

  // Handle slots from tool output
  const handleSlots = useCallback(
    (date: string, slots: string[]) => {
      if (slots.length === 0) return;

      const actualDate = parseDateFromTool(date);
      const dateString = `${actualDate.getFullYear()}/${String(actualDate.getMonth() + 1).padStart(2, "0")}/${String(actualDate.getDate()).padStart(2, "0")}`;

      const timeSlots: TimeSlot[] = slots.map((time) => ({
        date: dateString,
        time: time.replace(/\s*-\d{2}$/, "").trim(),
        available: true,
      }));

      const currentSlots = useChatStore.getState().suggestedSlots;
      setSuggestedSlots([...currentSlots, ...timeSlots]);
    },
    [setSuggestedSlots]
  );

  // Handle confirmation from schedule_appointment tool
  const handleConfirmation = useCallback(
    (confirmation: AppointmentConfirmation) => {
      // Parse datetime to extract date and time
      const datetimeStr = confirmation.datetime;
      let date = new Date().toISOString().split("T")[0];
      let time = "Por confirmar";

      // Try to parse the datetime string
      if (datetimeStr) {
        // Try ISO format first
        const isoMatch = datetimeStr.match(/(\d{4}-\d{2}-\d{2})/);
        if (isoMatch) {
          date = isoMatch[1];
        }
        // Extract time (e.g., "2:00 PM", "14:00")
        const timeMatch = datetimeStr.match(/(\d{1,2}:\d{2}\s*(?:AM|PM)?)/i);
        if (timeMatch) {
          time = timeMatch[1];
        }
      }

      const appointment: Appointment = {
        id: generateId(),
        date,
        time,
        topic: confirmation.topic || "Consultoría",
        attendees: confirmation.client_email ? [confirmation.client_email] : [],
        confirmed: true,
      };

      setConfirmedAppointment(appointment);
      onAppointmentConfirmed?.(appointment);
    },
    [setConfirmedAppointment, onAppointmentConfirmed]
  );

  // Legacy message handler (for non-streaming complete messages)
  // Note: Slots and confirmations now come via structured events (onSlots, onConfirmation)
  const handleMessage = useCallback(
    (data: string) => {
      setTyping(false);

      const assistantMessage: Message = {
        id: generateId(),
        role: "assistant",
        content: data,
        timestamp: new Date(),
      };
      addMessage(assistantMessage);
    },
    [addMessage, setTyping]
  );

  // Connection callbacks
  const handleConnect = useCallback(() => {
    setConnectionStatus("connected");
    onConnectionStatusChange?.("connected");
  }, [setConnectionStatus, onConnectionStatusChange]);

  const handleDisconnect = useCallback(() => {
    setConnectionStatus("disconnected");
    onConnectionStatusChange?.("disconnected");
  }, [setConnectionStatus, onConnectionStatusChange]);

  const handleError = useCallback(() => {
    setConnectionStatus("error");
    onConnectionStatusChange?.("error");
  }, [setConnectionStatus, onConnectionStatusChange]);

  const handleMaxRetries = useCallback(() => {
    setConnectionFailed(true);
    onMaxRetriesReached?.();
  }, [onMaxRetriesReached]);

  // Handle message delivery acknowledgment
  const handleMessageAck = useCallback(
    async (ack: MessageAck) => {
      console.log("[ChatWidget] Message ack received:", ack);

      // Map ACK status to MessageSendStatus
      const statusMap: Record<string, MessageSendStatus> = {
        received: "sent",
        delivered: "delivered",
        failed: "failed",
      };
      const newStatus = statusMap[ack.status] || "sent";

      // Update message in UI
      updateMessageStatus(ack.messageId, newStatus);

      // Update message queue
      const messageQueue = messageQueueRef.current;
      try {
        if (ack.status === "delivered") {
          await messageQueue.markDelivered(ack.messageId);
        } else if (ack.status === "failed") {
          await messageQueue.markFailed(ack.messageId, ack.error || "Delivery failed");
        }
      } catch (error) {
        console.warn("[ChatWidget] Failed to update message queue:", error);
      }
    },
    [updateMessageStatus]
  );

  // Resolve transport config (support legacy websocketUrl)
  const resolvedTransport: TransportConfig = transport ?? createTransportConfigFromUrl(websocketUrl ?? "");

  // Transport connection (unified for WebSocket, Socket.IO, AG-UI)
  const { sendMessage, connectionStatus: wsStatus } = useChatTransport({
    config: resolvedTransport,
    sessionId,
    onToken: handleToken,
    onStreamComplete: handleStreamComplete,
    onStreamError: handleStreamError,
    onMessageEnd: handleMessageEnd,
    onToolStart: handleToolStart,
    onToolEnd: handleToolEnd,
    onSlots: handleSlots,
    onConfirmation: handleConfirmation,
    onMessage: handleMessage,
    onMessageAck: handleMessageAck,
    onConnect: handleConnect,
    onDisconnect: handleDisconnect,
    onError: handleError,
    onMaxRetriesReached: handleMaxRetries,
  });

  useEffect(() => {
    setConnectionStatus(wsStatus);
  }, [wsStatus, setConnectionStatus]);

  // Flush pending messages when connection is restored
  useEffect(() => {
    if (connectionStatus === "connected" && sessionId) {
      const flushPendingMessages = async () => {
        const messageQueue = messageQueueRef.current;
        try {
          await messageQueue.init();
          const result = await messageQueue.flush(sessionId, async (msg) => {
            try {
              sendMessage(msg.content);
              updateMessageStatus(msg.id, "sent");
              return true;
            } catch {
              return false;
            }
          });
          if (result.sent > 0) {
            console.log("[ChatWidget] Flushed pending messages:", result);
          }
        } catch (error) {
          console.warn("[ChatWidget] Failed to flush pending messages:", error);
        }
      };
      flushPendingMessages();
    }
  }, [connectionStatus, sessionId, sendMessage, updateMessageStatus]);

  // Handle sending messages with optimistic UI
  const handleSendMessage = useCallback(
    async (content: string) => {
      const messageId = generateId();

      // 1. Optimistic UI update - add message immediately with 'sending' status
      const userMessage: Message = {
        id: messageId,
        role: "user",
        content,
        timestamp: new Date(),
        sendStatus: "sending",
      };
      addMessage(userMessage);
      setTyping(true);
      setSuggestedSlots([]);

      // 2. Queue message for offline persistence
      const messageQueue = messageQueueRef.current;
      try {
        await messageQueue.init();
        await messageQueue.enqueue({
          id: messageId,
          content,
          sessionId,
          tenantId: (resolvedTransport as { tenantId?: string }).tenantId,
        });
      } catch (error) {
        console.warn("[ChatWidget] Failed to queue message:", error);
      }

      // 3. Send message via transport with messageId for acknowledgment
      try {
        sendMessage(content, messageId);
        // Mark as sending in queue (will be updated to sent/delivered on ACK)
        await messageQueue.markSending(messageId);
      } catch (error) {
        console.error("[ChatWidget] Failed to send message:", error);
        updateMessageStatus(messageId, "failed");
        await messageQueue.markFailed(messageId, error instanceof Error ? error.message : "Unknown error");
      }

      onMessageSent?.(content);
    },
    [addMessage, updateMessageStatus, setTyping, setSuggestedSlots, sendMessage, onMessageSent, sessionId, resolvedTransport]
  );

  // Handle quick action selection
  const handleQuickAction = useCallback(
    (message: string) => {
      handleSendMessage(message);
    },
    [handleSendMessage]
  );

  // Handle time slot selection
  const handleSlotSelect = useCallback(
    (slot: TimeSlot) => {
      const message = `Me gustaría agendar para el ${slot.date} a las ${slot.time}`;
      handleSendMessage(message);
    },
    [handleSendMessage]
  );

  // Handle new conversation - reset session and clear messages
  const handleNewConversation = useCallback(() => {
    // Reset session ID (generates new UUID)
    resetSession();
    // Clear all messages and state
    clearMessages();
    // Reset greeting flag to allow new greeting
    greetingAddedRef.current = false;
    // Add greeting if configured
    if (greeting) {
      addMessage(greeting);
      greetingAddedRef.current = true;
    }
  }, [resetSession, clearMessages, greeting, addMessage]);

  // Loading state
  if (sessionLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-[var(--chat-foreground)] text-lg">Cargando...</div>
      </div>
    );
  }

  return (
    <ChatContainer className={containerClassName}>
      {/* Header */}
      <ChatHeader
        connectionStatus={connectionStatus}
        brandName={brandName}
        brandLogo={brandLogo}
        brandSubtitle={brandSubtitle}
        onNewConversation={handleNewConversation}
      />

      {/* Messages */}
      <MessageList messages={messages} isTyping={isTyping} />

      {/* Time slots */}
      {suggestedSlots.length > 0 && !confirmedAppointment && (
        <TimeSlotGrid slots={suggestedSlots} onSelectSlot={handleSlotSelect} />
      )}

      {/* Confirmation card */}
      {confirmedAppointment && (
        <div className="px-4">
          <ConfirmationCard appointment={confirmedAppointment} />
        </div>
      )}

      {/* Quick actions */}
      {quickActions.length > 0 &&
        !messages.some((m) => m.role === "user") &&
        !isTyping && (
          <QuickActions actions={quickActions} onSelectAction={handleQuickAction} />
        )}

      {/* WhatsApp fallback when connection fails */}
      {connectionFailed && (
        <div className="px-4 py-3 mx-4 mb-4 rounded-lg bg-[var(--channel-whatsapp)]/10 border border-[var(--channel-whatsapp)]/20">
          <div className="flex items-center gap-3">
            <MessageCircle className="w-6 h-6 text-[var(--channel-whatsapp)]" />
            <div className="flex-1">
              <p className="text-sm text-[var(--chat-foreground)] font-medium">
                ¿Problemas de conexión?
              </p>
              <p className="text-xs text-[var(--chat-muted)]">
                Contáctanos directamente
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Input */}
      <ChatInput
        onSendMessage={handleSendMessage}
        disabled={
          connectionStatus !== "connected" ||
          isTyping ||
          isStreaming ||
          !!activeToolId
        }
        placeholder={
          connectionFailed
            ? "Chat no disponible"
            : connectionStatus !== "connected"
              ? "Conectando..."
              : isStreaming || activeToolId
                ? "Procesando..."
                : "Escribe tu mensaje..."
        }
      />
    </ChatContainer>
  );
}
