/**
 * Centralized structured logging system for Claude Code CLI
 * Implements enterprise-grade logging with error context and correlation
 */

import fs from 'fs/promises';
import path from 'path';
import { nanoid } from 'nanoid';

const LogLevel = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
  TRACE: 4
};

class Logger {
  constructor(name = 'claude-zen', level = LogLevel.INFO) {
    this.name = name;
    this.level = level;
    this.startTime = Date.now();
    this.correlationId = nanoid(8); // For request correlation
    this.logBuffer = []; // Buffer for batch logging
    this.logFile = null; // Log file path
    this.enableFileLogging = process.env.CLAUDE_FLOW_LOG_FILE === 'true';
    
    if (this.enableFileLogging) {
      this.initFileLogging();
    }
  }
  
  /**
   * Initialize file logging
   */
  async initFileLogging() {
    try {
      const logDir = path.join(process.cwd(), '.hive-mind', 'logs');
      await fs.mkdir(logDir, { recursive: true });
      
      const logFileName = `claude-zen-${new Date().toISOString().split('T')[0]}.log`;
      this.logFile = path.join(logDir, logFileName);
    } catch (error) {
      console.warn('Failed to initialize file logging:', error.message);
      this.enableFileLogging = false;
    }
  }

  setLevel(level) {
    this.level = typeof level === 'string' ? LogLevel[level.toUpperCase()] : level;
  }
  
  shouldLog(level) {
    return level <= this.level;
  }
  
  /**
   * Create structured log entry
   */
  createLogEntry(level, message, meta = {}, error = null) {
    const timestamp = new Date().toISOString();
    const elapsed = Date.now() - this.startTime;
    const levelNames = ['ERROR', 'WARN', 'INFO', 'DEBUG', 'TRACE'];
    
    const logEntry = {
      timestamp,
      level: levelNames[level],
      logger: this.name,
      correlationId: this.correlationId,
      message,
      elapsed,
      meta,
      pid: process.pid,
      // Add error context if available
      ...(error && {
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack,
          code: error.code || 'UNKNOWN_ERROR'
        }
      })
    };

    return logEntry;
  }
  
  /**
   * Format message for console output
   */
  formatConsoleMessage(logEntry) {
    const { timestamp, level, logger, message, correlationId, meta, error } = logEntry;
    
    let baseMessage = `[${timestamp}] [${level}] [${logger}:${correlationId}] ${message}`;
    
    // Add metadata if present
    if (Object.keys(meta).length > 0) {
      baseMessage += ` | ${JSON.stringify(meta)}`;
    }
    
    // Add error details for console
    if (error) {
      baseMessage += `\n  Error: ${error.name}: ${error.message}`;
      if (process.env.CLAUDE_FLOW_VERBOSE === 'true') {
        baseMessage += `\n  Stack: ${error.stack}`;
      }
    }
    
    return baseMessage;
  }
  
  /**
   * Write log entry to file
   */
  async writeToFile(logEntry) {
    if (!this.enableFileLogging || !this.logFile) return;
    
    try {
      const logLine = JSON.stringify(logEntry) + '\n';
      await fs.appendFile(this.logFile, logLine);
    } catch (error) {
      // Don't create infinite loop - just warn once
      console.warn('Failed to write to log file:', error.message);
    }
  }
  
  async log(level, message, meta = {}, error = null) {
    if (!this.shouldLog(level)) return;
    
    const logEntry = this.createLogEntry(level, message, meta, error);
    
    // Console output
    const formatted = this.formatConsoleMessage(logEntry);
    if (level === LogLevel.ERROR) {
      console.error(formatted);
    } else if (level === LogLevel.WARN) {
      console.warn(formatted);
    } else {
      console.log(formatted);
    }
    
    // File output
    await this.writeToFile(logEntry);
  }
  
  error(message, meta = {}, error = null) {
    this.log(LogLevel.ERROR, `❌ ${message}`, meta, error);
  }
  
  warn(message, meta = {}) {
    this.log(LogLevel.WARN, `⚠️  ${message}`, meta);
  }
  
  info(message, meta = {}) {
    this.log(LogLevel.INFO, `ℹ️  ${message}`, meta);
  }
  
  debug(message, meta = {}) {
    this.log(LogLevel.DEBUG, `🔍 ${message}`, meta);
  }
  
  trace(message, meta = {}) {
    this.log(LogLevel.TRACE, `🔎 ${message}`, meta);
  }
  
  success(message, meta = {}) {
    this.log(LogLevel.INFO, `✅ ${message}`, meta);
  }
  
  progress(message, meta = {}) {
    this.log(LogLevel.INFO, `🔄 ${message}`, meta);
  }

  /**
   * Log an operation with timing
   */
  async logOperation(operationName, operation, meta = {}) {
    const startTime = Date.now();
    const operationId = nanoid(6);
    
    this.info(`Starting operation: ${operationName}`, { 
      ...meta, 
      operationId, 
      operationType: 'start' 
    });
    
    try {
      const result = await operation();
      const duration = Date.now() - startTime;
      
      this.info(`Completed operation: ${operationName}`, { 
        ...meta, 
        operationId, 
        duration, 
        operationType: 'success' 
      });
      
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      this.error(`Failed operation: ${operationName}`, { 
        ...meta, 
        operationId, 
        duration, 
        operationType: 'failure' 
      }, error);
      
      throw error;
    }
  }

  /**
   * Log database operations with context
   */
  async logDatabaseOperation(table, operation, data = {}) {
    return this.logOperation(`Database ${operation}`, async () => {
      // This is a wrapper - actual operation should be passed as function
      return data;
    }, {
      component: 'database',
      table,
      operation,
      recordCount: Array.isArray(data) ? data.length : 1
    });
  }

  /**
   * Log queen operations with context
   */
  async logQueenOperation(queenName, operation, objective, meta = {}) {
    return this.logOperation(`Queen ${operation}`, async () => {
      // This is a wrapper - actual operation should be passed as function
      return meta;
    }, {
      component: 'queen-council',
      queenName,
      operation,
      objective: objective.substring(0, 100) // Truncate long objectives
    });
  }

  /**
   * Create contextual child logger
   */
  createContextLogger(context = {}) {
    const childLogger = new Logger(`${this.name}:${context.component || 'child'}`, this.level);
    childLogger.correlationId = this.correlationId; // Inherit correlation ID
    childLogger.enableFileLogging = this.enableFileLogging;
    childLogger.logFile = this.logFile;
    
    // Add default context to all child logs
    const originalLog = childLogger.log.bind(childLogger);
    childLogger.log = async (level, message, meta = {}, error = null) => {
      return originalLog(level, message, { ...context, ...meta }, error);
    };
    
    return childLogger;
  }
  
  createChild(name) {
    return new Logger(`${this.name}:${name}`, this.level);
  }
}

// Default logger instance
const defaultLogger = new Logger();

// Set initial log level from environment
if (process.env.CLAUDE_FLOW_LOG_LEVEL) {
  defaultLogger.setLevel(process.env.CLAUDE_FLOW_LOG_LEVEL);
} else if (process.env.CLAUDE_FLOW_VERBOSE) {
  defaultLogger.setLevel(LogLevel.DEBUG);
}

export { Logger, LogLevel };
export default defaultLogger;

// Convenience functions for quick logging
export const log = {
  error: (msg, meta, error) => defaultLogger.error(msg, meta, error),
  warn: (msg, meta) => defaultLogger.warn(msg, meta),
  info: (msg, meta) => defaultLogger.info(msg, meta),
  debug: (msg, meta) => defaultLogger.debug(msg, meta),
  trace: (msg, meta) => defaultLogger.trace(msg, meta),
  success: (msg, meta) => defaultLogger.success(msg, meta),
  progress: (msg, meta) => defaultLogger.progress(msg, meta),
  operation: (name, op, meta) => defaultLogger.logOperation(name, op, meta),
  database: (table, op, data) => defaultLogger.logDatabaseOperation(table, op, data),
  queen: (name, op, objective, meta) => defaultLogger.logQueenOperation(name, op, objective, meta)
};