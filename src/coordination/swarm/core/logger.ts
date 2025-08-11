/**
 * @file Coordination system: logger.
 */

import { getLogger } from '../../../config/logging-config.ts';

const logger = getLogger('coordination-swarm-core-logger');

/**
 * Logger module for ruv-swarm with comprehensive logging capabilities.
 */

import { randomUUID } from 'node:crypto';
import { config } from '../../../config/index.js';

interface LoggerOptions {
  name?: string;
  level?: string;
  enableStderr?: boolean;
  enableFile?: boolean;
  formatJson?: boolean;
  logDir?: string;
  metadata?: Record<string, unknown>;
}

export class Logger {
  public name: string;
  public level: string;
  public enableStderr: boolean;
  public enableFile: boolean;
  public formatJson: boolean;
  public logDir: string;
  public metadata: Record<string, unknown>;
  public correlationId: string | null;
  public operations: Map<string, any>;

  constructor(options: LoggerOptions = {}) {
    // Use centralized configuration with user overrides
    const centralConfig = config?.getAll();
    const loggerConfig = centralConfig?.core?.logger;

    this.name = options?.name || 'ruv-swarm';
    this.level = options?.level || loggerConfig?.level.toUpperCase();
    this.enableStderr =
      options.enableStderr === undefined
        ? loggerConfig?.console
        : options?.enableStderr;
    this.enableFile =
      options.enableFile === undefined
        ? !!loggerConfig?.file
        : options?.enableFile;
    this.formatJson =
      options.formatJson === undefined
        ? loggerConfig?.structured
        : options?.formatJson;
    this.logDir = options?.logDir || './logs';
    this.metadata = options?.metadata || {};
    this.correlationId = null;
    this.operations = new Map();
  }

  setCorrelationId(id: string) {
    this.correlationId = id || randomUUID();
    return this.correlationId;
  }

  getCorrelationId(): string | null {
    return this.correlationId;
  }

  _log(level: string, message: string, data: Record<string, unknown> = {}) {
    const timestamp = new Date().toISOString();
    const prefix = this.correlationId ? `[${this.correlationId}] ` : '';

    const logEntry = {
      timestamp,
      level,
      name: this.name,
      message,
      correlationId: this.correlationId,
      ...this.metadata,
      ...data,
    };

    // CRITICAL FIX: Always use stderr to avoid JSON-RPC stdout corruption
    // This is essential for MCP server compatibility
    if (this.formatJson) {
      const output = JSON.stringify(logEntry);
      logger.error(output);
    } else {
      const output = `${prefix}[${level}] ${message}`;
      logger.error(output, Object.keys(data).length > 0 ? data : '');
    }
  }

  info(message: string, data: Record<string, unknown> = {}) {
    this._log('INFO', message, data);
  }

  warn(message: string, data: Record<string, unknown> = {}) {
    this._log('WARN', message, data);
  }

  error(message: string, data: Record<string, unknown> = {}) {
    this._log('ERROR', message, data);
  }

  debug(message: string, data: Record<string, unknown> = {}) {
    const centralConfig = config?.getAll();
    const enableDebug =
      this.level === 'DEBUG' ||
      centralConfig?.environment?.enableDebugEndpoints;
    if (enableDebug) {
      this._log('DEBUG', message, data);
    }
  }

  trace(message: string, data: Record<string, unknown> = {}) {
    const centralConfig = config?.getAll();
    const enableTrace =
      this.level === 'TRACE' ||
      centralConfig?.environment?.enableDebugEndpoints;
    if (enableTrace) {
      this._log('TRACE', message, data);
    }
  }

  success(message: string, data: Record<string, unknown> = {}) {
    this._log('SUCCESS', message, data);
  }

  fatal(message: string, data: Record<string, unknown> = {}) {
    this._log('FATAL', message, data);
  }

  startOperation(operationName: string): string {
    const operationId = randomUUID();
    this.operations.set(operationId, {
      name: operationName,
      startTime: Date.now(),
    });
    this.debug(`Starting operation: ${operationName}`, { operationId });
    return operationId;
  }

  endOperation(
    operationId: string,
    success: boolean = true,
    data: Record<string, unknown> = {},
  ) {
    const operation = this.operations.get(operationId);
    if (operation) {
      const duration = Date.now() - operation.startTime;
      this.debug(
        `Operation ${success ? 'completed' : 'failed'}: ${operation.name}`,
        {
          operationId,
          duration,
          success,
          ...data,
        },
      );
      this.operations.delete(operationId);
    }
  }

  logConnection(
    event: string,
    sessionId: string,
    data: Record<string, unknown> = {},
  ) {
    this.info(`Connection ${event}`, {
      sessionId,
      event,
      ...data,
    });
  }

  logMcp(
    direction: string,
    method: string,
    data: Record<string, unknown> = {},
  ) {
    this.debug(`MCP ${direction}: ${method}`, {
      direction,
      method,
      ...data,
    });
  }

  logMemoryUsage(context: string) {
    const memUsage = process.memoryUsage();
    this.debug(`Memory usage - ${context}`, {
      rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
      heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
      external: `${Math.round(memUsage.external / 1024 / 1024)}MB`,
    });
  }

  getConnectionMetrics() {
    return {
      correlationId: this.correlationId,
      activeOperations: this.operations.size,
      uptime: process.uptime(),
    };
  }

  // Static methods for backward compatibility
  static info(message, ...args) {
    const logger = new Logger();
    logger.info(message, ...args);
  }

  static warn(message, ...args) {
    const logger = new Logger();
    logger.warn(message, ...args);
  }

  static error(message, ...args) {
    const logger = new Logger();
    logger.error(message, ...args);
  }

  static debug(message, ...args) {
    const logger = new Logger();
    logger.debug(message, ...args);
  }

  static success(message, ...args) {
    const logger = new Logger();
    logger.success(message, ...args);
  }

  static trace(message, ...args) {
    const logger = new Logger();
    logger.trace(message, ...args);
  }
}

export default Logger;
