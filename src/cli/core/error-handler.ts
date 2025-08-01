/**
 * Error Handler
 * 
 * Global error handling system for the CLI application.
 * Provides error formatting, debugging support, and error reporting.
 */

import { writeFile } from 'fs/promises';
import { join } from 'path';
import { homedir } from 'os';
import chalk from 'chalk';
import type { CommandContext, CommandResult } from '../types/index';

/**
 * Error severity levels
 */
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

/**
 * Error categories
 */
export enum ErrorCategory {
  VALIDATION = 'validation',
  EXECUTION = 'execution',
  SYSTEM = 'system',
  NETWORK = 'network',
  PERMISSION = 'permission',
  CONFIG = 'config',
  USER = 'user',
  INTERNAL = 'internal'
}

/**
 * Enhanced error information
 */
export interface ErrorInfo {
  error: Error;
  context?: CommandContext;
  category: ErrorCategory;
  severity: ErrorSeverity;
  timestamp: number;
  stack?: string;
  metadata?: Record<string, unknown>;
  suggestions?: string[];
  recoverable: boolean;
}

/**
 * Error reporting configuration
 */
export interface ErrorReportingConfig {
  enabled: boolean;
  logFile?: string;
  includeStack: boolean;
  includeContext: boolean;
  includeEnvironment: boolean;
  maxLogSize: number; // in bytes
  anonymize: boolean;
}

/**
 * Error handler configuration
 */
export interface ErrorHandlerConfig {
  debug: boolean;
  verbose: boolean;
  colors: boolean;
  reporting: ErrorReportingConfig;
  exitOnCritical: boolean;
  showSuggestions: boolean;
}

/**
 * Global error handler for CLI application
 */
export class ErrorHandler {
  private static instance: ErrorHandler;
  private config: ErrorHandlerConfig;
  private errorLog: ErrorInfo[] = [];
  private maxLogEntries = 1000;

  constructor(config: Partial<ErrorHandlerConfig> = {}) {
    this.config = {
      debug: false,
      verbose: false,
      colors: true,
      exitOnCritical: true,
      showSuggestions: true,
      reporting: {
        enabled: true,
        includeStack: true,
        includeContext: false,
        includeEnvironment: false,
        maxLogSize: 10 * 1024 * 1024, // 10MB
        anonymize: true
      },
      ...config
    };
  }

  /**
   * Get singleton instance
   */
  static getInstance(config?: Partial<ErrorHandlerConfig>): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler(config);
    }
    return ErrorHandler.instance;
  }

  /**
   * Handle an error with full context
   */
  async handle(error: Error, context?: CommandContext, metadata?: Record<string, unknown>): Promise<void> {
    const errorInfo = this.analyzeError(error, context, metadata);
    
    // Add to error log
    this.addToLog(errorInfo);
    
    // Display error to user
    this.displayError(errorInfo);
    
    // Report error if enabled
    if (this.config.reporting.enabled) {
      await this.reportError(errorInfo);
    }
    
    // Exit on critical errors if configured
    if (this.config.exitOnCritical && errorInfo.severity === ErrorSeverity.CRITICAL) {
      process.exit(1);
    }
  }

  /**
   * Handle command execution errors
   */
  async handleCommandError(
    error: Error, 
    commandName: string, 
    context: CommandContext
  ): Promise<CommandResult> {
    const metadata = { command: commandName };
    await this.handle(error, context, metadata);
    
    return {
      success: false,
      error: error.message,
      exitCode: this.getExitCode(error),
      executionTime: 0
    };
  }

  /**
   * Handle unhandled promise rejections
   */
  handleUnhandledRejection(reason: unknown, promise: Promise<unknown>): void {
    const error = reason instanceof Error ? reason : new Error(String(reason));
    const metadata = { unhandledRejection: true, promise: promise.toString() };
    
    this.handle(error, undefined, metadata).catch(console.error);
  }

  /**
   * Handle uncaught exceptions
   */
  handleUncaughtException(error: Error): void {
    const metadata = { uncaughtException: true };
    
    this.handle(error, undefined, metadata).catch(console.error);
    
    // Always exit on uncaught exceptions
    process.exit(1);
  }

  /**
   * Setup global error handlers
   */
  setupGlobalHandlers(): void {
    process.on('unhandledRejection', (reason, promise) => {
      this.handleUnhandledRejection(reason, promise);
    });
    
    process.on('uncaughtException', (error) => {
      this.handleUncaughtException(error);
    });
  }

  /**
   * Analyze error and extract information
   */
  private analyzeError(error: Error, context?: CommandContext, metadata?: Record<string, unknown>): ErrorInfo {
    const category = this.categorizeError(error);
    const severity = this.assessSeverity(error, category);
    const suggestions = this.generateSuggestions(error, category);
    
    return {
      error,
      context,
      category,
      severity,
      timestamp: Date.now(),
      stack: error.stack,
      metadata,
      suggestions,
      recoverable: this.isRecoverable(error, category)
    };
  }

  /**
   * Categorize error type
   */
  private categorizeError(error: Error): ErrorCategory {
    const message = error.message.toLowerCase();
    const name = error.name.toLowerCase();
    
    if (name.includes('validation') || message.includes('invalid') || message.includes('required')) {
      return ErrorCategory.VALIDATION;
    }
    
    if (message.includes('permission') || message.includes('access') || name.includes('permission')) {
      return ErrorCategory.PERMISSION;
    }
    
    if (message.includes('network') || message.includes('connection') || message.includes('timeout')) {
      return ErrorCategory.NETWORK;
    }
    
    if (message.includes('config') || message.includes('configuration')) {
      return ErrorCategory.CONFIG;
    }
    
    if (name.includes('system') || message.includes('system')) {
      return ErrorCategory.SYSTEM;
    }
    
    if (error.stack?.includes('user') || message.includes('user')) {
      return ErrorCategory.USER;
    }
    
    return ErrorCategory.INTERNAL;
  }

  /**
   * Assess error severity
   */
  private assessSeverity(error: Error, category: ErrorCategory): ErrorSeverity {
    // Critical errors that should stop execution
    if (category === ErrorCategory.SYSTEM || error.name === 'FatalError') {
      return ErrorSeverity.CRITICAL;
    }
    
    // High severity errors
    if (category === ErrorCategory.PERMISSION || category === ErrorCategory.CONFIG) {
      return ErrorSeverity.HIGH;
    }
    
    // Medium severity errors
    if (category === ErrorCategory.NETWORK || category === ErrorCategory.EXECUTION) {
      return ErrorSeverity.MEDIUM;
    }
    
    // Low severity errors (validation, user errors)
    return ErrorSeverity.LOW;
  }

  /**
   * Generate helpful suggestions
   */
  private generateSuggestions(error: Error, category: ErrorCategory): string[] {
    const suggestions: string[] = [];
    const message = error.message.toLowerCase();
    
    switch (category) {
      case ErrorCategory.VALIDATION:
        suggestions.push('Check your command arguments and flags');
        suggestions.push('Use --help to see usage information');
        break;
        
      case ErrorCategory.PERMISSION:
        suggestions.push('Check file/directory permissions');
        suggestions.push('Try running with appropriate privileges');
        break;
        
      case ErrorCategory.NETWORK:
        suggestions.push('Check your internet connection');
        suggestions.push('Verify the service endpoint is accessible');
        suggestions.push('Try again in a few moments');
        break;
        
      case ErrorCategory.CONFIG:
        suggestions.push('Check your configuration file');
        suggestions.push('Reset to default configuration if needed');
        break;
        
      case ErrorCategory.SYSTEM:
        suggestions.push('Check system resources (disk space, memory)');
        suggestions.push('Verify system dependencies are installed');
        break;
    }
    
    // Specific message-based suggestions
    if (message.includes('command not found')) {
      suggestions.push('Check if the command is installed and in PATH');
    }
    
    if (message.includes('no such file')) {
      suggestions.push('Verify the file path exists');
    }
    
    return suggestions;
  }

  /**
   * Check if error is recoverable
   */
  private isRecoverable(error: Error, category: ErrorCategory): boolean {
    return [
      ErrorCategory.VALIDATION,
      ErrorCategory.USER,
      ErrorCategory.NETWORK
    ].includes(category);
  }

  /**
   * Display error to user
   */
  private displayError(errorInfo: ErrorInfo): void {
    const { error, category, severity, suggestions } = errorInfo;
    
    // Main error message
    const severityColor = this.getSeverityColor(severity);
    const categoryText = category.toUpperCase();
    
    console.error();
    console.error(severityColor(`${categoryText} ERROR:`), error.message);
    
    // Stack trace in debug mode
    if (this.config.debug && error.stack) {
      console.error();
      console.error(chalk.gray('Stack trace:'));
      console.error(chalk.gray(error.stack));
    }
    
    // Context information in verbose mode
    if (this.config.verbose && errorInfo.context) {
      console.error();
      console.error(chalk.gray('Context:'));
      console.error(chalk.gray(`Args: ${errorInfo.context.args.join(' ')}`));
      console.error(chalk.gray(`Flags: ${JSON.stringify(errorInfo.context.flags)}`));
      console.error(chalk.gray(`Input: ${errorInfo.context.input.join(' ')}`));
    }
    
    // Suggestions
    if (this.config.showSuggestions && suggestions && suggestions.length > 0) {
      console.error();
      console.error(chalk.yellow('Suggestions:'));
      for (const suggestion of suggestions) {
        console.error(chalk.yellow(`  • ${suggestion}`));
      }
    }
    
    console.error();
  }

  /**
   * Get color for severity level
   */
  private getSeverityColor(severity: ErrorSeverity): (text: string) => string {
    if (!this.config.colors) {
      return (text: string) => text;
    }
    
    switch (severity) {
      case ErrorSeverity.CRITICAL:
        return chalk.red.bold;
      case ErrorSeverity.HIGH:
        return chalk.red;
      case ErrorSeverity.MEDIUM:
        return chalk.yellow;
      case ErrorSeverity.LOW:
        return chalk.blue;
      default:
        return chalk.gray;
    }
  }

  /**
   * Get appropriate exit code for error
   */
  private getExitCode(error: Error): number {
    if (error.message.includes('permission')) return 126;
    if (error.message.includes('command not found')) return 127;
    if (error.message.includes('invalid argument')) return 128;
    return 1;
  }

  /**
   * Add error to internal log
   */
  private addToLog(errorInfo: ErrorInfo): void {
    this.errorLog.push(errorInfo);
    
    // Trim log if too large
    if (this.errorLog.length > this.maxLogEntries) {
      this.errorLog = this.errorLog.slice(-this.maxLogEntries);
    }
  }

  /**
   * Report error to log file or external service
   */
  private async reportError(errorInfo: ErrorInfo): Promise<void> {
    try {
      const report = this.formatErrorReport(errorInfo);
      
      if (this.config.reporting.logFile) {
        await this.writeToLogFile(report);
      }
    } catch (reportingError) {
      // Don't throw errors during error reporting
      console.error('Failed to report error:', reportingError);
    }
  }

  /**
   * Format error report
   */
  private formatErrorReport(errorInfo: ErrorInfo): string {
    const report: Record<string, unknown> = {
      timestamp: new Date(errorInfo.timestamp).toISOString(),
      category: errorInfo.category,
      severity: errorInfo.severity,
      message: errorInfo.error.message,
      name: errorInfo.error.name
    };
    
    if (this.config.reporting.includeStack && errorInfo.stack) {
      report.stack = errorInfo.stack;
    }
    
    if (this.config.reporting.includeContext && errorInfo.context) {
      report.context = {
        args: errorInfo.context.args,
        flags: errorInfo.context.flags,
        inputLength: errorInfo.context.input.length
      };
    }
    
    if (this.config.reporting.includeEnvironment) {
      report.environment = {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch
      };
    }
    
    if (errorInfo.metadata) {
      report.metadata = errorInfo.metadata;
    }
    
    return JSON.stringify(report, null, 2);
  }

  /**
   * Write error report to log file
   */
  private async writeToLogFile(report: string): Promise<void> {
    const logFile = this.config.reporting.logFile || join(homedir(), '.claude-zen-errors.log');
    const timestamp = new Date().toISOString();
    const logEntry = `\\n--- ${timestamp} ---\\n${report}\\n`;
    
    await writeFile(logFile, logEntry, { flag: 'a' });
  }

  /**
   * Get error statistics
   */
  getErrorStats(): {
    total: number;
    byCategory: Record<ErrorCategory, number>;
    bySeverity: Record<ErrorSeverity, number>;
    recent: ErrorInfo[];
  } {
    const stats = {
      total: this.errorLog.length,
      byCategory: {} as Record<ErrorCategory, number>,
      bySeverity: {} as Record<ErrorSeverity, number>,
      recent: this.errorLog.slice(-10)
    };
    
    // Initialize counters
    Object.values(ErrorCategory).forEach(category => {
      stats.byCategory[category] = 0;
    });
    
    Object.values(ErrorSeverity).forEach(severity => {
      stats.bySeverity[severity] = 0;
    });
    
    // Count errors
    for (const errorInfo of this.errorLog) {
      stats.byCategory[errorInfo.category]++;
      stats.bySeverity[errorInfo.severity]++;
    }
    
    return stats;
  }

  /**
   * Clear error log
   */
  clearLog(): void {
    this.errorLog.length = 0;
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<ErrorHandlerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): ErrorHandlerConfig {
    return { ...this.config };
  }
}