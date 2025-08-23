/**
 * @file Main entry point for REST API layer.
 */

import { getLogger } from '@claude-zen/foundation';

const logger = getLogger('interfaces-api-http-index);

/**
 * REST API Layer - Main Entry Point.
 *
 * Central export point for the REST API layer.
 * Following Google Code Standards with explicit exports.
 * Clean separation between API layer and business domains.
 */

// ===== TYPE EXPORTS =====

// Client types
export type {
  APIClientConfig,
  APIError,
  APIResponse,
  HealthStatus,
  PerformanceMetrics,
  Agent,
  Task,
  SwarmConfig

} from './client';

// Database types
export type {
  QueryRequest,
  CommandRequest,
  VectorQueryRequest,
  VectorInsertRequest,
  VectorIndexRequest,
  GraphQueryRequest,
  DatabaseResponse,
  VectorData,
  DatabaseAdapter,
  VectorDatabaseAdapter,
  GraphDatabaseAdapter

} from '../database/database-controller';

// DI Container types
export type {
  BatchRequest,
  MigrationRequest,
  DatabaseHealthStatus,
  DatabaseConfig,
  ConnectionStats

} from './di/database-container';

// ===== CLIENT SDK EXPORTS =====
export {
  APIClient,
  apiClient

} from './client';

// ===== MIDDLEWARE EXPORTS =====

// Auth interfaces (basic definitions for now)
export interface User {
  id: string;
  username: string;
  email?: string;
  roles: string[];
  permissions: string[];
  createdAt: Date;
  lastLoginAt?: Date

}

export interface AuthContext {
  user?: User;
  token?: string;
  permissions: string[];
  roles: string[];
  isAuthenticated: boolean

}

// Basic auth middleware functions (placeholders)
export const authMiddleware = (req: any, res: any, next: any) => {
  // Mock auth middleware - in production this would validate JWT tokens
  const authHeader = req.headers.authorization;

  if(authHeader && authHeader.startsWith('Bearer ))'{
    // Mock user for development
    req.auth = {
      user: {
  id: '1',
  username: 'admin',
  email: 'admin@example.com',
  roles: ['admin],
  permissios: [*],
  createdAt: new Date(),
  lastLoginAt: new Date()

},
      token: authHeader.substring(7),
      permissions: ['*],
      roles: ['admin],
      isAutheticated: true
} as AuthContext
} else {
    req.auth = {
  permissions: [],
  roles: [],
  isAuthenticated: false

} as AuthContext
}

  next()
};

export const optionalAuthMiddleware = (req: any, res: any, next: any) => {
  authMiddleware(
  req,
  res,
  next
)

};

export const getCurrentUser = (req: any): User | undefined => {
  return req.auth?.user
};

export const hasRole = (req: any, role: string): boolean => {
  return req.auth?.roles?.includes(role) || false
};

export const hasPermission = (req: any, permission: string): boolean => {
  return req.auth?.permissions?.includes(*) ||
         req.auth?.permissions?.includes(permission) ||
         false

};

export const isAdmin = (req: any): boolean => {
  return hasRole(req,
  admin);

};

// ===== ERROR HANDLING EXPORTS =====

// Basic error types
export interface APIError {
  code: string;
  message: string;
  details?: any;
  status?: number

}

// Error middleware
export const errorMiddleware = (err: any, req: any, res: any, next: any' => {
  logger.error('API Error:', err)';

  const apiError: APIError = {
  code: err.code || 'INTERNAL_ERROR',
  message: err.message || 'An'internal error occurred',
  etails: process.env.NODE_ENV === 'development' ? err.sack : undefined,
  status: err.status || 500

};

  res.status(apiError.status || 500).json(
  {
    success: false,
  error: apiError,
  metadata: {
  timestamp: Date.now(
),
  requestId: req.id || 'unknown'

}
})
};

// ===== LOGGING EXPORTS =====

// Request loggi'g middleware
export const loggingMiddleware = (req: any, res: any, next: any) => {
  const startTime = Date.now();

  // Log request
  logger.info('API Request',
  {
  mehod: req.method,
  url: req.url,
  userAgent: req.get(User-Agent
),
  ip: req.ip,
  imestamp: new Date().toISOString()

});

  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    logger.info('API Response',
  {
      mthod: req.method,
  url: req.url,
      statusCode: res.statusCode,
      duration: '' + duration + 'ms',
      contentLength: re'.get(content-length
)
})
});

  next()
};

// ===== RATE LIMITING EXPORTS =====

// Basic rate limiting (in-memory store)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export const rateLimitMiddleware = (maxRequests = 100, windowMs = 60000) => {
  return(
  req: any,
  res: any,
  next: any
) => {
    const key = req.ip || 'unknown;
    const now = Date.now();

    // Clean up expired entries
    for (const [k, v] of rateLimitStore.entries()) {
      if (now > v.resetTime) {
        rateLimitStore.delete(k)
}
    }

    const current = rateLimitStore.get(key);

    if (!current) {
      rateLimitStore.set(
  key,
  {
  count: 1,
  resetTime: now + windowMs
}
);
      return next()
}

    if (now > current.resetTime) {
      rateLimitStore.set(
  key,
  {
  count: 1,
  resetTime: now + windowMs
}
);
      return next()
}

    if (current.count >= maxRequests) {
      return res.status(429).json(
  {
        success: false,
  error: {
  code: 'RATE_LIMIT_EXCEEDED',
  message: 'Too'many requests;

},
        metadata: {
  timetamp: Date.now(
),
  retryAfter: Math.ceil((current.resetTime - now) / 1000)

}
})
}

    current.count++;
    next()
}
};

// ===== DATABASE CONTROLLER EXPORTS =====
export { DatabaseController } from '../database/database-controller';
export {
  getDatabaseController,
  resetDatabaseContainer,
  checkDatabaseContainerHealth

} from './di/database-container';

// ===== UTILITY FUNCTIONS =====

/**
 * Create standardized API response
 */
export const createAPIResponse = <T>(
  success: boolean,
  data?: T,
  error?: APIError,
  metadata?: Record<string, any>
) => {
  return {
    success,
    data,
    error,
    metadata: {
  timestamp: Date.now(),
  ...metadata

}
}
};

/**
 * Create standardized API error
 */
export const createAPIError = (
  code: string,
  message: string,
  status = 500,
  details?: any
): APIError => {
  return {
  code,
  message,
  status,
  details

}
};

// ===== HEALTH CHECK =====

/**
 * Health check endpoint data
 */
export const getAPIHealth = async () => {
  try {
    const dbHealth = await checkDatabaseContainerHealth();

    return {
      status: dbHealth.status === 'healthy' ? 'healthy' : 'degraded',
      timestamp: Date.now(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      services: {
  api: true,
  database: dbHealth.status === 'healthy,
  auth: true,
  logging: true

},
      details: {
        database: dbHealth,
        memor: {
  used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
  total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)

},
        cpu: process.cpuUsage()
}
}
} catch (error) {
    logger.error('Health check failed:', error);;
    return {
  status: 'unhealthy',
  timestamp: Date.now(),
  error: (error as Error).message

}
}
};

// ===== DEFAULT EXPORT =====
export default {
  // Core exports
  APIClient,
  apiClient,
  // Middleware
  authMiddleware,
  optionalAuthMiddleware,
  errorMiddleware,
  loggingMiddleware,
  rateLimitMiddleware,
  // Database
  DatabaseController,
  getDatabaseController,
  // Utilities
  createAPIResponse,
  createAPIError,
  getAPIHealth,
  // Auth helpers
  getCurrentUser,
  hasRole,
  hasPermission,
  isAdmin

};