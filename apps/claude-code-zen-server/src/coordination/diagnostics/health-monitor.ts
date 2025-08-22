/**
 * @file Coordination system: health-monitor.
 */

import { randomUUID } from 'node:crypto';
import { performance } from 'node:perf_hooks';

import { getLogger, TypedEventBase } from '@claude-zen/foundation';

/**
 * HealthMonitor - Proactive health monitoring system for session persistence.
 * Part of comprehensive solution for Issue #137: Swarm session persistence and recovery.
 *
 * Features:
 * - Real-time health checking with configurable intervals
 * - Built-in system checks (memory, CPU, event loop, persistence)
 * - Custom health check registration
 * - Threshold-based alerting and escalation
 * - Performance metrics collection
 * - Integration with recovery workflows.
 *
 * Version: 1"..0' - Production Grade
 * Author: Claude Code Assistant (Swarm Implementation)
 * License: MIT.
 */

const logger = getLogger('coordination-diagnostics-health-monitor');

export interface HealthMonitorOptions {
  checkInterval?: number;
  alertThreshold?: number;
  criticalThreshold?: number;
  enableSystemChecks?: boolean;
  enableCustomChecks?: boolean;
  maxHistorySize?: number;
  [key: string]: any;
}

export type HealthCheckFunction = () => Promise<HealthCheckResult | Partial<HealthCheckResult>> | HealthCheckResult | Partial<HealthCheckResult>;

export interface HealthCheck {
  name: string;
  checkFunction: HealthCheckFunction;
  weight: number;
  timeout: number;
  enabled: boolean;
  critical: boolean;
  description: string;
  lastRun: string | null;
  lastResult: HealthCheckResult | null;
  runCount: number;
  errorCount: number;
}

export interface HealthCheckResult {
  score: number;
  status: string;
  details: string;
  metrics: Record<string, unknown>;
  duration: number;
}

export interface HealthReport {
  id: string;
  timestamp: string;
  overallScore: number;
  status: 'healthy' | 'warning' | 'critical';
  duration: number;
  checkCount: number;
  criticalFailures: number;
  results: Record<string, HealthCheckResult>;
}

export interface HealthAlert {
  id: string;
  type: 'critical' | 'warning';
  timestamp: string;
  title: string;
  message: string;
  details: Record<string, unknown> | string | null;
  resolved: boolean;
}

/**
 * HealthMonitor provides comprehensive system health monitoring
 * with configurable checks and automatic alerting.
 *
 * @example.
 * @example
 */
export class HealthMonitor extends TypedEventBase {
  private options: HealthMonitorOptions;
  private isRunning: boolean;
  private checkTimer: NodeJS.Timeout | null;
  private healthChecks: Map<string, HealthCheck>;
  private healthHistory: HealthReport[];
  private currentHealth: HealthReport | {};
  private alerts: HealthAlert[];
  private startTime?: number;
  private persistenceChecker?: () => Promise<void>;

  constructor(options: HealthMonitorOptions = {}) {
    super();

    this.options = {
      checkInterval: options?.checkInterval || 30000, // 30 seconds
      alertThreshold: options?.alertThreshold || 70, // Alert when health < 70%
      criticalThreshold: options?.criticalThreshold || 50, // Critical when health < 50%
      enableSystemChecks: options?.enableSystemChecks !== false,
      enableCustomChecks: options?.enableCustomChecks !== false,
      maxHistorySize: options?.maxHistorySize || 1000,
      ...options,
    };

    this.isRunning = false;
    this.checkTimer = null;
    this.healthChecks = new Map();
    this.healthHistory = [];
    this.currentHealth = {};
    this.alerts = [];

    // Initialize built-in health checks
    if (this.options.enableSystemChecks) {
      this.initializeSystemChecks();
    }
  }

  /**
   * Start health monitoring.
   */
  async start(): Promise<void> {
    if (this.isRunning) return;

    this.isRunning = true;
    logger.error('🔍 HealthMonitor starting...');

    // Run initial health check
    await this.runHealthChecks();

    // Start periodic health checks
    this.checkTimer = setInterval(async () => {
      try {
        await this.runHealthChecks();
      } catch (error) {
        logger.error('❌ Health check error:', error);
        this.emit('healthCheckError', { error });
      }
    }, this.options.checkInterval);

    this.emit('started', { timestamp: new Date() });
    logger.error('✅ HealthMonitor started successfully');
  }

  /**
   * Stop health monitoring.
   */
  async stop(): Promise<void> {
    if (!this.isRunning) return;

    this.isRunning = false;

    if (this.checkTimer) {
      clearInterval(this.checkTimer);
      this.checkTimer = null;
    }

    this.emit('stopped', { timestamp: new Date() });
    logger.error('🛑 HealthMonitor stopped');
  }

  /**
   * Register a custom health check.
   *
   * @param name
   * @param checkFunction
   * @param options
   */
  registerHealthCheck(
    name: string,
    checkFunction: HealthCheckFunction,
    options: Partial<HealthCheck> = {}
  ): HealthCheck {
    const healthCheck = {
      name,
      checkFunction,
      weight: options?.weight || 1,
      timeout: options?.timeout || 5000,
      enabled: options?.enabled !== false,
      critical: options?.critical || false,
      description: options?.description || `Custom health check: ${name}`,
      lastRun: null,
      lastResult: null,
      runCount: 0,
      errorCount: 0,
    };

    this.healthChecks.set(name, healthCheck);
    logger.error(`✅ Registered health check: ${name}`);

    return healthCheck;
  }

  /**
   * Remove a health check.
   *
   * @param name
   */
  unregisterHealthCheck(name: string): boolean {
    const removed = this.healthChecks.delete(name);
    if (removed) {
      logger.error(`🗑️ Removed health check: ${name}`);
    }
    return removed;
  }

  /**
   * Run all health checks.
   */
  async runHealthChecks(): Promise<HealthReport> {
    const startTime = performance?.now()
    const checkId = randomUUID();
    const results: Record<
      string,
      {
        score: number;
        status: string;
        details: string;
        metrics: Record<string, unknown>;
        timestamp: string;
        duration: number;
      }
    > = {};

    logger.error('🔍 Running health checks...');

    // Run all registered health checks
    const checkPromises = Array.from(this.healthChecks?.entries()).map(
      ([name, check]) => this.runSingleHealthCheck(name, check)
    );

    const checkResults = await Promise.allSettled(checkPromises);

    // Process results
    let totalScore = 0;
    let totalWeight = 0;
    let criticalFailures = 0;

    checkResults?.forEach((result, index) => {
      const checkName = Array.from(this.healthChecks?.keys())[index];
      if (!checkName) return; // Guard against undefined
      const check = this.healthChecks.get(checkName);

      // Skip if check is undefined
      if (!check) {
        logger.error(`⚠️ Health check not found: ${checkName}`);
        return;
      }

      if (result?.status === 'fulfilled') {
        const { score, status, details, metrics } = result?.value

        if (results) {
          results[checkName] = {
            score,
            status,
            details,
            metrics,
            timestamp: new Date()?.toISOString(),
            duration: result?.value?.duration,
          };
        }

        totalScore += score * check.weight;
        totalWeight += check.weight;

        if (check.critical && score < (this.options.criticalThreshold ?? 50)) {
          criticalFailures++;
        }

        check.lastResult = result?.value
        check.lastRun = new Date()?.toISOString()
        check.runCount++;
      } else {
        if (results) {
          results[checkName] = {
            score: 0,
            status: 'error',
            details: result.reason?.message ?? 'Unknown error',
            metrics: {},
            timestamp: new Date()?.toISOString(),
            duration: 0,
          };
        }

        check.errorCount++;

        if (check.critical) {
          criticalFailures++;
        }
      }
    });

    // Calculate overall health score
    const overallScore =
      totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;
    const duration = performance?.now() - startTime;

    const healthReport = {
      id: checkId,
      timestamp: new Date()?.toISOString(),
      overallScore,
      status: this.determineHealthStatus(overallScore, criticalFailures),
      duration,
      checkCount: this.healthChecks.size,
      criticalFailures,
      results,
    };

    // Update current health
    this.currentHealth = healthReport;

    // Add to history
    this.healthHistory.push(healthReport);
    if (this.healthHistory.length > (this.options.maxHistorySize ?? 1000)) {
      this.healthHistory.shift()
    }

    // Check for alerts
    await this.processHealthAlerts(healthReport);

    this.emit('healthCheck', healthReport);
    logger.error(
      `✅ Health check completed: ${overallScore}% (${duration.toFixed(1)}ms)`
    );

    return healthReport;
  }

  /**
   * Run a single health check.
   *
   * @param name
   * @param check
   */
  async runSingleHealthCheck(
    name: string,
    check: HealthCheck
  ): Promise<HealthCheckResult> {
    if (!check.enabled) {
      return {
        score: 100,
        status: 'disabled',
        details: 'Health check is disabled',
        metrics: {},
        duration: 0,
      };
    }

    const startTime = performance?.now()

    try {
      // Create timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(
          () => reject(new Error(`Health check timeout: ${name}`)),
          check.timeout
        );
      });

      // Run the health check with timeout
      const result = await Promise.race([check?.checkFunction(), timeoutPromise]);

      const duration = performance?.now() - startTime;

      // Normalize result format
      const normalizedResult: HealthCheckResult = {
        score:
          typeof result === 'number' ? result : ((result as any)?.score ?? 100),
        status: (result as any)?.status || 'healthy',
        details:
          (result as any)?.details || (result as any)?.message || 'Health check passed',
        metrics: (result as any)?.metrics || {},
        duration: (result as any)?.duration ?? duration,
      };

      return normalizedResult;
    } catch (error) {
      const duration = performance?.now() - startTime;

      return {
        score: 0,
        status:'error',
        details: error instanceof Error ? error.message : String(error),
        metrics: {},
        duration,
      };
    }
  }

  /**
   * Get current system health status.
   */
  getCurrentHealth(): any {
    return {
      ...this.currentHealth,
      isRunning: this.isRunning,
      checkCount: this.healthChecks.size,
      alerts: this.alerts.length,
      uptime:
        this.isRunning && this.startTime ? Date.now() - this.startTime : 0,
    };
  }

  /**
   * Get health history.
   *
   * @param limit
   */
  getHealthHistory(limit = 100): HealthReport[] {
    return this.healthHistory.slice(-limit);
  }

  /**
   * Get health trends and analysis.
   */
  getHealthTrends(): any {
    if (this.healthHistory.length < 2) {
      return {
        trend: 'insufficient_data',
        analysis: 'Not enough data for trend analysis',
      };
    }

    const recent = this.healthHistory.slice(-10);
    const scores = recent.map((h) => h.overallScore);

    // Calculate trend
    let trend = 'stable';
    const avgRecent = scores.reduce((a, b) => a + b, 0) / scores.length;
    const first = scores[0];
    const last = scores[scores.length - 1];

    if (first !== undefined && last !== undefined) {
      if (last > first + 5) {
        trend = 'improving';
      } else if (last < first - 5) {
        trend = 'degrading';
      }
    }

    return {
      trend,
      currentScore: (this.currentHealth as HealthReport)?.overallScore || 0,
      averageScore: avgRecent,
      minScore: Math.min(...scores),
      maxScore: Math.max(...scores),
      dataPoints: scores.length,
      analysis: `Health is ${trend} with current score of ${(this.currentHealth as HealthReport)?.overallScore || 0}%`,
    };
  }

  // Private helper methods

  private initializeSystemChecks(): void {
    // Memory usage check
    this.registerHealthCheck('memory',
      () => {
        const usage = process?.memoryUsage()
        const totalMB = usage.heapTotal / 1024 / 1024;
        const usedMB = usage.heapUsed / 1024 / 1024;
        const usagePercent = (usedMB / totalMB) * 100;

        let score = 100;
        if (usagePercent > 90) {
          score = 10;
        } else if (usagePercent > 80) {
          score = 50;
        } else if (usagePercent > 70) {
          score = 75;
        }

        return {
          score,
          status: score > 70 ? 'healthy' : score > 50 ? 'warning' : 'critical',
          details: `Memory usage: ${usedMB.toFixed(1)}MB / ${totalMB.toFixed(1)}MB (${usagePercent.toFixed(1)}%)`,
          metrics: {
            heapUsed: usedMB,
            heapTotal: totalMB,
            usagePercent,
            external: usage.external / 1024 / 1024,
          },
        };
      },
      {
        weight: 2,
        critical: true,
        description: 'System memory usage monitoring',
      }
    );

    // Event loop lag check
    this.registerHealthCheck(
      'eventLoop',
      () => {
        return new Promise((resolve) => {
          const start = performance?.now()
          setImmediate(() => {
            const lag = performance?.now() - start;

            let score = 100;
            if (lag > 100) {
              score = 10;
            } else if (lag > 50) {
              score = 50;
            } else if (lag > 20) {
              score = 75;
            }

            resolve({
              score,
              status:
                score > 70 ? 'healthy' : score > 50 ? 'warning' : 'critical',
              details: `Event loop lag: ${lag.toFixed(2)}ms`,
              metrics: {
                lag,
                threshold: 20,
              },
            });
          });
        });
      },
      { weight: 1, description: 'Event loop performance monitoring' }
    );

    // CPU usage check (simplified)
    this.registerHealthCheck(
      'cpu',
      () => {
        const usage = process?.cpuUsage()
        const userTime = usage.user / 1000; // Convert to milliseconds
        const systemTime = usage.system / 1000;
        const totalTime = userTime + systemTime;

        // Simple CPU load estimation
        let score = 100;
        if (totalTime > 1000) {
          score = 30;
        } else if (totalTime > 500) {
          score = 60;
        } else if (totalTime > 200) {
          score = 80;
        }

        return {
          score,
          status: score > 70 ? 'healthy' : score > 50 ? 'warning' : 'critical',
          details: `CPU usage: ${totalTime.toFixed(1)}ms (user: ${userTime.toFixed(1)}ms, system: ${systemTime.toFixed(1)}ms)`,
          metrics: {
            user: userTime,
            system: systemTime,
            total: totalTime,
          },
        };
      },
      { weight: 1, description: 'CPU usage monitoring' }
    );

    // Persistence connectivity check
    this.registerHealthCheck(
      'persistence',
      async () => {
        // This would be injected by the session manager
        if (!this.persistenceChecker) {
          return {
            score: 100,
            status: 'disabled',
            details: 'Persistence checker not configured',
            metrics: {},
          };
        }

        try {
          const startTime = performance?.now()
          await this.persistenceChecker();
          const duration = performance?.now() - startTime;

          let score = 100;
          if (duration > 1000) {
            score = 50;
          } else if (duration > 500) {
            score = 75;
          }

          return {
            score,
            status: 'healthy',
            details: `Persistence check passed in ${duration.toFixed(1)}ms`,
            metrics: {
              responseTime: duration,
              status: 'connected',
            },
          };
        } catch (error) {
          return {
            score: 0,
            status: 'critical',
            details: `Persistence check failed: ${error instanceof Error ? error.message : String(error)}`,
            metrics: {
              error: error instanceof Error ? error.message : String(error),
              status: 'disconnected',
            },
          };
        }
      },
      {
        weight: 3,
        critical: true,
        description: 'Database connectivity monitoring',
      }
    );
  }

  private determineHealthStatus(
    score: number,
    criticalFailures: number
  ): 'healthy' | 'warning' | 'critical' {
    if (
      criticalFailures > 0 || score < (this.options.criticalThreshold ?? 50)
    ) {
      return 'critical';
    }
    if (score < (this.options.alertThreshold ?? 70)) {
      return 'warning';
    }
    return 'healthy';
  }

  private async processHealthAlerts(healthReport: HealthReport): Promise<void> {
    const { overallScore, status, criticalFailures, results } = healthReport;

    // Create alerts for low health scores
    if (status === 'critical') {
      const alert: HealthAlert = {
        id: randomUUID(),
        type: 'critical',
        timestamp: new Date()?.toISOString(),
        title: 'Critical Health Alert',
        message: `System health critically low: ${overallScore}% (${criticalFailures} critical failures)`,
        details: results,
        resolved: false,
      };

      this.alerts.push(alert);
      this.emit('criticalAlert', alert);
      logger.error(`🚨 CRITICAL ALERT: System health at ${overallScore}%`);
    } else if (status === 'warning') {
      const alert: HealthAlert = {
        id: randomUUID(),
        type: 'warning',
        timestamp: new Date()?.toISOString(),
        title: 'Health Warning',
        message: `System health below threshold: ${overallScore}%`,
        details: results,
        resolved: false,
      };

      this.alerts.push(alert);
      this.emit('healthWarning', alert);
      logger.error(`⚠️ WARNING: System health at ${overallScore}%`);
    }

    // Clean up old alerts (keep last 100)
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(-100);
    }
  }

  /**
   * Set persistence checker function.
   *
   * @param checkerFunction
   */
  setPersistenceChecker(checkerFunction: () => Promise<void>): void {
    this.persistenceChecker = checkerFunction;
  }

  /**
   * Cleanup resources.
   */
  async destroy(): Promise<void> {
    await this.stop();
    this.healthChecks?.clear();
    this.healthHistory = [];
    this.alerts = [];
    this.removeAllListeners();
  }
}

export default HealthMonitor;
