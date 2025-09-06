/**
 * Request Logging Middleware.
 *
 * Comprehensive request/response logging following Google standards.
 * Provides structured logging with performance metrics and tracing.
 *
 * @file Express logging middleware with performance monitoring.
 */

import { getLogger } from '@claude-zen/foundation';
import type { NextFunction, Request, Response } from 'express';
import type { BufferEncoding } from 'node:buffer';
import { getEnv, isProd } from '../../../config/env';

const logger = getLogger('interfaces-api-http-middleware-logging');

// Constants
const CONTENT_TYPE_HEADER = 'content-type';
const CACHE_CONTROL_HEADER = 'cache-control';
const CONTENT_LENGTH_HEADER = 'content-length';

/**
 * Log levels following Google Cloud Logging standards.
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
 * Structured log entry format.
 * Following Google Cloud Logging JSON format.
 *
 * @example
 * '''typescript'
 * const logEntry:LogEntry = {
 *   timestamp: '2023-01-01T00:00:00.000Z', *   level:LogLevel.INFO,
 *   message: 'Request processed', *   httpRequest:{
 *     requestMethod: 'GET', *     requestUrl: '/api/users', *     status:200,
 *     latency:'123ms') *}
 *};
 * '
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
 * Request metadata for logging context.
 *
 * @example
 * '''typescript'
 * const metadata:RequestMetadata = {
 *   requestId: 'req-123456', *   startTime:Date.now(),
 *   userAgent: 'Mozilla/5.0...', *   remoteIp: '127.0.0.1', *   referer:'https://example.com') *};
 * '
 */
interface RequestMetadata {
  readonly requestId: string;
  readonly startTime: number;
  readonly userAgent?: string;
  readonly remoteIp?: string;
  readonly referer?: string;
}

/**
 * Generate unique request ID for tracing.
 * Uses timestamp + random string for uniqueness.
 */
const generateRequestId = (): string =>
  `req-${  Date.now()  }-${  Math.random().toString(36).substring(2, 8)}`;

/**
 * Get client IP address from request.
 * Handles various proxy headers and fallbacks.
 *
 * @param req Express request object
 */
const getClientIp = (req: Request): string =>
  (req.headers['x-forwarded-for'] as string)?.split(',    ')[0]?.trim() ||
  (req.headers['x-real-ip'] as string) ||
  req.connection?.remoteAddress ||
  req.socket?.remoteAddress ||
  'unknown';

/**
 * Calculate request body size in bytes.
 * Estimates size from content-length header or body object.
 *
 * @param req Express request object
 */
const getRequestSize = (req: Request): number => {
  const contentLength = req.headers[CONTENT_LENGTH_HEADER];
  if (contentLength) {
    return Number.parseInt(contentLength as string, 10);
  }

  // Estimate size from body if available
  if (req.body) {
    try {
      return JSON.stringify(req.body).length;
    } catch {
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
const getResponseSize = (res: Response): number => {
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
const formatDuration = (milliseconds: number): string => {
  if (milliseconds < 1000) {
    return `${milliseconds.toFixed(2)  }ms`;
  }
  return `${(milliseconds / 1000).toFixed(2)  }s`;
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
  return LogLevel.INFO;
};

/**
 * Check if route should be logged.
 * Excludes health checks and static assets from verbose logging.
 *
 * @param path Request path
 * @param method HTTP method (unused but available for extension)
 */
const shouldLog = (path: string, method: string): boolean => {
  // Skip logging for health checks in production
  if (isProd() && path === '/health') {
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
const sanitizeData = (data: unknown): Record<string, unknown> => {
  if (!data || typeof data !== 'object') {
    return { value: data };
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
 * Type guard to check if metadata is a proper record
 */
const isValidMetadata = (
  metadata: unknown
): metadata is Record<string, unknown> =>
  metadata !== null &&
  metadata !== undefined &&
  typeof metadata === 'object' &&
  !Array.isArray(metadata);

/**
 * Parameters for creating a log entry.
 */
interface CreateLogEntryParams {
  level: LogLevel;
  message: string;
  req: Request;
  res?: Response;
  metadata?: Record<string, unknown>;
}

/**
 * Create structured log entry.
 * Builds standardized log entry with all metadata.
 */
const createLogEntry = ({
  level,
  message,
  req,
  res,
  metadata,
}: CreateLogEntryParams): LogEntry => {
  const requestMetadata = req.metadata as RequestMetadata;
  const duration = res ? Date.now() - requestMetadata?.startTime : undefined;

  // Build httpRequest object with only defined properties
  const httpRequest: any = {
    requestMethod: req.method,
    requestUrl: req.originalUrl || req.url,
    requestSize: getRequestSize(req),
    protocol: req.protocol,
  };
  
  if (res?.statusCode !== undefined) {
    httpRequest.status = res.statusCode;
  }
  
  if (res) {
    const responseSize = getResponseSize(res);
    if (responseSize !== undefined) {
      httpRequest.responseSize = responseSize;
    }
  }
  
  if (requestMetadata?.userAgent) {
    httpRequest.userAgent = requestMetadata.userAgent;
  }
  
  if (requestMetadata?.remoteIp) {
    httpRequest.remoteIp = requestMetadata.remoteIp;
  }
  
  if (requestMetadata?.referer) {
    httpRequest.referer = requestMetadata.referer;
  }
  
  if (duration) {
    httpRequest.latency = formatDuration(duration);
  }

  const logEntry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    httpRequest,
    trace: requestMetadata?.requestId,
    operation: {
      id: requestMetadata?.requestId,
      producer: 'claude-zen-flow-api',
      first: !res,
      // First log entry for request
      last: !!res,
      // Last log entry for response
    },
  };
  
  // Only set metadata if it's valid
  if (isValidMetadata(metadata)) {
    (logEntry as any).metadata = sanitizeData(metadata);
  }

  return logEntry;
};

/**
 * Output log entry to console or logging service.
 * In production, this would typically send to a logging service like Google Cloud Logging.
 *
 * @param logEntry Structured log entry to output
 */
const outputLog = (logEntry: LogEntry): void => {
  if (getEnv().NODE_ENV === 'development') {
    // Pretty print for development
    const { httpRequest, level, message, metadata } = logEntry;
    const duration = httpRequest?.latency || '';
    const status = httpRequest?.status || '';
    const method = httpRequest?.requestMethod || '';
    const url = httpRequest?.requestUrl || '';

    if (httpRequest) {
      logger.info(`${method  } ${  url  } ${  status  } ${  duration}`);
      if (level === LogLevel.ERROR && metadata) {
        logger.error('Error details: ', metadata);
      }
    } else {
      logger.info(`${level  } ${  message}`);
    }

    if (metadata && level !== LogLevel.ERROR) {
      logger.debug('Metadata: ', metadata);
    }
  } else {
    // Production:JSON format for structured logging
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
export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const requestId = generateRequestId();
  const startTime = Date.now();

  // Attach metadata to request for later use
  req.metadata = {
    requestId,
    startTime,
    userAgent: req.headers['user-agent'] as string,
    remoteIp: getClientIp(req),
    referer: req.headers.referer as string,
  } as RequestMetadata;

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
  res.end = function (
    chunk?: unknown,
    encoding?: BufferEncoding,
    cb?: () => void
  ): Response {
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
          duration: `${duration  }ms`,
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
export const logError = (
  error: Error,
  req: Request,
  additionalContext?: Record<string, unknown>
): void => {
  const logEntry = createLogEntry({
    level: LogLevel.ERROR,
    message: `Error: ${  (error as Error).message}`,
    req,
    metadata: {
      error: {
        name: error.name,
        message: (error as Error).message,
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
export const logPerformance = (
  operation: string,
  duration: number,
  req: Request,
  metadata?: Record<string, unknown>
): void => {
  const level = duration > 5000 ? LogLevel.WARNING : LogLevel.INFO;
  const logMetadata: Record<string, unknown> = {
    operation,
    duration: `${duration}ms`,
  };
  
  if (metadata) {
    logMetadata.performanceMetric = metadata;
  }
  
  const logEntry = createLogEntry({
    level,
    message: `Performance: ${operation} took ${formatDuration(duration)}`,
    req,
    metadata: logMetadata,
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
export const log = (
  level: LogLevel,
  message: string,
  req?: Request,
  metadata?: Record<string, unknown>
): void => {
  if (req) {
    const params: any = { level, message, req };
    if (metadata) {
      params.metadata = metadata;
    }
    const logEntry = createLogEntry(params);
    outputLog(logEntry);
  } else {
    // Simple log without request context
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
    };
    
    // Only set metadata if it's valid
    if (isValidMetadata(metadata)) {
      (logEntry as any).metadata = sanitizeData(metadata);
    }
    
    outputLog(logEntry);
  }
};

/**
 * Parameters for database operation logging.
 */
interface DatabaseOperationParams {
  operation: string;
  table: string;
  duration: number;
  rowCount: number;
  req: Request;
  metadata?: Record<string, unknown>;
}

/**
 * Database Operation Logging Function.
 * Specialized logging for database operations with query metrics.
 */
export const logDatabaseOperation = ({
  operation,
  table,
  duration,
  rowCount,
  req,
  metadata,
}: DatabaseOperationParams): void => {
  const level = duration > 1000 ? LogLevel.WARNING : LogLevel.DEBUG;
  const logEntry = createLogEntry({
    level,
    message: `Database: ${  operation  } on ${  table}`,
    req,
    metadata: {
      database: {
        operation,
        table,
        duration: `${duration  }ms`,
        rowCount,
        slow: duration > 1000,
      },
      ...metadata,
    },
  });
  outputLog(logEntry);
};

/**
 * Parameters for external service logging.
 */
interface ExternalServiceParams {
  service: string;
  operation: string;
  duration: number;
  statusCode: number;
  req: Request;
  metadata?: Record<string, unknown>;
}

/**
 * External Service Logging Function.
 * Specialized logging for external service calls with response metrics.
 */
export const logExternalService = ({
  service,
  operation,
  duration,
  statusCode,
  req,
  metadata,
}: ExternalServiceParams): void => {
  const level =
    statusCode >= 400 || duration > 5000 ? LogLevel.WARNING : LogLevel.INFO;
  const logEntry = createLogEntry({
    level,
    message: `External: ${  service  } ${  operation}`,
    req,
    metadata: {
      externalService: {
        service,
        operation,
        duration: `${duration  }ms`,
        statusCode,
        success: statusCode < 400,
        slow: duration > 5000,
      },
      ...metadata,
    },
  });
  outputLog(logEntry);
};

// Extend Express Request interface to include metadata
declare global {
  namespace Express {
    interface Request {
      metadata?: RequestMetadata;
    }
  }
}

export default {
  logLevel: LogLevel,
  requestLogger,
  logError,
  logPerformance,
  log,
  logDatabaseOperation,
  logExternalService,
};