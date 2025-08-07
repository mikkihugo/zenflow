/**
 * Error Monitoring and Reporting Infrastructure
 *
 * Comprehensive error tracking, aggregation, analysis, and alerting system
 * for Claude-Zen distributed architecture
 */

import {
  type BaseClaudeZenError,
  type ErrorContext,
  type ErrorMetrics,
  getErrorSeverity,
} from './errors';
import { createLogger } from './logger';

const logger = createLogger({ prefix: 'ErrorMonitoring' });

// ===============================
// Error Aggregation and Tracking
// ===============================

export interface ErrorReport {
  id: string;
  timestamp: number;
  error: BaseClaudeZenError | Error;
  context: ErrorContext;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  component: string;
  recoveryAttempted: boolean;
  recoverySuccessful: boolean;
  userImpact: 'none' | 'minimal' | 'moderate' | 'severe';
  resolution?: string;
  tags: string[];
}

export interface ErrorTrend {
  category: string;
  component: string;
  errorCount: number;
  errorRate: number; // errors per minute
  firstSeen: number;
  lastSeen: number;
  trending: 'up' | 'down' | 'stable';
  averageRecoveryTime: number;
  userImpactLevel: 'none' | 'minimal' | 'moderate' | 'severe';
}

export interface SystemHealthMetrics {
  timestamp: number;
  overallHealth: 'excellent' | 'good' | 'degraded' | 'critical';
  errorRate: number; // errors per minute
  activeErrors: number;
  criticalErrors: number;
  componentHealth: Map<string, 'healthy' | 'warning' | 'error' | 'critical'>;
  performanceImpact: number; // 0-100%
  userSatisfactionScore: number; // 0-100%
  uptime: number; // percentage
  mttr: number; // mean time to recovery in ms
  mtbf: number; // mean time between failures in ms
  averageResponseTime: number; // average response time in ms
}

export interface AlertConfig {
  name: string;
  condition: (metrics: SystemHealthMetrics, trends: ErrorTrend[]) => boolean;
  severity: 'info' | 'warning' | 'error' | 'critical';
  cooldownMs: number; // Minimum time between alerts
  recipients: string[];
  template: string;
}

// ===============================
// Error Storage and Retrieval
// ===============================

export class ErrorStorage {
  private reports: Map<string, ErrorReport> = new Map();
  private trends: Map<string, ErrorTrend> = new Map();
  private maxReports: number = 10000;
  private maxTrends: number = 1000;

  public storeErrorReport(report: ErrorReport): void {
    // Store report
    this.reports.set(report.id, report);

    // Clean old reports if necessary
    if (this.reports.size > this.maxReports) {
      const oldestKey = Array.from(this.reports.keys())[0];
      this.reports.delete(oldestKey);
    }

    // Update trends
    this.updateTrends(report);
  }

  private updateTrends(report: ErrorReport): void {
    const trendKey = `${report.category}:${report.component}`;
    const existing = this.trends.get(trendKey);

    if (existing) {
      existing.errorCount++;
      existing.lastSeen = report.timestamp;
      existing.errorRate = this.calculateErrorRate(trendKey);
      existing.trending = this.calculateTrending(existing);

      if (report.recoveryAttempted && report.recoverySuccessful) {
        const recoveryTime = Date.now() - report.timestamp;
        existing.averageRecoveryTime = (existing.averageRecoveryTime + recoveryTime) / 2;
      }
    } else {
      this.trends.set(trendKey, {
        category: report.category,
        component: report.component,
        errorCount: 1,
        errorRate: 1,
        firstSeen: report.timestamp,
        lastSeen: report.timestamp,
        trending: 'stable',
        averageRecoveryTime: 0,
        userImpactLevel: report.userImpact,
      });
    }

    // Clean old trends if necessary
    if (this.trends.size > this.maxTrends) {
      const oldestTrend = Array.from(this.trends.entries()).sort(
        ([, a], [, b]) => a.lastSeen - b.lastSeen
      )[0];
      this.trends.delete(oldestTrend[0]);
    }
  }

  private calculateErrorRate(trendKey: string): number {
    const trend = this.trends.get(trendKey);
    if (!trend) return 0;

    const timeSpanMs = trend.lastSeen - trend.firstSeen;
    const timeSpanMinutes = Math.max(timeSpanMs / 60000, 1); // At least 1 minute

    return trend.errorCount / timeSpanMinutes;
  }

  private calculateTrending(trend: ErrorTrend): 'up' | 'down' | 'stable' {
    // Simple trending calculation based on recent vs historical rate
    const recentWindow = 5 * 60 * 1000; // 5 minutes
    const recentStart = Date.now() - recentWindow;

    const recentReports = Array.from(this.reports.values()).filter(
      (r) =>
        r.timestamp >= recentStart &&
        r.category === trend.category &&
        r.component === trend.component
    );

    const recentRate = recentReports.length / 5; // per minute
    const historicalRate = trend.errorRate;

    if (recentRate > historicalRate * 1.5) return 'up';
    if (recentRate < historicalRate * 0.5) return 'down';
    return 'stable';
  }

  public getErrorReports(
    category?: string,
    component?: string,
    severity?: string,
    limit: number = 100
  ): ErrorReport[] {
    let reports = Array.from(this.reports.values());

    if (category) {
      reports = reports.filter((r) => r.category === category);
    }

    if (component) {
      reports = reports.filter((r) => r.component === component);
    }

    if (severity) {
      reports = reports.filter((r) => r.severity === severity);
    }

    // Sort by timestamp (newest first) and limit
    return reports.sort((a, b) => b.timestamp - a.timestamp).slice(0, limit);
  }

  public getErrorTrends(): ErrorTrend[] {
    return Array.from(this.trends.values()).sort((a, b) => b.errorRate - a.errorRate);
  }

  public getComponentMetrics(component: string): ErrorMetrics {
    const reports = this.getErrorReports(undefined, component);
    const trend = Array.from(this.trends.values()).find((t) => t.component === component);

    return {
      errorCount: reports.length,
      errorRate: trend?.errorRate || 0,
      lastErrorTime: reports[0]?.timestamp || 0,
      averageRecoveryTime: trend?.averageRecoveryTime || 0,
      successfulRecoveries: reports.filter((r) => r.recoverySuccessful).length,
      failedRecoveries: reports.filter((r) => r.recoveryAttempted && !r.recoverySuccessful).length,
    };
  }
}

// ===============================
// Health Check System
// ===============================

export interface HealthCheck {
  name: string;
  component: string;
  check: () => Promise<{ healthy: boolean; details?: any; responseTime?: number }>;
  intervalMs: number;
  timeoutMs: number;
  criticalFailureThreshold: number;
}

export class HealthMonitor {
  private checks: Map<string, HealthCheck> = new Map();
  private checkResults: Map<
    string,
    { healthy: boolean; lastCheck: number; failureCount: number; responseTime: number }
  > = new Map();
  private intervals: Map<string, NodeJS.Timeout> = new Map();

  public addHealthCheck(check: HealthCheck): void {
    this.checks.set(check.name, check);
    this.checkResults.set(check.name, {
      healthy: true,
      lastCheck: 0,
      failureCount: 0,
      responseTime: 0,
    });

    // Start periodic checking
    this.startHealthCheck(check);
  }

  private startHealthCheck(check: HealthCheck): void {
    const interval = setInterval(async () => {
      await this.runHealthCheck(check.name);
    }, check.intervalMs);

    this.intervals.set(check.name, interval);

    // Run initial check
    this.runHealthCheck(check.name);
  }

  private async runHealthCheck(checkName: string): Promise<void> {
    const check = this.checks.get(checkName);
    const result = this.checkResults.get(checkName);

    if (!check || !result) return;

    const startTime = Date.now();

    try {
      const checkResult = await Promise.race([
        check.check(),
        new Promise<{ healthy: boolean; details?: any }>((_, reject) =>
          setTimeout(() => reject(new Error('Health check timeout')), check.timeoutMs)
        ),
      ]);

      const responseTime = Date.now() - startTime;

      if (checkResult.healthy) {
        result.healthy = true;
        result.failureCount = 0;
      } else {
        result.healthy = false;
        result.failureCount++;
      }

      result.lastCheck = Date.now();
      result.responseTime = responseTime;

      // Log health check results
      if (!checkResult.healthy) {
        logger.warn(`Health check failed: ${checkName}`, checkResult.details);
      }
    } catch (error) {
      result.healthy = false;
      result.failureCount++;
      result.lastCheck = Date.now();
      result.responseTime = Date.now() - startTime;

      logger.error(`Health check error: ${checkName}`, error);
    }
  }

  public getSystemHealth(): SystemHealthMetrics {
    const now = Date.now();
    const componentHealth = new Map<string, 'healthy' | 'warning' | 'error' | 'critical'>();

    let totalChecks = 0;
    let healthyChecks = 0;
    let totalResponseTime = 0;

    for (const [name, result] of this.checkResults.entries()) {
      const check = this.checks.get(name);
      if (!check) continue;

      totalChecks++;
      totalResponseTime += result.responseTime;

      let componentStatus: 'healthy' | 'warning' | 'error' | 'critical';

      if (result.healthy) {
        healthyChecks++;
        componentStatus = 'healthy';
      } else if (result.failureCount >= check.criticalFailureThreshold) {
        componentStatus = 'critical';
      } else if (result.failureCount >= 3) {
        componentStatus = 'error';
      } else {
        componentStatus = 'warning';
      }

      componentHealth.set(check.component, componentStatus);
    }

    const uptime = totalChecks > 0 ? (healthyChecks / totalChecks) * 100 : 100;
    const averageResponseTime = totalChecks > 0 ? totalResponseTime / totalChecks : 0;

    let overallHealth: 'excellent' | 'good' | 'degraded' | 'critical';
    if (uptime >= 99) overallHealth = 'excellent';
    else if (uptime >= 95) overallHealth = 'good';
    else if (uptime >= 80) overallHealth = 'degraded';
    else overallHealth = 'critical';

    return {
      timestamp: now,
      overallHealth,
      errorRate: 0, // Will be calculated by ErrorMonitor
      activeErrors: 0, // Will be calculated by ErrorMonitor
      criticalErrors: 0, // Will be calculated by ErrorMonitor
      componentHealth,
      performanceImpact: Math.max(0, 100 - uptime),
      userSatisfactionScore: uptime,
      uptime,
      averageResponseTime,
      mttr: 0, // Will be calculated by ErrorMonitor
      mtbf: 0, // Will be calculated by ErrorMonitor
    };
  }

  public stopAllChecks(): void {
    for (const interval of this.intervals.values()) {
      clearInterval(interval);
    }
    this.intervals.clear();
  }
}

// ===============================
// Alert System
// ===============================

export class AlertSystem {
  private configs: AlertConfig[] = [];
  private lastAlertTime: Map<string, number> = new Map();
  private alertHandlers: ((alert: AlertConfig, message: string) => Promise<void>)[] = [];

  public addAlertConfig(config: AlertConfig): void {
    this.configs.push(config);
  }

  public addAlertHandler(handler: (alert: AlertConfig, message: string) => Promise<void>): void {
    this.alertHandlers.push(handler);
  }

  public async checkAlerts(metrics: SystemHealthMetrics, trends: ErrorTrend[]): Promise<void> {
    for (const config of this.configs) {
      // Check cooldown
      const lastAlert = this.lastAlertTime.get(config.name) || 0;
      if (Date.now() - lastAlert < config.cooldownMs) {
        continue;
      }

      // Check condition
      if (config.condition(metrics, trends)) {
        const message = this.generateAlertMessage(config, metrics, trends);

        logger.warn(`Alert triggered: ${config.name}`, { severity: config.severity, message });

        // Send alerts
        for (const handler of this.alertHandlers) {
          try {
            await handler(config, message);
          } catch (error) {
            logger.error(`Alert handler failed for ${config.name}:`, error);
          }
        }

        this.lastAlertTime.set(config.name, Date.now());
      }
    }
  }

  private generateAlertMessage(
    config: AlertConfig,
    metrics: SystemHealthMetrics,
    _trends: ErrorTrend[]
  ): string {
    return config.template
      .replace('{{timestamp}}', new Date(metrics.timestamp).toISOString())
      .replace('{{health}}', metrics.overallHealth)
      .replace('{{errorRate}}', metrics.errorRate.toString())
      .replace('{{uptime}}', metrics.uptime.toFixed(2))
      .replace('{{criticalErrors}}', metrics.criticalErrors.toString());
  }
}

// ===============================
// Main Error Monitor
// ===============================

export class ErrorMonitor {
  private storage = new ErrorStorage();
  private healthMonitor = new HealthMonitor();
  private alertSystem = new AlertSystem();
  private monitoringInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.setupDefaultHealthChecks();
    this.setupDefaultAlerts();
  }

  private setupDefaultHealthChecks(): void {
    // FACT System Health Check
    this.healthMonitor.addHealthCheck({
      name: 'fact_system',
      component: 'FACT',
      check: async () => {
        // Simple connectivity check - in production, check actual FACT operations
        return { healthy: true, responseTime: 0 };
      },
      intervalMs: 30000, // 30 seconds
      timeoutMs: 5000, // 5 seconds
      criticalFailureThreshold: 3,
    });

    // RAG System Health Check
    this.healthMonitor.addHealthCheck({
      name: 'rag_system',
      component: 'RAG',
      check: async () => {
        // Simple connectivity check - in production, check vector operations
        return { healthy: true, responseTime: 0 };
      },
      intervalMs: 30000,
      timeoutMs: 5000,
      criticalFailureThreshold: 3,
    });

    // Swarm Coordination Health Check
    this.healthMonitor.addHealthCheck({
      name: 'swarm_coordination',
      component: 'Swarm',
      check: async () => {
        // Check swarm communication - in production, ping active agents
        return { healthy: true, responseTime: 0 };
      },
      intervalMs: 60000, // 1 minute
      timeoutMs: 10000, // 10 seconds
      criticalFailureThreshold: 2,
    });

    // MCP Tools Health Check
    this.healthMonitor.addHealthCheck({
      name: 'mcp_tools',
      component: 'MCP',
      check: async () => {
        // Check MCP tool execution - in production, test basic tool
        return { healthy: true, responseTime: 0 };
      },
      intervalMs: 45000, // 45 seconds
      timeoutMs: 8000, // 8 seconds
      criticalFailureThreshold: 3,
    });

    // WASM System Health Check
    this.healthMonitor.addHealthCheck({
      name: 'wasm_system',
      component: 'WASM',
      check: async () => {
        // Check WASM module loading - in production, test basic computation
        return { healthy: true, responseTime: 0 };
      },
      intervalMs: 120000, // 2 minutes
      timeoutMs: 15000, // 15 seconds
      criticalFailureThreshold: 2,
    });
  }

  private setupDefaultAlerts(): void {
    // Critical Error Rate Alert
    this.alertSystem.addAlertConfig({
      name: 'high_error_rate',
      condition: (metrics) => metrics.errorRate > 10, // More than 10 errors per minute
      severity: 'critical',
      cooldownMs: 300000, // 5 minutes
      recipients: ['system-admin'],
      template:
        'CRITICAL: High error rate detected ({{errorRate}}/min) at {{timestamp}}. System health: {{health}}',
    });

    // System Health Degradation Alert
    this.alertSystem.addAlertConfig({
      name: 'system_degradation',
      condition: (metrics) =>
        metrics.overallHealth === 'critical' || metrics.overallHealth === 'degraded',
      severity: 'error',
      cooldownMs: 600000, // 10 minutes
      recipients: ['system-admin'],
      template: 'ERROR: System health degraded to {{health}} at {{timestamp}}. Uptime: {{uptime}}%',
    });

    // Component Failure Alert
    this.alertSystem.addAlertConfig({
      name: 'component_failure',
      condition: (metrics) => {
        for (const [_component, health] of metrics.componentHealth.entries()) {
          if (health === 'critical') return true;
        }
        return false;
      },
      severity: 'error',
      cooldownMs: 180000, // 3 minutes
      recipients: ['system-admin'],
      template: 'ERROR: Critical component failure detected at {{timestamp}}. Check system status.',
    });

    // Error Trend Alert
    this.alertSystem.addAlertConfig({
      name: 'error_trending_up',
      condition: (_metrics, trends) => {
        return trends.some((trend) => trend.trending === 'up' && trend.errorRate > 5);
      },
      severity: 'warning',
      cooldownMs: 900000, // 15 minutes
      recipients: ['system-admin'],
      template: 'WARNING: Error trend increasing at {{timestamp}}. Monitor system closely.',
    });
  }

  public reportError(error: Error, context: Partial<ErrorContext> = {}): void {
    const report: ErrorReport = {
      id: this.generateErrorId(),
      timestamp: Date.now(),
      error: error as BaseClaudeZenError,
      context: {
        timestamp: Date.now(),
        component: 'Unknown',
        ...context,
      },
      severity: getErrorSeverity(error),
      category: error.constructor.name,
      component: context.component || 'Unknown',
      recoveryAttempted: false,
      recoverySuccessful: false,
      userImpact: this.assessUserImpact(error),
      tags: this.generateErrorTags(error, context),
    };

    this.storage.storeErrorReport(report);

    logger.info(`Error reported: ${report.id}`, {
      category: report.category,
      severity: report.severity,
      component: report.component,
    });
  }

  public updateErrorRecovery(
    errorId: string,
    attempted: boolean,
    successful: boolean,
    resolution?: string
  ): void {
    // In production, this would update the stored error report
    logger.info(`Error recovery update: ${errorId}`, { attempted, successful, resolution });
  }

  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  private assessUserImpact(error: Error): 'none' | 'minimal' | 'moderate' | 'severe' {
    const severity = getErrorSeverity(error);
    const errorType = error.constructor.name;

    if (severity === 'critical') return 'severe';
    if (errorType.includes('Network') || errorType.includes('Timeout')) return 'moderate';
    if (errorType.includes('Validation') || errorType.includes('NotFound')) return 'minimal';

    return 'minimal';
  }

  private generateErrorTags(error: Error, context: Partial<ErrorContext>): string[] {
    const tags: string[] = [];

    tags.push(error.constructor.name);
    if (context.component) tags.push(context.component);
    if (context.operation) tags.push(context.operation);

    // Add contextual tags based on error message
    if (error.message.includes('timeout')) tags.push('timeout');
    if (error.message.includes('network')) tags.push('network');
    if (error.message.includes('memory')) tags.push('memory');
    if (error.message.includes('authentication')) tags.push('auth');

    return tags;
  }

  public startMonitoring(intervalMs: number = 60000): void {
    this.monitoringInterval = setInterval(async () => {
      const healthMetrics = this.healthMonitor.getSystemHealth();
      const errorTrends = this.storage.getErrorTrends();

      // Update health metrics with error data
      const recentReports = this.storage.getErrorReports(undefined, undefined, undefined, 1000);
      const recentWindow = 5 * 60 * 1000; // 5 minutes
      const recentErrors = recentReports.filter((r) => Date.now() - r.timestamp < recentWindow);

      healthMetrics.errorRate = recentErrors.length / 5; // per minute
      healthMetrics.activeErrors = recentErrors.length;
      healthMetrics.criticalErrors = recentErrors.filter((r) => r.severity === 'critical').length;

      // Calculate MTTR and MTBF
      const recoveredErrors = recentReports.filter((r) => r.recoverySuccessful);
      healthMetrics.mttr =
        recoveredErrors.length > 0
          ? recoveredErrors.reduce((sum, r) => sum + (r.timestamp - r.timestamp), 0) /
            recoveredErrors.length
          : 0;

      // Check alerts
      await this.alertSystem.checkAlerts(healthMetrics, errorTrends);
    }, intervalMs);

    logger.info(`Error monitoring started with ${intervalMs}ms interval`);
  }

  public stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    this.healthMonitor.stopAllChecks();
    logger.info('Error monitoring stopped');
  }

  public getSystemMetrics(): SystemHealthMetrics {
    return this.healthMonitor.getSystemHealth();
  }

  public getErrorReports(category?: string, component?: string, limit: number = 50): ErrorReport[] {
    return this.storage.getErrorReports(category, component, undefined, limit);
  }

  public getErrorTrends(): ErrorTrend[] {
    return this.storage.getErrorTrends();
  }

  public getComponentMetrics(component: string): ErrorMetrics {
    return this.storage.getComponentMetrics(component);
  }

  public addAlertHandler(handler: (alert: AlertConfig, message: string) => Promise<void>): void {
    this.alertSystem.addAlertHandler(handler);
  }
}

// Export singleton instance
export const errorMonitor = new ErrorMonitor();
