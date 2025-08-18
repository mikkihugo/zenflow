/**
 * @fileoverview Error Handling Utilities Tests
 * 
 * Comprehensive test suite for foundation error handling utilities.
 * Tests all error classes, Result pattern, async utilities, and recovery mechanisms.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
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
  CircuitBreaker,
  
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

// Mock logger to avoid actual logging during tests
vi.mock('../logging', () => ({
  getLogger: () => ({
    warn: vi.fn(),
    error: vi.fn(),
    info: vi.fn()
  })
}));

describe('Foundation Error Handling', () => {
  beforeEach(() => {
    // Don't clear all mocks as it interferes with retry logic tests
    // vi.clearAllMocks(); 
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

    it('should create NetworkError with status and endpoint', () => {
      const error = new NetworkError('API call failed', 500, '/api/users');

      expect(error.message).toBe('API call failed');
      expect(error.name).toBe('NetworkError');
      expect(error.statusCode).toBe(500);
      expect(error.endpoint).toBe('/api/users');
      expect(error.code).toBe('NETWORK_ERROR');
      expect(error.retryable).toBe(true);
    });
  });

  describe('Result Pattern', () => {
    it('should create and handle Ok result', () => {
      const result = createOk(42);

      expect(result.isOk()).toBe(true);
      expect(result.isErr()).toBe(false);
      expect(result.unwrap()).toBe(42);
      expect(result.unwrapOr(0)).toBe(42);
    });

    it('should create and handle Err result', () => {
      const error = new Error('Test error');
      const result = createErr(error);

      expect(result.isOk()).toBe(false);
      expect(result.isErr()).toBe(true);
      expect(result.unwrapOr(0)).toBe(0);
      expect(() => result.unwrap()).toThrow('Test error');
    });

    it('should map Ok result', () => {
      const result = createOk(5).map(x => x * 2);

      expect(result.isOk()).toBe(true);
      expect(result.unwrap()).toBe(10);
    });

    it('should not map Err result', () => {
      const error = new Error('Test error');
      const result = createErr(error).map(x => x * 2);

      expect(result.isErr()).toBe(true);
      expect(() => result.unwrap()).toThrow('Test error');
    });

    it('should map error on Err result', () => {
      const originalError = new Error('Original');
      const result = createErr(originalError).mapErr(err => new ValidationError(`Mapped: ${err.message}`));

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error).toBeInstanceOf(ValidationError);
        expect(result.error.message).toBe('Mapped: Original');
      }
    });
  });

  describe('Type Guards', () => {
    it('should identify Error instances', () => {
      expect(isError(new Error('test'))).toBe(true);
      expect(isError(new ValidationError('test'))).toBe(true);
      expect(isError('string')).toBe(false);
      expect(isError(42)).toBe(false);
      expect(isError(null)).toBe(false);
    });

    it('should identify ErrorWithContext instances', () => {
      const error = new Error('test');
      const contextError = withContext(error, { userId: '123' });

      expect(isErrorWithContext(contextError)).toBe(true);
      // Note: withContext modifies the original error by adding context
      // so we create a fresh error for this test
      const freshError = new Error('fresh test');
      expect(isErrorWithContext(freshError)).toBe(false);
      expect(isErrorWithContext('string')).toBe(false);
    });
  });

  describe('Error Utilities', () => {
    it('should ensure error from various inputs', () => {
      expect(ensureError(new Error('test')).message).toBe('test');
      expect(ensureError('string error').message).toBe('string error');
      expect(ensureError({ message: 'object error' }).message).toBe('object error');
      expect(ensureError(42).message).toBe('Unknown error: 42');
    });

    it('should add context to error', () => {
      const error = new Error('original');
      const contextError = withContext(error, {
        operation: 'test',
        userId: '123'
      });

      expect(isErrorWithContext(contextError)).toBe(true);
      expect(contextError.context?.operation).toBe('test');
      expect(contextError.context?.userId).toBe('123');
      expect(contextError.timestamp).toBeInstanceOf(Date);
    });

    it('should merge context on existing ErrorWithContext', () => {
      const error = new Error('original');
      const firstContext = withContext(error, { operation: 'test' });
      const secondContext = withContext(firstContext, { userId: '123' });

      expect(secondContext.context?.operation).toBe('test');
      expect(secondContext.context?.userId).toBe('123');
    });

    it('should create error chain', () => {
      const cause = new Error('root cause');
      const chain = createErrorChain('Operation failed', cause, { operation: 'test' });

      expect(chain.message).toBe('Operation failed');
      expect(chain.cause).toBe(cause);
      expect(chain.context?.operation).toBe('test');
      expect(chain.code).toBe('ERROR_CHAIN');
    });
  });

  describe('Safe Execution', () => {
    it('should safely execute successful sync function', () => {
      const result = safe(() => 42);

      expect(result.isOk()).toBe(true);
      expect(result.unwrap()).toBe(42);
    });

    it('should safely catch sync function error', () => {
      const result = safe(() => {
        throw new Error('sync error');
      });

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.message).toBe('sync error');
      }
    });

    it('should safely execute successful async function', async () => {
      const result = await safeAsync(async () => 42);

      expect(result.isOk()).toBe(true);
      expect(result.unwrap()).toBe(42);
    });

    it('should safely catch async function error', async () => {
      const result = await safeAsync(async () => {
        throw new Error('async error');
      });

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.message).toBe('async error');
      }
    });
  });

  describe('Timeout Handling', () => {
    it('should resolve within timeout', async () => {
      const promise = Promise.resolve(42);
      const result = await withTimeout(promise, { timeoutMs: 1000 });

      expect(result).toBe(42);
    });

    it('should reject on timeout', async () => {
      const promise = new Promise(resolve => setTimeout(resolve, 2000));

      await expect(
        withTimeout(promise, { timeoutMs: 100 })
      ).rejects.toThrow(TimeoutError);
    });

    it('should use custom timeout message', async () => {
      const promise = new Promise(resolve => setTimeout(resolve, 2000));

      await expect(
        withTimeout(promise, { 
          timeoutMs: 100, 
          timeoutMessage: 'Custom timeout message' 
        })
      ).rejects.toThrow('Custom timeout message');
    });
  });

  describe('Retry Logic', () => {
    it('should succeed on first attempt', async () => {
      const fn = vi.fn().mockResolvedValue(42);
      const result = await withRetry(fn, {
        maxAttempts: 3,
        baseDelay: 10
      });

      expect(result).toBe(42);
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should retry and eventually succeed', async () => {
      const fn = vi.fn()
        .mockRejectedValueOnce(new Error('fail 1'))
        .mockRejectedValueOnce(new Error('fail 2'))
        .mockResolvedValue(42);

      const result = await withRetry(fn, {
        maxAttempts: 3,
        baseDelay: 10
      });

      expect(result).toBe(42);
      expect(fn).toHaveBeenCalledTimes(3);
    });

    it('should fail after max attempts', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('persistent failure'));

      await expect(
        withRetry(fn, {
          maxAttempts: 2,
          baseDelay: 10
        })
      ).rejects.toThrow('persistent failure');

      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('should call onRetry callback', async () => {
      const fn = vi.fn()
        .mockRejectedValueOnce(new Error('fail'))
        .mockResolvedValue(42);
      const onRetry = vi.fn();

      await withRetry(fn, {
        maxAttempts: 2,
        baseDelay: 10,
        onRetry
      });

      expect(onRetry).toHaveBeenCalledWith(1, expect.any(Error));
    });

    it('should respect retry condition', async () => {
      const fn = vi.fn().mockRejectedValue(new ValidationError('non-retryable'));

      await expect(
        withRetry(fn, {
          maxAttempts: 3,
          baseDelay: 1,
          retryCondition: (error) => !(error instanceof ValidationError)
        })
      ).rejects.toThrow('non-retryable');

      expect(fn).toHaveBeenCalledTimes(1);
    });
  });

  describe('Circuit Breaker', () => {
    it('should execute successfully when closed', async () => {
      const fn = vi.fn().mockResolvedValue(42);
      const breaker = new CircuitBreaker(fn, {
        failureThreshold: 3,
        timeout: 1000
      });

      const result = await breaker.execute();

      expect(result).toBe(42);
      expect(breaker.getState()).toBe('closed');
      expect(breaker.getFailureCount()).toBe(0);
    });

    it('should open after failure threshold', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('service error'));
      const onStateChange = vi.fn();
      const breaker = new CircuitBreaker(fn, {
        failureThreshold: 2,
        timeout: 1000,
        onStateChange
      });

      // First failure
      await expect(breaker.execute()).rejects.toThrow('service error');
      expect(breaker.getState()).toBe('closed');
      expect(breaker.getFailureCount()).toBe(1);

      // Second failure - should open circuit
      await expect(breaker.execute()).rejects.toThrow('service error');
      expect(breaker.getState()).toBe('open');
      expect(breaker.getFailureCount()).toBe(2);
      expect(onStateChange).toHaveBeenCalledWith('open');
    });

    it('should reject immediately when open', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('service error'));
      const breaker = new CircuitBreaker(fn, {
        failureThreshold: 1,
        timeout: 1000
      });

      // Trigger opening
      await expect(breaker.execute()).rejects.toThrow('service error');
      expect(breaker.getState()).toBe('open');

      // Should reject immediately
      await expect(breaker.execute()).rejects.toThrow('Circuit breaker is open');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should reset circuit breaker', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('service error'));
      const breaker = new CircuitBreaker(fn, {
        failureThreshold: 1,
        timeout: 1000
      });

      // Trigger failure - must await to ensure state change
      await expect(breaker.execute()).rejects.toThrow('service error');
      expect(breaker.getState()).toBe('open');

      breaker.reset();
      expect(breaker.getState()).toBe('closed');
      expect(breaker.getFailureCount()).toBe(0);
    });
  });

  describe('Bulk Operations', () => {
    it('should execute all operations and return results', async () => {
      const operations = [
        () => Promise.resolve(1),
        () => Promise.reject(new Error('fail')),
        () => Promise.resolve(3)
      ];

      const results = await executeAll(operations);

      expect(results).toHaveLength(3);
      expect(results[0]?.isOk()).toBe(true);
      expect(results[0]?.unwrap()).toBe(1);
      expect(results[1]?.isErr()).toBe(true);
      expect(results[2]?.isOk()).toBe(true);
      expect(results[2]?.unwrap()).toBe(3);
    });

    it('should collect successful results and errors', async () => {
      const operations = [
        () => Promise.resolve(1),
        () => Promise.reject(new Error('fail 1')),
        () => Promise.resolve(3),
        () => Promise.reject(new Error('fail 2'))
      ];

      const { successes, errors } = await executeAllSuccessful(operations, {
        logErrors: false
      });

      expect(successes).toEqual([1, 3]);
      expect(errors).toHaveLength(2);
      expect(errors[0]?.message).toBe('fail 1');
      expect(errors[1]?.message).toBe('fail 2');
    });

    it('should throw when max failures exceeded', async () => {
      const operations = [
        () => Promise.reject(new Error('fail 1')),
        () => Promise.reject(new Error('fail 2')),
        () => Promise.reject(new Error('fail 3'))
      ];

      await expect(
        executeAllSuccessful(operations, {
          logErrors: false,
          maxFailures: 2
        })
      ).rejects.toThrow('Maximum failures (2) exceeded');
    });
  });

  describe('Error Recovery', () => {
    it('should transform errors', () => {
      const originalError = new Error('original');
      const transformed = transformError(originalError, (err) => 
        new ValidationError(`Transformed: ${err.message}`)
      );

      expect(transformed).toBeInstanceOf(ValidationError);
      expect(transformed.message).toBe('Transformed: original');
    });

    it('should create error recovery function', () => {
      const recoveryMap = new Map([
        ['ValidationError', () => 'validation-recovery'],
        ['NetworkError', () => 'network-recovery'],
        ['default', () => 'default-recovery']
      ]);

      const recovery = createErrorRecovery(recoveryMap);

      expect(recovery(new ValidationError('test'))).toBe('validation-recovery');
      expect(recovery(new NetworkError('test'))).toBe('network-recovery');
      expect(recovery(new Error('test'))).toBe('default-recovery');
    });

    it('should throw error if no recovery found', () => {
      const recoveryMap = new Map<string, (error: Error) => string>();
      const recovery = createErrorRecovery(recoveryMap);

      expect(() => recovery(new Error('test'))).toThrow('test');
    });
  });

  describe('Error Aggregator', () => {
    it('should collect multiple errors', () => {
      const aggregator = new ErrorAggregator();

      aggregator.add(new Error('error 1'));
      aggregator.add('error 2');
      aggregator.add(new ValidationError('error 3'));

      expect(aggregator.hasErrors()).toBe(true);
      expect(aggregator.getErrors()).toHaveLength(3);
      expect(aggregator.getErrors()[0]?.message).toBe('error 1');
      expect(aggregator.getErrors()[1]?.message).toBe('error 2');
      expect(aggregator.getErrors()[2]?.message).toBe('error 3');
    });

    it('should throw aggregated error', () => {
      const aggregator = new ErrorAggregator();
      aggregator.add(new Error('error 1'));
      aggregator.add(new Error('error 2'));

      expect(() => aggregator.throwIfErrors('Test operation failed')).toThrow(
        'Test operation failed: error 1; error 2'
      );
    });

    it('should not throw if no errors', () => {
      const aggregator = new ErrorAggregator();

      expect(() => aggregator.throwIfErrors()).not.toThrow();
      expect(aggregator.hasErrors()).toBe(false);
    });

    it('should clear errors', () => {
      const aggregator = new ErrorAggregator();
      aggregator.add(new Error('test'));

      expect(aggregator.hasErrors()).toBe(true);

      aggregator.clear();

      expect(aggregator.hasErrors()).toBe(false);
      expect(aggregator.getErrors()).toHaveLength(0);
    });
  });
});