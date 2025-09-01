/**
 * Simple Logger Implementation
 *
 * Provides logging functionality when @claude-zen/foundation is not available.
 * Falls back to console logging with structured format.
 */
interface LogContext {
 [key: string]: unknown;
}
interface Logger {
 debug(message: string, context?: LogContext): void;
 info(message: string, context?: LogContext): void;
 warn(message: string, context?: LogContext): void;
 error(message: string, context?: LogContext): void;
}
/**
 * Get a logger instance for the specified component
 */
export declare function getLogger(component: string): Logger;
export {};
//# sourceMappingURL=logger.d.ts.map