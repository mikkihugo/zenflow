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
 * Logs incoming requests and sets up metadata.
 *
 * @param req
 * @param res
 * @param next
 */
export declare const requestLogger: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Error Logging Function.
 * Logs errors with full context.
 *
 * @param error
 * @param req
 * @param additionalContext
 */
export declare const logError: (error: Error, req: Request, additionalContext?: Record<string, unknown>) => void;
/**
 * Performance Logging Function.
 * Logs performance metrics for critical operations.
 *
 * @param operation
 * @param duration
 * @param req
 * @param metadata
 */
export declare const logPerformance: (operation: string, duration: number, req: Request, metadata?: Record<string, unknown>) => void;
/**
 * Custom Log Function.
 * Allows custom structured logging throughout the application.
 *
 * @param level
 * @param message
 * @param req
 * @param metadata
 */
export declare const log: (level: LogLevel, message: string, req?: Request, metadata?: Record<string, unknown>) => void;
declare global {
    namespace Express {
        interface Request {
            metadata?: RequestMetadata;
        }
    }
}
export {};
//# sourceMappingURL=logging.d.ts.map