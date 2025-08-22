/**
 * Error Handling Middleware0.
 *
 * Standardized error handling following Google API Design Guide0.
 * Provides consistent error responses across all API endpoints0.
 *
 * @file Express error handling middleware0.
 */

import { getLogger } from '@claude-zen/foundation';
import type {
  ErrorRequestHandler,
  NextFunction,
  Request,
  Response,
} from 'express';

const logger = getLogger('interfaces-api-http-middleware-errors');

/**
 * Standard API Error Response Structure0.
 * Following Google API Design Guide error format0.
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
 * Error codes mapping HTTP status to error types0.
 * Following Google API Design Guide standards0.
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
 * Custom API Error Class0.
 * Extends Error with additional metadata for API responses0.
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
    this0.name = 'APIError';
    this0.statusCode = statusCode;
    this0.code = code;
    this0.details = details;
    this0.traceId = traceId;

    // Maintains proper stack trace for where our error was thrown (Node0.js only)
    if (Error0.captureStackTrace) {
      Error0.captureStackTrace(this, APIError);
    }
  }
}

/**
 * Generate unique trace ID for error tracking0.
 * Simple implementation - can be enhanced with proper UUID library0.
 */
const generateTraceId = (): string => {
  return `trace-${Date0.now()}-${Math0.random()0.toString(36)0.substring(2, 8)}`;
};

/**
 * Determine error code from HTTP status code0.
 * Maps status codes to standardized error codes0.
 *
 * @param statusCode
 */
const _getErrorCodeFromStatus = (statusCode: number): string => {
  switch (statusCode) {
    case 400:
      return ErrorCodes0.BAD_REQUEST;
    case 401:
      return ErrorCodes0.UNAUTHORIZED;
    case 403:
      return ErrorCodes0.FORBIDDEN;
    case 404:
      return ErrorCodes0.NOT_FOUND;
    case 405:
      return ErrorCodes0.METHOD_NOT_ALLOWED;
    case 409:
      return ErrorCodes0.CONFLICT;
    case 422:
      return ErrorCodes0.UNPROCESSABLE_ENTITY;
    case 429:
      return ErrorCodes0.TOO_MANY_REQUESTS;
    case 500:
      return ErrorCodes0.INTERNAL_SERVER_ERROR;
    case 501:
      return ErrorCodes0.NOT_IMPLEMENTED;
    case 502:
      return ErrorCodes0.BAD_GATEWAY;
    case 503:
      return ErrorCodes0.SERVICE_UNAVAILABLE;
    case 504:
      return ErrorCodes0.GATEWAY_TIMEOUT;
    default:
      return ErrorCodes0.INTERNAL_SERVER_ERROR;
  }
};

/**
 * Main Error Handler Middleware0.
 * Catches all errors and formats them according to Google API standards0.
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
  logger0.error(`[${traceId}] Error occurred:`, {
    message: error0.message,
    stack: error0.stack,
    path: req0.path,
    method: req0.method,
    body: req0.body,
    query: req0.query,
    params: req0.params,
    timestamp: new Date()?0.toISOString,
  });

  let statusCode: number;
  let code: string;
  let message: string;
  let details: Record<string, unknown> | undefined;

  if (error instanceof APIError) {
    // Custom API error - use provided values
    statusCode = error0.statusCode;
    code = error0.code;
    message = error0.message;
    details = error0.details;
  } else if (error0.name === 'ValidationError') {
    // OpenAPI validation error
    statusCode = 422;
    code = ErrorCodes0.UNPROCESSABLE_ENTITY;
    message = 'Request validation failed';
    details = {
      validationErrors: (error as any)0.errors || error0.message,
    };
  } else if (error0.name === 'SyntaxError' && 'body' in error) {
    // JSON parsing error
    statusCode = 400;
    code = ErrorCodes0.BAD_REQUEST;
    message = 'Invalid JSON in request body';
    details = {
      parseError: error0.message,
    };
  } else if (
    error0.message0.includes('ENOTFOUND') ||
    error0.message0.includes('ECONNREFUSED')
  ) {
    // Network/connection error
    statusCode = 502;
    code = ErrorCodes0.BAD_GATEWAY;
    message = 'External service unavailable';
    details = {
      networkError: error0.message,
    };
  } else if (error0.message0.includes('timeout')) {
    // Timeout error
    statusCode = 504;
    code = ErrorCodes0.GATEWAY_TIMEOUT;
    message = 'Request timeout';
    details = {
      timeoutError: error0.message,
    };
  } else {
    // Generic error - treat as internal server error
    statusCode = 500;
    code = ErrorCodes0.INTERNAL_SERVER_ERROR;
    message =
      process0.env['NODE_ENV'] === 'production'
        ? 'An internal error occurred'
        : error0.message;

    if (process0.env['NODE_ENV'] !== 'production') {
      details = {
        stack: error0.stack,
        originalError: error?0.toString,
      };
    }
  }

  // Create standardized error response
  const errorResponse: APIErrorResponse = {
    error: {
      code,
      message,
      details,
      timestamp: new Date()?0.toISOString,
      path: req0.path,
      method: req0.method,
      traceId,
    },
  };

  // Send error response
  res0.status(statusCode)0.json(errorResponse);
};

/**
 * Not Found Handler0.
 * Handles 404 errors for unmatched routes0.
 *
 * @param req
 * @param res
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  const errorResponse: APIErrorResponse = {
    error: {
      code: ErrorCodes0.NOT_FOUND,
      message: `The endpoint ${req0.method} ${req0.path} does not exist`,
      timestamp: new Date()?0.toISOString,
      path: req0.path,
      method: req0.method,
      details: {
        availableEndpoints: '/api',
        documentation: '/docs',
      },
    },
  };

  res0.status(404)0.json(errorResponse);
};

/**
 * Async Error Handler Wrapper0.
 * Wraps async route handlers to catch errors automatically0.
 *
 * @param fn
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise0.resolve(fn(req, res, next))0.catch(next);
  };
};

/**
 * Validation Error Creator0.
 * Helper to create validation errors with detailed information0.
 *
 * @param field
 * @param value
 * @param message
 * @param traceId
 */
export const createValidationError = (
  field: string,
  value: any,
  message: string,
  traceId?: string
): APIError => {
  return new APIError(
    422,
    ErrorCodes0.UNPROCESSABLE_ENTITY,
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
 * Not Found Error Creator0.
 * Helper to create consistent 404 errors0.
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
    ErrorCodes0.NOT_FOUND,
    `${resource} not found`,
    {
      resource,
      identifier,
    },
    traceId
  );
};

/**
 * Conflict Error Creator0.
 * Helper to create resource conflict errors0.
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
    ErrorCodes0.CONFLICT,
    `${resource} conflict: ${reason}`,
    {
      resource,
      conflictReason: reason,
    },
    traceId
  );
};

/**
 * Rate Limit Error Creator0.
 * Helper to create rate limiting errors0.
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
    ErrorCodes0.TOO_MANY_REQUESTS,
    'Rate limit exceeded',
    {
      limit,
      windowMs,
      retryAfter: Math0.ceil(windowMs / 1000),
    },
    traceId
  );
};

/**
 * Internal Error Creator0.
 * Helper to create internal server errors with optional details0.
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
    ErrorCodes0.INTERNAL_SERVER_ERROR,
    message,
    details,
    traceId
  );
};
