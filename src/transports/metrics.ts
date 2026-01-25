/**
 * Connection Metrics Collector
 *
 * Tracks connection health and performance metrics for monitoring
 * and debugging chat widget reliability.
 */

export interface ConnectionMetrics {
  /** Total connection attempts */
  connectionAttempts: number;
  /** Successful connections */
  successfulConnections: number;
  /** Failed connection attempts */
  failedConnections: number;
  /** Reconnection attempts */
  reconnectAttempts: number;
  /** Messages sent */
  messagesSent: number;
  /** Messages delivered (acknowledged) */
  messagesDelivered: number;
  /** Messages failed */
  messagesFailed: number;
  /** Average latency in ms */
  averageLatencyMs: number;
  /** Last successful connection time */
  lastConnectTime: number | null;
  /** Last disconnection time */
  lastDisconnectTime: number | null;
  /** Total time connected in ms */
  totalConnectedTimeMs: number;
  /** Current session start time */
  sessionStartTime: number;
  /** Connection uptime percentage */
  uptimePercentage: number;
}

export interface MetricsEvent {
  type: "connection" | "reconnect" | "disconnect" | "message_sent" | "message_delivered" | "message_failed" | "error";
  timestamp: number;
  data?: Record<string, unknown>;
}

export type MetricsListener = (metrics: ConnectionMetrics, event: MetricsEvent) => void;

/**
 * Connection Metrics Collector
 */
export class ConnectionMetricsCollector {
  private metrics: ConnectionMetrics;
  private listeners: Set<MetricsListener> = new Set();
  private latencyBuffer: number[] = [];
  private maxLatencyBuffer = 100;
  private connectStartTime: number | null = null;
  private eventHistory: MetricsEvent[] = [];
  private maxEventHistory = 1000;

  constructor() {
    this.metrics = {
      connectionAttempts: 0,
      successfulConnections: 0,
      failedConnections: 0,
      reconnectAttempts: 0,
      messagesSent: 0,
      messagesDelivered: 0,
      messagesFailed: 0,
      averageLatencyMs: 0,
      lastConnectTime: null,
      lastDisconnectTime: null,
      totalConnectedTimeMs: 0,
      sessionStartTime: Date.now(),
      uptimePercentage: 0,
    };
  }

  /**
   * Record a connection attempt
   */
  recordConnectionAttempt(): void {
    this.metrics.connectionAttempts++;
    this.connectStartTime = Date.now();
    this.emitEvent({ type: "connection", timestamp: Date.now() });
  }

  /**
   * Record a successful connection
   */
  recordConnection(): void {
    const now = Date.now();
    this.metrics.successfulConnections++;
    this.metrics.lastConnectTime = now;

    // Calculate connection latency if we have a start time
    if (this.connectStartTime) {
      const latency = now - this.connectStartTime;
      this.recordLatency(latency);
      this.connectStartTime = null;
    }

    this.updateUptime();
    this.emitEvent({ type: "connection", timestamp: now, data: { success: true } });
  }

  /**
   * Record a failed connection
   */
  recordConnectionFailure(error?: string): void {
    this.metrics.failedConnections++;
    this.connectStartTime = null;
    this.emitEvent({ type: "error", timestamp: Date.now(), data: { error } });
  }

  /**
   * Record a reconnection attempt
   */
  recordReconnect(): void {
    this.metrics.reconnectAttempts++;
    this.connectStartTime = Date.now();
    this.emitEvent({ type: "reconnect", timestamp: Date.now() });
  }

  /**
   * Record a disconnection
   */
  recordDisconnect(reason?: string): void {
    const now = Date.now();

    // Update total connected time
    if (this.metrics.lastConnectTime) {
      this.metrics.totalConnectedTimeMs += now - this.metrics.lastConnectTime;
    }

    this.metrics.lastDisconnectTime = now;
    this.updateUptime();
    this.emitEvent({ type: "disconnect", timestamp: now, data: { reason } });
  }

  /**
   * Record a message sent
   */
  recordMessageSent(messageId?: string): void {
    this.metrics.messagesSent++;
    this.emitEvent({ type: "message_sent", timestamp: Date.now(), data: { messageId } });
  }

  /**
   * Record a message delivered (acknowledged)
   */
  recordMessageDelivered(messageId?: string, latencyMs?: number): void {
    this.metrics.messagesDelivered++;
    if (latencyMs !== undefined) {
      this.recordLatency(latencyMs);
    }
    this.emitEvent({ type: "message_delivered", timestamp: Date.now(), data: { messageId, latencyMs } });
  }

  /**
   * Record a message failure
   */
  recordMessageFailed(messageId?: string, error?: string): void {
    this.metrics.messagesFailed++;
    this.emitEvent({ type: "message_failed", timestamp: Date.now(), data: { messageId, error } });
  }

  /**
   * Record latency sample
   */
  private recordLatency(latencyMs: number): void {
    this.latencyBuffer.push(latencyMs);
    if (this.latencyBuffer.length > this.maxLatencyBuffer) {
      this.latencyBuffer.shift();
    }
    this.metrics.averageLatencyMs = this.calculateAverageLatency();
  }

  /**
   * Calculate average latency from buffer
   */
  private calculateAverageLatency(): number {
    if (this.latencyBuffer.length === 0) return 0;
    const sum = this.latencyBuffer.reduce((a, b) => a + b, 0);
    return Math.round(sum / this.latencyBuffer.length);
  }

  /**
   * Update uptime percentage
   */
  private updateUptime(): void {
    const totalSessionTime = Date.now() - this.metrics.sessionStartTime;
    if (totalSessionTime > 0) {
      this.metrics.uptimePercentage = Math.round((this.metrics.totalConnectedTimeMs / totalSessionTime) * 100);
    }
  }

  /**
   * Emit event to listeners
   */
  private emitEvent(event: MetricsEvent): void {
    // Store event in history
    this.eventHistory.push(event);
    if (this.eventHistory.length > this.maxEventHistory) {
      this.eventHistory.shift();
    }

    // Notify listeners
    this.listeners.forEach((listener) => {
      try {
        listener(this.getMetrics(), event);
      } catch (e) {
        console.error("[Metrics] Listener error:", e);
      }
    });
  }

  /**
   * Get current metrics snapshot
   */
  getMetrics(): ConnectionMetrics {
    // Update uptime before returning
    this.updateUptime();
    return { ...this.metrics };
  }

  /**
   * Get event history
   */
  getEventHistory(): MetricsEvent[] {
    return [...this.eventHistory];
  }

  /**
   * Get connection success rate
   */
  getConnectionSuccessRate(): number {
    if (this.metrics.connectionAttempts === 0) return 100;
    return Math.round((this.metrics.successfulConnections / this.metrics.connectionAttempts) * 100);
  }

  /**
   * Get message delivery rate
   */
  getMessageDeliveryRate(): number {
    if (this.metrics.messagesSent === 0) return 100;
    return Math.round((this.metrics.messagesDelivered / this.metrics.messagesSent) * 100);
  }

  /**
   * Add metrics listener
   */
  onMetrics(listener: MetricsListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Reset all metrics
   */
  reset(): void {
    this.metrics = {
      connectionAttempts: 0,
      successfulConnections: 0,
      failedConnections: 0,
      reconnectAttempts: 0,
      messagesSent: 0,
      messagesDelivered: 0,
      messagesFailed: 0,
      averageLatencyMs: 0,
      lastConnectTime: null,
      lastDisconnectTime: null,
      totalConnectedTimeMs: 0,
      sessionStartTime: Date.now(),
      uptimePercentage: 0,
    };
    this.latencyBuffer = [];
    this.eventHistory = [];
    this.connectStartTime = null;
  }

  /**
   * Export metrics as JSON for reporting
   */
  toJSON(): Record<string, unknown> {
    return {
      ...this.getMetrics(),
      connectionSuccessRate: this.getConnectionSuccessRate(),
      messageDeliveryRate: this.getMessageDeliveryRate(),
      recentEvents: this.eventHistory.slice(-10),
    };
  }
}

/**
 * Singleton metrics collector instance
 */
let defaultCollector: ConnectionMetricsCollector | null = null;

export function getMetricsCollector(): ConnectionMetricsCollector {
  if (!defaultCollector) {
    defaultCollector = new ConnectionMetricsCollector();
  }
  return defaultCollector;
}

/**
 * Create a new metrics collector instance
 */
export function createMetricsCollector(): ConnectionMetricsCollector {
  return new ConnectionMetricsCollector();
}
