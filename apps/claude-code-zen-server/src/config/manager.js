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
import { getLogger } from '../config/logging-config';
const logger = getLogger('src-config-manager'); // Use any to allow flexible logger interface
import { EventEmitter } from 'node:events';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { DEFAULT_CONFIG } from './defaults';
import { ConfigurationLoader } from './loader';
import { ConfigValidator } from './validator';
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
export class ConfigurationManager extends EventEmitter {
    static instance = null;
    config;
    loader = new ConfigurationLoader();
    validator = new ConfigValidator();
    configPaths = [];
    watchers = [];
    configHistory = [];
    maxHistorySize = 10;
    isLoading = false;
    constructor() {
        super();
        this.config = JSON.parse(JSON.stringify(DEFAULT_CONFIG));
        this.setupErrorHandling();
    }
    /**
     * Get singleton instance.
     */
    static getInstance() {
        if (!ConfigurationManager.instance) {
            ConfigurationManager.instance = new ConfigurationManager();
        }
        return ConfigurationManager.instance;
    }
    /**
     * Initialize configuration system.
     *
     * @param configPaths
     */
    async initialize(configPaths) {
        if (this.isLoading) {
            throw new Error('Configuration is already being loaded');
        }
        this.isLoading = true;
        try {
            const result = await this.loader.loadConfiguration(configPaths);
            if (result?.validation?.valid) {
                this.config = result?.config;
                if (result?.validation?.warnings.length > 0) {
                    logger.warn('⚠️ Configuration warnings:');
                    result?.validation?.warnings?.forEach((warning) => logger.warn(`  - ${warning}`));
                }
            }
            else {
                logger.error('❌ Configuration validation failed:');
                result?.validation?.errors?.forEach((error) => logger.error(`  - ${error}`));
                if (result?.validation?.warnings.length > 0) {
                    logger.warn('⚠️ Configuration warnings:');
                    result?.validation?.warnings?.forEach((warning) => logger.warn(`  - ${warning}`));
                }
                this.config = JSON.parse(JSON.stringify(DEFAULT_CONFIG));
            }
            // Store config paths for watching
            this.configPaths = configPaths || [];
            // Setup file watchers for hot-reloading
            this.setupFileWatchers();
            // Add to history
            this.addToHistory(this.config);
            this.emit('config:loaded', {
                config: this.config,
                validation: result?.validation,
            });
            return result?.validation;
        }
        finally {
            this.isLoading = false;
        }
    }
    /**
     * Get current configuration.
     */
    getConfig() {
        return JSON.parse(JSON.stringify(this.config));
    }
    /**
     * Get configuration section.
     *
     * @param section
     */
    getSection(section) {
        return JSON.parse(JSON.stringify(this.config[section]));
    }
    /**
     * Get nested configuration value.
     *
     * @param path
     */
    get(path) {
        return path
            .split('.')
            .reduce((current, key) => current?.[key], this.config);
    }
    /**
     * Update configuration (runtime only).
     *
     * @param path - Configuration path using dot notation (e.g., 'core.port')
     * @param value - New configuration value to set
     * @returns Validation result indicating if the update was successful
     */
    update(path, value) {
        const oldValue = this.get(path);
        // Create a copy for testing
        const testConfig = JSON.parse(JSON.stringify(this.config));
        this.setNestedValue(testConfig, path, value);
        // Validate the change
        const validation = this.validator.validate(testConfig);
        if (!validation.valid) {
            return validation;
        }
        // Apply the change
        this.setNestedValue(this.config, path, value);
        // Add to history
        this.addToHistory(this.config);
        // Emit change event
        const changeEvent = {
            path,
            oldValue,
            newValue: value,
            source: 'runtime',
            timestamp: Date.now(),
        };
        this.emit('config:changed', changeEvent);
        return validation;
    }
    /**
     * Reload configuration from sources.
     */
    async reload() {
        return this.initialize(this.configPaths);
    }
    /**
     * Validate current configuration.
     */
    validate() {
        return this.validator.validate(this.config);
    }
    /**
     * Get configuration history.
     */
    getHistory() {
        return [...this.configHistory];
    }
    /**
     * Rollback to previous configuration.
     *
     * @param steps
     */
    rollback(steps = 1) {
        if (this.configHistory.length <= steps) {
            return false;
        }
        const targetConfig = this.configHistory[this.configHistory.length - steps - 1];
        const validation = targetConfig
            ? this.validator.validate(targetConfig)
            : { valid: false, errors: ['Invalid target config'] };
        if (!validation.valid) {
            logger.error('Cannot rollback to invalid configuration');
            return false;
        }
        this.config = JSON.parse(JSON.stringify(targetConfig));
        this.emit('config:rollback', { config: this.config, steps });
        return true;
    }
    /**
     * Export current configuration.
     *
     * @param format
     */
    export(format = 'json') {
        if (format === 'json') {
            return JSON.stringify(this.config, null, 2);
        }
        // Basic YAML export (would need yaml library for full support)
        return this.toSimpleYaml(this.config);
    }
    /**
     * Get configuration sources info.
     */
    getSourcesInfo() {
        return this.loader.getSources();
    }
    /**
     * Cleanup resources.
     */
    destroy() {
        // Clear file watchers
        this.watchers.forEach((watcher) => watcher.close());
        this.watchers = [];
        // Clear history
        this.configHistory = [];
        // Remove event listeners
        this.removeAllListeners();
        // Clear singleton
        ConfigurationManager.instance = null;
    }
    /**
     * Setup file watchers for hot-reloading.
     */
    setupFileWatchers() {
        // Clear existing watchers
        this.watchers.forEach((watcher) => watcher.close());
        this.watchers = [];
        const configFiles = [
            './config/claude-zen.json',
            './claude-zen.config.json',
            ...this.configPaths,
        ];
        for (const configFile of configFiles) {
            try {
                const resolvedPath = path.resolve(configFile);
                if (fs.existsSync(resolvedPath)) {
                    const watcher = fs.watch(resolvedPath, (eventType) => {
                        if (eventType === 'change') {
                            // Debounce reloads
                            setTimeout(() => {
                                this.reload().catch((error) => {
                                    logger.error('Failed to reload configuration:', error);
                                });
                            }, 1000);
                        }
                    });
                    this.watchers.push(watcher);
                }
            }
            catch (error) {
                logger.warn(`Failed to watch config file ${configFile}:`, error);
            }
        }
    }
    /**
     * Setup error handling.
     */
    setupErrorHandling() {
        this.on('error', (error) => {
            logger.error('Configuration manager error:', error);
        });
        // Handle process signals for cleanup
        process.on('SIGINT', () => this.destroy());
        process.on('SIGTERM', () => this.destroy());
    }
    /**
     * Add configuration to history.
     *
     * @param config
     */
    addToHistory(config) {
        this.configHistory.push(JSON.parse(JSON.stringify(config)));
        // Trim history to max size
        if (this.configHistory.length > this.maxHistorySize) {
            this.configHistory = this.configHistory.slice(-this.maxHistorySize);
        }
    }
    /**
     * Set nested value using dot notation.
     *
     * @param obj
     * @param path
     * @param value
     */
    setNestedValue(obj, path, value) {
        const parts = path.split('.');
        let current = obj;
        for (let i = 0; i < parts.length - 1; i++) {
            const part = parts[i];
            if (part &&
                (!(part in current) ||
                    typeof current?.[part] !== 'object')) {
                current[part] = {};
            }
            if (part) {
                current = current?.[part];
            }
        }
        const lastPart = parts[parts.length - 1];
        if (lastPart) {
            current[lastPart] = value;
        }
    }
    /**
     * Simple YAML export (basic implementation).
     *
     * @param obj - Object to convert to YAML format
     * @param indent - Indentation level for nested objects
     * @returns YAML string representation of the object
     */
    toSimpleYaml(obj, indent = 0) {
        const spaces = '  '.repeat(indent);
        let yaml = '';
        for (const [key, value] of Object.entries(obj)) {
            if (typeof value === 'object' &&
                value !== null &&
                !Array.isArray(value)) {
                yaml += `${spaces}${key}:\n${this.toSimpleYaml(value, indent + 1)}`;
            }
            else if (Array.isArray(value)) {
                yaml += `${spaces}${key}:\n`;
                for (const item of value) {
                    yaml += `${spaces}  - ${item}\n`;
                }
            }
            else {
                yaml += `${spaces}${key}: ${JSON.stringify(value)}\n`;
            }
        }
        return yaml;
    }
}
// Export singleton instance
export const configManager = ConfigurationManager.getInstance();
//# sourceMappingURL=manager.js.map