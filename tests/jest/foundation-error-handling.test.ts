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
  
  // Result pattern
  Result,
  Ok,
  Err,
  createOk,
  createErr,
  
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
} from '@claude-zen/foundation/error-handling';

describe('Foundation Error Handling (Jest)', () => {
  beforeEach(() => {
    // Don't clear all mocks as it interferes with retry logic tests
    // jest.clearAllMocks(); 
  });

  describe('Enhanced Error Classes', () => {
    it('should create EnhancedError with context', () => {
      const error = new EnhancedError('Test error', {
        context: { userId: '123' },
        code: 'TEST_ERROR',
        severity: 'high',
        retryable: true
      });

      expect(error.message).toBe('Test error');
      expect(error.name).toBe('EnhancedError');
      expect(error.context).toEqual({ userId: '123' });
      expect(error.code).toBe('TEST_ERROR');
      expect(error.severity).toBe('high');
      expect(error.retryable).toBe(true);
      expect(error.timestamp).toBeInstanceOf(Date);
    });

    it('should create ValidationError with field information', () => {
      const error = new ValidationError('Invalid email', 'email', 'invalid-email');

      expect(error.message).toBe('Invalid email');
      expect(error.name).toBe('ValidationError');
      expect(error.field).toBe('email');
      expect(error.value).toBe('invalid-email');
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.severity).toBe('medium');
      expect(error.retryable).toBe(false);
    });

    it('should create ConfigurationError with config path', () => {
      const error = new ConfigurationError('Missing API key', 'api.key');

      expect(error.message).toBe('Missing API key');
      expect(error.name).toBe('ConfigurationError');
      expect(error.configPath).toBe('api.key');
      expect(error.code).toBe('CONFIGURATION_ERROR');
      expect(error.severity).toBe('high');
      expect(error.retryable).toBe(false);
    });

    it('should create NetworkError with status and endpoint', () => {
      const error = new NetworkError('Request failed', 500, 'https://api.example.com');

      expect(error.message).toBe('Request failed');
      expect(error.name).toBe('NetworkError');
      expect(error.status).toBe(500);
      expect(error.endpoint).toBe('https://api.example.com');
      expect(error.code).toBe('NETWORK_ERROR');
      expect(error.severity).toBe('medium');
      expect(error.retryable).toBe(true);
    });

    it('should create TimeoutError with timeout duration', () => {
      const error = new TimeoutError('Operation timed out', 5000);

      expect(error.message).toBe('Operation timed out');
      expect(error.name).toBe('TimeoutError');
      expect(error.timeout).toBe(5000);
      expect(error.code).toBe('TIMEOUT_ERROR');
      expect(error.severity).toBe('medium');
      expect(error.retryable).toBe(true);
    });

    it('should create ResourceError with resource information', () => {
      const error = new ResourceError('File not found', 'file', '/path/to/file.txt');

      expect(error.message).toBe('File not found');
      expect(error.name).toBe('ResourceError');
      expect(error.resource).toBe('file');
      expect(error.resourceId).toBe('/path/to/file.txt');
      expect(error.code).toBe('RESOURCE_ERROR');
      expect(error.severity).toBe('medium');
      expect(error.retryable).toBe(true);
    });
  });

  describe('Result Pattern', () => {
    it('should create Ok result', () => {
      const result = createOk('success');

      expect(result.isOk()).toBe(true);
      expect(result.isErr()).toBe(false);
      expect(result.unwrap()).toBe('success');
    });

    it('should create Err result', () => {
      const error = new Error('failure');
      const result = createErr(error);

      expect(result.isOk()).toBe(false);
      expect(result.isErr()).toBe(true);
      expect(result.unwrapErr()).toBe(error);
    });

    it('should map Ok result', () => {
      const result = createOk(5).map(x => x * 2);

      expect(result.isOk()).toBe(true);
      expect(result.unwrap()).toBe(10);
    });

    it('should not map Err result', () => {
      const error = new Error('failure');
      const result = createErr(error).map(x => (x as number) * 2);

      expect(result.isErr()).toBe(true);
      expect(result.unwrapErr()).toBe(error);
    });

    it('should map error on Err result', () => {
      const originalError = new Error('original');
      const result = createErr(originalError).mapErr(err => new Error('mapped'));

      expect(result.isErr()).toBe(true);
      expect(result.unwrapErr().message).toBe('mapped');
    });

    it('should not map error on Ok result', () => {
      const result = createOk('success').mapErr(err => new Error('mapped'));

      expect(result.isOk()).toBe(true);
      expect(result.unwrap()).toBe('success');
    });

    it('should unwrap Ok result or return default', () => {
      const okResult = createOk('success');
      const errResult = createErr(new Error('failure'));

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
      const enhancedError = new EnhancedError('test', { context: { key: 'value' } });
      const regularError = new Error('test');

      expect(isErrorWithContext(enhancedError)).toBe(true);
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

      expect(errorWithContext).toBeInstanceOf(EnhancedError);
      expect(errorWithContext.message).toBe('original');
      expect((errorWithContext as EnhancedError).context).toEqual({ userId: '123' });
    });

    it('should create error chain', () => {
      const rootCause = new Error('root');
      const intermediate = new Error('intermediate');
      const topLevel = new Error('top');

      const chain = createErrorChain([topLevel, intermediate, rootCause]);

      expect(chain).toBeInstanceOf(EnhancedError);
      expect(chain.message).toBe('top');
      expect(chain.cause).toBe(intermediate);
      expect(chain.rootCause).toBe(rootCause);
    });
  });

  describe('Safe Async Operations', () => {
    it('should handle successful async operation', async () => {
      const asyncOperation = async () => 'success';
      const result = await safeAsync(asyncOperation);

      expect(result.isOk()).toBe(true);
      expect(result.unwrap()).toBe('success');
    });

    it('should handle failed async operation', async () => {
      const asyncOperation = async () => {
        throw new Error('failure');
      };
      const result = await safeAsync(asyncOperation);

      expect(result.isErr()).toBe(true);
      expect(result.unwrapErr().message).toBe('failure');
    });

    it('should handle successful sync operation', () => {
      const syncOperation = () => 'success';
      const result = safe(syncOperation);

      expect(result.isOk()).toBe(true);
      expect(result.unwrap()).toBe('success');
    });

    it('should handle failed sync operation', () => {
      const syncOperation = () => {
        throw new Error('failure');
      };
      const result = safe(syncOperation);

      expect(result.isErr()).toBe(true);
      expect(result.unwrapErr().message).toBe('failure');
    });
  });

  describe('Timeout Operations', () => {
    it('should complete operation within timeout', async () => {
      const operation = async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
        return 'success';
      };

      const result = await withTimeout(operation(), 200);

      expect(result.isOk()).toBe(true);
      expect(result.unwrap()).toBe('success');
    }, 10000);

    it('should timeout long operation', async () => {
      const operation = async () => {
        await new Promise(resolve => setTimeout(resolve, 200));
        return 'success';
      };

      const result = await withTimeout(operation(), 100);

      expect(result.isErr()).toBe(true);
      expect(result.unwrapErr()).toBeInstanceOf(TimeoutError);
    }, 10000);
  });

  describe('Retry Operations', () => {
    it('should succeed on first attempt', async () => {
      const operation = jest.fn().mockResolvedValue('success');
      
      const result = await withRetry(operation, { maxAttempts: 3, delay: 10 });

      expect(result.isOk()).toBe(true);
      expect(result.unwrap()).toBe('success');
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should retry and eventually succeed', async () => {
      const operation = jest.fn()
        .mockRejectedValueOnce(new Error('fail 1'))
        .mockRejectedValueOnce(new Error('fail 2'))
        .mockResolvedValue('success');
      
      const result = await withRetry(operation, { maxAttempts: 3, delay: 10 });

      expect(result.isOk()).toBe(true);
      expect(result.unwrap()).toBe('success');
      expect(operation).toHaveBeenCalledTimes(3);
    });

    it('should fail after max attempts', async () => {
      const operation = jest.fn().mockRejectedValue(new Error('persistent failure'));
      
      const result = await withRetry(operation, { maxAttempts: 2, delay: 10 });

      expect(result.isErr()).toBe(true);
      expect(result.unwrapErr().message).toBe('persistent failure');
      expect(operation).toHaveBeenCalledTimes(2);
    });

    it('should not retry non-retryable errors', async () => {
      const error = new ValidationError('Invalid input', 'field', 'value');
      const operation = jest.fn().mockRejectedValue(error);
      
      const result = await withRetry(operation, { maxAttempts: 3, delay: 10 });

      expect(result.isErr()).toBe(true);
      expect(result.unwrapErr()).toBe(error);
      expect(operation).toHaveBeenCalledTimes(1);
    });
  });

  describe('Circuit Breaker', () => {
    it('should start in closed state', () => {
      const circuitBreaker = new CircuitBreaker({ failureThreshold: 3, recoveryTimeout: 1000 });

      expect(circuitBreaker.getState()).toBe('closed');
    });

    it('should execute operation successfully in closed state', async () => {
      const circuitBreaker = new CircuitBreaker({ failureThreshold: 3, recoveryTimeout: 1000 });
      const operation = jest.fn().mockResolvedValue('success');

      const result = await circuitBreaker.execute(operation);

      expect(result.isOk()).toBe(true);
      expect(result.unwrap()).toBe('success');
      expect(circuitBreaker.getState()).toBe('closed');
    });

    it('should open circuit after failure threshold', async () => {
      const circuitBreaker = new CircuitBreaker({ failureThreshold: 2, recoveryTimeout: 1000 });
      const operation = jest.fn().mockRejectedValue(new Error('failure'));

      // First failure
      await circuitBreaker.execute(operation);
      expect(circuitBreaker.getState()).toBe('closed');

      // Second failure should open circuit
      await circuitBreaker.execute(operation);
      expect(circuitBreaker.getState()).toBe('open');
    });

    it('should reject immediately in open state', async () => {
      const circuitBreaker = new CircuitBreaker({ failureThreshold: 1, recoveryTimeout: 1000 });
      const operation = jest.fn().mockRejectedValue(new Error('failure'));

      // Trigger circuit open
      await circuitBreaker.execute(operation);
      expect(circuitBreaker.getState()).toBe('open');

      // Subsequent call should be rejected immediately
      operation.mockClear();
      const result = await circuitBreaker.execute(operation);

      expect(result.isErr()).toBe(true);
      expect(result.unwrapErr().message).toContain('Circuit breaker is open');
      expect(operation).not.toHaveBeenCalled();
    });
  });

  describe('Bulk Operations', () => {
    it('should execute all operations', async () => {
      const operations = [
        async () => 'result1',
        async () => 'result2',
        async () => { throw new Error('error'); }
      ];

      const results = await executeAll(operations);

      expect(results).toHaveLength(3);
      expect(results[0].isOk()).toBe(true);
      expect(results[0].unwrap()).toBe('result1');
      expect(results[1].isOk()).toBe(true);
      expect(results[1].unwrap()).toBe('result2');
      expect(results[2].isErr()).toBe(true);
      expect(results[2].unwrapErr().message).toBe('error');
    });

    it('should execute only successful operations', async () => {
      const operations = [
        async () => 'result1',
        async () => { throw new Error('error'); },
        async () => 'result3'
      ];

      const results = await executeAllSuccessful(operations);

      expect(results).toHaveLength(2);
      expect(results[0]).toBe('result1');
      expect(results[1]).toBe('result3');
    });
  });

  describe('Error Recovery', () => {
    it('should transform error', () => {
      const originalError = new Error('original');
      const transformer = (error: Error) => new ValidationError('transformed', 'field', 'value');

      const transformedError = transformError(originalError, transformer);

      expect(transformedError).toBeInstanceOf(ValidationError);
      expect(transformedError.message).toBe('transformed');
    });

    it('should create error recovery function', () => {
      const recovery = createErrorRecovery({
        ValidationError: (error) => 'validation-recovery',
        NetworkError: (error) => 'network-recovery',
        default: (error) => 'default-recovery'
      });

      expect(recovery(new ValidationError('test', 'field', 'value'))).toBe('validation-recovery');
      expect(recovery(new NetworkError('test', 500, 'endpoint'))).toBe('network-recovery');
      expect(recovery(new Error('test'))).toBe('default-recovery');
    });

    it('should aggregate errors', () => {
      const aggregator = new ErrorAggregator('Operation failed');

      const error1 = new Error('error 1');
      const error2 = new Error('error 2');

      aggregator.add(error1);
      aggregator.add(error2);

      expect(aggregator.hasErrors()).toBe(true);
      expect(aggregator.getCount()).toBe(2);
      expect(aggregator.getErrors()).toEqual([error1, error2]);

      const aggregatedError = aggregator.getAggregatedError();
      expect(aggregatedError.message).toBe('Operation failed');
      expect(aggregatedError.errors).toEqual([error1, error2]);
    });

    it('should handle empty error aggregator', () => {
      const aggregator = new ErrorAggregator('No errors');

      expect(aggregator.hasErrors()).toBe(false);
      expect(aggregator.getCount()).toBe(0);
      expect(aggregator.getErrors()).toEqual([]);

      const aggregatedError = aggregator.getAggregatedError();
      expect(aggregatedError).toBeNull();
    });
  });
});