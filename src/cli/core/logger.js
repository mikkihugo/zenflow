/**
 * Centralized logging system for Claude Code CLI
 * Implements Google's consistent logging principle
 */

const LogLevel = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
  TRACE: 4
};

class Logger {
  constructor(name = 'claude-flow', level = LogLevel.INFO) {
    this.name = name;
    this.level = level;
    this.startTime = Date.now();
  }
  
  setLevel(level) {
    this.level = typeof level === 'string' ? LogLevel[level.toUpperCase()] : level;
  }
  
  shouldLog(level) {
    return level <= this.level;
  }
  
  formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const elapsed = Date.now() - this.startTime;
    const levelNames = ['ERROR', 'WARN', 'INFO', 'DEBUG', 'TRACE'];
    
    const baseMessage = `[${timestamp}] [${levelNames[level]}] [${this.name}] ${message}`;
    
    if (Object.keys(meta).length > 0) {
      return `${baseMessage} ${JSON.stringify(meta)}`;
    }
    
    return baseMessage;
  }
  
  log(level, message, meta = {}) {
    if (!this.shouldLog(level)) return;
    
    const formatted = this.formatMessage(level, message, meta);
    
    if (level === LogLevel.ERROR) {
      console.error(formatted);
    } else if (level === LogLevel.WARN) {
      console.warn(formatted);
    } else {
      console.log(formatted);
    }
  }
  
  error(message, meta = {}) {
    this.log(LogLevel.ERROR, `❌ ${message}`, meta);
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
  
  createChild(name) {
    return new Logger(`${this.name}:${name}`, this.level);
  }
}

// Default logger instance
let defaultLogger = new Logger();

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
  error: (msg, meta) => defaultLogger.error(msg, meta),
  warn: (msg, meta) => defaultLogger.warn(msg, meta),
  info: (msg, meta) => defaultLogger.info(msg, meta),
  debug: (msg, meta) => defaultLogger.debug(msg, meta),
  trace: (msg, meta) => defaultLogger.trace(msg, meta),
  success: (msg, meta) => defaultLogger.success(msg, meta),
  progress: (msg, meta) => defaultLogger.progress(msg, meta),
};