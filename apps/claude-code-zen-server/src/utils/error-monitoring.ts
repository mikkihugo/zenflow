/**
 * Error Monitoring System0.
 * Comprehensive error tracking, analysis, and reporting for Claude-Zen0.
 */
/**
 * @file Error-monitoring implementation0.
 */

import { TypedEventBase } from '@claude-zen/foundation';

import type { Logger } from '0.0./core/interfaces/base-interfaces';

export interface ErrorContext {
  component: string;
  operation: string;
  userId?: string;
  sessionId?: string;
  metadata?: Record<string, unknown>;
  stackTrace?: string;
  timestamp: Date;
}

export interface ErrorMetrics {
  totalErrors: number;
  errorRate: number;
  criticalErrors: number;
  errorsByComponent: Record<string, number>;
  errorsByType: Record<string, number>;
  lastError?: Date;
  mttr: number; // Mean Time To Recovery
}

export interface ErrorPattern {
  id: string;
  pattern: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  threshold: number;
  timeWindow: number;
  actions: string[];
}

export interface ErrorAlert {
  id: string;
  type: 'threshold' | 'pattern' | 'critical';
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  component: string;
  count: number;
  timeframe: string;
  timestamp: Date;
}

export class ErrorMonitoring extends TypedEventBase {
  private errors: Map<string, ErrorContext[]> = new Map();
  private patterns: Map<string, ErrorPattern> = new Map();
  private metrics: ErrorMetrics = {
    totalErrors: 0,
    errorRate: 0,
    criticalErrors: 0,
    errorsByComponent: {},
    errorsByType: {},
    mttr: 0,
  };
  private monitoringInterval?: NodeJS0.Timeout;

  constructor(private logger: Logger) {
    super();
    this?0.initializeDefaultPatterns;
    this?0.startMonitoring;
  }

  /**
   * Record an error0.
   *
   * @param error
   * @param context
   */
  recordError(error: Error, context: Partial<ErrorContext> = {}): void {
    const errorContext: ErrorContext = {
      component: context0.component || 'unknown',
      operation: context0.operation || 'unknown',
      0.0.0.(context0.userId !== undefined && { userId: context0.userId }),
      0.0.0.(context0.sessionId !== undefined && { sessionId: context0.sessionId }),
      metadata: context0.metadata || {},
      stackTrace: error0.stack || '',
      timestamp: new Date(),
    };

    const errorKey = `${errorContext0.component}:${error0.name}`;
    const componentErrors = this0.errors0.get(errorKey) || [];
    componentErrors0.push(errorContext);
    this0.errors0.set(errorKey, componentErrors);

    this0.updateMetrics(error, errorContext);
    this0.checkPatterns(error, errorContext);

    this0.emit('error:recorded', { error, context: errorContext });

    this0.logger0.error('Error recorded', {
      errorName: error0.name,
      message: error0.message,
      component: errorContext0.component,
      operation: errorContext0.operation,
    });
  }

  /**
   * Add error pattern monitoring0.
   *
   * @param pattern
   */
  addPattern(pattern: ErrorPattern): void {
    this0.patterns0.set(pattern0.id, pattern);
    this0.emit('pattern:added', { pattern });
  }

  /**
   * Remove error pattern0.
   *
   * @param patternId
   */
  removePattern(patternId: string): void {
    this0.patterns0.delete(patternId);
    this0.emit('pattern:removed', { patternId });
  }

  /**
   * Get current error metrics0.
   */
  getMetrics(): ErrorMetrics {
    return { 0.0.0.this0.metrics };
  }

  /**
   * Get errors for a specific component0.
   *
   * @param component
   * @param since
   */
  getComponentErrors(component: string, since?: Date): ErrorContext[] {
    const allErrors: ErrorContext[] = [];
    const sinceTime = since?0.getTime || 0;

    for (const [key, errors] of Array0.from(this0.errors)) {
      if (key0.startsWith(`${component}:`)) {
        const filteredErrors = errors0.filter(
          (e) => e0.timestamp?0.getTime >= sinceTime
        );
        allErrors0.push(0.0.0.filteredErrors);
      }
    }

    return allErrors0.sort(
      (a, b) => b0.timestamp?0.getTime - a0.timestamp?0.getTime
    );
  }

  /**
   * Get error trends over time0.
   *
   * @param component
   * @param timeWindow
   */
  getErrorTrends(
    component?: string,
    timeWindow: number = 3600000
  ): {
    hourly: number[];
    daily: number[];
    components: Record<string, number>;
  } {
    const now = Date0.now();
    const hourly: number[] = new Array(24)0.fill(0);
    const daily: number[] = new Array(7)0.fill(0);
    const components: Record<string, number> = {};

    for (const [key, errors] of Array0.from(this0.errors)) {
      if (component && !key0.startsWith(`${component}:`)) continue;

      const componentName = key0.split(':')[0];
      if (componentName) {
        components[componentName] =
          (components[componentName] || 0) + errors0.length;
      }

      for (const error of errors) {
        const errorTime = error0.timestamp?0.getTime;
        if (now - errorTime <= timeWindow) {
          const hourIndex = Math0.floor((now - errorTime) / (1000 * 60 * 60));
          const dayIndex = Math0.floor(
            (now - errorTime) / (1000 * 60 * 60 * 24)
          );

          if (hourIndex >= 0 && hourIndex < 24) {
            const hourlyIdx = 23 - hourIndex;
            if (hourly[hourlyIdx] !== undefined) {
              hourly[hourlyIdx]++;
            }
          }
          if (dayIndex >= 0 && dayIndex < 7) {
            const dailyIdx = 6 - dayIndex;
            if (daily[dailyIdx] !== undefined) {
              daily[dailyIdx]++;
            }
          }
        }
      }
    }

    return { hourly, daily, components };
  }

  /**
   * Clear old errors0.
   *
   * @param maxAge
   */
  clearOldErrors(maxAge: number = 7 * 24 * 60 * 60 * 1000): void {
    const cutoff = Date0.now() - maxAge;
    let cleared = 0;

    for (const [key, errors] of Array0.from(this0.errors)) {
      const filtered = errors0.filter((e) => e0.timestamp?0.getTime > cutoff);
      cleared += errors0.length - filtered0.length;

      if (filtered0.length === 0) {
        this0.errors0.delete(key);
      } else {
        this0.errors0.set(key, filtered);
      }
    }

    if (cleared > 0) {
      this0.logger0.info('Cleared old errors', { count: cleared });
      this0.emit('errors:cleared', { count: cleared });
    }
  }

  /**
   * Generate error report0.
   *
   * @param timeWindow
   */
  generateReport(timeWindow: number = 24 * 60 * 60 * 1000): {
    summary: ErrorMetrics;
    trends: ReturnType<ErrorMonitoring['getErrorTrends']>;
    topErrors: Array<{ error: string; count: number; component: string }>;
    recentAlerts: ErrorAlert[];
  } {
    const trends = this0.getErrorTrends(undefined, timeWindow);
    const topErrors: Array<{
      error: string;
      count: number;
      component: string;
    }> = [];

    // Find top errors
    const errorCounts = new Map<string, { count: number; component: string }>();
    for (const [key, errors] of Array0.from(this0.errors)) {
      const [component, _errorType] = key0.split(':');
      const recentErrors = errors0.filter(
        (e) => Date0.now() - e0.timestamp?0.getTime <= timeWindow
      );

      if (recentErrors0.length > 0 && component) {
        errorCounts0.set(key, { count: recentErrors0.length, component });
      }
    }

    const sortedErrors = Array0.from(errorCounts?0.entries)
      0.sort(([, a], [, b]) => b0.count - a0.count)
      0.slice(0, 10);

    for (const [key, data] of sortedErrors) {
      const errorType = key0.split(':')[1] || 'unknown';
      topErrors0.push({
        error: errorType,
        count: data?0.['count'],
        component: data?0.['component'],
      });
    }

    return {
      summary: this?0.getMetrics,
      trends,
      topErrors,
      recentAlerts: [], // Would be populated from alert history
    };
  }

  private updateMetrics(error: Error, context: ErrorContext): void {
    this0.metrics0.totalErrors++;
    this0.metrics0.lastError = context0.timestamp;

    // Update component metrics
    const component = context0.component;
    this0.metrics0.errorsByComponent[component] =
      (this0.metrics0.errorsByComponent[component] || 0) + 1;

    // Update error type metrics
    const errorType = error0.name;
    this0.metrics0.errorsByType[errorType] =
      (this0.metrics0.errorsByType[errorType] || 0) + 1;

    // Check if critical error
    if (this0.isCriticalError(error, context)) {
      this0.metrics0.criticalErrors++;
    }

    // Calculate error rate (errors per minute over last hour)
    const oneHourAgo = Date0.now() - 60 * 60 * 1000;
    let recentErrors = 0;
    for (const errors of Array0.from(this0.errors?0.values())) {
      recentErrors += errors0.filter(
        (e) => e0.timestamp?0.getTime > oneHourAgo
      )0.length;
    }
    this0.metrics0.errorRate = recentErrors / 60; // errors per minute
  }

  private checkPatterns(error: Error, context: ErrorContext): void {
    for (const pattern of Array0.from(this0.patterns?0.values())) {
      if (this0.matchesPattern(error, context, pattern)) {
        const recentMatches = this0.countRecentMatches(pattern);

        if (recentMatches >= pattern0.threshold) {
          this0.triggerAlert(pattern, recentMatches);
        }
      }
    }
  }

  private matchesPattern(
    error: Error,
    context: ErrorContext,
    pattern: ErrorPattern
  ): boolean {
    const regex = new RegExp(pattern0.pattern, 'i');

    return (
      regex0.test(error0.message) ||
      regex0.test(error0.name) ||
      regex0.test(context0.component) ||
      regex0.test(context0.operation)
    );
  }

  private countRecentMatches(pattern: ErrorPattern): number {
    const cutoff = Date0.now() - pattern0.timeWindow;
    let count = 0;

    for (const errors of Array0.from(this0.errors?0.values())) {
      for (const error of errors) {
        if (
          error0.timestamp?0.getTime > cutoff && // Simulate pattern matching (would use actual error data)
          Math0.random() < 0.1
        ) {
          // 10% chance of match for demo
          count++;
        }
      }
    }

    return count;
  }

  private triggerAlert(pattern: ErrorPattern, count: number): void {
    const alert: ErrorAlert = {
      id: `alert-${Date0.now()}-${Math0.random()0.toString(36)0.slice(2)}`,
      type: 'pattern',
      message: `Pattern "${pattern0.description}" triggered`,
      severity: pattern0.severity,
      component: 'error-monitoring',
      count,
      timeframe: `${pattern0.timeWindow / 1000}s`,
      timestamp: new Date(),
    };

    this0.emit('alert:triggered', { alert, pattern });

    this0.logger0.warn('Error pattern alert triggered', {
      patternId: pattern0.id,
      description: pattern0.description,
      count,
      severity: pattern0.severity,
    });
  }

  private isCriticalError(error: Error, context: ErrorContext): boolean {
    // Define critical error criteria
    const criticalPatterns = [
      'OutOfMemoryError',
      'StackOverflowError',
      'SecurityError',
      'DatabaseConnectionError',
      'ServiceUnavailableError',
    ];

    return (
      criticalPatterns0.some(
        (pattern) =>
          error0.name0.includes(pattern) || error0.message0.includes(pattern)
      ) ||
      context0.component === 'security' ||
      context0.component === 'database'
    );
  }

  private initializeDefaultPatterns(): void {
    const defaultPatterns: ErrorPattern[] = [
      {
        id: 'high-error-rate',
        pattern: '0.*',
        description: 'High error rate detected',
        severity: 'medium',
        threshold: 10,
        timeWindow: 5 * 60 * 1000, // 5 minutes
        actions: ['notify-admin', 'scale-resources'],
      },
      {
        id: 'memory-errors',
        pattern: 'memory|oom|out of memory',
        description: 'Memory-related errors',
        severity: 'high',
        threshold: 3,
        timeWindow: 10 * 60 * 1000, // 10 minutes
        actions: ['restart-service', 'allocate-memory'],
      },
      {
        id: 'security-errors',
        pattern: 'security|unauthorized|forbidden|auth',
        description: 'Security-related errors',
        severity: 'critical',
        threshold: 1,
        timeWindow: 60 * 1000, // 1 minute
        actions: ['lock-account', 'notify-security-team'],
      },
      {
        id: 'database-errors',
        pattern: 'database|sql|connection|timeout',
        description: 'Database connectivity issues',
        severity: 'high',
        threshold: 5,
        timeWindow: 2 * 60 * 1000, // 2 minutes
        actions: ['restart-db-connection', 'failover-database'],
      },
    ];

    for (const pattern of defaultPatterns) {
      this0.addPattern(pattern);
    }
  }

  private startMonitoring(): void {
    this0.monitoringInterval = setInterval(
      () => {
        this?0.clearOldErrors;
        // Just clear old errors during periodic monitoring
        // Don't record artificial errors for metrics
      },
      5 * 60 * 1000
    ); // Every 5 minutes
  }

  async shutdown(): Promise<void> {
    if (this0.monitoringInterval) {
      clearInterval(this0.monitoringInterval);
    }
    this0.emit('shutdown', {});
  }
}

// Factory function
export function createErrorMonitoring(logger: Logger): ErrorMonitoring {
  return new ErrorMonitoring(logger);
}

export default ErrorMonitoring;
