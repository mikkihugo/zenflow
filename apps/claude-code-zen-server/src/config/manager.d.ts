/**
 * @fileoverview Unified Configuration Manager - Central configuration management with hot-reloading and events
 *
 * This module provides comprehensive configuration management with advanced features including
 * hot-reloading, validation, event-driven updates, and configuration history. Implements a
 * singleton pattern for centralized configuration access throughout the application.
 *
 * **Key Features:**
 * - **Multi-Source Loading**: Files, environment variables, CLI arguments, and defaults
 * - **Hot-Reloading**: Automatic configuration reload when files change
 * - **Event System**: Event-driven configuration change notifications
 * - **Configuration Validation**: Real-time validation with detailed error reporting
 * - **Configuration History**: Version history with rollback capabilities
 * - **Thread-Safe Access**: Safe concurrent access to configuration data
 * - **Runtime Updates**: Dynamic configuration updates with validation
 * - **Export Capabilities**: JSON and YAML export functionality
 *
 * **Event Types:**
 * - `config:loaded` - Configuration successfully loaded
 * - `config:changed` - Configuration value changed at runtime
 * - `config:rollback` - Configuration rolled back to previous version
 * - `error` - Configuration errors and validation failures
 *
 * **Configuration Sources (priority order):**
 * 1. CLI arguments (--config.path.to.value)
 * 2. Environment variables
 * 3. Configuration files
 * 4. Default configuration
 *
 * @example Basic Configuration Management
 * ```typescript
 * import { configManager } from './manager';
 *
 * // Initialize with configuration files
 * const validation = await configManager.initialize([
 *   './config/production.json',
 *   './config/local-overrides.json'
 * ]);
 *
 * if (validation.valid) {
 *   console.log('Configuration loaded successfully');
 *
 *   // Get configuration values
 *   const port = configManager.get<number>('core.port');
 *   const dbConfig = configManager.getSection('database');
 *
 *   console.log(`Server starting on port ${port}`);
 * } else {
 *   console.error('Configuration validation failed:', validation.errors);
 * }
 * ```
 *
 * @example Runtime Configuration Updates
 * ```typescript
 * import { configManager } from './manager';
 *
 * // Update configuration at runtime
 * const result = configManager.update('core.logLevel', 'debug');
 *
 * if (result.valid) {
 *   console.log('Log level updated to debug');
 * } else {
 *   console.error('Invalid configuration update:', result.errors);
 * }
 *
 * // Listen for configuration changes
 * configManager.on('config:changed', (event) => {
 *   console.log(`Configuration changed: ${event.path}`);
 *   console.log(`Old value: ${event.oldValue}`);
 *   console.log(`New value: ${event.newValue}`);
 * });
 * ```
 *
 * @example Configuration History and Rollback
 * ```typescript
 * import { configManager } from './manager';
 *
 * // Get configuration history
 * const history = configManager.getHistory();
 * console.log(`Configuration history: ${history.length} versions`);
 *
 * // Rollback to previous configuration
 * const rollbackSuccess = configManager.rollback(1);
 * if (rollbackSuccess) {
 *   console.log('Successfully rolled back configuration');
 * } else {
 *   console.error('Rollback failed - no valid previous configuration');
 * }
 *
 * // Rollback multiple steps
 * configManager.rollback(3); // Go back 3 configuration changes
 * ```
 *
 * @example Hot-Reloading and File Watching
 * ```typescript
 * import { configManager } from './manager';
 *
 * // Configuration will automatically reload when files change
 * await configManager.initialize(['./config.json']);
 *
 * // Listen for automatic reloads
 * configManager.on('config:loaded', ({ config, validation }) => {
 *   if (validation.valid) {
 *     console.log('Configuration reloaded successfully');
 *   } else {
 *     console.warn('Configuration reloaded with warnings:', validation.warnings);
 *   }
 * });
 *
 * // Manual reload
 * const result = await configManager.reload();
 * console.log('Manual reload result:', result.valid ? 'success' : 'failed');
 * ```
 *
 * @example Configuration Export and Debugging
 * ```typescript
 * import { configManager } from './manager';
 *
 * // Export configuration in different formats
 * const jsonConfig = configManager.export('json');
 * const yamlConfig = configManager.export('yaml');
 *
 * // Save to file for debugging
 * fs.writeFileSync('./debug-config.json', jsonConfig);
 *
 * // Get information about configuration sources
 * const sources = configManager.getSourcesInfo();
 * console.log('Configuration loaded from:', sources.map(s => s.type));
 *
 * // Validate current configuration
 * const validation = configManager.validate();
 * if (!validation.valid) {
 *   console.error('Current configuration is invalid:', validation.errors);
 * }
 * ```
 *
 * @author Claude Code Zen Team
 * @since 1.0.0-alpha.43
 * @version 2.1.0
 *
 * @see {@link ConfigurationLoader} Multi-source configuration loading
 * @see {@link ConfigValidator} Configuration validation system
 * @see {@link SystemConfiguration} System configuration interface
 * @see {@link ConfigChangeEvent} Configuration change event interface
 */
import { EventEmitter } from 'node:events';
import type { ConfigValidationResult, SystemConfiguration } from '../types/config-types';
/**
 * Unified Configuration Manager with comprehensive configuration management capabilities.
 *
 * Provides centralized configuration management with advanced features including multi-source
 * loading, hot-reloading, validation, event-driven updates, and configuration history.
 * Implements singleton pattern for application-wide configuration access.
 *
 * **Core Features:**
 * - **Multi-source loading**: Files, environment variables, CLI arguments, defaults
 * - **Hot-reloading**: Automatic reload when configuration files change
 * - **Real-time validation**: Configuration validation with detailed error reporting
 * - **Event-driven updates**: Emit events for configuration changes and reloads
 * - **Thread-safe access**: Safe concurrent access to configuration data
 * - **Configuration history**: Version history with rollback capabilities
 * - **Runtime updates**: Dynamic configuration updates with validation
 * - **Export capabilities**: JSON and YAML export for debugging and backup
 *
 * **Event System:**
 * - `config:loaded` - Emitted when configuration is loaded or reloaded
 * - `config:changed` - Emitted when configuration is updated at runtime
 * - `config:rollback` - Emitted when configuration is rolled back
 * - `error` - Emitted for configuration errors and validation failures
 *
 * @example Basic Usage
 * ```typescript
 * const manager = ConfigurationManager.getInstance();
 *
 * // Initialize configuration
 * const validation = await manager.initialize(['./config.json']);
 *
 * if (validation.valid) {
 *   const port = manager.get<number>('core.port');
 *   console.log(`Server port: ${port}`);
 * }
 * ```
 *
 * @example Event Handling
 * ```typescript
 * const manager = ConfigurationManager.getInstance();
 *
 * manager.on('config:changed', (event) => {
 *   console.log(`Config changed: ${event.path} = ${event.newValue}`);
 * });
 *
 * manager.on('config:loaded', ({ config, validation }) => {
 *   console.log('Configuration reloaded');
 * });
 * ```
 *
 * @example Configuration History
 * ```typescript
 * const manager = ConfigurationManager.getInstance();
 *
 * // Update configuration
 * manager.update('core.debug', true);
 *
 * // Get history
 * const history = manager.getHistory();
 *
 * // Rollback if needed
 * const success = manager.rollback(1);
 * ```
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
     * @param path - Configuration path using dot notation (e.g., 'core.port')
     * @param value - New configuration value to set
     * @returns Validation result indicating if the update was successful
     */
    update(path: string, value: unknown): ConfigValidationResult;
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
    getSourcesInfo(): ConfigurationSource[];
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
     * @param obj - Object to convert to YAML format
     * @param indent - Indentation level for nested objects
     * @returns YAML string representation of the object
     */
    private toSimpleYaml;
}
export declare const configManager: ConfigurationManager;
//# sourceMappingURL=manager.d.ts.map