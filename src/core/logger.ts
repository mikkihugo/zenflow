/**
 * Logging infrastructure for Claude-Flow
 */

import { LoggingConfig } from '../utils/types.ts';
import { formatBytes } from '../utils/helpers.ts';

export interface ILogger {
  debug(message: string, meta?: unknown): void;
  info(message: string, meta?: unknown): void;
  warn(message: string, meta?: unknown): void;
  error(message: string, error?: unknown): void;
  configure(config: LoggingConfig): Promise<void>;
}

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  context: Record<string, unknown>;
  data?: unknown;
  error?: unknown;
}

/**
 * Logger implementation with context support
 */
export class Logger implements ILogger {
  private static instance: Logger;
  private config: LoggingConfig;
  private context: Record<string, unknown>;
  private fileHandle?: Deno.FsFile;
  private currentFileSize = 0;
  private currentFileIndex = 0;

  constructor(
    config: LoggingConfig = {
      level: 'info',
      format: 'json',
      destination: 'console',
    },
    context: Record<string, unknown> = {},
  ) {
    this.config = config;
    this.context = context;
  }

  /**
   * Gets the singleton instance of the logger
   */
  static getInstance(config?: LoggingConfig): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger(config);
    }
    return Logger.instance;
  }

  /**
   * Updates logger configuration
   */
  async configure(config: LoggingConfig): Promise<void> {
    this.config = config;
    
    // Reset file handle if destination changed
    if (this.fileHandle && config.destination !== 'file' && config.destination !== 'both') {
      await this.fileHandle.close();
      this.fileHandle = undefined;
    }
  }

  debug(message: string, meta?: unknown): void {
    this.log(LogLevel.DEBUG, message, meta);
  }

  info(message: string, meta?: unknown): void {
    this.log(LogLevel.INFO, message, meta);
  }

  warn(message: string, meta?: unknown): void {
    this.log(LogLevel.WARN, message, meta);
  }

  error(message: string, error?: unknown): void {
    this.log(LogLevel.ERROR, message, undefined, error);
  }

  /**
   * Creates a child logger with additional context
   */
  child(context: Record<string, unknown>): Logger {
    return new Logger(this.config, { ...this.context, ...context });
  }

  private log(level: LogLevel, message: string, data?: unknown, error?: unknown): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: LogLevel[level],
      message,
      context: this.context,
      data,
      error,
    };

    const formatted = this.format(entry);

    if (this.config.destination === 'console' || this.config.destination === 'both') {
      this.writeToConsole(level, formatted);
    }

    if (this.config.destination === 'file' || this.config.destination === 'both') {
      this.writeToFile(formatted);
    }
  }

  private shouldLog(level: LogLevel): boolean {
    const configLevel = LogLevel[this.config.level.toUpperCase() as keyof typeof LogLevel];
    return level >= configLevel;
  }

  private format(entry: LogEntry): string {
    if (this.config.format === 'json') {
      return JSON.stringify(entry);
    }

    // Text format
    const contextStr = Object.keys(entry.context).length > 0
      ? ` ${JSON.stringify(entry.context)}`
      : '';
    const dataStr = entry.data !== undefined
      ? ` ${JSON.stringify(entry.data)}`
      : '';
    const errorStr = entry.error !== undefined
      ? entry.error instanceof Error
        ? `\n  Error: ${entry.error.message}\n  Stack: ${entry.error.stack}`
        : ` Error: ${JSON.stringify(entry.error)}`
      : '';

    return `[${entry.timestamp}] ${entry.level} ${entry.message}${contextStr}${dataStr}${errorStr}`;
  }

  private writeToConsole(level: LogLevel, message: string): void {
    switch (level) {
      case LogLevel.DEBUG:
        console.debug(message);
        break;
      case LogLevel.INFO:
        console.info(message);
        break;
      case LogLevel.WARN:
        console.warn(message);
        break;
      case LogLevel.ERROR:
        console.error(message);
        break;
    }
  }

  private async writeToFile(message: string): Promise<void> {
    if (!this.config.filePath) {
      return;
    }

    try {
      // Check if we need to rotate the log file
      if (await this.shouldRotate()) {
        await this.rotate();
      }

      // Open file handle if not already open
      if (!this.fileHandle) {
        this.fileHandle = await Deno.open(this.config.filePath, {
          create: true,
          append: true,
          write: true,
        });
      }

      // Write the message
      const encoder = new TextEncoder();
      const data = encoder.encode(message + '\n');
      await this.fileHandle.write(data);
      this.currentFileSize += data.length;
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }

  private async shouldRotate(): Promise<boolean> {
    if (!this.config.maxFileSize || !this.fileHandle) {
      return false;
    }

    try {
      const stat = await this.fileHandle.stat();
      return stat.size >= this.config.maxFileSize;
    } catch {
      return false;
    }
  }

  private async rotate(): Promise<void> {
    if (!this.config.filePath || !this.config.maxFiles) {
      return;
    }

    // Close current file
    if (this.fileHandle) {
      await this.fileHandle.close();
      this.fileHandle = undefined;
    }

    // Rename current file
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const rotatedPath = `${this.config.filePath}.${timestamp}`;
    await Deno.rename(this.config.filePath, rotatedPath);

    // Clean up old files
    await this.cleanupOldFiles();

    // Reset file size
    this.currentFileSize = 0;
  }

  private async cleanupOldFiles(): Promise<void> {
    if (!this.config.filePath || !this.config.maxFiles) {
      return;
    }

    const dir = this.config.filePath.substring(0, this.config.filePath.lastIndexOf('/'));
    const baseFileName = this.config.filePath.substring(this.config.filePath.lastIndexOf('/') + 1);

    const files: string[] = [];
    for await (const entry of Deno.readDir(dir)) {
      if (entry.isFile && entry.name.startsWith(baseFileName + '.')) {
        files.push(entry.name);
      }
    }

    // Sort files by timestamp (newest first)
    files.sort().reverse();

    // Remove old files
    const filesToRemove = files.slice(this.config.maxFiles - 1);
    for (const file of filesToRemove) {
      await Deno.remove(`${dir}/${file}`);
    }
  }
}

// Export singleton instance
export const logger = Logger.getInstance();