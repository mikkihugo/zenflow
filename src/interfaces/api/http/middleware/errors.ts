/**
 * Error Handling Middleware.
 *
 * Standardized error handling following Google API Design Guide.
 * Provides consistent error responses across all API endpoints.
 *
 * @file Express error handling middleware.
 */

import { getLogger } from '../../../../config/logging-config.js';

const logger = getLogger('interfaces-api-http-middleware-errors');

import type {
  ErrorRequestHandler,
  NextFunction,
  Request,
  Response,
} from 'express';

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
export const ErrorCodes = {
  // Client Errors (4xx)
  BAD_REQUEST: 'INVALID_REQUEST',
  UNAUTHORIZED: 'AUTHENTICATION_REQUIRED',
  FORBIDDEN: 'PERMISSION_DENIED',
  NOT_FOUND: 'RESOURCE_NOT_FOUND',
  METHOD_NOT_ALLOWED: 'METHOD_NOT_SUPPORTED',
  CONFLICT: 'RESOURCE_CONFLICT',
  UNPROCESSABLE_ENTITY: 'VALIDATION_FAILED',
  TOO_MANY_REQUESTS: 'RATE_LIMIT_EXCEEDED',

  // Server Errors (5xx)
  INTERNAL_SERVER_ERROR: 'INTERNAL_ERROR',
  NOT_IMPLEMENTED: 'FEATURE_NOT_IMPLEMENTED',
  BAD_GATEWAY: 'UPSTREAM_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  GATEWAY_TIMEOUT: 'TIMEOUT_ERROR',
} as const;

/**
 * Custom API Error Class.
 * Extends Error with additional metadata for API responses.
 *
 * @example
 */
export class APIError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: Record<string, unknown>;
  public readonly traceId?: string;

  constructor(
    statusCode: number,
    code: string,
    message: string,
    details?: Record<string, unknown>,
    traceId?: string
  ) {
    super(message);
    this.name = 'APIError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.traceId = traceId;

    // Maintains proper stack trace for where our error was thrown (Node.js only)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, APIError);
    }
  }
}

/**
 * Generate unique trace ID for error tracking.
 * Simple implementation - can be enhanced with proper UUID library.
 */
const generateTraceId = (): string => {
  return `trace-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
};

/**
 * Determine error code from HTTP status code.
 * Maps status codes to standardized error codes.
 *
 * @param statusCode
 */
const _getErrorCodeFromStatus = (statusCode: number): string => {
  switch (statusCode) {
    case 400:
      return ErrorCodes.BAD_REQUEST;
    case 401:
      return ErrorCodes.UNAUTHORIZED;
    case 403:
      return ErrorCodes.FORBIDDEN;
    case 404:
      return ErrorCodes.NOT_FOUND;
    case 405:
      return ErrorCodes.METHOD_NOT_ALLOWED;
    case 409:
      return ErrorCodes.CONFLICT;
    case 422:
      return ErrorCodes.UNPROCESSABLE_ENTITY;
    case 429:
      return ErrorCodes.TOO_MANY_REQUESTS;
    case 500:
      return ErrorCodes.INTERNAL_SERVER_ERROR;
    case 501:
      return ErrorCodes.NOT_IMPLEMENTED;
    case 502:
      return ErrorCodes.BAD_GATEWAY;
    case 503:
      return ErrorCodes.SERVICE_UNAVAILABLE;
    case 504:
      return ErrorCodes.GATEWAY_TIMEOUT;
    default:
      return ErrorCodes.INTERNAL_SERVER_ERROR;
  }
};

/**
 * Main Error Handler Middleware.
 * Catches all errors and formats them according to Google API standards.
 *
 * @param error
 * @param req
 * @param res
 * @param _next
 */
export const errorHandler: ErrorRequestHandler = (
  error: Error | APIError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const traceId = generateTraceId();

  // Log error for monitoring (in production, use proper logging service)
  logger.error(`[${traceId}] Error occurred:`, {
    message: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
    body: req.body,
    query: req.query,
    params: req.params,
    timestamp: new Date().toISOString(),
  });

  let statusCode: number;
  let code: string;
  let message: string;
  let details: Record<string, unknown> | undefined;

  if (error instanceof APIError) {
    // Custom API error - use provided values
    statusCode = error.statusCode;
    code = error.code;
    message = error.message;
    details = error.details;
  } else if (error.name === 'ValidationError') {
    // OpenAPI validation error
    statusCode = 422;
    code = ErrorCodes.UNPROCESSABLE_ENTITY;
    message = 'Request validation failed';
    details = {
      validationErrors: (error as any).errors || error.message,
    };
  } else if (error.name === 'SyntaxError' && 'body' in error) {
    // JSON parsing error
    statusCode = 400;
    code = ErrorCodes.BAD_REQUEST;
    message = 'Invalid JSON in request body';
    details = {
      parseError: error.message,
    };
  } else if (
    error.message.includes('ENOTFOUND') ||
    error.message.includes('ECONNREFUSED')
  ) {
    // Network/connection error
    statusCode = 502;
    code = ErrorCodes.BAD_GATEWAY;
    message = 'External service unavailable';
    details = {
      networkError: error.message,
    };
  } else if (error.message.includes('timeout')) {
    // Timeout error
    statusCode = 504;
    code = ErrorCodes.GATEWAY_TIMEOUT;
    message = 'Request timeout';
    details = {
      timeoutError: error.message,
    };
  } else {
    // Generic error - treat as internal server error
    statusCode = 500;
    code = ErrorCodes.INTERNAL_SERVER_ERROR;
    message =
      process.env['NODE_ENV'] === 'production'
        ? 'An internal error occurred'
        : error.message;

    if (process.env['NODE_ENV'] !== 'production') {
      details = {
        stack: error.stack,
        originalError: error.toString(),
      };
    }
  }

  // Create standardized error response
  const errorResponse: APIErrorResponse = {
    error: {
      code,
      message,
      details,
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method,
      traceId,
    },
  };

  // Send error response
  res.status(statusCode).json(errorResponse);
};

/**
 * Not Found Handler.
 * Handles 404 errors for unmatched routes.
 *
 * @param req
 * @param res
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  const errorResponse: APIErrorResponse = {
    error: {
      code: ErrorCodes.NOT_FOUND,
      message: `The endpoint ${req.method} ${req.path} does not exist`,
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method,
      details: {
        availableEndpoints: '/api',
        documentation: '/docs',
      },
    },
  };

  res.status(404).json(errorResponse);
};

/**
 * Async Error Handler Wrapper.
 * Wraps async route handlers to catch errors automatically.
 *
 * @param fn
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Validation Error Creator.
 * Helper to create validation errors with detailed information.
 *
 * @param field
 * @param value
 * @param message
 * @param traceId
 */
export const createValidationError = (
  field: string,
  value: unknown,
  message: string,
  traceId?: string
): APIError => {
  return new APIError(
    422,
    ErrorCodes.UNPROCESSABLE_ENTITY,
    `Validation failed for field '${field}'`,
    {
      field,
      value,
      validationMessage: message,
    },
    traceId
  );
};

/**
 * Not Found Error Creator.
 * Helper to create consistent 404 errors.
 *
 * @param resource
 * @param identifier
 * @param traceId
 */
export const createNotFoundError = (
  resource: string,
  identifier: string,
  traceId?: string
): APIError => {
  return new APIError(
    404,
    ErrorCodes.NOT_FOUND,
    `${resource} not found`,
    {
      resource,
      identifier,
    },
    traceId
  );
};

/**
 * Conflict Error Creator.
 * Helper to create resource conflict errors.
 *
 * @param resource
 * @param reason
 * @param traceId
 */
export const createConflictError = (
  resource: string,
  reason: string,
  traceId?: string
): APIError => {
  return new APIError(
    409,
    ErrorCodes.CONFLICT,
    `${resource} conflict: ${reason}`,
    {
      resource,
      conflictReason: reason,
    },
    traceId
  );
};

/**
 * Rate Limit Error Creator.
 * Helper to create rate limiting errors.
 *
 * @param limit
 * @param windowMs
 * @param traceId
 */
export const createRateLimitError = (
  limit: number,
  windowMs: number,
  traceId?: string
): APIError => {
  return new APIError(
    429,
    ErrorCodes.TOO_MANY_REQUESTS,
    'Rate limit exceeded',
    {
      limit,
      windowMs,
      retryAfter: Math.ceil(windowMs / 1000),
    },
    traceId
  );
};

/**
 * Internal Error Creator.
 * Helper to create internal server errors with optional details.
 *
 * @param message
 * @param details
 * @param traceId
 */
export const createInternalError = (
  message: string,
  details?: Record<string, unknown>,
  traceId?: string
): APIError => {
  return new APIError(
    500,
    ErrorCodes.INTERNAL_SERVER_ERROR,
    message,
    details,
    traceId
  );
};
