import { getLogger } from '../../../../config/logging-config.js';
const logger = getLogger('interfaces-api-http-middleware-errors');
export const ErrorCodes = {
    BAD_REQUEST: 'INVALID_REQUEST',
    UNAUTHORIZED: 'AUTHENTICATION_REQUIRED',
    FORBIDDEN: 'PERMISSION_DENIED',
    NOT_FOUND: 'RESOURCE_NOT_FOUND',
    METHOD_NOT_ALLOWED: 'METHOD_NOT_SUPPORTED',
    CONFLICT: 'RESOURCE_CONFLICT',
    UNPROCESSABLE_ENTITY: 'VALIDATION_FAILED',
    TOO_MANY_REQUESTS: 'RATE_LIMIT_EXCEEDED',
    INTERNAL_SERVER_ERROR: 'INTERNAL_ERROR',
    NOT_IMPLEMENTED: 'FEATURE_NOT_IMPLEMENTED',
    BAD_GATEWAY: 'UPSTREAM_ERROR',
    SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
    GATEWAY_TIMEOUT: 'TIMEOUT_ERROR',
};
export class APIError extends Error {
    statusCode;
    code;
    details;
    traceId;
    constructor(statusCode, code, message, details, traceId) {
        super(message);
        this.name = 'APIError';
        this.statusCode = statusCode;
        this.code = code;
        this.details = details;
        this.traceId = traceId;
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, APIError);
        }
    }
}
const generateTraceId = () => {
    return `trace-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
};
const _getErrorCodeFromStatus = (statusCode) => {
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
export const errorHandler = (error, req, res, _next) => {
    const traceId = generateTraceId();
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
    let statusCode;
    let code;
    let message;
    let details;
    if (error instanceof APIError) {
        statusCode = error.statusCode;
        code = error.code;
        message = error.message;
        details = error.details;
    }
    else if (error.name === 'ValidationError') {
        statusCode = 422;
        code = ErrorCodes.UNPROCESSABLE_ENTITY;
        message = 'Request validation failed';
        details = {
            validationErrors: error.errors || error.message,
        };
    }
    else if (error.name === 'SyntaxError' && 'body' in error) {
        statusCode = 400;
        code = ErrorCodes.BAD_REQUEST;
        message = 'Invalid JSON in request body';
        details = {
            parseError: error.message,
        };
    }
    else if (error.message.includes('ENOTFOUND') ||
        error.message.includes('ECONNREFUSED')) {
        statusCode = 502;
        code = ErrorCodes.BAD_GATEWAY;
        message = 'External service unavailable';
        details = {
            networkError: error.message,
        };
    }
    else if (error.message.includes('timeout')) {
        statusCode = 504;
        code = ErrorCodes.GATEWAY_TIMEOUT;
        message = 'Request timeout';
        details = {
            timeoutError: error.message,
        };
    }
    else {
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
    const errorResponse = {
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
    res.status(statusCode).json(errorResponse);
};
export const notFoundHandler = (req, res) => {
    const errorResponse = {
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
export const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
export const createValidationError = (field, value, message, traceId) => {
    return new APIError(422, ErrorCodes.UNPROCESSABLE_ENTITY, `Validation failed for field '${field}'`, {
        field,
        value,
        validationMessage: message,
    }, traceId);
};
export const createNotFoundError = (resource, identifier, traceId) => {
    return new APIError(404, ErrorCodes.NOT_FOUND, `${resource} not found`, {
        resource,
        identifier,
    }, traceId);
};
export const createConflictError = (resource, reason, traceId) => {
    return new APIError(409, ErrorCodes.CONFLICT, `${resource} conflict: ${reason}`, {
        resource,
        conflictReason: reason,
    }, traceId);
};
export const createRateLimitError = (limit, windowMs, traceId) => {
    return new APIError(429, ErrorCodes.TOO_MANY_REQUESTS, 'Rate limit exceeded', {
        limit,
        windowMs,
        retryAfter: Math.ceil(windowMs / 1000),
    }, traceId);
};
export const createInternalError = (message, details, traceId) => {
    return new APIError(500, ErrorCodes.INTERNAL_SERVER_ERROR, message, details, traceId);
};
//# sourceMappingURL=errors.js.map