/**
 * Logging Configuration for ruv-swarm.
 * Provides centralized logging configuration and utilities.
 */
/**
 * @file Coordination system: logging-config.
 */
import { Logger } from './logger.ts';
/**
 * Logging configuration manager.
 *
 * @example
 */
export declare class LoggingConfig {
    private loggers;
    private globalLevel;
    private componentLevels;
    constructor();
    /**
     * Load log levels from environment variables.
     */
    private loadFromEnvironment;
    /**
     * Get or create a logger for a component.
     *
     * @param component
     * @param options
     * @param options.enableStderr
     * @param options.enableFile
     * @param options.formatJson
     * @param options.logDir
     */
    getLogger(component: string, options?: {
        enableStderr?: boolean;
        enableFile?: boolean;
        formatJson?: boolean;
        logDir?: string;
        [key: string]: any;
    }): Logger;
    /**
     * Set log level for a component.
     *
     * @param component
     * @param level
     */
    setLogLevel(component: string, level: string): void;
    /**
     * Set global log level.
     *
     * @param level
     */
    setGlobalLogLevel(level: string): void;
    /**
     * Get current log levels.
     */
    getLogLevels(): {
        global: string | null;
        components: Record<string, string>;
    };
    /**
     * Create child logger with correlation ID.
     *
     * @param parentLogger
     * @param module
     * @param correlationId
     */
    createChildLogger(parentLogger: any, module: string, correlationId?: string | null): any;
    /**
     * Log system configuration.
     */
    logConfiguration(): any;
}
export declare const loggingConfig: LoggingConfig;
export declare const getLogger: (component: string, options?: any) => Logger;
export declare const setLogLevel: (component: string, level: string) => void;
export declare const setGlobalLogLevel: (level: string) => void;
export declare const mcpLogger: Logger;
export declare const toolsLogger: Logger;
export declare const swarmLogger: Logger;
export declare const agentLogger: Logger;
export declare const neuralLogger: Logger;
export declare const wasmLogger: Logger;
export declare const dbLogger: Logger;
export declare const hooksLogger: Logger;
export declare const perfLogger: Logger;
export declare const memoryLogger: Logger;
export default loggingConfig;
//# sourceMappingURL=logging-config.d.ts.map