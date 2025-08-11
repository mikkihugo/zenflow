/**
 * @file Configuration Health Checker.
 *
 * Provides health check endpoints and monitoring for configuration validation.
 * Designed for production deployment validation and monitoring.
 */

import { EventEmitter } from 'node:events';
import { logRepoConfigStatus } from './default-repo-config.ts';
import { configManager } from './manager.ts';
import type {
  ConfigHealthReport,
  SystemConfiguration,
  ValidationResult,
} from './types.ts';
import { ConfigValidator } from './validator.ts';

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
    options: { enableMonitoring?: boolean; healthCheckFrequency?: number } = {},
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
  async getHealthReport(): Promise<ConfigHealthReport>;
  async getHealthReport(
    includeDetails: true,
  ): Promise<ConfigHealthReport & { validationDetails: ValidationResult }>;
  async getHealthReport(includeDetails: false): Promise<ConfigHealthReport>;
  async getHealthReport(
    includeDetails = false,
  ): Promise<
    | ConfigHealthReport
    | (ConfigHealthReport & { validationDetails: ValidationResult })
  > {
    const config = configManager?.getConfig();
    const healthReport = this.validator.getHealthReport(config);

    const report: ConfigHealthReport = {
      ...healthReport,
      timestamp: Date.now(),
      environment: this.environment,
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
  async validateForProduction(config?: SystemConfiguration): Promise<{
    deploymentReady: boolean;
    blockers: string[];
    warnings: string[];
    recommendations: string[];
  }> {
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
        'Failsafe defaults were applied - review configuration',
      );
    }

    // Environment-specific recommendations
    if (this.environment === 'production') {
      if (!process.env['ANTHROPIC_API_KEY']) {
        blockers.push(
          'ANTHROPIC_API_KEY environment variable required in production',
        );
      }

      if (configToValidate?.core?.logger?.level === 'debug') {
        recommendations.push(
          'Consider using "info" log level in production instead of "debug"',
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
  async checkPortConflicts(): Promise<{
    conflicts: Array<{
      port: number;
      services: string[];
      severity: 'error' | 'warning';
    }>;
    recommendations: string[];
  }> {
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
    for (const [port, services] of portGroups.entries()) {
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
        'Use environment variables to override default ports',
      );
      recommendations.push(
        'Consider using a reverse proxy for port management',
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
    format: 'json' | 'prometheus' = 'json',
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
      if (this.lastHealthReport) {
        if (this.lastHealthReport.status !== currentReport?.status) {
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
      }

      this.emit('health:checked', currentReport);
      this.lastHealthReport = currentReport;

      // Log detailed repo config status for diagnostics (wired up!)
      if (currentReport?.configuration) {
        try {
          logRepoConfigStatus(currentReport.configuration as any);
        } catch (error) {
          // Silently continue if logging fails - don't break health checks
          console.debug('Config status logging failed:', error);
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
      '# HELP claude_zen_config_health_score Configuration health score (0-100)',
    );
    lines.push('# TYPE claude_zen_config_health_score gauge');
    lines.push(
      `claude_zen_config_health_score{environment="${this.environment}"} ${report.score}`,
    );

    // Health status as numeric (0=critical, 1=warning, 2=healthy)
    const statusValue =
      report.status === 'healthy' ? 2 : report.status === 'warning' ? 1 : 0;
    lines.push(
      '# HELP claude_zen_config_health_status Configuration health status',
    );
    lines.push('# TYPE claude_zen_config_health_status gauge');
    lines.push(
      `claude_zen_config_health_status{environment="${this.environment}",status="${report.status}"} ${statusValue}`,
    );

    // Component health details
    for (const [component, healthy] of Object.entries(report.details)) {
      lines.push(
        `# HELP claude_zen_config_${component}_health ${component} configuration health`,
      );
      lines.push(`# TYPE claude_zen_config_${component}_health gauge`);
      lines.push(
        `claude_zen_config_${component}_health{environment="${this.environment}"} ${healthy ? 1 : 0}`,
      );
    }

    // Recommendation count
    lines.push(
      '# HELP claude_zen_config_recommendations_total Number of configuration recommendations',
    );
    lines.push('# TYPE claude_zen_config_recommendations_total gauge');
    lines.push(
      `claude_zen_config_recommendations_total{environment="${this.environment}"} ${report.recommendations.length}`,
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

      res.status(statusCode).json({
        success: healthReport.status !== 'critical',
        health: healthReport,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.status(500).json({
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
      const portCheck = await configHealthChecker?.checkPortConflicts();

      const statusCode =
        deploymentCheck.deploymentReady && portCheck.conflicts.length === 0
          ? 200
          : 503;

      res.status(statusCode).json({
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
      res.status(500).json({
        success: false,
        error: 'Deployment readiness check failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      });
    }
  };
}
