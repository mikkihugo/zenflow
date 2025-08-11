/**
 * @file Coordination system: logging-config.
 */
/**
 * Logging Configuration for Diagnostics System.
 * Provides centralized logging configuration specifically for diagnostics.
 */
export interface LoggerInterface {
    info(message: string, meta?: any): void;
    warn(message: string, meta?: any): void;
    error(message: string, meta?: any): void;
    debug(message: string, meta?: any): void;
}
export interface LogConfiguration {
    logLevel: string;
    enableConsole: boolean;
    enableFile: boolean;
    timestamp: boolean;
    component: string;
}
/**
 * Logging configuration manager for diagnostics.
 *
 * @example
 */
export declare class DiagnosticsLoggingConfig {
    private loggers;
    /**
     * Get or create a logger for a component.
     *
     * @param component
     * @param options
     * @param options.level
     */
    getLogger(component: string, options: {
        level: string;
    }): LoggerInterface;
    /**
     * Get logging configuration.
     */
    logConfiguration(): LogConfiguration;
}
export declare const loggingConfig: DiagnosticsLoggingConfig;
export default loggingConfig;
//# sourceMappingURL=logging-config.d.ts.map