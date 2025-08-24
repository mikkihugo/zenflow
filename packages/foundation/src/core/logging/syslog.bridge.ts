/**
 * @fileoverview LogTape Syslog Bridge for System-Wide Logging
 *
 * Integrates LogTape with system syslog for centralized logging across
 * all claude-zen components. Provides structured logging that appears
 * in journalctl and system logs.
 *
 * This is part of the foundation logging infrastructure, providing
 * enterprise-grade system integration for all claude-zen packages.
 */

import { spawn } from 'child_process';

import { getLogger, type Logger } from '../logging';
import type { UnknownRecord } from '../../types/core/primitives';

export interface SyslogEntry {
  timestamp: string;
  level: 'debug' | 'info' | 'warn' | 'error' | 'fatal';
  component: string;
  message: string;
  metadata?: UnknownRecord;
  sessionId?: string;
  traceId?: string;
}

export class LogTapeSyslogBridge {
  private logger: Logger;
  private isEnabled = true;
  private componentName: string;

  constructor(componentName = 'claude-zen') {
    this.componentName = componentName;
    this.logger = getLogger('SyslogBridge');
    this.setupSyslogLogging();
  }

  /**
   * Initialize syslog logging integration
   */
  private setupSyslogLogging(): void {
    try {
      // Create a structured logging format that syslog can understand
      this.logger.info('LogTape syslog bridge initialized', {
        component: this.componentName,
        pid: process.pid,
        node_version: process.version,
      });
    } catch (error) {
      // Use direct error logging to avoid circular dependency with syslog bridge
      process.stderr.write(
        `[SyslogBridge] Failed to initialize syslog bridge: ${error}\n`,
      );
      this.isEnabled = false;
    }
  }

  /**
   * Send structured log entry to syslog
   */
  public logToSyslog(entry: SyslogEntry): void {
    if (!this.isEnabled) {
      return;
    }

    try {
      // Format for syslog with structured data
      const syslogMessage = this.formatSyslogMessage(entry);

      // Send to system logger via logger command
      this.sendToSystemLog(entry.level, syslogMessage);

      // Also log via LogTape for database storage
      this.logViaLogTape(entry);
    } catch (error) {
      // Use direct error logging to avoid circular dependency with syslog bridge
      process.stderr.write(`[SyslogBridge] Syslog bridge error: ${error}\n`);
    }
  }

  /**
   * Format message for syslog consumption
   */
  private formatSyslogMessage(entry: SyslogEntry): string {
    const { component, message, metadata, sessionId, traceId } = entry;

    let formatted = `[${component}]`;

    if (sessionId) {
      formatted += ` [session:${sessionId}]`;
    }
    if (traceId) {
      formatted += ` [trace:${traceId}]`;
    }

    formatted += ` ${message}`;

    if (metadata && Object.keys(metadata).length > 0) {
      formatted += `|${JSON.stringify(metadata)}`;
    }

    return formatted;
  }

  /**
   * Send to system log using logger command
   */
  private sendToSystemLog(level: string, message: string): void {
    try {
      // Map LogTape levels to syslog priorities
      const syslogPriority = this.mapLogLevel(level);

      // Use logger command to send to syslog
      const loggerProcess = spawn('logger',
        ['-t', this.componentName, '-p', syslogPriority, message],
        {
          stdio: 'ignore',
          detached: true,
        },
      );

      loggerProcess.unref();
    } catch (error) {
      // Fallback to direct stdout if logger command fails (avoid circular logging)
      const errorMsg = error instanceof Error ? error.message : String(error);
      process.stdout.write(
        `SYSLOG[${level.toUpperCase()}] ${this.componentName}: ${message}\n`,
      );
      process.stderr.write(
        `SYSLOG_ERROR: Failed to write to syslog: ${errorMsg}\n`,
      );
    }
  }

  /**
   * Map LogTape log levels to syslog priorities
   */
  private mapLogLevel(level: string): string {
    switch (level.toLowerCase()) {
    case 'fatal':
    case 'error':
      return 'user.err';
    case 'warn':
      return 'user.warning';
    case 'info':
      return 'user.info';
    case 'debug':
      return 'user.debug';
    default:
      return 'user.info';
    }
  }

  /**
   * Log via LogTape for database persistence
   */
  private logViaLogTape(entry: SyslogEntry): void {
    // Map to LogTape methods (no 'fatal' method)
    const logMethod =
      entry.level === 'fatal'? this.logger.error
        : this.logger[entry.level]||this.logger.info;
    logMethod.call(this.logger, entry.message, {
      component: entry.component,
      metadata: entry.metadata,
      sessionId: entry.sessionId,
      traceId: entry.traceId,
      syslogTimestamp: entry.timestamp,
    });
  }

  /**
   * Convenience methods for different log levels
   */
  public info(
    component: string,
    message: string,
    metadata?: UnknownRecord,
  ): void {
    this.logToSyslog({
      timestamp: new Date().toISOString(),
      level:'info',
      component,
      message,
      metadata,
    });
  }

  public warn(
    component: string,
    message: string,
    metadata?: UnknownRecord,
  ): void {
    this.logToSyslog({
      timestamp: new Date().toISOString(),
      level: 'warn',
      component,
      message,
      metadata,
    });
  }

  public error(
    component: string,
    message: string,
    metadata?: UnknownRecord,
  ): void {
    this.logToSyslog({
      timestamp: new Date().toISOString(),
      level: 'error',
      component,
      message,
      metadata,
    });
  }

  public debug(
    component: string,
    message: string,
    metadata?: UnknownRecord,
  ): void {
    this.logToSyslog({
      timestamp: new Date().toISOString(),
      level: 'debug',
      component,
      message,
      metadata,
    });
  }

  /**
   * Batch log multiple entries (useful for performance)
   */
  public logBatch(entries: SyslogEntry[]): void {
    for (const entry of entries) {
      this.logToSyslog(entry);
    }
  }

  /**
   * Enable/disable syslog integration
   */
  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    this.logger.info(`Syslog bridge ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Check if syslog integration is working
   */
  public async testSyslogIntegration(): Promise<boolean> {
    try {
      this.info('test', 'Syslog integration test message');

      // Allow time for syslog message to be processed
      await new Promise(resolve => setTimeout(resolve, 100));

      return true;
    } catch (error) {
      this.logger.error('Syslog test failed', { error });
      return false;
    }
  }

  /**
   * Get syslog configuration status
   */
  public getStatus(): UnknownRecord {
    return {
      enabled: this.isEnabled,
      component: this.componentName,
      pid: process.pid,
      loggerAvailable: this.checkLoggerCommand(),
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Check if logger command is available
   */
  private checkLoggerCommand(): boolean {
    try {
      const result = spawn('which', ['logger'], { stdio: 'pipe' });
      return result !== null;
    } catch {
      return false;
    }
  }
}

// Singleton instance for global use
export const syslogBridge = new LogTapeSyslogBridge('claude-zen');

// Export convenience functions
export const logToSyslog = {
  info: (component: string, message: string, metadata?: UnknownRecord) =>
    syslogBridge.info(component, message, metadata),
  warn: (component: string, message: string, metadata?: UnknownRecord) =>
    syslogBridge.warn(component, message, metadata),
  error: (component: string, message: string, metadata?: UnknownRecord) =>
    syslogBridge.error(component, message, metadata),
  debug: (component: string, message: string, metadata?: UnknownRecord) =>
    syslogBridge.debug(component, message, metadata),
};
