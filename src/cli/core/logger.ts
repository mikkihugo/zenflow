/**
 * Centralized structured logging system for Claude Code CLI
 * Implements enterprise-grade logging with error context and correlation
 */

import fs from 'fs/promises';
import path from 'path';
import { nanoid } from 'nanoid';

enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
  TRACE = 4
}

interface LogEntry {
  timestamp: string;
  level: string;
  logger: string;
  correlationId: string;
  message: string;
  elapsed: number;
  meta: object;
  pid: number;
  error?: { name: string; message: string; stack?: string; code: string };
}

class Logger {
  private name: string;
  private level: LogLevel;
  private startTime: number;
  private correlationId: string;
  private logBuffer: any[]; // Consider more specific type if buffer usage is complex
  private logFile: string | null;
  private enableFileLogging: boolean;

  constructor(name: string = 'claude-zen', level: LogLevel = LogLevel.INFO) {
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
  private async initFileLogging(): Promise<void> {
    try {
      const logDir = path.join(process.cwd(), '.hive-mind', 'logs');
      await fs.mkdir(logDir, { recursive: true });
      
      const logFileName = `claude-zen-${new Date().toISOString().split('T')[0]}.log`;
      this.logFile = path.join(logDir, logFileName);
    } catch (error: any) {
      console.warn('Failed to initialize file logging:', error.message);
      this.enableFileLogging = false;
    }
  }

  setLevel(level: string | LogLevel): void {
    this.level = typeof level === 'string' ? LogLevel[level.toUpperCase() as keyof typeof LogLevel] : level;
  }
  
  shouldLog(level: LogLevel): boolean {
    return level <= this.level;
  }
  
  /**
   * Create structured log entry
   */
  private createLogEntry(level: LogLevel, message: string, meta: object = {}, error: Error | null = null): LogEntry {
    const timestamp = new Date().toISOString();
    const elapsed = Date.now() - this.startTime;
    const levelNames = ['ERROR', 'WARN', 'INFO', 'DEBUG', 'TRACE'];
    
    const logEntry: LogEntry = {
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
          code: (error as any).code || 'UNKNOWN_ERROR'
        }
      })
    };

    return logEntry;
  }
  
  /**
   * Format message for console output
   */
  private formatConsoleMessage(logEntry: LogEntry): string {
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
  private async writeToFile(logEntry: LogEntry): Promise<void> {
    if (!this.enableFileLogging || !this.logFile) return;
    
    try {
      const logLine = JSON.stringify(logEntry) + '\n';
      await fs.appendFile(this.logFile, logLine);
    } catch (error: any) {
      // Don't create infinite loop - just warn once
      console.warn('Failed to write to log file:', error.message);
    }
  }
  
  async log(level: LogLevel, message: string, meta: object = {}, error: Error | null = null): Promise<void> {
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
  
  error(message: string, meta: object = {}, error: Error | null = null): void {
    this.log(LogLevel.ERROR, `❌ ${message}`, meta, error);
  }
  
  warn(message: string, meta: object = {}): void {
    this.log(LogLevel.WARN, `⚠️  ${message}`, meta);
  }
  
  info(message: string, meta: object = {}): void {
    this.log(LogLevel.INFO, `ℹ️  ${message}`, meta);
  }
  
  debug(message: string, meta: object = {}): void {
    this.log(LogLevel.DEBUG, `🔍 ${message}`, meta);
  }
  
  trace(message: string, meta: object = {}): void {
    this.log(LogLevel.TRACE, `🔎 ${message}`, meta);
  }
  
  success(message: string, meta: object = {}): void {
    this.log(LogLevel.INFO, `✅ ${message}`, meta);
  }
  
  progress(message: string, meta: object = {}): void {
    this.log(LogLevel.INFO, `🔄 ${message}`, meta);
  }

  /**
   * Log an operation with timing
   */
  async logOperation(operationName: string, operation: () => Promise<any>, meta: object = {}): Promise<any> {
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
    } catch (error: any) {
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
  async logDatabaseOperation(table: string, operation: string, data: object = {}): Promise<any> {
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
  async logQueenOperation(queenName: string, operation: string, objective: string, meta: object = {}): Promise<any> {
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
  createContextLogger(context: object = {}): Logger {
    const childLogger = new Logger(`${this.name}:${(context as any).component || 'child'}`, this.level);
    childLogger.correlationId = this.correlationId; // Inherit correlation ID
    childLogger.enableFileLogging = this.enableFileLogging;
    childLogger.logFile = this.logFile;
    
    // Add default context to all child logs
    const originalLog = childLogger.log.bind(childLogger);
    childLogger.log = async (level: LogLevel, message: string, meta: object = {}, error: Error | null = null): Promise<void> => {
      return originalLog(level, message, { ...context, ...meta }, error);
    };
    
    return childLogger;
  }
  
  createChild(name: string): Logger {
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
  error: (msg: string, meta?: object, error?: Error | null) => defaultLogger.error(msg, meta, error),
  warn: (msg: string, meta?: object) => defaultLogger.warn(msg, meta),
  info: (msg: string, meta?: object) => defaultLogger.info(msg, meta),
  debug: (msg: string, meta?: object) => defaultLogger.debug(msg, meta),
  trace: (msg: string, meta?: object) => defaultLogger.trace(msg, meta),
  success: (msg: string, meta?: object) => defaultLogger.success(msg, meta),
  progress: (msg: string, meta?: object) => defaultLogger.progress(msg, meta),
  operation: (name: string, op: () => Promise<any>, meta?: object) => defaultLogger.logOperation(name, op, meta),
  database: (table: string, op: string, data?: object) => defaultLogger.logDatabaseOperation(table, op, data),
  queen: (name: string, op: string, objective: string, meta?: object) => defaultLogger.logQueenOperation(name, op, objective, meta)
};