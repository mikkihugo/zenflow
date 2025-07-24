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
    
    // Atomic state management
    this._stateData = {
      state: 'CLOSED', // CLOSED, OPEN, HALF_OPEN
      failureCount: 0,
      successCount: 0,
      nextAttempt: Date.now(),
      lastStateChange: Date.now()
    };
    
    // Mutex for atomic operations
    this._stateLock = false;
    this._pendingOperations = [];
    
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
   * Atomic state operation wrapper
   */
  async _withStateLock(operation) {
    // Simple spin-lock implementation for Node.js single-threaded environment
    while (this._stateLock) {
      await new Promise(resolve => setImmediate(resolve));
    }
    
    this._stateLock = true;
    try {
      return await operation();
    } finally {
      this._stateLock = false;
      
      // Process pending operations
      if (this._pendingOperations.length > 0) {
        const pending = this._pendingOperations.shift();
        setImmediate(() => pending());
      }
    }
  }

  /**
   * Get current state atomically
   */
  _getState() {
    return { ...this._stateData };
  }

  /**
   * Update state atomically
   */
  async _updateState(updates) {
    return this._withStateLock(async () => {
      const oldState = this._stateData.state;
      Object.assign(this._stateData, updates);
      
      if (updates.state && updates.state !== oldState) {
        this._stateData.lastStateChange = Date.now();
        this.stats.stateChanges.push({
          from: oldState,
          to: updates.state,
          timestamp: Date.now(),
          reason: this.getStateChangeReason(oldState, updates.state)
        });
        
        this.monitor.info(`⚡ Circuit breaker ${this.name}: ${oldState} → ${updates.state}`);
      }
    });
  }

  /**
   * Execute operation with circuit breaker protection
   */
  async execute(operation, operationName = 'operation') {
    this.stats.totalRequests++;
    
    // Atomically check and update state
    const currentState = this._getState();
    
    if (currentState.state === 'OPEN') {
      if (Date.now() < currentState.nextAttempt) {
        const error = new CliError(
          `Circuit breaker ${this.name} is OPEN for ${operationName}`,
          'CIRCUIT_BREAKER_OPEN'
        );
        this.stats.totalFailures++;
        throw error;
      } else {
        // Atomically transition to half-open
        await this._updateState({ 
          state: 'HALF_OPEN',
          successCount: 0 
        });
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

    const currentState = this._getState();
    
    if (currentState.state === 'HALF_OPEN') {
      const newSuccessCount = currentState.successCount + 1;
      
      if (newSuccessCount >= this.successThreshold) {
        await this._updateState({
          state: 'CLOSED',
          failureCount: 0,
          successCount: 0
        });
      } else {
        await this._updateState({
          successCount: newSuccessCount
        });
      }
    } else {
      // Reset failure count on success in CLOSED state
      await this._updateState({
        failureCount: 0
      });
    }
  }

  /**
   * Handle failed operation
   */
  async onFailure(error, operationName = 'operation') {
    this.stats.totalFailures++;
    this.stats.lastFailureTime = Date.now();
    
    const currentState = this._getState();
    const newFailureCount = currentState.failureCount + 1;
    
    this.monitor.warn(`🔧 Circuit breaker ${this.name}: ${operationName} failed (${newFailureCount}/${this.failureThreshold})`);

    if (currentState.state === 'HALF_OPEN') {
      // Immediately open on any failure in half-open state
      await this._updateState({
        state: 'OPEN',
        failureCount: newFailureCount,
        successCount: 0,
        nextAttempt: Date.now() + this.timeout
      });
    } else if (newFailureCount >= this.failureThreshold) {
      // Open circuit when threshold reached
      await this._updateState({
        state: 'OPEN',
        failureCount: newFailureCount,
        nextAttempt: Date.now() + this.timeout
      });
    } else {
      // Just increment failure count
      await this._updateState({
        failureCount: newFailureCount
      });
    }
  }

  /**
   * Change circuit breaker state (deprecated - use _updateState)
   */
  async setState(newState) {
    await this._updateState({
      state: newState,
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
  async reset() {
    await this._updateState({
      state: 'CLOSED',
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