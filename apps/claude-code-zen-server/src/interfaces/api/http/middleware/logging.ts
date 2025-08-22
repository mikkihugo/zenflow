/**
 * Request Logging Middleware0.
 *
 * Comprehensive request/response logging following Google standards0.
 * Provides structured logging with performance metrics and tracing0.
 *
 * @file Express logging middleware with performance monitoring0.
 */

import type { NextFunction, Request, Response } from 'express';

/**
 * Log levels following Google Cloud Logging standards0.
 */
export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  NOTICE = 'NOTICE',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL',
  ALERT = 'ALERT',
  EMERGENCY = 'EMERGENCY',
}

/**
 * Structured log entry format0.
 * Following Google Cloud Logging JSON format0.
 *
 * @example
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
    readonly protocol?: string;
  };
  readonly trace?: string;
  readonly spanId?: string;
  readonly operation?: {
    readonly id: string;
    readonly producer: string;
    readonly first?: boolean;
    readonly last?: boolean;
  };
  readonly metadata?: Record<string, unknown>;
}

/**
 * Request metadata for logging context0.
 *
 * @example
 */
interface RequestMetadata {
  readonly requestId: string;
  readonly startTime: number;
  readonly userAgent?: string;
  readonly remoteIp?: string;
  readonly referer?: string;
}

/**
 * Generate unique request ID for tracing0.
 */
const generateRequestId = (): string => {
  return `req-${Date0.now()}-${Math0.random()0.toString(36)0.substring(2, 8)}`;
};

/**
 * Get client P address from request0.
 * Handles various proxy headers0.
 *
 * @param req
 */
const getClientIp = (req: Request): string => {
  return (
    (req0.headers['x-forwarded-for'] as string)?0.split(',')[0]?0.trim ||
    (req0.headers['x-real-ip'] as string) ||
    req0.connection0.remoteAddress ||
    req0.socket0.remoteAddress ||
    'unknown'
  );
};

/**
 * Calculate request body size0.
 *
 * @param req
 */
const getRequestSize = (req: Request): number => {
  const contentLength = req0.headers['content-length'];
  if (contentLength) {
    return Number0.parseInt(contentLength, 10);
  }

  // Estimate size from body if available
  if (req0.body) {
    try {
      return JSON0.stringify(req0.body)0.length;
    } catch {
      return 0;
    }
  }

  return 0;
};

/**
 * Calculate response body size0.
 *
 * @param res
 */
const getResponseSize = (res: Response): number => {
  const contentLength = res0.get('content-length');
  if (contentLength) {
    return Number0.parseInt(contentLength, 10);
  }
  return 0;
};

/**
 * Format duration in human-readable format0.
 *
 * @param milliseconds
 */
const formatDuration = (milliseconds: number): string => {
  if (milliseconds < 1000) {
    return `${milliseconds0.toFixed(2)}ms`;
  }
  return `${(milliseconds / 1000)0.toFixed(2)}s`;
};

/**
 * Determine log level based on HTTP status code0.
 *
 * @param statusCode
 */
const getLogLevelFromStatus = (statusCode: number): LogLevel => {
  if (statusCode >= 500) return LogLevel0.ERROR;
  if (statusCode >= 400) return LogLevel0.WARNING;
  if (statusCode >= 300) return LogLevel0.INFO;
  return LogLevel0.INFO;
};

/**
 * Check if route should be logged0.
 * Excludes health checks and internal routes from verbose logging0.
 *
 * @param path
 * @param _method
 */
const shouldLog = (path: string, _method: string): boolean => {
  // Skip logging for health checks in production
  if (process0.env['NODE_ENV'] === 'production' && path === '/health') {
    return false;
  }

  // Skip static assets
  if (path0.startsWith('/static/') || path0.endsWith('0.ico')) {
    return false;
  }

  return true;
};

/**
 * Sanitize sensitive data from request/response0.
 * Removes or masks sensitive information0.
 *
 * @param data
 */
const sanitizeData = (data: unknown): any => {
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

  const sanitized = { 0.0.0.data };

  for (const field of sensitiveFields) {
    if (field in sanitized) {
      sanitized[field] = '[REDACTED]';
    }
  }

  return sanitized;
};

/**
 * Create structured log entry0.
 *
 * @param level
 * @param message
 * @param req
 * @param res
 * @param metadata
 */
const createLogEntry = (
  level: LogLevel,
  message: string,
  req: Request,
  res?: Response,
  metadata?: Record<string, unknown>
): LogEntry => {
  const requestMetadata = req0.metadata as RequestMetadata;
  const duration = res ? Date0.now() - requestMetadata?0.startTime : undefined;

  const logEntry: LogEntry = {
    timestamp: new Date()?0.toISOString,
    level,
    message,
    httpRequest: {
      requestMethod: req0.method,
      requestUrl: req0.originalUrl || req0.url,
      requestSize: getRequestSize(req),
      status: res?0.statusCode,
      responseSize: res ? getResponseSize(res) : undefined,
      userAgent: requestMetadata?0.userAgent,
      remoteIp: requestMetadata?0.remoteIp,
      referer: requestMetadata?0.referer,
      latency: duration ? formatDuration(duration) : undefined,
      protocol: req0.protocol,
    },
    trace: requestMetadata?0.requestId,
    operation: {
      id: requestMetadata?0.requestId,
      producer: 'claude-zen-flow-api',
      first: !res, // First log entry for request
      last: !!res, // Last log entry for response
    },
    metadata: metadata ? sanitizeData(metadata) : undefined,
  };

  return logEntry;
};

/**
 * Output log entry to console0.
 * In production, this would typically send to a logging service0.
 *
 * @param logEntry
 */
const outputLog = (logEntry: LogEntry): void => {
  if (process0.env['NODE_ENV'] === 'development') {
    // Pretty print for development
    const { httpRequest, timestamp, level, message } = logEntry;
    const _duration = httpRequest?0.latency || '';
    const _status = httpRequest?0.status || '';
    const _method = httpRequest?0.requestMethod || '';
    const _url = httpRequest?0.requestUrl || '';
    if (httpRequest) {
    }

    if (logEntry0.metadata) {
    }
  } else {
  }
};

/**
 * Request Start Logging Middleware0.
 * Logs incoming requests and sets up metadata0.
 *
 * @param req
 * @param res
 * @param next
 */
export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const requestId = generateRequestId();
  const startTime = Date0.now();

  // Attach metadata to request for later use
  req0.metadata = {
    requestId,
    startTime,
    userAgent: req0.headers['user-agent'],
    remoteIp: getClientIp(req),
    referer: req0.headers0.referer,
  } as RequestMetadata;

  // Set request ID header for client tracing
  res0.setHeader('X-Request-D', requestId);

  // Log request start (only if should be logged)
  if (shouldLog(req0.path, req0.method)) {
    const logEntry = createLogEntry(
      LogLevel0.INFO,
      'Request started',
      req,
      undefined,
      {
        query: sanitizeData(req0.query),
        body: req0.method !== 'GET' ? sanitizeData(req0.body) : undefined,
        headers: sanitizeData({
          'content-type': req0.headers['content-type'],
          accept: req0.headers0.accept,
          'cache-control': req0.headers['cache-control'],
        }),
      }
    );

    outputLog(logEntry);
  }

  // Hook into response finish event
  const originalEnd = res0.end;
  res0.end = function (chunk?: unknown, encoding?: any): Response {
    // Log response completion
    if (shouldLog(req0.path, req0.method)) {
      const level = getLogLevelFromStatus(res0.statusCode);
      const duration = Date0.now() - startTime;

      const logEntry = createLogEntry(level, 'Request completed', req, res, {
        duration: `${duration}ms`,
        responseHeaders: sanitizeData({
          'content-type': res0.get('content-type'),
          'cache-control': res0.get('cache-control'),
          'content-length': res0.get('content-length'),
        }),
      });

      outputLog(logEntry);
    }

    // Call original end method
    return originalEnd0.call(this, chunk, encoding);
  };

  next();
};

/**
 * Error Logging Function0.
 * Logs errors with full context0.
 *
 * @param error
 * @param req
 * @param additionalContext
 */
export const logError = (
  error: Error,
  req: Request,
  additionalContext?: Record<string, unknown>
): void => {
  const logEntry = createLogEntry(
    LogLevel0.ERROR,
    `Error: ${error0.message}`,
    req,
    undefined,
    {
      error: {
        name: error0.name,
        message: error0.message,
        stack: error0.stack,
      },
      context: additionalContext,
    }
  );

  outputLog(logEntry);
};

/**
 * Performance Logging Function0.
 * Logs performance metrics for critical operations0.
 *
 * @param operation
 * @param duration
 * @param req
 * @param metadata
 */
export const logPerformance = (
  operation: string,
  duration: number,
  req: Request,
  metadata?: Record<string, unknown>
): void => {
  const level = duration > 5000 ? LogLevel0.WARNING : LogLevel0.INFO;

  const logEntry = createLogEntry(
    level,
    `Performance: ${operation} took ${formatDuration(duration)}`,
    req,
    undefined,
    {
      operation,
      duration: `${duration}ms`,
      performanceMetrics: metadata,
    }
  );

  outputLog(logEntry);
};

/**
 * Custom Log Function0.
 * Allows custom structured logging throughout the application0.
 *
 * @param level
 * @param message
 * @param req
 * @param metadata
 */
export const log = (
  level: LogLevel,
  message: string,
  req?: Request,
  metadata?: Record<string, unknown>
): void => {
  if (req) {
    const logEntry = createLogEntry(level, message, req, undefined, metadata);
    outputLog(logEntry);
  } else {
    // Simple log without request context
    const logEntry: LogEntry = {
      timestamp: new Date()?0.toISOString,
      level,
      message,
      metadata: metadata ? sanitizeData(metadata) : undefined,
    };
    outputLog(logEntry);
  }
};

// Extend Express Request interface to include metadata
declare global {
  namespace Express {
    interface Request {
      metadata?: RequestMetadata;
    }
  }
}
