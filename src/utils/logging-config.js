/**
 * @file Logtape Configuration for Claude-Zen
 * Structured logging setup with @logtape/logtape including Express integration
 */

import { configure, getLogger, getConsoleSink } from '@logtape/logtape';
import { getFileSink } from '@logtape/file';
import fs from 'fs';
import path from 'path';

/**
 * Initialize logtape configuration for the entire application
 */
export async function initializeLogging() {
  // Ensure logs directory exists
  const logsDir = path.resolve('logs');
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }

  await configure({
    sinks: {
      console: getConsoleSink(),
      file: getFileSink('logs/claude-zen-activity.log'),
      aiFixingFile: getFileSink('logs/ai-fixing-detailed.log'),
      httpFile: getFileSink('logs/http-requests.log')
    },
    loggers: [
      {
        category: 'claude-ai-integration',
        lowestLevel: 'debug',
        sinks: ['console', 'file', 'aiFixingFile']
      },
      {
        category: 'zen-fixer', 
        lowestLevel: 'debug',
        sinks: ['console', 'file']
      },
      {
        category: 'typescript-errors',
        lowestLevel: 'info',
        sinks: ['console', 'file']
      },
      {
        category: 'claude-cli',
        lowestLevel: 'debug',
        sinks: ['console', 'aiFixingFile']
      },
      {
        category: 'express',
        lowestLevel: 'info',
        sinks: ['console', 'httpFile']
      },
      {
        category: 'http',
        lowestLevel: 'info',
        sinks: ['console', 'httpFile']
      },
      {
        category: 'mcp-server',
        lowestLevel: 'info',
        sinks: ['console', 'httpFile']
      },
      {
        category: 'web-server',
        lowestLevel: 'info',
        sinks: ['console', 'httpFile']
      },
      {
        category: 'app',
        lowestLevel: 'info', 
        sinks: ['console', 'file']
      }
    ]
  });
}

/**
 * Create logger instances for different components
 */
export function createClaudeAILogger() {
  return getLogger('claude-ai-integration');
}

export function createZenFixerLogger() {
  return getLogger('zen-fixer');
}

export function createTypeScriptLogger() {
  return getLogger('typescript-errors');
}

export function createClaudeCLILogger() {
  return getLogger('claude-cli');
}

export function createExpressLogger() {
  return getLogger('express');
}

export function createHTTPLogger() {
  return getLogger('http');
}

export function createMCPServerLogger() {
  return getLogger('mcp-server');
}

export function createWebServerLogger() {
  return getLogger('web-server');
}

export function createAppLogger() {
  return getLogger('app');
}

/**
 * Log structured data for Claude CLI operations
 */
export function logClaudeOperation(logger, operation, data = {}) {
  logger.info(`Claude ${operation}`, {
    operation,
    timestamp: new Date().toISOString(),
    ...data
  });
}

/**
 * Log TypeScript compilation results
 */
export function logTypeScriptResults(logger, before, after, duration) {
  logger.info('TypeScript compilation completed', {
    errorsBefore: before,
    errorsAfter: after,
    errorsReduced: before - after,
    reductionPercentage: ((before - after) / before * 100).toFixed(1),
    durationMs: duration,
    timestamp: new Date().toISOString()
  });
}

/**
 * Log detailed error analysis
 */
export function logErrorAnalysis(logger, filePath, errors, categories) {
  logger.debug('Error analysis for file', {
    filePath,
    totalErrors: errors.length,
    categories,
    errorDetails: errors.map(e => ({
      line: e.line,
      rule: e.rule || e.code,
      message: e.message,
      severity: e.severity
    })),
    timestamp: new Date().toISOString()
  });
}

/**
 * Log Claude CLI metrics and performance
 */
export function logClaudeMetrics(logger, metrics) {
  logger.info('Claude CLI performance metrics', {
    ...metrics,
    timestamp: new Date().toISOString()
  });
}

/**
 * Express middleware for request logging
 */
export function createExpressLoggingMiddleware() {
  const logger = createExpressLogger();
  
  return (req, res, next) => {
    const startTime = Date.now();
    const requestId = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Log incoming request
    logger.info('HTTP request started', {
      requestId,
      method: req.method,
      url: req.url,
      path: req.path,
      query: req.query,
      userAgent: req.get('User-Agent'),
      contentType: req.get('Content-Type'),
      contentLength: req.get('Content-Length'),
      ip: req.ip,
      timestamp: new Date().toISOString()
    });

    // Store request ID for other middlewares
    req.requestId = requestId;
    req.startTime = startTime;

    // Override res.json to log responses
    const originalJson = res.json;
    res.json = function(data) {
      const duration = Date.now() - startTime;
      
      logger.info('HTTP response sent', {
        requestId,
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        duration,
        responseSize: JSON.stringify(data).length,
        timestamp: new Date().toISOString()
      });
      
      return originalJson.call(this, data);
    };

    // Log response when finished
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      
      logger.info('HTTP request completed', {
        requestId,
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        duration,
        timestamp: new Date().toISOString()
      });
    });

    next();
  };
}

/**
 * Express error logging middleware
 */
export function createExpressErrorLoggingMiddleware() {
  const logger = createExpressLogger();
  
  return (err, req, res, next) => {
    logger.error('HTTP request error', {
      requestId: req.requestId,
      method: req.method,
      url: req.url,
      error: err.message,
      stack: err.stack,
      statusCode: res.statusCode,
      timestamp: new Date().toISOString()
    });
    
    next(err);
  };
}

/**
 * Log server startup/shutdown events
 */
export function logServerEvent(logger, event, details = {}) {
  logger.info(`Server ${event}`, {
    event,
    ...details,
    timestamp: new Date().toISOString()
  });
}

export default {
  initializeLogging,
  createClaudeAILogger,
  createZenFixerLogger,
  createTypeScriptLogger,  
  createClaudeCLILogger,
  createExpressLogger,
  createHTTPLogger,
  createMCPServerLogger,
  createWebServerLogger,
  createAppLogger,
  logClaudeOperation,
  logTypeScriptResults,
  logErrorAnalysis,
  logClaudeMetrics,
  createExpressLoggingMiddleware,
  createExpressErrorLoggingMiddleware,
  logServerEvent
};