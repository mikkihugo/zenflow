/**
 * Request Logging Middleware.
 *
 * Comprehensive request/response logging following Google standards.
 * Provides structured logging with performance metrics and tracing.
 *
 * @file Express logging middleware with performance monitoring.
 */
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
 */
const generateRequestId = () => {
    return `req-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
};
/**
 * Get client IP address from request.
 * Handles various proxy headers.
 *
 * @param req
 */
const getClientIp = (req) => {
    return (req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
        req.headers['x-real-ip'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        'unknown');
};
/**
 * Calculate request body size.
 *
 * @param req
 */
const getRequestSize = (req) => {
    const contentLength = req.headers['content-length'];
    if (contentLength) {
        return parseInt(contentLength, 10);
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
 * Calculate response body size.
 *
 * @param res
 */
const getResponseSize = (res) => {
    const contentLength = res.get('content-length');
    if (contentLength) {
        return parseInt(contentLength, 10);
    }
    return 0;
};
/**
 * Format duration in human-readable format.
 *
 * @param milliseconds
 */
const formatDuration = (milliseconds) => {
    if (milliseconds < 1000) {
        return `${milliseconds.toFixed(2)}ms`;
    }
    return `${(milliseconds / 1000).toFixed(2)}s`;
};
/**
 * Determine log level based on HTTP status code.
 *
 * @param statusCode
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
 * Excludes health checks and internal routes from verbose logging.
 *
 * @param path
 * @param _method
 */
const shouldLog = (path, _method) => {
    // Skip logging for health checks in production
    if (process.env['NODE_ENV'] === 'production' && path === '/health') {
        return false;
    }
    // Skip static assets
    if (path.startsWith('/static/') || path.endsWith('.ico')) {
        return false;
    }
    return true;
};
/**
 * Sanitize sensitive data from request/response.
 * Removes or masks sensitive information.
 *
 * @param data
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
 *
 * @param level
 * @param message
 * @param req
 * @param res
 * @param metadata
 */
const createLogEntry = (level, message, req, res, metadata) => {
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
            first: !res, // First log entry for request
            last: !!res, // Last log entry for response
        },
        metadata: metadata ? sanitizeData(metadata) : undefined,
    };
    return logEntry;
};
/**
 * Output log entry to console.
 * In production, this would typically send to a logging service.
 *
 * @param logEntry
 */
const outputLog = (logEntry) => {
    if (process.env['NODE_ENV'] === 'development') {
        // Pretty print for development
        const { httpRequest, timestamp, level, message } = logEntry;
        const _duration = httpRequest?.latency || '';
        const _status = httpRequest?.status || '';
        const _method = httpRequest?.requestMethod || '';
        const _url = httpRequest?.requestUrl || '';
        if (httpRequest) {
        }
        if (logEntry.metadata) {
        }
    }
    else {
    }
};
/**
 * Request Start Logging Middleware.
 * Logs incoming requests and sets up metadata.
 *
 * @param req
 * @param res
 * @param next
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
        const logEntry = createLogEntry(LogLevel.INFO, 'Request started', req, undefined, {
            query: sanitizeData(req.query),
            body: req.method !== 'GET' ? sanitizeData(req.body) : undefined,
            headers: sanitizeData({
                'content-type': req.headers['content-type'],
                accept: req.headers.accept,
                'cache-control': req.headers['cache-control'],
            }),
        });
        outputLog(logEntry);
    }
    // Hook into response finish event
    const originalEnd = res.end;
    res.end = function (chunk, encoding) {
        // Log response completion
        if (shouldLog(req.path, req.method)) {
            const level = getLogLevelFromStatus(res.statusCode);
            const duration = Date.now() - startTime;
            const logEntry = createLogEntry(level, 'Request completed', req, res, {
                duration: `${duration}ms`,
                responseHeaders: sanitizeData({
                    'content-type': res.get('content-type'),
                    'cache-control': res.get('cache-control'),
                    'content-length': res.get('content-length'),
                }),
            });
            outputLog(logEntry);
        }
        // Call original end method
        return originalEnd.call(this, chunk, encoding);
    };
    next();
};
/**
 * Error Logging Function.
 * Logs errors with full context.
 *
 * @param error
 * @param req
 * @param additionalContext
 */
export const logError = (error, req, additionalContext) => {
    const logEntry = createLogEntry(LogLevel.ERROR, `Error: ${error.message}`, req, undefined, {
        error: {
            name: error.name,
            message: error.message,
            stack: error.stack,
        },
        context: additionalContext,
    });
    outputLog(logEntry);
};
/**
 * Performance Logging Function.
 * Logs performance metrics for critical operations.
 *
 * @param operation
 * @param duration
 * @param req
 * @param metadata
 */
export const logPerformance = (operation, duration, req, metadata) => {
    const level = duration > 5000 ? LogLevel.WARNING : LogLevel.INFO;
    const logEntry = createLogEntry(level, `Performance: ${operation} took ${formatDuration(duration)}`, req, undefined, {
        operation,
        duration: `${duration}ms`,
        performanceMetrics: metadata,
    });
    outputLog(logEntry);
};
/**
 * Custom Log Function.
 * Allows custom structured logging throughout the application.
 *
 * @param level
 * @param message
 * @param req
 * @param metadata
 */
export const log = (level, message, req, metadata) => {
    if (req) {
        const logEntry = createLogEntry(level, message, req, undefined, metadata);
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
