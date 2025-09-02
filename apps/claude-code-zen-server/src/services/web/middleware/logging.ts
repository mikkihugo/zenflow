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

interface RequestMetadata {
	readonly requestId: string;
	readonly startTime: number;
	readonly userAgent?: string;
	readonly remoteIp?: string;
	readonly referer?: string;
}

const generateRequestId = (): string =>
	`req-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

const getClientIp = (req: Request): string =>
	(req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
	(req.headers['x-real-ip'] as string) ||
	// @ts-expect-error legacy types
	req.connection?.remoteAddress ||
	req.socket?.remoteAddress ||
	'unknown';

const getRequestSize = (req: Request): number => {
	const contentLength = req.headers[CONTENT_LENGTH_HEADER];
	if (contentLength) {
		return Number.parseInt(contentLength as string, 10);
	}
	if (req.body) {
		try {
			return JSON.stringify(req.body).length;
		} catch {
			return 0;
		}
	}
	return 0;
};

const getResponseSize = (res: Response): number => {
	const contentLength = res.get(CONTENT_LENGTH_HEADER);
	if (contentLength) {
		return Number.parseInt(contentLength, 10);
	}
	return 0;
};

const formatDuration = (milliseconds: number): string => {
	if (milliseconds < 1000) return `${milliseconds.toFixed(2)}ms`;
	return `${(milliseconds / 1000).toFixed(2)}s`;
};

const getLogLevelFromStatus = (statusCode: number): LogLevel => {
	if (statusCode >= 500) return LogLevel.ERROR;
	if (statusCode >= 400) return LogLevel.WARNING;
	if (statusCode >= 300) return LogLevel.INFO;
	return LogLevel.INFO;
};

const shouldLog = (path: string, method: string): boolean => {
	if (process.env['NODE_ENV'] === 'production' && path === '/health') return false;
	if (path.startsWith('/static/') || path.endsWith('.ico')) return false;
	return method !== 'OPTIONS';
};

const sanitizeData = (data: unknown): Record<string, unknown> => {
	if (!data || typeof data !== 'object') return { value: data } as Record<string, unknown>;
	const sensitiveFields = ['password','token','key','secret','auth','authorization','cookie','session','csrf','api_key','apikey'];
	const sanitized: Record<string, unknown> = { ...(data as Record<string, unknown>) };
	for (const field of sensitiveFields) {
		if (field in sanitized) sanitized[field] = '[REDACTED]';
	}
	return sanitized;
};

const isValidMetadata = (metadata: unknown): metadata is Record<string, unknown> =>
	metadata !== null && metadata !== undefined && typeof metadata === 'object' && !Array.isArray(metadata);

interface CreateLogEntryParams {
	level: LogLevel;
	message: string;
	req: Request;
	res?: Response;
	metadata?: Record<string, unknown>;
}

const createLogEntry = ({ level, message, req, res, metadata }: CreateLogEntryParams): LogEntry => {
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
			responseSize: res ? getResponseSize(res) : undefined,
			userAgent: requestMetadata?.userAgent,
			remoteIp: requestMetadata?.remoteIp,
			referer: requestMetadata?.referer,
			latency: duration ? formatDuration(duration) : undefined,
			protocol: req.protocol,
		},
		trace: requestMetadata?.requestId,
		operation: { id: requestMetadata?.requestId, producer: 'claude-zen-flow-api', first: !res, last: !!res },
		metadata: isValidMetadata(metadata) ? sanitizeData(metadata) : undefined,
	};
	return logEntry;
};

const outputLog = (logEntry: LogEntry): void => {
	if (process.env['NODE_ENV'] === 'development') {
		const { httpRequest, level, message, metadata } = logEntry;
		const duration = httpRequest?.latency || '';
		const status = httpRequest?.status || '';
		const method = httpRequest?.requestMethod || '';
		const url = httpRequest?.requestUrl || '';
		if (httpRequest) {
			logger.info(`${method} ${url} ${status} ${duration}`);
			if (level === LogLevel.ERROR && metadata) logger.error('Error details: ', metadata);
		} else {
			logger.info(`${level} ${message}`);
		}
		if (metadata && level !== LogLevel.ERROR) logger.debug('Metadata: ', metadata);
	} else {
		logger.info(JSON.stringify(logEntry));
	}
};

export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
	const requestId = generateRequestId();
	const startTime = Date.now();
	req.metadata = {
		requestId,
		startTime,
		userAgent: req.headers['user-agent'] as string,
		remoteIp: getClientIp(req),
		referer: req.headers.referer as string,
	} as RequestMetadata;
	res.setHeader('X-Request-ID', requestId);
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
			const originalEnd = res.end.bind(res) as (chunk?: string | Uint8Array, encoding?: BufferEncoding, cb?: () => void) => Response;
			res.end = function (chunk?: string | Uint8Array, encoding?: BufferEncoding, cb?: () => void): Response {
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
				return originalEnd(chunk, encoding, cb);
			} as typeof res.end;
	next();
};

export const logError = (error: Error, req: Request, additionalContext?: Record<string, unknown>): void => {
	const logEntry = createLogEntry({
		level: LogLevel.ERROR,
		message: `Error: ${error.message}`,
		req,
		metadata: { error: { name: error.name, message: error.message, stack: error.stack }, context: additionalContext },
	});
	outputLog(logEntry);
};

export const logPerformance = (operation: string, duration: number, req: Request, metadata?: Record<string, unknown>): void => {
	const level = duration > 5000 ? LogLevel.WARNING : LogLevel.INFO;
	const logEntry = createLogEntry({
		level,
		message: `Performance: ${operation} took ${formatDuration(duration)}`,
		req,
		metadata: { operation, duration: `${duration}ms`, performanceMetric: metadata },
	});
	outputLog(logEntry);
};

export const log = (level: LogLevel, message: string, req?: Request, metadata?: Record<string, unknown>): void => {
	if (req) {
		const logEntry = createLogEntry({ level, message, req, metadata });
		outputLog(logEntry);
	} else {
		const logEntry: LogEntry = {
			timestamp: new Date().toISOString(),
			level,
			message,
			metadata: isValidMetadata(metadata) ? sanitizeData(metadata) : undefined,
		};
		outputLog(logEntry);
	}
};

interface DatabaseOperationParams {
	operation: string;
	table: string;
	duration: number;
	rowCount: number;
	req: Request;
	metadata?: Record<string, unknown>;
}

export const logDatabaseOperation = ({ operation, table, duration, rowCount, req, metadata }: DatabaseOperationParams): void => {
	const level = duration > 1000 ? LogLevel.WARNING : LogLevel.DEBUG;
	const logEntry = createLogEntry({
		level,
		message: `Database: ${operation} on ${table}`,
		req,
		metadata: { database: { operation, table, duration: `${duration}ms`, rowCount, slow: duration > 1000 }, ...metadata },
	});
	outputLog(logEntry);
};

interface ExternalServiceParams {
	service: string;
	operation: string;
	duration: number;
	statusCode: number;
	req: Request;
	metadata?: Record<string, unknown>;
}

export const logExternalService = ({ service, operation, duration, statusCode, req, metadata }: ExternalServiceParams): void => {
	const level = statusCode >= 400 || duration > 5000 ? LogLevel.WARNING : LogLevel.INFO;
	const logEntry = createLogEntry({
		level,
		message: `External: ${service} ${operation}`,
		req,
		metadata: { externalService: { service, operation, duration: `${duration}ms`, statusCode, success: statusCode < 400, slow: duration > 5000 }, ...metadata },
	});
	outputLog(logEntry);
};

declare global {
	namespace Express {
		interface Request {
			metadata?: RequestMetadata;
		}
	}
}

export default { logLevel: LogLevel, requestLogger, logError, logPerformance, log, logDatabaseOperation, logExternalService };
