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
export interface ILogger {
    debug(message: string, meta?: any): void;
    info(message: string, meta?: any): void;
    warn(message: string, meta?: any): void;
    error(message: string, meta?: any): void;
}
/**
 * Bootstrap logger that works without config system - uses logtape directly.
 *
 * @example
 */
export declare class BootstrapLogger implements ILogger {
    private logger;
    private prefix;
    constructor(prefix?: string, level?: LogLevel);
    debug(message: string, meta?: any): void;
    info(message: string, meta?: any): void;
    warn(message: string, meta?: any): void;
    error(message: string, meta?: any): void;
}
/**
 * Factory function for creating bootstrap loggers.
 *
 * @param prefix
 * @example
 */
export declare function createBootstrapLogger(prefix: string): ILogger;
/**
 * Global bootstrap logger for system initialization.
 */
export declare const systemLogger: ILogger;
//# sourceMappingURL=bootstrap-logger.d.ts.map