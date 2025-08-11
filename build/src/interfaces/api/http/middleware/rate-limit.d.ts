/**
 * Rate Limiting Middleware for Database Operations.
 *
 * Implements intelligent rate limiting with different limits for different operation types.
 * Database operations are resource-intensive and require careful throttling.
 *
 * @file Database-specific rate limiting middleware.
 */
import type { NextFunction, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import type { AuthContext } from './auth.ts';
/**
 * Rate limit configuration for different operation types.
 *
 * @example
 */
export interface RateLimitConfig {
    /** Window size in milliseconds */
    readonly windowMs: number;
    /** Maximum requests per window */
    readonly max: number;
    /** Skip successful requests in count */
    readonly skipSuccessfulRequests?: boolean;
    /** Skip failed requests in count */
    readonly skipFailedRequests?: boolean;
    /** Custom message for rate limit exceeded */
    readonly message?: string;
    /** Custom status code for rate limit exceeded */
    readonly statusCode?: number;
}
/**
 * Default rate limiting configurations for different database operations.
 */
export declare const DATABASE_RATE_LIMITS: {
    readonly light: {
        readonly windowMs: number;
        readonly max: 100;
        readonly skipSuccessfulRequests: false;
        readonly message: "Too many database status requests. Please try again later.";
        readonly statusCode: 429;
    };
    readonly medium: {
        readonly windowMs: number;
        readonly max: 50;
        readonly skipSuccessfulRequests: false;
        readonly message: "Too many database operations. Please try again later.";
        readonly statusCode: 429;
    };
    readonly heavy: {
        readonly windowMs: number;
        readonly max: 10;
        readonly skipSuccessfulRequests: false;
        readonly message: "Too many intensive database operations. Please try again later.";
        readonly statusCode: 429;
    };
    readonly admin: {
        readonly windowMs: number;
        readonly max: 5;
        readonly skipSuccessfulRequests: false;
        readonly message: "Too many administrative database operations. Please try again later.";
        readonly statusCode: 429;
    };
};
/**
 * Light operations rate limiter.
 * For status, schema, analytics endpoints.
 */
export declare const lightOperationsLimiter: import("express-rate-limit").RateLimitRequestHandler;
/**
 * Medium operations rate limiter.
 * For query and execute endpoints.
 */
export declare const mediumOperationsLimiter: import("express-rate-limit").RateLimitRequestHandler;
/**
 * Heavy operations rate limiter.
 * For transaction and batch endpoints.
 */
export declare const heavyOperationsLimiter: import("express-rate-limit").RateLimitRequestHandler;
/**
 * Administrative operations rate limiter.
 * For migration endpoints.
 */
export declare const adminOperationsLimiter: import("express-rate-limit").RateLimitRequestHandler;
/**
 * Dynamic rate limiter based on operation type.
 * Automatically selects appropriate rate limit based on request.
 *
 * @param req
 * @param res
 * @param next
 */
export declare const dynamicDatabaseRateLimiter: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Custom rate limiter for specific endpoints.
 * Allows fine-tuning rate limits for specific operations.
 *
 * @param config
 * @param operationType
 */
export declare const createCustomDatabaseRateLimiter: (config: Partial<RateLimitConfig>, operationType: string) => ReturnType<typeof rateLimit>;
/**
 * Rate limiting middleware that considers user authentication level.
 * Authenticated users get higher limits than anonymous users.
 *
 * @param req
 * @param res
 * @param next
 */
export declare const authAwareDatabaseRateLimiter: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Get current rate limit status for a request.
 * Useful for monitoring and debugging.
 *
 * @param req
 */
export declare const getRateLimitStatus: (req: Request) => {
    remaining: number;
    limit: number;
    resetTime: Date;
};
/**
 * Rate limit information middleware.
 * Adds rate limit info to response headers for debugging.
 *
 * @param req
 * @param res
 * @param next
 */
export declare const rateLimitInfoMiddleware: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Export rate limiting configurations for testing and monitoring.
 */
export declare const RATE_LIMIT_CONFIGS: {
    readonly light: {
        readonly windowMs: number;
        readonly max: 100;
        readonly skipSuccessfulRequests: false;
        readonly message: "Too many database status requests. Please try again later.";
        readonly statusCode: 429;
    };
    readonly medium: {
        readonly windowMs: number;
        readonly max: 50;
        readonly skipSuccessfulRequests: false;
        readonly message: "Too many database operations. Please try again later.";
        readonly statusCode: 429;
    };
    readonly heavy: {
        readonly windowMs: number;
        readonly max: 10;
        readonly skipSuccessfulRequests: false;
        readonly message: "Too many intensive database operations. Please try again later.";
        readonly statusCode: 429;
    };
    readonly admin: {
        readonly windowMs: number;
        readonly max: 5;
        readonly skipSuccessfulRequests: false;
        readonly message: "Too many administrative database operations. Please try again later.";
        readonly statusCode: 429;
    };
};
/**
 * Helper to check if a request would be rate limited without actually limiting it.
 * Useful for monitoring and alerts.
 *
 * @param req
 * @param operationType
 */
export declare const wouldBeRateLimited: (req: Request, operationType: keyof typeof DATABASE_RATE_LIMITS) => Promise<boolean>;
declare global {
    namespace Express {
        interface Request {
            auth?: AuthContext;
        }
    }
}
//# sourceMappingURL=rate-limit.d.ts.map