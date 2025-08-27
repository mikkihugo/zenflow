/**
 * Request Logging Middleware.
 *
 * Comprehensive request/response logging following Google standards.
 * Provides structured logging with performance metrics and tracing.
 *
 * @file Express logging middleware with performance monitoring.
 */
import { getLogger } from '@claude-zen/foundation';
const logger = getLogger('interfaces-api-http-middleware-logging');
// Constants
const CONTENT_TYPE_HEADER = 'content-type';
const CACHE_CONTROL_HEADER = 'cache-control';
const CONTENT_LENGTH_HEADER = 'content-length';
/**
 * Log levels following Google Cloud Logging standards.
 */
export var LogLevel;
(function (LogLevel) {
    LogLevel["DEBUG"] = "DEBUG";
    LogLevel["INFO"] = "INFO";
    LogLevel["NOTICE"] = "NOTICE";
    LogLevel["WARNING"] = "WARNING";
    LogLevel["ERROR"] = "ERROR";
    LogLevel["CRITICAL"] = "CRITICAL";
    LogLevel["ALERT"] = "ALERT";
    LogLevel["EMERGENCY"] = "EMERGENCY";
})(LogLevel || (LogLevel = {}));
/**
 * Generate unique request ID for tracing.
 * Uses timestamp + random string for uniqueness.
 */
const generateRequestId = () => `req-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
/**
 * Get client IP address from request.
 * Handles various proxy headers and fallbacks.
 *
 * @param req Express request object
 */
const getClientIp = (req) => req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.headers['x-real-ip'] ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    'unknown';
/**
 * Calculate request body size in bytes.
 * Estimates size from content-length header or body object.
 *
 * @param req Express request object
 */
const getRequestSize = (req) => {
    const contentLength = req.headers[CONTENT_LENGTH_HEADER];
    if (contentLength) {
        return Number.parseInt(contentLength, 10);
    }
    // Estimate size from body if available
    if (req.body) {
        try {
            return JSON.stringify(req.body).length;
        }
        catch {
            return 0;
        }
    }
    return 0;
};
/**
 * Calculate response body size in bytes.
 * Gets size from content-length response header.
 *
 * @param res Express response object
 */
const getResponseSize = (res) => {
    const contentLength = res.get(CONTENT_LENGTH_HEADER);
    if (contentLength) {
        return Number.parseInt(contentLength, 10);
    }
    return 0;
};
/**
 * Format duration in human-readable format.
 * Converts milliseconds to appropriate unit (ms/s).
 *
 * @param milliseconds Duration in milliseconds
 */
const formatDuration = (milliseconds) => {
    if (milliseconds < 1000) {
        return `${milliseconds.toFixed(2)}ms`;
    }
    return `${(milliseconds / 1000).toFixed(2)}s`;
};
/**
 * Determine log level based on HTTP status code.
 * Maps status codes to appropriate log severity levels.
 *
 * @param statusCode HTTP response status code
 */
const getLogLevelFromStatus = (statusCode) => {
    if (statusCode >= 500)
        return LogLevel.ERROR;
    if (statusCode >= 400)
        return LogLevel.WARNING;
    if (statusCode >= 300)
        return LogLevel.INFO;
    return LogLevel.INFO;
};
/**
 * Check if route should be logged.
 * Excludes health checks and static assets from verbose logging.
 *
 * @param path Request path
 * @param _method HTTP method (unused but available for extension)
 */
const shouldLog = (path, method) => {
    // Skip logging for health checks in production
    if (process.env.NODE_ENV === 'production' && path === '/health') {
        return false;
    }
    // Skip static assets
    if (path.startsWith('/static/') || path.endsWith('.ico')) {
        return false;
    }
    // Skip OPTIONS requests for CORS preflight (reduce noise)
    return method !== 'OPTIONS';
};
/**
 * Sanitize sensitive data from request/response.
 * Removes or masks sensitive information before logging.
 *
 * @param data Data object to sanitize
 */
const sanitizeData = (data) => {
    if (!data || typeof data !== 'object') {
        return data;
    }
    const sensitiveFields = [
        'password',
        'token',
        'key',
        'secret',
        'auth',
        'authorization',
        'cookie',
        'session',
        'csrf',
        'api_key',
        'apikey',
    ];
    const sanitized = { ...data };
    for (const field of sensitiveFields) {
        if (field in sanitized) {
            sanitized[field] = '[REDACTED]';
        }
    }
    return sanitized;
};
/**
 * Create structured log entry.
 * Builds standardized log entry with all metadata.
 */
const createLogEntry = ({ level, message, req, res, metadata, }) => {
    const requestMetadata = req.metadata;
    const duration = res ? Date.now() - requestMetadata?.startTime : undefined;
    const logEntry = {
        timestamp: new Date().toISOString(),
        level,
        message,
        httpRequest: {
            requestMethod: req.method,
            requestUrl: req.originalUrl || req.url,
            requestSize: getRequestSize(req),
            status: res?.statusCode,
            responseSize: res ? getResponseSize(res) : undefined,
            userAgent: requestMetadata?.userAgent,
            remoteIp: requestMetadata?.remoteIp,
            referer: requestMetadata?.referer,
            latency: duration ? formatDuration(duration) : undefined,
            protocol: req.protocol,
        },
        trace: requestMetadata?.requestId,
        operation: {
            id: requestMetadata?.requestId,
            producer: 'claude-zen-flow-api',
            first: !res,
            // First log entry for request
            last: !!res,
            // Last log entry for response
        },
        metadata: metadata ? sanitizeData(metadata) : undefined,
    };
    return logEntry;
};
/**
 * Output log entry to console or logging service.
 * In production, this would typically send to a logging service like Google Cloud Logging.
 *
 * @param logEntry Structured log entry to output
 */
const outputLog = (logEntry) => {
    if (process.env.NODE_ENV === 'development') {
        // Pretty print for development
        const { httpRequest, level, message, metadata } = logEntry;
        const duration = httpRequest?.latency || '';
        const status = httpRequest?.status || '';
        const method = httpRequest?.requestMethod || '';
        const url = httpRequest?.requestUrl || '';
        if (httpRequest) {
            logger.info(`${method} ${url} ${status} ${duration}`);
            if (level === LogLevel.ERROR && metadata) {
                logger.error('Error details:', metadata);
            }
        }
        else {
            logger.info(`${level} ${message}`);
        }
        if (metadata && level !== LogLevel.ERROR) {
            logger.debug('Metadata:', metadata);
        }
    }
    else {
        // Production: JSON format for structured logging
        logger.info(JSON.stringify(logEntry));
    }
};
/**
 * Request Start Logging Middleware.
 * Logs incoming requests and sets up metadata for response logging.
 *
 * @param req Express request object
 * @param res Express response object
 * @param next Next middleware function
 */
export const requestLogger = (req, res, next) => {
    const requestId = generateRequestId();
    const startTime = Date.now();
    // Attach metadata to request for later use
    req.metadata = {
        requestId,
        startTime,
        userAgent: req.headers['user-agent'],
        remoteIp: getClientIp(req),
        referer: req.headers.referer,
    };
    // Set request ID header for client tracing
    res.setHeader('X-Request-ID', requestId);
    // Log request start (only if should be logged)
    if (shouldLog(req.path, req.method)) {
        const logEntry = createLogEntry({
            level: LogLevel.INFO,
            message: 'Request started',
            req,
            metadata: {
                query: sanitizeData(req.query),
                body: req.method !== 'GET' ? sanitizeData(req.body) : undefined,
                headers: sanitizeData({
                    [CONTENT_TYPE_HEADER]: req.headers[CONTENT_TYPE_HEADER],
                    accept: req.headers.accept,
                    [CACHE_CONTROL_HEADER]: req.headers[CACHE_CONTROL_HEADER],
                }),
            },
        });
        outputLog(logEntry);
    }
    // Hook into response finish event
    const originalEnd = res.end;
    res.end = function (chunk, encoding, cb) {
        // Log response completion
        if (shouldLog(req.path, req.method)) {
            const level = getLogLevelFromStatus(res.statusCode);
            const duration = Date.now() - startTime;
            const logEntry = createLogEntry({
                level,
                message: 'Request completed',
                req,
                res,
                metadata: {
                    duration: `${duration}ms`,
                    responseHeaders: sanitizeData({
                        [CONTENT_TYPE_HEADER]: res.get(CONTENT_TYPE_HEADER),
                        [CACHE_CONTROL_HEADER]: res.get(CACHE_CONTROL_HEADER),
                        [CONTENT_LENGTH_HEADER]: res.get(CONTENT_LENGTH_HEADER),
                    }),
                },
            });
            outputLog(logEntry);
        }
        // Call original end method
        return originalEnd.call(this, chunk, encoding, cb);
    };
    next();
};
/**
 * Error Logging Function.
 * Logs errors with full context and request metadata.
 *
 * @param error Error object to log
 * @param req Express request object
 * @param additionalContext Additional context to include in log
 */
export const logError = (error, req, additionalContext) => {
    const logEntry = createLogEntry({
        level: LogLevel.ERROR,
        message: `Error: ${error.message}`,
        req,
        metadata: {
            error: {
                name: error.name,
                message: error.message,
                stack: error.stack,
            },
            context: additionalContext,
        },
    });
    outputLog(logEntry);
};
/**
 * Performance Logging Function.
 * Logs performance metrics for critical operations.
 *
 * @param operation Operation name being logged
 * @param duration Operation duration in milliseconds
 * @param req Express request object
 * @param metadata Additional performance metadata
 */
export const logPerformance = (operation, duration, req, metadata) => {
    const level = duration > 5000 ? LogLevel.WARNING : LogLevel.INFO;
    const logEntry = createLogEntry({
        level,
        message: `Performance: ${operation} took ${formatDuration(duration)}`,
        req,
        metadata: {
            operation,
            duration: `${duration}ms`,
            performanceMetric: metadata,
        },
    });
    outputLog(logEntry);
};
/**
 * Custom Log Function.
 * Allows custom structured logging throughout the application.
 *
 * @param level Log level
 * @param message Log message
 * @param req Express request object (optional)
 * @param metadata Additional metadata to include
 */
export const log = (level, message, req, metadata) => {
    if (req) {
        const logEntry = createLogEntry({ level, message, req, metadata });
        outputLog(logEntry);
    }
    else {
        // Simple log without request context
        const logEntry = {
            timestamp: new Date().toISOString(),
            level,
            message,
            metadata: metadata ? sanitizeData(metadata) : undefined,
        };
        outputLog(logEntry);
    }
};
/**
 * Database Operation Logging Function.
 * Specialized logging for database operations with query metrics.
 */
export const logDatabaseOperation = ({ operation, table, duration, rowCount, req, metadata, }) => {
    const level = duration > 1000 ? LogLevel.WARNING : LogLevel.DEBUG;
    const logEntry = createLogEntry({
        level,
        message: `Database: ${operation} on ${table}`,
        req,
        metadata: {
            database: {
                operation,
                table,
                duration: `${duration}ms`,
                rowCount,
                slow: duration > 1000,
            },
            ...metadata,
        },
    });
    outputLog(logEntry);
};
/**
 * External Service Logging Function.
 * Specialized logging for external service calls with response metrics.
 */
export const logExternalService = ({ service, operation, duration, statusCode, req, metadata, }) => {
    const level = statusCode >= 400 || duration > 5000 ? LogLevel.WARNING : LogLevel.INFO;
    const logEntry = createLogEntry({
        level,
        message: `External: ${service} ${operation}`,
        req,
        metadata: {
            externalService: {
                service,
                operation,
                duration: `${duration}ms`,
                statusCode,
                success: statusCode < 400,
                slow: duration > 5000,
            },
            ...metadata,
        },
    });
    outputLog(logEntry);
};
export default {
    logLevel: LogLevel,
    requestLogger,
    logError,
    logPerformance,
    log,
    logDatabaseOperation,
    logExternalService,
};
