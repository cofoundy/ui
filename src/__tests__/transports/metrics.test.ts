import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  ConnectionMetricsCollector,
  createMetricsCollector,
  getMetricsCollector,
} from "../../transports/metrics";

describe("ConnectionMetricsCollector", () => {
  let collector: ConnectionMetricsCollector;

  beforeEach(() => {
    vi.useFakeTimers();
    collector = new ConnectionMetricsCollector();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("Initial State", () => {
    it("should start with zero metrics", () => {
      const metrics = collector.getMetrics();
      expect(metrics.connectionAttempts).toBe(0);
      expect(metrics.successfulConnections).toBe(0);
      expect(metrics.failedConnections).toBe(0);
      expect(metrics.messagesSent).toBe(0);
      expect(metrics.messagesDelivered).toBe(0);
    });

    it("should have a session start time", () => {
      const metrics = collector.getMetrics();
      expect(metrics.sessionStartTime).toBeGreaterThan(0);
    });

    it("should have 100% success rate with no attempts", () => {
      expect(collector.getConnectionSuccessRate()).toBe(100);
    });

    it("should have 100% delivery rate with no messages", () => {
      expect(collector.getMessageDeliveryRate()).toBe(100);
    });
  });

  describe("Connection Tracking", () => {
    it("should track connection attempts", () => {
      collector.recordConnectionAttempt();
      collector.recordConnectionAttempt();

      const metrics = collector.getMetrics();
      expect(metrics.connectionAttempts).toBe(2);
    });

    it("should track successful connections", () => {
      collector.recordConnectionAttempt();
      collector.recordConnection();

      const metrics = collector.getMetrics();
      expect(metrics.successfulConnections).toBe(1);
      expect(metrics.lastConnectTime).toBeGreaterThan(0);
    });

    it("should track failed connections", () => {
      collector.recordConnectionAttempt();
      collector.recordConnectionFailure("Network error");

      const metrics = collector.getMetrics();
      expect(metrics.failedConnections).toBe(1);
    });

    it("should track reconnection attempts", () => {
      collector.recordReconnect();
      collector.recordReconnect();

      const metrics = collector.getMetrics();
      expect(metrics.reconnectAttempts).toBe(2);
    });

    it("should track disconnections", () => {
      collector.recordConnectionAttempt();
      collector.recordConnection();

      vi.advanceTimersByTime(1000);

      collector.recordDisconnect("Server closed");

      const metrics = collector.getMetrics();
      expect(metrics.lastDisconnectTime).toBeGreaterThan(0);
      expect(metrics.totalConnectedTimeMs).toBeGreaterThanOrEqual(1000);
    });

    it("should calculate connection success rate correctly", () => {
      collector.recordConnectionAttempt();
      collector.recordConnection();
      collector.recordConnectionAttempt();
      collector.recordConnectionFailure();
      collector.recordConnectionAttempt();
      collector.recordConnection();
      collector.recordConnectionAttempt();
      collector.recordConnection();

      // 3 successes out of 4 attempts = 75%
      expect(collector.getConnectionSuccessRate()).toBe(75);
    });
  });

  describe("Message Tracking", () => {
    it("should track messages sent", () => {
      collector.recordMessageSent("msg-1");
      collector.recordMessageSent("msg-2");

      const metrics = collector.getMetrics();
      expect(metrics.messagesSent).toBe(2);
    });

    it("should track messages delivered", () => {
      collector.recordMessageSent("msg-1");
      collector.recordMessageDelivered("msg-1", 100);

      const metrics = collector.getMetrics();
      expect(metrics.messagesDelivered).toBe(1);
    });

    it("should track messages failed", () => {
      collector.recordMessageSent("msg-1");
      collector.recordMessageFailed("msg-1", "Timeout");

      const metrics = collector.getMetrics();
      expect(metrics.messagesFailed).toBe(1);
    });

    it("should calculate message delivery rate correctly", () => {
      collector.recordMessageSent("msg-1");
      collector.recordMessageDelivered("msg-1");
      collector.recordMessageSent("msg-2");
      collector.recordMessageDelivered("msg-2");
      collector.recordMessageSent("msg-3");
      collector.recordMessageFailed("msg-3", "Error");
      collector.recordMessageSent("msg-4");
      collector.recordMessageDelivered("msg-4");

      // 3 delivered out of 4 sent = 75%
      expect(collector.getMessageDeliveryRate()).toBe(75);
    });
  });

  describe("Latency Tracking", () => {
    it("should track connection latency", () => {
      collector.recordConnectionAttempt();
      vi.advanceTimersByTime(150);
      collector.recordConnection();

      const metrics = collector.getMetrics();
      expect(metrics.averageLatencyMs).toBeGreaterThanOrEqual(150);
    });

    it("should track message latency", () => {
      collector.recordMessageDelivered("msg-1", 100);
      collector.recordMessageDelivered("msg-2", 200);
      collector.recordMessageDelivered("msg-3", 300);

      const metrics = collector.getMetrics();
      expect(metrics.averageLatencyMs).toBe(200);
    });

    it("should maintain rolling average with buffer", () => {
      // Add many samples to test buffer
      for (let i = 0; i < 50; i++) {
        collector.recordMessageDelivered(`msg-${i}`, 100);
      }
      for (let i = 0; i < 50; i++) {
        collector.recordMessageDelivered(`msg-${i + 50}`, 200);
      }

      // Average should be close to 150 (mix of 100 and 200)
      const metrics = collector.getMetrics();
      expect(metrics.averageLatencyMs).toBe(150);
    });
  });

  describe("Uptime Tracking", () => {
    it("should calculate uptime percentage", () => {
      collector.recordConnectionAttempt();
      collector.recordConnection();

      vi.advanceTimersByTime(5000);

      collector.recordDisconnect();

      vi.advanceTimersByTime(5000);

      const metrics = collector.getMetrics();
      // Connected for 5000ms out of 10000ms = 50%
      expect(metrics.uptimePercentage).toBe(50);
    });
  });

  describe("Event History", () => {
    it("should track event history", () => {
      collector.recordConnectionAttempt();
      collector.recordConnection();
      collector.recordMessageSent("msg-1");

      const history = collector.getEventHistory();
      expect(history.length).toBe(3);
      expect(history[0].type).toBe("connection");
      expect(history[1].type).toBe("connection");
      expect(history[2].type).toBe("message_sent");
    });

    it("should limit event history size", () => {
      // Add more than max events
      for (let i = 0; i < 1100; i++) {
        collector.recordMessageSent(`msg-${i}`);
      }

      const history = collector.getEventHistory();
      expect(history.length).toBeLessThanOrEqual(1000);
    });
  });

  describe("Listeners", () => {
    it("should notify listeners on events", () => {
      const listener = vi.fn();
      collector.onMetrics(listener);

      collector.recordConnectionAttempt();

      expect(listener).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({ type: "connection" })
      );
    });

    it("should allow removing listeners", () => {
      const listener = vi.fn();
      const unsubscribe = collector.onMetrics(listener);

      unsubscribe();
      collector.recordConnectionAttempt();

      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe("Reset", () => {
    it("should reset all metrics", () => {
      collector.recordConnectionAttempt();
      collector.recordConnection();
      collector.recordMessageSent("msg-1");

      collector.reset();

      const metrics = collector.getMetrics();
      expect(metrics.connectionAttempts).toBe(0);
      expect(metrics.successfulConnections).toBe(0);
      expect(metrics.messagesSent).toBe(0);
    });

    it("should clear event history on reset", () => {
      collector.recordConnectionAttempt();
      collector.reset();

      const history = collector.getEventHistory();
      expect(history.length).toBe(0);
    });
  });

  describe("JSON Export", () => {
    it("should export metrics as JSON", () => {
      collector.recordConnectionAttempt();
      collector.recordConnection();
      collector.recordMessageSent("msg-1");
      collector.recordMessageDelivered("msg-1");

      const json = collector.toJSON();

      expect(json.connectionAttempts).toBe(1);
      expect(json.successfulConnections).toBe(1);
      expect(json.messagesSent).toBe(1);
      expect(json.connectionSuccessRate).toBe(100);
      expect(json.messageDeliveryRate).toBe(100);
      expect(json.recentEvents).toBeInstanceOf(Array);
    });
  });

  describe("Factory Functions", () => {
    it("should create new collector with createMetricsCollector", () => {
      const collector1 = createMetricsCollector();
      const collector2 = createMetricsCollector();

      expect(collector1).not.toBe(collector2);
    });

    it("should return singleton with getMetricsCollector", () => {
      const collector1 = getMetricsCollector();
      const collector2 = getMetricsCollector();

      expect(collector1).toBe(collector2);
    });
  });
});
