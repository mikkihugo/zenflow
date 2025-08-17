/**
 * @fileoverview Configuration Loader - Multi-source configuration loading with priority management
 *
 * This module provides comprehensive configuration loading capabilities from multiple sources
 * with proper priority handling and merging. Supports loading from files, environment variables,
 * CLI arguments, and default configurations with intelligent parsing and validation.
 *
 * **Key Features:**
 * - **Multi-Source Loading**: Files, environment variables, CLI arguments, and defaults
 * - **Priority Management**: Higher priority sources override lower priority sources
 * - **Format Support**: JSON, JavaScript, and TypeScript configuration files
 * - **Environment Variable Mapping**: Automatic parsing and mapping from environment variables
 * - **CLI Argument Support**: Dynamic configuration via command-line arguments
 * - **Deep Merging**: Intelligent deep merging of nested configuration objects
 * - **Type Parsing**: Automatic type conversion (strings, numbers, booleans, arrays)
 * - **Validation Integration**: Built-in configuration validation with detailed results
 *
 * **Source Priority (highest to lowest):**
 * 1. CLI arguments (--config.path.to.value)
 * 2. Environment variables (with ENV_MAPPINGS)
 * 3. Configuration files (JSON/JS/TS)
 * 4. Default configuration
 *
 * **Configuration File Search Paths:**
 * - ./config/claude-zen.json
 * - ./claude-zen.config.json
 * - ~/.claude-zen/config.json
 * - /etc/claude-zen/config.json
 *
 * @example Basic Configuration Loading
 * ```typescript
 * import { ConfigurationLoader } from './loader';
 *
 * const loader = new ConfigurationLoader();
 * const result = await loader.loadConfiguration();
 *
 * if (result.validation.valid) {
 *   console.log('Configuration loaded successfully');
 *   console.log('Port:', result.config.core.port);
 * } else {
 *   console.error('Configuration validation failed:', result.validation.errors);
 * }
 * ```
 *
 * @example Custom Configuration Paths
 * ```typescript
 * const loader = new ConfigurationLoader();
 * const result = await loader.loadConfiguration([
 *   './config/production.json',
 *   './config/local-overrides.json'
 * ]);
 *
 * // Access merged configuration
 * const dbUrl = result.config.database.url;
 * const enableDebug = result.config.core.debug;
 * ```
 *
 * @example Environment Variable Configuration
 * ```bash
 * # Set environment variables
 * export WEB_PORT=3000
 * export ZEN_LOG_LEVEL=debug
 * export ZEN_ENABLE_METRICS=true
 *
 * # These will be automatically mapped to configuration paths
 * # based on ENV_MAPPINGS definitions
 * ```
 *
 * @example CLI Argument Configuration
 * ```bash
 * # Override configuration via CLI arguments
 * node app.js --config.core.port 8080 --config.core.debug true
 * node app.js --config.database.host localhost --config.database.port 5432
 * ```
 *
 * @example Advanced Usage with Custom Validation
 * ```typescript
 * const loader = new ConfigurationLoader();
 * const result = await loader.loadConfiguration();
 *
 * // Inspect configuration sources for debugging
 * const sources = loader.getSources();
 * console.log('Configuration loaded from:', sources.map(s => s.type));
 *
 * // Handle validation results
 * if (!result.validation.valid) {
 *   result.validation.errors.forEach(error => {
 *     console.error(`Validation error: ${error}`);
 *   });
 * }
 * ```
 *
 * @author Claude Code Zen Team
 * @since 1.0.0-alpha.43
 * @version 2.1.0
 *
 * @see {@link ConfigurationSource} Configuration source interface
 * @see {@link SystemConfiguration} System configuration interface
 * @see {@link ConfigValidator} Configuration validation system
 * @see {@link ENV_MAPPINGS} Environment variable mappings
 */
import type { ConfigurationSource, ConfigValidationResult, SystemConfiguration } from '../types/config-types';
/**
 * Configuration loader with multi-source support and priority management.
 *
 * Provides comprehensive configuration loading from multiple sources with intelligent
 * merging, type parsing, and validation. Supports files, environment variables,
 * CLI arguments, and default configurations with proper priority handling.
 *
 * @example Basic Usage
 * ```typescript
 * const loader = new ConfigurationLoader();
 * const { config, validation } = await loader.loadConfiguration();
 *
 * if (validation.valid) {
 *   console.log('Configuration loaded:', config.core.port);
 * }
 * ```
 *
 * @example Custom Paths
 * ```typescript
 * const loader = new ConfigurationLoader();
 * const result = await loader.loadConfiguration([
 *   './config/prod.json',
 *   './config/overrides.json'
 * ]);
 * ```
 */
export declare class ConfigurationLoader {
    private sources;
    private validator;
    /**
     * Load configuration from all sources.
     *
     * @param configPaths
     */
    loadConfiguration(configPaths?: string[]): Promise<{
        config: SystemConfiguration;
        validation: ConfigValidationResult;
    }>;
    /**
     * Add a configuration source.
     *
     * @param source
     */
    private addSource;
    /**
     * Load configuration from file.
     *
     * @param filePath
     */
    private loadFromFile;
    /**
     * Load configuration from environment variables.
     */
    private loadFromEnvironment;
    /**
     * Load configuration from CLI arguments.
     */
    private loadFromCliArgs;
    /**
     * Merge all configuration sources by priority.
     */
    private mergeSources;
    /**
     * Deep merge two objects.
     *
     * @param target
     * @param source
     */
    private deepMerge;
    /**
     * Set nested property using dot notation.
     *
     * @param obj
     * @param path
     * @param value
     */
    private setNestedProperty;
    /**
     * Get configuration sources for debugging.
     */
    getSources(): ConfigurationSource[];
}
//# sourceMappingURL=loader.d.ts.map