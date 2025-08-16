/**
 * @fileoverview Centralized Logging Configuration for claude-code-zen
 *
 * Central logging foundation for the entire ecosystem. All libs and main system
 * use this shared logging configuration with ZEN_ environment variables.
 */
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
export interface Logger {
    debug(message: string, meta?: unknown): void;
    info(message: string, meta?: unknown): void;
    warn(message: string, meta?: unknown): void;
    error(message: string, meta?: unknown): void;
    success?(message: string, meta?: unknown): void;
    progress?(message: string, meta?: unknown): void;
}
/**
 * Get a logger instance for the specified component
 *
 * @param name Component name for the logger
 * @returns Logger instance configured with component-specific settings
 */
export declare function getLogger(name: string): Logger;
/**
 * Update global logging configuration
 *
 * @param config Partial configuration to update
 */
export declare function updateLoggingConfig(config: Partial<LoggingConfig>): void;
/**
 * Get current logging configuration
 *
 * @returns Current logging configuration
 */
export declare function getLoggingConfig(): LoggingConfig;
/**
 * Validate ZEN environment variables and logging setup
 *
 * @returns Validation result with issues and current config
 */
export declare function validateLoggingEnvironment(): {
    isValid: boolean;
    issues: string[];
    config: LoggingConfig;
};
declare const _default: {
    getLogger: typeof getLogger;
    updateLoggingConfig: typeof updateLoggingConfig;
    getLoggingConfig: typeof getLoggingConfig;
    validateLoggingEnvironment: typeof validateLoggingEnvironment;
    LoggingLevel: typeof LoggingLevel;
};
export default _default;
//# sourceMappingURL=logging.d.ts.map