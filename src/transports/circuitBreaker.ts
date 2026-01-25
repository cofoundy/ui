/**
 * Circuit Breaker Pattern Implementation
 *
 * Prevents cascading failures by tracking connection failures and temporarily
 * blocking requests when the failure threshold is exceeded.
 *
 * State Machine:
 * CLOSED → (failures >= threshold) → OPEN → (timeout elapsed) → HALF_OPEN
 * HALF_OPEN → (success) → CLOSED
 * HALF_OPEN → (failure) → OPEN
 */

export type CircuitBreakerState = "CLOSED" | "OPEN" | "HALF_OPEN";

export interface CircuitBreakerConfig {
  /** Number of failures before opening the circuit (default: 5) */
  failureThreshold: number;
  /** Time in ms before attempting to close the circuit (default: 60000ms) */
  resetTimeout: number;
  /** Number of requests to allow in half-open state (default: 1) */
  halfOpenRequests: number;
  /** Optional name for logging */
  name?: string;
}

export interface CircuitBreakerStats {
  state: CircuitBreakerState;
  failures: number;
  successes: number;
  lastFailureTime: number | null;
  lastStateChange: number;
}

export type CircuitBreakerListener = (state: CircuitBreakerState, stats: CircuitBreakerStats) => void;

const DEFAULT_CONFIG: CircuitBreakerConfig = {
  failureThreshold: 5,
  resetTimeout: 60000,
  halfOpenRequests: 1,
};

/**
 * Circuit Breaker for managing connection resilience
 */
export class CircuitBreaker {
  private state: CircuitBreakerState = "CLOSED";
  private failures = 0;
  private successes = 0;
  private halfOpenAttempts = 0;
  private lastFailureTime: number | null = null;
  private lastStateChange: number = Date.now();
  private resetTimer: ReturnType<typeof setTimeout> | null = null;
  private listeners: Set<CircuitBreakerListener> = new Set();
  private config: CircuitBreakerConfig;

  constructor(config: Partial<CircuitBreakerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Get current circuit breaker state
   */
  getState(): CircuitBreakerState {
    // Check if we should transition from OPEN to HALF_OPEN
    if (this.state === "OPEN" && this.shouldAttemptReset()) {
      this.transitionTo("HALF_OPEN");
    }
    return this.state;
  }

  /**
   * Get current statistics
   */
  getStats(): CircuitBreakerStats {
    return {
      state: this.getState(),
      failures: this.failures,
      successes: this.successes,
      lastFailureTime: this.lastFailureTime,
      lastStateChange: this.lastStateChange,
    };
  }

  /**
   * Check if the circuit allows a request to proceed
   */
  canExecute(): boolean {
    const currentState = this.getState();

    if (currentState === "CLOSED") {
      return true;
    }

    if (currentState === "HALF_OPEN") {
      // Allow limited requests in half-open state
      return this.halfOpenAttempts < this.config.halfOpenRequests;
    }

    // OPEN state - reject immediately
    return false;
  }

  /**
   * Execute an async operation with circuit breaker protection
   */
  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (!this.canExecute()) {
      throw new CircuitBreakerOpenError(
        `Circuit breaker is ${this.state}. Try again after ${this.getTimeUntilReset()}ms`,
        this.getStats()
      );
    }

    if (this.state === "HALF_OPEN") {
      this.halfOpenAttempts++;
    }

    try {
      const result = await operation();
      this.recordSuccess();
      return result;
    } catch (error) {
      this.recordFailure();
      throw error;
    }
  }

  /**
   * Record a successful operation
   */
  recordSuccess(): void {
    this.successes++;

    if (this.state === "HALF_OPEN") {
      // Successful request in half-open state - close the circuit
      this.transitionTo("CLOSED");
      this.reset();
    } else if (this.state === "CLOSED") {
      // Decay failures on success (helps prevent flapping)
      if (this.failures > 0) {
        this.failures = Math.max(0, this.failures - 1);
      }
    }

    this.log("success", { failures: this.failures, successes: this.successes });
  }

  /**
   * Record a failed operation
   */
  recordFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.state === "HALF_OPEN") {
      // Failed in half-open state - reopen the circuit
      this.transitionTo("OPEN");
      this.scheduleReset();
    } else if (this.state === "CLOSED") {
      if (this.failures >= this.config.failureThreshold) {
        // Threshold exceeded - open the circuit
        this.transitionTo("OPEN");
        this.scheduleReset();
      }
    }

    this.log("failure", { failures: this.failures, threshold: this.config.failureThreshold });
  }

  /**
   * Manually reset the circuit breaker
   */
  reset(): void {
    this.failures = 0;
    this.halfOpenAttempts = 0;
    if (this.resetTimer) {
      clearTimeout(this.resetTimer);
      this.resetTimer = null;
    }
  }

  /**
   * Force the circuit to a specific state (for testing/admin)
   */
  forceState(state: CircuitBreakerState): void {
    if (state === "CLOSED") {
      this.transitionTo(state);
      this.reset();
    } else if (state === "OPEN") {
      // Set lastFailureTime BEFORE transitionTo to prevent immediate HALF_OPEN transition
      // (transitionTo calls notifyListeners which calls getStats which calls getState)
      this.lastFailureTime = Date.now();
      this.transitionTo(state);
      this.scheduleReset();
    } else {
      this.transitionTo(state);
    }
  }

  /**
   * Add a state change listener
   */
  onStateChange(listener: CircuitBreakerListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Get time until the circuit will attempt to reset (for OPEN state)
   */
  getTimeUntilReset(): number {
    if (this.state !== "OPEN" || !this.lastFailureTime) {
      return 0;
    }
    const elapsed = Date.now() - this.lastFailureTime;
    return Math.max(0, this.config.resetTimeout - elapsed);
  }

  /**
   * Check if enough time has passed to attempt reset
   */
  private shouldAttemptReset(): boolean {
    if (!this.lastFailureTime) return true;
    return Date.now() - this.lastFailureTime >= this.config.resetTimeout;
  }

  /**
   * Schedule automatic transition to HALF_OPEN
   */
  private scheduleReset(): void {
    if (this.resetTimer) {
      clearTimeout(this.resetTimer);
    }

    this.resetTimer = setTimeout(() => {
      if (this.state === "OPEN") {
        this.transitionTo("HALF_OPEN");
      }
    }, this.config.resetTimeout);
  }

  /**
   * Transition to a new state
   */
  private transitionTo(newState: CircuitBreakerState): void {
    const previousState = this.state;
    if (previousState === newState) return;

    this.state = newState;
    this.lastStateChange = Date.now();

    if (newState === "HALF_OPEN") {
      this.halfOpenAttempts = 0;
    }

    this.log("state-change", { from: previousState, to: newState });
    this.notifyListeners();
  }

  /**
   * Notify all listeners of state change
   */
  private notifyListeners(): void {
    const stats = this.getStats();
    this.listeners.forEach((listener) => {
      try {
        listener(this.state, stats);
      } catch (e) {
        console.error("[CircuitBreaker] Listener error:", e);
      }
    });
  }

  /**
   * Internal logging
   */
  private log(event: string, data?: Record<string, unknown>): void {
    const prefix = this.config.name ? `[CircuitBreaker:${this.config.name}]` : "[CircuitBreaker]";
    console.debug(prefix, event, { state: this.state, ...data });
  }

  /**
   * Cleanup resources
   */
  dispose(): void {
    if (this.resetTimer) {
      clearTimeout(this.resetTimer);
      this.resetTimer = null;
    }
    this.listeners.clear();
  }
}

/**
 * Error thrown when circuit breaker is open
 */
export class CircuitBreakerOpenError extends Error {
  constructor(
    message: string,
    public readonly stats: CircuitBreakerStats
  ) {
    super(message);
    this.name = "CircuitBreakerOpenError";
  }
}

/**
 * Create a circuit breaker instance with default config
 */
export function createCircuitBreaker(
  config?: Partial<CircuitBreakerConfig>
): CircuitBreaker {
  return new CircuitBreaker(config);
}
