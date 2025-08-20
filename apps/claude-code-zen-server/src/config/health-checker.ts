/**
 * @fileoverview Configuration Health Checker - Comprehensive health monitoring and validation system
 * 
 * This module provides advanced health checking and monitoring capabilities for Claude Code Zen
 * configuration systems. Features real-time health monitoring, production deployment validation,
 * port conflict detection, and comprehensive health reporting with multiple export formats.
 * Designed for production environments with automated monitoring and alerting capabilities.
 * 
 * **Key Features:**
 * - **Real-time Health Monitoring**: Continuous monitoring with event-based notifications
 * - **Production Deployment Validation**: Comprehensive pre-deployment checks and blockers
 * - **Port Conflict Detection**: Automatic detection and resolution recommendations
 * - **Multiple Export Formats**: JSON and Prometheus metrics for external monitoring
 * - **Event-Driven Architecture**: EventEmitter-based for integration with monitoring systems
 * - **Configuration Change Detection**: Automatic health revalidation on configuration changes
 * - **Express.js Integration**: Ready-to-use health check endpoints
 * - **Deployment Readiness Assessment**: Production deployment validation and recommendations
 * 
 * **Health Check Categories:**
 * - Configuration validation and compliance
 * - Port conflict detection across services
 * - Security configuration validation
 * - Performance optimization validation
 * - Production readiness assessment
 * - Environment-specific validation rules
 * 
 * **Monitoring Features:**
 * - Automatic periodic health checks
 * - Event emission on health status changes
 * - Critical health issue alerts
 * - Recovery notifications when issues are resolved
 * - Prometheus metrics export for monitoring systems
 * - Deployment readiness validation
 * 
 * @example Basic Health Monitoring
 * ```typescript
 * import { ConfigHealthChecker, initializeConfigHealthChecker } from './health-checker';
 * 
 * // Initialize health monitoring
 * await initializeConfigHealthChecker({
 *   enableMonitoring: true,
 *   healthCheckFrequency: 30000
 * });
 * 
 * // Get current health status
 * const healthChecker = new ConfigHealthChecker();
 * const health = await healthChecker.getHealthReport();
 * console.log(`Config health: ${health.status} (${health.score}/100)`);
 * 
 * // Monitor for critical issues
 * healthChecker.on('health:critical', (report) => {
 *   console.error('Critical configuration issues:', report.blockers);
 * });
 * ```
 * 
 * @example Production Deployment Validation
 * ```typescript
 * const healthChecker = new ConfigHealthChecker();
 * 
 * // Validate configuration for production deployment
 * const deploymentCheck = await healthChecker.validateForProduction();
 * 
 * if (!deploymentCheck.deploymentReady) {
 *   console.error('Deployment blocked by:', deploymentCheck.blockers);
 *   console.warn('Warnings:', deploymentCheck.warnings);
 *   console.info('Recommendations:', deploymentCheck.recommendations);
 *   process.exit(1);
 * }
 * 
 * // Check for port conflicts
 * const portCheck = healthChecker.checkPortConflicts();
 * if (portCheck.conflicts.length > 0) {
 *   console.warn('Port conflicts detected:', portCheck.conflicts);
 * }
 * ```
 * 
 * @example Express.js Integration
 * ```typescript
 * import express from 'express';
 * import { createConfigHealthEndpoint, createDeploymentReadinessEndpoint } from './health-checker';
 * 
 * const app = express();
 * 
 * // Health check endpoint
 * app.get('/health/config', createConfigHealthEndpoint());
 * 
 * // Deployment readiness endpoint
 * app.get('/health/deployment', createDeploymentReadinessEndpoint());
 * 
 * // Prometheus metrics endpoint
 * app.get('/metrics/config', async (req, res) => {
 *   const healthChecker = new ConfigHealthChecker();
 *   const metrics = await healthChecker.exportHealthReport('prometheus');
 *   res.set('Content-Type', 'text/plain').send(metrics);
 * });
 * ```
 * 
 * @example Event-Driven Monitoring
 * ```typescript
 * const healthChecker = new ConfigHealthChecker();
 * await healthChecker.initialize({ enableMonitoring: true });
 * 
 * // Listen for health changes
 * healthChecker.on('health:changed', (report) => {
 *   console.log(`Health status changed to: ${report.status}`);
 * });
 * 
 * healthChecker.on('health:critical', (report) => {
 *   // Send alert to monitoring system
 *   alertingSystem.sendAlert({
 *     severity: 'critical',
 *     message: 'Configuration health critical',
 *     details: report
 *   });
 * });
 * 
 * healthChecker.on('health:recovered', (report) => {
 *   console.log('Configuration health recovered');
 * });
 * ```
 * 
 * @author Claude Code Zen Team
 * @since 1.0.0-alpha.43
 * @version 2.1.0
 * 
 * @see {@link ConfigValidator} Configuration validation system
 * @see {@link ConfigHealthReport} Health report interface
 * @see {@link SystemConfiguration} System configuration interface
 */

import { EventEmitter } from 'eventemitter3';

import type {
  ConfigHealthReport,
  SystemConfiguration,
  ValidationResult,
} from '../types/config-types';

import { logRepoConfigStatus } from './default-repo-config';
import { configManager } from './manager';
import { ConfigValidator } from './validator';

/**
 * Configuration health checker with monitoring capabilities.
 *
 * @example
 * ```typescript
 * const healthChecker = new ConfigHealthChecker();
 * await healthChecker.initialize();
 *
 * // Get current health
 * const health = await healthChecker.getHealthReport();
 * console.log(`Config health: ${health.status} (${health.score}/100)`);
 *
 * // Monitor for changes
 * healthChecker.on('health:changed', (report) => {
 *   if (report.status === 'critical') {
 *     console.error('Critical configuration issues detected!');
 *   }
 * });
 * ```
 */
export class ConfigHealthChecker extends EventEmitter {
  private validator = new ConfigValidator();
  private lastHealthReport: ConfigHealthReport | null = null;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private healthCheckFrequency = 30000; // 30 seconds
  private readonly environment = process.env['NODE_ENV'] || 'development';

  /**
   * Initialize health checker with monitoring.
   *
   * @param options - Configuration options.
   * @param options.enableMonitoring
   * @param options.healthCheckFrequency
   */
  async initialize(
    options: { enableMonitoring?: boolean; healthCheckFrequency?: number } = {}
  ): Promise<void> {
    const { enableMonitoring = true, healthCheckFrequency = 30000 } = options;

    this.healthCheckFrequency = healthCheckFrequency;

    // Perform initial health check
    await this.performHealthCheck();

    // Set up configuration change listeners
    configManager?.on('config:changed', () => {
      this.performHealthCheck().catch((error) => {
        this.emit('error', error);
      });
    });

    configManager?.on('config:loaded', () => {
      this.performHealthCheck().catch((error) => {
        this.emit('error', error);
      });
    });

    // Start monitoring if enabled
    if (enableMonitoring) {
      this.startMonitoring();
    }
  }

  /**
   * Get current configuration health report.
   *
   * @param includeDetails - Include detailed validation information.
   */
  getHealthReport(
    includeDetails: true
  ): ConfigHealthReport & { validationDetails: ValidationResult };
  getHealthReport(includeDetails: false): ConfigHealthReport;
  getHealthReport(
    includeDetails = false
  ):
    | ConfigHealthReport
    | (ConfigHealthReport & { validationDetails: ValidationResult }) {
    const config = configManager?.getConfig();
    const healthReport = this.validator.getHealthReport(config);
    const validation = this.validator.validateEnhanced(config);

    const report: ConfigHealthReport = {
      isHealthy: healthReport.status === 'healthy',
      timestamp: Date.now(),
      environment: this.environment,
      status: healthReport.status,
      score: healthReport.score,
      details: healthReport.details,
      recommendations: healthReport.recommendations,
      checks: {
        configuration: {
          isValid: validation.valid || false,
          errors: validation.errors || [],
          warnings: validation.warnings || [],
          securityIssues: validation.securityIssues || [],
          portConflicts: validation.portConflicts || [],
          performanceWarnings: validation.performanceWarnings || [],
          productionReady: validation.productionReady || false,
          failsafeApplied: validation.failsafeApplied || []
        }
      },
      summary: {
        total: 1,
        passed: validation.valid ? 1 : 0,
        failed: validation.valid ? 0 : 1,
        warnings: (validation.warnings?.length || 0) + (validation.performanceWarnings?.length || 0)
      }
    };

    this.lastHealthReport = report;

    if (includeDetails) {
      const validationResult = this.validator.validateEnhanced(config);
      return {
        ...report,
        validationDetails: validationResult,
      } as ConfigHealthReport & { validationDetails: ValidationResult };
    }

    return report;
  }

  /**
   * Validate configuration for production deployment.
   *
   * @param config - Configuration to validate (optional, uses current if not provided).
   */
  validateForProduction(config?: SystemConfiguration): {
    deploymentReady: boolean;
    blockers: string[];
    warnings: string[];
    recommendations: string[];
  } {
    const configToValidate = config || configManager?.getConfig();
    const result = this.validator.validateEnhanced(configToValidate);

    const blockers: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];

    // Critical blockers for deployment
    if (!result?.valid) {
      blockers.push(...result?.errors);
    }

    if (result?.securityIssues.length > 0) {
      blockers.push(...result?.securityIssues);
    }

    if (result?.portConflicts.length > 0) {
      blockers.push(...result?.portConflicts);
    }

    // Non-critical warnings
    warnings.push(...result?.warnings);
    warnings.push(...result?.performanceWarnings);

    // Generate deployment recommendations
    if (!result?.productionReady) {
      recommendations.push('Configuration is not production-ready');
    }

    if (result?.failsafeApplied.length > 0) {
      recommendations.push(
        'Failsafe defaults were applied - review configuration'
      );
    }

    // Environment-specific recommendations
    if (this.environment === 'production') {
      if (!process.env['ANTHROPIC_API_KEY']) {
        recommendations.push(
          'ANTHROPIC_API_KEY not set - only needed for optional FACT integration'
        );
      }

      if (configToValidate?.core?.logger?.level === 'debug') {
        recommendations.push(
          'Consider using "info" log level in production instead of "debug"'
        );
      }
    }

    return {
      deploymentReady: blockers.length === 0,
      blockers,
      warnings,
      recommendations,
    };
  }

  /**
   * Check for port conflicts across all services.
   */
  checkPortConflicts(): {
    conflicts: Array<{
      port: number;
      services: string[];
      severity: 'error' | 'warning';
    }>;
    recommendations: string[];
  } {
    const config = configManager?.getConfig();
    const conflicts: Array<{
      port: number;
      services: string[];
      severity: 'error' | 'warning';
    }> = [];
    const recommendations: string[] = [];

    // Collect all port configurations
    const portMappings = [
      {
        name: 'MCP HTTP',
        port: config?.interfaces?.mcp?.http?.port,
        critical: true,
      },
      {
        name: 'Web Dashboard',
        port: config?.interfaces?.web?.port,
        critical: true,
      },
      {
        name: 'Monitoring',
        port: config?.monitoring?.dashboard?.port,
        critical: false,
      },
    ].filter((mapping) => typeof mapping.port === 'number');

    // Group by port
    const portGroups = new Map<
      number,
      Array<{ name: string; critical: boolean }>
    >();

    for (const mapping of portMappings) {
      if (typeof mapping.port === 'number') {
        if (!portGroups.has(mapping.port)) {
          portGroups.set(mapping.port, []);
        }
        portGroups
          .get(mapping.port)!
          .push({ name: mapping.name, critical: mapping.critical });
      }
    }

    // Identify conflicts
    for (const [port, services] of Array.from(portGroups.entries())) {
      if (services.length > 1) {
        const isCritical = services.some((s) => s.critical);
        conflicts.push({
          port,
          services: services.map((s) => s.name),
          severity: isCritical ? 'error' : 'warning',
        });
      }
    }

    // Generate recommendations
    if (conflicts.length > 0) {
      recommendations.push('Configure unique ports for each service');
      recommendations.push(
        'Use environment variables to override default ports'
      );
      recommendations.push(
        'Consider using a reverse proxy for port management'
      );
    }

    return { conflicts, recommendations };
  }

  /**
   * Get configuration health as simple status.
   */
  async getHealthStatus(): Promise<{
    status: 'healthy' | 'warning' | 'critical';
    message: string;
    timestamp: number;
  }> {
    const report = await this.getHealthReport();

    let message = '';
    switch (report.status) {
      case 'healthy':
        message = 'Configuration is healthy and production-ready';
        break;
      case 'warning':
        message = `Configuration has ${report.recommendations.length} recommendations`;
        break;
      case 'critical':
        message = 'Configuration has critical issues requiring attention';
        break;
    }

    return {
      status: report.status,
      message,
      timestamp: report.timestamp,
    };
  }

  /**
   * Start health monitoring.
   */
  startMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }

    this.monitoringInterval = setInterval(() => {
      this.performHealthCheck().catch((error) => {
        this.emit('error', error);
      });
    }, this.healthCheckFrequency);
  }

  /**
   * Stop health monitoring.
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }

  /**
   * Export health report for external monitoring.
   *
   * @param format - Export format.
   */
  async exportHealthReport(
    format: 'json' | 'prometheus' = 'json'
  ): Promise<string> {
    const report = await this.getHealthReport(true);

    if (format === 'json') {
      return JSON.stringify(report, null, 2);
    }
    if (format === 'prometheus') {
      return this.toPrometheusFormat(report);
    }

    throw new Error(`Unsupported export format: ${format}`);
  }

  /**
   * Cleanup resources.
   */
  destroy(): void {
    this.stopMonitoring();
    this.removeAllListeners();
  }

  /**
   * Perform health check and emit events.
   */
  private async performHealthCheck(): Promise<void> {
    try {
      const currentReport = await this.getHealthReport();

      // Compare with previous report
      if (this.lastHealthReport && this.lastHealthReport.status !== currentReport?.status) {
          this.emit('health:changed', currentReport);

          if (currentReport?.status === 'critical') {
            this.emit('health:critical', currentReport);
          } else if (
            currentReport?.status === 'healthy' &&
            this.lastHealthReport.status !== 'healthy'
          ) {
            this.emit('health:recovered', currentReport);
          }
        }

      this.emit('health:checked', currentReport);
      this.lastHealthReport = currentReport;

      // Log detailed repo config status for diagnostics (wired up!)
      if ((currentReport as any)?.configuration) {
        try {
          logRepoConfigStatus((currentReport as any).configuration as any);
        } catch (error) {
          // Silently continue if logging fails - don't break health checks
        }
      }
    } catch (error) {
      this.emit('error', error);
    }
  }

  /**
   * Convert health report to Prometheus format.
   *
   * @param report - Health report to convert.
   */
  private toPrometheusFormat(report: ConfigHealthReport): string {
    const lines: string[] = [];

    // Overall health score
    lines.push(
      '# HELP claude_zen_config_health_score Configuration health score (0-100)'
    );
    lines.push('# TYPE claude_zen_config_health_score gauge');
    lines.push(
      `claude_zen_config_health_score{environment="${this.environment}"} ${report.score}`
    );

    // Health status as numeric (0=critical, 1=warning, 2=healthy)
    const statusValue =
      report.status === 'healthy' ? 2 : report.status === 'warning' ? 1 : 0;
    lines.push(
      '# HELP claude_zen_config_health_status Configuration health status'
    );
    lines.push('# TYPE claude_zen_config_health_status gauge');
    lines.push(
      `claude_zen_config_health_status{environment="${this.environment}",status="${report.status}"} ${statusValue}`
    );

    // Component health details
    for (const [component, healthy] of Object.entries(report.details)) {
      lines.push(
        `# HELP claude_zen_config_${component}_health ${component} configuration health`
      );
      lines.push(`# TYPE claude_zen_config_${component}_health gauge`);
      lines.push(
        `claude_zen_config_${component}_health{environment="${this.environment}"} ${healthy ? 1 : 0}`
      );
    }

    // Recommendation count
    lines.push(
      '# HELP claude_zen_config_recommendations_total Number of configuration recommendations'
    );
    lines.push('# TYPE claude_zen_config_recommendations_total gauge');
    lines.push(
      `claude_zen_config_recommendations_total{environment="${this.environment}"} ${report.recommendations.length}`
    );

    return `${lines.join('\n')}\n`;
  }
}

// Export singleton instance
export const configHealthChecker = new ConfigHealthChecker();

/**
 * Initialize configuration health checking.
 *
 * @param options - Initialization options.
 * @param options.enableMonitoring
 * @param options.healthCheckFrequency
 * @example
 */
export async function initializeConfigHealthChecker(options?: {
  enableMonitoring?: boolean;
  healthCheckFrequency?: number;
}): Promise<void> {
  await configHealthChecker?.initialize(options);
}

/**
 * Create health check endpoint handler for Express.js.
 *
 * @example
 * ```typescript
 * app.get('/health/config', createConfigHealthEndpoint());
 * ```
 */
export function createConfigHealthEndpoint() {
  return async (_req: unknown, res: unknown) => {
    try {
      const healthReport = await configHealthChecker?.getHealthReport(true);

      // Set appropriate HTTP status
      const statusCode =
        healthReport.status === 'healthy'
          ? 200
          : healthReport.status === 'warning'
            ? 200
            : 503;

      (res as any).status(statusCode).json({
        success: healthReport.status !== 'critical',
        health: healthReport,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      (res as any).status(500).json({
        success: false,
        error: 'Health check failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      });
    }
  };
}

/**
 * Create deployment readiness check endpoint.
 *
 * @example
 * ```typescript
 * app.get('/health/deployment', createDeploymentReadinessEndpoint());
 * ```
 */
export function createDeploymentReadinessEndpoint() {
  return async (_req: unknown, res: unknown) => {
    try {
      const deploymentCheck =
        await configHealthChecker?.validateForProduction();
      const portCheck = configHealthChecker?.checkPortConflicts();

      const statusCode =
        deploymentCheck.deploymentReady && portCheck.conflicts.length === 0
          ? 200
          : 503;

      (res as any).status(statusCode).json({
        success:
          deploymentCheck.deploymentReady && portCheck.conflicts.length === 0,
        deployment: {
          ready: deploymentCheck.deploymentReady,
          blockers: deploymentCheck.blockers,
          warnings: deploymentCheck.warnings,
          recommendations: deploymentCheck.recommendations,
        },
        ports: {
          conflicts: portCheck.conflicts,
          recommendations: portCheck.recommendations,
        },
        timestamp: new Date().toISOString(),
        environment: process.env['NODE_ENV'] || 'development',
      });
    } catch (error) {
      (res as any).status(500).json({
        success: false,
        error: 'Deployment readiness check failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      });
    }
  };
}
