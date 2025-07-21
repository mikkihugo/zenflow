/**
 * Circuit Breaker Middleware for Vision-to-Code Services
 * Implements the Circuit Breaker pattern for fault tolerance
 */

const EventEmitter = require('events');

class CircuitBreaker extends EventEmitter {
  constructor(options = {}) {
    super();
    
    this.config = {
      timeout: options.timeout || 30000, // 30 seconds
      errorThreshold: options.errorThreshold || 50, // percentage
      volumeThreshold: options.volumeThreshold || 20, // minimum requests
      resetTimeout: options.resetTimeout || 60000, // 1 minute
      monitoringPeriod: options.monitoringPeriod || 60000, // 1 minute
      name: options.name || 'circuit-breaker'
    };

    // Circuit states
    this.STATES = {
      CLOSED: 'CLOSED',
      OPEN: 'OPEN',
      HALF_OPEN: 'HALF_OPEN'
    };

    // Initialize state
    this.state = this.STATES.CLOSED;
    this.stats = {
      totalRequests: 0,
      failedRequests: 0,
      successfulRequests: 0,
      rejectedRequests: 0,
      timeouts: 0
    };
    
    // Monitoring window
    this.window = {
      start: Date.now(),
      requests: [],
      failures: 0,
      successes: 0
    };

    // State transition timers
    this.resetTimer = null;
    this.monitoringTimer = null;

    // Start monitoring
    this.startMonitoring();
  }

  /**
   * Start monitoring window
   */
  startMonitoring() {
    this.monitoringTimer = setInterval(() => {
      this.resetWindow();
    }, this.config.monitoringPeriod);
  }

  /**
   * Reset monitoring window
   */
  resetWindow() {
    const now = Date.now();
    const cutoff = now - this.config.monitoringPeriod;
    
    // Remove old requests from window
    this.window.requests = this.window.requests.filter(req => req.timestamp > cutoff);
    
    // Recalculate window stats
    this.window.failures = this.window.requests.filter(req => !req.success).length;
    this.window.successes = this.window.requests.filter(req => req.success).length;
    
    this.emit('window-reset', {
      requests: this.window.requests.length,
      failures: this.window.failures,
      successes: this.window.successes
    });
  }

  /**
   * Record a request result
   */
  recordRequest(success, duration) {
    const request = {
      timestamp: Date.now(),
      success,
      duration
    };

    this.window.requests.push(request);
    this.stats.totalRequests++;

    if (success) {
      this.stats.successfulRequests++;
      this.window.successes++;
    } else {
      this.stats.failedRequests++;
      this.window.failures++;
    }

    // Check if we should transition states
    this.evaluateState();
  }

  /**
   * Evaluate if state transition is needed
   */
  evaluateState() {
    const totalInWindow = this.window.requests.length;
    const failureRate = totalInWindow > 0 ? (this.window.failures / totalInWindow) * 100 : 0;

    switch (this.state) {
      case this.STATES.CLOSED:
        // Check if we should open the circuit
        if (totalInWindow >= this.config.volumeThreshold && 
            failureRate >= this.config.errorThreshold) {
          this.open();
        }
        break;

      case this.STATES.HALF_OPEN:
        // If we see any failure in half-open state, open the circuit
        if (this.window.failures > 0) {
          this.open();
        } else if (this.window.successes >= this.config.volumeThreshold) {
          // If we have enough successful requests, close the circuit
          this.close();
        }
        break;

      case this.STATES.OPEN:
        // State transition handled by timer
        break;
    }
  }

  /**
   * Open the circuit
   */
  open() {
    this.state = this.STATES.OPEN;
    this.emit('open', {
      name: this.config.name,
      stats: this.getStats()
    });

    // Clear any existing timer
    if (this.resetTimer) {
      clearTimeout(this.resetTimer);
    }

    // Set timer to transition to half-open
    this.resetTimer = setTimeout(() => {
      this.halfOpen();
    }, this.config.resetTimeout);
  }

  /**
   * Set circuit to half-open state
   */
  halfOpen() {
    this.state = this.STATES.HALF_OPEN;
    this.resetWindow(); // Start fresh for half-open testing
    this.emit('half-open', {
      name: this.config.name
    });
  }

  /**
   * Close the circuit
   */
  close() {
    this.state = this.STATES.CLOSED;
    this.emit('close', {
      name: this.config.name
    });

    // Clear reset timer
    if (this.resetTimer) {
      clearTimeout(this.resetTimer);
      this.resetTimer = null;
    }
  }

  /**
   * Check if request should be allowed
   */
  canRequest() {
    return this.state !== this.STATES.OPEN;
  }

  /**
   * Express middleware factory
   */
  middleware(asyncFunction) {
    return async (req, res, next) => {
      // Check if circuit is open
      if (!this.canRequest()) {
        this.stats.rejectedRequests++;
        
        return res.status(503).json({
          error: {
            code: 'CIRCUIT_BREAKER_OPEN',
            message: 'Service temporarily unavailable',
            details: {
              service: this.config.name,
              retryAfter: this.config.resetTimeout / 1000
            }
          }
        });
      }

      const start = Date.now();
      let timeoutHandle;
      let isTimedOut = false;

      // Set up timeout
      const timeoutPromise = new Promise((_, reject) => {
        timeoutHandle = setTimeout(() => {
          isTimedOut = true;
          reject(new Error('Request timeout'));
        }, this.config.timeout);
      });

      try {
        // Execute the async function with timeout
        const result = await Promise.race([
          asyncFunction(req, res, next),
          timeoutPromise
        ]);

        // Clear timeout
        clearTimeout(timeoutHandle);

        // Record success
        const duration = Date.now() - start;
        this.recordRequest(true, duration);

        return result;
      } catch (error) {
        // Clear timeout
        if (timeoutHandle) {
          clearTimeout(timeoutHandle);
        }

        const duration = Date.now() - start;

        if (isTimedOut) {
          this.stats.timeouts++;
          this.recordRequest(false, duration);
          
          return res.status(504).json({
            error: {
              code: 'GATEWAY_TIMEOUT',
              message: 'Request timeout',
              details: {
                timeout: this.config.timeout,
                service: this.config.name
              }
            }
          });
        }

        // Record failure
        this.recordRequest(false, duration);

        // Re-throw the error for normal error handling
        throw error;
      }
    };
  }

  /**
   * Wrap an async function with circuit breaker
   */
  protect(asyncFunction) {
    return async (...args) => {
      if (!this.canRequest()) {
        this.stats.rejectedRequests++;
        throw new Error(`Circuit breaker is open for ${this.config.name}`);
      }

      const start = Date.now();
      
      try {
        const result = await asyncFunction(...args);
        const duration = Date.now() - start;
        this.recordRequest(true, duration);
        return result;
      } catch (error) {
        const duration = Date.now() - start;
        this.recordRequest(false, duration);
        throw error;
      }
    };
  }

  /**
   * Get current stats
   */
  getStats() {
    const totalInWindow = this.window.requests.length;
    const failureRate = totalInWindow > 0 ? (this.window.failures / totalInWindow) * 100 : 0;

    return {
      state: this.state,
      stats: this.stats,
      window: {
        total: totalInWindow,
        failures: this.window.failures,
        successes: this.window.successes,
        failureRate: failureRate.toFixed(2) + '%'
      },
      config: this.config
    };
  }

  /**
   * Force state change (for testing/manual intervention)
   */
  forceOpen() {
    this.open();
  }

  forceClose() {
    this.close();
  }

  /**
   * Clean up
   */
  destroy() {
    if (this.monitoringTimer) {
      clearInterval(this.monitoringTimer);
    }
    if (this.resetTimer) {
      clearTimeout(this.resetTimer);
    }
    this.removeAllListeners();
  }
}

/**
 * Create a circuit breaker registry for managing multiple breakers
 */
class CircuitBreakerRegistry {
  constructor() {
    this.breakers = new Map();
  }

  /**
   * Get or create a circuit breaker
   */
  getBreaker(name, options = {}) {
    if (!this.breakers.has(name)) {
      const breaker = new CircuitBreaker({ ...options, name });
      this.breakers.set(name, breaker);
    }
    return this.breakers.get(name);
  }

  /**
   * Get all breakers
   */
  getAllBreakers() {
    return Array.from(this.breakers.values());
  }

  /**
   * Get stats for all breakers
   */
  getAllStats() {
    const stats = {};
    for (const [name, breaker] of this.breakers) {
      stats[name] = breaker.getStats();
    }
    return stats;
  }

  /**
   * Destroy all breakers
   */
  destroyAll() {
    for (const breaker of this.breakers.values()) {
      breaker.destroy();
    }
    this.breakers.clear();
  }
}

// Global registry
const registry = new CircuitBreakerRegistry();

module.exports = {
  CircuitBreaker,
  CircuitBreakerRegistry,
  registry
};