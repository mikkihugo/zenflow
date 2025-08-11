/**
 * Error Handling Middleware.
 *
 * Standardized error handling following Google API Design Guide.
 * Provides consistent error responses across all API endpoints.
 *
 * @file Express error handling middleware.
 */
import type { ErrorRequestHandler, NextFunction, Request, Response } from 'express';
/**
 * Standard API Error Response Structure.
 * Following Google API Design Guide error format.
 *
 * @example
 */
export interface APIErrorResponse {
    readonly error: {
        readonly code: string;
        readonly message: string;
        readonly details?: Record<string, unknown>;
        readonly timestamp: string;
        readonly path: string;
        readonly method: string;
        readonly traceId?: string;
    };
}
/**
 * Error codes mapping HTTP status to error types.
 * Following Google API Design Guide standards.
 */
export declare const ErrorCodes: {
    readonly BAD_REQUEST: "INVALID_REQUEST";
    readonly UNAUTHORIZED: "AUTHENTICATION_REQUIRED";
    readonly FORBIDDEN: "PERMISSION_DENIED";
    readonly NOT_FOUND: "RESOURCE_NOT_FOUND";
    readonly METHOD_NOT_ALLOWED: "METHOD_NOT_SUPPORTED";
    readonly CONFLICT: "RESOURCE_CONFLICT";
    readonly UNPROCESSABLE_ENTITY: "VALIDATION_FAILED";
    readonly TOO_MANY_REQUESTS: "RATE_LIMIT_EXCEEDED";
    readonly INTERNAL_SERVER_ERROR: "INTERNAL_ERROR";
    readonly NOT_IMPLEMENTED: "FEATURE_NOT_IMPLEMENTED";
    readonly BAD_GATEWAY: "UPSTREAM_ERROR";
    readonly SERVICE_UNAVAILABLE: "SERVICE_UNAVAILABLE";
    readonly GATEWAY_TIMEOUT: "TIMEOUT_ERROR";
};
/**
 * Custom API Error Class.
 * Extends Error with additional metadata for API responses.
 *
 * @example
 */
export declare class APIError extends Error {
    readonly statusCode: number;
    readonly code: string;
    readonly details?: Record<string, unknown>;
    readonly traceId?: string;
    constructor(statusCode: number, code: string, message: string, details?: Record<string, unknown>, traceId?: string);
}
/**
 * Main Error Handler Middleware.
 * Catches all errors and formats them according to Google API standards.
 *
 * @param error
 * @param req
 * @param res
 * @param _next
 */
export declare const errorHandler: ErrorRequestHandler;
/**
 * Not Found Handler.
 * Handles 404 errors for unmatched routes.
 *
 * @param req
 * @param res
 */
export declare const notFoundHandler: (req: Request, res: Response) => void;
/**
 * Async Error Handler Wrapper.
 * Wraps async route handlers to catch errors automatically.
 *
 * @param fn
 */
export declare const asyncHandler: (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => (req: Request, res: Response, next: NextFunction) => void;
/**
 * Validation Error Creator.
 * Helper to create validation errors with detailed information.
 *
 * @param field
 * @param value
 * @param message
 * @param traceId
 */
export declare const createValidationError: (field: string, value: unknown, message: string, traceId?: string) => APIError;
/**
 * Not Found Error Creator.
 * Helper to create consistent 404 errors.
 *
 * @param resource
 * @param identifier
 * @param traceId
 */
export declare const createNotFoundError: (resource: string, identifier: string, traceId?: string) => APIError;
/**
 * Conflict Error Creator.
 * Helper to create resource conflict errors.
 *
 * @param resource
 * @param reason
 * @param traceId
 */
export declare const createConflictError: (resource: string, reason: string, traceId?: string) => APIError;
/**
 * Rate Limit Error Creator.
 * Helper to create rate limiting errors.
 *
 * @param limit
 * @param windowMs
 * @param traceId
 */
export declare const createRateLimitError: (limit: number, windowMs: number, traceId?: string) => APIError;
/**
 * Internal Error Creator.
 * Helper to create internal server errors with optional details.
 *
 * @param message
 * @param details
 * @param traceId
 */
export declare const createInternalError: (message: string, details?: Record<string, unknown>, traceId?: string) => APIError;
//# sourceMappingURL=errors.d.ts.map