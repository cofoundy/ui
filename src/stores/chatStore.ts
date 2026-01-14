import { create } from "zustand";
import type {
  Message,
  TimeSlot,
  Appointment,
  ConnectionStatus,
  ChatState,
} from "../types";

export const useChatStore = create<ChatState>((set) => ({
  // State
  messages: [],
  isTyping: false,
  isConnected: false,
  connectionStatus: "disconnected",
  sessionId: "",
  suggestedSlots: [],
  confirmedAppointment: null,

  // Streaming state
  streamingMessageId: null,
  isStreaming: false,

  // Tool indicator state
  activeToolId: null,

  // Actions
  addMessage: (message: Message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),

  setTyping: (typing: boolean) =>
    set(() => ({
      isTyping: typing,
    })),

  setConnected: (connected: boolean) =>
    set(() => ({
      isConnected: connected,
    })),

  setConnectionStatus: (status: ConnectionStatus) =>
    set(() => ({
      connectionStatus: status,
      isConnected: status === "connected",
    })),

  setSessionId: (id: string) =>
    set(() => ({
      sessionId: id,
    })),

  setSuggestedSlots: (slots: TimeSlot[]) =>
    set(() => ({
      suggestedSlots: slots,
    })),

  setConfirmedAppointment: (appointment: Appointment | null) =>
    set(() => ({
      confirmedAppointment: appointment,
    })),

  clearMessages: () =>
    set(() => ({
      messages: [],
      suggestedSlots: [],
      confirmedAppointment: null,
    })),

  reset: () =>
    set(() => ({
      messages: [],
      isTyping: false,
      isConnected: false,
      connectionStatus: "disconnected",
      sessionId: "",
      suggestedSlots: [],
      confirmedAppointment: null,
      streamingMessageId: null,
      isStreaming: false,
      activeToolId: null,
    })),

  // Streaming actions
  startStreaming: (messageId: string) =>
    set((state) => ({
      streamingMessageId: messageId,
      isStreaming: true,
      isTyping: false, // Hide typing indicator when streaming starts
      messages: [
        ...state.messages,
        {
          id: messageId,
          role: "assistant" as const,
          content: "",
          timestamp: new Date(),
        },
      ],
    })),

  appendToken: (token: string) =>
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === state.streamingMessageId
          ? { ...msg, content: msg.content + token }
          : msg
      ),
    })),

  finishStreaming: () =>
    set(() => ({
      streamingMessageId: null,
      isStreaming: false,
    })),

  // End current message (for splitting on tool boundaries)
  endCurrentMessage: () =>
    set((state) => {
      // Remove empty streaming message if no content
      const currentMsg = state.messages.find(m => m.id === state.streamingMessageId);
      if (currentMsg && !currentMsg.content.trim()) {
        return {
          streamingMessageId: null,
          isStreaming: false,
          messages: state.messages.filter(m => m.id !== state.streamingMessageId),
        };
      }
      return {
        streamingMessageId: null,
        isStreaming: false,
      };
    }),

  // Tool indicator actions
  startTool: (toolName: string, icon: string, text: string) =>
    set((state) => {
      const toolId = `tool-${toolName}-${Date.now()}`;
      return {
        activeToolId: toolId,
        messages: [
          ...state.messages,
          {
            id: toolId,
            role: "tool" as const,
            content: text,
            timestamp: new Date(),
            toolName,
            toolIcon: icon,
            toolStatus: "running" as const,
          },
        ],
      };
    }),

  endTool: (toolName: string, success: boolean) =>
    set((state) => ({
      activeToolId: null,
      messages: state.messages.map((msg) =>
        msg.role === "tool" && msg.toolName === toolName && msg.toolStatus === "running"
          ? { ...msg, toolStatus: success ? "success" as const : "error" as const }
          : msg
      ),
    })),
}));
