/**
 * IndexedDB Message Queue for Offline Support
 *
 * Provides persistent message queue that survives page refreshes and
 * offline periods. Messages are queued locally and flushed when connection
 * is restored.
 */

export type MessageStatus = "pending" | "sending" | "sent" | "delivered" | "failed";

export interface QueuedMessage {
  /** Unique message ID (UUID) */
  id: string;
  /** Message content */
  content: string;
  /** When the message was queued */
  timestamp: number;
  /** Current status */
  status: MessageStatus;
  /** Number of send attempts */
  retryCount: number;
  /** Session ID for this message */
  sessionId: string;
  /** Tenant ID (for multi-tenant support) */
  tenantId?: string;
  /** Last error message if failed */
  lastError?: string;
}

export interface MessageQueueConfig {
  /** Database name (default: 'cofoundy-message-queue') */
  dbName?: string;
  /** Store name (default: 'messages') */
  storeName?: string;
  /** Max retry attempts before marking as failed (default: 3) */
  maxRetries?: number;
  /** TTL for messages in ms (default: 24 hours) */
  messageTTL?: number;
}

const DEFAULT_CONFIG: Required<MessageQueueConfig> = {
  dbName: "cofoundy-message-queue",
  storeName: "messages",
  maxRetries: 3,
  messageTTL: 24 * 60 * 60 * 1000, // 24 hours
};

/**
 * IndexedDB-backed Message Queue
 */
export class MessageQueue {
  private db: IDBDatabase | null = null;
  private config: Required<MessageQueueConfig>;
  private initPromise: Promise<void> | null = null;

  constructor(config: MessageQueueConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Initialize the IndexedDB database
   */
  async init(): Promise<void> {
    // Prevent multiple initializations
    if (this.initPromise) {
      return this.initPromise;
    }

    if (this.db) {
      return;
    }

    // Check for IndexedDB support
    if (typeof window === "undefined" || !window.indexedDB) {
      console.warn("[MessageQueue] IndexedDB not available, using in-memory fallback");
      return;
    }

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(this.config.dbName, 1);

      request.onerror = () => {
        console.error("[MessageQueue] Failed to open database:", request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.debug("[MessageQueue] Database initialized");
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create messages store with indexes
        if (!db.objectStoreNames.contains(this.config.storeName)) {
          const store = db.createObjectStore(this.config.storeName, { keyPath: "id" });
          store.createIndex("status", "status", { unique: false });
          store.createIndex("sessionId", "sessionId", { unique: false });
          store.createIndex("timestamp", "timestamp", { unique: false });
        }
      };
    });

    return this.initPromise;
  }

  /**
   * Ensure database is initialized before operations
   */
  private async ensureDb(): Promise<IDBDatabase | null> {
    if (!this.db) {
      await this.init();
    }
    return this.db;
  }

  /**
   * Enqueue a new message
   */
  async enqueue(message: Omit<QueuedMessage, "status" | "retryCount" | "timestamp">): Promise<QueuedMessage> {
    const db = await this.ensureDb();

    const queuedMessage: QueuedMessage = {
      ...message,
      timestamp: Date.now(),
      status: "pending",
      retryCount: 0,
    };

    if (!db) {
      // Fallback: just return the message without persistence
      console.warn("[MessageQueue] No database, message not persisted");
      return queuedMessage;
    }

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.config.storeName], "readwrite");
      const store = transaction.objectStore(this.config.storeName);
      const request = store.add(queuedMessage);

      request.onerror = () => {
        console.error("[MessageQueue] Failed to enqueue message:", request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        console.debug("[MessageQueue] Message enqueued:", queuedMessage.id);
        resolve(queuedMessage);
      };
    });
  }

  /**
   * Update message status
   */
  async updateStatus(id: string, status: MessageStatus, error?: string): Promise<void> {
    const db = await this.ensureDb();
    if (!db) return;

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.config.storeName], "readwrite");
      const store = transaction.objectStore(this.config.storeName);
      const getRequest = store.get(id);

      getRequest.onerror = () => reject(getRequest.error);

      getRequest.onsuccess = () => {
        const message = getRequest.result as QueuedMessage | undefined;
        if (!message) {
          resolve();
          return;
        }

        message.status = status;
        if (error) {
          message.lastError = error;
        }
        if (status === "sending") {
          message.retryCount++;
        }

        const putRequest = store.put(message);
        putRequest.onerror = () => reject(putRequest.error);
        putRequest.onsuccess = () => {
          console.debug("[MessageQueue] Status updated:", id, status);
          resolve();
        };
      };
    });
  }

  /**
   * Mark message as sent (awaiting ACK)
   */
  async markSending(id: string): Promise<void> {
    return this.updateStatus(id, "sending");
  }

  /**
   * Mark message as sent (received by server)
   */
  async markSent(id: string): Promise<void> {
    return this.updateStatus(id, "sent");
  }

  /**
   * Mark message as delivered (confirmed by server)
   */
  async markDelivered(id: string): Promise<void> {
    return this.updateStatus(id, "delivered");
  }

  /**
   * Mark message as failed
   */
  async markFailed(id: string, error?: string): Promise<void> {
    return this.updateStatus(id, "failed", error);
  }

  /**
   * Get a specific message by ID
   */
  async get(id: string): Promise<QueuedMessage | null> {
    const db = await this.ensureDb();
    if (!db) return null;

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.config.storeName], "readonly");
      const store = transaction.objectStore(this.config.storeName);
      const request = store.get(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || null);
    });
  }

  /**
   * Get all pending messages for a session
   */
  async getPending(sessionId?: string): Promise<QueuedMessage[]> {
    const db = await this.ensureDb();
    if (!db) return [];

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.config.storeName], "readonly");
      const store = transaction.objectStore(this.config.storeName);
      const index = store.index("status");
      const request = index.getAll("pending");

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        let messages = request.result as QueuedMessage[];
        if (sessionId) {
          messages = messages.filter((m) => m.sessionId === sessionId);
        }
        // Sort by timestamp
        messages.sort((a, b) => a.timestamp - b.timestamp);
        resolve(messages);
      };
    });
  }

  /**
   * Get all messages that need retry (sending status with retry count < max)
   */
  async getRetryable(sessionId?: string): Promise<QueuedMessage[]> {
    const db = await this.ensureDb();
    if (!db) return [];

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.config.storeName], "readonly");
      const store = transaction.objectStore(this.config.storeName);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        let messages = request.result as QueuedMessage[];
        messages = messages.filter(
          (m) =>
            (m.status === "pending" || m.status === "sending") &&
            m.retryCount < this.config.maxRetries
        );
        if (sessionId) {
          messages = messages.filter((m) => m.sessionId === sessionId);
        }
        messages.sort((a, b) => a.timestamp - b.timestamp);
        resolve(messages);
      };
    });
  }

  /**
   * Flush all pending messages (call sendFn for each)
   */
  async flush(
    sessionId: string,
    sendFn: (message: QueuedMessage) => Promise<boolean>
  ): Promise<{ sent: number; failed: number }> {
    const pending = await this.getRetryable(sessionId);
    let sent = 0;
    let failed = 0;

    for (const message of pending) {
      try {
        await this.markSending(message.id);
        const success = await sendFn(message);
        if (success) {
          await this.markSent(message.id);
          sent++;
        } else {
          if (message.retryCount >= this.config.maxRetries - 1) {
            await this.markFailed(message.id, "Max retries exceeded");
            failed++;
          }
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : "Unknown error";
        if (message.retryCount >= this.config.maxRetries - 1) {
          await this.markFailed(message.id, errorMsg);
          failed++;
        }
      }
    }

    console.debug("[MessageQueue] Flush complete:", { sent, failed, pending: pending.length });
    return { sent, failed };
  }

  /**
   * Remove a message from the queue
   */
  async remove(id: string): Promise<void> {
    const db = await this.ensureDb();
    if (!db) return;

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.config.storeName], "readwrite");
      const store = transaction.objectStore(this.config.storeName);
      const request = store.delete(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        console.debug("[MessageQueue] Message removed:", id);
        resolve();
      };
    });
  }

  /**
   * Clear all delivered messages
   */
  async clearDelivered(): Promise<number> {
    const db = await this.ensureDb();
    if (!db) return 0;

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.config.storeName], "readwrite");
      const store = transaction.objectStore(this.config.storeName);
      const index = store.index("status");
      const request = index.getAll("delivered");

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const messages = request.result as QueuedMessage[];
        let deleted = 0;

        messages.forEach((msg) => {
          store.delete(msg.id);
          deleted++;
        });

        console.debug("[MessageQueue] Cleared delivered messages:", deleted);
        resolve(deleted);
      };
    });
  }

  /**
   * Clear expired messages (older than TTL)
   */
  async clearExpired(): Promise<number> {
    const db = await this.ensureDb();
    if (!db) return 0;

    const expiryTime = Date.now() - this.config.messageTTL;

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.config.storeName], "readwrite");
      const store = transaction.objectStore(this.config.storeName);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const messages = request.result as QueuedMessage[];
        let deleted = 0;

        messages.forEach((msg) => {
          if (msg.timestamp < expiryTime) {
            store.delete(msg.id);
            deleted++;
          }
        });

        console.debug("[MessageQueue] Cleared expired messages:", deleted);
        resolve(deleted);
      };
    });
  }

  /**
   * Clear all messages for a session
   */
  async clearSession(sessionId: string): Promise<number> {
    const db = await this.ensureDb();
    if (!db) return 0;

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.config.storeName], "readwrite");
      const store = transaction.objectStore(this.config.storeName);
      const index = store.index("sessionId");
      const request = index.getAll(sessionId);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const messages = request.result as QueuedMessage[];
        let deleted = 0;

        messages.forEach((msg) => {
          store.delete(msg.id);
          deleted++;
        });

        console.debug("[MessageQueue] Cleared session messages:", sessionId, deleted);
        resolve(deleted);
      };
    });
  }

  /**
   * Clear entire queue
   */
  async clear(): Promise<void> {
    const db = await this.ensureDb();
    if (!db) return;

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.config.storeName], "readwrite");
      const store = transaction.objectStore(this.config.storeName);
      const request = store.clear();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        console.debug("[MessageQueue] Queue cleared");
        resolve();
      };
    });
  }

  /**
   * Get queue statistics
   */
  async getStats(): Promise<{
    total: number;
    pending: number;
    sending: number;
    sent: number;
    delivered: number;
    failed: number;
  }> {
    const db = await this.ensureDb();
    if (!db) {
      return { total: 0, pending: 0, sending: 0, sent: 0, delivered: 0, failed: 0 };
    }

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.config.storeName], "readonly");
      const store = transaction.objectStore(this.config.storeName);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const messages = request.result as QueuedMessage[];
        const stats = {
          total: messages.length,
          pending: messages.filter((m) => m.status === "pending").length,
          sending: messages.filter((m) => m.status === "sending").length,
          sent: messages.filter((m) => m.status === "sent").length,
          delivered: messages.filter((m) => m.status === "delivered").length,
          failed: messages.filter((m) => m.status === "failed").length,
        };
        resolve(stats);
      };
    });
  }

  /**
   * Close the database connection
   */
  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
      this.initPromise = null;
    }
  }
}

/**
 * Create a singleton message queue instance
 */
let defaultQueue: MessageQueue | null = null;

export function getMessageQueue(config?: MessageQueueConfig): MessageQueue {
  if (!defaultQueue) {
    defaultQueue = new MessageQueue(config);
  }
  return defaultQueue;
}

/**
 * Generate a UUID for message IDs
 */
export function generateMessageId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older browsers
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
