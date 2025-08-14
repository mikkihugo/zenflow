import rateLimit from 'express-rate-limit';
import { LogLevel, log } from './logging.ts';
export const DATABASE_RATE_LIMITS = {
    light: {
        windowMs: 60 * 1000,
        max: 100,
        skipSuccessfulRequests: false,
        message: 'Too many database status requests. Please try again later.',
        statusCode: 429,
    },
    medium: {
        windowMs: 60 * 1000,
        max: 50,
        skipSuccessfulRequests: false,
        message: 'Too many database operations. Please try again later.',
        statusCode: 429,
    },
    heavy: {
        windowMs: 60 * 1000,
        max: 10,
        skipSuccessfulRequests: false,
        message: 'Too many intensive database operations. Please try again later.',
        statusCode: 429,
    },
    admin: {
        windowMs: 5 * 60 * 1000,
        max: 5,
        skipSuccessfulRequests: false,
        message: 'Too many administrative database operations. Please try again later.',
        statusCode: 429,
    },
};
function createRateLimiter(config, operationType) {
    return rateLimit({
        windowMs: config?.windowMs,
        max: config?.max,
        skipSuccessfulRequests: config?.skipSuccessfulRequests,
        skipFailedRequests: config?.skipFailedRequests,
        message: {
            error: config?.message || 'Too many requests',
            code: 'RATE_LIMIT_EXCEEDED',
            type: `database_${operationType}`,
            retryAfter: Math.ceil(config?.windowMs / 1000),
            limit: config?.max,
            windowMs: config?.windowMs,
        },
        statusCode: config?.statusCode || 429,
        standardHeaders: true,
        legacyHeaders: false,
        keyGenerator: (req) => {
            const ip = req.ip || req.connection.remoteAddress || 'unknown';
            const userId = req.auth?.user?.id || 'anonymous';
            return `${operationType}:${ip}:${userId}`;
        },
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
        skip: (req) => {
            const isLocalhost = req.ip === '127.0.0.1' || req.ip === '::1';
            const isHealthCheck = req.headers['user-agent']?.includes('health');
            return isLocalhost && isHealthCheck;
        },
    });
}
export const lightOperationsLimiter = createRateLimiter(DATABASE_RATE_LIMITS?.light, 'light');
export const mediumOperationsLimiter = createRateLimiter(DATABASE_RATE_LIMITS?.medium, 'medium');
export const heavyOperationsLimiter = createRateLimiter(DATABASE_RATE_LIMITS?.heavy, 'heavy');
export const adminOperationsLimiter = createRateLimiter(DATABASE_RATE_LIMITS?.admin, 'admin');
export const dynamicDatabaseRateLimiter = (req, res, next) => {
    const path = req.path.toLowerCase();
    const method = req.method.toLowerCase();
    const isDryRun = req.body?.dryRun === true;
    let limiter;
    if (path.includes('/status') ||
        path.includes('/schema') ||
        path.includes('/analytics')) {
        limiter = lightOperationsLimiter;
    }
    else if (path.includes('/migrate') && !isDryRun) {
        limiter = adminOperationsLimiter;
    }
    else if (path.includes('/transaction') || path.includes('/batch')) {
        limiter = heavyOperationsLimiter;
    }
    else if (method === 'post' &&
        (path.includes('/query') || path.includes('/execute'))) {
        limiter = mediumOperationsLimiter;
    }
    else {
        limiter = mediumOperationsLimiter;
    }
    limiter(req, res, next);
};
export const createCustomDatabaseRateLimiter = (config, operationType) => {
    const fullConfig = {
        ...DATABASE_RATE_LIMITS?.medium,
        ...config,
    };
    return createRateLimiter(fullConfig, operationType);
};
export const authAwareDatabaseRateLimiter = (req, res, next) => {
    const isAuthenticated = req.auth?.isAuthenticated;
    const userRoles = req.auth?.user?.roles || [];
    const isAdmin = userRoles.includes('admin');
    let multiplier = 1;
    if (isAdmin) {
        multiplier = 5;
    }
    else if (isAuthenticated) {
        multiplier = 2;
    }
    const path = req.path.toLowerCase();
    let baseConfig;
    if (path.includes('/status') ||
        path.includes('/schema') ||
        path.includes('/analytics')) {
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
    const adjustedConfig = {
        ...baseConfig,
        max: Math.floor(baseConfig?.max * multiplier),
    };
    const limiter = createRateLimiter(adjustedConfig, 'auth_aware');
    limiter(req, res, next);
};
export const getRateLimitStatus = (req) => {
    const remaining = Number.parseInt(req.get('X-RateLimit-Remaining') || '0', 10);
    const limit = Number.parseInt(req.get('X-RateLimit-Limit') || '0', 10);
    const resetTime = new Date(Number.parseInt(req.get('X-RateLimit-Reset') || '0', 10));
    return {
        remaining,
        limit,
        resetTime,
    };
};
export const rateLimitInfoMiddleware = (req, res, next) => {
    const status = getRateLimitStatus(req);
    res.set({
        'X-Database-RateLimit-Remaining': status.remaining.toString(),
        'X-Database-RateLimit-Limit': status.limit.toString(),
        'X-Database-RateLimit-Reset': status.resetTime.toISOString(),
    });
    next();
};
export const RATE_LIMIT_CONFIGS = DATABASE_RATE_LIMITS;
export const wouldBeRateLimited = async (req, operationType) => {
    const _config = DATABASE_RATE_LIMITS[operationType];
    const status = getRateLimitStatus(req);
    return status.remaining <= 0;
};
//# sourceMappingURL=rate-limit.js.map