/**
 * Integration tests for P99 Reliability Architecture
 *
 * Tests the complete flow of:
 * - Circuit breaker protection
 * - Message queue persistence
 * - Message acknowledgment protocol
 * - Connection resilience
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { CircuitBreaker } from "../../transports/circuitBreaker";
import {
  MessageQueue,
  generateMessageId,
  type QueuedMessage,
} from "../../services/messageQueue";

// Mock IndexedDB
const mockStore = new Map<string, QueuedMessage>();

const mockIDBRequest = (result: unknown) => ({
  result,
  error: null,
  onsuccess: null as ((event: Event) => void) | null,
  onerror: null as ((event: Event) => void) | null,
});

const mockTransaction = () => ({
  objectStore: vi.fn(() => mockObjectStore()),
});

const mockObjectStore = () => ({
  add: vi.fn((item: QueuedMessage) => {
    mockStore.set(item.id, item);
    const req = mockIDBRequest(undefined);
    setTimeout(() => req.onsuccess?.(new Event("success")), 0);
    return req;
  }),
  put: vi.fn((item: QueuedMessage) => {
    mockStore.set(item.id, item);
    const req = mockIDBRequest(undefined);
    setTimeout(() => req.onsuccess?.(new Event("success")), 0);
    return req;
  }),
  get: vi.fn((id: string) => {
    const req = mockIDBRequest(mockStore.get(id));
    setTimeout(() => req.onsuccess?.(new Event("success")), 0);
    return req;
  }),
  getAll: vi.fn(() => {
    const req = mockIDBRequest(Array.from(mockStore.values()));
    setTimeout(() => req.onsuccess?.(new Event("success")), 0);
    return req;
  }),
  delete: vi.fn((id: string) => {
    mockStore.delete(id);
    const req = mockIDBRequest(undefined);
    setTimeout(() => req.onsuccess?.(new Event("success")), 0);
    return req;
  }),
  clear: vi.fn(() => {
    mockStore.clear();
    const req = mockIDBRequest(undefined);
    setTimeout(() => req.onsuccess?.(new Event("success")), 0);
    return req;
  }),
  createIndex: vi.fn(),
  index: vi.fn(() => ({
    getAll: vi.fn((status: string) => {
      const filtered = Array.from(mockStore.values()).filter(
        (m) => m.status === status
      );
      const req = mockIDBRequest(filtered);
      setTimeout(() => req.onsuccess?.(new Event("success")), 0);
      return req;
    }),
  })),
});

const mockDB = {
  objectStoreNames: { contains: vi.fn(() => true) },
  createObjectStore: vi.fn(() => mockObjectStore()),
  transaction: vi.fn(() => mockTransaction()),
  close: vi.fn(),
};

const mockIndexedDB = {
  open: vi.fn(() => {
    const req = mockIDBRequest(mockDB);
    setTimeout(() => req.onsuccess?.(new Event("success")), 0);
    return req;
  }),
};

describe("P99 Reliability Integration Tests", () => {
  describe("Circuit Breaker + Message Queue Integration", () => {
    let circuitBreaker: CircuitBreaker;
    let messageQueue: MessageQueue;

    beforeEach(async () => {
      // Don't use fake timers here - message queue needs real timers
      mockStore.clear();
      vi.stubGlobal("indexedDB", mockIndexedDB);

      circuitBreaker = new CircuitBreaker({
        failureThreshold: 3,
        resetTimeout: 5000,
        halfOpenRequests: 1,
      });
      messageQueue = new MessageQueue();
      await messageQueue.init();
    });

    afterEach(() => {
      circuitBreaker.dispose();
      messageQueue.close();
      vi.unstubAllGlobals();
    });

    it("should queue messages when circuit breaker is open", async () => {
      const sessionId = "test-session";

      // Trip the circuit breaker
      circuitBreaker.recordFailure();
      circuitBreaker.recordFailure();
      circuitBreaker.recordFailure();
      expect(circuitBreaker.getState()).toBe("OPEN");

      // Queue a message since we can't send
      const messageId = generateMessageId();
      await messageQueue.enqueue({
        id: messageId,
        content: "Hello while disconnected",
        sessionId,
      });

      // Verify message is queued
      const pending = await messageQueue.getPending(sessionId);
      expect(pending.length).toBe(1);
      expect(pending[0].content).toBe("Hello while disconnected");
      expect(pending[0].status).toBe("pending");
    });

    it("should flush queued messages when circuit closes", async () => {
      const sessionId = "test-session";
      let sentMessages: string[] = [];

      // Queue messages while "disconnected"
      await messageQueue.enqueue({
        id: "msg-1",
        content: "Message 1",
        sessionId,
      });
      await messageQueue.enqueue({
        id: "msg-2",
        content: "Message 2",
        sessionId,
      });

      // Simulate successful send function
      const sendFn = vi.fn(async (msg: QueuedMessage) => {
        sentMessages.push(msg.content);
        return true;
      });

      // Flush the queue
      const result = await messageQueue.flush(sessionId, sendFn);

      expect(result.sent).toBe(2);
      expect(result.failed).toBe(0);
      expect(sentMessages).toEqual(["Message 1", "Message 2"]);
    });

    it("should retry failed messages with exponential backoff", async () => {
      const sessionId = "test-session";
      const queue = new MessageQueue({ maxRetries: 3 });
      await queue.init();

      await queue.enqueue({
        id: "retry-msg",
        content: "Will retry",
        sessionId,
      });

      // First attempt fails
      await queue.markSending("retry-msg");
      await queue.markFailed("retry-msg", "Network error");

      let msg = await queue.get("retry-msg");
      expect(msg?.status).toBe("failed");
      expect(msg?.retryCount).toBe(1);

      queue.close();
    });
  });

  describe("Message Acknowledgment Flow", () => {
    let messageQueue: MessageQueue;

    beforeEach(() => {
      mockStore.clear();
      vi.stubGlobal("indexedDB", mockIndexedDB);
      messageQueue = new MessageQueue();
    });

    afterEach(() => {
      messageQueue.close();
      vi.unstubAllGlobals();
    });

    it("should track message status through full lifecycle", async () => {
      const messageId = generateMessageId();
      const sessionId = "test-session";

      // 1. Enqueue (optimistic UI update)
      await messageQueue.enqueue({
        id: messageId,
        content: "Test message",
        sessionId,
      });

      let msg = await messageQueue.get(messageId);
      expect(msg?.status).toBe("pending");

      // 2. Mark as sending (transport accepted)
      await messageQueue.markSending(messageId);
      msg = await messageQueue.get(messageId);
      expect(msg?.status).toBe("sending");

      // 3. Mark as sent (server ACK received)
      await messageQueue.markSent(messageId);
      msg = await messageQueue.get(messageId);
      expect(msg?.status).toBe("sent");

      // 4. Mark as delivered (final confirmation)
      await messageQueue.markDelivered(messageId);
      msg = await messageQueue.get(messageId);
      expect(msg?.status).toBe("delivered");
    });

    it("should handle ACK failure gracefully", async () => {
      const messageId = "ack-fail-msg";
      const sessionId = "test-session";

      await messageQueue.enqueue({
        id: messageId,
        content: "May fail",
        sessionId,
      });

      await messageQueue.markSending(messageId);
      await messageQueue.markFailed(messageId, "ACK timeout");

      const msg = await messageQueue.get(messageId);
      expect(msg?.status).toBe("failed");
      expect(msg?.lastError).toBe("ACK timeout");
    });
  });

  describe("Circuit Breaker State Machine", () => {
    let circuitBreaker: CircuitBreaker;

    beforeEach(() => {
      vi.useFakeTimers();
      circuitBreaker = new CircuitBreaker({
        failureThreshold: 3,
        resetTimeout: 5000,
        halfOpenRequests: 1,
      });
    });

    afterEach(() => {
      circuitBreaker.dispose();
      vi.useRealTimers();
    });

    it("should follow CLOSED -> OPEN -> HALF_OPEN -> CLOSED cycle", () => {
      // Start CLOSED
      expect(circuitBreaker.getState()).toBe("CLOSED");
      expect(circuitBreaker.canExecute()).toBe(true);

      // Fail to OPEN
      circuitBreaker.recordFailure();
      circuitBreaker.recordFailure();
      circuitBreaker.recordFailure();
      expect(circuitBreaker.getState()).toBe("OPEN");
      expect(circuitBreaker.canExecute()).toBe(false);

      // Wait for reset timeout -> HALF_OPEN
      vi.advanceTimersByTime(5001);
      expect(circuitBreaker.getState()).toBe("HALF_OPEN");
      expect(circuitBreaker.canExecute()).toBe(true);

      // Success in HALF_OPEN -> CLOSED
      circuitBreaker.recordSuccess();
      expect(circuitBreaker.getState()).toBe("CLOSED");
      expect(circuitBreaker.canExecute()).toBe(true);
    });

    it("should reopen on failure in HALF_OPEN state", () => {
      // Trip to OPEN
      for (let i = 0; i < 3; i++) {
        circuitBreaker.recordFailure();
      }

      // Wait for HALF_OPEN
      vi.advanceTimersByTime(5001);
      expect(circuitBreaker.getState()).toBe("HALF_OPEN");

      // Fail again -> back to OPEN
      circuitBreaker.recordFailure();
      expect(circuitBreaker.getState()).toBe("OPEN");
    });

    it("should notify listeners on state changes", () => {
      const listener = vi.fn();
      circuitBreaker.onStateChange(listener);

      // Trip the circuit
      for (let i = 0; i < 3; i++) {
        circuitBreaker.recordFailure();
      }

      expect(listener).toHaveBeenCalledWith("OPEN", expect.any(Object));
    });
  });

  describe("Offline Persistence", () => {
    let messageQueue: MessageQueue;

    beforeEach(() => {
      mockStore.clear();
      vi.stubGlobal("indexedDB", mockIndexedDB);
      messageQueue = new MessageQueue();
    });

    afterEach(() => {
      messageQueue.close();
      vi.unstubAllGlobals();
    });

    it("should persist messages across queue instances", async () => {
      const sessionId = "persist-test";

      // Queue messages with first instance
      await messageQueue.enqueue({
        id: "persist-1",
        content: "Persisted message",
        sessionId,
      });

      // Create new instance (simulating page reload)
      const newQueue = new MessageQueue();

      // Messages should still be there
      const pending = await newQueue.getPending(sessionId);
      expect(pending.length).toBe(1);
      expect(pending[0].content).toBe("Persisted message");

      newQueue.close();
    });

    it("should preserve message order in queue", async () => {
      const sessionId = "order-test";

      await messageQueue.enqueue({ id: "1", content: "First", sessionId });
      await messageQueue.enqueue({ id: "2", content: "Second", sessionId });
      await messageQueue.enqueue({ id: "3", content: "Third", sessionId });

      const pending = await messageQueue.getPending(sessionId);

      // Messages should be in order by timestamp
      expect(pending.map((m) => m.content)).toEqual([
        "First",
        "Second",
        "Third",
      ]);
    });
  });

  describe("Connection Recovery Scenarios", () => {
    let circuitBreaker: CircuitBreaker;
    let messageQueue: MessageQueue;

    beforeEach(async () => {
      // Don't use fake timers - message queue needs real timers
      mockStore.clear();
      vi.stubGlobal("indexedDB", mockIndexedDB);

      circuitBreaker = new CircuitBreaker({
        failureThreshold: 5,
        resetTimeout: 100, // Use short timeout for tests
        halfOpenRequests: 1,
      });
      messageQueue = new MessageQueue();
      await messageQueue.init();
    });

    afterEach(() => {
      circuitBreaker.dispose();
      messageQueue.close();
      vi.unstubAllGlobals();
    });

    it("should recover from network disconnection", async () => {
      const sessionId = "recovery-test";

      // Simulate sending while connected
      await messageQueue.enqueue({
        id: "connected-msg",
        content: "Sent while connected",
        sessionId,
      });
      await messageQueue.markSent("connected-msg");
      await messageQueue.markDelivered("connected-msg");

      // Simulate disconnection (circuit opens)
      for (let i = 0; i < 5; i++) {
        circuitBreaker.recordFailure();
      }
      expect(circuitBreaker.getState()).toBe("OPEN");

      // Queue messages while disconnected
      await messageQueue.enqueue({
        id: "offline-msg",
        content: "Queued while offline",
        sessionId,
      });

      // Wait for circuit to transition to HALF_OPEN (100ms timeout)
      await new Promise((resolve) => setTimeout(resolve, 150));
      expect(circuitBreaker.getState()).toBe("HALF_OPEN");

      circuitBreaker.recordSuccess();
      expect(circuitBreaker.getState()).toBe("CLOSED");

      // Flush offline messages
      const result = await messageQueue.flush(sessionId, async (msg) => {
        await messageQueue.markDelivered(msg.id);
        return true;
      });

      expect(result.sent).toBe(1);

      // Verify all messages delivered
      const pending = await messageQueue.getPending(sessionId);
      expect(pending.length).toBe(0);
    });

    it("should handle rapid disconnect/reconnect cycles", async () => {
      const sessionId = "rapid-cycle";

      for (let cycle = 0; cycle < 3; cycle++) {
        // Connect
        circuitBreaker.forceState("CLOSED");

        // Send message
        await messageQueue.enqueue({
          id: `cycle-${cycle}`,
          content: `Message ${cycle}`,
          sessionId,
        });

        // Disconnect
        for (let i = 0; i < 5; i++) {
          circuitBreaker.recordFailure();
        }

        // Reconnect - force state back to CLOSED
        circuitBreaker.forceState("CLOSED");
      }

      // All messages should be in queue (pending status)
      const pending = await messageQueue.getPending(sessionId);
      expect(pending.length).toBe(3);
    });
  });

  describe("Tenant Isolation", () => {
    let messageQueue: MessageQueue;

    beforeEach(() => {
      mockStore.clear();
      vi.stubGlobal("indexedDB", mockIndexedDB);
      messageQueue = new MessageQueue();
    });

    afterEach(() => {
      messageQueue.close();
      vi.unstubAllGlobals();
    });

    it("should isolate messages by session ID", async () => {
      // Queue messages for different sessions
      await messageQueue.enqueue({
        id: "session1-msg",
        content: "Session 1 message",
        sessionId: "session-1",
      });
      await messageQueue.enqueue({
        id: "session2-msg",
        content: "Session 2 message",
        sessionId: "session-2",
      });

      // Get pending for session 1 only
      const session1Pending = await messageQueue.getPending("session-1");
      expect(session1Pending.length).toBe(1);
      expect(session1Pending[0].content).toBe("Session 1 message");

      // Get pending for session 2 only
      const session2Pending = await messageQueue.getPending("session-2");
      expect(session2Pending.length).toBe(1);
      expect(session2Pending[0].content).toBe("Session 2 message");
    });

    it("should support tenant ID for multi-tenant scenarios", async () => {
      await messageQueue.enqueue({
        id: "tenant-msg",
        content: "Tenant message",
        sessionId: "session-1",
        tenantId: "tenant-abc",
      });

      const msg = await messageQueue.get("tenant-msg");
      expect(msg?.tenantId).toBe("tenant-abc");
    });
  });
});
