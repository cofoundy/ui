"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { ConnectionStatus, Message } from "../types";

// =============================================================================
// AG-UI Event Types (matching backend src/services/ag_ui/events.py)
// =============================================================================

export enum AGUIEventType {
  // Lifecycle events
  RUN_STARTED = "RUN_STARTED",
  RUN_FINISHED = "RUN_FINISHED",
  RUN_ERROR = "RUN_ERROR",
  STEP_STARTED = "STEP_STARTED",
  STEP_FINISHED = "STEP_FINISHED",

  // Message events
  TEXT_MESSAGE_START = "TEXT_MESSAGE_START",
  TEXT_MESSAGE_CONTENT = "TEXT_MESSAGE_CONTENT",
  TEXT_MESSAGE_END = "TEXT_MESSAGE_END",
  TEXT_MESSAGE_CHUNK = "TEXT_MESSAGE_CHUNK",

  // Thinking events
  THINKING_START = "THINKING_START",
  THINKING_END = "THINKING_END",
  THINKING_TEXT_MESSAGE_START = "THINKING_TEXT_MESSAGE_START",
  THINKING_TEXT_MESSAGE_CONTENT = "THINKING_TEXT_MESSAGE_CONTENT",
  THINKING_TEXT_MESSAGE_END = "THINKING_TEXT_MESSAGE_END",

  // Tool events
  TOOL_CALL_START = "TOOL_CALL_START",
  TOOL_CALL_ARGS = "TOOL_CALL_ARGS",
  TOOL_CALL_END = "TOOL_CALL_END",
  TOOL_CALL_CHUNK = "TOOL_CALL_CHUNK",
  TOOL_CALL_RESULT = "TOOL_CALL_RESULT",

  // State events
  STATE_SNAPSHOT = "STATE_SNAPSHOT",
  STATE_DELTA = "STATE_DELTA",
  MESSAGES_SNAPSHOT = "MESSAGES_SNAPSHOT",

  // Custom events
  CUSTOM = "CUSTOM",
  RAW = "RAW",
}

export interface AGUIEvent {
  type: AGUIEventType | string;
  timestamp?: number;
  // Run events
  threadId?: string;
  runId?: string;
  // Message events
  messageId?: string;
  role?: "assistant" | "system";
  delta?: string;
  // Tool events
  toolCallId?: string;
  toolCallName?: string;
  parentMessageId?: string;
  result?: string;
  // State events
  snapshot?: Record<string, unknown>;
  messages?: Record<string, unknown>[];
  // Error events
  message?: string;
  code?: string;
  // Custom events
  name?: string;
  value?: unknown;
  raw?: Record<string, unknown>;
}

// =============================================================================
// Tool Call State
// =============================================================================

export interface ToolCallState {
  id: string;
  name: string;
  args: string;
  result: string | null;
  status: "running" | "success" | "error";
  startedAt: Date;
  endedAt?: Date;
}

// =============================================================================
// Run State
// =============================================================================

export type RunStatus = "idle" | "running" | "completed" | "error";

export interface RunState {
  threadId: string | null;
  runId: string | null;
  status: RunStatus;
  error: string | null;
  startedAt: Date | null;
  endedAt: Date | null;
}

// =============================================================================
// Hook Options and Return Types
// =============================================================================

export interface UseAGUIOptions {
  /** Socket.IO instance */
  socket: {
    on: (event: string, callback: (data: unknown) => void) => void;
    off: (event: string, callback?: (data: unknown) => void) => void;
  } | null;

  /** Callback when a complete message is received */
  onMessage?: (message: Message) => void;

  /** Callback on streaming token */
  onToken?: (delta: string, messageId: string) => void;

  /** Callback when streaming starts */
  onStreamStart?: (messageId: string) => void;

  /** Callback when streaming ends */
  onStreamEnd?: (messageId: string, content: string) => void;

  /** Callback when a tool starts */
  onToolStart?: (toolCall: ToolCallState) => void;

  /** Callback when a tool ends */
  onToolEnd?: (toolCall: ToolCallState) => void;

  /** Callback when run starts */
  onRunStart?: (threadId: string, runId?: string) => void;

  /** Callback when run ends */
  onRunEnd?: (threadId: string, error?: string) => void;

  /** Callback for thinking events */
  onThinking?: (isThinking: boolean) => void;

  /** Callback for state snapshots */
  onStateSnapshot?: (snapshot: Record<string, unknown>) => void;

  /** Callback for raw AG-UI events (for debugging) */
  onRawEvent?: (event: AGUIEvent) => void;
}

export interface UseAGUIReturn {
  /** Current run state */
  runState: RunState;

  /** Current streaming message content */
  streamingContent: string;

  /** Current streaming message ID */
  streamingMessageId: string | null;

  /** Whether currently streaming */
  isStreaming: boolean;

  /** Whether AI is thinking (reasoning phase) */
  isThinking: boolean;

  /** Active tool calls */
  activeToolCalls: ToolCallState[];

  /** All accumulated messages from this run */
  messages: Message[];

  /** Reset the state */
  reset: () => void;
}

// =============================================================================
// Hook Implementation
// =============================================================================

/**
 * React hook for handling AG-UI protocol events from a Socket.IO connection.
 *
 * The AG-UI protocol is an open, event-based protocol for AI agent ↔ frontend
 * communication. This hook handles:
 *
 * - Lifecycle events (RUN_STARTED, RUN_FINISHED, RUN_ERROR)
 * - Message streaming (TEXT_MESSAGE_START/CONTENT/END)
 * - Tool calls (TOOL_CALL_START/ARGS/END/RESULT)
 * - Thinking/reasoning phases
 * - State snapshots and deltas
 *
 * @example
 * ```tsx
 * const { isStreaming, streamingContent, activeToolCalls } = useAGUI({
 *   socket: socketInstance,
 *   onMessage: (msg) => addToChat(msg),
 *   onToolStart: (tool) => showToolIndicator(tool),
 * });
 * ```
 */
export function useAGUI({
  socket,
  onMessage,
  onToken,
  onStreamStart,
  onStreamEnd,
  onToolStart,
  onToolEnd,
  onRunStart,
  onRunEnd,
  onThinking,
  onStateSnapshot,
  onRawEvent,
}: UseAGUIOptions): UseAGUIReturn {
  // Run state
  const [runState, setRunState] = useState<RunState>({
    threadId: null,
    runId: null,
    status: "idle",
    error: null,
    startedAt: null,
    endedAt: null,
  });

  // Streaming state
  const [streamingContent, setStreamingContent] = useState("");
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);

  // Thinking state
  const [isThinking, setIsThinking] = useState(false);

  // Tool calls
  const [activeToolCalls, setActiveToolCalls] = useState<ToolCallState[]>([]);

  // Messages
  const [messages, setMessages] = useState<Message[]>([]);

  // Refs for stable callbacks
  const streamingContentRef = useRef("");
  const toolCallsMapRef = useRef<Map<string, ToolCallState>>(new Map());

  // Reset function
  const reset = useCallback(() => {
    setRunState({
      threadId: null,
      runId: null,
      status: "idle",
      error: null,
      startedAt: null,
      endedAt: null,
    });
    setStreamingContent("");
    setStreamingMessageId(null);
    setIsStreaming(false);
    setIsThinking(false);
    setActiveToolCalls([]);
    setMessages([]);
    streamingContentRef.current = "";
    toolCallsMapRef.current.clear();
  }, []);

  // Event handler
  const handleAGUIEvent = useCallback(
    (data: unknown) => {
      const event = data as AGUIEvent;

      // Call raw event callback for debugging
      onRawEvent?.(event);

      switch (event.type) {
        // ===================
        // Lifecycle Events
        // ===================
        case AGUIEventType.RUN_STARTED:
          setRunState({
            threadId: event.threadId || null,
            runId: event.runId || null,
            status: "running",
            error: null,
            startedAt: new Date(),
            endedAt: null,
          });
          onRunStart?.(event.threadId || "", event.runId);
          break;

        case AGUIEventType.RUN_FINISHED:
          setRunState((prev) => ({
            ...prev,
            status: "completed",
            endedAt: new Date(),
          }));
          onRunEnd?.(event.threadId || "");
          break;

        case AGUIEventType.RUN_ERROR:
          setRunState((prev) => ({
            ...prev,
            status: "error",
            error: event.message || "Unknown error",
            endedAt: new Date(),
          }));
          onRunEnd?.(event.threadId || "", event.message);
          break;

        // ===================
        // Message Events
        // ===================
        case AGUIEventType.TEXT_MESSAGE_START:
          setStreamingMessageId(event.messageId || null);
          setStreamingContent("");
          setIsStreaming(true);
          streamingContentRef.current = "";
          onStreamStart?.(event.messageId || "");
          break;

        case AGUIEventType.TEXT_MESSAGE_CONTENT:
          if (event.delta) {
            setStreamingContent((prev) => prev + event.delta!);
            streamingContentRef.current += event.delta;
            onToken?.(event.delta, event.messageId || "");
          }
          break;

        case AGUIEventType.TEXT_MESSAGE_END:
          {
            const finalContent = streamingContentRef.current;
            const msgId = event.messageId || streamingMessageId;

            // Create complete message
            const message: Message = {
              id: msgId || crypto.randomUUID(),
              role: "assistant",
              content: finalContent,
              timestamp: new Date(),
            };

            setMessages((prev) => [...prev, message]);
            onMessage?.(message);
            onStreamEnd?.(msgId || "", finalContent);

            // Reset streaming state
            setIsStreaming(false);
            setStreamingMessageId(null);
          }
          break;

        case AGUIEventType.TEXT_MESSAGE_CHUNK:
          // Non-streaming complete message
          if (event.delta) {
            const message: Message = {
              id: event.messageId || crypto.randomUUID(),
              role: event.role === "system" ? "assistant" : "assistant",
              content: event.delta,
              timestamp: new Date(),
            };
            setMessages((prev) => [...prev, message]);
            onMessage?.(message);
          }
          break;

        // ===================
        // Thinking Events
        // ===================
        case AGUIEventType.THINKING_START:
          setIsThinking(true);
          onThinking?.(true);
          break;

        case AGUIEventType.THINKING_END:
          setIsThinking(false);
          onThinking?.(false);
          break;

        // ===================
        // Tool Events
        // ===================
        case AGUIEventType.TOOL_CALL_START:
          {
            const toolCall: ToolCallState = {
              id: event.toolCallId || crypto.randomUUID(),
              name: event.toolCallName || "unknown",
              args: "",
              result: null,
              status: "running",
              startedAt: new Date(),
            };

            toolCallsMapRef.current.set(toolCall.id, toolCall);
            setActiveToolCalls(Array.from(toolCallsMapRef.current.values()));
            onToolStart?.(toolCall);
          }
          break;

        case AGUIEventType.TOOL_CALL_ARGS:
          {
            const toolId = event.toolCallId;
            if (toolId && toolCallsMapRef.current.has(toolId)) {
              const tool = toolCallsMapRef.current.get(toolId)!;
              tool.args += event.delta || "";
              setActiveToolCalls(Array.from(toolCallsMapRef.current.values()));
            }
          }
          break;

        case AGUIEventType.TOOL_CALL_END:
          // Args complete, but still running until result
          break;

        case AGUIEventType.TOOL_CALL_RESULT:
          {
            const toolId = event.toolCallId;
            if (toolId && toolCallsMapRef.current.has(toolId)) {
              const tool = toolCallsMapRef.current.get(toolId)!;
              tool.result = event.result || null;
              tool.status = "success";
              tool.endedAt = new Date();

              setActiveToolCalls(Array.from(toolCallsMapRef.current.values()));
              onToolEnd?.(tool);

              // Remove from active after a delay
              setTimeout(() => {
                toolCallsMapRef.current.delete(toolId);
                setActiveToolCalls(Array.from(toolCallsMapRef.current.values()));
              }, 2000);
            }
          }
          break;

        // ===================
        // State Events
        // ===================
        case AGUIEventType.STATE_SNAPSHOT:
          if (event.snapshot) {
            onStateSnapshot?.(event.snapshot);
          }
          break;

        case AGUIEventType.MESSAGES_SNAPSHOT:
          // Could be used to sync full message history
          break;

        default:
          // Unknown event type - handle as raw
          break;
      }
    },
    [
      streamingMessageId,
      onMessage,
      onToken,
      onStreamStart,
      onStreamEnd,
      onToolStart,
      onToolEnd,
      onRunStart,
      onRunEnd,
      onThinking,
      onStateSnapshot,
      onRawEvent,
    ]
  );

  // Subscribe to AG-UI events
  useEffect(() => {
    if (!socket) return;

    socket.on("ag_ui:event", handleAGUIEvent);

    return () => {
      socket.off("ag_ui:event", handleAGUIEvent);
    };
  }, [socket, handleAGUIEvent]);

  return {
    runState,
    streamingContent,
    streamingMessageId,
    isStreaming,
    isThinking,
    activeToolCalls,
    messages,
    reset,
  };
}
