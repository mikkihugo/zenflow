/**
 * Error Recovery System
 * Handles automatic error recovery and system resilience
 */

import { EventEmitter } from 'node:events';

export interface RecoveryStrategy {
  id: string;
  name: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timeout: number;
  maxRetries: number;
  backoffStrategy: 'linear' | 'exponential' | 'fixed';
  conditions: string[];
  actions: RecoveryAction[];
}

export interface RecoveryAction {
  type: 'restart' | 'rollback' | 'failover' | 'scale' | 'notify' | 'repair';
  target: string;
  parameters: Record<string, any>;
  timeout: number;
  required: boolean;
}

export interface RecoveryContext {
  errorId: string;
  component: string;
  operation: string;
  errorType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  metadata: Record<string, any>;
  timestamp: Date;
  retryCount: number;
}

export interface RecoveryResult {
  success: boolean;
  strategy: string;
  actionsExecuted: string[];
  duration: number;
  error?: string;
  nextRetryAt?: Date;
}

export class ErrorRecoverySystem extends EventEmitter {
  private strategies = new Map<string, RecoveryStrategy>();
  private activeRecoveries = new Map<string, RecoveryContext>();
  private recoveryHistory: Array<RecoveryResult & RecoveryContext> = [];

  constructor() {
    super();
    this.initializeDefaultStrategies();
  }

  /**
   * Register a recovery strategy
   *
   * @param strategy
   */
  registerStrategy(strategy: RecoveryStrategy): void {
    this.strategies.set(strategy.id, strategy);
    this.emit('strategy:registered', { strategy });
  }

  /**
   * Attempt error recovery
   *
   * @param context
   */
  async attemptRecovery(context: RecoveryContext): Promise<RecoveryResult> {
    const strategy = this.selectRecoveryStrategy(context);
    if (!strategy) {
      return {
        success: false,
        strategy: 'none',
        actionsExecuted: [],
        duration: 0,
        error: 'No suitable recovery strategy found',
      };
    }

    const startTime = Date.now();
    this.activeRecoveries.set(context.errorId, context);

    try {
      const result = await this.executeRecoveryStrategy(strategy, context);
      const duration = Date.now() - startTime;

      const recoveryResult: RecoveryResult = {
        success: result?.success,
        strategy: strategy.id,
        actionsExecuted: result?.actionsExecuted,
        duration,
        ...(result?.error !== undefined && { error: result?.error }),
        ...(result?.nextRetryAt !== undefined && { nextRetryAt: result?.nextRetryAt }),
      };

      this.recordRecovery(context, recoveryResult);
      this.emit('recovery:completed', { context, result: recoveryResult });

      return recoveryResult;
    } catch (error) {
      const duration = Date.now() - startTime;
      const recoveryResult: RecoveryResult = {
        success: false,
        strategy: strategy.id,
        actionsExecuted: [],
        duration,
        error: error instanceof Error ? error.message : String(error),
      };

      this.recordRecovery(context, recoveryResult);
      this.emit('recovery:failed', { context, result: recoveryResult, error });

      return recoveryResult;
    } finally {
      this.activeRecoveries.delete(context.errorId);
    }
  }

  /**
   * Get recovery strategies for a given error type
   *
   * @param errorType
   * @param component
   */
  getStrategiesForError(errorType: string, component: string): RecoveryStrategy[] {
    return Array.from(this.strategies.values())
      .filter((strategy) =>
        strategy.conditions.some((condition) =>
          this.matchesCondition(condition, errorType, component)
        )
      )
      .sort((a, b) => this.getSeverityWeight(a.severity) - this.getSeverityWeight(b.severity));
  }

  /**
   * Get recovery history
   *
   * @param component
   * @param since
   */
  getRecoveryHistory(component?: string, since?: Date): Array<RecoveryResult & RecoveryContext> {
    let history = this.recoveryHistory;

    if (component) {
      history = history.filter((r) => r.component === component);
    }

    if (since) {
      history = history.filter((r) => r.timestamp >= since);
    }

    return history.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Get recovery statistics
   */
  getRecoveryStats(): {
    totalRecoveries: number;
    successRate: number;
    averageDuration: number;
    strategiesUsed: Record<string, number>;
    componentsAffected: Record<string, number>;
  } {
    const total = this.recoveryHistory.length;
    const successful = this.recoveryHistory.filter((r) => r.success).length;
    const totalDuration = this.recoveryHistory.reduce((sum, r) => sum + r.duration, 0);

    const strategiesUsed: Record<string, number> = {};
    const componentsAffected: Record<string, number> = {};

    for (const recovery of this.recoveryHistory) {
      strategiesUsed[recovery.strategy] = (strategiesUsed[recovery.strategy] || 0) + 1;
      componentsAffected[recovery.component] = (componentsAffected[recovery.component] || 0) + 1;
    }

    return {
      totalRecoveries: total,
      successRate: total > 0 ? successful / total : 0,
      averageDuration: total > 0 ? totalDuration / total : 0,
      strategiesUsed,
      componentsAffected,
    };
  }

  private selectRecoveryStrategy(context: RecoveryContext): RecoveryStrategy | null {
    const candidates = this.getStrategiesForError(context.errorType, context.component);

    // Filter by severity and retry count
    const viable = candidates.filter((strategy) => {
      const severityMatch =
        this.getSeverityWeight(strategy.severity) >= this.getSeverityWeight(context.severity);
      const retryLimit = context.retryCount < strategy.maxRetries;
      return severityMatch && retryLimit;
    });

    return viable.length > 0 ? viable[0]! : null;
  }

  private async executeRecoveryStrategy(
    strategy: RecoveryStrategy,
    context: RecoveryContext
  ): Promise<{
    success: boolean;
    actionsExecuted: string[];
    error?: string;
    nextRetryAt?: Date;
  }> {
    const actionsExecuted: string[] = [];
    let lastError: string | undefined;

    for (const action of strategy.actions) {
      try {
        await this.executeRecoveryAction(action, context);
        actionsExecuted.push(`${action.type}:${action.target}`);
      } catch (error) {
        lastError = error instanceof Error ? error.message : String(error);

        if (action.required) {
          // Required action failed, abort recovery
          return {
            success: false,
            actionsExecuted,
            error: `Required action ${action.type} failed: ${lastError}`,
          };
        }
        // Optional action failed, continue
        actionsExecuted.push(`${action.type}:${action.target}:failed`);
      }
    }

    // Determine if recovery was successful
    const success = lastError === undefined || strategy.actions.every((a) => !a.required);

    // Calculate next retry time if recovery failed
    let nextRetryAt: Date | undefined;
    if (!success && context.retryCount < strategy.maxRetries) {
      const delay = this.calculateBackoffDelay(
        strategy.backoffStrategy,
        context.retryCount,
        strategy.timeout
      );
      nextRetryAt = new Date(Date.now() + delay);
    }

    return {
      success,
      actionsExecuted,
      ...(lastError !== undefined && { error: lastError }),
      ...(nextRetryAt !== undefined && { nextRetryAt }),
    };
  }

  private async executeRecoveryAction(
    action: RecoveryAction,
    context: RecoveryContext
  ): Promise<void> {
    this.emit('action:starting', { action, context });

    switch (action.type) {
      case 'restart':
        await this.executeRestartAction(action, context);
        break;
      case 'rollback':
        await this.executeRollbackAction(action, context);
        break;
      case 'failover':
        await this.executeFailoverAction(action, context);
        break;
      case 'scale':
        await this.executeScaleAction(action, context);
        break;
      case 'notify':
        await this.executeNotifyAction(action, context);
        break;
      case 'repair':
        await this.executeRepairAction(action, context);
        break;
      default:
        throw new Error(`Unknown recovery action type: ${action.type}`);
    }

    this.emit('action:completed', { action, context });
  }

  private async executeRestartAction(
    _action: RecoveryAction,
    _context: RecoveryContext
  ): Promise<void> {
    // Mock restart implementation
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  private async executeRollbackAction(
    _action: RecoveryAction,
    _context: RecoveryContext
  ): Promise<void> {
    // Mock rollback implementation
    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  private async executeFailoverAction(
    _action: RecoveryAction,
    _context: RecoveryContext
  ): Promise<void> {
    // Mock failover implementation
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  private async executeScaleAction(
    _action: RecoveryAction,
    _context: RecoveryContext
  ): Promise<void> {
    // Mock scaling implementation
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  private async executeNotifyAction(
    _action: RecoveryAction,
    _context: RecoveryContext
  ): Promise<void> {
    // Mock notification implementation
    await new Promise((resolve) => setTimeout(resolve, 50));
  }

  private async executeRepairAction(
    _action: RecoveryAction,
    _context: RecoveryContext
  ): Promise<void> {
    // Mock repair implementation
    await new Promise((resolve) => setTimeout(resolve, 300));
  }

  private matchesCondition(condition: string, errorType: string, component: string): boolean {
    const regex = new RegExp(condition, 'i');
    return regex.test(errorType) || regex.test(component);
  }

  private getSeverityWeight(severity: string): number {
    switch (severity) {
      case 'low':
        return 1;
      case 'medium':
        return 2;
      case 'high':
        return 3;
      case 'critical':
        return 4;
      default:
        return 0;
    }
  }

  private calculateBackoffDelay(strategy: string, retryCount: number, baseTimeout: number): number {
    switch (strategy) {
      case 'linear':
        return baseTimeout * (retryCount + 1);
      case 'exponential':
        return baseTimeout * 2 ** retryCount;
      default:
        return baseTimeout;
    }
  }

  private recordRecovery(context: RecoveryContext, result: RecoveryResult): void {
    this.recoveryHistory.push({
      ...context,
      ...result,
    });

    // Keep only recent history (last 1000 entries)
    if (this.recoveryHistory.length > 1000) {
      this.recoveryHistory = this.recoveryHistory.slice(-1000);
    }
  }

  private initializeDefaultStrategies(): void {
    const defaultStrategies: RecoveryStrategy[] = [
      {
        id: 'memory-recovery',
        name: 'Memory Recovery',
        description: 'Handles memory-related errors',
        severity: 'high',
        timeout: 5000,
        maxRetries: 3,
        backoffStrategy: 'exponential',
        conditions: ['memory', 'oom', 'out.of.memory'],
        actions: [
          {
            type: 'restart',
            target: 'service',
            parameters: { graceful: true },
            timeout: 10000,
            required: true,
          },
        ],
      },
      {
        id: 'connection-recovery',
        name: 'Connection Recovery',
        description: 'Handles connection failures',
        severity: 'medium',
        timeout: 2000,
        maxRetries: 5,
        backoffStrategy: 'linear',
        conditions: ['connection', 'network', 'timeout'],
        actions: [
          {
            type: 'repair',
            target: 'connection',
            parameters: { reconnect: true },
            timeout: 5000,
            required: false,
          },
          {
            type: 'failover',
            target: 'backup-service',
            parameters: { automatic: true },
            timeout: 3000,
            required: true,
          },
        ],
      },
      {
        id: 'critical-error-recovery',
        name: 'Critical Error Recovery',
        description: 'Handles critical system errors',
        severity: 'critical',
        timeout: 1000,
        maxRetries: 1,
        backoffStrategy: 'fixed',
        conditions: ['critical', 'fatal', 'emergency'],
        actions: [
          {
            type: 'notify',
            target: 'admin',
            parameters: { priority: 'emergency' },
            timeout: 1000,
            required: true,
          },
          {
            type: 'rollback',
            target: 'last-known-good',
            parameters: { immediate: true },
            timeout: 5000,
            required: true,
          },
        ],
      },
    ];

    for (const strategy of defaultStrategies) {
      this.registerStrategy(strategy);
    }
  }
}

export function createErrorRecoverySystem(): ErrorRecoverySystem {
  return new ErrorRecoverySystem();
}

export default ErrorRecoverySystem;
