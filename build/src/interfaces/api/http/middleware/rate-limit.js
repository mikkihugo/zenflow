/**
 * Rate Limiting Middleware for Database Operations.
 *
 * Implements intelligent rate limiting with different limits for different operation types.
 * Database operations are resource-intensive and require careful throttling.
 *
 * @file Database-specific rate limiting middleware.
 */
import rateLimit from 'express-rate-limit';
import { LogLevel, log } from './logging.ts';
/**
 * Default rate limiting configurations for different database operations.
 */
export const DATABASE_RATE_LIMITS = {
    // Light operations - status, schema, analytics
    light: {
        windowMs: 60 * 1000, // 1 minute
        max: 100, // 100 requests per minute
        skipSuccessfulRequests: false,
        message: 'Too many database status requests. Please try again later.',
        statusCode: 429,
    },
    // Medium operations - queries, single commands
    medium: {
        windowMs: 60 * 1000, // 1 minute
        max: 50, // 50 requests per minute
        skipSuccessfulRequests: false,
        message: 'Too many database operations. Please try again later.',
        statusCode: 429,
    },
    // Heavy operations - transactions, migrations, batch operations
    heavy: {
        windowMs: 60 * 1000, // 1 minute
        max: 10, // 10 requests per minute
        skipSuccessfulRequests: false,
        message: 'Too many intensive database operations. Please try again later.',
        statusCode: 429,
    },
    // Administrative operations - migrations with dry-run disabled
    admin: {
        windowMs: 5 * 60 * 1000, // 5 minutes
        max: 5, // 5 requests per 5 minutes
        skipSuccessfulRequests: false,
        message: 'Too many administrative database operations. Please try again later.',
        statusCode: 429,
    },
};
/**
 * Create rate limiter with custom configuration.
 *
 * @param config
 * @param operationType
 * @example
 */
function createRateLimiter(config, operationType) {
    return rateLimit({
        windowMs: config?.windowMs,
        max: config?.max,
        skipSuccessfulRequests: config?.skipSuccessfulRequests || false,
        skipFailedRequests: config?.skipFailedRequests || false,
        message: {
            error: config?.message || 'Too many requests',
            code: 'RATE_LIMIT_EXCEEDED',
            type: `database_${operationType}`,
            retryAfter: Math.ceil(config?.windowMs / 1000),
            limit: config?.max,
            windowMs: config?.windowMs,
        },
        statusCode: config?.statusCode || 429,
        standardHeaders: true, // Return rate limit info in the headers
        legacyHeaders: false, // Disable the X-RateLimit-* headers
        // Custom key generator based on IP and user (if authenticated)
        keyGenerator: (req) => {
            const ip = req.ip || req.connection.remoteAddress || 'unknown';
            const userId = req.auth?.user?.id || 'anonymous';
            return `${operationType}:${ip}:${userId}`;
        },
        // Custom handler for rate limit exceeded
        handler: (req, res, _next) => {
            log(LogLevel.WARNING, `Rate limit exceeded for ${operationType}`, req, {
                operationType,
                userAgent: req.get('User-Agent'),
                userId: req.auth?.user?.id,
                ip: req.ip,
                limit: config?.max,
                windowMs: config?.windowMs,
            });
            res.status(config?.statusCode || 429).json({
                error: config?.message || 'Too many requests',
                code: 'RATE_LIMIT_EXCEEDED',
                type: `database_${operationType}`,
                retryAfter: Math.ceil(config?.windowMs / 1000),
                details: {
                    limit: config?.max,
                    windowMs: config?.windowMs,
                    operation: operationType,
                },
            });
        },
        // Skip certain requests (like health checks from load balancers)
        skip: (req) => {
            // Skip if request is from localhost and no auth (likely health check)
            const isLocalhost = req.ip === '127.0.0.1' || req.ip === '::1';
            const isHealthCheck = req.headers['user-agent']?.includes('health');
            return isLocalhost && isHealthCheck;
        },
    });
}
/**
 * Light operations rate limiter.
 * For status, schema, analytics endpoints.
 */
export const lightOperationsLimiter = createRateLimiter(DATABASE_RATE_LIMITS?.light, 'light');
/**
 * Medium operations rate limiter.
 * For query and execute endpoints.
 */
export const mediumOperationsLimiter = createRateLimiter(DATABASE_RATE_LIMITS?.medium, 'medium');
/**
 * Heavy operations rate limiter.
 * For transaction and batch endpoints.
 */
export const heavyOperationsLimiter = createRateLimiter(DATABASE_RATE_LIMITS?.heavy, 'heavy');
/**
 * Administrative operations rate limiter.
 * For migration endpoints.
 */
export const adminOperationsLimiter = createRateLimiter(DATABASE_RATE_LIMITS?.admin, 'admin');
/**
 * Dynamic rate limiter based on operation type.
 * Automatically selects appropriate rate limit based on request.
 *
 * @param req
 * @param res
 * @param next
 */
export const dynamicDatabaseRateLimiter = (req, res, next) => {
    const path = req.path.toLowerCase();
    const method = req.method.toLowerCase();
    const isDryRun = req.body?.dryRun === true;
    // Determine operation type based on endpoint
    let limiter;
    if (path.includes('/status') || path.includes('/schema') || path.includes('/analytics')) {
        // Light operations
        limiter = lightOperationsLimiter;
    }
    else if (path.includes('/migrate') && !isDryRun) {
        // Administrative operations (non-dry-run migrations)
        limiter = adminOperationsLimiter;
    }
    else if (path.includes('/transaction') || path.includes('/batch')) {
        // Heavy operations
        limiter = heavyOperationsLimiter;
    }
    else if (method === 'post' && (path.includes('/query') || path.includes('/execute'))) {
        // Medium operations
        limiter = mediumOperationsLimiter;
    }
    else {
        // Default to medium operations
        limiter = mediumOperationsLimiter;
    }
    // Apply the selected rate limiter
    limiter(req, res, next);
};
/**
 * Custom rate limiter for specific endpoints.
 * Allows fine-tuning rate limits for specific operations.
 *
 * @param config
 * @param operationType
 */
export const createCustomDatabaseRateLimiter = (config, operationType) => {
    const fullConfig = {
        ...DATABASE_RATE_LIMITS?.medium, // Default to medium
        ...config,
    };
    return createRateLimiter(fullConfig, operationType);
};
/**
 * Rate limiting middleware that considers user authentication level.
 * Authenticated users get higher limits than anonymous users.
 *
 * @param req
 * @param res
 * @param next
 */
export const authAwareDatabaseRateLimiter = (req, res, next) => {
    const isAuthenticated = req.auth?.isAuthenticated || false;
    const userRoles = req.auth?.user?.roles || [];
    const isAdmin = userRoles.includes('admin');
    // Determine multiplier based on authentication status
    let multiplier = 1; // Default for anonymous users
    if (isAdmin) {
        multiplier = 5; // Admins get 5x the rate limit
    }
    else if (isAuthenticated) {
        multiplier = 2; // Authenticated users get 2x the rate limit
    }
    // Create dynamic limiter with adjusted limits
    const path = req.path.toLowerCase();
    let baseConfig;
    if (path.includes('/status') || path.includes('/schema') || path.includes('/analytics')) {
        baseConfig = DATABASE_RATE_LIMITS?.light;
    }
    else if (path.includes('/migrate') && req.body?.dryRun !== true) {
        baseConfig = DATABASE_RATE_LIMITS?.admin;
    }
    else if (path.includes('/transaction') || path.includes('/batch')) {
        baseConfig = DATABASE_RATE_LIMITS?.heavy;
    }
    else {
        baseConfig = DATABASE_RATE_LIMITS?.medium;
    }
    // Apply multiplier to the max requests
    const adjustedConfig = {
        ...baseConfig,
        max: Math.floor(baseConfig?.max * multiplier),
    };
    const limiter = createRateLimiter(adjustedConfig, 'auth_aware');
    limiter(req, res, next);
};
/**
 * Get current rate limit status for a request.
 * Useful for monitoring and debugging.
 *
 * @param req
 */
export const getRateLimitStatus = (req) => {
    // These headers are set by express-rate-limit
    const remaining = parseInt(req.get('X-RateLimit-Remaining') || '0', 10);
    const limit = parseInt(req.get('X-RateLimit-Limit') || '0', 10);
    const resetTime = new Date(parseInt(req.get('X-RateLimit-Reset') || '0', 10));
    return {
        remaining,
        limit,
        resetTime,
    };
};
/**
 * Rate limit information middleware.
 * Adds rate limit info to response headers for debugging.
 *
 * @param req
 * @param res
 * @param next
 */
export const rateLimitInfoMiddleware = (req, res, next) => {
    const status = getRateLimitStatus(req);
    // Add custom rate limit headers
    res.set({
        'X-Database-RateLimit-Remaining': status.remaining.toString(),
        'X-Database-RateLimit-Limit': status.limit.toString(),
        'X-Database-RateLimit-Reset': status.resetTime.toISOString(),
    });
    next();
};
/**
 * Export rate limiting configurations for testing and monitoring.
 */
export const RATE_LIMIT_CONFIGS = DATABASE_RATE_LIMITS;
/**
 * Helper to check if a request would be rate limited without actually limiting it.
 * Useful for monitoring and alerts.
 *
 * @param req
 * @param operationType
 */
export const wouldBeRateLimited = async (req, operationType) => {
    // This is a simplified check - in a real implementation,
    // you would check against the actual rate limit store
    const _config = DATABASE_RATE_LIMITS[operationType];
    const status = getRateLimitStatus(req);
    return status.remaining <= 0;
};
