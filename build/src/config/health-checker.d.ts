/**
 * @file Configuration Health Checker.
 *
 * Provides health check endpoints and monitoring for configuration validation.
 * Designed for production deployment validation and monitoring.
 */
import { EventEmitter } from 'node:events';
import type { ConfigHealthReport, SystemConfiguration, ValidationResult } from './types.ts';
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
export declare class ConfigHealthChecker extends EventEmitter {
    private validator;
    private lastHealthReport;
    private monitoringInterval;
    private healthCheckFrequency;
    private readonly environment;
    /**
     * Initialize health checker with monitoring.
     *
     * @param options - Configuration options.
     * @param options.enableMonitoring
     * @param options.healthCheckFrequency
     */
    initialize(options?: {
        enableMonitoring?: boolean;
        healthCheckFrequency?: number;
    }): Promise<void>;
    /**
     * Get current configuration health report.
     *
     * @param includeDetails - Include detailed validation information.
     */
    getHealthReport(): Promise<ConfigHealthReport>;
    getHealthReport(includeDetails: true): Promise<ConfigHealthReport & {
        validationDetails: ValidationResult;
    }>;
    getHealthReport(includeDetails: false): Promise<ConfigHealthReport>;
    /**
     * Validate configuration for production deployment.
     *
     * @param config - Configuration to validate (optional, uses current if not provided).
     */
    validateForProduction(config?: SystemConfiguration): Promise<{
        deploymentReady: boolean;
        blockers: string[];
        warnings: string[];
        recommendations: string[];
    }>;
    /**
     * Check for port conflicts across all services.
     */
    checkPortConflicts(): Promise<{
        conflicts: Array<{
            port: number;
            services: string[];
            severity: 'error' | 'warning';
        }>;
        recommendations: string[];
    }>;
    /**
     * Get configuration health as simple status.
     */
    getHealthStatus(): Promise<{
        status: 'healthy' | 'warning' | 'critical';
        message: string;
        timestamp: number;
    }>;
    /**
     * Start health monitoring.
     */
    startMonitoring(): void;
    /**
     * Stop health monitoring.
     */
    stopMonitoring(): void;
    /**
     * Export health report for external monitoring.
     *
     * @param format - Export format.
     */
    exportHealthReport(format?: 'json' | 'prometheus'): Promise<string>;
    /**
     * Cleanup resources.
     */
    destroy(): void;
    /**
     * Perform health check and emit events.
     */
    private performHealthCheck;
    /**
     * Convert health report to Prometheus format.
     *
     * @param report - Health report to convert.
     */
    private toPrometheusFormat;
}
export declare const configHealthChecker: ConfigHealthChecker;
/**
 * Initialize configuration health checking.
 *
 * @param options - Initialization options.
 * @param options.enableMonitoring
 * @param options.healthCheckFrequency
 * @example
 */
export declare function initializeConfigHealthChecker(options?: {
    enableMonitoring?: boolean;
    healthCheckFrequency?: number;
}): Promise<void>;
/**
 * Create health check endpoint handler for Express.js.
 *
 * @example
 * ```typescript
 * app.get('/health/config', createConfigHealthEndpoint());
 * ```
 */
export declare function createConfigHealthEndpoint(): (_req: any, res: any) => Promise<void>;
/**
 * Create deployment readiness check endpoint.
 *
 * @example
 * ```typescript
 * app.get('/health/deployment', createDeploymentReadinessEndpoint());
 * ```
 */
export declare function createDeploymentReadinessEndpoint(): (_req: any, res: any) => Promise<void>;
//# sourceMappingURL=health-checker.d.ts.map