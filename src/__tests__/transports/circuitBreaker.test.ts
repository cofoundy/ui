import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  CircuitBreaker,
  CircuitBreakerOpenError,
  createCircuitBreaker,
} from "../../transports/circuitBreaker";

describe("CircuitBreaker", () => {
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

  describe("Initial State", () => {
    it("should start in CLOSED state", () => {
      expect(circuitBreaker.getState()).toBe("CLOSED");
    });

    it("should allow execution when CLOSED", () => {
      expect(circuitBreaker.canExecute()).toBe(true);
    });

    it("should have zero failures initially", () => {
      const stats = circuitBreaker.getStats();
      expect(stats.failures).toBe(0);
      expect(stats.successes).toBe(0);
    });
  });

  describe("State Transitions: CLOSED → OPEN", () => {
    it("should open circuit after threshold failures", () => {
      // Record failures up to threshold
      circuitBreaker.recordFailure();
      circuitBreaker.recordFailure();
      expect(circuitBreaker.getState()).toBe("CLOSED");

      circuitBreaker.recordFailure(); // 3rd failure = threshold
      expect(circuitBreaker.getState()).toBe("OPEN");
    });

    it("should not allow execution when OPEN", () => {
      // Trip the circuit
      for (let i = 0; i < 3; i++) {
        circuitBreaker.recordFailure();
      }

      expect(circuitBreaker.getState()).toBe("OPEN");
      expect(circuitBreaker.canExecute()).toBe(false);
    });

    it("should track failure count correctly", () => {
      circuitBreaker.recordFailure();
      circuitBreaker.recordFailure();

      const stats = circuitBreaker.getStats();
      expect(stats.failures).toBe(2);
    });
  });

  describe("State Transitions: OPEN → HALF_OPEN", () => {
    it("should transition to HALF_OPEN after resetTimeout", () => {
      // Trip the circuit
      for (let i = 0; i < 3; i++) {
        circuitBreaker.recordFailure();
      }
      expect(circuitBreaker.getState()).toBe("OPEN");

      // Advance time past resetTimeout
      vi.advanceTimersByTime(5001);

      expect(circuitBreaker.getState()).toBe("HALF_OPEN");
    });

    it("should allow limited requests in HALF_OPEN state", () => {
      // Trip and wait for half-open
      for (let i = 0; i < 3; i++) {
        circuitBreaker.recordFailure();
      }
      vi.advanceTimersByTime(5001);

      expect(circuitBreaker.getState()).toBe("HALF_OPEN");
      expect(circuitBreaker.canExecute()).toBe(true);
    });

    it("should return correct time until reset when OPEN", () => {
      for (let i = 0; i < 3; i++) {
        circuitBreaker.recordFailure();
      }

      vi.advanceTimersByTime(2000);
      const timeUntilReset = circuitBreaker.getTimeUntilReset();

      // Should be approximately 3000ms remaining
      expect(timeUntilReset).toBeGreaterThan(2500);
      expect(timeUntilReset).toBeLessThanOrEqual(3000);
    });
  });

  describe("State Transitions: HALF_OPEN → CLOSED", () => {
    it("should close circuit on success in HALF_OPEN state", () => {
      // Trip and wait for half-open
      for (let i = 0; i < 3; i++) {
        circuitBreaker.recordFailure();
      }
      vi.advanceTimersByTime(5001);
      expect(circuitBreaker.getState()).toBe("HALF_OPEN");

      // Record success
      circuitBreaker.recordSuccess();

      expect(circuitBreaker.getState()).toBe("CLOSED");
    });

    it("should reset failure count when closing from HALF_OPEN", () => {
      // Trip and recover
      for (let i = 0; i < 3; i++) {
        circuitBreaker.recordFailure();
      }
      vi.advanceTimersByTime(5001);
      circuitBreaker.recordSuccess();

      const stats = circuitBreaker.getStats();
      expect(stats.failures).toBe(0);
    });
  });

  describe("State Transitions: HALF_OPEN → OPEN", () => {
    it("should reopen circuit on failure in HALF_OPEN state", () => {
      // Trip and wait for half-open
      for (let i = 0; i < 3; i++) {
        circuitBreaker.recordFailure();
      }
      vi.advanceTimersByTime(5001);
      expect(circuitBreaker.getState()).toBe("HALF_OPEN");

      // Record failure
      circuitBreaker.recordFailure();

      expect(circuitBreaker.getState()).toBe("OPEN");
    });
  });

  describe("Execute Method", () => {
    it("should execute operation when circuit is CLOSED", async () => {
      const operation = vi.fn().mockResolvedValue("success");

      const result = await circuitBreaker.execute(operation);

      expect(result).toBe("success");
      expect(operation).toHaveBeenCalled();
    });

    it("should throw CircuitBreakerOpenError when OPEN", async () => {
      // Trip the circuit
      for (let i = 0; i < 3; i++) {
        circuitBreaker.recordFailure();
      }

      const operation = vi.fn().mockResolvedValue("success");

      await expect(circuitBreaker.execute(operation)).rejects.toThrow(
        CircuitBreakerOpenError
      );
      expect(operation).not.toHaveBeenCalled();
    });

    it("should record success on successful execution", async () => {
      const operation = vi.fn().mockResolvedValue("success");

      await circuitBreaker.execute(operation);

      const stats = circuitBreaker.getStats();
      expect(stats.successes).toBe(1);
    });

    it("should record failure and rethrow on failed execution", async () => {
      const error = new Error("test error");
      const operation = vi.fn().mockRejectedValue(error);

      await expect(circuitBreaker.execute(operation)).rejects.toThrow(error);

      const stats = circuitBreaker.getStats();
      expect(stats.failures).toBe(1);
    });
  });

  describe("Success Decay", () => {
    it("should decay failures on success when CLOSED", () => {
      circuitBreaker.recordFailure();
      circuitBreaker.recordFailure();
      expect(circuitBreaker.getStats().failures).toBe(2);

      circuitBreaker.recordSuccess();
      expect(circuitBreaker.getStats().failures).toBe(1);

      circuitBreaker.recordSuccess();
      expect(circuitBreaker.getStats().failures).toBe(0);
    });
  });

  describe("State Change Listeners", () => {
    it("should notify listeners on state change", () => {
      const listener = vi.fn();
      circuitBreaker.onStateChange(listener);

      // Trip the circuit
      for (let i = 0; i < 3; i++) {
        circuitBreaker.recordFailure();
      }

      expect(listener).toHaveBeenCalledWith("OPEN", expect.any(Object));
    });

    it("should allow removing listeners", () => {
      const listener = vi.fn();
      const unsubscribe = circuitBreaker.onStateChange(listener);

      unsubscribe();

      // Trip the circuit
      for (let i = 0; i < 3; i++) {
        circuitBreaker.recordFailure();
      }

      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe("Force State", () => {
    it("should allow forcing state to CLOSED", () => {
      // Trip the circuit
      for (let i = 0; i < 3; i++) {
        circuitBreaker.recordFailure();
      }
      expect(circuitBreaker.getState()).toBe("OPEN");

      circuitBreaker.forceState("CLOSED");

      expect(circuitBreaker.getState()).toBe("CLOSED");
      expect(circuitBreaker.getStats().failures).toBe(0);
    });

    it("should allow forcing state to OPEN", () => {
      // Force state to OPEN
      circuitBreaker.forceState("OPEN");

      // canExecute should return false when OPEN
      expect(circuitBreaker.canExecute()).toBe(false);

      // getTimeUntilReset should return a positive value
      expect(circuitBreaker.getTimeUntilReset()).toBeGreaterThan(0);

      // After resetTimeout, should transition to HALF_OPEN
      vi.advanceTimersByTime(5001);
      expect(circuitBreaker.getState()).toBe("HALF_OPEN");
    });
  });

  describe("Factory Function", () => {
    it("should create circuit breaker with custom config", () => {
      const cb = createCircuitBreaker({
        failureThreshold: 10,
        resetTimeout: 30000,
      });

      expect(cb.getState()).toBe("CLOSED");

      // Verify custom threshold
      for (let i = 0; i < 9; i++) {
        cb.recordFailure();
      }
      expect(cb.getState()).toBe("CLOSED");

      cb.recordFailure(); // 10th failure
      expect(cb.getState()).toBe("OPEN");

      cb.dispose();
    });

    it("should use default config when not provided", () => {
      const cb = createCircuitBreaker();
      expect(cb.getState()).toBe("CLOSED");

      // Default threshold is 5
      for (let i = 0; i < 4; i++) {
        cb.recordFailure();
      }
      expect(cb.getState()).toBe("CLOSED");

      cb.recordFailure(); // 5th failure
      expect(cb.getState()).toBe("OPEN");

      cb.dispose();
    });
  });

  describe("CircuitBreakerOpenError", () => {
    it("should include stats in error", async () => {
      // Trip the circuit
      for (let i = 0; i < 3; i++) {
        circuitBreaker.recordFailure();
      }

      try {
        await circuitBreaker.execute(async () => "test");
        expect.fail("Should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(CircuitBreakerOpenError);
        expect((error as CircuitBreakerOpenError).stats.state).toBe("OPEN");
        expect((error as CircuitBreakerOpenError).stats.failures).toBe(3);
      }
    });
  });
});
