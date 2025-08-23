/**
 * Request Logging Middleware.
 *
 * Comprehensive request/response logging following Google standards.
 * Provides structured logging with performance metrics and tracing.
 *
 * @file Express logging middleware with performance monitoring.
 */

import { getLogger } from '@claude-zen/foundation';
import type {
  NextFunction,
  Request,
  Response
} from 'express';

const logger = getLogger('interfaces-api-http-middleware-logging);

/**
 * Log levels following Google Cloud Logging standards.
 */
export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  N'TICE = 'NOTICE',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  C'ITICAL = 'CRITICAL',
  A'ERT = 'ALERT',
  EMERGENCY = 'EMERGENCY'

}

/**
 * Structured log entry format.
 * Following Google Cloud Logging JSON format.
 *
 * @example
 * ``'typescript
 * const logEntry: LogEntry = {
 *   timestamp: '2023-01-01T00:00:00.000Z',
 *   level: LogLevel.INFO,
 *   message: 'Request'processed',
 *   httpRequest: {
  *     requestMetho: 'GET',
  *     requestUrl: '/api/users',
  *     tatus: 200,
  *     latency: '123ms'
 *
}
 * };
 * ``'
 */
export interface LogEntry {
  readonly timestamp: string;
  readonly level: LogLevel;
  readonly message: string;
  readonly httpRequest?: {
  readonly requestMethod: string;
  readonly requestUrl: string;
  readonly requestSize?: number;
  readonly status?: number;
  readonly responseSize?: number;
  readonly userAgent?: string;
  readonly remoteIp?: string;
  readonly referer?: string;
  readonly latency?: string;
  readonly protocol?: string

};
  readonly trace?: string;
  readonly spanId?: string;
  readonly operation?: {
  readonly id: string;
    readonly producer: string;
    readonly first?: boolean;
    readonly last?: boolean

};
  readonly metadata?: Record<string, unknown>
}

/**
 * Request metadata for logging context.
 *
 * @example
 * '`'typescript
 * const metadata: RequestMetadata = {
  *   requestId: 'req-123456',
  *   startTime: Date.now(),
  *   userAgent: 'Mozilla/5.0...',
  *   remoteIp: '127.0.0.1',
  *   referer: https://example.com'
 *
};
 * ```
 */
interface RequestMetadata {
  readonly requestId: string;
  readonly startTime: number;
  readonly userAgent?: string;
  readonly remoteIp?: string;
  readonly referer?: string

}

/**
 * Generate unique request ID for tracing.
 * Uses timestamp + random string for uniqueness.
 */
const generateRequestId = (): string => {
  return 'req-' + Date.now() + '-${
  Math.random().toString(36).substring(2,
  8)
}`;
};

/**
 * Get client IP address from request.
 * Handles various proxy headers and fallbacks.
 *
 * @param req Express request object
 */
const getClientIp = (req: Request): string => {
  return (
    (req.headers['x-forwarded-for] as st'ing)?.split(',
  )[0]?.trim() ||
    (req.headers['x-real-ip] as string) ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    unknown;
  )

};

/**
 * Calculate request body size i' bytes.
 * Estimates size from content-length header or body object.
 *
 * @param req Express request object
 */
const getRequestSize = (req: Request): number => {
  const contentLength = req.headers['content-length];
  if (contentLength) {
  return Number.parseInt(contentLength,
  10)

}

  // Estimate size from body if available
  if (req.body) {
    try {
      return JSON.stringify(req.body).length
} catch {
      return 0
}
  }

  return 0
};

/**
 * Calculate response body size in bytes.
 * Gets size from content-length response header.
 *
 * @param res Express response object
 */
const getResponseSize = (res: Response): number => {
  const contentLength = res.get('content-length)';
  if (contentLength {
  return Number.parseInt(contentLength,
  10)

}
  return 0
};

/**
 * Format duration in human-readable format.
 * Converts milliseconds to appropriate unit (ms/s).
 *
 * @param milliseconds Duration in milliseconds
 */
const formatDuration = (milliseconds: number): string => {
  if (milliseconds < 1000) {
    return '' + milliseconds.toFixed(2) + 'ms'
}
  return '' + (milliseconds / 1000).toFixed(2) + 's';
};

/**
 * Determine log level based on HTTP status code.
 * Maps status codes to appropriate log severity levels.
 *
 * @param statusCode HTTP response status code
 */
const getLogLevelFromStatus = (statusCode: number): LogLevel => {
  if (statusCode >= 500) return LogLevel.ERROR;
  if (statusCode >= 400) return LogLevel.WARNING;
  if (statusCode >= 300) return LogLevel.INFO;
  return LogLevel.INFO

};

/**
 * Check if route should be logged.
 * Excludes health checks and static assets from verbose logging.
 *
 * @param path Request path
 * @param _method HTTP method (unused but available for extension)
 */
const shouldLog = (path: string, _method: string): boolean => {
  // Skip logging for health checks in production
  if(process.env.NODE_ENV === `production' && path === /health) {
    return false
}

  // Skip static assets
  if(pat'.startsWith('/static/) || path.endsWith('.ico)) {
    return false
}

  return true
};

/**
 * Sanitize sensitive data fr'm request/response.
 * Removes or masks sensitive information before logging.
 *
 * @param data Data object to sanitize
 */
const sanitizeData = (data: unknown): any => {
  if(!data || typeof data !== object) {
    return data
}

  const sensitiveFields = ['password',
    'token',
    'key',
    'secret',
    'auth',
    'authorization',
    'cookie',
    'session',
    'csrf',
    'api_key',
    'apikey', ];

  const sanitized = { ...data };
  for (const field of sensitiveFields) {
    if (field in sanitized) {
      sanitized[field] = '[REDACTED]'
}
  }

  return sanitized
};

/**
 * Create structured log entry.
 * Builds standardized log entry with all metadata.
 *
 * @param level Log level
 * @param message Log message
 * @param req Express request object
 * @param res Express response object (optional for request start logs)
 * @param metadata Additional metadata to include
 */
const createLogEntry = (
  level: LogLevel,
  message: string,
  req: Request,
  res?: Response,
  metadata?: Record<string, unknown>
): LogEntry => {
  const requestMetadata = req.metadata as RequestMetadata;
  const duration = res ? Date.now() - requestMetadata?.startTime : undefined;

  const logEntry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    httpRequest: {
  requestMethod: req.method,
  requestUrl: req.originalUrl || req.url,
  requestSize: getRequestSize(req),
  status: res?.statusCode,
  responseSize: res ? getResponseSize(res): undefined,
  userAgent: requestMetadata?.userAgent,
  remoteIp: requestMetadata?.remoteIp,
  referer: requestMetadata?.referer,
  latency: duration ? formatDuration(duration) : undefined,
  protocol: req.protocol

},
    trace: requestMetadata?.requestId,
    operation:  {
  id: requestMetadata?.requestId,
  producer: 'claude-zen-flow-api',
  frst: !res,
  // First log entry for request
      last: !!res,
  // Last log entry for response

},
    metadata: metadata ? sanitizeData(metadata) : undefined
};

  return logEntry
};

/**
 * Output log entry to console or logging service.
 * In production, this would typically send to a logging service like Google Cloud Logging.
 *
 * @param logEntry Structured log entry to output
 */
const outputLog = (logEntry: LogEntry): void => {
  if(process.env.NODE_ENV === 'development) {
    // Prety print for development
    const {
  httpRequest,
  timestamp,
  level,
  message
} = logEntry;
    const duration = httpRequest?.latency || ';
    const status = httpRequest?.status || '';
    const method = httpRequest?.requestMethod || ';
    const url = httpRequest?.requestUrl || ';

    if (httpRequest) {
      console.log('[' + timestamp + ']'${level} ${method} ${url} ${status} ${duration}
      );
      if (level === LogLevel.ERROR && logEntry.metadata) {
  console.log('Error details:',
  logEntry.metadata)'
}
    } else {
      console.log('[' + timestamp + '] ${level} ${message})'
}

    if (logEntry.metadata && level !== LogLevel.ERROR' {
  console.log(Metadata:',
  logEntry.metadata)'
}
  } else {
  // Production: JSON format for structured logging
    logger.info(JSON.stringify(logEntry))

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
export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
': void => {
  const requestId = generateRequestId();
  const startTime = Date.now();

  // Attach metadata to request for later use
  req.metadata = {
  requestId,
  startTime,
  userAgent: req.headers[user-agent],
  remoeIp: getClientIp(req),
  referer: req.headers.referer

} as RequestMetadata;

  // Set request ID header for client tracing
  res.setHeader('X-Request-ID', requestId)';

  // Log request start (only if should be logged'
  if (shouldLog(req.path, req.method)) {
    const logEntry = createLogEntry(
  LogLevel.INFO,
  'Request'started',
  req,
      un'efined,
      {
        query: sanitizeData(req.query
),
        body: req.method !== 'GET' ? sanitizeData(req.body): undefined,
        headers: sanitizeData(
  {
  'content-type: r'q.headers['content-type],
  accept: req.headers.accept,
  'cache-control: req.headers['cache-control]

}
)
}
    );
    outputLog('ogEntry)
}

  // Hook into response finish event
  const originalEnd = res.end;
  res.end = function(chunk?: unknown, encoding?: any): Response  {
    // Log response completion
    if (shouldLog(req.path, req.method)) {
      const level = getLogLevelFromStatus(res.statusCode);
      const duration = Date.now() - startTime;

      const logEntry = createLogEntry(level,
  'Request'completed',
  req, res, {
        uration: '' + duration + 'ms',
        reponseHeaders: sanitizeData({
  'content-type: r's.get('content-type
),
  'cache-control: res.get('cache-control),
  'content-length: res.get('content-length)

})
});
      outputLog(logEntry)
}

    // Call original end met'od
    return originalEnd.call(
  this,
  chunk,
  encoding
)
};

  next()
};

/**
 * Error Logging Function.
 * Logs errors with full context and request metadata.
 *
 * @param error Error object to log
 * @param req Express request object
 * @param additionalContext Additional context to include in log
 */
export const logError = (
  error: Error,
  req: Request,
  additionalContext?: Record<string, unknown>
): void => {
  const logEntry = createLogEntry(
  LogLevel.ERROR,
  Error:'' + error.message + ',
  req,
    undefined,
    {
      error: {
  name: error.name,
  message: error.message,
  stack: error.stack

},
      context: additionalContext
}
);
  outputLog(logEntry)
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
export const logPerformance = (
  operation: string,
  duration: number,
  req: Request,
  metadata?: Record<string, unknown>
): void => {
  const level = duration > 5000 ? LogLevel.WARNING : LogLevel.INFO;
  const logEntry = createLogEntry(
    level,
    `Performance:'' + operation +  took ${formatDuration(duration)}',
    req,
    undefined,
    {
      operation,
      duration: '' + duration + 'ms',
      performanceMetric: metadata
}
  );
  outputLog(logEntry)
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
export const log = (
  level: LogLevel,
  message: string,
  req?: Request,
  metadata?: Record<string, unknown>
): void => {
  if (req) {
  const logEntry = createLogEntry(
  level,
  message,
  req,
  undefined,
  metadata
);
    outputLog(logEntry)

} else {
    // Simple log without request context
    const logEntry: LogEntry = {
  timestamp: new Date().toISOString(),
  level,
  message,
  metadata: metadata ? sanitizeData(metadata) : undefined

};
    outputLog(logEntry)
}
};

/**
 * Database Operation Logging Function.
 * Specialized logging for database operations with query metrics.
 *
 * @param operation Database operation type(
  SELECT,
  INSERT,
  etc.
)
 * @param table Database table/collection name
 * @param duration Operation duration in milliseconds
 * @param rowCount Number of rows affected/returned
 * @param req Express request object
 * @param metadata Additional database metadata
 */
export const logDatabaseOperation = (
  operation: string,
  table: string,
  duration: number,
  rowCount: number,
  req: Request,
  metadata?: Record<string, unknown>
): void => {
  const level = duration > 1000 ? LogLevel.WARNING : LogLevel.DEBUG;
  const logEntry = createLogEntry(
  level,
  Database:'' + operation +  on ${table}',
  req,
    undefined,
    {
      database: {
        operation,
        table,
        duration: '' + duration + 'ms',
        rowCount,
        low: duration > 1000
},
      ...metadata
}
);
  outputLog(logEntry)
};

/**
 * External Service Logging Function.
 * Specialized logging for external service calls with response metrics.
 *
 * @param service External service name
 * @param operation Operation performed
 * @param duration Operation duration in milliseconds
 * @param statusCode HTTP status code from external service
 * @param req Express request object
 * @param metadata Additional service metadata
 */
export const logExternalService = (
  service: string,
  operation: string,
  duration: number,
  statusCode: number,
  req: Request,
  metadata?: Record<string, unknown>
): void => {
  const level = statusCode >= 400 || duration > 5000 ? LogLevel.WARNING : LogLevel.INFO;
  const logEntry = createLogEntry(
  level,
  External:'' + service +  ${operation}',
  req,
    undefined,
    {
      externalService: {
        service,
        operation,
        duration: '' + duration + 'ms',
        `tatusCode,
        success: statusCode < 400,
        slow: duration > 5000
},
      ...metadata
}
);
  outputLog(logEntry)
};

// Extend Express Request interface to include metadata
declare global {
  namespace Express {
    interface Request {
      metadata?: RequestMetadata
}
  }
}

export default {
  LogLevel,
  requestLogger,
  logError,
  logPerformance,
  log,
  logDatabaseOperation,
  logExternalService

};