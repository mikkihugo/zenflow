/**
 * Error Handler Middleware for Vision-to-Code Services
 * Provides consistent error handling and formatting across all services
 */

const crypto = require('crypto');

// Standard error codes
const ERROR_CODES = {
  // Client errors (4xx)
  BAD_REQUEST: 'BAD_REQUEST',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  METHOD_NOT_ALLOWED: 'METHOD_NOT_ALLOWED',
  CONFLICT: 'CONFLICT',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  
  // Server errors (5xx)
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  NOT_IMPLEMENTED: 'NOT_IMPLEMENTED',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  GATEWAY_TIMEOUT: 'GATEWAY_TIMEOUT',
  
  // Business logic errors
  VISION_NOT_FOUND: 'VISION_NOT_FOUND',
  WORKFLOW_CONFLICT: 'WORKFLOW_CONFLICT',
  AGENT_SPAWN_FAILED: 'AGENT_SPAWN_FAILED',
  COORDINATION_TIMEOUT: 'COORDINATION_TIMEOUT',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  CIRCUIT_BREAKER_OPEN: 'CIRCUIT_BREAKER_OPEN'
};

// Custom error class
class ApiError extends Error {
  constructor(code, message, statusCode = 500, details = null) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.timestamp = new Date().toISOString();
    this.requestId = null; // Set by middleware
  }

  toJSON() {
    return {
      error: {
        code: this.code,
        message: this.message,
        details: this.details,
        timestamp: this.timestamp,
        requestId: this.requestId
      }
    };
  }
}

// Common error factory functions
const errors = {
  badRequest: (message = 'Bad request', details = null) => 
    new ApiError(ERROR_CODES.BAD_REQUEST, message, 400, details),
  
  unauthorized: (message = 'Unauthorized', details = null) => 
    new ApiError(ERROR_CODES.UNAUTHORIZED, message, 401, details),
  
  forbidden: (message = 'Forbidden', details = null) => 
    new ApiError(ERROR_CODES.FORBIDDEN, message, 403, details),
  
  notFound: (resource = 'Resource', details = null) => 
    new ApiError(ERROR_CODES.NOT_FOUND, `${resource} not found`, 404, details),
  
  conflict: (message = 'Conflict', details = null) => 
    new ApiError(ERROR_CODES.CONFLICT, message, 409, details),
  
  validation: (errors = [], message = 'Validation failed') => 
    new ApiError(ERROR_CODES.VALIDATION_ERROR, message, 400, { errors }),
  
  internal: (message = 'Internal server error', details = null) => 
    new ApiError(ERROR_CODES.INTERNAL_ERROR, message, 500, details),
  
  serviceUnavailable: (service = 'Service', details = null) => 
    new ApiError(ERROR_CODES.SERVICE_UNAVAILABLE, `${service} temporarily unavailable`, 503, details)
};

/**
 * Request ID middleware - adds unique request ID for tracking
 */
function requestIdMiddleware(req, res, next) {
  req.id = req.headers['x-request-id'] || crypto.randomBytes(16).toString('hex');
  res.setHeader('X-Request-ID', req.id);
  next();
}

/**
 * Error handler middleware
 */
function errorHandler(options = {}) {
  const {
    logErrors = true,
    includeStackTrace = process.env.NODE_ENV !== 'production',
    defaultMessage = 'An unexpected error occurred',
    transformError = null
  } = options;

  return (err, req, res, next) => {
    // Skip if response already sent
    if (res.headersSent) {
      return next(err);
    }

    // Set request ID
    if (err instanceof ApiError) {
      err.requestId = req.id;
    }

    // Log error if enabled
    if (logErrors) {
      console.error({
        requestId: req.id,
        method: req.method,
        path: req.path,
        error: {
          name: err.name,
          message: err.message,
          code: err.code,
          stack: err.stack
        },
        timestamp: new Date().toISOString()
      });
    }

    // Transform error if function provided
    if (typeof transformError === 'function') {
      err = transformError(err) || err;
    }

    // Handle known API errors
    if (err instanceof ApiError) {
      return res.status(err.statusCode).json(err.toJSON());
    }

    // Handle validation errors (e.g., from express-validator)
    if (err.name === 'ValidationError' || err.type === 'validation') {
      return res.status(400).json({
        error: {
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Validation failed',
          details: err.errors || err.details,
          timestamp: new Date().toISOString(),
          requestId: req.id
        }
      });
    }

    // Handle JWT errors
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: {
          code: ERROR_CODES.UNAUTHORIZED,
          message: err.message,
          timestamp: new Date().toISOString(),
          requestId: req.id
        }
      });
    }

    // Handle MongoDB errors
    if (err.name === 'MongoError' || err.name === 'MongoServerError') {
      if (err.code === 11000) {
        return res.status(409).json({
          error: {
            code: ERROR_CODES.CONFLICT,
            message: 'Duplicate entry',
            timestamp: new Date().toISOString(),
            requestId: req.id
          }
        });
      }
    }

    // Default error response
    const statusCode = err.statusCode || err.status || 500;
    const response = {
      error: {
        code: ERROR_CODES.INTERNAL_ERROR,
        message: statusCode === 500 ? defaultMessage : err.message,
        timestamp: new Date().toISOString(),
        requestId: req.id
      }
    };

    // Include stack trace in development
    if (includeStackTrace && err.stack) {
      response.error.stack = err.stack.split('\n');
    }

    res.status(statusCode).json(response);
  };
}

/**
 * Not found handler - use as last middleware
 */
function notFoundHandler(req, res) {
  res.status(404).json({
    error: {
      code: ERROR_CODES.NOT_FOUND,
      message: `Cannot ${req.method} ${req.path}`,
      timestamp: new Date().toISOString(),
      requestId: req.id
    }
  });
}

/**
 * Async handler wrapper - catches async errors
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Validation error formatter for express-validator
 */
function validationErrorFormatter({ location, msg, param, value, nestedErrors }) {
  return {
    field: param,
    message: msg,
    location,
    value: value !== undefined ? value : null,
    ...(nestedErrors && { errors: nestedErrors })
  };
}

export {
  ApiError,
  ERROR_CODES,
  errors,
  requestIdMiddleware,
  errorHandler,
  notFoundHandler,
  asyncHandler,
  validationErrorFormatter
};