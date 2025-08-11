/**
 * Test Logger - Specialized logging for test environments
 *
 * Provides structured logging for both London and Classical TDD approaches
 */

export interface LogEntry {
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  timestamp: number;
  context?: Record<string, unknown>;
  testName?: string;
  category?: string;
}

export class TestLogger {
  private logs: LogEntry[] = [];
  private testName?: string;
  private silent: boolean = false;

  constructor(testName?: string, silent: boolean = false) {
    this.testName = testName;
    this.silent = silent;
  }

  /**
   * Log a debug message
   *
   * @param message
   * @param context
   */
  debug(message: string, context?: Record<string, unknown>): void {
    this.log('debug', message, context);
  }

  /**
   * Log an info message
   *
   * @param message
   * @param context
   */
  info(message: string, context?: Record<string, unknown>): void {
    this.log('info', message, context);
  }

  /**
   * Log a warning message
   *
   * @param message
   * @param context
   */
  warn(message: string, context?: Record<string, unknown>): void {
    this.log('warn', message, context);
  }

  /**
   * Log an error message
   *
   * @param message
   * @param context
   */
  error(message: string, context?: Record<string, unknown>): void {
    this.log('error', message, context);
  }

  /**
   * Log test interactions (London School)
   *
   * @param component
   * @param method
   * @param args
   * @param result
   */
  logInteraction(component: string, method: string, args?: unknown[], result?: any): void {
    this.log('debug', `Interaction: ${component}.${method}`, {
      component,
      method,
      args,
      result,
      category: 'interaction',
    });
  }

  /**
   * Log state changes (Classical School)
   *
   * @param component
   * @param before
   * @param after
   * @param operation
   */
  logStateChange(component: string, before: any, after: any, operation?: string): void {
    this.log('debug', `State change in ${component}`, {
      component,
      before,
      after,
      operation,
      category: 'state-change',
    });
  }

  /**
   * Log performance metrics
   *
   * @param operation
   * @param duration
   * @param context
   */
  logPerformance(operation: string, duration: number, context?: Record<string, unknown>): void {
    this.log('info', `Performance: ${operation} took ${duration}ms`, {
      operation,
      duration,
      category: 'performance',
      ...context,
    });
  }

  /**
   * Log assertion results
   *
   * @param description
   * @param passed
   * @param expected
   * @param actual
   */
  logAssertion(description: string, passed: boolean, expected?: any, actual?: any): void {
    const level = passed ? 'info' : 'error';
    this.log(level, `Assertion: ${description} - ${passed ? 'PASSED' : 'FAILED'}`, {
      description,
      passed,
      expected,
      actual,
      category: 'assertion',
    });
  }

  /**
   * Get all logs
   */
  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  /**
   * Get logs by level
   *
   * @param level
   */
  getLogsByLevel(level: LogEntry['level']): LogEntry[] {
    return this.logs.filter((log) => log.level === level);
  }

  /**
   * Get logs by category
   *
   * @param category
   */
  getLogsByCategory(category: string): LogEntry[] {
    return this.logs.filter((log) => log.context?.category === category);
  }

  /**
   * Clear all logs
   */
  clearLogs(): void {
    this.logs = [];
  }

  /**
   * Export logs as string
   *
   * @param format
   */
  exportLogs(format: 'text' | 'json' = 'text'): string {
    if (format === 'json') {
      return JSON.stringify(this.logs, null, 2);
    }

    return this.logs
      .map((log) => {
        const timestamp = new Date(log.timestamp).toISOString();
        const context = log.context ? ` | ${JSON.stringify(log.context)}` : '';
        return `[${timestamp}] ${log.level.toUpperCase()}: ${log.message}${context}`;
      })
      .join('\n');
  }

  /**
   * Create a child logger for a specific component/test
   *
   * @param name
   */
  createChild(name: string): TestLogger {
    const child = new TestLogger(`${this.testName ? `${this.testName}.` : ''}${name}`, this.silent);
    // Share the log storage
    child?.logs = this.logs;
    return child;
  }

  private log(level: LogEntry['level'], message: string, context?: Record<string, unknown>): void {
    const entry: LogEntry = {
      level,
      message,
      timestamp: Date.now(),
      context,
      testName: this.testName,
    };

    this.logs.push(entry);

    if (!this.silent && process.env['NODE_ENV'] === 'test') {
      const _prefix = this.testName ? `[${this.testName}] ` : '';
    }
  }
}

// Global test logger instance
export const testLogger = new TestLogger();

// Factory function for creating test-specific loggers
export function createTestLogger(testName: string, silent?: boolean): TestLogger {
  return new TestLogger(testName, silent);
}
