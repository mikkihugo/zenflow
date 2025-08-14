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
const generateRequestId = () => {
    return `req-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
};
const getClientIp = (req) => {
    return (req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
        req.headers['x-real-ip'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        'unknown');
};
const getRequestSize = (req) => {
    const contentLength = req.headers['content-length'];
    if (contentLength) {
        return Number.parseInt(contentLength, 10);
    }
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
const getResponseSize = (res) => {
    const contentLength = res.get('content-length');
    if (contentLength) {
        return Number.parseInt(contentLength, 10);
    }
    return 0;
};
const formatDuration = (milliseconds) => {
    if (milliseconds < 1000) {
        return `${milliseconds.toFixed(2)}ms`;
    }
    return `${(milliseconds / 1000).toFixed(2)}s`;
};
const getLogLevelFromStatus = (statusCode) => {
    if (statusCode >= 500)
        return LogLevel.ERROR;
    if (statusCode >= 400)
        return LogLevel.WARNING;
    if (statusCode >= 300)
        return LogLevel.INFO;
    return LogLevel.INFO;
};
const shouldLog = (path, _method) => {
    if (process.env['NODE_ENV'] === 'production' && path === '/health') {
        return false;
    }
    if (path.startsWith('/static/') || path.endsWith('.ico')) {
        return false;
    }
    return true;
};
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
            first: !res,
            last: !!res,
        },
        metadata: metadata ? sanitizeData(metadata) : undefined,
    };
    return logEntry;
};
const outputLog = (logEntry) => {
    if (process.env['NODE_ENV'] === 'development') {
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
export const requestLogger = (req, res, next) => {
    const requestId = generateRequestId();
    const startTime = Date.now();
    req.metadata = {
        requestId,
        startTime,
        userAgent: req.headers['user-agent'],
        remoteIp: getClientIp(req),
        referer: req.headers.referer,
    };
    res.setHeader('X-Request-ID', requestId);
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
    const originalEnd = res.end;
    res.end = function (chunk, encoding) {
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
        return originalEnd.call(this, chunk, encoding);
    };
    next();
};
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
export const logPerformance = (operation, duration, req, metadata) => {
    const level = duration > 5000 ? LogLevel.WARNING : LogLevel.INFO;
    const logEntry = createLogEntry(level, `Performance: ${operation} took ${formatDuration(duration)}`, req, undefined, {
        operation,
        duration: `${duration}ms`,
        performanceMetrics: metadata,
    });
    outputLog(logEntry);
};
export const log = (level, message, req, metadata) => {
    if (req) {
        const logEntry = createLogEntry(level, message, req, undefined, metadata);
        outputLog(logEntry);
    }
    else {
        const logEntry = {
            timestamp: new Date().toISOString(),
            level,
            message,
            metadata: metadata ? sanitizeData(metadata) : undefined,
        };
        outputLog(logEntry);
    }
};
//# sourceMappingURL=logging.js.map