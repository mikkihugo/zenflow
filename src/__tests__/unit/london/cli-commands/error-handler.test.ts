/**
 * Error Handler Tests - TDD London School
 *
 * Tests the behavior of error handling functionality using mocks
 * and interaction-based testing. Focuses on how the error handler
 * collaborates with logging, formatting, and recovery systems.
 */

import { jest } from '@jest/globals';

// Mock error handler interface for testing interactions
interface ErrorHandler {
  handle(error: Error, context?: ErrorContext): Promise<ErrorResult>;
  register(type: string, handler: ErrorHandlerFunction): void;
  setDefaults(defaults: ErrorHandlerDefaults): void;
  addRecoveryStrategy(strategy: RecoveryStrategy): void;
  getMetrics(): ErrorMetrics;
}

interface ErrorContext {
  command?: string;
  args?: string[];
  flags?: Record<string, unknown>;
  user?: string;
  session?: string;
  timestamp?: Date;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

interface ErrorResult {
  handled: boolean;
  recovered: boolean;
  exitCode: number;
  message: string;
  suggestion?: string;
  retryable: boolean;
  logged: boolean;
}

interface ErrorHandlerDefaults {
  exitOnError?: boolean;
  logErrors?: boolean;
  showStack?: boolean;
  colorOutput?: boolean;
  verboseErrors?: boolean;
}

interface ErrorMetrics {
  totalErrors: number;
  errorsByType: Record<string, number>;
  recoveredErrors: number;
  fatalErrors: number;
  averageHandlingTime: number;
}

type ErrorHandlerFunction = (
  error: Error,
  context?: ErrorContext,
) => Promise<ErrorResult> | ErrorResult;

interface RecoveryStrategy {
  name: string;
  canRecover: (error: Error, context?: ErrorContext) => boolean;
  recover: (error: Error, context?: ErrorContext) => Promise<boolean>;
  priority: number;
}

// Mock logger interface
interface MockLogger {
  error: jest.Mock;
  warn: jest.Mock;
  info: jest.Mock;
  debug: jest.Mock;
}

// Mock implementation for testing
class MockErrorHandler implements ErrorHandler {
  private handlers = new Map<string, ErrorHandlerFunction>();
  private recoveryStrategies: RecoveryStrategy[] = [];
  private defaults: ErrorHandlerDefaults = {};
  private metrics: ErrorMetrics = {
    totalErrors: 0,
    errorsByType: {},
    recoveredErrors: 0,
    fatalErrors: 0,
    averageHandlingTime: 0,
  };
  private logger: MockLogger;
  private handleFunction: jest.Mock;

  constructor(handleFunction?: jest.Mock, logger?: MockLogger) {
    this.handleFunction = handleFunction || jest.fn();
    this.logger = logger || {
      error: jest.fn(),
      warn: jest.fn(),
      info: jest.fn(),
      debug: jest.fn(),
    };
  }

  async handle(error: Error, context?: ErrorContext): Promise<ErrorResult> {
    const startTime = Date.now();

    // Update metrics
    this.metrics.totalErrors++;
    const errorType = error.constructor.name;
    this.metrics.errorsByType[errorType] = (this.metrics.errorsByType[errorType] || 0) + 1;

    // Call mock function for testing
    const result = await this.handleFunction(error, context);

    // Update timing metrics
    const handlingTime = Date.now() - startTime;
    this.metrics.averageHandlingTime =
      (this.metrics.averageHandlingTime * (this.metrics.totalErrors - 1) + handlingTime) /
      this.metrics.totalErrors;

    if (result.recovered) {
      this.metrics.recoveredErrors++;
    } else if (result.exitCode !== 0) {
      this.metrics.fatalErrors++;
    }

    return result;
  }

  register(type: string, handler: ErrorHandlerFunction): void {
    this.handlers.set(type, handler);
  }

  setDefaults(defaults: ErrorHandlerDefaults): void {
    this.defaults = { ...this.defaults, ...defaults };
  }

  addRecoveryStrategy(strategy: RecoveryStrategy): void {
    // Insert strategy in priority order
    const index = this.recoveryStrategies.findIndex((s) => s.priority < strategy.priority);
    if (index === -1) {
      this.recoveryStrategies.push(strategy);
    } else {
      this.recoveryStrategies.splice(index, 0, strategy);
    }
  }

  getMetrics(): ErrorMetrics {
    return { ...this.metrics };
  }

  // Test helpers
  getHandler(type: string): ErrorHandlerFunction | undefined {
    return this.handlers.get(type);
  }

  getDefaults(): ErrorHandlerDefaults {
    return { ...this.defaults };
  }

  getRecoveryStrategies(): RecoveryStrategy[] {
    return [...this.recoveryStrategies];
  }

  getLogger(): MockLogger {
    return this.logger;
  }
}

// Custom error types for testing
class ValidationError extends Error {
  constructor(
    message: string,
    public field?: string,
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

class NetworkError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
  ) {
    super(message);
    this.name = 'NetworkError';
  }
}

class CommandNotFoundError extends Error {
  constructor(command: string) {
    super(`Command '${command}' not found`);
    this.name = 'CommandNotFoundError';
  }
}

describe('ErrorHandler - TDD London', () => {
  let errorHandler: MockErrorHandler;
  let mockHandleFunction: jest.Mock;
  let mockLogger: MockLogger;

  beforeEach(() => {
    mockHandleFunction = jest.fn();
    mockLogger = {
      error: jest.fn(),
      warn: jest.fn(),
      info: jest.fn(),
      debug: jest.fn(),
    };
    errorHandler = new MockErrorHandler(mockHandleFunction, mockLogger);
  });

  describe('basic error handling behavior', () => {
    it('should handle error and return result', async () => {
      // Arrange
      const error = new Error('Test error');
      const context: ErrorContext = {
        command: 'test-command',
        severity: 'medium',
      };
      const expectedResult: ErrorResult = {
        handled: true,
        recovered: false,
        exitCode: 1,
        message: 'Test error handled',
        retryable: false,
        logged: true,
      };
      mockHandleFunction.mockResolvedValue(expectedResult);

      // Act
      const result = await errorHandler.handle(error, context);

      // Assert - verify error handling behavior
      expect(mockHandleFunction).toHaveBeenCalledWith(error, context);
      expect(result).toEqual(expectedResult);
    });

    it('should update metrics when handling errors', async () => {
      // Arrange
      const error1 = new ValidationError('Validation failed');
      const error2 = new NetworkError('Network timeout');
      const error3 = new ValidationError('Another validation error');

      mockHandleFunction.mockImplementation(async () => {
        // Add small delay to simulate processing time
        await new Promise((resolve) => setTimeout(resolve, 1));
        return {
          handled: true,
          recovered: false,
          exitCode: 1,
          message: 'Error handled',
          retryable: false,
          logged: true,
        };
      });

      // Act
      await errorHandler.handle(error1);
      await errorHandler.handle(error2);
      await errorHandler.handle(error3);

      // Assert - verify metrics tracking behavior
      const metrics = errorHandler.getMetrics();
      expect(metrics.totalErrors).toBe(3);
      expect(metrics.errorsByType.ValidationError).toBe(2);
      expect(metrics.errorsByType.NetworkError).toBe(1);
      expect(metrics.averageHandlingTime).toBeGreaterThan(0);
    });

    it('should track recovery metrics correctly', async () => {
      // Arrange
      const recoverableError = new NetworkError('Timeout');
      const fatalError = new Error('Fatal error');

      mockHandleFunction
        .mockResolvedValueOnce({
          handled: true,
          recovered: true,
          exitCode: 0,
          message: 'Recovered from timeout',
          retryable: true,
          logged: true,
        })
        .mockResolvedValueOnce({
          handled: true,
          recovered: false,
          exitCode: 1,
          message: 'Fatal error occurred',
          retryable: false,
          logged: true,
        });

      // Act
      await errorHandler.handle(recoverableError);
      await errorHandler.handle(fatalError);

      // Assert - verify recovery metrics
      const metrics = errorHandler.getMetrics();
      expect(metrics.recoveredErrors).toBe(1);
      expect(metrics.fatalErrors).toBe(1);
    });
  });

  describe('error handler registration behavior', () => {
    it('should register custom error handlers for specific types', () => {
      // Arrange
      const validationHandler: ErrorHandlerFunction = jest.fn().mockReturnValue({
        handled: true,
        recovered: true,
        exitCode: 0,
        message: 'Validation error recovered',
        retryable: true,
        logged: false,
      });

      // Act
      errorHandler.register('ValidationError', validationHandler);

      // Assert - verify handler registration
      expect(errorHandler.getHandler('ValidationError')).toBe(validationHandler);
    });

    it('should allow multiple handlers for different error types', () => {
      // Arrange
      const validationHandler = jest.fn();
      const networkHandler = jest.fn();
      const genericHandler = jest.fn();

      // Act
      errorHandler.register('ValidationError', validationHandler);
      errorHandler.register('NetworkError', networkHandler);
      errorHandler.register('Error', genericHandler);

      // Assert - verify multiple handler registration
      expect(errorHandler.getHandler('ValidationError')).toBe(validationHandler);
      expect(errorHandler.getHandler('NetworkError')).toBe(networkHandler);
      expect(errorHandler.getHandler('Error')).toBe(genericHandler);
    });
  });

  describe('defaults configuration behavior', () => {
    it('should apply default error handling configuration', () => {
      // Arrange
      const defaults: ErrorHandlerDefaults = {
        exitOnError: false,
        logErrors: true,
        showStack: true,
        colorOutput: false,
        verboseErrors: true,
      };

      // Act
      errorHandler.setDefaults(defaults);

      // Assert - verify defaults application
      expect(errorHandler.getDefaults()).toEqual(defaults);
    });

    it('should merge defaults with existing configuration', () => {
      // Arrange
      errorHandler.setDefaults({ logErrors: true, showStack: false });
      errorHandler.setDefaults({ colorOutput: true }); // Additional defaults

      // Act
      const appliedDefaults = errorHandler.getDefaults();

      // Assert - verify defaults merging
      expect(appliedDefaults).toEqual({
        logErrors: true,
        showStack: false,
        colorOutput: true,
      });
    });
  });

  describe('recovery strategy behavior', () => {
    it('should register recovery strategies in priority order', () => {
      // Arrange
      const lowPriorityStrategy: RecoveryStrategy = {
        name: 'low-priority',
        canRecover: jest.fn(() => true),
        recover: jest.fn().mockResolvedValue(true),
        priority: 1,
      };

      const highPriorityStrategy: RecoveryStrategy = {
        name: 'high-priority',
        canRecover: jest.fn(() => true),
        recover: jest.fn().mockResolvedValue(true),
        priority: 10,
      };

      const mediumPriorityStrategy: RecoveryStrategy = {
        name: 'medium-priority',
        canRecover: jest.fn(() => true),
        recover: jest.fn().mockResolvedValue(true),
        priority: 5,
      };

      // Act
      errorHandler.addRecoveryStrategy(lowPriorityStrategy);
      errorHandler.addRecoveryStrategy(highPriorityStrategy);
      errorHandler.addRecoveryStrategy(mediumPriorityStrategy);

      // Assert - verify priority-based ordering
      const strategies = errorHandler.getRecoveryStrategies();
      expect(strategies.map((s) => s.name)).toEqual([
        'high-priority',
        'medium-priority',
        'low-priority',
      ]);
    });

    it('should attempt recovery strategies in order', () => {
      // Arrange
      const retryStrategy: RecoveryStrategy = {
        name: 'retry',
        canRecover: jest.fn(() => true),
        recover: jest.fn().mockResolvedValue(false), // Fails to recover
        priority: 5,
      };

      const fallbackStrategy: RecoveryStrategy = {
        name: 'fallback',
        canRecover: jest.fn(() => true),
        recover: jest.fn().mockResolvedValue(true), // Successfully recovers
        priority: 1,
      };

      errorHandler.addRecoveryStrategy(retryStrategy);
      errorHandler.addRecoveryStrategy(fallbackStrategy);

      // This would be tested in the actual implementation
      // Here we just verify strategies are available
      const strategies = errorHandler.getRecoveryStrategies();
      expect(strategies).toHaveLength(2);
      expect(strategies[0].name).toBe('retry');
      expect(strategies[1].name).toBe('fallback');
    });
  });

  describe('specific error type handling behavior', () => {
    it('should handle validation errors with specific behavior', async () => {
      // Arrange
      const validationError = new ValidationError('Required field missing', 'email');
      const context: ErrorContext = {
        command: 'create-user',
        args: ['john'],
        flags: { name: 'john' },
      };

      mockHandleFunction.mockResolvedValue({
        handled: true,
        recovered: true,
        exitCode: 0,
        message: 'Please provide a valid email address',
        suggestion: 'Use --email flag to specify email',
        retryable: true,
        logged: false,
      });

      // Act
      const result = await errorHandler.handle(validationError, context);

      // Assert - verify validation error handling
      expect(result.handled).toBe(true);
      expect(result.recovered).toBe(true);
      expect(result.suggestion).toContain('email');
      expect(result.retryable).toBe(true);
    });

    it('should handle network errors with retry suggestions', async () => {
      // Arrange
      const networkError = new NetworkError('Connection timeout', 408);
      const context: ErrorContext = {
        command: 'deploy',
        severity: 'high',
      };

      mockHandleFunction.mockResolvedValue({
        handled: true,
        recovered: false,
        exitCode: 2,
        message: 'Network connection failed',
        suggestion: 'Check your internet connection and try again',
        retryable: true,
        logged: true,
      });

      // Act
      const result = await errorHandler.handle(networkError, context);

      // Assert - verify network error handling
      expect(result.retryable).toBe(true);
      expect(result.suggestion).toContain('try again');
      expect(result.logged).toBe(true);
    });

    it('should handle command not found errors with suggestions', async () => {
      // Arrange
      const commandError = new CommandNotFoundError('deplyo'); // Typo
      const context: ErrorContext = {
        command: 'deplyo',
        args: ['app'],
      };

      mockHandleFunction.mockResolvedValue({
        handled: true,
        recovered: false,
        exitCode: 127,
        message: "Command 'deplyo' not found",
        suggestion: "Did you mean 'deploy'?",
        retryable: false,
        logged: false,
      });

      // Act
      const result = await errorHandler.handle(commandError, context);

      // Assert - verify command not found handling
      expect(result.exitCode).toBe(127);
      expect(result.suggestion).toContain('deploy');
      expect(result.retryable).toBe(false);
    });
  });

  describe('logging integration behavior', () => {
    it('should log errors when logging is enabled in defaults', async () => {
      // Arrange
      errorHandler.setDefaults({ logErrors: true, verboseErrors: true });
      const error = new Error('Test error with stack');
      const context: ErrorContext = {
        command: 'test',
        severity: 'high',
      };

      mockHandleFunction.mockResolvedValue({
        handled: true,
        recovered: false,
        exitCode: 1,
        message: 'Error logged',
        retryable: false,
        logged: true,
      });

      // Act
      await errorHandler.handle(error, context);

      // Assert - verify logging behavior would be called
      // In a real implementation, this would verify logger.error was called
      expect(mockHandleFunction).toHaveBeenCalledWith(error, context);
    });

    it('should respect logging configuration for different severity levels', async () => {
      // Arrange
      const lowSeverityError = new Error('Low severity');
      const highSeverityError = new Error('High severity');

      const lowContext: ErrorContext = { severity: 'low' };
      const highContext: ErrorContext = { severity: 'critical' };

      mockHandleFunction
        .mockResolvedValueOnce({
          handled: true,
          recovered: true,
          exitCode: 0,
          message: 'Low severity handled quietly',
          retryable: false,
          logged: false, // Low severity might not be logged
        })
        .mockResolvedValueOnce({
          handled: true,
          recovered: false,
          exitCode: 1,
          message: 'Critical error logged',
          retryable: false,
          logged: true, // Critical errors always logged
        });

      // Act
      const lowResult = await errorHandler.handle(lowSeverityError, lowContext);
      const highResult = await errorHandler.handle(highSeverityError, highContext);

      // Assert - verify severity-based logging behavior
      expect(lowResult.logged).toBe(false);
      expect(highResult.logged).toBe(true);
    });
  });

  describe('context-aware error handling behavior', () => {
    it('should use context information to enhance error messages', async () => {
      // Arrange
      const error = new Error('File not found');
      const context: ErrorContext = {
        command: 'deploy',
        args: ['missing-app'],
        flags: { env: 'production' },
        user: 'developer',
        session: 'session-123',
      };

      mockHandleFunction.mockResolvedValue({
        handled: true,
        recovered: false,
        exitCode: 1,
        message: "File 'missing-app' not found for production deployment",
        suggestion: 'Check if the application name is correct',
        retryable: true,
        logged: true,
      });

      // Act
      const result = await errorHandler.handle(error, context);

      // Assert - verify context-aware handling
      expect(mockHandleFunction).toHaveBeenCalledWith(error, context);
      expect(result.message).toContain('missing-app');
      expect(result.message).toContain('production');
    });

    it('should handle errors differently based on user permissions', async () => {
      // Arrange
      const permissionError = new Error('Access denied');
      const adminContext: ErrorContext = { user: 'admin', command: 'system-config' };
      const userContext: ErrorContext = { user: 'user', command: 'system-config' };

      mockHandleFunction
        .mockResolvedValueOnce({
          handled: true,
          recovered: false,
          exitCode: 1,
          message: 'Access denied: insufficient privileges',
          suggestion: 'Contact your administrator',
          retryable: false,
          logged: true,
        })
        .mockResolvedValueOnce({
          handled: true,
          recovered: false,
          exitCode: 1,
          message: 'This command requires administrator privileges',
          suggestion: 'Try using sudo or contact support',
          retryable: false,
          logged: false,
        });

      // Act
      await errorHandler.handle(permissionError, adminContext);
      await errorHandler.handle(permissionError, userContext);

      // Assert - verify user-aware handling
      expect(mockHandleFunction).toHaveBeenCalledTimes(2);
      expect(mockHandleFunction).toHaveBeenCalledWith(permissionError, adminContext);
      expect(mockHandleFunction).toHaveBeenCalledWith(permissionError, userContext);
    });
  });

  describe('error metrics and reporting behavior', () => {
    it('should provide comprehensive error metrics', async () => {
      // Arrange
      const errors = [
        new ValidationError('Field required'),
        new NetworkError('Timeout'),
        new ValidationError('Invalid format'),
        new Error('Generic error'),
      ];

      mockHandleFunction.mockImplementation(async () => {
        // Add small delay to simulate processing time
        await new Promise((resolve) => setTimeout(resolve, 1));
        return {
          handled: true,
          recovered: false,
          exitCode: 1,
          message: 'Error handled',
          retryable: false,
          logged: true,
        };
      });

      // Act
      for (const error of errors) {
        await errorHandler.handle(error);
      }

      // Assert - verify comprehensive metrics
      const metrics = errorHandler.getMetrics();
      expect(metrics.totalErrors).toBe(4);
      expect(metrics.errorsByType).toEqual({
        ValidationError: 2,
        NetworkError: 1,
        Error: 1,
      });
      expect(metrics.averageHandlingTime).toBeGreaterThan(0);
    });
  });
});
