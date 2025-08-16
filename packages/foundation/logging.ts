/**
 * @fileoverview Centralized Logging Configuration for claude-code-zen
 * 
 * Central logging foundation for the entire ecosystem. All libs and main system
 * use this shared logging configuration with ZEN_ environment variables.
 */

import { getLogger as getLogTapeLogger } from '@logtape/logtape';

export enum LoggingLevel {
  DEBUG = 'debug',
  INFO = 'info', 
  WARN = 'warn',
  ERROR = 'error',
}

export interface LoggingConfig {
  level: LoggingLevel;
  enableConsole: boolean;
  enableFile: boolean;
  timestamp: boolean;
  format: 'json' | 'text';
  components: Record<string, LoggingLevel>;
}

export interface Logger {
  debug(message: string, meta?: unknown): void;
  info(message: string, meta?: unknown): void;
  warn(message: string, meta?: unknown): void;
  error(message: string, meta?: unknown): void;
  success?(message: string, meta?: unknown): void;
  progress?(message: string, meta?: unknown): void;
}

class LoggingConfigurationManager {
  private static instance: LoggingConfigurationManager;
  private config: LoggingConfig;
  private loggers: Map<string, Logger> = new Map();
  private initialized = false;

  private constructor() {
    this.config = this.loadConfiguration();
    this.initializeLogTape();
  }

  static getInstance(): LoggingConfigurationManager {
    if (!LoggingConfigurationManager.instance) {
      LoggingConfigurationManager.instance = new LoggingConfigurationManager();
    }
    return LoggingConfigurationManager.instance;
  }

  private loadConfiguration(): LoggingConfig {
    // Load from ZEN_ environment variables with sensible defaults
    const nodeEnv = process.env['NODE_ENV'] || 'development';
    const defaultLevel = nodeEnv === 'development' ? LoggingLevel.DEBUG : LoggingLevel.INFO;

    // Use centralized ZEN environment variable access
    const zenLogLevel = process.env['ZEN_LOG_LEVEL'] as LoggingLevel;
    const zenLogFormat = process.env['ZEN_LOG_FORMAT'] as 'json' | 'text';
    const zenLogConsole = process.env['ZEN_LOG_CONSOLE'];
    const zenLogFile = process.env['ZEN_LOG_FILE'];
    const zenLogTimestamp = process.env['ZEN_LOG_TIMESTAMP'];

    const config: LoggingConfig = {
      level: zenLogLevel || defaultLevel,
      enableConsole: zenLogConsole !== 'false',
      enableFile: zenLogFile === 'true',
      timestamp: zenLogTimestamp !== 'false',
      format: zenLogFormat || 'text',
      components: {}
    };

    // Component-specific log levels from ZEN_LOG_COMPONENT_* variables
    Object.keys(process.env).forEach(key => {
      if (key.startsWith('ZEN_LOG_COMPONENT_')) {
        const component = key.replace('ZEN_LOG_COMPONENT_', '').toLowerCase();
        const level = process.env[key] as LoggingLevel;
        if (level && Object.values(LoggingLevel).includes(level)) {
          config.components[component] = level;
        }
      }
    });

    return config;
  }

  private initializeLogTape(): void {
    if (this.initialized) return;
    // LogTape will be configured by the main application
    // For standalone usage, use default LogTape configuration
    this.initialized = true;
  }

  getLogger(name: string): Logger {
    if (this.loggers.has(name)) {
      return this.loggers.get(name)!;
    }

    // Get component-specific log level if configured
    const componentLevel = this.config.components[name.toLowerCase()] || this.config.level;
    
    // Create LogTape logger
    const logTapeLogger = getLogTapeLogger(name);
    
    // Wrap with our interface and add extra methods
    const logger: Logger = {
      debug: (message: string, meta?: unknown) => {
        if (this.shouldLog('debug', componentLevel)) {
          logTapeLogger.debug(this.formatMessage(message, meta));
        }
      },
      info: (message: string, meta?: unknown) => {
        if (this.shouldLog('info', componentLevel)) {
          logTapeLogger.info(this.formatMessage(message, meta));
        }
      },
      warn: (message: string, meta?: unknown) => {
        if (this.shouldLog('warn', componentLevel)) {
          logTapeLogger.warn(this.formatMessage(message, meta));
        }
      },
      error: (message: string, meta?: unknown) => {
        if (this.shouldLog('error', componentLevel)) {
          logTapeLogger.error(this.formatMessage(message, meta));
        }
      },
      success: (message: string, meta?: unknown) => {
        if (this.shouldLog('info', componentLevel)) {
          logTapeLogger.info(`✅ ${this.formatMessage(message, meta)}`);
        }
      },
      progress: (message: string, meta?: unknown) => {
        if (this.shouldLog('info', componentLevel)) {
          logTapeLogger.info(`🔄 ${this.formatMessage(message, meta)}`);
        }
      }
    };

    this.loggers.set(name, logger);
    return logger;
  }

  private shouldLog(messageLevel: string, componentLevel: LoggingLevel): boolean {
    const levels = ['debug', 'info', 'warn', 'error'];
    const messageLevelIndex = levels.indexOf(messageLevel);
    const componentLevelIndex = levels.indexOf(componentLevel);
    return messageLevelIndex >= componentLevelIndex;
  }

  private formatMessage(message: string, meta?: unknown): string {
    if (!meta) return message;
    
    if (this.config.format === 'json') {
      return JSON.stringify({ message, meta });
    }
    
    if (typeof meta === 'object') {
      return `${message} ${JSON.stringify(meta)}`;
    }
    
    return `${message} ${meta}`;
  }

  updateConfig(newConfig: Partial<LoggingConfig>): void {
    this.config = { ...this.config, ...newConfig };
    // Reinitialize LogTape with new config
    this.initialized = false;
    this.initializeLogTape();
    // Clear cached loggers to pick up new config
    this.loggers.clear();
  }

  getConfig(): LoggingConfig {
    return { ...this.config };
  }

  // Environment validation helpers
  validateEnvironment(): {
    isValid: boolean;
    issues: string[];
    config: LoggingConfig;
  } {
    const issues: string[] = [];
    
    // Check if ZEN environment variables are properly set
    const zenVars = Object.keys(process.env).filter(key => key.startsWith('ZEN_LOG_'));
    
    if (zenVars.length === 0) {
      issues.push('No ZEN_LOG_* environment variables found - using defaults');
    }

    // Validate log levels
    const invalidLevels = Object.entries(this.config.components)
      .filter(([, level]) => !Object.values(LoggingLevel).includes(level))
      .map(([component]) => component);
    
    if (invalidLevels.length > 0) {
      issues.push(`Invalid log levels for components: ${invalidLevels.join(', ')}`);
    }

    return {
      isValid: issues.length === 0,
      issues,
      config: this.getConfig()
    };
  }
}

// Singleton instance
const loggingManager = LoggingConfigurationManager.getInstance();

/**
 * Get a logger instance for the specified component
 * 
 * @param name Component name for the logger
 * @returns Logger instance configured with component-specific settings
 */
export function getLogger(name: string): Logger {
  return loggingManager.getLogger(name);
}

/**
 * Update global logging configuration
 * 
 * @param config Partial configuration to update
 */
export function updateLoggingConfig(config: Partial<LoggingConfig>): void {
  loggingManager.updateConfig(config);
}

/**
 * Get current logging configuration
 * 
 * @returns Current logging configuration
 */
export function getLoggingConfig(): LoggingConfig {
  return loggingManager.getConfig();
}

/**
 * Validate ZEN environment variables and logging setup
 * 
 * @returns Validation result with issues and current config
 */
export function validateLoggingEnvironment(): {
  isValid: boolean;
  issues: string[];
  config: LoggingConfig;
} {
  return loggingManager.validateEnvironment();
}

// Export types for external use (already exported above)
// export type { LoggingConfig, Logger };

// Default export for convenience
export default {
  getLogger,
  updateLoggingConfig,
  getLoggingConfig,
  validateLoggingEnvironment,
  LoggingLevel
};