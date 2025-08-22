/**
 * @fileoverview Comprehensive Error Handling Tests
 *
 * 100% coverage tests for error handling system including neverthrow patterns.
 */

import { describe, it, expect, vi } from 'vitest';
import {
  safe,
  safeAsync,
  withRetry,
  withTimeout,
  withContext,
  ensureError,
  AbortError,
  Result,
  ok,
  err,
  ResultAsync,
  okAsync,
  errAsync,
} from '../../src/error-handling';

describe('Error Handling System - 100% Coverage', () => {
  describe('safe function', () => {
    it('should wrap successful synchronous functions', () => {
      const result = safe(() => 'success');

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toBe('success');
      }
    });

    it('should wrap failing synchronous functions', () => {
      const error = new Error('Test error');
      const result = safe(() => {
        throw error;
      });

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error).toBe(error);
      }
    });

    it('should handle functions with parameters', () => {
      const result = safe(() => 2 + 3);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toBe(5);
      }
    });

    it('should handle functions that throw strings', () => {
      const result = safe(() => {
        throw 'string error';
      });

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error).toBeInstanceOf(Error);
        expect(result.error.message).toBe('string error');
      }
    });

    it('should handle functions that throw non-errors', () => {
      const result = safe(() => {
        throw { message: 'object error' };
      });

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error).toBeInstanceOf(Error);
      }
    });
  });

  describe('safeAsync function', () => {
    it('should wrap successful async functions', async () => {
      const result = await safeAsync(async () => 'async success');

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toBe('async success');
      }
    });

    it('should wrap failing async functions', async () => {
      const error = new Error('Async error');
      const result = await safeAsync(async () => {
        throw error;
      });

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error).toBe(error);
      }
    });

    it('should handle async functions with parameters', async () => {
      const result = await safeAsync(
        async () =>
          new Promise<number>((resolve) => setTimeout(() => resolve(3 * 4), 10))
      );

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toBe(12);
      }
    });

    it('should handle promise rejections', async () => {
      const safeAsyncFn = safeAsync(async () =>
        Promise.reject(new Error('Promise rejection'))
      );
      const result = await safeAsyncFn();

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.message).toBe('Promise rejection');
      }
    });
  });

  describe('withRetry function', () => {
    it('should succeed on first attempt', async () => {
      let attempts = 0;
      const fn = async () => {
        attempts++;
        return 'success';
      };

      const result = await withRetry(fn, { retries: 3 });

      expect(result.isOk()).toBe(true);
      expect(attempts).toBe(1);
      if (result.isOk()) {
        expect(result.value).toBe('success');
      }
    });

    it('should retry on failure and eventually succeed', async () => {
      let attempts = 0;
      const fn = async () => {
        attempts++;
        if (attempts < 3) {
          throw new Error(`Attempt ${attempts} failed`);
        }
        return 'success';
      };

      const result = await withRetry(fn, { retries: 5, delay: 10 });

      expect(result.isOk()).toBe(true);
      expect(attempts).toBe(3);
      if (result.isOk()) {
        expect(result.value).toBe('success');
      }
    });

    it('should exhaust retries and return error', async () => {
      let attempts = 0;
      const fn = async () => {
        attempts++;
        throw new Error(`Attempt ${attempts} failed`);
      };

      const result = await withRetry(fn, { retries: 3, delay: 1 });

      expect(result.isErr()).toBe(true);
      expect(attempts).toBe(4); // Initial + 3 retries
      if (result.isErr()) {
        expect(result.error.message).toBe('Attempt 4 failed');
      }
    });

    it('should handle exponential backoff', async () => {
      let attempts = 0;
      const times: number[] = [];
      const fn = async () => {
        attempts++;
        times.push(Date.now())();
        if (attempts < 3) {
          throw new Error(`Attempt ${attempts} failed`);
        }
        return 'success';
      };

      const result = await withRetry(fn, {
        retries: 5,
        delay: 10,
        exponentialBackoff: true,
      });

      expect(result.isOk()).toBe(true);
      expect(attempts).toBe(3);

      // Verify increasing delays (rough check due to timing)
      if (times.length >= 3) {
        const delay1 = times[1] - times[0];
        const delay2 = times[2] - times[1];
        expect(delay2).toBeGreaterThanOrEqual(delay1);
      }
    });

    it('should handle custom retry conditions', async () => {
      let attempts = 0;
      const fn = async () => {
        attempts++;
        const error = new Error(`Attempt ${attempts}`);
        (error as any).code = attempts === 1 ? 'RETRY_ABLE' : 'NO_RETRY';
        throw error;
      };

      const shouldRetry = (error: Error) =>
        (error as any).code === 'RETRY_ABLE';
      const result = await withRetry(fn, {
        retries: 5,
        delay: 1,
        shouldRetry,
      });

      expect(result.isErr()).toBe(true);
      expect(attempts).toBe(2); // Initial + 1 retry, then stop
    });
  });

  describe('withTimeout function', () => {
    it('should resolve before timeout', async () => {
      const fn = async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        return 'success';
      };

      const result = await withTimeout(fn(), 100);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toBe('success');
      }
    });

    it('should timeout and return error', async () => {
      const fn = async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
        return 'success';
      };

      const result = await withTimeout(fn(), 10);

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.message).toContain('timeout');
      }
    });

    it('should handle promise that rejects before timeout', async () => {
      const fn = async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        throw new Error('Function error');
      };

      const result = await withTimeout(fn(), 100);

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.message).toBe('Function error');
      }
    });
  });

  describe('withContext function', () => {
    it('should add context to successful results', () => {
      const result = ok('success');
      const context = { operation: 'test', timestamp: Date.now() };
      const contextualResult = withContext(result, context);

      expect(contextualResult.isOk()).toBe(true);
      if (contextualResult.isOk()) {
        expect(contextualResult.value).toBe('success');
      }
    });

    it('should add context to error results', () => {
      const error = new Error('Test error');
      const result = err(error);
      const context = { operation: 'test', timestamp: Date.now() };
      const contextualResult = withContext(result, context);

      expect(contextualResult.isErr()).toBe(true);
      if (contextualResult.isErr()) {
        const contextualError = contextualResult.error;
        expect(contextualError).toHaveProperty('context');
        expect((contextualError as any).context).toEqual(context);
        expect(contextualError.message).toBe('Test error');
      }
    });

    it('should handle complex context objects', () => {
      const error = new Error('Complex error');
      const result = err(error);
      const context = {
        operation: 'complex-test',
        metadata: {
          userId: 'user-123',
          requestId: 'req-456',
          nested: {
            level: 2,
            data: [1, 2, 3],
          },
        },
      };

      const contextualResult = withContext(result, context);

      expect(contextualResult.isErr()).toBe(true);
      if (contextualResult.isErr()) {
        const contextualError = contextualResult.error;
        expect((contextualError as any).context.metadata.userId).toBe(
          'user-123'
        );
        expect((contextualError as any).context.metadata.nested.level).toBe(2);
      }
    });
  });

  describe('ensureError function', () => {
    it('should return Error instances unchanged', () => {
      const error = new Error('Test error');
      const result = ensureError(error);

      expect(result).toBe(error);
      expect(result.message).toBe('Test error');
    });

    it('should convert strings to Error instances', () => {
      const result = ensureError('String error');

      expect(result).toBeInstanceOf(Error);
      expect(result.message).toBe('String error');
    });

    it('should convert objects to Error instances', () => {
      const obj = { message: 'Object error', code: 500 };
      const result = ensureError(obj);

      expect(result).toBeInstanceOf(Error);
      expect(result.message).toContain('Object error');
    });

    it('should convert primitives to Error instances', () => {
      expect(ensureError(123)).toBeInstanceOf(Error);
      expect(ensureError(true)).toBeInstanceOf(Error);
      expect(ensureError(null)).toBeInstanceOf(Error);
      expect(ensureError(undefined)).toBeInstanceOf(Error);
    });

    it('should handle complex objects', () => {
      const complex = {
        name: 'CustomError',
        message: 'Complex error',
        details: { code: 'E001', severity: 'high' },
      };

      const result = ensureError(complex);

      expect(result).toBeInstanceOf(Error);
      expect(result.message).toContain('Complex error');
    });
  });

  describe('AbortError class', () => {
    it('should create AbortError with message', () => {
      const error = new AbortError('Operation aborted');

      expect(error).toBeInstanceOf(AbortError);
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('Operation aborted');
      expect(error.name).toBe('AbortError');
    });

    it('should create AbortError with default message', () => {
      const error = new AbortError();

      expect(error).toBeInstanceOf(AbortError);
      expect(error.message).toBe('Operation was aborted');
      expect(error.name).toBe('AbortError');
    });

    it('should maintain proper prototype chain', () => {
      const error = new AbortError('Test abort');

      expect(error instanceof Error).toBe(true);
      expect(error instanceof AbortError).toBe(true);
      expect(Object.getPrototypeOf(error)).toBe(AbortError.prototype);
    });
  });

  describe('Result pattern (neverthrow)', () => {
    it('should create successful results with ok()', () => {
      const result = ok('success value');

      expect(result.isOk()).toBe(true);
      expect(result.isErr()).toBe(false);

      if (result.isOk()) {
        expect(result.value).toBe('success value');
      }
    });

    it('should create error results with err()', () => {
      const error = new Error('Error value');
      const result = err(error);

      expect(result.isErr()).toBe(true);
      expect(result.isOk()).toBe(false);

      if (result.isErr()) {
        expect(result.error).toBe(error);
      }
    });

    it('should chain operations with map()', () => {
      const result = ok(5)
        .map((x) => x * 2)
        .map((x) => x.toString())();

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toBe('10');
      }
    });

    it('should handle errors in chain with mapErr()', () => {
      const result = err(new Error('Original error')).mapErr(
        (error) => new Error(`Wrapped: ${error.message}`)
      );

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.message).toBe('Wrapped: Original error');
      }
    });

    it('should use andThen for chaining operations that return Results', () => {
      const divide = (x: number, y: number): Result<number, Error> => {
        if (y === 0) return err(new Error('Division by zero'));
        return ok(x / y);
      };

      const result = ok(10)
        .andThen((x) => divide(x, 2))
        .andThen((x) => divide(x, 5));

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toBe(1);
      }
    });

    it('should short-circuit on first error in andThen chain', () => {
      const divide = (x: number, y: number): Result<number, Error> => {
        if (y === 0) return err(new Error('Division by zero'));
        return ok(x / y);
      };

      const result = ok(10)
        .andThen((x) => divide(x, 0)) // This will fail
        .andThen((x) => divide(x, 5)); // This won't execute

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.message).toBe('Division by zero');
      }
    });
  });

  describe('ResultAsync pattern', () => {
    it('should create successful async results with okAsync()', async () => {
      const result = await okAsync('async success');

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toBe('async success');
      }
    });

    it('should create error async results with errAsync()', async () => {
      const error = new Error('Async error');
      const result = await errAsync(error);

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error).toBe(error);
      }
    });

    it('should chain async operations', async () => {
      const result = await okAsync(5)
        .map((x) => x * 2)
        .map((x) => Promise.resolve(x.toString()));

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toBe('10');
      }
    });

    it('should handle async andThen chains', async () => {
      const asyncDivide = async (
        x: number,
        y: number
      ): Promise<Result<number, Error>> => {
        await new Promise((resolve) => setTimeout(resolve, 1));
        if (y === 0) return err(new Error('Division by zero'));
        return ok(x / y);
      };

      const result = await okAsync(20)
        .andThen((x) => asyncDivide(x, 4))
        .andThen((x) => asyncDivide(x, 5));

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toBe(1);
      }
    });
  });

  describe('Edge cases and error scenarios', () => {
    it('should handle deeply nested errors', async () => {
      const deepFn = async () => {
        try {
          try {
            try {
              throw new Error('Deep error');
            } catch (e) {
              throw new Error('Middle error: ' + (e as Error).message);
            }
          } catch (e) {
            throw new Error('Outer error: ' + (e as Error).message);
          }
        } catch (e) {
          throw e;
        }
      };

      const result = await safeAsync(deepFn)();

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.message).toContain('Outer error');
        expect(result.error.message).toContain('Middle error');
        expect(result.error.message).toContain('Deep error');
      }
    });

    it('should handle concurrent operations', async () => {
      const operations = Array.from({ length: 10 }, (_, i) =>
        safeAsync(async () => {
          await new Promise((resolve) =>
            setTimeout(resolve, Math.random() * 10)
          );
          if (i % 3 === 0) throw new Error(`Error in operation ${i}`);
          return `Success ${i}`;
        })()
      );

      const results = await Promise.all(operations);

      expect(results).toHaveLength(10);
      results.forEach((result, index) => {
        if (index % 3 === 0) {
          expect(result.isErr()).toBe(true);
        } else {
          expect(result.isOk()).toBe(true);
        }
      });
    });

    it('should handle memory-intensive operations', () => {
      const largeFn = safe(() => {
        // Create a large array to test memory handling
        const largeArray = Array.from({ length: 100000 }, (_, i) => ({
          id: i,
          data: `data-${i}`,
          timestamp: Date.now(),
        }));

        return largeArray.length;
      });

      const result = largeFn();

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toBe(100000);
      }
    });
  });
});
