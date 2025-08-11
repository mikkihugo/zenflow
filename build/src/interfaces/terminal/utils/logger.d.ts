/**
 * @file Interface implementation: logger.
 */
/**
 * Simple Logger for Terminal Interface.
 *
 * Standalone logger to avoid circular dependencies.
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
export interface SimpleLogger {
    debug(message: string, ...args: any[]): void;
    info(message: string, ...args: any[]): void;
    warn(message: string, ...args: any[]): void;
    error(message: string, ...args: any[]): void;
}
export declare const createSimpleLogger: (component?: string) => SimpleLogger;
export declare const logger: SimpleLogger;
export default createSimpleLogger;
//# sourceMappingURL=logger.d.ts.map