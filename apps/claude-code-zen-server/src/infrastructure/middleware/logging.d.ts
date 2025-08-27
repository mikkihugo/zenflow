/**
 * Request Logging Middleware.
 *
 * Comprehensive request/response logging following Google standards.
 * Provides structured logging with performance metrics and tracing.
 *
 * @file Express logging middleware with performance monitoring.
 */
import type { NextFunction, Request, Response } from 'express';
/**
 * Log levels following Google Cloud Logging standards.
 */
export declare enum LogLevel {
    DEBUG = "DEBUG",
    INFO = "INFO",
    NOTICE = "NOTICE",
    WARNING = "WARNING",
    ERROR = "ERROR",
    CRITICAL = "CRITICAL",
    ALERT = "ALERT",
    EMERGENCY = "EMERGENCY"
}
/**
 * Structured log entry format.
 * Following Google Cloud Logging JSON format.
 *
 * @example
 * ```typescript
 * const logEntry: LogEntry = {
 *   timestamp: '2023-01-01T00:00:00.000Z',
 *   level: LogLevel.INFO,
 *   message: 'Request processed',
 *   httpRequest: {
 *     requestMethod: 'GET',
 *     requestUrl: '/api/users',
 *     status: 200,
 *     latency: '123ms'
 *   }
 * };
 * ```
 */
export interface LogEntry {
    readonly timestamp: string;
    readonly level: LogLevel;
    readonly message: string;
    readonly httpRequest?: {
        readonly requestMethod: string;
        readonly requestUrl: string;
        readonly requestSize?: number;
        readonly status?: number;
        readonly responseSize?: number;
        readonly userAgent?: string;
        readonly remoteIp?: string;
        readonly referer?: string;
        readonly latency?: string;
        readonly protocol?: string;
    };
    readonly trace?: string;
    readonly spanId?: string;
    readonly operation?: {
        readonly id: string;
        readonly producer: string;
        readonly first?: boolean;
        readonly last?: boolean;
    };
    readonly metadata?: Record<string, unknown>;
}
/**
 * Request metadata for logging context.
 *
 * @example
 * ```typescript
 * const metadata: RequestMetadata = {
 *   requestId: 'req-123456',
 *   startTime: Date.now(),
 *   userAgent: 'Mozilla/5.0...',
 *   remoteIp: '127.0.0.1',
 *   referer: 'https://example.com'
 * };
 * ```
 */
interface RequestMetadata {
    readonly requestId: string;
    readonly startTime: number;
    readonly userAgent?: string;
    readonly remoteIp?: string;
    readonly referer?: string;
}
/**
 * Request Start Logging Middleware.
 * Logs incoming requests and sets up metadata for response logging.
 *
 * @param req Express request object
 * @param res Express response object
 * @param next Next middleware function
 */
export declare const requestLogger: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Error Logging Function.
 * Logs errors with full context and request metadata.
 *
 * @param error Error object to log
 * @param req Express request object
 * @param additionalContext Additional context to include in log
 */
export declare const logError: (error: Error, req: Request, additionalContext?: Record<string, unknown>) => void;
/**
 * Performance Logging Function.
 * Logs performance metrics for critical operations.
 *
 * @param operation Operation name being logged
 * @param duration Operation duration in milliseconds
 * @param req Express request object
 * @param metadata Additional performance metadata
 */
export declare const logPerformance: (operation: string, duration: number, req: Request, metadata?: Record<string, unknown>) => void;
/**
 * Custom Log Function.
 * Allows custom structured logging throughout the application.
 *
 * @param level Log level
 * @param message Log message
 * @param req Express request object (optional)
 * @param metadata Additional metadata to include
 */
export declare const log: (level: LogLevel, message: string, req?: Request, metadata?: Record<string, unknown>) => void;
/**
 * Parameters for database operation logging.
 */
interface DatabaseOperationParams {
    operation: string;
    table: string;
    duration: number;
    rowCount: number;
    req: Request;
    metadata?: Record<string, unknown>;
}
/**
 * Database Operation Logging Function.
 * Specialized logging for database operations with query metrics.
 */
export declare const logDatabaseOperation: ({ operation, table, duration, rowCount, req, metadata, }: DatabaseOperationParams) => void;
/**
 * Parameters for external service logging.
 */
interface ExternalServiceParams {
    service: string;
    operation: string;
    duration: number;
    statusCode: number;
    req: Request;
    metadata?: Record<string, unknown>;
}
/**
 * External Service Logging Function.
 * Specialized logging for external service calls with response metrics.
 */
export declare const logExternalService: ({ service, operation, duration, statusCode, req, metadata, }: ExternalServiceParams) => void;
declare global {
    namespace Express {
        interface Request {
            metadata?: RequestMetadata;
        }
    }
}
declare const _default: {
    logLevel: typeof LogLevel;
    requestLogger: (req: Request, res: Response, next: NextFunction) => void;
    logError: (error: Error, req: Request, additionalContext?: Record<string, unknown>) => void;
    logPerformance: (operation: string, duration: number, req: Request, metadata?: Record<string, unknown>) => void;
    log: (level: LogLevel, message: string, req?: Request, metadata?: Record<string, unknown>) => void;
    logDatabaseOperation: ({ operation, table, duration, rowCount, req, metadata, }: DatabaseOperationParams) => void;
    logExternalService: ({ service, operation, duration, statusCode, req, metadata, }: ExternalServiceParams) => void;
};
export default _default;
//# sourceMappingURL=logging.d.ts.map