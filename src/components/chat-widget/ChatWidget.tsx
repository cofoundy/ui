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
import { useWebSocket } from "../../hooks/useWebSocket";
import { useChatStore } from "../../stores/chatStore";
import type {
  Message,
  TimeSlot,
  Appointment,
  QuickAction,
  ChatWidgetConfig,
} from "../../types";

// Simple UUID generator
function generateId(): string {
  return crypto.randomUUID();
}

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

// Parse time slots from assistant message
function parseTimeSlots(message: string): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const today = new Date();

  const dayLabels: Record<string, number> = {
    hoy: 0,
    today: 0,
    mañana: 1,
    tomorrow: 1,
    "pasado mañana": 2,
    "day after tomorrow": 2,
  };

  const lines = message.split("\n");
  let currentDayOffset = 0;

  for (const line of lines) {
    const lowerLine = line.toLowerCase();

    for (const [label, offset] of Object.entries(dayLabels)) {
      if (lowerLine.startsWith(label) || lowerLine.includes(label + ":")) {
        currentDayOffset = offset;
        break;
      }
    }

    const timePattern = /(\d{1,2}:\d{2}\s*(?:AM|PM))/gi;
    let match;
    while ((match = timePattern.exec(line)) !== null) {
      const timeStr = match[1];
      const date = new Date(today);
      date.setDate(today.getDate() + currentDayOffset);

      slots.push({
        date: date.toISOString().split("T")[0],
        time: timeStr.trim(),
        available: true,
      });
    }
  }

  return slots;
}

// Check if message contains appointment confirmation
function parseConfirmation(message: string): Appointment | null {
  const confirmationPatterns = [
    /(?:confirmad[ao]|agendad[ao]|reservad[ao])/i,
    /(?:confirmed|scheduled|booked)/i,
    /(?:cita|reunión|llamada).*(?:confirmad[ao]|agendad[ao])/i,
    /(?:listo|all set|your call is)/i,
  ];

  const hasConfirmation = confirmationPatterns.some((pattern) =>
    pattern.test(message)
  );

  if (hasConfirmation) {
    let dateStr: string;

    const isoMatch = message.match(/(\d{4}-\d{2}-\d{2})/);
    if (isoMatch) {
      dateStr = isoMatch[1];
    } else {
      const spanishDateMatch = message.match(/(\d{1,2})\s+de\s+(\w+)/i);
      if (spanishDateMatch) {
        const day = parseInt(spanishDateMatch[1]);
        const monthName = spanishDateMatch[2].toLowerCase();
        const months: Record<string, number> = {
          enero: 0,
          febrero: 1,
          marzo: 2,
          abril: 3,
          mayo: 4,
          junio: 5,
          julio: 6,
          agosto: 7,
          septiembre: 8,
          octubre: 9,
          noviembre: 10,
          diciembre: 11,
        };
        const month = months[monthName] ?? new Date().getMonth();
        const year = new Date().getFullYear();
        dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      } else {
        const today = new Date();
        if (/mañana|tomorrow/i.test(message)) {
          today.setDate(today.getDate() + 1);
        } else if (/pasado mañana|day after/i.test(message)) {
          today.setDate(today.getDate() + 2);
        }
        dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
      }
    }

    const timeMatch = message.match(/(\d{1,2}:\d{2}\s*(?:AM|PM)?)/i);

    return {
      id: generateId(),
      date: dateStr,
      time: timeMatch ? timeMatch[1] : "Por confirmar",
      topic: "Consultoría",
      attendees: [],
      confirmed: true,
    };
  }

  return null;
}

export function ChatWidget({
  websocketUrl,
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
  const { sessionId, isLoading: sessionLoading } = useSession({
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
  } = useChatStore();

  // Track if connection permanently failed
  const [connectionFailed, setConnectionFailed] = useState(false);

  // Ref to track current streaming message ID
  const streamingMessageIdRef = useRef<string | null>(null);

  useEffect(() => {
    streamingMessageIdRef.current = streamingMessageId;
  }, [streamingMessageId]);

  // Show initial greeting on mount
  useEffect(() => {
    if (messages.length === 0 && greeting) {
      addMessage(greeting);
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
  const handleStreamComplete = useCallback(() => {
    const currentMsgId = streamingMessageIdRef.current;
    if (currentMsgId) {
      const currentMessages = useChatStore.getState().messages;
      const lastMessage = currentMessages.find((m) => m.id === currentMsgId);
      if (lastMessage) {
        const slots = parseTimeSlots(lastMessage.content);
        if (slots.length > 0) {
          setSuggestedSlots(slots);
        }

        const confirmation = parseConfirmation(lastMessage.content);
        if (confirmation) {
          setConfirmedAppointment(confirmation);
          onAppointmentConfirmed?.(confirmation);
        }
      }
    }
    streamingMessageIdRef.current = null;
    finishStreaming();
  }, [
    setSuggestedSlots,
    setConfirmedAppointment,
    finishStreaming,
    onAppointmentConfirmed,
  ]);

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

  // Legacy message handler
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

      const slots = parseTimeSlots(data);
      if (slots.length > 0) {
        setSuggestedSlots(slots);
      }

      const confirmation = parseConfirmation(data);
      if (confirmation) {
        setConfirmedAppointment(confirmation);
        onAppointmentConfirmed?.(confirmation);
      }
    },
    [
      addMessage,
      setTyping,
      setSuggestedSlots,
      setConfirmedAppointment,
      onAppointmentConfirmed,
    ]
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

  // WebSocket connection
  const { sendMessage, connectionStatus: wsStatus } = useWebSocket({
    url: websocketUrl,
    sessionId,
    onToken: handleToken,
    onStreamComplete: handleStreamComplete,
    onStreamError: handleStreamError,
    onMessageEnd: handleMessageEnd,
    onToolStart: handleToolStart,
    onToolEnd: handleToolEnd,
    onSlots: handleSlots,
    onMessage: handleMessage,
    onConnect: handleConnect,
    onDisconnect: handleDisconnect,
    onError: handleError,
    onMaxRetriesReached: handleMaxRetries,
  });

  useEffect(() => {
    setConnectionStatus(wsStatus);
  }, [wsStatus, setConnectionStatus]);

  // Handle sending messages
  const handleSendMessage = useCallback(
    (content: string) => {
      const userMessage: Message = {
        id: generateId(),
        role: "user",
        content,
        timestamp: new Date(),
      };
      addMessage(userMessage);
      setTyping(true);
      setSuggestedSlots([]);
      sendMessage(content);
      onMessageSent?.(content);
    },
    [addMessage, setTyping, setSuggestedSlots, sendMessage, onMessageSent]
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

  // Loading state
  if (sessionLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-white text-lg">Cargando...</div>
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
        <div className="px-4 py-3 mx-4 mb-4 rounded-lg bg-green-500/10 border border-green-500/20">
          <div className="flex items-center gap-3">
            <MessageCircle className="w-6 h-6 text-green-500" />
            <div className="flex-1">
              <p className="text-sm text-white font-medium">
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
