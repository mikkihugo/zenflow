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
 * const portCheck = await healthChecker.checkPortConflicts();
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
import { EventEmitter } from 'node:events';
import type { ConfigHealthReport, SystemConfiguration, ValidationResult } from '../types/config-types';
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
export declare function createConfigHealthEndpoint(): (_req: unknown, res: unknown) => Promise<void>;
/**
 * Create deployment readiness check endpoint.
 *
 * @example
 * ```typescript
 * app.get('/health/deployment', createDeploymentReadinessEndpoint());
 * ```
 */
export declare function createDeploymentReadinessEndpoint(): (_req: unknown, res: unknown) => Promise<void>;
//# sourceMappingURL=health-checker.d.ts.map