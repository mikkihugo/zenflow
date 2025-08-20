/**
 * @fileoverview Foundation Error Handling Tests (Jest Version)
 * 
 * Comprehensive test suite for foundation error handling utilities.
 * Tests all error classes, Result pattern, async utilities, and recovery mechanisms.
 * 
 * CONVERTED FROM VITEST: Uses Jest mocking and assertions
 */

import { jest } from '@jest/globals';

// Mock logger to avoid actual logging during tests
jest.unstable_mockModule('@claude-zen/foundation/logging', () => ({
  getLogger: () => ({
    warn: jest.fn(),
    error: jest.fn(),
    info: jest.fn()
  })
}));

import {
  // Error classes
  EnhancedError,
  ValidationError,
  ConfigurationError,
  NetworkError,
  TimeoutError,
  ResourceError,
  ContextError,
  
  // Result pattern
  ok,
  err,
  
  // Type guards
  isError,
  isErrorWithContext,
  
  // Error utilities
  ensureError,
  withContext,
  createErrorChain,
  
  // Async utilities
  safeAsync,
  safe,
  withTimeout,
  withRetry,
  CircuitBreakerWithMonitoring as CircuitBreaker,
  
  // Bulk operations
  executeAll,
  executeAllSuccessful,
  
  // Error recovery
  transformError,
  createErrorRecovery,
  ErrorAggregator,
  
  // Types
  type ErrorWithContext,
  type RetryOptions,
  type CircuitBreakerState
} from '../error-handling';

describe('Foundation Error Handling (Jest)', () => {
  beforeEach(() => {
    // Don't clear all mocks as it interferes with retry logic tests
    // jest.clearAllMocks(); 
  });

  describe('Enhanced Error Classes', () => {
    it('should create EnhancedError with context', () => {
      const error = new EnhancedError('Test error', {
        userId: '123',
        severity: 'high',
        retryable: true
      }, 'TEST_ERROR');

      expect(error.message).toBe('Test error');
      expect(error.name).toBe('EnhancedError');
      expect(error.context.userId).toBe('123');
      expect(error.context.severity).toBe('high');
      expect(error.context.retryable).toBe(true);
      expect(error.code).toBe('TEST_ERROR');
      expect(error.timestamp).toBeInstanceOf(Date);
    });

    it('should create ValidationError with field information', () => {
      const error = new ValidationError('Invalid email', { field: 'email', value: 'invalid-email' });

      expect(error.message).toBe('Invalid email');
      expect(error.name).toBe('ValidationError');
      expect(error.context.field).toBe('email');
      expect(error.context.value).toBe('invalid-email');
      expect(error.code).toBe('VALIDATION_ERROR');
    });

    it('should create ConfigurationError with config path', () => {
      const error = new ConfigurationError('Missing API key', { configPath: 'api.key' });

      expect(error.message).toBe('Missing API key');
      expect(error.name).toBe('ConfigurationError');
      expect(error.context.configPath).toBe('api.key');
      expect(error.code).toBe('CONFIGURATION_ERROR');
    });

    it('should create NetworkError with status and endpoint', () => {
      const error = new NetworkError('Request failed', { status: 500, endpoint: 'https://api.example.com' });

      expect(error.message).toBe('Request failed');
      expect(error.name).toBe('NetworkError');
      expect(error.context.status).toBe(500);
      expect(error.context.endpoint).toBe('https://api.example.com');
      expect(error.code).toBe('NETWORK_ERROR');
    });

    it('should create TimeoutError with timeout duration', () => {
      const error = new TimeoutError('Operation timed out', { timeout: 5000 });

      expect(error.message).toBe('Operation timed out');
      expect(error.name).toBe('TimeoutError');
      expect(error.context.timeout).toBe(5000);
      expect(error.code).toBe('TIMEOUT_ERROR');
    });

    it('should create ResourceError with resource information', () => {
      const error = new ResourceError('File not found', { resource: 'file', resourceId: '/path/to/file.txt' });

      expect(error.message).toBe('File not found');
      expect(error.name).toBe('ResourceError');
      expect(error.context.resource).toBe('file');
      expect(error.context.resourceId).toBe('/path/to/file.txt');
      expect(error.code).toBe('RESOURCE_ERROR');
    });
  });

  describe('Result Pattern', () => {
    it('should create Ok result', () => {
      const result = ok('success');

      expect(result.isOk()).toBe(true);
      expect(result.isErr()).toBe(false);
      if (result.isOk()) {
        expect(result.value).toBe('success');
      }
    });

    it('should create Err result', () => {
      const error = new Error('failure');
      const result = err(error);

      expect(result.isOk()).toBe(false);
      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error).toBe(error);
      }
    });

    it('should map Ok result', () => {
      const result = ok(5).map(x => x * 2);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toBe(10);
      }
    });

    it('should not map Err result', () => {
      const error = new Error('failure');
      const result = err(error).map(x => (x as number) * 2);

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error).toBe(error);
      }
    });

    it('should map error on Err result', () => {
      const originalError = new Error('original');
      const result = err(originalError).mapErr(err => new Error('mapped'));

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.message).toBe('mapped');
      }
    });

    it('should not map error on Ok result', () => {
      const result = ok('success').mapErr(err => new Error('mapped'));

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toBe('success');
      }
    });

    it('should unwrap Ok result or return default', () => {
      const okResult = ok('success');
      const errResult = err(new Error('failure'));

      expect(okResult.unwrapOr('default')).toBe('success');
      expect(errResult.unwrapOr('default')).toBe('default');
    });
  });

  describe('Type Guards', () => {
    it('should identify Error objects', () => {
      expect(isError(new Error('test'))).toBe(true);
      expect(isError(new EnhancedError('test'))).toBe(true);
      expect(isError('string')).toBe(false);
      expect(isError(null)).toBe(false);
      expect(isError(undefined)).toBe(false);
    });

    it('should identify ErrorWithContext objects', () => {
      const contextError = new ContextError('test', { key: 'value' });
      const regularError = new Error('test');

      expect(isErrorWithContext(contextError)).toBe(true);
      expect(isErrorWithContext(regularError)).toBe(false);
    });
  });

  describe('Error Utilities', () => {
    it('should ensure error from string', () => {
      const error = ensureError('error message');

      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('error message');
    });

    it('should ensure error from Error object', () => {
      const originalError = new Error('original');
      const error = ensureError(originalError);

      expect(error).toBe(originalError);
    });

    it('should ensure error from unknown value', () => {
      const error = ensureError({ message: 'object error' });

      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('[object Object]');
    });

    it('should add context to error', () => {
      const originalError = new Error('original');
      const errorWithContext = withContext(originalError, { userId: '123' });

      expect(errorWithContext).toBeInstanceOf(ContextError);
      expect(errorWithContext.message).toBe('original');
      expect(errorWithContext.context).toEqual({ userId: '123' });
    });

    it('should create error chain', () => {
      const rootCause = new Error('root');
      const intermediate = new Error('intermediate');
      const topLevel = new Error('top');

      const chain = createErrorChain(topLevel, intermediate, rootCause);

      expect(chain).toBeInstanceOf(ContextError);
      expect(chain.message).toBe('top -> intermediate -> root');
      expect(chain.context.errorChain).toEqual(['top', 'intermediate', 'root']);
      expect(chain.context.errorCount).toBe(3);
      expect(chain.code).toBe('ERROR_CHAIN');
    });
  });

  describe('Safe Async Operations', () => {
    it('should handle successful async operation', async () => {
      const asyncOperation = async () => 'success';
      const result = await safeAsync(asyncOperation);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toBe('success');
      }
    });

    it('should handle failed async operation', async () => {
      const asyncOperation = async () => {
        throw new Error('failure');
      };
      const result = await safeAsync(asyncOperation);

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.message).toBe('failure');
      }
    });

    it('should handle successful sync operation', () => {
      const syncOperation = () => 'success';
      const result = safe(syncOperation);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toBe('success');
      }
    });

    it('should handle failed sync operation', () => {
      const syncOperation = () => {
        throw new Error('failure');
      };
      const result = safe(syncOperation);

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.message).toBe('failure');
      }
    });
  });

  describe('Timeout Operations', () => {
    it('should complete operation within timeout', async () => {
      const operation = async () => {
        await new Promise(resolve => setTimeout(resolve, 50)); // Reduced to 50ms
        return 'success';
      };

      const result = await withTimeout(operation, 500); // Pass function, not promise

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toBe('success');
      }
    }, 10000);

    it('should timeout long operation', async () => {
      const operation = async () => {
        await new Promise(resolve => setTimeout(resolve, 200));
        return 'success';
      };

      const result = await withTimeout(operation, 100);

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error).toBeInstanceOf(TimeoutError);
      }
    }, 10000);
  });

  describe('Retry Operations', () => {
    it('should succeed on first attempt', async () => {
      const operation = jest.fn().mockResolvedValue('success');
      
      const result = await withRetry(operation, { retries: 3, minTimeout: 10 });

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toBe('success');
      }
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should retry and eventually succeed', async () => {
      const operation = jest.fn()
        .mockRejectedValueOnce(new Error('fail 1'))
        .mockRejectedValueOnce(new Error('fail 2'))
        .mockResolvedValue('success');
      
      const result = await withRetry(operation, { retries: 3, minTimeout: 10 });

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toBe('success');
      }
      expect(operation).toHaveBeenCalledTimes(3);
    });

    it('should fail after max attempts', async () => {
      const operation = jest.fn().mockRejectedValue(new Error('persistent failure'));
      
      const result = await withRetry(operation, { retries: 2, minTimeout: 10 });

      expect(result.isErr()).toBe(true);
      // The error will be wrapped with context, so check the original message exists
      if (result.isErr()) {
        expect(result.error.message).toContain('persistent failure');
      }
      expect(operation).toHaveBeenCalledTimes(3); // retries: 2 means 3 total attempts (initial + 2 retries)
    });

    it('should use custom retry logic', async () => {
      const validationError = new ValidationError('Invalid input', { field: 'test' });
      const operation = jest.fn().mockRejectedValue(validationError);
      
      // Don't retry validation errors
      const result = await withRetry(operation, { 
        retries: 3, 
        minTimeout: 10,
        shouldRetry: (error) => !(error instanceof ValidationError)
      });

      expect(result.isErr()).toBe(true);
      // Should abort immediately due to shouldRetry logic
      expect(operation).toHaveBeenCalledTimes(1);
    });
  });

  describe('Circuit Breaker', () => {
    it('should start in closed state', () => {
      const action = async () => 'test';
      const circuitBreaker = new CircuitBreaker(action, { timeout: 1000, errorThresholdPercentage: 50 });

      const state = circuitBreaker.getState();
      expect(state.isClosed).toBe(true);
      expect(state.isOpen).toBe(false);
    });

    it('should execute operation successfully in closed state', async () => {
      const action = jest.fn().mockResolvedValue('success');
      const circuitBreaker = new CircuitBreaker(action, { timeout: 1000, errorThresholdPercentage: 50 });

      const result = await circuitBreaker.execute();

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toBe('success');
      }
      expect(circuitBreaker.getState().isClosed).toBe(true);
    });

    it('should handle circuit breaker failures', async () => {
      const action = jest.fn().mockRejectedValue(new Error('failure'));
      const circuitBreaker = new CircuitBreaker(action, { 
        timeout: 1000, 
        errorThresholdPercentage: 1, // Very low threshold to trigger quickly
        resetTimeout: 100 
      });

      // Execute failed operation
      const result = await circuitBreaker.execute();
      
      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.message).toBe('failure');
      }
    });

    it('should provide circuit breaker statistics', async () => {
      const action = jest.fn().mockResolvedValue('success');
      const circuitBreaker = new CircuitBreaker(action, { timeout: 1000 });

      await circuitBreaker.execute();
      
      const stats = circuitBreaker.getStats();
      expect(stats).toBeDefined();
      expect(stats.fires).toBeGreaterThan(0);
      expect(stats.successes).toBeGreaterThan(0);
    });
  });

  describe('Bulk Operations', () => {
    it('should execute all operations', async () => {
      const operations = [
        async () => 'result1',
        async () => 'result2',
        async () => { throw new Error('error'); }
      ];

      const result = await executeAll(operations);

      // executeAll returns Result<T[], Error[]> - single Result containing array
      expect(result.isErr()).toBe(true); // Has failures, so returns error
      if (result.isErr()) {
        expect(result.error).toHaveLength(1);
        expect(result.error[0].message).toBe('error');
      }
    });

    it('should execute only successful operations', async () => {
      const operations = [
        async () => 'result1',
        async () => { throw new Error('error'); },
        async () => 'result3'
      ];

      const result = await executeAllSuccessful(operations);

      // executeAllSuccessful returns successful results even if some failed
      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toHaveLength(2);
        expect(result.value[0]).toBe('result1');
        expect(result.value[1]).toBe('result3');
      }
    });
  });

  describe('Error Recovery', () => {
    it('should transform error in Result', () => {
      const originalError = new Error('original');
      const result = err(originalError);
      const transformer = (error: Error) => new ValidationError('transformed', { field: 'test' });

      const transformedResult = transformError(result, transformer);

      expect(transformedResult.isErr()).toBe(true);
      if (transformedResult.isErr()) {
        expect(transformedResult.error).toBeInstanceOf(ValidationError);
        expect(transformedResult.error.message).toBe('transformed');
      }
    });

    it('should create error recovery function', () => {
      const fallbackValue = 'default-value';
      const recovery = createErrorRecovery(fallbackValue, (error) => error instanceof ValidationError);

      // Should recover from ValidationError
      const validationResult = recovery(new ValidationError('test', { field: 'test' }));
      expect(validationResult.isOk()).toBe(true);
      if (validationResult.isOk()) {
        expect(validationResult.value).toBe('default-value');
      }

      // Should not recover from other errors
      const networkResult = recovery(new NetworkError('test', { status: 500 }));
      expect(networkResult.isErr()).toBe(true);
      if (networkResult.isErr()) {
        expect(networkResult.error).toBeInstanceOf(NetworkError);
      }
    });

    it('should aggregate errors', () => {
      const aggregator = new ErrorAggregator();

      const error1 = new Error('error 1');
      const error2 = new Error('error 2');

      aggregator.add(error1);
      aggregator.add(error2);

      expect(aggregator.hasErrors()).toBe(true);
      expect(aggregator.getErrors()).toHaveLength(2);
      expect(aggregator.getErrors()).toEqual([error1, error2]);
      expect(aggregator.getFirstError()).toBe(error1);

      const result = aggregator.toResult('success');
      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error).toEqual([error1, error2]);
      }
    });

    it('should handle empty error aggregator', () => {
      const aggregator = new ErrorAggregator();

      expect(aggregator.hasErrors()).toBe(false);
      expect(aggregator.getErrors()).toEqual([]);
      expect(aggregator.getFirstError()).toBeNull();

      const result = aggregator.toResult('success');
      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toBe('success');
      }
    });
  });
});