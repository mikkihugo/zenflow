/**
 * @fileoverview Minimal Foundation Configuration System
 *
 * Contains ONLY the 5 core foundation systems configuration:
 * - Logging configuration
 * - Basic development settings
 * - Environment detection
 * - Core system settings
 *
 * All other configurations (storage, neural, telemetry, etc.) belong in
 * their respective implementation packages.
 */
import type { JsonObject } from "../../types/primitives";
/**
 * Foundation configuration interface defining all core system settings.
 * Provides type-safe access to validated configuration values.
 *
 * @interface Config
 *
 * @example
 * ```typescript`
 * const config:Config = getConfig();
 * logger.info(config.env); // 'development' | ' production' | ' test') * logger.info(config.logging.level); // 'error' | ' warn' | ' info' | ' debug') * ```
 */
export interface Config {
    env: string;
    logging: {
        level: string;
        format: string;
        console: boolean;
        file: string;
        timestamp: boolean;
    };
    system: {
        hostname: string;
        instanceId: string;
    };
    development: {
        debug: boolean;
        inNixShell: boolean;
        flakeDevShell: boolean;
    };
    project: {
        configDir: string;
        storeInUserHome: boolean;
    };
    otel: {
        enabled: boolean;
        useInternalCollector: boolean;
        internalCollectorEndpoint: string;
    };
}
/**
 * Foundation configuration management class.
 * Handles initialization, validation, and access to configuration values.
 *
 * @class FoundationConfig
 *
 * @example
 * ```typescript`
 * const config = new FoundationConfig();
 * config.initialize();
 * const logLevel = config.get('logging.level');
 * ```
 */
export declare class FoundationConfig {
    private config;
    private isInitialized;
    constructor();
    /**
     * Initializes the configuration by parsing and validating environment variables.
     * Must be called before using any configuration values.
     *
     * @throws {Error} When configuration validation fails
     */
    initialize(): void;
    /**
     * Gets a configuration value by key path.
     * Supports nested key access using dot notation.
     *
     * @param key - The configuration key path (e.g., 'logging.level')
     * @returns The configuration value
     * @throws {Error} When the key is not found or configuration is not initialized
     *
     * @example
     * ```typescript`
     * const level = config.get('logging.level'); // Gets nested value
     * const env = config.get('env'); // Gets top-level value
     * ```
     */
    get(key: string): unknown;
    /**
     * Gets the complete configuration object.
     *
     * @returns The complete validated configuration
     * @throws {Error} When configuration is not initialized
     */
    getAll(): JsonObject;
    /**
     * Validates the current environment variables against the schema.
     *
     * @returns True if validation passes, false otherwise
     */
    validate(): boolean;
    private ensureInitialized;
}
declare const globalConfig: FoundationConfig;
/**
 * Gets the global configuration instance.
 * Auto-initializes on first access with environment variables.
 *
 * @returns The validated foundation configuration
 *
 * @example
 * ```typescript`
 * const config = getConfig();
 * logger.info(config.logging.level);
 * ```
 */
export declare function getConfig(): Config;
/**
 * Validates the current configuration against the schema.
 *
 * @returns True if configuration is valid, false otherwise
 */
export declare function validateConfig(): boolean;
/**
 * Reloads configuration from environment variables.
 * Useful when environment changes during runtime.
 */
export declare function reloadConfig(): void;
/**
 * Checks if debug mode is enabled.
 *
 * @returns True if debug mode is active
 */
export declare function isDebugMode(): boolean;
export declare const config: typeof getConfig;
export declare const env: typeof getConfig;
export declare const settings: typeof getConfig;
export declare const validate: typeof validateConfig;
export declare const reload: typeof reloadConfig;
export declare const isDebug: typeof isDebugMode;
export declare const isDevelopment: () => boolean;
export declare const isProduction: () => boolean;
export declare const isTest: () => boolean;
export declare const getEnv: (key: string, defaultValue?: string) => string;
export declare const requireEnv: (key: string) => string;
export declare const shouldLog: (level: "error" | "warn" | "info" | "debug") => boolean;
export declare const configHelpers: {
    get: (key: string) => unknown;
    getAll: () => JsonObject;
    validate: typeof validateConfig;
    reload: typeof reloadConfig;
    isDebug: typeof isDebugMode;
    config: typeof getConfig;
    env: typeof getConfig;
    settings: typeof getConfig;
    isDevelopment: () => boolean;
    isProduction: () => boolean;
    isTest: () => boolean;
    getEnv: (key: string, defaultValue?: string) => string;
    requireEnv: (key: string) => string;
    shouldLog: (level: "error" | "warn" | "info" | "debug") => boolean;
};
/**
 * Placeholder for neural config - should be implemented in neural packages
 */
export declare function getNeuralConfig(): Record<string, unknown>;
export default globalConfig;
//# sourceMappingURL=config.service.d.ts.map