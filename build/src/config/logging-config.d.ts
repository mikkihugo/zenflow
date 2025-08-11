/**
 * @file Centralized Logging Configuration
 * Provides unified logging configuration and factory methods for the entire application.
 */
import type { ILogger } from '../core/bootstrap-logger.ts';
export declare enum LoggingLevel {
    DEBUG = "debug",
    INFO = "info",
    WARN = "warn",
    ERROR = "error"
}
export interface LoggingConfig {
    level: LoggingLevel;
    enableConsole: boolean;
    enableFile: boolean;
    timestamp: boolean;
    format: 'json' | 'text';
    components: Record<string, LoggingLevel>;
}
export interface Logger extends ILogger {
    success?(message: string, meta?: any): void;
    progress?(message: string, meta?: any): void;
}
declare class LoggingConfigurationManager {
    private static instance;
    private config;
    private loggers;
    private constructor();
    static getInstance(): LoggingConfigurationManager;
    private loadConfiguration;
    /**
     * Get logging configuration.
     */
    getConfig(): LoggingConfig;
    /**
     * Update logging configuration.
     *
     * @param updates
     */
    updateConfig(updates: Partial<LoggingConfig>): void;
    /**
     * Create or get cached logger for a component.
     *
     * @param component
     */
    getLogger(component: string): Logger;
    private createLoggerForComponent;
    /**
     * Create logger specifically for console.log replacement
     * This creates a logger optimized for CLI output and user-facing messages.
     *
     * @param component
     */
    createConsoleReplacementLogger(component: string): Logger;
    /**
     * Enable debug logging for development.
     */
    enableDebugMode(): void;
    /**
     * Set production logging (INFO and above).
     */
    setProductionMode(): void;
    /**
     * Silence all logging except errors.
     */
    setSilentMode(): void;
}
export declare const loggingConfigManager: LoggingConfigurationManager;
/**
 * Convenience function to get a logger for a component.
 *
 * @param component
 * @example
 */
export declare function getLogger(component: string): Logger;
/**
 * Convenience function for console.log replacement.
 *
 * @param component
 * @example
 */
export declare function getConsoleReplacementLogger(component: string): Logger;
/**
 * Convenience functions for common logging needs.
 */
export declare const logger: {
    system: Logger;
    cli: Logger;
    swarm: Logger;
    neural: Logger;
    mcp: Logger;
    database: Logger;
};
export default loggingConfigManager;
//# sourceMappingURL=logging-config.d.ts.map