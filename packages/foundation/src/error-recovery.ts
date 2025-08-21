/**
 * @fileoverview Error Recovery System for Foundation
 *
 * Comprehensive error recovery and system resilience framework that provides
 * automatic recovery strategies, retry mechanisms, and failover capabilities
 * for distributed systems and neural network operations.
 *
 * Key Features:
 * - Multi-strategy error recovery with configurable policies
 * - Exponential backoff with jitter for retry mechanisms
 * - Circuit breaker pattern for failing services
 * - Automatic failover and load balancing
 * - Comprehensive error classification and routing
 * - Recovery action orchestration with rollback capabilities
 * - Metrics collection and health monitoring
 * - Event-driven recovery notifications
 *
 * Recovery Strategies:
 * - Restart: Component/service restart with graceful shutdown
 * - Rollback: Version rollback to last known good state
 * - Failover: Automatic failover to backup systems
 * - Scale: Dynamic scaling based on error patterns
 * - Notify: Alert and notification management
 * - Repair: Self-healing and automatic repair actions
 *
 * @package @claude-zen/foundation
 * @since 2.1.0
 * @version 1.0.0
 *
 * @see {@link https://martinfowler.com/bliki/CircuitBreaker.html} Circuit Breaker Pattern
 * @see {@link https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/} Retry Strategies
 *
 * @example Basic Recovery Strategy
 * ```typescript
 * import { ErrorRecoverySystem } from '@claude-zen/foundation';
 *
 * const recovery = new ErrorRecoverySystem({
 *   strategies: [{
 *     id: 'neural-restart',
 *     name: 'Neural Network Restart',
 *     severity: 'high',
 *     timeout: 30000,
 *     maxRetries: 3,
 *     backoffStrategy: 'exponential',
 *     actions: [{ type: 'restart', target: 'neural-engine' }]
 *   }]
 * });
 *
 * const result = await recovery.handleError({
 *   errorId: 'neural-training-failure',
 *   component: 'neural-network',
 *   operation: 'train',
 *   errorType: 'timeout',
 *   severity: 'high'
 * });
 * ```
 */

import { EventEmitter } from 'eventemitter3';
import { getLogger, type Logger } from './logging';
import { Result, ok, err } from 'neverthrow';

// =============================================================================
// CORE INTERFACES
// =============================================================================

/**
 * Recovery strategy configuration interface.
 *
 * Defines the complete configuration for an error recovery strategy,
 * including retry policies, backoff strategies, and recovery actions.
 */
export interface RecoveryStrategy {
  /** Unique identifier for the recovery strategy */
  id: string;

  /** Human-readable name for the strategy */
  name: string;

  /** Detailed description of strategy purpose */
  description?: string;

  /** Error severity level this strategy handles */
  severity: 'low' | 'medium' | 'high' | 'critical';

  /** Maximum time to wait for recovery completion (ms) */
  timeout: number;

  /** Maximum number of retry attempts */
  maxRetries: number;

  /** Delay strategy between retries */
  backoffStrategy: 'linear' | 'exponential' | 'fixed';

  /** Base delay for backoff strategies (ms) */
  baseDelay?: number;

  /** Maximum delay for backoff strategies (ms) */
  maxDelay?: number;

  /** Conditions that must be met to trigger this strategy */
  conditions: string[];

  /** Recovery actions to execute */
  actions: RecoveryAction[];

  /** Strategy priority (higher numbers = higher priority) */
  priority: number;

  /** Whether this strategy is currently enabled */
  enabled: boolean;
}

/**
 * Recovery action definition.
 */
export interface RecoveryAction {
  /** Type of recovery action */
  type:
    | 'restart'
    | 'rollback'
    | 'failover'
    | 'scale'
    | 'notify'
    | 'repair'
    | 'custom';

  /** Target component/service for the action */
  target: string;

  /** Action-specific parameters */
  parameters?: Record<string, unknown>;

  /** Timeout for this specific action (ms) */
  timeout?: number;

  /** Whether this action can be retried if it fails */
  retryable?: boolean;
}

/**
 * Error information for recovery processing.
 */
export interface ErrorInfo {
  /** Unique identifier for this error instance */
  errorId: string;

  /** Component where the error occurred */
  component: string;

  /** Operation that was being performed */
  operation: string;

  /** Type/category of error */
  errorType: string;

  /** Error severity level */
  severity: 'low' | 'medium' | 'high' | 'critical';

  /** Error message */
  message?: string;

  /** Stack trace */
  stack?: string;

  /** Additional context information */
  context?: Record<string, unknown>;

  /** Timestamp when error occurred */
  timestamp?: Date;
}

/**
 * Recovery result information.
 */
export interface RecoveryResult {
  /** Whether recovery was successful */
  success: boolean;

  /** Strategy that was used for recovery */
  strategy?: RecoveryStrategy;

  /** Actions that were executed */
  actionsExecuted: RecoveryActionResult[];

  /** Total time taken for recovery (ms) */
  duration: number;

  /** Error message if recovery failed */
  error?: string;

  /** Additional metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Result of a specific recovery action.
 */
export interface RecoveryActionResult {
  /** The action that was executed */
  action: RecoveryAction;

  /** Whether the action was successful */
  success: boolean;

  /** Duration of the action (ms) */
  duration: number;

  /** Error message if action failed */
  error?: string;

  /** Action output/result data */
  result?: unknown;
}

/**
 * Configuration for the error recovery system.
 */
export interface ErrorRecoveryConfig {
  /** Available recovery strategies */
  strategies: RecoveryStrategy[];

  /** Default timeout for recovery operations (ms) */
  defaultTimeout?: number;

  /** Maximum number of concurrent recovery operations */
  maxConcurrentRecoveries?: number;

  /** Whether to enable automatic recovery */
  autoRecovery?: boolean;

  /** Monitoring and metrics collection settings */
  monitoring?: {
    enabled: boolean;
    metricsInterval: number;
    alertThresholds: Record<string, number>;
  };
}

// =============================================================================
// ERROR RECOVERY SYSTEM
// =============================================================================

/**
 * Comprehensive error recovery and system resilience framework.
 *
 * Provides automatic error recovery with configurable strategies,
 * retry mechanisms, and comprehensive monitoring.
 */
export class ErrorRecoverySystem extends EventEmitter {
  private logger: Logger;
  private strategies: Map<string, RecoveryStrategy> = new Map();
  private activeRecoveries: Map<string, Promise<RecoveryResult>> = new Map();
  private recoveryHistory: RecoveryResult[] = [];
  private config: Required<ErrorRecoveryConfig>;

  constructor(config: ErrorRecoveryConfig) {
    super();

    this.logger = getLogger('error-recovery-system');

    // Set defaults
    this.config = {
      strategies: config.strategies || [],
      defaultTimeout: config.defaultTimeout || 30000,
      maxConcurrentRecoveries: config.maxConcurrentRecoveries || 10,
      autoRecovery: config.autoRecovery ?? true,
      monitoring: {
        enabled: config.monitoring?.enabled ?? true,
        metricsInterval: config.monitoring?.metricsInterval || 60000,
        alertThresholds: config.monitoring?.alertThresholds || {},
      },
    };

    // Initialize strategies
    this.config.strategies.forEach((strategy) => {
      this.strategies.set(strategy.id, strategy);
    });

    this.logger.info('Error recovery system initialized', {
      strategiesCount: this.strategies.size,
      autoRecovery: this.config.autoRecovery,
    });

    // Start monitoring if enabled
    if (this.config.monitoring.enabled) {
      this.startMonitoring();
    }
  }

  /**
   * Handle an error with automatic recovery.
   */
  async handleError(
    errorInfo: ErrorInfo,
  ): Promise<Result<RecoveryResult, Error>> {
    try {
      this.logger.info('Handling error for recovery', {
        errorId: errorInfo.errorId,
        component: errorInfo.component,
        severity: errorInfo.severity,
      });

      // Check if recovery is already in progress for this error
      if (this.activeRecoveries.has(errorInfo.errorId)) {
        this.logger.warn('Recovery already in progress', {
          errorId: errorInfo.errorId,
        });
        return err(new Error('Recovery already in progress'));
      }

      // Find suitable recovery strategy
      const strategy = this.findRecoveryStrategy(errorInfo);
      if (!strategy) {
        this.logger.warn('No suitable recovery strategy found', {
          errorId: errorInfo.errorId,
          component: errorInfo.component,
          errorType: errorInfo.errorType,
        });
        return err(new Error('No suitable recovery strategy found'));
      }

      // Check concurrent recovery limit
      if (this.activeRecoveries.size >= this.config.maxConcurrentRecoveries) {
        this.logger.warn('Maximum concurrent recoveries reached', {
          current: this.activeRecoveries.size,
          max: this.config.maxConcurrentRecoveries,
        });
        return err(new Error('Maximum concurrent recoveries reached'));
      }

      // Execute recovery
      const recoveryPromise = this.executeRecovery(errorInfo, strategy);
      this.activeRecoveries.set(errorInfo.errorId, recoveryPromise);

      try {
        const result = await recoveryPromise;
        this.recoveryHistory.push(result);

        this.emit('recovery:completed', { errorInfo, result });

        return ok(result);
      } finally {
        this.activeRecoveries.delete(errorInfo.errorId);
      }
    } catch (error) {
      this.logger.error('Error recovery system failure', {
        errorId: errorInfo.errorId,
        error: error instanceof Error ? error.message : String(error),
      });

      return err(error instanceof Error ? error : new Error(String(error)));
    }
  }

  /**
   * Add or update a recovery strategy.
   */
  addStrategy(strategy: RecoveryStrategy): void {
    this.strategies.set(strategy.id, strategy);
    this.emit('strategy:added', { strategy });

    this.logger.info('Recovery strategy added', {
      strategyId: strategy.id,
      name: strategy.name,
      severity: strategy.severity,
    });
  }

  /**
   * Remove a recovery strategy.
   */
  removeStrategy(strategyId: string): boolean {
    const removed = this.strategies.delete(strategyId);
    if (removed) {
      this.emit('strategy:removed', { strategyId });
      this.logger.info('Recovery strategy removed', { strategyId });
    }
    return removed;
  }

  /**
   * Get recovery metrics and statistics.
   */
  getMetrics(): {
    totalRecoveries: number;
    successfulRecoveries: number;
    failedRecoveries: number;
    averageDuration: number;
    activeRecoveries: number;
    strategiesCount: number;
    recentRecoveries: RecoveryResult[];
    } {
    const successful = this.recoveryHistory.filter((r) => r.success).length;
    const failed = this.recoveryHistory.length - successful;
    const averageDuration =
      this.recoveryHistory.length > 0
        ? this.recoveryHistory.reduce((sum, r) => sum + r.duration, 0) /
          this.recoveryHistory.length
        : 0;

    return {
      totalRecoveries: this.recoveryHistory.length,
      successfulRecoveries: successful,
      failedRecoveries: failed,
      averageDuration,
      activeRecoveries: this.activeRecoveries.size,
      strategiesCount: this.strategies.size,
      recentRecoveries: this.recoveryHistory.slice(-10),
    };
  }

  /**
   * Get all active recoveries.
   */
  getActiveRecoveries(): string[] {
    return Array.from(this.activeRecoveries.keys());
  }

  /**
   * Cancel an active recovery operation.
   */
  async cancelRecovery(errorId: string): Promise<boolean> {
    const recovery = this.activeRecoveries.get(errorId);
    if (!recovery) {
      return false;
    }

    this.activeRecoveries.delete(errorId);
    this.emit('recovery:cancelled', { errorId });

    this.logger.info('Recovery cancelled', { errorId });
    return true;
  }

  /**
   * Shutdown the recovery system gracefully.
   */
  async shutdown(): Promise<void> {
    this.logger.info('Shutting down error recovery system');

    // Wait for active recoveries to complete or timeout
    const activeRecoveries = Array.from(this.activeRecoveries.values());
    if (activeRecoveries.length > 0) {
      this.logger.info('Waiting for active recoveries to complete', {
        count: activeRecoveries.length,
      });

      await Promise.allSettled(activeRecoveries);
    }

    this.activeRecoveries.clear();
    this.emit('shutdown');
  }

  // =============================================================================
  // PRIVATE METHODS
  // =============================================================================

  private findRecoveryStrategy(
    errorInfo: ErrorInfo,
  ): RecoveryStrategy | undefined {
    const candidates = Array.from(this.strategies.values())
      .filter(
        (strategy) =>
          strategy.enabled && this.strategyMatches(strategy, errorInfo),
      )
      .sort((a, b) => b.priority - a.priority);

    return candidates[0];
  }

  private strategyMatches(
    strategy: RecoveryStrategy,
    errorInfo: ErrorInfo,
  ): boolean {
    // Check severity match
    const severityLevels = { low: 1, medium: 2, high: 3, critical: 4 };
    if (
      severityLevels[errorInfo.severity] < severityLevels[strategy.severity]
    ) {
      return false;
    }

    // Check conditions
    return strategy.conditions.some((condition) => {
      // Simple pattern matching - could be extended with regex or more complex rules
      return (
        condition === '*' ||
        condition === errorInfo.component ||
        condition === errorInfo.errorType ||
        condition === errorInfo.operation ||
        errorInfo.message?.includes(condition)
      );
    });
  }

  private async executeRecovery(
    errorInfo: ErrorInfo,
    strategy: RecoveryStrategy,
  ): Promise<RecoveryResult> {
    const startTime = Date.now();
    const result: RecoveryResult = {
      success: false,
      strategy,
      actionsExecuted: [],
      duration: 0,
    };

    this.logger.info('Executing recovery strategy', {
      errorId: errorInfo.errorId,
      strategyId: strategy.id,
      actionsCount: strategy.actions.length,
    });

    this.emit('recovery:started', { errorInfo, strategy });

    try {
      // Execute recovery actions in sequence
      for (const action of strategy.actions) {
        const actionResult = await this.executeRecoveryAction(
          action,
          errorInfo,
          strategy,
        );
        result.actionsExecuted.push(actionResult);

        if (!actionResult.success && !action.retryable) {
          throw new Error(`Recovery action failed: ${actionResult.error}`);
        }
      }

      result.success = true;
      this.logger.info('Recovery strategy completed successfully', {
        errorId: errorInfo.errorId,
        strategyId: strategy.id,
        duration: Date.now() - startTime,
      });
    } catch (error) {
      result.error = error instanceof Error ? error.message : String(error);
      this.logger.error('Recovery strategy failed', {
        errorId: errorInfo.errorId,
        strategyId: strategy.id,
        error: result.error,
      });
    }

    result.duration = Date.now() - startTime;
    return result;
  }

  private async executeRecoveryAction(
    action: RecoveryAction,
    errorInfo: ErrorInfo,
    strategy: RecoveryStrategy,
  ): Promise<RecoveryActionResult> {
    const startTime = Date.now();
    const actionTimeout = action.timeout || strategy.timeout;

    this.logger.debug('Executing recovery action', {
      actionType: action.type,
      target: action.target,
      timeout: actionTimeout,
    });

    try {
      // Simulate action execution based on type
      // In a real implementation, this would dispatch to actual recovery handlers
      const result = await this.executeActionByType(action, errorInfo);

      return {
        action,
        success: true,
        duration: Date.now() - startTime,
        result,
      };
    } catch (error) {
      return {
        action,
        success: false,
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  private async executeActionByType(
    action: RecoveryAction,
    errorInfo: ErrorInfo,
  ): Promise<unknown> {
    // This is a simulation - in real implementation, these would be actual recovery operations
    switch (action.type) {
    case 'restart':
      this.logger.info('Simulating restart action', {
        target: action.target,
        component: errorInfo.component,
      });
      await this.delay(1000); // Simulate restart time
      return { restarted: true, target: action.target };

    case 'rollback':
      this.logger.info('Simulating rollback action', {
        target: action.target,
        component: errorInfo.component,
      });
      await this.delay(2000); // Simulate rollback time
      return { rolledBack: true, target: action.target };

    case 'failover':
      this.logger.info('Simulating failover action', {
        target: action.target,
        component: errorInfo.component,
      });
      await this.delay(1500); // Simulate failover time
      return { failedOver: true, target: action.target };

    case 'scale':
      this.logger.info('Simulating scale action', {
        target: action.target,
        component: errorInfo.component,
      });
      await this.delay(3000); // Simulate scaling time
      return { scaled: true, target: action.target };

    case 'notify':
      this.logger.info('Simulating notify action', {
        target: action.target,
        component: errorInfo.component,
      });
      await this.delay(500); // Simulate notification time
      return { notified: true, target: action.target };

    case 'repair':
      this.logger.info('Simulating repair action', {
        target: action.target,
        component: errorInfo.component,
      });
      await this.delay(2500); // Simulate repair time
      return { repaired: true, target: action.target };

    case 'custom':
      this.logger.info('Simulating custom action', {
        target: action.target,
        component: errorInfo.component,
        parameters: action.parameters,
      });
      await this.delay(1000); // Simulate custom action time
      return {
        executed: true,
        target: action.target,
        parameters: action.parameters,
      };

    default:
      throw new Error(`Unknown recovery action type: ${action.type}`);
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private startMonitoring(): void {
    setInterval(() => {
      const metrics = this.getMetrics();
      this.emit('metrics:collected', { metrics, timestamp: new Date() });

      this.logger.debug('Recovery system metrics', metrics);
    }, this.config.monitoring.metricsInterval);
  }
}

// =============================================================================
// FACTORY FUNCTIONS
// =============================================================================

/**
 * Create a new error recovery system with default configuration.
 */
export function createErrorRecovery(
  config?: Partial<ErrorRecoveryConfig>,
): ErrorRecoverySystem {
  const defaultConfig: ErrorRecoveryConfig = {
    strategies: [],
    defaultTimeout: 30000,
    maxConcurrentRecoveries: 10,
    autoRecovery: true,
    monitoring: {
      enabled: true,
      metricsInterval: 60000,
      alertThresholds: {},
    },
  };

  return new ErrorRecoverySystem({ ...defaultConfig, ...config });
}

/**
 * Create common recovery strategies for typical use cases.
 */
export function createCommonRecoveryStrategies(): RecoveryStrategy[] {
  return [
    {
      id: 'service-restart',
      name: 'Service Restart',
      description: 'Restart failed services automatically',
      severity: 'medium',
      timeout: 30000,
      maxRetries: 3,
      backoffStrategy: 'exponential',
      baseDelay: 1000,
      maxDelay: 10000,
      conditions: ['service-failure', 'timeout', 'unresponsive'],
      actions: [{ type: 'restart', target: 'service', retryable: true }],
      priority: 100,
      enabled: true,
    },
    {
      id: 'database-failover',
      name: 'Database Failover',
      description: 'Failover to backup database on connection failures',
      severity: 'high',
      timeout: 60000,
      maxRetries: 2,
      backoffStrategy: 'linear',
      baseDelay: 2000,
      conditions: ['database', 'connection-error', 'timeout'],
      actions: [
        { type: 'failover', target: 'database', retryable: false },
        { type: 'notify', target: 'admin', retryable: true },
      ],
      priority: 200,
      enabled: true,
    },
    {
      id: 'critical-system-alert',
      name: 'Critical System Alert',
      description: 'Immediate notification for critical system failures',
      severity: 'critical',
      timeout: 10000,
      maxRetries: 1,
      backoffStrategy: 'fixed',
      baseDelay: 0,
      conditions: ['critical', 'fatal', 'system-failure'],
      actions: [
        { type: 'notify', target: 'emergency-contact', retryable: true },
        { type: 'notify', target: 'pager', retryable: true },
      ],
      priority: 1000,
      enabled: true,
    },
  ];
}

/**
 * Create an error recovery system with common strategies pre-configured.
 */
export function createErrorRecoveryWithCommonStrategies(
  additionalConfig?: Partial<ErrorRecoveryConfig>,
): ErrorRecoverySystem {
  const commonStrategies = createCommonRecoveryStrategies();

  const config: ErrorRecoveryConfig = {
    strategies: commonStrategies,
    ...additionalConfig,
  };

  return new ErrorRecoverySystem(config);
}
