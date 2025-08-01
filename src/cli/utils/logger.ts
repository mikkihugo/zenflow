/**
 * Logger Utilities
 *
 * Provides logging functionality with colors, levels, and formatting.
 * Supports console and file output with configurable verbosity.
 */

import { existsSync, mkdirSync } from 'fs';
import { writeFile } from 'fs/promises';
import { dirname, join } from 'path';

/**
 * Log levels in order of severity
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  SILENT = 4,
}

/**
 * ANSI color codes
 */
export const Colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  underscore: '\x1b[4m',
  blink: '\x1b[5m',
  reverse: '\x1b[7m',
  hidden: '\x1b[8m',

  // Foreground colors
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',

  // Background colors
  bgBlack: '\x1b[40m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
  bgMagenta: '\x1b[45m',
  bgCyan: '\x1b[46m',
  bgWhite: '\x1b[47m',

  // Bright colors
  brightBlack: '\x1b[90m',
  brightRed: '\x1b[91m',
  brightGreen: '\x1b[92m',
  brightYellow: '\x1b[93m',
  brightBlue: '\x1b[94m',
  brightMagenta: '\x1b[95m',
  brightCyan: '\x1b[96m',
  brightWhite: '\x1b[97m',
} as const;

/**
 * Logger configuration
 */
export interface LoggerConfig {
  /** Minimum log level to output */
  level: LogLevel;

  /** Whether to use colors in output */
  colors: boolean;

  /** Whether to show timestamps */
  timestamps: boolean;

  /** Whether to show log levels */
  showLevel: boolean;

  /** File path for file logging (optional) */
  file?: string;

  /** Maximum file size before rotation (bytes) */
  maxFileSize?: number;

  /** Maximum number of rotated files to keep */
  maxFiles?: number;

  /** Custom prefix for log messages */
  prefix?: string;

  /** Whether to log to console */
  console: boolean;
}

/**
 * Default logger configuration
 */
const DEFAULT_CONFIG: LoggerConfig = {
  level: LogLevel.INFO,
  colors: true,
  timestamps: true,
  showLevel: true,
  console: true,
  maxFileSize: 10 * 1024 * 1024, // 10MB
  maxFiles: 5,
};

/**
 * Logger interface
 */
export interface Logger {
  debug(message: string, ...args: any[]): void;
  info(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  error(message: string, ...args: any[]): void;
  log(level: LogLevel, message: string, ...args: any[]): void;
  setLevel(level: LogLevel): void;
  getLevel(): LogLevel;
  enableColors(enabled: boolean): void;
  enableTimestamps(enabled: boolean): void;
  setPrefix(prefix: string): void;
  child(prefix: string): Logger;
}

/**
 * Colorize text with ANSI colors
 */
export function colorize(text: string, color: keyof typeof Colors): string {
  return `${Colors[color]}${text}${Colors.reset}`;
}

/**
 * Format log message with timestamp, level, and prefix
 */
export function formatMessage(
  level: LogLevel,
  message: string,
  config: LoggerConfig,
  prefix?: string
): string {
  const parts: string[] = [];

  // Add timestamp
  if (config.timestamps) {
    const timestamp = new Date().toISOString();
    const timestampStr = config.colors ? colorize(timestamp, 'dim') : timestamp;
    parts.push(`[${timestampStr}]`);
  }

  // Add log level
  if (config.showLevel) {
    const levelName = LogLevel[level].toUpperCase().padEnd(5);
    let levelStr = levelName;

    if (config.colors) {
      switch (level) {
        case LogLevel.DEBUG:
          levelStr = colorize(levelName, 'cyan');
          break;
        case LogLevel.INFO:
          levelStr = colorize(levelName, 'green');
          break;
        case LogLevel.WARN:
          levelStr = colorize(levelName, 'yellow');
          break;
        case LogLevel.ERROR:
          levelStr = colorize(levelName, 'red');
          break;
      }
    }

    parts.push(`[${levelStr}]`);
  }

  // Add prefix
  const combinedPrefix = [config.prefix, prefix].filter(Boolean).join(':');
  if (combinedPrefix) {
    const prefixStr = config.colors ? colorize(combinedPrefix, 'magenta') : combinedPrefix;
    parts.push(`[${prefixStr}]`);
  }

  // Add message
  parts.push(message);

  return parts.join(' ');
}

/**
 * Get log level icons
 */
function getLevelIcon(level: LogLevel): string {
  switch (level) {
    case LogLevel.DEBUG:
      return '🐛';
    case LogLevel.INFO:
      return 'ℹ️';
    case LogLevel.WARN:
      return '⚠️';
    case LogLevel.ERROR:
      return '❌';
    default:
      return '';
  }
}

/**
 * Write log to file with rotation
 */
async function writeToFile(filePath: string, message: string, config: LoggerConfig): Promise<void> {
  try {
    // Ensure directory exists
    const dir = dirname(filePath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    // Check file size for rotation
    if (existsSync(filePath) && config.maxFileSize) {
      const stats = await import('fs/promises').then((fs) => fs.stat(filePath));

      if (stats.size > config.maxFileSize) {
        await rotateLogFile(filePath, config.maxFiles || 5);
      }
    }

    // Append to file
    await writeFile(filePath, message + '\n', { flag: 'a' });
  } catch (error) {
    // Silently fail file logging to avoid infinite loops
    if (process.env.NODE_ENV === 'development') {
      console.error('Failed to write to log file:', error);
    }
  }
}

/**
 * Rotate log files
 */
async function rotateLogFile(filePath: string, maxFiles: number): Promise<void> {
  const { rename, unlink } = await import('fs/promises');

  try {
    // Remove oldest file if it exists
    const oldestFile = `${filePath}.${maxFiles}`;
    if (existsSync(oldestFile)) {
      await unlink(oldestFile);
    }

    // Rotate existing files
    for (let i = maxFiles - 1; i >= 1; i--) {
      const currentFile = i === 1 ? filePath : `${filePath}.${i}`;
      const nextFile = `${filePath}.${i + 1}`;

      if (existsSync(currentFile)) {
        await rename(currentFile, nextFile);
      }
    }
  } catch (error) {
    // Silently fail rotation
    if (process.env.NODE_ENV === 'development') {
      console.error('Failed to rotate log file:', error);
    }
  }
}

/**
 * Create a logger instance
 */
export function createLogger(config: Partial<LoggerConfig> = {}): Logger {
  const finalConfig: LoggerConfig = { ...DEFAULT_CONFIG, ...config };

  const logger: Logger = {
    debug(message: string, ...args: any[]): void {
      this.log(LogLevel.DEBUG, message, ...args);
    },

    info(message: string, ...args: any[]): void {
      this.log(LogLevel.INFO, message, ...args);
    },

    warn(message: string, ...args: any[]): void {
      this.log(LogLevel.WARN, message, ...args);
    },

    error(message: string, ...args: any[]): void {
      this.log(LogLevel.ERROR, message, ...args);
    },

    log(level: LogLevel, message: string, ...args: any[]): void {
      // Check if level is enabled
      if (level < finalConfig.level) {
        return;
      }

      // Format message
      const formattedMessage = formatMessage(level, message, finalConfig);

      // Add additional arguments
      const fullMessage =
        args.length > 0
          ? `${formattedMessage} ${args
              .map((arg) => (typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)))
              .join(' ')}`
          : formattedMessage;

      // Console output
      if (finalConfig.console) {
        const icon = getLevelIcon(level);
        const consoleMessage = icon ? `${icon} ${fullMessage}` : fullMessage;

        switch (level) {
          case LogLevel.DEBUG:
            console.debug(consoleMessage);
            break;
          case LogLevel.INFO:
            console.info(consoleMessage);
            break;
          case LogLevel.WARN:
            console.warn(consoleMessage);
            break;
          case LogLevel.ERROR:
            console.error(consoleMessage);
            break;
        }
      }

      // File output
      if (finalConfig.file) {
        // Remove ANSI colors for file output
        const cleanMessage = fullMessage.replace(/\x1b\[[0-9;]*m/g, '');
        writeToFile(finalConfig.file, cleanMessage, finalConfig).catch(() => {
          // Silently fail
        });
      }
    },

    setLevel(level: LogLevel): void {
      finalConfig.level = level;
    },

    getLevel(): LogLevel {
      return finalConfig.level;
    },

    enableColors(enabled: boolean): void {
      finalConfig.colors = enabled;
    },

    enableTimestamps(enabled: boolean): void {
      finalConfig.timestamps = enabled;
    },

    setPrefix(prefix: string): void {
      finalConfig.prefix = prefix;
    },

    child(prefix: string): Logger {
      const childConfig = { ...finalConfig };
      childConfig.prefix = finalConfig.prefix ? `${finalConfig.prefix}:${prefix}` : prefix;

      return createLogger(childConfig);
    },
  };

  return logger;
}

/**
 * Default logger instance
 */
export const logger = createLogger();

/**
 * Quick logging functions
 */
export const debug = (message: string, ...args: any[]) => logger.debug(message, ...args);
export const info = (message: string, ...args: any[]) => logger.info(message, ...args);
export const warn = (message: string, ...args: any[]) => logger.warn(message, ...args);
export const error = (message: string, ...args: any[]) => logger.error(message, ...args);
