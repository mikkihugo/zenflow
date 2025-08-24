/**
 * Rate Limiting Middleware for Database Operations.
 *
 * Implements intelligent rate limiting with different limits for different operation types.
 * Database operations are resource-intensive and require careful throttling.
 *
 * @file Database-specific rate limiting middleware.
 */

import { getLogger } from '@claude-zen/foundation';
import type { NextFunction, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';

const logger = getLogger('interfaces-api-http-middleware-rate-limit');

/**
 * Authentication context interface (placeholder)
 */
interface AuthContext {
  isAuthenticated(): boolean;
  user?: {
    id: string;
    roles: string[];
  };
}

/**
 * Rate limit configuration for different operation types.
 *
 * @example
 * ```typescript
 * const config: RateLimitConfig = {
 *   windowMs: 60000,
 *   // 1 minute
 *   max: 100,
 *   // 100 requests per minute
 *   message: 'Too many requests',
 *   statusCode: 429
 * };
 * ```
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
    message:
      'Too many administrative database operations. Please try again later.',
    statusCode: 429,
  },
} as const;

/**
 * Log levels enum (simplified - would normally be imported)
 */
enum LogLevel {
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  INFO = 'INFO',
}

/**
 * Simple log function (would normally be imported from logging middleware)
 */
const log = (
  level: LogLevel,
  message: string,
  req: Request,
  metadata?: any
): void => {
  logger.info(`[${level}] ${message}`, {
    path: req.path,
    method: req.method,
    ip: req.ip,
    ...metadata,
  });
};

/**
 * Create rate limiter with custom configuration.
 *
 * @param config Rate limiting configuration
 * @param operationType Type of operation for logging and identification
 * @example
 * ```typescript
 * const limiter = createRateLimiter(DATABASE_RATE_LIMITS.medium, 'query');
 * ```
 */
function createRateLimiter(
  config: RateLimitConfig,
  operationType: string
): ReturnType<typeof rateLimit> {
  return rateLimit({
    windowMs: config.windowMs,
    max: config.max,
    skipSuccessfulRequests: config.skipSuccessfulRequests,
    skipFailedRequests: config.skipFailedRequests,
    message: {
      error: config.message || 'Too many requests',
      code: 'RATE_LIMIT_EXCEEDED',
      type: `database_${operationType}`,
      retryAfter: Math.ceil(config.windowMs / 1000),
      limit: config.max,
      windowMs: config.windowMs,
    },
    statusCode: config.statusCode || 429,
    standardHeaders: true, // Return rate limit info in the headers
    legacyHeaders: false, // Disable the X-RateLimit-* headers

    // Custom key generator based on IP and user (if authenticated)
    keyGenerator: (req: Request): string => {
      const ip = req.ip || (req.connection as any)?.remoteAddress || 'unknown';
      const userId = (req as any).auth?.user?.id || 'anonymous';
      return `${operationType}:${ip}:${userId}`;
    },

    // Custom handler for rate limit exceeded
    handler: (req: Request, res: Response, _next: NextFunction) => {
      log(LogLevel.WARNING, `Rate limit exceeded for '${operationType}'`, req, {
        operationType,
        userAgent: req.get('User-Agent'),
        userId: (req as any).auth?.user?.id,
        ip: req.ip,
        limit: config.max,
        windowMs: config.windowMs,
      });

      res.status(config.statusCode || 429).json({
        error: config.message || 'Too many requests',
        code: 'RATE_LIMIT_EXCEEDED',
        type: `database_${operationType}`,
        retryAfter: Math.ceil(config.windowMs / 1000),
        details: {
          limit: config.max,
          windowMs: config.windowMs,
          operation: operationType,
        },
      });
    },

    // Skip certain requests (like health checks from load balancers)
    skip: (req: Request): boolean => {
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
export const lightOperationsLimiter = createRateLimiter(
  DATABASE_RATE_LIMITS.light,
  'light'
);

/**
 * Medium operations rate limiter.
 * For query and execute endpoints.
 */
export const mediumOperationsLimiter = createRateLimiter(
  DATABASE_RATE_LIMITS.medium,
  'medium'
);

/**
 * Heavy operations rate limiter.
 * For transaction and batch endpoints.
 */
export const heavyOperationsLimiter = createRateLimiter(
  DATABASE_RATE_LIMITS.heavy,
  'heavy'
);

/**
 * Administrative operations rate limiter.
 * For migration endpoints.
 */
export const adminOperationsLimiter = createRateLimiter(
  DATABASE_RATE_LIMITS.admin,
  'admin'
);

/**
 * Dynamic rate limiter based on operation type.
 * Automatically selects appropriate rate limit based on request.
 *
 * @param req Express request object
 * @param res Express response object
 * @param next Express next function
 */
export const dynamicDatabaseRateLimiter = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const path = req.path.toLowerCase();
  const method = req.method.toLowerCase();
  const isDryRun = req.body?.dryRun === true;

  // Determine operation type based on endpoint
  let limiter: ReturnType<typeof rateLimit>;

  if (
    path.includes('/status') ||
    path.includes('/schema') ||
    path.includes('/analytics')
  ) {
    // Light operation
    limiter = lightOperationsLimiter;
  } else if (path.includes('/migrate') && !isDryRun) {
    // Administrative operations (non-dry-run migrations)
    limiter = adminOperationsLimiter;
  } else if (path.includes('/transaction') || path.includes('/batch')) {
    // Heavy operations
    limiter = heavyOperationsLimiter;
  } else if (
    method === 'post' &&
    (path.includes('/query') || path.includes('/execute'))
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
 * Custom rate limiter for specific endpoints.
 * Allows fine-tuning rate limits for specific operations.
 *
 * @param config Custom configuration (will be merged with defaults)
 * @param operationType Operation type identifier
 */
export const createCustomDatabaseRateLimiter = (
  config: Partial<RateLimitConfig>,
  operationType: string
): ReturnType<typeof rateLimit> => {
  const fullConfig: RateLimitConfig = {
    ...DATABASE_RATE_LIMITS.medium, // Default to medium
    ...config,
  };

  return createRateLimiter(fullConfig, operationType);
};

/**
 * Rate limiting middleware that considers user authentication level.
 * Authenticated users get higher limits than anonymous users.
 *
 * @param req Express request object
 * @param res Express response object
 * @param next Express next function
 */
export const authAwareDatabaseRateLimiter = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authContext = (req as any).auth as AuthContext | undefined;
  const isAuthenticated = authContext?.isAuthenticated() || false;
  const userRoles = authContext?.user?.roles || [];
  const isAdmin = userRoles.includes('admin');

  // Determine multiplier based on authentication status
  let multiplier = 1; // Default for anonymous users
  if (isAdmin) {
    multiplier = 5; // Admins get 5x the rate limit
  } else if (isAuthenticated) {
    multiplier = 2; // Authenticated users get 2x the rate limit
  }

  // Create dynamic limiter with adjusted limits
  const path = req.path.toLowerCase();
  let baseConfig: RateLimitConfig;

  if (
    path.includes('/status') ||
    path.includes('/schema') ||
    path.includes('/analytics')
  ) {
    baseConfig = DATABASE_RATE_LIMITS.light;
  } else if (path.includes('/migrate') && req.body?.dryRun !== true) {
    baseConfig = DATABASE_RATE_LIMITS.admin;
  } else if (path.includes('/transaction') || path.includes('/batch')) {
    baseConfig = DATABASE_RATE_LIMITS.heavy;
  } else {
    baseConfig = DATABASE_RATE_LIMITS.medium;
  }

  // Apply multiplier to the max requests
  const adjustedConfig: RateLimitConfig = {
    ...baseConfig,
    max: Math.floor(baseConfig.max * multiplier),
  };

  const limiter = createRateLimiter(adjustedConfig, 'auth_aware');
  limiter(req, res, next);
};

/**
 * Get current rate limit status for a request.
 * Useful for monitoring and debugging.
 *
 * @param req Express request object
 */
export const getRateLimitStatus = (
  req: Request
): {
  remaining: number;
  limit: number;
  resetTime: Date;
} => {
  // These headers are set by express-rate-limit
  const remaining = Number.parseInt(
    req.get('X-RateLimit-Remaining') || '0',
    10
  );
  const limit = Number.parseInt(req.get('X-RateLimit-Limit') || '0', 10);
  const resetTime = new Date(
    Number.parseInt(req.get('X-RateLimit-Reset') || '0', 10)
  );

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
 * @param req Express request object
 * @param res Express response object
 * @param next Express next function
 */
export const rateLimitInfoMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
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
 * @param req Express request object
 * @param operationType Type of database operation
 */
export const wouldBeRateLimited = async (
  req: Request,
  operationType: keyof typeof DATABASE_RATE_LIMITS
): Promise<boolean> => {
  // This is a simplified check - in a real implementation,
  // you would check against the actual rate limit store
  const _config = DATABASE_RATE_LIMITS[operationType];
  const status = getRateLimitStatus(req);
  return status.remaining <= 0;
};

// Extend Express Request interface to include auth context (if not already done)
declare global {
  namespace Express {
    interface Request {
      auth?: AuthContext;
    }
  }
}
