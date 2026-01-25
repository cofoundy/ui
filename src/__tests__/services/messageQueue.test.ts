import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  MessageQueue,
  getMessageQueue,
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

// Mock indexedDB global
const mockIndexedDB = {
  open: vi.fn(() => {
    const req = mockIDBRequest(mockDB);
    setTimeout(() => req.onsuccess?.(new Event("success")), 0);
    return req;
  }),
};

describe("MessageQueue", () => {
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

  describe("generateMessageId", () => {
    it("should generate a string ID", () => {
      const id = generateMessageId();
      expect(typeof id).toBe("string");
      expect(id.length).toBeGreaterThan(0);
    });

    it("should generate unique IDs", () => {
      // Use real crypto.randomUUID for this test
      const originalRandomUUID = crypto.randomUUID;
      vi.spyOn(crypto, "randomUUID").mockImplementation(() => {
        return originalRandomUUID.call(crypto);
      });

      const ids = new Set<string>();
      for (let i = 0; i < 10; i++) {
        ids.add(generateMessageId());
      }
      expect(ids.size).toBe(10);

      vi.restoreAllMocks();
    });
  });

  describe("enqueue", () => {
    it("should enqueue a message with pending status", async () => {
      const message = await messageQueue.enqueue({
        id: "test-1",
        content: "Hello",
        sessionId: "session-1",
      });

      expect(message.id).toBe("test-1");
      expect(message.content).toBe("Hello");
      expect(message.status).toBe("pending");
      expect(message.retryCount).toBe(0);
      expect(message.timestamp).toBeGreaterThan(0);
    });

    it("should store tenant ID if provided", async () => {
      const message = await messageQueue.enqueue({
        id: "test-2",
        content: "Hello",
        sessionId: "session-1",
        tenantId: "tenant-abc",
      });

      expect(message.tenantId).toBe("tenant-abc");
    });
  });

  describe("updateStatus", () => {
    it("should update message status to sending", async () => {
      await messageQueue.enqueue({
        id: "test-1",
        content: "Hello",
        sessionId: "session-1",
      });

      await messageQueue.markSending("test-1");

      const message = await messageQueue.get("test-1");
      expect(message?.status).toBe("sending");
      expect(message?.retryCount).toBe(1);
    });

    it("should update message status to sent", async () => {
      await messageQueue.enqueue({
        id: "test-1",
        content: "Hello",
        sessionId: "session-1",
      });

      await messageQueue.markSent("test-1");

      const message = await messageQueue.get("test-1");
      expect(message?.status).toBe("sent");
    });

    it("should update message status to delivered", async () => {
      await messageQueue.enqueue({
        id: "test-1",
        content: "Hello",
        sessionId: "session-1",
      });

      await messageQueue.markDelivered("test-1");

      const message = await messageQueue.get("test-1");
      expect(message?.status).toBe("delivered");
    });

    it("should update message status to failed with error", async () => {
      await messageQueue.enqueue({
        id: "test-1",
        content: "Hello",
        sessionId: "session-1",
      });

      await messageQueue.markFailed("test-1", "Connection timeout");

      const message = await messageQueue.get("test-1");
      expect(message?.status).toBe("failed");
      expect(message?.lastError).toBe("Connection timeout");
    });
  });

  describe("getPending", () => {
    it("should return only pending messages", async () => {
      await messageQueue.enqueue({
        id: "test-1",
        content: "Pending 1",
        sessionId: "session-1",
      });
      await messageQueue.enqueue({
        id: "test-2",
        content: "Pending 2",
        sessionId: "session-1",
      });

      // Mark one as sent
      await messageQueue.markSent("test-1");

      const pending = await messageQueue.getPending();
      expect(pending.length).toBe(1);
      expect(pending[0].id).toBe("test-2");
    });

    it("should filter by sessionId", async () => {
      await messageQueue.enqueue({
        id: "test-1",
        content: "Session 1",
        sessionId: "session-1",
      });
      await messageQueue.enqueue({
        id: "test-2",
        content: "Session 2",
        sessionId: "session-2",
      });

      const pending = await messageQueue.getPending("session-1");
      expect(pending.length).toBe(1);
      expect(pending[0].sessionId).toBe("session-1");
    });
  });

  describe("getRetryable", () => {
    it("should return pending messages with retry count below max", async () => {
      await messageQueue.enqueue({
        id: "test-1",
        content: "Hello",
        sessionId: "session-1",
      });

      const retryable = await messageQueue.getRetryable("session-1");
      expect(retryable.length).toBe(1);
    });
  });

  describe("flush", () => {
    it("should send all pending messages", async () => {
      await messageQueue.enqueue({
        id: "test-1",
        content: "Message 1",
        sessionId: "session-1",
      });
      await messageQueue.enqueue({
        id: "test-2",
        content: "Message 2",
        sessionId: "session-1",
      });

      const sendFn = vi.fn().mockResolvedValue(true);
      const result = await messageQueue.flush("session-1", sendFn);

      expect(sendFn).toHaveBeenCalledTimes(2);
      expect(result.sent).toBe(2);
      expect(result.failed).toBe(0);
    });

    it("should track failed messages", async () => {
      // Create a queue with maxRetries = 1 for easier testing
      const testQueue = new MessageQueue({ maxRetries: 1 });
      await testQueue.enqueue({
        id: "test-1",
        content: "Will fail",
        sessionId: "session-1",
      });

      const sendFn = vi.fn().mockResolvedValue(false);
      const result = await testQueue.flush("session-1", sendFn);

      expect(result.failed).toBe(1);
      testQueue.close();
    });
  });

  describe("remove", () => {
    it("should remove a message from the queue", async () => {
      await messageQueue.enqueue({
        id: "test-1",
        content: "Hello",
        sessionId: "session-1",
      });

      await messageQueue.remove("test-1");

      const message = await messageQueue.get("test-1");
      expect(message).toBeNull();
    });
  });

  describe("clear", () => {
    it("should clear all messages", async () => {
      await messageQueue.enqueue({
        id: "test-1",
        content: "Message 1",
        sessionId: "session-1",
      });
      await messageQueue.enqueue({
        id: "test-2",
        content: "Message 2",
        sessionId: "session-1",
      });

      await messageQueue.clear();

      const stats = await messageQueue.getStats();
      expect(stats.total).toBe(0);
    });
  });

  describe("getStats", () => {
    it("should return correct statistics", async () => {
      await messageQueue.enqueue({
        id: "test-1",
        content: "Pending",
        sessionId: "session-1",
      });
      await messageQueue.enqueue({
        id: "test-2",
        content: "To be sent",
        sessionId: "session-1",
      });
      await messageQueue.markSent("test-2");

      const stats = await messageQueue.getStats();
      expect(stats.total).toBe(2);
      expect(stats.pending).toBe(1);
      expect(stats.sent).toBe(1);
    });
  });

  describe("clearSession", () => {
    it("should call clear session without error", async () => {
      await messageQueue.enqueue({
        id: "test-1",
        content: "Session 1",
        sessionId: "session-1",
      });

      // Just verify it doesn't throw
      await expect(messageQueue.clearSession("session-1")).resolves.not.toThrow();
    });
  });

  describe("getMessageQueue singleton", () => {
    it("should return the same instance", () => {
      const queue1 = getMessageQueue();
      const queue2 = getMessageQueue();
      expect(queue1).toBe(queue2);
    });
  });
});
