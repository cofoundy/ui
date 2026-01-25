import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock socket.io-client
const mockSocket = {
  connected: false,
  on: vi.fn(),
  emit: vi.fn(),
  connect: vi.fn(),
  disconnect: vi.fn(),
  removeAllListeners: vi.fn(),
};

const mockIo = vi.fn(() => mockSocket);

vi.mock("socket.io-client", () => ({
  io: mockIo,
}));

import { createSocketIOTransport } from "../../transports/SocketIOTransport";
import type { SocketIOTransportConfig, TransportOptions } from "../../transports/types";

describe("SocketIOTransport", () => {
  let eventHandlers: Record<string, (...args: unknown[]) => void>;

  const defaultConfig: SocketIOTransportConfig = {
    type: "socketio",
    url: "http://localhost:12221",
    tenantId: "ten_test",
  };

  const createMockOptions = (overrides: Partial<TransportOptions> = {}): TransportOptions => ({
    sessionId: "session_123",
    onToken: vi.fn(),
    onStreamComplete: vi.fn(),
    onStreamError: vi.fn(),
    onMessageEnd: vi.fn(),
    onToolStart: vi.fn(),
    onToolEnd: vi.fn(),
    onSlots: vi.fn(),
    onConfirmation: vi.fn(),
    onMessage: vi.fn(),
    onConnect: vi.fn(),
    onDisconnect: vi.fn(),
    onError: vi.fn(),
    onMaxRetriesReached: vi.fn(),
    ...overrides,
  });

  beforeEach(() => {
    vi.clearAllMocks();
    eventHandlers = {};
    mockSocket.connected = false;

    // Capture event handlers when socket.on is called
    mockSocket.on.mockImplementation((event: string, handler: (...args: unknown[]) => void) => {
      eventHandlers[event] = handler;
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Connection", () => {
    it("should connect with widget auth flag", async () => {
      const options = createMockOptions();
      await createSocketIOTransport(defaultConfig, options);

      expect(mockIo).toHaveBeenCalledWith(
        defaultConfig.url,
        expect.objectContaining({
          auth: { widget: true },
          query: expect.objectContaining({
            sessionId: options.sessionId,
            tenantId: defaultConfig.tenantId,
          }),
        })
      );
    });

    it("should emit widget_init on connect", async () => {
      const options = createMockOptions();
      await createSocketIOTransport(defaultConfig, options);

      // Simulate connection
      mockSocket.connected = true;
      eventHandlers["connect"]?.();

      expect(mockSocket.emit).toHaveBeenCalledWith(
        "widget_init",
        expect.objectContaining({
          tenant_id: defaultConfig.tenantId,
          session_id: options.sessionId,
        })
      );
    });

    it("should call onConnect callback when connected", async () => {
      const options = createMockOptions();
      await createSocketIOTransport(defaultConfig, options);

      mockSocket.connected = true;
      eventHandlers["connect"]?.();

      expect(options.onConnect).toHaveBeenCalled();
    });
  });

  describe("AG-UI Event Handling", () => {
    describe("Text Message Events", () => {
      it("should handle TEXT_MESSAGE_CONTENT events", async () => {
        const options = createMockOptions();
        await createSocketIOTransport(defaultConfig, options);

        eventHandlers["ag_ui:event"]?.({
          type: "TEXT_MESSAGE_CONTENT",
          delta: "Hello ",
        });

        expect(options.onToken).toHaveBeenCalledWith("Hello ");
      });

      it("should handle TEXT_MESSAGE_END events", async () => {
        const options = createMockOptions();
        await createSocketIOTransport(defaultConfig, options);

        eventHandlers["ag_ui:event"]?.({
          type: "TEXT_MESSAGE_END",
        });

        expect(options.onStreamComplete).toHaveBeenCalled();
      });

      it("should handle RUN_ERROR events", async () => {
        const options = createMockOptions();
        await createSocketIOTransport(defaultConfig, options);

        eventHandlers["ag_ui:event"]?.({
          type: "RUN_ERROR",
          message: "Something went wrong",
        });

        expect(options.onStreamError).toHaveBeenCalledWith("Something went wrong");
      });
    });

    describe("Tool Events", () => {
      it("should handle TOOL_CALL_START events", async () => {
        const options = createMockOptions();
        await createSocketIOTransport(defaultConfig, options);

        eventHandlers["ag_ui:event"]?.({
          type: "TOOL_CALL_START",
          toolCallName: "schedule_appointment",
          toolCallId: "call_123",
        });

        expect(options.onToolStart).toHaveBeenCalledWith(
          "schedule_appointment",
          "📅", // Icon for schedule_appointment
          "Ejecutando schedule_appointment..."
        );
      });

      it("should handle TOOL_CALL_END events", async () => {
        const options = createMockOptions();
        await createSocketIOTransport(defaultConfig, options);

        eventHandlers["ag_ui:event"]?.({
          type: "TOOL_CALL_END",
          toolCallName: "schedule_appointment",
          toolCallId: "call_123",
        });

        expect(options.onToolEnd).toHaveBeenCalledWith("schedule_appointment", true);
      });

      it("should use correct icon for different tools", async () => {
        const options = createMockOptions();
        await createSocketIOTransport(defaultConfig, options);

        const toolIcons = [
          { tool: "schedule_appointment", icon: "📅" },
          { tool: "get_available_slots", icon: "🕐" },
          { tool: "search", icon: "🔍" },
          { tool: "unknown_tool", icon: "⚡" }, // Default
        ];

        for (const { tool, icon } of toolIcons) {
          vi.clearAllMocks();
          eventHandlers["ag_ui:event"]?.({
            type: "TOOL_CALL_START",
            toolCallName: tool,
          });
          expect(options.onToolStart).toHaveBeenCalledWith(tool, icon, expect.any(String));
        }
      });
    });

    describe("TOOL_CALL_RESULT - Appointment Confirmation", () => {
      it("should parse and emit confirmation from schedule_appointment tool", async () => {
        const options = createMockOptions();
        await createSocketIOTransport(defaultConfig, options);

        // Exact schema from TimelyAI schedule_appointment tool
        eventHandlers["ag_ui:event"]?.({
          type: "TOOL_CALL_RESULT",
          toolCallId: "call_123",
          result: JSON.stringify({
            success: true,
            datetime: "2025-01-27 10:00 AM PST",
            client_name: "John Doe",
            client_email: "john@example.com",
            topic: "Consultoría técnica",
            event_id: "evt_abc123",
            event_link: "https://calendar.google.com/meeting/abc",
            invitation_mode: "resend",
            email_sent: true,
            message: "Appointment confirmed for John Doe.",
          }),
        });

        expect(options.onConfirmation).toHaveBeenCalledWith({
          datetime: "2025-01-27 10:00 AM PST",
          client_name: "John Doe",
          client_email: "john@example.com",
          topic: "Consultoría técnica",
          event_id: "evt_abc123",
          event_link: "https://calendar.google.com/meeting/abc",
        });
      });

      it("should emit confirmation with optional fields as undefined", async () => {
        const options = createMockOptions();
        await createSocketIOTransport(defaultConfig, options);

        // Backend may not have event_id/event_link if calendar creation failed
        eventHandlers["ag_ui:event"]?.({
          type: "TOOL_CALL_RESULT",
          toolCallId: "call_123",
          result: JSON.stringify({
            success: true,
            datetime: "2025-01-28 2:30 PM EST",
            client_name: "Jane Doe",
            client_email: "jane@example.com",
            topic: "Product Demo",
            event_id: null,
            event_link: null,
            invitation_mode: "resend",
            email_sent: true,
            message: "Appointment confirmed.",
          }),
        });

        expect(options.onConfirmation).toHaveBeenCalledWith({
          datetime: "2025-01-28 2:30 PM EST",
          client_name: "Jane Doe",
          client_email: "jane@example.com",
          topic: "Product Demo",
          event_id: null,
          event_link: null,
        });
      });

      it("should NOT emit confirmation when success is false", async () => {
        const options = createMockOptions();
        await createSocketIOTransport(defaultConfig, options);

        eventHandlers["ag_ui:event"]?.({
          type: "TOOL_CALL_RESULT",
          toolCallId: "call_123",
          result: JSON.stringify({
            success: false,
            error: "Calendar service unavailable",
            message: "Unable to schedule appointment.",
          }),
        });

        expect(options.onConfirmation).not.toHaveBeenCalled();
      });

      it("should NOT emit confirmation for non-scheduling tool results", async () => {
        const options = createMockOptions();
        await createSocketIOTransport(defaultConfig, options);

        // check_availability tool result
        eventHandlers["ag_ui:event"]?.({
          type: "TOOL_CALL_RESULT",
          toolCallId: "call_123",
          result: JSON.stringify({
            success: true,
            date: "2025-01-27",
            available_slots: ["10:00 AM", "2:00 PM"],
            source: "google_calendar",
          }),
        });

        expect(options.onConfirmation).not.toHaveBeenCalled();
      });

      it("should handle malformed JSON in tool result gracefully", async () => {
        const options = createMockOptions();
        await createSocketIOTransport(defaultConfig, options);

        // Should not throw
        eventHandlers["ag_ui:event"]?.({
          type: "TOOL_CALL_RESULT",
          toolCallId: "call_123",
          result: "not valid json {",
        });

        expect(options.onConfirmation).not.toHaveBeenCalled();
      });

      it("should handle empty result gracefully", async () => {
        const options = createMockOptions();
        await createSocketIOTransport(defaultConfig, options);

        eventHandlers["ag_ui:event"]?.({
          type: "TOOL_CALL_RESULT",
          toolCallId: "call_123",
          result: "",
        });

        expect(options.onConfirmation).not.toHaveBeenCalled();
      });
    });
  });

  describe("Message Events (Legacy)", () => {
    it("should handle message:new from AI/agent", async () => {
      const options = createMockOptions();
      await createSocketIOTransport(defaultConfig, options);

      eventHandlers["message:new"]?.({
        content: "Hello! How can I help?",
        sender: { type: "ai" },
      });

      expect(options.onMessage).toHaveBeenCalledWith("Hello! How can I help?");
    });

    it("should NOT handle message:new from visitor (echo)", async () => {
      const options = createMockOptions();
      await createSocketIOTransport(defaultConfig, options);

      eventHandlers["message:new"]?.({
        content: "My message",
        sender: { type: "visitor" },
      });

      expect(options.onMessage).not.toHaveBeenCalled();
    });

    it("should handle tool_start type messages", async () => {
      const options = createMockOptions();
      await createSocketIOTransport(defaultConfig, options);

      eventHandlers["message:new"]?.({
        type: "tool_start",
        tool: "get_available_slots",
        content: "Buscando horarios disponibles...",
        icon: "🕐",
      });

      expect(options.onToolStart).toHaveBeenCalledWith(
        "get_available_slots",
        "🕐",
        "Buscando horarios disponibles..."
      );
    });

    it("should handle tool_end type messages", async () => {
      const options = createMockOptions();
      await createSocketIOTransport(defaultConfig, options);

      eventHandlers["message:new"]?.({
        type: "tool_end",
        tool: "get_available_slots",
        success: true,
      });

      expect(options.onToolEnd).toHaveBeenCalledWith("get_available_slots", true);
    });

    it("should handle confirmation type messages", async () => {
      const options = createMockOptions();
      await createSocketIOTransport(defaultConfig, options);

      eventHandlers["message:new"]?.({
        type: "confirmation",
        datetime: "2025-01-30T11:00:00",
        client_name: "Jane Doe",
        client_email: "jane@example.com",
        topic: "Strategy Session",
        event_id: "evt_qrs456",
      });

      expect(options.onConfirmation).toHaveBeenCalledWith({
        datetime: "2025-01-30T11:00:00",
        client_name: "Jane Doe",
        client_email: "jane@example.com",
        topic: "Strategy Session",
        event_id: "evt_qrs456",
        event_link: undefined,
      });
    });

    it("should handle slots type messages", async () => {
      const options = createMockOptions();
      await createSocketIOTransport(defaultConfig, options);

      eventHandlers["message:new"]?.({
        type: "slots",
        date: "2025-01-27",
        slots: ["9:00 AM", "10:00 AM", "2:00 PM"],
      });

      expect(options.onSlots).toHaveBeenCalledWith("2025-01-27", ["9:00 AM", "10:00 AM", "2:00 PM"]);
    });
  });

  describe("Sending Messages", () => {
    it("should send messages via widget_message event", async () => {
      const options = createMockOptions();
      const transport = await createSocketIOTransport(defaultConfig, options);

      mockSocket.connected = true;
      transport.sendMessage("Hello!");

      expect(mockSocket.emit).toHaveBeenCalledWith("widget_message", {
        content: "Hello!",
        tenant_id: defaultConfig.tenantId,
        session_id: options.sessionId,
      });
    });

    it("should queue messages when disconnected", async () => {
      const options = createMockOptions();
      const transport = await createSocketIOTransport(defaultConfig, options);

      mockSocket.connected = false;
      transport.sendMessage("Queued message");

      // Should not emit when disconnected
      expect(mockSocket.emit).not.toHaveBeenCalledWith(
        "widget_message",
        expect.anything()
      );

      // Simulate connection and verify queue flush
      mockSocket.connected = true;
      eventHandlers["connect"]?.();

      expect(mockSocket.emit).toHaveBeenCalledWith("widget_message", {
        content: "Queued message",
        tenant_id: defaultConfig.tenantId,
        session_id: options.sessionId,
      });
    });
  });

  describe("Disconnection", () => {
    it("should call onDisconnect on disconnect event", async () => {
      const options = createMockOptions();
      await createSocketIOTransport(defaultConfig, options);

      eventHandlers["disconnect"]?.("transport close");

      expect(options.onDisconnect).toHaveBeenCalled();
    });

    it("should clean up on transport disconnect", async () => {
      const options = createMockOptions();
      const transport = await createSocketIOTransport(defaultConfig, options);

      transport.disconnect();

      expect(mockSocket.removeAllListeners).toHaveBeenCalled();
      expect(mockSocket.disconnect).toHaveBeenCalled();
    });
  });
});
