/**
 * @file Bootstrap Logger - Logtape Integration.
 *
 * Simple logger that works without config dependencies by using logtape directly.
 * Used for early initialization before full config system is ready.
 *
 * This BREAKS the circular dependency: logger ↔ config.
 */
export declare enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3
}
export type Logger = {
    debug: (message: string, meta?: unknown) => void;
    info: (message: string, meta?: unknown) => void;
    warn: (message: string, meta?: unknown) => void;
    error: (message: string, meta?: unknown) => void;
};
export interface Logger {
    debug(message: string, meta?: unknown): void;
    info(message: string, meta?: unknown): void;
    warn(message: string, meta?: unknown): void;
    error(message: string, meta?: unknown): void;
}
/**
 * Bootstrap logger that works without config system - uses logtape directly.
 *
 * @example
 */
export declare class BootstrapLogger implements Logger {
    private logger;
    private prefix;
    constructor(prefix?: string, level?: LogLevel);
    debug(message: string, meta?: unknown): void;
    info(message: string, meta?: unknown): void;
    warn(message: string, meta?: unknown): void;
    error(message: string, meta?: unknown): void;
}
/**
 * Factory function for creating bootstrap loggers.
 *
 * @param prefix
 * @example
 */
export declare function createBootstrapLogger(prefix: string): Logger;
/**
 * Global bootstrap logger for system initialization.
 */
export declare const systemLogger: Logger;
//# sourceMappingURL=bootstrap-logger.d.ts.map