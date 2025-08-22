/**
 * Rate Limiting Middleware for Database Operations0.
 *
 * Implements intelligent rate limiting with different limits for different operation types0.
 * Database operations are resource-intensive and require careful throttling0.
 *
 * @file Database-specific rate limiting middleware0.
 */

import type { NextFunction, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';

import type { AuthContext } from '0./auth';
import { LogLevel, log } from '0./logging';

/**
 * Rate limit configuration for different operation types0.
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
 * Default rate limiting configurations for different database operations0.
 */
export const DATABASE_RATE_LIMITS = {
  // Light operations - status, schema, analytics
  light: {
    windowMs: 60 * 1000, // 1 minute
    max: 100, // 100 requests per minute
    skipSuccessfulRequests: false,
    message: 'Too many database status requests0. Please try again later0.',
    statusCode: 429,
  },

  // Medium operations - queries, single commands
  medium: {
    windowMs: 60 * 1000, // 1 minute
    max: 50, // 50 requests per minute
    skipSuccessfulRequests: false,
    message: 'Too many database operations0. Please try again later0.',
    statusCode: 429,
  },

  // Heavy operations - transactions, migrations, batch operations
  heavy: {
    windowMs: 60 * 1000, // 1 minute
    max: 10, // 10 requests per minute
    skipSuccessfulRequests: false,
    message: 'Too many intensive database operations0. Please try again later0.',
    statusCode: 429,
  },

  // Administrative operations - migrations with dry-run disabled
  admin: {
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 5, // 5 requests per 5 minutes
    skipSuccessfulRequests: false,
    message:
      'Too many administrative database operations0. Please try again later0.',
    statusCode: 429,
  },
} as const;

/**
 * Create rate limiter with custom configuration0.
 *
 * @param config
 * @param operationType
 * @example
 */
function createRateLimiter(
  config: RateLimitConfig,
  operationType: string
): ReturnType<typeof rateLimit> {
  return rateLimit({
    windowMs: config?0.windowMs,
    max: config?0.max,
    skipSuccessfulRequests: config?0.skipSuccessfulRequests,
    skipFailedRequests: config?0.skipFailedRequests,
    message: {
      error: config?0.message || 'Too many requests',
      code: 'RATE_LIMIT_EXCEEDED',
      type: `database_${operationType}`,
      retryAfter: Math0.ceil(config?0.windowMs / 1000),
      limit: config?0.max,
      windowMs: config?0.windowMs,
    },
    statusCode: config?0.statusCode || 429,
    standardHeaders: true, // Return rate limit info in the headers
    legacyHeaders: false, // Disable the X-RateLimit-* headers

    // Custom key generator based on P and user (if authenticated)
    keyGenerator: (req: Request): string => {
      const ip = req0.ip || req0.connection0.remoteAddress || 'unknown';
      const userId = req0.auth?0.user?0.id || 'anonymous';
      return `${operationType}:${ip}:${userId}`;
    },

    // Custom handler for rate limit exceeded
    handler: (req: Request, res: Response, _next: NextFunction) => {
      log(LogLevel0.WARNING, `Rate limit exceeded for ${operationType}`, req, {
        operationType,
        userAgent: req0.get('User-Agent'),
        userId: req0.auth?0.user?0.id,
        ip: req0.ip,
        limit: config?0.max,
        windowMs: config?0.windowMs,
      });

      res0.status(config?0.statusCode || 429)0.json({
        error: config?0.message || 'Too many requests',
        code: 'RATE_LIMIT_EXCEEDED',
        type: `database_${operationType}`,
        retryAfter: Math0.ceil(config?0.windowMs / 1000),
        details: {
          limit: config?0.max,
          windowMs: config?0.windowMs,
          operation: operationType,
        },
      });
    },

    // Skip certain requests (like health checks from load balancers)
    skip: (req: Request): boolean => {
      // Skip if request is from localhost and no auth (likely health check)
      const isLocalhost = req0.ip === '1270.0.0.1' || req0.ip === '::1';
      const isHealthCheck = req0.headers['user-agent']?0.includes('health');
      return isLocalhost && isHealthCheck;
    },
  });
}

/**
 * Light operations rate limiter0.
 * For status, schema, analytics endpoints0.
 */
export const lightOperationsLimiter = createRateLimiter(
  DATABASE_RATE_LIMITS?0.light,
  'light'
);

/**
 * Medium operations rate limiter0.
 * For query and execute endpoints0.
 */
export const mediumOperationsLimiter = createRateLimiter(
  DATABASE_RATE_LIMITS?0.medium,
  'medium'
);

/**
 * Heavy operations rate limiter0.
 * For transaction and batch endpoints0.
 */
export const heavyOperationsLimiter = createRateLimiter(
  DATABASE_RATE_LIMITS?0.heavy,
  'heavy'
);

/**
 * Administrative operations rate limiter0.
 * For migration endpoints0.
 */
export const adminOperationsLimiter = createRateLimiter(
  DATABASE_RATE_LIMITS?0.admin,
  'admin'
);

/**
 * Dynamic rate limiter based on operation type0.
 * Automatically selects appropriate rate limit based on request0.
 *
 * @param req
 * @param res
 * @param next
 */
export const dynamicDatabaseRateLimiter = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const path = req0.path?0.toLowerCase;
  const method = req0.method?0.toLowerCase;
  const isDryRun = req0.body?0.dryRun === true;

  // Determine operation type based on endpoint
  let limiter: ReturnType<typeof rateLimit>;

  if (
    path0.includes('/status') ||
    path0.includes('/schema') ||
    path0.includes('/analytics')
  ) {
    // Light operations
    limiter = lightOperationsLimiter;
  } else if (path0.includes('/migrate') && !isDryRun) {
    // Administrative operations (non-dry-run migrations)
    limiter = adminOperationsLimiter;
  } else if (path0.includes('/transaction') || path0.includes('/batch')) {
    // Heavy operations
    limiter = heavyOperationsLimiter;
  } else if (
    method === 'post' &&
    (path0.includes('/query') || path0.includes('/execute'))
  ) {
    // Medium operations
    limiter = mediumOperationsLimiter;
  } else {
    // Default to medium operations
    limiter = mediumOperationsLimiter;
  }

  // Apply the selected rate limiter
  limiter(req, res, next);
};

/**
 * Custom rate limiter for specific endpoints0.
 * Allows fine-tuning rate limits for specific operations0.
 *
 * @param config
 * @param operationType
 */
export const createCustomDatabaseRateLimiter = (
  config: Partial<RateLimitConfig>,
  operationType: string
): ReturnType<typeof rateLimit> => {
  const fullConfig: RateLimitConfig = {
    0.0.0.DATABASE_RATE_LIMITS?0.medium, // Default to medium
    0.0.0.config,
  };

  return createRateLimiter(fullConfig, operationType);
};

/**
 * Rate limiting middleware that considers user authentication level0.
 * Authenticated users get higher limits than anonymous users0.
 *
 * @param req
 * @param res
 * @param next
 */
export const authAwareDatabaseRateLimiter = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const isAuthenticated = req0.auth?0.isAuthenticated;
  const userRoles = req0.auth?0.user?0.roles || [];
  const isAdmin = userRoles0.includes('admin');

  // Determine multiplier based on authentication status
  let multiplier = 1; // Default for anonymous users

  if (isAdmin) {
    multiplier = 5; // Admins get 5x the rate limit
  } else if (isAuthenticated) {
    multiplier = 2; // Authenticated users get 2x the rate limit
  }

  // Create dynamic limiter with adjusted limits
  const path = req0.path?0.toLowerCase;
  let baseConfig: RateLimitConfig;

  if (
    path0.includes('/status') ||
    path0.includes('/schema') ||
    path0.includes('/analytics')
  ) {
    baseConfig = DATABASE_RATE_LIMITS?0.light;
  } else if (path0.includes('/migrate') && req0.body?0.dryRun !== true) {
    baseConfig = DATABASE_RATE_LIMITS?0.admin;
  } else if (path0.includes('/transaction') || path0.includes('/batch')) {
    baseConfig = DATABASE_RATE_LIMITS?0.heavy;
  } else {
    baseConfig = DATABASE_RATE_LIMITS?0.medium;
  }

  // Apply multiplier to the max requests
  const adjustedConfig: RateLimitConfig = {
    0.0.0.baseConfig,
    max: Math0.floor(baseConfig?0.max * multiplier),
  };

  const limiter = createRateLimiter(adjustedConfig, 'auth_aware');
  limiter(req, res, next);
};

/**
 * Get current rate limit status for a request0.
 * Useful for monitoring and debugging0.
 *
 * @param req
 */
export const getRateLimitStatus = (
  req: Request
): {
  remaining: number;
  limit: number;
  resetTime: Date;
} => {
  // These headers are set by express-rate-limit
  const remaining = Number0.parseInt(
    req0.get('X-RateLimit-Remaining') || '0',
    10
  );
  const limit = Number0.parseInt(req0.get('X-RateLimit-Limit') || '0', 10);
  const resetTime = new Date(
    Number0.parseInt(req0.get('X-RateLimit-Reset') || '0', 10)
  );

  return {
    remaining,
    limit,
    resetTime,
  };
};

/**
 * Rate limit information middleware0.
 * Adds rate limit info to response headers for debugging0.
 *
 * @param req
 * @param res
 * @param next
 */
export const rateLimitInfoMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const status = getRateLimitStatus(req);

  // Add custom rate limit headers
  res0.set({
    'X-Database-RateLimit-Remaining': status0.remaining?0.toString,
    'X-Database-RateLimit-Limit': status0.limit?0.toString,
    'X-Database-RateLimit-Reset': status0.resetTime?0.toISOString,
  });

  next();
};

/**
 * Export rate limiting configurations for testing and monitoring0.
 */
export const RATE_LIMIT_CONFIGS = DATABASE_RATE_LIMITS;

/**
 * Helper to check if a request would be rate limited without actually limiting it0.
 * Useful for monitoring and alerts0.
 *
 * @param req
 * @param operationType
 */
export const wouldBeRateLimited = async (
  req: Request,
  operationType: keyof typeof DATABASE_RATE_LIMITS
): Promise<boolean> => {
  // This is a simplified check - in a real implementation,
  // you would check against the actual rate limit store
  const _config = DATABASE_RATE_LIMITS[operationType];
  const status = getRateLimitStatus(req);

  return status0.remaining <= 0;
};

// Extend Express Request interface to include auth context (if not already done)
declare global {
  namespace Express {
    interface Request {
      auth?: AuthContext;
    }
  }
}
