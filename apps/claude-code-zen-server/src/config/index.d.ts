/**
 * @fileoverview Unified Configuration System - Central export point and convenience API
 *
 * This module provides a comprehensive, unified interface to the entire Claude Code Zen
 * configuration system. It serves as the central export point for all configuration
 * functionality, offering both direct exports and a convenient object-based API for
 * common configuration operations.
 *
 * **Key Features:**
 * - **Unified Exports**: Single import point for all configuration functionality
 * - **Convenience API**: Object-based API with common operations (config.get, config.set)
 * - **Health Monitoring**: Built-in configuration health checking and validation
 * - **Production Readiness**: Production deployment validation and port conflict detection
 * - **Type Safety**: Full TypeScript support with comprehensive type exports
 * - **Event Handling**: Configuration change listeners and event management
 * - **Multiple Formats**: JSON/YAML export capabilities for configuration data
 *
 * **Configuration Categories:**
 * - Repository configuration with intelligent defaults
 * - System constants and URL building utilities
 * - Health checking and deployment readiness validation
 * - Configuration loading and management
 * - Startup validation and CLI tools
 * - Type definitions and validation schemas
 *
 * @example Basic Configuration Usage
 * ```typescript
 * import { config } from './config';
 *
 * // Initialize configuration system
 * await config.init(['./config.json', './local.config.json']);
 *
 * // Get configuration values
 * const port = config.get<number>('core.port');
 * const dbConfig = config.getSection('database');
 *
 * // Update configuration
 * config.set('core.logLevel', 'debug');
 *
 * // Listen for changes
 * config.onChange((event) => {
 *   console.log('Configuration changed:', event);
 * });
 * ```
 *
 * @example Repository Configuration
 * ```typescript
 * import { createRepoConfig, validateRepoConfig, logRepoConfigStatus } from './config';
 *
 * // Create optimized repository configuration
 * const repoConfig = createRepoConfig('/path/to/project', {
 *   enableMLOptimization: true,
 *   dsyIntegration: {
 *     enabled: true,
 *     neuralEnhancement: true
 *   }
 * });
 *
 * // Validate and log status
 * const validation = validateRepoConfig(repoConfig);
 * if (validation.valid) {
 *   logRepoConfigStatus(repoConfig);
 * }
 * ```
 *
 * @example Health Monitoring
 * ```typescript
 * import { config } from './config';
 *
 * // Check overall system health
 * const healthReport = await config.getHealthReport();
 * console.log(`System health: ${healthReport.status} (${healthReport.score}/100)`);
 *
 * // Validate production readiness
 * const isReady = await config.isProductionReady();
 * if (!isReady) {
 *   console.error('System not ready for production deployment');
 * }
 *
 * // Check for port conflicts
 * const portCheck = await config.checkPorts();
 * if (portCheck.conflicts.length > 0) {
 *   console.warn('Port conflicts detected:', portCheck.conflicts);
 * }
 * ```
 *
 * @example Advanced Usage with Direct Exports
 * ```typescript
 * import {
 *   ConfigurationManager,
 *   ConfigHealthChecker,
 *   ConfigValidator,
 *   runStartupValidation
 * } from './config';
 *
 * // Create custom configuration manager
 * const customManager = new ConfigurationManager();
 * await customManager.initialize(['./custom-config.json']);
 *
 * // Perform startup validation
 * const validation = await runStartupValidation({
 *   validateProduction: true,
 *   checkPorts: true,
 *   logResults: true
 * });
 * ```
 *
 * @author Claude Code Zen Team
 * @since 1.0.0-alpha.43
 * @version 2.1.0
 *
 * @see {@link ConfigurationManager} Core configuration management
 * @see {@link ConfigHealthChecker} Health monitoring and validation
 * @see {@link RepoConfig} Repository configuration interface
 * @see {@link SystemConfiguration} System configuration interface
 */
import type { SystemConfiguration } from '../types/config-types';
export { createRepoConfig, defaultRepoConfig, logRepoConfigStatus, type RepoConfig, validateRepoConfig, } from './default-repo-config';
export { createURLBuilder, DEFAULT_CONFIG, defaultURLBuilder, ENV_MAPPINGS, getCORSOrigins, getMonitoringDashboardURL, getWebDashboardURL, PRODUCTION_VALIDATION_SCHEMA, URLBuilder, type URLBuilderConfig, VALIDATION_RULES, } from './defaults';
export { ConfigHealthChecker, configHealthChecker, createConfigHealthEndpoint, createDeploymentReadinessEndpoint, initializeConfigHealthChecker, } from './health-checker';
export { ConfigurationLoader } from './loader';
export { ConfigurationManager, configManager } from './manager';
export type { StartupValidationOptions, StartupValidationResult, } from './startup-validator';
export { cli as runStartupValidationCLI, runStartupValidation, validateAndExit, } from './startup-validator';
export type { ConfigChangeEvent, ConfigHealthReport, ConfigurationSource, ConfigValidationResult, CoordinationConfig, CoreConfig, DatabaseConfig, EnvironmentMappings, InterfaceConfig, MemoryConfig, NeuralConfig, OptimizationConfig, SystemConfiguration, TerminalConfig, ValidationResult, WebConfig, } from '../types/config-types';
export { ConfigValidator } from './validator';
export declare const config: {
    /**
     * Initialize configuration system.
     *
     * @param configPaths
     */
    init(configPaths?: string[]): Promise<ConfigValidationResult>;
    /**
     * Get configuration value.
     *
     * @param path
     */
    get<T = any>(path: string): T | undefined;
    /**
     * Get configuration section.
     *
     * @param section
     */
    getSection<K extends keyof SystemConfiguration>(section: K): SystemConfiguration[K];
    /**
     * Update configuration value.
     *
     * @param path
     * @param value
     */
    set(path: string, value: unknown): ConfigValidationResult;
    /**
     * Get full configuration.
     */
    getAll(): SystemConfiguration;
    /**
     * Validate configuration.
     */
    validate(): ConfigValidationResult;
    /**
     * Reload from sources.
     */
    reload(): Promise<ConfigValidationResult>;
    /**
     * Export configuration.
     *
     * @param format
     */
    export(format?: "json" | "yaml"): string;
    /**
     * Listen for configuration changes.
     *
     * @param callback
     */
    onChange(callback: (event: unknown) => void): void;
    /**
     * Remove change listener.
     *
     * @param callback
     */
    removeListener(callback: (event: unknown) => void): void;
    /**
     * Get configuration health report.
     */
    getHealthReport(): Promise<ConfigHealthReport>;
    /**
     * Check if configuration is production ready.
     */
    isProductionReady(): Promise<boolean>;
    /**
     * Check for port conflicts.
     */
    checkPorts(): Promise<{
        conflicts: Array<{
            port: number;
            services: string[];
            severity: "error" | "warning";
        }>;
        recommendations: string[];
    }>;
    /**
     * Run startup validation.
     *
     * @param options - Startup validation options
     */
    validateStartup(options?: unknown): Promise<import("./startup-validator").StartupValidationResult>;
};
import type { ConfigurationManager } from './manager';
export type ConfigManager = ConfigurationManager;
export default config;
//# sourceMappingURL=index.d.ts.map