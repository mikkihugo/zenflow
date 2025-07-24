/**
 * Circuit Breaker Implementation for Queen Operations
 * Provides fault tolerance and prevents cascading failures
 */

import { CliError } from './cli-error.js';

export class CircuitBreaker {
  constructor(options = {}) {
    this.name = options.name || 'default';
    this.failureThreshold = options.failureThreshold || 5;
    this.successThreshold = options.successThreshold || 3;
    this.timeout = options.timeout || 60000; // 60 seconds
    this.monitor = options.monitor || console;
    
    // Simple state management (no locks needed for single-threaded Node.js)
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.failureCount = 0;
    this.successCount = 0;
    this.nextAttempt = Date.now();
    this.lastStateChange = Date.now();
    
    // Statistics
    this.stats = {
      totalRequests: 0,
      totalFailures: 0,
      totalSuccesses: 0,
      lastFailureTime: null,
      lastSuccessTime: null,
      stateChanges: []
    };
  }

  /**
   * Simple state change (synchronous, no locking needed)
   */
  _changeState(newState, updates = {}) {
    const oldState = this.state;
    this.state = newState;
    
    // Apply any additional updates
    Object.assign(this, updates);
    
    if (newState !== oldState) {
      this.lastStateChange = Date.now();
      
      // Bound the state changes array to prevent memory leaks
      this.stats.stateChanges.push({
        from: oldState,
        to: newState,
        timestamp: Date.now(),
        reason: this.getStateChangeReason(oldState, newState)
      });
      
      // Keep only last 50 state changes to prevent memory leak
      if (this.stats.stateChanges.length > 50) {
        this.stats.stateChanges = this.stats.stateChanges.slice(-50);
      }
      
      this.monitor.info(`⚡ Circuit breaker ${this.name}: ${oldState} → ${newState}`);
    }
  }

  /**
   * Get current state (simple read, no locking needed)
   */
  _getState() {
    return {
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      nextAttempt: this.nextAttempt,
      lastStateChange: this.lastStateChange
    };
  }

  /**
   * Execute operation with circuit breaker protection
   */
  async execute(operation, operationName = 'operation') {
    this.stats.totalRequests++;
    
    // Simple state check (no race conditions in single-threaded Node.js)
    if (this.state === 'OPEN') {
      if (Date.now() < this.nextAttempt) {
        const error = new CliError(
          `Circuit breaker ${this.name} is OPEN for ${operationName}`,
          'CIRCUIT_BREAKER_OPEN'
        );
        this.stats.totalFailures++;
        throw error;
      } else {
        // Transition to half-open
        this._changeState('HALF_OPEN', { successCount: 0 });
      }
    }

    try {
      const result = await operation();
      await this.onSuccess();
      return result;
    } catch (error) {
      await this.onFailure(error, operationName);
      throw error;
    }
  }

  /**
   * Handle successful operation
   */
  async onSuccess() {
    this.stats.totalSuccesses++;
    this.stats.lastSuccessTime = Date.now();
    
    // Simple bounds check to prevent counter overflow
    if (this.stats.totalRequests > 10000) {
      this.stats.totalRequests = 0;
      this.stats.totalFailures = 0;
      this.stats.totalSuccesses = 0;
    }
    
    if (this.state === 'HALF_OPEN') {
      this.successCount++;
      
      if (this.successCount >= this.successThreshold) {
        this._changeState('CLOSED', { 
          failureCount: 0, 
          successCount: 0 
        });
      }
    } else {
      // Reset failure count on success in CLOSED state
      this.failureCount = 0;
    }
  }

  /**
   * Handle failed operation with simplified error handling
   */
  async onFailure(error, operationName = 'operation') {
    this.stats.totalFailures++;
    this.stats.lastFailureTime = Date.now();
    
    this.failureCount++;
    
    // Simple bounds check to prevent counter overflow
    if (this.stats.totalRequests > 10000) {
      this.stats.totalRequests = 0;
      this.stats.totalFailures = 0;
      this.stats.totalSuccesses = 0;
    }
    
    // Simplified logging - only warn on threshold approach
    if (this.failureCount >= this.failureThreshold - 1) {
      this.monitor.warn(`🔧 Circuit breaker ${this.name}: ${operationName} failed (${this.failureCount}/${this.failureThreshold})`);
    }

    if (this.state === 'HALF_OPEN' || this.failureCount >= this.failureThreshold) {
      // Open circuit on any failure in half-open state or when threshold reached
      this._changeState('OPEN', {
        successCount: 0,
        nextAttempt: Date.now() + this.timeout
      });
    }
  }

  /**
   * Manually set circuit breaker state
   */
  setState(newState) {
    this._changeState(newState, {
      nextAttempt: Date.now() + this.timeout
    });
  }

  /**
   * Get reason for state change
   */
  getStateChangeReason(from, to) {
    if (from === 'CLOSED' && to === 'OPEN') {
      return `Failure threshold reached (${this.failureCount}/${this.failureThreshold})`;
    }
    if (from === 'OPEN' && to === 'HALF_OPEN') {
      return 'Timeout elapsed, trying half-open';
    }
    if (from === 'HALF_OPEN' && to === 'CLOSED') {
      return `Success threshold reached (${this.successCount}/${this.successThreshold})`;
    }
    if (from === 'HALF_OPEN' && to === 'OPEN') {
      return 'Failure in half-open state';
    }
    return 'Unknown';
  }

  /**
   * Reset circuit breaker to closed state
   */
  reset() {
    this._changeState('CLOSED', {
      failureCount: 0,
      successCount: 0,
      nextAttempt: Date.now()
    });
    this.monitor.info(`🔄 Circuit breaker ${this.name} reset to CLOSED`);
  }

  /**
   * Get current status
   */
  getStatus() {
    const currentState = this._getState();
    return {
      name: this.name,
      state: currentState.state,
      failureCount: currentState.failureCount,
      successCount: currentState.successCount,
      nextAttempt: currentState.nextAttempt,
      isAvailable: currentState.state === 'CLOSED' || (currentState.state === 'HALF_OPEN'),
      stats: { ...this.stats }
    };
  }

  /**
   * Get health check info
   */
  getHealthInfo() {
    const now = Date.now();
    const uptime = this.stats.stateChanges.length > 0 
      ? now - this.stats.stateChanges[0].timestamp 
      : 0;
    
    const successRate = this.stats.totalRequests > 0 
      ? (this.stats.totalSuccesses / this.stats.totalRequests) * 100 
      : 100;

    return {
      name: this.name,
      state: this.state,
      uptime,
      successRate: Math.round(successRate * 100) / 100,
      totalRequests: this.stats.totalRequests,
      recentStateChanges: this.stats.stateChanges.slice(-5)
    };
  }
}

/**
 * Circuit Breaker Manager for multiple services
 */
export class CircuitBreakerManager {
  constructor() {
    this.breakers = new Map();
    this.defaultConfig = {
      failureThreshold: 5,
      successThreshold: 3,
      timeout: 60000
    };
  }

  /**
   * Get or create circuit breaker
   */
  getBreaker(name, config = {}) {
    if (!this.breakers.has(name)) {
      const breakerConfig = { ...this.defaultConfig, ...config, name };
      this.breakers.set(name, new CircuitBreaker(breakerConfig));
    }
    return this.breakers.get(name);
  }

  /**
   * Execute operation with circuit breaker
   */
  async execute(serviceName, operation, operationName = 'operation', config = {}) {
    const breaker = this.getBreaker(serviceName, config);
    return breaker.execute(operation, operationName);
  }

  /**
   * Reset specific circuit breaker
   */
  reset(serviceName) {
    const breaker = this.breakers.get(serviceName);
    if (breaker) {
      breaker.reset();
      return true;
    }
    return false;
  }

  /**
   * Reset all circuit breakers
   */
  resetAll() {
    let resetCount = 0;
    for (const breaker of this.breakers.values()) {
      breaker.reset();
      resetCount++;
    }
    return resetCount;
  }

  /**
   * Get status of all circuit breakers
   */
  getAllStatus() {
    const status = {};
    for (const [name, breaker] of this.breakers.entries()) {
      status[name] = breaker.getStatus();
    }
    return status;
  }

  /**
   * Get health summary
   */
  getHealthSummary() {
    const breakers = Array.from(this.breakers.values()).map(b => b.getHealthInfo());
    const totalBreakers = breakers.length;
    const healthyBreakers = breakers.filter(b => b.state === 'CLOSED').length;
    const openBreakers = breakers.filter(b => b.state === 'OPEN').length;
    const halfOpenBreakers = breakers.filter(b => b.state === 'HALF_OPEN').length;

    return {
      totalBreakers,
      healthyBreakers,
      openBreakers,
      halfOpenBreakers,
      overallHealth: healthyBreakers / totalBreakers,
      breakers
    };
  }
}

// Export singleton instance
export const circuitBreakerManager = new CircuitBreakerManager();