/**
 * @file Utility logger implementation
 * Provides simple logging functionality for the application.
 */
export interface ILogger {
    debug(message: string, meta?: any): void;
    info(message: string, meta?: any): void;
    warn(message: string, meta?: any): void;
    error(message: string, meta?: any): void;
}
export declare function createUtilsLogger(prefix?: string): ILogger;
export declare const defaultLogger: ILogger;
//# sourceMappingURL=logger.d.ts.map