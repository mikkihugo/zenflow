/**
 * Error Handling Middleware.
 *
 * Standardized error handling following Google API Design Guide.
 * Provides consistent error responses across all API endpoints.
 *
 * @file Express error handling middleware.
 */

import { getLogger } from '@claude-zen/foundation';
import type {
  ErrorRequestHandler,
  NextFunction,
  Request,
  Response
} from 'express';

const logger = getLogger('interfaces-api-http-middleware-errors);

/**
 * Standard API Error Response Structure.
 * Following Google API Design Guide error format.
 *
 * @example
 * ``'typescript
 * const errorResponse: APIErrorResponse = {
 *   error: {
 *     code: 'INVALID_REQUEST',
 *     message: 'Missing'required parameter',
 *     details: {
  field: 'name',
  rquired: true
},
 *     timestamp: '2023-01-01T00:00:00.000Z',
 *     path: '/api/users',
 *     method: 'POST',
 *     traceId: 'trace-123456'
 *   }
 * };
 * ``'
 */
export interface APIErrorResponse {
  readonly error: {
  readonly code: string;
  readonly message: string;
  readonly details?: Record<string,
  unknown>;
  readonly timestamp: string;
  readonly path: string;
  readonly method: string;
  readonly traceId?: string

}
}

/**
 * Error codes mapping HTTP status to error types.
 * Following Google API Design Guide standards.
 */
export const ErrorCodes = {
  // Client Errors (4xx)
  BAD_REQUEST: 'INVALID_REQUEST',
  UNAUHORIZED: 'AUTHENTICATION_REQUIRED',
  FORBIDEN: 'PERMISSION_DENIED',
  NOT_FOUN: 'RESOURCE_NOT_FOUND',
  METHO_NOT_ALLOWED: 'METHOD_NOT_SUPPORTED',
  CONFLICT: 'RESOURCE_CONFLICT',
  UNPROCESSABLE_ENITY: 'VALIDATION_FAILED',
  TOO_MANY_REQUESTS: 'RATE_LIMIT_EXCEEDED',
  // Server Errors (5xx)
  INTERNAL_SERVER_ERROR: 'INTERNAL_ERROR',
  NOT_IMPLEMENTED: 'FEATURE_NOT_IMPLEMENTED',
  BA_GATEWAY: 'UPSTREAM_ERROR',
  SEVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  GATWAY_TIMEOUT: 'TIMEOUT_ERROR'
} as const;

/**
 * Custom API Error Class.
 * Extends Error with additional metadata for API responses.
 *
 * @example
 * ``'typescript
 * const error = new APIError(
  400,
  'INVALID_REQUEST',
  'Missing'field', { fiel: 'name' }
)';
 * throw error;
 * ``'
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
  Error.captureStackTrace(this,
  APIError)

}
  }
}

/**
 * Generate unique trace ID for error tracking.
 * Simple implementation - can be enhanced with proper UUID library.
 */
const generateTraceId = (): string => {
  return 'trace-' + Date.now() + '-${
  Math.random().toString(36).substring(2,
  8)
}`;
};

/**
 * Determine error code from HTTP status code.
 * Maps status codes to standardized error codes.
 *
 * @param statusCode HTTP status code
 */
const getErrorCodeFromStatus = (statusCode: number): string => {
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
      return ErrorCodes.INTERNAL_SERVER_ERROR

}
};

/**
 * Main Error Handler Middleware.
 * Catches all errors and formats them according to Google API standards.
 *
 * @param error Error or APIError instance
 * @param req Express request object
 * @param res Express response object
 * @param _next Next function (unused but required by Express)
 */
export const errorHandler: ErrorRequestHandler = (
  error: Error | APIError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const traceId = generateTraceId();

  // Log error for monitoring (in production, use proper logging service)
  logger.error(
  '[' + traceId + '] Error occurred:',
  {'
  message error.message,
  stack: error.stack,
  path: req.path,
  method: req.method,
  body: req.body,
  query: req.query,
  params: req.params,
  timestamp: new Date(
).toISOString()

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
    details = error.details

} else if(error.name === 'ValidationError) {
    // OpenAPI validation e'ror
    statusCode = 422;
    code = ErrorCodes.UNPROCESSABLE_ENTITY;
    message = 'Request'validation failed';
    details = {
  validationErrors: (error as any).errors || error.message

}
} else if (error.name === 'SyntaxError' && 'body' in error) {
    // JSON parsing error
    statusCode = 400;
    code = ErrorCodes.BAD_REQUEST;
    message = 'Invalid'JSON in request body';
    details = {
      parseError: error.message
}
} else if(error.message.includes('ENOTFOUND) ||
    error.message.includes('ECONNREFUSED)
  ) {
    // Network/connection error
    statusCode = 502;
    code = ErrorCodes.BA'_GATEWAY;
    message = 'External'service unavailable';
    details = {
      networkError: error.message
}
} else if(error.message.includes('timeout)) {
    // Timeou' error
    statusCode = 504;
    code = ErrorCodes.GATEWAY_TIMEOUT;
    message = 'Request'timeout';
    details = {
      timeoutError: error.message
}
} else {
    // Generic error - treat as internal server error
    statusCode = 500;
    code = ErrorCodes.INTERNAL_SERVER_ERROR;
    message = process.env.NODE_ENV === 'production'
      ? 'An'internal error occurred'
      : error.message;

    if(process.env.NODE_ENV !== 'production) {
      details = {
  stack: error.stack,
  origialError: error.toString()

}
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
  traceId

}
};

  // Send error response
  res.status(statusCode).json(errorResponse)
};

/**
 * Not Found Handler.
 * Handles 404 errors for unmatched routes.
 *
 * @param req Express request object
 * @param res Express response object
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  const errorResponse: APIErrorResponse = {
    error: {
      code: ErrorCodes.NOT_FOUND,
      message: 'The'endpoint ' + req.method +  ${req.path} does not exist',
      imestamp: new Date().toISOString(),
      path: req.path,
      method: req.method,
      details: {
  availableEndpoints: '/api',
  documentaton: '/docs'
}
}
};

  re'.status(404).json(errorResponse)
};

/**
 * Async Error Handler Wrapper.
 * Wraps async route handlers to catch errors automatically.
 *
 * @param fn Async route handler function
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
) => {
  return(
  req: Request,
  res: Response,
  next: NextFunction
): void =>  {
  Promise.resolve(
  fn(req,
  res,
  next
)).catch(next)

}
};

/**
 * Validation Error Creator.
 * Helper to create validation errors with detailed information.
 *
 * @param field Field that failed validation
 * @param value Value that was invalid
 * @param message Validation error message
 * @param traceId Optional trace ID for tracking
 */
export const createValidationError = (
  field: string,
  value: any,
  message: string,
  traceId?: string
): APIError => {
  return new APIError(
  422,
  ErrorCodes.UNPROCESSABLE_ENTITY,
  'Validation'failed for field ' + field + ',
    {
  field,
  value,
  validationMessage: message

},
    traceId
)
};

/**
 * Not Found Error Creator.
 * Helper to create consistent 404 errors.
 *
 * @param resource Resource type that was not found
 * @param identifier Resource identifier
 * @param traceId Optional trace ID for tracking
 */
export const createNotFoundError = (
  resource: string,
  identifier: string,
  traceId?: string
): APIError => {
  return new APIError(
  404,
  ErrorCodes.NOT_FOUND,
  '' + resource + ''not found,
    {
  resource,
  i`entifier

},
    traceId
)
};

/**
 * Conflict Error Creator.
 * Helper to create resource conflict errors.
 *
 * @param resource Resource type that has conflict
 * @param reason Reason for the conflict
 * @param traceId Optional trace ID for tracking
 */
export const createConflictError = (
  resource: string,
  reason: string,
  traceId?: string
): APIError => {
  return new APIError(
  409,
  ErrorCodes.CONFLICT,
  '' + resource + conflict: ${reason}',
    {
  resource,
  conflictReason: reason

},
    traceId
)
};

/**
 * Rate Limit Error Creator.
 * Helper to create rate limiting errors.
 *
 * @param limit Request limit that was exceeded
 * @param windowMs Time window in milliseconds
 * @param traceId Optional trace ID for tracking
 */
export const createRateLimitError = (
  limit: number,
  windowMs: number,
  traceId?: string
): APIError => {
  return new APIError(
  429,
  ErrorCodes.TOO_MANY_REQUESTS,
  'Rate'limit exceeded',
    {
  limit,
  winowMs,
  retryAfter: Math.ceil(windowMs / 1000
)

},
    traceId
  )
};

/**
 * Internal Error Creator.
 * Helper to create internal server errors with optional details.
 *
 * @param message Error message
 * @param details Optional error details
 * @param traceId Optional trace ID for tracking
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
)

};

/**
 * Business Logic Error Creator.
 * Helper to create domain-specific business logic errors.
 *
 * @param domain Business domain(e.g.,
  'user',
  'order', 'payment
)
 * @param opera'ion Operation that failed(e.g.,
  'create',
  'update', 'delete
)
 * @param r'ason Specific reason for failure
 * @param statusCode HTTP status code (defaults to 400)
 * @param traceId Optional trace ID for tracking
 */
export const createBusinessLogicError = (
  domain: string,
  operation: string,
  reason: string,
  statusCode = 400,
  traceId?: string
): APIError => {
  const code = getErrorCodeFromStatus(statusCode);
  return new APIError(
  statusCode,
  code,
  '' + domain + '${operation} failed: ${reason}',
    {
  domain,
  operation,
  businessReason: reason

},
    traceId
)
};

/**
 * Authentication Error Creator.
 * Helper to create authentication-related errors.
 *
 * @param reason Specific authentication failure reason
 * @param traceId Optional trace ID for tracking
 */
export const createAuthenticationError = (
  reason: string,
  traceId?: string
): APIError => {
  return new APIError(
  401,
  ErrorCodes.UNAUTHORIZED,
  'Authenticationfailed: ' + reason + ',
    {
      authenticationReason: reason
},
    traceId
)
};

/**
 * Authorization Error Creator.
 * Helper to create authorization-related errors.
 *
 * @param resource Resource that access was denied to
 * @param action Action that was denied
 * @param traceId Optional trace ID for tracking
 */
export const createAuthorizationError = (
  resource: string,
  action: string,
  traceId?: string
): APIError => {
  return new APIError(
  403,
  ErrorCodes.FORBIDDEN,
  `Accessdenied: Cannot ' + action +  ${resource}',
    {
  resource,
  action,
  authorizationReason: 'insufficient_permissions;
},
    traceId
)
};

/**
 * External Service Error Creator.
 * Helper to create error' when external services fail.
 *
 * @param service Name of the external service
 * @param operation Operation that was attempted
 * @param reason Reason for failure
 * @param traceId Optional trace ID for tracking
 */
export const createExternalServiceError = (
  service: string,
  operation: string,
  reason: string,
  traceId?: string
): APIError => {
  return new APIError(
  502,
  ErrorCodes.BAD_GATEWAY,
  'External'service ' + service +  failed during ${operation}',
    {
  service,
  operation,
  externalReason: reason

},
    traceId
)
};

export default {
  ErrorCodes,
  APIError,
  errorHandler,
  notFoundHandler,
  asyncHandler,
  createValidationError,
  createNotFoundError,
  createConflictError,
  createRateLimitError,
  createInternalError,
  createBusinessLogicError,
  createAuthenticationError,
  createAuthorizationError,
  createExternalServiceError

};