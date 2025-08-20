/**
 * Error Recovery Strategies and Circuit Breaker Patterns.
 *
 * Implements sophisticated error recovery mechanisms for Claude-Zen distributed systems.
 * Includes retry patterns, circuit breakers, fallback strategies, and graceful degradation.
 */
/**
 * @file Error-recovery implementation.
 */

import { getLogger } from '../config/logging-config';

import { isRecoverableError } from './errors';

const logger = getLogger('ErrorRecovery');

// ===============================
// Circuit Breaker Implementation
// ===============================

export enum CircuitBreakerState {
  CLOSED = 'closed', // Normal operation
  OPEN = 'open', // Failing fast
  HALF_OPEN = 'half_open', // Testing recovery
}

export interface CircuitBreakerConfig {
  failureThreshold: number; // Number of failures to open circuit
  recoveryTimeout: number; // Time before attempting recovery (ms)
  successThreshold: number; // Successes needed to close circuit
  monitoringWindow: number; // Time window for failure counting (ms)
  maxRetries: number; // Max retry attempts
}

export interface CircuitBreakerMetrics {
  state: CircuitBreakerState;
  failureCount: number;
  successCount: number;
  lastFailureTime: number;
  lastSuccessTime: number;
  totalCalls: number;
  totalFailures: number;
  averageResponseTime: number;
}

export class CircuitBreaker {
  private state: CircuitBreakerState = CircuitBreakerState['CLOSED'];
  private failureCount: number = 0;
  private successCount: number = 0;
  private lastFailureTime: number = 0;
  private lastSuccessTime: number = 0;
  private totalCalls: number = 0;
  private totalFailures: number = 0;
  private responseTimes: number[] = [];
  private nextAttemptTime: number = 0;
  private failureHistory: number[] = [];
  private callHistory: number[] = [];

  constructor(
    private readonly name: string,
    private readonly config: CircuitBreakerConfig
  ) {}

  public async execute<T>(
    operation: () => Promise<T>,
    fallback?: () => Promise<T>
  ): Promise<T> {
    const startTime = Date.now();
    this.totalCalls++;

    // Check if circuit is open
    if (this.state === CircuitBreakerState['OPEN']) {
      if (Date.now() < this.nextAttemptTime) {
        logger.warn(`Circuit breaker [${this.name}] is OPEN - failing fast`);

        if (fallback) {
          logger.info(`Circuit breaker [${this.name}] executing fallback`);
          return await fallback();
        }

        throw new Error(`Circuit breaker [${this.name}] is open`);
      }
      // Transition to half-open for testing
      this.state = CircuitBreakerState['HALF_OPEN'];
      this.successCount = 0;
      logger.info(`Circuit breaker [${this.name}] transitioning to HALF_OPEN`);
    }

    try {
      const result = await operation();
      this.onSuccess(Date.now() - startTime);
      return result;
    } catch (error) {
      this.onFailure(Date.now() - startTime);

      // If we have a fallback and error is recoverable, try fallback
      if (fallback && isRecoverableError(error as Error)) {
        try {
          logger.info(
            `Circuit breaker [${this.name}] attempting fallback after error`
          );
          return await fallback();
        } catch (fallbackError) {
          logger.error(
            `Circuit breaker [${this.name}] fallback also failed`,
            fallbackError
          );
          throw error; // Throw original error
        }
      }

      throw error;
    }
  }

  private onSuccess(responseTime: number): void {
    this.failureCount = 0;
    this.successCount++;
    this.lastSuccessTime = Date.now();
    this.responseTimes.push(responseTime);

    // Keep only recent response times
    if (this.responseTimes.length > 100) {
      this.responseTimes = this.responseTimes.slice(-50);
    }

    if (this.state === CircuitBreakerState['HALF_OPEN'] && this.successCount >= this.config.successThreshold) {
        this.state = CircuitBreakerState['CLOSED'];
        logger.info(`Circuit breaker [${this.name}] recovered - state: CLOSED`);
      }
  }

  private onFailure(responseTime: number): void {
    this.failureCount++;
    this.totalFailures++;
    this.lastFailureTime = Date.now();
    this.responseTimes.push(responseTime);

    // Check if we should open the circuit
    if ((
      this.state === CircuitBreakerState['CLOSED'] ||
      this.state === CircuitBreakerState['HALF_OPEN']
    ) && this.shouldOpenCircuit()) {
        this.state = CircuitBreakerState['OPEN'];
        this.nextAttemptTime = Date.now() + this.config.recoveryTimeout;
        logger.warn(
          `Circuit breaker [${this.name}] opened due to failures - next attempt: ${new Date(this.nextAttemptTime).toISOString()}`
        );
      }
  }

  private shouldOpenCircuit(): boolean {
    // Open if failure threshold exceeded
    if (this.failureCount >= this.config.failureThreshold) {
      return true;
    }

    // Open if failure rate is too high within monitoring window
    const windowStart = Date.now() - this.config.monitoringWindow;

    // Filter failures and calls within the monitoring window
    const recentFailures = this.failureHistory.filter(
      (timestamp) => timestamp >= windowStart
    ).length;
    const recentCalls = this.callHistory.filter(
      (timestamp) => timestamp >= windowStart
    ).length;

    const failureRate = recentCalls > 0 ? recentFailures / recentCalls : 0;

    return failureRate > 0.5 && recentCalls >= 10; // 50% failure rate with minimum calls in window
  }

  public getMetrics(): CircuitBreakerMetrics {
    const avgResponseTime =
      this.responseTimes.length > 0
        ? this.responseTimes.reduce((a, b) => a + b, 0) /
          this.responseTimes.length
        : 0;

    return {
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      lastFailureTime: this.lastFailureTime,
      lastSuccessTime: this.lastSuccessTime,
      totalCalls: this.totalCalls,
      totalFailures: this.totalFailures,
      averageResponseTime: avgResponseTime,
    };
  }

  public reset(): void {
    this.state = CircuitBreakerState['CLOSED'];
    this.failureCount = 0;
    this.successCount = 0;
    this.totalCalls = 0;
    this.totalFailures = 0;
    this.responseTimes = [];
    logger.info(`Circuit breaker [${this.name}] reset`);
  }
}

// ===============================
// Retry Strategy Implementation
// ===============================

export interface RetryConfig {
  maxAttempts: number;
  initialDelayMs: number;
  maxDelayMs: number;
  exponentialBase: number;
  jitterEnabled: boolean;
  retryableErrors: string[];
}

export class RetryStrategy {
  private readonly config: RetryConfig;

  constructor(config: Partial<RetryConfig> = {}) {
    this.config = {
      maxAttempts: 3,
      initialDelayMs: 1000,
      maxDelayMs: 30000,
      exponentialBase: 2,
      jitterEnabled: true,
      retryableErrors: [
        'NetworkError',
        'TimeoutError',
        'ServiceUnavailableError',
      ],
      ...config,
    };
  }

  public async execute<T>(
    operation: () => Promise<T>,
    operationName: string = 'unknown'
  ): Promise<T> {
    let lastError: Error = new Error(`No attempts made for ${operationName}`);

    for (let attempt = 1; attempt <= this.config.maxAttempts; attempt++) {
      try {
        const result = await operation();

        if (attempt > 1) {
          logger.info(
            `Retry strategy succeeded on attempt ${attempt} for ${operationName}`
          );
        }

        return result;
      } catch (error) {
        lastError = error as Error;

        logger.warn(
          `Retry strategy attempt ${attempt}/${this.config.maxAttempts} failed for ${operationName}:`,
          error
        );

        // Check if we should retry
        if (
          attempt === this.config.maxAttempts ||
          !this.shouldRetryError(error as Error)
        ) {
          break;
        }

        // Calculate delay with exponential backoff and jitter
        const delay = this.calculateDelay(attempt);
        logger.info(
          `Retry strategy waiting ${delay}ms before attempt ${attempt + 1} for ${operationName}`
        );

        await this.sleep(delay);
      }
    }

    logger.error(
      `Retry strategy exhausted all ${this.config.maxAttempts} attempts for ${operationName}`
    );
    throw lastError;
  }

  private shouldRetryError(error: Error): boolean {
    if (!isRecoverableError(error)) {
      return false;
    }

    // Check if error type is in retryable list
    return this.config.retryableErrors.some(
      (errorType) =>
        error.constructor.name === errorType || error.name === errorType
    );
  }

  private calculateDelay(attempt: number): number {
    const exponentialDelay =
      this.config.initialDelayMs * this.config.exponentialBase ** (attempt - 1);
    let delay = Math.min(exponentialDelay, this.config.maxDelayMs);

    // Add jitter to prevent thundering herd
    if (this.config.jitterEnabled) {
      delay = delay * (0.5 + Math.random() * 0.5);
    }

    return Math.floor(delay);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// ===============================
// Fallback Strategy Implementation
// ===============================

export interface FallbackStrategy<T> {
  name: string;
  handler: () => Promise<T>;
  condition?: (error: Error) => boolean;
  priority: number; // Lower numbers = higher priority
}

export class FallbackManager<T> {
  private strategies: FallbackStrategy<T>[] = [];

  constructor(private readonly operationName: string) {}

  public addStrategy(strategy: FallbackStrategy<T>): void {
    this.strategies.push(strategy);
    // Sort by priority (lower number = higher priority)
    this.strategies.sort((a, b) => a.priority - b.priority);
  }

  public async executeWithFallbacks(
    _primaryOperation: () => Promise<T>,
    error: Error
  ): Promise<T> {
    // Try each fallback strategy in priority order
    for (const strategy of this.strategies) {
      // Check if strategy applies to this error
      if (strategy.condition && !strategy.condition(error)) {
        continue;
      }

      try {
        logger.info(
          `Executing fallback strategy '${strategy.name}' for ${this.operationName}`
        );
        const result = await strategy.handler();
        logger.info(
          `Fallback strategy '${strategy.name}' succeeded for ${this.operationName}`
        );
        return result;
      } catch (fallbackError) {
        logger.warn(
          `Fallback strategy '${strategy.name}' failed for ${this.operationName}:`,
          fallbackError
        );
      }
    }

    // If all fallbacks failed, throw original error
    logger.error(`All fallback strategies failed for ${this.operationName}`);
    throw error;
  }
}

// ===============================
// Graceful Degradation Manager
// ===============================

export interface DegradationLevel {
  level: number; // 0 = full functionality, 10 = minimal functionality
  name: string;
  description: string;
  enabledFeatures: string[];
  disabledFeatures: string[];
}

export class GracefulDegradationManager {
  private currentLevel: number = 0;
  private readonly levels: Map<number, DegradationLevel> = new Map();
  private readonly errorCounts: Map<string, number> = new Map();
  private readonly errorThresholds: Map<string, number> = new Map();

  constructor() {
    this.initializeDefaultLevels();
  }

  private initializeDefaultLevels(): void {
    this.addDegradationLevel({
      level: 0,
      name: 'Full Functionality',
      description: 'All systems operational',
      enabledFeatures: [
        'fact_gather',
        'rag_search',
        'swarm_coordination',
        'neural_processing',
        'wasm_computation',
      ],
      disabledFeatures: [],
    });

    this.addDegradationLevel({
      level: 3,
      name: 'Reduced Performance',
      description: 'Non-critical features disabled',
      enabledFeatures: ['fact_gather', 'rag_search', 'swarm_coordination'],
      disabledFeatures: ['neural_processing', 'wasm_computation'],
    });

    this.addDegradationLevel({
      level: 6,
      name: 'Core Features Only',
      description: 'Only essential operations available',
      enabledFeatures: ['fact_gather', 'rag_search'],
      disabledFeatures: [
        'swarm_coordination',
        'neural_processing',
        'wasm_computation',
      ],
    });

    this.addDegradationLevel({
      level: 9,
      name: 'Emergency Mode',
      description: 'Basic functionality only',
      enabledFeatures: ['fact_query'],
      disabledFeatures: [
        'fact_gather',
        'rag_search',
        'swarm_coordination',
        'neural_processing',
        'wasm_computation',
      ],
    });

    // Set error thresholds
    this.errorThresholds.set('NetworkError', 5);
    this.errorThresholds.set('TimeoutError', 3);
    this.errorThresholds.set('SwarmError', 4);
  }

  public addDegradationLevel(level: DegradationLevel): void {
    this.levels.set(level.level, level);
  }

  public reportError(error: Error): void {
    const errorType = error.constructor.name;
    const currentCount = this.errorCounts.get(errorType) || 0;
    this.errorCounts.set(errorType, currentCount + 1);

    // Check if we need to degrade
    this.evaluateDegradation();
  }

  private evaluateDegradation(): void {
    let requiredLevel = 0;

    // Calculate required degradation level based on error counts
    for (const [errorType, count] of this.errorCounts.entries()) {
      const threshold = this.errorThresholds.get(errorType) || 10;

      if (count >= threshold) {
        if (errorType === 'SwarmError') {
          requiredLevel = Math.max(requiredLevel, 6); // Core features only
        } else if (errorType === 'NetworkError') {
          requiredLevel = Math.max(requiredLevel, 3); // Reduced performance
        } else if (errorType === 'TimeoutError') {
          requiredLevel = Math.max(requiredLevel, 3); // Reduced performance
        }
      }
    }

    // Apply degradation if necessary
    if (requiredLevel > this.currentLevel) {
      this.setDegradationLevel(requiredLevel);
    }
  }

  public setDegradationLevel(level: number): void {
    const degradationLevel = this.levels.get(level);
    if (!degradationLevel) {
      logger.error(`Invalid degradation level: ${level}`);
      return;
    }

    const previousLevel = this.currentLevel;
    this.currentLevel = level;

    logger.warn(
      `Graceful degradation: ${degradationLevel.name} (level ${level}) - ${degradationLevel.description}`
    );
    logger.info(
      `Enabled features: ${degradationLevel.enabledFeatures.join(', ')}`
    );
    logger.info(
      `Disabled features: ${degradationLevel.disabledFeatures.join(', ')}`
    );

    if (level > previousLevel) {
      logger.warn('System functionality has been reduced due to errors');
    } else if (level < previousLevel) {
      logger.info('System functionality has been restored');
    }
  }

  public isFeatureEnabled(feature: string): boolean {
    const currentDegradationLevel = this.levels.get(this.currentLevel);
    return currentDegradationLevel?.enabledFeatures.includes(feature);
  }

  public getCurrentLevel(): DegradationLevel | undefined {
    return this.levels.get(this.currentLevel);
  }

  public resetErrorCounts(): void {
    this.errorCounts.clear();
    this.setDegradationLevel(0);
    logger.info('Error counts reset - returning to full functionality');
  }

  public getErrorCounts(): Map<string, number> {
    return new Map(this.errorCounts);
  }
}

// ===============================
// Global Circuit Breaker Registry
// ===============================

export class CircuitBreakerRegistry {
  private static instance: CircuitBreakerRegistry;
  private breakers: Map<string, CircuitBreaker> = new Map();

  public static getInstance(): CircuitBreakerRegistry {
    if (!CircuitBreakerRegistry.instance) {
      CircuitBreakerRegistry.instance = new CircuitBreakerRegistry();
    }
    return CircuitBreakerRegistry.instance;
  }

  public getOrCreate(
    name: string,
    config?: Partial<CircuitBreakerConfig>
  ): CircuitBreaker {
    if (!this.breakers.has(name)) {
      const defaultConfig: CircuitBreakerConfig = {
        failureThreshold: 5,
        recoveryTimeout: 60000, // 1 minute
        successThreshold: 3,
        monitoringWindow: 300000, // 5 minutes
        maxRetries: 3,
      };

      const finalConfig = { ...defaultConfig, ...config };
      this.breakers.set(name, new CircuitBreaker(name, finalConfig));
    }

    return this.breakers.get(name)!;
  }

  public getAllMetrics(): Map<string, CircuitBreakerMetrics> {
    const metrics = new Map<string, CircuitBreakerMetrics>();

    for (const [name, breaker] of this.breakers.entries()) {
      metrics.set(name, breaker.getMetrics());
    }

    return metrics;
  }

  public resetAll(): void {
    for (const breaker of this.breakers.values()) {
      breaker.reset();
    }
    logger.info('All circuit breakers reset');
  }
}

// ===============================
// Error Recovery Orchestrator
// ===============================

export class ErrorRecoveryOrchestrator {
  private circuitBreakerRegistry = CircuitBreakerRegistry.getInstance();
  private degradationManager = new GracefulDegradationManager();
  private retryStrategies: Map<string, RetryStrategy> = new Map();
  private fallbackManagers: Map<string, FallbackManager<any>> = new Map();

  public async executeWithRecovery<T>(
    operationName: string,
    operation: () => Promise<T>,
    options: ErrorRecoveryOptions = {}
  ): Promise<T> {
    const circuitBreaker = this.circuitBreakerRegistry.getOrCreate(
      operationName,
      {
        failureThreshold: options?.['circuitBreakerThreshold'] || 5,
        maxRetries: options?.['maxRetries'] || 3,
      }
    );

    const retryStrategy = this.getOrCreateRetryStrategy(operationName, options);

    try {
      return await circuitBreaker.execute(async () => {
        return await retryStrategy.execute(operation, operationName);
      });
    } catch (error) {
      // Report error for degradation tracking
      this.degradationManager.reportError(error as Error);

      // Try fallback if available and enabled
      if (options?.['fallbackEnabled']) {
        const fallbackManager = this.fallbackManagers.get(operationName);
        if (fallbackManager) {
          return await fallbackManager.executeWithFallbacks(
            operation,
            error as Error
          );
        }
      }

      throw error;
    }
  }

  private getOrCreateRetryStrategy(
    operationName: string,
    options: ErrorRecoveryOptions
  ): RetryStrategy {
    if (!this.retryStrategies.has(operationName)) {
      this.retryStrategies.set(
        operationName,
        new RetryStrategy({
          maxAttempts: options?.['maxRetries'] || 3,
          initialDelayMs: options?.['retryDelayMs'] || 1000,
          exponentialBase: options?.['exponentialBackoff'] ? 2 : 1,
        })
      );
    }

    return this.retryStrategies.get(operationName)!;
  }

  public addFallbackStrategy<T>(
    operationName: string,
    strategy: FallbackStrategy<T>
  ): void {
    if (!this.fallbackManagers.has(operationName)) {
      this.fallbackManagers.set(
        operationName,
        new FallbackManager<T>(operationName)
      );
    }

    this.fallbackManagers.get(operationName)?.addStrategy(strategy);
  }

  public getSystemHealth(): {
    degradationLevel: DegradationLevel | undefined;
    circuitBreakers: Map<string, CircuitBreakerMetrics>;
    errorCounts: Map<string, number>;
  } {
    return {
      degradationLevel: this.degradationManager.getCurrentLevel(),
      circuitBreakers: this.circuitBreakerRegistry.getAllMetrics(),
      errorCounts: this.degradationManager.getErrorCounts(),
    };
  }

  public resetSystem(): void {
    this.circuitBreakerRegistry.resetAll();
    this.degradationManager.resetErrorCounts();
    logger.info('Error recovery system reset');
  }

  public isFeatureEnabled(feature: string): boolean {
    return this.degradationManager.isFeatureEnabled(feature);
  }
}

// Export singleton instance
export const errorRecoveryOrchestrator = new ErrorRecoveryOrchestrator();
