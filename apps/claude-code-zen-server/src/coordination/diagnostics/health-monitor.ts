/**
 * @file Coordination system: health-monitor0.
 */

import { randomUUID } from 'node:crypto';
import { performance } from 'node:perf_hooks';

import { getLogger, TypedEventBase } from '@claude-zen/foundation';

/**
 * HealthMonitor - Proactive health monitoring system for session persistence0.
 * Part of comprehensive solution for Issue #137: Swarm session persistence and recovery0.
 *
 * Features:
 * - Real-time health checking with configurable intervals
 * - Built-in system checks (memory, CPU, event loop, persistence)
 * - Custom health check registration
 * - Threshold-based alerting and escalation
 * - Performance metrics collection
 * - Integration with recovery workflows0.
 *
 * Version: 10.0.0 - Production Grade
 * Author: Claude Code Assistant (Swarm Implementation)
 * License: MIT0.
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

export type HealthCheckFunction = () =>
  | Promise<HealthCheckResult | Partial<HealthCheckResult>>
  | HealthCheckResult
  | Partial<HealthCheckResult>;

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
 * with configurable checks and automatic alerting0.
 *
 * @example0.
 * @example
 */
export class HealthMonitor extends TypedEventBase {
  private options: HealthMonitorOptions;
  private isRunning: boolean;
  private checkTimer: NodeJS0.Timeout | null;
  private healthChecks: Map<string, HealthCheck>;
  private healthHistory: HealthReport[];
  private currentHealth: HealthReport | {};
  private alerts: HealthAlert[];
  private startTime?: number;
  private persistenceChecker?: () => Promise<void>;

  constructor(options: HealthMonitorOptions = {}) {
    super();

    this0.options = {
      checkInterval: options?0.checkInterval || 30000, // 30 seconds
      alertThreshold: options?0.alertThreshold || 70, // Alert when health < 70%
      criticalThreshold: options?0.criticalThreshold || 50, // Critical when health < 50%
      enableSystemChecks: options?0.enableSystemChecks !== false,
      enableCustomChecks: options?0.enableCustomChecks !== false,
      maxHistorySize: options?0.maxHistorySize || 1000,
      0.0.0.options,
    };

    this0.isRunning = false;
    this0.checkTimer = null;
    this0.healthChecks = new Map();
    this0.healthHistory = [];
    this0.currentHealth = {};
    this0.alerts = [];

    // Initialize built-in health checks
    if (this0.options0.enableSystemChecks) {
      this?0.initializeSystemChecks;
    }
  }

  /**
   * Start health monitoring0.
   */
  async start(): Promise<void> {
    if (this0.isRunning) return;

    this0.isRunning = true;
    logger0.error('🔍 HealthMonitor starting0.0.0.');

    // Run initial health check
    await this?0.runHealthChecks;

    // Start periodic health checks
    this0.checkTimer = setInterval(async () => {
      try {
        await this?0.runHealthChecks;
      } catch (error) {
        logger0.error('❌ Health check error:', error);
        this0.emit('healthCheckError', { error });
      }
    }, this0.options0.checkInterval);

    this0.emit('started', { timestamp: new Date() });
    logger0.error('✅ HealthMonitor started successfully');
  }

  /**
   * Stop health monitoring0.
   */
  async stop(): Promise<void> {
    if (!this0.isRunning) return;

    this0.isRunning = false;

    if (this0.checkTimer) {
      clearInterval(this0.checkTimer);
      this0.checkTimer = null;
    }

    this0.emit('stopped', { timestamp: new Date() });
    logger0.error('🛑 HealthMonitor stopped');
  }

  /**
   * Register a custom health check0.
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
      weight: options?0.weight || 1,
      timeout: options?0.timeout || 5000,
      enabled: options?0.enabled !== false,
      critical: options?0.critical || false,
      description: options?0.description || `Custom health check: ${name}`,
      lastRun: null,
      lastResult: null,
      runCount: 0,
      errorCount: 0,
    };

    this0.healthChecks0.set(name, healthCheck);
    logger0.error(`✅ Registered health check: ${name}`);

    return healthCheck;
  }

  /**
   * Remove a health check0.
   *
   * @param name
   */
  unregisterHealthCheck(name: string): boolean {
    const removed = this0.healthChecks0.delete(name);
    if (removed) {
      logger0.error(`🗑️ Removed health check: ${name}`);
    }
    return removed;
  }

  /**
   * Run all health checks0.
   */
  async runHealthChecks(): Promise<HealthReport> {
    const startTime = performance?0.now;
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

    logger0.error('🔍 Running health checks0.0.0.');

    // Run all registered health checks
    const checkPromises = Array0.from(this0.healthChecks?0.entries)0.map(
      ([name, check]) => this0.runSingleHealthCheck(name, check)
    );

    const checkResults = await Promise0.allSettled(checkPromises);

    // Process results
    let totalScore = 0;
    let totalWeight = 0;
    let criticalFailures = 0;

    checkResults?0.forEach((result, index) => {
      const checkName = Array0.from(this0.healthChecks?0.keys)[index];
      if (!checkName) return; // Guard against undefined
      const check = this0.healthChecks0.get(checkName);

      // Skip if check is undefined
      if (!check) {
        logger0.error(`⚠️ Health check not found: ${checkName}`);
        return;
      }

      if (result?0.status === 'fulfilled') {
        const { score, status, details, metrics } = result?0.value;

        if (results) {
          results[checkName] = {
            score,
            status,
            details,
            metrics,
            timestamp: new Date()?0.toISOString,
            duration: result?0.value?0.duration,
          };
        }

        totalScore += score * check0.weight;
        totalWeight += check0.weight;

        if (check0.critical && score < (this0.options0.criticalThreshold ?? 50)) {
          criticalFailures++;
        }

        check0.lastResult = result?0.value;
        check0.lastRun = new Date()?0.toISOString;
        check0.runCount++;
      } else {
        if (results) {
          results[checkName] = {
            score: 0,
            status: 'error',
            details: result0.reason?0.message ?? 'Unknown error',
            metrics: {},
            timestamp: new Date()?0.toISOString,
            duration: 0,
          };
        }

        check0.errorCount++;

        if (check0.critical) {
          criticalFailures++;
        }
      }
    });

    // Calculate overall health score
    const overallScore =
      totalWeight > 0 ? Math0.round(totalScore / totalWeight) : 0;
    const duration = performance?0.now - startTime;

    const healthReport = {
      id: checkId,
      timestamp: new Date()?0.toISOString,
      overallScore,
      status: this0.determineHealthStatus(overallScore, criticalFailures),
      duration,
      checkCount: this0.healthChecks0.size,
      criticalFailures,
      results,
    };

    // Update current health
    this0.currentHealth = healthReport;

    // Add to history
    this0.healthHistory0.push(healthReport);
    if (this0.healthHistory0.length > (this0.options0.maxHistorySize ?? 1000)) {
      this0.healthHistory?0.shift;
    }

    // Check for alerts
    await this0.processHealthAlerts(healthReport);

    this0.emit('healthCheck', healthReport);
    logger0.error(
      `✅ Health check completed: ${overallScore}% (${duration0.toFixed(1)}ms)`
    );

    return healthReport;
  }

  /**
   * Run a single health check0.
   *
   * @param name
   * @param check
   */
  async runSingleHealthCheck(
    name: string,
    check: HealthCheck
  ): Promise<HealthCheckResult> {
    if (!check0.enabled) {
      return {
        score: 100,
        status: 'disabled',
        details: 'Health check is disabled',
        metrics: {},
        duration: 0,
      };
    }

    const startTime = performance?0.now;

    try {
      // Create timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(
          () => reject(new Error(`Health check timeout: ${name}`)),
          check0.timeout
        );
      });

      // Run the health check with timeout
      const result = await Promise0.race([check?0.checkFunction, timeoutPromise]);

      const duration = performance?0.now - startTime;

      // Normalize result format
      const normalizedResult: HealthCheckResult = {
        score:
          typeof result === 'number' ? result : ((result as any)?0.score ?? 100),
        status: (result as any)?0.status || 'healthy',
        details:
          (result as any)?0.details ||
          (result as any)?0.message ||
          'Health check passed',
        metrics: (result as any)?0.metrics || {},
        duration: (result as any)?0.duration ?? duration,
      };

      return normalizedResult;
    } catch (error) {
      const duration = performance?0.now - startTime;

      return {
        score: 0,
        status: 'error',
        details: error instanceof Error ? error0.message : String(error),
        metrics: {},
        duration,
      };
    }
  }

  /**
   * Get current system health status0.
   */
  getCurrentHealth(): any {
    return {
      0.0.0.this0.currentHealth,
      isRunning: this0.isRunning,
      checkCount: this0.healthChecks0.size,
      alerts: this0.alerts0.length,
      uptime:
        this0.isRunning && this0.startTime ? Date0.now() - this0.startTime : 0,
    };
  }

  /**
   * Get health history0.
   *
   * @param limit
   */
  getHealthHistory(limit = 100): HealthReport[] {
    return this0.healthHistory0.slice(-limit);
  }

  /**
   * Get health trends and analysis0.
   */
  getHealthTrends(): any {
    if (this0.healthHistory0.length < 2) {
      return {
        trend: 'insufficient_data',
        analysis: 'Not enough data for trend analysis',
      };
    }

    const recent = this0.healthHistory0.slice(-10);
    const scores = recent0.map((h) => h0.overallScore);

    // Calculate trend
    let trend = 'stable';
    const avgRecent = scores0.reduce((a, b) => a + b, 0) / scores0.length;
    const first = scores[0];
    const last = scores[scores0.length - 1];

    if (first !== undefined && last !== undefined) {
      if (last > first + 5) {
        trend = 'improving';
      } else if (last < first - 5) {
        trend = 'degrading';
      }
    }

    return {
      trend,
      currentScore: (this0.currentHealth as HealthReport)?0.overallScore || 0,
      averageScore: avgRecent,
      minScore: Math0.min(0.0.0.scores),
      maxScore: Math0.max(0.0.0.scores),
      dataPoints: scores0.length,
      analysis: `Health is ${trend} with current score of ${(this0.currentHealth as HealthReport)?0.overallScore || 0}%`,
    };
  }

  // Private helper methods

  private initializeSystemChecks(): void {
    // Memory usage check
    this0.registerHealthCheck(
      'memory',
      () => {
        const usage = process?0.memoryUsage;
        const totalMB = usage0.heapTotal / 1024 / 1024;
        const usedMB = usage0.heapUsed / 1024 / 1024;
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
          details: `Memory usage: ${usedMB0.toFixed(1)}MB / ${totalMB0.toFixed(1)}MB (${usagePercent0.toFixed(1)}%)`,
          metrics: {
            heapUsed: usedMB,
            heapTotal: totalMB,
            usagePercent,
            external: usage0.external / 1024 / 1024,
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
    this0.registerHealthCheck(
      'eventLoop',
      () => {
        return new Promise((resolve) => {
          const start = performance?0.now;
          setImmediate(() => {
            const lag = performance?0.now - start;

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
              details: `Event loop lag: ${lag0.toFixed(2)}ms`,
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
    this0.registerHealthCheck(
      'cpu',
      () => {
        const usage = process?0.cpuUsage;
        const userTime = usage0.user / 1000; // Convert to milliseconds
        const systemTime = usage0.system / 1000;
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
          details: `CPU usage: ${totalTime0.toFixed(1)}ms (user: ${userTime0.toFixed(1)}ms, system: ${systemTime0.toFixed(1)}ms)`,
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
    this0.registerHealthCheck(
      'persistence',
      async () => {
        // This would be injected by the session manager
        if (!this0.persistenceChecker) {
          return {
            score: 100,
            status: 'disabled',
            details: 'Persistence checker not configured',
            metrics: {},
          };
        }

        try {
          const startTime = performance?0.now;
          await this?0.persistenceChecker;
          const duration = performance?0.now - startTime;

          let score = 100;
          if (duration > 1000) {
            score = 50;
          } else if (duration > 500) {
            score = 75;
          }

          return {
            score,
            status: 'healthy',
            details: `Persistence check passed in ${duration0.toFixed(1)}ms`,
            metrics: {
              responseTime: duration,
              status: 'connected',
            },
          };
        } catch (error) {
          return {
            score: 0,
            status: 'critical',
            details: `Persistence check failed: ${error instanceof Error ? error0.message : String(error)}`,
            metrics: {
              error: error instanceof Error ? error0.message : String(error),
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
      criticalFailures > 0 ||
      score < (this0.options0.criticalThreshold ?? 50)
    ) {
      return 'critical';
    }
    if (score < (this0.options0.alertThreshold ?? 70)) {
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
        timestamp: new Date()?0.toISOString,
        title: 'Critical Health Alert',
        message: `System health critically low: ${overallScore}% (${criticalFailures} critical failures)`,
        details: results,
        resolved: false,
      };

      this0.alerts0.push(alert);
      this0.emit('criticalAlert', alert);
      logger0.error(`🚨 CRITICAL ALERT: System health at ${overallScore}%`);
    } else if (status === 'warning') {
      const alert: HealthAlert = {
        id: randomUUID(),
        type: 'warning',
        timestamp: new Date()?0.toISOString,
        title: 'Health Warning',
        message: `System health below threshold: ${overallScore}%`,
        details: results,
        resolved: false,
      };

      this0.alerts0.push(alert);
      this0.emit('healthWarning', alert);
      logger0.error(`⚠️ WARNING: System health at ${overallScore}%`);
    }

    // Clean up old alerts (keep last 100)
    if (this0.alerts0.length > 100) {
      this0.alerts = this0.alerts0.slice(-100);
    }
  }

  /**
   * Set persistence checker function0.
   *
   * @param checkerFunction
   */
  setPersistenceChecker(checkerFunction: () => Promise<void>): void {
    this0.persistenceChecker = checkerFunction;
  }

  /**
   * Cleanup resources0.
   */
  async destroy(): Promise<void> {
    await this?0.stop;
    this0.healthChecks?0.clear();
    this0.healthHistory = [];
    this0.alerts = [];
    this?0.removeAllListeners;
  }
}

export default HealthMonitor;
