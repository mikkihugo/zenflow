/**
 * Middleware Collection
 * Reusable middleware functions for Claude Flow servers
 */

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { rateLimit } from 'express-rate-limit';

// Import types
import {
  TypedRequest,
  TypedResponse,
  MiddlewareFunction,
  UserContext,
  SessionContext,
  ValidationResult,
  ValidationError
} from '../types/server.js';
import { JSONObject, JSONValue } from '../types/core.js';

/**
 * Enhanced request logging middleware
 */
export function requestLogger(): MiddlewareFunction {
  return (req: TypedRequest, res: TypedResponse, next: NextFunction) => {
    const start = Date.now();
    const correlationId = req.headers['x-correlation-id'] as string || 
                         `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Add correlation tracking
    req.correlation = {
      id: correlationId,
      traceId: req.headers['x-trace-id'] as string || correlationId,
      spanId: req.headers['x-span-id'] as string || `span-${Math.random().toString(36).substr(2, 9)}`
    };

    // Log request start
    console.log(`[${new Date().toISOString()}] ${correlationId} ${req.method} ${req.path} - Start`);

    // Log response completion
    res.on('finish', () => {
      const duration = Date.now() - start;
      console.log(`[${new Date().toISOString()}] ${correlationId} ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
    });

    next();
  };
}

/**
 * Request validation middleware
 */
export function validateRequest(schema: {
  params?: JSONObject;
  query?: JSONObject;
  body?: JSONObject;
  headers?: JSONObject;
}): MiddlewareFunction {
  return (req: TypedRequest, res: TypedResponse, next: NextFunction) => {
    const validation: NonNullable<TypedRequest['validation']> = {
      params: { valid: true, errors: [], warnings: [] },
      query: { valid: true, errors: [], warnings: [] },
      body: { valid: true, errors: [], warnings: [] },
      headers: { valid: true, errors: [], warnings: [] }
    };

    // Validate params
    if (schema.params) {
      validation.params = validateObject(req.params, schema.params, 'params');
    }

    // Validate query
    if (schema.query) {
      validation.query = validateObject(req.query, schema.query, 'query');
    }

    // Validate body
    if (schema.body) {
      validation.body = validateObject(req.body, schema.body, 'body');
    }

    // Validate headers
    if (schema.headers) {
      validation.headers = validateObject(req.headers, schema.headers, 'headers');
    }

    req.validation = validation;

    // Check if any validation failed
    const hasErrors = Object.values(validation).some(v => !v.valid);
    if (hasErrors) {
      const allErrors = Object.entries(validation)
        .filter(([, v]) => !v.valid)
        .flatMap(([section, v]) => v.errors.map(e => ({ section, ...e })));

      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: allErrors,
        timestamp: new Date().toISOString()
      });
    }

    next();
  };
}

/**
 * Authentication middleware
 */
export function authenticate(options: {
  required?: boolean;
  extractUser?: (token: string) => Promise<UserContext | null>;
}): MiddlewareFunction {
  return async (req: TypedRequest, res: TypedResponse, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;
      let user: UserContext | null = null;

      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        
        if (options.extractUser) {
          user = await options.extractUser(token);
        } else {
          // Default user extraction logic
          user = {
            id: 'anonymous',
            username: 'anonymous',
            roles: ['guest'],
            permissions: []
          };
        }
      }

      if (options.required && !user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
          message: 'Valid authentication token is required',
          timestamp: new Date().toISOString()
        });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error('Authentication error:', error);
      res.status(401).json({
        success: false,
        error: 'Authentication failed',
        message: (error as Error).message,
        timestamp: new Date().toISOString()
      });
    }
  };
}

/**
 * Authorization middleware
 */
export function authorize(permissions: string[] | ((user: UserContext) => boolean)): MiddlewareFunction {
  return (req: TypedRequest, res: TypedResponse, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: 'User must be authenticated to access this resource',
        timestamp: new Date().toISOString()
      });
    }

    let hasPermission = false;

    if (typeof permissions === 'function') {
      hasPermission = permissions(req.user);
    } else {
      hasPermission = permissions.some(permission => 
        req.user!.permissions.includes(permission) ||
        req.user!.roles.some(role => role === 'admin' || role === 'superuser')
      );
    }

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
        message: 'You do not have permission to access this resource',
        required_permissions: Array.isArray(permissions) ? permissions : ['custom_check'],
        user_permissions: req.user.permissions,
        user_roles: req.user.roles,
        timestamp: new Date().toISOString()
      });
    }

    next();
  };
}

/**
 * Error handling middleware
 */
export function errorHandler(): express.ErrorRequestHandler {
  return (err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(`Error in ${req.method} ${req.path}:`, err);

    // Handle different types of errors
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        message: err.message,
        timestamp: new Date().toISOString()
      });
    }

    if (err.name === 'UnauthorizedError') {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: err.message,
        timestamp: new Date().toISOString()
      });
    }

    if (err.name === 'ForbiddenError') {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: err.message,
        timestamp: new Date().toISOString()
      });
    }

    if (err.name === 'NotFoundError') {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: err.message,
        timestamp: new Date().toISOString()
      });
    }

    // Default server error
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : err.message,
      stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
      timestamp: new Date().toISOString()
    });
  };
}

/**
 * Response enhancement middleware
 */
export function enhanceResponse(): MiddlewareFunction {
  return (req: TypedRequest, res: TypedResponse, next: NextFunction) => {
    // Add success response helper
    res.success = function<T>(data: T, message?: string) {
      return this.json({
        success: true,
        data,
        message,
        timestamp: new Date().toISOString(),
        correlation_id: req.correlation?.id
      });
    };

    // Add error response helper
    res.error = function(message: string, code?: number, details?: JSONObject) {
      const statusCode = code || 500;
      return this.status(statusCode).json({
        success: false,
        error: getErrorName(statusCode),
        message,
        details,
        timestamp: new Date().toISOString(),
        correlation_id: req.correlation?.id
      });
    };

    // Add paginated response helper
    res.paginated = function<T>(data: T[], pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
      hasNext: boolean;
      hasPrev: boolean;
    }) {
      return this.json({
        success: true,
        data,
        pagination,
        timestamp: new Date().toISOString(),
        correlation_id: req.correlation?.id
      });
    };

    // Add cached response helper
    res.cached = function(data: JSONValue, ttl?: number) {
      if (ttl) {
        this.set('Cache-Control', `public, max-age=${ttl}`);
      }
      return this.json({
        success: true,
        data,
        cached: true,
        timestamp: new Date().toISOString(),
        correlation_id: req.correlation?.id
      });
    };

    // Add streaming response helper
    res.stream = function(data: AsyncIterable<any>) {
      this.set('Content-Type', 'application/x-ndjson');
      this.set('Transfer-Encoding', 'chunked');
      
      (async () => {
        try {
          for await (const chunk of data) {
            this.write(JSON.stringify(chunk) + '\n');
          }
          this.end();
        } catch (error) {
          this.write(JSON.stringify({ 
            error: 'Stream error', 
            message: (error as Error).message 
          }) + '\n');
          this.end();
        }
      })();
    };

    // Add typed request helpers
    req.typedParams = function<T>(): T {
      return this.params as T;
    };

    req.typedQuery = function<T>(): T {
      return this.query as any as T;
    };

    req.typedBody = function<T>(): T {
      return this.body as T;
    };

    next();
  };
}

/**
 * Security headers middleware
 */
export function securityHeaders(): MiddlewareFunction {
  return helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"]
      }
    },
    crossOriginEmbedderPolicy: process.env.NODE_ENV === 'production'
  });
}

/**
 * CORS middleware with advanced options
 */
export function corsMiddleware(options?: {
  origins?: string[];
  credentials?: boolean;
  methods?: string[];
  headers?: string[];
}): MiddlewareFunction {
  return cors({
    origin: options?.origins || (process.env.NODE_ENV === 'production' ? false : '*'),
    credentials: options?.credentials || false,
    methods: options?.methods || ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: options?.headers || [
      'Content-Type', 
      'Authorization', 
      'X-Requested-With',
      'X-Correlation-ID',
      'X-Trace-ID',
      'X-Span-ID'
    ],
    exposedHeaders: [
      'X-Correlation-ID',
      'X-Rate-Limit-Limit',
      'X-Rate-Limit-Remaining',
      'X-Rate-Limit-Reset'
    ]
  });
}

/**
 * Rate limiting middleware
 */
export function rateLimiter(options?: {
  windowMs?: number;
  max?: number;
  message?: string;
  skipSuccessful?: boolean;
}): MiddlewareFunction {
  return rateLimit({
    windowMs: options?.windowMs || 15 * 60 * 1000, // 15 minutes
    max: options?.max || 1000,
    message: {
      error: 'Too many requests',
      message: options?.message || 'Too many requests from this IP, please try again later.',
      retryAfter: Math.ceil((options?.windowMs || 15 * 60 * 1000) / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: options?.skipSuccessful || false,
    handler: (req, res) => {
      res.status(429).json({
        success: false,
        error: 'Rate Limit Exceeded',
        message: options?.message || 'Too many requests from this IP, please try again later.',
        retryAfter: res.get('Retry-After'),
        timestamp: new Date().toISOString()
      });
    }
  });
}

/**
 * Request timeout middleware
 */
export function timeout(ms: number = 30000): MiddlewareFunction {
  return (req: TypedRequest, res: TypedResponse, next: NextFunction) => {
    const timer = setTimeout(() => {
      if (!res.headersSent) {
        res.status(408).json({
          success: false,
          error: 'Request Timeout',
          message: 'Request took too long to complete',
          timeout: ms,
          timestamp: new Date().toISOString()
        });
      }
    }, ms);

    res.on('finish', () => {
      clearTimeout(timer);
    });

    res.on('close', () => {
      clearTimeout(timer);
    });

    next();
  };
}

// Helper functions

/**
 * Validate an object against a schema
 */
function validateObject(obj: any, schema: JSONObject, section: string): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: string[] = [];

  // Basic validation - this would be expanded with a proper validator like Joi or Yup
  if (typeof obj !== 'object' || obj === null) {
    errors.push({
      field: section,
      message: `${section} must be an object`,
      value: obj
    });
    return { valid: false, errors, warnings };
  }

  // Validate required fields
  Object.entries(schema).forEach(([key, schemaValue]) => {
    if (typeof schemaValue === 'object' && schemaValue !== null) {
      const fieldSchema = schemaValue as any;
      
      if (fieldSchema.required && !(key in obj)) {
        errors.push({
          field: `${section}.${key}`,
          message: `${key} is required`,
          value: undefined
        });
      }

      if (key in obj && fieldSchema.type) {
        const actualType = typeof obj[key];
        if (actualType !== fieldSchema.type) {
          errors.push({
            field: `${section}.${key}`,
            message: `${key} must be of type ${fieldSchema.type}, got ${actualType}`,
            value: obj[key]
          });
        }
      }
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Get error name from status code
 */
function getErrorName(statusCode: number): string {
  const errorNames: Record<number, string> = {
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    405: 'Method Not Allowed',
    408: 'Request Timeout',
    409: 'Conflict',
    422: 'Unprocessable Entity',
    429: 'Too Many Requests',
    500: 'Internal Server Error',
    501: 'Not Implemented',
    502: 'Bad Gateway',
    503: 'Service Unavailable',
    504: 'Gateway Timeout'
  };

  return errorNames[statusCode] || 'Unknown Error';
}

// Export all middleware functions
export {
  securityHeaders as helmet,
  corsMiddleware as cors,
  compression,
  rateLimiter as rateLimit,
  timeout as requestTimeout,
  requestLogger as logging,
  validateRequest as validation,
  authenticate as auth,
  authorize as authz,
  errorHandler as errors,
  enhanceResponse as enhance
};

// Export default middleware collection
export default {
  requestLogger,
  validateRequest,
  authenticate,
  authorize,
  errorHandler,
  enhanceResponse,
  securityHeaders,
  corsMiddleware,
  rateLimiter,
  timeout
};