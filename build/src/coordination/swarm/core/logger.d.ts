/**
 * @file Coordination system: logger.
 */
interface LoggerOptions {
    name?: string;
    level?: string;
    enableStderr?: boolean;
    enableFile?: boolean;
    formatJson?: boolean;
    logDir?: string;
    metadata?: Record<string, any>;
}
export declare class Logger {
    name: string;
    level: string;
    enableStderr: boolean;
    enableFile: boolean;
    formatJson: boolean;
    logDir: string;
    metadata: Record<string, any>;
    correlationId: string | null;
    operations: Map<string, any>;
    constructor(options?: LoggerOptions);
    setCorrelationId(id: string): string;
    getCorrelationId(): string | null;
    _log(level: string, message: string, data?: Record<string, any>): void;
    info(message: string, data?: Record<string, any>): void;
    warn(message: string, data?: Record<string, any>): void;
    error(message: string, data?: Record<string, any>): void;
    debug(message: string, data?: Record<string, any>): void;
    trace(message: string, data?: Record<string, any>): void;
    success(message: string, data?: Record<string, any>): void;
    fatal(message: string, data?: Record<string, any>): void;
    startOperation(operationName: string): string;
    endOperation(operationId: string, success?: boolean, data?: Record<string, any>): void;
    logConnection(event: string, sessionId: string, data?: Record<string, any>): void;
    logMcp(direction: string, method: string, data?: Record<string, any>): void;
    logMemoryUsage(context: string): void;
    getConnectionMetrics(): {
        correlationId: string | null;
        activeOperations: number;
        uptime: number;
    };
    static info(message: any, ...args: any[]): void;
    static warn(message: any, ...args: any[]): void;
    static error(message: any, ...args: any[]): void;
    static debug(message: any, ...args: any[]): void;
    static success(message: any, ...args: any[]): void;
    static trace(message: any, ...args: any[]): void;
}
export default Logger;
//# sourceMappingURL=logger.d.ts.map