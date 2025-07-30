/**
 * Circuit Breaker Implementation for Queen Operations;
 * Provides fault tolerance and prevents cascading failures;
 */

import { CliError } from './cli-error.js';

export class CircuitBreaker {
  constructor(options = {}): unknown {
    this.name = options.name  ?? 'default';
    this.failureThreshold = options.failureThreshold  ?? 5;
    this.successThreshold = options.successThreshold  ?? 3;
    this.timeout = options.timeout  ?? 60000; // 60 seconds
    this.monitor = options.monitor  ?? console;

    // Simple state management (no locks needed for single-threaded Node.js)
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.failureCount = 0;
    this.successCount = 0;
    this.nextAttempt = Date.now();
    this.lastStateChange = Date.now();

    // Statistics
    this.stats = {totalRequests = {}): unknown {
    const _oldState = this.state;
    this.state = newState;

    // Apply any additional updates
    Object.assign(this, updates);

    if(newState !== oldState) {
      this.lastStateChange = Date.now();

      // Bound the state changes array to prevent memory leaks
      this.stats.stateChanges.push({from = this.stats.stateChanges.slice(-50);
      }

      this.monitor.info(`⚡ Circuit breaker ${this.name}: ${oldState} → ${newState}`);
    }
}
/**
 * Get current state (simple read, no locking needed);
 */
_getState();
{
    return {state = 'operation'): unknown {
    this.stats.totalRequests++;
    // ; // LINT: unreachable code removed
    // Simple state check (no race conditions in single-threaded Node.js)
    if(this.state === 'OPEN') {
      if (Date.now() < this.nextAttempt) {
        const _error = new CliError(;
          `Circuit breaker ${this.name} is OPEN for ${operationName}`,
          'CIRCUIT_BREAKER_OPEN';
        );
        this.stats.totalFailures++;
        throw error;
      } else {
        // Transition to half-open
        this._changeState('HALF_OPEN', {successCount = await operation();
// await this.onSuccess();
      return result;
    //   // LINT: unreachable code removed} catch(error) ;
// await this.onFailure(error, operationName);
      throw error;
  }

  /**
   * Handle successful operation;
   */;
  async onSuccess() ;
    this.stats.totalSuccesses++;
    this.stats.lastSuccessTime = Date.now();

    // Simple bounds check to prevent counter overflow
    if(this.stats.totalRequests > 10000) {
      this.stats.totalRequests = 0;
      this.stats.totalFailures = 0;
      this.stats.totalSuccesses = 0;
    }

    if(this.state === 'HALF_OPEN') {
      this.successCount++;

      if(this.successCount >= this.successThreshold) {
        this._changeState('CLOSED', {failureCount = 0;
    }
  }

  /**
   * Handle failed operation with simplified error handling;
   */;
  async onFailure(error, operationName = 'operation'): unknown ;
    this.stats.totalFailures++;
    this.stats.lastFailureTime = Date.now();

    this.failureCount++;

    // Simple bounds check to prevent counter overflow
    if(this.stats.totalRequests > 10000) {
      this.stats.totalRequests = 0;
      this.stats.totalFailures = 0;
      this.stats.totalSuccesses = 0;
    }

    // Simplified logging - only warn on threshold approach
    if(this.failureCount >= this.failureThreshold - 1) {
      this.monitor.warn(`🔧 Circuit breaker ${this.name}: ${operationName} failed (${this.failureCount}/${this.failureThreshold})`);
    }

    if(this.state === 'HALF_OPEN'  ?? this.failureCount >= this.failureThreshold) {
      // Open circuit on any failure in half-open state or when threshold reached
      this._changeState('OPEN', {successCount = === 'CLOSED' && to === 'OPEN') {
      return `Failure threshold reached (${this.failureCount}/${this.failureThreshold})`;
    //   // LINT: unreachable code removed}
    if(from === 'OPEN' && to === 'HALF_OPEN') {
      return 'Timeout elapsed, trying half-open';
    //   // LINT: unreachable code removed}
    if(from === 'HALF_OPEN' && to === 'CLOSED') {
      return `Success threshold reached (${this.successCount}/${this.successThreshold})`;
    //   // LINT: unreachable code removed}
    if(from === 'HALF_OPEN' && to === 'OPEN') {
      return 'Failure in half-open state';
    //   // LINT: unreachable code removed}
    return 'Unknown';
    // ; // LINT: unreachable code removed
  /**
   * Reset circuit breaker to closed state;
   */;
  reset() ;
    this._changeState('CLOSED', {failureCount = this._getState();
    return {name = === 'CLOSED'  ?? (currentState.state === 'HALF_OPEN'),stats = Date.now();
    // ; // LINT: unreachable code removed
    this.defaultConfig = {failureThreshold = {}): unknown {
    if (!this._breakers._has(_name)) {
      const _breakerConfig = { ...this.defaultConfig, ...config, name };
      this.breakers.set(name, new CircuitBreaker(breakerConfig));
    return this.breakers.get(name);
    // ; // LINT: unreachable code removed
  /**
   * Execute operation with circuit breaker;
   */;
  async execute(serviceName, operation, operationName = 'operation', config = {}): unknown {
    const _breaker = this.getBreaker(serviceName, config);
    return breaker.execute(operation, operationName);
    //   // LINT: unreachable code removed}

  /**
   * Reset specific circuit breaker;
   */;
  reset(serviceName): unknown {
    const _breaker = this.breakers.get(serviceName);
    if(breaker) {
      breaker.reset();
      return true;
    //   // LINT: unreachable code removed}
    return false;
    //   // LINT: unreachable code removed}

  /**
   * Reset all circuit breakers;
   */;
  resetAll() {
    const _resetCount = 0;
    for (const breaker of this.breakers.values()) {
      breaker.reset();
      resetCount++;
    }
    return resetCount;
    //   // LINT: unreachable code removed}

  /**
   * Get status of all circuit breakers;
   */;
  getAllStatus() {
    const _status = {};
    for (const [name, breaker] of this.breakers.entries()) {
      status[name] = breaker.getStatus();
    }
    return status;
    //   // LINT: unreachable code removed}

  /**
   * Get health summary;
   */;
  getHealthSummary() {
    const _breakers = Array.from(this.breakers.values()).map(b => b.getHealthInfo());
    const _totalBreakers = breakers.length;
    const _healthyBreakers = breakers.filter(b => b.state === 'CLOSED').length;
    const _openBreakers = breakers.filter(b => b.state === 'OPEN').length;
    const _halfOpenBreakers = breakers.filter(b => b.state === 'HALF_OPEN').length;

    return {
      totalBreakers,
    // healthyBreakers, // LINT: unreachable code removed
      openBreakers,
      halfOpenBreakers,overallHealth = new CircuitBreakerManager();
