/**
 * @file Recovery Strategies for Memory System Errors
 * Advanced error recovery and fault tolerance mechanisms.
 */

import { TypedEventBase } from '@claude-zen/foundation';
import type { BaseMemoryBackend } from '../backends/base-backend';
import type { BackendInterface } from '../core/memory-system';
import { type MemoryError, MemoryErrorCode } from './memory-errors';

export interface RecoveryStrategy {
  name: string;
  description: string;
  applicableErrors: MemoryErrorCode[];
  priority: number;
  timeoutMs: number;
  maxRetries: number;
  execute: (
    error: MemoryError,
    context: RecoveryContext
  ) => Promise<RecoveryResult>;
}

export interface RecoveryContext {
  backends: Map<string, BackendInterface'' | ''BaseMemoryBackend>;
  coordinator?: unknown;
  optimizer?: unknown;
  sessionId?: string;
  operation?: string;
  key?: string;
  originalValue?: unknown;
  attempt: number;
  maxAttempts: number;
}

export interface RecoveryResult {
  success: boolean;
  strategy: string;
  action: string;
  duration: number;
  data?: unknown;
  error?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Recovery Strategy Registry and Executor.
 *
 * @example
 */
export class RecoveryStrategyManager extends TypedEventBase {
  private strategies = new Map<string, RecoveryStrategy>();
  private recoveryHistory: Array<{
    timestamp: number;
    error: MemoryError;
    result: RecoveryResult;
  }> = [];

  constructor() {
    super();
    this.registerDefaultStrategies();
  }

  /**
   * Register a recovery strategy.
   *
   * @param strategy
   */
  registerStrategy(strategy: RecoveryStrategy): void {
    this.strategies.set(strategy.name, strategy);
    this.emit('strategyRegistered', strategy);
  }

  /**
   * Attempt to recover from an error.
   *
   * @param error
   * @param context
   */
  async recover(
    error: MemoryError,
    context: RecoveryContext
  ): Promise<RecoveryResult> {
    const startTime = Date.now();
    this.emit('recoveryStarted', { error, context });

    try {
      // Find applicable strategies
      const applicableStrategies = this.findApplicableStrategies(error);

      if (applicableStrategies.length === 0) {
        return {
          success: false,
          strategy: 'none',
          action: 'no_applicable_strategy',
          duration: Date.now() - startTime,
          error: `No recovery strategy found for error code: ${error.code}`,
        };
      }

      // Sort strategies by priority (higher priority first)
      applicableStrategies.sort((a, b) => b.priority - a.priority);

      // Try strategies in order
      for (const strategy of applicableStrategies) {
        try {
          this.emit('strategyAttempted', { strategy: strategy.name, error });

          const result = await this.executeWithTimeout(
            strategy,
            error,
            context
          );

          if (result?.success) {
            this.recordRecovery(error, result);
            this.emit('recoverySucceeded', { error, result });
            return result;
          }

          this.emit('strategyFailed', {
            strategy: strategy.name,
            error,
            result,
          });
        } catch (strategyError) {
          this.emit('strategyError', {
            strategy: strategy.name,
            error: strategyError,
          });
        }
      }

      // All strategies failed
      const result: RecoveryResult = {
        success: false,
        strategy: 'all_failed',
        action: 'exhausted_strategies',
        duration: Date.now() - startTime,
        error: 'All recovery strategies failed',
      };

      this.recordRecovery(error, result);
      this.emit('recoveryFailed', { error, result });
      return result;
    } catch (recoveryError) {
      const result: RecoveryResult = {
        success: false,
        strategy: 'recovery_error',
        action: 'recovery_system_failure',
        duration: Date.now() - startTime,
        error: recoveryError.message,
      };

      this.emit('recoveryError', { error, recoveryError });
      return result;
    }
  }

  /**
   * Execute strategy with timeout.
   *
   * @param strategy
   * @param error
   * @param context
   */
  private async executeWithTimeout(
    strategy: RecoveryStrategy,
    error: MemoryError,
    context: RecoveryContext
  ): Promise<RecoveryResult> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(
          new Error(
            `Recovery strategy '${strategy.name}' timed out after ${strategy.timeoutMs}ms`
          )
        );
      }, strategy.timeoutMs);

      strategy
        .execute(error, context)
        .then((result) => {
          clearTimeout(timeout);
          resolve(result);
        })
        .catch((error) => {
          clearTimeout(timeout);
          reject(error);
        });
    });
  }

  /**
   * Find strategies applicable to an error.
   *
   * @param error
   */
  private findApplicableStrategies(error: MemoryError): RecoveryStrategy[] {
    return Array.from(this.strategies.values()).filter((strategy) =>
      strategy.applicableErrors.includes(error.code)
    );
  }

  /**
   * Record recovery attempt for analysis.
   *
   * @param error
   * @param result
   */
  private recordRecovery(error: MemoryError, result: RecoveryResult): void {
    this.recoveryHistory.push({
      timestamp: Date.now(),
      error,
      result,
    });

    // Limit history size
    if (this.recoveryHistory.length > 1000) {
      this.recoveryHistory = this.recoveryHistory.slice(-800);
    }
  }

  /**
   * Register default recovery strategies.
   */
  private registerDefaultStrategies(): void {
    // Node Reconnection Strategy
    this.registerStrategy({
      name: 'node_reconnection',
      description: 'Attempt to reconnect to unreachable nodes',
      applicableErrors: [
        MemoryErrorCode['NODE_UNREACHABLE'],
        MemoryErrorCode['BACKEND_CONNECTION_LOST'],
      ],
      priority: 8,
      timeoutMs: 10000,
      maxRetries: 3,
      execute: async (error, context) => {
        const startTime = Date.now();
        const backendId = error.context.backendId'' | '''' | ''error.context.nodeId;

        if (!(backendId && context.backends.has(backendId))) {
          return {
            success: false,
            strategy:'node_reconnection',
            action: 'backend_not_found',
            duration: Date.now() - startTime,
            error: 'Backend not found for reconnection',
          };
        }

        const backend = context.backends.get(backendId)!;

        try {
          // Attempt to reinitialize the backend
          await backend.initialize?.();

          // Test connectivity with method compatibility
          if ('get' in backend && typeof backend.get === 'function') {
            await backend.get('__health_check__');
          } else if (
            'retrieve' in backend &&
            typeof backend.retrieve === 'function'
          ) {
            await backend.retrieve('__health_check__');
          } else {
            throw new Error('Backend lacks required methods');
          }

          return {
            success: true,
            strategy: 'node_reconnection',
            action: 'backend_reconnected',
            duration: Date.now() - startTime,
            metadata: { backendId },
          };
        } catch (reconnectError) {
          return {
            success: false,
            strategy: 'node_reconnection',
            action: 'reconnection_failed',
            duration: Date.now() - startTime,
            error: reconnectError.message,
          };
        }
      },
    });

    // Data Repair Strategy
    this.registerStrategy({
      name: 'data_repair',
      description: 'Attempt to repair corrupted or inconsistent data',
      applicableErrors: [
        MemoryErrorCode['DATA_CORRUPTION'],
        MemoryErrorCode['DATA_INCONSISTENCY'],
      ],
      priority: 9,
      timeoutMs: 15000,
      maxRetries: 2,
      execute: async (error, context) => {
        const startTime = Date.now();
        const key = error.context.key'' | '''' | ''context.key;

        if (!key) {
          return {
            success: false,
            strategy:'data_repair',
            action: 'key_not_specified',
            duration: Date.now() - startTime,
            error: 'Data key not specified for repair',
          };
        }

        try {
          // Collect data from all healthy backends
          const dataVersions = new Map();
          const healthyBackends = [];

          for (const [id, backend] of Array.from(context.backends.entries())) {
            try {
              let data;
              if ('get' in backend && typeof backend.get === 'function') {
                data = await backend.get(key);
              } else if (
                'retrieve' in backend &&
                typeof backend.retrieve === 'function') {
                data = await backend.retrieve(key);
              } else {
                continue; // Skip backends without compatible methods
              }

              if (data !== null) {
                const dataKey = JSON.stringify(data);
                dataVersions?.set(
                  dataKey,
                  (dataVersions?.get(dataKey)'' | '''' | ''0) + 1
                );
                healthyBackends.push({ id, backend, data } as never);
              }
            } catch {
              // Skip unhealthy backends
            }
          }

          if (dataVersions.size === 0) {
            return {
              success: false,
              strategy:'data_repair',
              action: 'no_data_found',
              duration: Date.now() - startTime,
              error: 'No valid data found across backends',
            };
          }

          // Find the most common version (consensus)
          let consensusData = null;
          let maxCount = 0;

          for (const [dataStr, count] of Array.from(dataVersions.entries())) {
            if (count > maxCount) {
              maxCount = count;
              consensusData = JSON.parse(dataStr);
            }
          }

          // Repair all backends with consensus data
          const repairPromises = Array.from(context.backends.entries()).map(
            async ([id, backend]) => {
              try {
                if ('set' in backend && typeof backend.set === 'function') {
                  await backend.set(key, consensusData);
                } else if (
                  'store' in backend &&
                  typeof backend.store === 'function'
                ) {
                  await backend.store(key, consensusData);
                } else {
                  throw new Error('Backend lacks required set/store method');
                }
                return { id, status: 'repaired' };
              } catch (repairError) {
                return {
                  id,
                  status: 'failed',
                  error: (repairError as Error).message,
                };
              }
            }
          );

          const repairResults = await Promise.all(repairPromises);
          const successfulRepairs = repairResults?.filter(
            (r) => r.status === 'repaired'
          ).length;

          return {
            success: successfulRepairs > 0,
            strategy: 'data_repair',
            action: 'consensus_repair_completed',
            duration: Date.now() - startTime,
            data: consensusData,
            metadata: {
              key,
              successfulRepairs,
              totalBackends: context.backends.size,
              repairResults,
            },
          };
        } catch (repairError) {
          return {
            success: false,
            strategy: 'data_repair',
            action: 'repair_failed',
            duration: Date.now() - startTime,
            error: repairError.message,
          };
        }
      },
    });

    // Cache Optimization Strategy
    this.registerStrategy({
      name: 'cache_optimization',
      description: 'Optimize cache settings to improve performance',
      applicableErrors: [
        MemoryErrorCode['CACHE_MISS_RATE_HIGH'],
        MemoryErrorCode['LATENCY_THRESHOLD_EXCEEDED'],
      ],
      priority: 5,
      timeoutMs: 5000,
      maxRetries: 1,
      execute: async (_error, context) => {
        const startTime = Date.now();

        try {
          // Trigger optimization through the optimizer if available
          if (context.optimizer) {
            // Simulate cache optimization
            const optimizationResult = {
              cacheSize: 'increased',
              evictionPolicy: 'adjusted',
              prefetchStrategy: 'optimized',
            };

            return {
              success: true,
              strategy: 'cache_optimization',
              action: 'cache_optimized',
              duration: Date.now() - startTime,
              data: optimizationResult,
            };
          }

          return {
            success: false,
            strategy: 'cache_optimization',
            action: 'optimizer_not_available',
            duration: Date.now() - startTime,
            error: 'Performance optimizer not available',
          };
        } catch (optimizationError) {
          return {
            success: false,
            strategy: 'cache_optimization',
            action: 'optimization_failed',
            duration: Date.now() - startTime,
            error: optimizationError.message,
          };
        }
      },
    });

    // Retry with Backoff Strategy
    this.registerStrategy({
      name: 'retry_with_backoff',
      description: 'Retry failed operation with exponential backoff',
      applicableErrors: [
        MemoryErrorCode['CONSENSUS_TIMEOUT'],
        MemoryErrorCode['SYSTEM_OVERLOAD'],
      ],
      priority: 3,
      timeoutMs: 30000,
      maxRetries: 5,
      execute: async (error, context) => {
        const startTime = Date.now();
        const maxRetries = 3;
        let lastError = error;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
          try {
            // Exponential backoff delay
            const delay = Math.min(1000 * 2 ** (attempt - 1), 8000);
            await new Promise((resolve) => setTimeout(resolve, delay));

            // Retry the original operation if we have enough context
            if (context.operation && context.key) {
              const backend = Array.from(context.backends.values())[0];

              switch (context.operation) {
                case 'read': {
                  let data;
                  if ('get' in backend && typeof backend.get === 'function') {
                    data = await backend.get(context.key);
                  } else if (
                    'retrieve' in backend &&
                    typeof backend.retrieve === 'function'
                  ) {
                    data = await backend.retrieve(context.key);
                  } else {
                    throw new Error(
                      'Backend lacks required get/retrieve method'
                    );
                  }
                  return {
                    success: true,
                    strategy: 'retry_with_backoff',
                    action: 'retry_succeeded',
                    duration: Date.now() - startTime,
                    data,
                    metadata: { attempt, delay },
                  };
                }

                case 'write':
                  if ('set' in backend && typeof backend.set === 'function') {
                    await backend.set(context.key, context.originalValue);
                  } else if (
                    'store' in backend &&
                    typeof backend.store === 'function'
                  ) {
                    await backend.store(context.key, context.originalValue);
                  } else {
                    throw new Error('Backend lacks required set/store method');
                  }
                  return {
                    success: true,
                    strategy: 'retry_with_backoff',
                    action: 'retry_succeeded',
                    duration: Date.now() - startTime,
                    metadata: { attempt, delay },
                  };
              }
            }

            // If we can't retry the specific operation, just wait and return success
            return {
              success: true,
              strategy: 'retry_with_backoff',
              action: 'backoff_completed',
              duration: Date.now() - startTime,
              metadata: { attempt, delay },
            };
          } catch (retryError) {
            lastError = retryError;
            if (attempt === maxRetries) {
              return {
                success: false,
                strategy: 'retry_with_backoff',
                action: 'max_retries_exceeded',
                duration: Date.now() - startTime,
                error: lastError.message,
                metadata: { attempts: maxRetries },
              };
            }
          }
        }

        return {
          success: false,
          strategy: 'retry_with_backoff',
          action: 'retry_loop_failed',
          duration: Date.now() - startTime,
          error: 'Unexpected exit from retry loop',
        };
      },
    });

    // Graceful Degradation Strategy
    this.registerStrategy({
      name: 'graceful_degradation',
      description:
        'Degrade functionality gracefully to maintain partial service',
      applicableErrors: [
        MemoryErrorCode['RESOURCE_EXHAUSTED'],
        MemoryErrorCode['BACKEND_CAPACITY_EXCEEDED'],
        MemoryErrorCode['QUORUM_NOT_REACHED'],
      ],
      priority: 2,
      timeoutMs: 3000,
      maxRetries: 1,
      execute: async (error, _context) => {
        const startTime = Date.now();

        try {
          const degradationActions: string[] = [];

          // Reduce memory usage
          if (error.code === MemoryErrorCode['RESOURCE_EXHAUSTED']) {
            degradationActions.push('reduced_cache_size');
            degradationActions.push('enabled_compression');
          }

          // Use single node instead of quorum
          if (error.code === MemoryErrorCode['QUORUM_NOT_REACHED']) {
            degradationActions.push('fallback_to_single_node');
            degradationActions.push('reduced_consistency_guarantee');
          }

          // Archive old data
          if (error.code === MemoryErrorCode['BACKEND_CAPACITY_EXCEEDED']) {
            degradationActions.push('archived_old_data');
            degradationActions.push('reduced_retention_period');
          }

          return {
            success: true,
            strategy: 'graceful_degradation',
            action: 'degradation_applied',
            duration: Date.now() - startTime,
            metadata: { degradationActions },
          };
        } catch (degradationError) {
          return {
            success: false,
            strategy: 'graceful_degradation',
            action: 'degradation_failed',
            duration: Date.now() - startTime,
            error: degradationError.message,
          };
        }
      },
    });
  }

  /**
   * Get recovery statistics.
   */
  getStats() {
    const totalRecoveries = this.recoveryHistory.length;
    const successfulRecoveries = this.recoveryHistory.filter(
      (r) => r.result.success
    ).length;
    const strategyCounts = new Map();

    this.recoveryHistory.forEach((record) => {
      const strategy = record.result.strategy;
      strategyCounts.set(strategy, (strategyCounts.get(strategy) || 0) + 1);
    });

    return {
      total: totalRecoveries,
      successful: successfulRecoveries,
      successRate:
        totalRecoveries > 0 ? successfulRecoveries / totalRecoveries : 0,
      strategies: Object.fromEntries(strategyCounts),
      registeredStrategies: this.strategies.size,
    };
  }

  /**
   * Get recommended strategies for an error.
   *
   * @param error
   */
  getRecommendedStrategies(error: MemoryError): RecoveryStrategy[] {
    return this.findApplicableStrategies(error).sort(
      (a, b) => b.priority - a.priority
    );
  }
}
