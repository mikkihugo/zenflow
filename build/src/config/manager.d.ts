/**
 * @file Unified Configuration Manager.
 *
 * Central configuration management with hot-reloading, validation, and event system.
 */
import { EventEmitter } from 'node:events';
import type { ConfigValidationResult, SystemConfiguration } from './types.ts';
/**
 * Unified Configuration Manager.
 *
 * Features:
 * - Multi-source configuration loading (files, env, CLI)
 * - Hot-reloading with file watchers
 * - Configuration validation with detailed errors
 * - Event-driven configuration changes
 * - Thread-safe configuration access
 * - Configuration history and rollback.
 *
 * @example.
 * @example
 */
export declare class ConfigurationManager extends EventEmitter {
    private static instance;
    private config;
    private loader;
    private validator;
    private configPaths;
    private watchers;
    private configHistory;
    private maxHistorySize;
    private isLoading;
    private constructor();
    /**
     * Get singleton instance.
     */
    static getInstance(): ConfigurationManager;
    /**
     * Initialize configuration system.
     *
     * @param configPaths
     */
    initialize(configPaths?: string[]): Promise<ConfigValidationResult>;
    /**
     * Get current configuration.
     */
    getConfig(): SystemConfiguration;
    /**
     * Get configuration section.
     *
     * @param section
     */
    getSection<K extends keyof SystemConfiguration>(section: K): SystemConfiguration[K];
    /**
     * Get nested configuration value.
     *
     * @param path
     */
    get<T = any>(path: string): T | undefined;
    /**
     * Update configuration (runtime only).
     *
     * @param path
     * @param value.
     * @param value
     */
    update(path: string, value: any): ConfigValidationResult;
    /**
     * Reload configuration from sources.
     */
    reload(): Promise<ConfigValidationResult>;
    /**
     * Validate current configuration.
     */
    validate(): ConfigValidationResult;
    /**
     * Get configuration history.
     */
    getHistory(): SystemConfiguration[];
    /**
     * Rollback to previous configuration.
     *
     * @param steps
     */
    rollback(steps?: number): boolean;
    /**
     * Export current configuration.
     *
     * @param format
     */
    export(format?: 'json' | 'yaml'): string;
    /**
     * Get configuration sources info.
     */
    getSourcesInfo(): import("./types.ts").ConfigurationSource[];
    /**
     * Cleanup resources.
     */
    destroy(): void;
    /**
     * Setup file watchers for hot-reloading.
     */
    private setupFileWatchers;
    /**
     * Setup error handling.
     */
    private setupErrorHandling;
    /**
     * Add configuration to history.
     *
     * @param config
     */
    private addToHistory;
    /**
     * Set nested value using dot notation.
     *
     * @param obj
     * @param path
     * @param value
     */
    private setNestedValue;
    /**
     * Simple YAML export (basic implementation).
     *
     * @param obj
     * @param indent.
     * @param indent
     */
    private toSimpleYaml;
}
export declare const configManager: ConfigurationManager;
//# sourceMappingURL=manager.d.ts.map