/**
 * @file Configuration Loader.
 *
 * Handles loading configuration from multiple sources with proper priority.
 */
import type { ConfigurationSource, ConfigValidationResult, SystemConfiguration } from './types.ts';
/**
 * Configuration loader with multi-source support.
 *
 * @example
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