/**
 * @file Unified Configuration System.
 *
 * Central export point for the complete configuration system.
 */
import type { SystemConfiguration } from './types.ts';
export { createURLBuilder, DEFAULT_CONFIG, DEFAULT_PORT_ALLOCATION, defaultURLBuilder, ENV_MAPPINGS, getCORSOrigins, getMCPServerURL, getMonitoringDashboardURL, getWebDashboardURL, PORT_ALLOCATION_BY_ENV, PRODUCTION_VALIDATION_SCHEMA, URLBuilder, type URLBuilderConfig, VALIDATION_RULES, } from './defaults.ts';
export { ConfigHealthChecker, configHealthChecker, createConfigHealthEndpoint, createDeploymentReadinessEndpoint, initializeConfigHealthChecker, } from './health-checker.ts';
export { ConfigurationLoader } from './loader.ts';
export { ConfigurationManager, configManager } from './manager.ts';
export type { StartupValidationOptions, StartupValidationResult, } from './startup-validator.ts';
export { cli as runStartupValidationCLI, runStartupValidation, validateAndExit, } from './startup-validator.ts';
export type { ConfigChangeEvent, ConfigHealthReport, ConfigurationSource, ConfigValidationResult, CoordinationConfig, CoreConfig, DatabaseConfig, EnvironmentMappings, InterfaceConfig, MCPConfig, MemoryConfig, NeuralConfig, OptimizationConfig, SystemConfiguration, TerminalConfig, ValidationResult, WebConfig, } from './types.ts';
export { ConfigValidator } from './validator.ts';
export declare const config: {
    /**
     * Initialize configuration system.
     *
     * @param configPaths
     */
    init(configPaths?: string[]): Promise<import("./types.ts").ConfigValidationResult>;
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
    set(path: string, value: any): import("./types.ts").ConfigValidationResult;
    /**
     * Get full configuration.
     */
    getAll(): SystemConfiguration;
    /**
     * Validate configuration.
     */
    validate(): import("./types.ts").ConfigValidationResult;
    /**
     * Reload from sources.
     */
    reload(): Promise<import("./types.ts").ConfigValidationResult>;
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
    onChange(callback: (event: any) => void): void;
    /**
     * Remove change listener.
     *
     * @param callback
     */
    removeListener(callback: (event: any) => void): void;
    /**
     * Get configuration health report.
     */
    getHealthReport(): Promise<import("./types.ts").ConfigHealthReport>;
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
     * @param options
     */
    validateStartup(options?: any): Promise<import("./startup-validator.ts").StartupValidationResult>;
};
import type { ConfigurationManager } from './manager.ts';
export type ConfigManager = ConfigurationManager;
export default config;
//# sourceMappingURL=index.d.ts.map